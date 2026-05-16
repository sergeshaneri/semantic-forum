import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgImage,
} from "@/lib/og-template";
import { isLocale } from "@/lib/i18n/config";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Socionics Semantics";

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const ru = isLocale(lang) && lang === "ru";

  return renderOgImage({
    badge: ru
      ? "Платформа для аргументированных интерпретаций"
      : "A platform for reasoned interpretations",
    title: ru ? "Соционическая Семантика" : "Socionics Semantics",
    subtitle: ru
      ? "Сообщество, где спорят аргументами, а не ТИМами. Каждая интерпретация привязана к конкретной теории, форки делают расхождения видимыми."
      : "A community that argues by reasoning, not by TIM labels. Every interpretation is tied to a specific theory, and forks make disagreement visible.",
    footer: ru ? "semantic-forum.up.railway.app" : "semantic-forum.up.railway.app",
    accent: "#0a0a0a",
  });
}
