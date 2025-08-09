import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import { startOfWeek, endOfWeek } from 'date-fns';

const router = Router();

// Helper function to get the start of the week
function getWeekStart(date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // Week starts on Monday
}

// Helper function to get the end of the week
function getWeekEnd(date = new Date()): Date {
  return endOfWeek(date, { weekStartsOn: 1 }); // Week ends on Sunday
}

// Calculate and store wellness score
async function calculateWellnessScore(userId: string, weekOf: Date) {
  // Get the start and end of the week
  const weekStart = getWeekStart(weekOf);
  const weekEnd = getWeekEnd(weekOf);

  // Get mood entries for the week
  const moodEntries = await prisma.moodEntry.findMany({
    where: {
      userId,
      createdAt: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
  });

  // Get survey responses for the week
  const phq9Response = await prisma.surveyResponse.findFirst({
    where: {
      userId,
      surveyType: 'PHQ9',
      createdAt: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const gad7Response = await prisma.surveyResponse.findFirst({
    where: {
      userId,
      surveyType: 'GAD7',
      createdAt: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const sleepResponse = await prisma.surveyResponse.findFirst({
    where: {
      userId,
      surveyType: 'sleep',
      createdAt: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const socialResponse = await prisma.surveyResponse.findFirst({
    where: {
      userId,
      surveyType: 'social',
      createdAt: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Get cognitive entries for the week
  const cognitiveEntries = await prisma.cognitiveEntry.findMany({
    where: {
      userId,
      createdAt: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
  });

  // Calculate mood score (0-10 scale)
  const moodScore = moodEntries.length > 0
    ? moodEntries.reduce((sum, entry) => sum + entry.score, 0) / moodEntries.length
    : 5; // Default to neutral if no entries

  // Calculate stress score (0-10 scale, inverted from GAD-7 which is 0-21)
  // Lower GAD-7 is better, so we invert: 10 - (gad7Score / 21 * 10)
  const stressScore = gad7Response?.score !== null && gad7Response?.score !== undefined
    ? 10 - (gad7Response.score / 21 * 10)
    : 5; // Default to neutral if no response

  // Calculate cognitive score (0-10 scale)
  const cognitiveScore = cognitiveEntries.length > 0
    ? cognitiveEntries.reduce((sum, entry) => sum + (entry.comprehensionScore || 0), 0) / cognitiveEntries.length
    : 5; // Default to neutral if no entries

  // Sleep score (already on 0-10 scale)
  const sleepScore = sleepResponse?.score !== null && sleepResponse?.score !== undefined
    ? sleepResponse.score
    : 5; // Default to neutral if no response

  // Social score (already on 0-10 scale)
  const socialScore = socialResponse?.score !== null && socialResponse?.score !== undefined
    ? socialResponse.score
    : 5; // Default to neutral if no response

  // Calculate overall wellness score with weighted components
  // Mood & Emotion (35%), Stress & Anxiety (25%), Cognitive Function (15%), Sleep & Energy (15%), Social Connectedness (10%)
  const overallScore = (
    moodScore * 0.35 +
    stressScore * 0.25 +
    cognitiveScore * 0.15 +
    sleepScore * 0.15 +
    socialScore * 0.10
  );

  // Generate recommendations based on scores
  const recommendations: string[] = [];

  if (moodScore < 4) {
    recommendations.push('Consider journaling daily to track your emotions and identify patterns.');
    recommendations.push('Try incorporating a brief mindfulness practice into your morning routine.');
  }

  if (stressScore < 4) {
    recommendations.push('Practice deep breathing exercises when feeling overwhelmed.');
    recommendations.push('Consider limiting news and social media consumption if it increases anxiety.');
  }

  if (cognitiveScore < 4) {
    recommendations.push('Try brain-training exercises to improve focus and cognitive function.');
    recommendations.push('Ensure you\'re taking short breaks during focused work periods.');
  }

  if (sleepScore < 4) {
    recommendations.push('Establish a consistent sleep schedule, even on weekends.');
    recommendations.push('Create a relaxing bedtime routine to signal to your body it\'s time to sleep.');
  }

  if (socialScore < 4) {
    recommendations.push('Schedule a brief call with a friend or family member this week.');
    recommendations.push('Consider joining a community group aligned with your interests.');
  }

  // Create or update wellness score
  const wellnessScore = await prisma.wellnessScore.upsert({
    where: {
      userId_weekOf: {
        userId,
        weekOf: weekStart,
      },
    },
    update: {
      overallScore,
      moodScore,
      stressScore,
      cognitiveScore,
      sleepScore,
      socialScore,
      recommendations,
    },
    create: {
      userId,
      weekOf: weekStart,
      overallScore,
      moodScore,
      stressScore,
      cognitiveScore,
      sleepScore,
      socialScore,
      recommendations,
    },
  });

  return wellnessScore;
}

// Get current week's wellness score
router.get('/current', async (req, res) => {
  const auth = (req as any).auth;
  if (!auth?.userId) return res.status(401).json({ error: 'Unauthorized' });
  const userId = auth.userId as string;

  try {
    const weekStart = getWeekStart();

    // Check if wellness score exists for current week
    let wellnessScore = await prisma.wellnessScore.findUnique({
      where: {
        userId_weekOf: {
          userId,
          weekOf: weekStart,
        },
      },
    });

    // If no wellness score exists, calculate it
    if (!wellnessScore) {
      wellnessScore = await calculateWellnessScore(userId, new Date());
    }

    res.json(wellnessScore);
  } catch (error) {
    console.error('Error getting wellness score:', error);
    res.status(500).json({ error: 'Failed to get wellness score' });
  }
});

// Get wellness score history
router.get('/history', async (req, res) => {
  const auth = (req as any).auth;
  if (!auth?.userId) return res.status(401).json({ error: 'Unauthorized' });
  const userId = auth.userId as string;

  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const wellnessScores = await prisma.wellnessScore.findMany({
      where: { userId },
      orderBy: { weekOf: 'desc' },
      take: limit,
    });

    res.json(wellnessScores);
  } catch (error) {
    console.error('Error getting wellness score history:', error);
    res.status(500).json({ error: 'Failed to get wellness score history' });
  }
});

// Manually trigger wellness score calculation
router.post('/calculate', async (req, res) => {
  const auth = (req as any).auth;
  if (!auth?.userId) return res.status(401).json({ error: 'Unauthorized' });
  const userId = auth.userId as string;

  try {
    const date = req.body.date ? new Date(req.body.date) : new Date();
    const wellnessScore = await calculateWellnessScore(userId, date);
    res.json(wellnessScore);
  } catch (error) {
    console.error('Error calculating wellness score:', error);
    res.status(500).json({ error: 'Failed to calculate wellness score' });
  }
});

export default router;