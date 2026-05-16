import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgImage,
} from "@/lib/og-template";
import { isLocale } from "@/lib/i18n/config";
import { api } from "@/lib/trpc/server";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Socionics Semantics — Event";

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
    const data = await api.event.getBySlug({ slug, language: lang });
    const date = new Date(data.event.startAt).toLocaleDateString(
      lang === "ru" ? "ru-RU" : "en-US",
      { day: "numeric", month: "long", year: "numeric" },
    );
    const kindLabel =
      data.event.kind === "online"
        ? lang === "ru" ? "Онлайн" : "Online"
        : data.event.kind === "offline"
          ? lang === "ru" ? "Оффлайн" : "Offline"
          : lang === "ru" ? "Гибрид" : "Hybrid";
    return renderOgImage({
      badge: `${kindLabel} · ${date}`,
      title: data.event.title,
      subtitle: data.event.location || data.event.description?.slice(0, 180) || null,
      footer: `/${lang}/events/${data.event.slug}`,
      accent: "#9333ea",
    });
  } catch {
    return renderOgImage({
      badge: lang === "ru" ? "Событие" : "Event",
      title: lang === "ru" ? "Событие не найдено" : "Event not found",
      footer: `/${lang}/events/${slug}`,
    });
  }
}
