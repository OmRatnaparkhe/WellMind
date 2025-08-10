// history.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { format, startOfDay } from 'date-fns';
const prisma = new PrismaClient();
const router = Router();
// Shape items into a unified feed per day, including drawings, journals, videos, and reading
router.get('/', async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        // Fetch sources in parallel
        const [drawings, journals, cognitiveEntries, checklists] = await Promise.all([
            prisma.drawing.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
            prisma.journalEntry.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
            prisma.cognitiveEntry.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
            prisma.dailyChecklist.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
        ]);
        const items = [];
        // Drawings and text captures
        for (const d of drawings) {
            const inferredKind = d.inputType === 'thoughts' ? 'thoughts' : d.inputType === 'issues' ? 'issues' : 'draw';
            items.push({
                id: d.id,
                kind: inferredKind,
                createdAt: d.createdAt,
                textContent: d.textContent ?? undefined,
                aiInsight: d.aiInsight ?? undefined,
            });
        }
        // Journals
        for (const j of journals) {
            items.push({
                id: j.id,
                kind: 'journal',
                createdAt: j.createdAt,
                content: j.content,
                sentimentScore: j.sentimentScore ?? null,
            });
        }
        // Video summaries (cognitive entries with a videoId or processing type)
        for (const c of cognitiveEntries) {
            const hasVideo = !!c.videoId;
            if (hasVideo || c.exerciseType === 'processing') {
                items.push({
                    id: c.id,
                    kind: 'video',
                    createdAt: c.createdAt,
                    videoId: c.videoId,
                    videoSummary: c.summary,
                });
            }
        }
        // Reading sessions derived from checklist (no dedicated model yet)
        for (const cl of checklists) {
            if (cl.readBook) {
                items.push({
                    id: `read-${cl.id}`,
                    kind: 'read',
                    createdAt: startOfDay(cl.date),
                });
            }
        }
        // Group by yyyy-MM-dd
        const byDay = items.reduce((acc, item) => {
            const day = format(item.createdAt, 'yyyy-MM-dd');
            acc[day] = acc[day] || [];
            acc[day].push(item);
            return acc;
        }, {});
        const result = Object.entries(byDay)
            .sort((a, b) => (a[0] < b[0] ? 1 : -1))
            .map(([date, list]) => ({ date, items: list.sort((a, b) => +b.createdAt - +a.createdAt) }));
        res.json(result);
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
export default router;
