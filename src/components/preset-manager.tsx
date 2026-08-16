"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Check, X, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Item = { id: string; name: string };

interface Props<T extends Item> {
  title: string;
  valueLabel: string;
  valueField: keyof T & string;
  valueStep: string;
  items: T[];
  onAdd: (name: string, value: number) => void;
  onUpdate: (id: string, name: string, value: number) => void;
  onDelete: (id: string) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}

export function PresetManager<T extends Item>({ title, valueLabel, valueField, valueStep, items, onAdd, onUpdate, onDelete, onMove }: Props<T>) {
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editValue, setEditValue] = useState("");

  function handleAdd() {
    if (!newName.trim() || !newValue) return;
    onAdd(newName.trim(), parseFloat(newValue));
    setNewName("");
    setNewValue("");
  }

  function startEdit(item: T) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditValue(String(item[valueField]));
  }

  function saveEdit(id: string) {
    if (!editName.trim() || !editValue) return;
    onUpdate(id, editName.trim(), parseFloat(editValue));
    setEditingId(null);
  }

  return (
    <div className="space-y-3 rounded-xl border p-4">
      <h3 className="text-sm font-semibold">{title}</h3>

      <div className="flex gap-1.5">
        <Input
          placeholder="Nome"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="h-8 text-xs"
          maxLength={50}
        />
        <Input
          type="number"
          step={valueStep}
          min="0"
          placeholder={valueLabel}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="h-8 text-xs w-24 shrink-0"
        />
        <Button size="sm" className="h-8 shrink-0 px-2" onClick={handleAdd} disabled={!newName.trim() || !newValue}>
          <Plus className="size-3.5" />
        </Button>
      </div>

      <div className="rounded-lg border divide-y">
        {items.length === 0 && (
          <p className="px-3 py-4 text-center text-xs text-muted-foreground">Nenhum preset cadastrado.</p>
        )}
        {items.map((item, i) => (
          <div key={item.id} className="flex items-center gap-1.5 px-2 py-1.5">
            <div className="flex flex-col">
              <button onClick={() => onMove(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-20">
                <ChevronUp className="size-3" />
              </button>
              <button onClick={() => onMove(i, 1)} disabled={i === items.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-20">
                <ChevronDown className="size-3" />
              </button>
            </div>

            {editingId === item.id ? (
              <>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-7 flex-1 text-xs" maxLength={50} />
                <Input
                  type="number"
                  step={valueStep}
                  min="0"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(item.id)}
                  className="h-7 w-20 text-xs shrink-0"
                />
                <button onClick={() => saveEdit(item.id)} className="text-primary hover:text-primary/80">
                  <Check className="size-3.5" />
                </button>
                <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="size-3.5" />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-xs truncate">{item.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">{String(item[valueField])}</span>
                <button onClick={() => startEdit(item)} className="text-muted-foreground hover:text-foreground shrink-0">
                  <Pencil className="size-3" />
                </button>
                <button onClick={() => onDelete(item.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                  <Trash2 className="size-3" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
