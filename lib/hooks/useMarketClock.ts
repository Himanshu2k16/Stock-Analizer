"use client";

import { useEffect, useState } from "react";

export interface MarketClockState {
  clock: string;
  open: boolean;
}

export function useMarketClock(): MarketClockState {
  const [state, setState] = useState<MarketClockState>({ clock: "—:—:—", open: false });

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });

    const tick = () => {
      const parts = Object.fromEntries(formatter.formatToParts(new Date()).map((part) => [part.type, part.value]));
      const minutes = Number(parts.hour) * 60 + Number(parts.minute);
      const weekday = parts.weekday === "Sat" || parts.weekday === "Sun";
      setState({
        clock: `${parts.hour}:${parts.minute}:${parts.second}`,
        open: !weekday && minutes >= 555 && minutes <= 930,
      });
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  return state;
}
