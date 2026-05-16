import { DEFAULT_USER_ID } from "@/lib/constants";
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { saveErrorLog } from "@/services/error-log-service";
import type { Experiment } from "@/types/domain";

type Row = Record<string, any>;

export async function listExperiments(): Promise<Experiment[]> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase.from("experiments").select("*").eq("user_id", DEFAULT_USER_ID).order("created_at", { ascending: false }).limit(100);
  return ((data ?? []) as Row[]).map(mapExperimentRow);
}

export async function createExperiment(input: Partial<Experiment>) {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase service role configuration is missing" };
  const { error } = await supabase.from("experiments").insert({
    user_id: DEFAULT_USER_ID,
    hypothesis: input.hypothesis || "新しい投稿実験",
    start_date: input.startDate || null,
    end_date: input.endDate || null,
    success_metric: input.successMetric || null,
    result: input.result || null,
    learning: input.learning || null,
    status: input.status || "draft",
    related_reservation_ids: input.relatedReservationIds ?? []
  });
  if (error) {
    await saveErrorLog({ source: "experiments", route: "services/experiment-service:create", errorType: "db_error", message: error.message });
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function updateExperiment(input: Partial<Experiment> & { id: string }) {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase service role configuration is missing" };
  const { error } = await supabase
    .from("experiments")
    .update({
      hypothesis: input.hypothesis,
      start_date: input.startDate || null,
      end_date: input.endDate || null,
      success_metric: input.successMetric || null,
      result: input.result || null,
      learning: input.learning || null,
      status: input.status || "draft",
      related_reservation_ids: input.relatedReservationIds ?? []
    })
    .eq("id", input.id)
    .eq("user_id", DEFAULT_USER_ID);
  if (error) {
    await saveErrorLog({ source: "experiments", route: "services/experiment-service:update", errorType: "db_error", message: error.message, details: { experiment_id: input.id } });
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

function mapExperimentRow(row: Row): Experiment {
  return {
    id: row.id,
    hypothesis: row.hypothesis,
    startDate: row.start_date ?? null,
    endDate: row.end_date ?? null,
    successMetric: row.success_metric ?? null,
    result: row.result ?? null,
    learning: row.learning ?? null,
    status: row.status ?? "draft",
    relatedReservationIds: Array.isArray(row.related_reservation_ids) ? row.related_reservation_ids.map(String) : [],
    createdAt: row.created_at
  };
}

