import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import { z } from 'zod';
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek } from 'date-fns';

const router = Router();

// Schema for quiz response
const QuizResponseSchema = z.object({
  quizId: z.string(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
    })
  ),
});

// Schema for creating a new quiz
const CreateQuizSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'once']),
  questions: z.array(
    z.object({
      text: z.string(),
      type: z.enum(['text', 'multipleChoice', 'scale', 'checkbox']),
      options: z.array(z.string()).optional(),
      minValue: z.number().optional(),
      maxValue: z.number().optional(),
      required: z.boolean().default(true),
    })
  ),
});

// Helper function to calculate quiz scores for standardized assessments
function calculateQuizScore(quizId: string, answers: any[]) {
  // This is a simplified implementation
  // In a real application, you would have different scoring algorithms for different quizzes
  
  // Example: PHQ-9 depression screening
  if (quizId.includes('phq9')) {
    // PHQ-9 scoring: Sum of all answers (assuming 0-3 scale for each question)
    return answers.reduce((sum, answer) => {
      const value = typeof answer.answer === 'number' ? answer.answer : 0;
      return sum + value;
    }, 0);
  }
  
  // Example: GAD-7 anxiety screening
  if (quizId.includes('gad7')) {
    // GAD-7 scoring: Sum of all answers (assuming 0-3 scale for each question)
    return answers.reduce((sum, answer) => {
      const value = typeof answer.answer === 'number' ? answer.answer : 0;
      return sum + value;
    }, 0);
  }
  
  // Default scoring: Just return 0 for non-standardized quizzes
  return 0;
}

// Create a new quiz (admin only)
router.post('/create', async (req, res) => {
  const auth = (req as any).auth;
  if (!auth?.userId) return res.status(401).json({ error: 'Unauthorized' });
  const userId = auth.userId as string;
  
  // Check if user is admin (in a real app, you would have proper admin checks)
  const userProfile = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { isAdmin : true },
  });
  
  if (!userProfile || !('isAdmin' in userProfile)) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  try {
    const quizData = CreateQuizSchema.parse(req.body);

    // Create quiz
    const quiz = await prisma.quiz.create({
      data: {
        title: quizData.title,
        description: quizData.description,
        type: quizData.category, // Using 'type' instead of 'category' to match Prisma schema
        frequency: quizData.frequency,
        questions: quizData.questions,
        createdBy: userId,
      },
    });

    res.json(quiz);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid quiz data', details: error.format() });
    }
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// Get available quizzes for the user
router.get('/available', async (req, res) => {
  const auth = (req as any).auth;
  if (!auth?.userId) return res.status(401).json({ error: 'Unauthorized' });
  const userId = auth.userId as string;

  try {
    // Get all quizzes
    const allQuizzes = await prisma.quiz.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        frequency: true,
        createdAt: true,
      },
    });

    // Get quizzes the user has already completed today
    const today = startOfDay(new Date());
    const completedToday = await prisma.quizResponse.findMany({
      where: {
        userId,
        createdAt: {
          gte: today,
        },
      },
      select: {
        quizId: true,
      },
    });

    // Get quizzes the user has already completed this week
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const completedThisWeek = await prisma.quizResponse.findMany({
      where: {
        userId,
        createdAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      select: {
        quizId: true,
      },
    });

    const completedTodayIds = new Set(completedToday.map(response => response.quizId));
    const completedThisWeekIds = new Set(completedThisWeek.map(response => response.quizId));

    // Filter quizzes based on frequency and completion status
    const availableQuizzes = allQuizzes.filter(quiz => {
      if (quiz.type === 'daily' && completedTodayIds.has(quiz.id)) {
        return false; // Already completed today
      }
      if (quiz.type === 'weekly' && completedThisWeekIds.has(quiz.id)) {
        return false; // Already completed this week
      }
      return true;
    });

    res.json(availableQuizzes);
  } catch (error) {
    console.error('Error getting available quizzes:', error);
    res.status(500).json({ error: 'Failed to get available quizzes' });
  }
});

// Get a specific quiz
router.get('/:id', async (req, res) => {
  const auth = (req as any).auth;
  if (!auth?.userId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    console.error('Error getting quiz:', error);
    res.status(500).json({ error: 'Failed to get quiz' });
  }
});

// Submit a quiz response
router.post('/respond', async (req, res) => {
  const auth = (req as any).auth;
  if (!auth?.userId) return res.status(401).json({ error: 'Unauthorized' });
  const userId = auth.userId as string;

  try {
    const responseData = QuizResponseSchema.parse(req.body);

    // Get the quiz to check its type
    const quiz = await prisma.quiz.findUnique({
      where: { id: responseData.quizId },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Calculate score for standardized assessments
    const score = calculateQuizScore(quiz.id, responseData.answers);

    // Create quiz response
    const quizResponse = await prisma.quizResponse.create({
      data: {
        userId,
        quizId: responseData.quizId,
        answers: responseData.answers,
        score,
      },
    });

    // Update daily checklist to mark quiz as completed
    if (quiz.type === 'daily_assessment') {
      const today = startOfDay(new Date());
      await prisma.dailyChecklist.upsert({
        where: { userId_date: { userId, date: today } },
        update: { quizCompleted: true },
        create: { userId, date: today, quizCompleted: true },
      });
    }

    res.json({
      id: quizResponse.id,
      quizId: quizResponse.quizId,
      score: quizResponse.score,
      createdAt: quizResponse.createdAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid quiz response data', details: error.format() });
    }
    console.error('Error submitting quiz response:', error);
    res.status(500).json({ error: 'Failed to submit quiz response' });
  }
});

// Get quiz response history for a user
router.get('/history/:quizId', async (req, res) => {
  const auth = (req as any).auth;
  if (!auth?.userId) return res.status(401).json({ error: 'Unauthorized' });
  const userId = auth.userId as string;
  const { quizId } = req.params;

  try {
    const responses = await prisma.quizResponse.findMany({
      where: {
        userId,
        quizId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        score: true,
        createdAt: true,
      },
    });

    res.json(responses);
  } catch (error) {
    console.error('Error getting quiz response history:', error);
    res.status(500).json({ error: 'Failed to get quiz response history' });
  }
});

// Get quiz score trends
router.get('/trends/:quizId', async (req, res) => {
  const auth = (req as any).auth;
  if (!auth?.userId) return res.status(401).json({ error: 'Unauthorized' });
  const userId = auth.userId as string;
  const { quizId } = req.params;

  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 90;
    const endDate = endOfDay(new Date());
    const startDate = startOfDay(subDays(endDate, days - 1));

    const responses = await prisma.quizResponse.findMany({
      where: {
        userId,
        quizId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        score: true,
        createdAt: true,
      },
    });

    // Format the trend data
    const trends = responses.map(response => ({
      date: response.createdAt.toISOString(),
      score: response.score,
    }));

    res.json(trends);
  } catch (error) {
    console.error('Error getting quiz trends:', error);
    res.status(500).json({ error: 'Failed to get quiz trends' });
  }
});

export default router;