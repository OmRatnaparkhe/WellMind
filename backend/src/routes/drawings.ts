import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

function startOfDayUTC(date = new Date()): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  return d;
}

router.post('/', async (req, res) => {
  try {
    const auth = (req as any).auth;
    if (!auth?.userId) return res.status(401).json({ error: 'Unauthorized' });

    const { sceneJson } = req.body as { sceneJson: unknown };
    if (!sceneJson) return res.status(400).json({ error: 'sceneJson required' });

    // Ensure user profile exists (id = Clerk userId)
    const userId = auth.userId as string;
    await prisma.userProfile.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: `${userId}@clerk.local` },
    });

    const drawing = await prisma.drawing.create({
      data: { userId, sceneJson },
    });

    // Extract text elements from Excalidraw scene
    let concatenatedText = '';
    try {
      const elements = (sceneJson as any)?.elements ?? [];
      const texts = elements
        .filter((e: any) => e.type === 'text' && e.text)
        .map((e: any) => e.text);
      concatenatedText = texts.join('\n');
    } catch {}

    let aiInsight: string | undefined;
    if (process.env.GEMINI_API_KEY && concatenatedText.trim().length > 0) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are a compassionate therapist. Analyze the following short text for sentiment (positive/neutral/negative), key emotions, and give 2-3 gentle, actionable suggestions. Keep it under 120 words.\n\nText:\n${concatenatedText}`;
        const result = await model.generateContent(prompt);
        aiInsight = result.response.text();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Gemini error', err);
      }
    }

    if (aiInsight) {
      await prisma.drawing.update({ where: { id: drawing.id }, data: { aiInsight } });
    }

    // Mark checklist task as completed for today
    const today = startOfDayUTC();
    await prisma.dailyChecklist.upsert({
      where: { userId_date: { userId, date: today } },
      update: { describedDay: true },
      create: { userId, date: today, describedDay: true },
    });

    res.json({ ...drawing, aiInsight });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const auth = (req as any).auth;
    if (!auth?.userId) return res.status(401).json({ error: 'Unauthorized' });
    const drawings = await prisma.drawing.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(drawings);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;


