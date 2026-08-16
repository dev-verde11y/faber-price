"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { resolvedDark, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setTheme(resolvedDark ? "light" : "dark")}
      aria-label="Alternar tema"
    >
      {resolvedDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
