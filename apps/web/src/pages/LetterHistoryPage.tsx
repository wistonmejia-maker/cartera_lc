import { useState, useMemo, useRef } from 'react';
import { History, Search, Filter, FileText, Mail, Trash2, CheckCircle2, Clock, Send, MessageSquare, X, Calendar, Download } from 'lucide-react';
import { useLetterHistoryStore } from '../stores/useLetterHistoryStore';
import type { LetterType } from '../utils/letterTemplates';
import type { LetterStatus, LetterRecord } from '../stores/useLetterHistoryStore';
import { usePropertyStore } from '../stores/usePropertyStore';
import { useDebtorStore } from '../stores/useDebtorStore';
import { LETTER_TEMPLATES } from '../utils/letterTemplates';
import { LetterDocument } from '../components/letters/LetterDocument';
import { numberToWords } from '../utils/numberToWords';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { EmptyState, NoSearchResultsEmptyState } from '../components/ui/EmptyState';

export const LetterHistoryPage = () => {
    const { records, counters, updateLetterStatus, deleteRecord, resetPropertyHistory } = useLetterHistoryStore();
    const { activePropertyId, properties } = usePropertyStore();
    const { reports } = useDebtorStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<LetterType | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<LetterStatus | 'all'>('all');
    const [filterPeriod, setFilterPeriod] = useState<string | 'all'>('all');
    const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

    // PDF Export State
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null);
    const massExportRef = useRef<HTMLDivElement>(null);
    const [recordToExport, setRecordToExport] = useState<LetterRecord | null>(null);

    const activeProperty = useMemo(() => properties.find(p => p.id === activePropertyId), [properties, activePropertyId]);
    const selectedRecord = useMemo(() => records.find(r => r.id === selectedRecordId), [records, selectedRecordId]);

    // Get property-specific counters
    const activeCounters = useMemo(() =>
        (activePropertyId && counters[activePropertyId]) || { CS: 0, CP: 0, AB: 0 },
        [counters, activePropertyId]);

    const periods = useMemo(() => {
        const uniquePeriods = Array.from(new Set(records
            .filter(r => r.propertyId === activePropertyId)
            .map(r => r.periodo)
            .filter(Boolean)));
        return uniquePeriods.sort((a, b) => b.localeCompare(a));
    }, [records, activePropertyId]);

    const filteredRecords = useMemo(() => {
        return records.filter(r => {
            const matchesProperty = r.propertyId === activePropertyId;
            const matchesSearch =
                r.consecutivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.unidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.propietario.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || r.tipo === filterType;
            const matchesStatus = filterStatus === 'all' || r.estado === filterStatus;
            const matchesPeriod = filterPeriod === 'all' || r.periodo === filterPeriod;
            return matchesProperty && matchesSearch && matchesType && matchesStatus && matchesPeriod;
        });
    }, [records, searchTerm, filterType, filterStatus, filterPeriod, activePropertyId]);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

    const formatCurrencyRaw = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

    // PDF Generation Logic
    const prepareLetterData = (record: LetterRecord) => {
        const template = LETTER_TEMPLATES.find(t => t.id === record.tipo)!;

        // Try to find the original debtor for full data
        const report = reports.find(r => r.periodo === record.periodo && r.propertyId === record.propertyId);
        const debtor = report?.debtors.find(d => d.unidad === record.unidad);

        const data = {
            NOMBRE_PROPIETARIO: record.propietario,
            UNIDAD: record.unidad,
            SALDO_ANTERIOR: debtor ? formatCurrencyRaw(debtor.saldoAnterior) : 'Ver historial',
            CUOTA_ACTUAL: debtor ? formatCurrencyRaw(debtor.cuotaActual) : 'Ver historial',
            INTERESES_MORA: debtor ? formatCurrencyRaw(debtor.interesesMora) : 'Ver historial',
            OTROS: debtor ? formatCurrencyRaw(debtor.otros) : 'Ver historial',
            TOTAL_PAGAR: formatCurrencyRaw(record.monto),
            FECHA: formatDate(record.fecha),
            FECHA_LIMITE: 'Inmediato',
            MES_COBRO: record.periodo || '-',
            TOTAL_LETRAS: numberToWords(record.monto),
            NOMBRE_CONJUNTO: activeProperty?.name || '',
            EMAIL: record.emailDestinatario
        };

        return { template, data };
    };

    const handleDownloadSingle = async (record: LetterRecord) => {
        setIsExporting(true);
        setExportProgress({ current: 1, total: 1 });
        setRecordToExport(record);

        try {
            await new Promise(resolve => setTimeout(resolve, 800)); // Wait for render

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            if (massExportRef.current) {
                const canvas = await html2canvas(massExportRef.current, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff'
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                const imgX = (pdfWidth - imgWidth * ratio) / 2;
                const imgY = 0;

                pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
                pdf.save(`Carta_${record.consecutivo}_${record.unidad}.pdf`);
            }
        } catch (err) {
            console.error(err);
            alert('Error al generar PDF');
        } finally {
            setIsExporting(false);
            setExportProgress(null);
            setRecordToExport(null);
        }
    };

    const handleBulkDownload = async () => {
        if (filteredRecords.length === 0) return;

        setIsExporting(true);
        setExportProgress({ current: 0, total: filteredRecords.length });

        try {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            for (let i = 0; i < filteredRecords.length; i++) {
                const record = filteredRecords[i];
                setRecordToExport(record);
                setExportProgress({ current: i + 1, total: filteredRecords.length });

                // Allow React to render the hidden component
                await new Promise(resolve => setTimeout(resolve, 1200));

                if (massExportRef.current) {
                    const canvas = await html2canvas(massExportRef.current, {
                        scale: 1.5,
                        useCORS: true,
                        backgroundColor: '#ffffff'
                    });

                    const imgData = canvas.toDataURL('image/jpeg', 0.85);
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    const imgWidth = canvas.width;
                    const imgHeight = canvas.height;
                    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                    const imgX = (pdfWidth - imgWidth * ratio) / 2;
                    const imgY = 0;

                    if (i > 0) pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
                }
            }

            pdf.save(`Lote_Cartas_Historial_${new Date().getTime()}.pdf`);
        } catch (err) {
            console.error(err);
            alert('Error en descarga masiva');
        } finally {
            setIsExporting(false);
            setExportProgress(null);
            setRecordToExport(null);
        }
    };

    const getStatusIcon = (estado: LetterStatus) => {
        switch (estado) {
            case 'generada': return <Clock className="w-4 h-4 text-amber-500" />;
            case 'enviada': return <Send className="w-4 h-4 text-blue-500" />;
            case 'entregada': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
        }
    };

    const getStatusBadgeClass = (estado: LetterStatus) => {
        switch (estado) {
            case 'generada': return 'bg-amber-100 text-amber-700';
            case 'enviada': return 'bg-blue-100 text-blue-700';
            case 'entregada': return 'bg-emerald-100 text-emerald-700';
        }
    };

    const getTypeBadgeClass = (tipo: LetterType) => {
        switch (tipo) {
            case 'CS': return 'bg-blue-100 text-blue-700';
            case 'CP': return 'bg-orange-100 text-orange-700';
            case 'AB': return 'bg-red-100 text-red-700';
        }
    };

    const FollowUpModal = () => {
        const { updateLetterFollowUp, updateLetterStatus } = useLetterHistoryStore();
        const [notes, setNotes] = useState(selectedRecord?.notes || '');
        const [commitment, setCommitment] = useState(selectedRecord?.compromisoPago || '');
        const [status, setStatus] = useState<LetterStatus>(selectedRecord?.estado || 'generada');

        if (!selectedRecord) return null;

        const handleSave = () => {
            updateLetterFollowUp(selectedRecord.id, notes, commitment);
            updateLetterStatus(selectedRecord.id, status);
            setSelectedRecordId(null);
        };

        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h3 className="text-xl font-black text-gray-900">Seguimiento de Comunicación</h3>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                                {selectedRecord.consecutivo} • {selectedRecord.unidad}
                            </p>
                        </div>
                        <button onClick={() => setSelectedRecordId(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Status Toggle */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Estado de Entrega</label>
                            <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-2xl">
                                {(['generada', 'enviada', 'entregada'] as LetterStatus[]).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setStatus(s)}
                                        className={`
                                            py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                            ${status === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}
                                        `}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Commitment */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Compromiso de Pago</label>
                            <div className="relative">
                                <Calendar className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                                <input
                                    type="text"
                                    placeholder="Ej: Paga el 15 de Febrero"
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                    value={commitment}
                                    onChange={(e) => setCommitment(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Notas de Seguimiento</label>
                            <textarea
                                placeholder="Escribe detalles sobre la entrega o conversación..."
                                rows={4}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3 justify-end">
                        <button
                            onClick={() => setSelectedRecordId(null)}
                            className="px-6 py-3 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                        >
                            Guardar Seguimiento
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const [isConfirmingReset, setIsConfirmingReset] = useState(false);

    return (
        <div className="space-y-8 pb-20">
            {/* Hidden export container */}
            <div className="fixed left-[-9999px] top-[-9999px] overflow-hidden" style={{ width: '21cm' }}>
                <div ref={massExportRef}>
                    {recordToExport && (
                        <LetterDocument
                            {...prepareLetterData(recordToExport)}
                            consecutivo={recordToExport.consecutivo}
                            isGenerated={true}
                        />
                    )}
                </div>
            </div>

            {/* Export Overlay */}
            {isExporting && (
                <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center text-white">
                    <div className="bg-white/10 p-12 rounded-[48px] border border-white/20 flex flex-col items-center max-w-md w-full mx-4 shadow-2xl">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                            <Download className="w-10 h-10 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-black mb-2 text-center">Re-generando Documentos</h3>
                        <p className="text-indigo-200 font-bold text-center mb-8 uppercase tracking-widest text-xs">Recuperando desde el historial...</p>

                        {exportProgress && (
                            <div className="w-full space-y-4">
                                <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/10">
                                    <div
                                        className="h-full bg-indigo-500 transition-all duration-300"
                                        style={{ width: `${(exportProgress.current / exportProgress.total) * 100}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs font-black uppercase tracking-wider text-indigo-300">
                                    <span>Carta {exportProgress.current} de {exportProgress.total}</span>
                                    <span>{Math.round((exportProgress.current / exportProgress.total) * 100)}%</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <History className="w-8 h-8 text-indigo-600" />
                        Historial de Cartas
                    </h2>
                    <p className="text-gray-500 mt-1 font-medium">Seguimiento y auditoría de comunicaciones generadas.</p>
                </div>
                <div className="flex gap-2">
                    {filteredRecords.length > 0 && (
                        <button
                            onClick={handleBulkDownload}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                        >
                            <Download className="w-4 h-4" />
                            Descargar Filtrados ({filteredRecords.length})
                        </button>
                    )}
                    {!isConfirmingReset ? (
                        <button
                            onClick={() => setIsConfirmingReset(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-sm font-bold hover:bg-red-100 transition-all shadow-sm border border-red-100"
                        >
                            <Trash2 className="w-4 h-4" /> Reiniciar Historial
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-300">
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">¿Estás seguro?</span>
                            <button
                                onClick={() => {
                                    if (activePropertyId) {
                                        resetPropertyHistory(activePropertyId);
                                        setIsConfirmingReset(false);
                                    }
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all shadow-md"
                            >
                                Sí, borrar
                            </button>
                            <button
                                onClick={() => setIsConfirmingReset(false)}
                                className="p-2 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cobro Simple</div>
                    <div className="text-2xl font-black text-blue-600">{activeCounters.CS}</div>
                    <div className="text-xs text-gray-500">cartas CS</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cobro Persuasivo</div>
                    <div className="text-2xl font-black text-orange-600">{activeCounters.CP}</div>
                    <div className="text-xs text-gray-500">cartas CP</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cobro Jurídico</div>
                    <div className="text-2xl font-black text-red-600">{activeCounters.AB}</div>
                    <div className="text-xs text-gray-500">cartas AB</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total</div>
                    <div className="text-2xl font-black text-indigo-600">{filteredRecords.length}</div>
                    <div className="text-xs text-gray-500">cartas generadas</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Buscar por consecutivo, unidad o propietario..."
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none shadow-sm transition-all text-gray-700 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as LetterType | 'all')}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium"
                    >
                        <option value="all">Todos los tipos</option>
                        <option value="CS">CS - Cobro Simple</option>
                        <option value="CP">CP - Cobro Persuasivo</option>
                        <option value="AB">AB - Cobro Jurídico</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as LetterStatus | 'all')}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="generada">Generada</option>
                        <option value="enviada">Enviada</option>
                        <option value="entregada">Entregada</option>
                    </select>

                    <select
                        value={filterPeriod}
                        onChange={(e) => setFilterPeriod(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium"
                    >
                        <option value="all">Todos los períodos</option>
                        {periods.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Modal */}
            {selectedRecordId && <FollowUpModal />}

            {/* Table */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="text-left py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Consecutivo</th>
                                <th className="text-left py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</th>
                                <th className="text-left py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Periodo</th>
                                <th className="text-left py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Unidad</th>
                                <th className="text-left py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Propietario</th>
                                <th className="text-right py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Monto</th>
                                <th className="text-center py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                                <th className="text-center py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={8}>
                                        {searchTerm ? (
                                            <NoSearchResultsEmptyState searchTerm={searchTerm} />
                                        ) : (
                                            <EmptyState
                                                icon={FileText}
                                                title="No hay cartas registradas"
                                                description="Las cartas generadas aparecerán aquí para seguimiento."
                                                variant="default"
                                            />
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50/30 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${getTypeBadgeClass(record.tipo)}`}>
                                                    {record.tipo}
                                                </span>
                                                <span className="font-mono font-bold text-gray-900">{record.consecutivo}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600 font-medium">{formatDate(record.fecha)}</td>
                                        <td className="py-4 px-6 text-xs text-gray-400 font-bold font-mono uppercase italic">{record.periodo || '—'}</td>
                                        <td className="py-4 px-6 font-black text-gray-900">{record.unidad}</td>
                                        <td className="py-4 px-6 text-sm text-gray-600 font-medium max-w-[200px] truncate">{record.propietario}</td>
                                        <td className="py-4 px-6 text-right font-mono font-bold text-gray-900 tracking-tighter">{formatCurrency(record.monto)}</td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusBadgeClass(record.estado)}`}>
                                                    {getStatusIcon(record.estado)}
                                                    {record.estado}
                                                </span>
                                                {(record.notas || record.compromisoPago) && (
                                                    <div className="flex gap-1 mt-1">
                                                        {record.notas && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-100" title="Tiene notas" />}
                                                        {record.compromisoPago && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-100" title="Tiene compromiso de pago" />}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDownloadSingle(record)}
                                                    className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                                                    title="Re-descargar PDF"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => updateLetterStatus(record.id, 'enviada', 'email')}
                                                    className="p-2.5 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-xl transition-all"
                                                    title="Marcar como enviada por Email"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setSelectedRecordId(record.id)}
                                                    className="p-2.5 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-xl transition-all"
                                                    title="Notas y Compromisos"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteRecord(record.id)}
                                                    className="p-2.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                                                    title="Eliminar registro"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
