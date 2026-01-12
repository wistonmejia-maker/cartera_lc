import { useState } from 'react';
import { Database, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { usePropertyStore } from '../stores/usePropertyStore';
import { useLetterHistoryStore } from '../stores/useLetterHistoryStore';
import { useDebtorStore } from '../stores/useDebtorStore';
import api from '../services/api';

export const MigrationPage = () => {
    const [status, setStatus] = useState<'idle' | 'migrating' | 'success' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');

    const properties = usePropertyStore(s => s.properties);
    const history = useLetterHistoryStore(s => s.records);
    const reports = useDebtorStore(s => s.reports);

    const handleMigrate = async () => {
        if (!window.confirm('¿Deseas migrar tus datos locales al servidor? Esto subirá todos los conjuntos, reportes e historia generada.')) return;

        setStatus('migrating');
        setProgress(0);
        setMessage('Iniciando migración...');

        try {
            // 1. Migrate Properties
            setMessage('Migrando conjuntos residenciales...');
            for (let i = 0; i < properties.length; i++) {
                const p = properties[i];
                // Check if it already exists or just try to create
                try {
                    await api.post('/properties', { name: p.name, settings: p.settings });
                } catch (e) {
                    console.warn(`Property ${p.name} might already exist`);
                }
                setProgress(Math.round((i + 1) / (properties.length + reports.length + history.length) * 100));
            }

            // 2. Migrate Reports
            setMessage('Migrando reportes mensuales (esto puede tardar)...');
            for (let i = 0; i < reports.length; i++) {
                const r = reports[i];
                await api.post('/reports', {
                    periodo: r.periodo,
                    periodoLabel: r.periodoLabel,
                    propertyId: r.propertyId,
                    debtors: r.debtors
                });
                setProgress(Math.round((properties.length + i + 1) / (properties.length + reports.length + history.length) * 100));
            }

            // 3. Migrate History
            setMessage('Migrando historial de cartas...');
            // Batch history records by property? For now one by one is safer for a script
            for (let i = 0; i < history.length; i++) {
                const h = history[i];
                await api.post('/history', h);
                setProgress(Math.round((properties.length + reports.length + i + 1) / (properties.length + reports.length + history.length) * 100));
            }

            setStatus('success');
            setMessage('Migración completada con éxito. Ahora puedes limpiar tu almacenamiento local.');
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setMessage(`Error durante la migración: ${err.message}`);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12">
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden">
                <div className="p-12 text-center">
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                        <Database className="w-10 h-10 text-indigo-600" />
                    </div>

                    <h1 className="text-3xl font-black text-gray-900 mb-4">Migración a la Nube</h1>
                    <p className="text-gray-500 mb-10 font-medium">
                        Transfiere tus datos guardados localmente en este navegador a la base de datos centralizada (SaaS).
                        Esto permitirá que otros usuarios vean la misma información.
                    </p>

                    <div className="grid grid-cols-3 gap-4 mb-10">
                        <div className="bg-gray-50 p-4 rounded-2xl">
                            <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Conjuntos</div>
                            <div className="text-2xl font-black text-gray-900">{properties.length}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl">
                            <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Reportes</div>
                            <div className="text-2xl font-black text-gray-900">{reports.length}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl">
                            <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Cartas</div>
                            <div className="text-2xl font-black text-gray-900">{history.length}</div>
                        </div>
                    </div>

                    {status === 'idle' && (
                        <button
                            onClick={handleMigrate}
                            className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
                        >
                            Comenzar Migración <ArrowRight className="w-5 h-5" />
                        </button>
                    )}

                    {status === 'migrating' && (
                        <div className="space-y-6">
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-center gap-3 text-indigo-600 font-bold">
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                {message}
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-6">
                            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-bold flex items-center justify-center gap-3">
                                <CheckCircle2 className="w-6 h-6" />
                                {message}
                            </div>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all"
                            >
                                Volver al Dashboard
                            </button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-6">
                            <div className="p-4 bg-red-50 text-red-700 rounded-2xl font-bold flex items-center justify-center gap-3 text-left">
                                <AlertCircle className="w-6 h-6 shrink-0" />
                                {message}
                            </div>
                            <button
                                onClick={() => setStatus('idle')}
                                className="w-full py-4 bg-gray-100 text-gray-900 font-black rounded-2xl hover:bg-gray-200 transition-all"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
