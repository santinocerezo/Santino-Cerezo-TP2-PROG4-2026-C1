# Guía de despliegue — Sprint 1

Pasos en orden para dejar todo funcionando en producción. Hacelo de arriba hacia abajo.

---

## 1) MongoDB Atlas (base de datos)

1. Entrá a https://www.mongodb.com/atlas y creá una cuenta.
2. Creá un **cluster gratuito** (M0).
3. **Database Access** → creá un usuario con contraseña (anotalos).
4. **Network Access** → Add IP → `0.0.0.0/0` (permitir desde cualquier lado; necesario para Render).
5. **Connect → Drivers** → copiá la cadena de conexión, algo como:
   ```
   mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/red-social?retryWrites=true&w=majority
   ```
   👉 Agregá el nombre de la base (`red-social`) antes del `?`. Esa cadena es tu `MONGODB_URI`.

## 2) Cloudinary (imágenes de perfil)

1. Entrá a https://cloudinary.com y creá una cuenta gratuita.
2. En el **Dashboard** vas a ver: `Cloud name`, `API Key`, `API Secret`.
3. Esos tres valores van en `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

## 3) Probar localmente (recomendado antes de deployar)

1. En `backend/.env` pegá tu `MONGODB_URI` y las credenciales de Cloudinary.
2. `cd backend && npm run start:dev` → debería decir "escuchando en el puerto 3000".
3. En otra terminal: `cd frontend && npm start` → abrí http://localhost:4200 y probá **registrarte** y **loguearte**.

## 4) GitHub

1. Creá un repositorio **privado** llamado `SANTINO-CEREZO-TP2-PROG4-2026-C1`.
2. **Settings → Collaborators** → agregá a: `rgplazas` (obligatorio), `ManuQuintanaFra`, `JazMrls05`.
3. Subí el código (ver comandos de Git más abajo) en la rama **`rama-sprint-1`** y abrí un **Pull Request** hacia `main` con título claro: _"Sprint 1 - Registro y Login"_.

## 5) Render — Backend (Web Service)

1. https://render.com → **New → Web Service** → conectá tu repo.
2. Configuración:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Health Check Path:** `/`
3. **Environment** → agregá las variables:
   - `MONGODB_URI`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `FRONTEND_URL` → la dejás vacía por ahora; la completás en el paso 7.
   - (No hace falta `PORT`, Render lo asigna solo.)
4. Deploy. Cuando termine, copiá la URL (ej: `https://red-social-backend.onrender.com`).
   Probala en el navegador: debería devolver un JSON `{ ok: true, ... }`.

## 6) Render — Frontend (Static Site)

1. **Antes de deployar:** en `frontend/src/environments/environment.prod.ts` poné la URL del backend del paso 5. Commiteá y pusheá.
2. Render → **New → Static Site** → mismo repo.
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist/frontend/browser`
3. **Redirects/Rewrites** → agregá una regla:
   - Source: `/*` · Destination: `/index.html` · Action: **Rewrite**
   (necesario para que el routing de Angular no dé 404 al refrescar).
4. Deploy. Copiá la URL (ej: `https://red-social-frontend.onrender.com`).

> 💡 Alternativa: en lugar de los pasos 5 y 6 a mano, podés usar **New → Blueprint** y Render leerá el `render.yaml` del repo.

## 7) Conectar front y back (CORS)

1. Volvé al **backend en Render → Environment** y poné `FRONTEND_URL` = la URL del frontend (paso 6).
2. Render redeploya el backend solo. Listo: el front ya puede hablar con el back.

## 8) Últimos detalles

- Pegá ambas URLs en el `README.md` (tabla de Deploys).
- Verificá el checklist del Sprint 1 (ver `GUIA-DE-ESTUDIO.md`).

> ⚠️ El plan gratuito de Render **duerme** el backend tras inactividad: la primera petición puede tardar ~30–50 s. Abrí la URL del backend unos minutos antes de la evaluación para "despertarlo".

---

## Comandos de Git (primera subida)

```bash
# Desde la carpeta del proyecto (que contiene backend/ y frontend/)
git init -b main
git add README.md .gitignore render.yaml DEPLOY.md GUIA-DE-ESTUDIO.md
git commit -m "chore: configuración inicial del repositorio"

# Rama del sprint con todo el código
git checkout -b rama-sprint-1
git add .
git commit -m "Sprint 1: registro y login (Angular + NestJS + MongoDB)"

# Conectar con GitHub (reemplazá TU-USUARIO)
git remote add origin https://github.com/TU-USUARIO/SANTINO-CEREZO-TP2-PROG4-2026-C1.git
git push -u origin main
git push -u origin rama-sprint-1
```

Después, en GitHub: **Compare & pull request** desde `rama-sprint-1` hacia `main`.
