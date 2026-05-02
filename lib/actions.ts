"use server"

import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function startRoom(roomId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const { data: room } = await supabase
    .from("rooms")
    .select("created_by, status")
    .eq("id", roomId)
    .single()

  if (!room || room.created_by !== user.id) return { error: "Solo el creador puede iniciar" }
  if (room.status !== "waiting") return { error: "La sala ya fue iniciada" }

  const admin = createAdminClient()
  const { error } = await admin
    .from("rooms")
    .update({ status: "active", started_at: new Date().toISOString() })
    .eq("id", roomId)
    .eq("status", "waiting")

  return { error: error?.message ?? null }
}

export async function finishRoom(roomId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const { data: participant } = await supabase
    .from("room_participants")
    .select("id")
    .eq("room_id", roomId)
    .eq("user_id", user.id)
    .single()

  if (!participant) return { error: "No participás en esta sala" }

  const { data: room } = await supabase
    .from("rooms")
    .select("status, started_at, duration_seconds")
    .eq("id", roomId)
    .single()

  if (!room || room.status !== "active") return { error: null }

  const elapsed = (Date.now() - new Date(room.started_at!).getTime()) / 1000
  if (elapsed < room.duration_seconds - 2) return { error: "El tiempo no terminó todavía" }

  const admin = createAdminClient()
  await admin.from("rooms").update({ status: "finished" }).eq("id", roomId).eq("status", "active")

  return { error: null }
}

export async function joinRoom(roomId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Tenés que iniciar sesión" }

  const { data: room } = await supabase
    .from("rooms")
    .select("status")
    .eq("id", roomId)
    .single()

  if (!room) return { error: "Sala no encontrada" }
  if (room.status === "finished") return { error: "Esta sala ya terminó" }

  const { error } = await supabase
    .from("room_participants")
    .upsert({ room_id: roomId, user_id: user.id }, { onConflict: "room_id,user_id" })

  return { error: error?.message ?? null }
}
