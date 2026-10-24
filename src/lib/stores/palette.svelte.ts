import { isPaletteName, type PaletteName } from "#lib/theme/palettes";

const STORAGE_KEY = "palette";

export const paletteState: { current: PaletteName } = $state({
  current: "default",
});

export function setPalette(name: PaletteName) {
  paletteState.current = name;
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch {
    // localStorage unavailable (private mode, etc.) — theme just won't persist
  }
}

export function initPalette() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isPaletteName(stored)) paletteState.current = stored;
  } catch {
    // localStorage unavailable — keep default
  }
}
