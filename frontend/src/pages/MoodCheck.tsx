import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../lib/api';
import { toast } from 'sonner';

type MoodEntry = {
  id: string;
  score: number;
  emoji?: string;
  note?: string;
  createdAt: string;
};

const emojis = [
  { score: 1, emoji: '😭', label: 'Terrible' },
  { score: 2, emoji: '😢', label: 'Bad' },
  { score: 3, emoji: '😕', label: 'Not Great' },
  { score: 4, emoji: '😐', label: 'Neutral' },
  { score: 5, emoji: '🙂', label: 'Okay' },
  { score: 6, emoji: '😊', label: 'Good' },
  { score: 7, emoji: '😃', label: 'Great' },
  { score: 8, emoji: '😄', label: 'Very Happy' },
  { score: 9, emoji: '😁', label: 'Excellent' },
  { score: 10, emoji: '🤩', label: 'Amazing' },
];

export default function MoodCheck() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [todaysMood, setTodaysMood] = useState<MoodEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already logged mood today
    const checkTodaysMood = async () => {
      try {
        setIsLoading(true);
        const mood = await apiGet<MoodEntry>('/mood/today');
        setTodaysMood(mood);
      } catch (error) {
        // 404 is expected if no mood entry exists for today
        if (!(error instanceof Error && error.message.includes('404'))) {
          console.error('Error fetching today\'s mood:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkTodaysMood();
  }, []);

  const handleSubmit = async () => {
    if (selectedMood === null) return;

    try {
      setIsSubmitting(true);
      const selectedEmoji = emojis.find(e => e.score === selectedMood)?.emoji;
      
      await apiPost('/mood', {
        score: selectedMood,
        emoji: selectedEmoji,
        note: note.trim() || undefined,
      });

      toast.success('Mood logged successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error logging mood:', error);
      toast.error('Failed to log mood. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (todaysMood) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-6">Today's Mood Check</h1>
          
          <div className="text-center mb-8">
            <div className="text-7xl mb-4">{todaysMood.emoji || emojis.find(e => e.score === todaysMood.score)?.emoji}</div>
            <p className="text-xl font-medium">{emojis.find(e => e.score === todaysMood.score)?.label}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              You've already logged your mood for today
            </p>
          </div>

          {todaysMood.note && (
            <div className="mt-6 p-4 bg-neutral-100 dark:bg-neutral-700 rounded-xl">
              <h3 className="font-medium mb-2">Your note:</h3>
              <p className="text-neutral-700 dark:text-neutral-300">{todaysMood.note}</p>
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">How are you feeling today?</h1>
        
        <div className="grid grid-cols-5 gap-4 mb-8">
          {emojis.map((mood) => (
            <button
              key={mood.score}
              onClick={() => setSelectedMood(mood.score)}
              className={`flex flex-col items-center p-3 rounded-xl transition-all ${selectedMood === mood.score
                ? 'bg-primary/10 border-2 border-primary scale-105'
                : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
              }`}
            >
              <span className="text-3xl mb-1">{mood.emoji}</span>
              <span className="text-xs font-medium">{mood.label}</span>
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label htmlFor="note" className="block text-sm font-medium mb-2">
            Add a note (optional)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="How are you feeling? What's on your mind?"
            className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={3}
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={selectedMood === null || isSubmitting}
            className={`px-6 py-2 rounded-lg ${selectedMood === null
              ? 'bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary/90 transition-colors'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                Saving...
              </span>
            ) : (
              'Save Mood'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}