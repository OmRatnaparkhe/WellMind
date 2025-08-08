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
    <div>
      <h2 className="text-2xl font-bold mb-4">Self-Help Library</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((b) => (
          <a key={b.id} href={b.linkUrl} target="_blank" rel="noreferrer" className="rounded-lg border hover:shadow-lg transition overflow-hidden block">
            {b.coverUrl && <img src={b.coverUrl} alt={b.title} className="w-full aspect-[3/4] object-cover" />}
            <div className="p-3">
              <div className="font-semibold">{b.title}</div>
              <div className="text-sm text-neutral-500">{b.author}</div>
              {b.description && <p className="text-sm mt-1">{b.description}</p>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}


