export type DayStatus = "free" | "full" | "closed";
export type DayAvailability = { status: DayStatus; slots: string[] };

export type Placement = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotationDeg: number;
  naturalWidth: number;
  naturalHeight: number;
};

export type WizardSkill = { id: number; name: string; description: string | null };

export type WizardArtist = {
  id: number;
  displayName: string;
  slug: string;
  specialty: string | null;
  bio: string | null;
  avatarUrl: string | null;
  skillIds: number[];
  /** Stundensatz (CHF) je skillId, als String (decimal). */
  rates: Record<number, string>;
};
