# Panchomania — CLAUDE.md

App de concursos de panchos en tiempo real.

## Stack
Next.js 16, TypeScript, Tailwind CSS v4, Framer Motion, Supabase (Auth + Realtime + Storage), Vercel.

## Comandos
- `pnpm dev` — desarrollo local
- `pnpm build` — build de producción
- `pnpm lint` — linting

## Variables de entorno
- `NEXT_PUBLIC_SUPABASE_URL` — URL del proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — clave pública
- `SUPABASE_SERVICE_ROLE_KEY` — clave privada (solo server-side, nunca exponer al cliente)

## Supabase
- **Proyecto:** ykudlokdxegjbwezeylg
- **Auth:** email/contraseña, sin verificación de email (`mailer_autoconfirm: true`)
- **Storage:** bucket `avatars` (público, 5MB límite)
- **Realtime:** habilitado en `rooms` y `room_participants`

## Tablas
- `profiles` — extiende auth.users, username + avatar_url
- `rooms` — name, created_by, duration_seconds, status (waiting/active/finished), started_at
- `room_participants` — room_id, user_id, pancho_count, last_increment_at (tiebreaker)

## Lógica de tiebreaking
Si dos participantes tienen el mismo pancho_count, gana el que llegó a ese número antes (last_increment_at más antiguo).

## Real-time
- Suscripción a `rooms` para cambios de status (waiting → active → finished)
- Suscripción a `room_participants` para conteo en vivo
- El timer se calcula client-side desde `room.started_at + room.duration_seconds`
- Cuando el timer llega a 0, cualquier participante puede llamar `finishRoom()` (server action con service role, verifica que el tiempo realmente terminó)

## Diseño
- Identidad Pyrux: coral `#ff7b3d`, fondos `#0a0604` / `#120d0a` / `#1a130f`, texto `#fef7f0`
- Variables CSS en `globals.css`
- Fuente: Manrope (Google Fonts, cargada en globals.css con @import)
- Vibe arena de combate
- Mobile-first, responsive portrait y landscape

## Convenciones
- TypeScript strict, nunca `any`
- `"use client"` solo cuando es necesario (interactividad/hooks)
- `page.tsx` es Server Component, los Client Components van en archivos separados
- Animaciones con Framer Motion
- Tailwind para estilos, variables CSS para colores de Pyrux
