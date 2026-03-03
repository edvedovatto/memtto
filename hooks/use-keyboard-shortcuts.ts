"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

function isInputFocused(): boolean {
  const active = document.activeElement;
  if (!active) return false;
  const tag = active.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    (active as HTMLElement).isContentEditable
  );
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isInputFocused()) return;

      switch (e.key.toLowerCase()) {
        case "n":
          e.preventDefault();
          router.push("/new");
          break;
        case "/":
          e.preventDefault();
          if (pathname !== "/") {
            router.push("/");
          }
          setTimeout(() => {
            const input = document.querySelector<HTMLInputElement>(
              'input[placeholder*="Search"]'
            );
            input?.focus();
          }, pathname === "/" ? 0 : 300);
          break;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router, pathname]);
}
