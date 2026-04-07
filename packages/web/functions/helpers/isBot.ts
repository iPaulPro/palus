const BOT_UA =
  /bot\b|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|preview|fetch|curl|wget|applebot|mediapartners/i;

export function isBot(
  context: EventContext<unknown, any, Record<string, unknown>>
): boolean {
  const userAgent = context.request.headers.get("user-agent");
  if (!userAgent) return false;
  return BOT_UA.test(userAgent);
}
