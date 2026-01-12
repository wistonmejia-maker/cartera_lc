import { Search, ChevronRight } from 'lucide-react';
import type { Debtor } from '../../stores/useDebtorStore';
import type { LetterRecord } from '../../stores/useLetterHistoryStore';
import type { LetterType } from '../../utils/letterTemplates';

interface DebtorListProps {
    debtors: Debtor[];
    records: LetterRecord[];
    activePropertyId: string | null;
    selectedDebtorId: string | null;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onSelectDebtor: (id: string, letterType: LetterType) => void;
    formatCurrency: (val: number) => string;
}

export const DebtorList = ({
    debtors,
    records,
    activePropertyId,
    selectedDebtorId,
    searchTerm,
    onSearchChange,
    onSelectDebtor,
    formatCurrency,
}: DebtorListProps) => {
    return (
        <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Search */}
            <div className="relative shrink-0">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    placeholder="Buscar moroso..."
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none shadow-sm transition-all text-gray-700"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex-1 flex flex-col max-h-[600px]">
                <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Deudores ({debtors.length})</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {debtors.map((d) => {
                        const lastLetter = records
                            .filter(r => r.unidad === d.unidad && r.propertyId === activePropertyId)
                            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];

                        return (
                            <button
                                key={d.id}
                                onClick={() => onSelectDebtor(d.id, d.tipoCarta)}
                                className={`
                                    w-full flex items-center justify-between p-4 rounded-2xl transition-all text-left group
                                    ${selectedDebtorId === d.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]' : 'hover:bg-gray-50 text-gray-700'}
                                `}
                            >
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex items-center gap-2">
                                        <p className="font-black text-lg tracking-tighter">{d.unidad}</p>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${selectedDebtorId === d.id ? 'bg-white/20 text-white' :
                                                d.tipoCarta === 'CS' ? 'bg-blue-100 text-blue-700' :
                                                    d.tipoCarta === 'CP' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-red-100 text-red-700'
                                            }`}>
                                            {d.tipoCarta}
                                        </span>
                                    </div>
                                    {lastLetter ? (
                                        <div className="flex flex-col gap-0.5 mt-0.5">
                                            <p className={`text-[10px] font-bold flex items-center gap-1 ${selectedDebtorId === d.id ? 'text-white' : 'text-indigo-500'}`}>
                                                <span className={`w-1 h-1 rounded-full ${selectedDebtorId === d.id ? 'bg-white' : 'bg-indigo-500'}`} />
                                                {lastLetter.tipo} ({new Date(lastLetter.fecha).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })})
                                            </p>
                                            {lastLetter.compromisoPago && (
                                                <p className={`text-[9px] font-bold flex items-center gap-1 ${selectedDebtorId === d.id ? 'text-emerald-200' : 'text-emerald-600'}`}>
                                                    <span className={`w-1 h-1 rounded-full ${selectedDebtorId === d.id ? 'bg-emerald-200' : 'bg-emerald-500'}`} />
                                                    Compromiso: {lastLetter.compromisoPago.length > 20 ? lastLetter.compromisoPago.substring(0, 20) + '...' : lastLetter.compromisoPago}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className={`text-[10px] mt-0.5 italic ${selectedDebtorId === d.id ? 'text-indigo-100' : 'text-gray-400'}`}>
                                            Sin comunicaciones
                                        </p>
                                    )}
                                    <p className={`text-xs truncate font-medium mt-0.5 ${selectedDebtorId === d.id ? 'text-indigo-100' : 'text-gray-400'}`}>
                                        {d.propietario}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-bold ${selectedDebtorId === d.id ? 'text-white' : 'text-red-600'}`}>
                                        {formatCurrency(d.totalPagar)}
                                    </p>
                                    <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${selectedDebtorId === d.id ? 'translate-x-1' : 'text-gray-300'}`} />
                                </div>
                            </button>
                        );
                    })}
                    {debtors.length === 0 && (
                        <div className="text-center py-8 text-gray-400 italic">
                            No hay deudores que coincidan con la búsqueda.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
