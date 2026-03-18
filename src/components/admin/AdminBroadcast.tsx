import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Send, Megaphone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Broadcast {
  id: string;
  title: string;
  message: string;
  created_at: string;
}

const AdminBroadcast = () => {
  const { user } = useAuth();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadBroadcasts();
  }, []);

  const loadBroadcasts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('broadcasts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setBroadcasts(data as Broadcast[]);
    setLoading(false);
  };

  const sendBroadcast = async () => {
    if (!title.trim() || !message.trim() || !user) return;
    setSending(true);
    const { error } = await supabase.from('broadcasts').insert({
      title: title.trim(),
      message: message.trim(),
      sent_by: user.id,
    } as any);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Broadcast enviado para todos os usuários!');
      setTitle('');
      setMessage('');
      await loadBroadcasts();
    }
    setSending(false);
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
          <Megaphone className="h-5 w-5 text-primary" />
          Broadcast Geral
        </h2>
        <p className="text-sm text-muted-foreground">Envie mensagens para todos os usuários da plataforma</p>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
        <div>
          <Label htmlFor="bc-title">Título</Label>
          <Input id="bc-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Novidade na plataforma!" />
        </div>
        <div>
          <Label htmlFor="bc-message">Mensagem</Label>
          <Textarea id="bc-message" value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Escreva a mensagem..." />
        </div>
        <Button onClick={sendBroadcast} disabled={sending || !title.trim() || !message.trim()} className="gap-2">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Enviar Broadcast
        </Button>
      </div>

      {broadcasts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Histórico</h3>
          {broadcasts.map(b => (
            <div key={b.id} className="rounded-lg border border-border p-3">
              <p className="font-medium text-sm">{b.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{b.message}</p>
              <p className="text-xs text-muted-foreground mt-2">{new Date(b.created_at).toLocaleString('pt-BR')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBroadcast;
