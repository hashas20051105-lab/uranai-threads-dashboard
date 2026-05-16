import type { TemplateRiskLevel } from "@/types/domain";
import { cautionExpressions, findRiskyExpressions } from "@/lib/safety/ng-words";

type TemplateRiskInput = {
  fullText: string;
  hook: string;
  cta: string;
  genre: string;
  postType: string;
  previousHooks: string[];
  previousCtas: string[];
  recentGenres: string[];
  recentPostTypes: string[];
  competitorSimilarityScore: number;
};

export function calculateTemplateRisk(input: TemplateRiskInput): { level: TemplateRiskLevel; reason: string; score: number } {
  let score = 0;
  const reasons: string[] = [];
  const risky = findRiskyExpressions(input.fullText);

  if (input.previousHooks.includes(input.hook)) {
    score += 18;
    reasons.push("同じフックの使い回しがあります。");
  }
  if (input.previousCtas.includes(input.cta)) {
    score += 14;
    reasons.push("同じCTAが続きやすい状態です。");
  }
  if (input.recentGenres.slice(-2).every((genre) => genre === input.genre)) {
    score += 12;
    reasons.push("同じジャンルが続いています。");
  }
  if (input.recentPostTypes.slice(-2).every((postType) => postType === input.postType)) {
    score += 12;
    reasons.push("同じ投稿タイプが続いています。");
  }
  if (risky.length > 0) {
    score += risky.length * 16;
    reasons.push(`過度な表現があります: ${risky.join("、")}`);
  }
  if (cautionExpressions.some((word) => input.fullText.includes(word))) {
    score += 10;
    reasons.push("煽りに見えやすい表現があります。");
  }
  if (input.competitorSimilarityScore >= 70) {
    score += 24;
    reasons.push("競合類似度が高めです。");
  }
  if (/(です。.*です。.*です。)/.test(input.fullText)) {
    score += 6;
    reasons.push("文末表現がやや単調です。");
  }

  const level: TemplateRiskLevel = score >= 78 ? "blocked" : score >= 55 ? "high" : score >= 30 ? "medium" : "low";

  return {
    level,
    reason: reasons.join(" ") || "テンプレ乱発の兆候は低めです。",
    score
  };
}

export function calculateCtaRisk(cta: string): { level: TemplateRiskLevel; reason: string } {
  if (/受け取ります|コメントして|今すぐ/.test(cta)) {
    return { level: "high", reason: "露骨なコメント誘導や強いCTAに見える可能性があります。" };
  }
  if (/保存|メモ|見返/.test(cta)) {
    return { level: "low", reason: "保存・振り返り中心の控えめなCTAです。" };
  }
  return { level: "medium", reason: "CTAの意図は自然ですが、連続使用には注意してください。" };
}
