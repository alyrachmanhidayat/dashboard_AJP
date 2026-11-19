"use client";

import Link from "next/link";
import Badge from "@/components/Badge";
import PoStepper, { stageLabel } from "@/components/PoStepper";
import ProgressBar from "@/components/ProgressBar";
import StatCard from "@/components/StatCard";
import { BoxIcon } from "@/components/icons";
import { DEMO_TODAY, urgencyTone } from "@/lib/dummy-data";
import { daysUntil, formatDate, formatNumber } from "@/lib/format";
import { allVariants, poProgress, poTotalQty } from "@/lib/po-data";
import { usePoStore } from "@/lib/po-store";

const toneLabel: Record<string, string> = {
  critical: "Kritis",
  warning: "Waspada",
  good: "Aman",
  info: "Longgar",
};

export default function DashboardPage() {
  const { pos, plans, select } = usePoStore();

  const rows = pos
    .filter((po) => !po.terkirim)
    .map((po) => ({ po, left: daysUntil(po.tanggalKirim, DEMO_TODAY) }))
    .sort((a, b) => a.left - b.left);

  const critical = rows.filter((r) => r.left <= 8).length;
  const warning = rows.filter((r) => r.left > 8 && r.left <= 10).length;
  const waitingMarker = rows.filter(
    ({ po }) => po.stage === "marker" && allVariants(po).some(({ variant }) => plans[variant.id]?.status !== "final")
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="PO Aktif"
          value={String(rows.length)}
          hint="Sedang dalam proses produksi"
          accent="blue"
          icon={<BoxIcon className="h-5 w-5" />}
        />
        <StatCard label="Jatuh Tempo ≤ 8 Hari" value={String(critical)} hint="Perlu prioritas hari ini" accent="critical" />
        <StatCard label="Jatuh Tempo 9–10 Hari" value={String(warning)} hint="Pantau progres produksi" accent="warning" />
        <StatCard label="Menunggu Marker Final" value={String(waitingMarker)} hint="Belum bisa masuk Cutting" accent="violet" />
      </div>

      <div className="rounded-xl border border-[#e1e0d9] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#e1e0d9] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[#0b0b0b]">PO Dalam Proses</h2>
            <p className="text-xs text-[#898781]">Diurutkan berdasarkan tenggat kirim terdekat</p>
          </div>
          <span className="rounded-full bg-[#f4f3f0] px-3 py-1 text-xs font-medium text-[#52514e]">{rows.length} PO</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#e1e0d9] text-xs uppercase tracking-wide text-[#898781]">
                <th className="px-5 py-3 font-medium">No. PO / Nama</th>
                <th className="px-5 py-3 font-medium">Qty</th>
                <th className="px-5 py-3 font-medium">Tenggat</th>
                <th className="px-5 py-3 font-medium">Tahap Produksi</th>
                <th className="px-5 py-3 font-medium">Progres</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ po, left }) => (
                <tr key={po.id} className="border-b border-[#eeede9] last:border-0 hover:bg-[#fafaf9]">
                  <td className="px-5 py-3.5">
                    <Link
                      href="/po"
                      onClick={() => select({ poId: po.id, variantId: po.items[0].variants[0].id })}
                      className="font-medium text-[#0b0b0b] hover:text-[#1f5aa8] hover:underline"
                    >
                      {po.namaPo}
                    </Link>
                    <p className="text-xs text-[#898781]">
                      {po.noPo} &middot; {po.brand} &middot; {allVariants(po).length} warna
                    </p>
                  </td>
                  <td className="px-5 py-3.5 tabular-nums text-[#52514e]">{formatNumber(poTotalQty(po))}</td>
                  <td className="px-5 py-3.5">
                    <p className="text-[#0b0b0b]">{formatDate(po.tanggalKirim)}</p>
                    <Badge tone={urgencyTone(left)}>
                      H-{left} &middot; {toneLabel[urgencyTone(left)]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="mb-1.5 text-xs font-medium text-[#0b0b0b]">{stageLabel(po)}</p>
                    <PoStepper po={po} compact />
                  </td>
                  <td className="px-5 py-3.5">
                    <ProgressBar percent={poProgress(po)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
