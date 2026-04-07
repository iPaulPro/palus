const LENS_API = "https://api.lens.xyz/graphql";

export async function lensQuery<TData, TVars extends Record<string, unknown>>(
  document: string,
  variables?: TVars
): Promise<TData> {
  const res = await fetch(LENS_API, {
    body: JSON.stringify({
      query: document,
      variables
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });

  if (!res.ok) {
    throw new Error(`Lens API error: ${res.status}`);
  }

  const json = (await res.json()) as { data: TData; errors?: unknown[] };

  if (json.errors?.length) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }

  return json.data;
}
