import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Navbar from "@/components/Navbar"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, Trophy } from "lucide-react"

function formatDuration(s: number) {
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  return `${m}m`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "2-digit", month: "short", year: "numeric",
  })
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: myParticipations } = await supabase
    .from("room_participants")
    .select("*, rooms(id, name, duration_seconds, started_at, created_at, status, profiles(username))")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false })

  type ParticipationRow = {
    id: string
    pancho_count: number
    rooms: {
      id: string; name: string; duration_seconds: number
      started_at: string | null; created_at: string; status: string
      profiles: { username: string }
    } | null
  }

  const finished = ((myParticipations ?? []) as unknown as ParticipationRow[]).filter(
    (p) => p.rooms?.status === "finished"
  )

  // For each finished room, get all participants to compute rank
  const roomIds = [...new Set(finished.map((p) => (p.rooms as { id: string }).id))]
  type RankRow = { room_id: string; user_id: string; pancho_count: number; last_increment_at: string | null }

  const { data: allParticipantsRaw } = await supabase
    .from("room_participants")
    .select("room_id, user_id, pancho_count, last_increment_at")
    .in("room_id", roomIds)

  const allParticipants = (allParticipantsRaw ?? []) as unknown as RankRow[]

  function getRank(roomId: string, userId: string) {
    const roomParticipants = allParticipants
      .filter((p) => p.room_id === roomId)
      .sort((a, b) => {
        if (b.pancho_count !== a.pancho_count) return b.pancho_count - a.pancho_count
        const aT = a.last_increment_at ? new Date(a.last_increment_at).getTime() : Infinity
        const bT = b.last_increment_at ? new Date(b.last_increment_at).getTime() : Infinity
        return aT - bT
      })
    return roomParticipants.findIndex((p) => p.user_id === userId) + 1
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--background)" }}>
      <Navbar profile={profile ?? null} />

      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-[var(--foreground-muted)]">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
              Historial
            </h2>
            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
              Tus concursos pasados
            </p>
          </div>
        </div>

        {finished.length === 0 ? (
          <div
            className="rounded-xl p-10 text-center space-y-2 border"
            style={{ background: "var(--background-2)", borderColor: "var(--border-subtle)" }}
          >
            <div className="text-4xl">😶‍🌫️</div>
            <p className="font-semibold" style={{ color: "var(--foreground)" }}>Sin historial todavía</p>
            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
              Participá en un concurso y volvé acá
            </p>
            <Link href="/">
              <Button className="mt-2 font-bold" style={{ background: "var(--coral)", color: "white" }}>
                Ver arenas activas
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {finished.map((p) => {
              const room = p.rooms!
              const rank = getRank(room.id, user.id)
              const totalInRoom = allParticipants.filter((ap) => ap.room_id === room.id).length

              return (
                <Link key={p.id} href={`/rooms/${room.id}`}>
                  <div
                    className="rounded-xl p-4 border cursor-pointer hover:border-[var(--coral)] transition-colors"
                    style={{ background: "var(--background-2)", borderColor: "var(--border)" }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate" style={{ color: "var(--foreground)" }}>
                          {room.name}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                          {formatDate(room.created_at)} · {room.profiles?.username}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-black text-xl" style={{ color: "var(--coral)" }}>
                          {p.pancho_count} 🌭
                        </p>
                        <p className="text-xs font-semibold" style={{ color: "var(--foreground-muted)" }}>
                          {rank === 1 ? "🏆 1°" : rank === 2 ? "🥈 2°" : rank === 3 ? "🥉 3°" : `#${rank}`} de {totalInRoom}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--foreground-muted)" }}>
                        <Clock className="w-3 h-3" />
                        {formatDuration(room.duration_seconds)}
                      </span>
                      {rank === 1 && (
                        <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(212,165,116,0.15)", color: "var(--gold)" }}>
                          <Trophy className="w-3 h-3" /> Campeón
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
