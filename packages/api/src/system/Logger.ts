/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ConsoleLogger } from "@nestjs/common";
import { Logtail } from "@logtail/node";

function slackErrorLogMessage(message: string) {
  // Customize further here: https://app.slack.com/block-kit-builder/T02RR0A0EBB#%7B%22blocks%22:%5B%7B%22type%22:%22header%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Bloomrepo%20Deployment%20Failed%22,%22emoji%22:true%7D%7D,%7B%22type%22:%22section%22,%22fields%22:%5B%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Type:*%5CnStaging%22%7D,%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Created%20by:*%5Cn%3Cexample.com%7CFred%20Enriquez%3E%22%7D%5D%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22mrkdwn%22,%22text%22:%22Click%20to%20see%20CI/CD%20Logs%22%7D,%22accessory%22:%7B%22type%22:%22button%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22CI%20Logs%22,%22emoji%22:true%7D,%22value%22:%22github-runner-view%22,%22url%22:%22https://github.com/joinbloomapp/bloomrepo/runs/6846204290?check_suite_focus=true%22,%22action_id%22:%22button-action%22%7D%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22mrkdwn%22,%22text%22:%22Commit%20SHA%22%7D,%22accessory%22:%7B%22type%22:%22button%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Commit%20link%22,%22emoji%22:true%7D,%22value%22:%22github-commit-link%22,%22url%22:%22https://github.com/joinbloomapp/bloomrepo/commit/68315c2eb6a7d7a62da1107ad7624b0c9760d94f%22,%22action_id%22:%22button-action%22%7D%7D%5D%7D
  const environment = process.env.NODE_ENV;
  return {
    text: `[SMG] ${environment}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: environment,
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: message,
        },
      },
    ],
  };
}

export default class Logger extends ConsoleLogger {
  private logtail: any;

  constructor() {
    super();
    this.logtail = new Logtail("fi3qqNBpPVjXuTUM2FZ8rShj");
  }

  warn(message: any, stack?: string, context?: string) {
    const fullMessage = `[${stack}] ${message}`;
    try {
      this.logtail.warn(fullMessage, {
        service: stack,
        context: context,
      });
      // eslint-disable-next-line no-empty
    } catch {}
    if (context) {
      super.warn(message, stack, context);
    } else {
      super.warn(message, stack);
    }
  }

  log(message: any, stack?: string, context?: string) {
    const fullMessage = `[${stack}] ${message}`;
    try {
      this.logtail.info(fullMessage, {
        service: stack,
        context: context,
      });
      // eslint-disable-next-line no-empty
    } catch {}
    if (context) {
      super.log(message, stack, context);
    } else {
      super.log(message, stack);
    }
  }

  error(message: any, stack?: string, context?: string) {
    const fullMessage = `[${stack}] ${message}`;
    try {
      this.logtail.error(fullMessage, {
        service: stack,
        context: context,
      });
      // eslint-disable-next-line no-empty
    } catch {}
    try {
      if (process.env.SLACK_DEVOPS_WEBHOOK) {
        fetch(process.env.SLACK_DEVOPS_WEBHOOK, {
          method: "POST",
          body: JSON.stringify(slackErrorLogMessage(message)),
        })
          .then()
          .catch((reason) => {
            const err = `Failed to send error log to Slack #DevOps due to\n${reason}`;
            try {
              if (context) {
                super.error(err, stack, context);
              } else {
                super.error(err, stack);
              }
            } catch {
              console.error(
                "Failed to console.error in Logger.ts, error method"
              );
            }
          });
      }
      // eslint-disable-next-line no-empty
    } catch {}
    if (context) {
      super.error(message, stack, context);
    } else {
      super.error(message, stack);
    }
  }
}
