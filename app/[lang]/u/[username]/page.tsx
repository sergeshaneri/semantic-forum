import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HintTooltip } from "@/components/ui/hint-tooltip";
import { Separator } from "@/components/ui/separator";
import { FollowButton } from "@/components/socionics/follow-button";
import { StartDmButton } from "@/components/socionics/start-dm-button";
import { ProfileEditActions } from "@/components/socionics/profile-actions";
import { ProfileProducts } from "@/components/socionics/profile-products";
import { ProfilePublications } from "@/components/socionics/profile-publications";
import { auth } from "@/lib/auth/auth";
import { badgeColor, badgeLabel, computeBadges } from "@/lib/badges";
import { cn } from "@/lib/utils";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

function getSymbol(metadata: Record<string, unknown> | null | undefined) {
  if (metadata && typeof metadata === "object" && "symbol" in metadata) {
    const v = (metadata as { symbol?: unknown }).symbol;
    return typeof v === "string" ? v : null;
  }
  return null;
}

const LINK_KIND_LABELS_RU: Record<string, string> = {
  website: "Сайт",
  telegram: "Telegram",
  youtube: "YouTube",
  instagram: "Instagram",
  twitter: "X",
  vk: "VK",
  linkedin: "LinkedIn",
  github: "GitHub",
  other: "Ссылка",
};

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ lang: string; username: string }>;
}) {
  const { lang, username } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const session = await auth();
  const isAuthed = Boolean(session?.user);

  let data;
  try {
    data = await api.user.getProfile({ username });
  } catch {
    notFound();
  }

  const {
    user,
    links,
    schools,
    influences,
    isSelf,
    viewerIsFollowing,
    karma,
    counters,
    topInterpretation,
    controversialInterpretation,
    favoriteObjects,
    favoriteTheory,
    recentInterpretations,
    theoriesAuthored,
  } = data;

  const [publications, products] = await Promise.all([
    api.publication.list({ language: lang, authorId: user.id, limit: 50 }),
    api.product.list({ language: lang, ownerId: user.id, limit: 50 }),
  ]);

  const initial = (user.username[0] ?? "u").toUpperCase();
  const badges = computeBadges({
    interpretations: counters.interpretations,
    comments: counters.comments,
    entities: counters.entities,
    theories: counters.theories,
    karma,
    followers: counters.followers,
    mentorAvailable: user.mentorAvailable,
  });
  const joined = new Date(user.createdAt).toLocaleDateString(
    lang === "ru" ? "ru-RU" : "en-US",
    { day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-10">
      <header className="flex items-start gap-5 flex-wrap">
        <div className="size-20 rounded-full bg-foreground text-background flex items-center justify-center text-2xl font-semibold overflow-hidden">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name}
              className="size-full object-cover"
            />
          ) : (
            initial
          )}
        </div>
        <div className="space-y-2 flex-1 min-w-0">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {user.name || `@${user.username}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            @{user.username} · {dict.profile.joined} {joined}
          </p>
          {(user.roles.length > 0 ||
            user.mentorAvailable ||
            user.mentorSeeking) && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {user.roles.map((r) => (
                <Badge key={r} variant="outline" className="text-xs font-normal">
                  {r}
                </Badge>
              ))}
              {user.mentorAvailable && (
                <Badge className="text-xs bg-emerald-600 text-white hover:bg-emerald-600">
                  {dict.mentor.available}
                </Badge>
              )}
              {user.mentorSeeking && (
                <Badge className="text-xs bg-sky-600 text-white hover:bg-sky-600">
                  {dict.mentor.seeking}
                </Badge>
              )}
            </div>
          )}
          {user.bio ? (
            <p className="text-sm text-foreground/80 max-w-2xl pt-2 whitespace-pre-line">
              {user.bio}
            </p>
          ) : isSelf ? (
            <p className="text-sm text-muted-foreground/70 pt-2 italic">
              {dict.profile.bioEmpty}
            </p>
          ) : null}
          {links.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {links.map((l) => (
                <a
                  key={l.id}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs rounded-md border border-border px-2 py-1 hover:bg-muted transition-colors inline-flex items-center gap-1.5"
                >
                  <span className="text-muted-foreground">
                    {LINK_KIND_LABELS_RU[l.kind] ?? l.kind}:
                  </span>
                  <span className="font-medium">{l.label}</span>
                </a>
              ))}
            </div>
          )}
          {schools.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 text-xs">
              <span className="text-muted-foreground">
                {dict.profile.schoolsLabel}:
              </span>
              {schools.map((s) => (
                <Link
                  key={s.id}
                  href={`/${lang}/schools/${s.slug}`}
                  className="rounded-md border border-border px-2 py-0.5 hover:bg-muted transition-colors"
                >
                  {s.name}
                </Link>
              ))}
            </div>
          )}
          {influences.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 text-xs">
              <span className="text-muted-foreground">
                {dict.influences.title}:
              </span>
              {influences.map((i) => {
                const name = i.influencer
                  ? `@${i.influencer.username}`
                  : i.externalName;
                if (i.influencer) {
                  return (
                    <Link
                      key={i.id}
                      href={`/${lang}/u/${i.influencer.username}`}
                      className="rounded-md border border-border px-2 py-0.5 hover:bg-muted transition-colors"
                      title={i.note ?? undefined}
                    >
                      {name}
                    </Link>
                  );
                }
                return (
                  <span
                    key={i.id}
                    className="rounded-md border border-border px-2 py-0.5 text-muted-foreground"
                    title={i.note ?? undefined}
                  >
                    {name}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <div>
          {isSelf ? (
            <ProfileEditActions
              user={{
                username: user.username,
                name: user.name,
                bio: user.bio,
                image: user.image,
                roles: user.roles,
                mentorAvailable: user.mentorAvailable,
                mentorSeeking: user.mentorSeeking,
              }}
              links={links}
              schools={schools}
              influences={influences}
              lang={lang}
              dict={dict}
            />
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <FollowButton
                username={user.username}
                initialFollowing={viewerIsFollowing}
                dict={dict}
                loginHref={`/${lang}/login?callbackUrl=/${lang}/u/${user.username}`}
                isAuthed={isAuthed}
              />
              <StartDmButton
                username={user.username}
                isAuthed={isAuthed}
                loginHref={`/${lang}/login?callbackUrl=/${lang}/u/${user.username}`}
                lang={lang}
                dict={dict}
              />
            </div>
          )}
        </div>
      </header>

      {badges.length > 0 && (
        <section className="flex flex-wrap gap-1.5">
          {badges.map((b) => (
            <span
              key={b}
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                badgeColor(b),
              )}
            >
              {badgeLabel(b, dict)}
            </span>
          ))}
        </section>
      )}

      <section className="grid grid-cols-2 md:grid-cols-7 gap-3">
        <StatCell
          value={karma >= 0 ? `+${karma}` : `${karma}`}
          label={dict.profile.karma}
          highlight
          hint={dict.hints.karma}
        />
        <StatCell value={counters.interpretations} label={dict.profile.interpretations} />
        <StatCell value={counters.comments} label={dict.profile.comments} />
        <StatCell value={counters.entities} label={dict.profile.entities} />
        <StatCell value={counters.theories} label={dict.profile.theories} />
        <StatCell value={counters.followers} label={dict.profile.followers} />
        <StatCell value={counters.following} label={dict.profile.following} />
      </section>

      {favoriteTheory && (
        <section className="space-y-3">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
            {dict.profile.favoriteTheory}
          </h2>
          <Link
            href={`/${lang}/theories/${favoriteTheory.slug}`}
            className="inline-block"
          >
            <Card className="hover:border-foreground/40 transition-colors">
              <CardContent className="py-4 flex items-center gap-3">
                <span className="font-heading text-lg">
                  {favoriteTheory.name}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {favoriteTheory.count} {dict.profile.interpretations}
                </span>
              </CardContent>
            </Card>
          </Link>
        </section>
      )}

      {favoriteObjects.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
            {dict.profile.favoriteObjects}
          </h2>
          <div className="flex flex-wrap gap-2">
            {favoriteObjects.map((o) => {
              const symbol = getSymbol(o.metadata);
              return (
                <Link
                  key={o.id}
                  href={
                    o.theory
                      ? `/${lang}/theories/${o.theory.slug}/objects/${o.slug}`
                      : "#"
                  }
                  className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                >
                  {symbol && (
                    <span className="font-mono font-semibold">{symbol}</span>
                  )}
                  <span>{o.name}</span>
                  <span className="text-xs text-muted-foreground/70 font-mono">
                    × {o.count}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <Separator />

      <ProfilePublications
        username={user.username}
        isSelf={isSelf}
        publications={publications}
        lang={lang}
        dict={dict}
      />

      <ProfileProducts
        username={user.username}
        isSelf={isSelf}
        products={products}
        lang={lang}
        dict={dict}
      />

      <Separator />

      {topInterpretation && (
        <section className="space-y-3">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
            {dict.profile.topInterpretation}
          </h2>
          <InterpretationPreview lang={lang} dict={dict} item={topInterpretation} />
        </section>
      )}

      {controversialInterpretation && (
        <section className="space-y-3">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
            {dict.profile.controversialInterpretation}
          </h2>
          <InterpretationPreview
            lang={lang}
            dict={dict}
            item={controversialInterpretation}
          />
        </section>
      )}

      {theoriesAuthored.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            {dict.profile.theoriesAuthored}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {theoriesAuthored.map((t) => (
              <Link
                key={t.id}
                href={`/${lang}/theories/${t.slug}`}
                className="block"
              >
                <Card className="hover:border-foreground/40 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{t.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4 space-y-1">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {t.description}
                    </p>
                    <p className="text-xs text-muted-foreground/70 font-mono">
                      {t.forkCount} {dict.profile.forks}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          {dict.profile.recentInterpretations}
        </h2>
        {recentInterpretations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {dict.profile.noInterpretations}
          </p>
        ) : (
          <ul className="space-y-3">
            {recentInterpretations.map((i) => {
              const symbol = getSymbol(i.theoryObject?.metadata);
              return (
                <li
                  key={i.id}
                  className="border-l-2 border-border pl-4 py-1 space-y-1"
                >
                  <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                    <span className="font-mono">
                      {i.score >= 0 ? `+${i.score}` : i.score}
                    </span>
                    <span>·</span>
                    {i.entity && (
                      <>
                        <span>{dict.profile.inEntity}</span>
                        <Link
                          href={`/${lang}/entities/${i.entity.slug}`}
                          className="text-foreground hover:underline underline-offset-2"
                        >
                          {i.entity.title}
                        </Link>
                      </>
                    )}
                    {i.theoryObject && (
                      <>
                        <span>·</span>
                        <span className="font-mono inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-foreground/5">
                          {symbol && (
                            <span className="font-semibold">{symbol}</span>
                          )}
                          <span>{i.theoryObject.name}</span>
                        </span>
                      </>
                    )}
                    {i.theory && (
                      <>
                        <span>{dict.profile.inTheory}</span>
                        <Link
                          href={`/${lang}/theories/${i.theory.slug}`}
                          className="hover:text-foreground underline underline-offset-2 decoration-1 decoration-muted-foreground/40"
                        >
                          {i.theory.name}
                        </Link>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-foreground/90 line-clamp-2">
                    {i.body}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCell({
  value,
  label,
  highlight,
  hint,
}: {
  value: number | string;
  label: string;
  highlight?: boolean;
  hint?: string;
}) {
  return (
    <Card className={highlight ? "border-foreground/30" : ""}>
      <CardContent className="py-4 space-y-0.5">
        <div className="font-heading text-2xl font-semibold tabular-nums">
          {value}
        </div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider inline-flex items-center gap-1.5">
          {label}
          {hint && <HintTooltip text={hint} />}
        </div>
      </CardContent>
    </Card>
  );
}

function InterpretationPreview({
  lang,
  dict,
  item,
}: {
  lang: string;
  dict: ReturnType<typeof getDictionary>;
  item: {
    score: number;
    votesUp: number;
    votesDown: number;
    body: string;
    entity: { slug: string; title: string } | null;
    theory: { slug: string; name: string } | null;
    theoryObject: {
      slug: string;
      name: string;
      metadata: Record<string, unknown> | null;
    } | null;
  };
}) {
  const symbol = getSymbol(item.theoryObject?.metadata);
  return (
    <Card>
      <CardContent className="py-4 space-y-2">
        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
          <span className="font-mono font-semibold text-foreground">
            +{item.votesUp} / −{item.votesDown}
          </span>
          {item.entity && (
            <>
              <span>·</span>
              <span>{dict.profile.inEntity}</span>
              <Link
                href={`/${lang}/entities/${item.entity.slug}`}
                className="text-foreground hover:underline underline-offset-2"
              >
                {item.entity.title}
              </Link>
            </>
          )}
          {item.theoryObject && (
            <>
              <span>·</span>
              <span className="font-mono inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-foreground/5">
                {symbol && <span className="font-semibold">{symbol}</span>}
                <span>{item.theoryObject.name}</span>
              </span>
            </>
          )}
        </div>
        <p className="text-sm text-foreground/90 line-clamp-3 leading-relaxed">
          {item.body}
        </p>
      </CardContent>
    </Card>
  );
}
