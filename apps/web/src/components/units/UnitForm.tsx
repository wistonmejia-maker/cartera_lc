import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Unit, UnitType } from '../../stores/useUnitStore';
import { useUnitStore } from '../../stores/useUnitStore';
import { usePropertyStore } from '../../stores/usePropertyStore';

interface UnitFormProps {
    isOpen: boolean;
    onClose: () => void;
    editingUnit?: Unit | null;
}

export const UnitForm = ({ isOpen, onClose, editingUnit }: UnitFormProps) => {
    const { addUnit, updateUnit } = useUnitStore();
    const { activePropertyId } = usePropertyStore();

    // Initial State - removed propertyId and id since they are added later
    const initialState: any = {
        number: '',
        type: 'Apartment',
        coefficient: 0,
        ownerName: '',
        email: '',
        phone: '',
        status: 'Active'
    };

    const [formData, setFormData] = useState(initialState);

    // Reset or Populate form on open
    useEffect(() => {
        if (editingUnit) {
            setFormData(editingUnit);
        } else {
            setFormData(initialState);
        }
    }, [editingUnit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUnit) {
            updateUnit(editingUnit.id, formData);
        } else if (activePropertyId) {
            addUnit(activePropertyId, formData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="absolute inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none">
                <div className="w-screen max-w-md pointer-events-auto">
                    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white shadow-xl animate-in slide-in-from-right duration-300">

                        {/* Header */}
                        <div className="px-6 py-6 bg-indigo-600 text-white flex items-center justify-between">
                            <h2 className="text-xl font-semibold">
                                {editingUnit ? 'Editar Unidad' : 'Nueva Unidad'}
                            </h2>
                            <button type="button" onClick={onClose} className="p-2 hover:bg-indigo-500 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">

                            {/* Unidad Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Información de la Propiedad</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Número de Unidad</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="Ej: Apto 101"
                                        value={formData.number}
                                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value as UnitType })}
                                        >
                                            <option value="Apartment">Apartamento</option>
                                            <option value="House">Casa</option>
                                            <option value="Commercial">Local Comercial</option>
                                            <option value="Parking">Parqueadero</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Coeficiente</label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={formData.coefficient}
                                            onChange={(e) => setFormData({ ...formData, coefficient: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Propietario Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Detalles del Propietario</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Nombre del propietario"
                                        value={formData.ownerName}
                                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(Opcional)</span></label>
                                    <input
                                        type="email"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="ejemplo@email.com"
                                        value={formData.email || ''}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                                        checked={formData.status === 'Active'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'Active' : 'Inactive' })}
                                    />
                                    <span className="text-sm text-gray-700">Unidad Activa (Genera cobro)</span>
                                </label>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                            >
                                {editingUnit ? 'Guardar Cambios' : 'Crear Unidad'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};
