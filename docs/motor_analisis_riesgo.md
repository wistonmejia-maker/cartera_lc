# Motor de Análisis de Riesgo - Cartera LC

Implementación de la lógica de análisis basada en el proceso actual de Ciudad Jardín.

## Modelo de Cálculo

### 1. Campos de Entrada (Por Unidad)

```typescript
interface UnidadInput {
  local_ofi: string;           // Ej: "L101", "OF202"
  propietario: string;
  saldoAnterior: number;       // Deuda acumulada mes anterior
  cuotaActual: number;         // Cuota administración mes actual
  interesesMora: number;       // Intereses por mora
  otros: number;               // Abonos (negativos) u otros cargos
  totalAPagar: number;         // Saldo final del recibo
}
```

### 2. Cálculos Intermedios

```typescript
// A. Deuda Vencida Neta
const deudaVencida = Math.max(0, totalAPagar - cuotaActual);

// B. Edad Vencida (en meses)
const edadVencida = cuotaActual > 0 
  ? Math.round((deudaVencida / cuotaActual) * 100) / 100
  : 0;
```

### 3. Clasificación de Tipo de Carta

```typescript
enum TipoCarta {
  AD = 'Al Día',
  CS = 'Cobro Simple',
  CP = 'Cobro Persuasivo',
  AB = 'Jurídico/Abogado'
}

function clasificarTipoCarta(edadVencida: number): TipoCarta {
  if (edadVencida <= 0) return TipoCarta.AD;
  if (edadVencida <= 1) return TipoCarta.CS;
  if (edadVencida <= 2) return TipoCarta.CP;
  return TipoCarta.AB;
}
```

### 4. Clasificación de Estado Real

```typescript
enum EstadoReal {
  AL_DIA = '🟢 Al Día',
  MORA_BAJA = '🟡 Mora Baja/Técnica',
  MORA_MODERADA = '🟡 Mora Moderada',
  RIESGO_ALTO = '🟠 Riesgo Alto',
  CRITICO = '🔴 Crítico'
}

function clasificarEstadoReal(edadVencida: number): EstadoReal {
  if (edadVencida <= 0) return EstadoReal.AL_DIA;
  if (edadVencida < 1) return EstadoReal.MORA_BAJA;
  if (edadVencida < 3) return EstadoReal.MORA_MODERADA;
  if (edadVencida < 6) return EstadoReal.RIESGO_ALTO;
  return EstadoReal.CRITICO;
}
```

## Tabla Maestra de Análisis de Riesgo

El sistema generará automáticamente la siguiente tabla:

| LOCAL/OFI | PROPIETARIO | SALDO ANTERIOR | CUOTA ACTUAL | INTERESES DE MORA | OTROS | TOTAL A PAGAR | EDAD VENCIDA | ESTADO REAL | TIPO DE CARTA |
|:----------|:------------|:---------------|:-------------|:------------------|:------|:--------------|:-------------|:------------|:--------------|
| L101      | Juan Pérez  | $500,000       | $280,000     | $0                | $0    | $780,000      | 1.79         | 🟡 Mora Moderada | CP |
| L102      | María López | $0             | $280,000     | $0                | $0    | $280,000      | 0.00         | 🟢 Al Día | AD |

## Integración con Base de Datos

Los campos calculados se almacenarán en el modelo `UnitBalance`:

```prisma
model UnitBalance {
  // ... otros campos
  
  // Campos de análisis
  deudaVencida    Decimal @db.Decimal(15, 2)  // Calculado
  edadVencida     Decimal @db.Decimal(5, 2)   // En meses
  tipoCarta       TipoCarta                     // AD, CS, CP, AB
  estadoReal      EstadoReal                    // Estado de riesgo
}

enum TipoCarta {
  AD  // Al Día
  CS  // Cobro Simple
  CP  // Cobro Persuasivo
  AB  // Jurídico/Abogado
}

enum EstadoReal {
  AL_DIA
  MORA_BAJA
  MORA_MODERADA
  RIESGO_ALTO
  CRITICO
}
```

## API Endpoints

```typescript
// Generar análisis de riesgo para un mes
POST /api/portfolio/analyze/:month
Response: {
  totalUnidades: 150,
  alDia: 120,
  moraBaja: 15,
  moraModerada: 10,
  riesgoAlto: 3,
  critico: 2,
  distribucionCartas: {
    AD: 120,
    CS: 15,
    CP: 10,
    AB: 5
  }
}

// Obtener tabla maestra
GET /api/portfolio/tabla-maestra/:month
Response: UnidadAnalisis[]
```

## Dashboard KPIs

El dashboard mostrará:

1. **Distribución por Estado Real** (gráfico de torta)
   - 🟢 Al Día: 80%
   - 🟡 Mora Baja: 10%
   - 🟡 Mora Moderada: 7%
   - 🟠 Riesgo Alto: 2%
   - 🔴 Crítico: 1%

2. **Distribución por Tipo de Carta** (barras)
   - AD: 120 unidades
   - CS: 15 unidades
   - CP: 10 unidades
   - AB: 5 unidades

3. **Top 10 Unidades en Riesgo**
   - Ordenadas por Edad Vencida descendente
   - Mostrar: Local, Propietario, Total A Pagar, Edad Vencida

## Generación de Cartas

```typescript
// Obtener unidades que requieren carta específica
GET /api/portfolio/cartas/:tipo/:month
// tipo = 'CS' | 'CP' | 'AB'

Response: {
  tipo: 'CP',
  mes: '2026-01',
  unidades: [
    {
      local: 'L101',
      propietario: 'Juan Pérez',
      totalAPagar: 780000,
      edadVencida: 1.79,
      template: 'carta_cobro_persuasivo.docx'
    }
  ]
}
```

---

**Implementación**: Este motor se desarrollará en `apps/api/src/services/analysis/RiskAnalysisEngine.ts`
