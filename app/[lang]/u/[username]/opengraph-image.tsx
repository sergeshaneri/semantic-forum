import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgImage,
} from "@/lib/og-template";
import { isLocale } from "@/lib/i18n/config";
import { api } from "@/lib/trpc/server";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Socionics Semantics — Profile";

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; username: string }>;
}) {
  const { lang, username } = await params;
  if (!isLocale(lang)) {
    return renderOgImage({ badge: "Socionics Semantics", title: "—" });
  }

  try {
    const data = await api.user.getProfile({ username });
    const subtitle =
      data.user.bio?.slice(0, 180) ||
      (data.user.roles.length > 0 ? data.user.roles.join(" · ") : null);
    const karmaStr =
      data.karma >= 0 ? `+${data.karma}` : `${data.karma}`;
    return renderOgImage({
      badge: `@${data.user.username}`,
      title: data.user.name || data.user.username,
      subtitle,
      footer: `${karmaStr} ${
        lang === "ru" ? "кармы" : "karma"
      } · ${data.counters.interpretations} ${
        lang === "ru" ? "интерпретаций" : "interpretations"
      }`,
      accent: "#0a0a0a",
    });
  } catch {
    return renderOgImage({
      badge: lang === "ru" ? "Профиль" : "Profile",
      title: `@${username}`,
      footer: lang === "ru" ? "не найден" : "not found",
    });
  }
}
