"use client";

export default function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Wider dialog with internal scrolling, for long forms. */
  wide?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Tutup" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div
        className={`relative w-full rounded-xl bg-white p-6 shadow-xl ${
          wide ? "max-h-[90vh] max-w-3xl overflow-y-auto" : "max-w-lg"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#0b0b0b]">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#898781] hover:bg-[#f4f3f0]"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
