import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { PoStoreProvider } from "@/lib/po-store";

export default function InternalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PoStoreProvider>
      <div className="flex min-h-screen bg-[#f9f9f7] print:block print:bg-white">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8 print:p-0">{children}</main>
        </div>
      </div>
    </PoStoreProvider>
  );
}
