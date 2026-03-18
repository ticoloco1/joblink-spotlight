import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Loader2, Eye, Ban, CheckCircle, ShieldOff, RotateCcw, Search,
  History, ChevronDown, ChevronUp, AlertTriangle, Shield,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

interface ProfileRecord {
  id: string;
  name: string;
  slug: string;
  title: string | null;
  user_type: string;
  is_published: boolean;
  status: string;
  created_at: string;
}

interface ActionRecord {
  id: string;
  action: string;
  reason: string | null;
  previous_status: string | null;
  new_status: string | null;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Ativo', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  disabled: { label: 'Desabilitado', color: 'text-amber-600', bg: 'bg-amber-500/10' },
  blocked: { label: 'Bloqueado', color: 'text-destructive', bg: 'bg-destructive/10' },
  suspended: { label: 'Suspenso', color: 'text-orange-600', bg: 'bg-orange-500/10' },
};

const ACTION_CONFIG: Record<string, { label: string; icon: React.ReactNode; newStatus: string; confirmText: string }> = {
  block: {
    label: 'Bloquear',
    icon: <Ban className="h-4 w-4" />,
    newStatus: 'blocked',
    confirmText: 'Bloquear este perfil? Ele será despublicado.',
  },
  disable: {
    label: 'Desabilitar',
    icon: <ShieldOff className="h-4 w-4" />,
    newStatus: 'disabled',
    confirmText: 'Desabilitar este perfil? Ele será despublicado.',
  },
  enable: {
    label: 'Habilitar',
    icon: <CheckCircle className="h-4 w-4" />,
    newStatus: 'active',
    confirmText: 'Habilitar e republicar este perfil?',
  },
  recover: {
    label: 'Recuperar',
    icon: <RotateCcw className="h-4 w-4" />,
    newStatus: 'active',
    confirmText: 'Recuperar e reativar este perfil?',
  },
};

const AdminProfiles = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Action dialog
  const [actionDialog, setActionDialog] = useState<{ profile: ProfileRecord; action: string } | null>(null);
  const [reason, setReason] = useState('');
  const [executing, setExecuting] = useState(false);

  // History
  const [historyProfile, setHistoryProfile] = useState<string | null>(null);
  const [history, setHistory] = useState<ActionRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProfiles(data as ProfileRecord[]);
    setLoading(false);
  };

  const openAction = (profile: ProfileRecord, action: string) => {
    setReason('');
    setActionDialog({ profile, action });
  };

  const executeAction = async () => {
    if (!actionDialog || !user) return;
    setExecuting(true);
    const config = ACTION_CONFIG[actionDialog.action];

    try {
      const { data, error } = await supabase.rpc('admin_change_profile_status', {
        _profile_id: actionDialog.profile.id,
        _admin_user_id: user.id,
        _action: actionDialog.action,
        _new_status: config.newStatus,
        _reason: reason.trim() || null,
      });

      if (error) throw error;

      toast.success(`Perfil ${config.label.toLowerCase()}do com sucesso!`);
      setActionDialog(null);
      await loadProfiles();
    } catch (err: any) {
      toast.error(err.message);
    }
    setExecuting(false);
  };

  const loadHistory = async (profileId: string) => {
    if (historyProfile === profileId) {
      setHistoryProfile(null);
      return;
    }
    setHistoryProfile(profileId);
    setLoadingHistory(true);
    const { data } = await supabase
      .from('profile_actions')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setHistory(data as ActionRecord[]);
    setLoadingHistory(false);
  };

  const getAvailableActions = (status: string) => {
    switch (status) {
      case 'active':
        return ['disable', 'block'];
      case 'disabled':
        return ['enable', 'block'];
      case 'blocked':
        return ['recover'];
      case 'suspended':
        return ['recover', 'block'];
      default:
        return ['enable', 'block'];
    }
  };

  const filtered = profiles.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || (p as any).status === filterStatus;
    return matchSearch && matchStatus;
  });

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
          <Shield className="h-5 w-5 text-primary" />
          Gerenciar Perfis & Mini-sites
        </h2>
        <p className="text-sm text-muted-foreground">{profiles.length} perfis cadastrados</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou slug..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {['all', 'active', 'disabled', 'blocked', 'suspended'].map(s => (
            <Button
              key={s}
              variant={filterStatus === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(s)}
              className="text-xs"
            >
              {s === 'all' ? 'Todos' : STATUS_CONFIG[s]?.label || s}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Nome</th>
                <th className="px-4 py-3 text-left font-medium">Slug</th>
                <th className="px-4 py-3 text-left font-medium">Tipo</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Publicado</th>
                <th className="px-4 py-3 text-left font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => {
                const status = (p as any).status || 'active';
                const sc = STATUS_CONFIG[status] || STATUS_CONFIG.active;
                const actions = getAvailableActions(status);

                return (
                  <>
                    <tr key={p.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">/{p.slug}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.user_type === 'company' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                          {p.user_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sc.bg} ${sc.color}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.is_published ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                          {p.is_published ? 'Sim' : 'Não'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver perfil"
                            onClick={() => window.open(`/${p.user_type === 'company' ? 'c' : 'u'}/${p.slug}`, '_blank')}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {actions.map(action => {
                            const ac = ACTION_CONFIG[action];
                            return (
                              <Button
                                key={action}
                                variant="ghost"
                                size="sm"
                                className={`h-8 text-xs gap-1 ${action === 'block' ? 'text-destructive hover:text-destructive' : action === 'disable' ? 'text-amber-600 hover:text-amber-600' : 'text-emerald-600 hover:text-emerald-600'}`}
                                onClick={() => openAction(p, action)}
                              >
                                {ac.icon}
                                {ac.label}
                              </Button>
                            );
                          })}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Histórico"
                            onClick={() => loadHistory(p.id)}
                          >
                            {historyProfile === p.id ? <ChevronUp className="h-4 w-4" /> : <History className="h-4 w-4" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {/* History row */}
                    {historyProfile === p.id && (
                      <tr key={`${p.id}-history`}>
                        <td colSpan={6} className="px-4 py-3 bg-muted/30">
                          {loadingHistory ? (
                            <div className="flex justify-center py-4">
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            </div>
                          ) : history.length === 0 ? (
                            <p className="text-center text-muted-foreground text-xs py-3">Nenhuma ação registrada</p>
                          ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              <p className="text-xs font-semibold text-muted-foreground">Histórico de Ações</p>
                              {history.map(h => (
                                <div key={h.id} className="flex items-start gap-3 text-xs rounded-lg bg-card border border-border p-2">
                                  <div className="flex-1">
                                    <span className="font-medium capitalize">{h.action}</span>
                                    {h.previous_status && h.new_status && (
                                      <span className="text-muted-foreground ml-1">
                                        ({STATUS_CONFIG[h.previous_status]?.label || h.previous_status} → {STATUS_CONFIG[h.new_status]?.label || h.new_status})
                                      </span>
                                    )}
                                    {h.reason && (
                                      <p className="text-muted-foreground mt-0.5">Motivo: {h.reason}</p>
                                    )}
                                  </div>
                                  <span className="text-muted-foreground whitespace-nowrap">
                                    {new Date(h.created_at).toLocaleString('pt-BR')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Confirmation Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {actionDialog && ACTION_CONFIG[actionDialog.action]?.label} Perfil
            </DialogTitle>
          </DialogHeader>
          {actionDialog && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {ACTION_CONFIG[actionDialog.action]?.confirmText}
              </p>
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium">{actionDialog.profile.name}</p>
                <p className="text-muted-foreground font-mono text-xs">/{actionDialog.profile.slug}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Motivo (opcional)</label>
                <Textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Ex: Conteúdo inadequado, solicitação do usuário..."
                  rows={2}
                  maxLength={500}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>Cancelar</Button>
            <Button
              onClick={executeAction}
              disabled={executing}
              variant={actionDialog?.action === 'block' ? 'destructive' : 'default'}
              className="gap-1.5"
            >
              {executing ? <Loader2 className="h-4 w-4 animate-spin" /> : actionDialog && ACTION_CONFIG[actionDialog.action]?.icon}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProfiles;
