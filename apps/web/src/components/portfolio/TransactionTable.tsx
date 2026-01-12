import { Badge } from '../ui/Badge';
import { useDebtorStore } from '../../stores/useDebtorStore';
import { usePropertyStore } from '../../stores/usePropertyStore';
import { useLegalStore } from '../../stores/useLegalStore';
import { useMemo } from 'react';
import { formatCurrency } from '../../utils/formatters';

export const TransactionTable = () => {
    const { reports, currentPeriodo } = useDebtorStore();
    const { activePropertyId } = usePropertyStore();
    const { cases } = useLegalStore();

    const activeReport = useMemo(() =>
        reports.find(r => r.propertyId === activePropertyId && r.periodo === currentPeriodo),
        [reports, activePropertyId, currentPeriodo]
    );

    const topDebtors = useMemo(() => {
        if (!activeReport) return [];
        return [...activeReport.debtors]
            .sort((a, b) => b.totalPagar - a.totalPagar)
            .slice(0, 50); // Show top 50
    }, [activeReport]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-bold text-gray-800">Mayores Deudores</h3>
                <span className="text-xs text-gray-500 font-medium">Top 50 ordenados por deuda</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs uppercase text-gray-400 font-semibold tracking-wider">
                            <th className="px-6 py-4">Unidad</th>
                            <th className="px-6 py-4">Propietario</th>
                            <th className="px-6 py-4">Etapa Legal</th>
                            <th className="px-6 py-4">Seguimiento de Cobro</th>
                            <th className="px-6 py-4">Edad (Meses)</th>
                            <th className="px-6 py-4 text-right">Total Pagar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {topDebtors.map((d) => {
                            const legalCase = cases.find(c => c.debtorId === d.id && c.estado === 'activo');
                            const lastNovedad = legalCase?.novedades[legalCase.novedades.length - 1];

                            return (
                                <tr key={d.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-900">{d.unidad}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 uppercase">
                                        {d.propietario}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant={
                                                d.etapaLegal === 'Jurídica' ? 'destructive' :
                                                    d.etapaLegal === 'Persuasiva' ? 'warning' : 'success'
                                            }
                                        >
                                            {d.etapaLegal}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        {lastNovedad ? (
                                            <div className="max-w-[200px]">
                                                <p className="text-xs text-gray-900 font-bold truncate" title={lastNovedad.descripcion}>
                                                    {lastNovedad.descripcion}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-mono">
                                                    {new Date(lastNovedad.fecha).toLocaleDateString()}
                                                </p>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-300 italic">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {d.edadVencida.toFixed(1)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-bold text-gray-900">
                                            {formatCurrency(d.totalPagar)}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                        {topDebtors.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-400 italic">
                                    No hay reporte cargado o deudores registrados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
