/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Body, Controller, Patch, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { NoAuth } from "../../utils/auth";
import { AuthService } from "./auth.service";
import { CreateUserDto, CreateUserRetDto } from "./dto/create-user.dto";
import { EmailCheckerDto } from "./dto/email-checker.dto";
import {
  CreateForgotPasswordResetTokenDto,
  ValidateForgotPasswordResetTokenDto,
} from "./dto/forgot-password.dto";
import { JwtRetDto } from "./dto/jwt-pair.dto";
import { LoginDto } from "./dto/login.dto";
import { VerifyOAuthDto } from "./dto/verify-oauth.dto";

@ApiTags("Auth")
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @NoAuth() // no-auth here so we don't double verify
  @ApiOperation({ summary: "A token that has a sliding expiration time" })
  @Post("token/refresh")
  refresh(@Body() token: string): Promise<any> {
    return this.authService.slideAccessToken(token);
  }

  @NoAuth()
  @Post("login")
  login(@Body() data: LoginDto): Promise<any> {
    return this.authService.login(data);
  }

  @ApiOperation({ summary: "Returns whether email exists or not" })
  @NoAuth()
  @Post("email-checker")
  emailChecker(@Body() data: EmailCheckerDto): Promise<boolean> {
    return this.authService.emailChecker(data.email);
  }

  @NoAuth()
  @Post("signup")
  signup(@Body() data: CreateUserDto): Promise<CreateUserRetDto> {
    return this.authService.createUser(data);
  }

  @NoAuth()
  @Post("forgot-password")
  createPasswordResetToken(
    @Body() data: CreateForgotPasswordResetTokenDto
  ): Promise<void> {
    return this.authService.createPasswordResetToken(data.email);
  }

  @NoAuth()
  @Patch("reset-forgot-password")
  validatePasswordResetToken(
    @Body() data: ValidateForgotPasswordResetTokenDto
  ): Promise<void> {
    return this.authService.resetForgotPassword(data.token, data.newPassword);
  }

  @NoAuth()
  @ApiOperation({
    summary:
      "Verifies a provider's tokens. Sends back our website's JWT for authentication use",
  })
  @Post("verify-token")
  verifyToken(
    @Req() req: Request,
    @Body() data: VerifyOAuthDto
  ): Promise<JwtRetDto> {
    return this.authService.verifyToken(req, data);
  }
}
