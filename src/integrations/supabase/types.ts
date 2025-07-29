export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accompaniments: {
        Row: {
          category: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          display_order: number | null
          id: string
          is_available: boolean | null
          name: string
          price: number
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_available?: boolean | null
          name: string
          price?: number
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_available?: boolean | null
          name?: string
          price?: number
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accompaniments_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_groups: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_groups_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_accompaniments: {
        Row: {
          accompaniment_id: string
          created_at: string | null
          id: string
          is_default: boolean | null
          menu_item_id: string
        }
        Insert: {
          accompaniment_id: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          menu_item_id: string
        }
        Update: {
          accompaniment_id?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          menu_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_accompaniments_accompaniment_id_fkey"
            columns: ["accompaniment_id"]
            isOneToOne: false
            referencedRelation: "accompaniments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_accompaniments_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_variations: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_available: boolean | null
          menu_item_id: string
          name: string
          price_adjustment: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_available?: boolean | null
          menu_item_id: string
          name: string
          price_adjustment?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_available?: boolean | null
          menu_item_id?: string
          name?: string
          price_adjustment?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_variations_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          allergens: string[] | null
          category_id: string | null
          created_at: string | null
          currency: string | null
          deleted_at: string | null
          description: string | null
          display_order: number | null
          group_id: string | null
          id: string
          image_url: string | null
          is_accompaniment: boolean
          is_available: boolean | null
          name: string
          price: number
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          allergens?: string[] | null
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          deleted_at?: string | null
          description?: string | null
          display_order?: number | null
          group_id?: string | null
          id?: string
          image_url?: string | null
          is_accompaniment?: boolean
          is_available?: boolean | null
          name: string
          price: number
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          allergens?: string[] | null
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          deleted_at?: string | null
          description?: string | null
          display_order?: number | null
          group_id?: string | null
          id?: string
          image_url?: string | null
          is_accompaniment?: boolean
          is_available?: boolean | null
          name?: string
          price?: number
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "menu_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          display_order: number | null
          features: Json | null
          id: string
          is_active: boolean
          max_menu_items: number | null
          max_tables: number | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean
          max_menu_items?: number | null
          max_tables?: number | null
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean
          max_menu_items?: number | null
          max_tables?: number | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          resource: string
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          resource: string
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          resource?: string
        }
        Relationships: []
      }
      qr_scans: {
        Row: {
          id: string
          ip_address: string | null
          restaurant_id: string
          scan_timestamp: string | null
          table_id: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          ip_address?: string | null
          restaurant_id: string
          scan_timestamp?: string | null
          table_id?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          ip_address?: string | null
          restaurant_id?: string
          scan_timestamp?: string | null
          table_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_scans_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_scans_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_tables: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          is_active: boolean | null
          qr_code_data: string
          qr_code_url: string | null
          restaurant_id: string
          table_name: string | null
          table_number: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean | null
          qr_code_data: string
          qr_code_url?: string | null
          restaurant_id: string
          table_name?: string | null
          table_number: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean | null
          qr_code_data?: string
          qr_code_url?: string | null
          restaurant_id?: string
          table_name?: string | null
          table_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          brand_primary_color: string | null
          brand_secondary_color: string | null
          created_at: string | null
          currency: string | null
          display_order: number | null
          email: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          menu_background_color: string | null
          menu_background_image: string | null
          menu_background_type: string | null
          monthly_fee: number | null
          name: string
          package_id: string | null
          password_hash: string
          phone: string | null
          plan: string | null
          slug: string | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          updated_at: string | null
          user_id: string | null
          whatsapp_number: string
        }
        Insert: {
          address?: string | null
          brand_primary_color?: string | null
          brand_secondary_color?: string | null
          created_at?: string | null
          currency?: string | null
          display_order?: number | null
          email: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          menu_background_color?: string | null
          menu_background_image?: string | null
          menu_background_type?: string | null
          monthly_fee?: number | null
          name: string
          package_id?: string | null
          password_hash: string
          phone?: string | null
          plan?: string | null
          slug?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_number: string
        }
        Update: {
          address?: string | null
          brand_primary_color?: string | null
          brand_secondary_color?: string | null
          created_at?: string | null
          currency?: string | null
          display_order?: number | null
          email?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          menu_background_color?: string | null
          menu_background_image?: string | null
          menu_background_type?: string | null
          monthly_fee?: number | null
          name?: string
          package_id?: string | null
          password_hash?: string
          phone?: string | null
          plan?: string | null
          slug?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string | null
          role_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id?: string | null
          role_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string | null
          role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          hierarchy_level: number | null
          id: string
          is_active: boolean | null
          is_system_role: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          hierarchy_level?: number | null
          id?: string
          is_active?: boolean | null
          is_system_role?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          hierarchy_level?: number | null
          id?: string
          is_active?: boolean | null
          is_system_role?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_orders: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          currency: string | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_method_id: string | null
          payment_reference: string | null
          plan_type: string
          rejection_reason: string | null
          restaurant_email: string
          restaurant_id: string
          restaurant_name: string
          restaurant_phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_method_id?: string | null
          payment_reference?: string | null
          plan_type?: string
          rejection_reason?: string | null
          restaurant_email: string
          restaurant_id: string
          restaurant_name: string
          restaurant_phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_method_id?: string | null
          payment_reference?: string | null
          plan_type?: string
          rejection_reason?: string | null
          restaurant_email?: string
          restaurant_id?: string
          restaurant_name?: string
          restaurant_phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_orders_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          payment_reference: string | null
          period_end: string
          period_start: string
          restaurant_id: string
          status: Database["public"]["Enums"]["payment_status"] | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          notes?: string | null
          payment_date: string
          payment_method?: string | null
          payment_reference?: string | null
          period_end: string
          period_start: string
          restaurant_id: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          payment_reference?: string | null
          period_end?: string
          period_start?: string
          restaurant_id?: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_payments_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_activity_at: string | null
          last_login_at: string | null
          last_name: string | null
          metadata: Json | null
          phone: string | null
          status: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_activity_at?: string | null
          last_login_at?: string | null
          last_name?: string | null
          metadata?: Json | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_activity_at?: string | null
          last_login_at?: string | null
          last_name?: string | null
          metadata?: Json | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          role_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          role_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          role_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_subscription_access: {
        Args: { _restaurant_id: string }
        Returns: boolean
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_qr_code_data: {
        Args: { rest_id: string; table_id: string }
        Returns: string
      }
      get_image_url: {
        Args: { bucket_name: string; file_path: string }
        Returns: string
      }
      has_system_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["system_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      promote_user_to_admin: {
        Args: { target_user_id: string; admin_role?: string }
        Returns: boolean
      }
      setup_first_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      user_has_permission: {
        Args: { user_uuid: string; permission_name: string }
        Returns: boolean
      }
      user_has_role: {
        Args: { user_uuid: string; role_name: string }
        Returns: boolean
      }
      user_has_role_permission: {
        Args: {
          _user_id: string
          _role: string
          _resource: string
          _action: string
        }
        Returns: boolean
      }
    }
    Enums: {
      admin_role: "super_admin" | "admin"
      payment_status: "pending" | "verified" | "rejected"
      subscription_status: "pending" | "active" | "expired" | "cancelled"
      system_role: "super_admin" | "admin" | "user"
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
      admin_role: ["super_admin", "admin"],
      payment_status: ["pending", "verified", "rejected"],
      subscription_status: ["pending", "active", "expired", "cancelled"],
      system_role: ["super_admin", "admin", "user"],
    },
  },
} as const
