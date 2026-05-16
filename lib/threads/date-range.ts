import { APP_TIMEZONE } from "@/lib/constants";

export function getPreviousDayJstRange(now = new Date()) {
  const jstNow = new Date(now.toLocaleString("en-US", { timeZone: APP_TIMEZONE }));
  const start = new Date(jstNow);
  start.setDate(jstNow.getDate() - 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  return {
    since: toIsoWithJstOffset(start),
    until: toIsoWithJstOffset(end)
  };
}

function toIsoWithJstOffset(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}+09:00`;
}
