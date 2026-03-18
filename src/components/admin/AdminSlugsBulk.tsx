import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Upload, Zap, FileText } from 'lucide-react';
import { generateSlugCombos } from '@/lib/slugValuation';

export default function AdminSlugsBulk() {
  const [wordsText, setWordsText] = useState('');
  const [listA, setListA] = useState('crypto, bank, job, ai, pro');
  const [listB, setListB] = useState('hub, link, vip, pay');
  const [generated, setGenerated] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const wordsFromText = (text: string) =>
    text
      .split(/[\n,;\s]+/)
      .map((w) => w.toLowerCase().trim())
      .filter(Boolean);

  const handleGenerate = () => {
    const a = wordsFromText(listA);
    const b = wordsFromText(listB);
    if (!a.length || !b.length) {
      toast.error('Preencha as duas listas');
      return;
    }
    const slugs = generateSlugCombos(a, b, { reverse: true, separator: '' });
    setGenerated(slugs);
    toast.success(`${slugs.length} slugs gerados`);
  };

  const handleInsert = async (slugList: string[]) => {
    if (!slugList.length) {
      toast.error('Nada para inserir');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('slugs-bulk-insert', {
        body: { slugs: slugList },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(data?.message ?? `${data?.inserted ?? 0} inseridos`);
      setWordsText('');
      setGenerated([]);
      setCsvFile(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao inserir');
    } finally {
      setLoading(false);
    }
  };

  const handlePasteInsert = () => {
    const slugs = Array.from(new Set(wordsFromText(wordsText)));
    handleInsert(slugs);
  };

  const handleGeneratedInsert = () => handleInsert(generated);

  const handleCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      const lines = text.split(/\r?\n/).map((l) => l.split(/[,;\t]/)[0]?.trim()).filter(Boolean);
      setWordsText(lines.join('\n'));
      toast.success(`${lines.length} palavras do CSV`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Registrar slugs em massa
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Cole uma lista (um por linha) ou use o gerador. Duplicados são ignorados.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <Label>Lista de palavras ou slugs (um por linha ou separados por vírgula)</Label>
        <Textarea
          placeholder="bank&#10;crypto&#10;jobai&#10;..."
          value={wordsText}
          onChange={(e) => setWordsText(e.target.value)}
          rows={6}
          className="font-mono text-sm"
        />
        <div className="flex gap-2">
          <Button onClick={handlePasteInsert} disabled={loading || !wordsText.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Inserir em massa
          </Button>
          <label className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background px-4 py-2 cursor-pointer hover:bg-accent">
            <input type="file" accept=".csv,.txt" className="hidden" onChange={handleCsv} />
            <FileText className="h-4 w-4 mr-2" /> CSV/TXT
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          Gerador (lista A × lista B)
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Lista A (ex: crypto, bank, job)</Label>
            <Input
              value={listA}
              onChange={(e) => setListA(e.target.value)}
              placeholder="crypto, bank, ai"
              className="mt-1 font-mono"
            />
          </div>
          <div>
            <Label>Lista B (ex: hub, link, vip)</Label>
            <Input
              value={listB}
              onChange={(e) => setListB(e.target.value)}
              placeholder="hub, link, pro"
              className="mt-1 font-mono"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerate}>
            Gerar slugs
          </Button>
          {generated.length > 0 && (
            <Button onClick={handleGeneratedInsert} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Inserir {generated.length} gerados
            </Button>
          )}
        </div>
        {generated.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Preview: {generated.slice(0, 15).join(', ')}
            {generated.length > 15 ? ` ... +${generated.length - 15}` : ''}
          </p>
        )}
      </div>
    </div>
  );
}
