// Shared mapping between API muscle names and react-body-highlighter slugs
export const MUSCLE_SLUG_MAP: Record<string, string> = {
  "pectoralis major": "chest",
  "pectoralis minor": "chest",
  chest: "chest",
  "rectus abdominis": "abs",
  abs: "abs",
  abdominals: "abs",
  obliques: "obliques",
  "external oblique": "obliques",
  "internal oblique": "obliques",
  trapezius: "trapezius",
  traps: "trapezius",
  "upper back": "upper-back",
  rhomboids: "upper-back",
  "latissimus dorsi": "upper-back",
  lats: "upper-back",
  "lower back": "lower-back",
  "erector spinae": "lower-back",
  biceps: "biceps",
  "biceps brachii": "biceps",
  triceps: "triceps",
  "triceps brachii": "triceps",
  forearm: "forearm",
  forearms: "forearm",
  brachioradialis: "forearm",
  "front deltoid": "front-deltoids",
  "anterior deltoid": "front-deltoids",
  deltoids: "front-deltoids",
  deltoid: "front-deltoids",
  shoulders: "front-deltoids",
  "rear deltoid": "back-deltoids",
  "posterior deltoid": "back-deltoids",
  quadriceps: "quadriceps",
  quads: "quadriceps",
  hamstrings: "hamstring",
  hamstring: "hamstring",
  glutes: "gluteal",
  "gluteus maximus": "gluteal",
  gluteal: "gluteal",
  calves: "calves",
  gastrocnemius: "calves",
  soleus: "calves",
  adductors: "adductor",
  adductor: "adductor",
  abductors: "abductors",
  neck: "neck",
};

export function toBodySlug(name: string): string | null {
  const key = (name || "").toLowerCase().trim();
  if (MUSCLE_SLUG_MAP[key]) return MUSCLE_SLUG_MAP[key];
  for (const [k, v] of Object.entries(MUSCLE_SLUG_MAP)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

// Helpers for deciding whether to show anterior/posterior model
export const BACK_SLUGS = new Set<string>([
  "upper-back",
  "lower-back",
  "trapezius",
  "back-deltoids",
  "hamstring",
  "gluteal",
  "calves",
]);

// Shared color tokens for muscle involvement
export const INV_COLOR: Record<string, string> = {
  primary: "#16a34a",
  secondary: "#d97706",
  stabilizer: "#0284c7",
};

export const INV_BADGE: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  primary: {
    bg: "bg-green-50 border border-green-100",
    text: "text-green-700",
    label: "Primary",
  },
  secondary: {
    bg: "bg-amber-50 border border-amber-100",
    text: "text-amber-700",
    label: "Secondary",
  },
  stabilizer: {
    bg: "bg-sky-50 border border-sky-100",
    text: "text-sky-700",
    label: "Stabilizer",
  },
};

