// Marker calculation, ported from "Hitung Kebutuhan Kain Potong.html" (Divisi Marker).
// Rules kept as-is:
// - Every marker except the last: ampar = the most layers that do not exceed the remaining qty of any size (floor).
// - Last marker: ampar = enough layers to cover everything still remaining (ceil) -> may overproduce a few pcs.
// - Kebutuhan per marker = (panjang + tambahan) x ampar, converted cm -> yard (1 yard = 91.44 cm).

export const CM_PER_YARD = 91.44;

export type SizeQty = { size: string; qty: number };

export type Marker = {
  id: string;
  /** Pieces per size in one layout, keyed by size label. */
  ratio: Record<string, number>;
  /** Marker length in cm. */
  panjang: number;
  /** Extra length added per layer, in cm (default 2). */
  tambahan: number;
  /** Marker width in cm (informational). */
  lebar: number;
  /** When true, ampar is calculated automatically. */
  auto: boolean;
  /** Manual ampar (only used when auto = false). */
  ampar: number;
  /** Screenshot URLs of the marker layout. */
  images: string[];
};

export type MarkerResult = {
  ampar: number;
  /** Pieces produced per size (same order as sizes). */
  produced: number[];
  /** PO qty still remaining per size after this marker. */
  remaining: number[];
  gambar: number;
  panjangTotal: number;
  cm: number;
  yard: number;
  cmPerPcs: number;
  yardPerPcs: number;
};

export type PlanResult = {
  markers: MarkerResult[];
  /** Total produced per size across all markers. */
  produced: number[];
  totalPo: number;
  totalProduced: number;
  /** Estimated fabric need, before allowance. */
  yard: number;
  allowanceYard: number;
  /** Total fabric need incl. allowance (what Cutting will use as the plan). */
  totalYard: number;
  yardPerPcs: number;
  totalYardPerPcs: number;
};

/** Round up to 1 decimal (same as the original tool). */
export const ceil1 = (x: number) => Math.ceil(x * 10 - 1e-9) / 10;
/** Round up to 2 decimals. */
export const ceil2 = (x: number) => Math.ceil(x * 100 - 1e-9) / 100;

/** Parses "5", "2,5", "5%", "60x5", "10+5" the same way the original tool does. */
function evalExpr(input: string): number {
  return input
    .toLowerCase()
    .replace(/yard|yd|y/g, "")
    .replace(/,/g, ".")
    .split("+")
    .reduce((total, term) => {
      if (!term.trim()) return total;
      return total + term.split(/[x×*]/).reduce((p, n) => p * (parseFloat(n) || 0), 1);
    }, 0);
}

/** Allowance in yard. Accepts a fixed yard value ("5") or a percentage of the need ("5%"). */
export function allowanceToYard(allowance: string, yard: number): number {
  const a = allowance.trim();
  if (!a) return 0;
  if (a.includes("%")) return ceil1((yard * evalExpr(a.replace("%", ""))) / 100);
  return ceil1(evalExpr(a));
}

export function computePlan(sizes: SizeQty[], markers: Marker[], allowance: string): PlanResult {
  let cumulative = sizes.map(() => 0);

  const results = markers.map((m, k): MarkerResult => {
    const ratio = sizes.map((s) => Math.max(0, Math.floor(m.ratio[s.size] || 0)));
    const remainingBefore = sizes.map((s, i) => Math.max(0, s.qty - cumulative[i]));
    const active = ratio.map((r, i) => [r, i] as const).filter(([r]) => r > 0);

    let ampar = Math.max(0, Math.floor(m.ampar) || 0);
    if (m.auto) {
      if (!active.length) ampar = 0;
      else if (k === markers.length - 1)
        ampar = Math.max(...active.map(([r, i]) => Math.ceil(remainingBefore[i] / r)));
      else ampar = Math.max(0, Math.min(...active.map(([r, i]) => Math.floor(remainingBefore[i] / r))));
    }

    const produced = ratio.map((r) => r * ampar);
    cumulative = cumulative.map((c, i) => c + produced[i]);

    const gambar = ratio.reduce((a, b) => a + b, 0);
    const panjangTotal = (m.panjang || 0) + (m.tambahan || 0);
    const cm = panjangTotal * ampar;
    const cmPerPcs = gambar ? panjangTotal / gambar : 0;

    return {
      ampar,
      produced,
      remaining: sizes.map((s, i) => Math.max(0, s.qty - cumulative[i])),
      gambar,
      panjangTotal,
      cm,
      yard: ceil1(cm / CM_PER_YARD),
      cmPerPcs,
      yardPerPcs: ceil2(cmPerPcs / CM_PER_YARD),
    };
  });

  const cmAll = results.reduce((a, r) => a + r.cm, 0);
  const totalProduced = cumulative.reduce((a, b) => a + b, 0);
  const totalPo = sizes.reduce((a, s) => a + s.qty, 0);
  const yard = ceil1(cmAll / CM_PER_YARD);
  const allowanceYard = allowanceToYard(allowance, yard);

  return {
    markers: results,
    produced: cumulative,
    totalPo,
    totalProduced,
    yard,
    allowanceYard,
    totalYard: ceil1(yard + allowanceYard),
    yardPerPcs: totalProduced ? ceil2(cmAll / CM_PER_YARD / totalProduced) : 0,
    totalYardPerPcs: totalProduced ? ceil2((yard + allowanceYard) / totalProduced) : 0,
  };
}

export function ratioLabel(sizes: SizeQty[], m: Marker): string {
  return sizes
    .filter((s) => (m.ratio[s.size] || 0) > 0)
    .map((s) => `${s.size} ${m.ratio[s.size]}`)
    .join(", ");
}

export function blankMarker(): Marker {
  return { id: `m-${Math.random().toString(36).slice(2, 9)}`, ratio: {}, panjang: 0, tambahan: 2, lebar: 0, auto: true, ampar: 0, images: [] };
}
