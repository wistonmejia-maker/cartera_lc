import { Router } from 'express';
import { prisma } from '../app';

const router = Router();

// GET /api/reports/:propertyId
router.get('/:propertyId', async (req, res) => {
    try {
        const { propertyId } = req.params;
        const reports = await prisma.monthlyReport.findMany({
            where: { complexId: propertyId },
            include: {
                balances: {
                    include: {
                        unit: true
                    }
                }
            },
            orderBy: { period: 'desc' }
        });

        // Map database structure to frontend structure
        const mappedReports = reports.map(r => ({
            id: r.id,
            periodo: r.period.toISOString().slice(0, 7), // "2026-01"
            periodoLabel: r.periodoLabel,
            fechaCarga: r.createdAt.toISOString(),
            totalDeudores: r.balances.length,
            totalCartera: Number(r.totalAmount),
            propertyId: r.complexId,
            debtors: r.balances.map(b => ({
                id: b.id,
                unidad: b.unit.identifier,
                propietario: b.unit.ownerName,
                saldoAnterior: b.prevBalance,
                cuotaActual: b.currentFee,
                interesesMora: b.interest,
                otros: b.otherCharges,
                totalPagar: b.totalDebt,
                edadVencida: b.monthsOverdue,
                estadoReal: b.riskStatus,
                tipoCarta: b.actionType,
                periodo: r.period.toISOString().slice(0, 7)
            }))
        }));

        res.json(mappedReports);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/reports
router.post('/', async (req, res) => {
    try {
        const { periodo, periodoLabel, propertyId, debtors } = req.body;
        const periodDate = new Date(`${periodo}-01T00:00:00Z`);

        // 1. Create or Find Units
        const unitIds: Record<string, string> = {};
        for (const d of debtors) {
            const unit = await prisma.unit.upsert({
                where: {
                    complexId_identifier: {
                        complexId: propertyId,
                        identifier: d.unidad
                    }
                },
                update: {
                    ownerName: d.propietario,
                    email: d.email,
                    phone: d.movil
                },
                create: {
                    complexId: propertyId,
                    identifier: d.unidad,
                    ownerName: d.propietario,
                    email: d.email,
                    phone: d.movil
                }
            });
            unitIds[d.unidad] = unit.id;
        }

        // 2. Create the Report
        const totalAmount = debtors.reduce((sum: number, d: any) => sum + d.totalPagar, 0);

        // Delete existing report for same period if exists (to allow re-upload)
        const existingReport = await prisma.monthlyReport.findUnique({
            where: { complexId_period: { complexId: propertyId, period: periodDate } }
        });
        if (existingReport) {
            await prisma.unitBalance.deleteMany({ where: { reportId: existingReport.id } });
            await prisma.monthlyReport.delete({ where: { id: existingReport.id } });
        }

        const report = await prisma.monthlyReport.create({
            data: {
                complexId: propertyId,
                period: periodDate,
                periodoLabel,
                totalAmount,
                status: 'APPROVED',
                balances: {
                    create: debtors.map((d: any) => ({
                        unitId: unitIds[d.unidad],
                        prevBalance: d.saldoAnterior,
                        currentFee: d.cuotaActual,
                        interest: d.interesesMora,
                        otherCharges: d.otros,
                        totalDebt: d.totalPagar,
                        monthsOverdue: d.edadVencida || 0,
                        riskStatus: d.estadoReal || 'MOROSO',
                        actionType: d.tipoCarta || 'CS'
                    }))
                }
            }
        });

        res.status(201).json(report);
    } catch (error: any) {
        console.error('Error saving report:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/reports/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.unitBalance.deleteMany({ where: { reportId: id } });
        await prisma.monthlyReport.delete({ where: { id } });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
