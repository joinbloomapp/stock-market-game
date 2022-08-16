/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

export {};

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface AuthInfo {}
    type UserId = { id: string };

    interface Request {
      authInfo?: AuthInfo | undefined;
      user?: UserId | undefined;

      // These declarations are merged into express's Request type
      login(user: UserId, done: (err: any) => void): void;
      login(user: UserId, options: any, done: (err: any) => void): void;
      logIn(user: UserId, done: (err: any) => void): void;
      logIn(user: UserId, options: any, done: (err: any) => void): void;

      logout(
        options: { keepSessionInfo?: boolean },
        done: (err: any) => void
      ): void;
      logout(done: (err: any) => void): void;
      logOut(
        options: { keepSessionInfo?: boolean },
        done: (err: any) => void
      ): void;
      logOut(done: (err: any) => void): void;

      isAuthenticated(): this is AuthenticatedRequest;
      isUnauthenticated(): this is UnauthenticatedRequest;
    }

    interface AuthenticatedRequest extends Request {
      user: UserId;
    }

    interface UnauthenticatedRequest extends Request {
      user?: undefined;
    }
  }
}
