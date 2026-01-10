# Ciudad Jardín - Datos Reales

Esta carpeta contiene los documentos reales del conjunto residencial **Centro Comercial Ciudad Jardín**.

## 📁 Estructura

```
ciudad-jardin/
├── reportes-cartera/     # Reportes mensuales de cartera
├── cartas/               # Cartas de cobro (templates)
└── directorio/           # Información de propietarios
```

## 📊 Datos del Conjunto

- **Nombre**: Centro Comercial Ciudad Jardín
- **NIT**: 800239591
- **Tipo**: Centro comercial con locales y oficinas
- **Identificadores**: L101, L102, OF201, etc.

## 📄 Archivos Disponibles

### Reportes de Cartera
- `reporte_enero_2026.pdf` - Reporte completo de facturación enero 2026

### Cartas de Cobro
- Cartas de ejemplo usadas en diciembre 2025
- Tipos: Cobro Simple (CS), Cobro Persuasivo (CP), Jurídico/Abogado (AB)

## 🧮 Lógica de Análisis Actual

El sistema implementará la siguiente lógica basada en el proceso actual:

### Cálculo de Edad Vencida
```
Deuda_Vencida = (Total_A_Pagar - Cuota_Actual)
Edad_Vencida = Deuda_Vencida / Cuota_Actual (en meses)
```

### Clasificación de Tipo de Carta
- **AD (Al Día)**: Edad_Vencida ≤ 0
- **CS (Cobro Simple)**: 0 < Edad_Vencida ≤ 1
- **CP (Cobro Persuasivo)**: 1 < Edad_Vencida ≤ 2
- **AB (Jurídico/Abogado)**: Edad_Vencida > 2

### Estado Real
- 🟢 **Al Día**: Edad_Vencida ≤ 0
- 🟡 **Mora Baja/Técnica**: 0 < Edad_Vencida < 1
- 🟡 **Mora Moderada**: 1 ≤ Edad_Vencida < 3
- 🟠 **Riesgo Alto**: 3 ≤ Edad_Vencida < 6
- 🔴 **Crítico**: Edad_Vencida ≥ 6

## 📋 Instrucciones para Subir Archivos

1. **Reporte de Enero 2026**: Coloca el PDF/Excel en `reportes-cartera/`
2. **Cartas de Diciembre 2025**: Coloca los templates en `cartas/`
3. **Directorio** (opcional): Listado de propietarios en `directorio/`

Una vez subidos, el sistema podrá:
- Extraer datos de cada unidad
- Calcular edad vencida automáticamente
- Clasificar por tipo de carta
- Generar análisis de riesgo

---

**✅ Listo para recibir documentos de Ciudad Jardín**
