/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import { Reflector } from "@nestjs/core";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Use the NoAuth decorator from src/utils/auth
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.header("Authorization");

    const err = new UnauthorizedException("Please provide a valid token");
    const components = authHeader?.split(" ") ?? ["", ""];

    try {
      if (components?.length !== 2) throw err;
      const token = components[1];
      if (!token) throw err;
      request.user = {
        id: (verify(token, process.env.JWT_PUBLIC_KEY) as JwtPayload).userId,
      };
      return true;
    } catch (error) {
      const noAuth = this.reflector.get<boolean>(
        "no-auth",
        context.getHandler()
      );
      if (process.env.FORCE_SKIP_AUTH) {
        // helpful for when you just want to develop on the backend
        request.user = { id: process.env.FORCE_SKIP_AUTH };
        return true;
      }
      if (noAuth) {
        request.user = { id: undefined };
        return true;
      }
      throw err;
    }
  }
}
