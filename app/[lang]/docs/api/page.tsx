import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://semantic-forum-production.up.railway.app";

const CREATE_ENTITY_EXAMPLE = `curl -X POST ${BASE_URL}/api/trpc/entity.create \\
  -H "Authorization: Bearer ssk_<your-key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "json": {
      "kind": "word",
      "title": "Эмпатия",
      "slug": "empatiya",
      "descriptionWiki": "Нейтральное определение понятия эмпатии для коллективной интерпретации в разных теориях...",
      "language": "ru"
    }
  }'`;

const CREATE_INTERPRETATION_EXAMPLE = `curl -X POST ${BASE_URL}/api/trpc/interpretation.create \\
  -H "Authorization: Bearer ssk_<your-key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "json": {
      "entityId": "<entity-uuid>",
      "theoryId": "<theory-uuid>",
      "theoryObjectId": "<object-uuid>",
      "body": "В рамках Классической Модели А эмпатия раскрывается через..."
    }
  }'`;

const LIST_THEORIES_EXAMPLE = `curl "${BASE_URL}/api/trpc/theory.list?input=$(node -e 'console.log(encodeURIComponent(JSON.stringify({json:{language:\\"ru\\"}})))')" \\
  -H "Authorization: Bearer ssk_<your-key>"`;

const SEARCH_EXAMPLE = `curl "${BASE_URL}/api/trpc/search.global?input=$(node -e 'console.log(encodeURIComponent(JSON.stringify({json:{q:\\"эмпатия\\",language:\\"ru\\",limit:5}})))')"`;

const CREATE_PUBLICATION_EXAMPLE = `curl -X POST ${BASE_URL}/api/trpc/publication.create \\
  -H "Authorization: Bearer ssk_<your-key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "json": {
      "kind": "article",
      "title": "Заметки об эмпатии",
      "slug": "zametki-ob-empatii",
      "body": "## Введение\\n\\nЭто моя статья. См. [[Эмпатия]] и [[@anna_sociotyper]].",
      "language": "ru",
      "tags": ["этика", "сэ"]
    }
  }'`;

export default async function ApiDocsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <article className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {dict.apiDocs.title}
        </h1>
        <p className="text-sm text-muted-foreground">{dict.apiDocs.intro}</p>
        <p>
          <Link
            href={`/${lang}/settings/api-keys`}
            className="text-sm text-foreground underline underline-offset-2"
          >
            {dict.apiDocs.getKey}
          </Link>
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          {dict.apiDocs.authTitle}
        </h2>
        <p className="text-sm text-muted-foreground">{dict.apiDocs.authIntro}</p>
        <Code>{`Authorization: Bearer ssk_<your-key>`}</Code>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          {dict.apiDocs.formatTitle}
        </h2>
        <p className="text-sm text-muted-foreground">
          {dict.apiDocs.formatIntro}
        </p>
        <Card>
          <CardContent className="py-3 text-xs space-y-2 text-muted-foreground">
            <p>
              <strong className="text-foreground">Endpoint:</strong>{" "}
              <code>{BASE_URL}/api/trpc/&lt;router&gt;.&lt;method&gt;</code>
            </p>
            <p>
              <strong className="text-foreground">Mutation:</strong> POST с
              JSON-телом{" "}
              <code>{`{ "json": <input> }`}</code>
            </p>
            <p>
              <strong className="text-foreground">Query:</strong> GET с{" "}
              <code>
                ?input=&lt;encodeURIComponent(JSON.stringify(&#123;json:
                input&#125;))&gt;
              </code>
            </p>
            <p>
              <strong className="text-foreground">Ответ:</strong>{" "}
              <code>{`{ "result": { "data": { "json": <output> } } }`}</code>
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          {dict.apiDocs.examplesTitle}
        </h2>
        <p className="text-sm text-muted-foreground">
          {dict.apiDocs.examplesIntro}
        </p>

        <Example title="entity.create — создать сущность">
          {CREATE_ENTITY_EXAMPLE}
        </Example>

        <Example title="interpretation.create — добавить интерпретацию">
          {CREATE_INTERPRETATION_EXAMPLE}
        </Example>

        <Example title="publication.create — опубликовать статью">
          {CREATE_PUBLICATION_EXAMPLE}
        </Example>

        <Example title="theory.list — получить список теорий">
          {LIST_THEORIES_EXAMPLE}
        </Example>

        <Example title="search.global — поиск по платформе (без авторизации)">
          {SEARCH_EXAMPLE}
        </Example>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          Полезные эндпоинты
        </h2>
        <Card>
          <CardContent className="py-3 text-xs space-y-2 font-mono text-muted-foreground">
            <p>
              <span className="text-foreground">entity.create</span>,{" "}
              <span className="text-foreground">entity.list</span>,{" "}
              <span className="text-foreground">entity.getBySlug</span>
            </p>
            <p>
              <span className="text-foreground">theory.create</span>,{" "}
              <span className="text-foreground">theory.fork</span>,{" "}
              <span className="text-foreground">theory.list</span>,{" "}
              <span className="text-foreground">theory.getBySlug</span>
            </p>
            <p>
              <span className="text-foreground">theoryObject.create</span>,{" "}
              <span className="text-foreground">theoryObject.getBySlug</span>
            </p>
            <p>
              <span className="text-foreground">interpretation.create</span>,{" "}
              <span className="text-foreground">interpretation.update</span>
            </p>
            <p>
              <span className="text-foreground">comment.create</span>,{" "}
              <span className="text-foreground">vote.cast</span>
            </p>
            <p>
              <span className="text-foreground">publication.create</span>,{" "}
              <span className="text-foreground">publication.getBySlug</span>
            </p>
            <p>
              <span className="text-foreground">poll.create</span>,{" "}
              <span className="text-foreground">poll.vote</span>
            </p>
            <p>
              <span className="text-foreground">group.create</span>,{" "}
              <span className="text-foreground">group.createPost</span>,{" "}
              <span className="text-foreground">group.addComment</span>
            </p>
            <p>
              <span className="text-foreground">annotation.create</span>,{" "}
              <span className="text-foreground">annotation.list</span>
            </p>
            <p>
              <span className="text-foreground">tag.getBySlug</span>,{" "}
              <span className="text-foreground">search.global</span>,{" "}
              <span className="text-foreground">stats.global</span>
            </p>
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground">
          Полный список — в коде:{" "}
          <code>server/trpc/root.ts</code> +{" "}
          <code>server/trpc/routers/*</code>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          {dict.apiDocs.rateLimitTitle}
        </h2>
        <p className="text-sm text-muted-foreground">
          {dict.apiDocs.rateLimitNote}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          {dict.apiDocs.safetyTitle}
        </h2>
        <p className="text-sm text-muted-foreground">
          {dict.apiDocs.safetyNote}
        </p>
      </section>
    </article>
  );
}

function Example({
  title,
  children,
}: {
  title: string;
  children: string;
}) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-medium">{title}</h3>
      <Code>{children}</Code>
    </div>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="rounded-md border border-border bg-muted/40 p-3 text-xs overflow-x-auto">
      <code className="font-mono">{children}</code>
    </pre>
  );
}
