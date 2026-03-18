import { VideoItem } from '@/data/mockProfiles';
import { MiniSiteTemplate } from '@/data/templates';
import { Lock, Play, Clock, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface VideoPortfolioGridProps {
  videos: VideoItem[];
  template: MiniSiteTemplate;
  unlockedVideoIds?: Set<string>;
  onUnlock?: (videoId: string) => void;
  unlockingId?: string | null;
}

const getYouTubeEmbedUrl = (youtubeId: string, autoplay = false) =>
  `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&controls=0&showinfo=0&disablekb=1&fs=0&iv_load_policy=3${autoplay ? '&autoplay=1' : ''}`;

const getYouTubeThumbnail = (youtubeId: string) =>
  `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

const VideoPortfolioGrid = ({
  videos,
  template: t,
  unlockedVideoIds = new Set(),
  onUnlock,
  unlockingId,
}: VideoPortfolioGridProps) => {
  const { colors, style } = t;
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [modalVideo, setModalVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalVideo(null);
    };
    if (modalVideo) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKey);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [modalVideo]);

  const radius: Record<string, string> = {
    none: '0px', sm: '4px', md: '8px', lg: '16px', full: '9999px',
  };

  const fontFamily: Record<string, string> = {
    serif: "'Playfair Display', serif",
    sans: "'DM Sans', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
    display: "'Playfair Display', serif",
  };

  // Evita spread em `Set` (TS reclama sem downlevelIteration/es2015+).
  const categories = Array.from(new Set(videos.map((v) => v.category)));
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const filtered = activeCategory ? videos.filter(v => v.category === activeCategory) : videos;
  const cardRadius = style.borderRadius === 'full' ? 'lg' : style.borderRadius;

  return (
    <div>
      {/* Category filters */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <button
          onClick={() => setActiveCategory(null)}
          style={{
            padding: '0.35rem 0.9rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600,
            border: 'none', cursor: 'pointer', fontFamily: fontFamily[style.fontVibe],
            backgroundColor: !activeCategory ? colors.accent : colors.skillBg,
            color: !activeCategory ? colors.accentFg : colors.skillText, transition: 'all 0.2s',
          }}
        >
          Todos
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '0.35rem 0.9rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600,
              border: 'none', cursor: 'pointer', fontFamily: fontFamily[style.fontVibe],
              backgroundColor: activeCategory === cat ? colors.accent : colors.skillBg,
              color: activeCategory === cat ? colors.accentFg : colors.skillText, transition: 'all 0.2s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Video grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {filtered.map((video, i) => {
          const isUnlocked = unlockedVideoIds.has(video.id);
          const isHovered = hoveredId === video.id;
          const isUnlocking = unlockingId === video.id;
          const thumbnailUrl = video.thumbnail || getYouTubeThumbnail(video.youtubeId);

          return (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onMouseEnter={() => setHoveredId(video.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                borderRadius: radius[cardRadius], overflow: 'hidden', backgroundColor: colors.card,
                border: `1px solid ${colors.border}`, cursor: 'pointer', transition: 'all 0.3s ease',
                transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'none',
                boxShadow: isHovered ? `0 12px 40px -8px ${colors.accent}33` : `0 2px 8px -2px ${colors.text}11`,
              }}
              onClick={() => { if (isUnlocked) setModalVideo(video); }}
            >
              {/* Thumbnail */}
              <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                <img
                  src={thumbnailUrl}
                  alt={video.title}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    filter: !isUnlocked ? 'brightness(0.4) blur(2px)' : 'none',
                    transition: 'all 0.3s',
                    transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                  }}
                />
                {/* Overlay */}
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  background: isUnlocked
                    ? (isHovered ? 'rgba(0,0,0,0.3)' : 'transparent')
                    : `linear-gradient(180deg, transparent 0%, ${colors.bg}CC 100%)`,
                  transition: 'all 0.3s',
                }}>
                  {isUnlocked ? (
                    isHovered && (
                      <div style={{
                        width: '3rem', height: '3rem', borderRadius: '50%', backgroundColor: colors.accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Play style={{ width: '1.4rem', height: '1.4rem', color: colors.accentFg, marginLeft: '2px' }} />
                      </div>
                    )
                  ) : (
                    <>
                      <Lock style={{ width: '1.5rem', height: '1.5rem', color: '#ffffffCC', marginBottom: '0.35rem' }} />
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 700, color: '#fff', backgroundColor: colors.accent,
                        padding: '0.2rem 0.6rem', borderRadius: '9999px', fontFamily: fontFamily[style.fontVibe],
                      }}>
                        {video.price} créditos
                      </span>
                    </>
                  )}
                </div>

                {/* Duration badge */}
                <div style={{
                  position: 'absolute', bottom: '0.5rem', right: '0.5rem', display: 'flex',
                  alignItems: 'center', gap: '0.25rem', backgroundColor: 'rgba(0,0,0,0.75)',
                  color: '#fff', padding: '0.15rem 0.45rem', borderRadius: '4px',
                  fontSize: '0.7rem', fontWeight: 600, zIndex: 5,
                }}>
                  <Clock style={{ width: '0.65rem', height: '0.65rem' }} />
                  {video.duration}
                </div>

                {/* Category badge */}
                <div style={{
                  position: 'absolute', top: '0.5rem', left: '0.5rem',
                  backgroundColor: `${colors.accent}DD`, color: colors.accentFg,
                  padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem',
                  fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', zIndex: 5,
                }}>
                  {video.category}
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: '0.75rem' }}>
                <h3 style={{
                  fontSize: '0.85rem', fontWeight: 600, fontFamily: fontFamily[style.fontVibe],
                  color: colors.text, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
                }}>
                  {video.title}
                </h3>
                <p style={{
                  fontSize: '0.75rem', color: colors.textMuted, marginTop: '0.35rem', lineHeight: 1.4,
                  overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
                }}>
                  {video.description}
                </p>

                {!isUnlocked && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onUnlock?.(video.id); }}
                    disabled={isUnlocking}
                    style={{
                      marginTop: '0.6rem', width: '100%', padding: '0.5rem',
                      backgroundColor: colors.accent, color: colors.accentFg, border: 'none',
                      borderRadius: radius[style.borderRadius === 'full' ? 'md' : style.borderRadius],
                      fontWeight: 600, cursor: isUnlocking ? 'wait' : 'pointer', fontSize: '0.75rem',
                      fontFamily: fontFamily[style.fontVibe], opacity: isUnlocking ? 0.7 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {isUnlocking ? (
                      <Loader2 style={{ width: '0.85rem', height: '0.85rem', animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <Lock style={{ width: '0.75rem', height: '0.75rem' }} />
                    )}
                    Desbloquear — {video.price} créditos
                  </button>
                )}

                {isUnlocked && (
                  <div style={{
                    marginTop: '0.5rem', fontSize: '0.7rem', color: colors.accent, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                  }}>
                    <Play style={{ width: '0.7rem', height: '0.7rem' }} />
                    Clique para assistir
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* FULLSCREEN MODAL */}
      <AnimatePresence>
        {modalVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setModalVideo(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              backgroundColor: 'rgba(0, 0, 0, 0.92)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '1rem',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setModalVideo(null)}
              style={{
                position: 'absolute', top: '1rem', right: '1rem', zIndex: 10001,
                width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.15)', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)')}
            >
              <X style={{ width: '1.25rem', height: '1.25rem', color: '#fff' }} />
            </button>

            {/* Video title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                marginBottom: '1rem', textAlign: 'center', maxWidth: '600px',
              }}
            >
              <h2 style={{
                color: '#fff', fontSize: '1.25rem', fontWeight: 700,
                fontFamily: fontFamily[style.fontVibe],
              }}>
                {modalVideo.title}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                {modalVideo.category} • {modalVideo.duration}
              </p>
            </motion.div>

            {/* Video container with security */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative', width: '100%', maxWidth: '960px',
                aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden',
                boxShadow: '0 25px 80px -15px rgba(0,0,0,0.6)',
              }}
            >
              <iframe
                src={getYouTubeEmbedUrl(modalVideo.youtubeId, true)}
                title={modalVideo.title}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />

              {/* Transparent mask — top 15% blocks YouTube title/link */}
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '15%',
                zIndex: 10, background: 'rgba(0,0,0,0)',
              }} />

              {/* Transparent mask — bottom 10% blocks YouTube branding */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, width: '100%', height: '10%',
                zIndex: 10, background: 'rgba(0,0,0,0)',
              }} />
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              style={{
                color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: '1rem',
                maxWidth: '600px', textAlign: 'center', lineHeight: 1.5,
              }}
            >
              {modalVideo.description}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoPortfolioGrid;
