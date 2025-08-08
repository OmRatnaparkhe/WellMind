import { useEffect, useRef, useState } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
// Using a minimal any-typed ref to avoid depending on package-internal types
import "@excalidraw/excalidraw/index.css";
import { apiPost } from '@/lib/api';
import { PenTool, MessageCircle, AlertTriangle } from 'lucide-react';

export default function CanvasPage() {
  const excalidrawApiRef = useRef<any>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'draw' | 'thoughts' | 'issues'>('draw');
  const [textInput, setTextInput] = useState('');

  useEffect(() => {
    // Lazy-load styles for Excalidraw if needed by CDN; package includes its own CSS
  }, []);

  const onSubmit = async () => {
    setSaving(true);
    try {
      if (activeTab === 'draw') {
        if (!excalidrawApiRef.current) return;
        const api = excalidrawApiRef.current;
        const scene = api.getSceneElements();
        const appState = api.getAppState();
        const files = api.getFiles();
        const payload = { elements: scene, appState, files };
        const created = await apiPost<{ aiInsight?: string }>('/drawings', { 
          sceneJson: payload,
          inputType: 'draw'
        });
        setResult(created.aiInsight ?? 'Saved. No AI insight available.');
      } else {
        // For thoughts or issues, send the text input
        const created = await apiPost<{ aiInsight?: string }>('/drawings', { 
          sceneJson: {}, // Empty object as placeholder
          inputType: activeTab,
          textContent: textInput
        });
        setResult(created.aiInsight ?? 'Saved. No AI insight available.');
      }
    } catch (e: any) {
      setResult(e?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-brand-blue animate-gradient bg-300%">Express Yourself</h2>
        <button onClick={onSubmit} disabled={saving} className="rounded-md bg-primary text-white px-4 py-2 hover:bg-primary/90 transition-colors">
          {saving ? 'Submitting...' : 'Submit'}
        </button>
      </div>
      
      {/* Tab buttons */}
      <div className="flex gap-2 mb-2">
        <TabButton 
          active={activeTab === 'draw'} 
          onClick={() => setActiveTab('draw')}
          icon={<PenTool size={18} />}
          label="Draw"
        />
        <TabButton 
          active={activeTab === 'thoughts'} 
          onClick={() => setActiveTab('thoughts')}
          icon={<MessageCircle size={18} />}
          label="Thoughts"
        />
        <TabButton 
          active={activeTab === 'issues'} 
          onClick={() => setActiveTab('issues')}
          icon={<AlertTriangle size={18} />}
          label="What's not working?"
        />
      </div>
      
      {/* Content based on active tab */}
      <div className="flex-1 min-h-0 border rounded-lg overflow-hidden glass-effect shadow-card">
        {activeTab === 'draw' ? (
          <Excalidraw excalidrawAPI={(api) => (excalidrawApiRef.current = api)} theme="dark" />
        ) : (
          <div className="p-4 h-full flex flex-col">
            <label className="text-sm font-medium mb-2">
              {activeTab === 'thoughts' ? 'Share your thoughts...' : 'What\'s not working for you?'}
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={activeTab === 'thoughts' 
                ? 'Express your feelings, reflections, or ideas...'
                : 'Describe what challenges or issues you\'re facing...'
              }
              className="flex-1 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 p-3 bg-white/70 dark:bg-neutral-800/50 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all duration-300"
            />
          </div>
        )}
      </div>
      
      {result && (
        <div className="rounded-md glass-effect p-4 text-sm whitespace-pre-wrap shadow-card animate-fadeIn">
          <div className="font-semibold mb-2 text-primary">AI Insight</div>
          {result}
        </div>
      )}
    </div>
  );
}

function TabButton({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${active 
        ? 'bg-primary text-white shadow-glow-sm' 
        : 'bg-white/50 dark:bg-neutral-800/50 hover:bg-primary/10 dark:hover:bg-primary/20'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}


