import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";

export const dynamic = "force-dynamic";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header — hidden on desktop */}
      <div className="lg:hidden">
        <Header />
      </div>

      {/* Desktop sidebar — hidden on mobile */}
      <Sidebar />

      {/* Main content — offset by sidebar on desktop */}
      <main className="mx-auto max-w-2xl px-4 py-6 lg:ml-64 lg:px-8">
        {children}
      </main>
    </div>
  );
}
