import type { DailyMaterialInput } from "@/types/domain";
import { findRiskyExpressions } from "@/lib/safety/ng-words";

type HumanScoreInput = {
  fullText: string;
  postType: string;
  dailyMaterial: DailyMaterialInput;
  brandTone?: string;
};

export function calculateHumanScore({ fullText, postType, dailyMaterial, brandTone }: HumanScoreInput) {
  let score = 45;
  const reasons: string[] = [];

  const hasDailyMaterial = Object.values(dailyMaterial).some((value) => value && fullText.includes(value.slice(0, 8)));
  if (hasDailyMaterial) {
    score += 12;
    reasons.push("日常素材が自然に混ざっています。");
  }

  if (/(少し|ふと|今日は|最近|朝|夜|気づき|違和感)/.test(fullText)) {
    score += 10;
    reasons.push("日常描写や感情の入り口があります。");
  }

  if (/(かもしれません|してみて|大丈夫|整える|振り返る)/.test(fullText)) {
    score += 10;
    reasons.push("押し付けが少ない語尾です。");
  }

  if (fullText.length >= 90 && fullText.length <= 220) {
    score += 8;
    reasons.push("短すぎず長すぎない具体性があります。");
  }

  if (postType !== "占い結果型") {
    score += 6;
    reasons.push("占い結果だけに寄らない構成です。");
  }

  if (brandTone && /断定しすぎず|尊重|親しみ/.test(brandTone)) {
    score += 5;
    reasons.push("ブランド人格の距離感と合っています。");
  }

  const risky = findRiskyExpressions(fullText);
  if (risky.length > 0) {
    score -= risky.length * 10;
    reasons.push(`強い表現を弱める余地があります: ${risky.join("、")}`);
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    reason: reasons.join(" ") || "自然さは標準的です。"
  };
}
