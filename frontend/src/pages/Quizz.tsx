import { useMemo, useState } from 'react';

type Question = {
  q: string;
  options: { label: string; value: number }[]; // value contributes to a wellness score
};

const QUESTIONS: Question[] = [
  {
    q: 'How are you feeling today?',
    options: [
      { label: 'Great', value: 3 },
      { label: 'Okay', value: 2 },
      { label: 'Not good', value: 1 },
    ],
  },
  {
    q: 'How was your sleep?',
    options: [
      { label: 'Restful', value: 3 },
      { label: 'Average', value: 2 },
      { label: 'Poor', value: 1 },
    ],
  },
  {
    q: 'Did you move your body today?',
    options: [
      { label: 'Yes', value: 3 },
      { label: 'A little', value: 2 },
      { label: 'Not yet', value: 1 },
    ],
  },
];

export default function Quizz() {
  const [answers, setAnswers] = useState<number[]>(Array(QUESTIONS.length).fill(0));
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => answers.reduce((a, b) => a + b, 0), [answers]);
  const maxScore = QUESTIONS.length * 3;

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">Quick Wellness Quizz</h2>
      <div className="space-y-4">
        {QUESTIONS.map((q, idx) => (
          <div key={idx} className="rounded-lg border p-4">
            <div className="font-medium">{q.q}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const next = [...answers];
                    next[idx] = opt.value;
                    setAnswers(next);
                  }}
                  className={`px-3 py-1 rounded-md border ${
                    answers[idx] === opt.value ? 'bg-primary text-white' : ''
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button className="rounded-md bg-primary text-white px-4 py-2" onClick={() => setSubmitted(true)}>
          Submit
        </button>
        {submitted && (
          <div className="text-sm">
            Score: {score}/{maxScore} — {score >= maxScore - 1 ? 'Great job! Keep it up.' : 'You’re doing fine. Be kind to yourself.'}
          </div>
        )}
      </div>
    </div>
  );
}


