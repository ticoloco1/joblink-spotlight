import { useState, useEffect } from 'react';
import { useSettings, type PricingConfig, type FeaturesConfig } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Save, Settings2 } from 'lucide-react';

export default function AdminSettingsCore() {
  const { pricing: initialPricing, features: initialFeatures, isLoading, update, isUpdating } = useSettings();
  const [pricing, setPricing] = useState<PricingConfig>({ monthly: 29.9, slug: 99.9, ads: 10 });
  const [features, setFeatures] = useState<FeaturesConfig>({ auction_enabled: true, ads_enabled: true });

  useEffect(() => {
    setPricing(initialPricing);
    setFeatures(initialFeatures);
  }, [initialPricing, initialFeatures]);

  const savePricing = async () => {
    try {
      await update('pricing', pricing);
      toast.success('Preços salvos!');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar preços');
    }
  };

  const saveFeatures = async () => {
    try {
      await update('features', features);
      toast.success('Features salvas!');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar features');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          Configurações globais (cérebro do sistema)
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Preços e features controlam o site sem precisar de deploy. Use em todo o app: <code className="text-xs bg-muted px-1 rounded">const &#123; pricing &#125; = useSettings()</code>
        </p>
      </div>

      {/* Preços — FASE 2 */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">Preços</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="pricing-monthly">Mensalidade (R$/USD)</Label>
            <Input
              id="pricing-monthly"
              type="number"
              step="0.01"
              min="0"
              value={pricing.monthly}
              onChange={(e) => setPricing({ ...pricing, monthly: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pricing-slug">Preço do slug</Label>
            <Input
              id="pricing-slug"
              type="number"
              step="0.01"
              min="0"
              value={pricing.slug}
              onChange={(e) => setPricing({ ...pricing, slug: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pricing-ads">Anúncios (base)</Label>
            <Input
              id="pricing-ads"
              type="number"
              step="0.01"
              min="0"
              value={pricing.ads}
              onChange={(e) => setPricing({ ...pricing, ads: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
        <Button onClick={savePricing} disabled={isUpdating} className="mt-4 gap-2">
          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar preços
        </Button>
      </div>

      {/* Features */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">Features (ligar/desligar)</h3>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={features.auction_enabled}
              onChange={(e) => setFeatures({ ...features, auction_enabled: e.target.checked })}
              className="rounded border-input"
            />
            <span>Leilão de slugs ativo</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={features.ads_enabled}
              onChange={(e) => setFeatures({ ...features, ads_enabled: e.target.checked })}
              className="rounded border-input"
            />
            <span>Anúncios ativos no site</span>
          </label>
        </div>
        <Button onClick={saveFeatures} disabled={isUpdating} className="mt-4 gap-2">
          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar features
        </Button>
      </div>
    </div>
  );
}
