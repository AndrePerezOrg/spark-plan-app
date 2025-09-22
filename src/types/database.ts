export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      boards: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      columns: {
        Row: {
          id: string
          name: string
          board_id: string
          position: number
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          board_id: string
          position: number
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          board_id?: string
          position?: number
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      cards: {
        Row: {
          id: string
          title: string
          description: string | null
          column_id: string
          creator_id: string
          position: number
          priority: 'low' | 'medium' | 'high'
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          column_id: string
          creator_id: string
          position: number
          priority?: 'low' | 'medium' | 'high'
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          column_id?: string
          creator_id?: string
          position?: number
          priority?: 'low' | 'medium' | 'high'
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          card_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          card_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          card_id?: string
          user_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          card_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          card_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          card_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      priority: 'low' | 'medium' | 'high'
    }
  }
}

export type Priority = 'low' | 'medium' | 'high'

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type Board = Database['public']['Tables']['boards']['Row']
export type Column = Database['public']['Tables']['columns']['Row']
export type Card = Database['public']['Tables']['cards']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']

export interface CardWithDetails extends Card {
  creator?: UserProfile
  vote_count?: number
  comment_count?: number
  user_has_voted?: boolean
  comments?: CommentWithUser[]
}

export interface CommentWithUser extends Comment {
  user?: UserProfile
}

export interface ColumnWithCards extends Column {
  cards?: CardWithDetails[]
}

export interface BoardWithColumns extends Board {
  columns?: ColumnWithCards[]
  creator?: UserProfile
}