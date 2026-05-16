const motifRules: Array<{ motif: string; keywords: string[] }> = [
  { motif: "月", keywords: ["月", "満月", "新月"] },
  { motif: "星", keywords: ["星", "星座"] },
  { motif: "神社", keywords: ["神社", "参拝", "鳥居"] },
  { motif: "お守り", keywords: ["お守り", "御守"] },
  { motif: "財布", keywords: ["財布", "金運", "お金"] },
  { motif: "タロットカード", keywords: ["タロット"] },
  { motif: "オラクルカード", keywords: ["オラクル"] },
  { motif: "スマホ", keywords: ["スマホ", "通知"] },
  { motif: "既読", keywords: ["既読"] },
  { motif: "未読", keywords: ["未読"] },
  { motif: "手紙", keywords: ["手紙", "メッセージ"] },
  { motif: "花", keywords: ["花", "桜"] },
  { motif: "雨", keywords: ["雨"] },
  { motif: "夕暮れ", keywords: ["夕暮れ", "夕方"] },
  { motif: "朝日", keywords: ["朝日", "朝"] },
  { motif: "水晶", keywords: ["水晶"] },
  { motif: "キャンドル", keywords: ["キャンドル", "ろうそく"] },
  { motif: "鏡", keywords: ["鏡"] },
  { motif: "空", keywords: ["空"] },
  { motif: "雲", keywords: ["雲"] },
  { motif: "赤い糸", keywords: ["赤い糸"] }
];

export function extractVisualMotifs(text: string) {
  return motifRules
    .filter((rule) => rule.keywords.some((keyword) => text.includes(keyword)))
    .map((rule) => rule.motif);
}
