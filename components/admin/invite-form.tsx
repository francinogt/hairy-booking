"use client";

import { useActionState, useState } from "react";
import { inviteUser, type InviteState } from "@/app/actions/users";
import { CopyField } from "@/components/admin/copy-field";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 " +
  "outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <span className="text-xs text-red-600">{messages[0]}</span>;
}

export function InviteForm() {
  const [state, action, pending] = useActionState<InviteState, FormData>(inviteUser, undefined);
  const [role, setRole] = useState("customer");
  const fe = state?.fieldErrors;

  return (
    <form action={action} className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="font-heading text-lg font-semibold text-zinc-900">Benutzer einladen</h2>

      {state?.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      {state?.inviteUrl ? (
        <div className="rounded-lg bg-green-50 px-3 py-3 text-sm text-green-800">
          <p className="font-medium">Einladung für {state.invitedEmail} erstellt.</p>
          <p className="mt-1 mb-2 text-green-700">
            Sende diesen Link der eingeladenen Person (gültig 7 Tage):
          </p>
          <CopyField value={state.inviteUrl} />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Vorname
          <input name="firstName" required className={inputClass} />
          <FieldError messages={fe?.firstName} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Nachname
          <input name="lastName" required className={inputClass} />
          <FieldError messages={fe?.lastName} />
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
        E-Mail
        <input type="email" name="email" required className={inputClass} />
        <FieldError messages={fe?.email} />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Rolle
          <select name="role" value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
            <option value="customer">Kunde</option>
            <option value="admin">Mitarbeiter (Admin)</option>
          </select>
        </label>
        {role === "admin" ? (
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            Anzeigename <span className="font-normal text-zinc-400">(optional)</span>
            <input name="displayName" className={inputClass} />
            <FieldError messages={fe?.displayName} />
          </label>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-zinc-900 px-4 py-2.5 text-base font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Einladung wird erstellt …" : "Einladung erstellen"}
      </button>
    </form>
  );
}
