/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable, Logger } from "@nestjs/common";
import { CourierClient, ICourierClient } from "@trycourier/courier";
import { ICourierSendParameters } from "@trycourier/courier/lib/types";

type CourierProfile = Partial<{
  email: string;
  phoneNumber: string;
  expoToken: string;
  firebaseToken: string;
}>;

type TempCourierProfile = Partial<{
  email: string;
  phone_number: string;
  expoToken?: { expo: { token: string } };
  firebaseToken?: string;
}>;

@Injectable()
export class CourierClientClass {
  private readonly logger = new Logger(CourierClientClass.name);
  public client: ICourierClient;

  constructor() {
    try {
      this.client = CourierClient({
        authorizationToken: process.env.COURIER_AUTH_TOKEN,
      });
    } catch {
      this.logger.error("Error in creating courier client");
    }
  }

  private loadProfile(
    profile: CourierProfile
  ): ICourierSendParameters["profile"] {
    const { expoToken, phoneNumber, email, firebaseToken } = profile;
    const courierProfile: TempCourierProfile = {
      email,
      phone_number: phoneNumber,
    };

    /** firebaseToken is a native key of a courier profile
     * https://www.courier.com/docs/guides/providers/push/firebase-fcm/?auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNvbm55QGpvaW5ibG9vbS5jbyIsIm5hbWUiOiJzb25ueSIsInZlcnNpb24iOjEsImFwaUtleSI6InBrX3Byb2RfRzBRUkVUWldNTU1UQVZKQ1k5MTRDQTEwSEVGTSIsImlhdCI6MTY0MjE4ODc2M30.bPTFNe2gvwt0C93gakLxNyL1nxGHNsHnLK4WVHMThUQ */
    if (firebaseToken) {
      courierProfile.firebaseToken = firebaseToken;
    }

    /** this is just how courier's api works
     *
     *
     */
    if (expoToken) {
      courierProfile.expoToken = { expo: { token: expoToken } };
    }

    return courierProfile;
  }

  async sendNotifications(
    eventId: ICourierSendParameters["eventId"],
    recipientId: string,
    _profile: CourierProfile,
    rest?: Partial<ICourierSendParameters>
  ) {
    try {
      const profile = this.loadProfile(_profile);
      await this.client.send({
        eventId,
        recipientId,
        profile,
        data: {},
        ...rest,
      });
    } catch (e) {
      this.logger.error(
        "Error in sending notification",
        eventId,
        recipientId,
        _profile,
        e
      );
    }
  }
}
