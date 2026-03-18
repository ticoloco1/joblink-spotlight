'use client';

import { useState, useEffect } from 'react';

interface FeedCountdownProps {
  expiresAt: string;
  className?: string;
}

/** Relógio em contagem regressiva (segundos). Fundo branco, dígitos azul/verde matrix. */
export default function FeedCountdown({ expiresAt, className = '' }: FeedCountdownProps) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const end = new Date(expiresAt).getTime();
    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setSecondsLeft(diff);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  const d = Math.floor(secondsLeft / 86400);
  const h = Math.floor((secondsLeft % 86400) / 3600);
  const m = Math.floor((secondsLeft % 3600) / 60);
  const s = secondsLeft % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-lg bg-white px-2 py-1 font-mono text-sm tabular-nums ${className}`}
      style={{
        color: '#00ff88',
        textShadow: '0 0 8px rgba(0,255,136,0.6)',
        boxShadow: 'inset 0 0 12px rgba(0,255,136,0.15)',
        border: '1px solid rgba(0,255,136,0.3)',
      }}
      title="Expira em 7 dias"
    >
      {d > 0 && <span>{d}d</span>}
      <span>{pad(h)}:{pad(m)}:{pad(s)}</span>
    </div>
  );
}
