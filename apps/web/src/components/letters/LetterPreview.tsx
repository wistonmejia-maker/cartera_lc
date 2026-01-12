import { useState, useRef, useMemo } from 'react';
import type { LetterTemplate, LetterType } from '../../utils/letterTemplates';
import { Mail, Download, Printer, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { useLetterHistoryStore } from '../../stores/useLetterHistoryStore';
import { usePropertyStore } from '../../stores/usePropertyStore';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { LetterDocument } from './LetterDocument';

interface LetterPreviewProps {
    template: LetterTemplate;
    data: {
        NOMBRE_PROPIETARIO: string;
        UNIDAD: string;
        SALDO_ANTERIOR: string;
        CUOTA_ACTUAL: string;
        INTERESES_MORA: string;
        OTROS: string;
        TOTAL_PAGAR: string;
        FECHA: string;
        FECHA_LIMITE: string;
        MES_COBRO: string;
        TOTAL_LETRAS: string;
        NOMBRE_CONJUNTO: string;
        EMAIL?: string;
    };
    montoNumerico: number;
    periodo: string;
}

export const LetterPreview = ({ template, data, montoNumerico, periodo }: LetterPreviewProps) => {
    const { activePropertyId } = usePropertyStore();
    const { getNextConsecutivo, generateLetter } = useLetterHistoryStore();
    const letterRef = useRef<HTMLDivElement>(null);

    const [isGenerated, setIsGenerated] = useState(false);
    const [generatedConsecutivo, setGeneratedConsecutivo] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    // Check if THIS specific letter already exists in history
    const { records } = useLetterHistoryStore();
    const existingRecord = useMemo(() =>
        records.find(r =>
            r.propertyId === activePropertyId &&
            r.unidad === data.UNIDAD &&
            r.tipo === template.id &&
            r.periodo === periodo
        ), [records, activePropertyId, data.UNIDAD, template.id, periodo]);

    const isAlreadyGenerated = !!existingRecord || isGenerated;
    const displayConsecutivo = existingRecord?.consecutivo || generatedConsecutivo || getNextConsecutivo(template.id, activePropertyId || 'default');

    const handleGenerateLetter = () => {
        if (!activePropertyId) return;
        const record = generateLetter({
            tipo: template.id as LetterType,
            unidad: data.UNIDAD,
            propietario: data.NOMBRE_PROPIETARIO,
            monto: montoNumerico,
            propertyId: activePropertyId,
            periodo,
            emailDestinatario: data.EMAIL
        });
        setGeneratedConsecutivo(record.consecutivo);
        setIsGenerated(true);
    };

    const handleExportPDF = async () => {
        if (!letterRef.current) return;

        setIsExporting(true);
        try {
            const canvas = await html2canvas(letterRef.current, {
                scale: 3, // Increased scale for better quality
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                imageTimeout: 0,
                onclone: () => {
                    // Ensure fonts are loaded in clone if needed
                }
            });

            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: false // Max quality, no compression
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // For A4, the image should cover the entire page
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

            const fileName = `${displayConsecutivo}_${data.UNIDAD}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);
        } catch (error) {
            console.error('Error exporting PDF:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const handlePrint = () => {
        if (!letterRef.current) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Carta ${displayConsecutivo}</title>
                    <style>
                        body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
                        @media print {
                            body { padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    ${letterRef.current.outerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    return (
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Toolbar */}
            <div className="bg-gray-50/80 backdrop-blur-md p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${template.id === 'CS' ? 'bg-blue-100 text-blue-700' :
                        template.id === 'CP' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                        Tipo: {template.id}
                    </span>
                    <h3 className="text-sm font-bold text-gray-800 truncate max-w-[200px]">{template.title}</h3>
                    {isGenerated && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            Generada
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    {!isAlreadyGenerated ? (
                        <button
                            onClick={handleGenerateLetter}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                        >
                            <FileText className="w-4 h-4" /> Generar Carta
                        </button>
                    ) : (
                        <>
                            {!isGenerated && (
                                <span className="flex items-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold border border-indigo-100">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Ya Registrada
                                </span>
                            )}
                            <button
                                onClick={handlePrint}
                                className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
                                title="Imprimir"
                            >
                                <Printer className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleExportPDF}
                                disabled={isExporting}
                                className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors disabled:opacity-50"
                                title="Bajar PDF"
                            >
                                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                                <Mail className="w-4 h-4" /> Enviar Email
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Document Content - A4 Style */}
            <div className="flex-1 overflow-y-auto bg-gray-100 p-6 flex justify-center text-center">
                <div ref={letterRef} className="w-full max-w-[21cm]">
                    <LetterDocument
                        template={template}
                        data={data}
                        consecutivo={displayConsecutivo}
                        isGenerated={isGenerated}
                    />
                </div>
            </div>
        </div>
    );
};
