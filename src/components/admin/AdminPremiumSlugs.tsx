import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Trash2, Plus, DollarSign, Search, Tag, Upload, Power, Send, Filter } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = ["profession", "tech", "finance", "entertainment", "lifestyle", "creative", "media", "general"];
const LENGTH_FILTERS = [
  { label: "Todas", value: 0 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
  { label: "7+", value: 7 },
];

const DEFAULT_PRICES: Record<number, number> = {
  1: 2000, 2: 1500, 3: 1000, 4: 500, 5: 250, 6: 100, 7: 50,
};

const AdminPremiumSlugs = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [lengthFilter, setLengthFilter] = useState(0);
  const [newSlug, setNewSlug] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [newPrice, setNewPrice] = useState("500");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkCategory, setBulkCategory] = useState("general");
  const [transferSlugId, setTransferSlugId] = useState<string | null>(null);
  const [transferEmail, setTransferEmail] = useState("");

  const { data: slugs, isLoading } = useQuery({
    queryKey: ["admin-premium-slugs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("premium_slugs")
        .select("*")
        .order("category")
        .order("price", { ascending: false });
      return data || [];
    },
  });

  const addSlug = useMutation({
    mutationFn: async (values: { slug: string; category: string; price: number }) => {
      const { error } = await supabase.from("premium_slugs").insert({
        ...values,
        keyword: values.slug,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-premium-slugs"] });
      toast.success("Slug adicionado!");
      setNewSlug("");
      setNewPrice("500");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const bulkAdd = useMutation({
    mutationFn: async (items: { slug: string; category: string; price: number }[]) => {
      const rows = items.map(i => ({ slug: i.slug, keyword: i.slug, category: i.category, price: i.price }));
      const { error } = await supabase.from("premium_slugs").insert(rows);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-premium-slugs"] });
      toast.success(`${vars.length} slugs adicionados!`);
      setBulkText("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateSlug = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Record<string, any>) => {
      const { error } = await supabase.from("premium_slugs").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-premium-slugs"] });
      toast.success("Atualizado!");
      setEditingId(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteSlug = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("premium_slugs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-premium-slugs"] });
      toast.success("Removido!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const transferSlug = useMutation({
    mutationFn: async ({ slugId, email }: { slugId: string; email: string }) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .ilike("display_name", email.trim())
        .maybeSingle();
      if (!profile) throw new Error("Usuário não encontrado");

      const slug = (slugs || []).find((s: any) => s.id === slugId);
      if (!slug) throw new Error("Slug não encontrado");

      const { error } = await supabase.from("premium_slugs").update({
        sold: true,
        buyer_id: profile.user_id,
        sold_to: profile.user_id,
        sold_at: new Date().toISOString(),
      } as any).eq("id", slugId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-premium-slugs"] });
      toast.success("Slug transferido!");
      setTransferSlugId(null);
      setTransferEmail("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleAdd = () => {
    const s = newSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!s) return;
    const price = parseFloat(newPrice) || DEFAULT_PRICES[s.length] || 50;
    addSlug.mutate({ slug: s, category: newCategory, price });
  };

  // Auto-set price when slug changes
  const handleSlugChange = (val: string) => {
    setNewSlug(val);
    const clean = val.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (clean.length > 0 && clean.length <= 7) {
      setNewPrice(String(DEFAULT_PRICES[clean.length] || 50));
    }
  };

  const handleBulkAdd = () => {
    const lines = bulkText.split("\n").map(l => l.trim()).filter(Boolean);
    const items: { slug: string; category: string; price: number }[] = [];
    for (const line of lines) {
      const parts = line.split(/[:\t,;]+/).map(p => p.trim());
      const slug = parts[0]?.toLowerCase().replace(/[^a-z0-9-]/g, "");
      if (!slug) continue;
      const price = parts[1] ? parseFloat(parts[1]) : (DEFAULT_PRICES[slug.length] || 50);
      items.push({ slug, category: bulkCategory, price: isNaN(price) ? 50 : price });
    }
    if (items.length === 0) { toast.error("Nenhum slug válido encontrado"); return; }
    bulkAdd.mutate(items);
  };

  const filtered = (slugs || []).filter((s: any) => {
    const matchSearch = !search || s.slug.includes(search.toLowerCase()) || s.category.includes(search.toLowerCase());
    const matchLength = lengthFilter === 0 || (lengthFilter === 7 ? s.slug.length >= 7 : s.slug.length === lengthFilter);
    return matchSearch && matchLength;
  });

  const stats = {
    total: (slugs || []).length,
    active: (slugs || []).filter((s: any) => s.active && !s.sold).length,
    sold: (slugs || []).filter((s: any) => s.sold).length,
    inactive: (slugs || []).filter((s: any) => !s.active).length,
  };

  const categoryGroups = CATEGORIES.map(cat => ({
    category: cat,
    items: filtered.filter((s: any) => s.category === cat),
  })).filter(g => g.items.length > 0);

  return (
    <div className="border border-border rounded-lg p-4 bg-card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-gold" />
          <h2 className="text-sm font-bold text-card-foreground uppercase">
            Nomes Premium ({filtered.length})
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBulkMode(!bulkMode)}
            className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded border transition-colors ${bulkMode ? "bg-accent text-accent-foreground border-accent" : "bg-secondary text-muted-foreground border-border hover:border-primary"}`}
          >
            <Upload className="w-3 h-3" /> Em Massa
          </button>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar slugs..."
              className="pl-8 pr-3 py-1.5 bg-secondary text-foreground text-xs border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary w-48"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-secondary/50 rounded-lg p-2 text-center">
          <p className="text-lg font-black text-foreground">{stats.total}</p>
          <p className="text-[9px] text-muted-foreground font-bold">Total</p>
        </div>
        <div className="bg-primary/10 rounded-lg p-2 text-center">
          <p className="text-lg font-black text-primary">{stats.active}</p>
          <p className="text-[9px] text-muted-foreground font-bold">Ativos</p>
        </div>
        <div className="bg-accent/10 rounded-lg p-2 text-center">
          <p className="text-lg font-black text-accent">{stats.sold}</p>
          <p className="text-[9px] text-muted-foreground font-bold">Vendidos</p>
        </div>
        <div className="bg-destructive/10 rounded-lg p-2 text-center">
          <p className="text-lg font-black text-destructive">{stats.inactive}</p>
          <p className="text-[9px] text-muted-foreground font-bold">Inativos</p>
        </div>
      </div>

      {/* Length filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Filter className="w-3 h-3 text-muted-foreground" />
        <span className="text-[10px] font-bold text-muted-foreground mr-1">Letras:</span>
        {LENGTH_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setLengthFilter(f.value)}
            className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${lengthFilter === f.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Default pricing table */}
      <div className="bg-muted/30 rounded-lg p-3 border border-border">
        <p className="text-[10px] font-bold text-muted-foreground mb-2">PREÇOS PADRÃO POR TAMANHO</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(DEFAULT_PRICES).map(([len, price]) => (
            <div key={len} className="bg-secondary rounded px-2 py-1 text-center">
              <p className="text-[10px] font-bold text-foreground">{len} letra{Number(len) > 1 ? "s" : ""}</p>
              <p className="text-xs font-mono text-primary">${price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk Import */}
      {bulkMode && (
        <div className="p-4 bg-accent/10 rounded-lg border border-accent/20 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Upload className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold text-foreground">Importação em Massa</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Cole um slug por linha. Formato: <code className="bg-secondary px-1 rounded">slug:preço</code> ou apenas <code className="bg-secondary px-1 rounded">slug</code> (preço baseado no tamanho).
          </p>
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Textarea
                value={bulkText}
                onChange={e => setBulkText(e.target.value)}
                placeholder={"doctor:2000\nlawyer:1500\ncrypto:1800\ndesigner\nphotographer:600\nhealth:250\ncoach:100"}
                rows={6}
                className="text-xs font-mono"
              />
            </div>
            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground">Categoria</label>
                <select value={bulkCategory} onChange={e => setBulkCategory(e.target.value)}
                  className="h-8 px-2 text-xs bg-secondary text-foreground border border-border rounded w-full">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button
                onClick={handleBulkAdd}
                disabled={bulkAdd.isPending || !bulkText.trim()}
                className="w-full h-8 px-3 bg-accent text-accent-foreground text-xs font-bold rounded hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3" /> Importar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add single */}
      <div className="flex flex-wrap items-end gap-2 p-3 bg-muted/50 rounded-lg border border-border">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground">Slug</label>
          <Input value={newSlug} onChange={e => handleSlugChange(e.target.value)} placeholder="doctor" className="w-32 h-8 text-xs" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground">Categoria</label>
          <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
            className="h-8 px-2 text-xs bg-secondary text-foreground border border-border rounded">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground">Preço ($)</label>
          <Input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="w-24 h-8 text-xs" />
        </div>
        <button onClick={handleAdd} className="h-8 px-3 bg-primary text-primary-foreground text-xs font-bold rounded hover:bg-primary/90 flex items-center gap-1">
          <Plus className="w-3 h-3" /> Adicionar
        </button>
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground text-center py-6">Loading...</p>
      ) : (
        <div className="space-y-4">
          {categoryGroups.map(({ category, items }) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-3 h-3 text-primary" />
                <h3 className="text-xs font-bold text-primary uppercase">{category}</h3>
                <span className="text-[10px] text-muted-foreground">({items.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {items.map((s: any) => (
                  <div key={s.id} className={`flex items-center justify-between p-2.5 rounded-lg border ${!s.active ? "bg-muted/20 border-border/30 opacity-50" : s.sold ? "bg-muted/30 border-border/50 opacity-60" : "bg-secondary/50 border-border"}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-bold text-sm text-foreground truncate">{s.slug}</span>
                      <span className="text-[8px] text-muted-foreground bg-muted px-1 rounded">{s.slug.length}L</span>
                      {s.sold && <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">VENDIDO</span>}
                      {!s.active && <span className="text-[9px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">INATIVO</span>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Transfer */}
                      {transferSlugId === s.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={transferEmail}
                            onChange={e => setTransferEmail(e.target.value)}
                            placeholder="email/nome"
                            className="w-28 h-6 text-[10px] px-1"
                          />
                          <button
                            onClick={() => transferSlug.mutate({ slugId: s.id, email: transferEmail })}
                            className="text-primary text-[10px] font-bold"
                            disabled={transferSlug.isPending}
                          >
                            <Send className="w-3 h-3" />
                          </button>
                          <button onClick={() => setTransferSlugId(null)} className="text-muted-foreground text-[10px]">X</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setTransferSlugId(s.id); setTransferEmail(""); }}
                          className="text-muted-foreground hover:text-primary p-0.5"
                          title="Transferir"
                        >
                          <Send className="w-3 h-3" />
                        </button>
                      )}

                      {/* Toggle active */}
                      <button
                        onClick={() => updateSlug.mutate({ id: s.id, active: !s.active })}
                        className={`p-0.5 ${s.active ? "text-primary" : "text-muted-foreground"}`}
                        title={s.active ? "Desativar" : "Ativar"}
                      >
                        <Power className="w-3 h-3" />
                      </button>

                      {editingId === s.id ? (
                        <>
                          <Input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-20 h-6 text-xs px-1" />
                          <button onClick={() => updateSlug.mutate({ id: s.id, price: parseFloat(editPrice) || 100 })} className="text-primary text-[10px] font-bold">OK</button>
                          <button onClick={() => setEditingId(null)} className="text-muted-foreground text-[10px]">X</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingId(s.id); setEditPrice(String(s.price)); }}
                            className="flex items-center gap-0.5 text-xs font-mono text-foreground hover:text-primary">
                            <DollarSign className="w-3 h-3" />{s.price}
                          </button>
                          <button onClick={() => { if (confirm(`Deletar "${s.slug}"?`)) deleteSlug.mutate(s.id); }}
                            className="text-destructive hover:text-destructive/80 p-0.5">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPremiumSlugs;
