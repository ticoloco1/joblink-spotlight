import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BoostBar from '@/components/BoostBar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Video, Upload, Loader2, Lock, CheckCircle, Play, Square, Trash2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import { demoVideoProfiles } from '@/data/demoContent';

interface PublicVideoProfile {
  id: string;
  name: string;
  title: string | null;
  photo_url: string | null;
  video_url: string;
  slug: string;
  location: string | null;
  boost_score: number;
  homepage_until: string | null;
  user_type: string;
  isDemo?: boolean;
}

const MAX_DURATION = 60;

const Videos = () => {
  const { user } = useAuth();

  // Public gallery
  const [publicVideos, setPublicVideos] = useState<PublicVideoProfile[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);

  // User's own upload
  const [hasVideoFeature, setHasVideoFeature] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Recording state
  const [mode, setMode] = useState<'idle' | 'recording' | 'preview'>('idle');
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(MAX_DURATION);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load public videos (all published profiles with video_url)
  useEffect(() => {
    loadPublicVideos();
  }, []);

  useEffect(() => {
    if (user) loadProfile();
    else setProfileLoading(false);
  }, [user]);

  const loadPublicVideos = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, name, title, photo_url, video_url, slug, location, boost_score, homepage_until, user_type')
      .eq('is_published', true)
      .not('video_url', 'is', null)
      .order('boost_score', { ascending: false })
      .order('updated_at', { ascending: false })
      .limit(50);

    const loaded = (data as PublicVideoProfile[]) || [];
    setPublicVideos(loaded.length > 0 ? loaded : (demoVideoProfiles as PublicVideoProfile[]));
    setGalleryLoading(false);
  };

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('has_video_feature, video_url')
      .eq('user_id', user!.id)
      .single();
    if (data) {
      setHasVideoFeature(!!data.has_video_feature);
      setCurrentVideoUrl(data.video_url);
    }
    setProfileLoading(false);
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-video-checkout');
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao iniciar checkout');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play();
      }
      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setPreviewBlob(blob);
        setPreviewUrl(url);
        setMode('preview');
        stream.getTracks().forEach(t => t.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = url;
          videoRef.current.muted = false;
        }
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
      setMode('recording');
      setCountdown(MAX_DURATION);

      let remaining = MAX_DURATION;
      timerRef.current = setInterval(() => {
        remaining--;
        setCountdown(remaining);
        if (remaining <= 0) {
          mr.stop();
          setRecording(false);
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, 1000);
    } catch {
      toast.error('Não foi possível acessar a câmera');
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024 * 1024) {
      toast.error('Arquivo muito grande (máx 500MB)');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewBlob(file);
    setPreviewUrl(url);
    setMode('preview');
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = url;
      videoRef.current.muted = false;
    }
  };

  const uploadToBunny = async () => {
    if (!previewBlob) return;
    setUploading(true);
    try {
      const { data, error } = await supabase.functions.invoke('upload-bunny-video', {
        body: { title: `Presentation - ${user?.email}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const uploadRes = await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: {
          'AccessKey': data.uploadHeaders.AccessKey,
          'Content-Type': 'application/octet-stream',
        },
        body: previewBlob,
      });

      if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);

      setCurrentVideoUrl(data.embedUrl);
      toast.success('Vídeo enviado com sucesso! Processando...');
      setMode('idle');
      setPreviewBlob(null);
      setPreviewUrl(null);
      loadPublicVideos();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar vídeo');
    } finally {
      setUploading(false);
    }
  };

  const deleteVideo = async () => {
    setUploading(true);
    try {
      await supabase.from('profiles').update({ video_url: null }).eq('user_id', user!.id);
      setCurrentVideoUrl(null);
      toast.success('Vídeo removido');
      loadPublicVideos();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setPreviewBlob(null);
    setPreviewUrl(null);
    setMode('idle');
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
  };

  const isYouTubeEmbed = (url: string) => url.includes('youtube.com') || url.includes('youtu.be');
  const isBunnyEmbed = (url: string) => url.includes('mediadelivery.net');

  return (
    <>
      <Helmet>
        <title>Vídeos Profissionais | JobinLink</title>
        <meta name="description" content="Assista vídeos de apresentação profissional dos talentos no JobinLink" />
      </Helmet>
      <Navbar />
      <main className="min-h-[70vh] py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              <Video className="inline h-8 w-8 mr-2 text-primary" />
              Vídeos Profissionais
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Assista apresentações profissionais dos talentos. Quer adicionar o seu? Assine por apenas $5.99/ano.
            </p>
          </div>

          {/* HOW IT WORKS — YouTube Unlisted Guide */}
          <section className="max-w-3xl mx-auto mb-16">
            <Card className="border-primary/20 bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  Como Funciona o Paywall de Vídeos?
                </CardTitle>
                <CardDescription>
                  Entenda como protegemos seus vídeos usando o YouTube
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Nosso sistema utiliza vídeos do <strong className="text-foreground">YouTube em modo "Não Listado" (Unlisted)</strong> para criar um paywall seguro. Veja como funciona:
                </p>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <div className="text-2xl font-bold text-primary mb-2">1</div>
                    <h4 className="font-semibold text-foreground mb-1">Suba no YouTube</h4>
                    <p className="text-xs">
                      Faça upload do seu vídeo no YouTube e configure a visibilidade como <strong className="text-foreground">"Não Listado"</strong> (não "Público" nem "Privado").
                    </p>
                  </div>
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <div className="text-2xl font-bold text-primary mb-2">2</div>
                    <h4 className="font-semibold text-foreground mb-1">Copie o ID</h4>
                    <p className="text-xs">
                      Na URL do vídeo (ex: youtube.com/watch?v=<strong className="text-foreground">abc123XYZ</strong>), copie o código após "v=" — este é o ID do vídeo.
                    </p>
                  </div>
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <div className="text-2xl font-bold text-primary mb-2">3</div>
                    <h4 className="font-semibold text-foreground mb-1">Adicione aqui</h4>
                    <p className="text-xs">
                      Cole o ID no seu portfólio. Nós cuidamos do resto: embed seguro, sem controles e com máscara de proteção.
                    </p>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    Por que "Não Listado"?
                  </h4>
                  <ul className="space-y-1.5 text-xs">
                    <li>✅ <strong>Não aparece</strong> em buscas do YouTube nem no seu canal público</li>
                    <li>✅ <strong>Só acessível</strong> por quem tem o link — e nós escondemos o link!</li>
                    <li>✅ <strong>Embed protegido</strong>: removemos controles, título, logo e atalhos de teclado</li>
                    <li>✅ <strong>Máscara invisível</strong>: impede clique direto no player para copiar URL</li>
                    <li>⚠️ <strong>Não use "Público"</strong> — qualquer pessoa acharia o vídeo no YouTube</li>
                    <li>⚠️ <strong>Não use "Privado"</strong> — o embed não funcionará</li>
                  </ul>
                </div>

                <p className="text-xs text-muted-foreground/70 italic">
                  Nota: Nenhum paywall baseado em YouTube é 100% à prova de cópia. Para proteção total contra download, 
                  considere plataformas como Vimeo Pro ou Wistia. Nosso sistema oferece uma camada eficaz de proteção 
                  visual que dificulta significativamente o acesso não autorizado.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* PUBLIC VIDEO GALLERY */}
          <section className="mb-16">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              <Play className="inline h-5 w-5 mr-2 text-primary" />
              Galeria de Vídeos
            </h2>
            {galleryLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : publicVideos.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nenhum vídeo publicado ainda. Seja o primeiro!
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {publicVideos.map((p) => {
                  const prefix = p.user_type === 'company' ? 'c' : 'u';
                  return (
                    <Card key={p.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-video bg-muted">
                        {isBunnyEmbed(p.video_url) ? (
                          <iframe
                            src={p.video_url}
                            className="w-full h-full"
                            allowFullScreen
                            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                          />
                        ) : (
                          <video src={p.video_url} controls className="w-full h-full object-cover" />
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                            {p.photo_url ? (
                              <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-bold">
                                {p.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link to={`/${prefix}/${p.slug}`} className="font-semibold text-foreground hover:text-primary truncate block">
                              {p.name}
                            </Link>
                            {p.title && <p className="text-xs text-muted-foreground truncate">{p.title}</p>}
                          </div>
                        </div>

                        {!p.isDemo ? (
                          <BoostBar
                            profileId={p.id}
                            profileName={p.name}
                            boostScore={p.boost_score}
                            homepageUntil={p.homepage_until}
                            onBoosted={(newScore) => {
                              setPublicVideos(prev =>
                                prev.map(v => v.id === p.id ? { ...v, boost_score: newScore } : v)
                                  .sort((a, b) => b.boost_score - a.boost_score)
                              );
                            }}
                          />
                        ) : (
                          <p className="mt-3 text-xs text-muted-foreground">Conteúdo de demonstração</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* UPLOAD SECTION */}
          <section className="max-w-4xl mx-auto">
            <div className="border-t border-border pt-12">
              <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
                <Upload className="inline h-5 w-5 mr-2" />
                Envie Seu Vídeo
              </h2>

              {!user ? (
                <Card className="max-w-md mx-auto text-center">
                  <CardContent className="py-10">
                    <Lock className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">Faça login para enviar seu vídeo profissional.</p>
                    <Button asChild><a href="/login">Fazer Login</a></Button>
                  </CardContent>
                </Card>
              ) : profileLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !hasVideoFeature ? (
                /* PAYWALL */
                <Card className="max-w-lg mx-auto border-primary/30 shadow-lg">
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Play className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Desbloqueie o Vídeo</CardTitle>
                    <CardDescription>
                      Adicione um vídeo profissional e cobre no mínimo $0.60 por visualização
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-muted rounded-lg p-6 text-center">
                      <div className="text-4xl font-bold text-foreground">$5.99</div>
                      <div className="text-muted-foreground">/ano</div>
                    </div>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        Embed YouTube protegido com paywall
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        Player sem controles + máscara de segurança
                      </li>
                      <li className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
                        Cobrança mínima de $0.60 por view
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        Vídeo integrado ao seu mini site
                      </li>
                    </ul>
                    <Button onClick={handleCheckout} className="w-full" size="lg" disabled={checkoutLoading}>
                      {checkoutLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Lock className="h-4 w-4 mr-2" />}
                      Assinar — $5.99/ano
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                /* VIDEO UPLOAD AREA */
                <div className="space-y-6">
                  {currentVideoUrl && mode === 'idle' && (
                    <Card>
                      <CardHeader><CardTitle className="text-lg">Seu Vídeo Atual</CardTitle></CardHeader>
                      <CardContent>
                        <div className="aspect-video w-full max-w-2xl mx-auto rounded-xl overflow-hidden bg-muted">
                          {isBunnyEmbed(currentVideoUrl) ? (
                            <iframe src={currentVideoUrl} className="w-full h-full" allowFullScreen allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" />
                          ) : (
                            <video src={currentVideoUrl} controls className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex justify-center mt-4">
                          <Button onClick={deleteVideo} variant="destructive" size="sm" disabled={uploading}>
                            <Trash2 className="h-4 w-4 mr-1" /> Remover Vídeo
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{currentVideoUrl ? 'Substituir Vídeo' : 'Adicionar Vídeo'}</CardTitle>
                      <CardDescription>Grave com sua câmera ou faça upload de um arquivo</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="aspect-video w-full max-w-2xl mx-auto rounded-xl overflow-hidden bg-muted border border-border">
                        {mode === 'idle' ? (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            <Video className="h-16 w-16 opacity-20" />
                          </div>
                        ) : (
                          <video ref={videoRef} className="w-full h-full object-cover" controls={mode === 'preview'} />
                        )}
                      </div>

                      {recording && (
                        <div className="text-center">
                          <span className="inline-flex items-center gap-2 text-destructive font-medium text-lg">
                            <span className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
                            {countdown}s
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3 justify-center">
                        {mode === 'idle' && (
                          <>
                            <Button onClick={startRecording} variant="outline" size="lg">
                              <Video className="h-5 w-5 mr-2" /> Gravar
                            </Button>
                            <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="lg">
                              <Upload className="h-5 w-5 mr-2" /> Upload
                            </Button>
                            <input ref={fileInputRef} type="file" accept="video/mp4,video/webm,video/quicktime,video/mov" className="hidden" onChange={handleFileUpload} />
                          </>
                        )}
                        {mode === 'recording' && (
                          <Button onClick={stopRecording} variant="destructive" size="lg">
                            <Square className="h-5 w-5 mr-2" /> Parar Gravação
                          </Button>
                        )}
                        {mode === 'preview' && (
                          <>
                            <Button onClick={uploadToBunny} size="lg" disabled={uploading}>
                              {uploading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Upload className="h-5 w-5 mr-2" />}
                              Enviar para Bunny.net
                            </Button>
                            <Button onClick={reset} variant="outline" size="lg">Descartar</Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Videos;
