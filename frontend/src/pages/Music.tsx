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
    <div className="animate-fadeInUp">
      <div className="relative mb-8 rounded-2xl p-6 glass-effect shadow-card overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-tr from-brand-blue/30 to-brand-purple/30 rounded-full blur-2xl opacity-70 animate-pulse" />
        <h2 className="text-2xl font-bold relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-primary animate-gradient bg-300%">Relaxing Playlists</h2>
        <p className="text-neutral-600 dark:text-neutral-300 relative z-10 mt-2">Discover music that calms your mind and soothes your soul.</p>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((p, index) => (
          <a
            key={p.id}
            href={p.externalUrl}
            target="_blank"
            className="group rounded-xl overflow-hidden block bg-white/60 dark:bg-neutral-800/50 backdrop-blur-sm shadow-card hover:shadow-glow transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.02] animate-fadeInUp"
            rel="noreferrer"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative overflow-hidden">
              {p.images?.[0]?.url && (
                <div className="relative">
                  <img 
                    src={p.images[0].url} 
                    alt={p.name} 
                    className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/30 rounded-full backdrop-blur-sm animate-pulse"></div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="font-semibold text-lg group-hover:text-primary transition-colors duration-300">{p.name}</div>
              {p.owner && <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">by {p.owner}</div>}
              <div className="mt-3 h-1 w-0 group-hover:w-full bg-gradient-to-r from-brand-blue to-brand-purple rounded-full transition-all duration-700 ease-out"></div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}


