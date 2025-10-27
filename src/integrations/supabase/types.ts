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
          processing_stage: string | null
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
          processing_stage?: string | null
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
          processing_stage?: string | null
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
      brand_health: {
        Row: {
          completeness_score: number
          created_at: string
          gap_analysis: Json
          id: string
          last_analyzed_at: string
          organization_id: string
          recommendations: Json
          updated_at: string
        }
        Insert: {
          completeness_score?: number
          created_at?: string
          gap_analysis?: Json
          id?: string
          last_analyzed_at?: string
          organization_id: string
          recommendations?: Json
          updated_at?: string
        }
        Update: {
          completeness_score?: number
          created_at?: string
          gap_analysis?: Json
          id?: string
          last_analyzed_at?: string
          organization_id?: string
          recommendations?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_health_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_health_history: {
        Row: {
          analyzed_at: string
          completeness_score: number
          created_at: string
          gap_analysis: Json
          id: string
          organization_id: string
          recommendations: Json
        }
        Insert: {
          analyzed_at?: string
          completeness_score: number
          created_at?: string
          gap_analysis?: Json
          id?: string
          organization_id: string
          recommendations?: Json
        }
        Update: {
          analyzed_at?: string
          completeness_score?: number
          created_at?: string
          gap_analysis?: Json
          id?: string
          organization_id?: string
          recommendations?: Json
        }
        Relationships: [
          {
            foreignKeyName: "brand_health_history_organization_id_fkey"
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
          benefits: string | null
          burn_time: string | null
          category: string | null
          collection: string | null
          created_at: string
          description: string | null
          format: string | null
          formulation_type: string | null
          id: string
          key_ingredients: string | null
          last_shopify_sync: string | null
          middle_notes: string | null
          name: string
          organization_id: string
          product_type: string | null
          scent_family: string | null
          scent_profile: string | null
          shopify_product_id: string | null
          shopify_sync_status: string | null
          shopify_variant_id: string | null
          tone: string | null
          top_notes: string | null
          updated_at: string
          usage: string | null
          usp: string | null
        }
        Insert: {
          base_notes?: string | null
          benefits?: string | null
          burn_time?: string | null
          category?: string | null
          collection?: string | null
          created_at?: string
          description?: string | null
          format?: string | null
          formulation_type?: string | null
          id?: string
          key_ingredients?: string | null
          last_shopify_sync?: string | null
          middle_notes?: string | null
          name: string
          organization_id: string
          product_type?: string | null
          scent_family?: string | null
          scent_profile?: string | null
          shopify_product_id?: string | null
          shopify_sync_status?: string | null
          shopify_variant_id?: string | null
          tone?: string | null
          top_notes?: string | null
          updated_at?: string
          usage?: string | null
          usp?: string | null
        }
        Update: {
          base_notes?: string | null
          benefits?: string | null
          burn_time?: string | null
          category?: string | null
          collection?: string | null
          created_at?: string
          description?: string | null
          format?: string | null
          formulation_type?: string | null
          id?: string
          key_ingredients?: string | null
          last_shopify_sync?: string | null
          middle_notes?: string | null
          name?: string
          organization_id?: string
          product_type?: string | null
          scent_family?: string | null
          scent_profile?: string | null
          shopify_product_id?: string | null
          shopify_sync_status?: string | null
          shopify_variant_id?: string | null
          tone?: string | null
          top_notes?: string | null
          updated_at?: string
          usage?: string | null
          usp?: string | null
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
          prompts_scheduled: string[] | null
          start_date: string
          updated_at: string | null
          week_number: number
        }
        Insert: {
          core_lexicon?: string[] | null
          created_at?: string | null
          created_by: string
          end_date: string
          id?: string
          organization_id?: string | null
          prompts_scheduled?: string[] | null
          start_date: string
          updated_at?: string | null
          week_number: number
        }
        Update: {
          core_lexicon?: string[] | null
          created_at?: string | null
          created_by?: string
          end_date?: string
          id?: string
          organization_id?: string | null
          prompts_scheduled?: string[] | null
          start_date?: string
          updated_at?: string | null
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
      copywriter_techniques: {
        Row: {
          best_use_cases: string[] | null
          blending_notes: string | null
          copywriter_era: string
          copywriter_name: string
          core_philosophy: string
          created_at: string | null
          example_body_copy: string | null
          example_headlines: string[] | null
          id: string
          signature_techniques: Json
          updated_at: string | null
          writing_style_traits: string[] | null
        }
        Insert: {
          best_use_cases?: string[] | null
          blending_notes?: string | null
          copywriter_era: string
          copywriter_name: string
          core_philosophy: string
          created_at?: string | null
          example_body_copy?: string | null
          example_headlines?: string[] | null
          id?: string
          signature_techniques: Json
          updated_at?: string | null
          writing_style_traits?: string[] | null
        }
        Update: {
          best_use_cases?: string[] | null
          blending_notes?: string | null
          copywriter_era?: string
          copywriter_name?: string
          core_philosophy?: string
          created_at?: string | null
          example_body_copy?: string | null
          example_headlines?: string[] | null
          id?: string
          signature_techniques?: Json
          updated_at?: string | null
          writing_style_traits?: string[] | null
        }
        Relationships: []
      }
      copywriting_sequences: {
        Row: {
          content_format: string
          copywriter_name: string
          copywriter_role: string
          created_at: string | null
          framework_code: string | null
          id: string
          industry_type: string
          is_forbidden: boolean | null
          sequence_order: number
          updated_at: string | null
        }
        Insert: {
          content_format: string
          copywriter_name: string
          copywriter_role: string
          created_at?: string | null
          framework_code?: string | null
          id?: string
          industry_type: string
          is_forbidden?: boolean | null
          sequence_order: number
          updated_at?: string | null
        }
        Update: {
          content_format?: string
          copywriter_name?: string
          copywriter_role?: string
          created_at?: string | null
          framework_code?: string | null
          id?: string
          industry_type?: string
          is_forbidden?: boolean | null
          sequence_order?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      copywriting_style_mappings: {
        Row: {
          content_format: string
          created_at: string | null
          example_snippet: string | null
          id: string
          industry_type: string
          key_hooks: string[] | null
          persuasion_framework: string
          primary_copywriter: string
          secondary_copywriter: string | null
          updated_at: string | null
          urgency_level: string
          voice_spectrum: string
        }
        Insert: {
          content_format: string
          created_at?: string | null
          example_snippet?: string | null
          id?: string
          industry_type: string
          key_hooks?: string[] | null
          persuasion_framework: string
          primary_copywriter: string
          secondary_copywriter?: string | null
          updated_at?: string | null
          urgency_level: string
          voice_spectrum: string
        }
        Update: {
          content_format?: string
          created_at?: string | null
          example_snippet?: string | null
          id?: string
          industry_type?: string
          key_hooks?: string[] | null
          persuasion_framework?: string
          primary_copywriter?: string
          secondary_copywriter?: string | null
          updated_at?: string | null
          urgency_level?: string
          voice_spectrum?: string
        }
        Relationships: []
      }
      derivative_assets: {
        Row: {
          approval_status: string | null
          archived_at: string | null
          asset_type: string
          brand_analysis: Json | null
          brand_consistency_score: number | null
          created_at: string | null
          created_by: string | null
          external_urls: Json | null
          generated_content: string | null
          id: string
          is_archived: boolean
          last_brand_check_at: string | null
          master_content_id: string | null
          organization_id: string
          platform_specs: Json | null
          publish_notes: string | null
          published_at: string | null
          published_to: Json | null
          quality_rating: number | null
        }
        Insert: {
          approval_status?: string | null
          archived_at?: string | null
          asset_type: string
          brand_analysis?: Json | null
          brand_consistency_score?: number | null
          created_at?: string | null
          created_by?: string | null
          external_urls?: Json | null
          generated_content?: string | null
          id?: string
          is_archived?: boolean
          last_brand_check_at?: string | null
          master_content_id?: string | null
          organization_id: string
          platform_specs?: Json | null
          publish_notes?: string | null
          published_at?: string | null
          published_to?: Json | null
          quality_rating?: number | null
        }
        Update: {
          approval_status?: string | null
          archived_at?: string | null
          asset_type?: string
          brand_analysis?: Json | null
          brand_consistency_score?: number | null
          created_at?: string | null
          created_by?: string | null
          external_urls?: Json | null
          generated_content?: string | null
          id?: string
          is_archived?: boolean
          last_brand_check_at?: string | null
          master_content_id?: string | null
          organization_id?: string
          platform_specs?: Json | null
          publish_notes?: string | null
          published_at?: string | null
          published_to?: Json | null
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
      generated_images: {
        Row: {
          archived_at: string | null
          aspect_ratio: string
          brand_colors_used: string[] | null
          brand_context_used: Json | null
          brand_style_tags: string[] | null
          chain_depth: number | null
          created_at: string | null
          description: string | null
          final_prompt: string
          goal_type: string
          id: string
          image_order: number | null
          image_url: string
          is_archived: boolean | null
          is_chain_origin: boolean | null
          is_hero_image: boolean | null
          library_category: string | null
          organization_id: string | null
          output_format: string | null
          parent_image_id: string | null
          reference_image_url: string | null
          reference_images: Json | null
          refinement_instruction: string | null
          saved_to_library: boolean | null
          selected_template: string | null
          session_id: string | null
          session_name: string | null
          updated_at: string | null
          user_id: string
          user_refinements: string | null
        }
        Insert: {
          archived_at?: string | null
          aspect_ratio: string
          brand_colors_used?: string[] | null
          brand_context_used?: Json | null
          brand_style_tags?: string[] | null
          chain_depth?: number | null
          created_at?: string | null
          description?: string | null
          final_prompt: string
          goal_type: string
          id?: string
          image_order?: number | null
          image_url: string
          is_archived?: boolean | null
          is_chain_origin?: boolean | null
          is_hero_image?: boolean | null
          library_category?: string | null
          organization_id?: string | null
          output_format?: string | null
          parent_image_id?: string | null
          reference_image_url?: string | null
          reference_images?: Json | null
          refinement_instruction?: string | null
          saved_to_library?: boolean | null
          selected_template?: string | null
          session_id?: string | null
          session_name?: string | null
          updated_at?: string | null
          user_id: string
          user_refinements?: string | null
        }
        Update: {
          archived_at?: string | null
          aspect_ratio?: string
          brand_colors_used?: string[] | null
          brand_context_used?: Json | null
          brand_style_tags?: string[] | null
          chain_depth?: number | null
          created_at?: string | null
          description?: string | null
          final_prompt?: string
          goal_type?: string
          id?: string
          image_order?: number | null
          image_url?: string
          is_archived?: boolean | null
          is_chain_origin?: boolean | null
          is_hero_image?: boolean | null
          library_category?: string | null
          organization_id?: string | null
          output_format?: string | null
          parent_image_id?: string | null
          reference_image_url?: string | null
          reference_images?: Json | null
          refinement_instruction?: string | null
          saved_to_library?: boolean | null
          selected_template?: string | null
          session_id?: string | null
          session_name?: string | null
          updated_at?: string | null
          user_id?: string
          user_refinements?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_images_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_images_parent_image_id_fkey"
            columns: ["parent_image_id"]
            isOneToOne: false
            referencedRelation: "generated_images"
            referencedColumns: ["id"]
          },
        ]
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
          access_token_iv: string | null
          created_at: string | null
          encrypted_access_token: string | null
          encrypted_refresh_token: string | null
          id: string
          refresh_token_iv: string | null
          token_expiry: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token_iv?: string | null
          created_at?: string | null
          encrypted_access_token?: string | null
          encrypted_refresh_token?: string | null
          id?: string
          refresh_token_iv?: string | null
          token_expiry?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token_iv?: string | null
          created_at?: string | null
          encrypted_access_token?: string | null
          encrypted_refresh_token?: string | null
          id?: string
          refresh_token_iv?: string | null
          token_expiry?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      google_calendar_vault_refs: {
        Row: {
          access_token_secret_id: string
          created_at: string | null
          id: string
          refresh_token_secret_id: string
          token_expiry: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token_secret_id: string
          created_at?: string | null
          id?: string
          refresh_token_secret_id: string
          token_expiry?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token_secret_id?: string
          created_at?: string | null
          id?: string
          refresh_token_secret_id?: string
          token_expiry?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      madison_system_config: {
        Row: {
          created_at: string | null
          editorial_philosophy: string | null
          forbidden_phrases: string | null
          id: string
          persona: string | null
          quality_standards: string | null
          updated_at: string | null
          updated_by: string | null
          voice_spectrum: string | null
          writing_influences: string | null
        }
        Insert: {
          created_at?: string | null
          editorial_philosophy?: string | null
          forbidden_phrases?: string | null
          id?: string
          persona?: string | null
          quality_standards?: string | null
          updated_at?: string | null
          updated_by?: string | null
          voice_spectrum?: string | null
          writing_influences?: string | null
        }
        Update: {
          created_at?: string | null
          editorial_philosophy?: string | null
          forbidden_phrases?: string | null
          id?: string
          persona?: string | null
          quality_standards?: string | null
          updated_at?: string | null
          updated_by?: string | null
          voice_spectrum?: string | null
          writing_influences?: string | null
        }
        Relationships: []
      }
      madison_training_documents: {
        Row: {
          created_at: string | null
          extracted_content: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          processing_status: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          extracted_content?: string | null
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          processing_status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          extracted_content?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          processing_status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      marketing_frameworks: {
        Row: {
          created_at: string | null
          description: string
          examples: Json
          framework_category: string
          framework_code: string
          framework_name: string
          id: string
          strengths: string[] | null
          structure_template: Json
          updated_at: string | null
          weaknesses: string[] | null
          when_to_use: string
        }
        Insert: {
          created_at?: string | null
          description: string
          examples: Json
          framework_category: string
          framework_code: string
          framework_name: string
          id?: string
          strengths?: string[] | null
          structure_template: Json
          updated_at?: string | null
          weaknesses?: string[] | null
          when_to_use: string
        }
        Update: {
          created_at?: string | null
          description?: string
          examples?: Json
          framework_category?: string
          framework_code?: string
          framework_name?: string
          id?: string
          strengths?: string[] | null
          structure_template?: Json
          updated_at?: string | null
          weaknesses?: string[] | null
          when_to_use?: string
        }
        Relationships: []
      }
      marketplace_listings: {
        Row: {
          archived_at: string | null
          created_at: string | null
          created_by: string | null
          external_id: string | null
          external_url: string | null
          id: string
          is_archived: boolean | null
          last_pushed_at: string | null
          last_synced_at: string | null
          organization_id: string
          platform: string
          platform_data: Json
          product_id: string | null
          push_error: string | null
          push_status: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          created_by?: string | null
          external_id?: string | null
          external_url?: string | null
          id?: string
          is_archived?: boolean | null
          last_pushed_at?: string | null
          last_synced_at?: string | null
          organization_id: string
          platform: string
          platform_data?: Json
          product_id?: string | null
          push_error?: string | null
          push_status?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          created_by?: string | null
          external_id?: string | null
          external_url?: string | null
          id?: string
          is_archived?: boolean | null
          last_pushed_at?: string | null
          last_synced_at?: string | null
          organization_id?: string
          platform?: string
          platform_data?: Json
          product_id?: string | null
          push_error?: string | null
          push_status?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "brand_products"
            referencedColumns: ["id"]
          },
        ]
      }
      master_content: {
        Row: {
          archived_at: string | null
          brand_analysis: Json | null
          brand_consistency_score: number | null
          collection: string | null
          content_type: string
          created_at: string | null
          created_by: string | null
          external_urls: Json | null
          full_content: string
          id: string
          is_archived: boolean
          last_brand_check_at: string | null
          organization_id: string
          publish_notes: string | null
          published_at: string | null
          published_to: Json | null
          quality_rating: number | null
          status: string | null
          title: string
          updated_at: string | null
          word_count: number | null
        }
        Insert: {
          archived_at?: string | null
          brand_analysis?: Json | null
          brand_consistency_score?: number | null
          collection?: string | null
          content_type: string
          created_at?: string | null
          created_by?: string | null
          external_urls?: Json | null
          full_content: string
          id?: string
          is_archived?: boolean
          last_brand_check_at?: string | null
          organization_id: string
          publish_notes?: string | null
          published_at?: string | null
          published_to?: Json | null
          quality_rating?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
          word_count?: number | null
        }
        Update: {
          archived_at?: string | null
          brand_analysis?: Json | null
          brand_consistency_score?: number | null
          collection?: string | null
          content_type?: string
          created_at?: string | null
          created_by?: string | null
          external_urls?: Json | null
          full_content?: string
          id?: string
          is_archived?: boolean
          last_brand_check_at?: string | null
          organization_id?: string
          publish_notes?: string | null
          published_at?: string | null
          published_to?: Json | null
          quality_rating?: number | null
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
          business_model: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          id: string
          industry_type: string | null
          is_deleted: boolean
          name: string
          settings: Json | null
          slug: string | null
          target_audience_type: string | null
          updated_at: string | null
        }
        Insert: {
          brand_config?: Json | null
          business_model?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          industry_type?: string | null
          is_deleted?: boolean
          name: string
          settings?: Json | null
          slug?: string | null
          target_audience_type?: string | null
          updated_at?: string | null
        }
        Update: {
          brand_config?: Json | null
          business_model?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          industry_type?: string | null
          is_deleted?: boolean
          name?: string
          settings?: Json | null
          slug?: string | null
          target_audience_type?: string | null
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
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      prompts: {
        Row: {
          additional_context: Json | null
          archived_at: string | null
          audience: string | null
          auto_generated_name: string | null
          avg_quality_rating: number | null
          base_notes: string | null
          category: string | null
          collection: string
          content_id: string | null
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string | null
          created_by: string | null
          custom_instructions: string | null
          deliverable_format: string | null
          edit_percentage: number | null
          effectiveness_score: number | null
          goal: string | null
          id: string
          is_archived: boolean
          is_auto_saved: boolean | null
          is_favorited: boolean | null
          is_template: boolean | null
          last_used_at: string | null
          meta_instructions: Json | null
          middle_notes: string | null
          on_brand_score: number | null
          organization_id: string
          parent_prompt_id: string | null
          product_id: string | null
          prompt_text: string
          scent_family: Database["public"]["Enums"]["scent_family"] | null
          style_overlay: string | null
          tags: string[] | null
          times_used: number | null
          title: string
          top_notes: string | null
          transparency_statement: string | null
          updated_at: string | null
          user_custom_name: string | null
          version: number | null
          was_multiplied: boolean | null
          was_scheduled: boolean | null
        }
        Insert: {
          additional_context?: Json | null
          archived_at?: string | null
          audience?: string | null
          auto_generated_name?: string | null
          avg_quality_rating?: number | null
          base_notes?: string | null
          category?: string | null
          collection: string
          content_id?: string | null
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          created_by?: string | null
          custom_instructions?: string | null
          deliverable_format?: string | null
          edit_percentage?: number | null
          effectiveness_score?: number | null
          goal?: string | null
          id?: string
          is_archived?: boolean
          is_auto_saved?: boolean | null
          is_favorited?: boolean | null
          is_template?: boolean | null
          last_used_at?: string | null
          meta_instructions?: Json | null
          middle_notes?: string | null
          on_brand_score?: number | null
          organization_id: string
          parent_prompt_id?: string | null
          product_id?: string | null
          prompt_text: string
          scent_family?: Database["public"]["Enums"]["scent_family"] | null
          style_overlay?: string | null
          tags?: string[] | null
          times_used?: number | null
          title: string
          top_notes?: string | null
          transparency_statement?: string | null
          updated_at?: string | null
          user_custom_name?: string | null
          version?: number | null
          was_multiplied?: boolean | null
          was_scheduled?: boolean | null
        }
        Update: {
          additional_context?: Json | null
          archived_at?: string | null
          audience?: string | null
          auto_generated_name?: string | null
          avg_quality_rating?: number | null
          base_notes?: string | null
          category?: string | null
          collection?: string
          content_id?: string | null
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          created_by?: string | null
          custom_instructions?: string | null
          deliverable_format?: string | null
          edit_percentage?: number | null
          effectiveness_score?: number | null
          goal?: string | null
          id?: string
          is_archived?: boolean
          is_auto_saved?: boolean | null
          is_favorited?: boolean | null
          is_template?: boolean | null
          last_used_at?: string | null
          meta_instructions?: Json | null
          middle_notes?: string | null
          on_brand_score?: number | null
          organization_id?: string
          parent_prompt_id?: string | null
          product_id?: string | null
          prompt_text?: string
          scent_family?: Database["public"]["Enums"]["scent_family"] | null
          style_overlay?: string | null
          tags?: string[] | null
          times_used?: number | null
          title?: string
          top_notes?: string | null
          transparency_statement?: string | null
          updated_at?: string | null
          user_custom_name?: string | null
          version?: number | null
          was_multiplied?: boolean | null
          was_scheduled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "prompts_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "master_content"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "prompts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "brand_products"
            referencedColumns: ["id"]
          },
        ]
      }
      repurposing_rules: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          organization_id: string | null
          platform_constraints: Json | null
          source_type: string
          target_type: string
          transformation_prompt: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          platform_constraints?: Json | null
          source_type: string
          target_type: string
          transformation_prompt: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          platform_constraints?: Json | null
          source_type?: string
          target_type?: string
          transformation_prompt?: string
        }
        Relationships: [
          {
            foreignKeyName: "repurposing_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_content: {
        Row: {
          content_id: string | null
          content_type: string
          created_at: string | null
          derivative_id: string | null
          google_event_id: string | null
          id: string
          notes: string | null
          organization_id: string | null
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
          google_event_id?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
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
          google_event_id?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
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
      shopify_connections: {
        Row: {
          access_token_encrypted: string
          created_at: string | null
          id: string
          last_synced_at: string | null
          organization_id: string
          shop_domain: string
          sync_status: string | null
          updated_at: string | null
        }
        Insert: {
          access_token_encrypted: string
          created_at?: string | null
          id?: string
          last_synced_at?: string | null
          organization_id: string
          shop_domain: string
          sync_status?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token_encrypted?: string
          created_at?: string | null
          id?: string
          last_synced_at?: string | null
          organization_id?: string
          shop_domain?: string
          sync_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopify_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      shopify_publish_log: {
        Row: {
          id: string
          organization_id: string
          product_id: string | null
          published_at: string | null
          published_by: string | null
          published_content: Json
          shopify_product_id: string
        }
        Insert: {
          id?: string
          organization_id: string
          product_id?: string | null
          published_at?: string | null
          published_by?: string | null
          published_content?: Json
          shopify_product_id: string
        }
        Update: {
          id?: string
          organization_id?: string
          product_id?: string | null
          published_at?: string | null
          published_by?: string | null
          published_content?: Json
          shopify_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopify_publish_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopify_publish_log_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "brand_products"
            referencedColumns: ["id"]
          },
        ]
      }
      shot_types: {
        Row: {
          created_at: string | null
          id: string
          label: string
          organization_id: string | null
          prompt: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          label: string
          organization_id?: string | null
          prompt: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          label?: string
          organization_id?: string | null
          prompt?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shot_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      super_admins: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          organization_id: string
          role: Database["public"]["Enums"]["organization_role"]
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["organization_role"]
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["organization_role"]
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      video_completions: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: []
      }
      worksheet_uploads: {
        Row: {
          confidence_scores: Json | null
          created_at: string | null
          error_message: string | null
          extracted_data: Json | null
          file_name: string
          file_size: number
          file_url: string
          id: string
          organization_id: string
          processing_status: string | null
          updated_at: string | null
          uploaded_by: string
          used_at: string | null
        }
        Insert: {
          confidence_scores?: Json | null
          created_at?: string | null
          error_message?: string | null
          extracted_data?: Json | null
          file_name: string
          file_size: number
          file_url: string
          id?: string
          organization_id: string
          processing_status?: string | null
          updated_at?: string | null
          uploaded_by: string
          used_at?: string | null
        }
        Update: {
          confidence_scores?: Json | null
          created_at?: string | null
          error_message?: string | null
          extracted_data?: Json | null
          file_name?: string
          file_size?: number
          file_url?: string
          id?: string
          organization_id?: string
          processing_status?: string | null
          updated_at?: string | null
          uploaded_by?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "worksheet_uploads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_unsaved_image_sessions: { Args: never; Returns: number }
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
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      content_type: "product" | "email" | "social" | "visual" | "blog"
      formulation_type_enum: "Purity" | "Composed" | "Natural Resins & Incense"
      organization_role: "owner" | "admin" | "member"
      scent_family: "warm" | "floral" | "fresh" | "woody"
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
      content_type: ["product", "email", "social", "visual", "blog"],
      formulation_type_enum: ["Purity", "Composed", "Natural Resins & Incense"],
      organization_role: ["owner", "admin", "member"],
      scent_family: ["warm", "floral", "fresh", "woody"],
    },
  },
} as const
