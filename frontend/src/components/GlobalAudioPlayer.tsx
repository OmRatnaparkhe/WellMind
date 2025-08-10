import { useEffect, useRef, useState } from 'react';
import { apiGet } from '@/lib/api';

type Playlist = { id: string; name: string; externalUrl?: string; images?: { url: string }[] };
type Track = { id: string; title: string; artist: string; image?: string; previewUrl: string; externalUrl?: string };

export default function GlobalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const current = tracks[currentIndex];

  useEffect(() => {
    // Load initial playlists lazily
    apiGet<Playlist[]>('/music/playlists').then(setPlaylists).catch(() => {});
    const handler = (e: any) => {
      const pid = e?.detail?.playlistId as string | undefined;
      if (pid) loadPlaylist(pid);
    };
    window.addEventListener('music:playPlaylist' as any, handler);
    return () => window.removeEventListener('music:playPlaylist' as any, handler);
  }, []);

  const loadPlaylist = async (playlistId: string) => {
    setLoading(true);
    try {
      const list = await apiGet<Track[]>(`/music/playlist/${playlistId}/tracks`);
      setTracks(list);
      setCurrentIndex(0);
      setVisible(true);
      setTimeout(() => play(), 0);
    } finally {
      setLoading(false);
    }
  };

  const play = () => {
    if (!audioRef.current) return;
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  };
  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };
  const stop = () => {
    pause();
    setVisible(false);
    setTracks([]);
    setCurrentIndex(0);
  };
  const next = () => {
    if (tracks.length === 0) return;
    setCurrentIndex((i) => (i + 1) % tracks.length);
    setTimeout(() => play(), 0);
  };
  const prev = () => {
    if (tracks.length === 0) return;
    setCurrentIndex((i) => (i - 1 + tracks.length) % tracks.length);
    setTimeout(() => play(), 0);
  };

  return (
    <>
      {/* Launcher floating button */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative">
          <details className="group">
            <summary className="list-none cursor-pointer select-none rounded-full shadow-glow bg-primary text-white px-4 py-2">
              {loading ? 'Loading…' : 'Music'}
            </summary>
            <div className="absolute right-0 mt-2 w-72 max-h-96 overflow-auto rounded-xl border bg-white/90 dark:bg-neutral-900/90 backdrop-blur p-3 space-y-2">
              <div className="text-xs opacity-60">Pick a playlist</div>
              {playlists.map((p) => (
                <button key={p.id} onClick={() => loadPlaylist(p.id)} className="w-full text-left px-3 py-2 rounded hover:bg-primary/10">
                  {p.name}
                </button>
              ))}
            </div>
          </details>
        </div>
      </div>

      {/* Player bar */}
      {visible && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/80 dark:bg-neutral-900/80 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-3">
            {current?.image && <img src={current.image} alt="" className="w-10 h-10 rounded" />}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{current?.title ?? '—'}</div>
              <div className="text-xs text-neutral-500 truncate">{current?.artist ?? ''}</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800" onClick={prev} title="Previous">⏮️</button>
              {isPlaying ? (
                <button className="px-3 py-1 rounded bg-primary text-white" onClick={pause} title="Pause">Pause</button>
              ) : (
                <button className="px-3 py-1 rounded bg-primary text-white" onClick={play} title="Play">Play</button>
              )}
              <button className="px-2 py-1 rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800" onClick={next} title="Next">⏭️</button>
              <button className="px-2 py-1 rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800" onClick={stop} title="Stop">⏹️</button>
            </div>
            <audio
              ref={audioRef}
              src={current?.previewUrl}
              onEnded={next}
            />
          </div>
        </div>
      )}
    </>
  );
}


