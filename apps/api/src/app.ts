
import express from 'express';
import cors from 'cors';
import path from 'path';
import propertyRoutes from './routes/property.routes';
import historyRoutes from './routes/history.routes';
import reportRoutes from './routes/report.routes';
import uploadRoutes from './routes/upload.routes';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Servir archivos estáticos si es necesario (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas API
app.use('/api/properties', propertyRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

export default app;
