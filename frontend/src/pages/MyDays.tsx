import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { format } from 'date-fns';
import { Calendar, PenTool, MessageCircle, AlertTriangle, BookOpen, Video, NotebookPen } from 'lucide-react';

type UnifiedItem = {
  id: string;
  kind: 'draw' | 'thoughts' | 'issues' | 'journal' | 'video' | 'read';
  createdAt: string;
  // optional
  textContent?: string;
  aiInsight?: string;
  content?: string;
  sentimentScore?: number | null;
  videoId?: string | null;
  videoSummary?: string;
};

type DayGroup = {
  date: string;
  items: UnifiedItem[];
};

export default function MyDays() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<DayGroup[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await apiGet<DayGroup[]>('/history');
        setDays(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-primary">Loading your days...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="text-red-500">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
        <div className="text-xl font-medium">No entries yet</div>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-md">
          Start creating drawings, thoughts, or sharing what's not working to see your journey here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-brand-blue">
          My Days
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Your journey of drawings, journals, videos, and readings over time.
        </p>
      </div>

      <div className="space-y-10">
        {days.map((day) => (
          <div key={day.date} className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-neutral-100 dark:bg-neutral-800/50 p-4 flex items-center gap-3">
              <Calendar className="text-primary" />
              <h2 className="text-xl font-medium">
                {format(new Date(day.date), 'EEEE, MMMM d, yyyy')}
              </h2>
            </div>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {day.items.map((item) => (
                <div key={item.id} className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    {item.kind === 'draw' ? (
                      <PenTool size={18} className="text-blue-500" />
                    ) : item.kind === 'thoughts' ? (
                      <MessageCircle size={18} className="text-green-500" />
                    ) : item.kind === 'issues' ? (
                      <AlertTriangle size={18} className="text-amber-500" />
                    ) : item.kind === 'journal' ? (
                      <NotebookPen size={18} className="text-purple-500" />
                    ) : item.kind === 'video' ? (
                      <Video size={18} className="text-rose-500" />
                    ) : (
                      <BookOpen size={18} className="text-emerald-600" />
                    )}
                    <div className="text-sm font-medium">
                      {item.kind === 'draw' && 'Drawing'}
                      {item.kind === 'thoughts' && 'Thoughts'}
                      {item.kind === 'issues' && "What's Not Working"}
                      {item.kind === 'journal' && 'Journal'}
                      {item.kind === 'video' && 'Video Summary'}
                      {item.kind === 'read' && 'Reading Session'}
                    </div>
                    <div className="text-xs text-neutral-500 ml-auto">
                      {format(new Date(item.createdAt), 'h:mm a')}
                    </div>
                  </div>

                  {/* Draw/Thoughts/Issues content */}
                  {(item.kind === 'thoughts' || item.kind === 'issues') && item.textContent && (
                    <div className="mb-4 text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800/50 p-3 rounded-lg">
                      {item.textContent}
                    </div>
                  )}
                  {item.kind === 'draw' && (
                    <div className="mb-4 bg-neutral-100 dark:bg-neutral-800/50 p-3 rounded-lg text-center text-sm text-neutral-500">
                      [Drawing content]
                    </div>
                  )}

                  {/* Journal content */}
                  {item.kind === 'journal' && item.content && (
                    <div className="mb-4 bg-neutral-50 dark:bg-neutral-800/40 p-3 rounded-lg">
                      <div className="text-sm whitespace-pre-wrap">{item.content}</div>
                    </div>
                  )}

                  {/* Video summary */}
                  {item.kind === 'video' && (
                    <div className="mb-2 text-sm text-neutral-700 dark:text-neutral-300">
                      {item.videoSummary || 'Summary submitted'}
                    </div>
                  )}

                  {/* Reading */}
                  {item.kind === 'read' && (
                    <div className="text-sm text-emerald-700 dark:text-emerald-300">Completed reading session</div>
                  )}

                  {/* AI Insight (for drawing and text captures) */}
                  {['draw', 'thoughts', 'issues'].includes(item.kind) && (
                    item.aiInsight ? (
                      <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                        <div className="text-xs uppercase tracking-wider text-primary mb-2 font-medium">AI Insight</div>
                        <div className="text-sm">{item.aiInsight}</div>
                      </div>
                    ) : (
                      <div className="text-sm text-neutral-500 italic">No AI insight available</div>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}