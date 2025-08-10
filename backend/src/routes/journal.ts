import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import { z } from 'zod';
import { startOfDay, endOfDay, subDays } from 'date-fns';
// Import the Google Generative AI for sentiment analysis
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Schema for journal entry
const JournalEntrySchema = z.object({
  content: z.string().min(1),
});

// Helper function to analyze sentiment using Google's Generative AI
async function analyzeSentiment(text: string) {
  try {
    // Skip analysis if API key is not set
    if (!process.env.GOOGLE_API_KEY) {
      console.warn('GOOGLE_API_KEY not set, skipping sentiment analysis');
      return { sentimentScore: null, keywords: [], riskFlags: [] };
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Analyze the following journal entry for sentiment, key themes, and potential risk flags.
      Return a JSON object with the following structure:
      {
        "sentimentScore": (a number between 0 and 10, where 0 is extremely negative and 10 is extremely positive),
        "keywords": [array of up to 5 key themes or topics],
        "riskFlags": [array of any concerning themes that might indicate mental health risks, or empty if none]
      }

      Journal entry: "${text}"
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const textResponse = response.text();

    // Extract JSON from the response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysisResult = JSON.parse(jsonMatch[0]);
      return {
        sentimentScore: analysisResult.sentimentScore,
        keywords: analysisResult.keywords || [],
        riskFlags: analysisResult.riskFlags || [],
      };
    }

    return { sentimentScore: null, keywords: [], riskFlags: [] };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return { sentimentScore: null, keywords: [], riskFlags: [] };
  }
}

// Create a new journal entry
router.post('/', async (req, res) => {
  const auth = (req as any).auth;
  if (!auth?.userId) return res.status(401).json({ error: 'Unauthorized' });
  const userId = auth.userId as string;

  try {
    const journalData = JournalEntrySchema.parse(req.body);

    // Analyze sentiment
    const { sentimentScore, keywords, riskFlags } = await analyzeSentiment(journalData.content);

    // Create journal entry
    const journalEntry = await prisma.journalEntry.create({
      data: {
        userId,
        content: journalData.content,
        sentimentScore,
        keywords,
        riskFlags,
      },
    });

    // Update daily checklist to mark creative task as completed
    const today = startOfDay(new Date());
    await prisma.dailyChecklist.upsert({
      where: { userId_date: { userId, date: today } },
      update: { creativeTask: true },
      create: { userId, date: today, creativeTask: true },
    });

    // Check for risk flags and create alerts if necessary
    if (riskFlags && riskFlags.length > 0) {
      // Create a risk alert in the database
      const severity = riskFlags.length > 2 ? 'high' : 'medium';
      await prisma.riskAlert.create({
        data: {
          userId,
          type: 'journal',
          source: 'journal_entry',
          message: `Potential concerns detected in journal: ${riskFlags.join(', ')}`,
          severity,
          acknowledged: false,
        },
      });
      console.log(`ALERT: Risk flags detected for user ${userId}:`, riskFlags);
    }

    res.json({
      id: journalEntry.id,
      content: journalEntry.content,
      sentimentScore: journalEntry.sentimentScore,
      keywords: journalEntry.keywords,
      createdAt: journalEntry.createdAt,
      // Don't return risk flags to the user
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid journal data', details: error.format() });
    }
    console.error('Error creating journal entry:', error);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

// Get journal entries for a specific date range
router.get('/history', async (req, res) => {
  const auth = (req as any).auth;
  if (!auth?.userId) return res.status(401).json({ error: 'Unauthorized' });
  const userId = auth.userId as string;

  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const endDate = endOfDay(new Date());
    const startDate = startOfDay(subDays(endDate, days - 1));

    const journalEntries = await prisma.journalEntry.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        content: true,
        sentimentScore: true,
        keywords: true,
        createdAt: true,
        // Don't return risk flags
      },
    });

    res.json(journalEntries);
  } catch (error) {
    console.error('Error getting journal history:', error);
    res.status(500).json({ error: 'Failed to get journal history' });
  }
});

// Get a specific journal entry
router.get('/:id', async (req, res) => {
  const auth = (req as any).auth;
  if (!auth?.userId) return res.status(401).json({ error: 'Unauthorized' });
  const userId = auth.userId as string;
  const { id } = req.params;

  try {
    const journalEntry = await prisma.journalEntry.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
        content: true,
        sentimentScore: true,
        keywords: true,
        createdAt: true,
        // Don't return risk flags
      },
    });

    if (!journalEntry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    res.json(journalEntry);
  } catch (error) {
    console.error('Error getting journal entry:', error);
    res.status(500).json({ error: 'Failed to get journal entry' });
  }
});

// Get sentiment trends (average by day for the past month)
router.get('/sentiment/trends', async (req, res) => {
  const auth = (req as any).auth;
  if (!auth?.userId) return res.status(401).json({ error: 'Unauthorized' });
  const userId = auth.userId as string;

  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const endDate = endOfDay(new Date());
    const startDate = startOfDay(subDays(endDate, days - 1));

    const journalEntries = await prisma.journalEntry.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        sentimentScore: {
          not: null,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        sentimentScore: true,
        createdAt: true,
      },
    });

    // Group by day and calculate average
    const sentimentByDay = journalEntries.reduce(
      (
        acc: Record<string, { sum: number; count: number }>,
        entry: { sentimentScore: number | null; createdAt: Date }
      ) => {
        const day = startOfDay(entry.createdAt).toISOString();
        if (!acc[day]) {
          acc[day] = { sum: 0, count: 0 };
        }
        // The 'not: null' in your prisma query ensures sentimentScore is a number here,
        // but checking is still good practice.
        if (typeof entry.sentimentScore === 'number') {
          acc[day].sum += entry.sentimentScore;
          acc[day].count += 1;
        }
        return acc;
      },
      {} // The "as" cast is no longer needed here because the types are on the function itself
    );

    // Calculate averages and format response
    const trends = Object.entries(sentimentByDay).map(([day, { sum, count }]) => ({
      date: day,
      averageSentiment: count > 0 ? sum / count : null,
    }));

    res.json(trends);
  } catch (error) {
    console.error('Error getting sentiment trends:', error);
    res.status(500).json({ error: 'Failed to get sentiment trends' });
  }
});

export default router;