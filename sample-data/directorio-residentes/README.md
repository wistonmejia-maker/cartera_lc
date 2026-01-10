# Directorio de Residentes

Este directorio contiene información de contacto de los propietarios/residentes.

## Formato Esperado

Archivo Excel (.xlsx) o CSV con las siguientes columnas:

- **Unidad**: Identificador de la unidad
- **Nombre Propietario**: Nombre completo del propietario
- **Email**: Correo electrónico de contacto
- **Teléfono**: Número de contacto
- **Coeficiente**: Coeficiente de copropiedad (opcional)

## Ejemplo de Estructura

```
| Unidad   | Nombre Propietario    | Email                  | Teléfono    | Coeficiente |
|----------|-----------------------|------------------------|-------------|-------------|
| Apto 101 | Juan Pérez García     | juan.perez@email.com   | 3001234567  | 0.006667    |
| Apto 102 | María López Ruiz      | maria.lopez@email.com  | 3007654321  | 0.006667    |
| Local 5  | Comercial XYZ S.A.S.  | contacto@xyz.com       | 3009876543  | 0.015000    |
```

## Uso

Este archivo se importa una sola vez o se actualiza cuando cambian propietarios.

El sistema lo usa para:
- Enviar notificaciones de pago
- Generar cartas de cobro personalizadas
- Contactar propietarios en mora

## Privacidad

⚠️ **IMPORTANTE**: Esta información es sensible. Asegúrate de:
- No compartir estos archivos públicamente
- Mantener copias de seguridad seguras
- Cumplir con normativas de protección de datos (Ley 1581 de 2012)
