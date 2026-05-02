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

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ username: "", email: "", password: "" })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error("La contraseña tiene que tener al menos 6 caracteres")
      return
    }
    if (form.username.length < 2) {
      toast.error("El nombre tiene que tener al menos 2 caracteres")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { username: form.username },
      },
    })

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("Ya existe una cuenta con ese email")
      } else {
        toast.error("Error al registrarse: " + error.message)
      }
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
            Creá tu perfil de combate
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username" style={{ color: "var(--foreground-muted)" }}>
              Apodo
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="El Devorador"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              maxLength={30}
              className="border-[var(--border)] bg-[var(--background-3)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus-visible:ring-[var(--coral)]"
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
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
            {loading ? "Creando cuenta..." : "Entrar a la arena"}
          </Button>
        </form>

        <p className="text-center text-sm" style={{ color: "var(--foreground-muted)" }}>
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/login"
            className="font-semibold hover:underline"
            style={{ color: "var(--coral)" }}
          >
            Entrá
          </Link>
        </p>
      </div>
    </div>
  )
}
