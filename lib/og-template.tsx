import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

/**
 * Inter (Cyrillic + Latin) fetched from jsDelivr's fontsource mirror at runtime.
 * Cached by next's fetch deduplication for 24h.
 */
async function loadFont(weight: 400 | 700): Promise<ArrayBuffer> {
  // fontsource ships static TTF subsets, Satori-friendly.
  const url = `https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/cyrillic-${weight}-normal.ttf`;
  const res = await fetch(url, { next: { revalidate: 86_400 } });
  if (!res.ok) throw new Error(`font fetch failed: ${res.status}`);
  return await res.arrayBuffer();
}

type OgOptions = {
  /** Type badge, e.g. "СУЩНОСТЬ" or "THEORY" */
  badge: string;
  /** Main heading */
  title: string;
  /** Optional subtitle line under the title */
  subtitle?: string | null;
  /** Tiny footer text (slug, author, etc.) */
  footer?: string | null;
  /** Accent color for the badge bar */
  accent?: string;
};

const DEFAULT_ACCENT = "#0f172a"; // slate-900

export async function renderOgImage(opts: OgOptions): Promise<Response> {
  let fontRegular: ArrayBuffer | null = null;
  let fontBold: ArrayBuffer | null = null;
  try {
    [fontRegular, fontBold] = await Promise.all([
      loadFont(400),
      loadFont(700),
    ]);
  } catch {
    // Fall back to system fonts. Cyrillic may render incorrectly but the
    // image still renders without breaking the page.
  }

  const title = clip(opts.title, 140);
  const subtitle = opts.subtitle ? clip(opts.subtitle, 200) : null;
  const footer = opts.footer ? clip(opts.footer, 80) : null;
  const accent = opts.accent ?? DEFAULT_ACCENT;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#fafafa",
          color: "#0a0a0a",
          padding: "60px 72px",
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            backgroundColor: accent,
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#525252",
              display: "flex",
            }}
          >
            {opts.badge}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            flex: 1,
            justifyContent: "center",
            paddingRight: 40,
          }}
        >
          <div
            style={{
              fontSize: titleFontSize(title),
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "#0a0a0a",
              display: "flex",
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 32,
                fontWeight: 400,
                lineHeight: 1.35,
                color: "#525252",
                display: "flex",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid #e5e5e5",
            paddingTop: 18,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#0a0a0a",
              display: "flex",
            }}
          >
            Соционическая Семантика
          </div>
          {footer && (
            <div
              style={{
                fontSize: 20,
                color: "#737373",
                fontFamily: "monospace",
                display: "flex",
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts:
        fontRegular && fontBold
          ? [
              {
                name: "Inter",
                data: fontRegular,
                weight: 400,
                style: "normal",
              },
              {
                name: "Inter",
                data: fontBold,
                weight: 700,
                style: "normal",
              },
            ]
          : undefined,
    },
  );
}

function clip(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

function titleFontSize(s: string): number {
  if (s.length <= 30) return 96;
  if (s.length <= 60) return 78;
  if (s.length <= 100) return 60;
  return 48;
}
