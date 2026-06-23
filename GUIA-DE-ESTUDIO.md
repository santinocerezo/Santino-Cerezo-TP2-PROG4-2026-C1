# Guía de estudio — Sprint 1

Resumen para entender el código y defenderlo en la evaluación.

---

## 🧠 La idea general

Hay **dos proyectos**:

- **`frontend/` (Angular):** lo que ve el usuario (pantallas, formularios). No toca la base de datos directamente: le pide todo al backend por HTTP.
- **`backend/` (NestJS):** la API. Recibe pedidos, valida, habla con MongoDB y con Cloudinary, y responde JSON.

```
Navegador (Angular)  ──HTTP──►  API (NestJS)  ──►  MongoDB Atlas
                                      └──►  Cloudinary (imágenes)
```

---

## 🔐 ¿Qué pasa cuando me REGISTRO? (paso a paso)

1. **Angular** (`pages/registro/`): completás el formulario. Las validaciones (campos obligatorios, email, contraseña fuerte, contraseñas que coinciden) se chequean con **Reactive Forms** antes de enviar.
2. Se arma un **FormData** (porque va una imagen) y se hace `POST /auth/registro`.
3. **NestJS** (`auth/auth.controller.ts`): el `FileInterceptor` separa la imagen; el `ValidationPipe` valida el `RegistroDto`.
4. **`auth/auth.service.ts`**:
   - Verifica que las contraseñas coincidan.
   - Verifica que el **correo y el usuario sean únicos** (si no → `409 Conflict`).
   - Sube la imagen a **Cloudinary** y obtiene la URL.
   - **Encripta la contraseña con bcrypt** (`bcrypt.hash`).
   - Guarda el usuario en MongoDB con `perfil: 'usuario'`.
5. Responde **201** con los datos del usuario (sin la contraseña).

## 🔑 ¿Qué pasa cuando hago LOGIN?

1. **Angular** (`pages/login/`): mandás correo **o** usuario + contraseña → `POST /auth/login`.
2. **`auth.service.ts`**: busca al usuario por correo o nombre de usuario. Si no existe o está deshabilitado → `401`.
3. Compara la contraseña con el hash usando **`bcrypt.compare`**. Si no coincide → `401`.
4. Responde **200** con los datos del usuario. Angular lo guarda en `localStorage` (en el Sprint 3 esto pasa a ser un **JWT**).

---

## 📍 Dónde está cada requisito del Sprint 1

| Requisito | Archivo |
|-----------|---------|
| Pantallas Registro/Login/Publicaciones/Mi Perfil | `frontend/src/app/pages/` |
| Navegación entre pantallas | `frontend/src/app/app.routes.ts` |
| Favicon propio | `frontend/public/favicon.svg` + `src/index.html` |
| Validaciones de formularios | `pages/registro/registro.ts` y `pages/login/login.ts` |
| Modales (en vez de `alert()`) | `shared/modal/` + `services/notificacion.service.ts` |
| Módulos NestJS (Auth/Users/Publicaciones) | `backend/src/auth`, `users`, `publicaciones` |
| Registro (POST) | `auth/auth.controller.ts` → `registro()` |
| Login (POST) | `auth/auth.controller.ts` → `login()` |
| Contraseña encriptada | `auth/auth.service.ts` (bcrypt) |
| Imagen guardada (URL en DB) | `cloudinary/cloudinary.service.ts` + `users/schemas/user.schema.ts` (`fotoPerfil`) |
| Conexión a MongoDB | `app.module.ts` (MongooseModule) |
| Status codes correctos | `auth.controller.ts` (201/200) y excepciones de Nest (400/401/409) |

---

## ❓ Conceptos que te pueden preguntar

- **¿Por qué se encripta la contraseña?** Para que, aunque alguien acceda a la base, no pueda leer las contraseñas. `bcrypt` aplica un *hash* con *salt*: no es reversible. En el login no se "desencripta", se **compara** con `bcrypt.compare`.
- **¿Qué es un DTO?** (*Data Transfer Object*) Una clase que define qué datos espera un endpoint. Con `class-validator` (decoradores `@IsEmail`, `@MinLength`, etc.) Nest valida automáticamente y, si algo falla, responde `400`.
- **¿Qué es el `ValidationPipe`?** Un middleware global (en `main.ts`) que valida los DTO en cada request.
- **¿Por qué el login devuelve 200 y el registro 201?** `201 Created` se usa cuando se **crea** un recurso (registro). El login no crea nada, por eso `200 OK`. Forzamos el 200 con `@HttpCode(200)`.
- **¿Qué es una baja lógica?** En vez de borrar el registro, se marca un campo (`eliminado: true`). El dato queda en la DB pero se "oculta". (Se usa desde el Sprint 4.)
- **¿Standalone components / signals?** Angular moderno: cada componente declara sus propios `imports` (sin NgModule) y el estado reactivo se maneja con `signal()` en vez de variables comunes.
- **¿Cómo viaja la imagen?** Como `multipart/form-data` (un `FormData`). Multer la recibe en memoria y Cloudinary la sube; en la DB solo se guarda la **URL**.

---

## ✅ Checklist antes de rendir

- [ ] Deploy del **frontend** activo y accesible.
- [ ] Deploy del **backend** activo (abrir la URL: responde JSON).
- [ ] Repo **privado** con `rgplazas` agregado como colaborador.
- [ ] Estás en la rama correcta y hay un **Pull Request** `rama-sprint-1 → main`.
- [ ] `README.md` con nombre, links de deploy, tecnologías y sprints.
- [ ] Registro y Login funcionan **contra el backend real** (no datos falsos).
- [ ] Las contraseñas se ven **encriptadas** en MongoDB Atlas (entrá a Atlas y miralo).
- [ ] Favicon propio visible en la pestaña.
- [ ] No se usa `alert()` en ningún lado (se usan modales).
- [ ] Diseño uniforme (no HTML plano).

> 💡 Tip: despertá el backend de Render (abrí su URL) unos minutos antes de la defensa, porque el plan gratuito lo "duerme".
