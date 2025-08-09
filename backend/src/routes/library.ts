import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import { z } from 'zod';
import { startOfDay } from 'date-fns';

const router = Router();

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


