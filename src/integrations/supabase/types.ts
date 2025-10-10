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
      brand_collections: {
        Row: {
          color_theme: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          sort_order: number
          transparency_statement: string | null
          updated_at: string | null
        }
        Insert: {
          color_theme?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          sort_order?: number
          transparency_statement?: string | null
          updated_at?: string | null
        }
        Update: {
          color_theme?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          sort_order?: number
          transparency_statement?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_collections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_documents: {
        Row: {
          content_preview: string | null
          created_at: string | null
          extracted_content: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string | null
          id: string
          organization_id: string
          processing_status: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          content_preview?: string | null
          created_at?: string | null
          extracted_content?: string | null
          file_name: string
          file_size?: number | null
          file_type: string
          file_url?: string | null
          id?: string
          organization_id: string
          processing_status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          content_preview?: string | null
          created_at?: string | null
          extracted_content?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string | null
          id?: string
          organization_id?: string
          processing_status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_knowledge: {
        Row: {
          content: Json
          created_at: string | null
          document_id: string | null
          id: string
          is_active: boolean | null
          knowledge_type: string
          organization_id: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          content?: Json
          created_at?: string | null
          document_id?: string | null
          id?: string
          is_active?: boolean | null
          knowledge_type: string
          organization_id: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          document_id?: string | null
          id?: string
          is_active?: boolean | null
          knowledge_type?: string
          organization_id?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_knowledge_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "brand_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_knowledge_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_products: {
        Row: {
          base_notes: string | null
          collection: string | null
          created_at: string
          id: string
          middle_notes: string | null
          name: string
          organization_id: string
          product_type: string | null
          scent_family: string | null
          top_notes: string | null
          updated_at: string
        }
        Insert: {
          base_notes?: string | null
          collection?: string | null
          created_at?: string
          id?: string
          middle_notes?: string | null
          name: string
          organization_id: string
          product_type?: string | null
          scent_family?: string | null
          top_notes?: string | null
          updated_at?: string
        }
        Update: {
          base_notes?: string | null
          collection?: string | null
          created_at?: string
          id?: string
          middle_notes?: string | null
          name?: string
          organization_id?: string
          product_type?: string | null
          scent_family?: string | null
          top_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_notes: {
        Row: {
          created_at: string | null
          id: string
          note_content: string | null
          organization_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          note_content?: string | null
          organization_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          note_content?: string | null
          organization_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_schedule: {
        Row: {
          core_lexicon: string[] | null
          created_at: string | null
          created_by: string
          end_date: string
          id: string
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          pillar?: Database["public"]["Enums"]["pillar_type"]
          prompts_scheduled?: string[] | null
          start_date?: string
          updated_at?: string | null
          visual_world?: Database["public"]["Enums"]["visual_world"]
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "calendar_schedule_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_settings: {
        Row: {
          auto_suggest: boolean | null
          created_at: string | null
          id: string
          optimal_times: string[] | null
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          platform?: string
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_tasks: {
        Row: {
          created_at: string | null
          due_date: string | null
          id: string
          is_completed: boolean
          organization_id: string | null
          task_text: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean
          organization_id?: string | null
          task_text: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean
          organization_id?: string | null
          task_text?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string
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
          organization_id: string
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
          organization_id?: string
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
          {
            foreignKeyName: "derivative_assets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          access_token_iv: string | null
          created_at: string | null
          encrypted_access_token: string | null
          encrypted_refresh_token: string | null
          id: string
          refresh_token: string
          refresh_token_iv: string | null
          token_expiry: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          access_token_iv?: string | null
          created_at?: string | null
          encrypted_access_token?: string | null
          encrypted_refresh_token?: string | null
          id?: string
          refresh_token: string
          refresh_token_iv?: string | null
          token_expiry?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          access_token_iv?: string | null
          created_at?: string | null
          encrypted_access_token?: string | null
          encrypted_refresh_token?: string | null
          id?: string
          refresh_token?: string
          refresh_token_iv?: string | null
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
          organization_id: string
          pillar_focus: Database["public"]["Enums"]["pillar_type"] | null
          status: string | null
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
          organization_id: string
          pillar_focus?: Database["public"]["Enums"]["pillar_type"] | null
          status?: string | null
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
          organization_id?: string
          pillar_focus?: Database["public"]["Enums"]["pillar_type"] | null
          status?: string | null
          title?: string
          updated_at?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "master_content_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["organization_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["organization_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["organization_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          brand_config: Json | null
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          settings: Json | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          brand_config?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          settings?: Json | null
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          brand_config?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          settings?: Json | null
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      outputs: {
        Row: {
          archived_at: string | null
          created_at: string | null
          created_by: string | null
          generated_content: string
          id: string
          image_urls: Json | null
          is_archived: boolean
          iteration_notes: string | null
          organization_id: string
          performance_metrics: Json | null
          prompt_id: string | null
          quality_rating: number | null
          usage_context: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          created_by?: string | null
          generated_content: string
          id?: string
          image_urls?: Json | null
          is_archived?: boolean
          iteration_notes?: string | null
          organization_id: string
          performance_metrics?: Json | null
          prompt_id?: string | null
          quality_rating?: number | null
          usage_context?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          created_by?: string | null
          generated_content?: string
          id?: string
          image_urls?: Json | null
          is_archived?: boolean
          iteration_notes?: string | null
          organization_id?: string
          performance_metrics?: Json | null
          prompt_id?: string | null
          quality_rating?: number | null
          usage_context?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outputs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
          avg_quality_rating: number | null
          base_notes: string | null
          collection: Database["public"]["Enums"]["collection_type"]
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string | null
          created_by: string | null
          dip_week: number | null
          effectiveness_score: number | null
          id: string
          is_archived: boolean
          is_template: boolean | null
          last_used_at: string | null
          meta_instructions: Json | null
          middle_notes: string | null
          organization_id: string
          parent_prompt_id: string | null
          pillar_focus: Database["public"]["Enums"]["pillar_type"] | null
          prompt_text: string
          scent_family: Database["public"]["Enums"]["scent_family"] | null
          tags: string[] | null
          times_used: number | null
          title: string
          top_notes: string | null
          transparency_statement: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          archived_at?: string | null
          avg_quality_rating?: number | null
          base_notes?: string | null
          collection: Database["public"]["Enums"]["collection_type"]
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          created_by?: string | null
          dip_week?: number | null
          effectiveness_score?: number | null
          id?: string
          is_archived?: boolean
          is_template?: boolean | null
          last_used_at?: string | null
          meta_instructions?: Json | null
          middle_notes?: string | null
          organization_id: string
          parent_prompt_id?: string | null
          pillar_focus?: Database["public"]["Enums"]["pillar_type"] | null
          prompt_text: string
          scent_family?: Database["public"]["Enums"]["scent_family"] | null
          tags?: string[] | null
          times_used?: number | null
          title: string
          top_notes?: string | null
          transparency_statement?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          archived_at?: string | null
          avg_quality_rating?: number | null
          base_notes?: string | null
          collection?: Database["public"]["Enums"]["collection_type"]
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          created_by?: string | null
          dip_week?: number | null
          effectiveness_score?: number | null
          id?: string
          is_archived?: boolean
          is_template?: boolean | null
          last_used_at?: string | null
          meta_instructions?: Json | null
          middle_notes?: string | null
          organization_id?: string
          parent_prompt_id?: string | null
          pillar_focus?: Database["public"]["Enums"]["pillar_type"] | null
          prompt_text?: string
          scent_family?: Database["public"]["Enums"]["scent_family"] | null
          tags?: string[] | null
          times_used?: number | null
          title?: string
          top_notes?: string | null
          transparency_statement?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prompts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
            foreignKeyName: "scheduled_content_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      has_organization_role: {
        Args: {
          _org_id: string
          _role: Database["public"]["Enums"]["organization_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_organization_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      collection_type: "cadence" | "reserve" | "purity" | "sacred_space"
      content_type: "product" | "email" | "social" | "visual" | "blog"
      organization_role: "owner" | "admin" | "member"
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
      content_type: ["product", "email", "social", "visual", "blog"],
      organization_role: ["owner", "admin", "member"],
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
