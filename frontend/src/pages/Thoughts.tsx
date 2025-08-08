import { useState } from 'react';

type Thought = {
  id: string;
  content: string;
  mood: 'positive' | 'neutral' | 'negative';
  date: string;
};

const SAMPLE_THOUGHTS: Thought[] = [
  {
    id: '1',
    content: 'I felt really proud of myself for completing my daily meditation practice for a full week now.',
    mood: 'positive',
    date: '2023-06-15',
  },
  {
    id: '2',
    content: 'Today was challenging. I struggled with focus and felt overwhelmed by my workload.',
    mood: 'negative',
    date: '2023-06-14',
  },
  {
    id: '3',
    content: 'I had a good conversation with my friend today. It was nice to connect.',
    mood: 'positive',
    date: '2023-06-13',
  },
  {
    id: '4',
    content: 'Just an ordinary day. Nothing special happened, but that\'s okay too.',
    mood: 'neutral',
    date: '2023-06-12',
  },
];

export default function Thoughts() {
  const [thoughts, setThoughts] = useState<Thought[]>(SAMPLE_THOUGHTS);
  const [newThought, setNewThought] = useState('');
  const [selectedMood, setSelectedMood] = useState<'positive' | 'neutral' | 'negative'>('neutral');

  const handleAddThought = () => {
    if (newThought.trim() === '') return;
    
    const thought: Thought = {
      id: Date.now().toString(),
      content: newThought,
      mood: selectedMood,
      date: new Date().toISOString().split('T')[0],
    };
    
    setThoughts([thought, ...thoughts]);
    setNewThought('');
    setSelectedMood('neutral');
  };

  const handleDeleteThought = (id: string) => {
    setThoughts(thoughts.filter(thought => thought.id !== id));
  };

  return (
    <div className="animate-fadeInUp">
      <div className="relative mb-8 rounded-2xl p-6 glass-effect shadow-card overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-tr from-brand-blue/30 to-brand-purple/30 rounded-full blur-2xl opacity-70 animate-pulse" />
        <h2 className="text-2xl font-bold relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-primary animate-gradient bg-300%">Thought Journal</h2>
        <p className="text-neutral-600 dark:text-neutral-300 relative z-10 mt-2">Record your thoughts and track your emotional patterns over time.</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {thoughts.map((thought) => (
            <ThoughtCard 
              key={thought.id} 
              thought={thought} 
              onDelete={() => handleDeleteThought(thought.id)} 
            />
          ))}
        </div>
        
        <div className="rounded-xl glass-effect p-6 shadow-card h-fit sticky top-6">
          <h3 className="text-lg font-semibold mb-4">Add New Thought</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">How are you feeling?</label>
              <div className="flex gap-3">
                <MoodButton 
                  mood="positive" 
                  selected={selectedMood === 'positive'} 
                  onClick={() => setSelectedMood('positive')} 
                />
                <MoodButton 
                  mood="neutral" 
                  selected={selectedMood === 'neutral'} 
                  onClick={() => setSelectedMood('neutral')} 
                />
                <MoodButton 
                  mood="negative" 
                  selected={selectedMood === 'negative'} 
                  onClick={() => setSelectedMood('negative')} 
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="thought" className="block text-sm font-medium mb-1">Your thought</label>
              <textarea
                id="thought"
                value={newThought}
                onChange={(e) => setNewThought(e.target.value)}
                placeholder="What's on your mind today?"
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 p-3 bg-white/70 dark:bg-neutral-800/50 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all duration-300"
                rows={4}
              />
            </div>
            
            <button
              onClick={handleAddThought}
              disabled={newThought.trim() === ''}
              className="w-full btn-primary rounded-xl py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Thought
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              <p className="mb-2">Tracking your thoughts helps you:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Identify emotional patterns</li>
                <li>Practice mindfulness</li>
                <li>Develop self-awareness</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThoughtCard({ thought, onDelete }: { thought: Thought; onDelete: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const moodColors = {
    positive: 'from-green-500/20 to-green-400/10',
    neutral: 'from-blue-500/20 to-blue-400/10',
    negative: 'from-red-500/20 to-red-400/10',
  };
  
  const moodIcons = {
    positive: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
        <line x1="9" y1="9" x2="9.01" y2="9"></line>
        <line x1="15" y1="9" x2="15.01" y2="9"></line>
      </svg>
    ),
    neutral: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="8" y1="15" x2="16" y2="15"></line>
        <line x1="9" y1="9" x2="9.01" y2="9"></line>
        <line x1="15" y1="9" x2="15.01" y2="9"></line>
      </svg>
    ),
    negative: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="8" y1="15" x2="16" y2="15"></line>
        <line x1="9" y1="9" x2="9.01" y2="9"></line>
        <line x1="15" y1="9" x2="15.01" y2="9"></line>
      </svg>
    ),
  };
  
  return (
    <div className={`rounded-xl glass-effect p-6 shadow-card hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${moodColors[thought.mood]} opacity-50 -z-10`} />
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {moodIcons[thought.mood]}
          <span className="text-sm font-medium">{new Date(thought.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <button 
          onClick={onDelete}
          className="p-1.5 rounded-full hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 text-neutral-500 hover:text-red-500 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </button>
      </div>
      
      <p className={`text-neutral-700 dark:text-neutral-300 ${!isExpanded && thought.content.length > 150 ? 'line-clamp-3' : ''}`}>
        {thought.content}
      </p>
      
      {thought.content.length > 150 && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-sm text-primary font-medium hover:underline"
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

function MoodButton({ 
  mood, 
  selected, 
  onClick 
}: { 
  mood: 'positive' | 'neutral' | 'negative'; 
  selected: boolean; 
  onClick: () => void;
}) {
  const moodConfig = {
    positive: {
      label: 'Good',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
      ),
      color: 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400',
      selectedColor: 'bg-green-500 border-green-600 text-white',
    },
    neutral: {
      label: 'Neutral',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="15" x2="16" y2="15"></line>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
      ),
      color: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400',
      selectedColor: 'bg-blue-500 border-blue-600 text-white',
    },
    negative: {
      label: 'Bad',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="15" x2="16" y2="15"></line>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
      ),
      color: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
      selectedColor: 'bg-red-500 border-red-600 text-white',
    },
  };
  
  const config = moodConfig[mood];
  
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 px-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all duration-300 transform hover:scale-105 ${selected ? config.selectedColor : config.color}`}
    >
      {config.icon}
      <span className="text-sm font-medium">{config.label}</span>
    </button>
  );
}