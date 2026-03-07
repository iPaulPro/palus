export function parseLocaleNumber(value: string): number {
  const num = Number(value);
  if (!Number.isNaN(num)) {
    return num;
  }

  const locale = navigator.language;
  const format = new Intl.NumberFormat(locale);
  const parts = format.formatToParts(-12345.6);
  const numerals = Array.from({ length: 10 }).map((_, i) => format.format(i));
  const index = new Map(numerals.map((d, i) => [d, i]));

  const minusSign = new RegExp(
    `[${parts.find((d) => d.type === "minusSign")?.value}]`
  );
  const group = new RegExp(
    `[${parts.find((d) => d.type === "group")?.value}]`,
    "g"
  );
  const decimal = new RegExp(
    `[${parts.find((d) => d.type === "decimal")?.value}]`
  );
  const numeral = new RegExp(`[${numerals.join("")}]`, "g");
  const indexFn = (d: string) => String(index.get(d));

  const DIRECTION_MARK = /\u061c|\u200e/g;

  const parsedValue = value
    .trim()
    .replace(DIRECTION_MARK, "")
    .replace(group, "")
    .replace(decimal, ".")
    .replace(numeral, indexFn)
    .replace(minusSign, "-");
  console.log(
    "parseLocaleNumber: locale =",
    locale,
    "value =",
    value,
    "parsedValue =",
    parsedValue
  );

  return Number(parsedValue);
}
