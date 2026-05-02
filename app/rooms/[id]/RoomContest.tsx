"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { finishRoom } from "@/lib/actions"
import type { Profile, Room, RoomParticipant } from "@/lib/supabase/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import { Minus, Plus } from "lucide-react"

type ParticipantWithProfile = RoomParticipant & { profiles: Profile }
type RoomWithCreator = Room & { profiles: Profile }

interface Props {
  room: RoomWithCreator
  participants: ParticipantWithProfile[]
  currentUser: { id: string; profile: Profile | null } | null
}

function formatTime(seconds: number) {
  const m = Math.floor(Math.max(0, seconds) / 60)
  const s = Math.max(0, seconds) % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

export default function RoomContest({ room, participants, currentUser }: Props) {
  const supabase = createClient()
  const [timeLeft, setTimeLeft] = useState(() => {
    const elapsed = (Date.now() - new Date(room.started_at!).getTime()) / 1000
    return Math.max(0, Math.ceil(room.duration_seconds - elapsed))
  })
  const [localCount, setLocalCount] = useState<number>(() => {
    const me = participants.find((p) => p.user_id === currentUser?.id)
    return me?.pancho_count ?? 0
  })
  const [pressing, setPressing] = useState<"plus" | "minus" | null>(null)
  const finished = useRef(false)

  const myParticipant = participants.find((p) => p.user_id === currentUser?.id)
  const myRank = participants.findIndex((p) => p.user_id === currentUser?.id) + 1

  const isParticipant = !!myParticipant

  const handleFinish = useCallback(async () => {
    if (finished.current) return
    finished.current = true
    await finishRoom(room.id)
  }, [room.id])

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (Date.now() - new Date(room.started_at!).getTime()) / 1000
      const remaining = Math.ceil(room.duration_seconds - elapsed)
      setTimeLeft(Math.max(0, remaining))
      if (remaining <= 0) {
        clearInterval(interval)
        handleFinish()
      }
    }, 250)
    return () => clearInterval(interval)
  }, [room.started_at, room.duration_seconds, handleFinish])

  const updateCount = useCallback(
    async (delta: number) => {
      if (!currentUser || !myParticipant || timeLeft <= 0) return
      const next = Math.max(0, localCount + delta)
      if (next === localCount) return
      setLocalCount(next)

      const now = new Date().toISOString()
      await supabase
        .from("room_participants")
        .update(delta > 0
          ? { pancho_count: next, last_increment_at: now }
          : { pancho_count: next }
        )
        .eq("id", myParticipant.id)
    },
    [currentUser, myParticipant, timeLeft, localCount, supabase]
  )

  const isUrgent = timeLeft <= 10 && timeLeft > 0
  const isCritical = timeLeft <= 5 && timeLeft > 0

  return (
    <div
      className="flex flex-col min-h-screen select-none"
      style={{ background: "var(--background)" }}
    >
      {/* Timer */}
      <div
        className="flex flex-col items-center justify-center py-6 px-4 border-b"
        style={{
          background: "var(--background-2)",
          borderColor: isUrgent ? "var(--coral)" : "var(--border)",
        }}
      >
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--foreground-muted)" }}>
          Tiempo restante
        </p>
        <motion.div
          animate={isCritical ? { scale: [1, 1.05, 1] } : { scale: 1 }}
          transition={{ repeat: Infinity, duration: 0.5 }}
        >
          <span
            className="font-black tabular-nums"
            style={{
              fontSize: "clamp(3rem, 12vw, 5rem)",
              color: isUrgent ? "var(--coral)" : "var(--foreground)",
              textShadow: isUrgent ? "0 0 30px rgba(255,123,61,0.5)" : "none",
            }}
          >
            {formatTime(timeLeft)}
          </span>
        </motion.div>
        <p className="text-sm font-bold mt-1" style={{ color: "var(--coral)" }}>
          {room.name}
        </p>
      </div>

      {/* Landscape: split layout / Portrait: stacked */}
      <div className="flex-1 flex flex-col landscape:flex-row gap-0 overflow-hidden">

        {/* Ranking panel */}
        <div
          className="flex-1 overflow-y-auto px-3 py-3 landscape:max-w-xs landscape:border-r"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-2 px-1" style={{ color: "var(--foreground-muted)" }}>
            Ranking
          </p>
          <div className="space-y-1.5">
            <AnimatePresence initial={false}>
              {participants.map((p, i) => {
                const isMe = p.user_id === currentUser?.id
                const count = isMe ? localCount : p.pancho_count
                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 border"
                    style={{
                      background: isMe ? "rgba(255,123,61,0.1)" : "var(--background-2)",
                      borderColor: isMe ? "var(--coral-dark)" : "var(--border-subtle)",
                    }}
                  >
                    <span
                      className="font-black text-sm w-5 text-center shrink-0"
                      style={{ color: i === 0 ? "var(--gold)" : "var(--foreground-muted)" }}
                    >
                      {i + 1}
                    </span>
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarImage src={p.profiles?.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs font-bold" style={{ background: "var(--coral-dark)", color: "white" }}>
                        {p.profiles?.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>
                      {isMe ? "Vos" : p.profiles?.username}
                    </span>
                    <span className="font-black text-base shrink-0" style={{ color: isMe ? "var(--coral)" : "var(--foreground)" }}>
                      {count} 🌭
                    </span>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Buttons panel */}
        {isParticipant ? (
          <div className="flex flex-col items-center justify-center gap-4 px-4 py-6 landscape:flex-1">
            {myRank > 0 && (
              <p className="text-sm font-semibold" style={{ color: "var(--foreground-muted)" }}>
                Estás {myRank === 1 ? "🥇 primero" : myRank === 2 ? "🥈 segundo" : myRank === 3 ? "🥉 tercero" : `en el puesto ${myRank}`}
              </p>
            )}

            <motion.div
              key={localCount}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="font-black"
              style={{ fontSize: "clamp(2.5rem, 10vw, 4rem)", color: "var(--coral)", lineHeight: 1 }}
            >
              {localCount} 🌭
            </motion.div>

            <div className="flex gap-4">
              {/* Minus */}
              <motion.button
                onTapStart={() => setPressing("minus")}
                onTap={() => { setPressing(null); updateCount(-1) }}
                onTapCancel={() => setPressing(null)}
                disabled={timeLeft <= 0 || localCount <= 0}
                whileTap={{ scale: 0.92 }}
                className="flex items-center justify-center rounded-2xl font-black transition-all disabled:opacity-30"
                style={{
                  width: "clamp(80px, 20vw, 110px)",
                  height: "clamp(80px, 20vw, 110px)",
                  background: pressing === "minus" ? "var(--background-3)" : "var(--background-2)",
                  border: "2px solid var(--border)",
                  color: "var(--foreground-muted)",
                  fontSize: "clamp(1.5rem, 5vw, 2rem)",
                }}
              >
                <Minus strokeWidth={3} />
              </motion.button>

              {/* Plus */}
              <motion.button
                onTapStart={() => setPressing("plus")}
                onTap={() => { setPressing(null); updateCount(1) }}
                onTapCancel={() => setPressing(null)}
                disabled={timeLeft <= 0}
                whileTap={{ scale: 0.92 }}
                className="flex items-center justify-center rounded-2xl font-black transition-all disabled:opacity-30"
                style={{
                  width: "clamp(80px, 20vw, 110px)",
                  height: "clamp(80px, 20vw, 110px)",
                  background: pressing === "plus" ? "var(--coral-mid)" : "var(--coral)",
                  boxShadow: "0 0 20px rgba(255,123,61,0.4)",
                  color: "white",
                  fontSize: "clamp(1.5rem, 5vw, 2rem)",
                }}
              >
                <Plus strokeWidth={3} />
              </motion.button>
            </div>

            {timeLeft <= 0 && (
              <p className="text-sm font-bold" style={{ color: "var(--foreground-muted)" }}>
                ¡Tiempo terminado!
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-8 landscape:flex-1">
            <div className="text-4xl">👀</div>
            <p className="text-sm text-center" style={{ color: "var(--foreground-muted)" }}>
              Estás mirando el concurso
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
