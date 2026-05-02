import { createClient } from "@/lib/supabase/server"
import Navbar from "@/components/Navbar"
import RoomList from "@/components/RoomList"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [profileResult, roomsResult] = await Promise.all([
    user
      ? supabase.from("profiles").select("*").eq("id", user.id).single()
      : Promise.resolve({ data: null }),
    supabase
      .from("rooms")
      .select("*, profiles(username, avatar_url), room_participants(count)")
      .in("status", ["waiting", "active"])
      .order("created_at", { ascending: false }),
  ])

  const profile = profileResult.data
  const rooms = roomsResult.data ?? []

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--background)" }}>
      <Navbar profile={profile} />

      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
              Arenas activas
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
              Sumate a un concurso o creá el tuyo
            </p>
          </div>
          {user && (
            <Link href="/rooms/create">
              <Button
                className="font-bold gap-2 shrink-0"
                style={{ background: "var(--coral)", color: "white" }}
              >
                <Plus className="w-4 h-4" />
                Nueva arena
              </Button>
            </Link>
          )}
        </div>

        <RoomList rooms={rooms} currentUserId={user?.id ?? null} />

        {!user && (
          <div
            className="rounded-xl p-6 text-center space-y-3 border"
            style={{ background: "var(--background-2)", borderColor: "var(--border)" }}
          >
            <div className="text-3xl">🌭</div>
            <p className="font-semibold" style={{ color: "var(--foreground)" }}>
              ¿Listo para competir?
            </p>
            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
              Registrate gratis y empezá a comer panchos
            </p>
            <div className="flex gap-2 justify-center">
              <Link href="/register">
                <Button className="font-bold" style={{ background: "var(--coral)", color: "white" }}>
                  Registrarse
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="font-bold border-[var(--border)] text-[var(--foreground-muted)]">
                  Entrar
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
