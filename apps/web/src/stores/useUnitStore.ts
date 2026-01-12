import { create } from 'zustand';

export type UnitType = 'Apartment' | 'House' | 'Commercial' | 'Parking';
export type UnitStatus = 'Active' | 'Inactive';

export interface Unit {
    id: string;
    propertyId: string;
    number: string;
    type: UnitType;
    coefficient: number;
    ownerName: string;
    email?: string;
    phone?: string;
    status: UnitStatus;
}

interface UnitState {
    units: Unit[];
    isLoading: boolean;
    addUnit: (propertyId: string, unit: Omit<Unit, 'id' | 'propertyId'>) => void;
    updateUnit: (id: string, unit: Partial<Unit>) => void;
    deleteUnit: (id: string) => void;
}

const DEFAULT_PROPERTY_ID = 'ciudad-jardin-default';

const MOCK_UNITS: Unit[] = [
    { id: '1', propertyId: DEFAULT_PROPERTY_ID, number: '101', type: 'Apartment', coefficient: 0.045, ownerName: 'Carlos Rodriguez', email: 'carlos@email.com', status: 'Active' },
    { id: '2', propertyId: DEFAULT_PROPERTY_ID, number: '102', type: 'Apartment', coefficient: 0.045, ownerName: 'Maria Garcia', email: 'maria@email.com', status: 'Active' },
    { id: '3', propertyId: DEFAULT_PROPERTY_ID, number: '201', type: 'Apartment', coefficient: 0.048, ownerName: 'Juan Perez', status: 'Inactive' },
    { id: '4', propertyId: DEFAULT_PROPERTY_ID, number: 'L-01', type: 'Commercial', coefficient: 0.085, ownerName: 'Farmacia 24h', status: 'Active' },
    { id: '5', propertyId: DEFAULT_PROPERTY_ID, number: 'P-15', type: 'Parking', coefficient: 0.012, ownerName: 'Carlos Rodriguez', status: 'Active' },
];

export const useUnitStore = create<UnitState>((set) => ({
    units: MOCK_UNITS,
    isLoading: false,

    addUnit: (propertyId, newUnit) => set((state) => ({
        units: [...state.units, { ...newUnit, propertyId, id: Math.random().toString(36).substr(2, 9) }]
    })),

    updateUnit: (id, updatedUnit) => set((state) => ({
        units: state.units.map((unit) =>
            unit.id === id ? { ...unit, ...updatedUnit } : unit
        )
    })),

    deleteUnit: (id) => set((state) => ({
        units: state.units.filter((unit) => unit.id !== id)
    })),
}));
