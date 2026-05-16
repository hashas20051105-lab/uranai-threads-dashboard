"use client";

export function HumanApprovalBox({
  approved,
  onChange,
  disabled
}: {
  approved: boolean;
  onChange: (approved: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-violet-100 bg-violet-50 p-4">
      <input
        type="checkbox"
        checked={approved}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-700 focus:ring-violet-500"
      />
      <span>
        <span className="block text-sm font-bold text-violet-950">人間が内容を確認し、予約を承認します</span>
        <span className="mt-1 block text-xs leading-5 text-violet-800">
          チェックを入れた場合のみ scheduled として保存します。未承認の場合は pending_approval になります。
        </span>
      </span>
    </label>
  );
}
