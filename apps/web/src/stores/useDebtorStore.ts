import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LetterType } from '../utils/letterTemplates';
import api from '../services/api';

export interface Debtor {
    id: string;
    unidad: string;           // LOCAL/OFI
    propietario: string;      // PROPIETARIO
    saldoAnterior: number;    // SALDO ANTERIOR
    cuotaActual: number;      // CUOTA ACTUAL
    interesesMora: number;    // INTERESES DE MORA
    otros: number;            // OTROS
    totalPagar: number;       // TOTAL A PAGAR
    edadVencida: number;      // EDAD VENCIDA (meses)
    estadoReal: string;       // ESTADO REAL
    tipoCarta: LetterType;    // TIPO DE CARTA
    etapaLegal: 'Preventiva' | 'Persuasiva' | 'Jurídica'; // NEW: Legal stage
    email?: string;           // EMAIL
    movil?: string;           // MÓVIL
    fechaCarga: string;       // Fecha del reporte cargado
    periodo: string;          // Período del reporte (ej: "2026-01")
}

export interface MonthlyReport {
    id: string;
    periodo: string;          // "2026-01" format
    periodoLabel: string;     // "Enero 2026" display
    fechaCarga: string;       // ISO date when uploaded
    totalDeudores: number;
    totalCartera: number;
    debtors: Debtor[];
    propertyId: string;       // Linked property
}

interface DebtorState {
    currentPeriodo: string | null;
    debtors: Debtor[];
    reports: MonthlyReport[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchReports: (propertyId: string) => Promise<void>;
    setDebtors: (debtors: Debtor[], periodo: string, periodoLabel: string, propertyId: string) => Promise<void>;
    addDebtor: (debtor: Omit<Debtor, 'id'>) => void;
    updateDebtor: (id: string, data: Partial<Debtor>) => void;
    deleteDebtor: (id: string) => void;
    clearAll: () => void;

    // Report management
    switchToPeriod: (periodo: string) => void;
    deleteReport: (id: string) => Promise<void>;
    getReportByPeriod: (periodo: string, propertyId: string) => MonthlyReport | undefined;
    hasReport: (periodo: string, propertyId: string) => boolean;
}

export const useDebtorStore = create<DebtorState>()(
    persist(
        (set, get) => ({
            currentPeriodo: null,
            debtors: [],
            reports: [],
            isLoading: false,
            error: null,

            fetchReports: async (propertyId) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.get(`/reports/${propertyId}`);
                    const reports = response.data;
                    set({
                        reports,
                        isLoading: false,
                        currentPeriodo: get().currentPeriodo || (reports[0]?.periodo || null),
                        debtors: get().currentPeriodo
                            ? (reports.find((r: any) => r.periodo === get().currentPeriodo)?.debtors || reports[0]?.debtors || [])
                            : (reports[0]?.debtors || [])
                    });
                } catch (err: any) {
                    set({ error: err.message, isLoading: false });
                }
            },

            setDebtors: async (debtors, periodo, periodoLabel, propertyId) => {
                set({ isLoading: true, error: null });
                try {
                    await api.post('/reports', {
                        periodo,
                        periodoLabel,
                        propertyId,
                        debtors
                    });

                    // Refresh all reports to get the structured data back
                    await get().fetchReports(propertyId);
                    set({ currentPeriodo: periodo, isLoading: false });
                } catch (err: any) {
                    set({ error: err.message, isLoading: false });
                    throw err;
                }
            },

            addDebtor: (newDebtor) => set((state) => ({
                debtors: [...state.debtors, {
                    ...newDebtor,
                    id: crypto.randomUUID()
                }]
            })),

            updateDebtor: async (id, data) => {
                set({ isLoading: true });
                try {
                    await api.put(`/debtors/${id}`, data);
                    set((state) => ({
                        debtors: state.debtors.map((d) =>
                            d.id === id ? { ...d, ...data } : d
                        ),
                        isLoading: false
                    }));
                } catch (err: any) {
                    set({ error: err.message, isLoading: false });
                }
            },

            deleteDebtor: async (id) => {
                set({ isLoading: true });
                try {
                    await api.delete(`/debtors/${id}`);
                    set((state) => ({
                        debtors: state.debtors.filter((d) => d.id !== id),
                        isLoading: false
                    }));
                } catch (err: any) {
                    set({ error: err.message, isLoading: false });
                }
            },

            clearAll: () => set({ debtors: [], currentPeriodo: null, reports: [] }),

            switchToPeriod: (periodo) => {
                const report = get().reports.find(r => r.periodo === periodo);
                if (report) {
                    set({
                        currentPeriodo: periodo,
                        debtors: report.debtors,
                    });
                }
            },

            deleteReport: async (id) => {
                set({ isLoading: true });
                try {
                    await api.delete(`/reports/${id}`);
                    set((state) => {
                        const updatedReports = state.reports.filter(r => r.id !== id);
                        const isCurrent = state.reports.find(r => r.id === id)?.periodo === state.currentPeriodo;

                        return {
                            reports: updatedReports,
                            currentPeriodo: isCurrent ? (updatedReports[0]?.periodo || null) : state.currentPeriodo,
                            debtors: isCurrent ? (updatedReports[0]?.debtors || []) : state.debtors,
                            isLoading: false
                        };
                    });
                } catch (err: any) {
                    set({ error: err.message, isLoading: false });
                    throw err;
                }
            },

            getReportByPeriod: (periodo, propertyId) =>
                get().reports.find(r => r.periodo === periodo && r.propertyId === propertyId),

            hasReport: (periodo, propertyId) =>
                get().reports.some(r => r.periodo === periodo && r.propertyId === propertyId),
        }),
        {
            name: 'cartera-debtors-storage',
        }
    )
);
