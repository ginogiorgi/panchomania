"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/supabase/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ArrowLeft, Camera, Loader2, Save } from "lucide-react"
import Link from "next/link"

export default function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [username, setUsername] = useState(profile.username)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const ext = file.name.split(".").pop()
    const path = `${profile.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true })

    if (uploadError) {
      toast.error("Error subiendo la imagen")
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path)
    const url = `${data.publicUrl}?t=${Date.now()}`
    setAvatarUrl(url)

    await supabase.from("profiles").update({ avatar_url: url }).eq("id", profile.id)
    setUploading(false)
    toast.success("Foto actualizada")
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (username.trim().length < 2) {
      toast.error("El apodo tiene que tener al menos 2 caracteres")
      return
    }
    setLoading(true)

    const { error } = await supabase
      .from("profiles")
      .update({ username: username.trim() })
      .eq("id", profile.id)

    if (error) {
      toast.error(error.message.includes("unique") ? "Ese apodo ya está en uso" : "Error al guardar")
      setLoading(false)
      return
    }

    toast.success("Perfil actualizado")
    router.refresh()
    setLoading(false)
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
              Tu perfil
            </h1>
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
              Tu identidad en la arena
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar
              className="w-24 h-24 border-4 cursor-pointer"
              style={{ borderColor: "var(--coral-dark)" }}
              onClick={() => fileRef.current?.click()}
            >
              <AvatarImage src={avatarUrl ?? undefined} />
              <AvatarFallback
                className="text-2xl font-black"
                style={{ background: "var(--coral-dark)", color: "var(--foreground)" }}
              >
                {username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 rounded-full p-1.5 flex items-center justify-center"
              style={{ background: "var(--coral)", color: "white" }}
            >
              {uploading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Camera className="w-3 h-3" />
              )}
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
            Tocá para cambiar la foto
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username" style={{ color: "var(--foreground-muted)" }}>
              Apodo
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={30}
              required
              className="border-[var(--border)] bg-[var(--background-3)] text-[var(--foreground)] focus-visible:ring-[var(--coral)]"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full font-bold gap-2"
            style={{ background: "var(--coral)", color: "white" }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </div>
    </div>
  )
}
