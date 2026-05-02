# 🌭 Panchomania

> El concurso de panchos más épico de internet.

Aplicación web en tiempo real para organizar concursos de quien come más panchos en un tiempo determinado. Creá una sala, invitá a tus amigos y que gane el mejor.

**[→ panchomania.vercel.app](https://panchomania.vercel.app)**

---

## ¿Cómo funciona?

1. **Registrate** con un apodo y foto de perfil
2. **Creá una arena** — poné nombre y cuánto tiempo dura el concurso
3. **Compartí el link** o esperá que se sumen desde el listado público
4. **Comenzá** cuando estén todos listos
5. Durante el concurso, cada participante **suma o resta panchos** desde su pantalla
6. Al terminar el tiempo, aparece el **podio** con el top 3 y los resultados finales

---

## Features

- **Tiempo real** — el ranking se actualiza en vivo para todos los participantes usando Supabase Realtime
- **Responsive** — funciona en portrait y landscape, pensado para usar desde el celular mientras comés
- **Salas públicas** — las arenas aparecen en el listado principal y también se pueden compartir por link
- **Podio animado** — el top 3 se muestra con animaciones en el resultado final
- **Historial** — cada usuario tiene un registro de sus concursos pasados con posición y panchos comidos
- **Tiebreaking justo** — si dos personas tienen el mismo conteo, gana quien llegó a ese número primero

---

## Stack

| Tecnología | Uso |
|---|---|
| Next.js 16 (App Router) | Framework |
| TypeScript | Tipado |
| Tailwind CSS v4 | Estilos |
| Framer Motion | Animaciones |
| Supabase | Auth, base de datos, realtime, storage |
| Vercel | Deploy |

---

## Correr localmente

```bash
# Clonar
git clone https://github.com/Pyrux-Labs/panchomania
cd panchomania

# Instalar dependencias
pnpm install

# Variables de entorno
cp .env.example .env.local
# Completar con las keys de tu proyecto Supabase

# Dev server
pnpm dev
```

Abrí [http://localhost:3000](http://localhost:3000).

### Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### Base de datos

El schema completo está en `CLAUDE.md`. Las tablas necesarias son `profiles`, `rooms` y `room_participants`. Realtime tiene que estar habilitado en esas dos últimas.

---

## Estructura del proyecto

```
app/
├── page.tsx              # Home — listado de salas
├── login/                # Auth
├── register/
├── profile/              # Editar perfil y foto
├── history/              # Historial de concursos
└── rooms/
    ├── create/           # Crear sala
    └── [id]/             # Sala (lobby → concurso → resultados)
        ├── RoomClient    # Suscripción realtime
        ├── RoomLobby     # Esperando participantes
        ├── RoomContest   # Concurso activo
        └── RoomResults   # Podio y resultados
components/
├── Navbar.tsx
├── Footer.tsx
└── RoomList.tsx
lib/
├── actions.ts            # Server actions (startRoom, finishRoom, joinRoom)
└── supabase/             # Cliente, server y tipos
```

---

## Hecho por

**[Pyrux](https://www.pyrux.com.ar)** — estudio de desarrollo web, Rosario, Argentina.
