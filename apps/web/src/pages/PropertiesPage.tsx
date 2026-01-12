import { useState } from 'react';
import { Building2, Plus, Trash2, Edit3, CheckCircle2, Search } from 'lucide-react';
import { usePropertyStore } from '../stores/usePropertyStore';

export const PropertiesPage = () => {
    const {
        properties,
        addProperty,
        deleteProperty,
        setActiveProperty,
        activePropertyId,
        isLoading,
        error
    } = usePropertyStore();
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProperties = properties.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.settings.nit.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = async () => {
        if (newName.trim()) {
            try {
                await addProperty(newName.trim());
                setNewName('');
                setIsAdding(false);
            } catch (err) {
                // Error is handled by the store
            }
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`¿Estás seguro de eliminar el conjunto "${name}"? Se perderán todos sus reportes y datos.`)) {
            try {
                await deleteProperty(id);
            } catch (err) {
                // Error is handled by the store
            }
        }
    };

    return (
        <div className="space-y-8 pb-12 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-indigo-600" />
                        Gestión de Conjuntos
                    </h2>
                    <p className="text-gray-500 mt-1 font-medium">Administra múltiples propiedades inmobiliarias de forma independiente.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                    <Plus className="w-4 h-4" /> Nuevo Conjunto
                </button>
            </div>

            {/* Stats/Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                    <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Conjuntos</div>
                    <div className="text-3xl font-black text-gray-900">{properties.length}</div>
                </div>
                <div className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100 shadow-sm">
                    <div className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-1">Conjunto Activo</div>
                    <div className="text-xl font-black text-indigo-700 truncate">
                        {properties.find(p => p.id === activePropertyId)?.name || 'Ninguno'}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Estado del Sistema</div>
                    <div className="flex items-center gap-2 text-emerald-600 font-bold">
                        <CheckCircle2 className="w-5 h-5" /> En línea
                    </div>
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>
            </div>

            {/* Search & List */}
            <div className="space-y-4">
                <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o NIT..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-3xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none shadow-sm transition-all text-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredProperties.map((property) => (
                        <div
                            key={property.id}
                            className={`
                                bg-white p-6 rounded-[40px] border transition-all group relative
                                ${activePropertyId === property.id ? 'border-indigo-500 ring-4 ring-indigo-500/5 shadow-xl shadow-indigo-100/20' : 'border-gray-100 hover:border-gray-300 shadow-sm'}
                            `}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-50 transition-colors">
                                    <Building2 className={`w-6 h-6 ${activePropertyId === property.id ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-500'}`} />
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setActiveProperty(property.id)}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activePropertyId === property.id
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600'
                                            }`}
                                    >
                                        {activePropertyId === property.id ? 'Activo' : 'Activar'}
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-gray-900 mb-1 truncate">{property.name}</h3>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-6">
                                <span>NIT: {property.settings.nit}</span>
                                <span>•</span>
                                <span>{property.settings.city}</span>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                <div className="text-[10px] text-gray-400 font-medium">Creado: {new Date(property.createdAt).toLocaleDateString()}</div>
                                <div className="flex gap-2">
                                    {property.id !== 'ciudad-jardin-default' && (
                                        <button
                                            onClick={() => handleDelete(property.id, property.name)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { setActiveProperty(property.id); /* Redirect to settings? */ window.location.href = '/settings'; }}
                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                        title="Configurar"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal para añadir */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8">
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Añadir Nuevo Conjunto</h3>
                            <p className="text-gray-500 text-sm mb-6">Ingresa el nombre del conjunto residencial o comercial.</p>

                            <input
                                autoFocus
                                type="text"
                                placeholder="Nombre del Conjunto"
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-lg font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all mb-6"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            />

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAdd}
                                    className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                                >
                                    Crear Conjunto
                                </button>
                            </div>

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl animate-in fade-in slide-in-from-top-2">
                                    Error: {error}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
