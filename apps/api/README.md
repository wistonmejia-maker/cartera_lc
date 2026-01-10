# Backend API - Cartera LC

Backend construido con Express + Prisma + PostgreSQL.

## Estructura

```
apps/api/
├── src/
│   ├── routes/           # Definición de endpoints
│   ├── services/         # Lógica de negocio
│   │   ├── import/       # Importación de reportes
│   │   └── compliance/   # Motor de reglas
│   └── config/           # Configuración
├── prisma/
│   └── schema.prisma     # Modelo de datos
└── uploads/              # Archivos temporales cargados
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Prisma
npm run db:generate      # Generar Prisma Client
npm run db:push          # Aplicar cambios al schema
npm run db:studio        # Abrir Prisma Studio
```

## Variables de Entorno

Crear archivo `.env` con:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/cartera_lc"
PORT=3000
NODE_ENV=development
```

## API Endpoints

Ver documentación completa en `/docs/api.md`

Principales endpoints:
- `GET /api/config` - Configuración del conjunto
- `GET /api/units` - Listado de unidades
- `POST /api/uploads` - Cargar reporte contable
- `GET /api/portfolio/summary/:month` - Resumen de cartera
