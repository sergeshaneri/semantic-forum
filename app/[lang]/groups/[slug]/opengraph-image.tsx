import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgImage,
} from "@/lib/og-template";
import { isLocale } from "@/lib/i18n/config";
import { api } from "@/lib/trpc/server";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Socionics Semantics — Group";

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
    const data = await api.group.getBySlug({ slug, language: lang });
    return renderOgImage({
      badge: lang === "ru" ? "Группа" : "Group",
      title: data.group.name,
      subtitle: data.group.description || null,
      footer: `${data.members.length} ${
        lang === "ru" ? "участников" : "members"
      } · /${lang}/groups/${data.group.slug}`,
      accent: "#ea580c",
    });
  } catch {
    return renderOgImage({
      badge: lang === "ru" ? "Группа" : "Group",
      title: lang === "ru" ? "Группа не найдена" : "Group not found",
      footer: `/${lang}/groups/${slug}`,
    });
  }
}
