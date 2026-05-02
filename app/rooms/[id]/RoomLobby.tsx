"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { startRoom, joinRoom } from "@/lib/actions"
import type { Profile, Room, RoomParticipant } from "@/lib/supabase/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ArrowLeft, Check, Clock, Copy, Loader2, LogIn, Swords, Users } from "lucide-react"
import Link from "next/link"

type ParticipantWithProfile = RoomParticipant & { profiles: Profile }
type RoomWithCreator = Room & { profiles: Profile }

interface Props {
  room: RoomWithCreator
  participants: ParticipantWithProfile[]
  currentUser: { id: string; profile: Profile | null } | null
}

function formatDuration(s: number) {
  if (s < 60) return `${s} segundos`
  const m = Math.floor(s / 60)
  const rem = s % 60
  return rem > 0 ? `${m} min ${rem} seg` : `${m} minutos`
}

export default function RoomLobby({ room, participants, currentUser }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [starting, setStarting] = useState(false)
  const [joining, setJoining] = useState(false)
  const [copied, setCopied] = useState(false)

  const isCreator = currentUser?.id === room.created_by
  const isParticipant = participants.some((p) => p.user_id === currentUser?.id)
  const inviteUrl = typeof window !== "undefined" ? window.location.href : ""

  function handleCopyLink() {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleJoin() {
    if (!currentUser) { router.push("/login"); return }
    setJoining(true)
    const { error } = await joinRoom(room.id)
    if (error) toast.error(error)
    setJoining(false)
  }

  async function handleStart() {
    setStarting(true)
    const { error } = await startRoom(room.id)
    if (error) {
      toast.error(error)
      setStarting(false)
    }
  }

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: "var(--background)" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b"
        style={{ background: "var(--glass)", backdropFilter: "blur(12px)", borderColor: "var(--border)" }}
      >
        <Link href="/">
          <Button variant="ghost" size="icon" className="text-[var(--foreground-muted)]">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-black text-base truncate" style={{ color: "var(--coral)" }}>
            {room.name}
          </h1>
          <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
            Esperando participantes...
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-md w-full mx-auto px-4 py-6 space-y-5">
        {/* Room info */}
        <div
          className="rounded-xl p-4 space-y-3 border arena-glow"
          style={{ background: "var(--background-2)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: "rgba(255,123,61,0.1)" }}>
              <Swords className="w-5 h-5" style={{ color: "var(--coral)" }} />
            </div>
            <div>
              <p className="font-black text-lg" style={{ color: "var(--foreground)" }}>{room.name}</p>
              <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                Creada por {room.profiles?.username}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground-muted)" }}>
            <Clock className="w-4 h-4" style={{ color: "var(--coral)" }} />
            <span>Duración: <strong style={{ color: "var(--foreground)" }}>{formatDuration(room.duration_seconds)}</strong></span>
          </div>

          {/* Invite link */}
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2 border"
            style={{ background: "var(--background-3)", borderColor: "var(--border-subtle)" }}
          >
            <p className="flex-1 text-xs truncate font-mono" style={{ color: "var(--foreground-muted)" }}>
              {inviteUrl}
            </p>
            <button
              onClick={handleCopyLink}
              className="shrink-0 p-1 rounded transition-colors hover:text-[var(--coral)]"
              style={{ color: "var(--foreground-muted)" }}
            >
              {copied ? <Check className="w-4 h-4" style={{ color: "var(--coral)" }} /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Participants */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: "var(--foreground-muted)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--foreground-muted)" }}>
              {participants.length} {participants.length === 1 ? "participante" : "participantes"}
            </span>
          </div>

          <div className="space-y-2">
            {participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 border"
                style={{
                  background: "var(--background-2)",
                  borderColor: p.user_id === room.created_by ? "var(--coral-dark)" : "var(--border-subtle)",
                }}
              >
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={p.profiles?.avatar_url ?? undefined} />
                  <AvatarFallback
                    className="text-xs font-bold"
                    style={{ background: "var(--coral-dark)", color: "white" }}
                  >
                    {p.profiles?.username?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-sm flex-1" style={{ color: "var(--foreground)" }}>
                  {p.profiles?.username}
                </span>
                {p.user_id === room.created_by && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(255,123,61,0.15)", color: "var(--coral)" }}>
                    HOST
                  </span>
                )}
              </div>
            ))}

            {participants.length === 0 && (
              <p className="text-sm text-center py-4" style={{ color: "var(--foreground-muted)" }}>
                Nadie todavía
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          {!currentUser && (
            <Link href="/login">
              <Button className="w-full font-bold gap-2 h-12 text-base" style={{ background: "var(--coral)", color: "white" }}>
                <LogIn className="w-4 h-4" /> Iniciá sesión para participar
              </Button>
            </Link>
          )}

          {currentUser && !isParticipant && (
            <Button
              onClick={handleJoin}
              disabled={joining}
              className="w-full font-bold gap-2 h-12 text-base"
              style={{ background: "var(--coral)", color: "white" }}
            >
              {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {joining ? "Uniéndome..." : "Unirme al concurso"}
            </Button>
          )}

          {isCreator && (
            <Button
              onClick={handleStart}
              disabled={starting || participants.length < 1}
              className="w-full font-bold gap-2 h-12 text-base"
              style={{
                background: participants.length >= 1 ? "var(--coral)" : "var(--background-3)",
                color: participants.length >= 1 ? "white" : "var(--foreground-muted)",
              }}
            >
              {starting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Swords className="w-4 h-4" />
              )}
              {starting ? "Iniciando..." : "¡Comenzar concurso!"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
