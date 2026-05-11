import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/lib/auth/auth";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const session = await auth();
  if (session?.user) redirect(`/${lang}`);

  const dict = getDictionary(lang);
  const googleAvailable = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="font-heading text-2xl">
            {dict.auth.loginTitle}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {dict.auth.loginSubtitle}
          </p>
        </CardHeader>
        <CardContent>
          <LoginForm
            lang={lang}
            dict={dict}
            googleAvailable={googleAvailable}
          />
        </CardContent>
      </Card>
    </div>
  );
}
