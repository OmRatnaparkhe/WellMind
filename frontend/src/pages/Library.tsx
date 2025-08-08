import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

type Book = {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
  linkUrl?: string;
};

export default function Library() {
  const [books, setBooks] = useState<Book[]>([]);
  useEffect(() => {
    apiGet<Book[]>('/library/books').then(setBooks).catch(() => {});
  }, []);

  return (
    <div className="animate-fadeInUp">
      <div className="relative mb-8 rounded-2xl p-6 glass-effect shadow-card overflow-hidden">
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-tr from-brand-teal/30 to-brand-indigo/30 rounded-full blur-2xl opacity-70 animate-pulse" />
        <h2 className="text-2xl font-bold relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-brand-indigo to-brand-teal animate-gradient bg-300%">Self-Help Library</h2>
        <p className="text-neutral-600 dark:text-neutral-300 relative z-10 mt-2">Explore books that can guide you on your personal growth journey.</p>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 perspective-1000">
        {books.map((b, index) => (
          <a 
            key={b.id} 
            href={b.linkUrl} 
            target="_blank" 
            rel="noreferrer" 
            className="group rounded-xl overflow-hidden block bg-white/60 dark:bg-neutral-800/50 backdrop-blur-sm shadow-card hover:shadow-glow transition-all duration-500 transform hover:-translate-y-1 hover:rotate-y-5 animate-fadeInUp"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative overflow-hidden">
              {b.coverUrl && (
                <div className="relative">
                  <img 
                    src={b.coverUrl} 
                    alt={b.title} 
                    className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="text-sm font-medium">Read Now</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="font-semibold text-lg group-hover:text-primary transition-colors duration-300">{b.title}</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">{b.author}</div>
              {b.description && <p className="text-sm mt-2 text-neutral-600 dark:text-neutral-300 line-clamp-2">{b.description}</p>}
              
              <div className="mt-3 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#FFC107" stroke="#FFC107" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                ))}
                <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-1">5.0</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}


