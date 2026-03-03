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
    <div className="flex h-dvh flex-col bg-background lg:flex-row">
      {/* Mobile header — hidden on desktop */}
      <div className="flex-shrink-0 lg:hidden">
        <Header />
      </div>

      {/* Desktop sidebar — hidden on mobile */}
      <Sidebar />
      <CommandPalette />
      <KeyboardShortcutsProvider />

      {/* Main content — scrollable area */}
      <main className="flex-1 overflow-y-auto overscroll-none lg:ml-64">
        <div className="mx-auto max-w-2xl px-4 py-6 lg:max-w-5xl lg:px-8">
          <div className="fade-in-up" style={{ opacity: 0, animationFillMode: "forwards" }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
