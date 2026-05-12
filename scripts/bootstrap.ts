import { runExpandSeed } from "./expand-seed";
import { runMigrations } from "./migrate";
import { runSeed } from "./seed";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.warn(
      "[bootstrap] DATABASE_URL is not set — skipping migrations and seed",
    );
    return;
  }

  try {
    await runMigrations();
  } catch (err) {
    console.error("[bootstrap] migrations failed (continuing anyway):", err);
    return;
  }

  try {
    await runSeed();
  } catch (err) {
    console.error("[bootstrap] seed failed (continuing anyway):", err);
  }

  try {
    await runExpandSeed();
  } catch (err) {
    console.error("[bootstrap] expand-seed failed (continuing anyway):", err);
  }
}

main().catch((err) => {
  console.error("[bootstrap] non-fatal error:", err);
  // never exit non-zero — let next start run regardless
});
