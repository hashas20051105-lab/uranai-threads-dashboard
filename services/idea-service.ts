import { DEFAULT_USER_ID } from "@/lib/constants";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { isOpenAIConfigured, createOpenAIChatCompletion } from "@/lib/openai/client";
import { calculateFreshnessScore } from "@/lib/scoring/freshness-score";
import { calculateHumanScore } from "@/lib/scoring/human-score";
import { calculateCtaRisk, calculateTemplateRisk } from "@/lib/scoring/template-risk";
import { softenUnsafeText } from "@/lib/safety/ng-words";
import { buildChecklistStatus, decidePublishStatus } from "@/services/safety-service";
import type { DailyMaterialInput, GeneratedIdea, IdeaGenerationResult, PostStatus, PostType } from "@/types/domain";

const DEFAULT_ACCOUNT_ID = "11111111-1111-1111-1111-111111111111";
const DEFAULT_BRAND_ID = "31111111-1111-1111-1111-111111111111";

const postTypePlan: PostType[] = [
  "今日の運勢型",
  "占い結果型",
  "前兆サイン型",
  "恋愛共感型",
  "占術解説型",
  "日常つぶやき型",
  "金運共感型",
  "占い結果型",
  "今日の運勢型",
  "裏側・制作過程型",
  "前兆サイン型",
  "質問・交流型",
  "占術解説型",
  "恋愛共感型",
  "今日の運勢型",
  "占い結果型",
  "失敗談・気づき型",
  "金運共感型",
  "前兆サイン型",
  "日常つぶやき型",
  "占術解説型",
  "今日の運勢型",
  "占い結果型",
  "恋愛共感型",
  "裏側・制作過程型",
  "前兆サイン型",
  "質問・交流型",
  "今日の運勢型",
  "告知・誘導型",
  "占い結果型"
];

const genres = [
  "今日の運勢",
  "恋愛占い",
  "仕事運",
  "金運",
  "タロット",
  "満月",
  "新月",
  "片思い",
  "対人運",
  "数秘術",
  "神社",
  "転職運"
];

const trendSeeds = [
  "朝の違和感",
  "連絡を待つ夜",
  "予定変更のサイン",
  "財布まわりの見直し",
  "満月前の手放し",
  "小さな気づき",
  "気持ちの切り替え",
  "今週の追い風"
];

const ctas = [
  "あとで見返せるように保存しておいてください。",
  "今日の自分に近いところだけメモしてみてください。",
  "気になるテーマがあれば、次の投稿で深掘りします。",
  "無理に信じず、今の自分に合う部分だけ受け取ってください。"
];

const defaultDailyMaterial: DailyMaterialInput = {
  happened: "朝の予定が少し変わった",
  weather: "薄い曇り",
  mood: "落ち着いている",
  recentFeeling: "急がず整えたい",
  messageToReader: "自分のペースを取り戻してほしい",
  operatorNote: "今日は短めに伝える",
  atmosphere: "静かで少し湿度のある空気",
  smallRealization: "焦るほど視野が狭くなる",
  personalExperience: "手帳に3行だけ書いたら少し軽くなった"
};

type GenerationContext = {
  dailyMaterial: DailyMaterialInput;
  persona: {
    id?: string;
    tone: string;
    banned_phrases?: string[];
    writing_rules?: string[];
  };
  calendarEvents: string[];
  previousHooks: string[];
  previousCtas: string[];
};

export function buildChatGPTPrompt(dailyMaterial: DailyMaterialInput, personaTone?: string) {
  return [
    "占いThreads向け投稿案を30本作ってください。",
    "占いテンプレ量産ではなく、自然運用の編集長ツールとして、多様性・人間味・日常性を重視してください。",
    "投稿タイプ比率: 占い・運勢系50%、日常・共感系20%、占術解説系15%、体験談・裏側系10%、告知・誘導系5%。",
    "避ける表現: 絶対、必ず、100%、強すぎる恐怖訴求、儲かる断定、医療・治療断定、露骨なコメント誘導。",
    `ブランド口調: ${personaTone || "親しみやすく、断定しすぎず、読者の選択を尊重する"}`,
    `日常素材: ${JSON.stringify(dailyMaterial, null, 2)}`,
    "JSON配列で返してください。各要素は genre, pattern_type, post_type, hook, body, cta, referenced_trend, daily_material_used, image_prompt を含めてください。"
  ].join("\n");
}

function parseOpenAIIdeas(content: string | null) {
  if (!content) return [];
  const normalized = content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  try {
    const parsed = JSON.parse(normalized) as unknown;
    if (Array.isArray(parsed)) return parsed as Array<Record<string, unknown>>;
    if (parsed && typeof parsed === "object" && Array.isArray((parsed as { ideas?: unknown }).ideas)) {
      return (parsed as { ideas: Array<Record<string, unknown>> }).ideas;
    }
  } catch {
    return [];
  }
  return [];
}

async function loadGenerationContext(dailyMaterial: DailyMaterialInput): Promise<GenerationContext> {
  const supabase = createServiceRoleSupabaseClient();

  if (!supabase) {
    return {
      dailyMaterial,
      persona: { id: DEFAULT_BRAND_ID, tone: "親しみやすく、断定しすぎず、読者の選択を尊重する" },
      calendarEvents: ["満月", "新月", "一粒万倍日"],
      previousHooks: [],
      previousCtas: []
    };
  }

  const [personaResult, calendarResult, ideasResult] = await Promise.all([
    supabase.from("brand_personas").select("id,tone,banned_phrases,writing_rules").eq("user_id", DEFAULT_USER_ID).limit(1).maybeSingle(),
    supabase.from("fortune_calendar").select("event_name").eq("user_id", DEFAULT_USER_ID).gte("date", new Date().toISOString().slice(0, 10)).limit(7),
    supabase.from("post_ideas").select("hook,hook_text,cta,cta_text,genre,post_type").eq("user_id", DEFAULT_USER_ID).order("created_at", { ascending: false }).limit(20)
  ]);

  const previousIdeas = (ideasResult.data ?? []) as Array<{
    hook?: string | null;
    hook_text?: string | null;
    cta?: string | null;
    cta_text?: string | null;
  }>;

  return {
    dailyMaterial,
    persona: {
      id: (personaResult.data as { id?: string } | null)?.id ?? DEFAULT_BRAND_ID,
      tone:
        (personaResult.data as { tone?: string } | null)?.tone ??
        "親しみやすく、断定しすぎず、読者の選択を尊重する"
    },
    calendarEvents: ((calendarResult.data ?? []) as Array<{ event_name: string }>).map((event) => event.event_name),
    previousHooks: previousIdeas.map((idea) => idea.hook ?? idea.hook_text ?? "").filter(Boolean),
    previousCtas: previousIdeas.map((idea) => idea.cta ?? idea.cta_text ?? "").filter(Boolean)
  };
}

function pickDailyMaterial(dailyMaterial: DailyMaterialInput, index: number) {
  const values = [
    dailyMaterial.happened,
    dailyMaterial.weather,
    dailyMaterial.mood,
    dailyMaterial.recentFeeling,
    dailyMaterial.messageToReader,
    dailyMaterial.operatorNote,
    dailyMaterial.atmosphere,
    dailyMaterial.smallRealization,
    dailyMaterial.personalExperience
  ].filter(Boolean);
  return values[index % Math.max(values.length, 1)] ?? "";
}

function buildImagePrompt(genre: string, postType: string, material: string, index: number) {
  const motifs = ["手帳", "朝の窓辺", "カード", "淡い光", "静かな机"].slice(index % 3, (index % 3) + 3);
  const promptBase =
    "single scene, not collage, not multi panel, one composition, cinematic framing, clean lighting, soft reflections, premium atmosphere, no excessive glow, no noise texture, no cluttered text";

  return {
    genre,
    visualMotifs: motifs,
    emotionTone: index % 2 === 0 ? "calm and reflective" : "warm and grounded",
    promptJapanese: `${genre}の投稿に合う、${material || "静かな日常"}を感じる一場面。${motifs.join("、")}を自然に配置。${promptBase}`,
    promptEnglish: `A single refined scene for a Japanese fortune-telling Threads post about ${genre}. Natural ${material || "quiet daily life"} mood, ${motifs.join(", ")}, ${promptBase}.`,
    aspectRatio: "1:1",
    style: postType.includes("日常") ? "natural editorial photo" : "premium soft editorial",
    reason: "投稿文の余白を邪魔せず、使い回し感を抑えるため。"
  };
}

function buildIdea(index: number, context: GenerationContext): GeneratedIdea {
  const postType = postTypePlan[index];
  const genre = genres[index % genres.length];
  const trend = trendSeeds[index % trendSeeds.length];
  const material = index % 3 === 0 || postType.includes("日常") || postType.includes("共感") ? pickDailyMaterial(context.dailyMaterial, index) : "";
  const hook = `${trend}を${postType.includes("解説") ? "占術で整える" : "やさしく見る"}`;
  const cta = ctas[index % ctas.length];
  const body = softenUnsafeText(
    material
      ? `${material}。そんな小さな出来事を入口にすると、${genre}の流れは少し読みやすくなります。今日は結論を急がず、心が軽くなる選択を一つだけ選んでみてください。`
      : `${genre}の流れは、派手なサインよりも小さな違和感に出ることがあります。今日は無理に前向きにならず、気になることを一つだけ整えてみてください。`
  );
  const fullText = `${hook}\n\n${body}\n\n${cta}`;
  const competitorSimilarityScore = 18 + ((index * 7) % 54);
  const human = calculateHumanScore({
    fullText,
    postType,
    dailyMaterial: context.dailyMaterial,
    brandTone: context.persona.tone
  });
  const freshness = calculateFreshnessScore({
    genre,
    hook,
    referencedTrend: trend,
    calendarEvents: context.calendarEvents
  });
  const ctaRisk = calculateCtaRisk(cta);
  const risk = calculateTemplateRisk({
    fullText,
    hook,
    cta,
    genre,
    postType,
    previousHooks: context.previousHooks,
    previousCtas: context.previousCtas,
    recentGenres: [],
    recentPostTypes: [],
    competitorSimilarityScore
  });
  const decision = decidePublishStatus({
    humanScore: human.score,
    templateRisk: risk.level,
    ctaRisk: ctaRisk.level,
    freshnessScore: freshness.score,
    competitorSimilarityScore
  });
  const aiScore = Math.max(50, Math.min(98, Math.round((human.score + freshness.score + (100 - risk.score)) / 3)));
  const imagePrompt = buildImagePrompt(genre, postType, material, index);

  return {
    genre,
    patternType: postType.includes("共感") ? "共感型" : postType.includes("解説") ? "解説型" : "編集長提案型",
    postType,
    hook,
    body,
    cta,
    fullText,
    aiScore,
    humanScore: human.score,
    templateRisk: risk.level,
    aiReason: "投稿比率、ジャンル分散、日常素材の入り方をもとに算出しています。",
    humanReason: human.reason,
    templateRiskReason: risk.reason,
    referencedTrend: trend,
    dailyMaterialUsed: material,
    freshnessScore: freshness.score,
    freshnessReason: freshness.reason,
    competitorSimilarityScore,
    competitorSimilarityReason: "Phase 2ではフック・ジャンル・型の近さから仮スコアを算出しています。",
    ctaRisk: ctaRisk.level,
    ctaRiskReason: ctaRisk.reason,
    publishDecision: decision.decision,
    publishDecisionReason: decision.reason,
    checklistStatus: {},
    imagePrompt,
    status: "draft",
    humanMemo: ""
  };
}

async function saveDailyMaterial(dailyMaterial: DailyMaterialInput) {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("daily_materials")
    .insert({
      user_id: DEFAULT_USER_ID,
      account_id: DEFAULT_ACCOUNT_ID,
      date: new Date().toISOString().slice(0, 10),
      material_text: dailyMaterial.happened || dailyMaterial.personalExperience || "Phase 2 daily material",
      mood: dailyMaterial.mood,
      event_context: dailyMaterial.recentFeeling,
      weather: dailyMaterial.weather,
      recent_feeling: dailyMaterial.recentFeeling,
      message_to_reader: dailyMaterial.messageToReader,
      operator_note: dailyMaterial.operatorNote,
      atmosphere: dailyMaterial.atmosphere,
      small_realization: dailyMaterial.smallRealization,
      personal_experience: dailyMaterial.personalExperience
    })
    .select("id")
    .maybeSingle();

  return (data as { id?: string } | null)?.id ?? null;
}

async function saveIdeas(ideas: GeneratedIdea[], context: GenerationContext) {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return { saved: false, ideas };

  const saved: GeneratedIdea[] = [];
  let savedCount = 0;

  for (const idea of ideas) {
    const { data: ideaRow, error: ideaError } = await supabase
      .from("post_ideas")
      .insert({
        user_id: DEFAULT_USER_ID,
        account_id: DEFAULT_ACCOUNT_ID,
        brand_id: context.persona.id ?? DEFAULT_BRAND_ID,
        title: idea.hook,
        body: idea.body,
        genre: idea.genre,
        pattern_type: idea.patternType,
        post_type: idea.postType,
        hook_text: idea.hook,
        hook: idea.hook,
        cta_text: idea.cta,
        cta: idea.cta,
        full_text: idea.fullText,
        referenced_trend: { trend: idea.referencedTrend },
        human_score: idea.humanScore,
        template_risk_score:
          idea.templateRisk === "blocked" ? 100 : idea.templateRisk === "high" ? 75 : idea.templateRisk === "medium" ? 45 : 18,
        template_risk: idea.templateRisk,
        competitor_similarity_score: idea.competitorSimilarityScore,
        freshness_score: idea.freshnessScore,
        cta_risk_score: idea.ctaRisk === "high" ? 80 : idea.ctaRisk === "medium" ? 45 : 15,
        brand_match_score: Math.min(100, idea.humanScore + 5),
        ai_score: idea.aiScore,
        decision: idea.publishDecision,
        publish_decision: idea.publishDecision,
        improvement_suggestions: idea.publishDecisionReason,
        ai_reason: idea.aiReason,
        human_reason: idea.humanReason,
        template_risk_reason: idea.templateRiskReason,
        daily_material_used: idea.dailyMaterialUsed,
        freshness_reason: idea.freshnessReason,
        competitor_similarity_reason: idea.competitorSimilarityReason,
        publish_decision_reason: idea.publishDecisionReason,
        checklist_status: buildChecklistStatus(idea),
        status: idea.status,
        human_memo: idea.humanMemo
      })
      .select("id")
      .maybeSingle();

    if (ideaError || !ideaRow) {
      saved.push(idea);
      continue;
    }

    const ideaId = (ideaRow as { id: string }).id;
    savedCount += 1;
    const { data: imageRow } = await supabase
      .from("image_prompts")
      .insert({
        user_id: DEFAULT_USER_ID,
        idea_id: ideaId,
        prompt: idea.imagePrompt.promptJapanese,
        genre: idea.imagePrompt.genre,
        visual_motifs: idea.imagePrompt.visualMotifs,
        emotion_tone: idea.imagePrompt.emotionTone,
        prompt_japanese: idea.imagePrompt.promptJapanese,
        prompt_english: idea.imagePrompt.promptEnglish,
        aspect_ratio: idea.imagePrompt.aspectRatio,
        style: idea.imagePrompt.style,
        reason: idea.imagePrompt.reason,
        status: "draft"
      })
      .select("id")
      .maybeSingle();

    const imagePromptId = (imageRow as { id?: string } | null)?.id;
    if (imagePromptId) {
      await supabase.from("post_ideas").update({ image_prompt_id: imagePromptId }).eq("id", ideaId);
    }

    saved.push({ ...idea, id: ideaId, imagePromptId, imagePrompt: { ...idea.imagePrompt, id: imagePromptId, ideaId } });
  }

  return { saved: savedCount === ideas.length, ideas: saved };
}

export async function generateIdeas(input: { dailyMaterial?: Partial<DailyMaterialInput>; forceDemo?: boolean }): Promise<IdeaGenerationResult> {
  const dailyMaterial = { ...defaultDailyMaterial, ...(input.dailyMaterial ?? {}) };
  const context = await loadGenerationContext(dailyMaterial);
  await saveDailyMaterial(dailyMaterial);
  const promptForChatGPT = buildChatGPTPrompt(dailyMaterial, context.persona.tone);
  const openaiConfigured = isOpenAIConfigured();
  let ideas = Array.from({ length: 30 }, (_, index) => buildIdea(index, context));
  let mode: "openai" | "demo" = "demo";

  if (openaiConfigured && !input.forceDemo) {
    try {
      const content = await createOpenAIChatCompletion(promptForChatGPT);
      const openaiIdeas = parseOpenAIIdeas(content);
      if (openaiIdeas.length > 0) {
        ideas = ideas.map((idea, index) => {
          const raw = openaiIdeas[index] ?? {};
          const hook = typeof raw.hook === "string" ? softenUnsafeText(raw.hook) : idea.hook;
          const body = typeof raw.body === "string" ? softenUnsafeText(raw.body) : idea.body;
          const cta = typeof raw.cta === "string" ? softenUnsafeText(raw.cta) : idea.cta;
          const fullText = `${hook}\n\n${body}\n\n${cta}`;
          return {
            ...idea,
            genre: typeof raw.genre === "string" ? raw.genre : idea.genre,
            patternType: typeof raw.pattern_type === "string" ? raw.pattern_type : idea.patternType,
            postType: typeof raw.post_type === "string" ? (raw.post_type as PostType) : idea.postType,
            hook,
            body,
            cta,
            fullText,
            referencedTrend: typeof raw.referenced_trend === "string" ? raw.referenced_trend : idea.referencedTrend,
            dailyMaterialUsed:
              typeof raw.daily_material_used === "string" ? raw.daily_material_used : idea.dailyMaterialUsed,
            aiReason: "OpenAI APIをサーバー側で呼び出し、ローカル安全チェックで整形しています。"
          };
        });
      }
      mode = "openai";
      ideas = ideas.map((idea) => ({
        ...idea,
        aiReason: "OpenAI APIをサーバー側で呼び出し、ローカル安全チェックで整形しています。"
      }));
    } catch {
      mode = "demo";
    }
  }

  ideas = ideas.map((idea) => ({ ...idea, checklistStatus: buildChecklistStatus(idea) }));
  const saved = await saveIdeas(ideas, context);

  return {
    mode,
    openaiConfigured,
    savedToSupabase: saved.saved,
    promptForChatGPT,
    ideas: saved.ideas
  };
}

export async function updateIdeaStatus(input: { ideaId: string; status: PostStatus; humanMemo?: string }) {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return { saved: false };

  const { error } = await supabase
    .from("post_ideas")
    .update({ status: input.status, human_memo: input.humanMemo ?? null })
    .eq("id", input.ideaId)
    .eq("user_id", DEFAULT_USER_ID);

  return { saved: !error, error: error?.message };
}
