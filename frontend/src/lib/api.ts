const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000/api';

async function authHeaders(): Promise<Record<string, string>> {
  const clerk = (window as any).Clerk;
  try {
    const token = await clerk?.session?.getToken();
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {}
  return {};
}

export async function apiGet<T>(path: string): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}${path}`, { credentials: 'include', headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const headers = { 'Content-Type': 'application/json', ...(await authHeaders()) } as Record<string, string>;
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Fetch raw text (for book content) with auth headers
export async function apiGetText(path: string): Promise<{ text: string; contentType: string | null }> {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}${path}`, { credentials: 'include', headers });
  if (!res.ok) throw new Error(await res.text());
  const contentType = res.headers.get('content-type');
  const text = await res.text();
  return { text, contentType };
}


