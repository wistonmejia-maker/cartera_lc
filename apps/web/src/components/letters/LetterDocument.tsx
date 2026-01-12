import { useMemo } from 'react';
import { CheckCircle2, Phone, Mail, MapPin } from 'lucide-react';
import { replaceLetterVariables, type LetterTemplate } from '../../utils/letterTemplates';
import { usePropertyStore } from '../../stores/usePropertyStore';

interface LetterDocumentProps {
    template: LetterTemplate;
    data: {
        NOMBRE_PROPIETARIO: string;
        UNIDAD: string;
        SALDO_ANTERIOR: string;
        CUOTA_ACTUAL: string;
        INTERESES_MORA: string;
        OTROS: string;
        TOTAL_PAGAR: string;
        FECHA: string;
        FECHA_LIMITE: string;
        MES_COBRO: string;
        TOTAL_LETRAS: string;
        NOMBRE_CONJUNTO: string;
        EMAIL?: string;
    };
    consecutivo: string;
    isGenerated?: boolean;
}

const FinancialTable = ({ data }: { data: LetterDocumentProps['data'] }) => (
    <div style={{ margin: '32px 0', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '12px 24px' }}>
            <h4 style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#cbd5e1', margin: '0' }}>Estado de Cuenta Actual</h4>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff' }}>
            <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 24px', color: '#64748b', fontWeight: '500', fontSize: '14px' }}>Saldo Anterior Acumulado</td>
                    <td style={{ padding: '12px 24px', textAlign: 'right', fontWeight: '700', color: '#334155', fontSize: '14px' }}>{data.SALDO_ANTERIOR}</td>
                </tr>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 24px', color: '#64748b', fontWeight: '500', fontSize: '14px' }}>Cuota Ordinaria del Mes</td>
                    <td style={{ padding: '12px 24px', textAlign: 'right', fontWeight: '700', color: '#334155', fontSize: '14px' }}>{data.CUOTA_ACTUAL}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 24px', color: '#64748b', fontWeight: '500', fontSize: '14px' }}>Intereses por Mora</td>
                    <td style={{ padding: '12px 24px', textAlign: 'right', fontWeight: '700', color: '#e11d48', fontSize: '14px' }}>{data.INTERESES_MORA}</td>
                </tr>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 24px', color: '#64748b', fontWeight: '500', fontSize: '14px' }}>Otros Conceptos / Ajustes</td>
                    <td style={{ padding: '12px 24px', textAlign: 'right', fontWeight: '700', color: '#334155', fontSize: '14px' }}>{data.OTROS}</td>
                </tr>
                <tr style={{ backgroundColor: '#f1f5f9', borderTop: '2px solid #e2e8f0' }}>
                    <td style={{ padding: '16px 24px', color: '#0f172a', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '14px' }}>Total Neto Exigible</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#047857', lineHeight: '1' }}>{data.TOTAL_PAGAR}</div>
                        <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginTop: '4px', letterSpacing: '-0.02em' }}>Moneda Legal Colombiana</div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
);

export const LetterDocument = ({ template, data, consecutivo, isGenerated }: LetterDocumentProps) => {
    const { properties, activePropertyId } = usePropertyStore();
    const activeProperty = properties.find(p => p.id === activePropertyId);

    const settings = activeProperty?.settings || {
        companyName: 'Conjunto Residencial',
        companySubtitle: 'Residencial',
        nit: '-',
        address: '-',
        city: 'Cali',
        email: '',
        phone: '',
        adminName: '',
        adminTitle: 'Administrador/a',
        adminEmail: '',
        adminPhone: '',
        logoUrl: '',
        signatureUrl: '',
        footerText: '',
        ccText: 'CC: Archivo',
    };

    const renderedBodyParts = useMemo(() => {
        const bodyWithVars = replaceLetterVariables(template.content, {
            ...data,
            NOMBRE_CONJUNTO: data.NOMBRE_CONJUNTO || settings.companyName
        });
        return bodyWithVars.split('{{TABLA_DESGLOSE}}');
    }, [template.content, data, settings.companyName]);
    const processedSubject = useMemo(() => {
        return replaceLetterVariables(template.subject, {
            ...data,
            NOMBRE_CONJUNTO: data.NOMBRE_CONJUNTO || settings.companyName
        }).toUpperCase();
    }, [template.subject, data, settings.companyName]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            textAlign: 'left',
            margin: '0 auto',
            minHeight: '29.7cm',
            width: '21cm',
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontSize: '14.5px',
            lineHeight: '1.5',
            fontFamily: "'Inter', sans-serif",
            padding: '2.5cm 2.5cm 2cm 2.5cm', /** Balanced A4 margins */
            position: 'relative',
        }}>
            {/* Membrete (Logo & NIT) - Integrated in top margin area */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
                {settings.logoUrl ? (
                    <img
                        src={settings.logoUrl}
                        alt="Logo"
                        style={{ height: '80px', objectFit: 'contain', marginBottom: '12px' }}
                    />
                ) : (
                    <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                        <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.4em', fontWeight: '900', color: '#94a3b8', lineHeight: '1' }}>{settings.companySubtitle}</div>
                        <div style={{ fontWeight: '900', fontSize: '28px', letterSpacing: '-0.02em', marginTop: '6px', color: '#0f172a' }}>{settings.companyName.toUpperCase()}</div>
                    </div>
                )}
                <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.2em', color: '#64748b' }}>NIT: {settings.nit}</div>
            </div>

            {/* Content Body */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', paddingBottom: '40px' }}>

                {/* Date & Reference Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                    <div style={{ color: '#334155', fontWeight: '500' }}>
                        {settings.city}, {data.FECHA}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px', color: '#94a3b8' }}>Referencia Externa</div>
                        <div style={{ fontWeight: '900', letterSpacing: '-0.01em', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                            <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '4px', fontWeight: '800', textTransform: 'uppercase', backgroundColor: '#f1f5f9', color: '#475569' }}>{template.id}</span>
                            #{consecutivo.includes('-') ? consecutivo.split('-')[1] : consecutivo}
                            {!isGenerated && <span style={{ fontSize: '11px', marginLeft: '10px', fontWeight: '400', fontStyle: 'italic', color: '#f43f5e' }}>(Borrador)</span>}
                        </div>
                    </div>
                </div>

                {/* Recipient - Standard Formal Style */}
                <div style={{ marginBottom: '30px', paddingLeft: '0' }}>
                    <div style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '10px', color: '#94a3b8' }}>Información del Destinatario</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px', color: '#64748b' }}>Señor(a):</div>
                    <div style={{ fontWeight: '900', fontSize: '18px', textTransform: 'uppercase', lineHeight: '1', marginBottom: '6px', color: '#0f172a' }}>{data.NOMBRE_PROPIETARIO}</div>
                    <div style={{ fontWeight: '700', marginBottom: '4px', fontSize: '14px', color: '#334155' }}>Unidad: <span style={{ color: '#4f46e5' }}>{data.UNIDAD}</span></div>
                    <div style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b' }}>{settings.companySubtitle} {settings.companyName}</div>
                </div>

                {/* Subject - Formal & Centered */}
                <div style={{ marginBottom: '30px', padding: '14px 0', borderTop: '2px solid #f1f5f9', borderBottom: '2px solid #f1f5f9' }}>
                    <div style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '6px', color: '#94a3b8', textAlign: 'center' }}>Asunto Oficial</div>
                    <div style={{ fontWeight: '900', fontSize: '15px', textTransform: 'uppercase', color: '#1e293b', textAlign: 'center', lineHeight: '1.4' }}>
                        {processedSubject}
                    </div>
                </div>

                {/* Body - Fully Dynamic */}
                <div style={{ flex: '1' }}>
                    <div style={{ color: '#334155', lineHeight: '1.8', fontSize: '15px', textAlign: 'justify' }}>
                        {renderedBodyParts.map((part, index) => (
                            <span key={index}>
                                <span style={{ whiteSpace: 'pre-wrap' }}>{part}</span>
                                {index < renderedBodyParts.length - 1 && (
                                    <FinancialTable data={data} />
                                )}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Signature Section */}
                <div style={{ marginTop: '48px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                        <div style={{ flex: '1', maxWidth: '320px' }}>
                            {settings.signatureUrl ? (
                                <div style={{ height: '64px', marginBottom: '8px', display: 'flex', alignItems: 'flex-end' }}>
                                    <img
                                        src={settings.signatureUrl}
                                        alt="Firma"
                                        style={{ maxHeight: '100%', objectFit: 'contain' }}
                                    />
                                </div>
                            ) : (
                                <div style={{ fontStyle: 'italic', fontSize: '24px', marginBottom: '4px', opacity: '0.6', fontFamily: "'Dancing Script', cursive", color: '#94a3b8' }}>
                                    {settings.adminName.split(' ').slice(0, 2).join(' ')}
                                </div>
                            )}
                            <div style={{ height: '2px', width: '100%', marginBottom: '12px', backgroundColor: '#0f172a' }}></div>
                            <div style={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '14px', color: '#0f172a' }}>{settings.adminName}</div>
                            <div style={{ color: '#4f46e5', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '2px' }}>{settings.adminTitle}</div>
                            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '6px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Phone style={{ width: '10px', height: '10px', color: '#94a3b8' }} />
                                    {settings.adminPhone}
                                </div>
                                <div style={{ width: '1px', height: '10px', backgroundColor: '#e2e8f0' }}></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Mail style={{ width: '10px', height: '10px', color: '#94a3b8' }} />
                                    {settings.adminEmail}
                                </div>
                            </div>

                            {settings.ccText && (
                                <div style={{ marginTop: '20px', fontSize: '11px', fontWeight: '600', color: '#64748b' }}>
                                    {settings.ccText}
                                </div>
                            )}
                        </div>
                        <div style={{ width: '96px', height: '96px', borderRadius: '50%', border: '2px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: '0.4' }}>
                            <CheckCircle2 style={{ width: '48px', height: '48px', color: '#059669' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Professional Footer - Positioned relative to bottom margin */}
            <div style={{ padding: '15px 0 0 0', borderTop: '1px solid #e2e8f0', marginTop: 'auto', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '500', color: '#0f172a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <MapPin style={{ width: '12px', height: '12px', color: '#94a3b8' }} />
                        {settings.address}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                        <Mail style={{ width: '12px', height: '12px', color: '#94a3b8' }} />
                        <span style={{ fontWeight: '600', color: '#0f172a' }}>{settings.email}</span>
                    </div>
                    {settings.footerText && (
                        <div style={{ marginTop: '8px', fontSize: '9px', color: '#94a3b8', fontStyle: 'italic', maxWidth: '80%', textAlign: 'center' }}>
                            {settings.footerText}
                        </div>
                    )}
                </div>
                <div style={{ position: 'absolute', bottom: '2cm', right: '2.5cm', textAlign: 'right', opacity: '0.3' }}>
                    <div style={{ fontSize: '8px', fontWeight: '900', textTransform: 'uppercase', color: '#94a3b8' }}>GCP: Gestión de Cartera</div>
                    <div style={{ fontSize: '14px', fontWeight: '900', color: '#cbd5e1' }}>V2.6</div>
                </div>
            </div>
        </div>
    );
};
