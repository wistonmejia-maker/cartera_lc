import { useState, useRef } from 'react';
import { Settings, Upload, RotateCcw, Save, Building2, User, FileText, Image, Gavel } from 'lucide-react';
import { usePropertyStore } from '../stores/usePropertyStore';
import { optimizeImage } from '../utils/imageOptimizer';

export const SettingsPage = () => {
    const { properties, activePropertyId, updatePropertySettings } = usePropertyStore();
    const activeProperty = properties.find(p => p.id === activePropertyId);
    const settings = activeProperty?.settings;
    const [activeTab, setActiveTab] = useState<'company' | 'admin' | 'lawyer' | 'footer'>('company');
    const [saved, setSaved] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isUploadingSignature, setIsUploadingSignature] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const signatureInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'signatureUrl') => {
        const file = e.target.files?.[0];
        console.log(`Starting upload for field: ${field}`, file);

        if (file && activePropertyId) {
            try {
                if (field === 'logoUrl') setIsUploadingLogo(true);
                else setIsUploadingSignature(true);

                // Optimize image: max 600px width, 0.8 quality
                const optimizedBase64 = await optimizeImage(file, 600, 0.8);
                console.log(`Image optimized for ${field}. Length: ${optimizedBase64.length}`);

                updatePropertySettings(activePropertyId, { [field]: optimizedBase64 });
                console.log(`Settings updated for ${field}`);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            } catch (error) {
                console.error('Error optimizing image:', error);
                alert('Hubo un error al procesar la imagen. Intenta con una más pequeña.');
            } finally {
                if (field === 'logoUrl') setIsUploadingLogo(false);
                else setIsUploadingSignature(false);
            }
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => handleImageUpload(e, 'logoUrl');
    const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => handleImageUpload(e, 'signatureUrl');

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const tabs = [
        { id: 'company', label: 'Empresa', icon: Building2 },
        { id: 'admin', label: 'Administrador', icon: User },
        { id: 'lawyer', label: 'Abogado', icon: Gavel },
        { id: 'footer', label: 'Pie de Página', icon: FileText },
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Settings className="w-8 h-8 text-indigo-600" />
                        Configuración: <span className="text-indigo-600 truncate">{activeProperty?.name}</span>
                    </h2>
                    <p className="text-gray-500 mt-1 font-medium">Personaliza el logo, encabezado y pie de página para este conjunto.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {/* Implement reset if needed */ }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Restablecer
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                        <Save className="w-4 h-4" />
                        {saved ? '¡Guardado!' : 'Guardar'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar Tabs */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Logo Upload */}
                    <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Image className="w-4 h-4 text-indigo-600" />
                            Logo de la Empresa
                        </h3>
                        <div
                            onClick={() => logoInputRef.current?.click()}
                            className="w-full aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/50 transition-all"
                        >
                            {activeProperty?.settings?.logoUrl ? (
                                <img
                                    src={activeProperty.settings.logoUrl}
                                    alt="Logo"
                                    className="max-w-full max-h-full object-contain p-4"
                                />
                            ) : (
                                <>
                                    {isUploadingLogo ? (
                                        <div className="animate-pulse flex flex-col items-center">
                                            <div className="h-8 w-8 bg-gray-200 rounded-full mb-2"></div>
                                            <div className="h-4 w-20 bg-gray-200 rounded"></div>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-gray-300 mb-2" />
                                            <span className="text-xs text-gray-400 text-center px-4">Click para subir logo</span>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                        <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                        />
                        {settings?.logoUrl && (
                            <button
                                onClick={() => activePropertyId && updatePropertySettings(activePropertyId, { logoUrl: '' })}
                                className="w-full mt-3 text-xs text-red-500 hover:text-red-700"
                            >
                                Eliminar logo
                            </button>
                        )}
                    </div>
                </div>

                {/* Form Content */}
                <div className="lg:col-span-9">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                        {activeTab === 'company' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Información de la Empresa</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Empresa</label>
                                        <input
                                            type="text"
                                            value={settings?.companyName || ''}
                                            onChange={(e) => activePropertyId && updatePropertySettings(activePropertyId, { companyName: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="Ej: Ciudad Jardín"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Subtítulo</label>
                                        <input
                                            type="text"
                                            value={settings?.companySubtitle || ''}
                                            onChange={(e) => activePropertyId && updatePropertySettings(activePropertyId, { companySubtitle: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="Ej: Centro Comercial"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">NIT</label>
                                        <input
                                            type="text"
                                            value={settings?.nit || ''}
                                            onChange={(e) => activePropertyId && updatePropertySettings(activePropertyId, { nit: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="Ej: 800.239.591-0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                                        <input
                                            type="text"
                                            value={settings?.city || ''}
                                            onChange={(e) => activePropertyId && updatePropertySettings(activePropertyId, { city: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="Ej: Santiago de Cali"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                                        <input
                                            type="text"
                                            value={settings?.address || ''}
                                            onChange={(e) => activePropertyId && updatePropertySettings(activePropertyId, { address: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="Ej: CALLE 18 No. 106 – 98"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email de Contacto</label>
                                        <input
                                            type="email"
                                            value={settings?.email || ''}
                                            onChange={(e) => activePropertyId && updatePropertySettings(activePropertyId, { email: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="Ej: contacto@empresa.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                                        <input
                                            type="text"
                                            value={settings?.phone || ''}
                                            onChange={(e) => activePropertyId && updatePropertySettings(activePropertyId, { phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="Ej: 316 4160835"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Total de Unidades (Censo)</label>
                                        <input
                                            type="number"
                                            value={settings?.totalUnits || 0}
                                            onChange={(e) => activePropertyId && updatePropertySettings(activePropertyId, { totalUnits: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="Ej: 250"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'admin' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Información del Administrador</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                                        <input
                                            type="text"
                                            value={settings?.adminName || ''}
                                            onChange={(e) => activePropertyId && updatePropertySettings(activePropertyId, { adminName: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="Ej: LISSETTE JOHANNA CAICEDO"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
                                        <input
                                            type="text"
                                            value={settings?.adminTitle || ''}
                                            onChange={(e) => activePropertyId && updatePropertySettings(activePropertyId, { adminTitle: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="Ej: Administradora"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono del Administrador</label>
                                        <input
                                            type="text"
                                            value={settings?.adminPhone || ''}
                                            onChange={(e) => activePropertyId && updatePropertySettings(activePropertyId, { adminPhone: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="Ej: +57 316-4160835"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email del Administrador</label>
                                        <input
                                            type="email"
                                            value={settings?.adminEmail || ''}
                                            onChange={(e) => activePropertyId && updatePropertySettings(activePropertyId, { adminEmail: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="Ej: admin@empresa.com"
                                        />
                                    </div>

                                    <div className="md:col-span-2 pt-4 border-t border-gray-100">
                                        <label className="block text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                            <Image className="w-4 h-4 text-indigo-600" />
                                            Firma Digital del Administrador
                                        </label>

                                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                                            <div
                                                onClick={() => signatureInputRef.current?.click()}
                                                className="w-full sm:w-64 h-32 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/50 transition-all overflow-hidden"
                                            >
                                                {settings?.signatureUrl ? (
                                                    <img
                                                        src={settings.signatureUrl}
                                                        alt="Firma"
                                                        className="max-w-full max-h-full object-contain p-2"
                                                    />
                                                ) : (
                                                    <>
                                                        {isUploadingSignature ? (
                                                            <div className="animate-pulse flex flex-col items-center">
                                                                <div className="h-6 w-6 bg-gray-200 rounded-full mb-2"></div>
                                                                <div className="h-3 w-16 bg-gray-200 rounded"></div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <Upload className="w-6 h-6 text-gray-300 mb-2" />
                                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Subir Firma</span>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            <div className="flex-1 space-y-4">
                                                <p className="text-xs text-gray-500 leading-relaxed">
                                                    Sube una imagen de la firma (preferiblemente fondo transparente PNG).
                                                    Esta se mostrará automáticamente en todas las cartas generadas.
                                                </p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => signatureInputRef.current?.click()}
                                                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200 transition-all"
                                                    >
                                                        {settings?.signatureUrl ? 'Cambiar Imagen' : 'Seleccionar Archivo'}
                                                    </button>
                                                    {settings?.signatureUrl && (
                                                        <button
                                                            onClick={() => activePropertyId && updatePropertySettings(activePropertyId, { signatureUrl: '' })}
                                                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-all"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'lawyer' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Gavel className="w-5 h-5 text-indigo-600" />
                                    Información del Abogado / Firma
                                </h3>
                                <p className="text-xs text-gray-500 mb-6">
                                    Configura los datos del abogado predeterminado para este conjunto.
                                    Estos datos se usarán automáticamente al iniciar procesos jurídicos.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Abogado o Firma</label>
                                        <input
                                            type="text"
                                            value={settings?.lawyerName || ''}
                                            onChange={(e) => activePropertyId && updatePropertySettings(activePropertyId, { lawyerName: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
                                            placeholder="Ej: Dr. Fernando Gallego o Firma Jurídica S.A.S"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email del Abogado</label>
                                        <input
                                            type="email"
                                            value={settings?.lawyerEmail || ''}
                                            onChange={(e) => activePropertyId && updatePropertySettings(activePropertyId, { lawyerEmail: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="Ej: abogado@juridico.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono del Abogado</label>
                                        <input
                                            type="text"
                                            value={settings?.lawyerPhone || ''}
                                            onChange={(e) => activePropertyId && updatePropertySettings(activePropertyId, { lawyerPhone: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="Ej: 300 123 4567"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'footer' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Pie de Página y Notas</h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Texto CC (Copia a)</label>
                                        <input
                                            type="text"
                                            value={settings?.ccText || ''}
                                            onChange={(e) => activePropertyId && updatePropertySettings(activePropertyId, { ccText: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="Ej: CC: Archivo – Asesoría Legal"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Texto adicional del pie de página</label>
                                        <textarea
                                            value={settings?.footerText || ''}
                                            onChange={(e) => activePropertyId && updatePropertySettings(activePropertyId, { footerText: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                                            placeholder="Notas legales adicionales (opcional)"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <input
                            ref={signatureInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleSignatureUpload}
                            className="hidden"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
