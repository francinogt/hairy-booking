"use client";

import { useActionState } from "react";
import { changePassword, type AuthState } from "@/app/actions/auth";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 " +
  "outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <span className="text-xs text-red-600">{messages[0]}</span>;
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(changePassword, undefined);
  const fe = state?.fieldErrors;

  return (
    <form action={action} className="flex max-w-md flex-col gap-4" noValidate>
      {state?.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Passwort geändert. Andere Geräte wurden abgemeldet.
        </p>
      ) : null}

      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
        Aktuelles Passwort
        <input type="password" name="currentPassword" autoComplete="current-password" required className={inputClass} />
        <FieldError messages={fe?.currentPassword} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
        Neues Passwort
        <input type="password" name="newPassword" autoComplete="new-password" required minLength={10} className={inputClass} />
        <FieldError messages={fe?.newPassword} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
        Neues Passwort bestätigen
        <input type="password" name="confirmPassword" autoComplete="new-password" required className={inputClass} />
        <FieldError messages={fe?.confirmPassword} />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-zinc-900 px-4 py-2.5 text-base font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Speichern …" : "Passwort ändern"}
      </button>
    </form>
  );
}
