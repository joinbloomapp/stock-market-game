/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ExceptionFilter, Catch, ArgumentsHost, Logger } from "@nestjs/common";
import { Response } from "express";
import BloomException from "./BloomException";

@Catch(BloomException)
export class BloomExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(BloomExceptionFilter.name);

  catch(exception: BloomException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const res: any = exception.getResponse();
    this.logger.error(
      res.message + " (ID: " + res.uniqueId + ") (type: " + res.type + ")"
    );

    response.status(status).json(res);
  }
}
