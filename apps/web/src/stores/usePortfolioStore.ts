import { create } from 'zustand';

export interface Transaction {
    id: string;
    propertyId: string;
    unitId: string;
    unitNumber: string;
    date: string;
    description: string;
    amount: number;
    type: 'Charge' | 'Payment';
    category: 'Administration' | 'Interest' | 'Extraordinary' | 'Other';
}

export interface PortfolioBalance {
    totalDebt: number;
    collectedThisMonth: number;
    pendingThisMonth: number;
    agingData: {
        '0-30': number;
        '31-60': number;
        '61-90': number;
        '90+': number;
    };
}

interface PortfolioState {
    transactions: Transaction[];
    balance: PortfolioBalance;
    isLoading: boolean;
    addTransaction: (propertyId: string, tx: Omit<Transaction, 'id' | 'propertyId'>) => void;
    setTransactions: (transactions: Transaction[]) => void;
}

const DEFAULT_PROPERTY_ID = 'ciudad-jardin-default';

const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 't1', propertyId: DEFAULT_PROPERTY_ID, unitId: '1', unitNumber: '101', date: '2026-01-05', description: 'Pago Administración Enero', amount: 350000, type: 'Payment', category: 'Administration' },
    { id: 't2', propertyId: DEFAULT_PROPERTY_ID, unitId: '2', unitNumber: '102', date: '2026-01-01', description: 'Cuota Administración Enero', amount: 350000, type: 'Charge', category: 'Administration' },
    { id: 't3', propertyId: DEFAULT_PROPERTY_ID, unitId: '3', unitNumber: '201', date: '2025-12-15', description: 'Intereses de mora', amount: 12500, type: 'Charge', category: 'Interest' },
    { id: 't4', propertyId: DEFAULT_PROPERTY_ID, unitId: '4', unitNumber: 'L-01', date: '2026-01-10', description: 'Pago extraordinario', amount: 150000, type: 'Payment', category: 'Extraordinary' },
];

const MOCK_BALANCE: PortfolioBalance = {
    totalDebt: 12850000,
    collectedThisMonth: 8200000,
    pendingThisMonth: 4650000,
    agingData: {
        '0-30': 4650000,
        '31-60': 3200000,
        '61-90': 2100000,
        '90+': 2900000,
    }
};

export const usePortfolioStore = create<PortfolioState>((set) => ({
    transactions: MOCK_TRANSACTIONS,
    balance: MOCK_BALANCE,
    isLoading: false,

    addTransaction: (propertyId, newTx) => set((state) => ({
        transactions: [{ ...newTx, propertyId, id: Math.random().toString(36).substr(2, 9) }, ...state.transactions]
    })),

    setTransactions: (transactions) => set({ transactions }),
}));
