/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import moment, { Moment } from "moment";
import "moment-timezone";
import "moment/min/moment-with-locales";
import Holidays from "../models/Holidays";

function formatTimeSection(value: number, label: string) {
  if (value === 1) {
    label = label.replace(/s$/, "");
  }
  return `${value} ${label}, `;
}

namespace TimeServices {
  export function unixToDate(unix: number, format = "MMMM D, YYYY ") {
    return moment(unix).format(format);
  }

  export function timePassed(time1: number, time2: number) {
    // eslint-disable-next-line no-useless-catch
    try {
      moment.locale("en", {
        relativeTime: {
          future: "in %s",
          past: "%s",
          s: "now",
          ss: "now",
          m: "1m",
          mm: "%dm",
          h: "1h",
          hh: "%dh",
          d: "1d",
          dd: "%dd",
          w: "1w",
          ww: "%dw",
          M: "1mo",
          MM: "%dmo",
          y: "1y",
          yy: "%dy",
        },
      });
    } catch (e) {
      throw e;
    }
    return moment(time2).from(time1, true);
  }

  export function timePassedFromNow(time: number) {
    return timePassed(moment().valueOf(), time);
  }

  export const getTimeLeft = (start) => {
    const now = new Date().getTime();
    const diff = start - now;

    if (diff < 0) return null;

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${
      (d > 0 ? `${d}d ` : "") + (hours > 0 ? `${hours}h ` : "") + minutes
    }m ${seconds}s`;
  };

  export const addBusinessDays = (date: Moment, days: number) => {
    const day = date.clone();
    if (!day.isValid()) {
      return day;
    }

    if (days < 0) {
      days = Math.round(-1 * days) * -1;
    } else {
      days = Math.round(days);
    }

    const signal = days < 0 ? -1 : 1;

    let remaining = Math.abs(days);
    while (remaining > 0) {
      day.add(signal, "days");

      if (isBusinessDay(day)) {
        remaining -= 1;
      }
    }

    return day;
  };

  export const getTimeLeftString = (timeLeft: number) => {
    const minutes = parseInt(String(timeLeft / 60000));
    const seconds = parseInt(String(timeLeft / 1000)) % 60;

    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  export function isBusinessDay(date: Moment) {
    const locale = moment.localeData();
    const defaultWorkingWeekdays = [1, 2, 3, 4, 5];
    // @ts-ignore
    const workingWeekdays = locale._workingWeekdays || defaultWorkingWeekdays;

    if (
      // @ts-ignore
      locale._forcedBusinessDays &&
      // @ts-ignore
      locale._forcedBusinessDays.indexOf(
        // @ts-ignore
        date.format(locale._forcedBusinessDaysFormat)
      ) >= 0
    ) {
      return true;
    }

    if (Holidays.isHoliday(date.format("YYYY-MM-DD"))) return false;

    return workingWeekdays.indexOf(date.day()) >= 0;
  }

  export function getFormattedDurationString({
    durationMillis,
    daysLabel = "days",
    hoursLabel = "hours",
    minutesLabel = "min",
  }: {
    durationMillis: number;
    daysLabel?: string;
    hoursLabel?: string;
    minutesLabel?: string;
  }) {
    if (durationMillis <= 0) {
      return "00:00:00";
    }
    if (!durationMillis) {
      return "--:--:--";
    }
    let remainingTime = durationMillis;
    const days = Math.floor(remainingTime / (24 * 60 * 60 * 1000));
    remainingTime -= days * 24 * 60 * 60 * 1000;
    const hours = Math.floor(remainingTime / (60 * 60 * 1000));
    remainingTime -= hours * 60 * 60 * 1000;
    const minutes = Math.floor(remainingTime / (60 * 1000));
    remainingTime -= minutes * 60 * 1000;
    const seconds = Math.floor(remainingTime / 1000);
    remainingTime -= seconds * 1000;
    let formattedDurationString = "";
    if (durationMillis >= 24 * 60 * 60 * 1000) {
      formattedDurationString =
        formatTimeSection(days, daysLabel) +
        formatTimeSection(hours, hoursLabel) +
        formatTimeSection(minutes, minutesLabel);
      formattedDurationString = formattedDurationString.replace(/,\s+$/, "");
    } else {
      formattedDurationString = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return formattedDurationString;
  }
}

export default TimeServices;
