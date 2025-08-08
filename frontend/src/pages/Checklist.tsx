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
    <div>
      <h2 className="text-2xl font-bold mb-4">Daily Checklist</h2>
      <div className="space-y-3">
        <TaskRow
          label="Describe your day"
          done={!!c?.describedDay}
          action={<Link to="/canvas" className="rounded-md border px-3 py-1">Go to Canvas</Link>}
          onComplete={() => complete('describedDay')}
        />
        <TaskRow
          label="Give video summary"
          done={!!c?.videoSummary}
          action={<Link to="/videos" className="rounded-md border px-3 py-1">Go to Videos</Link>}
          onComplete={() => complete('videoSummary')}
        />
        <TaskRow
          label="Read your book"
          done={!!c?.readBook}
          action={<Link to="/library" className="rounded-md border px-3 py-1">Go to Library</Link>}
          onComplete={() => complete('readBook')}
        />
      </div>
    </div>
  );
}

function TaskRow({ label, done, action, onComplete }: { label: string; done: boolean; action: React.ReactNode; onComplete: () => void }) {
  return (
    <div className="flex items-center gap-3 justify-between rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <input type="checkbox" checked={done} disabled className="h-5 w-5" readOnly />
        <span className="text-lg">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {action}
        {!done && (
          <button className="rounded-md bg-primary text-white px-3 py-1" onClick={onComplete}>
            Mark Complete
          </button>
        )}
      </div>
    </div>
  );
}


