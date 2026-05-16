import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth/admin-session";

export async function GET() {
  const cookieStore = await cookies();
  const authenticated = await verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  return NextResponse.json({
    authenticated,
    protectedMode: true,
    adminPasswordConfigured: Boolean(process.env.ADMIN_PASSWORD),
    adminSessionSecretConfigured: Boolean(process.env.ADMIN_SESSION_SECRET)
  });
}
