"use client";

import { useEffect, useRef, useState } from "react";
import type Konva from "konva";
import { Image as KonvaImage, Layer, Rect, Stage, Transformer } from "react-konva";
import { FIGURES, type FigureKind, type FigureView } from "@/lib/booking/figures";
import { computeCoverage, type Point } from "@/lib/booking/coverage";
import type { BodyPartKey } from "@/lib/booking/body-parts";
import { useHtmlImage } from "@/components/booking/use-html-image";

export type BodyPlacementEditorProps = {
  figureKind: FigureKind;
  view: FigureView;
  imageSrc: string | null;
  onCoverageChange: (coverage: Partial<Record<BodyPartKey, number>>) => void;
};

export default function BodyPlacementEditorClient({
  figureKind,
  view,
  imageSrc,
  onCoverageChange,
}: BodyPlacementEditorProps) {
  const figure = FIGURES[figureKind][view];
  const [img] = useHtmlImage(imageSrc);
  const imgRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [covered, setCovered] = useState<Partial<Record<BodyPartKey, number>>>({});

  function recompute() {
    const node = imgRef.current;
    if (!node) return;
    const tr = node.getAbsoluteTransform();
    const w = node.width();
    const h = node.height();
    const quad: Point[] = [
      tr.point({ x: 0, y: 0 }),
      tr.point({ x: w, y: 0 }),
      tr.point({ x: w, y: h }),
      tr.point({ x: 0, y: h }),
    ];
    const cov = computeCoverage(quad, figure.parts);
    setCovered(cov);
    onCoverageChange(cov);
  }

  // Bild initial mittig platzieren + Transformer anhaengen, sobald geladen.
  useEffect(() => {
    const node = imgRef.current;
    const tr = trRef.current;
    if (!img || !node || !tr) return;
    const maxBase = 130;
    const ratio = img.width / img.height || 1;
    let w = maxBase;
    let h = maxBase;
    if (ratio >= 1) h = maxBase / ratio;
    else w = maxBase * ratio;
    node.width(w);
    node.height(h);
    node.scaleX(1);
    node.scaleY(1);
    node.rotation(0);
    node.position({ x: figure.width / 2 - w / 2, y: 230 - h / 2 });
    tr.nodes([node]);
    tr.getLayer()?.batchDraw();
    recompute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img]);

  return (
    <div className="mx-auto w-fit touch-none">
      <Stage width={figure.width} height={figure.height}>
        <Layer listening={false}>
          {figure.parts.map((p) => {
            const frac = covered[p.key] ?? 0;
            return (
              <Rect
                key={p.key}
                x={p.x}
                y={p.y}
                width={p.w}
                height={p.h}
                cornerRadius={p.rounded ?? 6}
                fill={frac > 0 ? `rgba(37,99,235,${0.2 + 0.55 * frac})` : "rgba(148,163,184,0.18)"}
                stroke="#94a3b8"
                strokeWidth={1}
              />
            );
          })}
        </Layer>
        <Layer>
          {img ? (
            <KonvaImage
              ref={imgRef}
              image={img}
              draggable
              onDragMove={recompute}
              onDragEnd={recompute}
              onTransform={recompute}
              onTransformEnd={recompute}
            />
          ) : null}
          <Transformer
            ref={trRef}
            rotateEnabled
            keepRatio
            enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
            anchorSize={14}
            boundBoxFunc={(oldBox, newBox) =>
              newBox.width < 24 || newBox.height < 24 ? oldBox : newBox
            }
          />
        </Layer>
      </Stage>
    </div>
  );
}
