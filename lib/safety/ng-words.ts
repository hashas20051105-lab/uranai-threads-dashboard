export const blockedExpressions = ["絶対", "必ず", "100%", "見ないと損", "儲かる", "治ります", "完治"];

export const cautionExpressions = ["これを見た人", "3日以内", "受け取ります", "今すぐ", "怖いほど", "手遅れ"];

export function findRiskyExpressions(text: string) {
  return [...blockedExpressions, ...cautionExpressions].filter((word) => text.includes(word));
}

export function softenUnsafeText(text: string) {
  return text
    .replaceAll("必ず叶います", "叶いやすい流れに入り始めています")
    .replaceAll("絶対に連絡が来ます", "連絡の流れが近づいているサインかもしれません")
    .replaceAll("見ないと損します", "気になる人だけ受け取ってください")
    .replaceAll("絶対", "流れとしては")
    .replaceAll("必ず", "起きやすい")
    .replaceAll("100%", "かなり");
}
