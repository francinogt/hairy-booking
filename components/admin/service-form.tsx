"use client";

import { useActionState } from "react";
import { createServiceAction, type StaffState } from "@/app/actions/staff";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 " +
  "outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <span className="text-xs text-red-600">{messages[0]}</span>;
}

export function ServiceForm() {
  const [state, action, pending] = useActionState<StaffState, FormData>(
    createServiceAction,
    undefined,
  );
  const fe = state?.fieldErrors;

  return (
    <form action={action} className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="font-heading text-lg font-semibold text-zinc-900">Neue Dienstleistung</h2>

      {state?.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Dienstleistung hinzugefügt.</p>
      ) : null}

      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
        Name
        <input name="name" required className={inputClass} />
        <FieldError messages={fe?.name} />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Dauer (Minuten)
          <input type="number" name="durationMin" min={5} step={5} defaultValue={60} required className={inputClass} />
          <FieldError messages={fe?.durationMin} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Preis (CHF)
          <input type="number" name="priceAmount" min={0} step="0.05" defaultValue={0} required className={inputClass} />
          <FieldError messages={fe?.priceAmount} />
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
        Beschreibung <span className="font-normal text-zinc-400">(optional)</span>
        <textarea name="description" rows={2} className={inputClass} />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-zinc-900 px-4 py-2.5 text-base font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Hinzufügen …" : "Hinzufügen"}
      </button>
    </form>
  );
}
