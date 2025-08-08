import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

type Playlist = {
  id: string;
  name: string;
  externalUrl?: string;
  images?: { url: string }[];
  owner?: string;
};

export default function Music() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  useEffect(() => {
    apiGet<Playlist[]>('/music/playlists').then(setPlaylists).catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Relaxing Playlists</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.map((p) => (
          <a
            key={p.id}
            href={p.externalUrl}
            target="_blank"
            className="rounded-lg border overflow-hidden hover:shadow-lg transition block"
            rel="noreferrer"
          >
            {p.images?.[0]?.url && (
              <img src={p.images[0].url} alt={p.name} className="w-full aspect-square object-cover" />
            )}
            <div className="p-3">
              <div className="font-semibold">{p.name}</div>
              {p.owner && <div className="text-sm text-neutral-500">by {p.owner}</div>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}


