"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileState } from "@/app/actions/account";

export type ProfileInitial = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  addressLine: string;
  houseNumber: string;
  postalCode: string;
  city: string;
};

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 " +
  "outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <span className="text-xs text-red-600">{messages[0]}</span>;
}

export function ProfileForm({ initial }: { initial: ProfileInitial }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateProfile, undefined);
  const fe = state?.fieldErrors;

  return (
    <form action={action} className="flex max-w-xl flex-col gap-4" noValidate>
      {state?.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Daten gespeichert.</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Vorname
          <input name="firstName" defaultValue={initial.firstName} required className={inputClass} />
          <FieldError messages={fe?.firstName} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Nachname
          <input name="lastName" defaultValue={initial.lastName} required className={inputClass} />
          <FieldError messages={fe?.lastName} />
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
        E-Mail
        <input type="email" name="email" defaultValue={initial.email} required className={inputClass} />
        <FieldError messages={fe?.email} />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Telefon <span className="font-normal text-zinc-400">(optional)</span>
          <input type="tel" name="phone" defaultValue={initial.phone} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Geschlecht
          <select name="gender" defaultValue={initial.gender} required className={inputClass}>
            <option value="">— bitte wählen —</option>
            <option value="male">Männlich</option>
            <option value="female">Weiblich</option>
            <option value="diverse">Divers</option>
          </select>
          <FieldError messages={fe?.gender} />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_8rem]">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Strasse
          <input name="addressLine" defaultValue={initial.addressLine} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Hausnummer
          <input name="houseNumber" defaultValue={initial.houseNumber} className={inputClass} />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[8rem_1fr]">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          PLZ
          <input name="postalCode" defaultValue={initial.postalCode} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Ort
          <input name="city" defaultValue={initial.city} className={inputClass} />
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-zinc-900 px-4 py-2.5 text-base font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Speichern …" : "Daten speichern"}
      </button>
    </form>
  );
}
