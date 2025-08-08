import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import drawingsRouter from './routes/drawings.js';
import checklistRouter from './routes/checklist.js';
import libraryRouter from './routes/library.js';
import musicRouter from './routes/music.js';

const app = express();

app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN?.split(',') ?? '*',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Attach Clerk auth to all requests
app.use(ClerkExpressWithAuth());

// Guard: require authenticated user for all /api routes
app.use('/api', (req, res, next) => {
  const auth = (req as any).auth;
  if (!auth?.userId) return res.status(401).json({ error: 'Unauthorized' });
  next();
});
app.use('/api/drawings', drawingsRouter);
app.use('/api/checklist', checklistRouter);
app.use('/api/library', libraryRouter);
app.use('/api/music', musicRouter);

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`MindWell backend listening on http://localhost:${port}`);
});


