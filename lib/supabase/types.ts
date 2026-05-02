export type RoomStatus = "waiting" | "active" | "finished"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          id: string
          name: string
          created_by: string
          duration_seconds: number
          status: RoomStatus
          started_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_by: string
          duration_seconds: number
          status?: RoomStatus
          started_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_by?: string
          duration_seconds?: number
          status?: RoomStatus
          started_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      room_participants: {
        Row: {
          id: string
          room_id: string
          user_id: string
          pancho_count: number
          last_increment_at: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          pancho_count?: number
          last_increment_at?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          pancho_count?: number
          last_increment_at?: string | null
          joined_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Room = Database["public"]["Tables"]["rooms"]["Row"]
export type RoomParticipant = Database["public"]["Tables"]["room_participants"]["Row"]

export type RoomParticipantWithProfile = RoomParticipant & {
  profiles: Profile
}

export type RoomWithCreator = Room & {
  profiles: Profile
  room_participants: { count: number }[]
}
