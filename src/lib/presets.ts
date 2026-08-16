// Sem banco de dados: presets vivem só no navegador do usuário (localStorage).
// Cada categoria segue o mesmo padrão simples de nome + valor + order, editável
// direto na tela — os defaults abaixo são só ponto de partida, não tarifas oficiais.

export interface Printer {
  id: string;
  name: string;
  watts: number;
}

export interface EnergyFlag {
  id: string;
  name: string;
  pricePerKwh: number;
}

export interface MaterialPreset {
  id: string;
  name: string;
  pricePerKg: number;
}

export const STORAGE_KEY = "faber-price:presets:v1";

export interface PresetsState {
  printers: Printer[];
  energyFlags: EnergyFlag[];
  materials: MaterialPreset[];
}

export const DEFAULT_PRESETS: PresetsState = {
  printers: [
    { id: "printer-ender3", name: "Ender 3", watts: 220 },
    { id: "printer-prusa-mk4", name: "Prusa MK4", watts: 120 },
    { id: "printer-bambu-p1s", name: "Bambu Lab P1S", watts: 350 },
    { id: "printer-kobra-x", name: "Kobra X", watts: 300 },
  ],
  energyFlags: [
    { id: "flag-verde", name: "Bandeira verde", pricePerKwh: 0.65 },
    { id: "flag-amarela", name: "Bandeira amarela", pricePerKwh: 0.75 },
    { id: "flag-vermelha", name: "Bandeira vermelha", pricePerKwh: 0.95 },
  ],
  materials: [
    { id: "material-pla", name: "PLA", pricePerKg: 120 },
    { id: "material-petg", name: "PETG", pricePerKg: 140 },
    { id: "material-abs", name: "ABS", pricePerKg: 130 },
    { id: "material-tpu", name: "TPU", pricePerKg: 180 },
  ],
};

export function loadPresets(): PresetsState {
  if (typeof window === "undefined") return DEFAULT_PRESETS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PRESETS;
    const parsed = JSON.parse(raw) as Partial<PresetsState>;
    return {
      printers: parsed.printers ?? DEFAULT_PRESETS.printers,
      energyFlags: parsed.energyFlags ?? DEFAULT_PRESETS.energyFlags,
      materials: parsed.materials ?? DEFAULT_PRESETS.materials,
    };
  } catch {
    return DEFAULT_PRESETS;
  }
}

export function savePresets(state: PresetsState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
