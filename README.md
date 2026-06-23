# ig-tracker-api

Backend en NestJS + TypeORM + PostgreSQL para monitorear quién no te
devuelve el follow en Instagram y guardar el historial de unfollows.

Repo del frontend: [ig-tracker](https://github.com/franxisco-ortiz/ig-tracker)

## Cómo funciona

- `POST /instagram/sync` llama a la API privada de Instagram (usando tu
  propia sesión autenticada), obtiene tus listas de `following`/`followers`,
  compara contra el snapshot anterior y guarda en PostgreSQL:
  - los eventos de quienes dejaron de seguirte (`unfollow_events`)
  - el snapshot actual de followers/following (`followers_snapshot`)
- `GET /instagram/unfollowers` devuelve, desde el snapshot guardado, la
  lista de cuentas a las que sigues y no te siguen de vuelta.
- `GET /instagram/history` devuelve el historial de quién dejó de seguirte
  y cuándo.
- Un cron diario (`@nestjs/schedule`) corre el sync automáticamente y, si
  hay nuevos unfollows, envía un email vía Gmail/Nodemailer.

## Requisitos para `IG_SESSION_ID` / `IG_CSRF_TOKEN`

Iniciá sesión en instagram.com desde tu navegador y copiá las cookies
`sessionid` y `csrftoken` (DevTools → Application → Cookies). Son
credenciales de tu propia cuenta — no las compartas y rotalas si Instagram
cierra la sesión.

## Desarrollo local

```bash
cp .env.example .env   # completar variables
npm install
npm run start:dev
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `IG_USER_ID` | Tu user ID numérico de Instagram |
| `IG_SESSION_ID` | Cookie `sessionid` de Instagram |
| `IG_CSRF_TOKEN` | Cookie `csrftoken` de Instagram |
| `GMAIL_USER` | Tu email de Gmail |
| `GMAIL_PASSWORD` | App password de Gmail |
| `NOTIFY_EMAIL` | Email donde recibir las alertas |
| `DATABASE_URL` | URL de conexión a PostgreSQL |

## Deploy en Railway

1. Creá un proyecto en Railway y agregá el plugin de **PostgreSQL**.
2. Agregá este repo como servicio:
   - Build: usa el `Dockerfile` incluido.
   - Variables: `IG_USER_ID`, `IG_SESSION_ID`, `IG_CSRF_TOKEN`, `GMAIL_USER`,
     `GMAIL_PASSWORD`, `NOTIFY_EMAIL`, y `DATABASE_URL` referenciando la
     variable del plugin de Postgres (`${{Postgres.DATABASE_URL}}`).
3. Railway expone `PORT` automáticamente; el `Dockerfile`/`main.ts` ya lo
   usan (`process.env.PORT`).
4. Copiá la URL pública de este servicio para configurarla como
   `NEXT_PUBLIC_API_URL` en el deploy del frontend.
