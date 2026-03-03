import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { CommandPalette } from "@/components/command-palette";
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts-provider";

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
      <CommandPalette />
      <KeyboardShortcutsProvider />

      {/* Main content — offset by sidebar on desktop */}
      <main className="mx-auto max-w-2xl px-4 py-6 lg:ml-64 lg:max-w-5xl lg:px-8">
        <div className="fade-in-up" style={{ opacity: 0, animationFillMode: "forwards" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
