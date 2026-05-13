"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  lang: Locale;
  dict: Dictionary;
};

export function RegisterForm({ lang, dict }: Props) {
  const router = useRouter();
  const register = trpc.auth.register.useMutation();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register.mutateAsync({
        email,
        username,
        password,
        name: name.trim() ? name.trim() : undefined,
        language: lang,
      });
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!result || result.error) {
        setError(dict.auth.registeredButLoginFailed);
        return;
      }
      router.push(`/${lang}`);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка";
      setError(msg);
    } finally {
      setLoading(false);
    }
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
          <Label htmlFor="username">{dict.auth.username}</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ivan_methodologist"
            pattern="[a-zA-Z0-9_]+"
            minLength={3}
            maxLength={32}
            required
          />
          <p className="text-xs text-muted-foreground">
            {dict.auth.usernameHint}
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">
            {dict.auth.displayName}{" "}
            <span className="text-muted-foreground/60">
              ({dict.auth.optional})
            </span>
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Иван Иванов"
            maxLength={128}
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
            autoComplete="new-password"
            minLength={8}
            required
          />
          <p className="text-xs text-muted-foreground">
            {dict.auth.passwordHint}
          </p>
        </div>
        {error && (
          <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
        )}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "..." : dict.auth.submitRegister}
        </Button>
      </form>

      <p className="text-sm text-center text-muted-foreground">
        {dict.auth.haveAccount}{" "}
        <Link
          href={`/${lang}/login`}
          className="text-foreground underline underline-offset-4 hover:opacity-80"
        >
          {dict.nav.login}
        </Link>
      </p>
    </div>
  );
}
