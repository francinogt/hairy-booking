"use client";

import { useState } from "react";
import { useSlots } from "@/components/booking/use-slots";

export type SelectedSlot = { date: string; time: string };

export function SlotPicker({
  staffId,
  durationMin,
  fromDate,
  toDate,
  timezone,
  selected,
  onSelect,
}: {
  staffId: number | null;
  durationMin: number;
  fromDate: string;
  toDate: string;
  timezone: string;
  selected: SelectedSlot | null;
  onSelect: (slot: SelectedSlot) => void;
}) {
  const { slots, loading, error } = useSlots(staffId, durationMin, fromDate, toDate);
  const [openDate, setOpenDate] = useState<string | null>(null);

  if (durationMin <= 0) {
    return (
      <p className="text-sm text-zinc-500">
        Platziere zuerst dein Motiv – danach erscheinen freie Termine.
      </p>
    );
  }
  if (loading) return <p className="text-sm text-zinc-500">Freie Termine werden geladen …</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  const dates = slots ? Object.keys(slots) : [];
  if (dates.length === 0) {
    return (
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Für die geschätzte Dauer (~{(durationMin / 60).toFixed(1)} Std) sind aktuell keine freien
        Termine verfügbar. Bitte kontaktiere den Artist direkt.
      </p>
    );
  }

  const effectiveOpen = openDate ?? dates[0];
  const fmtDate = (d: string) =>
    new Intl.DateTimeFormat("de-CH", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      timeZone: timezone,
    }).format(new Date(`${d}T12:00:00`));

  return (
    <div className="flex flex-col gap-2">
      {dates.map((d) => {
        const open = effectiveOpen === d;
        return (
          <div key={d} className="overflow-hidden rounded-lg border border-zinc-200">
            <button
              type="button"
              onClick={() => setOpenDate(open ? "" : d)}
              className="flex w-full items-center justify-between bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-800"
            >
              <span className="capitalize">{fmtDate(d)}</span>
              <span className="text-xs text-zinc-500">{slots![d].length} Zeiten</span>
            </button>
            {open ? (
              <div className="flex flex-wrap gap-2 px-4 py-3">
                {slots![d].map((t) => {
                  const isSel = selected?.date === d && selected?.time === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => onSelect({ date: d, time: t })}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        isSel
                          ? "bg-accent text-white"
                          : "border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
