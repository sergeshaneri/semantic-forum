import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgImage,
} from "@/lib/og-template";
import { isLocale } from "@/lib/i18n/config";
import { api } from "@/lib/trpc/server";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Socionics Semantics — Theory";

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) {
    return renderOgImage({ badge: "Socionics Semantics", title: "—" });
  }

  try {
    const data = await api.theory.getBySlug({ slug, language: lang });
    return renderOgImage({
      badge: data.theory.isSeed
        ? lang === "ru" ? "Сид-теория" : "Seed theory"
        : lang === "ru" ? "Теория" : "Theory",
      title: data.theory.name,
      subtitle: data.theory.description || null,
      footer: `${data.objects.length} ${
        lang === "ru" ? "объектов" : "objects"
      } · /${lang}/theories/${data.theory.slug}`,
      accent: "#7c3aed",
    });
  } catch {
    return renderOgImage({
      badge: lang === "ru" ? "Теория" : "Theory",
      title: lang === "ru" ? "Теория не найдена" : "Theory not found",
      footer: `/${lang}/theories/${slug}`,
    });
  }
}
