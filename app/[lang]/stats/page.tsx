import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

export default async function StatsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const data = await api.stats.global({ language: lang });
  const t = data.totals;
  const w = data.weekly;
  const labels = dict.stats.labels;

  const totalsRows: Array<{ label: string; value: number }> = [
    { label: labels.users, value: t.users },
    { label: labels.entities, value: t.entities },
    { label: labels.theories, value: t.theories },
    { label: labels.interpretations, value: t.interpretations },
    { label: labels.comments, value: t.comments },
    { label: labels.votes, value: t.votes },
    { label: labels.publications, value: t.publications },
    { label: labels.schools, value: t.schools },
    { label: labels.questions, value: t.questions },
    { label: labels.events, value: t.events },
  ];

  const weeklyRows: Array<{ label: string; value: number }> = [
    { label: labels.newInterpretations, value: w.newInterpretations },
    { label: labels.newComments, value: w.newComments },
    { label: labels.newUsers, value: w.newUsers },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {dict.stats.title}
        </h1>
        <p className="text-sm text-muted-foreground">{dict.stats.subtitle}</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
          {dict.stats.totalsHeading}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {totalsRows.map((r) => (
            <StatTile key={r.label} label={r.label} value={r.value} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
          {dict.stats.weeklyHeading}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {weeklyRows.map((r) => (
            <StatTile key={r.label} label={r.label} value={r.value} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="py-4 px-3 space-y-1 text-center">
        <div className="text-2xl font-semibold tabular-nums tracking-tight">
          {value.toLocaleString("ru-RU")}
        </div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </div>
      </CardContent>
    </Card>
  );
}
