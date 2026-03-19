import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

const Signup = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'seeker' | 'company'>('seeker');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, user_type: userType },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('auth.signupSuccess'));
      navigate('/login', { replace: true });
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-elevated">
          <div className="text-center mb-8">
            <UserPlus className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-4 text-2xl font-bold">{t('auth.signup')}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t('auth.signupSubtitle')}</p>
          </div>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="name">{t('auth.name')}</Label>
              <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div>
              <Label>{t('auth.accountType')}</Label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('seeker')}
                  className={`rounded-xl border-2 p-3 text-center text-sm font-medium transition-all ${
                    userType === 'seeker' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {t('auth.seeker')}
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('company')}
                  className={`rounded-xl border-2 p-3 text-center text-sm font-medium transition-all ${
                    userType === 'company' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {t('auth.company')}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full gradient-hero text-primary-foreground border-0" disabled={loading}>
              {loading ? '...' : t('auth.signup')}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">{t('auth.loginLink')}</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Signup;
