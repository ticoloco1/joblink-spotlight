import { useState, useRef, useCallback } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Video, Square, Upload, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface VideoRecorderProps {
  userId: string;
  currentVideoUrl?: string | null;
  onVideoSaved: (url: string | null) => void;
}

const MAX_DURATION = 30; // seconds

const VideoRecorder = ({ userId, currentVideoUrl, onVideoSaved }: VideoRecorderProps) => {
  const { t } = useLanguage();
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(MAX_DURATION);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<'idle' | 'recording' | 'preview'>('idle');

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (file.size > 30 * 1024 * 1024) {
      toast.error('Arquivo muito grande (máx 30MB)');
      return;
    }
    // Check video duration
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      if (video.duration > 35) {
        toast.error('Vídeo muito longo (máx 30 segundos)');
        return;
      }
      setPreviewUrl(url);
      setMode('preview');
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
        videoRef.current.muted = false;
      }
    };
    video.src = url;
  };

  const uploadVideo = async () => {
    if (!previewUrl) return;
    setUploading(true);
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
      const filePath = `${userId}/presentation.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-videos')
        .upload(filePath, blob, { upsert: true, contentType: blob.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-videos')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ video_url: publicUrl })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      onVideoSaved(publicUrl);
      toast.success('Vídeo salvo com sucesso!');
      setMode('idle');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteVideo = async () => {
    setUploading(true);
    try {
      // Try deleting both possible extensions
      await supabase.storage.from('profile-videos').remove([`${userId}/presentation.webm`, `${userId}/presentation.mp4`]);
      await supabase.from('profiles').update({ video_url: null }).eq('user_id', userId);
      onVideoSaved(null);
      setPreviewUrl(null);
      setMode('idle');
      toast.success('Vídeo removido');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setPreviewUrl(null);
    setMode('idle');
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
  };

  return (
    <div className="space-y-4">
      <div className="aspect-video w-full max-w-md mx-auto rounded-xl overflow-hidden bg-muted border border-border">
        {mode === 'idle' && currentVideoUrl ? (
          <video src={currentVideoUrl} controls className="w-full h-full object-cover" />
        ) : mode === 'idle' ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Video className="h-12 w-12 opacity-30" />
          </div>
        ) : (
          <video ref={videoRef} className="w-full h-full object-cover" controls={mode === 'preview'} />
        )}
      </div>

      {recording && (
        <div className="text-center">
          <span className="inline-flex items-center gap-2 text-destructive font-medium">
            <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            {countdown}s
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-center">
        {mode === 'idle' && (
          <>
            <Button onClick={startRecording} size="sm" variant="outline">
              <Video className="h-4 w-4 mr-1" /> Gravar
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} size="sm" variant="outline">
              <Upload className="h-4 w-4 mr-1" /> Upload
            </Button>
            <input ref={fileInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleFileUpload} />
            {currentVideoUrl && (
              <Button onClick={deleteVideo} size="sm" variant="destructive" disabled={uploading}>
                <Trash2 className="h-4 w-4 mr-1" /> Remover
              </Button>
            )}
          </>
        )}
        {mode === 'recording' && (
          <Button onClick={stopRecording} size="sm" variant="destructive">
            <Square className="h-4 w-4 mr-1" /> Parar
          </Button>
        )}
        {mode === 'preview' && (
          <>
            <Button onClick={uploadVideo} size="sm" disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
              Salvar
            </Button>
            <Button onClick={reset} size="sm" variant="outline">Descartar</Button>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoRecorder;
