/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable, Logger } from "@nestjs/common";
import * as Twilio from "twilio";
import { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";
import { VerificationInstance } from "twilio/lib/rest/verify/v2/service/verification";
import { VerificationCheckInstance } from "twilio/lib/rest/verify/v2/service/verificationCheck";

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_VERIFICATION_SID,
  TWILIO_BLOOM_PHONE_NUMBER,
} = process.env;

@Injectable()
export class TwilioClient {
  private client: Twilio.Twilio;
  private readonly logger = new Logger(TwilioClient.name);

  constructor() {
    try {
      this.client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    } catch {
      this.logger.error("Error in creating Twilio client");
    }
  }

  /**
   * Sends verification SMS to user
   *
   * @param phoneNumber must be formatted +1xxxxxxxx
   * @returns message
   */
  async sendVerificationSMS(
    phoneNumber: string
  ): Promise<VerificationInstance> {
    return this.client.verify
      .services(TWILIO_VERIFICATION_SID)
      .verifications.create({ to: phoneNumber, channel: "sms" });
  }

  /**
   * Verifies SMS code
   *
   * @param phoneNumber must be formatted +1xxxxxxxx
   * @param code code that user enters
   * @returns
   */
  async verifyCode(
    phoneNumber: string,
    code: string
  ): Promise<VerificationCheckInstance> {
    return this.client.verify
      .services(TWILIO_VERIFICATION_SID)
      .verificationChecks.create({ to: phoneNumber, code });
  }

  /**
   * Sends custom message from one phone number to another
   *
   * @param fromPhoneNumber must be formatted +1xxxxxxxx
   * @param toPhoneNumber must be formatted +1xxxxxxxx
   * @param message the message string to be sent
   * @returns void
   */
  async sendMessage(
    toPhoneNumber: string,
    message: string,
    fromPhoneNumber = TWILIO_BLOOM_PHONE_NUMBER
  ): Promise<MessageInstance> {
    return this.client.messages.create({
      from: fromPhoneNumber,
      to: toPhoneNumber,
      body: message,
    });
  }
}
