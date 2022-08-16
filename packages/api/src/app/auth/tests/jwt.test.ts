/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app/app.module";
import { AppService } from "src/app/app.service";
import { AuthService } from "../auth.service";
import { TransactionalTestContext } from "typeorm-transactional-tests";
import { Connection, getConnection } from "typeorm";
import { JwtPayload, verify } from "jsonwebtoken";
import { UserEntity } from "@bloom-smg/postgresql";

describe("JWT Auth Flow", () => {
  let authService: AuthService;
  let app: TestingModule;
  let connection: Connection;
  let transactionalContext: TransactionalTestContext;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
      providers: [AppService],
    }).compile();
  });

  beforeEach(async () => {
    authService = app.get<AuthService>(AuthService);
    connection = getConnection();
    transactionalContext = new TransactionalTestContext(connection);
    await transactionalContext.start();
  });

  afterEach(async () => {
    await transactionalContext.finish();
  });

  afterAll(async () => {
    try {
      await app.close();
    } catch (e) {
      // pass
    }
  });

  it("Username/password login", async () => {
    const [email, password] = ["username@example.com", "password"];
    const user = await connection
      .getRepository<UserEntity>(UserEntity)
      // @ts-ignore
      .insert({
        name: "",
        firstName: "",
        lastName: "",
        email: email,
        password: await authService.hashPassword(password),
      });
    const resp = await authService.login({ email: email, password: password });
    const token = resp.access;
    const decoded = verify(token, process.env.JWT_PUBLIC_KEY, {
      complete: true,
    });
    expect((decoded.payload as JwtPayload).userId).toBe(user.identifiers[0].id);
  });

  it("Slide the token", async () => {
    const token = await authService.generateAccessToken({ userId: "1" });
    setTimeout(async () => {
      const newToken = await authService.slideAccessToken(token);
      expect(token).not.toEqual(newToken);
      // Decode both and compare their expiration dates
      const decodeOld: JwtPayload = await verify(
        token,
        process.env.JWT_PUBLIC_KEY,
        {
          complete: true,
        }
      );
      const decodeNew: JwtPayload = verify(
        newToken,
        process.env.JWT_PUBLIC_KEY,
        {
          complete: true,
        }
      );
      expect(decodeOld.payload.iat).toBeLessThan(decodeNew.payload.iat);
      expect(decodeOld.payload.exp).toBeLessThan(decodeNew.payload.exp);
    }, 1000);
  });
});
