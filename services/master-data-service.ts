import { DEFAULT_USER_ID } from "@/lib/constants";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export type MasterRow = Record<string, unknown>;

function client() {
  return createServiceRoleSupabaseClient();
}

function text(formData: FormData, key: string, fallback = "") {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function numberValue(formData: FormData, key: string, fallback = 0) {
  const value = Number(text(formData, key));
  return Number.isFinite(value) ? value : fallback;
}

function jsonArray(formData: FormData, key: string) {
  return text(formData, key)
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function listMasterRows(table: string, orderColumn = "created_at", ascending = false) {
  const supabase = client();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("user_id", DEFAULT_USER_ID)
    .order(orderColumn, { ascending })
    .limit(200);

  if (error || !data) return [];
  return data as MasterRow[];
}

export async function createKeyword(formData: FormData) {
  const supabase = client();
  if (!supabase) return;
  const keyword = text(formData, "keyword");
  if (!keyword) return;

  await supabase.from("keywords").insert({
    user_id: DEFAULT_USER_ID,
    keyword,
    category: text(formData, "category", "総合"),
    priority: numberValue(formData, "priority", 50),
    is_active: true,
    source: "manual"
  });
}

export async function createKeywordPack(formData: FormData) {
  const supabase = client();
  if (!supabase) return;
  const packName = text(formData, "pack_name");
  if (!packName) return;

  await supabase.from("keyword_packs").insert({
    user_id: DEFAULT_USER_ID,
    pack_name: packName,
    pack_type: text(formData, "pack_type", "custom"),
    keywords: jsonArray(formData, "keywords"),
    is_enabled: formData.get("is_enabled") === "on",
    memo: text(formData, "memo") || null
  });
}

export async function createPattern(formData: FormData) {
  const supabase = client();
  if (!supabase) return;
  const patternName = text(formData, "pattern_name");
  if (!patternName) return;

  await supabase.from("pattern_db").insert({
    user_id: DEFAULT_USER_ID,
    pattern_name: patternName,
    description: text(formData, "description") || null
  });
}

export async function createHook(formData: FormData) {
  const supabase = client();
  if (!supabase) return;
  const hookText = text(formData, "hook_text");
  if (!hookText) return;

  await supabase.from("hook_db").insert({
    user_id: DEFAULT_USER_ID,
    hook_text: hookText,
    hook_type: text(formData, "hook_type") || null
  });
}

export async function createImageMotif(formData: FormData) {
  const supabase = client();
  if (!supabase) return;
  const motifName = text(formData, "motif_name");
  if (!motifName) return;

  await supabase.from("image_motifs").insert({
    user_id: DEFAULT_USER_ID,
    motif_name: motifName,
    motif_type: text(formData, "motif_type") || null
  });
}

export async function createPostType(formData: FormData) {
  const supabase = client();
  if (!supabase) return;
  const postType = text(formData, "post_type");
  if (!postType) return;

  await supabase.from("post_type_db").insert({
    user_id: DEFAULT_USER_ID,
    post_type: postType,
    category: text(formData, "category") || null,
    target_ratio: numberValue(formData, "target_ratio", 0)
  });
}

export async function createBrandPersona(formData: FormData) {
  const supabase = client();
  if (!supabase) return;
  const brandName = text(formData, "brand_name", "占いThreads編集長");

  await supabase.from("brand_personas").insert({
    user_id: DEFAULT_USER_ID,
    brand_name: brandName,
    persona_name: text(formData, "persona_name") || null,
    tone: text(formData, "tone") || null,
    worldview: text(formData, "worldview") || null,
    target_reader: text(formData, "target_reader") || null,
    common_phrases: jsonArray(formData, "common_phrases"),
    banned_phrases: jsonArray(formData, "banned_phrases"),
    writing_rules: jsonArray(formData, "writing_rules"),
    cta_style: text(formData, "cta_style") || null,
    memo: text(formData, "memo") || null
  });
}

export async function createFortuneCalendarEvent(formData: FormData) {
  const supabase = client();
  if (!supabase) return;
  const date = text(formData, "date");
  const eventName = text(formData, "event_name");
  if (!date || !eventName) return;

  await supabase.from("fortune_calendar").insert({
    user_id: DEFAULT_USER_ID,
    date,
    event_name: eventName,
    event_type: text(formData, "event_type") || null,
    related_genre: text(formData, "related_genre") || null,
    importance_score: numberValue(formData, "importance_score", 50),
    suggested_angle: text(formData, "suggested_angle") || null,
    ng_angle: text(formData, "ng_angle") || null,
    memo: text(formData, "memo") || null
  });
}

export async function createCta(formData: FormData) {
  const supabase = client();
  if (!supabase) return;
  const ctaText = text(formData, "cta_text");
  if (!ctaText) return;

  await supabase.from("cta_db").insert({
    user_id: DEFAULT_USER_ID,
    cta_text: ctaText,
    cta_type: text(formData, "cta_type") || null,
    risk_level: text(formData, "risk_level", "low")
  });
}
