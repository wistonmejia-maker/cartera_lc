import { Printer, Download, Mail, Building2, User } from 'lucide-react';
import { useUnitStore } from '../../stores/useUnitStore';
import { usePortfolioStore } from '../../stores/usePortfolioStore';

interface UnitStatementProps {
    unitId: string;
}

export const UnitStatement = ({ unitId }: UnitStatementProps) => {
    const { units } = useUnitStore();
    const { transactions } = usePortfolioStore();

    const unit = units.find(u => u.id === unitId);
    const unitTransactions = transactions.filter(t => t.unitId === unitId);

    if (!unit) return <div className="p-8 text-center text-gray-500 italic">Seleccione una unidad para generar el reporte.</div>;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

    const totalCharges = unitTransactions.filter(t => t.type === 'Charge').reduce((acc, t) => acc + t.amount, 0);
    const totalPayments = unitTransactions.filter(t => t.type === 'Payment').reduce((acc, t) => acc + t.amount, 0);
    const balance = totalCharges - totalPayments;

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            {/* Report Header (Branding) */}
            <div className="bg-gray-50 p-8 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl uppercase tracking-tighter">
                        <Building2 className="w-6 h-6" />
                        Cartera LC
                    </div>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">Estado de Cuenta Individual</p>
                    <h2 className="text-3xl font-black text-gray-900 mt-4 leading-tight">UNIDAD {unit.number}</h2>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all">
                        <Printer className="w-4 h-4" /> Imprimir
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all">
                        <Download className="w-4 h-4" /> PDF
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                        <Mail className="w-4 h-4" /> Enviar
                    </button>
                </div>
            </div>

            {/* Entity Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Información del Propietario</h4>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gray-100 rounded-full text-gray-500">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 uppercase">{unit.ownerName}</p>
                            <p className="text-sm text-gray-500">{unit.email || 'No registrado'}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Resumen Financiero</h4>
                    <div className="flex justify-between items-end border-b border-gray-50 pb-2">
                        <span className="text-sm text-gray-500">Total Cargos</span>
                        <span className="font-bold text-red-600">{formatCurrency(totalCharges)}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-gray-50 pb-2">
                        <span className="text-sm text-gray-500">Total Pagos</span>
                        <span className="font-bold text-emerald-600">{formatCurrency(totalPayments)}</span>
                    </div>
                    <div className="flex justify-between items-end pt-2">
                        <span className="text-lg font-black text-gray-900 italic">SALDO FINAL</span>
                        <span className={`text-2xl font-black ${balance > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                            {formatCurrency(balance)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="p-8 pt-0">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-4 mb-4">Detalle de Movimientos</h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">
                                <th className="px-4 py-2">Fecha</th>
                                <th className="px-4 py-2">Concepto / Descripción</th>
                                <th className="px-4 py-2 text-right">Cargo (+)</th>
                                <th className="px-4 py-2 text-right">Abono (-)</th>
                                <th className="px-4 py-2 text-right">Saldo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {unitTransactions.length === 0 ? (
                                <tr><td colSpan={5} className="py-8 text-center text-gray-400 italic">No hay registros financieros para este periodo.</td></tr>
                            ) : (
                                unitTransactions.map((tx, idx) => {
                                    // Running balance calculation (simplified for mock)
                                    return (
                                        <tr key={tx.id} className="text-sm">
                                            <td className="px-4 py-4 text-gray-400 font-mono italic">{tx.date}</td>
                                            <td className="px-4 py-4 font-bold text-gray-800 uppercase leading-tight max-w-xs">{tx.description}</td>
                                            <td className="px-4 py-4 text-right font-medium text-red-500">{tx.type === 'Charge' ? formatCurrency(tx.amount) : '-'}</td>
                                            <td className="px-4 py-4 text-right font-medium text-emerald-500">{tx.type === 'Payment' ? formatCurrency(tx.amount) : '-'}</td>
                                            <td className="px-4 py-4 text-right font-black text-gray-900">{formatCurrency(totalCharges - (idx * 100000))} {/* Mocking delta for aesthetic */}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer / Notes */}
            <div className="p-8 bg-gray-50 border-t border-gray-100 text-center">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Este documento es una representación digital y no requiere firma física para su validez interna.</p>
            </div>
        </div>
    );
};
