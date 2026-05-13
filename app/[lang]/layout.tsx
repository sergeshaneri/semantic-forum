import Link from "next/link";
import { notFound } from "next/navigation";
import { NotificationBell } from "@/components/socionics/notification-bell";
import { SearchBar } from "@/components/socionics/search-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";
import { auth } from "@/lib/auth/auth";
import { SessionProvider } from "@/lib/auth/session-context";
import { isLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

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
  const session = await auth();
  const otherLang = lang === "ru" ? "en" : "ru";
  const sessionUser =
    session?.user && (session.user as { id?: string }).id
      ? {
          id: (session.user as { id: string }).id,
          username:
            (session.user as { username?: string }).username ?? "",
        }
      : null;

  return (
    <SessionProvider user={sessionUser}>
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-30">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center gap-4">
          <Link href={`/${lang}`} className="font-heading text-lg font-semibold shrink-0">
            {dict.appName}
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-sm">
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
              href={`/${lang}/schools`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {dict.schools.title}
            </Link>
            <Link
              href={`/${lang}/questions`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {dict.questions.title}
            </Link>
            <Link
              href={`/${lang}/events`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {dict.events.title}
            </Link>
          </nav>
          <div className="flex-1" />
          <SearchBar lang={lang} dict={dict} />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href={`/${otherLang}`}
              className="text-muted-foreground hover:text-foreground transition-colors uppercase text-sm"
            >
              {otherLang}
            </Link>
            {session?.user ? (
              <>
                <NotificationBell lang={lang} dict={dict} />
                <Link
                  href={`/${lang}/bookmarks`}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted"
                  title={dict.bookmarks.title}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                  >
                    <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </Link>
                <UserMenu
                  lang={lang}
                  dict={dict}
                  user={{
                    username:
                      (session.user as { username?: string }).username ?? null,
                    name: session.user.name ?? null,
                    image: session.user.image ?? null,
                  }}
                />
              </>
            ) : (
              <>
                <Link
                  href={`/${lang}/login`}
                  className="text-foreground hover:opacity-80 transition-opacity text-sm"
                >
                  {dict.nav.login}
                </Link>
                <Link
                  href={`/${lang}/register`}
                  className="rounded-md bg-foreground text-background px-3 py-1.5 hover:opacity-90 transition-opacity text-sm"
                >
                  {dict.nav.register}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-muted-foreground flex items-center justify-between flex-wrap gap-3">
          <span>© {new Date().getFullYear()} {dict.appName}</span>
          <nav className="flex items-center gap-4">
            <Link
              href={`/${lang}/leaderboard`}
              className="hover:text-foreground transition-colors"
            >
              {dict.leaderboard.title}
            </Link>
            <Link
              href={`/${lang}/mentors`}
              className="hover:text-foreground transition-colors"
            >
              {dict.mentor.pageTitle}
            </Link>
            <Link
              href={`/${lang}/stats`}
              className="hover:text-foreground transition-colors"
            >
              {dict.stats.title}
            </Link>
            {sessionUser && (
              <Link
                href={`/${lang}/collections`}
                className="hover:text-foreground transition-colors"
              >
                {dict.collections.title}
              </Link>
            )}
          </nav>
        </div>
      </footer>
    </div>
    </SessionProvider>
  );
}
