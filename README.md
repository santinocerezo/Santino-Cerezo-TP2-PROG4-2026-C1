# Red Social — TP2 Programación IV

**Alumno:** Santino Cerezo
**Materia:** Programación IV — UTN Avellaneda — Tecnicatura Universitaria en Programación
**Repositorio:** `SANTINO-CEREZO-TP2-PROG4-2026-C1`

Aplicación de red social desarrollada en dos proyectos separados (frontend Angular + backend NestJS) con base de datos MongoDB. Permite registrarse, iniciar sesión y gestionar el perfil; en próximos sprints se suman publicaciones, "me gusta", comentarios y panel de administración.

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
- **Seguridad:** contraseñas encriptadas con **bcrypt**.
- **Imágenes:** **Cloudinary** (las URLs se guardan en la DB).
- **Hosting:** Render (front y back), MongoDB Atlas.

## 📁 Estructura

```
SANTINO-CEREZO-TP2-PROG4-2026-C1/
├── backend/    → API NestJS (auth, usuarios, publicaciones)
├── frontend/   → App Angular (registro, login, publicaciones, mi perfil)
├── render.yaml → configuración de deploy en Render
└── README.md
```

## 🚀 Cómo correr el proyecto localmente

### 1) Backend
```bash
cd backend
npm install
# Crear el archivo .env (ver backend/.env.example) con:
#   MONGODB_URI, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
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

### ✅ Sprint 1 (entrega actual)
- **Frontend:** proyecto Angular con 4 pantallas (Registro, Login, Publicaciones, Mi Perfil), navegación, favicon propio, diseño uniforme y **modales en lugar de `alert()`**.
  - Formularios con validaciones (Reactive Forms): login por correo **o** nombre de usuario; contraseña de mínimo 8 caracteres, una mayúscula y un número.
  - Registro con todos los datos + campo file para imagen de perfil (con vista previa).
- **Backend:** proyecto NestJS con los módulos **Autenticación, Usuarios y Publicaciones**.
  - `POST /auth/registro`: valida los datos, sube la imagen a Cloudinary, **encripta la contraseña con bcrypt** y guarda el usuario. Devuelve **201**.
  - `POST /auth/login`: recibe correo/usuario + contraseña, la verifica contra el hash y devuelve los datos del usuario. Devuelve **200**.
  - Status codes correctos (201/200/400/401/409) y contraseña nunca expuesta en las respuestas.

### 🔜 Próximos sprints (resumen)
- **Sprint 2:** listado de publicaciones (orden y paginación), "me gusta", eliminar publicaciones propias, Mi Perfil con últimas 3 publicaciones.
- **Sprint 3:** detalle con comentarios, JWT (vencimiento 15 min), autorizar/refrescar token, contador de sesión.
- **Sprint 4:** panel admin (usuarios + estadísticas con gráficos), PWA, 3 pipes y 3 directivas propias.
- **Sprint 5 (recuperatorio):** perfiles de otros usuarios, scroll infinito, estadísticas adicionales.

---
_Trabajo Práctico desarrollado para Programación IV — 2026._
