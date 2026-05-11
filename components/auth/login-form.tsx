"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  lang: Locale;
  dict: Dictionary;
  googleAvailable: boolean;
};

export function LoginForm({ lang, dict, googleAvailable }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params?.get("callbackUrl") ?? `/${lang}`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (!result || result.error) {
      setError(dict.auth.invalidCredentials);
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  async function onGoogle() {
    await signIn("google", { callbackUrl });
  }

  return (
    <div className="space-y-5">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="email">{dict.auth.email}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{dict.auth.password}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            minLength={8}
            required
          />
        </div>
        {error && (
          <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
        )}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "..." : dict.auth.submitLogin}
        </Button>
      </form>

      {googleAvailable && (
        <>
          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 -translate-x-1/2 -top-2 px-2 bg-card text-xs text-muted-foreground uppercase">
              {dict.auth.or}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onGoogle}
          >
            {dict.auth.google}
          </Button>
        </>
      )}

      <p className="text-sm text-center text-muted-foreground">
        {dict.auth.noAccount}{" "}
        <Link
          href={`/${lang}/register`}
          className="text-foreground underline underline-offset-4 hover:opacity-80"
        >
          {dict.nav.register}
        </Link>
      </p>
    </div>
  );
}
