"use client";

import { RotateCcw } from "lucide-react";
import { PricingCalculator } from "@/components/pricing-calculator";
import { PresetManager } from "@/components/preset-manager";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { usePresets } from "@/hooks/use-presets";

export default function Home() {
  const { presets, addItem, updateItem, deleteItem, moveItem, resetDefaults } = usePresets();

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold font-heading">Precificação</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Calculadora de custo de impressão 3D e geração de orçamento em PDF — tudo roda no seu
          navegador, sem cadastro e sem enviar dados pra nenhum servidor além da geração do PDF.
        </p>
      </div>

      <PricingCalculator
        printers={presets.printers}
        energyFlags={presets.energyFlags}
        materials={presets.materials}
      />

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-0.5">
          <h2 className="text-lg font-semibold font-heading">Presets</h2>
          <Button variant="ghost" size="sm" onClick={resetDefaults} className="text-xs text-muted-foreground">
            <RotateCcw className="size-3.5" />
            Restaurar padrão
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Valores usados nos botões rápidos da calculadora acima — ajuste conforme sua realidade.
          Fica salvo só neste navegador.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          <PresetManager
            title="Impressoras"
            valueLabel="Watts"
            valueField="watts"
            valueStep="1"
            items={presets.printers}
            onAdd={(name, value) => addItem("printers", name, value)}
            onUpdate={(id, name, value) => updateItem("printers", id, name, value)}
            onDelete={(id) => deleteItem("printers", id)}
            onMove={(index, direction) => moveItem("printers", index, direction)}
          />
          <PresetManager
            title="Bandeiras tarifárias"
            valueLabel="R$/kWh"
            valueField="pricePerKwh"
            valueStep="0.01"
            items={presets.energyFlags}
            onAdd={(name, value) => addItem("energyFlags", name, value)}
            onUpdate={(id, name, value) => updateItem("energyFlags", id, name, value)}
            onDelete={(id) => deleteItem("energyFlags", id)}
            onMove={(index, direction) => moveItem("energyFlags", index, direction)}
          />
          <PresetManager
            title="Materiais de referência"
            valueLabel="R$/kg"
            valueField="pricePerKg"
            valueStep="0.01"
            items={presets.materials}
            onAdd={(name, value) => addItem("materials", name, value)}
            onUpdate={(id, name, value) => updateItem("materials", id, name, value)}
            onDelete={(id) => deleteItem("materials", id)}
            onMove={(index, direction) => moveItem("materials", index, direction)}
          />
        </div>
      </div>
    </div>
  );
}
