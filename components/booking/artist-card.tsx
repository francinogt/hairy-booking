"use client";

import type { WizardArtist } from "@/lib/booking/types";

export function ArtistCard({
  artist,
  selected,
  onSelect,
}: {
  artist: WizardArtist;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex w-full flex-col gap-1 rounded-xl border p-4 text-left transition-colors ${
        selected ? "border-accent ring-2 ring-accent/30" : "border-zinc-200 hover:border-zinc-300"
      }`}
    >
      <span className="flex items-center gap-3">
        {artist.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- dynamisches Avatar
          <img
            src={artist.avatarUrl}
            alt={artist.displayName}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-500">
            {artist.displayName.slice(0, 2).toUpperCase()}
          </span>
        )}
        <span className="font-medium text-zinc-900">{artist.displayName}</span>
      </span>
      {artist.specialty ? <span className="text-sm text-zinc-500">{artist.specialty}</span> : null}
      {artist.bio ? (
        <span className="pointer-events-none absolute inset-x-2 top-full z-10 mt-1 hidden rounded-lg bg-zinc-900 px-3 py-2 text-xs leading-snug text-white shadow-lg group-hover:block">
          {artist.bio}
        </span>
      ) : null}
    </button>
  );
}
