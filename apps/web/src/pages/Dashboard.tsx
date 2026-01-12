import { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, Users, AlertCircle, Building2, Scale, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDebtorStore } from '../stores/useDebtorStore';
import { usePropertyStore } from '../stores/usePropertyStore';
import { EffectivenessStats } from '../components/dashboard/EffectivenessStats';
import { formatCurrency } from '../utils/formatters';

export const Dashboard = () => {
    const { properties, activePropertyId } = usePropertyStore();
    const { reports, currentPeriodo } = useDebtorStore();

    // Filter reports for the active property
    const propertyReports = useMemo(() =>
        reports.filter(r => r.propertyId === activePropertyId),
        [reports, activePropertyId]);

    // Current month's report
    const activeReport = useMemo(() =>
        propertyReports.find(r => r.periodo === currentPeriodo),
        [propertyReports, currentPeriodo]);

    // KPI Calculations
    const activeProperty = propertyReports[0] ? properties.find(p => p.id === activePropertyId) : null;
    const totalUnitsCount = activeProperty?.settings.totalUnits || 1;
    const unitsInMora = activeReport?.totalDeudores || 0;
    const totalDebtValue = activeReport?.totalCartera || 0;
    const coberturaPercent = Math.max(0, Math.min(100, Math.round(((totalUnitsCount - unitsInMora) / totalUnitsCount) * 100)));

    const juridicalDebt = useMemo(() => {
        if (!activeReport) return 0;
        return activeReport.debtors
            .filter(d => d.etapaLegal === 'Jurídica')
            .reduce((sum, d) => sum + d.totalPagar, 0);
    }, [activeReport]);

    // Chart Data (last 6 reports)
    const chartData = useMemo(() => {
        return [...propertyReports]
            .reverse() // Sort chronologically (assuming store is reverse-chrono)
            .slice(-6)
            .map((r: any) => ({
                name: r.periodoLabel.split(' ')[0], // Month name
                cartera: r.totalCartera
            }));
    }, [propertyReports]);

    const legalStagesData = useMemo(() => {
        if (!activeReport) return null;
        const stages = {
            Preventiva: { count: 0, total: 0, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
            Persuasiva: { count: 0, total: 0, color: 'text-orange-600', bg: 'bg-orange-50', icon: ShieldAlert },
            Jurídica: { count: 0, total: 0, color: 'text-red-600', bg: 'bg-red-50', icon: Scale },
        };
        activeReport.debtors.forEach((d: any) => {
            const etapa = (d.etapaLegal || 'Preventiva') as keyof typeof stages;
            if (stages[etapa]) {
                stages[etapa].count++;
                stages[etapa].total += d.totalPagar;
            }
        });
        return stages;
    }, [activeReport]);

    // KPI Cards data
    const kpiCards = [
        {
            title: "Cartera Vencida",
            value: formatCurrency(totalDebtValue),
            change: "-2.3%",
            trend: "down",
            icon: AlertCircle,
            color: "red"
        },
        {
            title: "En Cobro Jurídico",
            value: formatCurrency(juridicalDebt),
            change: "+5%",
            trend: "up",
            icon: Scale,
            color: "orange"
        },
        {
            title: "Unidades en Mora",
            value: unitsInMora.toString(),
            change: `${totalUnitsCount} totales`,
            trend: "up",
            icon: Users,
            color: "indigo"
        },
        {
            title: "Cobertura de Pagos",
            value: `${coberturaPercent}%`,
            change: "Estimado",
            trend: "up",
            icon: ArrowUpRight,
            color: "emerald"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-indigo-600" />
                        Dashboard General
                    </h2>
                    <p className="text-gray-500 mt-1 font-medium">Panel de control de facturación y morosidad.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((card, i) => (
                    <KPICard key={i} {...card} />
                ))}
            </div>

            {/* Effectiveness Indicator - NEW */}
            <EffectivenessStats />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Histórico de Cartera</h3>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-0.5">Evolución en los últimos meses</p>
                        </div>
                    </div>
                    <div className="h-80">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorCartera" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 600 }} dy={10} />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 600 }}
                                        tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                                        formatter={(val: any) => [formatCurrency(val), 'Cartera']}
                                    />
                                    <Area type="monotone" dataKey="cartera" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorCartera)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 italic">
                                <span>No hay datos históricos suficientes</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Legal Risk & Activity */}
                <div className="space-y-6">
                    {/* Legal Risk Analysis */}
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
                        <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                            <Scale className="w-5 h-5 text-indigo-600" />
                            Riesgo por Etapa Legal
                        </h3>
                        <div className="space-y-3">
                            {legalStagesData ? (
                                Object.entries(legalStagesData).map(([name, data]: [string, any]) => (
                                    <div key={name} className="p-3 rounded-2xl border border-gray-50 bg-gray-50/30">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-lg ${data.bg} ${data.color}`}>
                                                    <data.icon className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-xs font-black text-gray-700 uppercase tracking-wider">{name}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400">{data.count} deudores</span>
                                        </div>
                                        <div className="flex items-baseline justify-between">
                                            <span className={`text-sm font-black ${data.color}`}>
                                                {formatCurrency(data.total)}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400">
                                                {activeReport && activeReport.totalCartera > 0 ? Math.round((data.total / activeReport.totalCartera) * 100) : 0}% de la deuda
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-400 italic text-center py-4" > No hay datos de distribución legal.</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Top Deudores</h3>
                        <div className="space-y-4">
                            {activeReport?.debtors.slice(0, 5).map((d: any) => (
                                <div key={d.id} className="flex items-start gap-3">
                                    <div className={`w-1.5 h-1.5 mt-2 rounded-full shrink-0 ${d.etapaLegal === 'Jurídica' ? 'bg-red-500' : d.etapaLegal === 'Persuasiva' ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <p className="text-sm text-gray-900 font-bold">{d.unidad}</p>
                                            <p className="text-xs font-mono font-bold text-gray-800">{formatCurrency(d.totalPagar)}</p>
                                        </div>
                                        <p className="text-[10px] text-gray-400 truncate uppercase mt-0.5">{d.propietario}</p>
                                    </div>
                                </div>
                            ))}
                            {!activeReport && (
                                <p className="text-sm text-gray-400 italic text-center py-12" > No hay actividad reciente en este conjunto.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const KPICard = ({ title, value, change, trend, icon: Icon, color }: any) => {
    const colors: any = {
        indigo: 'bg-indigo-50 text-indigo-600',
        red: 'bg-red-50 text-red-600',
        orange: 'bg-orange-50 text-orange-600',
        emerald: 'bg-emerald-50 text-emerald-600',
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colors[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {change}
                </div>
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            </div>
        </div>
    );
};
