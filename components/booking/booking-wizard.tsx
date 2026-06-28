"use client";

import { useMemo, useState } from "react";
import { ArtistCard } from "@/components/booking/artist-card";
import { BodyPlacementEditor } from "@/components/booking/body-placement-editor";
import type { Placement, WizardArtist, WizardSkill } from "@/lib/booking/types";
import { type FigureKind, FIGURE_KIND_LABELS } from "@/lib/booking/figures";
import { BODY_PART_LABELS, type BodyPartKey } from "@/lib/booking/body-parts";
import { estimateDurationMin, estimatePrice, roundUpToInterval } from "@/lib/booking/estimate";
import { CalendarPicker, type SelectedSlot } from "@/components/booking/calendar-picker";
import { submitBooking } from "@/app/actions/booking";

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [customerNote, setCustomerNote] = useState("");
  const [agbChecked, setAgbChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

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
  const styleName = skills.find((s) => s.id === styleId)?.name ?? "—";
  const coveredLabels = Object.keys(coverage)
    .map((k) => BODY_PART_LABELS[k as BodyPartKey])
    .join(", ");

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
    setImageFile(file);
    setImageSrc(URL.createObjectURL(file));
    setCoverage({});
    setPlacement(null);
  }

  async function onSubmit() {
    if (!imageFile || !placement || styleId == null || staffId == null) return;
    setSubmitting(true);
    setSubmitError(null);
    const fd = new FormData();
    fd.append("image", imageFile);
    fd.append(
      "payload",
      JSON.stringify({
        styleId,
        staffId,
        genderUsed: figureKind,
        bodyView: "front",
        coverage,
        placement,
        requestedStart: selectedSlot,
        customerNote: customerNote || undefined,
        agbAccepted: agbChecked,
      }),
    );
    const res = await submitBooking(fd);
    setSubmitting(false);
    if (res.ok) setSubmitted(true);
    else setSubmitError(res.error);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <h2 className="font-heading text-xl font-semibold text-green-800">Anfrage gesendet! 🎉</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-green-700">
          Dein Artist prüft die Anfrage und bestätigt Preis &amp; Termin. Den Status findest du
          jederzeit unter „Mein Konto“.
        </p>
        <a
          href="/account"
          className="mt-5 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          Zu meinen Anfragen
        </a>
      </div>
    );
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
              onChange={(data) => {
                setCoverage(data.coverage);
                setPlacement(data.placement);
              }}
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
            <CalendarPicker
              staffId={staffId}
              durationMin={roundedDuration}
              timezone={timezone}
              bookingHorizonDays={bookingHorizonDays}
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
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-lg font-semibold text-zinc-900">Zusammenfassung</h2>
          <ul className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
            <li>
              <span className="text-zinc-500">Stil:</span> {styleName}
            </li>
            <li>
              <span className="text-zinc-500">Artist:</span> {selectedArtist?.displayName ?? "—"}
            </li>
            <li>
              <span className="text-zinc-500">Körperstellen:</span> {coveredLabels || "—"}
            </li>
            <li>
              <span className="text-zinc-500">Geschätzt:</span> ca. {(roundedDuration / 60).toFixed(1)} Std
              {hasPrice ? ` · ca. ${Math.round(price)} CHF` : ""}
            </li>
            <li>
              <span className="text-zinc-500">Wunschtermin:</span>{" "}
              {selectedSlot ? `${selectedSlot.date} um ${selectedSlot.time} Uhr` : "—"}
            </li>
          </ul>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            Anmerkung an den Artist <span className="font-normal text-zinc-400">(optional)</span>
            <textarea
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={agbChecked}
              onChange={(e) => setAgbChecked(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300"
            />
            Ich akzeptiere die AGB.
          </label>

          {submitError ? (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </p>
          ) : null}

          <button
            type="button"
            onClick={onSubmit}
            disabled={!agbChecked || submitting || !imageFile}
            className="self-start rounded-lg bg-accent px-6 py-2.5 text-base font-medium text-white hover:opacity-90 disabled:opacity-40"
          >
            {submitting ? "Wird gesendet …" : "Anfrage senden"}
          </button>
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
