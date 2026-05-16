export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type BaseRow = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

type InsertBase = {
  id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
};

type UpdateBase = Partial<InsertBase>;

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: BaseRow & {
          account_name: string;
          threads_user_id: string | null;
          handle: string | null;
          follower_count: number | null;
          status: string;
          memo: string | null;
        };
        Insert: InsertBase & {
          account_name: string;
          threads_user_id?: string | null;
          handle?: string | null;
          follower_count?: number | null;
          status?: string;
          memo?: string | null;
        };
        Update: UpdateBase & Partial<Database["public"]["Tables"]["accounts"]["Insert"]>;
      };
      api_credentials: {
        Row: BaseRow & {
          account_id: string | null;
          provider: string;
          credential_type: string;
          env_key_name: string | null;
          status: string;
          expires_at: string | null;
          last_checked_at: string | null;
          memo: string | null;
        };
        Insert: InsertBase & {
          account_id?: string | null;
          provider: string;
          credential_type: string;
          env_key_name?: string | null;
          status?: string;
          expires_at?: string | null;
          last_checked_at?: string | null;
          memo?: string | null;
        };
        Update: UpdateBase & Partial<Database["public"]["Tables"]["api_credentials"]["Insert"]>;
      };
      keywords: {
        Row: BaseRow & {
          account_id: string | null;
          keyword: string;
          category: string | null;
          priority: number;
          is_active: boolean;
          source: string;
        };
        Insert: InsertBase & {
          account_id?: string | null;
          keyword: string;
          category?: string | null;
          priority?: number;
          is_active?: boolean;
          source?: string;
        };
        Update: UpdateBase & Partial<Database["public"]["Tables"]["keywords"]["Insert"]>;
      };
      keyword_packs: {
        Row: BaseRow & {
          account_id: string | null;
          pack_name: string;
          pack_type: string;
          keywords: Json;
          is_enabled: boolean;
          memo: string | null;
        };
        Insert: InsertBase & {
          account_id?: string | null;
          pack_name: string;
          pack_type: string;
          keywords?: Json;
          is_enabled?: boolean;
          memo?: string | null;
        };
        Update: UpdateBase & Partial<Database["public"]["Tables"]["keyword_packs"]["Insert"]>;
      };
      genres: {
        Row: BaseRow & {
          name: string;
          parent_genre: string | null;
          related_keywords: Json;
          is_active: boolean;
        };
        Insert: InsertBase & {
          name: string;
          parent_genre?: string | null;
          related_keywords?: Json;
          is_active?: boolean;
        };
        Update: UpdateBase & Partial<Database["public"]["Tables"]["genres"]["Insert"]>;
      };
      buzz_posts: {
        Row: BaseRow & {
          account_id: string | null;
          source: string;
          data_source?: string;
          threads_post_id: string | null;
          keyword?: string | null;
          post_url: string | null;
          author_handle: string | null;
          body: string;
          genre: string | null;
          detected_genre?: string | null;
          pattern_name: string | null;
          pattern_type?: string | null;
          post_type: string | null;
          hook_text: string | null;
          visual_motifs: Json;
          like_count: number;
          reply_count: number;
          repost_count: number;
          quote_count: number;
          view_count: number;
          buzz_score: number;
          recency_bonus: number;
          data_confidence: number;
          data_confidence_level?: string;
          missing_fields?: Json;
          media_type?: string;
          elapsed_hours?: number;
          engagement_total?: number;
          ai_summary?: string | null;
          ai_reason?: string | null;
          memo?: string | null;
          collected_date?: string;
          posted_at: string | null;
          collected_at: string;
        };
        Insert: InsertBase & {
          account_id?: string | null;
          source?: string;
          data_source?: string;
          threads_post_id?: string | null;
          keyword?: string | null;
          post_url?: string | null;
          author_handle?: string | null;
          body: string;
          genre?: string | null;
          detected_genre?: string | null;
          pattern_name?: string | null;
          pattern_type?: string | null;
          post_type?: string | null;
          hook_text?: string | null;
          visual_motifs?: Json;
          like_count?: number;
          reply_count?: number;
          repost_count?: number;
          quote_count?: number;
          view_count?: number;
          buzz_score?: number;
          recency_bonus?: number;
          data_confidence?: number;
          data_confidence_level?: string;
          missing_fields?: Json;
          media_type?: string;
          elapsed_hours?: number;
          engagement_total?: number;
          ai_summary?: string | null;
          ai_reason?: string | null;
          memo?: string | null;
          collected_date?: string;
          posted_at?: string | null;
          collected_at?: string;
        };
        Update: UpdateBase & Partial<Database["public"]["Tables"]["buzz_posts"]["Insert"]>;
      };
      post_ideas: {
        Row: BaseRow & {
          account_id: string | null;
          brand_id: string | null;
          title: string;
          body: string;
          genre: string | null;
          post_type: string | null;
          hook_text: string | null;
          cta_text: string | null;
          pattern_type: string | null;
          hook: string | null;
          cta: string | null;
          full_text: string | null;
          source_buzz_ids: Json;
          referenced_trend: Json;
          human_score: number | null;
          template_risk_score: number | null;
          template_risk: string | null;
          competitor_similarity_score: number | null;
          freshness_score: number | null;
          cta_risk_score: number | null;
          brand_match_score: number | null;
          ai_score: number | null;
          ai_reason: string | null;
          human_reason: string | null;
          template_risk_reason: string | null;
          daily_material_used: string | null;
          freshness_reason: string | null;
          competitor_similarity_reason: string | null;
          publish_decision: string | null;
          publish_decision_reason: string | null;
          checklist_status: Json;
          image_prompt_id: string | null;
          decision: string;
          improvement_suggestions: string | null;
          status: string;
          human_memo: string | null;
        };
        Insert: InsertBase & {
          account_id?: string | null;
          brand_id?: string | null;
          title: string;
          body: string;
          genre?: string | null;
          post_type?: string | null;
          hook_text?: string | null;
          cta_text?: string | null;
          pattern_type?: string | null;
          hook?: string | null;
          cta?: string | null;
          full_text?: string | null;
          source_buzz_ids?: Json;
          referenced_trend?: Json;
          human_score?: number | null;
          template_risk_score?: number | null;
          template_risk?: string | null;
          competitor_similarity_score?: number | null;
          freshness_score?: number | null;
          cta_risk_score?: number | null;
          brand_match_score?: number | null;
          ai_score?: number | null;
          ai_reason?: string | null;
          human_reason?: string | null;
          template_risk_reason?: string | null;
          daily_material_used?: string | null;
          freshness_reason?: string | null;
          competitor_similarity_reason?: string | null;
          publish_decision?: string | null;
          publish_decision_reason?: string | null;
          checklist_status?: Json;
          image_prompt_id?: string | null;
          decision?: string;
          improvement_suggestions?: string | null;
          status?: string;
          human_memo?: string | null;
        };
        Update: UpdateBase & Partial<Database["public"]["Tables"]["post_ideas"]["Insert"]>;
      };
      post_reservations: {
        Row: BaseRow & {
          account_id: string | null;
          idea_id: string | null;
          post_format: string | null;
          body: string | null;
          media_urls: Json;
          scheduled_at: string;
          post_type: string;
          text: string | null;
          image_url: string | null;
          video_url: string | null;
          thread_group_id: string | null;
          thread_order: number | null;
          status: string;
          approved_by_user: boolean;
          approved_by_human: boolean;
          approved_at: string | null;
          posted_at: string | null;
          threads_post_id: string | null;
          error_message: string | null;
          retry_count: number;
          last_attempted_at: string | null;
          last_error_type: string | null;
          precheck_result: Json;
        };
        Insert: InsertBase & {
          account_id?: string | null;
          idea_id?: string | null;
          post_format?: string | null;
          body?: string | null;
          media_urls?: Json;
          scheduled_at: string;
          post_type?: string;
          text?: string | null;
          image_url?: string | null;
          video_url?: string | null;
          thread_group_id?: string | null;
          thread_order?: number | null;
          status?: string;
          approved_by_user?: boolean;
          approved_by_human?: boolean;
          approved_at?: string | null;
          posted_at?: string | null;
          threads_post_id?: string | null;
          error_message?: string | null;
          retry_count?: number;
          last_attempted_at?: string | null;
          last_error_type?: string | null;
          precheck_result?: Json;
        };
        Update: UpdateBase & Partial<Database["public"]["Tables"]["post_reservations"]["Insert"]>;
      };
      post_logs: GenericTable;
      insights: GenericTable;
      pattern_db: GenericTable;
      hook_db: GenericTable;
      image_motifs: GenericTable;
      image_prompts: GenericTable;
      image_results: GenericTable;
      post_type_db: GenericTable;
      daily_materials: GenericTable;
      template_risk_logs: GenericTable;
      brand_personas: GenericTable;
      fortune_calendar: GenericTable;
      cta_db: GenericTable;
      experiments: GenericTable;
      manual_imports: GenericTable;
      account_phases: GenericTable;
      safety_checks: GenericTable;
      error_logs: GenericTable;
      reports: GenericTable;
      settings: GenericTable;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type GenericTable = {
  Row: BaseRow & Record<string, Json | string | number | boolean | null>;
  Insert: InsertBase & Record<string, Json | string | number | boolean | null | undefined>;
  Update: UpdateBase & Record<string, Json | string | number | boolean | null | undefined>;
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type Inserts<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type Updates<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];
