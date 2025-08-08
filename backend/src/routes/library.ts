import { Router } from 'express';
import { prisma } from '../utils/prisma.js';

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
    const videos = await prisma.video.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;


