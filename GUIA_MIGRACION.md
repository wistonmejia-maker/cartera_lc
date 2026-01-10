# Guía de Migración de Proyecto Cartera LC

Para transferir el proyecto a otro PC y mantener todo el progreso (incluyendo la memoria de Antigravity), sigue estos pasos.

## Paso 1: Generar el ZIP (Automático)

He creado un script que empaqueta todo el proyecto **excluyendo** las carpetas pesadas (`node_modules`) automáticamente.

1.  Abre una terminal en la carpeta del proyecto.
2.  Ejecuta:
    ```powershell
    .\crear_backup.ps1
    ```
3.  Esto creará un archivo ZIP en `Documentos/Proyectos ATC/` con fecha y hora (ej: `cartera_lc_backup_20260110_1530.zip`).

## Paso 2: Mantener la "Memoria" de Antigravity

⚠️ **CRÍTICO**: El archivo ZIP **NO** incluye tu asistente (Antigravity). Debes copiar su "cerebro" manualmente.

1.  Ve a la carpeta:
    `C:\Users\ATC\.gemini\antigravity\brain\`
2.  Copia la carpeta:
    `a0f61fe8-3ce9-4503-9071-eec5ebad8fda`
3.  Guárdala en tu USB, Drive o envíatela por correo junto con el ZIP.

## Paso 3: Instalación en el Nuevo PC

1.  **Código**:
    *   Descomprime el ZIP en `Documentos/Proyectos ATC/`.
    *   Abre una terminal en esa carpeta y ejecuta:
        ```bash
        npm install
        ```
        *(Esto descargará nuevo las librerías que excluimos del ZIP)*.
    *   Regenera la base de datos:
        ```bash
        cd apps/api
        npx prisma generate
        ```

2.  **Cerebro**:
    *   Abre Antigravity en el nuevo PC.
    *   Pega la carpeta `a0f61fe8...` en `C:\Users\[TU_USUARIO]\.gemini\antigravity\brain\`.

## Paso 4: Verificar

Ejecuta el test para confirmar que todo funciona:
```bash
cd apps/api
npx ts-node test_parser.ts
```
