import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../lib/api';
import { toast } from 'sonner';

type CognitiveEntry = {
  id: string;
  exerciseType: 'memory' | 'attention' | 'problemSolving' | 'processing';
  score: number;
  duration: number;
  metadata: Record<string, any>;
  createdAt: string;
};

type ExerciseRecommendation = {
  focusArea: {
    exerciseType: string;
    reason: string;
  };
  strengths: {
    exerciseType: string;
    reason: string;
  };
  allScores: Array<{
    type: string;
    averageScore: number;
    count: number;
  }>;
};

type Exercise = {
  id: string;
  type: 'memory' | 'attention' | 'problemSolving' | 'processing';
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in seconds
  component: React.FC<{ onComplete: (score: number, duration: number, metadata: any) => void }>;
};

// Memory Exercise Component
const MemoryExercise: React.FC<{ onComplete: (score: number, duration: number, metadata: any) => void }> = ({ onComplete }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [showingSequence, setShowingSequence] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Generate a random sequence
  const generateSequence = () => {
    const newSequence = [...sequence];
    newSequence.push(Math.floor(Math.random() * 4) + 1);
    setSequence(newSequence);
    return newSequence;
  };

  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
    const newSequence = generateSequence();
    showSequence(newSequence);
  };

  // Show the sequence to the user
  const showSequence = (seq: number[]) => {
    setShowingSequence(true);
    setUserSequence([]);
    
    let i = 0;
    const interval = setInterval(() => {
      if (i >= seq.length) {
        clearInterval(interval);
        setShowingSequence(false);
        return;
      }
      // Highlight the button
      const button = document.getElementById(`memory-button-${seq[i]}`);
      if (button) {
        button.classList.add('bg-primary');
        setTimeout(() => {
          button.classList.remove('bg-primary');
        }, 300);
      }
      i++;
    }, 600);
  };

  // Handle user button click
  const handleButtonClick = (num: number) => {
    if (showingSequence || gameOver) return;
    
    const newUserSequence = [...userSequence, num];
    setUserSequence(newUserSequence);
    
    // Check if the user's sequence matches the game sequence so far
    const isCorrect = newUserSequence.every((val, idx) => val === sequence[idx]);
    
    if (!isCorrect) {
      // Game over
      setGameOver(true);
      const duration = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
      const score = Math.max(0, Math.min(100, (sequence.length - 1) * 10));
      onComplete(score, duration, { sequenceLength: sequence.length - 1 });
      return;
    }
    
    // If the user has completed the current sequence
    if (newUserSequence.length === sequence.length) {
      // Generate a new sequence and show it
      setTimeout(() => {
        const newSequence = generateSequence();
        showSequence(newSequence);
      }, 1000);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-md">
      <h3 className="text-xl font-bold mb-4">Memory Sequence</h3>
      <p className="mb-4">Remember and repeat the sequence of highlighted buttons.</p>
      
      {!gameStarted ? (
        <button
          onClick={startGame}
          className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Start Exercise
        </button>
      ) : (
        <div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                id={`memory-button-${num}`}
                onClick={() => handleButtonClick(num)}
                disabled={showingSequence || gameOver}
                className={`h-24 rounded-lg transition-colors ${showingSequence || gameOver
                  ? 'bg-neutral-200 dark:bg-neutral-700 cursor-not-allowed'
                  : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                }`}
              ></button>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {showingSequence 
                ? 'Watch the sequence...' 
                : gameOver 
                  ? 'Game Over!' 
                  : `Repeat the sequence (${userSequence.length}/${sequence.length})`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Attention Exercise Component
const AttentionExercise: React.FC<{ onComplete: (score: number, duration: number, metadata: any) => void }> = ({ onComplete }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [targetLetter, setTargetLetter] = useState('');
  const [letters, setLetters] = useState<string[]>([]);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds game

  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
    generateNewRound();
  };

  // Generate a new round of letters
  const generateNewRound = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const target = alphabet[Math.floor(Math.random() * alphabet.length)];
    setTargetLetter(target);
    
    // Generate 20 random letters with the target appearing 3-5 times
    const targetCount = Math.floor(Math.random() * 3) + 3; // 3-5 targets
    const newLetters = [];
    
    // Add target letters
    for (let i = 0; i < targetCount; i++) {
      newLetters.push(target);
    }
    
    // Fill the rest with random letters
    while (newLetters.length < 20) {
      const letter = alphabet[Math.floor(Math.random() * alphabet.length)];
      if (letter !== target) {
        newLetters.push(letter);
      }
    }
    
    // Shuffle the array
    for (let i = newLetters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newLetters[i], newLetters[j]] = [newLetters[j], newLetters[i]];
    }
    
    setLetters(newLetters);
  };

  // Handle letter click
  const handleLetterClick = (letter: string) => {
    if (letter === targetLetter) {
      setHits(hits + 1);
    } else {
      setMisses(misses + 1);
    }
    generateNewRound();
  };

  // Timer effect
  useEffect(() => {
    if (!gameStarted) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          const duration = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
          const totalAttempts = hits + misses;
          const accuracy = totalAttempts > 0 ? (hits / totalAttempts) * 100 : 0;
          const score = Math.round(accuracy);
          onComplete(score, duration, { hits, misses, accuracy });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameStarted, hits, misses, startTime, onComplete]);

  return (
    <div className="p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-md">
      <h3 className="text-xl font-bold mb-4">Attention Test</h3>
      
      {!gameStarted ? (
        <div>
          <p className="mb-4">Click on the target letter whenever it appears. Ignore all other letters.</p>
          <button
            onClick={startGame}
            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Start Exercise
          </button>
        </div>
      ) : timeLeft > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm font-medium">Target Letter:</p>
              <p className="text-3xl font-bold text-primary">{targetLetter}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Time Left:</p>
              <p className="text-xl font-semibold">{timeLeft}s</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-3 mb-4">
            {letters.map((letter, index) => (
              <button
                key={index}
                onClick={() => handleLetterClick(letter)}
                className="h-12 flex items-center justify-center text-lg font-medium bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
              >
                {letter}
              </button>
            ))}
          </div>
          
          <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400">
            <p>Hits: {hits}</p>
            <p>Misses: {misses}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-xl font-bold mb-2">Exercise Complete!</p>
          <p className="mb-4">Your score is being calculated...</p>
        </div>
      )}
    </div>
  );
};

// Define available exercises
const availableExercises: Exercise[] = [
  {
    id: 'memory-sequence',
    type: 'memory',
    title: 'Memory Sequence',
    description: 'Remember and repeat the sequence of highlighted buttons.',
    difficulty: 'medium',
    duration: 120,
    component: MemoryExercise,
  },
  {
    id: 'attention-test',
    type: 'attention',
    title: 'Attention Test',
    description: 'Click on the target letter whenever it appears. Ignore all other letters.',
    difficulty: 'easy',
    duration: 60,
    component: AttentionExercise,
  },
  // More exercises would be added here
];

export default function CognitiveExercises() {
  const [recentEntries, setRecentEntries] = useState<CognitiveEntry[]>([]);
  const [recommendations, setRecommendations] = useState<ExerciseRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  const [exerciseResult, setExerciseResult] = useState<{ score: number; duration: number } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [entries, recs] = await Promise.all([
        apiGet<CognitiveEntry[]>('/cognitive/history?days=30'),
        apiGet<ExerciseRecommendation>('/cognitive/recommendations'),
      ]);
      setRecentEntries(entries);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error fetching cognitive data:', error);
      toast.error('Failed to load cognitive exercise data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setExerciseCompleted(false);
    setExerciseResult(null);
  };

  const handleExerciseComplete = async (score: number, duration: number, metadata: any) => {
    if (!selectedExercise) return;
    
    setExerciseResult({ score, duration });
    setExerciseCompleted(true);
    
    try {
      await apiPost('/cognitive', {
        exerciseType: selectedExercise.type,
        score,
        duration,
        metadata,
      });
      
      toast.success('Exercise completed and saved!');
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error saving exercise result:', error);
      toast.error('Failed to save exercise result');
    }
  };

  const getExerciseTypeLabel = (type: string) => {
    switch (type) {
      case 'memory': return 'Memory';
      case 'attention': return 'Attention';
      case 'problemSolving': return 'Problem Solving';
      case 'processing': return 'Processing Speed';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Cognitive Exercises</h1>
      
      {selectedExercise ? (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{selectedExercise.title}</h2>
            <button
              onClick={() => setSelectedExercise(null)}
              className="text-sm text-neutral-500 hover:text-primary transition-colors"
            >
              Back to exercises
            </button>
          </div>
          
          {exerciseCompleted && exerciseResult ? (
            <div className="text-center py-8">
              <div className="text-5xl font-bold mb-2">{exerciseResult.score}</div>
              <p className="text-neutral-500 dark:text-neutral-400 mb-6">Your score</p>
              
              <div className="flex justify-center gap-8 mb-8">
                <div className="text-center">
                  <p className="text-2xl font-semibold">{exerciseResult.duration}s</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Duration</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold">{selectedExercise.type}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Exercise Type</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setExerciseCompleted(false);
                  setExerciseResult(null);
                }}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <selectedExercise.component onComplete={handleExerciseComplete} />
          )}
        </div>
      ) : (
        <>
          {recommendations && (
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg mb-8">
              <h2 className="text-xl font-bold mb-4">Your Recommendations</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <h3 className="font-medium mb-2">Focus Area</h3>
                  <p className="text-lg font-bold mb-1">{getExerciseTypeLabel(recommendations.focusArea.exerciseType)}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{recommendations.focusArea.reason}</p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <h3 className="font-medium mb-2">Your Strength</h3>
                  <p className="text-lg font-bold mb-1">{getExerciseTypeLabel(recommendations.strengths.exerciseType)}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{recommendations.strengths.reason}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Available Exercises</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableExercises.map((exercise) => (
                <div 
                  key={exercise.id}
                  onClick={() => handleExerciseSelect(exercise)}
                  className={`p-4 rounded-xl cursor-pointer transition-all hover:shadow-md
                    ${recommendations?.focusArea.exerciseType === exercise.type
                      ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50'
                      : recommendations?.strengths.exerciseType === exercise.type
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50'
                        : 'bg-neutral-50 dark:bg-neutral-700'
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{exercise.title}</h3>
                    <span className="px-2 py-1 text-xs rounded-full bg-white dark:bg-neutral-800">
                      {exercise.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">{exercise.description}</p>
                  <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                    <span>{getExerciseTypeLabel(exercise.type)}</span>
                    <span>~{Math.round(exercise.duration / 60)} min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {recentEntries.length > 0 && (
            <div className="mt-8 bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              
              <div className="space-y-4">
                {recentEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{getExerciseTypeLabel(entry.exerciseType)}</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{entry.score}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{entry.duration}s</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}