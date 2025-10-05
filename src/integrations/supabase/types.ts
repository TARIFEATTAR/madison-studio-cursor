export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      calendar_schedule: {
        Row: {
          core_lexicon: string[] | null
          created_at: string | null
          created_by: string
          end_date: string
          id: string
          pillar: Database["public"]["Enums"]["pillar_type"]
          prompts_scheduled: string[] | null
          start_date: string
          updated_at: string | null
          visual_world: Database["public"]["Enums"]["visual_world"]
          week_number: number
        }
        Insert: {
          core_lexicon?: string[] | null
          created_at?: string | null
          created_by: string
          end_date: string
          id?: string
          pillar: Database["public"]["Enums"]["pillar_type"]
          prompts_scheduled?: string[] | null
          start_date: string
          updated_at?: string | null
          visual_world: Database["public"]["Enums"]["visual_world"]
          week_number: number
        }
        Update: {
          core_lexicon?: string[] | null
          created_at?: string | null
          created_by?: string
          end_date?: string
          id?: string
          pillar?: Database["public"]["Enums"]["pillar_type"]
          prompts_scheduled?: string[] | null
          start_date?: string
          updated_at?: string | null
          visual_world?: Database["public"]["Enums"]["visual_world"]
          week_number?: number
        }
        Relationships: []
      }
      calendar_settings: {
        Row: {
          auto_suggest: boolean | null
          created_at: string | null
          id: string
          optimal_times: string[] | null
          platform: string
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_suggest?: boolean | null
          created_at?: string | null
          id?: string
          optimal_times?: string[] | null
          platform: string
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_suggest?: boolean | null
          created_at?: string | null
          id?: string
          optimal_times?: string[] | null
          platform?: string
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      derivative_assets: {
        Row: {
          approval_status: string | null
          archived_at: string | null
          asset_type: string
          created_at: string | null
          created_by: string | null
          generated_content: string | null
          id: string
          is_archived: boolean
          master_content_id: string | null
          platform_specs: Json | null
          published_at: string | null
          quality_rating: number | null
        }
        Insert: {
          approval_status?: string | null
          archived_at?: string | null
          asset_type: string
          created_at?: string | null
          created_by?: string | null
          generated_content?: string | null
          id?: string
          is_archived?: boolean
          master_content_id?: string | null
          platform_specs?: Json | null
          published_at?: string | null
          quality_rating?: number | null
        }
        Update: {
          approval_status?: string | null
          archived_at?: string | null
          asset_type?: string
          created_at?: string | null
          created_by?: string | null
          generated_content?: string | null
          id?: string
          is_archived?: boolean
          master_content_id?: string | null
          platform_specs?: Json | null
          published_at?: string | null
          quality_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "derivative_assets_master_content_id_fkey"
            columns: ["master_content_id"]
            isOneToOne: false
            referencedRelation: "master_content"
            referencedColumns: ["id"]
          },
        ]
      }
      dip_week_calendar: {
        Row: {
          core_lexicon: string[] | null
          created_at: string | null
          end_date: string
          id: string
          pillar: string
          start_date: string
          visual_world: string
          week_number: number
        }
        Insert: {
          core_lexicon?: string[] | null
          created_at?: string | null
          end_date: string
          id?: string
          pillar: string
          start_date: string
          visual_world: string
          week_number: number
        }
        Update: {
          core_lexicon?: string[] | null
          created_at?: string | null
          end_date?: string
          id?: string
          pillar?: string
          start_date?: string
          visual_world?: string
          week_number?: number
        }
        Relationships: []
      }
      google_calendar_sync: {
        Row: {
          calendar_id: string | null
          created_at: string | null
          id: string
          last_sync_at: string | null
          sync_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calendar_id?: string | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          sync_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calendar_id?: string | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          sync_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      google_calendar_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          id: string
          refresh_token: string
          token_expiry: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          id?: string
          refresh_token: string
          token_expiry?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          id?: string
          refresh_token?: string
          token_expiry?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      master_content: {
        Row: {
          archived_at: string | null
          collection: Database["public"]["Enums"]["collection_type"] | null
          content_type: string
          created_at: string | null
          created_by: string | null
          dip_week: number | null
          full_content: string
          id: string
          is_archived: boolean
          pillar_focus: Database["public"]["Enums"]["pillar_type"] | null
          title: string
          updated_at: string | null
          word_count: number | null
        }
        Insert: {
          archived_at?: string | null
          collection?: Database["public"]["Enums"]["collection_type"] | null
          content_type: string
          created_at?: string | null
          created_by?: string | null
          dip_week?: number | null
          full_content: string
          id?: string
          is_archived?: boolean
          pillar_focus?: Database["public"]["Enums"]["pillar_type"] | null
          title: string
          updated_at?: string | null
          word_count?: number | null
        }
        Update: {
          archived_at?: string | null
          collection?: Database["public"]["Enums"]["collection_type"] | null
          content_type?: string
          created_at?: string | null
          created_by?: string | null
          dip_week?: number | null
          full_content?: string
          id?: string
          is_archived?: boolean
          pillar_focus?: Database["public"]["Enums"]["pillar_type"] | null
          title?: string
          updated_at?: string | null
          word_count?: number | null
        }
        Relationships: []
      }
      outputs: {
        Row: {
          created_at: string | null
          created_by: string | null
          generated_content: string
          id: string
          image_urls: Json | null
          iteration_notes: string | null
          performance_metrics: Json | null
          prompt_id: string | null
          quality_rating: number | null
          usage_context: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          generated_content: string
          id?: string
          image_urls?: Json | null
          iteration_notes?: string | null
          performance_metrics?: Json | null
          prompt_id?: string | null
          quality_rating?: number | null
          usage_context?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          generated_content?: string
          id?: string
          image_urls?: Json | null
          iteration_notes?: string | null
          performance_metrics?: Json | null
          prompt_id?: string | null
          quality_rating?: number | null
          usage_context?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outputs_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          archived_at: string | null
          base_notes: string | null
          collection: Database["public"]["Enums"]["collection_type"]
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string | null
          created_by: string | null
          dip_week: number | null
          id: string
          is_archived: boolean
          meta_instructions: Json | null
          middle_notes: string | null
          parent_prompt_id: string | null
          pillar_focus: Database["public"]["Enums"]["pillar_type"] | null
          prompt_text: string
          scent_family: Database["public"]["Enums"]["scent_family"] | null
          title: string
          top_notes: string | null
          transparency_statement: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          archived_at?: string | null
          base_notes?: string | null
          collection: Database["public"]["Enums"]["collection_type"]
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          created_by?: string | null
          dip_week?: number | null
          id?: string
          is_archived?: boolean
          meta_instructions?: Json | null
          middle_notes?: string | null
          parent_prompt_id?: string | null
          pillar_focus?: Database["public"]["Enums"]["pillar_type"] | null
          prompt_text: string
          scent_family?: Database["public"]["Enums"]["scent_family"] | null
          title: string
          top_notes?: string | null
          transparency_statement?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          archived_at?: string | null
          base_notes?: string | null
          collection?: Database["public"]["Enums"]["collection_type"]
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          created_by?: string | null
          dip_week?: number | null
          id?: string
          is_archived?: boolean
          meta_instructions?: Json | null
          middle_notes?: string | null
          parent_prompt_id?: string | null
          pillar_focus?: Database["public"]["Enums"]["pillar_type"] | null
          prompt_text?: string
          scent_family?: Database["public"]["Enums"]["scent_family"] | null
          title?: string
          top_notes?: string | null
          transparency_statement?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prompts_parent_prompt_id_fkey"
            columns: ["parent_prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      repurposing_rules: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          platform_constraints: Json | null
          source_type: string
          target_type: string
          transformation_prompt: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform_constraints?: Json | null
          source_type: string
          target_type: string
          transformation_prompt: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform_constraints?: Json | null
          source_type?: string
          target_type?: string
          transformation_prompt?: string
        }
        Relationships: []
      }
      scheduled_content: {
        Row: {
          content_id: string | null
          content_type: string
          created_at: string | null
          derivative_id: string | null
          dip_week: number | null
          google_event_id: string | null
          id: string
          notes: string | null
          pillar: string | null
          platform: string | null
          prompt_id: string | null
          scheduled_date: string
          scheduled_time: string | null
          status: string | null
          sync_status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content_id?: string | null
          content_type: string
          created_at?: string | null
          derivative_id?: string | null
          dip_week?: number | null
          google_event_id?: string | null
          id?: string
          notes?: string | null
          pillar?: string | null
          platform?: string | null
          prompt_id?: string | null
          scheduled_date: string
          scheduled_time?: string | null
          status?: string | null
          sync_status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content_id?: string | null
          content_type?: string
          created_at?: string | null
          derivative_id?: string | null
          dip_week?: number | null
          google_event_id?: string | null
          id?: string
          notes?: string | null
          pillar?: string | null
          platform?: string | null
          prompt_id?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          status?: string | null
          sync_status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_content_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "master_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_content_derivative_id_fkey"
            columns: ["derivative_id"]
            isOneToOne: false
            referencedRelation: "derivative_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_content_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary_library: {
        Row: {
          created_at: string | null
          id: string
          is_forbidden: boolean | null
          pillar: Database["public"]["Enums"]["pillar_type"]
          suggested_alternatives: string[] | null
          term: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_forbidden?: boolean | null
          pillar: Database["public"]["Enums"]["pillar_type"]
          suggested_alternatives?: string[] | null
          term: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_forbidden?: boolean | null
          pillar?: Database["public"]["Enums"]["pillar_type"]
          suggested_alternatives?: string[] | null
          term?: string
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
      collection_type: "cadence" | "reserve" | "purity" | "sacred_space"
      content_type: "product" | "email" | "social" | "visual"
      pillar_type: "identity" | "memory" | "remembrance" | "cadence"
      scent_family: "warm" | "floral" | "fresh" | "woody"
      visual_world:
        | "silk_road"
        | "maritime_voyage"
        | "imperial_garden"
        | "royal_court"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      collection_type: ["cadence", "reserve", "purity", "sacred_space"],
      content_type: ["product", "email", "social", "visual"],
      pillar_type: ["identity", "memory", "remembrance", "cadence"],
      scent_family: ["warm", "floral", "fresh", "woody"],
      visual_world: [
        "silk_road",
        "maritime_voyage",
        "imperial_garden",
        "royal_court",
      ],
    },
  },
} as const
