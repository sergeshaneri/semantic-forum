import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgImage,
} from "@/lib/og-template";
import { isLocale } from "@/lib/i18n/config";
import { api } from "@/lib/trpc/server";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Socionics Semantics — Poll";

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
    const data = await api.poll.getBySlug({ slug, language: lang });
    return renderOgImage({
      badge: lang === "ru" ? "Опрос" : "Poll",
      title: data.poll.question,
      subtitle: data.poll.description || null,
      footer: `${data.poll.totalVotes} ${
        lang === "ru" ? "голосов" : "votes"
      } · /${lang}/polls/${data.poll.slug}`,
      accent: "#dc2626",
    });
  } catch {
    return renderOgImage({
      badge: lang === "ru" ? "Опрос" : "Poll",
      title: lang === "ru" ? "Опрос не найден" : "Poll not found",
      footer: `/${lang}/polls/${slug}`,
    });
  }
}
