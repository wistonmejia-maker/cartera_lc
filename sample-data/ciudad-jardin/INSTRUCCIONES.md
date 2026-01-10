# Instrucciones para Subir Documentos de Ciudad Jardín

## 📂 Ubicación de Archivos

Sube tus documentos en las siguientes carpetas:

```
cartera-lc/sample-data/ciudad-jardin/
├── reportes-cartera/    ← Reporte de enero 2026
├── cartas/              ← Cartas de ejemplo dic 2025
└── directorio/          ← Info de propietarios (opcional)
```

## 📄 Archivos Esperados

### 1. Reporte de Cartera - Enero 2026

**Carpeta**: `reportes-cartera/`  
**Formato**: PDF o Excel  
**Nombre sugerido**: `reporte_enero_2026.pdf`

**Debe contener por cada unidad**:
- LOCAL/OFI (ej: L101, OF202)
- PROPIETARIO
- SALDO ANTERIOR
- CUOTA ACTUAL (Cuota administración)
- INTERESES DE MORA
- OTROS (abonos/cargos)
- TOTAL A PAGAR

### 2. Cartas de Ejemplo - Diciembre 2025

**Carpeta**: `cartas/`  
**Formato**: Word (.docx) o PDF  

**Tipos de cartas**:
- **AD (Al Día)**: Para unidades sin mora
- **CS (Cobro Simple)**: Mora 0-1 mes
- **CP (Cobro Persuasivo)**: Mora 1-2 meses
- **AB (Jurídico/Abogado)**: Mora >2 meses

**Nombres sugeridos**:
- `carta_cobro_simple.docx`
- `carta_cobro_persuasivo.docx`
- `carta_juridico.docx`

### 3. Directorio de Propietarios (Opcional)

**Carpeta**: `directorio/`  
**Formato**: Excel o CSV  

**Columnas**:
- LOCAL/OFI
- Nombre Propietario
- Email
- Teléfono
- Coeficiente (si aplica)

---

## 🚀 Qué Hago Después de Subir

Una vez subas los archivos, te ayudaré a:

1. **Extraer datos del reporte**: Parsear el PDF/Excel de enero 2026
2. **Calcular aged vencida**: Aplicar la fórmula `Deuda_Venci da / Cuota_Actual`
3. **Clasificar unidades**: Asignar tipo de carta y estado real
4. **Generar tabla maestra**: Crear análisis de riesgo completo
5. **Crear dashboard**: Visualizar KPIs y distribución

---

## 📋 Checklist

Marca los archivos que tienes listos:

- [ ] Reporte de cartera enero 2026
- [ ] Cartas de ejemplo diciembre 2025
- [ ] Directorio de propietarios (opcional)

---

**¿Listo para empezar?** Sube los archivos y te ayudo a procesarlos.
