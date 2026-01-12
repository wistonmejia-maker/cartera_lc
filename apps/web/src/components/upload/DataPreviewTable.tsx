import { CheckCircle2, Trash2, ArrowRight, AlertTriangle } from 'lucide-react';
import type { Debtor } from '../../stores/useDebtorStore';

interface DataPreviewTableProps {
    data: Debtor[];
    periodLabel: string;
    periodAlreadyExists: boolean;
    canConfirm: boolean;
    onConfirm: () => void;
    onClear: () => void;
    formatCurrency: (val: number) => string;
}

export const DataPreviewTable = ({
    data,
    periodLabel,
    periodAlreadyExists,
    canConfirm,
    onConfirm,
    onClear,
    formatCurrency,
}: DataPreviewTableProps) => {
    const totalCartera = data.reduce((sum, d) => sum + d.totalPagar, 0);

    return (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-gray-50 via-white to-gray-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
                            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900">
                                Vista Previa de Datos
                            </h3>
                            <p className="text-sm text-gray-500 font-medium">
                                {data.length} registros · Total: <span className="text-indigo-600 font-bold">{formatCurrency(totalCartera)}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClear}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border-t border-b border-gray-100">
                <div className="max-h-[400px] overflow-y-auto">
                    <table className="w-full min-w-[1200px] text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 font-black tracking-wider sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 bg-gray-50/50">Unidad</th>
                                <th className="px-6 py-4 bg-gray-50/50">Propietario</th>
                                <th className="px-6 py-4 text-center bg-gray-50/50">Tipo</th>
                                <th className="px-6 py-4 text-right bg-gray-50/50">Saldo Ant</th>
                                <th className="px-6 py-4 text-right bg-gray-50/50">Cuota</th>
                                <th className="px-6 py-4 text-right bg-gray-50/50">Int Mora</th>
                                <th className="px-6 py-4 text-right bg-gray-50/50">Otros</th>
                                <th className="px-6 py-4 text-right bg-gray-50/50 font-black text-gray-900 font-mono">Total</th>
                                <th className="px-6 py-4 bg-gray-50/50">Estado</th>
                                <th className="px-6 py-4 bg-gray-50/50">Email</th>
                                <th className="px-6 py-4 bg-gray-50/50">Móvil</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {data.slice(0, 50).map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900">{row.unidad}</td>
                                    <td className="px-6 py-4 text-gray-600 font-medium">{row.propietario}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${row.tipoCarta === 'CS' ? 'bg-blue-100 text-blue-700' :
                                                row.tipoCarta === 'CP' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {row.tipoCarta}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-gray-500">{formatCurrency(row.saldoAnterior)}</td>
                                    <td className="px-6 py-4 text-right font-mono text-gray-500">{formatCurrency(row.cuotaActual)}</td>
                                    <td className="px-6 py-4 text-right font-mono text-gray-500">{formatCurrency(row.interesesMora)}</td>
                                    <td className="px-6 py-4 text-right font-mono text-gray-500">{formatCurrency(row.otros)}</td>
                                    <td className="px-6 py-4 text-right font-mono font-bold text-indigo-600 bg-indigo-50/30">{formatCurrency(row.totalPagar)}</td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${row.etapaLegal === 'Jurídica' ? 'bg-red-500' :
                                                    row.etapaLegal === 'Persuasiva' ? 'bg-orange-500' :
                                                        'bg-emerald-500'
                                                }`} />
                                            {row.estadoReal}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-xs truncate max-w-[150px]">{row.email || '—'}</td>
                                    <td className="px-6 py-4 text-gray-400 text-xs">{row.movil || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                    {periodAlreadyExists && (
                        <span className="text-amber-600 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" /> Reemplazará el reporte existente
                        </span>
                    )}
                </div>
                <button
                    onClick={onConfirm}
                    disabled={!canConfirm}
                    className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl text-base font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-200"
                >
                    Confirmar {periodLabel} <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
