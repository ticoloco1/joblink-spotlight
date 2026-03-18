import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';

interface Setting {
  id: string;
  key: string;
  value: string;
  label: string | null;
  category: string;
}

interface AdminSettingsProps {
  category: string;
  title: string;
  description: string;
  formatValue?: (key: string, value: string) => string;
  parseValue?: (key: string, value: string) => string;
}

const AdminSettings = ({ category, title, description, formatValue, parseValue }: AdminSettingsProps) => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSettings();
  }, [category]);

  const loadSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('category', category)
      .order('key');
    if (data) {
      setSettings(data as Setting[]);
      const values: Record<string, string> = {};
      data.forEach((s: Setting) => {
        const isEnabledLike =
          s.key.toLowerCase().includes('enabled') ||
          ['true', 'false', '1', '0'].includes(String(s.value).toLowerCase());
        values[s.key] = isEnabledLike ? s.value : (formatValue ? formatValue(s.key, s.value) : s.value);
      });
      setEditedValues(values);
    }
    if (error) toast.error(error.message);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const setting of settings) {
        const edited = editedValues[setting.key] ?? setting.value;
        const isEnabledLike =
          setting.key.toLowerCase().includes('enabled') ||
          ['true', 'false', '1', '0'].includes(String(edited).toLowerCase());

        const rawValue = isEnabledLike
          ? edited
          : parseValue
            ? parseValue(setting.key, edited)
            : edited;

        const { error } = await supabase
          .from('platform_settings')
          .update({ value: rawValue })
          .eq('key', setting.key);
        if (error) throw error;
      }
      toast.success('Configurações salvas!');
      await loadSettings();
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
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
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {settings.map((setting) => (
          <div key={setting.id} className="space-y-1.5">
            <Label htmlFor={setting.key} className="text-sm">
              {setting.label || setting.key}
            </Label>
            {(() => {
              const current = editedValues[setting.key] ?? setting.value;
              const isEnabledLike =
                setting.key.toLowerCase().includes('enabled') ||
                ['true', 'false', '1', '0'].includes(String(current).toLowerCase());

              if (!isEnabledLike) {
                return (
                  <Input
                    id={setting.key}
                    value={current ?? ''}
                    onChange={(e) =>
                      setEditedValues((prev) => ({ ...prev, [setting.key]: e.target.value }))
                    }
                  />
                );
              }

              const checked = ['true', '1'].includes(String(current).toLowerCase());
              return (
                <div className="flex items-center gap-3 pt-1">
                  <Switch
                    checked={checked}
                    onCheckedChange={(v) => setEditedValues((prev) => ({ ...prev, [setting.key]: v ? 'true' : 'false' }))}
                    aria-label={setting.label || setting.key}
                  />
                  <span className="text-xs text-muted-foreground">{checked ? 'ON' : 'OFF'}</span>
                </div>
              );
            })()}
          </div>
        ))}
      </div>
      <Button onClick={handleSave} disabled={saving} className="gap-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Salvar Alterações
      </Button>
    </div>
  );
};

export default AdminSettings;
