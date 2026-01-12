import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LetterType } from '../utils/letterTemplates';
import { historyService } from '../services/api';

export type LetterStatus = 'generada' | 'enviada' | 'entregada';
export type LetterChannel = 'email' | 'impresa' | 'whatsapp' | null;

export interface LetterRecord {
    id: string;
    consecutivo: string;           // CS-0001, AB-0002
    tipo: LetterType;
    fecha: string;                 // ISO date
    unidad: string;
    propietario: string;
    monto: number;
    estado: LetterStatus;
    canal: LetterChannel;
    emailDestinatario?: string;
    notas?: string;
    compromisoPago?: string;       // New: Payment commitment date or note
    propertyId: string;            // Linked property
    periodo: string;               // Month/Year of the report (e.g. "2026-01")
}

interface LetterCounters {
    [propertyId: string]: {
        CS: number;
        CP: number;
        AB: number;
    } | undefined;
}

interface LetterHistoryState {
    records: LetterRecord[];
    counters: LetterCounters;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchHistory: (propertyId: string) => Promise<void>;
    generateLetter: (data: {
        tipo: LetterType;
        unidad: string;
        propietario: string;
        monto: number;
        propertyId: string;
        periodo: string;
        emailDestinatario?: string;
    }) => Promise<LetterRecord>;

    updateLetterStatus: (id: string, estado: LetterStatus, canal?: LetterChannel) => Promise<void>;
    updateLetterFollowUp: (id: string, notas: string, compromisoPago?: string) => Promise<void>;
    deleteRecord: (id: string) => Promise<void>;
    getNextConsecutivo: (tipo: LetterType, propertyId: string) => string;
    getRecordsByType: (tipo: LetterType) => LetterRecord[];
    getRecordsByUnit: (unidad: string) => LetterRecord[];
    resetPropertyHistory: (propertyId: string) => Promise<void>;
}

const formatConsecutivo = (tipo: LetterType, number: number): string => {
    return `${tipo}-${number.toString().padStart(4, '0')}`;
};

export const useLetterHistoryStore = create<LetterHistoryState>()(
    persist(
        (set, get) => ({
            records: [],
            counters: {},
            isLoading: false,
            error: null,

            fetchHistory: async (propertyId) => {
                set({ isLoading: true, error: null });
                try {
                    const records = await historyService.getAllByProperty(propertyId);

                    // Recalculate counters based on fetched records
                    const propertyCounter = { CS: 0, CP: 0, AB: 0 };
                    records.forEach((r: LetterRecord) => {
                        const num = parseInt(r.consecutivo.split('-')[1]);
                        if (num > propertyCounter[r.tipo]) {
                            propertyCounter[r.tipo] = num;
                        }
                    });

                    set({
                        records,
                        isLoading: false,
                        counters: {
                            ...get().counters,
                            [propertyId]: propertyCounter
                        }
                    });
                } catch (err: any) {
                    set({ error: err.message, isLoading: false });
                }
            },

            getNextConsecutivo: (tipo, propertyId) => {
                const propertyCounters = get().counters[propertyId] || { CS: 0, CP: 0, AB: 0 };
                const currentCount = propertyCounters[tipo] || 0;
                return formatConsecutivo(tipo, currentCount + 1);
            },

            generateLetter: async (data) => {
                const state = get();
                const propertyId = data.propertyId;

                // 1. Check if a letter of this type already exists for THIS unit in THIS period
                const existingRecord = state.records.find(r =>
                    r.propertyId === propertyId &&
                    r.unidad === data.unidad &&
                    r.tipo === data.tipo &&
                    r.periodo === data.periodo
                );

                if (existingRecord) {
                    return existingRecord;
                }

                set({ isLoading: true });
                try {
                    const propertyCounters = state.counters[propertyId] || { CS: 0, CP: 0, AB: 0 };
                    const newCount = (propertyCounters[data.tipo] || 0) + 1;
                    const consecutivo = formatConsecutivo(data.tipo, newCount);

                    const newRecord = await historyService.create({
                        ...data,
                        consecutivo,
                        canal: null,
                    });

                    set({
                        records: [newRecord, ...state.records],
                        isLoading: false,
                        counters: {
                            ...state.counters,
                            [propertyId]: {
                                ...propertyCounters,
                                [data.tipo]: newCount
                            }
                        }
                    });

                    return newRecord;
                } catch (err: any) {
                    set({ error: err.message, isLoading: false });
                    throw err;
                }
            },

            updateLetterStatus: async (id, estado, canal) => {
                set({ isLoading: true });
                try {
                    const updated = await historyService.update(id, { estado, canal });
                    set((state) => ({
                        records: state.records.map((record) =>
                            record.id === id ? { ...record, ...updated } : record
                        ),
                        isLoading: false
                    }));
                } catch (err: any) {
                    set({ error: err.message, isLoading: false });
                    throw err;
                }
            },

            updateLetterFollowUp: async (id, notas, compromisoPago) => {
                set({ isLoading: true });
                try {
                    const updated = await historyService.update(id, { notas, compromisoPago });
                    set((state) => ({
                        records: state.records.map((record) =>
                            record.id === id ? { ...record, ...updated } : record
                        ),
                        isLoading: false
                    }));
                } catch (err: any) {
                    set({ error: err.message, isLoading: false });
                    throw err;
                }
            },

            deleteRecord: async (id) => {
                set({ isLoading: true });
                try {
                    await historyService.delete(id);
                    set((state) => ({
                        records: state.records.filter((record) => record.id !== id),
                        isLoading: false
                    }));
                } catch (err: any) {
                    set({ error: err.message, isLoading: false });
                    throw err;
                }
            },

            getRecordsByType: (tipo) => {
                return get().records.filter((r) => r.tipo === tipo);
            },

            getRecordsByUnit: (unidad) => {
                return get().records.filter((r) => r.unidad === unidad);
            },

            resetPropertyHistory: async (propertyId) => {
                set({ isLoading: true });
                try {
                    await historyService.deleteAllByProperty(propertyId);
                    set((state) => ({
                        records: state.records.filter((r) => r.propertyId && r.propertyId !== propertyId),
                        counters: {
                            ...state.counters,
                            [propertyId]: { CS: 0, CP: 0, AB: 0 }
                        },
                        isLoading: false
                    }));
                } catch (err: any) {
                    set({ error: err.message, isLoading: false });
                    throw err;
                }
            },
        }),
        {
            name: 'cartera-letter-history-storage',
        }
    )
);
