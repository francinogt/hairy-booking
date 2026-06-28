import { FIGURES, type FigureKind, type FigureView } from "@/lib/booking/figures";

export type PreviewPlacement = {
  x: number;
  y: number;
  scale: number;
  rotationDeg: number;
  naturalWidth: number;
  naturalHeight: number;
};

/** Read-only Darstellung der Figur mit aufgelegtem Motiv (für die Mitarbeiter-Ansicht). */
export function PlacementPreview({
  figureKind,
  view,
  imagePath,
  placement,
  coveredParts,
  width = 170,
}: {
  figureKind: FigureKind;
  view: FigureView;
  imagePath: string | null;
  placement: PreviewPlacement | null;
  coveredParts: string[];
  width?: number;
}) {
  const figure = FIGURES[figureKind][view];
  const covered = new Set(coveredParts);

  return (
    <svg
      viewBox={`0 0 ${figure.width} ${figure.height}`}
      width={width}
      className="h-auto shrink-0 rounded-lg border border-zinc-200 bg-zinc-50"
      role="img"
      aria-label="Platzierung des Motivs"
    >
      {figure.parts.map((p) => (
        <rect
          key={p.key}
          x={p.x}
          y={p.y}
          width={p.w}
          height={p.h}
          rx={p.rounded ?? 6}
          fill={covered.has(p.key) ? "rgba(37,99,235,0.35)" : "rgba(148,163,184,0.18)"}
          stroke="#94a3b8"
          strokeWidth={1}
        />
      ))}
      {imagePath && placement ? (
        <image
          href={imagePath}
          x={placement.x}
          y={placement.y}
          width={placement.naturalWidth * placement.scale}
          height={placement.naturalHeight * placement.scale}
          transform={`rotate(${placement.rotationDeg} ${placement.x} ${placement.y})`}
          preserveAspectRatio="none"
        />
      ) : null}
    </svg>
  );
}
