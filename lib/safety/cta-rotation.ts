export function extractCtaFromText(text: string) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return lines.at(-1) ?? "";
}

export function checkConsecutiveCta(currentCta: string, latestCta?: string | null) {
  if (!currentCta || !latestCta) {
    return { repeated: false, message: "直近CTAとの重複はありません。" };
  }

  const normalize = (value: string) => value.replace(/\s+/g, "").replace(/[。、,.!！?？]/g, "");
  const repeated = normalize(currentCta) === normalize(latestCta);
  return {
    repeated,
    message: repeated ? "直近予約と同じCTAが連続しています。" : "直近予約とCTAが重複していません。"
  };
}
