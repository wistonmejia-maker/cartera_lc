import { useState, useMemo } from 'react';
import {
    ClipboardList,
    Search,
    Plus,
    Scale,
    User,
    CheckCircle2,
    UserPlus,
    Download,
    PhoneCall,
    MessageSquare
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useLegalStore } from '../stores/useLegalStore';
import type { LegalStage } from '../stores/useLegalStore';
import { useDebtorStore } from '../stores/useDebtorStore';
import { usePropertyStore } from '../stores/usePropertyStore';
import { formatCurrency } from '../utils/formatters';

export const LegalPage = () => {
    const { cases, addCase, addNovedad, closeCase } = useLegalStore();
    const { debtors } = useDebtorStore();
    const { activePropertyId, properties } = usePropertyStore();

    const activeProperty = useMemo(() => properties.find(p => p.id === activePropertyId), [properties, activePropertyId]);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
    const [newNovedad, setNewNovedad] = useState('');
    const [newEtapa, setNewEtapa] = useState<LegalStage>('Asignado');

    // Modal state for assigning lawyer
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [debtorToAssign, setDebtorToAssign] = useState<any>(null);
    const [abogadoNombre, setAbogadoNombre] = useState('');

    const handleExportExcel = () => {
        if (!activeCases.length) return;

        const reportData = activeCases.map(c => {
            const lastNovedad = c.novedades[c.novedades.length - 1];
            return {
                'Unidad': c.unidad,
                'Propietario': c.propietario,
                'Abogado/Gestor': c.abogado || 'Gestión Interna',
                'Radicado': c.radicado || 'Sin radicar',
                'Etapa Actual': c.etapaActual,
                'Deuda Inicial': c.montoInicial,
                'Fecha Inicio': new Date(c.fechaInicio).toLocaleDateString(),
                'Última Novedad': lastNovedad?.descripcion || 'Sin novedades',
                'Fecha Última Novedad': lastNovedad ? new Date(lastNovedad.fecha).toLocaleString() : '-'
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(reportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Relación de Cobro');

        // Set column widths
        const wscols = [
            { wch: 10 }, // Unidad
            { wch: 30 }, // Propietario
            { wch: 25 }, // Abogado/Gestor
            { wch: 20 }, // Radicado
            { wch: 20 }, // Etapa
            { wch: 15 }, // Monto
            { wch: 15 }, // Fecha Inicio
            { wch: 50 }, // Última Novedad
            { wch: 25 }, // Fecha Novedad
        ];
        worksheet['!cols'] = wscols;

        const fileName = `Bitacora_Cobro_${activeProperty?.name || 'Conjunto'}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    // Filter debtors with debt who DON'T have an active case
    const pendingDebtors = useMemo(() => {
        if (!activePropertyId) return [];
        const activeCaseDebtorIds = cases
            .filter(c => c.propertyId === activePropertyId && c.estado === 'activo')
            .map(c => c.debtorId);

        return debtors.filter(d =>
            d.totalPagar > 0 &&
            !activeCaseDebtorIds.includes(d.id)
        );
    }, [debtors, cases, activePropertyId]);

    const activeCases = useMemo(() => {
        return cases.filter(c =>
            c.propertyId === activePropertyId &&
            c.estado === 'activo' &&
            (c.unidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.propietario.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.abogado && c.abogado.toLowerCase().includes(searchTerm.toLowerCase())))
        );
    }, [cases, activePropertyId, searchTerm]);

    const selectedCase = useMemo(() => cases.find(c => c.id === selectedCaseId), [cases, selectedCaseId]);

    const handleOpenAssignModal = (debtor: any) => {
        const activeProperty = properties.find(p => p.id === activePropertyId);
        const defaultLawyer = activeProperty?.settings?.lawyerName || '';

        setDebtorToAssign(debtor);
        setAbogadoNombre(defaultLawyer);
        setIsAssignModalOpen(true);
    };

    const handleConfirmAssignment = () => {
        if (!debtorToAssign || !activePropertyId) return;

        addCase({
            propertyId: activePropertyId,
            debtorId: debtorToAssign.id,
            unidad: debtorToAssign.unidad,
            propietario: debtorToAssign.propietario,
            abogado: abogadoNombre || undefined,
            etapaActual: abogadoNombre ? 'Jurídico - Asignado' : 'Cobro Persuasivo',
            montoInicial: debtorToAssign.totalPagar
        });

        setIsAssignModalOpen(false);
        setDebtorToAssign(null);
    };

    const handleAddNovedad = () => {
        if (!selectedCaseId || !newNovedad) return;
        addNovedad(selectedCaseId, newNovedad, newEtapa);
        setNewNovedad('');
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <ClipboardList className="w-8 h-8 text-indigo-600" />
                        Gestión de Cobro
                    </h2>
                    <p className="text-gray-500 mt-1 font-medium">Historial completo de gestiones, llamadas y procesos jurídicos.</p>
                </div>
                {activeCases.length > 0 && (
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                    >
                        <Download className="w-4 h-4" />
                        Excel de Gestión
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column 1: Pending Debtors */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 bg-gray-50/50 border-b border-gray-100">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-indigo-500" />
                                Pendientes de Bitácora
                            </h3>
                            <p className="text-[10px] text-gray-400 font-bold mt-1">Unidades con mora sin gestión activa.</p>
                        </div>
                        <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                            {pendingDebtors.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-100" />
                                    <p className="text-xs font-bold">Todas las unidades en mora tienen gestión iniciada.</p>
                                </div>
                            ) : (
                                pendingDebtors.map(debtor => (
                                    <div key={debtor.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                                        <div>
                                            <div className="font-black text-gray-900">{debtor.unidad}</div>
                                            <div className="text-[10px] text-gray-500 font-bold uppercase truncate max-w-[140px]">{debtor.propietario}</div>
                                            <div className="flex items-center gap-1 mt-1">
                                                <div className="text-[10px] font-mono text-indigo-600">{formatCurrency(debtor.totalPagar)}</div>
                                                <div className="px-1.5 py-0.5 bg-gray-100 rounded text-[8px] font-black uppercase text-gray-500">{debtor.etapaLegal}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleOpenAssignModal(debtor)}
                                            className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                                            title="Iniciar Gestión"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Column 2 & 3: Active Cases */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Search & Stats */}
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Buscar por unidad, propietario o gestor..."
                                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none shadow-sm transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Case List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeCases.map(c => (
                            <div
                                key={c.id}
                                onClick={() => setSelectedCaseId(c.id)}
                                className={`
                                    p-6 bg-white rounded-3xl border cursor-pointer transition-all hover:shadow-md
                                    ${selectedCaseId === c.id ? 'border-indigo-500 ring-4 ring-indigo-500/5' : 'border-gray-100'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                        {c.abogado ? <Scale className="w-2.5 h-2.5" /> : <PhoneCall className="w-2.5 h-2.5" />}
                                        {c.etapaActual}
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-bold font-mono">
                                        Desde: {new Date(c.fechaInicio).toLocaleDateString()}
                                    </span>
                                </div>
                                <h4 className="text-xl font-black text-gray-900 mb-1">{c.unidad}</h4>
                                <p className="text-xs text-gray-500 font-bold uppercase mb-4 truncate">{c.propietario}</p>

                                <div className="space-y-2 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <User className="w-3 h-3 text-gray-400" />
                                        <span className="font-bold">Responsable:</span> {c.abogado || 'Gestión Interna'}
                                    </div>
                                    {c.radicado && (
                                        <div className="flex items-center gap-2 text-xs text-gray-600 font-mono">
                                            <Scale className="w-3 h-3 text-gray-400" />
                                            <span className="font-bold">Rad:</span> {c.radicado}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Case Details / Bitácora */}
                    {selectedCase && (
                        <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                            <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                            <MessageSquare className="w-6 h-6 text-indigo-500" />
                                            Bitácora de Gestión
                                        </h3>
                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">
                                            {selectedCase.unidad} • {selectedCase.propietario}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => closeCase(selectedCase.id, new Date().toISOString())}
                                        className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
                                    >
                                        Finalizar Gestión
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Form to add novedad */}
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Registrar Acción</label>
                                    <select
                                        value={newEtapa}
                                        onChange={(e) => setNewEtapa(e.target.value as LegalStage)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                    >
                                        <optgroup label="Gestión Preventiva/Persuasiva">
                                            <option value="Cobro Persuasivo">Cobro Persuasivo (Email/Mensaje)</option>
                                            <option value="Llamada Realizada">Llamada Realizada</option>
                                            <option value="Compromiso de Pago">Compromiso de Pago</option>
                                            <option value="Acuerdo de Pago">Acuerdo de Pago Firmado</option>
                                        </optgroup>
                                        <optgroup label="Gestión Jurídica">
                                            <option value="Juridico - Asignado">Asignado a Abogado</option>
                                            <option value="Juridico - Demanda">Demanda (Radicación)</option>
                                            <option value="Juridico - Notificación">Notificación</option>
                                            <option value="Juridico - Medidas Cautelares">Medidas Cautelares</option>
                                            <option value="Juridico - Sentencia">Sentencia</option>
                                        </optgroup>
                                    </select>
                                    <textarea
                                        placeholder="Describa el resultado de la gestión, detalles de la llamada o condiciones del acuerdo..."
                                        rows={4}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                                        value={newNovedad}
                                        onChange={(e) => setNewNovedad(e.target.value)}
                                    />
                                    <button
                                        onClick={handleAddNovedad}
                                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                                    >
                                        Guardar en Bitácora
                                    </button>
                                </div>

                                {/* History of novedades */}
                                <div className="space-y-6">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Historial de Gestiones</label>
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                        {selectedCase.novedades.map((n) => (
                                            <div key={n.id} className="relative pl-6 pb-6 border-l border-gray-100 last:pb-0">
                                                <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-white" />
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">
                                                        {n.etapa}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-mono">
                                                        {new Date(n.fecha).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{n.descripcion}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Lawyer Assignment Modal */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-gray-50 bg-gray-50/50">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight text-indigo-600">Iniciar Gestión</h3>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">
                                {debtorToAssign?.unidad} • {debtorToAssign?.propietario}
                            </p>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                                        Si la gestión es interna (llamadas/email), puedes dejar el campo del abogado vacío. Si se asigna a una firma externa, ingrésalo abajo.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Abogado / Firma (Opcional)</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            autoFocus
                                            placeholder="Gestión Interna (Dejar vacío)"
                                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                                            value={abogadoNombre}
                                            onChange={(e) => setAbogadoNombre(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleConfirmAssignment()}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsAssignModalOpen(false)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmAssignment}
                                    className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 whitespace-nowrap"
                                >
                                    Iniciar Seguimiento
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
