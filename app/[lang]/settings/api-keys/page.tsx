import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ApiKeysManager } from "@/components/socionics/api-keys-manager";
import { auth } from "@/lib/auth/auth";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

export default async function ApiKeysSettingsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const session = await auth();
  if (!session?.user) {
    redirect(`/${lang}/login?callbackUrl=/${lang}/settings/api-keys`);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-6">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {dict.apiKeys.title}
        </h1>
        <p className="text-sm text-muted-foreground">{dict.apiKeys.subtitle}</p>
        <p>
          <Link
            href={`/${lang}/docs/api`}
            className="text-sm text-foreground underline underline-offset-2"
          >
            {dict.apiKeys.docsLink}
          </Link>
        </p>
      </header>

      <ApiKeysManager dict={dict} />
    </div>
  );
}
