"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Swords } from "lucide-react"
import Link from "next/link"

const DURATION_PRESETS = [
  { label: "1 min", seconds: 60 },
  { label: "2 min", seconds: 120 },
  { label: "3 min", seconds: 180 },
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 },
]

export default function CreateRoomForm({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [durationSeconds, setDurationSeconds] = useState(120)
  const [customMinutes, setCustomMinutes] = useState("")
  const [useCustom, setUseCustom] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const finalDuration = useCustom
      ? Math.max(10, Math.min(3600, Math.round(parseFloat(customMinutes) * 60)))
      : durationSeconds

    if (isNaN(finalDuration) || finalDuration < 10) {
      toast.error("Duración inválida")
      return
    }

    setLoading(true)

    const { data: room, error } = await supabase
      .from("rooms")
      .insert({ name: name.trim(), created_by: userId, duration_seconds: finalDuration })
      .select()
      .single()

    if (error || !room) {
      toast.error("Error creando la sala")
      setLoading(false)
      return
    }

    // Creator joins automatically
    await supabase.from("room_participants").insert({ room_id: room.id, user_id: userId })

    router.push(`/rooms/${room.id}`)
  }

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center min-h-screen px-4 py-12"
      style={{ background: "var(--background)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 space-y-6 arena-glow"
        style={{ background: "var(--background-2)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-[var(--foreground-muted)]">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-black text-lg tracking-tight" style={{ color: "var(--foreground)" }}>
              Nueva arena
            </h1>
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
              Configurá el concurso
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name" style={{ color: "var(--foreground-muted)" }}>
              Nombre del concurso
            </Label>
            <Input
              id="name"
              placeholder="Ej: Panchomazo del viernes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={60}
              className="border-[var(--border)] bg-[var(--background-3)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus-visible:ring-[var(--coral)]"
            />
          </div>

          <div className="space-y-2">
            <Label style={{ color: "var(--foreground-muted)" }}>Duración</Label>
            <div className="flex flex-wrap gap-2">
              {DURATION_PRESETS.map((p) => (
                <button
                  key={p.seconds}
                  type="button"
                  onClick={() => { setDurationSeconds(p.seconds); setUseCustom(false) }}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border"
                  style={{
                    background: !useCustom && durationSeconds === p.seconds
                      ? "var(--coral)"
                      : "var(--background-3)",
                    color: !useCustom && durationSeconds === p.seconds
                      ? "white"
                      : "var(--foreground-muted)",
                    borderColor: !useCustom && durationSeconds === p.seconds
                      ? "var(--coral)"
                      : "var(--border)",
                  }}
                >
                  {p.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setUseCustom(true)}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border"
                style={{
                  background: useCustom ? "var(--coral)" : "var(--background-3)",
                  color: useCustom ? "white" : "var(--foreground-muted)",
                  borderColor: useCustom ? "var(--coral)" : "var(--border)",
                }}
              >
                Personalizado
              </button>
            </div>

            {useCustom && (
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="number"
                  placeholder="Minutos"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  min={0.17}
                  max={60}
                  step={0.5}
                  className="border-[var(--border)] bg-[var(--background-3)] text-[var(--foreground)] focus-visible:ring-[var(--coral)]"
                />
                <span className="text-sm shrink-0" style={{ color: "var(--foreground-muted)" }}>
                  minutos
                </span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full font-bold text-base h-11 gap-2"
            style={{ background: "var(--coral)", color: "white" }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Swords className="w-4 h-4" />
            )}
            {loading ? "Creando..." : "Crear arena"}
          </Button>
        </form>
      </div>
    </div>
  )
}
