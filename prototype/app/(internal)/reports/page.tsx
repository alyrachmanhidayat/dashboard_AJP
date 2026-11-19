"use client";

import { useState } from "react";
import Badge from "@/components/Badge";
import RejectTrendChart from "@/components/charts/RejectTrendChart";
import RevenueTrendChart from "@/components/charts/RevenueTrendChart";
import StatCard from "@/components/StatCard";
import { omzetTrend, rejectTrend } from "@/lib/dummy-data";
import { formatDate, formatNumber, formatRupiah } from "@/lib/format";
import { lossRecords } from "@/lib/po-data";
import { usePoStore } from "@/lib/po-store";

const tabs = [
  { key: "omzet", label: "Rekap Omzet" },
  { key: "reject", label: "Rekap Reject & Hilang" },
] as const;

const kategoriTone = { reject: "critical", hilang: "warning", stok: "info" } as const;

export default function ReportsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("omzet");
  const { invoices } = usePoStore();
  const paid = invoices.filter((i) => i.isPaid);

  const sumQty = (k: "reject" | "hilang" | "stok") =>
    lossRecords.filter((r) => r.kategori === k).reduce((a, r) => a + r.qty, 0);
  const lostNominal = lossRecords
    .filter((r) => r.kategori !== "stok")
    .reduce((a, r) => a + r.qty * r.hargaJual, 0);

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-lg border border-[#e1e0d9] bg-white p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? "bg-[#2a78d6] text-white" : "text-[#52514e] hover:bg-[#f4f3f0]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "omzet" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="PO Selesai (Sep 2026)" value="18" accent="blue" />
            <StatCard label="Total Omzet (Sep 2026)" value={formatRupiah(143_800_000)} accent="good" />
            <StatCard label="Total Qty (Sep 2026)" value={`${formatNumber(2140)} pcs`} accent="violet" />
            <StatCard label="Pemakaian Kain (Sep 2026)" value={`${formatNumber(1512)} yd`} accent="orange" />
          </div>

          <div className="rounded-xl border border-[#e1e0d9] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[#0b0b0b]">Tren Omzet 12 Bulan Terakhir</h2>
            <div className="mt-3">
              <RevenueTrendChart data={omzetTrend} />
            </div>
          </div>

          <div className="rounded-xl border border-[#e1e0d9] bg-white shadow-sm">
            <div className="border-b border-[#e1e0d9] px-5 py-4">
              <h2 className="text-sm font-semibold text-[#0b0b0b]">Invoice Lunas Terbaru</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e1e0d9] text-xs uppercase tracking-wide text-[#898781]">
                    <th className="px-5 py-3 font-medium">No. Invoice</th>
                    <th className="px-5 py-3 font-medium">Brand / PO</th>
                    <th className="px-5 py-3 font-medium">Total PO</th>
                    <th className="px-5 py-3 font-medium">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {paid.map((inv) => (
                    <tr key={inv.id} className="border-b border-[#eeede9] last:border-0">
                      <td className="px-5 py-3.5 font-medium text-[#0b0b0b]">{inv.invoiceNumber}</td>
                      <td className="px-5 py-3.5">
                        <p className="text-[#0b0b0b]">{inv.brand}</p>
                        <p className="text-xs text-[#898781]">{inv.noPo} · {inv.namaPo}</p>
                      </td>
                      <td className="px-5 py-3.5 tabular-nums text-[#52514e]">{formatRupiah(inv.totalPo)}</td>
                      <td className="px-5 py-3.5 text-[#52514e]">{formatDate(inv.issuedDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Reject (pcs)" value={formatNumber(sumQty("reject"))} hint="Rusak, tidak bisa dijual" accent="critical" />
            <StatCard label="Hilang (pcs)" value={formatNumber(sumQty("hilang"))} hint="Selisih serah terima" accent="warning" />
            <StatCard label="Masuk Stok (pcs)" value={formatNumber(sumQty("stok"))} hint="Lebih produksi, jadi stok" accent="blue" />
            <StatCard label="Nilai Reject + Hilang" value={formatRupiah(lostNominal)} hint="Qty × harga jual" accent="critical" />
          </div>

          <div className="rounded-xl border border-[#e1e0d9] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[#0b0b0b]">Tren Reject & Hilang 12 Bulan Terakhir (pcs)</h2>
            <div className="mt-3">
              <RejectTrendChart data={rejectTrend} />
            </div>
          </div>

          <div className="rounded-xl border border-[#e1e0d9] bg-white shadow-sm">
            <div className="border-b border-[#e1e0d9] px-5 py-4">
              <h2 className="text-sm font-semibold text-[#0b0b0b]">Catatan Barang Lost per SKU</h2>
              <p className="text-xs text-[#898781]">
                Mulai tahap Sewing, barang yang kurang dikategorikan stok, reject, atau hilang. Reject & hilang wajib ada
                alasan dan PIC untuk audit.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e1e0d9] text-xs uppercase tracking-wide text-[#898781]">
                    <th className="px-5 py-3 font-medium">Tanggal / Tahap</th>
                    <th className="px-5 py-3 font-medium">PO</th>
                    <th className="px-5 py-3 font-medium">SKU</th>
                    <th className="px-5 py-3 text-right font-medium">Qty</th>
                    <th className="px-5 py-3 font-medium">Kategori</th>
                    <th className="px-5 py-3 font-medium">Alasan</th>
                    <th className="px-5 py-3 font-medium">PIC</th>
                  </tr>
                </thead>
                <tbody>
                  {lossRecords.map((r) => (
                    <tr key={r.id} className="border-b border-[#eeede9] align-top last:border-0">
                      <td className="px-5 py-3.5">
                        <p className="text-[#0b0b0b]">{formatDate(r.tanggal)}</p>
                        <p className="text-xs text-[#898781]">{r.tahap}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-[#0b0b0b]">{r.namaPo}</p>
                        <p className="text-xs text-[#898781]">{r.noPo}</p>
                      </td>
                      <td className="px-5 py-3.5 text-[#52514e]">{r.artikel} · {r.warna} · {r.size}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums">{r.qty}</td>
                      <td className="px-5 py-3.5"><Badge tone={kategoriTone[r.kategori]}>{r.kategori}</Badge></td>
                      <td className="px-5 py-3.5 text-[#52514e]">{r.alasan}</td>
                      <td className="px-5 py-3.5 text-[#52514e]">{r.pic}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
