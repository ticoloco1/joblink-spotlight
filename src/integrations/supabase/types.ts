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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_emails: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      ads: {
        Row: {
          advertiser_user_id: string
          banner_url: string | null
          clicks: number
          created_at: string
          end_date: string | null
          format: string
          id: string
          impressions: number
          placement: string
          pricing_type: string
          start_date: string | null
          status: string
          stripe_subscription_id: string | null
          target_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          advertiser_user_id: string
          banner_url?: string | null
          clicks?: number
          created_at?: string
          end_date?: string | null
          format?: string
          id?: string
          impressions?: number
          placement?: string
          pricing_type?: string
          start_date?: string | null
          status?: string
          stripe_subscription_id?: string | null
          target_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          advertiser_user_id?: string
          banner_url?: string | null
          clicks?: number
          created_at?: string
          end_date?: string | null
          format?: string
          id?: string
          impressions?: number
          placement?: string
          pricing_type?: string
          start_date?: string | null
          status?: string
          stripe_subscription_id?: string | null
          target_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      blockchain_payments: {
        Row: {
          amount_raw: string
          amount_usd: number
          created_at: string
          credits_added: number
          from_address: string
          id: string
          network: string
          profile_id: string | null
          status: string
          to_address: string
          token: string
          tx_hash: string
          user_id: string | null
        }
        Insert: {
          amount_raw: string
          amount_usd: number
          created_at?: string
          credits_added?: number
          from_address: string
          id?: string
          network?: string
          profile_id?: string | null
          status?: string
          to_address: string
          token?: string
          tx_hash: string
          user_id?: string | null
        }
        Update: {
          amount_raw?: string
          amount_usd?: number
          created_at?: string
          credits_added?: number
          from_address?: string
          id?: string
          network?: string
          profile_id?: string | null
          status?: string
          to_address?: string
          token?: string
          tx_hash?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blockchain_payments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      boosts: {
        Row: {
          amount: number
          booster_user_id: string
          created_at: string
          id: string
          platform_share: number
          profile_id: string
          profile_share: number
          stripe_payment_id: string | null
        }
        Insert: {
          amount?: number
          booster_user_id: string
          created_at?: string
          id?: string
          platform_share?: number
          profile_id: string
          profile_share?: number
          stripe_payment_id?: string | null
        }
        Update: {
          amount?: number
          booster_user_id?: string
          created_at?: string
          id?: string
          platform_share?: number
          profile_id?: string
          profile_share?: number
          stripe_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boosts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcasts: {
        Row: {
          created_at: string
          id: string
          message: string
          sent_by: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sent_by: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sent_by?: string
          title?: string
        }
        Relationships: []
      }
      contact_unlocks: {
        Row: {
          amount: number
          company_user_id: string
          created_at: string
          id: string
          platform_share: number
          profile_id: string
          profile_share: number
          stripe_payment_id: string | null
        }
        Insert: {
          amount: number
          company_user_id: string
          created_at?: string
          id?: string
          platform_share: number
          profile_id: string
          profile_share: number
          stripe_payment_id?: string | null
        }
        Update: {
          amount?: number
          company_user_id?: string
          created_at?: string
          id?: string
          platform_share?: number
          profile_id?: string
          profile_share?: number
          stripe_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_unlocks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          related_profile_id: string | null
          stripe_payment_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          related_profile_id?: string | null
          stripe_payment_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          related_profile_id?: string | null
          stripe_payment_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_related_profile_id_fkey"
            columns: ["related_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          company_user_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          job_type: string | null
          location: string | null
          salary_range: string | null
          skills: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          company_user_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          job_type?: string | null
          location?: string | null
          salary_range?: string | null
          skills?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          company_user_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          job_type?: string | null
          location?: string | null
          salary_range?: string | null
          skills?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      slugs: {
        Row: {
          id: string
          slug: string
          owner_id: string | null
          views: number
          clicks: number
          score: number | null
          suggested_price: number | null
          trend_score: number | null
          tag: string | null
          auto_renew: boolean
          expires_at: string | null
          renewal_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          owner_id?: string | null
          views?: number
          clicks?: number
          score?: number | null
          suggested_price?: number | null
          trend_score?: number | null
          tag?: string | null
          auto_renew?: boolean
          expires_at?: string | null
          renewal_price?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          owner_id?: string | null
          views?: number
          clicks?: number
          score?: number | null
          suggested_price?: number | null
          trend_score?: number | null
          tag?: string | null
          auto_renew?: boolean
          expires_at?: string | null
          renewal_price?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          category: string
          id: string
          key: string
          label: string | null
          updated_at: string
          value: string
        }
        Insert: {
          category?: string
          id?: string
          key: string
          label?: string | null
          updated_at?: string
          value: string
        }
        Update: {
          category?: string
          id?: string
          key?: string
          label?: string | null
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string
          created_at: string
          expires_at: string
          id: string
          image_url: string | null
          image_urls: string[] | null
          is_pinned: boolean
          pinned_until: string | null
          profile_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          expires_at?: string
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          is_pinned?: boolean
          pinned_until?: string | null
          profile_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          expires_at?: string
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          is_pinned?: boolean
          pinned_until?: string | null
          profile_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_slugs: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_reserved: boolean
          price_cents: number
          slug: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_reserved?: boolean
          price_cents?: number
          slug: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_reserved?: boolean
          price_cents?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile_actions: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          id: string
          new_status: string | null
          previous_status: string | null
          profile_id: string
          reason: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          id?: string
          new_status?: string | null
          previous_status?: string | null
          profile_id: string
          reason?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          id?: string
          new_status?: string | null
          previous_status?: string | null
          profile_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_actions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_frame: string | null
          banner_url: string | null
          bio: string | null
          boost_score: number
          contact_email: string | null
          contact_linkedin: string | null
          contact_phone: string | null
          created_at: string
          credits: number
          education: Json | null
          experience: Json | null
          has_video_feature: boolean | null
          homepage_until: string | null
          id: string
          is_published: boolean | null
          links: Json | null
          location: string | null
          name: string
          photo_url: string | null
          paywall_enabled: boolean
          paywall_interval: string
          paywall_mode: string
          paywall_price_cents: number
          site_customization: Json | null
          skills: string[] | null
          slug: string
          status: string
          title: string | null
          updated_at: string
          user_id: string
          user_type: string
          video_url: string | null
          wallet_address: string | null
          minisite_paid_until: string | null
          minisite_plan: string
        }
        Insert: {
          avatar_frame?: string | null
          banner_url?: string | null
          bio?: string | null
          boost_score?: number
          contact_email?: string | null
          contact_linkedin?: string | null
          contact_phone?: string | null
          created_at?: string
          credits?: number
          education?: Json | null
          experience?: Json | null
          has_video_feature?: boolean | null
          homepage_until?: string | null
          id?: string
          is_published?: boolean | null
          links?: Json | null
          location?: string | null
          name: string
          photo_url?: string | null
          paywall_enabled?: boolean
          paywall_interval?: string
          paywall_mode?: string
          paywall_price_cents?: number
          site_customization?: Json | null
          skills?: string[] | null
          slug: string
          status?: string
          title?: string | null
          updated_at?: string
          user_id: string
          user_type?: string
          video_url?: string | null
          wallet_address?: string | null
          minisite_paid_until?: string | null
          minisite_plan?: string
        }
        Update: {
          avatar_frame?: string | null
          banner_url?: string | null
          bio?: string | null
          boost_score?: number
          contact_email?: string | null
          contact_linkedin?: string | null
          contact_phone?: string | null
          created_at?: string
          credits?: number
          education?: Json | null
          experience?: Json | null
          has_video_feature?: boolean | null
          homepage_until?: string | null
          id?: string
          is_published?: boolean | null
          links?: Json | null
          location?: string | null
          name?: string
          photo_url?: string | null
          paywall_enabled?: boolean
          paywall_interval?: string
          paywall_mode?: string
          paywall_price_cents?: number
          site_customization?: Json | null
          skills?: string[] | null
          slug?: string
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string
          video_url?: string | null
          wallet_address?: string | null
          minisite_paid_until?: string | null
          minisite_plan?: string
        }
        Relationships: []
      }

      profile_paywall_access: {
        Row: {
          id: string
          profile_id: string
          subscriber_id: string
          interval: string
          amount_cents: number
          status: string
          expires_at: string
          stripe_checkout_session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          subscriber_id: string
          interval: string
          amount_cents: number
          status?: string
          expires_at: string
          stripe_checkout_session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          subscriber_id?: string
          interval?: string
          amount_cents?: number
          status?: string
          expires_at?: string
          stripe_checkout_session_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_paywall_access_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      purchased_slugs: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          price_cents: number
          profile_id: string
          slug: string
          stripe_payment_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          price_cents?: number
          profile_id: string
          slug: string
          stripe_payment_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          price_cents?: number
          profile_id?: string
          slug?: string
          stripe_payment_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchased_slugs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      video_unlocks: {
        Row: {
          amount: number
          buyer_user_id: string
          created_at: string
          id: string
          platform_share: number
          profile_id: string
          profile_share: number
        }
        Insert: {
          amount: number
          buyer_user_id: string
          created_at?: string
          id?: string
          platform_share: number
          profile_id: string
          profile_share: number
        }
        Update: {
          amount?: number
          buyer_user_id?: string
          created_at?: string
          id?: string
          platform_share?: number
          profile_id?: string
          profile_share?: number
        }
        Relationships: [
          {
            foreignKeyName: "video_unlocks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_change_profile_status: {
        Args: {
          _action: string
          _admin_user_id: string
          _new_status: string
          _profile_id: string
          _reason?: string
        }
        Returns: Json
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      pay_minisite_with_credits: { Args: { _plan: string }; Returns: Json }
      unlock_contact_with_credits: { Args: { p_profile_id: string }; Returns: Json }
      process_video_unlock: {
        Args: { _buyer_user_id: string; _price?: number; _profile_id: string }
        Returns: Json
      }
      enforce_minisite_paid_until: { Args: Record<string, never>; Returns: number }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
