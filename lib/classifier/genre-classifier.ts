const genreRules: Array<{ genre: string; keywords: string[] }> = [
  { genre: "今日の運勢", keywords: ["今日の運勢", "本日の運勢", "今日", "運勢"] },
  { genre: "恋愛占い", keywords: ["恋愛", "好きな人", "相性", "連絡", "既読", "未読"] },
  { genre: "復縁", keywords: ["復縁", "元彼", "元カノ", "よりを戻す"] },
  { genre: "片思い", keywords: ["片思い", "片想い", "あの人の気持ち"] },
  { genre: "金運", keywords: ["金運", "臨時収入", "財布", "お金", "宝くじ"] },
  { genre: "仕事運", keywords: ["仕事運", "仕事", "転職", "職場", "副業"] },
  { genre: "タロット", keywords: ["タロット", "カード"] },
  { genre: "星座占い", keywords: ["星座", "牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座", "天秤座", "蠍座", "射手座", "山羊座", "水瓶座", "魚座"] },
  { genre: "スピリチュアル", keywords: ["スピリチュアル", "波動", "魂", "宇宙", "チャネリング"] },
  { genre: "開運", keywords: ["開運", "幸運", "運気", "吉日"] },
  { genre: "前兆サイン", keywords: ["前兆", "サイン", "兆し", "予兆"] },
  { genre: "引き寄せ", keywords: ["引き寄せ", "願い", "叶う流れ"] },
  { genre: "満月", keywords: ["満月"] },
  { genre: "新月", keywords: ["新月"] },
  { genre: "一粒万倍日", keywords: ["一粒万倍日"] },
  { genre: "神社", keywords: ["神社", "参拝", "鳥居"] },
  { genre: "パワースポット", keywords: ["パワースポット"] }
];

export function classifyGenre(text: string) {
  const normalized = text.toLowerCase();
  return genreRules.find((rule) => rule.keywords.some((keyword) => normalized.includes(keyword.toLowerCase())))?.genre ?? "総合占い";
}
