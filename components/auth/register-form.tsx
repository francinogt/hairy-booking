"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register, type AuthState } from "@/app/actions/auth";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 " +
  "outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <span className="text-xs text-red-600">{messages[0]}</span>;
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(register, undefined);
  const fe = state?.fieldErrors;

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state?.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Vorname
          <input type="text" name="firstName" autoComplete="given-name" required className={inputClass} />
          <FieldError messages={fe?.firstName} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Nachname
          <input type="text" name="lastName" autoComplete="family-name" required className={inputClass} />
          <FieldError messages={fe?.lastName} />
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
        E-Mail
        <input type="email" name="email" autoComplete="email" required className={inputClass} />
        <FieldError messages={fe?.email} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
        Telefon <span className="font-normal text-zinc-400">(optional)</span>
        <input type="tel" name="phone" autoComplete="tel" className={inputClass} />
        <FieldError messages={fe?.phone} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
        Passwort
        <input type="password" name="password" autoComplete="new-password" required className={inputClass} />
        <FieldError messages={fe?.password} />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-base font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Konto wird erstellt …" : "Konto erstellen"}
      </button>

      <p className="text-center text-sm text-zinc-600">
        Bereits registriert?{" "}
        <Link href="/login" className="font-medium text-zinc-900 underline">
          Anmelden
        </Link>
      </p>
    </form>
  );
}
