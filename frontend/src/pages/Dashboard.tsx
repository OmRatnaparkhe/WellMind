import { useEffect, useMemo, useState } from 'react';
import { apiGet } from '@/lib/api';
import { Link } from 'react-router-dom';
import { Sparkles, Smile, BookType, Brain } from 'lucide-react';
import WellnessScore from '../components/WellnessScore';
import RiskAlert from '../components/RiskAlert';

type Checklist = {
  id: string;
  describedDay: boolean;
  videoSummary: boolean;
  readBook: boolean;
  creativeTask?: boolean;
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
  const [weeklyQuizTaken, setWeeklyQuizTaken] = useState<boolean | null>(null);

  useEffect(() => {
    apiGet<Checklist>('/checklist/today').then(setChecklist).catch(error => {
      console.error('Failed to fetch checklist:', error);
    });
  }, []);

  useEffect(() => {
    // Check if weekly quiz has been taken
    (async () => {
      try {
        const quiz: any = await apiGet('/quiz/weekly/current');
        if (!quiz?.id) {
          setWeeklyQuizTaken(false);
          return;
        }
        const history: Array<{ id: string; score: number; createdAt: string }> = await apiGet(`/quiz/history/${quiz.id}`);
        setWeeklyQuizTaken((history || []).length > 0);
      } catch (e) {
        setWeeklyQuizTaken(false);
      }
    })();
  }, []);

  const score = useMemo(() => {
    if (!checklist) return 0;
    const tasks = [
      checklist.describedDay,
      checklist.videoSummary,
      checklist.readBook,
      checklist.creativeTask ?? false,
    ];
    const done = tasks.filter(Boolean).length;
    return Math.round((done / tasks.length) * 100);
  }, [checklist]);

  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  return (
    <div className="space-y-6 animate-fadeInUp">
      <HeroHeader />
      
      <RiskAlert />

      {weeklyQuizTaken === false && (
        <div className="rounded-2xl p-4 border bg-gradient-to-br from-brand-blue/10 to-brand-purple/10 dark:from-brand.blue/10 dark:to-brand.purple/10 backdrop-blur shadow-card animate-fadeInUp">
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div>
              <div className="text-lg font-semibold">Weekly Quiz Reminder</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Take this week’s quick check-in to refine your wellness insights.</div>
            </div>
            <Link to="/quizz" className="btn-primary rounded-xl px-5 py-2 text-sm">Take Weekly Quiz</Link>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-4">
        <div className="col-span-1 rounded-2xl p-6 text-center glass-effect shadow-glow transform transition-all duration-500 hover:scale-105">
          <div className="relative mx-auto w-36 h-36">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/30 to-brand-blue/30 blur-xl animate-pulse" />
            <div className="relative w-36 h-36 rounded-full grid place-items-center border-8 border-primary/50 text-4xl font-extrabold backdrop-blur bg-white/30 dark:bg-neutral-900/30 shadow-inner-glow">
              <div className="flex items-center justify-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-brand-blue animate-gradient bg-300%">{score}</span>
                <span className="text-lg ml-1">%</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <p className="text-lg font-medium">Daily Score</p>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 rounded-2xl p-6 glass-effect shadow-card hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1">
          <p className="text-sm text-neutral-500">Daily Nice Quote</p>
          <p className="mt-3 text-xl leading-relaxed">“{quote}”</p>
        </div>

        {/* Removed hardcoded Summary block (dead UI) */}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <WellnessScore />
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Daily Mental Wellness</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <Link to="/mood-check" className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
              <Smile size={32} className="text-blue-500 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mood Check</span>
            </Link>
            
            <Link to="/journal" className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
              <BookType size={32} className="text-purple-500 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Journal</span>
            </Link>
            
            <Link to="/cognitive" className="flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
              <Brain size={32} className="text-green-500 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cognitive</span>
            </Link>
          </div>
          
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Tip:</strong> Regular check-ins with your mood and thoughts can help you understand patterns in your mental health and identify triggers.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <QuickCard title="Wanna Draw?" to="/canvas" gradient="from-brand.purple/60 to-brand.blue/60" />
        <QuickCard title="Ear's Magic?" to="/music" gradient="from-brand.blue/60 to-brand.purple/60" />
        <QuickCard title="Read Lives?" to="/library" gradient="from-brand.purple/60 to-brand.blue/60" />
        <QuickCard title="Quizz Time" to="/quizz" gradient="from-brand.blue/60 to-brand.purple/60" />
      </div>
    </div>
  );
}

// SummaryPill removed with the Summary block

function QuickCard({ title, to, gradient }: { title: string; to: string; gradient: string }) {
  return (
    <Link
      to={to}
      className={`group relative overflow-hidden rounded-2xl border p-6 bg-white/60 dark:bg-neutral-900/50 backdrop-blur transition transform hover:-translate-y-0.5 hover:shadow-glow`}
    >
      <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${gradient} opacity-30 group-hover:opacity-50 transition-opacity`} />
      <div className="text-xl font-semibold tracking-tight">{title}</div>
      <div className="text-sm text-neutral-500 mt-2">Tap to explore</div>
      <div className="mt-6 h-1 w-24 bg-gradient-to-r from-brand.blue to-brand.purple rounded-full animate-shimmer bg-[linear-gradient(90deg,rgba(0,0,0,0)_0%,rgba(255,255,255,.6)_50%,rgba(0,0,0,0)_100%)] bg-[length:200%_100%]" />
    </Link>
  );
}

function HeroHeader() {
  return (
    <div className="relative rounded-3xl border p-8 overflow-hidden bg-gradient-to-br from-brand.blue/25 to-brand.purple/25">
      <div className="absolute -top-10 -right-10 w-52 h-52 bg-gradient-to-tr from-brand.purple/40 to-brand.blue/40 rounded-full blur-3xl opacity-70" />
      <div className="absolute -bottom-10 -left-10 w-52 h-52 bg-gradient-to-tr from-brand.blue/40 to-brand.purple/40 rounded-full blur-3xl opacity-70" />
      <h2 className="relative text-3xl font-extrabold tracking-tight">Welcome back</h2>
      <p className="relative mt-2 text-neutral-600 dark:text-neutral-300">
        Here’s a gentle nudge to keep going. You’re doing great.
      </p>
    </div>
  );
}


