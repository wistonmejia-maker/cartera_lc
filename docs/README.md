# Documentación Técnica - Cartera LC

Este directorio contiene la documentación técnica del proyecto.

## Archivos de Arquitectura

Los siguientes documentos están en la carpeta de diseño del proyecto:

- **`implementation_plan.md`**: Plan de implementación completo con modelo de datos, arquitectura de componentes, APIs, y roadmap
- **`architecture_diagram.md`**: Diagramas visuales de la arquitecturadel sistema

## Guías de Desarrollo

### Configuración Inicial

1. **Clonar el repositorio**
2. **Instalar dependencias**: `npm install` en la raíz
3. **Configurar base de datos**: Ver `apps/api/README.md`
4. **Ejecutar migraciones**: `npm run db:push --workspace=apps/api`
5. **Iniciar desarrollo**: `npm run dev`

### Flujo de Trabajo

1. **Importar Unidades**: Cargar listado maestro desde `sample-data/unidades-maestro/`
2. **Cargar Reporte Mensual**: Subir Excel de contabilidad
3. **Mapear Columnas**: Configurar correspondencia de columnas
4. **Analizar**: El sistema genera automáticamente aging y recomendaciones

### Modelo de Datos

Ver schema completo en `apps/api/prisma/schema.prisma`

Modelos principales:
- `Config`: Configuración del conjunto
- `Unit`: Unidades inmobiliarias
- `UnitBalance`: Saldos mensuales por unidad
- `UnitNote`: Notas de seguimiento
- `UploadHistory`: Historial de cargas
- `PortfolioAnalysis`: Análisis generado automáticamente

### API Reference

Ver endpoints completos en plan de implementación.

Base URL: `http://localhost:3000/api`

Principales grupos:
- `/config` - Configuración
- `/units` - Unidades
- `/balances` - Saldos
- `/uploads` - Cargas de archivos
- `/portfolio` - Análisis de cartera
- `/notes` - Notas
- `/reports` - Reportes

### Desarrollo de Features

1. Crear rama: `git checkout -b feature/nombre-feature`
2. Implementar backend (API + servicio + modelo si aplica)
3. Implementar frontend (página + componentes + store)
4. Probar localmente
5. Commit y push

### Testing

```bash
# Backend tests
cd apps/api
npm test

# Frontend tests (cuando se implementen)
cd apps/web
npm test
```

## Referencias Normativas

- **Ley 675 de 2001**: Régimen de Propiedad Horizontal en Colombia
- **Art. 51**: Cobro de expensas comunes (>90 días mora)
- **Decreto 1228 de 2015**: Reglamentación adicional

## Contacto

Para dudas técnicas, contactar al equipo de desarrollo.
