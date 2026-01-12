import { useState, useMemo, useRef } from 'react';
import { Mail, Search, ChevronRight, Zap, CheckCircle2, X, Download, Loader2 } from 'lucide-react';
import { useDebtorStore } from '../stores/useDebtorStore';
import { useLetterHistoryStore } from '../stores/useLetterHistoryStore';
import { usePropertyStore } from '../stores/usePropertyStore';
import { LetterPreview } from '../components/letters/LetterPreview';
import { LETTER_TEMPLATES, type LetterType } from '../utils/letterTemplates';
import { numberToWords } from '../utils/numberToWords';
import { LetterDocument } from '../components/letters/LetterDocument';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const LettersPage = () => {
    const { debtors } = useDebtorStore();
    const { generateLetter, counters, records } = useLetterHistoryStore();
    const { activePropertyId, properties } = usePropertyStore();

    // Safety checks for persisted data
    if (!debtors || !Array.isArray(debtors)) {
        console.error('Critical: Debtors store corrupted', debtors);
        return <div className="p-8 text-center text-red-600">Error crítico: Datos de deudores dañados. Por favor reinicia la aplicación (Borrar datos del sitio).</div>;
    }
    if (!properties || !Array.isArray(properties)) {
        return <div className="p-8 text-center text-red-600">Error crítico: Datos de propiedades dañados.</div>;
    }

    const activeProperty = properties.find(p => p.id === activePropertyId);
    const activeCounters = activePropertyId && counters && counters[activePropertyId] ? counters[activePropertyId] || { CS: 0, CP: 0, AB: 0 } : { CS: 0, CP: 0, AB: 0 };

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDebtorId, setSelectedDebtorId] = useState<string | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<LetterType>('CS');

    // Bulk generation state
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkSelections, setBulkSelections] = useState<Record<LetterType, boolean>>({
        CS: true,
        CP: true,
        AB: true
    });
    const [bulkResult, setBulkResult] = useState<{ total: number; byType: Record<LetterType, number>; generatedRecords: any[] } | null>(null);
    const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    // Filter debtors based on search
    const filteredDebtors = useMemo(() => {
        return debtors.filter(d => {
            const matchesSearch = d.unidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.propietario.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
    }, [debtors, searchTerm]);

    // Count debtors by type and check if they are already in history
    const debtorsSummary = useMemo(() => {
        const summary: Record<LetterType, { total: number; alreadyGenerated: number }> = {
            CS: { total: 0, alreadyGenerated: 0 },
            CP: { total: 0, alreadyGenerated: 0 },
            AB: { total: 0, alreadyGenerated: 0 }
        };

        debtors.forEach(d => {
            if (d.tipoCarta) {
                summary[d.tipoCarta].total++;
                const isDuplicate = records.some(r =>
                    r.propertyId === activePropertyId &&
                    r.unidad === d.unidad &&
                    r.tipo === d.tipoCarta &&
                    r.periodo === d.periodo
                );
                if (isDuplicate) summary[d.tipoCarta].alreadyGenerated++;
            }
        });
        return summary;
    }, [debtors, records, activePropertyId]);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

    const selectedDebtor = useMemo(() => debtors.find(d => d.id === selectedDebtorId), [debtors, selectedDebtorId]);

    const handleBulkGenerate = () => {
        const result: Record<LetterType, number> = { CS: 0, CP: 0, AB: 0 };
        const generatedRecords: any[] = [];
        let total = 0;

        debtors.forEach(d => {
            if (bulkSelections[d.tipoCarta] && activePropertyId) {
                const record = generateLetter({
                    tipo: d.tipoCarta,
                    unidad: d.unidad,
                    propietario: d.propietario,
                    monto: d.totalPagar,
                    propertyId: activePropertyId,
                    periodo: d.periodo,
                    emailDestinatario: d.email
                });

                const template = LETTER_TEMPLATES.find(t => t.id === d.tipoCarta)!;
                const letterData = {
                    NOMBRE_PROPIETARIO: d.propietario,
                    UNIDAD: d.unidad,
                    SALDO_ANTERIOR: formatCurrency(d.saldoAnterior),
                    CUOTA_ACTUAL: formatCurrency(d.cuotaActual),
                    INTERESES_MORA: formatCurrency(d.interesesMora),
                    OTROS: formatCurrency(d.otros),
                    TOTAL_PAGAR: formatCurrency(d.totalPagar),
                    FECHA: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }),
                    FECHA_LIMITE: (() => {
                        const now = new Date();
                        let targetMonth = now.getMonth();
                        let targetYear = now.getFullYear();
                        if (now.getDate() > 22) {
                            targetMonth++;
                            if (targetMonth > 11) { targetMonth = 0; targetYear++; }
                        }
                        return new Date(targetYear, targetMonth, 22).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
                    })(),
                    MES_COBRO: new Date().toLocaleDateString('es-CO', { month: 'long' }).toUpperCase(),
                    TOTAL_LETRAS: numberToWords(d.totalPagar),
                    NOMBRE_CONJUNTO: activeProperty?.name || 'El Conjunto',
                    EMAIL: d.email
                };

                generatedRecords.push({ record, template, data: letterData });
                result[d.tipoCarta]++;
                total++;
            }
        });

        setBulkResult({ total, byType: result, generatedRecords });
    };

    const massExportRef = useRef<HTMLDivElement>(null);

    const handleMassDownload = async () => {
        if (!bulkResult || bulkResult.generatedRecords.length === 0 || !massExportRef.current) {
            console.error('Exportación fallida: Sin datos o contenedor no encontrado');
            return;
        }

        console.log('Iniciando exportación masiva...', bulkResult.generatedRecords.length, 'cartas');
        setIsExporting(true);
        // Initialize with first record immediately
        setExportProgress({ current: 1, total: bulkResult.generatedRecords.length });

        try {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Wait for initial render and DOM update
            await new Promise(resolve => setTimeout(resolve, 1000));

            for (let i = 0; i < bulkResult.generatedRecords.length; i++) {
                const currentRecord = bulkResult.generatedRecords[i];

                // Update state to show current letter
                setExportProgress({ current: i + 1, total: bulkResult.generatedRecords.length });

                // Wait for React to render the new letter in the hidden container
                await new Promise(resolve => setTimeout(resolve, 800));

                if (!massExportRef.current) {
                    throw new Error("Contenedor de exportación no encontrado durante el proceso");
                }

                console.log(`Capturando canvas para ${currentRecord.data.UNIDAD}...`);
                const canvas = await html2canvas(massExportRef.current, {
                    scale: 1.5,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    allowTaint: true,
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.85);
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                const imgX = (pdfWidth - imgWidth * ratio) / 2;
                const imgY = 0;

                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

                console.log(`Página ${i + 1} completada.`);
            }

            const fileName = `Cartas_Cobro_${activeProperty?.name || 'Lote'}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);
            console.log('Exportación finalizada con éxito.');
        } catch (err) {
            console.error('Error crítico en descarga masiva:', err);
            alert('Error en la generación: ' + (err instanceof Error ? err.message : 'Error desconocido'));
        } finally {
            setIsExporting(false);
            setExportProgress(null);
        }
    };

    const closeBulkModal = () => {
        setShowBulkModal(false);
        setBulkResult(null);
        setExportProgress(null);
        setIsExporting(false);
    };

    return (
        <div className="space-y-8 pb-12 min-h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Mail className="w-8 h-8 text-indigo-600" />
                        Cartas de Cobro
                    </h2>
                    <p className="text-gray-500 mt-1 font-medium">Gestión automatizada de notificaciones de mora.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowBulkModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-sm font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200"
                    >
                        <Zap className="w-4 h-4" /> Generar Masivo
                    </button>
                    {bulkResult && (
                        <button
                            disabled={isExporting}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
                        >
                            <Download className="w-4 h-4" />
                            {isExporting ? `Exportando (${exportProgress?.current}/${exportProgress?.total})...` : 'Descargar Todo'}
                        </button>
                    )}
                </div>
            </div>

            {/* Bulk Generation Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-black text-gray-900">Generación Masiva de Cartas</h3>
                            <button onClick={closeBulkModal} className="p-2 hover:bg-gray-100 rounded-xl">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {!bulkResult ? (
                            <>
                                <div className="p-6 space-y-4">
                                    <p className="text-gray-600 text-sm">Selecciona los tipos de carta a generar. Se asignará un consecutivo único a cada carta.</p>

                                    <div className="space-y-3">
                                        {(['CS', 'CP', 'AB'] as LetterType[]).map(tipo => {
                                            const totalForTipo = debtorsSummary[tipo].total;
                                            const alreadyGenerated = debtorsSummary[tipo].alreadyGenerated;
                                            const pending = totalForTipo - alreadyGenerated;

                                            return (
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
                                                            onChange={(e) => setBulkSelections(prev => ({ ...prev, [tipo]: e.target.checked }))}
                                                            className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${tipo === 'CS' ? 'bg-blue-100 text-blue-700' :
                                                                    tipo === 'CP' ? 'bg-orange-100 text-orange-700' :
                                                                        'bg-red-100 text-red-700'
                                                                    }`}>{tipo}</span>
                                                                <span className="font-bold text-gray-800 text-sm">
                                                                    {tipo === 'CS' ? 'Cobro Simple' : tipo === 'CP' ? 'Cobro Persuasivo' : 'Cobro Jurídico'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] text-gray-400 font-medium">Total: {totalForTipo}</span>
                                                                {alreadyGenerated > 0 && (
                                                                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded">
                                                                        {alreadyGenerated} ya generadas
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`text-2xl font-black ${pending === 0 ? 'text-gray-300' : 'text-gray-900'}`}>{pending}</span>
                                                        <span className="text-xs text-gray-400 block">nuevas</span>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    <div className="bg-gray-50 rounded-2xl p-4 mt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 font-medium">Nuevas cartas:</span>
                                            <span className="text-2xl font-black text-indigo-600">
                                                {Object.entries(bulkSelections)
                                                    .filter(([_, selected]) => selected)
                                                    .reduce((sum, [tipo]) => {
                                                        const s = debtorsSummary[tipo as LetterType];
                                                        return sum + (s.total - s.alreadyGenerated);
                                                    }, 0)
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3 justify-end">
                                    <button
                                        onClick={closeBulkModal}
                                        className="px-6 py-3 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleBulkGenerate}
                                        disabled={Object.entries(bulkSelections)
                                            .filter(([_, selected]) => selected)
                                            .reduce((sum, [tipo]) => {
                                                const s = debtorsSummary[tipo as LetterType];
                                                return sum + (s.total - s.alreadyGenerated);
                                            }, 0) === 0}
                                        className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:bg-gray-400 disabled:shadow-none"
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
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${tipo === 'CS' ? 'bg-blue-100 text-blue-700' :
                                                    tipo === 'CP' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>{tipo}</span>
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
                                        onClick={closeBulkModal}
                                        className="px-6 py-3 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                    <button
                                        onClick={handleMassDownload}
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
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
                {/* Delinquent List */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <div className="relative shrink-0">
                        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar moroso..."
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none shadow-sm transition-all text-gray-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex-1 flex flex-col max-h-[600px]">
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Deudores ({filteredDebtors.length})</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {filteredDebtors.map((d) => (
                                <button
                                    key={d.id}
                                    onClick={() => {
                                        setSelectedDebtorId(d.id);
                                        setSelectedTemplateId(d.tipoCarta);
                                    }}
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
                                                    d.tipoCarta === 'CP' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {d.tipoCarta}
                                            </span>
                                        </div>
                                        {(() => {
                                            const lastLetter = records
                                                .filter(r => r.unidad === d.unidad && r.propertyId === activePropertyId)
                                                .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];

                                            return lastLetter ? (
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
                                            );
                                        })()}
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
                            ))}
                            {filteredDebtors.length === 0 && (
                                <div className="text-center py-8 text-gray-400 italic">
                                    No hay deudores que coincidan con la búsqueda.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {selectedDebtorId && selectedDebtor ? (
                        <>
                            {/* Template Selector Tabs */}
                            <div className="flex bg-gray-100/50 p-1 rounded-2xl self-start overflow-x-auto max-w-full">
                                {LETTER_TEMPLATES.map((tmpl) => (
                                    <button
                                        key={tmpl.id}
                                        onClick={() => setSelectedTemplateId(tmpl.id)}
                                        className={`
                                            px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap
                                            ${selectedTemplateId === tmpl.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}
                                        `}
                                    >
                                        {tmpl.id} {tmpl.id === selectedDebtor.tipoCarta && <span className="ml-1 text-[8px] bg-indigo-100 px-1 rounded-full italic">Recomendada</span>}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1">
                                <LetterPreview
                                    template={LETTER_TEMPLATES.find(t => t.id === selectedTemplateId) || LETTER_TEMPLATES[1]}
                                    data={{
                                        NOMBRE_PROPIETARIO: selectedDebtor.propietario,
                                        UNIDAD: selectedDebtor.unidad,
                                        SALDO_ANTERIOR: formatCurrency(selectedDebtor.saldoAnterior),
                                        CUOTA_ACTUAL: formatCurrency(selectedDebtor.cuotaActual),
                                        INTERESES_MORA: formatCurrency(selectedDebtor.interesesMora),
                                        OTROS: formatCurrency(selectedDebtor.otros),
                                        TOTAL_PAGAR: formatCurrency(selectedDebtor.totalPagar),
                                        FECHA: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }),
                                        FECHA_LIMITE: (() => {
                                            const now = new Date();
                                            let targetMonth = now.getMonth();
                                            let targetYear = now.getFullYear();

                                            // If today is past the 22nd, target the 22nd of NEXT month
                                            if (now.getDate() > 22) {
                                                targetMonth++;
                                                if (targetMonth > 11) {
                                                    targetMonth = 0;
                                                    targetYear++;
                                                }
                                            }

                                            const limitDate = new Date(targetYear, targetMonth, 22);
                                            return limitDate.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
                                        })(),
                                        MES_COBRO: new Date().toLocaleDateString('es-CO', { month: 'long' }).toUpperCase(),
                                        TOTAL_LETRAS: numberToWords(selectedDebtor.totalPagar),
                                        NOMBRE_CONJUNTO: activeProperty?.name || 'El Conjunto',
                                        EMAIL: selectedDebtor.email
                                    }}
                                    montoNumerico={selectedDebtor.totalPagar}
                                    periodo={selectedDebtor.periodo}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-[40px] border-2 border-dashed border-gray-100 text-center space-y-6">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center animate-pulse">
                                <Mail className="w-10 h-10 text-gray-200" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-300 italic uppercase">Generador de Comunicaciones</h3>
                                <p className="text-gray-400 text-sm max-w-sm mx-auto mt-2 font-medium">Selecciona un deudor del listado lateral para generar automáticamente su carta de cobro personalizada.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Hidden container for mass export rendering - positioned far off-screen but visible to the engine */}
            <div
                id="bulk-export-container"
                ref={massExportRef}
                className="fixed top-[-20000px] left-0 w-[21cm] bg-white"
                style={{ visibility: 'visible', opacity: 1 }}
            >
                {bulkResult && bulkResult.generatedRecords.length > 0 && (
                    <LetterDocument
                        template={exportProgress ? bulkResult.generatedRecords[exportProgress.current - 1]?.template : bulkResult.generatedRecords[0].template}
                        data={exportProgress ? bulkResult.generatedRecords[exportProgress.current - 1]?.data : bulkResult.generatedRecords[0].data}
                        consecutivo={exportProgress ? bulkResult.generatedRecords[exportProgress.current - 1]?.record.consecutivo : bulkResult.generatedRecords[0].record.consecutivo}
                        isGenerated={true}
                    />
                )}
            </div>
        </div>
    );
};
