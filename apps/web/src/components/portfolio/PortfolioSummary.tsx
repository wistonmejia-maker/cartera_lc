import { DollarSign, Users, Scale } from 'lucide-react';
import { useDebtorStore } from '../../stores/useDebtorStore';
import { usePropertyStore } from '../../stores/usePropertyStore';
import { useMemo } from 'react';
import { formatCurrency } from '../../utils/formatters';

export const PortfolioSummary = () => {
    const { reports, currentPeriodo } = useDebtorStore();
    const { activePropertyId } = usePropertyStore();

    // Get active report
    const activeReport = useMemo(() =>
        reports.find(r => r.propertyId === activePropertyId && r.periodo === currentPeriodo),
        [reports, activePropertyId, currentPeriodo]
    );

    const metrics = useMemo(() => {
        if (!activeReport) return { totalDebt: 0, juridicalDebt: 0, totalDebtors: 0, capitalMora: 0 };

        const juridicalDebt = activeReport.debtors
            .filter(d => d.etapaLegal === 'Jurídica')
            .reduce((sum, d) => sum + d.totalPagar, 0);

        const totalCuotaActual = activeReport.debtors
            .reduce((sum, d) => sum + d.cuotaActual, 0);

        return {
            totalDebt: activeReport.totalCartera,
            juridicalDebt,
            totalDebtors: activeReport.totalDeudores,
            capitalMora: activeReport.totalCartera - totalCuotaActual
        };
    }, [activeReport]);

    const stats = [
        {
            label: 'Cartera Total Vencida',
            value: formatCurrency(metrics.totalDebt),
            icon: DollarSign,
            color: 'text-red-600',
            bg: 'bg-red-50',
            desc: 'Total deuda acumulada'
        },
        {
            label: 'Capital en Mora',
            value: formatCurrency(metrics.capitalMora),
            icon: DollarSign,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            desc: 'Excluye la cuota actual'
        },
        {
            label: 'En Cobro Jurídico',
            value: formatCurrency(metrics.juridicalDebt),
            icon: Scale,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            desc: 'Cartera en proceso legal'
        },
        {
            label: 'Unidades en Mora',
            value: metrics.totalDebtors.toString(),
            icon: Users,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            desc: 'Total de apartamentos deudores'
        },
    ];

    if (!activeReport) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center text-blue-800">
                <p>No hay un reporte seleccionado para mostrar el resumen.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">{stat.desc}</p>
                </div>
            ))}
        </div>
    );
};
