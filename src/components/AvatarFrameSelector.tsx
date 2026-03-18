import { AVATAR_FRAMES } from '@/data/avatarFrames';
import { cn } from '@/lib/utils';

interface AvatarFrameSelectorProps {
  selected: string | null;
  onSelect: (frameId: string | null) => void;
}

const AvatarFrameSelector = ({ selected, onSelect }: AvatarFrameSelectorProps) => {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Moldura do Avatar</p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onSelect(null)}
          className={cn(
            'h-16 w-16 rounded-full border-2 flex items-center justify-center text-xs text-muted-foreground transition-all',
            !selected ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-muted-foreground'
          )}
        >
          Nenhum
        </button>
        {AVATAR_FRAMES.map(frame => (
          <button
            key={frame.id}
            onClick={() => onSelect(frame.id)}
            className={cn(
              'h-16 w-16 rounded-full border-2 overflow-hidden transition-all',
              selected === frame.id ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-border hover:border-muted-foreground'
            )}
            title={frame.label}
          >
            <img src={frame.src} alt={frame.label} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default AvatarFrameSelector;
