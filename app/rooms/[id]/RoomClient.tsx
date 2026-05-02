"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Profile, Room, RoomParticipant } from "@/lib/supabase/types"
import RoomLobby from "./RoomLobby"
import RoomContest from "./RoomContest"
import RoomResults from "./RoomResults"

type ParticipantWithProfile = RoomParticipant & { profiles: Profile }
type RoomWithCreator = Room & { profiles: Profile }

interface RoomClientProps {
  initialRoom: RoomWithCreator
  initialParticipants: ParticipantWithProfile[]
  currentUser: { id: string; profile: Profile | null } | null
}

export default function RoomClient({ initialRoom, initialParticipants, currentUser }: RoomClientProps) {
  const supabase = createClient()
  const [room, setRoom] = useState<RoomWithCreator>(initialRoom)
  const [participants, setParticipants] = useState<ParticipantWithProfile[]>(initialParticipants)

  const refreshParticipants = useCallback(async () => {
    const { data } = await supabase
      .from("room_participants")
      .select("*, profiles(username, avatar_url)")
      .eq("room_id", room.id)
      .order("pancho_count", { ascending: false })
    if (data) setParticipants(data as ParticipantWithProfile[])
  }, [room.id, supabase])

  useEffect(() => {
    const channel = supabase
      .channel(`room:${room.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms", filter: `id=eq.${room.id}` },
        async (payload) => {
          if (payload.new) {
            const { data } = await supabase
              .from("rooms")
              .select("*, profiles(username, avatar_url)")
              .eq("id", room.id)
              .single()
            if (data) setRoom(data as RoomWithCreator)
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_participants", filter: `room_id=eq.${room.id}` },
        () => refreshParticipants()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [room.id, supabase, refreshParticipants])

  const sortedParticipants = [...participants].sort((a, b) => {
    if (b.pancho_count !== a.pancho_count) return b.pancho_count - a.pancho_count
    const aTime = a.last_increment_at ? new Date(a.last_increment_at).getTime() : Infinity
    const bTime = b.last_increment_at ? new Date(b.last_increment_at).getTime() : Infinity
    return aTime - bTime
  })

  if (room.status === "waiting") {
    return (
      <RoomLobby
        room={room}
        participants={sortedParticipants}
        currentUser={currentUser}
      />
    )
  }

  if (room.status === "active") {
    return (
      <RoomContest
        room={room}
        participants={sortedParticipants}
        currentUser={currentUser}
      />
    )
  }

  return (
    <RoomResults
      room={room}
      participants={sortedParticipants}
      currentUser={currentUser}
    />
  )
}
