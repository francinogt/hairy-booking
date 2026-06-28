"use client";

import { useActionState } from "react";
import { acceptInvite, type AuthState } from "@/app/actions/auth";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 " +
  "outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";

export function AcceptInviteForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(acceptInvite, undefined);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="token" value={token} />

      {state?.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
        Passwort festlegen
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={10}
          className={inputClass}
        />
        {state?.fieldErrors?.password?.length ? (
          <span className="text-xs text-red-600">{state.fieldErrors.password[0]}</span>
        ) : (
          <span className="text-xs text-zinc-400">Mindestens 10 Zeichen.</span>
        )}
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-base font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Konto wird aktiviert …" : "Konto aktivieren"}
      </button>
    </form>
  );
}
