import { useState } from 'react';

type Question = {
  id: number;
  text: string;
  options: string[];
};

type QuizState = {
  currentQuestion: number;
  answers: Record<number, number>;
  completed: boolean;
};

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'How would you rate your mood today?',
    options: ['Very low', 'Low', 'Neutral', 'Good', 'Excellent'],
  },
  {
    id: 2,
    text: 'How well did you sleep last night?',
    options: ['Very poorly', 'Poorly', 'Average', 'Well', 'Very well'],
  },
  {
    id: 3,
    text: 'How would you rate your stress level today?',
    options: ['Very high', 'High', 'Moderate', 'Low', 'Very low'],
  },
  {
    id: 4,
    text: 'How connected do you feel to others today?',
    options: ['Not at all', 'Slightly', 'Moderately', 'Very', 'Extremely'],
  },
  {
    id: 5,
    text: 'How satisfied are you with your productivity today?',
    options: ['Not at all', 'Slightly', 'Moderately', 'Very', 'Extremely'],
  },
];

export default function Quiz() {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    answers: {},
    completed: false,
  });
  
  // Animation state for question transitions
  const [animation, setAnimation] = useState({
    question: 'animate-fadeInUp',
    options: 'animate-fadeInUp',
  });

  const currentQuestion = QUESTIONS[quizState.currentQuestion];

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = { ...quizState.answers, [currentQuestion.id]: optionIndex };
    
    if (quizState.currentQuestion < QUESTIONS.length - 1) {
      // Trigger animation for next question
      setAnimation({
        question: '',
        options: '',
      });

      setTimeout(() => {
        setAnimation({
          question: 'animate-fadeInUp',
          options: 'animate-fadeInUp',
        });
        setQuizState({
          ...quizState,
          currentQuestion: quizState.currentQuestion + 1,
          answers: newAnswers,
        });
      }, 300);
    } else {
      setQuizState({
        ...quizState,
        answers: newAnswers,
        completed: true,
      });
    }
  };

  const resetQuiz = () => {
    setQuizState({
      currentQuestion: 0,
      answers: {},
      completed: false,
    });
    setAnimation({
      question: 'animate-fadeInUp',
      options: 'animate-fadeInUp',
    });
  };

  const calculateScore = () => {
    const total = Object.values(quizState.answers).reduce((sum, value) => sum + value, 0);
    return Math.round((total / (QUESTIONS.length * 4)) * 100);
  };
  
  // Calculate progress percentage
  const progress = ((quizState.currentQuestion) / QUESTIONS.length) * 100;

  return (
    <div className="animate-fadeInUp">
      <div className="relative mb-8 rounded-2xl p-6 glass-effect shadow-card overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-tr from-brand-blue/30 to-brand-purple/30 rounded-full blur-2xl opacity-70 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-brand-blue/20 rounded-full blur-xl opacity-60 animate-pulse-slow" />
        <h2 className="text-2xl font-bold relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-primary animate-gradient bg-300%">Daily Wellness Quiz</h2>
        <p className="text-neutral-600 dark:text-neutral-300 relative z-10 mt-2">Track your mental wellbeing with this quick assessment.</p>
      </div>
      
      {!quizState.completed ? (
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5 overflow-hidden">
            <div 
              className="h-2.5 bg-gradient-to-r from-brand-blue to-primary rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="glass-effect rounded-2xl p-8 shadow-card transform transition-all duration-500 hover:shadow-glow">
            <div className={`mb-6 ${animation.question}`}>
              <h3 className="text-xl font-semibold mb-2">{currentQuestion.text}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Question {quizState.currentQuestion + 1} of {QUESTIONS.length}
              </p>
            </div>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${animation.options} 
                    ${quizState.answers[currentQuestion.id] === index 
                      ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-glow-sm' 
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-primary/50 hover:bg-white/80 dark:hover:bg-neutral-800/80'}`}
                  style={{ animationDelay: `${index * 50}ms`, transform: `perspective(1000px) rotateX(0deg)` }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget;
                    target.style.transform = `perspective(1000px) rotateX(2deg)`;
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget;
                    target.style.transform = `perspective(1000px) rotateX(0deg)`;
                  }}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center transition-all duration-300 ${quizState.answers[currentQuestion.id] === index ? 'border-primary' : 'border-neutral-400'}`}>
                      {quizState.answers[currentQuestion.id] === index && (
                        <div className="w-3 h-3 rounded-full bg-primary animate-scaleIn" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto glass-effect rounded-2xl p-8 shadow-card animate-fadeInUp">
          <div className="text-center mb-8">
            <div className="relative mx-auto w-48 h-48 mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/30 to-brand-blue/30 blur-xl animate-pulse" />
              <div className="absolute inset-4 rounded-full bg-gradient-to-bl from-brand-purple/20 to-brand-blue/20 blur-lg animate-pulse-slow" />
              <div className="relative w-48 h-48 rounded-full grid place-items-center border-8 border-primary/50 text-4xl font-extrabold backdrop-blur bg-white/30 dark:bg-neutral-900/30 shadow-inner-glow animate-float transform transition-all duration-500 hover:scale-105 hover:shadow-glow">
                <div className="flex items-center justify-center">
                  <span className="text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-brand-blue animate-gradient bg-300%">{calculateScore()}</span>
                  <span className="text-xl ml-1 text-primary">%</span>
                </div>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-primary animate-gradient bg-300%">Quiz Completed!</h3>
            <p className="text-neutral-600 dark:text-neutral-300 mb-6 max-w-md mx-auto">
              {calculateScore() >= 80 
                ? 'Excellent! Your wellness score indicates you\'re doing very well today.'
                : calculateScore() >= 60
                ? 'Good job! Your wellness is on a positive track.'
                : calculateScore() >= 40
                ? 'You\'re doing okay. There\'s room for improvement in some areas.'
                : 'It looks like you\'re having a challenging day. Consider some self-care activities.'}
            </p>
          </div>
          
          <div className="flex justify-center mb-8">
            <button 
              onClick={resetQuiz}
              className="btn-primary rounded-xl px-8 py-3 flex items-center gap-2 transform transition-transform hover:scale-105 shadow-glow-sm hover:shadow-glow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
              Take Quiz Again
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {QUESTIONS.map((question, index) => {
              const answer = quizState.answers[question.id];
              return (
                <div 
                  key={question.id} 
                  className="rounded-xl p-4 glass-effect shadow-card hover:shadow-glow-sm transition-all duration-300 transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Question {index + 1}</div>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{answer + 1}</div>
                  </div>
                  <div className="text-sm mb-1 line-clamp-2">{question.text}</div>
                  <div className="text-sm font-medium text-primary">{question.options[answer]}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="mt-8 p-6 rounded-xl bg-neutral-100 dark:bg-neutral-800/50 max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold mb-3">Why Take This Quiz?</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-blue">
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
                <path d="M8.5 8.5v.01"></path>
                <path d="M16 15.5v.01"></path>
                <path d="M12 12v.01"></path>
              </svg>
            </div>
            <div>
              <h4 className="font-medium">Track Your Progress</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Monitor your mental wellbeing over time to identify patterns and improvements.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M2 12h20"></path>
                <path d="M12 2v20"></path>
              </svg>
            </div>
            <div>
              <h4 className="font-medium">Personalized Insights</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Get tailored recommendations based on your responses to improve your daily wellbeing.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}