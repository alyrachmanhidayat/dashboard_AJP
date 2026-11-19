import { PRODUCTION_STAGES, stageIndex, type Po } from "@/lib/po-data";

/** 8-stage production tracker. `compact` shows numbered dots only (label on hover). */
export default function PoStepper({ po, compact }: { po: Po; compact?: boolean }) {
  const current = po.terkirim ? PRODUCTION_STAGES.length : stageIndex(po.stage);
  return (
    <ol className="flex items-center gap-1.5 overflow-x-auto">
      {PRODUCTION_STAGES.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s.key} className="flex shrink-0 items-center gap-1.5">
            <span
              title={s.label}
              className={`flex items-center gap-1 rounded-full text-[11px] font-medium ${compact ? "px-1.5 py-0.5" : "px-2.5 py-1"} ${
                active ? "bg-[#2a78d6] text-white" : done ? "bg-[#e6f7e6] text-[#0a8a0a]" : "bg-[#f4f3f0] text-[#898781]"
              }`}
            >
              {done ? "✓" : i + 1}
              {!compact && <span>{s.label}</span>}
            </span>
            {i < PRODUCTION_STAGES.length - 1 && <span className={`h-px w-2 ${done ? "bg-[#0ca30c]" : "bg-[#e1e0d9]"}`} />}
          </li>
        );
      })}
    </ol>
  );
}

export function stageLabel(po: Po): string {
  return po.terkirim ? "Terkirim" : PRODUCTION_STAGES[stageIndex(po.stage)].label;
}
