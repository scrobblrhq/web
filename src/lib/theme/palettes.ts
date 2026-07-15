export const PALETTES = {
  ayase: ["#07BF8C", "#4227F2", "#F27EB4", "#A60D61", "#200224"],
  aira: ["#64B9F9", "#4574B8", "#389BF8", "#15298A", "#EE5C66"],
  lobster: ["#F5E9E2", "#E3B5A4", "#D44D5C", "#773344", "#160029"],
  okarun: ["#F2C230", "#F2921D", "#F24F13", "#8082A6", "#46334F"],
  winter: ["#EBDFE7", "#C8B4C4", "#261F28", "#978090", "#5C4B57"],
  chariot: ["#F2F5E2", "#E3DEA4", "#D4954D", "#775533", "#290024"]
} as const;

export type NamedPalette = keyof typeof PALETTES;
export type PaletteName = NamedPalette | "default";

export const PALETTE_NAMES: PaletteName[] = [
  "default",
  ...(Object.keys(PALETTES) as NamedPalette[]),
];

export function isPaletteName(value: string): value is PaletteName {
  return (PALETTE_NAMES as string[]).includes(value);
}
