"use client";

import { useState } from "react";
import { Check, ChevronDown, Info, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const options = ["Exemplo A", "Exemplo B", "Exemplo C"];

export function ComponentDemo() {
  const [selected, setSelected] = useState(options[0]);
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  return (
    <TooltipProvider>
      <section className="mt-6 space-y-5" aria-labelledby="component-demo-title">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 id="component-demo-title" className="text-xl font-semibold">Experimente os componentes</h2>
            <p className="mt-1 text-sm text-muted-foreground">Demonstração visual. Nenhuma ação altera dados empresariais.</p>
          </div>
          <Dialog>
            <DialogTrigger asChild><Button variant="outline"><Info aria-hidden="true" />Sobre esta demonstração</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Componentes para testar localmente</DialogTitle>
                <DialogDescription>Este ambiente apresenta os elementos da interface. Seleções e campos são temporários e não enviam informações para nenhum servidor externo.</DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">Use Tab para navegar, Enter para ativar botões e Escape para fechar os menus e este diálogo.</p>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Campos e seleção</CardTitle><CardDescription>Estados de foco, pesquisa e checkbox.</CardDescription></CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2"><Label htmlFor="demo-search">Texto de exemplo</Label><Input id="demo-search" placeholder="Digite para experimentar o campo" autoComplete="off" /></div>
              <div className="space-y-2">
                <span id="demo-choice-label" className="text-sm font-medium">Opção de exemplo</span>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild><Button variant="outline" role="combobox" aria-expanded={open} aria-labelledby="demo-choice-label demo-choice-value" className="w-full justify-between"><span id="demo-choice-value">{selected}</span><ChevronDown aria-hidden="true" /></Button></PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Pesquisar opção…" aria-label="Pesquisar opção de exemplo" />
                      <CommandList>
                        <CommandEmpty>Nenhuma opção encontrada.</CommandEmpty>
                        <CommandGroup heading="Exemplos fictícios">
                          {options.map((option) => <CommandItem key={option} value={option} onSelect={() => { setSelected(option); setOpen(false); }}><Check aria-hidden="true" className={selected === option ? "opacity-100" : "opacity-0"} />{option}</CommandItem>)}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center gap-3"><Checkbox id="demo-checkbox" checked={checked} onCheckedChange={(value) => setChecked(value === true)} /><Label htmlFor="demo-checkbox">Experimentar seleção</Label></div>
              <p className="text-xs text-muted-foreground" role="status">{checked ? "Checkbox selecionado." : "Checkbox não selecionado."}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Ações e feedback</CardTitle><CardDescription>Botões, menus, dicas e notificações.</CardDescription></CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => toast.success("Notificação de demonstração", { description: "Nenhuma informação foi enviada." })}>Testar notificação</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="outline"><SlidersHorizontal aria-hidden="true" />Opções<ChevronDown aria-hidden="true" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="start"><DropdownMenuItem onSelect={() => { setSelected(options[0]); setChecked(false); toast("Seleções de exemplo restauradas."); }}>Restaurar seleções</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>
                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label="Informação sobre componentes"><Info aria-hidden="true" /></Button></TooltipTrigger><TooltipContent>Dica acessível por foco ou mouse.</TooltipContent></Tooltip>
              </div>
              <Separator />
              <div className="space-y-3" aria-label="Exemplo visual de carregamento">
                <p className="text-sm text-muted-foreground">Exemplo de aparência durante o carregamento</p>
                <Skeleton className="h-4 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Tabela de demonstração</CardTitle><CardDescription>Estrutura visual, sem registros de produtividade.</CardDescription></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow>{["Mês", "Supervisor", "Técnico", "Contrato", "Produção", "Meta Batida"].map((column) => <TableHead key={column}>{column}</TableHead>)}</TableRow></TableHeader>
              <TableBody><TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Nenhum registro carregado. Ambiente de demonstração local.</TableCell></TableRow></TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
      <Toaster richColors closeButton containerAriaLabel="Notificações" toastOptions={{ closeButtonAriaLabel: "Fechar notificação" }} />
    </TooltipProvider>
  );
}
