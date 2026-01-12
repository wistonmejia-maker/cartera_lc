import { useCollectionEffectiveness } from '../../hooks/useCollectionEffectiveness';
import { Card } from '../ui/Card';
import { Activity, TrendingUp, CheckCircle2, AlertTriangle, XCircle, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const EffectivenessStats = () => {
    const stats = useCollectionEffectiveness();

    if (!stats || stats.global.totalLetters === 0) {
        return (
            <Card className="bg-gradient-to-br from-gray-50 to-white border-dashed">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Activity className="w-10 h-10 text-gray-300 mb-3" />
                    <h3 className="text-sm font-semibold text-gray-900">Sin datos suficientes</h3>
                    <p className="text-xs text-gray-500 max-w-xs mt-1">
                        Se requieren reportes de al menos dos meses consecutivos y cartas generadas para calcular la efectividad.
                    </p>
                </div>
            </Card>
        );
    }

    const { global } = stats;

    return (
        <Card className="overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-white">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    Efectividad de Cobro
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                    Impacto real de las gestiones sobre la recuperación de cartera.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {/* Tasa de Éxito */}
                <div className="p-6 flex flex-col items-center text-center">
                    <div className="relative inline-flex items-center justify-center mb-4">
                        <svg className="w-20 h-20 transform -rotate-90">
                            <circle
                                className="text-gray-100"
                                strokeWidth="8"
                                stroke="currentColor"
                                fill="transparent"
                                r="36"
                                cx="40"
                                cy="40"
                            />
                            <circle
                                className={`${global.successRate > 50 ? 'text-emerald-500' : 'text-orange-500'}`}
                                strokeWidth="8"
                                strokeDasharray={226} // 2 * pi * 36
                                strokeDashoffset={226 - (226 * global.successRate) / 100}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="36"
                                cx="40"
                                cy="40"
                            />
                        </svg>
                        <span className="absolute text-xl font-black text-gray-900">
                            {Math.round(global.successRate)}%
                        </span>
                    </div>
                    <span className="text-sm font-medium text-gray-600">Tasa de Éxito</span>
                    <span className="text-xs text-gray-400 mt-1">
                        {global.successCount} de {global.totalLetters} gestiones efectivas
                    </span>
                </div>

                {/* Dinero Recuperado */}
                <div className="p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-3">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div className="text-2xl font-black text-gray-900 tracking-tight">
                        {formatCurrency(global.recoveredAmount)}
                    </div>
                    <span className="text-sm font-medium text-gray-600 mt-1">Recuperación Estimada</span>
                    <p className="text-xs text-gray-400 mt-2 max-w-[150px]">
                        Reducción de deuda directa post-gestión.
                    </p>
                </div>

                {/* Desglose */}
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm text-gray-600">Pago Total</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                            {global.successCount - global.partialCount}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-600">Abono Parcial</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                            {global.partialCount}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                            </div>
                            <span className="text-sm text-gray-600">Sin Cambio</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                            {global.failureCount}
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer info */}
            <div className="bg-gray-50/50 p-3 text-center border-t border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                    Analizando últimos {stats.availablePeriods.length - 1} periodos cerrados
                </p>
            </div>
        </Card>
    );
};
