import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookmarkButton } from "@/components/socionics/bookmark-button";
import { Markdown } from "@/components/socionics/markdown";
import { RsvpButton } from "@/components/socionics/rsvp-button";
import { auth } from "@/lib/auth/auth";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

export default async function EventPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  let data;
  try {
    data = await api.event.getBySlug({ slug, language: lang });
  } catch {
    notFound();
  }

  const { event, organizer, attendees, myRsvp } = data;
  const session = await auth();
  const isAuthed = Boolean(session?.user);

  const goingCount = attendees.filter((a) => a.status === "going").length;
  const maybeCount = attendees.filter((a) => a.status === "maybe").length;
  const interestedCount = attendees.filter(
    (a) => a.status === "interested",
  ).length;

  return (
    <article className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <Link
        href={`/${lang}/events`}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
      >
        ← {dict.events.title}
      </Link>

      <header className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs font-normal">
            {dict.events.kinds[event.kind]}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(event.startAt).toLocaleString(
              lang === "ru" ? "ru-RU" : "en-US",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              },
            )}
            {event.endAt && (
              <>
                {" — "}
                {new Date(event.endAt).toLocaleString(
                  lang === "ru" ? "ru-RU" : "en-US",
                  { hour: "2-digit", minute: "2-digit" },
                )}
              </>
            )}
          </span>
          <span className="ml-auto">
            <BookmarkButton
              targetType="entity"
              targetId={event.id}
              isAuthed={isAuthed}
              loginHref={`/${lang}/login?callbackUrl=/${lang}/events/${event.slug}`}
            />
          </span>
        </div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight leading-tight">
          {event.title}
        </h1>
        {organizer && (
          <p className="text-sm text-muted-foreground">
            {dict.events.organizerLabel}:{" "}
            <Link
              href={`/${lang}/u/${organizer.username}`}
              className="text-foreground font-medium hover:underline underline-offset-2"
            >
              @{organizer.username}
            </Link>
          </p>
        )}
        {event.location && (
          <p className="text-sm">
            📍 <strong>{event.location}</strong>
          </p>
        )}
        {event.locationUrl && (
          <p className="text-sm">
            <a
              href={event.locationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-2"
            >
              {event.locationUrl}
            </a>
          </p>
        )}
      </header>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
          {dict.events.rsvpTitle}
        </h2>
        <RsvpButton
          eventId={event.id}
          initial={myRsvp}
          isAuthed={isAuthed}
          loginHref={`/${lang}/login?callbackUrl=/${lang}/events/${event.slug}`}
          dict={dict}
        />
        <div className="flex gap-3 text-xs text-muted-foreground font-mono pt-1">
          <span>
            {dict.events.rsvp.going}: <strong>{goingCount}</strong>
          </span>
          <span>
            {dict.events.rsvp.maybe}: <strong>{maybeCount}</strong>
          </span>
          <span>
            {dict.events.rsvp.interested}: <strong>{interestedCount}</strong>
          </span>
        </div>
      </section>

      <Separator />

      <section>
        <Markdown>{event.description}</Markdown>
      </section>

      {attendees.length > 0 && (
        <>
          <Separator />
          <section className="space-y-3">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
              {dict.events.attendeesTitle}
            </h2>
            <div className="flex flex-wrap gap-2">
              {attendees.map((a) =>
                a.user ? (
                  <Link
                    key={a.user.id}
                    href={`/${lang}/u/${a.user.username}`}
                    className="inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1 text-sm hover:bg-muted transition-colors"
                  >
                    <span className="size-5 rounded-full bg-foreground/10 flex items-center justify-center text-[10px] font-semibold">
                      {(a.user.username[0] ?? "u").toUpperCase()}
                    </span>
                    <span>{a.user.name || `@${a.user.username}`}</span>
                    <span className="text-xs text-muted-foreground/70 font-mono">
                      {dict.events.rsvp[a.status]}
                    </span>
                  </Link>
                ) : null,
              )}
            </div>
          </section>
        </>
      )}
    </article>
  );
}
