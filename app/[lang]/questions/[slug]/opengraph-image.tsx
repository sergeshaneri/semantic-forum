import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgImage,
} from "@/lib/og-template";
import { isLocale } from "@/lib/i18n/config";
import { api } from "@/lib/trpc/server";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Socionics Semantics — Question";

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
    const data = await api.question.getBySlug({ slug, language: lang });
    const stripped = data.question.body
      .replace(/\[.*?\]\(.*?\)/g, "")
      .replace(/[#*_`>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 180);
    return renderOgImage({
      badge: data.question.isResolved
        ? lang === "ru" ? "Решено" : "Resolved"
        : lang === "ru" ? "Вопрос" : "Question",
      title: data.question.title,
      subtitle: stripped,
      footer: `${data.answers.length} ${
        lang === "ru" ? "ответов" : "answers"
      } · /${lang}/questions/${data.question.slug}`,
      accent: data.question.isResolved ? "#059669" : "#0284c7",
    });
  } catch {
    return renderOgImage({
      badge: lang === "ru" ? "Вопрос" : "Question",
      title: lang === "ru" ? "Вопрос не найден" : "Question not found",
      footer: `/${lang}/questions/${slug}`,
    });
  }
}
