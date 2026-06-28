"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type AuthState } from "@/app/actions/auth";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 " +
  "outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(login, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state?.error ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.error}
        </p>
      ) : null}

      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
        E-Mail
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
        Passwort
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-base font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Anmelden …" : "Anmelden"}
      </button>

      <p className="text-center text-sm text-zinc-600">
        Noch kein Konto?{" "}
        <Link href="/register" className="font-medium text-zinc-900 underline">
          Jetzt registrieren
        </Link>
      </p>
    </form>
  );
}
