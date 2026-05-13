import { Resend } from "resend";

type Lang = "ru" | "en";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "Socionics Semantics <onboarding@resend.dev>";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.AUTH_URL ??
  "https://semantic-forum-production.up.railway.app";

let client: Resend | null = null;
function getClient(): Resend | null {
  if (!RESEND_API_KEY) return null;
  if (!client) client = new Resend(RESEND_API_KEY);
  return client;
}

export function isEmailConfigured(): boolean {
  return Boolean(RESEND_API_KEY);
}

type WelcomeEmailInput = {
  to: string;
  username: string;
  name?: string | null;
  lang?: Lang;
};

/**
 * Send the welcome email after registration. Returns true on success,
 * false on any failure (incl. no API key configured). Never throws —
 * callers should not block registration on email delivery.
 */
export async function sendWelcomeEmail(
  input: WelcomeEmailInput,
): Promise<boolean> {
  const client = getClient();
  if (!client) return false;
  const lang: Lang = input.lang ?? "ru";
  const greetingName = input.name?.trim() || input.username;

  const subject =
    lang === "ru"
      ? "Добро пожаловать в Соционическую Семантику"
      : "Welcome to Socionics Semantics";

  try {
    await client.emails.send({
      from: EMAIL_FROM,
      to: input.to,
      subject,
      html: renderHtml(lang, greetingName, input.username),
      text: renderText(lang, greetingName, input.username),
    });
    return true;
  } catch (err) {
    console.error("[welcome-email] send failed:", err);
    return false;
  }
}

function renderHtml(lang: Lang, name: string, username: string): string {
  const url = (path: string) => `${APP_URL}${path}`;
  if (lang === "ru") {
    return `<!doctype html>
<html lang="ru"><body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.55; color: #111; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h1 style="font-size: 22px; margin: 0 0 12px;">Привет, ${escapeHtml(name)} 👋</h1>
  <p>Спасибо, что зарегистрировался(-ась) на Соционической Семантике — платформе, где спорят аргументами, а не ТИМами.</p>
  <p>Вот несколько мест, куда стоит заглянуть в первую очередь:</p>
  <ul style="padding-left: 18px;">
    <li><a href="${url(`/ru/u/${username}`)}">Заполни профиль</a> — расскажи о себе, школе, влияниях.</li>
    <li><a href="${url("/ru/entities")}">Каталог сущностей</a> — слова, личности, материалы для интерпретации.</li>
    <li><a href="${url("/ru/theories/classical-model-a")}">Классическая Модель А</a> — стартовая теория с 89 объектами.</li>
    <li><a href="${url("/ru/groups")}">Группы</a> — Reddit-стиль сообщества по интересам.</li>
    <li><a href="${url("/ru/docs/api")}">HTTP API</a> — если ты строишь бота или AI-агента.</li>
  </ul>
  <p style="margin-top: 24px;">После входа в шапке появится тур по фичам и чек-лист первых шагов — рекомендуем пройти.</p>
  <p style="margin-top: 32px; color: #777; font-size: 13px;">Это автоматическое письмо, отвечать на него не нужно. Если ты не регистрировался — просто проигнорируй.</p>
</body></html>`;
  }
  return `<!doctype html>
<html lang="en"><body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.55; color: #111; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h1 style="font-size: 22px; margin: 0 0 12px;">Hi ${escapeHtml(name)} 👋</h1>
  <p>Thanks for signing up to Socionics Semantics — a platform where the community argues by reasoning, not by TIM labels.</p>
  <p>Good first stops:</p>
  <ul style="padding-left: 18px;">
    <li><a href="${url(`/en/u/${username}`)}">Fill out your profile</a> — say a bit about yourself, your school, influences.</li>
    <li><a href="${url("/en/entities")}">Entity catalog</a> — words, people, materials to interpret.</li>
    <li><a href="${url("/en/theories/classical-model-a")}">Classical Model A</a> — the seed theory with 89 objects.</li>
    <li><a href="${url("/en/groups")}">Groups</a> — Reddit-style interest communities.</li>
    <li><a href="${url("/en/docs/api")}">HTTP API</a> — if you're building a bot or AI agent.</li>
  </ul>
  <p style="margin-top: 24px;">After you sign in, the header will offer a quick feature tour and a first-steps checklist — both worth a minute.</p>
  <p style="margin-top: 32px; color: #777; font-size: 13px;">Automated message, no need to reply. If you didn't sign up, just ignore.</p>
</body></html>`;
}

function renderText(lang: Lang, name: string, username: string): string {
  const url = (path: string) =>
    `${APP_URL}${path}`;
  if (lang === "ru") {
    return [
      `Привет, ${name}!`,
      ``,
      `Спасибо, что зарегистрировался(-ась) на Соционической Семантике — платформе, где спорят аргументами, а не ТИМами.`,
      ``,
      `Вот несколько мест, куда стоит заглянуть в первую очередь:`,
      ``,
      `  - Заполни профиль: ${url(`/ru/u/${username}`)}`,
      `  - Каталог сущностей: ${url("/ru/entities")}`,
      `  - Классическая Модель А: ${url("/ru/theories/classical-model-a")}`,
      `  - Группы: ${url("/ru/groups")}`,
      `  - HTTP API: ${url("/ru/docs/api")}`,
      ``,
      `После входа в шапке появится тур по фичам и чек-лист первых шагов.`,
      ``,
      `— Соционическая Семантика`,
    ].join("\n");
  }
  return [
    `Hi ${name}!`,
    ``,
    `Thanks for signing up to Socionics Semantics — a platform where the community argues by reasoning, not by TIM labels.`,
    ``,
    `Good first stops:`,
    ``,
    `  - Fill out your profile: ${url(`/en/u/${username}`)}`,
    `  - Entity catalog: ${url("/en/entities")}`,
    `  - Classical Model A: ${url("/en/theories/classical-model-a")}`,
    `  - Groups: ${url("/en/groups")}`,
    `  - HTTP API: ${url("/en/docs/api")}`,
    ``,
    `After you sign in, the header will offer a quick feature tour and a first-steps checklist.`,
    ``,
    `— Socionics Semantics`,
  ].join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
