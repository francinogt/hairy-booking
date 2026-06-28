"use client";

import { useActionState } from "react";
import { saveMyStaffSkillsAction, type SkillState } from "@/app/actions/skills";

type SkillOption = { id: number; name: string };

export function StaffSkillsForm({
  skills,
  selected,
}: {
  skills: SkillOption[];
  selected: number[];
}) {
  const [state, action, pending] = useActionState<SkillState, FormData>(
    saveMyStaffSkillsAction,
    undefined,
  );
  const sel = new Set(selected);

  if (skills.length === 0) {
    return <p className="text-sm text-zinc-500">Es sind noch keine Stile angelegt.</p>;
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Stile gespeichert.</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <label
            key={s.id}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            <input
              type="checkbox"
              name="skillIds"
              value={s.id}
              defaultChecked={sel.has(s.id)}
              className="h-4 w-4 rounded border-zinc-300"
            />
            {s.name}
          </label>
        ))}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Speichern …" : "Stile speichern"}
      </button>
    </form>
  );
}
