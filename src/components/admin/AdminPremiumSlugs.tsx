import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2, Star } from 'lucide-react';

interface PremiumSlug {
  id: string;
  slug: string;
  price_cents: number;
  is_reserved: boolean;
  category: string;
}

const AdminPremiumSlugs = () => {
  const [slugs, setSlugs] = useState<PremiumSlug[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSlug, setNewSlug] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('keyword');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadSlugs();
  }, []);

  const loadSlugs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('premium_slugs')
      .select('*')
      .order('slug');
    if (data) setSlugs(data as PremiumSlug[]);
    if (error) toast.error(error.message);
    setLoading(false);
  };

  const addSlug = async () => {
    if (!newSlug.trim()) return;
    setAdding(true);
    const valueToCents = (v: string) => Math.round(parseFloat(String(v).replace(',', '.')) * 100) || 0;
    const { error } = await supabase.from('premium_slugs').insert({
      slug: newSlug.toLowerCase().trim(),
      price_cents: valueToCents(newPrice),
      category: newCategory,
      is_reserved: true,
    });
    if (error) {
      toast.error(error.message.includes('duplicate') ? 'Slug já existe!' : error.message);
    } else {
      toast.success('Slug premium adicionado!');
      setNewSlug('');
      setNewPrice('');
      await loadSlugs();
    }
    setAdding(false);
  };

  const deleteSlug = async (id: string) => {
    const { error } = await supabase.from('premium_slugs').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Slug removido');
      setSlugs((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const updatePrice = async (id: string, valueDisplay: string) => {
    const priceCents = Math.round(parseFloat(String(valueDisplay).replace(',', '.')) * 100) || 0;
    const { error } = await supabase
      .from('premium_slugs')
      .update({ price_cents: priceCents })
      .eq('id', id);
    if (error) toast.error(error.message);
    else {
      setSlugs((prev) =>
        prev.map((s) => (s.id === id ? { ...s, price_cents: priceCents } : s))
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Slugs Premium / Reservados
        </h2>
        <p className="text-sm text-muted-foreground">
          Gerencie slugs com preços diferenciados e palavras-chave reservadas
        </p>
      </div>

      {/* Add new slug */}
      <div className="flex flex-wrap gap-2 items-end rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex-1 min-w-[140px] space-y-1">
          <label className="text-xs font-medium">Slug</label>
          <Input
            placeholder="ex: dev, ai, ceo"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
          />
        </div>
        <div className="w-32 space-y-1">
          <label className="text-xs font-medium">Preço (USD, ex: 5.00)</label>
          <Input
            type="text"
            inputMode="decimal"
            placeholder="5.00"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
          />
        </div>
        <div className="w-32 space-y-1">
          <label className="text-xs font-medium">Categoria</label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          >
            <option value="keyword">Palavra-chave</option>
            <option value="short">Curto</option>
            <option value="brand">Marca</option>
          </select>
        </div>
        <Button onClick={addSlug} disabled={adding} className="gap-1">
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Adicionar
        </Button>
      </div>

      {/* List */}
      {slugs.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Nenhum slug premium cadastrado</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Slug</th>
                <th className="px-4 py-3 text-left font-medium">Categoria</th>
                <th className="px-4 py-3 text-left font-medium">Preço (USD)</th>
                <th className="px-4 py-3 text-left font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {slugs.map((s) => (
                <tr key={s.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 font-mono font-medium">/{s.slug}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
                      {s.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="text"
                      inputMode="decimal"
                      className="w-28 h-8 text-sm"
                      defaultValue={(s.price_cents / 100).toFixed(2)}
                      onBlur={(e) => updatePrice(s.id, e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => deleteSlug(s.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPremiumSlugs;
