# Guía Rápida: Subir tus Documentos

Esta guía te ayudará a organizar los documentos de entrada para **Cartera LC**.

## 📁 Estructura de Carpetas

```
cartera-lc/
└── sample-data/
    ├── unidades-maestro/         ← Listado completo de unidades
    ├── directorio-residentes/    ← Información de propietarios
    ├── reportes-contables/       ← Reportes mensuales de saldos
    └── cartas-ejemplo/           ← Templates de cartas de cobro
```

## 🚀 Paso a Paso

### 1. Listado Maestro de Unidades

**Ubicación**: `sample-data/unidades-maestro/`

**Qué subir**: Excel o CSV con TODAS las unidades del conjunto

**Columnas requeridas**:
- Número Unidad (ej: "Apto 101", "Local 5")
- Tipo (Apartamento, Casa, Comercial, Parqueadero, Depósito)
- Coeficiente de copropiedad

**Columnas opcionales**:
- Nombre Propietario
- Email
- Teléfono
- Activo (Sí/No)

**Ejemplo de nombre**: `unidades_conjunto_xyz.xlsx`

---

### 2. Directorio de Residentes

**Ubicación**: `sample-data/directorio-residentes/`

**Qué subir**: Excel o CSV con información de contacto de propietarios

**Columnas**:
- Unidad
- Nombre Propietario
- Email
- Teléfono
- Coeficiente (opcional, si no está en el maestro)

**Ejemplo de nombre**: `contactos_propietarios.xlsx`

---

### 3. Reportes Contables Mensuales

**Ubicación**: `sample-data/reportes-contables/`

**Qué subir**: Reportes de saldos que envía contabilidad cada mes

**Formato**: Excel o CSV  
**Frecuencia**: Un archivo por mes

**Columnas típicas** (pueden variar):
- Unidad
- Saldo Anterior
- Cuota Administración
- Cuota Extraordinaria (si aplica)
- Intereses de mora (si aplica)
- Pagos
- Saldo Actual

**Ejemplo de nombre**: `reporte_enero_2026.xlsx` o `saldos_202601.xlsx`

**⚠️ IMPORTANTE**: 
- Los números de unidad deben coincidir EXACTAMENTE con el maestro
- Si el reporte dice "101" y el maestro dice "Apto 101", habrá errores
- El sistema te permitirá mapear columnas si tienen nombres diferentes

---

### 4. Cartas de Ejemplo (Opcional)

**Ubicación**: `sample-data/cartas-ejemplo/`

**Qué subir**: Templates de Word (.docx) para diferentes niveles de mora

**Cartas sugeridas**:
1. `carta_recordatorio_15d.docx` - Recordatorio amistoso (15-30 días)
2. `carta_formal_30d.docx` - Notificación formal (30-60 días)
3. `carta_prejuridica_60d.docx` - Aviso pre-jurídico (60-90 días)
4. `carta_juridica_90d.docx` - Cobro jurídico (+90 días)

**Variables disponibles** (el sistema las reemplaza automáticamente):
- `{{NOMBRE_PROPIETARIO}}`
- `{{UNIDAD}}`
- `{{MONTO_DEUDA}}`
- `{{DIAS_MORA}}`
- `{{FECHA}}`
- `{{NOMBRE_CONJUNTO}}`

---

## 📋 Checklist de Archivos

Marca los archivos que tienes listos para subir:

- [ ] Listado maestro de unidades
- [ ] Directorio de residentes (contactos)
- [ ] Reporte contable del último mes
- [ ] Reportes contables de meses anteriores (histórico)
- [ ] Cartas de cobro (templates)

## 🎯 Orden Recomendado de Carga

1. **Primero**: Listado maestro de unidades
2. **Segundo**: Directorio de residentes
3. **Tercero**: Reportes contables (empezar por el más reciente)
4. **Cuarto**: Cartas de ejemplo (opcional)

## ❓ Preguntas Frecuentes

**P: ¿Qué hago si mis reportes tienen columnas con nombres raros?**  
R: No problem, el sistema te permitirá mapear columnas. Ejemplo: "SALDO_ANT" → "Saldo Anterior"

**P: ¿Puedo subir reportes de varios meses a la vez?**  
R: Sí, pero es mejor hacerlo uno por uno para verificar que cada importación sea correcta.

**P: ¿Qué pasa si una unidad está en el reporte pero no en el maestro?**  
R: El sistema te mostrará un error indicando qué unidades faltan. Debes agregarlas primero al maestro.

**P: ¿Los formatos de montos importan ($1.234,56 vs 1234.56)?**  
R: No, el sistema normaliza automáticamente diferentes formatos de moneda.

---

## 📞 ¿Necesitas Ayuda?

Si tienes dudas sobre cómo estructurar tus archivos, consulta los README.md dentro de cada carpeta de `sample-data/` para ver ejemplos detallados.

---

**¡Listo para empezar! 🎉**

Una vez tengas los archivos en las carpetas correspondientes, el sistema los podrá importar desde la interfaz web.
