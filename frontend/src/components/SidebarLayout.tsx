import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Home, CheckSquare, PenTool, Video, Music, BookOpen, Calendar, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const { pathname } = useLocation();

  const linkClass = (to: string) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/50 dark:hover:bg-neutral-800/50 transition-all duration-300 ${
      pathname === to ? 'bg-white dark:bg-neutral-800 shadow-inner-glow font-medium text-primary dark:text-primary-light' : 'text-neutral-700 dark:text-neutral-300'
    }`;

  return (
    <div className="grid grid-cols-[auto_1fr] min-h-screen bg-gradient-to-br from-brand-lavender/10 to-brand-blue/5 dark:from-neutral-900 dark:to-neutral-950">
      <aside 
        className={`relative border-r border-neutral-200 dark:border-neutral-800 transition-all duration-300 ease-in-out ${open ? 'w-72' : 'w-20'} 
        bg-gradient-to-b from-white/80 to-white/50 dark:from-neutral-900/80 dark:to-neutral-900/50 backdrop-blur-md shadow-xl z-10`}
      >
        <div className="flex items-center justify-between p-5 border-b border-neutral-200/50 dark:border-neutral-800/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-brand-blue shadow-glow flex items-center justify-center text-white font-bold animate-pulse">
              M
            </div>
            <h1 className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-brand-blue transition-all duration-300 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              MindWell
            </h1>
          </div>
          <button 
            className="rounded-full p-1.5 text-neutral-500 hover:text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
        <nav className="p-3 space-y-2 mt-2">
          <Link className={linkClass('/dashboard')} to="/dashboard">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-brand-blue/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Home size={20} className="relative" />
            </div>
            <span className={`whitespace-nowrap transition-all duration-300 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 absolute'}`}>Dashboard</span>
          </Link>
          <Link className={linkClass('/checklist')} to="/checklist">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-brand-blue/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CheckSquare size={20} className="relative" />
            </div>
            <span className={`whitespace-nowrap transition-all duration-300 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 absolute'}`}>Checklist</span>
          </Link>
          <Link className={linkClass('/canvas')} to="/canvas">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-brand-blue/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <PenTool size={20} className="relative" />
            </div>
            <span className={`whitespace-nowrap transition-all duration-300 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 absolute'}`}>Thoughts (Canvas)</span>
          </Link>
          <Link className={linkClass('/videos')} to="/videos">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-brand-blue/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Video size={20} className="relative" />
            </div>
            <span className={`whitespace-nowrap transition-all duration-300 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 absolute'}`}>Videos</span>
          </Link>
          <Link className={linkClass('/quizz')} to="/quizz">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-brand-blue/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <HelpCircle size={20} className="relative" />
            </div>
            <span className={`whitespace-nowrap transition-all duration-300 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 absolute'}`}>Quizz</span>
          </Link>
          <Link className={linkClass('/music')} to="/music">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-brand-blue/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Music size={20} className="relative" />
            </div>
            <span className={`whitespace-nowrap transition-all duration-300 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 absolute'}`}>Music</span>
          </Link>
          <Link className={linkClass('/library')} to="/library">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-brand-blue/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <BookOpen size={20} className="relative" />
            </div>
            <span className={`whitespace-nowrap transition-all duration-300 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 absolute'}`}>Library</span>
          </Link>
          <Link className={linkClass('/appointment')} to="/appointment">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-brand-blue/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Calendar size={20} className="relative" />
            </div>
            <span className={`whitespace-nowrap transition-all duration-300 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 absolute'}`}>Appointment</span>
          </Link>
        </nav>
      </aside>
      <main className="p-6 lg:p-8 overflow-auto">{children}</main>
    </div>
  );
}


