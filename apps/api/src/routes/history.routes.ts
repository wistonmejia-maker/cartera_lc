import { Router } from 'express';
import { prisma } from '../app';

const router = Router();

// GET /api/history/:propertyId
router.get('/:propertyId', async (req, res) => {
    try {
        const { propertyId } = req.params;
        const history = await prisma.letterRecord.findMany({
            where: { propertyId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(history);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/history
router.post('/', async (req, res) => {
    try {
        const {
            consecutivo,
            tipo,
            unidad,
            propietario,
            monto,
            estado,
            canal,
            emailDestinatario,
            notas,
            compromisoPago,
            propertyId,
            periodo
        } = req.body;

        const log = await prisma.letterRecord.create({
            data: {
                consecutivo,
                tipo,
                unidad,
                propietario,
                monto,
                estado: estado || 'generada',
                canal,
                emailDestinatario,
                notas,
                compromisoPago,
                propertyId,
                periodo
            }
        });
        res.status(201).json(log);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/history/:id
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updated = await prisma.letterRecord.update({
            where: { id },
            data
        });
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/history/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.letterRecord.delete({ where: { id } });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
