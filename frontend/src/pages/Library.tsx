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
};

/**
 * A new component to display the details for a single selected book.
 */
function BookDetailView({ book, onBack }: { book: Book, onBack: () => void }) {
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
                target="_blank" // The external link now opens in a new tab from the detail view
                rel="noopener noreferrer"
                className="inline-block mt-6 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Find in Store or Library
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


/**
 * The main Library component, updated to switch between grid and detail views.
 */
export default function Library() {
  const [books, setBooks] = useState<Book[]>([]);
  // 1. State to track the selected book
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    // Added error handling as a best practice
    apiGet<Book[]>('/library/books')
      .then(setBooks)
      .catch((err) => console.error("Failed to fetch books:", err));
  }, []);

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
    </div>
  );
}