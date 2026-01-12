export type LetterType = 'CS' | 'CP' | 'AB';

export interface LetterTemplate {
    id: LetterType;
    title: string;
    subject: string;
    content: string;
}

export const LETTER_TEMPLATES: LetterTemplate[] = [
    {
        id: 'CS',
        title: 'Cobro Simple',
        subject: 'RECORDATORIO PREVENTIVO DE PAGO - MES DE {{MES_COBRO}}',
        content: `Respetado(a) propietario(a):

Reciba un cordial saludo de parte de la Administración.

En cumplimiento de nuestro ciclo de facturación mensual (Corte al día 1 y entrega en los primeros 5 días), le informamos que la unidad {{UNIDAD}} registra los siguientes saldos pendientes: 

{{TABLA_DESGLOSE}}

Lo invitamos a normalizar su estado de cuenta antes del **{{FECHA_LIMITE}}** para evitar el incremento por intereses de mora (Art. 30 Ley 675 de 2001) y asegurar la sostenibilidad de nuestra comunidad.

Si ya realizó el pago, por favor remita el soporte al correo de administración y haga caso omiso de este mensaje.`
    },
    {
        id: 'CP',
        title: 'Cobro Persuasivo',
        subject: 'NOTIFICACIÓN DE MORA Y COMUNICACIÓN PERSUASIVA - {{MES_COBRO}}',
        content: `Cordial saludo:

Como es de su conocimiento, los estados de cuenta se emiten los primeros días de cada mes. Lamentamos informarle que, a pesar de los recordatorios, la unidad {{UNIDAD}} presenta una mora acumulada superior a 30 días, lo cual afecta directamente el presupuesto de mantenimiento y seguridad del conjunto.

A la fecha, su obligación pendiente asciende a la suma de **{{TOTAL_PAGAR}} ({{TOTAL_LETRAS}})**.

Le recordamos que, según el Artículo 29 de la Ley 675 de 2001, el pago de expensas comunes es una obligación irrenunciable que garantiza la convivencia y conservación de los bienes comunes.

Lo instamos a realizar el pago total o acercarse a la oficina de administración para suscribir un acuerdo de pago en un plazo no mayor al **{{FECHA_LIMITE}}**, evitando así el traslado de su cuenta a cobro jurídico y la posible suspensión de servicios comunes no esenciales según reglamento.`
    },
    {
        id: 'AB',
        title: 'Cobro Jurídico',
        subject: 'ÚLTIMA NOTIFICACIÓN PREVIA A ACCIÓN JUDICIAL (MOROSIDAD > 60 DÍAS)',
        content: `Respetado(a) Propietario(a):

La Administración, en cumplimiento de las facultades otorgadas por el Artículo 51 de la Ley 675 de 2001, le notifica que debido al persistente incumplimiento en sus obligaciones (Mora superior a 60 días), su estado de cuenta ha pasado a la etapa de REQUERIMIENTO PRE-JURÍDICO.

La suma total exigible a la fecha es de **{{TOTAL_PAGAR}} ({{TOTAL_LETRAS}})**, correspondientes a capital, intereses de mora y demás cargos de administración.

Esta es su ÚLTIMA OPORTUNIDAD de resolver esta situación de manera directa con la copropiedad. De no registrarse el pago total a más tardar el **{{FECHA_LIMITE}}**, iniciaremos formalmente el PROCESO EJECUTIVO ante los juzgados civiles, lo cual implicará:

1. Solicitud de medidas cautelares (Embargo de unidad, salarios y cuentas).
2. Incremento de la deuda por Honorarios de Abogado (aprox. 15-20%).
3. Reporte en centrales de riesgo por incumplimiento de obligaciones civiles (previo aviso).

Evite costos judiciales y el embargo de su patrimonio mediante el pago inmediato.`
    }
];

export const replaceLetterVariables = (content: string, data: Record<string, string>) => {
    let result = content;
    Object.entries(data).forEach(([key, value]) => {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return result;
};

export const getSuggestedLetterType = (totalDebt: number, monthlyFee: number): LetterType => {
    // Precise logic based on user's confirmed ranges:
    // CS (<30d) -> ~ < 1 month
    // CP (31-60d) -> ~ 1-2 months
    // AB (>60d) -> ~ > 2 months
    const monthsInArrears = totalDebt / (monthlyFee || 1);

    if (monthsInArrears <= 1) return 'CS';
    if (monthsInArrears <= 2) return 'CP';
    return 'AB';
};
