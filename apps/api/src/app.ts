
import express from 'express';
import cors from 'cors';
import path from 'path';
import uploadRoutes from './routes/upload.routes';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Servir archivos estáticos si es necesario (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas API
// app.use('/api/config', configRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

export default app;
