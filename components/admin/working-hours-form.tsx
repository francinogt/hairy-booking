"use client";

import { useActionState } from "react";
import { saveWorkingHours, type StaffState } from "@/app/actions/staff";

const DAYS: [string, string][] = [
  ["mon", "Montag"],
  ["tue", "Dienstag"],
  ["wed", "Mittwoch"],
  ["thu", "Donnerstag"],
  ["fri", "Freitag"],
  ["sat", "Samstag"],
  ["sun", "Sonntag"],
];

type DayInit = { start: string; end: string } | undefined;

const timeInput =
  "rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 " +
  "outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";

export function WorkingHoursForm({ initial }: { initial: Record<string, DayInit> }) {
  const [state, action, pending] = useActionState<StaffState, FormData>(
    saveWorkingHours,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5">
      {state?.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Arbeitszeiten gespeichert.</p>
      ) : null}

      <div className="flex flex-col gap-2.5">
        {DAYS.map(([key, label]) => {
          const init = initial[key];
          return (
            <div key={key} className="flex flex-wrap items-center gap-3">
              <label className="flex w-32 items-center gap-2 text-sm font-medium text-zinc-700">
                <input
                  type="checkbox"
                  name={`${key}_enabled`}
                  defaultChecked={!!init}
                  className="h-4 w-4 rounded border-zinc-300"
                />
                {label}
              </label>
              <input type="time" name={`${key}_start`} defaultValue={init?.start ?? "09:00"} className={timeInput} />
              <span className="text-zinc-400">–</span>
              <input type="time" name={`${key}_end`} defaultValue={init?.end ?? "18:00"} className={timeInput} />
            </div>
          );
        })}
      </div>

      <p className="text-xs text-zinc-400">
        Nur angehakte Tage gelten. Ende muss nach Start liegen.
      </p>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-zinc-900 px-4 py-2.5 text-base font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Speichern …" : "Arbeitszeiten speichern"}
      </button>
    </form>
  );
}
