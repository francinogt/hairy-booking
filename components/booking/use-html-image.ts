"use client";

// Dieser Hook synchronisiert React-State mit einem externen System (Bild-Laden) —
// genau der legitime Effekt-Einsatzzweck; synchrones setState ist hier gewollt.
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";

export type ImageStatus = "empty" | "loading" | "loaded" | "failed";

/** Laedt ein HTMLImageElement aus einer URL/Object-URL (fuer Konva). */
export function useHtmlImage(src: string | null): [HTMLImageElement | null, ImageStatus] {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<ImageStatus>("empty");

  useEffect(() => {
    if (!src) {
      setImg(null);
      setStatus("empty");
      return;
    }
    setStatus("loading");
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    let active = true;
    image.onload = () => {
      if (active) {
        setImg(image);
        setStatus("loaded");
      }
    };
    image.onerror = () => {
      if (active) {
        setImg(null);
        setStatus("failed");
      }
    };
    image.src = src;
    return () => {
      active = false;
    };
  }, [src]);

  return [img, status];
}
