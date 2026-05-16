export function classifyPattern(text: string) {
  if (/絶対|必ず|断言|決まっています/.test(text)) return "断言型";
  if (/わかる|つらい|大丈夫|疲れ|不安|共感/.test(text)) return "共感型";
  if (/前兆|サイン|兆し|予兆/.test(text)) return "前兆型";
  if (/ランキング|TOP|トップ|順位|第[一二三四五六七八九十]/i.test(text)) return "ランキング型";
  if (/チェック|確認|リスト|項目/.test(text)) return "チェックリスト型";
  if (/私は|体験|経験|失敗|気づき/.test(text)) return "体験談型";
  if (/？|\?|教えて|どっち|どう思う/.test(text)) return "質問型";
  if (/とは|理由|仕組み|解説|読み方/.test(text)) return "解説型";
  if (/保存|あとで見返/.test(text)) return "保存促進型";
  if (/コメント|返信|受け取ります/.test(text)) return "コメント促進型";
  return "その他";
}
