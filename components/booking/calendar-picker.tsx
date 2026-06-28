"use client";

import { useState } from "react";
import { useDayAvailability } from "@/components/booking/use-day-availability";

export type SelectedSlot = { date: string; time: string };

const pad = (n: number) => String(n).padStart(2, "0");
const ds = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function CalendarPicker({
  staffId,
  durationMin,
  timezone,
  bookingHorizonDays,
  selected,
  onSelect,
}: {
  staffId: number | null;
  durationMin: number;
  timezone: string;
  bookingHorizonDays: number;
  selected: SelectedSlot | null;
  onSelect: (slot: SelectedSlot) => void;
}) {
  const [base] = useState(() => {
    const fmt = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(d);
    const [ty, tm] = fmt(new Date()).split("-").map(Number);
    const [my, mm] = fmt(new Date(Date.now() + bookingHorizonDays * 86_400_000)).split("-").map(Number);
    return { curIdx: ty * 12 + (tm - 1), maxIdx: my * 12 + (mm - 1) };
  });
  const [viewIdx, setViewIdx] = useState(base.curIdx);
  const [selectedDate, setSelectedDate] = useState<string | null>(selected?.date ?? null);

  const y = Math.floor(viewIdx / 12);
  const m = viewIdx % 12;
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const { days, loading, error } = useDayAvailability(staffId, durationMin, ds(y, m, 1), ds(y, m, daysInMonth));

  if (durationMin <= 0) {
    return <p className="text-sm text-zinc-500">Platziere zuerst dein Motiv – danach erscheint der Kalender.</p>;
  }

  const monthLabel = new Intl.DateTimeFormat("de-CH", { month: "long", year: "numeric", timeZone: timezone }).format(
    new Date(`${ds(y, m, 1)}T12:00:00`),
  );
  const firstWeekday = (new Date(y, m, 1).getDay() + 6) % 7;
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const cellBase = "flex h-10 items-center justify-center rounded-md text-sm";
  const selectedDayFree = selectedDate && days?.[selectedDate]?.status === "free";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewIdx((i) => i - 1)}
          disabled={viewIdx <= base.curIdx}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-30"
        >
          ‹
        </button>
        <span className="font-heading font-medium capitalize text-zinc-900">{monthLabel}</span>
        <button
          type="button"
          onClick={() => setViewIdx((i) => i + 1)}
          disabled={viewIdx >= base.maxIdx}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-30"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-zinc-400">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      {loading ? (
        <p className="py-6 text-center text-sm text-zinc-400">Kalender wird geladen …</p>
      ) : error ? (
        <p className="py-6 text-center text-sm text-red-600">{error}</p>
      ) : (
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (d === null) return <div key={`b${i}`} />;
            const dateStr = ds(y, m, d);
            const status = days?.[dateStr]?.status ?? "closed";
            const isSel = selectedDate === dateStr;
            if (status === "free") {
              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelectedDate(dateStr)}
                  className={`${cellBase} ${isSel ? "bg-accent text-white" : "bg-green-50 text-green-800 hover:bg-green-100"}`}
                >
                  {d}
                </button>
              );
            }
            if (status === "full") {
              return (
                <div key={dateStr} title="Ausgebucht" className={`${cellBase} cursor-not-allowed bg-red-100 text-red-400`}>
                  {d}
                </div>
              );
            }
            return (
              <div key={dateStr} className={`${cellBase} text-zinc-300`}>
                {d}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-green-100" /> frei
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-red-100" /> ausgebucht
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-zinc-100" /> geschlossen
        </span>
      </div>

      {selectedDayFree ? (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-zinc-800">Freie Zeiten:</p>
          <div className="flex flex-wrap gap-2">
            {(days?.[selectedDate!]?.slots ?? []).map((t) => {
              const isSel = selected?.date === selectedDate && selected?.time === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onSelect({ date: selectedDate!, time: t })}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isSel ? "bg-accent text-white" : "border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
