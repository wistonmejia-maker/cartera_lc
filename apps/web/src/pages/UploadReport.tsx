import { useState, useRef, useMemo } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, ArrowRight, Trash2, Calendar, History, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { read, utils, writeFile } from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { useDebtorStore } from '../stores/useDebtorStore';
import { usePropertyStore } from '../stores/usePropertyStore';
import type { Debtor } from '../stores/useDebtorStore';
import type { LetterType } from '../utils/letterTemplates';


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

export const UploadReportPage = () => {
    const navigate = useNavigate();
    const { setDebtors, reports, hasReport, switchToPeriod, deleteReport, currentPeriodo } = useDebtorStore();
    const { activePropertyId } = usePropertyStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<Debtor[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Period selection
    const currentYear = new Date().getFullYear();
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    // Comparison view
    const [showComparison, setShowComparison] = useState(false);
    const [comparePeriod1, setComparePeriod1] = useState<string | null>(null);
    const [comparePeriod2, setComparePeriod2] = useState<string | null>(null);

    const selectedPeriodo = `${selectedYear}-${selectedMonth}`;
    const selectedPeriodoLabel = `${MONTHS.find(m => m.value === selectedMonth)?.label} ${selectedYear}`;
    const propertyId = activePropertyId || 'default';
    const periodAlreadyExists = hasReport(selectedPeriodo, propertyId);

    const filteredReports = useMemo(() => {
        return reports.filter(r => r.propertyId === propertyId);
    }, [reports, propertyId]);

    const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.name.endsWith('.xlsx')) {
            setFile(droppedFile);
            processFile(droppedFile);
        } else {
            setError('Por favor sube un archivo Excel válido (.xlsx)');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            processFile(selectedFile);
        }
    };

    const parseCurrency = (val: string | number): number => {
        if (typeof val === 'number') return val;
        if (!val) return 0;

        let cleaned = val.toString().trim();

        // If it has both dot and comma, assume dot is thousands and comma is decimal (Spanish format)
        if (cleaned.includes('.') && cleaned.includes(',')) {
            return Number(cleaned.replace(/[.\s$]/g, '').replace(',', '.')) || 0;
        }

        // If it only has a comma, and it looks like a decimal (e.g. 12,34)
        if (cleaned.includes(',') && !cleaned.includes('.')) {
            return Number(cleaned.replace(/[$\s]/g, '').replace(',', '.')) || 0;
        }

        // If it only has a dot, and it looks like a decimal (e.g. 12.34 or 1.234)
        // This is tricky. Usually, in financial Excel, 2 decimals are common.
        // If the dot is followed by 3 digits at the end, it might be a thousand separator.
        // But if it's followed by 2, it's definitely a decimal.
        if (cleaned.includes('.') && !cleaned.includes(',')) {
            const parts = cleaned.split('.');
            if (parts[parts.length - 1].length === 3) {
                // Likely thousands separator: 1.234
                return Number(cleaned.replace(/[.\s$]/g, '')) || 0;
            } else {
                // Likely decimal: 12.34
                return Number(cleaned.replace(/[$\s]/g, '')) || 0;
            }
        }

        return Number(cleaned.replace(/[$\s.,]/g, '')) || 0;
    };

    const processFile = async (file: File) => {
        setIsProcessing(true);
        setError(null);

        try {
            const buffer = await file.arrayBuffer();
            const workbook = read(buffer);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // Get raw JSON to analyze headers
            const rawData = utils.sheet_to_json<any>(sheet);
            if (rawData.length === 0) {
                setError('El archivo está vacío.');
                setIsProcessing(false);
                return;
            }

            // Normalization mapping
            const COLUMN_MAP: Record<string, string[]> = {
                'LOCAL/OFI': ['LOCAL', 'OFI', 'UNIDAD', 'APTO', 'CASA', 'OFICINA', 'NUMERO', 'IDENTIFICADOR'],
                'PROPIETARIO': ['NOMBRE', 'RESIDENTE', 'CLIENTE', 'HABITANTE', 'TITULAR'],
                'SALDO ANTERIOR': ['SALDO ANT', 'DEUDA ANTERIOR', 'SALDO_ANTERIOR', 'ANTERIOR'],
                'CUOTA ACTUAL': ['CUOTA', 'ADMINISTRACION', 'MES ACTUAL', 'CUOTA_ACTUAL'],
                'INTERESES DE MORA': ['INTERESES', 'MORA', 'INT MORA', 'INTERES'],
                'OTROS': ['OTROS CONCEPTOS', 'AJUSTES', 'VARIOUS'],
                'TOTAL A PAGAR': ['TOTAL', 'NETO', 'A PAGAR', 'TOTAL_PAGAR', 'VALOR TOTAL'],
                'EDAD VENCIDA': ['EDAD', 'MESES MORA', 'MESES VENCIDOS', 'DIAS MORA'],
                'ESTADO REAL': ['ESTADO', 'ESTATUS', 'SITUACION'],
                'TIPO DE CARTA': ['TIPO', 'PLANTILLA', 'CARTA'],
                'EMAIL': ['CORREO', 'E-MAIL', 'MAIL'],
                'MOVIL': ['TELEFONO', 'CELULAR', 'WHATSAPP', 'MOBILE']
            };

            const findKey = (row: any, internalKey: string): string | undefined => {
                const keys = Object.keys(row);
                const normalize = (s: string) => s.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');

                // 1. Try exact normalized match
                const internalNorm = normalize(internalKey);
                const exactMatch = keys.find(k => normalize(k) === internalNorm);
                if (exactMatch) return exactMatch;

                // 2. Try synonyms
                const synonyms = COLUMN_MAP[internalKey] || [];
                for (const syn of synonyms) {
                    const synNorm = normalize(syn);
                    const synMatch = keys.find(k => normalize(k) === synNorm);
                    if (synMatch) return synMatch;
                }

                // 3. Try partial matches for critical fields
                if (internalKey === 'LOCAL/OFI') return keys.find(k => normalize(k).includes('LOCAL') || normalize(k).includes('UNIDAD'));
                if (internalKey === 'PROPIETARIO') return keys.find(k => normalize(k).includes('PROPIET') || normalize(k).includes('NOMBRE'));

                return undefined;
            };

            const mappedData = rawData
                .map((row) => {
                    const kUnidad = findKey(row, 'LOCAL/OFI');
                    const kPropietario = findKey(row, 'PROPIETARIO');

                    if (!kUnidad || !kPropietario || !row[kUnidad]) return null;

                    const kSaldoAnt = findKey(row, 'SALDO ANTERIOR');
                    const kCuota = findKey(row, 'CUOTA ACTUAL');
                    const kInteres = findKey(row, 'INTERESES DE MORA');
                    const kOtros = findKey(row, 'OTROS');
                    const kTotal = findKey(row, 'TOTAL A PAGAR');
                    const kEdad = findKey(row, 'EDAD VENCIDA');
                    const kEstado = findKey(row, 'ESTADO REAL');
                    const kTipo = findKey(row, 'TIPO DE CARTA');
                    const kEmail = findKey(row, 'EMAIL');
                    const kMovil = findKey(row, 'MOVIL');

                    const edadV = Number(row[kEdad || '']) || 0;
                    let suggestedTipo: LetterType = 'CS';
                    let etapaLegal: 'Preventiva' | 'Persuasiva' | 'Jurídica' = 'Preventiva';

                    if (edadV > 2) {
                        suggestedTipo = 'AB';
                        etapaLegal = 'Jurídica';
                    } else if (edadV >= 1) {
                        suggestedTipo = 'CP';
                        etapaLegal = 'Persuasiva';
                    } else {
                        suggestedTipo = 'CS';
                        etapaLegal = 'Preventiva';
                    }

                    const tipoCartaExcel = row[kTipo || '']?.toString().toUpperCase();
                    const tipoCarta: LetterType = ['CS', 'CP', 'AB'].includes(tipoCartaExcel || '')
                        ? (tipoCartaExcel as LetterType)
                        : suggestedTipo;

                    const debtor: Debtor = {
                        id: `${propertyId}-${row[kUnidad]?.toString()}`,
                        unidad: row[kUnidad]?.toString() || '',
                        propietario: row[kPropietario || '']?.toString() || '',
                        saldoAnterior: parseCurrency(row[kSaldoAnt || '']),
                        cuotaActual: parseCurrency(row[kCuota || '']),
                        interesesMora: parseCurrency(row[kInteres || '']),
                        otros: parseCurrency(row[kOtros || '']),
                        totalPagar: parseCurrency(row[kTotal || '']),
                        edadVencida: edadV,
                        estadoReal: row[kEstado || ''] || '',
                        tipoCarta,
                        etapaLegal,
                        email: row[kEmail || ''],
                        movil: row[kMovil || ''],
                        fechaCarga: new Date().toISOString(),
                        periodo: selectedPeriodo
                    };
                    return debtor;
                })
                .filter((d): d is Debtor => d !== null);

            if (mappedData.length === 0) {
                setError('No se encontraron columnas de Unidad y Propietario. Verifica los encabezados de tu Excel.');
            } else {
                setParsedData(mappedData);
            }
        } catch (err) {
            console.error(err);
            setError('Error al procesar el archivo. Revisa que el formato sea correcto.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirm = async () => {
        if (parsedData.length > 0 && activePropertyId) {
            try {
                await setDebtors(parsedData, selectedPeriodo, selectedPeriodoLabel, activePropertyId);
                navigate('/letters');
            } catch (error) {
                console.error('Error saving report:', error);
                alert('Error al guardar el reporte. Por favor intenta de nuevo.');
            }
        }
    };

    const handleDownloadTemplate = () => {
        const templateData = [
            {
                'LOCAL/OFI': 'L101',
                'PROPIETARIO': 'JUAN PEREZ',
                'SALDO ANTERIOR': 500000,
                'CUOTA ACTUAL': 200000,
                'INTERESES DE MORA': 5000,
                'OTROS': 0,
                'TOTAL A PAGAR': 705000,
                'EDAD VENCIDA': 1,
                'ESTADO REAL': 'Mora Baja',
                'TIPO DE CARTA': 'CS',
                'EMAIL': 'juan@ejemplo.com',
                'MOVIL': '3001234567'
            }
        ];

        const ws = utils.json_to_sheet(templateData);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, 'Plantilla');
        writeFile(wb, 'Plantilla_Reporte_Cartera.xlsx');
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Comparison logic
    const comparisonData = useMemo(() => {
        if (!comparePeriod1 || !comparePeriod2) return null;

        const report1 = reports.find(r => r.periodo === comparePeriod1);
        const report2 = reports.find(r => r.periodo === comparePeriod2);

        if (!report1 || !report2) return null;

        // Find units in both reports
        const allUnits = new Set([
            ...report1.debtors.map(d => d.unidad),
            ...report2.debtors.map(d => d.unidad)
        ]);

        const comparison = Array.from(allUnits).map(unidad => {
            const debtor1 = report1.debtors.find(d => d.unidad === unidad);
            const debtor2 = report2.debtors.find(d => d.unidad === unidad);

            const total1 = debtor1?.totalPagar || 0;
            const total2 = debtor2?.totalPagar || 0;
            const diff = total2 - total1;
            const percentChange = total1 > 0 ? ((diff / total1) * 100) : (total2 > 0 ? 100 : 0);

            return {
                unidad,
                propietario: debtor2?.propietario || debtor1?.propietario || '',
                periodo1Total: total1,
                periodo2Total: total2,
                diff,
                percentChange,
                status: diff > 0 ? 'increased' : diff < 0 ? 'decreased' : 'same',
                isNew: !debtor1,
                isResolved: !debtor2 && !!debtor1,
            };
        }).sort((a, b) => b.diff - a.diff);

        return {
            report1,
            report2,
            comparison,
            summary: {
                totalChange: report2.totalCartera - report1.totalCartera,
                debtorChange: report2.totalDeudores - report1.totalDeudores,
                increased: comparison.filter(c => c.status === 'increased').length,
                decreased: comparison.filter(c => c.status === 'decreased').length,
                same: comparison.filter(c => c.status === 'same').length,
                newDebtors: comparison.filter(c => c.isNew).length,
                resolved: comparison.filter(c => c.isResolved).length,
            }
        };
    }, [comparePeriod1, comparePeriod2, reports]);

    return (
        <div className="space-y-8 pb-12 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Upload className="w-8 h-8 text-indigo-600" />
                        Cargar Reporte de Cartera
                    </h2>
                    <p className="text-gray-500 mt-1 font-medium">Gestiona los reportes mensuales de cartera.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownloadTemplate}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all"
                    >
                        <FileSpreadsheet className="w-4 h-4" /> Descargar Plantilla
                    </button>
                    {filteredReports.length > 1 && (
                        <button
                            onClick={() => setShowComparison(!showComparison)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${showComparison ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <TrendingUp className="w-4 h-4" /> Comparar Períodos
                        </button>
                    )}
                </div>
            </div>

            {/* Comparison View */}
            {showComparison && filteredReports.length > 1 && (
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl p-8 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-indigo-600" />
                        Comparación Mes a Mes
                    </h3>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Período Base</label>
                            <select
                                value={comparePeriod1 || ''}
                                onChange={(e) => setComparePeriod1(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                            >
                                <option value="">Seleccionar...</option>
                                {filteredReports.map(r => (
                                    <option key={r.periodo} value={r.periodo}>{r.periodoLabel}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Período Comparar</label>
                            <select
                                value={comparePeriod2 || ''}
                                onChange={(e) => setComparePeriod2(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                            >
                                <option value="">Seleccionar...</option>
                                {filteredReports.filter(r => r.periodo !== comparePeriod1).map(r => (
                                    <option key={r.periodo} value={r.periodo}>{r.periodoLabel}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {comparisonData && (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-4 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                                    <div className={`text-2xl font-black ${comparisonData.summary.totalChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {comparisonData.summary.totalChange >= 0 ? '+' : ''}{formatCurrency(comparisonData.summary.totalChange)}
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium">Cambio en Cartera</div>
                                </div>
                                <div className="bg-red-50 rounded-2xl p-4 text-center">
                                    <div className="text-2xl font-black text-red-600">{comparisonData.summary.increased}</div>
                                    <div className="text-xs text-gray-500 font-medium">Aumentaron Deuda</div>
                                </div>
                                <div className="bg-green-50 rounded-2xl p-4 text-center">
                                    <div className="text-2xl font-black text-green-600">{comparisonData.summary.decreased}</div>
                                    <div className="text-xs text-gray-500 font-medium">Disminuyeron Deuda</div>
                                </div>
                                <div className="bg-blue-50 rounded-2xl p-4 text-center">
                                    <div className="text-2xl font-black text-blue-600">{comparisonData.summary.resolved}</div>
                                    <div className="text-xs text-gray-500 font-medium">Salieron de Mora</div>
                                </div>
                            </div>

                            {/* Comparison Table */}
                            <div className="max-h-[400px] overflow-y-auto border border-gray-100 rounded-2xl">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase">Unidad</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase">Propietario</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-400 uppercase">{comparisonData.report1.periodoLabel}</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-400 uppercase">{comparisonData.report2.periodoLabel}</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-400 uppercase">Diferencia</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {comparisonData.comparison.map((row) => (
                                            <tr key={row.unidad} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-3 font-bold text-gray-900">{row.unidad}</td>
                                                <td className="px-4 py-3 text-gray-600 text-xs">{row.propietario}</td>
                                                <td className="px-4 py-3 text-right font-mono text-gray-600">
                                                    {row.isNew ? <span className="text-gray-300">—</span> : formatCurrency(row.periodo1Total)}
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-gray-800">
                                                    {row.isResolved ? <span className="text-green-600 font-bold">✓ AL DÍA</span> : formatCurrency(row.periodo2Total)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={`inline-flex items-center gap-1 font-bold ${row.diff > 0 ? 'text-red-600' : row.diff < 0 ? 'text-green-600' : 'text-gray-400'
                                                        }`}>
                                                        {row.diff > 0 ? <TrendingUp className="w-3 h-3" /> : row.diff < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                                        {row.diff !== 0 ? formatCurrency(Math.abs(row.diff)) : '—'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Report History */}
            {filteredReports.length > 0 && (
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            <History className="w-5 h-5 text-indigo-600" />
                            Historial de Reportes
                        </h3>
                        <span className="text-xs font-bold text-gray-400">{filteredReports.length} reportes cargados</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {filteredReports.map((report) => (
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
                                        {currentPeriodo !== report.periodo && (
                                            <button
                                                onClick={() => switchToPeriod(report.periodo)}
                                                className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-200 transition-colors"
                                            >
                                                Activar
                                            </button>
                                        )}
                                        {currentPeriodo === report.periodo && (
                                            <span className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">
                                                Activo
                                            </span>
                                        )}
                                        <button
                                            onClick={() => deleteReport(report.periodo)}
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
            )}

            {/* Period Selector + Upload Area */}
            {!parsedData.length ? (
                <div className="space-y-6">
                    {/* Period Selector */}
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
                                    onChange={(e) => setSelectedMonth(e.target.value)}
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
                                    onChange={(e) => setSelectedYear(e.target.value)}
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
                                Ya existe un reporte para {selectedPeriodoLabel}. Si continúas, se reemplazará.
                            </div>
                        )}
                    </div>

                    {/* Upload Area */}
                    <div
                        className={`
                            border-3 border-dashed rounded-[32px] p-12 text-center transition-all duration-300
                            flex flex-col items-center justify-center min-h-[300px] cursor-pointer
                            ${isDragging ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50'}
                            ${error ? 'border-red-300 bg-red-50/30' : ''}
                        `}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx"
                            className="hidden"
                            onChange={handleFileSelect}
                        />

                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                            {isProcessing ? (
                                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            ) : error ? (
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            ) : (
                                <FileSpreadsheet className="w-8 h-8 text-indigo-600" />
                            )}
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {isProcessing ? 'Procesando...' : !activePropertyId ? 'Selecciona un Conjunto primero' : `Cargar reporte de ${selectedPeriodoLabel}`}
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Arrastra tu Excel aquí o haz click para buscar
                        </p>

                        {error && (
                            <div className="mt-4 bg-red-100 text-red-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Preview Table */
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                                <FileSpreadsheet className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 text-lg">{file?.name}</h3>
                                <div className="flex gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> {parsedData.length} registros</span>
                                    <span className="font-bold text-indigo-600">{selectedPeriodoLabel}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => { setParsedData([]); setFile(null); }}
                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>

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
                                    {parsedData.slice(0, 50).map((row, i) => (
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
                                                    <div className={`w-2 h-2 rounded-full ${row.etapaLegal === 'Jurídica' ? 'bg-red-500' : row.etapaLegal === 'Persuasiva' ? 'bg-orange-500' : 'bg-emerald-500'}`} />
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

                    <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                            {periodAlreadyExists && (
                                <span className="text-amber-600 font-bold flex items-center gap-1">
                                    <AlertTriangle className="w-4 h-4" /> Reemplazará el reporte existente
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleConfirm}
                            disabled={!activePropertyId}
                            className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl text-base font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-200"
                        >
                            Confirmar {selectedPeriodoLabel} <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
