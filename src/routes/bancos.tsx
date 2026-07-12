import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExternalLink, Plus, Star, StarOff, Trash2, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AppSidebar, MobileTopBar } from "@/components/finwise/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_BANKS,
  loadFavorites,
  saveFavorites,
  loadCustomBanks,
  saveCustomBanks,
  normalizeUrl,
  type Bank,
} from "@/lib/finwise/banks";

export const Route = createFileRoute("/bancos")({
  head: () => ({
    meta: [
      { title: "Meus Bancos • Controle Financeiro Pessoal" },
      { name: "description", content: "Acesse seus bancos em um clique diretamente do app." },
    ],
  }),
  component: BancosPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="p-6 text-sm">
        <p className="mb-3 text-destructive">Erro ao carregar bancos: {error.message}</p>
        <Button onClick={() => { reset(); router.invalidate(); }} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" /> Tentar novamente
        </Button>
      </div>
    );
  },
  notFoundComponent: () => <div className="p-6">Página não encontrada.</div>,
});

function BankLogo({ bank }: { bank: Bank }) {
  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
      style={{ backgroundColor: bank.color }}
      aria-hidden
    >
      <span className={bank.color.toLowerCase() === "#ffef38" ? "text-neutral-900" : ""}>{bank.short}</span>
    </div>
  );
}

function BankCard({
  bank,
  favorite,
  onToggleFav,
  onRemove,
}: {
  bank: Bank;
  favorite: boolean;
  onToggleFav: () => void;
  onRemove?: () => void;
}) {
  const open = () => {
    const url = normalizeUrl(bank.url);
    if (!url) {
      toast.error("URL inválida");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-3 transition-colors hover:bg-card">
      <button onClick={open} className="flex flex-1 items-center gap-3 text-left" aria-label={`Abrir ${bank.name}`}>
        <BankLogo bank={bank} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{bank.name}</div>
          <div className="truncate text-xs text-muted-foreground">{bank.url.replace(/^https?:\/\//, "")}</div>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onToggleFav} aria-label={favorite ? "Remover favorito" : "Favoritar"}>
          {favorite ? <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> : <StarOff className="h-4 w-4" />}
        </Button>
        {onRemove ? (
          <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Remover">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function AddBankDialog({ onAdd }: { onAdd: (b: Bank) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [color, setColor] = useState("#10B981");

  const submit = () => {
    const trimmed = name.trim();
    const finalUrl = normalizeUrl(url);
    if (!trimmed || !finalUrl) {
      toast.error("Informe nome e URL do banco");
      return;
    }
    try {
      new URL(finalUrl);
    } catch {
      toast.error("URL inválida");
      return;
    }
    onAdd({
      id: `custom-${Date.now()}`,
      name: trimmed,
      url: finalUrl,
      color,
      short: trimmed.slice(0, 2).toUpperCase(),
    });
    setName("");
    setUrl("");
    setColor("#10B981");
    setOpen(false);
    toast.success("Banco adicionado");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Adicionar banco</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar banco personalizado</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="bank-name">Nome</Label>
            <Input id="bank-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Meu Banco" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bank-url">URL de acesso</Label>
            <Input id="bank-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://banco.com.br" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bank-color">Cor</Label>
            <input
              id="bank-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-16 cursor-pointer rounded border border-border bg-transparent"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={submit}>Adicionar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BancosPage() {
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());
  const [custom, setCustom] = useState<Bank[]>(() => loadCustomBanks());
  const [query, setQuery] = useState("");

  const all = useMemo(() => [...DEFAULT_BANKS, ...custom], [custom]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((b) => b.name.toLowerCase().includes(q));
  }, [all, query]);

  const favSet = useMemo(() => new Set(favorites), [favorites]);
  const favBanks = useMemo(() => all.filter((b) => favSet.has(b.id)), [all, favSet]);

  const toggleFav = (id: string) => {
    const next = favSet.has(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    setFavorites(next);
    saveFavorites(next);
  };

  const addCustom = (b: Bank) => {
    const next = [...custom, b];
    setCustom(next);
    saveCustomBanks(next);
  };

  const removeCustom = (id: string) => {
    const next = custom.filter((b) => b.id !== id);
    setCustom(next);
    saveCustomBanks(next);
    if (favSet.has(id)) {
      const nf = favorites.filter((f) => f !== id);
      setFavorites(nf);
      saveFavorites(nf);
    }
  };

  return (
    <div className="flex min-h-svh bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar />
        <main className="mx-auto w-full max-w-5xl flex-1 p-4 sm:p-6">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Meus Bancos</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Acesse seu banco com um clique. Favorite os que você mais usa e adicione bancos personalizados.
            </p>
          </header>

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar banco..."
                className="pl-9"
              />
            </div>
            <AddBankDialog onAdd={addCustom} />
          </div>

          {favBanks.length > 0 ? (
            <section className="mb-6">
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Favoritos</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {favBanks.map((b) => (
                  <BankCard
                    key={`fav-${b.id}`}
                    bank={b}
                    favorite
                    onToggleFav={() => toggleFav(b.id)}
                    onRemove={b.id.startsWith("custom-") ? () => removeCustom(b.id) : undefined}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Todos os bancos</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {filtered.map((b) => (
                <BankCard
                  key={b.id}
                  bank={b}
                  favorite={favSet.has(b.id)}
                  onToggleFav={() => toggleFav(b.id)}
                  onRemove={b.id.startsWith("custom-") ? () => removeCustom(b.id) : undefined}
                />
              ))}
              {filtered.length === 0 ? (
                <div className="col-span-full rounded-lg border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                  Nenhum banco encontrado.
                </div>
              ) : null}
            </div>
          </section>

          <p className="mt-6 text-xs text-muted-foreground">
            Os links abrem o site oficial do banco em uma nova aba. Suas preferências são salvas apenas neste dispositivo.
          </p>
        </main>
      </div>
    </div>
  );
}
