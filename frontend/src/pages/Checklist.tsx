import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { Link } from 'react-router-dom';

type Checklist = {
  id: string;
  describedDay: boolean;
  videoSummary: boolean;
  readBook: boolean;
};

export default function Checklist() {
  const [c, setC] = useState<Checklist | null>(null);
  const refresh = () => apiGet<Checklist>('/checklist/today').then(setC).catch(() => {});
  useEffect(() => { refresh(); }, []);

  const complete = async (task: 'describedDay' | 'videoSummary' | 'readBook') => {
    await apiPost('/checklist/complete', { task });
    await refresh();
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
          action={<Link to="/canvas" className="btn-secondary rounded-xl px-4 py-2 flex items-center gap-2">Go to Canvas <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></Link>}
          onComplete={() => complete('describedDay')}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>}
        />
        <TaskRow
          label="Give video summary"
          description="Watch and reflect on motivational content"
          done={!!c?.videoSummary}
          action={<Link to="/videos" className="btn-secondary rounded-xl px-4 py-2 flex items-center gap-2">Go to Videos <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></Link>}
          onComplete={() => complete('videoSummary')}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>}
        />
        <TaskRow
          label="Read your book"
          description="Expand your mind with self-improvement literature"
          done={!!c?.readBook}
          action={<Link to="/library" className="btn-secondary rounded-xl px-4 py-2 flex items-center gap-2">Go to Library <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></Link>}
          onComplete={() => complete('readBook')}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>}
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
  icon 
}: { 
  label: string; 
  description?: string; 
  done: boolean; 
  action: React.ReactNode; 
  onComplete: () => void;
  icon?: React.ReactNode;
 }) {
  return (
    <div className="relative rounded-xl glass-effect p-5 shadow-card hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-brand-blue" />
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
    </div>
  );
}


