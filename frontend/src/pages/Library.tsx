import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

// Define the Book type
type Book = {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
  linkUrl?: string;
  textUrl?: string;
  htmlUrl?: string;
};

/**
 * A new component to display the details for a single selected book.
 */
function BookDetailView({ book, onBack }: { book: Book; onBack: () => void }) {
  return (
    // This wrapper div controls the size and centers the detail view
    <div className="max-w-4xl mx-auto animate-fadeInUp">
      <div className="space-y-6">
        <button onClick={onBack} className="text-primary font-semibold hover:underline">&larr; Back to all books</button>
        
        <div className="flex flex-col sm:flex-row gap-8 bg-white/60 dark:bg-neutral-800/50 p-6 sm:p-8 rounded-2xl shadow-card">
          {/* Book Cover */}
          <div className="flex-shrink-0 mx-auto sm:mx-0">
            {book.coverUrl && (
              <img 
                src={book.coverUrl} 
                alt={`Cover of ${book.title}`} 
                className="w-48 sm:w-56 h-auto rounded-lg shadow-2xl"
              />
            )}
          </div>
          
          {/* Book Info */}
          <div className="flex flex-col text-center sm:text-left">
            <h2 className="text-3xl font-bold">{book.title}</h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 mt-1">by {book.author}</p>
            <p className="mt-4 text-base flex-grow">{book.description}</p>
            
            {book.linkUrl && (
              <a 
                href={book.linkUrl} 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-6 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                View on Gutenberg
              </a>
            )}
          </div>
        </div>

        {/* Embedded reader */}
        <BookReader bookId={book.id} />
      </div>
    </div>
  );
}

function BookReader({ bookId }: { bookId: string }) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:4000/api'}/library/public/${bookId}/content-paged?page=${page}&pageSize=6000`, { credentials: 'include' });
        if (!res.ok) throw new Error(await res.text());
        const { content: txt, page: p, totalPages: tp } = await res.json();
        if (cancelled) return;
        setPage(p);
        setTotalPages(tp);
        setContent(`<pre class=\"whitespace-pre-wrap text-sm\">${escapeHtml(txt)}</pre>`);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load content');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookId, page]);

  if (loading) return <div className="mt-6 text-sm text-primary">Loading book…</div>;
  if (error) return <div className="mt-6 text-sm text-red-500">{error}</div>;
  if (!content) return null;
  return (
    <div className="mt-6 bg-white/60 dark:bg-neutral-800/50 p-4 rounded-xl shadow-card">
      <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          className="px-3 py-2 rounded border disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Prev
        </button>
        <div className="text-sm opacity-70">Page {page} of {totalPages}</div>
        <button
          className="px-3 py-2 rounded border disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


/**
 * The main Library component, updated to switch between grid and detail views.
 */
export default function Library() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [query, setQuery] = useState('self help');
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // Debounce query
  useEffect(() => {
    const id = setTimeout(() => {
      setBooks([]);
      setPage(1);
      setNextPage(undefined);
      void load(query, 1, true);
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    // initial load
    void load(query, 1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async (q: string, p: number, replace = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ q: q.trim() || 'self help', page: String(p) });
      const { items, nextPage: np } = await apiGet<{ items: Book[]; nextPage?: number }>(`/library/public?${params.toString()}`);
      setNextPage(np);
      setPage(p);
      if (replace) setBooks(items);
      else setBooks((prev) => [...prev, ...items]);
    } catch (err) {
      // no-op
    } finally {
      setLoading(false);
    }
  };

  // 2. If a book is selected, render the detail view
  if (selectedBook) {
    return <BookDetailView book={selectedBook} onBack={() => setSelectedBook(null)} />;
  }

  // 3. Otherwise, render the grid view
  return (
    <div className="animate-fadeInUp">
      <div className="relative mb-8 rounded-2xl p-6 glass-effect shadow-card overflow-hidden">
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-tr from-brand-teal/30 to-brand-indigo/30 rounded-full blur-2xl opacity-70 animate-pulse" />
        <h2 className="text-2xl font-bold relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-brand-indigo to-brand-teal animate-gradient bg-300%">Self-Help Library</h2>
        <p className="text-neutral-600 dark:text-neutral-300 relative z-10 mt-2">Explore books that can guide you on your personal growth journey.</p>
        <div className="mt-4 relative z-10">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search public domain books (e.g., habit, focus, stoic)"
            className="w-full md:w-96 px-3 py-2 rounded-lg border dark:border-neutral-700 bg-white/70 dark:bg-neutral-800/50"
          />
        </div>
      </div>
      
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((b, index) => (
          // 4. Changed <a> tag to a <button> with an onClick handler
          <button 
            key={b.id} 
            onClick={() => setSelectedBook(b)}
            className="group rounded-xl overflow-hidden block bg-white/60 dark:bg-neutral-800/50 backdrop-blur-sm shadow-card hover:shadow-glow transition-all duration-500 transform hover:-translate-y-1 text-left"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative overflow-hidden">
              {b.coverUrl && (
                <img 
                  src={b.coverUrl} 
                  alt={b.title} 
                  className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              )}
            </div>
            <div className="p-4">
              <div className="font-semibold text-lg group-hover:text-primary transition-colors duration-300 truncate">{b.title}</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{b.author}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        {nextPage ? (
          <button
            disabled={loading}
            onClick={() => load(query, nextPage!, false)}
            className="px-4 py-2 rounded-lg border bg-white/70 dark:bg-neutral-800/50 hover:bg-white"
          >
            {loading ? 'Loading…' : 'Load more'}
          </button>
        ) : (
          <div className="text-sm opacity-60">No more results</div>
        )}
      </div>
    </div>
  );
}