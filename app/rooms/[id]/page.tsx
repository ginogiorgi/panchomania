import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import RoomClient from "./RoomClient"
import type { Profile, Room, RoomParticipant } from "@/lib/supabase/types"

type RoomWithCreator = Room & { profiles: Profile }
type ParticipantWithProfile = RoomParticipant & { profiles: Profile }

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: roomRaw }, { data: participantsRaw }] = await Promise.all([
    supabase.from("rooms").select("*, profiles(username, avatar_url)").eq("id", id).single(),
    supabase
      .from("room_participants")
      .select("*, profiles(username, avatar_url)")
      .eq("room_id", id)
      .order("pancho_count", { ascending: false }),
  ])

  if (!roomRaw) notFound()

  const room = roomRaw as unknown as RoomWithCreator
  const participants = (participantsRaw ?? []) as unknown as ParticipantWithProfile[]

  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data as Profile | null
  }

  return (
    <RoomClient
      initialRoom={room}
      initialParticipants={participants}
      currentUser={user ? { id: user.id, profile } : null}
    />
  )
}
