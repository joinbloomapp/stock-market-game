/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import {
  GameEntity,
  PlayerEntity,
  SocialAccountEntity,
  SocialAppEntity,
  SocialTokenEntity,
  UserEntity,
  UserExtraData,
} from "@bloom-smg/postgresql";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotAcceptableException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as argon2 from "argon2";
import * as crypto from "crypto";
import { Request } from "express";
import { OAuth2Client as GoogleOAuth2Client } from "google-auth-library";
import * as moment from "moment";
import { Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { CourierService } from "../../clients/courier/courier.service";
import { CreateUserDto, CreateUserRetDto } from "./dto/create-user.dto";
import { JwtRetDto } from "./dto/jwt-pair.dto";
import { LoginDto } from "./dto/login.dto";
import { VerifyOAuthDto } from "./dto/verify-oauth.dto";

type PayloadT = { userId: string };
interface ProviderVerifyRetT {
  [key: string]: any;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  provider: string;
  uid: string; // provider uid
  extraData: object;
  name?: string;
  // automatic parsing is also available if name is provided
  firstName?: string;
  lastName?: string;
  email?: string;
}

type VerifyRetT = Promise<null | undefined | ProviderVerifyRetT>;
type VerifyFnT = (data: VerifyOAuthDto) => VerifyRetT;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(SocialAppEntity)
    private readonly socialAppRepository: Repository<SocialAppEntity>,
    @InjectRepository(SocialAccountEntity)
    private readonly socialAccountRepository: Repository<SocialAccountEntity>,
    @InjectRepository(SocialTokenEntity)
    private readonly socialTokenRepository: Repository<SocialTokenEntity>,
    @InjectRepository(PlayerEntity)
    private readonly playerRepository: Repository<PlayerEntity>,
    @InjectRepository(GameEntity)
    private readonly gameRepository: Repository<GameEntity>,
    private readonly courierService: CourierService
  ) {}

  async login(data: LoginDto): Promise<JwtRetDto> {
    if (data.password.length > 150) {
      throw new BadRequestException("Password too long");
    }
    const user = await this.userRepository.findOne(
      // @ts-ignore
      { email: data.email },
      { select: ["id", "password"] }
    );
    if (!user) {
      throw new NotAcceptableException("Email does not exist");
    }
    let verified: boolean;
    try {
      verified = await argon2.verify(user.password, data.password);
    } catch (e) {
      throw new BadRequestException("Password may be too long");
    }
    if (!verified) {
      throw new ForbiddenException("Incorrect email and password combination");
    }
    return { access: await this.generateAccessToken({ userId: user.id }) };
  }

  async emailChecker(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne(
      { email },
      { select: ["id"] }
    );
    return !!user;
  }

  async generateAccessToken(payload: PayloadT): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      header: {
        alg: "ES384",
        typ: "JWT",
      },
      algorithm: "ES384",
      privateKey: process.env.JWT_PRIVATE_KEY,
      expiresIn: 60 * 60 * 24 * 7, // 7 days, described in seconds
    });
  }

  async slideAccessToken(token: string): Promise<string> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        algorithms: ["ES384"],
        publicKey: process.env.JWT_PUBLIC_KEY,
        secret: process.env.JWT_PRIVATE_KEY,
      });
      delete payload.iat;
      delete payload.exp;
      delete payload.nbf;
      delete payload.jti;
      return this.generateAccessToken(payload);
    } catch (e) {
      throw new ForbiddenException("Invalid token");
    }
  }

  /**
   * Verifies OAuth2 token
   * @returns a JWT to authenticate with our server
   */
  async verifyToken(req: Request, data: VerifyOAuthDto): Promise<JwtRetDto> {
    const verifyFn: VerifyFnT = this[
      `${data.provider}`
    ] as unknown as VerifyFnT;
    if (!verifyFn) {
      throw new BadRequestException("Unknown provider");
    }

    // This data can include anything the provider gave
    const verifiedData = await verifyFn(data);
    if (verifiedData === null) {
      throw new ForbiddenException("Invalid tokens for provider.");
    }
    const userId = await this.createUserSocialLogin(req, verifiedData);
    return {
      access: await this.generateAccessToken({
        userId: userId,
      }),
    };
  }

  /**
   * Handle creating social account records or fetching the existing user's
   * uid
   * @param req HTTP Request object
   * @param data random data the provider has given; should at least include
   * an email
   * @returns {number} the user id of our project
   */
  private async createUserSocialLogin(
    req: Request,
    data: ProviderVerifyRetT
  ): Promise<string> {
    // First search for the app
    const app = await this.socialAppRepository.findOne(
      // @ts-ignore
      { provider: data.provider },
      { select: ["id"] }
    );
    if (!app) throw new BadRequestException("Social provider not supported");
    const account = await this.socialAccountRepository.findOne(
      {
        appId: app.id,
        uid: data.uid,
      },
      { select: ["userId"] }
    );
    if (account) {
      if (account.userId !== req.user.id) {
        this.logger.error(
          `${data.provider} with provider uid ${account.uid} linked with ${account.userId} but the current user's id is ${req.user}`
        );
        throw new InternalServerErrorException("You are trying to login");
      }
      return account.userId;
    }
    // Account does not exist. We need to create the user record
    // if the current user isn't authenticated.
    let userId;

    if (!req.user) {
      // @ts-ignore
      const extra: UserExtraData = {
        hasPassword: false,
      };
      const user = await this.userRepository.insert({
        email: data.email,
        password: await this.hashPassword(uuidv4()),
        name: data.name ?? "",
        firstName: data.firstName ?? data.name ? data.name.split(" ")[0] : "",
        lastName: data.lastName ?? data.name ? data.name.split(" ")[-1] : "",
        extra,
      });
      userId = user.identifiers[0].id;
      req.user = { id: userId };
    } else {
      userId = req.user.id;
    }
    /* @ts-ignore */
    const newAccount = await this.socialAccountRepository.insert({
      userId: userId,
      appId: app.id,
      uid: data.uid,
      extra: data.extraData as UserExtraData,
    });
    await this.socialTokenRepository.insert({
      appId: app.id,
      accountId: newAccount.identifiers[0].id,
      token: data.accessToken,
      tokenSecret: data.refreshToken,
      expiresAt: data.expiresAt,
    });

    return req.user.id;
  }

  //
  // Providers
  //

  async google(data: VerifyOAuthDto): VerifyRetT {
    const client = new GoogleOAuth2Client(process.env.OAUTH_GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: data.refreshToken,
      audience: process.env.OAUTH_GOOGLE_CLIENT_ID,
    });
    const { name, email, given_name, family_name } = ticket.getPayload();

    return {
      accessToken: data.refreshToken,
      refreshToken: "",
      provider: data.provider,
      uid: ticket.getUserId(),
      expiresAt: new Date(ticket.getPayload().exp),
      extraData: ticket.getPayload(),
      name: name,
      email: email,
      firstName: given_name,
      lastName: family_name,
      extra_data: ticket.getPayload(),
    };
  }

  /**
   * Returns the password hashed with our argon2 configuration
   */
  async hashPassword(password: string, error?: string): Promise<string> {
    try {
      return await argon2.hash(password, {
        parallelism: 8,
        memoryCost: 102400,
        timeCost: 2,
        salt: Buffer.from(process.env.PASSWORD_SALT, "utf8"),
      });
    } catch (e) {
      this.logger.error(e);
      throw new BadRequestException(error || "Password too long. Try again.");
    }
  }

  /**
   * Creates a new user
   * @returns JWT
   */
  async createUser(data: CreateUserDto): Promise<CreateUserRetDto> {
    if (
      await this.userRepository.findOne(
        // @ts-ignore
        { email: data.email },
        { select: ["id"] }
      )
    ) {
      throw new ForbiddenException("User with that email already exists");
    }
    const extra: UserExtraData = {
      hasPassword: true,
    };
    const entity = {
      email: data.email,
      password: await this.hashPassword(data.password),
      name: `${data.firstName} ${data.lastName}`,
      firstName: data.firstName,
      lastName: data.lastName,
      extra,
    };
    const rec = await this.userRepository.insert(entity);
    const userId = rec.identifiers[0].id;
    await this.courierService.signup(userId, data.email, {
      name: data.firstName,
    });
    return {
      userId: userId,
      access: await this.generateAccessToken({
        userId: rec.identifiers[0].id,
      }),
    };
  }

  // Encrypt token with password using crypto.Cipheriv
  _encryptToken(stringToEncrypt: string) {
    const key = crypto
      .createHash("sha256")
      .update(process.env.RESET_PASSWORD_KEY)
      .digest();

    const IV_LENGTH = 16;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    const encrypted = cipher.update(stringToEncrypt);

    const result = Buffer.concat([encrypted, cipher.final()]);

    // formatted string [iv]:[token]
    return iv.toString("hex") + ":" + result.toString("hex");
  }

  _generateResetToken(user: UserEntity) {
    // Date now - will use it for expiration
    const now = new Date();

    // Convert to Base64
    const timeBase64 = Buffer.from(now.toISOString()).toString("base64");

    //Convert to Base64 user ID - will use for retrieve user
    const userIdBase64 = Buffer.from(user.id).toString("base64");

    // User info string - will use it for sign and use token once
    const userString = `${user.id}${user.email}${user.password}`;
    const userStringHash = crypto
      .createHash("md5")
      .update(userString)
      .digest("hex");

    // Generate a formatted string [time]-[userSign]-[userUUID]
    const tokenize = `${timeBase64}-${userStringHash}-${userIdBase64}`;

    // encrypt token
    return this._encryptToken(tokenize);
  }

  // Decrypt token using the inverse of encryption crypto algorithm
  _decryptToken(stringToDecrypt: string): string {
    try {
      const key = crypto
        .createHash("sha256")
        .update(process.env.RESET_PASSWORD_KEY)
        .digest();

      const textParts = stringToDecrypt.split(":");
      const iv = Buffer.from(textParts.shift(), "hex");
      const encryptedText = Buffer.from(textParts.join(":"), "hex");
      const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
      const decrypted = decipher.update(encryptedText);

      const result = Buffer.concat([decrypted, decipher.final()]);

      return result.toString();
    } catch (error) {
      console.log("decrypted token error", error);
      return null;
    }
  }

  // Extract userUUID from decrypted token string
  _getUserIdFromToken(token: string): string {
    try {
      const userIdHash = token.split("-")[2];
      return Buffer.from(userIdHash, "base64").toString("ascii");
    } catch (error) {
      return null;
    }
  }

  // Validate the token
  async _validateResetToken(user: UserEntity, token: string): Promise<boolean> {
    // Split token string and retrieve timeInfo and userInfoHash
    const [timeHBase64, reqUserStringHash] = token.split("-");

    const timestamp = Buffer.from(timeHBase64, "base64").toString("ascii");

    // Using moment.diff method for retrieve dates difference in hours
    const tokenTimestampDate = moment(timestamp);
    const now = moment();

    // Fail if more than 15 minutes
    const diff = now.diff(tokenTimestampDate, "minutes");
    if (Math.abs(diff) > 15) return false;

    const userString = `${user.id}${user.email}${user.password}`;
    const userStringHash = crypto
      .createHash("md5")
      .update(userString)
      .digest("hex");

    // Check if userInfoHash is the same - this guarantee the token used once
    return reqUserStringHash === userStringHash;
  }

  async createPasswordResetToken(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ email });

    if (!user) {
      return;
    }

    const token = this._generateResetToken(user);

    await this.courierService.sendPasswordResetLink(user.id, user.email, {
      name: user.firstName,
      passwordResetLink: `https://game.joinbloom.co/password/reset/${token}`,
    });
  }

  async resetForgotPassword(token: string, newPassword: string): Promise<void> {
    // Decrypt token
    const decryptedToken = this._decryptToken(token);

    if (!decryptedToken) {
      throw new BadRequestException("Invalid token");
    }

    //Extract userId from decrypted token - will use it for validate token also
    const userId = this._getUserIdFromToken(decryptedToken);

    if (!userId) {
      throw new BadRequestException("Invalid token");
    }

    const user = await this.userRepository.findOne(userId);

    if (!user) {
      throw new BadRequestException("Invalid token");
    }

    // Validate Token - expiration and unicity
    const isTokenValid = await this._validateResetToken(user, decryptedToken);

    if (!isTokenValid) {
      throw new BadRequestException("Invalid token");
    }

    // Update user password
    await this.userRepository.update(userId, {
      password: await this.hashPassword(newPassword),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Decrypt token
    const decryptedToken = this._decryptToken(token);

    if (!decryptedToken) {
      throw new BadRequestException("Invalid token");
    }

    //Extract userId from decrypted token - will use it for validate token also
    const userId = this._getUserIdFromToken(decryptedToken);

    if (!userId) {
      throw new BadRequestException("Invalid token");
    }

    const user = await this.userRepository.findOne(userId);

    if (!user) {
      throw new BadRequestException("Invalid token");
    }

    // Validate Token - expiration and unicity
    const isTokenValid = await this._validateResetToken(user, decryptedToken);

    if (!isTokenValid) {
      throw new BadRequestException("Invalid token");
    }

    // Update user password
    await this.userRepository.update(userId, {
      password: await this.hashPassword(newPassword),
    });
  }
}
