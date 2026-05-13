import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DmThread } from "@/components/socionics/dm-thread";
import { auth } from "@/lib/auth/auth";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

export default async function MessageThreadPage({
  params,
}: {
  params: Promise<{ lang: string; conversationId: string }>;
}) {
  const { lang, conversationId } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const session = await auth();
  if (!session?.user) {
    redirect(
      `/${lang}/login?callbackUrl=/${lang}/messages/${conversationId}`,
    );
  }

  let data;
  try {
    data = await api.dm.thread({ conversationId });
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 space-y-4">
      <Link
        href={`/${lang}/messages`}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
      >
        {dict.dm.backToList}
      </Link>
      <DmThread
        conversationId={conversationId}
        initialMessages={data.messages}
        participants={data.participants}
        dict={dict}
      />
    </div>
  );
}
