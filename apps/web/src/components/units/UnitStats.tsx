import { Building2, Home, Warehouse, Car } from 'lucide-react';
import { useUnitStore } from '../../stores/useUnitStore';
import { usePropertyStore } from '../../stores/usePropertyStore';
import { useMemo } from 'react';

export const UnitStats = () => {
    const { units } = useUnitStore();
    const { activePropertyId } = usePropertyStore();

    const filteredUnits = useMemo(() =>
        units.filter(u => u.propertyId === activePropertyId),
        [units, activePropertyId]);

    const total = filteredUnits.length;
    const apartments = filteredUnits.filter(u => u.type === 'Apartment').length;
    const houses = filteredUnits.filter(u => u.type === 'House').length;
    const commercial = filteredUnits.filter(u => u.type === 'Commercial').length;
    const parking = filteredUnits.filter(u => u.type === 'Parking').length;

    const stats = [
        { label: 'Total Unidades', value: total, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Apartamentos', value: apartments, icon: Home, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Casas', value: houses, icon: Warehouse, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Locales / Otros', value: commercial + parking, icon: Car, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${stat.bg}`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                        <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
