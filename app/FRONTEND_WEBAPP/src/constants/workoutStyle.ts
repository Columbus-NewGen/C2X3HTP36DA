/**
 * GymMate Workout – Premium fitness design system
 * Elevation, radius, typography, color scale, spacing, motion
 */

export const ELEVATION = {
  0: "shadow-none bg-gray-50",
  1: "shadow-sm bg-white",
  2: "shadow-md bg-white",
  3: "shadow-lg bg-white",
} as const;

/** Border radius: sm 8px, md 16px, lg 24px */
export const RADIUS = {
  sm: "rounded-lg",
  md: "rounded-2xl",
  lg: "rounded-3xl",
} as const;

/** Spacing scale: 4/8/12/16/24/32/48 */
export const SPACING = {
  4: "gap-1",
  8: "gap-2",
  12: "gap-3",
  16: "gap-4",
  24: "gap-6",
  32: "gap-8",
  48: "gap-12",
} as const;

export const SPACING_PX = {
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  24: 24,
  32: 32,
  48: 48,
} as const;

/** Typography hierarchy */
export const TYPO = {
  display: "text-2xl font-bold  text-gray-900",
  hero: "text-2xl font-bold  text-gray-900",
  sectionTitle: "text-lg font-bold text-gray-900",
  cardTitle: "text-base font-semibold text-gray-900",
  body: "text-base font-medium text-gray-700",
  meta: "text-sm text-gray-500",
  caption: "text-xs text-gray-400",
} as const;

/** Primary green scale – 50 background, 500 active, 700 pressed */
export const PRIMARY = {
  50: "bg-lime-50",
  100: "bg-lime-100",
  300: "bg-lime-300",
  500: "bg-lime-500",
  700: "bg-lime-700",
  text: "text-lime-600",
  textActive: "text-lime-700",
  border: "border-lime-200",
} as const;

export const MOTION = {
  durationFast: 150,
  duration: 200,
  durationSlow: 250,
  easeOut: "cubic-bezier(0.16, 1, 0.3, 1)",
  easeIn: "cubic-bezier(0.7, 0, 0.84, 0)",
  spring: "cubic-bezier(0.32, 0.72, 0, 1)",
} as const;
