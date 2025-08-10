import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
const router = Router();
function startOfDayUTC(date = new Date()) {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    return d;
}
router.post('/', async (req, res) => {
    try {
        const auth = req.auth;
        if (!auth?.userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { sceneJson, inputType, textContent } = req.body;
        if (!sceneJson && !textContent) {
            return res.status(400).json({ error: 'Either sceneJson or textContent required' });
        }
        // Ensure user profile exists (id = Clerk userId)
        const userId = auth.userId;
        await prisma.userProfile.upsert({
            where: { id: userId },
            update: {},
            create: { id: userId, email: `${userId}@clerk.local` },
        });
        const drawing = await prisma.drawing.create({
            data: {
                userId,
                sceneJson: sceneJson,
                ...(inputType ? { inputType } : { inputType: 'draw' }),
                ...(textContent ? { textContent } : {})
            },
        });
        // Extract text content based on input type
        let contentToAnalyze = '';
        if (inputType === 'draw' || !inputType) {
            // Extract text elements from Excalidraw scene
            try {
                const elements = sceneJson?.elements ?? [];
                const texts = elements
                    .filter((e) => e.type === 'text' && e.text)
                    .map((e) => e.text);
                contentToAnalyze = texts.join('\n');
            }
            catch { }
        }
        else if (inputType === 'thoughts' || inputType === 'issues') {
            // Use the direct text content
            contentToAnalyze = textContent || '';
        }
        let aiInsight;
        if (process.env.GEMINI_API_KEY && contentToAnalyze.trim().length > 0) {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                let prompt = '';
                if (inputType === 'thoughts') {
                    prompt = `You are a compassionate therapist. Analyze the following thought journal entry for sentiment (positive/neutral/negative), key emotions, and give 2-3 gentle, actionable suggestions for emotional well-being. Keep it under 120 words.\n\nThought:\n${contentToAnalyze}`;
                }
                else if (inputType === 'issues') {
                    prompt = `You are a supportive mental health coach. The user has shared something that's not working well for them. Analyze this issue, identify potential root causes, and provide 2-3 practical, compassionate suggestions to address the problem. Keep it under 120 words.\n\nIssue:\n${contentToAnalyze}`;
                }
                else {
                    prompt = `You are a compassionate therapist. Analyze the following drawing and text for sentiment (positive/neutral/negative), key emotions, and give 2-3 gentle, actionable suggestions. Keep it under 120 words.\n\nText:\n${contentToAnalyze}`;
                }
                const result = await model.generateContent(prompt);
                aiInsight = result.response.text();
            }
            catch (err) {
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
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/', async (req, res) => {
    try {
        const auth = req.auth;
        if (!auth?.userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const drawings = await prisma.drawing.findMany({
            where: { userId: auth.userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(drawings);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
export default router;
