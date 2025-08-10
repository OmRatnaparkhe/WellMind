import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import { z } from 'zod';
import { startOfDay } from 'date-fns';

const router = Router();

// Simple in-memory cache with TTL for public books and content
type CacheEntry<T> = { expiresAt: number; value: T };
const searchCache = new Map<string, CacheEntry<any>>();
const contentCache = new Map<string, CacheEntry<{ body: string; contentType: string }>>();
const FIVE_MIN_MS = 5 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// === Public books from Project Gutenberg (Gutendex) ===
// GET /api/library/public?q=search&page=1
router.get('/public', async (req, res) => {
  try {
    const q = ((req.query.q as string) || 'self help').trim();
    const page = parseInt((req.query.page as string) || '1', 10) || 1;
    const cacheKey = `${q}|${page}`;
    const now = Date.now();

    const cached = searchCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      res.setHeader('Cache-Control', 'public, max-age=300');
      return res.json(cached.value);
    }

    const params = new URLSearchParams({ search: q, page: String(page) });
    const r = await fetch(`https://gutendex.com/books?${params.toString()}`);
    if (!r.ok) throw new Error(`Gutendex error: ${await r.text()}`);
    const json = (await r.json()) as any;

    const items = (json.results ?? []).map((b: any) => {
      const author = (b.authors?.[0]?.name as string) || 'Unknown';
      const coverUrl = b.formats?.['image/jpeg'] as string | undefined;
      const textUrl =
        (b.formats?.['text/plain; charset=utf-8'] as string | undefined) ||
        (b.formats?.['text/plain'] as string | undefined) ||
        undefined;
      const htmlUrl = (b.formats?.['text/html'] as string | undefined) || undefined;
      return {
        id: String(b.id),
        title: b.title as string,
        author,
        coverUrl,
        description: Array.isArray(b.subjects) ? (b.subjects as string[]).slice(0, 5).join(', ') : undefined,
        linkUrl: b.url as string | undefined,
        textUrl,
        htmlUrl,
      };
    });

    // Parse next page from Gutendex's next URL if present
    let nextPage: number | undefined = undefined;
    if (json.next) {
      try {
        const u = new URL(json.next as string);
        const p = u.searchParams.get('page');
        if (p) nextPage = parseInt(p, 10);
      } catch {}
    }

    const payload = { items, nextPage };
    searchCache.set(cacheKey, { value: payload, expiresAt: now + FIVE_MIN_MS });
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json(payload);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch public books' });
  }
});

// GET /api/library/public/:id/content
router.get('/public/:id/content', async (req, res) => {
  try {
    const id = req.params.id;
    const now = Date.now();
    const cached = contentCache.get(id);
    if (cached && cached.expiresAt > now) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Content-Type', cached.value.contentType);
      return res.send(cached.value.body);
    }

    const r = await fetch(`https://gutendex.com/books/${encodeURIComponent(id)}`);
    if (!r.ok) throw new Error(`Gutendex error: ${await r.text()}`);
    const b = (await r.json()) as any;
    const textUrl =
      (b.formats?.['text/plain; charset=utf-8'] as string | undefined) ||
      (b.formats?.['text/plain'] as string | undefined) ||
      null;
    const htmlUrl = (b.formats?.['text/html'] as string | undefined) || null;

    if (!textUrl && !htmlUrl) return res.status(404).json({ error: 'No readable content available' });

    const contentUrl = textUrl ?? htmlUrl!;
    const contentRes = await fetch(contentUrl);
    if (!contentRes.ok) throw new Error(`Content fetch error: ${await contentRes.text()}`);
    const contentType = contentRes.headers.get('content-type') || 'text/plain; charset=utf-8';

    // Stream as text/plain or text/html based on source
    if (contentType.includes('text/html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    } else {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    }

    const bodyText = await contentRes.text();
    contentCache.set(id, { value: { body: bodyText, contentType }, expiresAt: now + ONE_DAY_MS });
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(bodyText);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch book content' });
  }
});

// GET /api/library/public/:id/meta
router.get('/public/:id/meta', async (req, res) => {
  try {
    const id = req.params.id;
    const r = await fetch(`https://gutendex.com/books/${encodeURIComponent(id)}`);
    if (!r.ok) throw new Error(`Gutendex error: ${await r.text()}`);
    const b = (await r.json()) as any;
    const author = (b.authors?.[0]?.name as string) || 'Unknown';
    const coverUrl = b.formats?.['image/jpeg'] as string | undefined;
    const linkUrl = b.url as string | undefined;
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.json({ id: String(b.id), title: b.title as string, author, coverUrl, linkUrl });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch book metadata' });
  }
});

// Utility: strip HTML to plain text (basic)
function stripHtmlToText(html: string): string {
  try {
    // Remove scripts/styles
    let s = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                .replace(/<style[\s\S]*?<\/style>/gi, '');
    // Replace breaks/paragraphs with newlines
    s = s.replace(/<(br|p|div|li|h\d)\b[^>]*>/gi, '\n');
    // Remove all tags
    s = s.replace(/<[^>]+>/g, '');
    // Decode basic entities
    s = s.replace(/&nbsp;/g, ' ')
         .replace(/&amp;/g, '&')
         .replace(/&lt;/g, '<')
         .replace(/&gt;/g, '>')
         .replace(/&quot;/g, '"')
         .replace(/&#39;/g, "'");
    // Normalize whitespace
    s = s.replace(/\r/g, '').replace(/\t/g, ' ');
    s = s.split('\n').map((line) => line.trim()).join('\n');
    s = s.replace(/\n{3,}/g, '\n\n');
    return s.trim();
  } catch {
    return html;
  }
}

// GET /api/library/public/:id/content-paged?page=1&pageSize=4000
router.get('/public/:id/content-paged', async (req, res) => {
  try {
    const id = req.params.id;
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const pageSize = Math.max(1000, Math.min(10000, parseInt((req.query.pageSize as string) || '4000', 10)));

    const now = Date.now();
    let cached = contentCache.get(id);
    if (!cached || cached.expiresAt <= now) {
      const r = await fetch(`https://gutendex.com/books/${encodeURIComponent(id)}`);
      if (!r.ok) throw new Error(`Gutendex error: ${await r.text()}`);
      const b = (await r.json()) as any;
      const textUrl =
        (b.formats?.['text/plain; charset=utf-8'] as string | undefined) ||
        (b.formats?.['text/plain'] as string | undefined) ||
        null;
      const htmlUrl = (b.formats?.['text/html'] as string | undefined) || null;
      if (!textUrl && !htmlUrl) return res.status(404).json({ error: 'No readable content available' });
      const contentUrl = textUrl ?? htmlUrl!;
      const contentRes = await fetch(contentUrl);
      if (!contentRes.ok) throw new Error(`Content fetch error: ${await contentRes.text()}`);
      const contentType = contentRes.headers.get('content-type') || 'text/plain; charset=utf-8';
      const bodyText = await contentRes.text();
      cached = { value: { body: bodyText, contentType }, expiresAt: now + ONE_DAY_MS };
      contentCache.set(id, cached);
    }

    // Convert to plain text for pagination safety
    const fullText = cached.value.contentType.includes('text/html')
      ? stripHtmlToText(cached.value.body)
      : cached.value.body;

    const totalPages = Math.max(1, Math.ceil(fullText.length / pageSize));
    const clampedPage = Math.min(page, totalPages);
    const start = (clampedPage - 1) * pageSize;
    const end = Math.min(fullText.length, start + pageSize);
    const slice = fullText.slice(start, end);

    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.json({ page: clampedPage, totalPages, pageSize, content: slice });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch paged content' });
  }
});

router.get('/books', async (_req, res) => {
  try {
    const books = await prisma.book.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/videos', async (_req, res) => {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;

    // Daily-rotating queries: motivational, thought-provoking, nature/animals
    const queries = [
      'motivational speech short',
      'inspirational video',
      'mindfulness meditation guidance',
      'nature relaxation 4k',
      'wildlife documentary short',
      'stoic philosophy motivation',
      'self help perspective',
      'kindness compassion stories',
      'forest sounds nature video',
      'ocean waves relaxation video'
    ];

    const daySeed = Math.floor((Date.now()) / (24 * 60 * 60 * 1000)); // days since epoch
    const q = queries[daySeed % queries.length];

    // If API key present, fetch from YouTube Data API v3
    if (apiKey) {
      const params = new URLSearchParams({
        part: 'snippet',
        type: 'video',
        maxResults: '8',
        q,
        safeSearch: 'moderate',
        key: apiKey,
      });
      const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
      if (!ytRes.ok) throw new Error(`YouTube API error: ${await ytRes.text()}`);
      const json = await ytRes.json() as any;

      const items = (json.items ?? []).map((it: any) => ({
        id: `yt-${it.id?.videoId ?? it.id}`,
        title: it.snippet?.title ?? 'Untitled',
        youtubeId: it.id?.videoId ?? it.id,
        thumbnailUrl: it.snippet?.thumbnails?.medium?.url ?? it.snippet?.thumbnails?.default?.url ?? undefined,
        description: it.snippet?.description ?? '',
      }));

      // Ensure at least 5
      if (items.length >= 5) return res.json(items.slice(0, 8));
    }

    // Fallback: rotate a small static set deterministically per day
    const fallback: Array<{ id: string; title: string; youtubeId: string; thumbnailUrl?: string; description?: string }> = [
      { id: 'yt-dQw4w9WgXcQ', title: 'Stay Motivated', youtubeId: 'dQw4w9WgXcQ' },
      { id: 'yt-z6X5oEIg6Ak', title: 'Nature Relaxation', youtubeId: 'z6X5oEIg6Ak' },
      { id: 'yt-fLexgOxsZu0', title: 'Mindfulness and Breath', youtubeId: 'fLexgOxsZu0' },
      { id: 'yt-a3Z7zEc7AXQ', title: 'Perspective Shift', youtubeId: 'a3Z7zEc7AXQ' },
      { id: 'yt-ktlTxC4QG8g', title: 'Gratitude and Joy', youtubeId: 'ktlTxC4QG8g' },
      { id: 'yt-mWRsgZuvMWA', title: 'Wilderness Calm', youtubeId: 'mWRsgZuvMWA' },
      { id: 'yt-kXYiU_JCYtU', title: 'Focus and Flow', youtubeId: 'kXYiU_JCYtU' },
    ];
    const start = daySeed % Math.max(1, fallback.length - 5);
    const rotated = [...fallback.slice(start), ...fallback.slice(0, start)];
    return res.json(rotated.slice(0, 5));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Accept a user-submitted summary for a video and mark checklist
router.post('/video-summary', async (req, res) => {
  try {
    const auth = (req as any).auth;
    if (!auth?.userId) return res.status(401).json({ error: 'Unauthorized' });
    const userId = auth.userId as string;

    const BodySchema = z.object({
      videoId: z.string().min(1),
      summary: z.string().min(10),
    });
    const body = BodySchema.parse(req.body);

    // store as a cognitive entry tied to the video
    const entry = await prisma.cognitiveEntry.create({
      data: {
        userId,
        videoId: body.videoId,
        summary: body.summary,
        comprehensionScore: 7, // neutral default; clients may later provide a score
        exerciseType: 'processing',
        score: 70,
      },
    });

    // mark checklist for today
    const today = startOfDay(new Date());
    await prisma.dailyChecklist.upsert({
      where: { userId_date: { userId, date: today } },
      update: { videoSummary: true },
      create: { userId, date: today, videoSummary: true },
    });

    res.json({ ok: true, id: entry.id });
  } catch (err: any) {
    if (err?.name === 'ZodError') return res.status(400).json({ error: 'Invalid body' });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;


