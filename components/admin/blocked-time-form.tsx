"use client";

import { useActionState } from "react";
import { addBlockedTimeAction, type StaffState } from "@/app/actions/staff";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 " +
  "outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";

export function BlockedTimeForm() {
  const [state, action, pending] = useActionState<StaffState, FormData>(
    addBlockedTimeAction,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5">
      <h3 className="font-heading text-base font-semibold text-zinc-900">Sperrzeit hinzufügen</h3>

      {state?.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Sperrzeit hinzugefügt.</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Von
          <input type="datetime-local" name="startAt" required className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Bis
          <input type="datetime-local" name="endAt" required className={inputClass} />
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
        Grund <span className="font-normal text-zinc-400">(optional)</span>
        <input name="reason" className={inputClass} />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-zinc-900 px-4 py-2.5 text-base font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Hinzufügen …" : "Sperrzeit hinzufügen"}
      </button>
    </form>
  );
}
