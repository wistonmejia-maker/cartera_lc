import { Router } from 'express';
import { prisma } from '../app';

const router = Router();

// GET /api/legal/:propertyId
router.get('/:propertyId', async (req, res) => {
    try {
        const { propertyId } = req.params;
        const cases = await prisma.legalCase.findMany({
            where: { propertyId },
            include: { notes: { orderBy: { fecha: 'desc' } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(cases);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/legal
router.post('/', async (req, res) => {
    try {
        const { propertyId, debtorId, unidad, propietario, abogado, radicado, etapaActual, montoInicial } = req.body;
        const newCase = await prisma.legalCase.create({
            data: {
                propertyId,
                debtorId,
                unidad,
                propietario,
                abogado,
                radicado,
                etapaActual,
                montoInicial,
                notes: {
                    create: {
                        descripcion: `Gestión iniciada - Etapa: ${etapaActual}`,
                        etapa: etapaActual
                    }
                }
            },
            include: { notes: true }
        });
        res.status(201).json(newCase);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/legal/:id
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updated = await prisma.legalCase.update({
            where: { id },
            data
        });
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/legal/:id/novedad
router.post('/:id/novedad', async (req, res) => {
    try {
        const { id } = req.params;
        const { descripcion, etapa } = req.body;

        const [note, updatedCase] = await prisma.$transaction([
            prisma.legalNote.create({
                data: {
                    caseId: id,
                    descripcion,
                    etapa
                }
            }),
            prisma.legalCase.update({
                where: { id },
                data: { etapaActual: etapa }
            })
        ]);

        res.status(201).json(updatedCase);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/legal/:id/close
router.post('/:id/close', async (req, res) => {
    try {
        const { id } = req.params;
        const { fechaFin } = req.body;
        const updated = await prisma.legalCase.update({
            where: { id },
            data: {
                estado: 'cerrado',
                fechaFin: new Date(fechaFin),
                etapaActual: 'Finalizado'
            }
        });
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
