import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';

// Define the Video type
type Video = {
  id: string;
  title: string;
  youtubeId: string;
  thumbnailUrl?: string;
  description?: string;
};

// --- New Player and Summary Component ---
// This component shows when a video is selected.
function PlayerView({ video, onBack }: { video: Video, onBack: () => void }) {
  const [summary, setSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = () => {
    if (!summary.trim()) {
      setSubmitMessage('Please write a summary first.');
      return;
    }
    setIsSubmitting(true);
    setSubmitMessage('');

    // This function sends the summary to your backend.
    // You will need to create this API endpoint. See notes below.
    apiPost('/library/video-summary', { videoId: video.id, summary })
      .then(() => {
        setSubmitMessage('Summary submitted successfully!');
        setTimeout(() => {
          onBack(); // Go back to the video grid after 2 seconds
        }, 2000);
      })
      .catch(() => {
        setSubmitMessage('Failed to submit summary. Please try again.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="animate-fadeInUp space-y-6">
      <button onClick={onBack} className="text-primary hover:underline">&larr; Back to all videos</button>
      
      <div className="bg-white/60 dark:bg-neutral-800/50 p-4 rounded-xl shadow-card">
        {/* YouTube Player Iframe */}
        <div className="aspect-video mb-4">
          <iframe
            className="w-full h-full rounded-lg"
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
        <h3 className="text-2xl font-bold">{video.title}</h3>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">{video.description}</p>
      </div>

      {/* Summary Section */}
      <div className="bg-white/60 dark:bg-neutral-800/50 p-4 rounded-xl shadow-card">
        <h4 className="font-semibold text-lg mb-2">Write a Summary</h4>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full h-32 p-2 border rounded-md bg-transparent dark:border-neutral-600 focus:ring-2 focus:ring-primary outline-none"
          placeholder="What did you learn from this video?"
        />
        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:bg-neutral-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Summary'}
          </button>
          {submitMessage && <p className="text-sm">{submitMessage}</p>}
        </div>
      </div>
    </div>
  );
}


// --- Main Videos Component ---
// This now decides whether to show the grid or the player view.
export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Video[]>('/library/videos')
      .then((arr) => setVideos((arr || []).slice(0, 8)))
      .catch((err) => console.error("Failed to fetch videos:", err));
  }, []);

  // Find the full video object from the ID
  const selectedVideo = videos.find(v => v.youtubeId === selectedVideoId);

  // If a video is selected, show the PlayerView. Otherwise, show the grid.
  if (selectedVideo) {
    return <PlayerView video={selectedVideo} onBack={() => setSelectedVideoId(null)} />;
  }

  return (
    <div className="animate-fadeInUp">
      <div className="relative mb-8 rounded-2xl p-6 glass-effect shadow-card overflow-hidden">
        <h2 className="text-2xl font-bold ...">Motivational Videos</h2>
        <p className="text-neutral-600 ...">Discover videos that inspire and motivate you on your journey.</p>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((v, index) => (
          <button
            key={v.id}
            onClick={() => setSelectedVideoId(v.youtubeId)}
            className="group rounded-xl overflow-hidden block bg-white/60 dark:bg-neutral-800/50 backdrop-blur-sm shadow-card hover:shadow-glow transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.02] animate-fadeInUp text-left"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* ... Card content is the same as before ... */}
            <div className="relative overflow-hidden">
              <img src={v.thumbnailUrl} alt={v.title} className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="p-4">
              <div className="font-semibold text-lg">{v.title}</div>
              <p className="text-sm mt-1 text-neutral-600 dark:text-neutral-400">{v.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}