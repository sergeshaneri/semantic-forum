import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

const APP_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://semantic-forum-production.up.railway.app";

type EmbedType =
  | "entity"
  | "interpretation"
  | "theory"
  | "publication"
  | "school"
  | "poll";

function isEmbedType(t: string): t is EmbedType {
  return [
    "entity",
    "interpretation",
    "theory",
    "publication",
    "school",
    "poll",
  ].includes(t);
}

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  if (!isEmbedType(type)) notFound();

  try {
    if (type === "entity") {
      const e = await api.entity.getBySlug({ slug: id, language: "ru" });
      const ent = e.entity;
      const href = `${APP_ORIGIN}/ru/entities/${ent.slug}`;
      return (
        <EmbedCard
          title={ent.title}
          subtitle={ent.kind}
          body={ent.descriptionWiki ?? ""}
          href={href}
          footer={`${e.interpretations.length} интерпретаций`}
        />
      );
    }

    if (type === "theory") {
      const data = await api.theory.getBySlug({ slug: id, language: "ru" });
      const t = data.theory;
      const href = `${APP_ORIGIN}/ru/theories/${t.slug}`;
      return (
        <EmbedCard
          title={t.name}
          subtitle={t.isSeed ? "Сид" : "Теория"}
          body={t.description}
          href={href}
          footer={`${data.objects.length} объектов`}
        />
      );
    }

    if (type === "poll") {
      const data = await api.poll.getBySlug({ slug: id, language: "ru" });
      const p = data.poll;
      const href = `${APP_ORIGIN}/ru/polls/${p.slug}`;
      return (
        <EmbedCard
          title={p.question}
          subtitle="Опрос"
          body={p.description ?? ""}
          href={href}
          footer={`${p.totalVotes} голосов`}
        />
      );
    }

    if (type === "school") {
      const data = await api.school.getBySlug({ slug: id, language: "ru" });
      const s = data.school;
      const href = `${APP_ORIGIN}/ru/schools/${s.slug}`;
      return (
        <EmbedCard
          title={s.name}
          subtitle={s.founderName ? `Основатель: ${s.founderName}` : "Школа"}
          body={s.description ?? ""}
          href={href}
          footer={`${data.sources.length} источников`}
        />
      );
    }

    // type === "publication" or "interpretation" — these need composite IDs,
    // so embeds are best surfaced from owning slug paths. Show generic card.
    notFound();
  } catch {
    notFound();
  }
}

function EmbedCard({
  title,
  subtitle,
  body,
  href,
  footer,
}: {
  title: string;
  subtitle?: string;
  body?: string;
  href: string;
  footer?: string;
}) {
  return (
    <Link
      href={href}
      target="_top"
      className="block hover:no-underline"
    >
      <Card className="hover:border-foreground/40 transition-colors">
        <CardContent className="py-3 space-y-1.5">
          {subtitle && (
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
              {subtitle}
            </p>
          )}
          <h2 className="font-heading text-base font-medium leading-tight">
            {title}
          </h2>
          {body && (
            <p className="text-xs text-muted-foreground line-clamp-3">{body}</p>
          )}
          {footer && (
            <p className="text-[11px] text-muted-foreground/80 font-mono pt-1 border-t border-border/40">
              {footer}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
