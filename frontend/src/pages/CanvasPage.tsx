import { useEffect, useRef, useState } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
// Using a minimal any-typed ref to avoid depending on package-internal types
import "@excalidraw/excalidraw/index.css";
import { apiPost } from '@/lib/api';

export default function CanvasPage() {
  const excalidrawApiRef = useRef<any>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    // Lazy-load styles for Excalidraw if needed by CDN; package includes its own CSS
  }, []);

  const onSubmit = async () => {
    if (!excalidrawApiRef.current) return;
    setSaving(true);
    try {
      const api = excalidrawApiRef.current;
      const scene = api.getSceneElements();
      const appState = api.getAppState();
      const files = api.getFiles();
      const payload = { elements: scene, appState, files };
      const created = await apiPost<{ aiInsight?: string }>('/drawings', { sceneJson: payload });
      setResult(created.aiInsight ?? 'Saved. No AI insight available.');
    } catch (e: any) {
      setResult(e?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Canvas</h2>
        <button onClick={onSubmit} disabled={saving} className="rounded-md bg-primary text-white px-4 py-2">
          {saving ? 'Submitting...' : 'Submit Drawing'}
        </button>
      </div>
      <div className="flex-1 min-h-0 border rounded-lg overflow-hidden">
        <Excalidraw excalidrawAPI={(api) => (excalidrawApiRef.current = api)} theme="dark" />
      </div>
      {result && (
        <div className="rounded-md border p-3 text-sm whitespace-pre-wrap">
          <div className="font-semibold mb-1">AI Insight</div>
          {result}
        </div>
      )}
    </div>
  );
}


