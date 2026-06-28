"use client";

import { useActionState } from "react";
import { saveStaffRates, type RatesState } from "@/app/actions/rates";

type RateRow = { skillId: number; name: string; hourlyRate: string };

export function StaffRatesForm({ rows }: { rows: RateRow[] }) {
  const [state, action, pending] = useActionState<RatesState, FormData>(saveStaffRates, undefined);

  if (rows.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Wähle zuerst oben deine Stile aus – danach kannst du je Stil einen Stundensatz hinterlegen.
      </p>
    );
  }

  return (
    <form action={action} className="flex max-w-md flex-col gap-3">
      {state?.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Stundensätze gespeichert.</p>
      ) : null}

      {rows.map((r) => (
        <label key={r.skillId} className="flex items-center justify-between gap-3 text-sm font-medium text-zinc-700">
          <span>{r.name}</span>
          <span className="flex items-center gap-2">
            <input
              type="number"
              name={`rate_${r.skillId}`}
              min={0}
              step="5"
              defaultValue={r.hourlyRate}
              placeholder="0"
              className="w-28 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
            />
            <span className="text-xs text-zinc-500">CHF/Std</span>
          </span>
        </label>
      ))}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Speichern …" : "Stundensätze speichern"}
      </button>
    </form>
  );
}
