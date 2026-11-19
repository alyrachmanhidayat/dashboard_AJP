// All data on this file is fictional, generated for a sales demo only.
import type { Marker, SizeQty } from "./marker";

export const PRODUCTION_STAGES = [
  { key: "order_kain", label: "Order Kain", short: "Order" },
  { key: "dateng_bahan", label: "Dateng Bahan", short: "Bahan" },
  { key: "marker", label: "Marker", short: "Marker" },
  { key: "cutting", label: "Cutting", short: "Cutting" },
  { key: "sablon", label: "Sablon", short: "Sablon" },
  { key: "sewing", label: "Sewing", short: "Sewing" },
  { key: "finishing", label: "Finishing", short: "Finish" },
  { key: "pengiriman", label: "Pengiriman", short: "Kirim" },
] as const;

export type StageKey = (typeof PRODUCTION_STAGES)[number]["key"];

export function stageIndex(key: StageKey): number {
  return PRODUCTION_STAGES.findIndex((s) => s.key === key);
}

/** One fabric colour of a PO item. Each colour has its own marker plan. */
export type ColorVariant = {
  id: string;
  warna: string;
  bahan: string;
  /** Fabric width in cm. */
  lebarKain: number;
  /** Fabric received (Dateng Bahan) in kg. KG is only used when buying / receiving fabric. */
  kgMasuk: number | null;
  sizes: SizeQty[];
};

export type PoItem = {
  id: string;
  artikel: string;
  /** Selling price per piece. */
  hargaJual: number;
  variants: ColorVariant[];
};

export type CostLine = {
  tanggal: string;
  unit: string;
  qty: number;
  satuan: "KG" | "PCS" | "YARD";
  harga: number;
};

export type Dp = {
  tanggal: string;
  jenis: "bahan" | "uang";
  nominal: number;
  keterangan: string;
};

/** Pieces lost from Sewing onward: categorised as stok, reject, or hilang (reject/hilang need a reason + PIC). */
export type LossRecord = {
  id: number;
  tanggal: string;
  noPo: string;
  namaPo: string;
  artikel: string;
  warna: string;
  size: string;
  qty: number;
  hargaJual: number;
  tahap: "Sewing" | "Finishing" | "Pengiriman";
  kategori: "stok" | "reject" | "hilang";
  alasan: string;
  pic: string;
};

export type Po = {
  id: string;
  noPo: string;
  /** PO name, e.g. "Twinhue" — one PO can contain many colours. */
  namaPo: string;
  brand: string;
  tanggalMasuk: string;
  tanggalKirim: string;
  stage: StageKey;
  /** True once the last stage (Pengiriman) is done — PO is ready for invoicing. */
  terkirim: boolean;
  /** Staged down payments, fabric or cash. */
  dp: Dp[];
  items: PoItem[];
  materialCost: CostLine[];
  serviceCost: CostLine[];
};

export type MarkerPlan = {
  variantId: string;
  markers: Marker[];
  /** Allowance as yard ("5") or percentage ("5%"). */
  allowance: string;
  status: "draft" | "final";
  /** Filled at Cutting: actual fabric used, in yard (same unit as the marker plan). */
  pemakaianAktual: number | null;
};

/** Fee percentages — DUMMY values, still need validation with the customer. Base: total invoice (harga jual). */
export const FEE_RULES = [
  { key: "alddy", label: "Fee Alddy", percent: 2 },
  { key: "wawan", label: "Fee Wawan", percent: 1.5 },
] as const;

const sz = (pairs: [string, number][]): SizeQty[] => pairs.map(([size, qty]) => ({ size, qty }));

const mk = (
  id: string,
  ratio: Record<string, number>,
  panjang: number,
  lebar: number,
  tambahan = 2
): Marker => ({ id, ratio, panjang, tambahan, lebar, auto: true, ampar: 0, images: [] });

export const initialPos: Po[] = [
  {
    id: "po-twinhue",
    noPo: "PO/09/2026/0007",
    namaPo: "Twinhue",
    brand: "Suma Apparel",
    tanggalMasuk: "2026-09-12",
    tanggalKirim: "2026-10-10",
    stage: "marker",
    terkirim: false,
    dp: [
      { tanggal: "2026-09-12", jenis: "bahan", nominal: 7_616_000, keterangan: "Kain Cotton Combed 24s 68 kg dari customer" },
      { tanggal: "2026-09-14", jenis: "uang", nominal: 5_000_000, keterangan: "Transfer BCA" },
    ],
    items: [
      {
        id: "it-tank",
        artikel: "Tank Top Twinhue",
        hargaJual: 65000,
        variants: [
          { id: "v-tank-hitam", warna: "Hitam", bahan: "Cotton Combed 24s", lebarKain: 180, kgMasuk: 38, sizes: sz([["S", 20], ["M", 40], ["L", 50], ["XL", 30]]) },
          { id: "v-tank-abu", warna: "Abu Misty", bahan: "Cotton Combed 24s", lebarKain: 180, kgMasuk: 30, sizes: sz([["S", 15], ["M", 35], ["L", 40], ["XL", 20]]) },
        ],
      },
      {
        id: "it-kaos",
        artikel: "Kaos Oversize Twinhue",
        hargaJual: 85000,
        variants: [
          { id: "v-kaos-navy", warna: "Navy", bahan: "Cotton Combed 20s", lebarKain: 180, kgMasuk: 42, sizes: sz([["M", 30], ["L", 40], ["XL", 30]]) },
        ],
      },
    ],
    materialCost: [
      { tanggal: "2026-09-13", unit: "Cotton Combed 24s Hitam", qty: 38, satuan: "KG", harga: 112000 },
      { tanggal: "2026-09-13", unit: "Cotton Combed 24s Abu Misty", qty: 30, satuan: "KG", harga: 112000 },
      { tanggal: "2026-09-14", unit: "Cotton Combed 20s Navy", qty: 42, satuan: "KG", harga: 118000 },
    ],
    serviceCost: [
      { tanggal: "2026-09-16", unit: "Sablon 2 warna", qty: 350, satuan: "PCS", harga: 9000 },
      { tanggal: "2026-09-16", unit: "Jahit (CMT)", qty: 350, satuan: "PCS", harga: 12000 },
    ],
  },
  {
    id: "po-3991",
    noPo: "PO/09/2026/3991",
    namaPo: "Baros TAC",
    brand: "Tachsen",
    tanggalMasuk: "2026-09-05",
    tanggalKirim: "2026-10-02",
    stage: "cutting",
    terkirim: false,
    dp: [{ tanggal: "2026-09-05", jenis: "uang", nominal: 10_000_000, keterangan: "DP 30%" }],
    items: [
      {
        id: "it-baros",
        artikel: "Baros TAC T Pendek",
        hargaJual: 175000,
        variants: [
          { id: "v-baros-khaki", warna: "Khaki", bahan: "Ripstop Baby", lebarKain: 150, kgMasuk: 64, sizes: sz([["M", 30], ["L", 71], ["XL", 50], ["XXL", 30]]) },
        ],
      },
    ],
    materialCost: [
      { tanggal: "2026-09-06", unit: "Ripstop Baby Khaki", qty: 64, satuan: "KG", harga: 145000 },
    ],
    serviceCost: [
      { tanggal: "2026-09-10", unit: "Bordir logo dada", qty: 181, satuan: "PCS", harga: 7500 },
      { tanggal: "2026-09-10", unit: "Jahit kemeja (CMT)", qty: 181, satuan: "PCS", harga: 32000 },
    ],
  },
  {
    id: "po-skyblue",
    noPo: "PO/08/2026/0031",
    namaPo: "Sky Blue",
    brand: "Suma Apparel",
    tanggalMasuk: "2026-08-25",
    tanggalKirim: "2026-09-26",
    stage: "sewing",
    terkirim: false,
    dp: [{ tanggal: "2026-08-25", jenis: "bahan", nominal: 10_120_000, keterangan: "Kain Sky Blue 92 kg dari customer" }],
    items: [
      {
        id: "it-sky",
        artikel: "Tank Top",
        hargaJual: 62000,
        variants: [
          { id: "v-sky-blue", warna: "Sky Blue", bahan: "Cotton Combed 24s", lebarKain: 180, kgMasuk: 92, sizes: sz([["S", 60], ["M", 120], ["L", 160], ["XL", 100]]) },
        ],
      },
    ],
    materialCost: [
      { tanggal: "2026-08-26", unit: "Cotton Combed 24s Sky Blue", qty: 92, satuan: "KG", harga: 110000 },
    ],
    serviceCost: [
      { tanggal: "2026-09-02", unit: "Sablon 1 warna", qty: 440, satuan: "PCS", harga: 6500 },
      { tanggal: "2026-09-08", unit: "Jahit (CMT)", qty: 440, satuan: "PCS", harga: 11000 },
    ],
  },
  {
    id: "po-futsal",
    noPo: "PO/09/2026/0009",
    namaPo: "Jersey Futsal Korporat",
    brand: "PT Sportindo Utama",
    tanggalMasuk: "2026-09-17",
    tanggalKirim: "2026-10-20",
    stage: "order_kain",
    terkirim: false,
    dp: [],
    items: [
      {
        id: "it-jersey",
        artikel: "Jersey Futsal",
        hargaJual: 120000,
        variants: [
          { id: "v-jersey-merah", warna: "Merah", bahan: "Interlock Dryfit", lebarKain: 170, kgMasuk: null, sizes: sz([["S", 10], ["M", 30], ["L", 35], ["XL", 15]]) },
          { id: "v-jersey-putih", warna: "Putih", bahan: "Interlock Dryfit", lebarKain: 170, kgMasuk: null, sizes: sz([["S", 10], ["M", 30], ["L", 35], ["XL", 15]]) },
        ],
      },
    ],
    materialCost: [],
    serviceCost: [],
  },
  simplePo("po-hoodie", "PO/09/2026/0002", "Hoodie Komunitas Motor", "PT Sinergi Busana", "2026-09-04", "2026-09-26", "sablon",
    "Hoodie Zipper", 165000, "Hitam", "Fleece 320gsm", 180, 96, [["M", 60], ["L", 70], ["XL", 30], ["XXL", 10]], 15_000_000),
  simplePo("po-polo", "PO/09/2026/0004", "Polo Kantor", "CV Mitra Garmen Sejahtera", "2026-09-06", "2026-09-27", "finishing",
    "Polo Shirt", 95000, "Putih", "Lacoste CVC", 180, 52, [["S", 15], ["M", 45], ["L", 50], ["XL", 20]], 4_000_000),
  simplePo("po-gamis", "PO/09/2026/0008", "Gamis Majelis Taklim", "CV Anggun Fashion", "2026-09-15", "2026-10-05", "dateng_bahan",
    "Gamis", 145000, "Hijau Botol", "Kastina Premium", 150, null, [["S", 25], ["M", 55], ["L", 60], ["XL", 25]], 6_000_000),
  { ...simplePo("po-piyama", "PO/08/2026/0035", "Piyama Anak Grosir", "CV Baju Anak Ceria", "2026-08-20", "2026-09-12", "pengiriman",
    "Setelan Piyama Anak", 58000, "Pink Pastel", "Cotton Combed 30s", 180, 40, [["S", 30], ["M", 40], ["L", 30]], 1_500_000), terkirim: true },
  { ...simplePo("po-rompi", "PO/08/2026/0038", "Rompi Proyek Bangun Karya", "UD Konveksi Jaya Abadi", "2026-08-24", "2026-09-15", "pengiriman",
    "Rompi Proyek", 98000, "Oranye", "Parasut Waterproof", 150, 33, [["M", 25], ["L", 30], ["XL", 25]], 2_500_000), terkirim: true },
];

/** Compact builder for demo POs with a single item and colour. */
function simplePo(
  id: string, noPo: string, namaPo: string, brand: string, tanggalMasuk: string, tanggalKirim: string, stage: StageKey,
  artikel: string, hargaJual: number, warna: string, bahan: string, lebarKain: number, kgMasuk: number | null,
  sizes: [string, number][], dpUang: number
): Po {
  const qty = sizes.reduce((a, [, q]) => a + q, 0);
  const done = stageIndex(stage);
  return {
    id, noPo, namaPo, brand, tanggalMasuk, tanggalKirim, stage, terkirim: false,
    dp: dpUang ? [{ tanggal: tanggalMasuk, jenis: "uang", nominal: dpUang, keterangan: "DP awal" }] : [],
    items: [{ id: `it-${id}`, artikel, hargaJual, variants: [{ id: `v-${id}`, warna, bahan, lebarKain, kgMasuk, sizes: sz(sizes) }] }],
    materialCost: kgMasuk ? [{ tanggal: tanggalMasuk, unit: `${bahan} ${warna}`, qty: kgMasuk, satuan: "KG", harga: 105000 }] : [],
    serviceCost: done >= stageIndex("sablon") ? [
      { tanggal: tanggalMasuk, unit: "Sablon / bordir", qty, satuan: "PCS", harga: 8000 },
      { tanggal: tanggalMasuk, unit: "Jahit (CMT)", qty, satuan: "PCS", harga: 14000 },
    ] : [],
  };
}

export const initialMarkerPlans: Record<string, MarkerPlan> = {
  "v-tank-hitam": {
    variantId: "v-tank-hitam",
    markers: [mk("m-th-1", { S: 1, M: 2, L: 2, XL: 1 }, 380, 176), mk("m-th-2", { L: 1, XL: 1 }, 150, 176)],
    allowance: "3%",
    status: "final",
    pemakaianAktual: null,
  },
  "v-tank-abu": {
    variantId: "v-tank-abu",
    markers: [mk("m-ta-1", { S: 1, M: 2, L: 2, XL: 1 }, 380, 176), mk("m-ta-2", { M: 1, L: 1 }, 0, 176)],
    allowance: "3%",
    status: "draft",
    pemakaianAktual: null,
  },
  // Same numbers as the sample print "po 3991.pdf"
  "v-baros-khaki": {
    variantId: "v-baros-khaki",
    markers: [mk("m-b-1", { M: 1, L: 2, XL: 1, XXL: 1 }, 647.5, 146), mk("m-b-2", { L: 1, XL: 2 }, 392, 146)],
    allowance: "5%",
    status: "final",
    pemakaianAktual: null,
  },
  "v-sky-blue": {
    variantId: "v-sky-blue",
    markers: [mk("m-s-1", { S: 1, M: 2, L: 3, XL: 2 }, 520, 176), mk("m-s-2", { S: 1, M: 2, L: 1 }, 260, 176)],
    allowance: "3%",
    status: "final",
    pemakaianAktual: 318,
  },
  "v-po-hoodie": { variantId: "v-po-hoodie", markers: [mk("m-h-1", { M: 2, L: 2, XL: 1 }, 610, 176), mk("m-h-2", { M: 1, L: 1, XXL: 1 }, 330, 176)], allowance: "3%", status: "final", pemakaianAktual: 268 },
  "v-po-polo": { variantId: "v-po-polo", markers: [mk("m-p-1", { S: 1, M: 3, L: 3, XL: 1 }, 640, 176), mk("m-p-2", { L: 2, XL: 2 }, 300, 176)], allowance: "3%", status: "final", pemakaianAktual: 165 },
  "v-po-piyama": { variantId: "v-po-piyama", markers: [mk("m-y-1", { S: 1, M: 1, L: 1 }, 290, 176)], allowance: "3%", status: "final", pemakaianAktual: 98 },
  "v-po-rompi": { variantId: "v-po-rompi", markers: [mk("m-r-1", { M: 1, L: 1, XL: 1 }, 260, 146)], allowance: "3%", status: "final", pemakaianAktual: 74 },
};

export const lossRecords: LossRecord[] = [
  { id: 1, tanggal: "2026-09-10", noPo: "PO/08/2026/0031", namaPo: "Sky Blue", artikel: "Tank Top", warna: "Sky Blue", size: "L", qty: 3, hargaJual: 62000, tahap: "Sewing", kategori: "reject", alasan: "Jahitan ketiak miring, tidak bisa diperbaiki", pic: "Vendor Sewing B — Pak Darto" },
  { id: 2, tanggal: "2026-09-11", noPo: "PO/08/2026/0031", namaPo: "Sky Blue", artikel: "Tank Top", warna: "Sky Blue", size: "M", qty: 2, hargaJual: 62000, tahap: "Sewing", kategori: "hilang", alasan: "Selisih hitung saat serah terima dari vendor", pic: "Vendor Sewing B — Pak Darto" },
  { id: 3, tanggal: "2026-09-12", noPo: "PO/08/2026/0031", namaPo: "Sky Blue", artikel: "Tank Top", warna: "Sky Blue", size: "XL", qty: 4, hargaJual: 62000, tahap: "Sewing", kategori: "stok", alasan: "Lebih potong, masuk stok barang jadi", pic: "Admin Gudang — Rina" },
  { id: 4, tanggal: "2026-09-13", noPo: "PO/09/2026/0004", namaPo: "Polo Kantor", artikel: "Polo Shirt", warna: "Putih", size: "M", qty: 2, hargaJual: 95000, tahap: "Finishing", kategori: "reject", alasan: "Noda tinta sablon di bagian dada", pic: "QC Finishing — Asep" },
  { id: 5, tanggal: "2026-09-14", noPo: "PO/08/2026/0038", namaPo: "Rompi Proyek Bangun Karya", artikel: "Rompi Proyek", warna: "Oranye", size: "L", qty: 1, hargaJual: 98000, tahap: "Pengiriman", kategori: "hilang", alasan: "Kurang 1 pcs saat diterima customer", pic: "Kurir — Budi" },
];

export function allVariants(po: Po) {
  return po.items.flatMap((item) => item.variants.map((variant) => ({ item, variant })));
}

export function poTotalQty(po: Po): number {
  return allVariants(po).reduce((sum, { variant }) => sum + variant.sizes.reduce((a, s) => a + s.qty, 0), 0);
}

export function poTotalInvoice(po: Po): number {
  return po.items.reduce(
    (sum, item) => sum + item.hargaJual * item.variants.reduce((a, v) => a + v.sizes.reduce((b, s) => b + s.qty, 0), 0),
    0
  );
}

export const lineTotal = (l: CostLine) => l.qty * l.harga;

export function poTotalDp(po: Po): number {
  return po.dp.reduce((a, d) => a + d.nominal, 0);
}

/** Rough progress: share of stages already passed (100% once terkirim). */
export function poProgress(po: Po): number {
  if (po.terkirim) return 100;
  return Math.round((stageIndex(po.stage) / PRODUCTION_STAGES.length) * 100);
}
