import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { legalService } from '../services/api';

export type LegalStage =
    | 'Cobro Persuasivo'
    | 'Llamada Realizada'
    | 'Compromiso de Pago'
    | 'Jurídico - Asignado'
    | 'Jurídico - Demanda'
    | 'Jurídico - Notificación'
    | 'Jurídico - Medidas Cautelares'
    | 'Jurídico - Sentencia'
    | 'Acuerdo de Pago' // Keeping for compatibility
    | 'Finalizado'
    | 'Asignado'; // Keeping for compatibility

export interface LegalNovedad {
    id: string;
    fecha: string;
    descripcion: string;
    etapa: LegalStage;
}

export interface LegalCase {
    id: string;
    propertyId: string;
    debtorId: string;
    unidad: string;
    propietario: string;
    abogado?: string;
    radicado?: string;
    etapaActual: LegalStage;
    notes?: LegalNovedad[]; // Map from backend 'notes'
    novedades: LegalNovedad[]; // For frontend compatibility
    fechaInicio: string;
    fechaFin?: string;
    montoInicial: number;
    estado: 'activo' | 'cerrado';
}

interface LegalState {
    cases: LegalCase[];
    isLoading: boolean;
    error: string | null;

    fetchCases: (propertyId: string) => Promise<void>;
    addCase: (caseData: Omit<LegalCase, 'id' | 'novedades' | 'fechaInicio' | 'estado' | 'notes'>) => Promise<void>;
    updateCase: (id: string, data: Partial<LegalCase>) => Promise<void>;
    addNovedad: (caseId: string, descripcion: string, etapa: LegalStage) => Promise<void>;
    closeCase: (caseId: string, fechaFin: string) => Promise<void>;
}

export const useLegalStore = create<LegalState>()(
    persist(
        (set, get) => ({
            cases: [],
            isLoading: false,
            error: null,

            fetchCases: async (propertyId) => {
                set({ isLoading: true, error: null });
                try {
                    const data = await legalService.getAllByProperty(propertyId);
                    // Map backend 'notes' to frontend 'novedades'
                    const mappedCases = data.map((c: any) => ({
                        ...c,
                        novedades: c.notes || []
                    }));
                    set({ cases: mappedCases, isLoading: false });
                } catch (err: any) {
                    set({ error: err.message, isLoading: false });
                }
            },

            addCase: async (caseData) => {
                set({ isLoading: true });
                try {
                    const newCase = await legalService.create(caseData);
                    set((state) => ({
                        cases: [{ ...newCase, novedades: newCase.notes || [] }, ...state.cases],
                        isLoading: false
                    }));
                } catch (err: any) {
                    set({ error: err.message, isLoading: false });
                    throw err;
                }
            },

            updateCase: async (id, data) => {
                set({ isLoading: true });
                try {
                    const updated = await legalService.update(id, data);
                    set((state) => ({
                        cases: state.cases.map((c) => c.id === id ? { ...c, ...updated } : c),
                        isLoading: false
                    }));
                } catch (err: any) {
                    set({ error: err.message, isLoading: false });
                    throw err;
                }
            },

            addNovedad: async (caseId, descripcion, etapa) => {
                set({ isLoading: true });
                try {
                    await legalService.addNovedad(caseId, descripcion, etapa);
                    // Refresh data to get the new note
                    const propertyId = get().cases.find(c => c.id === caseId)?.propertyId;
                    if (propertyId) await get().fetchCases(propertyId);
                    set({ isLoading: false });
                } catch (err: any) {
                    set({ error: err.message, isLoading: false });
                    throw err;
                }
            },

            closeCase: async (caseId, fechaFin) => {
                set({ isLoading: true });
                try {
                    const updated = await legalService.closeCase(caseId, fechaFin);
                    set((state) => ({
                        cases: state.cases.map((c) =>
                            c.id === caseId ? { ...c, ...updated } : c
                        ),
                        isLoading: false
                    }));
                } catch (err: any) {
                    set({ error: err.message, isLoading: false });
                    throw err;
                }
            },
        }),
        {
            name: 'cartera-legal-storage',
        }
    )
);
