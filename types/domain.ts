export type PostStatus = "draft" | "adopted" | "needs_edit" | "rejected" | "reserved";

export type TemplateRiskLevel = "low" | "medium" | "high" | "blocked";

export type PublishDecision = "投稿推奨" | "修正後投稿推奨" | "保留推奨" | "投稿しない";

export type PostType =
  | "占い結果型"
  | "今日の運勢型"
  | "前兆サイン型"
  | "恋愛共感型"
  | "金運共感型"
  | "日常つぶやき型"
  | "占術解説型"
  | "裏側・制作過程型"
  | "失敗談・気づき型"
  | "質問・交流型"
  | "告知・誘導型";

export type DailyMaterialInput = {
  happened: string;
  weather: string;
  mood: string;
  recentFeeling: string;
  messageToReader: string;
  operatorNote: string;
  atmosphere: string;
  smallRealization: string;
  personalExperience: string;
};

export type ImagePrompt = {
  id?: string;
  ideaId?: string;
  genre: string;
  visualMotifs: string[];
  emotionTone: string;
  promptJapanese: string;
  promptEnglish: string;
  aspectRatio: string;
  style: string;
  reason: string;
};

export type GeneratedIdea = {
  id?: string;
  genre: string;
  patternType: string;
  postType: PostType;
  hook: string;
  body: string;
  cta: string;
  fullText: string;
  aiScore: number;
  humanScore: number;
  templateRisk: TemplateRiskLevel;
  aiReason: string;
  humanReason: string;
  templateRiskReason: string;
  referencedTrend: string;
  dailyMaterialUsed: string;
  freshnessScore: number;
  freshnessReason: string;
  competitorSimilarityScore: number;
  competitorSimilarityReason: string;
  ctaRisk: TemplateRiskLevel;
  ctaRiskReason: string;
  publishDecision: PublishDecision;
  publishDecisionReason: string;
  checklistStatus: Record<string, boolean>;
  imagePrompt: ImagePrompt;
  imagePromptId?: string;
  status: PostStatus;
  humanMemo: string;
};

export type IdeaGenerationResult = {
  mode: "openai" | "demo";
  openaiConfigured: boolean;
  savedToSupabase: boolean;
  promptForChatGPT: string;
  ideas: GeneratedIdea[];
};

export type BuzzDataSource = "manual" | "csv" | "demo" | "api";

export type DataConfidenceLevel = "high" | "medium" | "low";

export type BuzzImportInput = {
  post_url?: string;
  author_username?: string;
  post_text: string;
  posted_at?: string;
  like_count?: number;
  reply_count?: number;
  repost_count?: number;
  quote_count?: number;
  view_count?: number;
  memo?: string;
};

export type BuzzPost = {
  id: string;
  postUrl: string | null;
  authorUsername: string | null;
  postText: string;
  postedAt: string | null;
  likeCount: number;
  replyCount: number;
  repostCount: number;
  quoteCount: number;
  viewCount: number;
  engagementTotal: number;
  buzzScore: number;
  recencyBonus: number;
  elapsedHours: number;
  detectedGenre: string;
  patternType: string;
  postType: string;
  hookText: string | null;
  visualMotifs: string[];
  aiSummary: string | null;
  aiReason: string | null;
  dataSource: BuzzDataSource;
  dataConfidence: DataConfidenceLevel;
  missingFields: string[];
  memo: string | null;
  createdAt: string;
};

export type ThreadsApiStatus = "connected" | "error" | "not_configured";

export type ThreadsApiStatusResult = {
  ok: boolean;
  status: ThreadsApiStatus;
  checkedAt: string;
  userIdConfigured: boolean;
  accessTokenConfigured: boolean;
  maskedUserId: string | null;
  message?: string;
};

export type ThreadsCollectResult = {
  ok: boolean;
  status: "collected" | "fallback_required" | "not_configured" | "error";
  checkedAt: string;
  since: string;
  until: string;
  keywordCount: number;
  fetchedCount: number;
  savedCount: number;
  skippedCount: number;
  errorCount: number;
  lastError: string | null;
  fallbackMessage: string | null;
};

export type BuzzImportResult = {
  savedCount: number;
  failedCount: number;
  posts: BuzzPost[];
  errors: string[];
};

export type ReservationPostType = "TEXT" | "IMAGE" | "VIDEO" | "THREAD";

export type ReservationStatus = "draft" | "pending_approval" | "scheduled" | "cancelled" | "posted" | "error";

export type PrePublishCheckStatus = "OK" | "注意" | "要修正" | "予約不可";

export type PrePublishCheckItem = {
  key: string;
  label: string;
  status: PrePublishCheckStatus;
  message: string;
};

export type PrePublishCheckResult = {
  overallStatus: PrePublishCheckStatus;
  canReserve: boolean;
  items: PrePublishCheckItem[];
  blockingReasons: string[];
};

export type ReservationCandidateIdea = {
  id: string;
  accountId: string | null;
  genre: string;
  postType: string;
  patternType: string | null;
  hook: string;
  cta: string;
  fullText: string;
  status: PostStatus;
  templateRisk: TemplateRiskLevel;
  humanScore: number;
  competitorSimilarityScore: number;
  publishDecision: PublishDecision | string;
};

export type Reservation = {
  id: string;
  ideaId: string | null;
  accountId: string | null;
  scheduledAt: string;
  postType: ReservationPostType;
  text: string;
  imageUrl: string | null;
  videoUrl: string | null;
  threadGroupId: string | null;
  threadOrder: number | null;
  status: ReservationStatus;
  approvedByHuman: boolean;
  approvedAt: string | null;
  postedAt: string | null;
  threadsPostId: string | null;
  errorMessage: string | null;
  retryCount: number;
  lastAttemptedAt: string | null;
  lastErrorType: string | null;
  precheckResult: PrePublishCheckResult | null;
  createdAt: string;
  idea: {
    genre: string | null;
    postType: string | null;
    templateRisk: string | null;
    humanScore: number | null;
  } | null;
};

export type PublishCheckResult = PrePublishCheckResult & {
  canPublish: boolean;
};

export type PublishTargetPreview = {
  reservationId: string;
  scheduledAt: string;
  postType: ReservationPostType;
  text: string;
  imageUrl: string | null;
  videoUrl: string | null;
  threadGroupId: string | null;
  threadOrder: number | null;
  finalCheck: PublishCheckResult;
};

export type PublishActionResult = {
  ok: boolean;
  mode: "dry_run" | "publish";
  reservationId?: string;
  checkedAt: string;
  target?: PublishTargetPreview;
  threadsPostId?: string | null;
  status?: ReservationStatus | "skipped";
  error?: string;
};

export type PublishDueResult = {
  ok: boolean;
  mode: "dry_run" | "publish";
  checkedAt: string;
  targetCount: number;
  publishedCount: number;
  skippedCount: number;
  errorCount: number;
  results: PublishActionResult[];
};

export type InsightSource = "api" | "manual";

export type InsightMetricInput = {
  view_count?: number | null;
  like_count?: number | null;
  reply_count?: number | null;
  repost_count?: number | null;
  quote_count?: number | null;
  memo?: string | null;
};

export type PostInsight = {
  id: string;
  reservationId: string | null;
  ideaId: string | null;
  threadsPostId: string | null;
  collectedAt: string;
  hoursAfterPost: number | null;
  viewCount: number;
  likeCount: number;
  replyCount: number;
  repostCount: number;
  quoteCount: number;
  engagementTotal: number;
  buzzScore: number;
  genre: string | null;
  patternType: string | null;
  postType: string | null;
  hook: string | null;
  cta: string | null;
  visualMotifs: string[];
  humanScore: number | null;
  templateRisk: string | null;
  dataSource: InsightSource;
  dataConfidence: string;
  missingFields: string[];
  text: string | null;
  postedAt: string | null;
};

export type InsightAggregate = {
  key: string;
  averageBuzzScore: number;
  averageEngagementTotal: number;
  count: number;
  replyRate: number;
  repostRate: number;
};

export type InsightDashboardData = {
  insights: PostInsight[];
  byGenre: InsightAggregate[];
  byPattern: InsightAggregate[];
  byPostType: InsightAggregate[];
  byHook: InsightAggregate[];
  byCta: InsightAggregate[];
  byMotif: InsightAggregate[];
  byTemplateRisk: InsightAggregate[];
  byHumanScore: InsightAggregate[];
  timeSeries: Array<{ label: string; buzzScore: number; engagementTotal: number; count: number }>;
};

export type InsightCollectResult = {
  ok: boolean;
  checkedAt: string;
  targetCount: number;
  savedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: string[];
};

export type ReportType = "daily" | "weekly";

export type SavedReport = {
  id: string;
  reportType: ReportType;
  reportDate: string;
  summary: string | null;
  topGenres: unknown[];
  topHooks: unknown[];
  topPatterns: unknown[];
  topPostTypes: unknown[];
  topMotifs: unknown[];
  templateRiskSummary: Record<string, unknown>;
  competitorRanking: unknown[];
  nextRecommendations: unknown[];
  chatgptPrompt: string | null;
  createdAt: string;
};

export type Experiment = {
  id: string;
  hypothesis: string;
  startDate: string | null;
  endDate: string | null;
  successMetric: string | null;
  result: string | null;
  learning: string | null;
  status: string;
  relatedReservationIds: string[];
  createdAt: string;
};

export type ReservationInput = {
  idea_id: string;
  account_id?: string | null;
  scheduled_at: string;
  post_type: ReservationPostType;
  text: string;
  image_url?: string | null;
  video_url?: string | null;
  thread_group_id?: string | null;
  thread_order?: number | null;
  approved_by_human: boolean;
};

export type DashboardTone = "good" | "warning" | "bad";

export type DashboardOperationStatus = "良好" | "注意" | "要確認" | "停止推奨";

export type DashboardHeaderSummary = {
  accountName: string;
  operationStatus: DashboardOperationStatus;
};

export type DashboardRecommendedIdea = {
  id: string;
  genre: string;
  title: string;
  aiScore: number;
  humanScore: number;
  templateRisk: "low" | "medium" | "high" | "blocked";
  templateRiskLabel: string;
  publishDecision: string;
  competitorSimilarityScore: number;
  freshnessScore: number;
  ctaRisk: string;
  brandMatchRate: number;
  status: string;
};

export type DashboardSummary = {
  isFallback: boolean;
  kpis: {
    totalCollectedPosts: number;
    averageBuzzScore: number | null;
    todayPostSlots: {
      used: number;
      limit: number;
    };
    postSuccessRate: number | null;
    averageHumanScore: number | null;
    templateRisk: "low" | "medium" | "high" | "blocked";
    templateRiskDistribution: Record<string, number>;
  };
  editorialCheck: {
    score: number;
    originality: DashboardTone;
    hookDiversity: DashboardTone;
    ctaNaturalness: DashboardTone;
    postInterval: DashboardTone;
    userPerspective: DashboardTone;
    details: Record<string, string>;
  };
  templateRiskSummary: {
    fortunePostRatio: number;
    sameCtaRate: number;
    similarPostCount: number;
    postTypeSkew: "low" | "medium" | "high";
    maxPostTypeRate: number;
  };
  brandPersona:
    | {
        isConfigured: true;
        tone: string;
        commonPhrases: string[];
        worldview: string;
        targetReader: string;
        bannedPhrases: string[];
        ctaStyle: string;
      }
    | {
        isConfigured: false;
      };
  safety: {
    apiStatus: string;
    tokenStatus: string;
    postInterval: string;
    duplicatePosts: string;
    ngWords: string;
    ctaDuplicate: string;
    overallStatus: DashboardOperationStatus;
  };
  recommendedIdeas: DashboardRecommendedIdea[];
  postTypeBalance: Array<{
    label: string;
    count: number;
    value: number;
    target: number;
    color: string;
  }>;
  fortuneCalendar: Array<{
    date: string;
    eventName: string;
    eventType: string;
    relatedGenre: string;
    importanceScore: number;
    suggestedAngle: string;
    ngAngle: string;
  }>;
  motifReuse: Array<{
    label: string;
    count: number;
    value: number;
    warningLevel: string;
    color: string;
  }>;
  quickStats: {
    totalFollowers: number | null;
    totalImpressions: number;
    reposts: number;
    likes: number;
    replies: number;
  };
  header: DashboardHeaderSummary;
  topPosts: Array<{
    rank: number;
    hook: string;
    author: string;
    genre: string;
    pattern: string;
    postType: string;
    buzzScore: number;
    likes: number;
    replies: number;
    confidence: number;
  }>;
  recommendedGenres: Array<{
    rank: number;
    name: string;
    score: number;
    reason: string;
  }>;
  hookRanking: Array<{
    rank: number;
    hook: string;
    uses: number;
    averageScore: number;
  }>;
  schedule: Array<{
    time: string;
    genre: string;
    title: string;
    status: string;
  }>;
  diagnostics: {
    safetyCheckCount: number;
    apiCredentialCount: number;
    recentErrorCount: number;
  };
};
