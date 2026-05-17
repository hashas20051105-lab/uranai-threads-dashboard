import { DEFAULT_USER_ID } from "@/lib/constants";
import { redactSecrets } from "@/lib/security/redact";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type ErrorLogInput = {
  source: string;
  route?: string;
  errorType: string;
  message: string;
  details?: Record<string, unknown>;
};

export async function saveErrorLog(input: ErrorLogInput) {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return;

  await supabase.from("error_logs").insert({
    user_id: DEFAULT_USER_ID,
    source: input.source,
    route: input.route ?? null,
    severity: "error",
    error_type: input.errorType,
    message: redactSecrets(input.message),
    details: sanitizeDetails(input.details ?? {})
  });
}

function sanitizeDetails(details: Record<string, unknown>) {
  const blocked = ["token", "access_token", "secret", "key", "authorization"];
  return Object.fromEntries(
    Object.entries(details).filter(([name]) => !blocked.some((blockedName) => name.toLowerCase().includes(blockedName)))
  );
}
