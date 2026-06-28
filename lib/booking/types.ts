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
