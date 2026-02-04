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
      affiliate_conversions: {
        Row: {
          affiliate_link_id: string
          buyer_id: string | null
          commission_amount: number
          created_at: string
          id: string
          order_amount: number
          order_id: string
          status: string
        }
        Insert: {
          affiliate_link_id: string
          buyer_id?: string | null
          commission_amount: number
          created_at?: string
          id?: string
          order_amount: number
          order_id: string
          status?: string
        }
        Update: {
          affiliate_link_id?: string
          buyer_id?: string | null
          commission_amount?: number
          created_at?: string
          id?: string
          order_amount?: number
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_conversions_affiliate_link_id_fkey"
            columns: ["affiliate_link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_links: {
        Row: {
          clicks: number
          commission_rate: number
          conversions: number
          created_at: string
          creator_id: string
          earnings: number
          id: string
          is_active: boolean
          link_code: string
          product_id: string
          product_image: string | null
          product_title: string
          updated_at: string
        }
        Insert: {
          clicks?: number
          commission_rate?: number
          conversions?: number
          created_at?: string
          creator_id: string
          earnings?: number
          id?: string
          is_active?: boolean
          link_code: string
          product_id: string
          product_image?: string | null
          product_title: string
          updated_at?: string
        }
        Update: {
          clicks?: number
          commission_rate?: number
          conversions?: number
          created_at?: string
          creator_id?: string
          earnings?: number
          id?: string
          is_active?: boolean
          link_code?: string
          product_id?: string
          product_image?: string | null
          product_title?: string
          updated_at?: string
        }
        Relationships: []
      }
      coin_packages: {
        Row: {
          bonus_coins: number
          coins: number
          created_at: string
          currency: string
          id: string
          is_active: boolean
          is_popular: boolean
          name: string
          price_cents: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          bonus_coins?: number
          coins: number
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          is_popular?: boolean
          name: string
          price_cents: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          bonus_coins?: number
          coins?: number
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          is_popular?: boolean
          name?: string
          price_cents?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      creator_earnings: {
        Row: {
          coins_value: number
          created_at: string
          creator_id: string
          diamonds_earned: number
          gift_icon: string
          gift_name: string
          id: string
          live_session_id: string | null
          pk_battle_id: string | null
          sender_id: string
        }
        Insert: {
          coins_value: number
          created_at?: string
          creator_id: string
          diamonds_earned: number
          gift_icon: string
          gift_name: string
          id?: string
          live_session_id?: string | null
          pk_battle_id?: string | null
          sender_id: string
        }
        Update: {
          coins_value?: number
          created_at?: string
          creator_id?: string
          diamonds_earned?: number
          gift_icon?: string
          gift_name?: string
          id?: string
          live_session_id?: string | null
          pk_battle_id?: string | null
          sender_id?: string
        }
        Relationships: []
      }
      creator_shops: {
        Row: {
          commission_rate: number
          created_at: string
          creator_id: string
          id: string
          is_verified: boolean
          shop_banner_url: string | null
          shop_description: string | null
          shop_name: string | null
          total_revenue: number
          total_sales: number
          updated_at: string
        }
        Insert: {
          commission_rate?: number
          created_at?: string
          creator_id: string
          id?: string
          is_verified?: boolean
          shop_banner_url?: string | null
          shop_description?: string | null
          shop_name?: string | null
          total_revenue?: number
          total_sales?: number
          updated_at?: string
        }
        Update: {
          commission_rate?: number
          created_at?: string
          creator_id?: string
          id?: string
          is_verified?: boolean
          shop_banner_url?: string | null
          shop_description?: string | null
          shop_name?: string | null
          total_revenue?: number
          total_sales?: number
          updated_at?: string
        }
        Relationships: []
      }
      followers: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      gift_history: {
        Row: {
          coins_spent: number
          combo_count: number
          created_at: string
          diamonds_earned: number
          gift_icon: string
          gift_name: string
          id: string
          live_session_id: string | null
          pk_battle_id: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          coins_spent: number
          combo_count?: number
          created_at?: string
          diamonds_earned: number
          gift_icon: string
          gift_name: string
          id?: string
          live_session_id?: string | null
          pk_battle_id?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          coins_spent?: number
          combo_count?: number
          created_at?: string
          diamonds_earned?: number
          gift_icon?: string
          gift_name?: string
          id?: string
          live_session_id?: string | null
          pk_battle_id?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      live_shopping_pins: {
        Row: {
          created_at: string
          discount_percent: number | null
          display_order: number
          flash_sale_ends_at: string | null
          id: string
          is_active: boolean
          is_flash_sale: boolean
          live_session_id: string
          product_id: string
          product_image: string | null
          product_price: number
          product_title: string
        }
        Insert: {
          created_at?: string
          discount_percent?: number | null
          display_order?: number
          flash_sale_ends_at?: string | null
          id?: string
          is_active?: boolean
          is_flash_sale?: boolean
          live_session_id: string
          product_id: string
          product_image?: string | null
          product_price: number
          product_title: string
        }
        Update: {
          created_at?: string
          discount_percent?: number | null
          display_order?: number
          flash_sale_ends_at?: string | null
          id?: string
          is_active?: boolean
          is_flash_sale?: boolean
          live_session_id?: string
          product_id?: string
          product_image?: string | null
          product_price?: number
          product_title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          coins_balance: number | null
          cover_url: string | null
          created_at: string
          diamonds_balance: number | null
          display_name: string | null
          followers_count: number | null
          following_count: number | null
          id: string
          is_online: boolean | null
          is_verified: boolean | null
          last_seen_at: string | null
          level: Database["public"]["Enums"]["user_level"] | null
          likes_count: number | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          coins_balance?: number | null
          cover_url?: string | null
          created_at?: string
          diamonds_balance?: number | null
          display_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          is_online?: boolean | null
          is_verified?: boolean | null
          last_seen_at?: string | null
          level?: Database["public"]["Enums"]["user_level"] | null
          likes_count?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          coins_balance?: number | null
          cover_url?: string | null
          created_at?: string
          diamonds_balance?: number | null
          display_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          is_online?: boolean | null
          is_verified?: boolean | null
          last_seen_at?: string | null
          level?: Database["public"]["Enums"]["user_level"] | null
          likes_count?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          coins: number
          created_at: string
          description: string | null
          diamonds: number
          id: string
          metadata: Json | null
          reference_id: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          coins?: number
          created_at?: string
          description?: string | null
          diamonds?: number
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          coins?: number
          created_at?: string
          description?: string | null
          diamonds?: number
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          diamonds_amount: number
          id: string
          payment_details: Json
          payment_method: string
          processed_at: string | null
          status: Database["public"]["Enums"]["withdrawal_status"]
          updated_at: string
          usd_amount: number
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          diamonds_amount: number
          id?: string
          payment_details?: Json
          payment_method: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          updated_at?: string
          usd_amount: number
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          diamonds_amount?: number
          id?: string
          payment_details?: Json
          payment_method?: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          updated_at?: string
          usd_amount?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "creator" | "vip"
      transaction_status: "pending" | "completed" | "failed" | "cancelled"
      transaction_type:
        | "purchase"
        | "gift_sent"
        | "gift_received"
        | "withdrawal"
        | "refund"
        | "bonus"
        | "conversion"
      user_level: "bronze" | "silver" | "gold" | "platinum" | "diamond"
      withdrawal_status: "pending" | "processing" | "completed" | "rejected"
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
      app_role: ["admin", "moderator", "user", "creator", "vip"],
      transaction_status: ["pending", "completed", "failed", "cancelled"],
      transaction_type: [
        "purchase",
        "gift_sent",
        "gift_received",
        "withdrawal",
        "refund",
        "bonus",
        "conversion",
      ],
      user_level: ["bronze", "silver", "gold", "platinum", "diamond"],
      withdrawal_status: ["pending", "processing", "completed", "rejected"],
    },
  },
} as const
