"use client";

import { useActionState } from "react";
import { saveMyProfile, type StaffState } from "@/app/actions/staff";

export type ProfileInitial = {
  displayName: string;
  specialty: string;
  bio: string;
  isBookable: boolean;
  slug: string | null;
} | null;

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 " +
  "outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";

export function ProfileForm({ initial }: { initial: ProfileInitial }) {
  const [state, action, pending] = useActionState<StaffState, FormData>(saveMyProfile, undefined);

  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      {state?.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Profil gespeichert.</p>
      ) : null}

      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
        Anzeigename
        <input name="displayName" defaultValue={initial?.displayName ?? ""} required className={inputClass} />
        {state?.fieldErrors?.displayName?.length ? (
          <span className="text-xs text-red-600">{state.fieldErrors.displayName[0]}</span>
        ) : null}
      </label>

      {initial?.slug ? (
        <p className="text-xs text-zinc-500">
          Buchungs-Link: <code>/book/{initial.slug}</code>
        </p>
      ) : null}

      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
        Spezialität <span className="font-normal text-zinc-400">(optional)</span>
        <input name="specialty" defaultValue={initial?.specialty ?? ""} className={inputClass} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
        Über mich <span className="font-normal text-zinc-400">(optional)</span>
        <textarea name="bio" defaultValue={initial?.bio ?? ""} rows={4} className={inputClass} />
      </label>

      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
        <input
          type="checkbox"
          name="isBookable"
          defaultChecked={initial ? initial.isBookable : true}
          className="h-4 w-4 rounded border-zinc-300"
        />
        Online buchbar
      </label>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-zinc-900 px-4 py-2.5 text-base font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Speichern …" : initial ? "Profil speichern" : "Profil anlegen"}
      </button>
    </form>
  );
}
