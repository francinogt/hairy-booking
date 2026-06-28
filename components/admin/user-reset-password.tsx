"use client";

import { useActionState } from "react";
import { resetUserPassword, type ResetPasswordState } from "@/app/actions/users";
import { CopyField } from "@/components/admin/copy-field";

export function UserResetPassword({ userId }: { userId: number }) {
  const [state, action, pending] = useActionState<ResetPasswordState, FormData>(
    resetUserPassword,
    undefined,
  );

  return (
    <div className="flex flex-col items-end gap-1">
      <form action={action}>
        <input type="hidden" name="userId" value={userId} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
        >
          {pending ? "…" : "Passwort zurücksetzen"}
        </button>
      </form>
      {state?.error ? <span className="text-xs text-red-600">{state.error}</span> : null}
      {state?.tempPassword ? (
        <div className="w-60">
          <p className="text-[11px] text-zinc-500">Temporäres Passwort (der Person mitteilen):</p>
          <CopyField value={state.tempPassword} />
        </div>
      ) : null}
    </div>
  );
}
