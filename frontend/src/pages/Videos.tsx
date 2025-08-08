import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

type Video = {
  id: string;
  title: string;
  youtubeId: string;
  thumbnailUrl?: string;
  description?: string;
};

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  useEffect(() => {
    apiGet<Video[]>('/library/videos').then(setVideos).catch(() => {});
  }, []);

  return (
    <div className="animate-fadeInUp">
      <div className="relative mb-8 rounded-2xl p-6 glass-effect shadow-card overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-tr from-brand-purple/30 to-brand-blue/30 rounded-full blur-2xl opacity-70" />
        <h2 className="text-2xl font-bold relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-primary to-brand-blue animate-gradient bg-300%">Motivational Videos</h2>
        <p className="text-neutral-600 dark:text-neutral-300 relative z-10 mt-2">Discover videos that inspire and motivate you on your journey.</p>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((v, index) => (
          <a
            key={v.id}
            href={`https://www.youtube.com/watch?v=${v.youtubeId}`}
            target="_blank"
            rel="noreferrer"
            className="group rounded-xl overflow-hidden block bg-white/60 dark:bg-neutral-800/50 backdrop-blur-sm shadow-card hover:shadow-glow transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.02] animate-fadeInUp"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative overflow-hidden">
              {v.thumbnailUrl && (
                <img 
                  src={v.thumbnailUrl} 
                  alt={v.title} 
                  className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                <div className="bg-primary/90 text-white px-4 py-2 rounded-full transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  Watch Now
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="font-semibold text-lg">{v.title}</div>
              {v.description && <p className="text-sm mt-1 text-neutral-600 dark:text-neutral-400">{v.description}</p>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}


