"use client";

import { useState } from "react";
import { DEMO_TODAY } from "@/lib/dummy-data";
import { formatNumber, formatRupiah } from "@/lib/format";
import type { Po } from "@/lib/po-data";

type SizeDraft = { size: string; qty: string };
type VariantDraft = { warna: string; bahan: string; lebarKain: string; sizes: SizeDraft[] };
type ItemDraft = { artikel: string; hargaJual: string; variants: VariantDraft[] };

const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"];
const newVariant = (): VariantDraft => ({
  warna: "",
  bahan: "",
  lebarKain: "180",
  sizes: DEFAULT_SIZES.map((size) => ({ size, qty: "" })),
});
const newItem = (): ItemDraft => ({ artikel: "", hargaJual: "", variants: [newVariant()] });

const input =
  "w-full rounded-lg border border-[#e1e0d9] px-3 py-2 text-sm outline-none focus:border-[#2a78d6]";
const smallBtn = "rounded-lg px-2.5 py-1 text-xs font-medium";

const qtyOf = (v: VariantDraft) => v.sizes.reduce((a, s) => a + (Number(s.qty) || 0), 0);

export default function NewPoForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (po: Omit<Po, "id" | "noPo">) => void;
  onCancel: () => void;
}) {
  const [namaPo, setNamaPo] = useState("");
  const [brand, setBrand] = useState("");
  const [tanggalKirim, setTanggalKirim] = useState("");
  const [items, setItems] = useState<ItemDraft[]>([newItem()]);
  const [error, setError] = useState<string | null>(null);

  const setItem = (i: number, patch: Partial<ItemDraft>) =>
    setItems((prev) => prev.map((it, k) => (k === i ? { ...it, ...patch } : it)));
  const setVariant = (i: number, j: number, patch: Partial<VariantDraft>) =>
    setItem(i, { variants: items[i].variants.map((v, k) => (k === j ? { ...v, ...patch } : v)) });
  const setSize = (i: number, j: number, s: number, patch: Partial<SizeDraft>) =>
    setVariant(i, j, { sizes: items[i].variants[j].sizes.map((x, k) => (k === s ? { ...x, ...patch } : x)) });

  const totalQty = items.reduce((a, it) => a + it.variants.reduce((b, v) => b + qtyOf(v), 0), 0);
  const totalNilai = items.reduce(
    (a, it) => a + (Number(it.hargaJual) || 0) * it.variants.reduce((b, v) => b + qtyOf(v), 0),
    0
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!namaPo.trim() || !brand.trim() || !tanggalKirim) return setError("Lengkapi nama PO, brand, dan tanggal kirim.");
    for (const [i, it] of items.entries()) {
      if (!it.artikel.trim() || !Number(it.hargaJual)) return setError(`Item ${i + 1}: isi nama artikel dan harga jual.`);
      for (const v of it.variants) {
        if (!v.warna.trim() || !v.bahan.trim()) return setError(`Item ${i + 1}: setiap warna perlu nama warna dan bahan.`);
        if (!qtyOf(v)) return setError(`Item ${i + 1} warna ${v.warna}: isi qty minimal satu ukuran.`);
      }
    }
    const stamp = Date.now();
    onSubmit({
      namaPo: namaPo.trim(),
      brand: brand.trim(),
      tanggalMasuk: DEMO_TODAY,
      tanggalKirim,
      stage: "order_kain",
      terkirim: false,
      dp: [],
      materialCost: [],
      serviceCost: [],
      items: items.map((it, i) => ({
        id: `it-${stamp}-${i}`,
        artikel: it.artikel.trim(),
        hargaJual: Number(it.hargaJual),
        variants: it.variants.map((v, j) => ({
          id: `v-${stamp}-${i}-${j}`,
          warna: v.warna.trim(),
          bahan: v.bahan.trim(),
          lebarKain: Number(v.lebarKain) || 0,
          kgMasuk: null,
          sizes: v.sizes
            .filter((s) => s.size.trim() && Number(s.qty) > 0)
            .map((s) => ({ size: s.size.trim(), qty: Number(s.qty) })),
        })),
      })),
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-[#52514e]">Nama PO</span>
          <input value={namaPo} onChange={(e) => setNamaPo(e.target.value)} className={input} placeholder="Twinhue" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-[#52514e]">Brand / customer</span>
          <input value={brand} onChange={(e) => setBrand(e.target.value)} className={input} placeholder="Suma Apparel" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-[#52514e]">Tanggal kirim</span>
          <input type="date" value={tanggalKirim} onChange={(e) => setTanggalKirim(e.target.value)} className={input} />
        </label>
      </div>

      {items.map((it, i) => (
        <fieldset key={i} className="rounded-xl border border-[#e1e0d9] p-4">
          <div className="mb-3 flex items-center justify-between">
            <legend className="text-sm font-semibold text-[#0b0b0b]">Item {i + 1}</legend>
            {items.length > 1 && (
              <button type="button" onClick={() => setItems(items.filter((_, k) => k !== i))}
                className={`${smallBtn} text-[#a82f2f] hover:bg-[#fdecec]`}>
                Hapus item
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-[#52514e]">Artikel / nama barang</span>
              <input value={it.artikel} onChange={(e) => setItem(i, { artikel: e.target.value })} className={input} placeholder="Tank Top" />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-[#52514e]">Harga jual per pcs (Rp)</span>
              <input type="number" min={0} value={it.hargaJual} onChange={(e) => setItem(i, { hargaJual: e.target.value })} className={input} placeholder="65000" />
            </label>
          </div>

          <div className="mt-4 space-y-3">
            {it.variants.map((v, j) => (
              <div key={j} className="rounded-lg bg-[#fafaf9] p-3 ring-1 ring-inset ring-[#eeede9]">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_110px_auto]">
                  <input value={v.warna} onChange={(e) => setVariant(i, j, { warna: e.target.value })} className={input} placeholder="Warna (Hitam)" aria-label="Warna" />
                  <input value={v.bahan} onChange={(e) => setVariant(i, j, { bahan: e.target.value })} className={input} placeholder="Bahan (Cotton Combed 24s)" aria-label="Bahan" />
                  <input type="number" min={0} value={v.lebarKain} onChange={(e) => setVariant(i, j, { lebarKain: e.target.value })} className={input} placeholder="Lebar cm" aria-label="Lebar kain (cm)" />
                  {it.variants.length > 1 ? (
                    <button type="button" onClick={() => setItem(i, { variants: it.variants.filter((_, k) => k !== j) })}
                      className={`${smallBtn} text-[#a82f2f] hover:bg-[#fdecec]`}>Hapus</button>
                  ) : <span />}
                </div>
                <div className="mt-2 flex flex-wrap items-end gap-2">
                  {v.sizes.map((s, k) => (
                    <div key={k} className="w-16 text-center text-xs">
                      <input value={s.size} onChange={(e) => setSize(i, j, k, { size: e.target.value })}
                        className="mb-1 w-full rounded border border-transparent bg-transparent text-center font-medium text-[#898781] outline-none focus:border-[#e1e0d9] focus:bg-white" aria-label="Label ukuran" />
                      <input type="number" min={0} value={s.qty} onChange={(e) => setSize(i, j, k, { qty: e.target.value })}
                        className="w-full rounded-lg border border-[#e1e0d9] bg-white px-1 py-1.5 text-center text-sm outline-none focus:border-[#2a78d6]" aria-label={`Qty ${s.size}`} />
                    </div>
                  ))}
                  <button type="button" onClick={() => setVariant(i, j, { sizes: [...v.sizes, { size: "", qty: "" }] })}
                    className={`${smallBtn} border border-dashed border-[#c9c7bf] text-[#52514e] hover:bg-white`}>+ Ukuran</button>
                  <span className="ml-auto text-xs text-[#52514e]">{formatNumber(qtyOf(v))} pcs</span>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setItem(i, { variants: [...it.variants, newVariant()] })}
              className={`${smallBtn} text-[#1f5aa8] hover:bg-[#e9f1fc]`}>+ Tambah warna</button>
          </div>
        </fieldset>
      ))}

      <button type="button" onClick={() => setItems([...items, newItem()])}
        className="w-full rounded-xl border-2 border-dashed border-[#e1e0d9] py-2.5 text-sm font-medium text-[#52514e] hover:border-[#2a78d6] hover:text-[#1f5aa8]">
        + Tambah item
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e1e0d9] pt-4">
        <p className="text-sm text-[#52514e]">
          Total {formatNumber(totalQty)} pcs · <span className="font-semibold text-[#0b0b0b]">{formatRupiah(totalNilai)}</span>
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium text-[#52514e] hover:bg-[#f4f3f0]">Batal</button>
          <button type="submit" className="rounded-lg bg-[#2a78d6] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f5aa8]">Simpan PO</button>
        </div>
      </div>
      {error && <p className="text-sm text-[#a82f2f]">{error}</p>}
    </form>
  );
}
