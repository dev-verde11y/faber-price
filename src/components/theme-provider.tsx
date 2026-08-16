"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
  // Estado "escuro?" já resolvido (considera prefers-color-scheme quando theme === "system").
  // Só é confiável depois do mount — antes disso vale sempre `false`, igual no server, pra
  // nunca divergir na primeira pintura do client (ver ThemeToggle, que consome isto em vez
  // de ler window.matchMedia direto no render).
  resolvedDark: boolean;
}>({ theme: "system", setTheme: () => {}, resolvedDark: false });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");
  const [resolvedDark, setResolvedDark] = useState(false);

  useEffect(() => {
    // Hidrata o valor real do localStorage após o mount (server não tem acesso a ele) —
    // renderizar "system" primeiro evita mismatch de hidratação; o script anti-flash no
    // layout já aplicou a classe `.dark` correta no <html> antes disso, então não há flash.
    const stored = localStorage.getItem("theme") as Theme | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.classList.toggle("dark", isDark);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResolvedDark(isDark);
    if (theme !== "system") localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
