"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Flame, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: "", password: "" })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) {
      toast.error("Credenciales incorrectas")
      setLoading(false)
      return
    }

    router.push("/")
    router.refresh()
  }

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center min-h-screen px-4 py-12"
      style={{ background: "var(--background)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 space-y-6 arena-glow"
        style={{
          background: "var(--background-2)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="text-center space-y-2">
          <div className="text-4xl mb-2">🌭</div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--coral)" }}>
            PANCHOMANIA
          </h1>
          <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
            Entrá a la arena
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" style={{ color: "var(--foreground-muted)" }}>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="vos@mail.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="border-[var(--border)] bg-[var(--background-3)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus-visible:ring-[var(--coral)]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" style={{ color: "var(--foreground-muted)" }}>
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="border-[var(--border)] bg-[var(--background-3)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus-visible:ring-[var(--coral)]"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full font-bold text-base h-11 gap-2"
            style={{ background: "var(--coral)", color: "white" }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Flame className="w-4 h-4" />
            )}
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="text-center text-sm" style={{ color: "var(--foreground-muted)" }}>
          ¿Sin cuenta?{" "}
          <Link
            href="/register"
            className="font-semibold hover:underline"
            style={{ color: "var(--coral)" }}
          >
            Registrate
          </Link>
        </p>
      </div>
    </div>
  )
}
