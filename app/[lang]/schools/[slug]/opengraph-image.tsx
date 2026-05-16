import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgImage,
} from "@/lib/og-template";
import { isLocale } from "@/lib/i18n/config";
import { api } from "@/lib/trpc/server";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Socionics Semantics — School";

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
    const data = await api.school.getBySlug({ slug, language: lang });
    return renderOgImage({
      badge: lang === "ru" ? "Школа" : "School",
      title: data.school.name,
      subtitle:
        data.school.description
          ? data.school.description.slice(0, 180)
          : data.school.founderName
            ? `${lang === "ru" ? "Основатель" : "Founder"}: ${data.school.founderName}`
            : null,
      footer: `/${lang}/schools/${data.school.slug}`,
      accent: "#0891b2",
    });
  } catch {
    return renderOgImage({
      badge: lang === "ru" ? "Школа" : "School",
      title: lang === "ru" ? "Школа не найдена" : "School not found",
      footer: `/${lang}/schools/${slug}`,
    });
  }
}
