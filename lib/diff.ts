/**
 * Line-by-line diff using the classic LCS algorithm.
 * Returns an array of { kind, text } where kind is "same" | "add" | "del".
 *
 * Good enough for short prose; for very long bodies the O(N*M) memory
 * cost would matter, but interpretation/publication bodies are bounded
 * at 5k/50k chars, which is fine here.
 */
export type DiffPart = {
  kind: "same" | "add" | "del";
  text: string;
};

export function diffLines(oldText: string, newText: string): DiffPart[] {
  const a = oldText.split("\n");
  const b = newText.split("\n");
  const n = a.length;
  const m = b.length;

  // LCS table
  const lcs: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(0),
  );
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (a[i - 1] === b[j - 1]) {
        lcs[i]![j] = lcs[i - 1]![j - 1]! + 1;
      } else {
        lcs[i]![j] = Math.max(lcs[i - 1]![j]!, lcs[i]![j - 1]!);
      }
    }
  }

  const parts: DiffPart[] = [];
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      parts.push({ kind: "same", text: a[i - 1]! });
      i--;
      j--;
    } else if (lcs[i - 1]![j]! >= lcs[i]![j - 1]!) {
      parts.push({ kind: "del", text: a[i - 1]! });
      i--;
    } else {
      parts.push({ kind: "add", text: b[j - 1]! });
      j--;
    }
  }
  while (i > 0) {
    parts.push({ kind: "del", text: a[i - 1]! });
    i--;
  }
  while (j > 0) {
    parts.push({ kind: "add", text: b[j - 1]! });
    j--;
  }
  return parts.reverse();
}
