import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  FileText,
  Gauge,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wand2
} from "lucide-react";

export const dashboardKpis = [
  {
    label: "昨日の分析投稿",
    value: "184",
    unit: "件",
    change: "+11.4%",
    tone: "violet",
    icon: BarChart3
  },
  {
    label: "総エンゲージメント",
    value: "42,860",
    unit: "",
    change: "+8.7%",
    tone: "emerald",
    icon: TrendingUp
  },
  {
    label: "平均バズスコア",
    value: "712.6",
    unit: "",
    change: "+18.2pt",
    tone: "violet",
    icon: Gauge
  },
  {
    label: "本日の投稿枠",
    value: "2 / 5",
    unit: "使用中",
    change: "残り3件",
    tone: "amber",
    icon: CalendarDays
  },
  {
    label: "安全チェック",
    value: "96.8",
    unit: "%",
    change: "問題なし",
    tone: "emerald",
    icon: ShieldCheck
  },
  {
    label: "採用候補",
    value: "9",
    unit: "件",
    change: "要確認3件",
    tone: "rose",
    icon: FileText
  }
];

export const editorialChecks = [
  { label: "投稿タイプ分散", status: "OK", detail: "占い結果型に偏りすぎていません。" },
  { label: "日常素材", status: "確認", detail: "今日の短い体験メモを1件追加すると自然です。" },
  { label: "ブランド口調", status: "OK", detail: "やわらかく断定しすぎない語尾に揃っています。" },
  { label: "投稿しない判断", status: "OK", detail: "低鮮度の案を2件保留にしています。" }
];

export const templateRiskItems = [
  { label: "同じフックの連続", score: 22, level: "低" },
  { label: "同じCTAの連続", score: 34, level: "中" },
  { label: "過度な断定表現", score: 18, level: "低" },
  { label: "過去投稿との類似", score: 41, level: "中" }
];

export const brandPersona = {
  name: "静かな編集長",
  tone: "親しみやすく、結論を急がず、読者の選択を尊重する",
  reader: "恋愛、仕事、日々の迷いを軽く整理したい読者",
  cta: "保存、振り返り、コメント相談を控えめに促す",
  banned: ["絶対に叶う", "今すぐ受け取って", "100%当たる"]
};

export const safetyChecks = [
  { label: "API接続", value: "未接続", state: "Phase 4で実装" },
  { label: "本日の投稿上限", value: "2 / 5", state: "余裕あり" },
  { label: "最低投稿間隔", value: "90分", state: "OK" },
  { label: "NGワード", value: "0件", state: "OK" },
  { label: "連続CTA", value: "なし", state: "OK" },
  { label: "競合類似", value: "低", state: "OK" }
];

export const buzzPosts = [
  {
    rank: 1,
    hook: "朝の違和感を見逃さないための小さな観察",
    author: "@daily_oracle_note",
    genre: "今日の運勢",
    pattern: "前兆サイン型",
    buzzScore: 1284,
    likes: 3842,
    replies: 412,
    reposts: 268,
    confidence: 0.86
  },
  {
    rank: 2,
    hook: "片思い中に心が疲れた日に読む3つの視点",
    author: "@quiet_love_tarot",
    genre: "片思い",
    pattern: "恋愛共感型",
    buzzScore: 1211,
    likes: 3518,
    replies: 389,
    reposts: 241,
    confidence: 0.82
  },
  {
    rank: 3,
    hook: "仕事運が整う前に起きやすい予定変更",
    author: "@work_fortune_lab",
    genre: "仕事運",
    pattern: "占術解説型",
    buzzScore: 1138,
    likes: 3260,
    replies: 302,
    reposts: 226,
    confidence: 0.81
  },
  {
    rank: 4,
    hook: "満月前に手放したい考え方の癖",
    author: "@moon_cycle_words",
    genre: "満月",
    pattern: "日常つぶやき型",
    buzzScore: 1064,
    likes: 2988,
    replies: 255,
    reposts: 218,
    confidence: 0.78
  },
  {
    rank: 5,
    hook: "復縁を焦らない日のセルフチェック",
    author: "@relationship_cards",
    genre: "復縁",
    pattern: "質問・交流型",
    buzzScore: 997,
    likes: 2610,
    replies: 314,
    reposts: 176,
    confidence: 0.76
  },
  {
    rank: 6,
    hook: "金運を下げない財布まわりの見直し",
    author: "@money_flow_note",
    genre: "金運",
    pattern: "開運アドバイス型",
    buzzScore: 943,
    likes: 2401,
    replies: 210,
    reposts: 201,
    confidence: 0.74
  },
  {
    rank: 7,
    hook: "タロットで読む今週の小さな追い風",
    author: "@tarot_room_jp",
    genre: "タロット",
    pattern: "占い結果型",
    buzzScore: 901,
    likes: 2290,
    replies: 198,
    reposts: 188,
    confidence: 0.73
  },
  {
    rank: 8,
    hook: "人間関係で距離を置くサイン",
    author: "@social_fortune",
    genre: "対人運",
    pattern: "前兆サイン型",
    buzzScore: 878,
    likes: 2184,
    replies: 230,
    reposts: 164,
    confidence: 0.71
  },
  {
    rank: 9,
    hook: "新月前に決めすぎないほうがいいこと",
    author: "@newmoon_journal",
    genre: "新月",
    pattern: "占術解説型",
    buzzScore: 844,
    likes: 2050,
    replies: 181,
    reposts: 170,
    confidence: 0.72
  },
  {
    rank: 10,
    hook: "数秘で見る5月後半の整えどころ",
    author: "@number_path",
    genre: "数秘術",
    pattern: "占い結果型",
    buzzScore: 819,
    likes: 1988,
    replies: 176,
    reposts: 166,
    confidence: 0.7
  },
  {
    rank: 11,
    hook: "連絡を待つ夜に心を守る考え方",
    author: "@love_pause_note",
    genre: "恋愛占い",
    pattern: "恋愛共感型",
    buzzScore: 792,
    likes: 1864,
    replies: 221,
    reposts: 141,
    confidence: 0.69
  },
  {
    rank: 12,
    hook: "転職運が動く前の小さな違和感",
    author: "@career_oracle",
    genre: "転職運",
    pattern: "前兆サイン型",
    buzzScore: 760,
    likes: 1765,
    replies: 188,
    reposts: 136,
    confidence: 0.68
  },
  {
    rank: 13,
    hook: "神社参拝で願いを整理する短いメモ",
    author: "@jinja_days",
    genre: "神社",
    pattern: "日常つぶやき型",
    buzzScore: 731,
    likes: 1688,
    replies: 142,
    reposts: 151,
    confidence: 0.67
  },
  {
    rank: 14,
    hook: "相性を決めつけないための見方",
    author: "@pair_reading",
    genre: "相性占い",
    pattern: "占術解説型",
    buzzScore: 704,
    likes: 1599,
    replies: 169,
    reposts: 132,
    confidence: 0.66
  },
  {
    rank: 15,
    hook: "手相で見る最近の疲れサイン",
    author: "@palm_note",
    genre: "手相",
    pattern: "占術解説型",
    buzzScore: 683,
    likes: 1514,
    replies: 130,
    reposts: 129,
    confidence: 0.65
  },
  {
    rank: 16,
    hook: "オラクルカードで読む今日の余白",
    author: "@oracle_memo",
    genre: "オラクルカード",
    pattern: "占い結果型",
    buzzScore: 661,
    likes: 1455,
    replies: 124,
    reposts: 122,
    confidence: 0.64
  },
  {
    rank: 17,
    hook: "結婚運を急がず整える週末習慣",
    author: "@future_partner",
    genre: "結婚運",
    pattern: "日常つぶやき型",
    buzzScore: 638,
    likes: 1380,
    replies: 119,
    reposts: 118,
    confidence: 0.63
  },
  {
    rank: 18,
    hook: "九星気学で見る移動前の注意点",
    author: "@kyusei_note",
    genre: "九星気学",
    pattern: "占術解説型",
    buzzScore: 612,
    likes: 1308,
    replies: 110,
    reposts: 112,
    confidence: 0.62
  },
  {
    rank: 19,
    hook: "引き寄せを力まない日の過ごし方",
    author: "@gentle_manifest",
    genre: "引き寄せ",
    pattern: "失敗談・気づき型",
    buzzScore: 590,
    likes: 1234,
    replies: 108,
    reposts: 104,
    confidence: 0.61
  },
  {
    rank: 20,
    hook: "お守りを持ち替える前に考えること",
    author: "@goodluck_items",
    genre: "お守り",
    pattern: "開運アドバイス型",
    buzzScore: 568,
    likes: 1180,
    replies: 94,
    reposts: 101,
    confidence: 0.6
  }
];

export const recommendedGenres = [
  { rank: 1, name: "今日の運勢", score: 91.8, reason: "朝の保存率が高く、短文フックと相性がよい" },
  { rank: 2, name: "片思い", score: 88.4, reason: "共感型の返信率が上昇" },
  { rank: 3, name: "仕事運", score: 84.9, reason: "週中の予定変更テーマが伸長" },
  { rank: 4, name: "満月", score: 80.6, reason: "直近イベントとの接続が作りやすい" },
  { rank: 5, name: "金運", score: 77.3, reason: "実用アドバイス型が安定" }
];

export const recommendedIdeas = [
  {
    title: "今日の違和感を整える3行メモ",
    genre: "今日の運勢",
    type: "日常つぶやき型",
    score: 88,
    risk: "低",
    note: "朝の観察から自然に入れる。断定せず振り返りを促す。"
  },
  {
    title: "連絡を待つ時間に自分へ戻る問い",
    genre: "片思い",
    type: "恋愛共感型",
    score: 84,
    risk: "中",
    note: "CTAが重くならないよう、保存よりコメント相談を控えめに。"
  },
  {
    title: "仕事運が動く前の予定変更サイン",
    genre: "仕事運",
    type: "前兆サイン型",
    score: 82,
    risk: "低",
    note: "前兆を決めつけず、行動整理の切り口にする。"
  }
];

export const postTypeBalance = [
  { name: "占い・運勢系", value: 48, target: 50 },
  { name: "日常・共感系", value: 22, target: 20 },
  { name: "占術解説系", value: 16, target: 15 },
  { name: "体験談・裏側系", value: 9, target: 10 },
  { name: "告知・誘導系", value: 5, target: 5 }
];

export const hookRanking = [
  { rank: 1, hook: "朝の違和感を見逃さない", uses: 18, averageScore: 914 },
  { rank: 2, hook: "心が疲れた日に読む", uses: 16, averageScore: 882 },
  { rank: 3, hook: "動く前に起きやすい", uses: 14, averageScore: 851 },
  { rank: 4, hook: "決めつけないための見方", uses: 12, averageScore: 824 },
  { rank: 5, hook: "焦らない日のセルフチェック", uses: 11, averageScore: 798 },
  { rank: 6, hook: "整う前の小さなサイン", uses: 10, averageScore: 771 },
  { rank: 7, hook: "今週の小さな追い風", uses: 9, averageScore: 742 },
  { rank: 8, hook: "距離を置くサイン", uses: 8, averageScore: 721 },
  { rank: 9, hook: "力まない日の過ごし方", uses: 7, averageScore: 704 },
  { rank: 10, hook: "願いを整理する短いメモ", uses: 6, averageScore: 688 }
];

export const fortuneCalendar = [
  { date: "5/22", event: "一粒万倍日", genre: "開運", angle: "小さく始める行動の整理" },
  { date: "5/24", event: "下弦の月", genre: "満月", angle: "手放すテーマを日常へ落とす" },
  { date: "5/27", event: "新月前", genre: "新月", angle: "決めすぎない準備期間" },
  { date: "5/29", event: "季節の変わり目", genre: "対人運", angle: "疲れやすい日の距離感" }
];

export const motifReuse = [
  { motif: "月と手元", count: 4, risk: "中", lastUsed: "2日前" },
  { motif: "カードの俯瞰", count: 3, risk: "低", lastUsed: "昨日" },
  { motif: "朝の窓辺", count: 2, risk: "低", lastUsed: "5日前" },
  { motif: "淡い星空", count: 5, risk: "高", lastUsed: "今日" }
];

export const schedulePreview = [
  { time: "08:10", genre: "今日の運勢", title: "朝の違和感を整える3行メモ", status: "予約済み" },
  { time: "12:30", genre: "仕事運", title: "予定変更が出た日の見直しポイント", status: "候補" },
  { time: "18:40", genre: "片思い", title: "連絡を待つ夜に自分へ戻る問い", status: "要確認" },
  { time: "21:10", genre: "満月", title: "手放すテーマを静かに決める", status: "候補" }
];

export const quickStats = [
  { label: "採用候補", value: "9件", icon: CheckCircle2 },
  { label: "要修正", value: "3件", icon: Wand2 },
  { label: "コメント余地", value: "高", icon: MessageSquareText }
];
