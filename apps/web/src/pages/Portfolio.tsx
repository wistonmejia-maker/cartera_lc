import { Wallet, Upload, Filter, Download } from 'lucide-react';
import { PortfolioSummary } from '../components/portfolio/PortfolioSummary';
import { TransactionTable } from '../components/portfolio/TransactionTable';
import { AgingChart } from '../components/portfolio/AgingChart';
import { Link } from 'react-router-dom';

export const PortfolioPage = () => {
    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <Wallet className="w-8 h-8 text-indigo-600" />
                        Análisis de Cartera
                    </h2>
                    <p className="text-gray-500 mt-1">Supervisión integral de morosidad, pagos y recaudos.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all font-semibold text-sm shadow-sm">
                        <Download className="w-4 h-4" />
                        Exportar
                    </button>
                    <Link
                        to="/upload"
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-all font-semibold text-sm shadow-indigo-100 shadow-lg"
                    >
                        <Upload className="w-4 h-4" />
                        Subir Reporte
                    </Link>
                </div>
            </div>

            {/* Top Summaries */}
            <PortfolioSummary />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Aging Analysis */}
                <div className="lg:col-span-1">
                    <AgingChart />
                </div>

                {/* Filters and List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-700">Listado de Cartera</h3>
                        </div>
                    </div>
                    <TransactionTable />
                </div>
            </div>
        </div>
    );
};
