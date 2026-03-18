import { AVATAR_FRAMES } from '@/data/avatarFrames';

interface AvatarWithFrameProps {
  photoUrl: string | null;
  frameId: string | null;
  name: string;
  size?: number;
  className?: string;
}

const AvatarWithFrame = ({ photoUrl, frameId, name, size = 128, className = '' }: AvatarWithFrameProps) => {
  const frame = frameId ? AVATAR_FRAMES.find(f => f.id === frameId) : null;
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  if (!frame) {
    return (
      <div className={`relative ${className}`} style={{ width: size, height: size }}>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            className="rounded-full object-cover w-full h-full"
            style={{ width: size, height: size }}
          />
        ) : (
          <div
            className="rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold"
            style={{ width: size, height: size, fontSize: size * 0.3 }}
          >
            {initials}
          </div>
        )}
      </div>
    );
  }

  // With frame: photo inside the frame badge
  const photoSize = size * 0.55;
  const photoOffset = size * 0.12;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Frame background */}
      <img
        src={frame.src}
        alt={frame.label}
        className="absolute inset-0 w-full h-full object-cover rounded-full"
        style={{ width: size, height: size }}
      />
      {/* User photo overlay */}
      <div
        className="absolute rounded-full overflow-hidden border-2 border-background/50"
        style={{
          width: photoSize,
          height: photoSize,
          top: photoOffset,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        {photoUrl ? (
          <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold"
            style={{ fontSize: photoSize * 0.35 }}
          >
            {initials}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarWithFrame;
