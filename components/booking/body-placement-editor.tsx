"use client";

import dynamic from "next/dynamic";
import type { BodyPlacementEditorProps } from "@/components/booking/body-placement-editor.client";

// react-konva braucht `window` -> nur clientseitig laden (ssr:false ist nur in
// Client-Komponenten erlaubt, daher dieser 'use client'-Wrapper).
const Editor = dynamic(() => import("@/components/booking/body-placement-editor.client"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[620px] items-center justify-center rounded-xl border border-zinc-200 text-sm text-zinc-400">
      Editor wird geladen …
    </div>
  ),
});

export function BodyPlacementEditor(props: BodyPlacementEditorProps) {
  return <Editor {...props} />;
}
