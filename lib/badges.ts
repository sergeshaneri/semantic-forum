import type { Dictionary } from "./i18n/dictionaries";

export type BadgeKey =
  | "first_interpretation"
  | "author_10"
  | "author_50"
  | "commentator_25"
  | "theorist"
  | "forked"
  | "voice"
  | "expert"
  | "mentor"
  | "creator";

type Stats = {
  interpretations: number;
  comments: number;
  entities: number;
  theories: number;
  karma: number;
  followers: number;
  mentorAvailable: boolean;
};

export function computeBadges(stats: Stats): BadgeKey[] {
  const badges: BadgeKey[] = [];
  if (stats.interpretations >= 1) badges.push("first_interpretation");
  if (stats.interpretations >= 10) badges.push("author_10");
  if (stats.interpretations >= 50) badges.push("author_50");
  if (stats.comments >= 25) badges.push("commentator_25");
  if (stats.theories >= 1) badges.push("theorist");
  if (stats.theories >= 2) badges.push("forked");
  if (stats.karma >= 50) badges.push("voice");
  if (stats.karma >= 250) badges.push("expert");
  if (stats.entities >= 5) badges.push("creator");
  if (stats.mentorAvailable) badges.push("mentor");
  return badges;
}

export function badgeLabel(key: BadgeKey, dict: Dictionary): string {
  return dict.badges.labels[key];
}

export function badgeColor(key: BadgeKey): string {
  switch (key) {
    case "first_interpretation":
      return "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30";
    case "author_10":
    case "author_50":
      return "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30";
    case "commentator_25":
      return "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30";
    case "theorist":
    case "forked":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
    case "voice":
    case "expert":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
    case "creator":
      return "bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/30";
    case "mentor":
      return "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30";
  }
}
