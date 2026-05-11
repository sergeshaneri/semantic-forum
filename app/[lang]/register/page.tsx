import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

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
        <CardContent className="space-y-5">
          <form className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{dict.auth.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                disabled
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{dict.auth.password}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                disabled
              />
            </div>
            <Button type="button" disabled className="w-full">
              {dict.auth.submitRegister}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            {dict.auth.placeholder}
          </p>

          <p className="text-sm text-center text-muted-foreground">
            {dict.auth.haveAccount}{" "}
            <Link
              href={`/${lang}/login`}
              className="text-foreground underline underline-offset-4 hover:opacity-80"
            >
              {dict.nav.login}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
