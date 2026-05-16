import { NextResponse } from "next/server";
import { APP_TIMEZONE, DEFAULT_USER_ID } from "@/lib/constants";

export async function GET() {
  return NextResponse.json({
    ok: true,
    checkedAt: new Date().toISOString(),
    timezone: APP_TIMEZONE,
    defaultUserIdMode: DEFAULT_USER_ID === "00000000-0000-0000-0000-000000000000",
    environment: {
      supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      openAiApiKey: Boolean(process.env.OPENAI_API_KEY),
      threadsAppId: Boolean(process.env.THREADS_APP_ID),
      threadsAppSecret: Boolean(process.env.THREADS_APP_SECRET),
      threadsAccessToken: Boolean(process.env.THREADS_ACCESS_TOKEN),
      threadsUserId: Boolean(process.env.THREADS_USER_ID),
      cronSecret: Boolean(process.env.CRON_SECRET),
      adminPassword: Boolean(process.env.ADMIN_PASSWORD),
      adminSessionSecret: Boolean(process.env.ADMIN_SESSION_SECRET)
    }
  });
}
