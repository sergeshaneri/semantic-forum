# Socionics Semantics Platform

Платформа для аргументированных интерпретаций и теорий в соционике. См. план в `C:\Users\pc\.claude\plans\playful-puzzling-sparrow.md`.

## Стек

- Next.js 16 (App Router) · React 19
- tRPC 11 · Drizzle ORM · Postgres
- Auth.js v5 (NextAuth) — Credentials + Google
- Tailwind v4 · shadcn/ui · Zod 4
- Хостинг: Railway (web + Postgres add-on)

## Локальная разработка

### 1. Postgres

Поднять локально через Docker:

```powershell
docker run --name socionics-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=socionics -p 5432:5432 -d postgres:16
```

Без Docker — поставить Postgres 16 от postgresql.org и создать БД `socionics`.

### 2. Переменные окружения

```powershell
Copy-Item .env.example .env
npm run auth:secret
```

Заполнить `.env`:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/socionics
AUTH_SECRET=<сгенерировано auth:secret>
AUTH_URL=http://localhost:3000
AUTH_GOOGLE_ID=<из Google Cloud Console>
AUTH_GOOGLE_SECRET=<из Google Cloud Console>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Google OAuth:
1. console.cloud.google.com → Credentials → OAuth 2.0 Client ID (Web application)
2. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### 3. Миграции

```powershell
npm run db:generate    # генерирует SQL из schema.ts
npm run db:push        # применяет схему напрямую (быстро для dev)
# или
npm run db:migrate     # применяет миграции (для prod)
```

### 4. Dev-сервер

```powershell
npm run dev
```

Откроется на http://localhost:3000 → редирект на `/ru`.

### 5. Drizzle Studio

```powershell
npm run db:studio
```

GUI для просмотра БД на https://local.drizzle.studio.

## Структура

```
/app
  /[lang]              # ru | en (i18n через middleware)
  /api/auth/[...nextauth]
  /api/trpc/[trpc]
/server
  /db                  # Drizzle schema, миграции
  /trpc                # tRPC роутеры (бизнес-логика)
/lib
  /auth                # Auth.js config (split: Edge + Node)
  /i18n                # словари + конфиг локалей
  /trpc                # client provider + RSC caller
/components/ui         # shadcn компоненты
/seed                  # сид-данные (Классическая Модель А)
```

**Где живёт логика для мобилки:** в `/server/trpc/routers/*` — будущий Expo-клиент через `@trpc/client` бьёт в те же ручки.

## Деплой на Railway

1. Push в GitHub
2. railway.com → New Project → Deploy from GitHub repo
3. Add → Postgres
4. В переменных сервиса добавить `DATABASE_URL=${{ Postgres.DATABASE_URL }}`, `AUTH_SECRET`, `AUTH_GOOGLE_ID/SECRET`, `AUTH_URL=https://<your-domain>`, `NEXT_PUBLIC_APP_URL=https://<your-domain>`
5. Команда сборки: `npm run build`. Старт: `npm start`.
6. Применить миграции один раз: `railway run npm run db:migrate`

## Команды

| Команда | Назначение |
|---------|-----------|
| `npm run dev` | Dev-сервер |
| `npm run build` | Прод-сборка |
| `npm run start` | Запуск прод-сборки |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run db:generate` | Создать миграцию из изменений в schema.ts |
| `npm run db:migrate` | Применить миграции |
| `npm run db:push` | Применить схему напрямую (dev only) |
| `npm run db:studio` | GUI для БД |
| `npm run auth:secret` | Сгенерировать AUTH_SECRET |

## Что сейчас работает (MVP, этап 0)

- ✓ Скаффолд Next.js + tRPC + Drizzle + Auth.js
- ✓ Схема БД (User, Theory, TheoryObject, Entity, Interpretation, Comment, Vote, Citation, Tag)
- ✓ i18n routing (`/ru`, `/en`)
- ✓ Health-check tRPC ручки

## Что дальше (по плану)

- Сид «Классической Модели А» (ждём контент от пользователя)
- CRUD сущностей (Слова, Личности)
- CRUD теорий + форк
- CRUD интерпретаций + голосование
- Комментарии (Pro/Contra/Neutral)
- Цитаты классиков
- Карма, теги, профиль
