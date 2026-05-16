import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgImage,
} from "@/lib/og-template";
import { isLocale } from "@/lib/i18n/config";
import { api } from "@/lib/trpc/server";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Socionics Semantics — Entity";

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) {
    return renderOgImage({
      badge: "Socionics Semantics",
      title: "Page not found",
    });
  }

  try {
    const data = await api.entity.getBySlug({ slug, language: lang });
    const kindLabel =
      data.entity.kind === "word"
        ? lang === "ru" ? "Слово" : "Word"
        : data.entity.kind === "person"
          ? lang === "ru" ? "Личность" : "Person"
          : lang === "ru" ? "Материал" : "Material";
    const subtitle = data.entity.descriptionWiki
      ? data.entity.descriptionWiki.slice(0, 180).replace(/\[.*?\]\(.*?\)/g, "")
      : null;
    return renderOgImage({
      badge: kindLabel,
      title: data.entity.title,
      subtitle,
      footer: `/${lang}/entities/${data.entity.slug}`,
      accent: "#1e293b",
    });
  } catch {
    return renderOgImage({
      badge: lang === "ru" ? "Сущность" : "Entity",
      title: lang === "ru" ? "Сущность не найдена" : "Entity not found",
      footer: `/${lang}/entities/${slug}`,
    });
  }
}
