import { useEffect, useRef, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { Link } from 'react-router-dom';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import { escapeHtml } from '../utils/helpers.js';
type Checklist = {
  id: string;
  describedDay: boolean;
  videoSummary: boolean;
  readBook: boolean;
  creativeTask?: boolean;
};

export default function Checklist() {
  const [c, setC] = useState<Checklist | null>(null);
  const [open, setOpen] = useState<null | 'draw' | 'journal' | 'video' | 'read'>(null);

  // Excalidraw
  const excalidrawApiRef = useRef<any>(null);
  const [isSavingDraw, setIsSavingDraw] = useState(false);

  // Journal
  const [journalText, setJournalText] = useState('');
  const [isSavingJournal, setIsSavingJournal] = useState(false);

  // Video summary
  const [videos, setVideos] = useState<{ id: string; title: string; youtubeId: string }[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [videoSummary, setVideoSummary] = useState('');
  const [isSavingVideo, setIsSavingVideo] = useState(false);

  // Reading timer
  const [readingMinutes, setReadingMinutes] = useState(15);
  const [readingRunning, setReadingRunning] = useState(false);
  const [readingEndTs, setReadingEndTs] = useState<number | null>(null);
  const [publicBooks, setPublicBooks] = useState<Array<{ id: string; title: string; author: string }>>([]);
  const [publicBooksPage, setPublicBooksPage] = useState(1);
  const [publicBooksNextPage, setPublicBooksNextPage] = useState<number | undefined>(undefined);
  const [publicBooksLoading, setPublicBooksLoading] = useState(false);
  const [selectedPublicBook, setSelectedPublicBook] = useState<string | null>(null);
  const [bookContent, setBookContent] = useState<string>('');
  const [bookPage, setBookPage] = useState(1);
  const [bookTotalPages, setBookTotalPages] = useState(1);

  const refresh = () => apiGet<Checklist>('/checklist/today').then(setC).catch(() => {});
  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    if (open === 'video' && videos.length === 0) {
      apiGet<{ id: string; title: string; youtubeId: string }[]>('/library/videos').then(setVideos).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (readingRunning && readingEndTs) {
      const timer = setInterval(() => {
        if (Date.now() >= readingEndTs) {
          clearInterval(timer);
          setReadingRunning(false);
          apiPost('/checklist/complete', { task: 'readBook' }).then(refresh).catch(() => {});
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [readingRunning, readingEndTs]);

  // Load public books with pagination
  const loadBooks = async (page = 1, replace = false) => {
    try {
      setPublicBooksLoading(true);
      const { items, nextPage } = await apiGet<{ items: Array<{ id: string; title: string; author: string }>; nextPage?: number }>(`/library/public?q=focus&page=${page}`);
      setPublicBooksPage(page);
      setPublicBooksNextPage(nextPage);
      setPublicBooks((prev) => (replace ? items : [...prev, ...items]));
    } finally {
      setPublicBooksLoading(false);
    }
  };
  useEffect(() => {
    loadBooks(1, true).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!selectedPublicBook) return;
      try {
        const { content, page, totalPages } = await apiGet<{ content: string; page: number; totalPages: number }>(`/library/public/${selectedPublicBook}/content-paged?page=${bookPage}&pageSize=4000`);
        if (cancelled) return;
        setBookPage(page);
        setBookTotalPages(totalPages);
        setBookContent(`<pre class=\"whitespace-pre-wrap text-sm\">${escapeHtml(content)}</pre>`);
      } catch {
        if (!cancelled) setBookContent('<div class=\"text-sm text-red-500\">Failed to load book content.</div>');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedPublicBook, bookPage]);

  const complete = async (task: 'describedDay' | 'videoSummary' | 'readBook' | 'creativeTask') => {
    await apiPost('/checklist/complete', { task });
    await refresh();
  };

  const submitDraw = async () => {
    if (!excalidrawApiRef.current) return;
    setIsSavingDraw(true);
    try {
      const api = excalidrawApiRef.current;
      const elements = api.getSceneElements();
      const appState = api.getAppState();
      const files = api.getFiles();
      const payload = { elements, appState, files };
      await apiPost('/drawings', { sceneJson: payload, inputType: 'draw' });
      await complete('describedDay');
      setOpen(null);
    } finally {
      setIsSavingDraw(false);
    }
  };

  const submitJournal = async () => {
    if (!journalText.trim()) return;
    setIsSavingJournal(true);
    try {
      await apiPost('/journal', { content: journalText });
      await complete('creativeTask');
      setJournalText('');
      setOpen(null);
    } finally {
      setIsSavingJournal(false);
    }
  };

  const submitVideoSummary = async () => {
    if (!selectedVideoId || !videoSummary.trim()) return;
    setIsSavingVideo(true);
    try {
      const selected = videos.find(v => v.youtubeId === selectedVideoId) || { id: selectedVideoId } as any;
      await apiPost('/library/video-summary', { videoId: selected.id, summary: videoSummary });
      await complete('videoSummary');
      setSelectedVideoId(null);
      setVideoSummary('');
      setOpen(null);
    } finally {
      setIsSavingVideo(false);
    }
  };

  const startReading = () => {
    const ms = Math.max(1, readingMinutes) * 60 * 1000;
    setReadingEndTs(Date.now() + ms);
    setReadingRunning(true);
  };

  return (
    <div className="animate-fadeInUp">
      <div className="relative mb-8 rounded-2xl p-6 glass-effect shadow-card overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-tr from-brand-purple/30 to-brand-teal/30 rounded-full blur-2xl opacity-70" />
        <h2 className="text-2xl font-bold relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-primary to-brand-teal animate-gradient bg-300%">Daily Checklist</h2>
        <p className="text-neutral-600 dark:text-neutral-300 relative z-10 mt-2">Track your daily wellness activities and build healthy habits.</p>
      </div>
      
      <div className="space-y-4">
        <TaskRow
          label="Describe your day"
          description="Express your thoughts and feelings through drawing"
          done={!!c?.describedDay}
          action={<button className="btn-secondary rounded-xl px-4 py-2" onClick={() => setOpen(open === 'draw' ? null : 'draw')}>{open === 'draw' ? 'Hide' : 'Open'}</button>}
          onComplete={() => complete('describedDay')}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>}
          content={open === 'draw' && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <div className="p-2 flex justify-end">
                <button onClick={submitDraw} disabled={isSavingDraw} className="btn-primary px-4 py-2 rounded">{isSavingDraw ? 'Saving…' : 'Save & Complete'}</button>
              </div>
              <div className="h-72">
                <Excalidraw excalidrawAPI={(api) => (excalidrawApiRef.current = api)} theme="dark" />
              </div>
            </div>
          )}
        />

        <TaskRow
          label="Journal writing"
          description="Write a short journal entry for today"
          done={!!c?.creativeTask}
          action={<button className="btn-secondary rounded-xl px-4 py-2" onClick={() => setOpen(open === 'journal' ? null : 'journal')}>{open === 'journal' ? 'Hide' : 'Open'}</button>}
          onComplete={() => complete('creativeTask')}
          content={open === 'journal' && (
            <div className="mt-4">
              <textarea
                className="w-full min-h-32 p-3 rounded-lg border dark:border-neutral-700 bg-white/70 dark:bg-neutral-800/50"
                placeholder="What's on your mind today?"
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
              />
              <div className="mt-2 flex justify-end">
                <button onClick={submitJournal} disabled={isSavingJournal || !journalText.trim()} className="btn-primary px-4 py-2 rounded">{isSavingJournal ? 'Saving…' : 'Save & Complete'}</button>
              </div>
            </div>
          )}
        />
        <TaskRow
          label="Give video summary"
          description="Watch and reflect on motivational content"
          done={!!c?.videoSummary}
          action={<button className="btn-secondary rounded-xl px-4 py-2" onClick={() => setOpen(open === 'video' ? null : 'video')}>{open === 'video' ? 'Hide' : 'Open'}</button>}
          onComplete={() => complete('videoSummary')}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>}
          content={open === 'video' && (
            <div className="mt-4 space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                {videos.map(v => (
                  <button key={v.id} className={`p-3 rounded border ${selectedVideoId === v.youtubeId ? 'border-primary' : 'border-neutral-300 dark:border-neutral-700'}`} onClick={() => setSelectedVideoId(v.youtubeId)}>
                    <div className="font-medium">{v.title}</div>
                    <div className="text-xs opacity-70">YouTube</div>
                  </button>
                ))}
              </div>
              {selectedVideoId && (
                <div className="space-y-2">
                  <div className="aspect-video">
                    <iframe
                      className="w-full h-full rounded"
                      src={`https://www.youtube.com/embed/${selectedVideoId}`}
                      title="Selected video"
                      frameBorder={0}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                  <textarea
                    className="w-full min-h-24 p-3 rounded-lg border dark:border-neutral-700 bg-white/70 dark:bg-neutral-800/50"
                    placeholder="Write your summary"
                    value={videoSummary}
                    onChange={(e) => setVideoSummary(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <button onClick={submitVideoSummary} disabled={isSavingVideo || !videoSummary.trim()} className="btn-primary px-4 py-2 rounded">{isSavingVideo ? 'Submitting…' : 'Submit & Complete'}</button>
                  </div>
                </div>
              )}
            </div>
          )}
        />
        <TaskRow
          label="Read your book"
          description="Set a time and read. Auto-completes when timer ends."
          done={!!c?.readBook}
          action={<button className="btn-secondary rounded-xl px-4 py-2" onClick={() => setOpen(open === 'read' ? null : 'read')}>{open === 'read' ? 'Hide' : 'Open'}</button>}
          onComplete={() => complete('readBook')}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>}
          content={open === 'read' && (
            <div className="mt-4 space-y-3">
              <div>
                <div className="text-sm mb-2">Pick a public domain book to read:</div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {publicBooks.map((b) => (
                    <button key={b.id} className={`px-3 py-2 rounded border text-left ${selectedPublicBook === b.id ? 'border-primary' : 'border-neutral-300 dark:border-neutral-700'}`} onClick={() => setSelectedPublicBook(b.id)}>
                      <div className="font-medium truncate">{b.title}</div>
                      <div className="text-xs opacity-70 truncate">{b.author}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  {publicBooksNextPage ? (
                    <button
                      disabled={publicBooksLoading}
                      onClick={() => loadBooks(publicBooksNextPage!, false)}
                      className="px-3 py-1 rounded border"
                    >
                      {publicBooksLoading ? 'Loading…' : 'Load more books'}
                    </button>
                  ) : (
                    <div className="text-xs opacity-60">No more books</div>
                  )}
                </div>
                {selectedPublicBook && (
                  <div className="mt-3 bg-white/60 dark:bg-neutral-800/50 p-3 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm opacity-70">Open full reader in Library</div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/library`}
                          className="px-2 py-1 rounded border"
                          onClick={() => setOpen(null)}
                        >
                          Go to Library
                        </Link>
                        <button className="px-2 py-1 rounded border" onClick={() => { setSelectedPublicBook(null); setBookContent(''); setBookPage(1); }}>Close</button>
                      </div>
                    </div>
                    <div className="text-sm opacity-70">For a better reading experience with pagination, use the Library page.</div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm">Minutes:</label>
                <input type="number" className="w-24 px-2 py-1 border rounded" value={readingMinutes} min={1} onChange={(e) => setReadingMinutes(parseInt(e.target.value || '1', 10))} />
                {!readingRunning ? (
                  <button className="btn-primary px-3 py-1 rounded" onClick={startReading}>Start Timer</button>
                ) : (
                  <div className="text-sm">Timer running… it will auto-complete when done.</div>
                )}
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}

function TaskRow({ 
  label, 
  description, 
  done, 
  action, 
  onComplete, 
  content,
  icon 
}: { 
  label: string; 
  description?: string; 
  done: boolean; 
  action: React.ReactNode; 
  onComplete: () => void;
  content?: React.ReactNode;
  icon?: React.ReactNode;
 }) {
  return (
    <div className="relative rounded-xl glass-effect p-5 shadow-card hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-brand-blue" />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full ${done ? 'bg-primary/20' : 'bg-neutral-200/50 dark:bg-neutral-700/30'} text-primary`}>
              {icon || (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${done ? 'bg-primary text-white' : 'border-2 border-neutral-300 dark:border-neutral-600'} transition-colors duration-300`}>
                  {done && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                <span className={`text-lg font-medium ${done ? 'text-neutral-500 dark:text-neutral-400 line-through' : ''}`}>{label}</span>
              </div>
              {description && <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 ml-9">{description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3 ml-9 sm:ml-0">
            {action}
            {!done && (
              <button 
                className="btn-primary rounded-xl px-4 py-2 flex items-center gap-2 transform transition-transform hover:scale-105" 
                onClick={onComplete}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Complete
              </button>
            )}
          </div>
        </div>
        {content && (
          <div className="ml-0 sm:ml-12">
            {content}
          </div>
        )}
      </div>
    </div>
  );
}


