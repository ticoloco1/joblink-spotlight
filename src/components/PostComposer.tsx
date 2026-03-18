import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ImagePlus, Loader2, Send, Smile, X } from 'lucide-react';

const EMOJI_LIST = ['😀','😎','🔥','💼','🎯','🚀','💡','❤️','👏','✨','🎬','🎨','🎵','📸','💻','🏆','⭐','👑','🌟','💪'];

interface PostComposerProps {
  profileId: string;
  userId: string;
  onPostCreated: () => void;
}

const MAX_IMAGES = 4;

const PostComposer = ({ profileId, userId, onPostCreated }: PostComposerProps) => {
  const [content, setContent] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const valid = files.slice(0, MAX_IMAGES - imageFiles.length);
    for (const file of valid) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Cada imagem no máx. 5MB');
        return;
      }
    }
    const newFiles = [...imageFiles, ...valid].slice(0, MAX_IMAGES);
    setImageFiles(newFiles);
    setImagePreviews(newFiles.map(f => URL.createObjectURL(f)));
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + emoji + content.substring(end);
      setContent(newContent);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    } else {
      setContent(prev => prev + emoji);
    }
  };

  const handlePost = async () => {
    if (!content.trim() && !imageFiles.length) return;
    setPosting(true);

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const ext = file.name.split('.').pop();
        const path = `${userId}/posts/${Date.now()}_${i}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(path, file, { upsert: false });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('profile-photos').getPublicUrl(path);
        uploadedUrls.push(publicUrl);
      }
      const firstUrl = uploadedUrls[0] || null;

      const { error } = await supabase.from('posts').insert({
        profile_id: profileId,
        user_id: userId,
        content: content.trim(),
        image_url: firstUrl,
        image_urls: uploadedUrls.length ? uploadedUrls : null,
      } as any);

      if (error) throw error;

      setContent('');
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      setImageFiles([]);
      setImagePreviews([]);
      toast.success('Post publicado!');
      onPostCreated();
    } catch (err: any) {
      toast.error(err.message);
    }
    setPosting(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <Textarea
        ref={textRef}
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="O que você quer compartilhar? Use **negrito**, *itálico*, e emojis..."
        rows={3}
        maxLength={1000}
        className="resize-none text-sm"
      />

      {imagePreviews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {imagePreviews.map((url, i) => (
            <div key={i} className="relative inline-block">
              <img src={url} alt={`Preview ${i + 1}`} className="max-h-32 rounded-lg border border-border object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {imagePreviews.length < MAX_IMAGES && (
            <span className="text-xs text-muted-foreground self-end">Até {MAX_IMAGES} fotos</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => fileRef.current?.click()}>
            <ImagePlus className="h-4 w-4" />
          </Button>
          <div className="relative">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowEmoji(!showEmoji)}>
              <Smile className="h-4 w-4" />
            </Button>
            {showEmoji && (
              <div className="absolute bottom-full left-0 mb-1 rounded-lg border border-border bg-popover p-2 shadow-lg z-10 grid grid-cols-5 gap-1 w-48">
                {EMOJI_LIST.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => { insertEmoji(emoji); setShowEmoji(false); }}
                    className="h-8 w-8 flex items-center justify-center rounded hover:bg-muted text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground ml-2">{content.length}/1000</span>
        </div>
        <Button onClick={handlePost} disabled={posting || (!content.trim() && !imageFiles.length)} size="sm" className="gap-1.5">
          {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Publicar
        </Button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" multiple onChange={handleImageSelect} />
      <p className="text-xs text-muted-foreground">Posts expiram em 7 dias. Fixe por $10 para manter 365 dias.</p>
    </div>
  );
};

export default PostComposer;
