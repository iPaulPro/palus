export const formatWithZeroSubscript = (
  numStr: string,
  maxSubscript = 16
): string => {
  numStr = numStr.trim();

  if (!numStr.includes(".")) return Intl.NumberFormat().format(Number(numStr));

  // Capture sign, integer part and fractional part
  const signMatch = numStr.match(/^([+-]?)(.*)$/);
  const sign = signMatch ? signMatch[1] : "";
  const unsigned = sign ? numStr.slice(sign.length) : numStr;

  const [intPartRaw, fracPartRaw = ""] = unsigned.split(".");
  const intPart =
    intPartRaw === "" ? "0" : Intl.NumberFormat().format(Number(intPartRaw));
  const fracPart = fracPartRaw;

  // No fractional digits -> return as-is
  if (fracPart.length === 0) return `${sign}${intPart}`;

  // Count consecutive zeros after the first fractional digit
  // We keep the first fractional digit, then compress repeating zeros that follow it.
  let zeroCount = 0;
  let i = 1; // start after the first fractional digit
  while (i < fracPart.length && fracPart[i] === "0") {
    zeroCount++;
    i++;
  }

  // If there are no repeating zeros after the first fractional digit, return original
  if (zeroCount <= 5) return `${sign}${intPart}.${fracPart.substring(0, 6)}`;

  // If fractional part is all zeros (e.g. "1.0000"), we can just return the integer part
  if (zeroCount === fracPart.length - 1) return `${sign}${intPart}`;

  // Respect the requested maximum subscript support
  if (zeroCount > maxSubscript)
    return `${sign}${intPart}.${fracPart.substring(0, 6)}`;

  // Map digits to Unicode subscript characters (0-9)
  const subDigits: Record<string, string> = {
    "0": "₀",
    "1": "₁",
    "2": "₂",
    "3": "₃",
    "4": "₄",
    "5": "₅",
    "6": "₆",
    "7": "₇",
    "8": "₈",
    "9": "₉"
  };

  const toSubscript = (n: number): string =>
    String(n)
      .split("")
      .map((d) => subDigits[d] ?? d)
      .join("");

  const firstDigit = fracPart[0];
  const rest = fracPart.slice(1 + zeroCount); // everything after the compressed zeros

  return `${sign}${intPart}.${firstDigit}${toSubscript(zeroCount + 1)}${rest}`;
};
