import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { propertyService } from '../services/api';

export interface PropertySettings {
    companyName: string;
    companySubtitle: string;
    nit: string;
    address: string;
    city: string;
    email: string;
    phone: string;
    adminName: string;
    adminTitle: string;
    adminEmail: string;
    adminPhone: string;
    logoUrl: string;
    signatureUrl: string;
    footerText: string;
    ccText: string;
    totalUnits: number; // Census of properties
    lawyerName: string;
    lawyerEmail: string;
    lawyerPhone: string;
}

export interface Property {
    id: string;
    name: string;
    settings: PropertySettings;
    createdAt: string;
}

interface PropertyState {
    properties: Property[];
    activePropertyId: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchProperties: () => Promise<void>;
    addProperty: (name: string, initialSettings?: Partial<PropertySettings>) => Promise<Property>;
    updateProperty: (id: string, data: Partial<Property>) => Promise<void>;
    updatePropertySettings: (id: string, settings: Partial<PropertySettings>) => Promise<void>;
    deleteProperty: (id: string) => Promise<void>;
    setActiveProperty: (id: string) => void;
}

const DEFAULT_SETTINGS: PropertySettings = {
    companyName: 'Nuevo Conjunto',
    companySubtitle: 'Residencial',
    nit: '-',
    address: '-',
    city: 'Cali',
    email: '',
    phone: '',
    adminName: '',
    adminTitle: 'Administrador/a',
    adminEmail: '',
    adminPhone: '',
    logoUrl: '',
    signatureUrl: '',
    footerText: '',
    ccText: 'CC: Archivo',
    totalUnits: 1,
    lawyerName: '',
    lawyerEmail: '',
    lawyerPhone: '',
};

export const usePropertyStore = create<PropertyState>()(
    persist(
        (set, get) => ({
            properties: [],
            activePropertyId: null,
            isLoading: false,
            error: null,

            fetchProperties: async () => {
                set({ isLoading: true, error: null });
                try {
                    const properties = await propertyService.getAll();
                    set({
                        properties,
                        isLoading: false,
                        activePropertyId: get().activePropertyId || (properties[0]?.id || null)
                    });
                } catch (err: any) {
                    set({ error: err.message, isLoading: false });
                    console.error('Failed to fetch properties:', err);
                }
            },

            addProperty: async (name, initialSettings) => {
                set({ isLoading: true });
                try {
                    const settings = { ...DEFAULT_SETTINGS, companyName: name, ...initialSettings };
                    const newProperty = await propertyService.create({ name, settings });

                    set((state) => ({
                        properties: [...state.properties, newProperty],
                        activePropertyId: newProperty.id,
                        isLoading: false
                    }));
                    return newProperty;
                } catch (err: any) {
                    set({ error: err.message, isLoading: false });
                    throw err;
                }
            },

            updateProperty: async (id, data) => {
                set({ isLoading: true });
                try {
                    const updated = await propertyService.update(id, data);
                    set((state) => ({
                        properties: state.properties.map(p => p.id === id ? { ...p, ...updated } : p),
                        isLoading: false
                    }));
                } catch (err: any) {
                    set({ error: err.message, isLoading: false });
                    throw err;
                }
            },

            updatePropertySettings: async (id, settings) => {
                const property = get().properties.find(p => p.id === id);
                if (!property) return;

                set({ isLoading: true });
                try {
                    const updatedSettings = { ...property.settings, ...settings };
                    const updated = await propertyService.update(id, { settings: updatedSettings });

                    set((state) => ({
                        properties: state.properties.map(p =>
                            p.id === id ? { ...p, ...updated } : p
                        ),
                        isLoading: false
                    }));
                } catch (err: any) {
                    set({ error: err.message, isLoading: false });
                    throw err;
                }
            },

            deleteProperty: async (id) => {
                set({ isLoading: true });
                try {
                    await propertyService.delete(id);
                    set((state) => {
                        const newProperties = state.properties.filter(p => p.id !== id);
                        return {
                            properties: newProperties,
                            activePropertyId: state.activePropertyId === id
                                ? (newProperties[0]?.id || null)
                                : state.activePropertyId,
                            isLoading: false
                        };
                    });
                } catch (err: any) {
                    set({ error: err.message, isLoading: false });
                    throw err;
                }
            },

            setActiveProperty: (id) => set({ activePropertyId: id }),
        }),
        {
            name: 'cartera-properties-storage',
        }
    )
);
