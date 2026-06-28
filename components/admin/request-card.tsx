"use client";

import { useActionState } from "react";
import { confirmRequest, declineRequest, type DecisionState } from "@/app/actions/requests";
import { PlacementPreview, type PreviewPlacement } from "@/components/booking/placement-preview";
import type { FigureKind, FigureView } from "@/lib/booking/figures";

export type RequestCardData = {
  id: number;
  customerName: string;
  customerEmail: string;
  skillName: string | null;
  staffDisplayName: string;
  coveredLabels: string;
  imagePath: string | null;
  figureKind: FigureKind;
  view: FigureView;
  placement: PreviewPlacement | null;
  coveredParts: string[];
  requestedStartLocal: string;
  requestedStartDisplay: string;
  estimatedDurationMin: number;
  priceAmount: string | null;
  customerNote: string | null;
};

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 " +
  "outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";

export function RequestCard({ data, showStaff }: { data: RequestCardData; showStaff: boolean }) {
  const [state, action, pending] = useActionState<DecisionState, FormData>(confirmRequest, undefined);

  return (
    <li className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 sm:flex-row">
      <div className="flex shrink-0 flex-col items-center gap-2">
        <PlacementPreview
          figureKind={data.figureKind}
          view={data.view}
          imagePath={data.imagePath}
          placement={data.placement}
          coveredParts={data.coveredParts}
        />
        {data.imagePath ? (
          <a
            href={data.imagePath}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-accent underline"
          >
            Motiv in Originalgrösse
          </a>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-medium text-zinc-900">
          {data.customerName}{" "}
          <span className="font-normal text-zinc-500">· {data.customerEmail}</span>
        </p>
        <p className="mt-0.5 text-sm text-zinc-600">
          {data.skillName ?? "—"}
          {showStaff ? ` · Artist: ${data.staffDisplayName}` : ""}
        </p>
        <p className="mt-1 text-sm text-zinc-600">
          <span className="text-zinc-500">Körperstellen:</span> {data.coveredLabels || "—"}
        </p>
        <p className="text-sm text-zinc-600">
          <span className="text-zinc-500">Wunschtermin:</span> {data.requestedStartDisplay || "—"}
        </p>
        {data.customerNote ? (
          <p className="mt-1 text-sm italic text-zinc-500">„{data.customerNote}“</p>
        ) : null}

        {state?.error ? (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}

        <form action={action} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input type="hidden" name="requestId" value={data.id} />
          <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600">
            Preis (CHF)
            <input
              type="number"
              name="priceAmount"
              min={0}
              step="5"
              defaultValue={data.priceAmount ?? "0"}
              required
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600">
            Dauer (Min)
            <input
              type="number"
              name="durationMin"
              min={5}
              step={5}
              defaultValue={data.estimatedDurationMin}
              required
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600">
            Start
            <input
              type="datetime-local"
              name="startAt"
              defaultValue={data.requestedStartLocal}
              required
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600 sm:col-span-3">
            Notiz an Kunde <span className="font-normal text-zinc-400">(optional)</span>
            <input name="staffNote" className={inputClass} />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 sm:col-span-1"
          >
            {pending ? "…" : "Bestätigen"}
          </button>
        </form>

        <form action={declineRequest} className="mt-2">
          <input type="hidden" name="requestId" value={data.id} />
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Ablehnen
          </button>
        </form>
      </div>
    </li>
  );
}
