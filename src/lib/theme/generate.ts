import {
  BLACK,
  WHITE,
  contrast,
  fromHsl,
  hexToRgb,
  mix,
  relativeLuminance,
  rgbToHex,
  rgbToRgba,
  saturation,
  toHsl,
  type RGB,
} from "./color";

export type ThemeMode = "light" | "dark";

export const PALETTE_VAR_NAMES = [
  "surface",
  "card",
  "hover",
  "active",
  "input",
  "nav",
  "border",
  "border-hover",
  "border-active",
  "primary",
  "secondary",
  "tertiary",
  "quaternary",
  "inverse",
  "accent",
  "accent-text",
  "skeleton",
] as const;

export type PaletteVarName = (typeof PALETTE_VAR_NAMES)[number];
export type PaletteVars = Record<PaletteVarName, string>;

function ensureContrast(
  candidate: RGB,
  foreground: RGB,
  background: RGB,
  target: number,
): RGB {
  if (contrast(candidate, background) >= target) return candidate;

  let low = 0;
  let high = 1;
  for (let i = 0; i < 12; i += 1) {
    const weight = (low + high) / 2;
    const adjusted = mix(foreground, background, weight);
    if (contrast(adjusted, background) >= target) high = weight;
    else low = weight;
  }

  return mix(foreground, background, high);
}

/**
 * Derives the full set of --color-* tokens from 5 brand colors, picking
 * roles by contrast/saturation rather than hand-tuning each theme:
 * the darkest color anchors dark-mode backgrounds / light-mode text,
 * the lightest does the opposite, and the most saturated mid-tone
 * becomes the accent. Text tiers begin as blended primary/background values,
 * then are pulled toward the primary color only when needed to meet their
 * contrast floor.
 */
export function generatePaletteVars(
  colors: readonly string[],
  mode: ThemeMode,
): PaletteVars {
  const rgbs = colors.map(hexToRgb);
  const lums = rgbs.map(relativeLuminance);
  const order = rgbs.map((_, i) => i).sort((i, j) => lums[i] - lums[j]);
  const darkAnchor = rgbs[order[0]];
  const lightAnchor = rgbs[order[order.length - 1]];

  const mids = rgbs.filter(
    (_, i) => i !== order[0] && i !== order[order.length - 1],
  );
  const candidates = mids.length ? mids : rgbs;
  const accent = candidates.reduce((best, c) =>
    saturation(c) > saturation(best) ? c : best,
  );
  const accentText =
    contrast(WHITE, accent) > contrast(BLACK, accent) ? WHITE : BLACK;

  let surface: RGB, card: RGB, hover: RGB, active: RGB, input: RGB;
  let border: RGB, borderHover: RGB, borderActive: RGB;
  let primary: RGB, inverse: RGB;

  if (mode === "light") {
    const bg = lightAnchor;
    surface = mix(bg, WHITE, 0.1);
    card = mix(bg, WHITE, 0.05);
    hover = mix(bg, WHITE, 0.2);
    active = mix(bg, WHITE, 0.28);
    input = card;
    border = mix(bg, WHITE, 0.28);
    borderHover = mix(bg, WHITE, 0.42);
    borderActive = mix(bg, WHITE, 0.62);
    primary =
      relativeLuminance(darkAnchor) > 0.22
        ? mix(darkAnchor, BLACK, 0.6)
        : darkAnchor;
    inverse = WHITE;
  } else {
    // Raw dark anchors can be too vivid/bright as a full-screen background
    // (e.g. a saturated navy at HSL L=.31 reads as "loud", not "dark UI").
    // Desaturate and cap lightness so it recedes into a neutral dark
    // canvas while keeping a hint of the theme's hue.
    const [h, s, l] = toHsl(darkAnchor);
    const bg = fromHsl(h, s * 0.45, Math.min(l, 0.13));

    surface = bg;
    card = mix(bg, WHITE, 0.88);
    hover = mix(bg, WHITE, 0.78);
    active = mix(bg, WHITE, 0.72);
    input = bg;
    border = mix(bg, WHITE, 0.7);
    borderHover = mix(bg, WHITE, 0.58);
    borderActive = mix(bg, WHITE, 0.42);
    primary =
      relativeLuminance(lightAnchor) < 0.65
        ? mix(lightAnchor, WHITE, 0.5)
        : lightAnchor;
    inverse = bg;
  }

  const secondary = ensureContrast(
    mix(primary, surface, 0.8),
    primary,
    card,
    7.1,
  );
  const tertiary = ensureContrast(
    mix(primary, surface, 0.5),
    primary,
    card,
    4.6,
  );
  const quaternary = ensureContrast(
    mix(primary, surface, 0.35),
    primary,
    card,
    3.1,
  );

  return {
    surface: rgbToHex(surface),
    card: rgbToHex(card),
    hover: rgbToHex(hover),
    active: rgbToHex(active),
    input: rgbToHex(input),
    nav: rgbToRgba(card, 0.9),
    border: rgbToHex(border),
    "border-hover": rgbToHex(borderHover),
    "border-active": rgbToHex(borderActive),
    primary: rgbToHex(primary),
    secondary: rgbToHex(secondary),
    tertiary: rgbToHex(tertiary),
    quaternary: rgbToHex(quaternary),
    inverse: rgbToHex(inverse),
    accent: rgbToHex(accent),
    "accent-text": rgbToHex(accentText),
    skeleton: rgbToHex(border),
  };
}

/**
 * 5-step intensity scale (no activity -> peak activity) for the heatmap,
 * built from the same accent + surface already derived for this palette
 * so it reads as part of the theme instead of a fixed green scale.
 */
export function generateHeatmapScale(
  colors: readonly string[],
  mode: ThemeMode,
): [string, string, string, string, string] {
  const vars = generatePaletteVars(colors, mode);
  const accent = hexToRgb(vars.accent);
  const surface = hexToRgb(vars.surface);
  const steps = [0.12, 0.32, 0.55, 0.78, 1] as const;
  return steps.map((t) => rgbToHex(mix(accent, surface, t))) as [
    string,
    string,
    string,
    string,
    string,
  ];
}
