import { Router } from 'express';
import { prisma } from '../app';

const router = Router();

// GET /api/properties
router.get('/', async (req, res) => {
    try {
        const properties = await prisma.residentialComplex.findMany({
            orderBy: { name: 'asc' }
        });
        // Adapt schema to frontend if needed (settings is already JSON)
        res.json(properties);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/properties
router.post('/', async (req, res) => {
    try {
        const { name, settings } = req.body;
        const property = await prisma.residentialComplex.create({
            data: {
                name,
                settings: settings || {}
            }
        });
        res.status(201).json(property);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/properties/:id
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, settings } = req.body;
        const property = await prisma.residentialComplex.update({
            where: { id },
            data: {
                name,
                settings: settings || undefined
            }
        });
        res.json(property);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
