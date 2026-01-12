import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    abogado?: string; // Optional now
    radicado?: string;
    etapaActual: LegalStage;
    novedades: LegalNovedad[];
    fechaInicio: string;
    fechaFin?: string;
    montoInicial: number;
    estado: 'activo' | 'cerrado';
}

interface LegalState {
    cases: LegalCase[];
    addCase: (caseData: Omit<LegalCase, 'id' | 'novedades' | 'fechaInicio' | 'estado'>) => void;
    updateCase: (id: string, data: Partial<LegalCase>) => void;
    addNovedad: (caseId: string, descripcion: string, etapa: LegalStage) => void;
    closeCase: (caseId: string, fechaFin: string) => void;
}

export const useLegalStore = create<LegalState>()(
    persist(
        (set) => ({
            cases: [],

            addCase: (caseData) => set((state) => ({
                cases: [
                    {
                        ...caseData,
                        id: Math.random().toString(36).substring(2) + Date.now().toString(36),
                        novedades: [{
                            id: Math.random().toString(36).substring(2) + Date.now().toString(36),
                            fecha: new Date().toISOString(),
                            descripcion: `Gestión iniciada - Etapa: ${caseData.etapaActual}`,
                            etapa: caseData.etapaActual
                        }],
                        fechaInicio: new Date().toISOString(),
                        estado: 'activo'
                    },
                    ...state.cases
                ]
            })),

            updateCase: (id, data) => set((state) => ({
                cases: state.cases.map((c) => c.id === id ? { ...c, ...data } : c)
            })),

            addNovedad: (caseId, descripcion, etapa) => set((state) => ({
                cases: state.cases.map((c) => {
                    if (c.id === caseId) {
                        const nuevaNovedad: LegalNovedad = {
                            id: Math.random().toString(36).substring(2) + Date.now().toString(36),
                            fecha: new Date().toISOString(),
                            descripcion,
                            etapa
                        };
                        return {
                            ...c,
                            etapaActual: etapa,
                            novedades: [nuevaNovedad, ...c.novedades]
                        };
                    }
                    return c;
                })
            })),

            closeCase: (caseId, fechaFin) => set((state) => ({
                cases: state.cases.map((c) =>
                    c.id === caseId ? { ...c, estado: 'cerrado', fechaFin, etapaActual: 'Finalizado' } : c
                )
            })),
        }),
        {
            name: 'cartera-legal-storage',
        }
    )
);
