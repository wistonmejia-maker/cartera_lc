# Unidades Maestro

Este directorio contiene el listado maestro de todas las unidades del conjunto residencial.

## Formato Esperado

Archivo Excel (.xlsx) o CSV con las siguientes columnas:

- **Número Unidad**: Identificador único (ej: "Apto 101", "Local 5", "P-23")
- **Tipo**: Tipo de unidad (Apartamento, Casa, Local, Parqueadero, Depósito, Otro)
- **Coeficiente**: Coeficiente de copropiedad
- **Nombre Propietario** (opcional): Nombre del propietario actual
- **Email** (opcional): Email de contacto
- **Teléfono** (opcional): Teléfono de contacto
- **Activo**: Si/No (para unidades deshabilitadas)

## Ejemplo de Estructura

```
| Número Unidad | Tipo        | Coeficiente | Nombre Propietario    | Email                 | Activo |
|---------------|-------------|-------------|-----------------------|-----------------------|--------|
| Apto 101      | Apartamento | 0.006667    | Juan Pérez García     | juan.perez@email.com  | Sí     |
| Apto 102      | Apartamento | 0.006667    | María López Ruiz      | maria.lopez@email.com | Sí     |
| Local 5       | Comercial   | 0.015000    | Comercial XYZ S.A.S.  | contacto@xyz.com      | Sí     |
| P-15          | Parqueadero | 0.002000    | Ana Martínez          | ana.m@email.com       | Sí     |
| D-8           | Depósito    | 0.001000    | Carlos Rodríguez      | carlos.r@email.com    | No     |
```

## Instrucciones de Importación

1. Preparar archivo Excel con el listado completo de unidades
2. En la aplicación, ir a **Unidades → Importar Listado**
3. Seleccionar el archivo
4. Mapear columnas si los nombres son diferentes
5. Revisar preview de importación
6. Confirmar importación

## Mantenimiento

- **Actualización**: Cuando cambia un propietario, actualizar el registro
- **Nuevas Unidades**: Agregar fila en el Excel y re-importar
- **Unidades Inactivas**: Marcar como "No" en columna Activo (no se eliminan del sistema)

## Validaciones

El sistema valida:
- ✅ No hay números de unidad duplicados
- ✅ Coeficientes suman aproximadamente 1.0 (100%)
- ✅ Tipos de unidad son válidos
- ✅ Emails tienen formato correcto

## Notas

- Este es el archivo base del sistema - todos los reportes de cartera deben referenciar unidades que existan aquí
- Si importas un reporte contable con unidades que no están en el maestro, se generará un error
- El número de unidad debe ser EXACTAMENTE igual en todos los archivos (respetando mayúsculas, espacios, guiones)
