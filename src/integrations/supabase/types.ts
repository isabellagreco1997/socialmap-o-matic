export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      edges: {
        Row: {
          created_at: string
          id: string
          label: string | null
          network_id: string
          source_id: string
          target_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string | null
          network_id: string
          source_id: string
          target_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string | null
          network_id?: string
          source_id?: string
          target_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edges_network_id_fkey"
            columns: ["network_id"]
            isOneToOne: false
            referencedRelation: "networks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edges_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edges_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      networks: {
        Row: {
          created_at: string
          id: string
          name: string
          order: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          order?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          order?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nodes: {
        Row: {
          address: string | null
          created_at: string
          date: string | null
          id: string
          image_url: string | null
          name: string
          network_id: string
          notes: string | null
          profile_url: string | null
          type: string
          updated_at: string
          x_position: number | null
          y_position: number | null
          color: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          date?: string | null
          id?: string
          image_url?: string | null
          name: string
          network_id: string
          notes?: string | null
          profile_url?: string | null
          type: string
          updated_at?: string
          x_position?: number | null
          y_position?: number | null
          color?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          date?: string | null
          id?: string
          image_url?: string | null
          name?: string
          network_id?: string
          notes?: string | null
          profile_url?: string | null
          type?: string
          updated_at?: string
          x_position?: number | null
          y_position?: number | null
          color?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nodes_network_id_fkey"
            columns: ["network_id"]
            isOneToOne: false
            referencedRelation: "networks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          subscription_status: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          subscription_status?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          subscription_status?: string | null
        }
        Relationships: []
      }
      todos: {
        Row: {
          completed: boolean
          created_at: string
          due_date: string | null
          id: string
          node_id: string
          text: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          due_date?: string | null
          id?: string
          node_id: string
          text: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          due_date?: string | null
          id?: string
          node_id?: string
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "todos_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
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
