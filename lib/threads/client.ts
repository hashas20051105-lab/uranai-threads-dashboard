export type ThreadsKeywordSearchParams = {
  keyword: string;
  since: string;
  until: string;
  limit?: number;
};

export type ThreadsPublishPostType = "TEXT" | "IMAGE" | "VIDEO" | "THREAD";

export type ThreadsPublishInput = {
  postType: ThreadsPublishPostType;
  text: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
};

export type ThreadsPublishResult = {
  containerId: string;
  threadsPostId: string;
  requestSummary: Record<string, unknown>;
  responseSummary: Record<string, unknown>;
};

export type ThreadsInsightMetrics = {
  viewCount: number | null;
  likeCount: number | null;
  replyCount: number | null;
  repostCount: number | null;
  quoteCount: number | null;
  rawPayload: unknown;
};

const THREADS_API_BASE_URL = "https://graph.threads.net/v1.0";
const THREADS_OAUTH_BASE_URL = "https://threads.net/oauth/authorize";
const THREADS_OAUTH_TOKEN_URL = "https://graph.threads.net/oauth/access_token";
const THREADS_LONG_LIVED_TOKEN_URL = "https://graph.threads.net/access_token";

export function getThreadsEnvStatus() {
  const accessToken = process.env.THREADS_ACCESS_TOKEN;
  const userId = process.env.THREADS_USER_ID;

  return {
    accessToken,
    userId,
    accessTokenConfigured: Boolean(accessToken),
    userIdConfigured: Boolean(userId),
    maskedUserId: userId ? maskValue(userId) : null
  };
}

export function getThreadsRedirectUri() {
  return process.env.THREADS_REDIRECT_URI || "https://uranai-threads-dashboard.vercel.app/api/threads/callback";
}

export function buildThreadsAuthorizeUrl(state: string) {
  const appId = process.env.THREADS_APP_ID;
  if (!appId) {
    throw new ThreadsApiError("missing_env", "THREADS_APP_ID is missing");
  }

  const url = new URL(THREADS_OAUTH_BASE_URL);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", getThreadsRedirectUri());
  url.searchParams.set("scope", "threads_basic,threads_content_publish,threads_keyword_search,threads_manage_insights");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeThreadsCodeForToken(code: string) {
  const appId = process.env.THREADS_APP_ID;
  const appSecret = process.env.THREADS_APP_SECRET;
  if (!appId || !appSecret) {
    throw new ThreadsApiError("missing_env", "THREADS_APP_ID or THREADS_APP_SECRET is missing");
  }

  const body = new URLSearchParams();
  body.set("client_id", appId);
  body.set("client_secret", appSecret);
  body.set("grant_type", "authorization_code");
  body.set("redirect_uri", getThreadsRedirectUri());
  body.set("code", code);

  const shortLivedPayload = await fetchThreads(new URL(THREADS_OAUTH_TOKEN_URL), "threads_oauth_token", { method: "POST", body });
  const shortLivedToken = extractAccessToken(shortLivedPayload);
  const longLivedToken = await exchangeForLongLivedToken(shortLivedToken, appSecret);

  return {
    shortLived: summarizeTokenPayload(shortLivedPayload),
    longLived: summarizeTokenPayload(longLivedToken),
    longLivedAccessToken: extractAccessToken(longLivedToken)
  };
}

async function exchangeForLongLivedToken(shortLivedToken: string, appSecret: string) {
  const url = new URL(THREADS_LONG_LIVED_TOKEN_URL);
  url.searchParams.set("grant_type", "th_exchange_token");
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("access_token", shortLivedToken);
  return fetchThreads(url, "threads_long_lived_token");
}

export async function testThreadsConnection() {
  const env = getThreadsEnvStatus();
  if (!env.accessToken || !env.userId) {
    throw new ThreadsApiError("missing_env", "THREADS_ACCESS_TOKEN or THREADS_USER_ID is missing");
  }

  const url = new URL(`${THREADS_API_BASE_URL}/${env.userId}`);
  url.searchParams.set("fields", "id,username");
  url.searchParams.set("access_token", env.accessToken);
  return fetchThreads(url, "threads_test");
}

export async function keywordSearch(params: ThreadsKeywordSearchParams) {
  const env = getThreadsEnvStatus();
  if (!env.accessToken) {
    throw new ThreadsApiError("missing_env", "THREADS_ACCESS_TOKEN is missing");
  }

  const url = new URL(`${THREADS_API_BASE_URL}/keyword_search`);
  url.searchParams.set("q", params.keyword);
  url.searchParams.set("keyword", params.keyword);
  url.searchParams.set("since", params.since);
  url.searchParams.set("until", params.until);
  url.searchParams.set("limit", String(params.limit ?? 25));
  url.searchParams.set("access_token", env.accessToken);

  // TODO: Keep this isolated because Meta may change the official keyword_search
  // parameter names or response shape. Failures intentionally fall back to manual/CSV import.
  return fetchThreads(url, "threads_keyword_search");
}

export async function fetchThreadsMediaInsights(threadsPostId: string): Promise<ThreadsInsightMetrics> {
  const env = getThreadsEnvStatus();
  if (!env.accessToken) {
    throw new ThreadsApiError("missing_env", "THREADS_ACCESS_TOKEN is missing");
  }

  const url = new URL(`${THREADS_API_BASE_URL}/${threadsPostId}/insights`);
  url.searchParams.set("metric", "views,likes,replies,reposts,quotes");
  url.searchParams.set("access_token", env.accessToken);

  const payload = await fetchThreads(url, "threads_insights");
  return normalizeInsightPayload(payload);
}

export async function createTextContainer(text: string) {
  return createMediaContainer({ postType: "TEXT", text });
}

export async function createImageContainer(text: string, imageUrl: string) {
  return createMediaContainer({ postType: "IMAGE", text, imageUrl });
}

export async function createVideoContainer(text: string, videoUrl: string) {
  return createMediaContainer({ postType: "VIDEO", text, videoUrl });
}

export async function publishTextPost(text: string) {
  return publishThreadsPost({ postType: "TEXT", text });
}

export async function publishImagePost(text: string, imageUrl: string) {
  return publishThreadsPost({ postType: "IMAGE", text, imageUrl });
}

export async function publishVideoPost(text: string, videoUrl: string) {
  return publishThreadsPost({ postType: "VIDEO", text, videoUrl });
}

export async function publishThreadsPost(input: ThreadsPublishInput): Promise<ThreadsPublishResult> {
  const container = await createMediaContainer(input);
  const publishPayload = await publishContainer(container.id);
  const threadsPostId = extractId(publishPayload);

  return {
    containerId: container.id,
    threadsPostId,
    requestSummary: {
      post_type: input.postType,
      text_length: input.text.length,
      has_image_url: Boolean(input.imageUrl),
      has_video_url: Boolean(input.videoUrl)
    },
    responseSummary: {
      container_id: container.id,
      threads_post_id: threadsPostId
    }
  };
}

export async function createMediaContainer(input: ThreadsPublishInput): Promise<{ id: string; raw: unknown }> {
  const env = getThreadsEnvStatus();
  if (!env.accessToken || !env.userId) {
    throw new ThreadsApiError("missing_env", "THREADS_ACCESS_TOKEN or THREADS_USER_ID is missing");
  }

  const mediaType = input.postType === "THREAD" ? "TEXT" : input.postType;
  if (mediaType === "IMAGE" && !input.imageUrl) throw new ThreadsApiError("invalid_media_url", "image_url is required for IMAGE posts");
  if (mediaType === "VIDEO" && !input.videoUrl) throw new ThreadsApiError("invalid_media_url", "video_url is required for VIDEO posts");

  const body = new URLSearchParams();
  body.set("media_type", mediaType);
  body.set("text", input.text);
  body.set("access_token", env.accessToken);
  if (mediaType === "IMAGE" && input.imageUrl) body.set("image_url", input.imageUrl);
  if (mediaType === "VIDEO" && input.videoUrl) body.set("video_url", input.videoUrl);

  const url = new URL(`${THREADS_API_BASE_URL}/${env.userId}/threads`);
  const raw = await fetchThreads(url, "threads_create_container", { method: "POST", body });
  return { id: extractId(raw), raw };
}

export async function publishContainer(creationId: string) {
  const env = getThreadsEnvStatus();
  if (!env.accessToken || !env.userId) {
    throw new ThreadsApiError("missing_env", "THREADS_ACCESS_TOKEN or THREADS_USER_ID is missing");
  }

  const body = new URLSearchParams();
  body.set("creation_id", creationId);
  body.set("access_token", env.accessToken);

  const url = new URL(`${THREADS_API_BASE_URL}/${env.userId}/threads_publish`);
  return fetchThreads(url, "threads_publish", { method: "POST", body });
}

async function fetchThreads(url: URL, source: string, init: RequestInit = { method: "GET" }) {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ThreadsApiError(classifyStatus(response.status), extractMessage(payload, `${source} failed`), response.status, payload);
  }

  return payload;
}

function extractId(payload: unknown) {
  if (payload && typeof payload === "object") {
    const record = payload as { id?: unknown; post_id?: unknown };
    const id = record.id ?? record.post_id;
    if (typeof id === "string" && id.trim()) return id;
  }
  throw new ThreadsApiError("api_error", "Threads API response did not include an id", undefined, payload);
}

function extractAccessToken(payload: unknown) {
  if (payload && typeof payload === "object") {
    const token = (payload as { access_token?: unknown }).access_token;
    if (typeof token === "string" && token.trim()) return token;
  }
  throw new ThreadsApiError("api_error", "Threads API response did not include an access token", undefined, payload);
}

function summarizeTokenPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") return {};
  const record = payload as Record<string, unknown>;
  return {
    token_type: typeof record.token_type === "string" ? record.token_type : null,
    expires_in: typeof record.expires_in === "number" ? record.expires_in : null,
    permissions: Array.isArray(record.permissions) ? record.permissions : undefined,
    has_access_token: typeof record.access_token === "string" && record.access_token.length > 0
  };
}

function normalizeInsightPayload(payload: unknown): ThreadsInsightMetrics {
  return {
    viewCount: readMetric(payload, ["views", "view_count", "views_count"]),
    likeCount: readMetric(payload, ["likes", "like_count", "likes_count"]),
    replyCount: readMetric(payload, ["replies", "reply_count", "replies_count"]),
    repostCount: readMetric(payload, ["reposts", "repost_count", "reposts_count"]),
    quoteCount: readMetric(payload, ["quotes", "quote_count", "quotes_count"]),
    rawPayload: payload
  };
}

function readMetric(payload: unknown, names: string[]) {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  for (const name of names) {
    const direct = numberFromUnknown(record[name]);
    if (direct !== null) return direct;
  }

  const data = Array.isArray(record.data) ? record.data : [];
  for (const metric of data) {
    if (!metric || typeof metric !== "object") continue;
    const metricRecord = metric as Record<string, unknown>;
    const metricName = String(metricRecord.name ?? metricRecord.metric ?? "");
    if (!names.includes(metricName)) continue;
    const value = numberFromUnknown(metricRecord.value);
    if (value !== null) return value;
    const values = Array.isArray(metricRecord.values) ? metricRecord.values : [];
    const latest = values[values.length - 1] as Record<string, unknown> | undefined;
    const latestValue = latest ? numberFromUnknown(latest.value) : null;
    if (latestValue !== null) return latestValue;
  }

  return null;
}

function numberFromUnknown(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function extractMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = (payload as { error?: { message?: string } }).error;
    return error?.message ?? fallback;
  }
  return fallback;
}

function classifyStatus(status: number) {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 429) return "rate_limited";
  return "api_error";
}

function maskValue(value: string) {
  if (value.length <= 6) return "***";
  return `${value.slice(0, 3)}****${value.slice(-3)}`;
}

export class ThreadsApiError extends Error {
  constructor(
    public errorType: string,
    message: string,
    public status?: number,
    public details?: unknown
  ) {
    super(message);
  }
}
