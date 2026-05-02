import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CreateRoomForm from "./CreateRoomForm"

export default async function CreateRoomPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return <CreateRoomForm userId={user.id} />
}
