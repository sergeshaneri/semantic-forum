import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="font-heading text-2xl">
            {dict.auth.registerTitle}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {dict.auth.registerSubtitle}
          </p>
        </CardHeader>
        <CardContent>
          <RegisterForm lang={lang} dict={dict} />
        </CardContent>
      </Card>
    </div>
  );
}
