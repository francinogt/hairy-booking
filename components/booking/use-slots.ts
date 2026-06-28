"use client";

// Daten-Fetch beim Mounten/Aenderung -> synchrones Reset im Effekt ist hier gewollt.
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { getAvailableSlots } from "@/app/actions/booking";

export function useSlots(
  staffId: number | null,
  durationMin: number,
  fromDate: string,
  toDate: string,
) {
  const [slots, setSlots] = useState<Record<string, string[]> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setSlots(null);
    setError(null);
    if (!staffId || durationMin <= 0) {
      setSlots({});
      return;
    }
    getAvailableSlots({ staffId, durationMin, fromDate, toDate })
      .then((res) => {
        if (!active) return;
        if (res.ok) setSlots(res.slots);
        else {
          setError(res.error);
          setSlots({});
        }
      })
      .catch(() => {
        if (active) {
          setError("Termine konnten nicht geladen werden.");
          setSlots({});
        }
      });
    return () => {
      active = false;
    };
  }, [staffId, durationMin, fromDate, toDate]);

  return { slots, loading: slots === null, error };
}
