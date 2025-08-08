import { useEffect, useMemo, useState } from 'react';
import { apiGet } from '@/lib/api';
import { Link } from 'react-router-dom';

type Checklist = {
  id: string;
  describedDay: boolean;
  videoSummary: boolean;
  readBook: boolean;
};

const QUOTES = [
  'Every day is a new beginning.',
  'You are stronger than you think.',
  'Small steps lead to big changes.',
  'Breathe. You got this.',
  'Progress, not perfection.'
];

export default function Dashboard() {
  const [checklist, setChecklist] = useState<Checklist | null>(null);

  useEffect(() => {
    apiGet<Checklist>('/checklist/today').then(setChecklist).catch(() => {});
  }, []);

  const score = useMemo(() => {
    if (!checklist) return 0;
    const done = [checklist.describedDay, checklist.videoSummary, checklist.readBook].filter(Boolean).length;
    return Math.round((done / 3) * 100);
  }, [checklist]);

  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Welcome back</h2>
      <div className="grid md:grid-cols-4 gap-4">
        <div className="col-span-1 bg-gradient-to-br from-brand.blue/30 to-brand.purple/30 rounded-xl p-6 text-center">
          <div className="w-28 h-28 mx-auto rounded-full grid place-items-center border-8 border-primary/60 text-2xl font-bold">
            {score}
          </div>
          <p className="mt-2 text-sm">Daily Score</p>
        </div>
        <div className="col-span-1 md:col-span-2 rounded-xl border p-6">
          <p className="text-sm text-neutral-500">Daily Nice Quote</p>
          <p className="mt-2 text-lg">“{quote}”</p>
        </div>
        <div className="col-span-1 rounded-xl border p-6 space-y-2">
          <p className="font-semibold">Summary</p>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-md border p-2">
              <div className="text-xl font-bold">5</div>
              <div>Books Read</div>
            </div>
            <div className="rounded-md border p-2">
              <div className="text-xl font-bold">8</div>
              <div>Video Summaries</div>
            </div>
            <div className="rounded-md border p-2">
              <div className="text-xl font-bold">3</div>
              <div>Drawings</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <QuickCard title="Wanna Draw?" to="/canvas" />
        <QuickCard title="Ear's Magic?" to="/music" />
        <QuickCard title="Read Lives?" to="/library" />
        <QuickCard title="Quizz Time" to="/quizz" />
      </div>
    </div>
  );
}

function QuickCard({ title, to }: { title: string; to: string }) {
  return (
    <Link to={to} className="rounded-xl border p-6 hover:shadow-lg transition bg-white/50 dark:bg-neutral-900/50">
      <div className="text-xl font-semibold">{title}</div>
      <div className="text-sm text-neutral-500 mt-2">Tap to explore</div>
    </Link>
  );
}


