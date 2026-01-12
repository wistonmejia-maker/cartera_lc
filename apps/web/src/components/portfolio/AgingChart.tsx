import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useDebtorStore } from '../../stores/useDebtorStore';
import { usePropertyStore } from '../../stores/usePropertyStore';
import { useMemo } from 'react';
import { formatCurrency } from '../../utils/formatters';

export const AgingChart = () => {
    const { reports, currentPeriodo } = useDebtorStore();
    const { activePropertyId } = usePropertyStore();

    // Get active report
    const activeReport = useMemo(() =>
        reports.find(r => r.propertyId === activePropertyId && r.periodo === currentPeriodo),
        [reports, activePropertyId, currentPeriodo]
    );

    const data = useMemo(() => {
        if (!activeReport) return [];

        const buckets = {
            '0-30': 0,
            '31-60': 0,
            '61-90': 0,
            '90+': 0
        };

        activeReport.debtors.forEach(d => {
            const months = d.edadVencida || 0;
            if (months <= 1) buckets['0-30'] += d.totalPagar;
            else if (months <= 2) buckets['31-60'] += d.totalPagar;
            else if (months <= 3) buckets['61-90'] += d.totalPagar;
            else buckets['90+'] += d.totalPagar;
        });

        return [
            { name: '0-30 días', value: buckets['0-30'] },
            { name: '31-60 días', value: buckets['31-60'] },
            { name: '61-90 días', value: buckets['61-90'] },
            { name: '90+ días', value: buckets['90+'] },
        ];
    }, [activeReport]);

    const COLORS = ['#6366f1', '#f59e0b', '#f97316', '#ef4444'];

    const formatYAxis = (val: number) =>
        new Intl.NumberFormat('es-CO', { notation: 'compact', compactDisplay: 'short' }).format(val);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h3 className="font-bold text-gray-800 mb-6 uppercase text-xs tracking-widest text-gray-400">Vencimiento de Cartera (Aging)</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                            tickFormatter={formatYAxis}
                        />
                        <Tooltip
                            cursor={{ fill: '#f9fafb' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: any) => [
                                formatCurrency(Number(value || 0)),
                                'Monto'
                            ]}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                            {data.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
