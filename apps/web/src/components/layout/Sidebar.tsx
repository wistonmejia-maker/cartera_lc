import { useNavigate, NavLink } from 'react-router-dom';
import { usePropertyStore } from '../../stores/usePropertyStore';
import {
    LayoutDashboard,
    Building2,
    Wallet,
    Mail,
    Upload,
    History,
    Settings,
    LogOut,
    PlusCircle,
    ChevronDown,
    ClipboardList
} from 'lucide-react';
import clsx from 'clsx';

export const Sidebar = () => {
    const navigate = useNavigate();
    const { properties, activePropertyId, setActiveProperty } = usePropertyStore();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
        { icon: Wallet, label: 'Cartera', to: '/portfolio' },
        { icon: Upload, label: 'Carga Excel', to: '/upload' },
        { icon: Mail, label: 'Cartas', to: '/letters' },
        { icon: History, label: 'Historial Cartas', to: '/letters/history' },
        { icon: ClipboardList, label: 'Relación de Cobro', to: '/legal' },
        { icon: Building2, label: 'Conjuntos', to: '/properties' }, // Logic: reuse icon or find better one
        { icon: Settings, label: 'Configuración', to: '/settings' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto z-10 hidden md:flex">
            {/* Logo Section */}
            <div className="p-6 flex items-center gap-3 border-b border-gray-100">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-200">
                    C
                </div>
                <div>
                    <h1 className="font-bold text-gray-800 text-lg leading-none">Cartera LC</h1>
                    <span className="text-xs text-gray-500 font-medium tracking-wide">PANEL DE CONTROL</span>
                </div>
            </div>

            {/* Property Selector */}
            <div className="p-4 border-b border-gray-50 bg-gray-50/30">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Conjunto Activo</div>
                <div className="relative group">
                    <select
                        value={activePropertyId || ''}
                        onChange={(e) => setActiveProperty(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none cursor-pointer shadow-sm transition-all pr-10"
                    >
                        {properties.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                </div>
                <button
                    onClick={() => navigate('/properties')}
                    className="flex items-center gap-1.5 mt-2 px-2 py-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                    <PlusCircle className="w-3 h-3" /> Añadir Conjunto...
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                                isActive
                                    ? "bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-200"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon
                                    className={clsx(
                                        "w-5 h-5 transition-colors",
                                        isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
                                    )}
                                />
                                {item.label}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                    <LogOut className="w-5 h-5" />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
};
