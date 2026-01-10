# Cartera LC - Plataforma de Análisis de Cartera Residencial

Plataforma para gestión y análisis de cartera de cobro en unidades residenciales (conjuntos, condominios, PH) en Colombia.

## Estructura del Proyecto

```
cartera-lc/
├── apps/
│   ├── api/              # Backend (Express + Prisma)
│   └── web/              # Frontend (Vite + React + TypeScript)
├── sample-data/          # Datos de ejemplo y documentos de entrada
│   ├── reportes-contables/      # Reportes mensuales de contabilidad
│   ├── directorio-residentes/   # Información de propietarios
│   ├── cartas-ejemplo/          # Templates de cartas de cobro
│   └── unidades-maestro/       # Listados maestros de unidades
└── docs/                 # Documentación técnica
```

## Características Principales

- 📊 **Dashboard de Cartera**: KPIs, aging, tendencias
- 🏢 **Gestión de Unidades**: CRUD completo con historial
- 📈 **Análisis de Mora**: Clasificación por antigüedad (30, 60, 90+ días)
- ⚖️ **Cumplimiento Normativo**: Alertas según Ley 675 de 2001
- 📄 **Reportes**: Excel, PDF, cartas de cobro
- 📝 **Notas de Seguimiento**: Trazabilidad de gestión de cobro

## Stack Tecnológico

- **Backend**: Node.js 20 + Express 5 + Prisma + PostgreSQL
- **Frontend**: Vite + React 19 + TypeScript + TailwindCSS 4
- **Estado**: Zustand
- **Gráficos**: Recharts

## Inicio Rápido

```bash
# Instalar dependencias
npm install

# Desarrollo (Backend + Frontend concurrentes)
npm run dev

# Solo backend
npm run dev:api

# Solo frontend
npm run dev:web
```

## Documentación

Ver [`docs/`](./docs/) para documentación detallada.

## Licencia

Propietario - ATC
