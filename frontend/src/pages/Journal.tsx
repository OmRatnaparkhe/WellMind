import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

type JournalEntry = {
  id: string;
  content: string;
  sentimentScore: number | null;
  keywords: string[];
  createdAt: string;
};

export default function Journal() {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'write' | 'history'>('write');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecentEntries();
  }, []);

  const loadRecentEntries = async () => {
    try {
      setIsLoading(true);
      const entries = await apiGet<JournalEntry[]>('/journal/history?days=30');
      setRecentEntries(entries);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      toast.error('Failed to load journal entries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please write something before submitting');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await apiPost<JournalEntry>('/journal', { content });
      
      toast.success('Journal entry saved!');
      setContent('');
      
      // Add the new entry to the list and refresh
      await loadRecentEntries();
      
      // Show sentiment feedback if available
      if (response.sentimentScore !== null) {
        let message = '';
        if (response.sentimentScore >= 7) {
          message = 'Your entry has a positive tone. Great job expressing yourself!';
        } else if (response.sentimentScore >= 4) {
          message = 'Your entry has a neutral tone. Thanks for sharing your thoughts.';
        } else {
          message = 'Your entry has a more challenging tone. Remember to be kind to yourself.';
        }
        toast(message);
      }
    } catch (error) {
      console.error('Error saving journal entry:', error);
      toast.error('Failed to save journal entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const viewEntry = async (id: string) => {
    try {
      const entry = await apiGet<JournalEntry>(`/journal/${id}`);
      setSelectedEntry(entry);
    } catch (error) {
      console.error('Error fetching journal entry:', error);
      toast.error('Failed to load journal entry');
    }
  };

  const getSentimentEmoji = (score: number | null) => {
    if (score === null) return '📝';
    if (score >= 7) return '😊';
    if (score >= 4) return '😐';
    return '😔';
  };

  const getSentimentColor = (score: number | null) => {
    if (score === null) return 'bg-neutral-100 dark:bg-neutral-700';
    if (score >= 7) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 4) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Journal</h1>
        
        <div className="flex border-b border-neutral-200 dark:border-neutral-700 mb-6">
          <button
            onClick={() => setActiveTab('write')}
            className={`px-4 py-2 font-medium ${activeTab === 'write' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
          >
            Write
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              setSelectedEntry(null);
            }}
            className={`px-4 py-2 font-medium ${activeTab === 'history' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
          >
            History
          </button>
        </div>

        {activeTab === 'write' && (
          <div>
            <div className="mb-6">
              <label htmlFor="journal" className="block text-sm font-medium mb-2">
                What's on your mind today?
              </label>
              <textarea
                id="journal"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write about your thoughts, feelings, experiences, or anything else you'd like to express..."
                className="w-full p-4 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={10}
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                className={`px-6 py-2 rounded-lg ${!content.trim()
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
                  'Save Entry'
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : selectedEntry ? (
              <div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="mb-4 text-sm flex items-center text-neutral-500 hover:text-primary transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to entries
                </button>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{format(new Date(selectedEntry.createdAt), 'MMMM d, yyyy')}</h3>
                    <div className="flex items-center">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400 mr-2">
                        {format(new Date(selectedEntry.createdAt), 'h:mm a')}
                      </span>
                      <span className="text-xl" title="Sentiment score">
                        {getSentimentEmoji(selectedEntry.sentimentScore)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white dark:bg-neutral-700 rounded-lg border border-neutral-200 dark:border-neutral-600">
                    <p className="whitespace-pre-wrap">{selectedEntry.content}</p>
                  </div>
                </div>
                
                {selectedEntry.keywords && selectedEntry.keywords.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Keywords:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.keywords.map((keyword, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : recentEntries.length > 0 ? (
              <div className="space-y-4">
                {recentEntries.map((entry) => (
                  <div 
                    key={entry.id} 
                    onClick={() => viewEntry(entry.id)}
                    className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${getSentimentColor(entry.sentimentScore)}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{format(new Date(entry.createdAt), 'MMMM d, yyyy')}</h3>
                      <div className="flex items-center">
                        <span className="text-sm text-neutral-500 dark:text-neutral-400 mr-2">
                          {format(new Date(entry.createdAt), 'h:mm a')}
                        </span>
                        <span className="text-xl">{getSentimentEmoji(entry.sentimentScore)}</span>
                      </div>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-300 line-clamp-2">
                      {entry.content}
                    </p>
                    {entry.keywords && entry.keywords.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {entry.keywords.slice(0, 3).map((keyword, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-0.5 bg-white/50 dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 text-xs rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                        {entry.keywords.length > 3 && (
                          <span className="px-2 py-0.5 bg-white/50 dark:bg-neutral-800/50 text-neutral-500 text-xs rounded-full">
                            +{entry.keywords.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-neutral-500 dark:text-neutral-400 mb-4">No journal entries yet</p>
                <button
                  onClick={() => setActiveTab('write')}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Write your first entry
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}