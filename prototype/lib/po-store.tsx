"use client";

import { createContext, useContext, useState } from "react";
import { DEMO_TODAY, paidInvoices, unpaidInvoices, type Invoice } from "./dummy-data";
import { blankMarker } from "./marker";
import {
  initialMarkerPlans,
  initialPos,
  poTotalDp,
  poTotalInvoice,
  PRODUCTION_STAGES,
  stageIndex,
  type MarkerPlan,
  type Po,
} from "./po-data";

type Selection = { poId: string; variantId: string };

type PoStore = {
  pos: Po[];
  plans: Record<string, MarkerPlan>;
  invoices: Invoice[];
  selection: Selection;
  select: (s: Selection) => void;
  /** Returns the plan for a colour, or a fresh blank draft if none exists yet. */
  getPlan: (variantId: string) => MarkerPlan;
  savePlan: (plan: MarkerPlan) => void;
  setPemakaian: (variantId: string, yard: number | null) => void;
  advanceStage: (poId: string) => void;
  addPo: (po: Omit<Po, "id" | "noPo">) => Po;
  /** Creates the single invoice for a delivered PO; returns it. */
  publishInvoice: (poId: string) => Invoice | null;
  pay: (invoiceId: number, amount: number) => Invoice | null;
};

const Ctx = createContext<PoStore | null>(null);

export function PoStoreProvider({ children }: { children: React.ReactNode }) {
  const [pos, setPos] = useState<Po[]>(initialPos);
  const [plans, setPlans] = useState<Record<string, MarkerPlan>>(initialMarkerPlans);
  const [invoices, setInvoices] = useState<Invoice[]>([...unpaidInvoices, ...paidInvoices]);
  const [selection, select] = useState<Selection>({
    poId: initialPos[0].id,
    variantId: initialPos[0].items[0].variants[0].id,
  });

  const getPlan = (variantId: string): MarkerPlan =>
    plans[variantId] ?? { variantId, markers: [blankMarker()], allowance: "3%", status: "draft", pemakaianAktual: null };

  const savePlan = (plan: MarkerPlan) => setPlans((prev) => ({ ...prev, [plan.variantId]: plan }));

  const setPemakaian = (variantId: string, yard: number | null) =>
    setPlans((prev) => ({ ...prev, [variantId]: { ...getPlan(variantId), ...prev[variantId], pemakaianAktual: yard } }));

  const advanceStage = (poId: string) =>
    setPos((prev) =>
      prev.map((po) => {
        if (po.id !== poId) return po;
        const idx = stageIndex(po.stage);
        if (idx === PRODUCTION_STAGES.length - 1) return { ...po, terkirim: true };
        return { ...po, stage: PRODUCTION_STAGES[idx + 1].key };
      })
    );

  const addPo = (data: Omit<Po, "id" | "noPo">): Po => {
    const seq = 10 + pos.filter((p) => p.noPo.startsWith("PO/09/2026/")).length;
    const po: Po = { ...data, id: `po-${Date.now()}`, noPo: `PO/09/2026/${String(seq).padStart(4, "0")}` };
    setPos((prev) => [po, ...prev]);
    select({ poId: po.id, variantId: po.items[0].variants[0].id });
    return po;
  };

  const publishInvoice = (poId: string): Invoice | null => {
    const po = pos.find((p) => p.id === poId);
    if (!po || invoices.some((i) => i.poId === poId)) return null;
    const seq = invoices.filter((i) => i.invoiceNumber.startsWith("INV/09/2026/")).length + 4;
    const totalPo = poTotalInvoice(po);
    const dpAmount = poTotalDp(po);
    const invoice: Invoice = {
      id: Date.now(),
      invoiceNumber: `INV/09/2026/${String(seq).padStart(4, "0")}`,
      poId: po.id,
      noPo: po.noPo,
      namaPo: po.namaPo,
      brand: po.brand,
      totalPo,
      dpAmount,
      totalAmount: totalPo - dpAmount,
      paidAmount: 0,
      isPaid: false,
      issuedDate: DEMO_TODAY,
      payments: [],
    };
    setInvoices((prev) => [invoice, ...prev]);
    return invoice;
  };

  const pay = (invoiceId: number, amount: number): Invoice | null => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return null;
    const paidAmount = Math.min(inv.paidAmount + amount, inv.totalAmount);
    const updated: Invoice = {
      ...inv,
      paidAmount,
      isPaid: paidAmount >= inv.totalAmount,
      payments: [...inv.payments, { date: DEMO_TODAY, amount }],
    };
    setInvoices((prev) => prev.map((i) => (i.id === invoiceId ? updated : i)));
    return updated;
  };

  return (
    <Ctx.Provider
      value={{ pos, plans, invoices, selection, select, getPlan, savePlan, setPemakaian, advanceStage, addPo, publishInvoice, pay }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function usePoStore(): PoStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePoStore must be used inside <PoStoreProvider>");
  return ctx;
}
