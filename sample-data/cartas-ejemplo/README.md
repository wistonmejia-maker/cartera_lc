# Cartas de Ejemplo

Este directorio contiene templates de cartas de cobro según el nivel de mora.

## Templates Disponibles

### 1. Recordatorio Amistoso (15-30 días de mora)

**Archivo**: `carta_recordatorio_15d.docx`

Carta cordial recordando el pago pendiente. Tono amigable y preventivo.

### 2. Notificación Formal (30-60 días de mora)

**Archivo**: `carta_formal_30d.docx`

Carta formal indicando el monto adeudado y solicitando pago inmediato.

### 3. Aviso Pre-Jurídico (60-90 días de mora)

**Archivo**: `carta_prejuridica_60d.docx`

Carta advirtiendo el inicio de proceso pre-jurídico si no se regulariza el pago.

### 4. Notificación Jurídica (+90 días de mora)

**Archivo**: `carta_juridica_90d.docx`

Carta formal indicando inicio de cobro jurídico según Art. 51 Ley 675 de 2001.

## Variables Dinámicas

Las cartas pueden incluir variables que el sistema reemplaza automáticamente:

- `{{NOMBRE_PROPIETARIO}}`: Nombre del propietario
- `{{UNIDAD}}`: Número de unidad
- `{{MONTO_DEUDA}}`: Monto total adeudado
- `{{DIAS_MORA}}`: Días en mora
- `{{FECHA}}`: Fecha actual
- `{{NOMBRE_CONJUNTO}}`: Nombre del conjunto residencial
- `{{ADMINISTRADOR}}`: Nombre del administrador

## Ejemplo de Uso

```
Señor(a) {{NOMBRE_PROPIETARIO}}
Unidad: {{UNIDAD}}

Por medio de la presente le informamos que a la fecha presenta un saldo 
pendiente de {{MONTO_DEUDA}} correspondiente a {{DIAS_MORA}} días de mora...
```

## Personalización

Puedes modificar o agregar nuevas cartas según las necesidades específicas del conjunto.

## Formato

- Preferiblemente en formato .docx (Word)
- Mantener formato profesional
- Incluir membrete del conjunto residencial
- Citar artículos de Ley 675 cuando corresponda
