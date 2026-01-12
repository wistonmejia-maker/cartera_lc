import { Router } from 'express';
import { prisma } from '../app';

const router = Router();

// PUT /api/debtors/:id
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { saldoAnterior, cuotaActual, interesesMora, otros, totalPagar, edadVencida, estadoReal, tipoCarta } = req.body;

        const updated = await prisma.unitBalance.update({
            where: { id },
            data: {
                prevBalance: saldoAnterior,
                currentFee: cuotaActual,
                interest: interesesMora,
                otherCharges: otros,
                totalDebt: totalPagar,
                monthsOverdue: edadVencida,
                riskStatus: estadoReal,
                actionType: tipoCarta
            }
        });

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/debtors/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.unitBalance.delete({ where: { id } });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
