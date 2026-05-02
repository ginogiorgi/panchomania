"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import type { Profile, Room, RoomParticipant } from "@/lib/supabase/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Home, Trophy } from "lucide-react"

type ParticipantWithProfile = RoomParticipant & { profiles: Profile }
type RoomWithCreator = Room & { profiles: Profile }

interface Props {
  room: RoomWithCreator
  participants: ParticipantWithProfile[]
  currentUser: { id: string; profile: Profile | null } | null
}

const PODIUM_CONFIG = [
  { rank: 2, height: "h-20", bg: "bg-zinc-600", color: "#9ca3af", emoji: "🥈", delay: 0.2 },
  { rank: 1, height: "h-28", bg: "bg-yellow-600", color: "#d4a574", emoji: "🥇", delay: 0 },
  { rank: 3, height: "h-14", bg: "bg-amber-800", color: "#92400e", emoji: "🥉", delay: 0.4 },
]

export default function RoomResults({ room, participants, currentUser }: Props) {
  const top3 = participants.slice(0, 3)
  const rest = participants.slice(3)
  const myResult = participants.find((p) => p.user_id === currentUser?.id)
  const myRank = participants.findIndex((p) => p.user_id === currentUser?.id) + 1

  function getParticipantByRank(rank: number) {
    return participants[rank - 1] ?? null
  }

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: "var(--background)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ background: "var(--background-2)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5" style={{ color: "var(--gold)" }} />
          <span className="font-black" style={{ color: "var(--foreground)" }}>
            Resultados
          </span>
        </div>
        <p className="text-sm font-semibold truncate max-w-[50%]" style={{ color: "var(--coral)" }}>
          {room.name}
        </p>
      </div>

      <div className="flex-1 max-w-md w-full mx-auto px-4 py-6 space-y-6 overflow-y-auto">
        {/* Personal result banner */}
        {myResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4 text-center border"
            style={{
              background: "rgba(255,123,61,0.08)",
              borderColor: "var(--coral-dark)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>Tu resultado</p>
            <p className="font-black text-2xl mt-1" style={{ color: "var(--coral)" }}>
              {myResult.pancho_count} 🌭
            </p>
            <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--foreground-muted)" }}>
              {myRank === 1 ? "🏆 ¡CAMPEÓN!" : myRank === 2 ? "🥈 Segundo lugar" : myRank === 3 ? "🥉 Tercer lugar" : `Puesto #${myRank}`}
            </p>
          </motion.div>
        )}

        {/* Podium */}
        {top3.length > 0 && (
          <div className="flex items-end justify-center gap-2 pt-4">
            {PODIUM_CONFIG.map(({ rank, height, color, emoji, delay }) => {
              const p = getParticipantByRank(rank)
              if (!p) return <div key={rank} className="w-24" />
              return (
                <motion.div
                  key={rank}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay, duration: 0.5, type: "spring" }}
                  className="flex flex-col items-center gap-2"
                  style={{ width: rank === 1 ? "7.5rem" : "6rem" }}
                >
                  <Avatar
                    className="border-4"
                    style={{
                      width: rank === 1 ? "3.5rem" : "2.75rem",
                      height: rank === 1 ? "3.5rem" : "2.75rem",
                      borderColor: color,
                    }}
                  >
                    <AvatarImage src={p.profiles?.avatar_url ?? undefined} />
                    <AvatarFallback
                      className="font-black"
                      style={{ background: "var(--coral-dark)", color: "white", fontSize: rank === 1 ? "1rem" : "0.75rem" }}
                    >
                      {p.profiles?.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-center">
                    <p className="font-black text-xs truncate w-full" style={{ color: "var(--foreground)" }}>
                      {p.profiles?.username}
                    </p>
                    <p className="font-black text-sm" style={{ color: "var(--coral)" }}>
                      {p.pancho_count} 🌭
                    </p>
                  </div>

                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: delay + 0.3, duration: 0.4 }}
                    className={`w-full ${height} rounded-t-lg flex items-start justify-center pt-2`}
                    style={{
                      background: rank === 1
                        ? "linear-gradient(to bottom, rgba(212,165,116,0.4), rgba(212,165,116,0.1))"
                        : rank === 2
                          ? "linear-gradient(to bottom, rgba(156,163,175,0.3), rgba(156,163,175,0.08))"
                          : "linear-gradient(to bottom, rgba(146,64,14,0.3), rgba(146,64,14,0.08))",
                      border: `1px solid ${color}40`,
                    }}
                  >
                    <span className="text-xl">{emoji}</span>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Full leaderboard */}
        {participants.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--foreground-muted)" }}>
              Clasificación completa
            </p>
            {participants.map((p, i) => {
              const isMe = p.user_id === currentUser?.id
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 border"
                  style={{
                    background: isMe ? "rgba(255,123,61,0.08)" : "var(--background-2)",
                    borderColor: isMe ? "var(--coral-dark)" : "var(--border-subtle)",
                  }}
                >
                  <span
                    className="font-black text-sm w-6 text-center shrink-0"
                    style={{
                      color: i === 0 ? "var(--gold)" : i === 1 ? "#9ca3af" : i === 2 ? "#92400e" : "var(--foreground-muted)",
                    }}
                  >
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                  </span>
                  <Avatar className="w-7 h-7 shrink-0">
                    <AvatarImage src={p.profiles?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs font-bold" style={{ background: "var(--coral-dark)", color: "white" }}>
                      {p.profiles?.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>
                    {isMe ? `${p.profiles?.username} (vos)` : p.profiles?.username}
                  </span>
                  <span className="font-black text-base shrink-0" style={{ color: i === 0 ? "var(--gold)" : "var(--foreground)" }}>
                    {p.pancho_count} 🌭
                  </span>
                </motion.div>
              )
            })}
          </div>
        )}

        <Link href="/" className="block">
          <Button
            className="w-full font-bold gap-2 h-11"
            style={{ background: "var(--coral)", color: "white" }}
          >
            <Home className="w-4 h-4" /> Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  )
}
