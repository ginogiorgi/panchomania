"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/supabase/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { History, LogOut, User } from "lucide-react"

interface NavbarProps {
  profile: Profile | null
}

export default function Navbar({ profile }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b"
      style={{
        background: "var(--glass)",
        backdropFilter: "blur(12px)",
        borderColor: "var(--border)",
      }}
    >
      <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight">
        <span className="text-2xl">🌭</span>
        <span style={{ color: "var(--coral)" }}>PANCHOMANIA</span>
      </Link>

      {profile ? (
        <div className="flex items-center gap-2">
          <Link href="/history">
            <Button variant="ghost" size="icon" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
              <History className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="w-8 h-8 border-2" style={{ borderColor: "var(--coral-dark)" }}>
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback
                  className="text-xs font-bold"
                  style={{ background: "var(--coral-dark)", color: "var(--foreground)" }}
                >
                  {profile.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-[var(--foreground-muted)]">
              Entrar
            </Button>
          </Link>
          <Link href="/register">
            <Button
              size="sm"
              className="font-bold"
              style={{ background: "var(--coral)", color: "white" }}
            >
              Registrarse
            </Button>
          </Link>
        </div>
      )}
    </nav>
  )
}
