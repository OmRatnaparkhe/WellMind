import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';

type WeeklyQuiz = {
  id: string;
  title: string;
  description?: string;
  questions: { id: string; text: string; type: 'scale'; minValue: number; maxValue: number }[];
};

export default function Quizz() {
  const [quiz, setQuiz] = useState<WeeklyQuiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet<WeeklyQuiz>('/quiz/weekly/current')
      .then((q) => {
        setQuiz(q);
        const init: Record<string, number> = {};
        (q.questions || []).forEach((qq) => (init[qq.id] = Math.floor((qq.maxValue ?? 3) / 2)));
        setAnswers(init);
      })
      .catch(() => setError('Failed to load weekly quiz.'));
  }, []);

  const maxScore = useMemo(() => {
    if (!quiz) return 0;
    return (quiz.questions || []).reduce((acc, q) => acc + (q.maxValue ?? 3), 0);
  }, [quiz]);

  const sum = useMemo(() => {
    return Object.values(answers).reduce((a, b) => a + b, 0);
  }, [answers]);

  const submit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
      };
      const r = await apiPost<{ id: string; score: number }>('/quiz/weekly/respond', payload);
      setResult(r.score);
    } catch (e) {
      setError('Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  if (error) return <div className="text-red-500">{error}</div>;
  if (!quiz) return <div>Loading weekly quiz…</div>;

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-1">{quiz.title}</h2>
        {quiz.description && <p className="text-neutral-600 dark:text-neutral-400">{quiz.description}</p>}
      </div>

      {(quiz.questions || []).map((q) => (
        <div key={q.id} className="rounded-lg border p-4">
          <div className="font-medium mb-2">{q.text}</div>
          <div className="flex items-center gap-2">
            <span className="text-xs">{q.minValue ?? 0}</span>
            <input
              type="range"
              min={q.minValue ?? 0}
              max={q.maxValue ?? 3}
              step={1}
              value={answers[q.id] ?? 0}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: parseInt(e.target.value, 10) }))}
            />
            <span className="text-xs">{q.maxValue ?? 3}</span>
            <span className="ml-2 text-sm">{answers[q.id] ?? 0}</span>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <button className="rounded-md bg-primary text-white px-4 py-2" onClick={submit} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
        <div className="text-sm opacity-70">Current total: {sum}/{maxScore}</div>
        {result !== null && <div className="text-sm">Submitted score: {result}%</div>}
      </div>
      <div className="text-xs text-neutral-500">Weekly: one submission per week recommended. Impacts weekly wellness score.</div>
    </div>
  );
}


