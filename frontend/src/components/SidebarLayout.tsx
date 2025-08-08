import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Home, CheckSquare, PenTool, Video, Music, BookOpen, Calendar, HelpCircle } from 'lucide-react';

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const { pathname } = useLocation();

  const linkClass = (to: string) =>
    `flex items-center gap-3 rounded-md px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
      pathname === to ? 'bg-neutral-100 dark:bg-neutral-800 font-medium' : ''
    }`;

  return (
    <div className="grid grid-cols-[auto_1fr] min-h-screen">
      <aside className={`border-r border-neutral-200 dark:border-neutral-800 transition-all ${open ? 'w-64' : 'w-16'}`}>
        <div className="flex items-center justify-between p-3">
          <button className="text-xl font-bold" onClick={() => setOpen((v) => !v)}>
            {open ? '☰' : '☷'}
          </button>
          {open && <span className="text-lg font-bold">MindWell</span>}
        </div>
        <nav className="p-2 space-y-1">
          <Link className={linkClass('/dashboard')} to="/dashboard">
            <Home size={18} /> {open && 'Dashboard'}
          </Link>
          <Link className={linkClass('/checklist')} to="/checklist">
            <CheckSquare size={18} /> {open && 'Checklist'}
          </Link>
          <Link className={linkClass('/canvas')} to="/canvas">
            <PenTool size={18} /> {open && 'Thoughts (Canvas)'}
          </Link>
          <Link className={linkClass('/videos')} to="/videos">
            <Video size={18} /> {open && 'Videos'}
          </Link>
          <Link className={linkClass('/quizz')} to="/quizz">
            <HelpCircle size={18} /> {open && 'Quizz'}
          </Link>
          <Link className={linkClass('/music')} to="/music">
            <Music size={18} /> {open && 'Music'}
          </Link>
          <Link className={linkClass('/library')} to="/library">
            <BookOpen size={18} /> {open && 'Library'}
          </Link>
          <Link className={linkClass('/appointment')} to="/appointment">
            <Calendar size={18} /> {open && 'Appointment'}
          </Link>
        </nav>
      </aside>
      <main className="p-4 lg:p-6">{children}</main>
    </div>
  );
}


