export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cois: {
        Row: {
          contact_info: string | null
          created_at: string
          id: string
          industry: string | null
          last_contact: string | null
          name: string
          notes: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          contact_info?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          last_contact?: string | null
          name: string
          notes?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          contact_info?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          last_contact?: string | null
          name?: string
          notes?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      forum_comments: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          id: string
          post_id: string | null
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          id?: string
          post_id?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          post_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          author_id: string | null
          category: string
          content: string
          created_at: string
          id: string
          likes: number | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category: string
          content: string
          created_at?: string
          id?: string
          likes?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: string
          created_at?: string
          id?: string
          likes?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hotspots: {
        Row: {
          contact_info: string | null
          created_at: string
          description: string | null
          id: string
          location: string | null
          name: string
          notes: string | null
          type: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          contact_info?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          type: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          contact_info?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          type?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      lead_hotspots: {
        Row: {
          created_at: string
          hotspot_id: string | null
          id: string
          lead_id: string | null
        }
        Insert: {
          created_at?: string
          hotspot_id?: string | null
          id?: string
          lead_id?: string | null
        }
        Update: {
          created_at?: string
          hotspot_id?: string | null
          id?: string
          lead_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_hotspots_hotspot_id_fkey"
            columns: ["hotspot_id"]
            isOneToOne: false
            referencedRelation: "hotspots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_hotspots_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          city: string | null
          contact: string | null
          country: string | null
          created_at: string
          estimated_wealth: number | null
          first_name: string
          frequented_hotspots: number | null
          id: string
          last_contact: string | null
          last_name: string
          misc: string | null
          notes: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          contact?: string | null
          country?: string | null
          created_at?: string
          estimated_wealth?: number | null
          first_name: string
          frequented_hotspots?: number | null
          id?: string
          last_contact?: string | null
          last_name: string
          misc?: string | null
          notes?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          contact?: string | null
          country?: string | null
          created_at?: string
          estimated_wealth?: number | null
          first_name?: string
          frequented_hotspots?: number | null
          id?: string
          last_contact?: string | null
          last_name?: string
          misc?: string | null
          notes?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      "Private Members' Club": {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: number
          location: string | null
          membership_fee: number | null
          name: string | null
          type: string | null
          website: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: number
          location?: string | null
          membership_fee?: number | null
          name?: string | null
          type?: string | null
          website?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: number
          location?: string | null
          membership_fee?: number | null
          name?: string | null
          type?: string | null
          website?: string | null
        }
        Relationships: []
      }
      private_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          industry: string | null
          location: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          industry?: string | null
          location?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      research_entries: {
        Row: {
          content: string | null
          created_at: string
          headline: string
          id: string
          source: string | null
          tags: string[] | null
          url: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          headline: string
          id?: string
          source?: string | null
          tags?: string[] | null
          url?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          headline?: string
          id?: string
          source?: string | null
          tags?: string[] | null
          url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      research_reports: {
        Row: {
          created_at: string
          file_path: string
          id: string
          thumbnail_path: string | null
          title: string
        }
        Insert: {
          created_at?: string
          file_path: string
          id?: string
          thumbnail_path?: string | null
          title: string
        }
        Update: {
          created_at?: string
          file_path?: string
          id?: string
          thumbnail_path?: string | null
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
