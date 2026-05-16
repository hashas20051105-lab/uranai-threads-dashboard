export function extractHook(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const firstLine = trimmed.split(/\r?\n/).find((line) => line.trim().length > 0)?.trim();
  return (firstLine || trimmed).slice(0, 40);
}
