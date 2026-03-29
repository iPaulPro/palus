const trimify = (value: string): string | null =>
  value?.replace(/\n\n\s*\n/g, "\n\n")?.trim() ?? null;

export default trimify;
