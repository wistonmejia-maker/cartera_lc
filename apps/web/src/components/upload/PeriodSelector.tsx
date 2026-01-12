import { Calendar, AlertTriangle } from 'lucide-react';

const MONTHS = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
];

interface PeriodSelectorProps {
    selectedMonth: string;
    selectedYear: string;
    years: string[];
    periodAlreadyExists: boolean;
    onMonthChange: (month: string) => void;
    onYearChange: (year: string) => void;
}

export const PeriodSelector = ({
    selectedMonth,
    selectedYear,
    years,
    periodAlreadyExists,
    onMonthChange,
    onYearChange,
}: PeriodSelectorProps) => {
    return (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Período del Reporte
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Mes</label>
                    <select
                        value={selectedMonth}
                        onChange={(e) => onMonthChange(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    >
                        {MONTHS.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Año</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => onYearChange(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>
            {periodAlreadyExists && (
                <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium">
                    <AlertTriangle className="w-4 h-4" />
                    Ya existe un reporte para este período. Si cargas uno nuevo, reemplazará el anterior.
                </div>
            )}
        </div>
    );
};

export { MONTHS };
