/**
 * Extract @username mentions from a text body.
 * Returns unique lowercased usernames.
 */
export function extractMentions(body: string): string[] {
  const re = /(?:^|[^a-zA-Z0-9_])@([a-zA-Z0-9_]{3,32})\b/g;
  const set = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    set.add(m[1]!);
  }
  return Array.from(set);
}
