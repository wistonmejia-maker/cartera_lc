# Reportes Contables

Este directorio contiene ejemplos de reportes de contabilidad mensuales con saldos de unidades.

## Formato Esperado

Los reportes pueden venir en formato Excel (.xlsx) o CSV con al menos las siguientes columnas:

- **Unidad**: Número o identificador de la unidad (ej: "Apto 101", "101", "A-101")
- **Saldo Anterior**: Saldo del mes anterior
- **Cuota Administración**: Cuota ordinaria del mes
- **Otros Cargos**: Cuotas extraordinarias, intereses de mora, etc.
- **Pagos**: Pagos realizados en el mes
- **Saldo Actual**: Saldo final del mes

## Ejemplo de Estructura

```
| Unidad     | Saldo Anterior | Cuota Admin | Otros Cargos | Pagos    | Saldo Actual |
|------------|----------------|-------------|--------------|----------|--------------|
| Apto 101   | $500,000       | $280,000    | $0           | $780,000 | $0           |
| Apto 102   | $280,000       | $280,000    | $28,000      | $0       | $588,000     |
| Torre A-5  | $0             | $350,000    | $0           | $350,000 | $0           |
```

## Instrucciones

1. Coloca aquí los archivos de reporte mensual que recibes de contabilidad
2. El sistema puede importar múltiples formatos gracias al mapeo configurable de columnas
3. Los nombres de archivo sugeridos: `reporte_YYYYMM.xlsx` (ej: `reporte_202601.xlsx`)

## Notas

- Las columnas pueden tener nombres diferentes (el sistema permite mapearlas en la UI)
- Los formatos de números pueden variar ($1.234,56 o 1234.56) - el sistema los normaliza
- Si una unidad no existe en el maestro, se reportará como error en la importación
