# Frontend Web - Cartera LC

Frontend construido con Vite + React + TypeScript + TailwindCSS.

## Estructura

```
apps/web/
├── src/
│   ├── pages/            # Páginas de la aplicación
│   │   ├── Dashboard.tsx
│   │   ├── Units.tsx
│   │   ├── Portfolio.tsx
│   │   └── ...
│   ├── components/       # Componentes reusables
│   │   ├── KPICard.tsx
│   │   ├── AgingBarChart.tsx
│   │   └── ...
│   ├── stores/           # Zustand stores
│   │   ├── usePortfolioStore.ts
│   │   └── useUnitStore.ts
│   └── services/         # API calls
│       └── api.ts
└── public/               # Assets estáticos
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview producción
npm run preview
```

## Páginas Principales

- **Dashboard**: KPIs, aging chart, alertas
- **Units**: Gestión de unidades (CRUD)
- **Portfolio**: Análisis detallado de cartera
- **Upload Report**: Importación de reportes contables
- **Unit Detail**: Historial y notas de seguimiento
- **Compliance**: Alertas normativas
- **Reports**: Exportación de reportes

## Tecnologías

- **Vite**: Build tool y dev server
- **React 19**: UI framework
- **TypeScript**: Type safety
- **TailwindCSS 4**: Styling
- **Zustand**: State management
- **Recharts**: Gráficos
