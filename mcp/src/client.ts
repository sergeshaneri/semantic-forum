/**
 * Thin wrapper around the platform's tRPC HTTP endpoints.
 * tRPC v11 uses superjson-encoded JSON: { json: <input> } in / out.
 */

const DEFAULT_BASE_URL =
  process.env.SOCIONICS_BASE_URL ??
  "https://semantic-forum-production.up.railway.app";

const API_KEY = process.env.SOCIONICS_API_KEY ?? "";

if (!API_KEY) {
  console.error(
    "[socionics-mcp] SOCIONICS_API_KEY env is not set. Mutations will fail.",
  );
}

type TrpcResponseOk<T> = {
  result: { data: { json: T } };
};
type TrpcResponseErr = {
  error: { json: { message?: string; code?: number } };
};

function isErr(r: unknown): r is TrpcResponseErr {
  return Boolean(r && typeof r === "object" && "error" in r);
}

export async function trpcQuery<T>(
  path: string,
  input: unknown,
): Promise<T> {
  const url = new URL(`/api/trpc/${path}`, DEFAULT_BASE_URL);
  url.searchParams.set("input", JSON.stringify({ json: input }));
  const res = await fetch(url.toString(), {
    headers: API_KEY
      ? { Authorization: `Bearer ${API_KEY}` }
      : undefined,
  });
  return parse<T>(res, path);
}

export async function trpcMutate<T>(
  path: string,
  input: unknown,
): Promise<T> {
  const url = new URL(`/api/trpc/${path}`, DEFAULT_BASE_URL);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
    },
    body: JSON.stringify({ json: input }),
  });
  return parse<T>(res, path);
}

async function parse<T>(res: Response, path: string): Promise<T> {
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new Error(`${path}: HTTP ${res.status} (non-JSON response)`);
  }
  if (!res.ok) {
    if (isErr(body)) {
      throw new Error(`${path}: ${body.error.json.message ?? res.statusText}`);
    }
    throw new Error(`${path}: HTTP ${res.status}`);
  }
  if (isErr(body)) {
    throw new Error(`${path}: ${body.error.json.message ?? "tRPC error"}`);
  }
  return (body as TrpcResponseOk<T>).result.data.json;
}

export const baseUrl = DEFAULT_BASE_URL;
