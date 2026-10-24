export const PALETTES = {
  signal: ["#D6FF5F", "#35D0BA", "#234BFF", "#11151F", "#F5F7EE"],
  cobalt: ["#62A0FF", "#39D5D0", "#173A7A", "#0B1220", "#F4F7FF"],
  ember: ["#FF936B", "#FFD166", "#B64755", "#21181A", "#FFF4EB"],
  moss: ["#C0E85A", "#61B58F", "#245A47", "#10211B", "#F3F7E8"],
  rose: ["#FF7898", "#CE8BFF", "#6A3D6B", "#211720", "#FFF2F5"],
  nocturne: ["#9B8CFF", "#5ED5D0", "#31306E", "#11111D", "#F2F1FF"],
  mono: ["#D7FF64", "#AAB4C4", "#586174", "#12151C", "#F7F8F4"],
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
