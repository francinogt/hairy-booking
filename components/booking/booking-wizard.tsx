"use client";

import { useMemo, useState } from "react";
import { ArtistCard } from "@/components/booking/artist-card";
import { BodyPlacementEditor } from "@/components/booking/body-placement-editor";
import type { WizardArtist, WizardSkill } from "@/lib/booking/types";
import { type FigureKind, FIGURE_KIND_LABELS } from "@/lib/booking/figures";
import { BODY_PART_LABELS, type BodyPartKey } from "@/lib/booking/body-parts";
import { estimateDurationMin, estimatePrice, roundUpToInterval } from "@/lib/booking/estimate";
import { SlotPicker, type SelectedSlot } from "@/components/booking/slot-picker";

const STEPS = ["Stil", "Artist", "Profil", "Motiv", "Termin", "Bestätigen"];

export function BookingWizard({
  skills,
  artists,
  minPrice,
  figureKindDefault,
  profileComplete,
  slotIntervalMin,
  bookingHorizonDays,
  timezone,
}: {
  skills: WizardSkill[];
  artists: WizardArtist[];
  minPrice: number;
  figureKindDefault: FigureKind;
  profileComplete: boolean;
  slotIntervalMin: number;
  bookingHorizonDays: number;
  timezone: string;
}) {
  const [step, setStep] = useState(0);
  const [styleId, setStyleId] = useState<number | null>(null);
  const [staffId, setStaffId] = useState<number | null>(null);
  const [figureKind, setFigureKind] = useState<FigureKind>(figureKindDefault);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [coverage, setCoverage] = useState<Partial<Record<BodyPartKey, number>>>({});
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [dateRange] = useState(() => {
    const fmt = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(d);
    return {
      fromDate: fmt(new Date()),
      toDate: fmt(new Date(Date.now() + bookingHorizonDays * 86_400_000)),
    };
  });

  const availableArtists = useMemo(
    () => (styleId == null ? [] : artists.filter((a) => a.skillIds.includes(styleId))),
    [styleId, artists],
  );
  const selectedArtist = artists.find((a) => a.id === staffId) ?? null;

  const hourlyRate =
    styleId != null && selectedArtist ? Number(selectedArtist.rates[styleId] ?? 0) : 0;
  const durationMin = estimateDurationMin(coverage);
  const roundedDuration = roundUpToInterval(durationMin, slotIntervalMin);
  const price = estimatePrice(roundedDuration, hourlyRate, minPrice);
  const hasPrice = hourlyRate > 0 || minPrice > 0;

  const canNext =
    step < STEPS.length - 1 &&
    !(step === 0 && styleId == null) &&
    !(step === 1 && staffId == null) &&
    !(step === 3 && !imageSrc) &&
    !(step === 4 && !selectedSlot);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setImageSrc(URL.createObjectURL(file));
    setCoverage({});
  }

  return (
    <div className="flex flex-col gap-6">
      <ol className="flex flex-wrap gap-1.5 text-xs">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`rounded-full px-3 py-1 font-medium ${
              i === step
                ? "bg-accent text-white"
                : i < step
                  ? "bg-zinc-200 text-zinc-700"
                  : "bg-zinc-100 text-zinc-400"
            }`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <div>
          <h2 className="font-heading text-lg font-semibold text-zinc-900">Welcher Stil?</h2>
          {skills.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">Es sind noch keine Stile verfügbar.</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {skills.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setStyleId(s.id);
                    setStaffId(null);
                  }}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    styleId === s.id
                      ? "border-accent ring-2 ring-accent/30"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <p className="font-medium text-zinc-900">{s.name}</p>
                  {s.description ? <p className="mt-1 text-sm text-zinc-500">{s.description}</p> : null}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {step === 1 ? (
        <div>
          <h2 className="font-heading text-lg font-semibold text-zinc-900">Wähle deinen Artist</h2>
          <p className="mt-1 text-sm text-zinc-500">Nur Artists, die diesen Stil anbieten.</p>
          {availableArtists.length === 0 ? (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Für diesen Stil ist aktuell kein Artist verfügbar.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {availableArtists.map((a) => (
                <ArtistCard
                  key={a.id}
                  artist={a}
                  selected={staffId === a.id}
                  onSelect={() => setStaffId(a.id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}

      {step === 2 ? (
        <div>
          <h2 className="font-heading text-lg font-semibold text-zinc-900">Profil & Figur</h2>
          {!profileComplete ? (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Bitte vervollständige deine{" "}
              <a href="/account" className="font-medium underline">
                persönlichen Daten
              </a>{" "}
              (Adresse, Geschlecht) — sie werden für die Buchung benötigt.
            </p>
          ) : null}
          <p className="mt-3 text-sm text-zinc-600">
            Welche Figur soll für die Platzierung verwendet werden?
          </p>
          <div className="mt-3 flex gap-3">
            {(["male", "female"] as FigureKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setFigureKind(k)}
                className={`rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors ${
                  figureKind === k
                    ? "border-accent bg-accent text-white"
                    : "border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {FIGURE_KIND_LABELS[k]}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div>
          <h2 className="font-heading text-lg font-semibold text-zinc-900">Motiv platzieren</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Lade dein Wunsch-Motiv hoch und ziehe, drehe und skaliere es auf das Körperteil.
          </p>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={onPickFile}
            className="mt-3 block text-sm"
          />
          <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 py-3">
            <BodyPlacementEditor
              figureKind={figureKind}
              view="front"
              imageSrc={imageSrc}
              onCoverageChange={setCoverage}
            />
          </div>

          <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
            {durationMin === 0 ? (
              <p className="text-sm text-zinc-500">
                {imageSrc
                  ? "Ziehe das Motiv auf ein Körperteil, um eine Schätzung zu sehen."
                  : "Lade ein Motiv hoch, um zu starten."}
              </p>
            ) : (
              <>
                <p className="text-sm font-semibold text-zinc-900">
                  Geschätzt: ca. {(durationMin / 60).toFixed(1)} Std
                  {hasPrice ? ` · ca. ${Math.round(price)} CHF` : " · Preis auf Anfrage"}
                </p>
                {!hourlyRate ? (
                  <p className="mt-1 text-xs text-zinc-400">
                    Der finale Preis wird vom Artist bei der Freigabe festgelegt.
                  </p>
                ) : null}
                <ul className="mt-2 flex flex-wrap gap-1.5 text-xs text-zinc-600">
                  {Object.entries(coverage).map(([k, f]) => (
                    <li key={k} className="rounded bg-zinc-100 px-2 py-0.5">
                      {BODY_PART_LABELS[k as BodyPartKey]} {Math.round((f ?? 0) * 100)}%
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div>
          <h2 className="font-heading text-lg font-semibold text-zinc-900">Termin wählen</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Geschätzte Dauer: ca. {(roundedDuration / 60).toFixed(1)} Std
            {hasPrice ? ` · ca. ${Math.round(price)} CHF` : ""}. Freie Zeiten bei deinem Artist:
          </p>
          <div className="mt-4">
            <SlotPicker
              staffId={staffId}
              durationMin={roundedDuration}
              fromDate={dateRange.fromDate}
              toDate={dateRange.toDate}
              timezone={timezone}
              selected={selectedSlot}
              onSelect={setSelectedSlot}
            />
          </div>
          {selectedSlot ? (
            <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
              Gewählt: {selectedSlot.date} um {selectedSlot.time} Uhr
            </p>
          ) : null}
        </div>
      ) : null}

      {step === 5 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
          Der letzte Schritt (Zusammenfassung + AGB + Anfrage senden) folgt als Nächstes.
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 disabled:opacity-40"
        >
          Zurück
        </button>
        <button
          type="button"
          onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
          disabled={!canNext}
          className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
        >
          Weiter
        </button>
      </div>
    </div>
  );
}
