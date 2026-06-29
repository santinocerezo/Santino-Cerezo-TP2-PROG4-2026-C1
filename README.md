# Red Social — TP2 Programación IV

**Alumno:** Santino Cerezo
**Materia:** Programación IV — UTN Avellaneda — Tecnicatura Universitaria en Programación
**Repositorio:** `SANTINO-CEREZO-TP2-PROG4-2026-C1`

Aplicación de red social desarrollada en dos proyectos separados (frontend Angular + backend NestJS) con base de datos MongoDB. Permite registrarse, iniciar sesión (con **JWT**), publicar, dar "me gusta", **comentar** y gestionar el perfil; en próximos sprints se suma el panel de administración.

## 🔗 Deploys

| Proyecto | Tecnología | URL |
|----------|-----------|-----|
| Frontend | Angular (Render Static Site) | https://santino-cerezo-tp2-prog4-2026-c1-1.onrender.com |
| Backend  | NestJS (Render Web Service)  | https://santino-cerezo-tp2-prog4-2026-c1.onrender.com |
| Base de datos | MongoDB Atlas | (privada) |

> El frontend en producción ya apunta al backend mediante `frontend/src/environments/environment.prod.ts`.

## 🧰 Tecnologías

- **Frontend:** Angular 22 (standalone components, signals, Reactive Forms), TypeScript, CSS.
- **Backend:** NestJS 11, TypeScript, Mongoose.
- **Base de datos:** MongoDB Atlas.
- **Seguridad:** contraseñas encriptadas con **bcrypt** y autenticación con **JWT** (token con vencimiento de 15 min).
- **Imágenes:** **Cloudinary** (las URLs se guardan en la DB).
- **Hosting:** Render (front y back), MongoDB Atlas.

## 📁 Estructura

```
SANTINO-CEREZO-TP2-PROG4-2026-C1/
├── backend/    → API NestJS (auth + JWT, usuarios, publicaciones y comentarios)
├── frontend/   → App Angular (carga, registro, login, publicaciones, detalle, mi perfil)
├── render.yaml → configuración de deploy en Render
└── README.md
```

## 🚀 Cómo correr el proyecto localmente

### 1) Backend
```bash
cd backend
npm install
# Crear el archivo .env (ver backend/.env.example) con:
#   MONGODB_URI, JWT_SECRET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
npm run start:dev
# Queda escuchando en http://localhost:3000
```

### 2) Frontend
```bash
cd frontend
npm install
npm start
# Queda en http://localhost:4200 (consume el backend en localhost:3000)
```

## 📌 Descripción de los Sprints

### ✅ Sprint 1
- **Frontend:** proyecto Angular con 4 pantallas (Registro, Login, Publicaciones, Mi Perfil), navegación, favicon propio, diseño uniforme y **modales en lugar de `alert()`**.
  - Formularios con validaciones (Reactive Forms): login por correo **o** nombre de usuario; contraseña de mínimo 8 caracteres, una mayúscula y un número.
  - Registro con todos los datos + campo file para imagen de perfil (con vista previa).
- **Backend:** proyecto NestJS con los módulos **Autenticación, Usuarios y Publicaciones**.
  - `POST /auth/registro`: valida los datos, sube la imagen a Cloudinary, **encripta la contraseña con bcrypt** y guarda el usuario. Devuelve **201**.
  - `POST /auth/login`: recibe correo/usuario + contraseña, la verifica contra el hash y devuelve los datos del usuario. Devuelve **200**.
  - Status codes correctos (201/200/400/401/409) y contraseña nunca expuesta en las respuestas.

### ✅ Sprint 2
- **Frontend:** listado de publicaciones (orden por fecha / por "me gusta", paginación), cada publicación es un componente, dar/quitar "me gusta", eliminar las propias y Mi Perfil con las últimas 3 publicaciones.
- **Backend:** módulo Publicaciones con alta (con imagen a Cloudinary), listado con orden/filtro/paginación, **baja lógica** (autor o admin) y dar/quitar "me gusta".

### ✅ Sprint 3 (entrega actual)
- **Frontend:**
  - **Página de detalle** de una publicación: se ve en grande junto con sus **comentarios** (ordenados, los más nuevos primero), con botón **"Cargar más"** que sigue trayendo sin perder los anteriores.
  - Escribir comentarios y **editar los propios** (un comentario editado muestra el cartel "· editado").
  - Login y registro guardan el **token JWT** en el navegador.
  - **Pantalla de carga** inicial con spinner: valida el token contra `autorizar` y redirige a Publicaciones o a Login.
  - **Contador de sesión** en la barra: a los 10 minutos aparece un modal avisando que quedan 5 minutos y permite **extender la sesión** (refresca el token). Si una petición devuelve **401**, redirige al login.
- **Backend:**
  - **Comentarios** (módulo Publicaciones): `GET` listar (paginado, recientes primero), `POST` agregar (con autor y fecha), `PUT` editar (marca `modificado: true`).
  - **JWT:** login y registro devuelven un token (identidad + rol, vence a los **15 min**). `POST /auth/autorizar` valida el token y devuelve el usuario; `POST /auth/refrescar` emite un token nuevo. Las rutas de publicaciones y comentarios quedan protegidas y el usuario se toma del token.

### 🔜 Próximos sprints (resumen)
- **Sprint 4:** panel admin (usuarios + estadísticas con gráficos), PWA, 3 pipes y 3 directivas propias.
- **Sprint 5 (recuperatorio):** perfiles de otros usuarios, scroll infinito, estadísticas adicionales.

---
_Trabajo Práctico desarrollado para Programación IV — 2026._
