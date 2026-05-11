import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, locales } from "@/lib/i18n/config";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const otherLang = lang === "ru" ? "en" : "ru";

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href={`/${lang}`} className="font-heading text-lg font-semibold">
            {dict.appName}
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href={`/${lang}/entities`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {dict.nav.entities}
            </Link>
            <Link
              href={`/${lang}/theories`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {dict.nav.theories}
            </Link>
            <Link
              href={`/${otherLang}`}
              className="text-muted-foreground hover:text-foreground transition-colors uppercase"
            >
              {otherLang}
            </Link>
            <Link
              href={`/${lang}/login`}
              className="text-foreground hover:opacity-80 transition-opacity"
            >
              {dict.nav.login}
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {dict.appName}
        </div>
      </footer>
    </div>
  );
}
