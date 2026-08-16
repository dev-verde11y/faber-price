"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_PRESETS,
  loadPresets,
  makeId,
  savePresets,
  type PresetsState,
} from "@/lib/presets";

type Category = keyof PresetsState;

export function usePresets() {
  // Carrega defaults no SSR/primeira pintura pra bater com o client (evita
  // mismatch de hidratação) e substitui pelo valor real do localStorage logo
  // depois, no efeito.
  const [presets, setPresets] = useState<PresetsState>(DEFAULT_PRESETS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hidrata do localStorage após o mount (server sempre renderiza DEFAULT_PRESETS,
    // já que não tem acesso ao localStorage) — evita mismatch de hidratação.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPresets(loadPresets());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) savePresets(presets);
  }, [presets, hydrated]);

  const addItem = useCallback(
    <C extends Category>(category: C, name: string, value: number) => {
      setPresets((prev) => {
        const idPrefix = category === "printers" ? "printer" : category === "energyFlags" ? "flag" : "material";
        const valueField = category === "printers" ? "watts" : category === "energyFlags" ? "pricePerKwh" : "pricePerKg";
        const item = { id: makeId(idPrefix), name, [valueField]: value };
        return { ...prev, [category]: [...prev[category], item] } as PresetsState;
      });
    },
    [],
  );

  const updateItem = useCallback(
    (category: Category, id: string, name: string, value: number) => {
      const valueField = category === "printers" ? "watts" : category === "energyFlags" ? "pricePerKwh" : "pricePerKg";
      setPresets((prev) => ({
        ...prev,
        [category]: prev[category].map((item) =>
          item.id === id ? { ...item, name, [valueField]: value } : item,
        ),
      }));
    },
    [],
  );

  const deleteItem = useCallback((category: Category, id: string) => {
    setPresets((prev) => ({
      ...prev,
      [category]: prev[category].filter((item) => item.id !== id),
    }));
  }, []);

  const moveItem = useCallback((category: Category, index: number, direction: -1 | 1) => {
    setPresets((prev) => {
      const list = prev[category];
      const target = index + direction;
      if (target < 0 || target >= list.length) return prev;
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, [category]: next };
    });
  }, []);

  const resetDefaults = useCallback(() => setPresets(DEFAULT_PRESETS), []);

  return { presets, hydrated, addItem, updateItem, deleteItem, moveItem, resetDefaults };
}
