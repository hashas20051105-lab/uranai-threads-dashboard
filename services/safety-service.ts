import type { GeneratedIdea, PublishDecision, TemplateRiskLevel } from "@/types/domain";

export function decidePublishStatus(input: {
  humanScore: number;
  templateRisk: TemplateRiskLevel;
  ctaRisk: TemplateRiskLevel;
  freshnessScore: number;
  competitorSimilarityScore: number;
}): { decision: PublishDecision; reason: string } {
  if (input.templateRisk === "blocked" || input.ctaRisk === "blocked") {
    return { decision: "投稿しない", reason: "過度な断定や危険表現があり、投稿対象から外します。" };
  }

  if (input.templateRisk === "high" || input.competitorSimilarityScore >= 75) {
    return { decision: "保留推奨", reason: "テンプレ危険度または競合類似度が高いため、角度の作り直しが必要です。" };
  }

  if (input.humanScore >= 76 && input.freshnessScore >= 70 && input.ctaRisk === "low") {
    return { decision: "投稿推奨", reason: "自然さ、鮮度、CTAの控えめさが揃っています。" };
  }

  return { decision: "修正後投稿推奨", reason: "大枠は使えますが、日常素材やCTAの軽さを調整してください。" };
}

export function buildChecklistStatus(idea: Pick<GeneratedIdea, "templateRisk" | "ctaRisk" | "humanScore" | "competitorSimilarityScore">) {
  return {
    human_approved_required: true,
    template_risk_allowed: idea.templateRisk === "low" || idea.templateRisk === "medium",
    cta_risk_allowed: idea.ctaRisk === "low" || idea.ctaRisk === "medium",
    competitor_similarity_allowed: idea.competitorSimilarityScore < 75,
    human_score_enough: idea.humanScore >= 65,
    threads_api_not_used: true
  };
}
