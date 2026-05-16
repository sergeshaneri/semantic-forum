import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgImage,
} from "@/lib/og-template";
import { isLocale } from "@/lib/i18n/config";
import { api } from "@/lib/trpc/server";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Socionics Semantics — Publication";

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; username: string; slug: string }>;
}) {
  const { lang, username, slug } = await params;
  if (!isLocale(lang)) {
    return renderOgImage({ badge: "Socionics Semantics", title: "—" });
  }

  try {
    const data = await api.publication.getBySlug({
      username,
      slug,
      language: lang,
    });
    const kindLabel =
      data.publication.kind === "article"
        ? lang === "ru" ? "Статья" : "Article"
        : lang === "ru" ? "Видео" : "Video";
    const stripped = data.publication.body
      .replace(/\[.*?\]\(.*?\)/g, "")
      .replace(/[#*_`>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 180);
    return renderOgImage({
      badge: `${kindLabel} · @${username}`,
      title: data.publication.title,
      subtitle: stripped,
      footer: `/${lang}/u/${username}/p/${data.publication.slug}`,
      accent: "#16a34a",
    });
  } catch {
    return renderOgImage({
      badge: lang === "ru" ? "Публикация" : "Publication",
      title:
        lang === "ru" ? "Публикация не найдена" : "Publication not found",
      footer: `/${lang}/u/${username}/p/${slug}`,
    });
  }
}
