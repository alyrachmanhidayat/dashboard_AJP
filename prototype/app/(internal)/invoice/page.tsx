"use client";

import Link from "next/link";
import { useState } from "react";
import Badge from "@/components/Badge";
import Toast from "@/components/Toast";
import { formatDate, formatNumber, formatRupiah } from "@/lib/format";
import { poTotalDp, poTotalInvoice, type Po } from "@/lib/po-data";
import { usePoStore } from "@/lib/po-store";

const itemQty = (item: Po["items"][number]) => item.variants.reduce((a, v) => a + v.sizes.reduce((b, s) => b + s.qty, 0), 0);

export default function InvoicePage() {
  const { pos, invoices, publishInvoice } = usePoStore();
  const ready = pos.filter((po) => po.terkirim && !invoices.some((i) => i.poId === po.id));
  const inProduction = pos.filter((po) => !po.terkirim).length;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const recent = invoices.filter((i) => pos.some((p) => p.id === i.poId));

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3800);
  }

  function publish() {
    const po = ready.find((p) => p.id === selectedId);
    if (!po) return showToast("Pilih satu PO terlebih dahulu.");
    const inv = publishInvoice(po.id);
    setSelectedId(null);
    if (inv) showToast(`${inv.invoiceNumber} diterbitkan untuk ${po.namaPo} — ${formatRupiah(inv.totalAmount)}.`);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-[#e1e0d9] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e1e0d9] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[#0b0b0b]">PO Terkirim — Siap Diterbitkan Invoice</h2>
            <p className="text-xs text-[#898781]">
              Nilai invoice = total PO (qty × harga jual per item) − semua DP yang sudah masuk.
            </p>
          </div>
          <button
            onClick={publish}
            disabled={selectedId === null}
            className="rounded-lg bg-[#2a78d6] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#1f5aa8] disabled:cursor-not-allowed disabled:bg-[#c3c2b7]"
          >
            Terbitkan Invoice
          </button>
        </div>

        {ready.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[#898781]">
            Belum ada PO terkirim yang menunggu invoice. {inProduction} PO masih dalam produksi —{" "}
            <Link href="/po" className="font-medium text-[#1f5aa8] hover:underline">lihat PO</Link>.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#e1e0d9] text-xs uppercase tracking-wide text-[#898781]">
                  <th className="px-5 py-3 font-medium" />
                  <th className="px-5 py-3 font-medium">No. PO / Nama</th>
                  <th className="px-5 py-3 font-medium">Item × harga jual</th>
                  <th className="px-5 py-3 text-right font-medium">Total PO</th>
                  <th className="px-5 py-3 text-right font-medium">DP</th>
                  <th className="px-5 py-3 text-right font-medium">Nilai invoice</th>
                </tr>
              </thead>
              <tbody>
                {ready.map((po) => {
                  const total = poTotalInvoice(po);
                  const dp = poTotalDp(po);
                  return (
                    <tr
                      key={po.id}
                      onClick={() => setSelectedId(po.id)}
                      className="cursor-pointer border-b border-[#eeede9] align-top last:border-0 hover:bg-[#fafaf9]"
                    >
                      <td className="px-5 py-3.5">
                        <input
                          type="radio"
                          name="selected-po"
                          checked={selectedId === po.id}
                          onChange={() => setSelectedId(po.id)}
                          className="h-4 w-4 accent-[#2a78d6]"
                          aria-label={`Pilih ${po.namaPo}`}
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-[#0b0b0b]">{po.namaPo}</p>
                        <p className="text-xs text-[#898781]">{po.noPo} · {po.brand}</p>
                      </td>
                      <td className="px-5 py-3.5 text-[#52514e]">
                        {po.items.map((item) => (
                          <p key={item.id}>
                            {item.artikel}: {formatNumber(itemQty(item))} pcs × {formatRupiah(item.hargaJual)}
                          </p>
                        ))}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-[#52514e]">{formatRupiah(total)}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-[#52514e]">− {formatRupiah(dp)}</td>
                      <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-[#0b0b0b]">{formatRupiah(total - dp)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-[#e1e0d9] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#e1e0d9] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#0b0b0b]">Invoice Terbit dari PO</h2>
          <Link href="/piutang" className="text-xs font-medium text-[#1f5aa8] hover:underline">Kelola pembayaran di Piutang →</Link>
        </div>
        {recent.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-[#898781]">Belum ada invoice yang diterbitkan di sesi demo ini.</p>
        ) : (
          <ul className="divide-y divide-[#eeede9]">
            {recent.map((inv) => (
              <li key={inv.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                <span>
                  <span className="font-medium text-[#0b0b0b]">{inv.invoiceNumber}</span>
                  <span className="text-[#898781]"> · {inv.namaPo} · {formatDate(inv.issuedDate)}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="tabular-nums">{formatRupiah(inv.totalAmount)}</span>
                  <Badge tone={inv.isPaid ? "good" : "warning"}>{inv.isPaid ? "Lunas" : "Belum lunas"}</Badge>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {toast && <Toast message={toast} />}
    </div>
  );
}
