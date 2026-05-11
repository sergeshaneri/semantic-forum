import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function LoginPage({
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
            {dict.auth.loginTitle}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {dict.auth.loginSubtitle}
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
              {dict.auth.submitLogin}
            </Button>
          </form>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 -translate-x-1/2 -top-2 px-2 bg-card text-xs text-muted-foreground uppercase">
              {dict.auth.or}
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled
            className="w-full"
          >
            {dict.auth.google}
          </Button>

          <p className="text-xs text-muted-foreground text-center pt-2 leading-relaxed">
            {dict.auth.placeholder}
          </p>

          <p className="text-sm text-center text-muted-foreground">
            {dict.auth.noAccount}{" "}
            <Link
              href={`/${lang}/register`}
              className="text-foreground underline underline-offset-4 hover:opacity-80"
            >
              {dict.nav.register}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
