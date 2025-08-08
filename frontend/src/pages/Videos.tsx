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
    <div>
      <h2 className="text-2xl font-bold mb-4">Motivational Videos</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((v) => (
          <a
            key={v.id}
            href={`https://www.youtube.com/watch?v=${v.youtubeId}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border hover:shadow-lg transition overflow-hidden block"
          >
            {v.thumbnailUrl && (
              <img src={v.thumbnailUrl} alt={v.title} className="w-full aspect-video object-cover" />
            )}
            <div className="p-3">
              <div className="font-semibold">{v.title}</div>
              {v.description && <p className="text-sm mt-1">{v.description}</p>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}


