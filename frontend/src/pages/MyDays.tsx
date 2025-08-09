import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { format } from 'date-fns';
import { Calendar, PenTool, MessageCircle, AlertTriangle } from 'lucide-react';

type DrawingItem = {
  id: string;
  inputType: 'draw' | 'thoughts' | 'issues';
  aiInsight?: string;
  textContent?: string;
  createdAt: string;
};

type DayGroup = {
  date: string;
  items: DrawingItem[];
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
          Your journey of thoughts, drawings, and reflections over time.
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
                    {item.inputType === 'draw' ? (
                      <PenTool size={18} className="text-blue-500" />
                    ) : item.inputType === 'thoughts' ? (
                      <MessageCircle size={18} className="text-green-500" />
                    ) : (
                      <AlertTriangle size={18} className="text-amber-500" />
                    )}
                    <div className="text-sm font-medium">
                      {item.inputType === 'draw' 
                        ? 'Drawing' 
                        : item.inputType === 'thoughts' 
                          ? 'Thoughts' 
                          : "What's Not Working"}
                    </div>
                    <div className="text-xs text-neutral-500 ml-auto">
                      {format(new Date(item.createdAt), 'h:mm a')}
                    </div>
                  </div>

                  {item.inputType !== 'draw' && item.textContent && (
                    <div className="mb-4 text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800/50 p-3 rounded-lg">
                      {item.textContent}
                    </div>
                  )}

                  {item.inputType === 'draw' && (
                    <div className="mb-4 bg-neutral-100 dark:bg-neutral-800/50 p-3 rounded-lg text-center text-sm text-neutral-500">
                      [Drawing content]
                    </div>
                  )}

                  {item.aiInsight ? (
                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                      <div className="text-xs uppercase tracking-wider text-primary mb-2 font-medium">AI Insight</div>
                      <div className="text-sm">{item.aiInsight}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-neutral-500 italic">No AI insight available</div>
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