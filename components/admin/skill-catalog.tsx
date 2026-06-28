"use client";

import { useActionState } from "react";
import { createSkillAction, toggleSkillAction, type SkillState } from "@/app/actions/skills";

type SkillRow = { id: number; name: string; description: string | null; isActive: boolean };

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 " +
  "outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";

export function SkillCatalog({ skills }: { skills: SkillRow[] }) {
  const [state, action, pending] = useActionState<SkillState, FormData>(createSkillAction, undefined);

  return (
    <div className="flex flex-col gap-6">
      {skills.length === 0 ? (
        <p className="text-sm text-zinc-500">Noch keine Stile angelegt.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {skills.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white p-3"
            >
              <div>
                <p className={`font-medium ${s.isActive ? "text-zinc-900" : "text-zinc-400 line-through"}`}>
                  {s.name}
                </p>
                {s.description ? <p className="text-sm text-zinc-500">{s.description}</p> : null}
              </div>
              <form action={toggleSkillAction}>
                <input type="hidden" name="skillId" value={s.id} />
                <input type="hidden" name="active" value={s.isActive ? "false" : "true"} />
                <button
                  type="submit"
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  {s.isActive ? "Deaktivieren" : "Aktivieren"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form action={action} className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="font-heading text-base font-semibold text-zinc-900">Neuer Stil</h2>
        {state?.error ? (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}
        {state?.success ? (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Stil hinzugefügt.</p>
        ) : null}
        <input name="name" placeholder="z.B. Porträt" required className={inputClass} />
        <input name="description" placeholder="Kurzbeschreibung (optional)" className={inputClass} />
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
        >
          {pending ? "Hinzufügen …" : "Hinzufügen"}
        </button>
      </form>
    </div>
  );
}
