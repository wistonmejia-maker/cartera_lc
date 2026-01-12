import { Calendar, History, Trash2 } from 'lucide-react';

interface Report {
    periodo: string;
    periodoLabel: string;
    fechaCarga: string;
    totalDeudores: number;
    totalCartera: number;
    propertyId: string;
}

interface ReportHistoryProps {
    reports: Report[];
    currentPeriodo: string;
    onSwitchPeriod: (periodo: string) => void;
    onDeleteReport: (periodo: string) => void;
    formatCurrency: (val: number) => string;
    formatDate: (iso: string) => string;
}

export const ReportHistory = ({
    reports,
    currentPeriodo,
    onSwitchPeriod,
    onDeleteReport,
    formatCurrency,
    formatDate,
}: ReportHistoryProps) => {
    if (reports.length === 0) return null;

    return (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-600" />
                    Historial de Reportes
                </h3>
                <span className="text-xs font-bold text-gray-400">{reports.length} reportes cargados</span>
            </div>
            <div className="divide-y divide-gray-50">
                {reports.map((report) => (
                    <div
                        key={report.periodo}
                        className={`p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors ${currentPeriodo === report.periodo ? 'bg-indigo-50/50 border-l-4 border-indigo-500' : ''
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <div className="font-black text-gray-900">{report.periodoLabel}</div>
                                <div className="text-xs text-gray-500">
                                    Cargado: {formatDate(report.fechaCarga)} · {report.totalDeudores} deudores
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="font-bold text-indigo-600">{formatCurrency(report.totalCartera)}</div>
                                <div className="text-[10px] text-gray-400 uppercase font-bold">Total Cartera</div>
                            </div>
                            <div className="flex gap-1">
                                {currentPeriodo !== report.periodo ? (
                                    <button
                                        onClick={() => onSwitchPeriod(report.periodo)}
                                        className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-200 transition-colors"
                                    >
                                        Activar
                                    </button>
                                ) : (
                                    <span className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">
                                        Activo
                                    </span>
                                )}
                                <button
                                    onClick={() => onDeleteReport(report.periodo)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
