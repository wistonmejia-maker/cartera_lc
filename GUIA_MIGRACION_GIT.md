# Guía de Migración con Git

## Paso 0: Crear el "Buzón" en la Nube (GitHub)

Para que el otro PC pueda ver el código, necesitas subirlo a internet.

1.  Ve a [github.com/new](https://github.com/new).
2.  Ponle el nombre: `cartera-lc`.
3.  Déjalo **Privado** (recomendado).
4.  Dale a "Create repository".
5.  Copia la URL que te dan (será algo como `https://github.com/TU_USUARIO/cartera-lc.git`).

## Paso 1: Subir el Código desde ESTE PC

En la terminal de este proyecto (donde estamos ahora), ejecuta estos 3 comandos:

```bash
# 1. Conectar con la nube
git remote add origin https://github.com/TU_USUARIO/cartera-lc.git
# (Si te pide login, sigue las instrucciones de la ventana emergente)

# 2. Preparar subida
git branch -M main

# 3. Enviar archivos
git push -u origin main
```

## Paso 2: Transferir la "Memoria" (Antigravity)

⚠️ **Importante**: La memoria de Antigravity (tu asistente) es privada y no se sube a Git por seguridad. Debes moverla manualmente en una USB o Drive.

1.  Copia esta carpeta:
    `C:\Users\ATC\.gemini\antigravity\brain\a0f61fe8-3ce9-4503-9071-eec5ebad8fda`

## Paso 3: En el OTRO PC (Nuevo)

1.  Instala [Git](https://git-scm.com/downloads) y [Node.js](https://nodejs.org/) si no los tienes.
2.  Abre una terminal (PowerShell o CMD).
3.  Escribe este comando (usando tu URL):
    ```bash
    git clone https://github.com/TU_USUARIO/cartera-lc.git
    ```
4.  Entra a la carpeta:
    ```bash
    cd cartera-lc
    npm install
    ```
5.  **Restaurar Memoria**:
    *   Pega la carpeta `a0f61fe8-...` en `C:\Users\[USUARIO]\.gemini\antigravity\brain\` del nuevo PC.

¡Listo! Ya tienes todo sincronizado.
