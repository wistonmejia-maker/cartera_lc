import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { usePropertyStore } from '../../stores/usePropertyStore';
import { useLetterHistoryStore } from '../../stores/useLetterHistoryStore';
import { useDebtorStore } from '../../stores/useDebtorStore';
import { useLegalStore } from '../../stores/useLegalStore';

export const Layout = () => {
    const activePropertyId = usePropertyStore(s => s.activePropertyId);
    const fetchHistory = useLetterHistoryStore(s => s.fetchHistory);
    const fetchReports = useDebtorStore(s => s.fetchReports);
    const fetchCases = useLegalStore(s => s.fetchCases);

    useEffect(() => {
        if (activePropertyId) {
            fetchHistory(activePropertyId);
            fetchReports(activePropertyId);
            fetchCases(activePropertyId);
        }
    }, [activePropertyId, fetchHistory, fetchReports, fetchCases]);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Sidebar />
            <Header />

            <main className="md:ml-64 p-6 min-h-[calc(100vh-4rem)] transition-all duration-300">
                <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
