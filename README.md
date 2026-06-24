# 🚗 CocheCompartido

Aplicación web para gestionar de forma **equitativa** qué amigo pone el coche en
cada plan. Calcula ratios de conducción por zona, gestiona deudas, propone
conductores automáticamente y resuelve empates con un **sorteo visual** (o con
un voluntario que se ofrece).

Stack: **React + Vite + Tailwind** (frontend) · **Node + Express + MongoDB
(Mongoose)** (backend). Mobile-first, dark mode, lista para la nube.

## Estructura (monorepo)

```
/
├── backend/    → API Node/Express + Mongoose
│   ├── models/         (Amigo.js, Plan.js)
│   ├── controllers/    (repartoController.js)
│   ├── routes/         (api.js)
│   └── data/store.js   (conexión + seed)
├── frontend/   → SPA React + Vite + Tailwind (pestañas: Ranking / Crear / Historial)
└── package.json → orquesta ambos con concurrently
```

## 🟢 Crear la base de datos GRATIS (MongoDB Atlas)

1. Entra en <https://www.mongodb.com/cloud/atlas/register> y crea una cuenta.
2. **Create a deployment** → elige el plan **M0 (Free, $0/mes)**.
3. **Database Access** → *Add New Database User* (anota usuario y contraseña).
4. **Network Access** → *Add IP Address* → **Allow access from anywhere**
   (`0.0.0.0/0`) para que el backend en la nube pueda conectar.
5. **Connect → Drivers** → copia la cadena de conexión, del tipo:
   ```
   mongodb+srv://USUARIO:PASSWORD@cluster0.xxxxx.mongodb.net/cochecompartido?retryWrites=true&w=majority
   ```
6. Pégala en `backend/.env` como `MONGODB_URI` (ver `backend/.env.example`).

> La primera vez que arranque, si la BD está vacía, se insertan automáticamente
> los 5 amigos semilla (Ana, Bruno, Carla, Diego, Elena).

## Puesta en marcha (local)

```bash
# 1) Instalar dependencias (raíz, backend y frontend)
npm run install:all

# 2) Configurar la BD del backend
cp backend/.env.example backend/.env   # y edita MONGODB_URI

# 3) Levantar backend (:5000) y frontend (:5173) juntos
npm run dev
```

> 💡 **Sin Atlas para probar:** si NO defines `MONGODB_URI`, en desarrollo el
> backend levanta un **MongoDB en memoria** automáticamente (los datos se borran
> al reiniciar). Ideal para una prueba rápida; usa Atlas para datos persistentes.

## ☁️ Despliegue 24/7 gratis

**Backend (Render / Railway / Fly.io):**
- Build: `npm install` · Start: `npm start` (usa `process.env.PORT` automático).
- Variable de entorno: `MONGODB_URI` con tu cadena de Atlas.

**Frontend (Vercel / Netlify):**
- Build: `npm run build` · Output: `dist`.
- Variable de entorno: `VITE_API_URL` = URL pública del backend + `/api`
  (ej. `https://cochecompartido.onrender.com/api`).

## API

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| GET    | `/api/health` | Estado del servidor |
| GET    | `/api/amigos` | Ranking con ratios, deudas y viajes |
| POST   | `/api/amigos` | Añade un amigo `{ nombre, poseeCoche }` |
| PATCH  | `/api/amigos/:id` | Actualiza `{ nombre?, poseeCoche? }` |
| GET    | `/api/planes` | Todos los planes (orden fecha desc) |
| POST   | `/api/planes` | Crea un plan |
| GET    | `/api/planes/:id/propuesta` | Propone conductores (o marca `requiereSorteo`) |
| POST   | `/api/planes/:id/fijar-sorteo` | Consolida al elegido en el sorteo `{ amigoId }` |
| POST   | `/api/planes/:id/postularse` | Un voluntario se ofrece `{ amigoId }` (cancela sorteo) |
| POST   | `/api/planes/:id/confirmar` | Cierra el viaje `{ conductoresReales }` |

## Scripts (raíz)

| Comando               | Descripción                                      |
| --------------------- | ------------------------------------------------ |
| `npm run dev`         | Arranca backend y frontend simultáneamente       |
| `npm run install:all` | Instala dependencias en raíz, backend y frontend |
