import { X, CheckCircle2, Download, Loader2 } from 'lucide-react';
import type { LetterType } from '../../utils/letterTemplates';

interface BulkGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    bulkSelections: Record<LetterType, boolean>;
    onSelectionChange: (type: LetterType, selected: boolean) => void;
    debtorsByType: Record<LetterType, number>;
    onGenerate: () => void;
    bulkResult: { total: number; byType: Record<LetterType, number>; generatedRecords: any[] } | null;
    activeCounters: Record<LetterType, number>;
    onMassDownload: () => void;
    isExporting: boolean;
    exportProgress: { current: number; total: number } | null;
}

const LETTER_TYPE_LABELS: Record<LetterType, { name: string; color: string }> = {
    CS: { name: 'Cobro Simple', color: 'bg-blue-100 text-blue-700' },
    CP: { name: 'Cobro Persuasivo', color: 'bg-orange-100 text-orange-700' },
    AB: { name: 'Cobro Jurídico', color: 'bg-red-100 text-red-700' },
};

export const BulkGenerationModal = ({
    isOpen,
    onClose,
    bulkSelections,
    onSelectionChange,
    debtorsByType,
    onGenerate,
    bulkResult,
    activeCounters,
    onMassDownload,
    isExporting,
    exportProgress,
}: BulkGenerationModalProps) => {
    if (!isOpen) return null;

    const totalToGenerate = (['CS', 'CP', 'AB'] as LetterType[])
        .filter(tipo => bulkSelections[tipo])
        .reduce((sum, tipo) => sum + debtorsByType[tipo], 0);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xl font-black text-gray-900">Generación Masiva de Cartas</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {!bulkResult ? (
                    <>
                        <div className="p-6 space-y-4">
                            <p className="text-gray-600 text-sm">Selecciona los tipos de carta a generar. Se asignará un consecutivo único a cada carta.</p>

                            <div className="space-y-3">
                                {(['CS', 'CP', 'AB'] as LetterType[]).map(tipo => (
                                    <label
                                        key={tipo}
                                        className={`
                                            flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all
                                            ${bulkSelections[tipo] ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200'}
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={bulkSelections[tipo]}
                                                onChange={(e) => onSelectionChange(tipo, e.target.checked)}
                                                className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <div>
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold mr-2 ${LETTER_TYPE_LABELS[tipo].color}`}>{tipo}</span>
                                                <span className="font-bold text-gray-800">{LETTER_TYPE_LABELS[tipo].name}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-black text-gray-900">{debtorsByType[tipo]}</span>
                                            <span className="text-xs text-gray-400 block">pendientes</span>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-4 mt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 font-medium">Total a generar:</span>
                                    <span className="text-2xl font-black text-indigo-600">{totalToGenerate} cartas</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3 justify-end">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={onGenerate}
                                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                            >
                                Generar Cartas
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-gray-900">¡Cartas Generadas!</h4>
                                <p className="text-gray-500 mt-1">Se han asignado consecutivos a {bulkResult.total} cartas.</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {(['CS', 'CP', 'AB'] as LetterType[]).map(tipo => (
                                    <div key={tipo} className="bg-gray-50 rounded-xl p-4">
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${LETTER_TYPE_LABELS[tipo].color}`}>{tipo}</span>
                                        <div className="text-2xl font-black text-gray-900 mt-2">{bulkResult.byType[tipo]}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-indigo-50 rounded-2xl p-4 text-sm text-indigo-700">
                                <strong>Consecutivos actuales:</strong><br />
                                CS-{activeCounters.CS.toString().padStart(4, '0')} |
                                CP-{activeCounters.CP.toString().padStart(4, '0')} |
                                AB-{activeCounters.AB.toString().padStart(4, '0')}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3 justify-end">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                Cerrar
                            </button>
                            <button
                                onClick={onMassDownload}
                                disabled={isExporting}
                                className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 flex items-center gap-2"
                            >
                                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                {isExporting ? `Exportando ${exportProgress?.current}/${exportProgress?.total}` : 'Descargar PDF Unificado'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
