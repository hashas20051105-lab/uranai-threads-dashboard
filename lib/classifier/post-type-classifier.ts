import type { PostType } from "@/types/domain";

export function classifyPostType(text: string, genre: string): PostType {
  if (/告知|募集|受付|案内|予約/.test(text)) return "告知・誘導型";
  if (/質問|教えて|どう思う|どっち/.test(text)) return "質問・交流型";
  if (/失敗|気づき|体験|経験|学び/.test(text)) return "失敗談・気づき型";
  if (/制作|裏側|準備|リーディング中/.test(text)) return "裏側・制作過程型";
  if (/とは|解説|読み方|意味/.test(text)) return "占術解説型";
  if (/日常|朝|夜|散歩|手帳|雨|空/.test(text)) return "日常つぶやき型";
  if (genre === "金運") return "金運共感型";
  if (["恋愛占い", "復縁", "片思い"].includes(genre)) return "恋愛共感型";
  if (genre === "今日の運勢") return "今日の運勢型";
  if (genre === "前兆サイン" || /前兆|サイン|兆し/.test(text)) return "前兆サイン型";
  return "占い結果型";
}
