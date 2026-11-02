"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { normalizeIdentityName } from "@/modules/productivity/domain/goal-normalization";

export type FilterOption = { id: string; label: string };

export function MultiSelectFilter({ label, options, selected, disabled, onChange }: {
  label: string; options: FilterOption[]; selected: string[]; disabled: boolean; onChange: (values: string[]) => void;
}) {
  const id = useId();
  const [search, setSearch] = useState("");
  const visible = options.filter((option) => normalizeIdentityName(option.label).includes(normalizeIdentityName(search)));
  const caption = selected.length === 0 ? "Todos" : selected.length === 1 ? options.find((option) => option.id === selected[0])?.label ?? "1 selecionado" : `${selected.length} selecionados`;

  return (
    <div className="min-w-0 space-y-2">
      <span id={`${id}-label`} className="text-sm font-medium">{label}</span>
      <Popover onOpenChange={(open) => { if (!open) setSearch(""); }}>
        <PopoverTrigger asChild>
          <Button variant="outline" disabled={disabled} aria-labelledby={`${id}-label ${id}-value`} className="h-10 w-full justify-between gap-3">
            <span id={`${id}-value`} className="truncate">{caption}</span><ChevronDown aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent role="dialog" aria-label={`Selecionar ${label}`} align="start" className="w-[min(22rem,calc(100vw-2rem))] space-y-3 p-3">
          <Input aria-label={`Pesquisar ${label}`} placeholder={`Pesquisar ${label.toLowerCase()}…`} value={search} onChange={(event) => setSearch(event.target.value)} />
          <div className="flex flex-wrap justify-between gap-2">
            <Button type="button" variant="ghost" size="sm" disabled={disabled || options.length === 0} onClick={() => onChange(options.map((option) => option.id))}>Selecionar tudo</Button>
            <Button type="button" variant="ghost" size="sm" disabled={disabled || selected.length === 0} onClick={() => onChange([])}>Limpar seleção</Button>
          </div>
          <p className="text-xs text-muted-foreground">Sem seleção: todos os resultados permitidos.</p>
          <fieldset aria-label={`Opções de ${label}`} className="max-h-56 space-y-1 overflow-y-auto">
            {visible.map((option) => (
              <div key={option.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted">
                <Checkbox id={`${id}-${option.id}`} checked={selected.includes(option.id)} disabled={disabled} onCheckedChange={(checked) => onChange(checked === true ? [...selected, option.id] : selected.filter((value) => value !== option.id))} />
                <Label htmlFor={`${id}-${option.id}`} className="min-w-0 flex-1 cursor-pointer leading-5">{option.label}</Label>
              </div>
            ))}
            {visible.length === 0 && <p className="px-2 py-3 text-sm text-muted-foreground">Nenhuma opção encontrada.</p>}
          </fieldset>
        </PopoverContent>
      </Popover>
    </div>
  );
}
