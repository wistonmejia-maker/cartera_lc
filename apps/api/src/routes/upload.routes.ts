
import importLib from 'express'; // Dummy import to keep TS happy if types missing, but using standard express
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ExcelParser } from '../services/etl/ExcelParser';

const router = Router();

// Configurar multer para guardar en apps/api/uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
const parser = new ExcelParser();

// POST /api/upload/analyze
// Recibe un archivo, lo analiza con Python y devuelve el JSON (Staging Data)
router.post('/analyze', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return; // Add return to satisfy TS void return
        }

        const filePath = req.file.path;
        console.log(`Analyzing file: ${filePath}`);

        // Llamar al motor ETL
        const analysisResult = await parser.parse(filePath);

        // Devolver resultado para revisión (Bloque 2)
        res.json({
            message: 'File analyzed successfully',
            fileId: req.file.filename,
            data: analysisResult
        });

    } catch (error: any) {
        console.error('Error analyzing file:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

export default router;
