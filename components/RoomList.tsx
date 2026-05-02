"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, Swords } from "lucide-react"

interface Room {
  id: string
  name: string
  status: "waiting" | "active" | "finished"
  duration_seconds: number
  created_at: string
  profiles: { username: string; avatar_url: string | null }
  room_participants: { count: number }[]
}

interface RoomListProps {
  rooms: Room[]
  currentUserId: string | null
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "ahora"
  if (m < 60) return `hace ${m}m`
  const h = Math.floor(m / 60)
  return `hace ${h}h`
}

export default function RoomList({ rooms, currentUserId }: RoomListProps) {
  if (rooms.length === 0) {
    return (
      <div
        className="rounded-xl p-10 text-center space-y-2 border"
        style={{ background: "var(--background-2)", borderColor: "var(--border-subtle)" }}
      >
        <div className="text-4xl">😴</div>
        <p className="font-semibold" style={{ color: "var(--foreground)" }}>
          Sin arenas activas
        </p>
        <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
          {currentUserId ? "Creá la primera del día" : "Iniciá sesión para crear una"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {rooms.map((room) => {
        const count = room.room_participants?.[0]?.count ?? 0
        const isActive = room.status === "active"

        return (
          <Link key={room.id} href={`/rooms/${room.id}`}>
            <div
              className="rounded-xl p-4 border cursor-pointer transition-all hover:border-[var(--coral)] hover:shadow-[0_0_12px_rgba(255,123,61,0.15)] group"
              style={{
                background: "var(--background-2)",
                borderColor: isActive ? "var(--coral-mid)" : "var(--border)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base truncate" style={{ color: "var(--foreground)" }}>
                      {room.name}
                    </h3>
                    {isActive && (
                      <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse"
                        style={{ background: "rgba(255,123,61,0.15)", color: "var(--coral)" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
                        EN VIVO
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--foreground-muted)" }}>
                    Creada por <span className="font-semibold">{room.profiles?.username}</span>{" "}
                    · {timeAgo(room.created_at)}
                  </p>
                </div>

                <Swords
                  className="w-5 h-5 shrink-0 transition-colors group-hover:text-[var(--coral)]"
                  style={{ color: "var(--foreground-muted)" }}
                />
              </div>

              <div className="flex items-center gap-4 mt-3">
                <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--foreground-muted)" }}>
                  <Users className="w-3.5 h-3.5" />
                  {count} {count === 1 ? "participante" : "participantes"}
                </span>
                <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--foreground-muted)" }}>
                  <Clock className="w-3.5 h-3.5" />
                  {formatDuration(room.duration_seconds)}
                </span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
