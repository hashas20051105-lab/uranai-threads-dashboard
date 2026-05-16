import { AggregateTable } from "@/components/insights/CtaInsightTable";
import type { InsightAggregate } from "@/types/domain";

export function MotifInsightTable({ data }: { data: InsightAggregate[] }) {
  return <AggregateTable title="画像モチーフ別成果" data={data} />;
}

