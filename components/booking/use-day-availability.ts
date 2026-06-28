"use client";

// Daten-Fetch beim Mounten/Aenderung -> synchrones Reset im Effekt ist hier gewollt.
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { getMonthAvailability } from "@/app/actions/booking";
import type { DayAvailability } from "@/lib/booking/types";

export function useDayAvailability(
  staffId: number | null,
  durationMin: number,
  fromDate: string,
  toDate: string,
) {
  const [days, setDays] = useState<Record<string, DayAvailability> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setDays(null);
    setError(null);
    if (!staffId || durationMin <= 0) {
      setDays({});
      return;
    }
    getMonthAvailability({ staffId, durationMin, fromDate, toDate })
      .then((res) => {
        if (!active) return;
        if (res.ok) setDays(res.days);
        else {
          setError(res.error);
          setDays({});
        }
      })
      .catch(() => {
        if (active) {
          setError("Kalender konnte nicht geladen werden.");
          setDays({});
        }
      });
    return () => {
      active = false;
    };
  }, [staffId, durationMin, fromDate, toDate]);

  return { days, loading: days === null, error };
}
