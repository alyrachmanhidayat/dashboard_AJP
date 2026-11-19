"use client";

import Link from "next/link";
import { useState } from "react";
import Badge from "@/components/Badge";
import Toast from "@/components/Toast";
import { formatDate, formatNumber } from "@/lib/format";
import { blankMarker, computePlan, ratioLabel, type Marker } from "@/lib/marker";
import { DEMO_TODAY } from "@/lib/dummy-data";
import { allVariants, type MarkerPlan } from "@/lib/po-data";
import { usePoStore } from "@/lib/po-store";

const num = (v: string) => {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
};
const f = (x: number, max = 1, min = 0) =>
  x.toLocaleString("id-ID", { minimumFractionDigits: min, maximumFractionDigits: max });

const inputCls =
  "w-full rounded-lg border border-[#e1e0d9] bg-white px-2.5 py-1.5 text-sm tabular-nums outline-none focus:border-[#2a78d6] disabled:bg-[#f4f3f0] disabled:text-[#52514e]";

export default function MarkerPage() {
  const { pos, plans, selection, select, getPlan, savePlan } = usePoStore();
  const [toast, setToast] = useState<string | null>(null);

  const po = pos.find((p) => p.id === selection.poId) ?? pos[0];
  const variants = allVariants(po);
  const current = variants.find((v) => v.variant.id === selection.variantId) ?? variants[0];
  const { item, variant } = current;
  const plan = getPlan(variant.id);
  const locked = plan.status === "final";
  const sizes = variant.sizes;
  const R = computePlan(sizes, plan.markers, plan.allowance);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  const update = (patch: Partial<MarkerPlan>) => savePlan({ ...plan, ...patch });
  const updateMarker = (id: string, patch: Partial<Marker>) =>
    update({ markers: plan.markers.map((m) => (m.id === id ? { ...m, ...patch } : m)) });

  function addImages(id: string, files: FileList | null) {
    if (!files?.length) return;
    const m = plan.markers.find((x) => x.id === id);
    if (!m) return;
    // Demo only: images live in this browser tab (object URLs), not uploaded anywhere.
    updateMarker(id, { images: [...m.images, ...Array.from(files).map((file) => URL.createObjectURL(file))] });
  }

  const statusOf = (variantId: string) => plans[variantId]?.status;
  const selisih = R.totalProduced - R.totalPo;
  const sisaKain = plan.pemakaianAktual != null ? R.totalYard - plan.pemakaianAktual : null;
  const warnings = plan.markers
    .map((m, k) => {
      const r = R.markers[k];
      if (!r.gambar) return `Marker ${k + 1}: isi rasio minimal satu size.`;
      if (!m.panjang) return `Marker ${k + 1}: isi panjang marker.`;
      return null;
    })
    .filter(Boolean) as string[];

  return (
    <>
      <div className="space-y-6 print:hidden">
        {/* ---------- Pilih PO & warna ---------- */}
        <section className="rounded-xl border border-[#e1e0d9] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-end gap-4">
            <label className="min-w-[240px] flex-1 text-sm">
              <span className="mb-1 block font-medium text-[#52514e]">Purchase Order</span>
              <select
                value={po.id}
                onChange={(e) => {
                  const next = pos.find((p) => p.id === e.target.value)!;
                  select({ poId: next.id, variantId: next.items[0].variants[0].id });
                }}
                className={inputCls + " py-2"}
              >
                {pos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.noPo} · {p.namaPo} ({p.brand})
                  </option>
                ))}
              </select>
            </label>
            <div className="text-xs text-[#898781]">
              Kirim {formatDate(po.tanggalKirim)} · Tahap PO saat ini:{" "}
              <span className="font-medium text-[#0b0b0b]">{po.stage.replace("_", " ")}</span>
            </div>
          </div>

          <p className="mb-2 mt-5 text-xs font-medium uppercase tracking-wide text-[#898781]">
            Warna kain — tiap warna punya rencana marker sendiri
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map(({ item: it, variant: v }) => {
              const active = v.id === variant.id;
              const st = statusOf(v.id);
              return (
                <button
                  key={v.id}
                  onClick={() => select({ poId: po.id, variantId: v.id })}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm ${
                    active ? "border-[#2a78d6] bg-[#e9f1fc]" : "border-[#e1e0d9] hover:bg-[#f4f3f0]"
                  }`}
                >
                  <span>
                    <span className="block font-medium text-[#0b0b0b]">{v.warna}</span>
                    <span className="block text-xs text-[#898781]">{it.artikel}</span>
                  </span>
                  <Badge tone={st === "final" ? "good" : st === "draft" ? "warning" : "neutral"}>
                    {st === "final" ? "Final" : st === "draft" ? "Draft" : "Belum"}
                  </Badge>
                </button>
              );
            })}
          </div>
        </section>

        {/* ---------- Info artikel & qty ---------- */}
        <section className="rounded-xl border border-[#e1e0d9] bg-white p-5 shadow-sm">
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-5">
            <Info label="Artikel" value={item.artikel} />
            <Info label="Warna" value={variant.warna} />
            <Info label="Bahan" value={variant.bahan} />
            <Info label="Lebar kain" value={`${variant.lebarKain} cm`} />
            <Info label="Bahan masuk" value={variant.kgMasuk != null ? `${f(variant.kgMasuk)} kg` : "Belum datang"} />
          </div>
          <p className="mb-2 mt-5 text-xs font-medium uppercase tracking-wide text-[#898781]">
            Qty PO per size (dari PO, tidak diubah di sini)
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <span key={s.size} className="rounded-lg bg-[#f4f3f0] px-3 py-1.5 text-sm">
                <span className="text-[#898781]">{s.size}</span>{" "}
                <span className="font-semibold tabular-nums text-[#0b0b0b]">{s.qty}</span>
              </span>
            ))}
            <span className="rounded-lg bg-[#e9f1fc] px-3 py-1.5 text-sm font-semibold text-[#1f5aa8]">
              Total {formatNumber(R.totalPo)} pcs
            </span>
          </div>
        </section>

        {locked && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#0ca30c]/30 bg-[#e6f7e6] px-5 py-3 text-sm text-[#0a6a0a]">
            Marker sudah final dan dipakai sebagai rencana Cutting. Buka kunci untuk mengubah.
            <button
              onClick={() => update({ status: "draft" })}
              className="rounded-lg border border-[#0ca30c]/40 bg-white px-3 py-1.5 font-medium hover:bg-[#f4fbf4]"
            >
              Buka kunci
            </button>
          </div>
        )}

        {/* ---------- Markers ---------- */}
        <div className="flex items-start gap-4 overflow-x-auto pb-2">
          {plan.markers.map((m, k) => {
            const r = R.markers[k];
            return (
              <section
                key={m.id}
                className="w-[min(360px,88vw)] shrink-0 rounded-xl border border-[#e1e0d9] bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#0b0b0b]">Marker {k + 1}</h3>
                  {plan.markers.length > 1 && !locked && (
                    <button
                      onClick={() => update({ markers: plan.markers.filter((x) => x.id !== m.id) })}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-[#a82f2f] hover:bg-[#fdecec]"
                    >
                      Hapus
                    </button>
                  )}
                </div>

                <p className="mb-1 text-xs font-medium text-[#52514e]">Rasio per size</p>
                <div className="mb-3 grid grid-cols-4 gap-2">
                  {sizes.map((s) => (
                    <label key={s.size} className="text-center text-xs">
                      <span className="mb-0.5 block text-[#898781]">{s.size}</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        disabled={locked}
                        value={m.ratio[s.size] || ""}
                        onChange={(e) =>
                          updateMarker(m.id, { ratio: { ...m.ratio, [s.size]: Math.floor(num(e.target.value)) } })
                        }
                        className={inputCls + " text-center"}
                      />
                    </label>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Field label="Panjang marker (cm)">
                    <input type="number" inputMode="decimal" disabled={locked} value={m.panjang || ""}
                      onChange={(e) => updateMarker(m.id, { panjang: num(e.target.value) })} className={inputCls} />
                  </Field>
                  <Field label="Tambahan (cm)">
                    <input type="number" inputMode="decimal" disabled={locked} value={m.tambahan || ""}
                      onChange={(e) => updateMarker(m.id, { tambahan: num(e.target.value) })} className={inputCls} />
                  </Field>
                  <Field label="Lebar marker (cm)">
                    <input type="number" inputMode="decimal" disabled={locked} value={m.lebar || ""}
                      onChange={(e) => updateMarker(m.id, { lebar: num(e.target.value) })} className={inputCls} />
                  </Field>
                  <Field label="Ampar (lembar)">
                    <input type="number" inputMode="numeric" disabled={locked || m.auto}
                      value={m.auto ? r.ampar || "" : m.ampar || ""}
                      onChange={(e) => updateMarker(m.id, { ampar: Math.floor(num(e.target.value)) })} className={inputCls} />
                    <span className="mt-1 flex items-center gap-1.5 text-[#52514e]">
                      <input type="checkbox" disabled={locked} checked={m.auto}
                        onChange={(e) => updateMarker(m.id, { auto: e.target.checked, ampar: r.ampar })} />
                      Otomatis
                    </span>
                  </Field>
                </div>

                <div className="mt-3 text-xs">
                  <span className="mb-1 block font-medium text-[#52514e]">Gambar marker (screenshot)</span>
                  {!locked && (
                    <input type="file" accept="image/*" multiple onChange={(e) => { addImages(m.id, e.target.files); e.target.value = ""; }}
                      className="max-w-full text-xs" />
                  )}
                  {m.images.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.images.map((src, i) => (
                        <div key={src} className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt={`Marker ${k + 1} gambar ${i + 1}`} className="h-16 rounded border border-[#e1e0d9]" />
                          {!locked && (
                            <button onClick={() => updateMarker(m.id, { images: m.images.filter((x) => x !== src) })}
                              aria-label="Hapus gambar"
                              className="absolute right-0.5 top-0.5 rounded bg-white px-1 text-xs text-[#a82f2f]">✕</button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 border-t border-dashed border-[#e1e0d9] pt-3">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                    <Kv label="Jumlah gambar" value={String(r.gambar)} />
                    <Kv label="Panjang + tambahan" value={`${f(r.panjangTotal)} cm`} />
                    <Kv label="Efisiensi / ampar" value={`${f(r.cmPerPcs)} cm/pcs`} />
                    <Kv label="Per pcs" value={`${f(r.yardPerPcs, 2, 2)} yard`} />
                  </div>
                  <p className="mt-2 rounded-lg bg-[#f4f3f0] px-3 py-2 text-xs text-[#52514e]">
                    Kebutuhan: {f(r.panjangTotal)} cm × {r.ampar} ampar = {f(r.cm)} cm ={" "}
                    <b className="text-[#0b0b0b]">{f(r.yard, 1, 1)} yard</b>
                  </p>
                  <table className="mt-2 w-full text-xs tabular-nums">
                    <thead>
                      <tr className="text-[#898781]">
                        <th className="py-1 text-left font-medium">Size</th>
                        <th className="py-1 text-right font-medium">Rasio × Ampar</th>
                        <th className="py-1 text-right font-medium">Hasil</th>
                        <th className="py-1 text-right font-medium">Sisa PO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizes.map((s, i) => (
                        <tr key={s.size} className="border-t border-[#eeede9]">
                          <td className="py-1">{s.size}</td>
                          <td className="py-1 text-right">{(m.ratio[s.size] || 0)} × {r.ampar}</td>
                          <td className="py-1 text-right">{r.produced[i]}</td>
                          <td className="py-1 text-right">{r.remaining[i]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
          {!locked && (
            <button
              onClick={() => update({ markers: [...plan.markers, blankMarker()] })}
              className="flex h-40 w-40 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-[#e1e0d9] text-sm font-medium text-[#52514e] hover:border-[#2a78d6] hover:text-[#1f5aa8]"
            >
              + Tambah marker
            </button>
          )}
        </div>

        {/* ---------- Ringkasan ---------- */}
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[#e1e0d9] bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-[#fab219] p-4 text-[#1b2540]">
              <p className="text-4xl font-bold tabular-nums">
                {f(R.totalYard, 1, 1)} <span className="text-lg font-semibold">yard</span>
              </p>
              <p className="mt-1 text-sm">
                Total kebutuhan kain incl. allowance · {f(R.totalYardPerPcs, 2, 2)} yard/pcs · {formatNumber(R.totalProduced)} pcs
                dari PO {formatNumber(R.totalPo)} ({selisih > 0 ? `lebih ${selisih}` : selisih < 0 ? `kurang ${-selisih}` : "pas"})
              </p>
            </div>
            <table className="mt-4 w-full text-sm tabular-nums">
              <thead>
                <tr className="text-xs text-[#898781]">
                  <th className="py-1.5 text-left font-medium">Size</th>
                  <th className="py-1.5 text-right font-medium">PO</th>
                  <th className="py-1.5 text-right font-medium">Hasil</th>
                  <th className="py-1.5 text-right font-medium">Selisih</th>
                </tr>
              </thead>
              <tbody>
                {sizes.map((s, i) => {
                  const d = R.produced[i] - s.qty;
                  return (
                    <tr key={s.size} className="border-t border-[#eeede9]">
                      <td className="py-1.5">{s.size}</td>
                      <td className="py-1.5 text-right">{s.qty}</td>
                      <td className="py-1.5 text-right">{R.produced[i]}</td>
                      <td className={`py-1.5 text-right font-medium ${d > 0 ? "text-[#0a8a0a]" : d < 0 ? "text-[#a82f2f]" : ""}`}>
                        {d > 0 ? "+" : ""}{d}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-[#e1e0d9] bg-white p-5 shadow-sm">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#52514e]">Allowance (yard, atau % dari kebutuhan)</span>
              <input type="text" disabled={locked} value={plan.allowance} placeholder="contoh: 5 atau 3%"
                onChange={(e) => update({ allowance: e.target.value })} className={inputCls + " py-2"} />
            </label>
            <table className="mt-4 w-full text-sm tabular-nums">
              <tbody>
                <Row label="Estimasi kebutuhan bahan baku" value={`${f(R.yard, 1, 1)} yard`} />
                <Row label={`+ Allowance${plan.allowance ? ` (${plan.allowance})` : ""}`} value={`${f(R.allowanceYard, 1, 1)} yard`} />
                <Row strong label="= Total kebutuhan (rencana Cutting)" value={`${f(R.totalYard, 1, 1)} yard`} />
                <Row
                  label="Total pemakaian (diisi saat Cutting)"
                  value={plan.pemakaianAktual != null ? `${f(plan.pemakaianAktual, 1, 1)} yard` : "—"}
                />
                <Row
                  strong
                  label={sisaKain != null && sisaKain < 0 ? "Kurang pemakaian" : "Sisa pemakaian"}
                  value={sisaKain != null ? `${f(Math.abs(sisaKain), 1, 1)} yard` : "—"}
                  tone={sisaKain == null ? undefined : sisaKain < 0 ? "bad" : "good"}
                />
              </tbody>
            </table>
            {warnings.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs text-[#a82f2f]">
                {warnings.map((w) => <li key={w}>{w}</li>)}
              </ul>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              <button onClick={() => window.print()}
                className="rounded-lg border border-[#e1e0d9] px-4 py-2 text-sm font-medium text-[#0b0b0b] hover:bg-[#f4f3f0]">
                Print laporan
              </button>
              {!locked && (
                <button
                  disabled={warnings.length > 0}
                  onClick={() => { update({ status: "final" }); showToast(`Marker ${variant.warna} final — jadi rencana Cutting.`); }}
                  className="rounded-lg bg-[#2a78d6] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f5aa8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Tandai final
                </button>
              )}
              <Link href="/po" className="rounded-lg px-4 py-2 text-sm font-medium text-[#1f5aa8] hover:bg-[#e9f1fc]">
                Lihat di PO →
              </Link>
            </div>
          </div>
        </section>
        <p className="text-center text-xs text-[#898781]">
          Rumus marker diadaptasi dari alat hitung Divisi Marker (Wahyu Muhamad Hilmi).
        </p>
      </div>

      {/* ---------- Print layout (A4 landscape), mirrors the marker division's report ---------- */}
      <div className="hidden text-[11px] leading-snug text-black print:block">
        <h1 className="text-lg font-bold">Laporan Kebutuhan Kain Potong</h1>
        <p>
          <b>PO:</b> {po.noPo} ({po.namaPo}) · <b>Artikel:</b> {item.artikel} · <b>Warna:</b> {variant.warna} ·{" "}
          <b>Bahan:</b> {variant.bahan} · <b>Lebar kain:</b> {variant.lebarKain} cm · <b>Tanggal:</b> {formatDate(DEMO_TODAY)}
        </p>
        <h2 className="mb-1 mt-3 text-sm font-semibold">Qty dan hasil per size</h2>
        <table className="w-full border-collapse tabular-nums [&_td]:border [&_td]:border-[#444] [&_td]:px-1.5 [&_td]:py-0.5 [&_th]:border [&_th]:border-[#444] [&_th]:px-1.5 [&_th]:py-0.5">
          <thead><tr><th className="text-left">Size</th><th className="text-right">Qty PO</th><th className="text-right">Hasil</th><th className="text-right">Selisih</th></tr></thead>
          <tbody>
            {sizes.map((s, i) => {
              const d = R.produced[i] - s.qty;
              return <tr key={s.size}><td>{s.size}</td><td className="text-right">{s.qty}</td><td className="text-right">{R.produced[i]}</td><td className="text-right">{d > 0 ? "+" : ""}{d}</td></tr>;
            })}
            <tr className="font-bold"><td>Total</td><td className="text-right">{R.totalPo}</td><td className="text-right">{R.totalProduced}</td><td className="text-right">{selisih > 0 ? "+" : ""}{selisih}</td></tr>
          </tbody>
        </table>
        <h2 className="mb-1 mt-3 text-sm font-semibold">Marker</h2>
        <table className="w-full border-collapse tabular-nums [&_td]:border [&_td]:border-[#444] [&_td]:px-1.5 [&_td]:py-0.5 [&_th]:border [&_th]:border-[#444] [&_th]:px-1.5 [&_th]:py-0.5">
          <thead>
            <tr>
              <th className="text-left">Marker</th><th className="text-right">Rasio</th><th className="text-right">Gambar</th>
              <th className="text-right">Panjang + tambahan (cm)</th><th className="text-right">Lebar marker (cm)</th><th className="text-right">Ampar</th>
              <th className="text-right">Efisiensi per 1 ampar (cm/pcs)</th><th className="text-right">Kebutuhan (cm)</th><th className="text-right">Kebutuhan (yard)</th>
            </tr>
          </thead>
          <tbody>
            {plan.markers.map((m, k) => {
              const r = R.markers[k];
              return (
                <tr key={m.id}>
                  <td>{k + 1}</td><td className="text-right">{ratioLabel(sizes, m)}</td><td className="text-right">{r.gambar}</td>
                  <td className="text-right">{f(r.panjangTotal)}</td><td className="text-right">{m.lebar ? f(m.lebar) : "-"}</td><td className="text-right">{r.ampar}</td>
                  <td className="text-right">{f(r.cmPerPcs)}</td><td className="text-right">{f(r.cm)}</td><td className="text-right">{f(r.yard, 1, 1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <table className="mt-3 w-full border-collapse tabular-nums [&_td]:border [&_td]:border-[#444] [&_td]:px-1.5 [&_td]:py-1">
          <tbody>
            <tr><td className="w-1/2 font-bold">ESTIMASI KEBUTUHAN BAHAN BAKU</td><td className="w-6"></td><td className="text-right font-bold">{f(R.yard, 1, 1)} yard</td></tr>
            <tr><td>ALLOWANCE{plan.allowance ? ` (${plan.allowance})` : ""}</td><td className="text-center">=</td><td className="text-right">{f(R.allowanceYard, 1, 1)} yard</td></tr>
            <tr><td className="font-bold">TOTAL KEBUTUHAN</td><td className="text-center">=</td><td className="text-right"><b>{f(R.totalYard, 1, 1)} yard</b> ({f(R.totalYardPerPcs, 2, 2)} yard/pcs)</td></tr>
          </tbody>
        </table>
        <table className="mt-3 w-full border-collapse tabular-nums [&_td]:border [&_td]:border-[#444] [&_td]:px-1.5 [&_td]:py-2">
          <tbody>
            <tr><td className="w-1/2 font-bold">TOTAL PEMAKAIAN</td><td className="w-6 text-center">=</td><td className="text-right">{plan.pemakaianAktual != null ? `${f(plan.pemakaianAktual, 1, 1)} yard` : ""}</td></tr>
            <tr><td className="font-bold">SISA PEMAKAIAN</td><td className="text-center">=</td><td className="text-right">{sisaKain != null ? `${sisaKain < 0 ? "-" : ""}${f(Math.abs(sisaKain), 1, 1)} yard` : ""}</td></tr>
          </tbody>
        </table>
        {plan.markers.some((m) => m.images.length) && (
          <div className="break-before-page">
            <h2 className="mb-1 text-sm font-semibold">Gambar marker</h2>
            {plan.markers.map((m, k) =>
              m.images.map((src) => (
                <figure key={src} className="mb-2 break-inside-avoid">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Marker ${k + 1}`} className="max-h-[150mm] max-w-full border border-[#888]" />
                  <figcaption className="text-[10px]">Marker {k + 1}</figcaption>
                </figure>
              ))
            )}
          </div>
        )}
        <p className="mt-3 text-center text-[10px] text-[#444]">Dibuat oleh Wahyu Muhamad Hilmi · Divisi Marker</p>
      </div>

      {toast && <Toast message={toast} />}
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#898781]">{label}</p>
      <p className="font-medium text-[#0b0b0b]">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-0.5 block text-[#52514e]">{label}</span>
      {children}
    </label>
  );
}

function Kv({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[#898781]">{label}</p>
      <p className="text-sm font-semibold tabular-nums text-[#0b0b0b]">{value}</p>
    </div>
  );
}

function Row({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: "good" | "bad" }) {
  const toneCls = tone === "good" ? "text-[#0a8a0a]" : tone === "bad" ? "text-[#a82f2f]" : "text-[#0b0b0b]";
  return (
    <tr className="border-t border-[#eeede9]">
      <td className={`py-2 ${strong ? "font-semibold text-[#0b0b0b]" : "text-[#52514e]"}`}>{label}</td>
      <td className={`py-2 text-right ${strong ? "font-semibold" : ""} ${toneCls}`}>{value}</td>
    </tr>
  );
}
