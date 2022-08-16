/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ConsoleLogger } from "@nestjs/common";
// import { Logtail } from "@logtail/node";

export default class Logger extends ConsoleLogger {
  // private logtail: any;

  constructor() {
    super();
    // this.logtail = new Logtail("fi3qqNBpPVjXuTUM2FZ8rShj");
  }

  warn(message: any, stack?: string, context?: string) {
    // const fullMessage = `[${stack}] ${message}`;
    // try {
    //   this.logtail.warn(fullMessage, {
    //     service: stack,
    //     context: context,
    //   });
    //   // eslint-disable-next-line no-empty
    // } catch {}
    if (context) {
      super.warn(message, stack, context);
    } else {
      super.warn(message, stack);
    }
  }

  log(message: any, stack?: string, context?: string) {
    // const fullMessage = `[${stack}] ${message}`;
    // try {
    //   this.logtail.info(fullMessage, {
    //     service: stack,
    //     context: context,
    //   });
    //   // eslint-disable-next-line no-empty
    // } catch {}
    if (context) {
      super.log(message, stack, context);
    } else {
      super.log(message, stack);
    }
  }

  error(message: any, stack?: string, context?: string) {
    // const fullMessage = `[${stack}] ${message}`;
    // try {
    //   this.logtail.error(fullMessage, {
    //     service: stack,
    //     context: context,
    //   });
    //   // eslint-disable-next-line no-empty
    // } catch {}
    if (context) {
      super.error(message, stack, context);
    } else {
      super.error(message, stack);
    }
  }
}
