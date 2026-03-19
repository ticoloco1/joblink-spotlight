import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AvatarUploadProps {
  userId: string;
  currentUrl: string | null;
  name: string;
  onUploaded: (url: string) => void;
}

const AvatarUpload = ({ userId, currentUrl, name, onUploaded }: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Usar preview local se existir, senão usar a URL atual
  const displayUrl = localPreview || currentUrl;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('[v0] AvatarUpload - handleUpload chamado, file:', file?.name);
    if (!file) return;

    // Criar preview local imediatamente
    const objectUrl = URL.createObjectURL(file);
    console.log('[v0] AvatarUpload - preview criado:', objectUrl);
    setLocalPreview(objectUrl);

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem válida');
      setLocalPreview(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem deve ter no máximo 5MB');
      setLocalPreview(null);
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error('Erro ao enviar foto: ' + uploadError.message);
      setLocalPreview(null);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(path);

    const url = `${publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ photo_url: url })
      .eq('user_id', userId);

    if (updateError) {
      console.log('[v0] AvatarUpload - erro ao atualizar profile:', updateError);
      toast.error('Erro ao salvar foto: ' + updateError.message);
    } else {
      console.log('[v0] AvatarUpload - sucesso! chamando onUploaded com:', url);
      toast.success('Foto atualizada!');
      onUploaded(url);
    }

    setUploading(false);
  };

  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <Avatar className="h-24 w-24 border-2 border-border">
          <AvatarImage src={displayUrl || undefined} alt={name} />
          <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </button>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? 'Enviando...' : 'Alterar Foto'}
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
};

export default AvatarUpload;
