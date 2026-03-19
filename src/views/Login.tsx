'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';

const Login = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error('Login não configurado. Configure as variáveis do Supabase.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(t('auth.loginSuccess'));
      // Redirecionar com reload para o AuthProvider carregar a sessão (evita voltar para /login)
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-elevated">
          <div className="text-center mb-8">
            <LogIn className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-4 text-2xl font-bold">{t('auth.login')}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t('auth.loginSubtitle')}</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full gradient-hero text-primary-foreground border-0" disabled={loading}>
              {loading ? '...' : t('auth.login')}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('auth.noAccount')}{' '}
            <Link href="/signup" className="text-primary font-medium hover:underline">{t('auth.signupLink')}</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Login;
