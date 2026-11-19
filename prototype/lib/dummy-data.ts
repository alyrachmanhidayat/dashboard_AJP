// All data on this page is fictional, generated for a sales demo only.

export const DEMO_TODAY = "2026-09-19";

/** One invoice per PO: total PO (sum of item qty x harga jual) minus all DP = tagihan. */
export type Invoice = {
  id: number;
  invoiceNumber: string;
  poId: string;
  noPo: string;
  namaPo: string;
  brand: string;
  totalPo: number;
  dpAmount: number;
  /** Amount billed = totalPo - dpAmount. */
  totalAmount: number;
  paidAmount: number;
  isPaid: boolean;
  issuedDate: string;
  payments: { date: string; amount: number }[];
};

const inv = (
  id: number,
  invoiceNumber: string,
  noPo: string,
  namaPo: string,
  brand: string,
  totalPo: number,
  dpAmount: number,
  issuedDate: string,
  payments: { date: string; amount: number }[]
): Invoice => {
  const totalAmount = totalPo - dpAmount;
  const paidAmount = payments.reduce((a, p) => a + p.amount, 0);
  return {
    id, invoiceNumber, poId: `old-${id}`, noPo, namaPo, brand, totalPo, dpAmount, totalAmount,
    paidAmount, isPaid: paidAmount >= totalAmount, issuedDate, payments,
  };
};

export const unpaidInvoices: Invoice[] = [
  inv(5001, "INV/08/2026/0014", "PO/08/2026/0022", "Kaos Event Ulang Tahun", "PT Sinergi Busana", 170 * 72000, 4_000_000, "2026-08-25", [{ date: "2026-09-01", amount: 3_000_000 }]),
  inv(5002, "INV/08/2026/0016", "PO/08/2026/0024", "Oversize Drop Kedua", "Distro Kece Store", 200 * 85000, 5_000_000, "2026-08-28", []),
  inv(5003, "INV/09/2026/0003", "PO/08/2026/0027", "Seragam Olahraga 2025", "SMA Negeri 3 Bandung", 245 * 68000, 6_000_000, "2026-09-01", [{ date: "2026-09-05", amount: 4_000_000 }]),
];

export const paidInvoices: Invoice[] = [
  inv(4001, "INV/07/2026/0032", "PO/07/2026/0011", "Kaos Polos Stock Juli", "PT Grosir Pakaian Nusantara", 380 * 55000, 6_000_000, "2026-07-10", [{ date: "2026-07-18", amount: 380 * 55000 - 6_000_000 }]),
  inv(4002, "INV/07/2026/0029", "PO/07/2026/0014", "Rompi Proyek Batch Juni", "UD Konveksi Jaya Abadi", 120 * 95000, 3_000_000, "2026-07-14", [{ date: "2026-07-20", amount: 120 * 95000 - 3_000_000 }]),
  inv(4003, "INV/08/2026/0009", "PO/08/2026/0003", "Gamis Seragam Agustus", "CV Anggun Fashion", 210 * 120000, 8_000_000, "2026-08-05", [{ date: "2026-08-12", amount: 210 * 120000 - 8_000_000 }]),
];

// 12-month trend, ending at the demo month (Sep 2026)
export const omzetTrend = [
  { month: "Okt 2025", revenue: 148_500_000 },
  { month: "Nov 2025", revenue: 162_300_000 },
  { month: "Des 2025", revenue: 205_800_000 },
  { month: "Jan 2026", revenue: 131_200_000 },
  { month: "Feb 2026", revenue: 158_900_000 },
  { month: "Mar 2026", revenue: 176_400_000 },
  { month: "Apr 2026", revenue: 169_700_000 },
  { month: "Mei 2026", revenue: 184_200_000 },
  { month: "Jun 2026", revenue: 198_600_000 },
  { month: "Jul 2026", revenue: 212_900_000 },
  { month: "Agu 2026", revenue: 227_100_000 },
  { month: "Sep 2026", revenue: 143_800_000 },
];

/** Pieces recorded as reject or hilang per month. */
export const rejectTrend = [
  { month: "Okt 2025", rejected: 14 },
  { month: "Nov 2025", rejected: 9 },
  { month: "Des 2025", rejected: 21 },
  { month: "Jan 2026", rejected: 17 },
  { month: "Feb 2026", rejected: 8 },
  { month: "Mar 2026", rejected: 12 },
  { month: "Apr 2026", rejected: 5 },
  { month: "Mei 2026", rejected: 11 },
  { month: "Jun 2026", rejected: 7 },
  { month: "Jul 2026", rejected: 15 },
  { month: "Agu 2026", rejected: 10 },
  { month: "Sep 2026", rejected: 9 },
];

export type UrgencyTone = "critical" | "warning" | "good" | "info";

export function urgencyTone(daysLeft: number): UrgencyTone {
  if (daysLeft <= 8) return "critical";
  if (daysLeft <= 10) return "warning";
  if (daysLeft <= 12) return "good";
  return "info";
}
