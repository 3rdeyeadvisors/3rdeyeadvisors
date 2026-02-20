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
      bot_config: {
        Row: {
          created_at: string
          id: string
          max_point_percentage: number
          personality_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_point_percentage: number
          personality_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          max_point_percentage?: number
          personality_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      broadcast_alerts: {
        Row: {
          alert_sent: boolean | null
          alert_sent_at: string | null
          alert_type: string
          created_at: string
          error_message: string | null
          failed_payload: Json | null
          id: string
          missing_fields: string[] | null
          resolved: boolean | null
          resolved_at: string | null
          retry_count: number | null
          severity: string
          timestamp: string
        }
        Insert: {
          alert_sent?: boolean | null
          alert_sent_at?: string | null
          alert_type: string
          created_at?: string
          error_message?: string | null
          failed_payload?: Json | null
          id?: string
          missing_fields?: string[] | null
          resolved?: boolean | null
          resolved_at?: string | null
          retry_count?: number | null
          severity?: string
          timestamp?: string
        }
        Update: {
          alert_sent?: boolean | null
          alert_sent_at?: string | null
          alert_type?: string
          created_at?: string
          error_message?: string | null
          failed_payload?: Json | null
          id?: string
          missing_fields?: string[] | null
          resolved?: boolean | null
          resolved_at?: string | null
          retry_count?: number | null
          severity?: string
          timestamp?: string
        }
        Relationships: []
      }
      broadcast_email_queue: {
        Row: {
          created_at: string
          cta_link: string
          day_type: string
          id: string
          intro_text: string
          market_block: string
          scheduled_for: string
          sent_at: string | null
          subject_line: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_link?: string
          day_type: string
          id?: string
          intro_text: string
          market_block: string
          scheduled_for: string
          sent_at?: string | null
          subject_line: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_link?: string
          day_type?: string
          id?: string
          intro_text?: string
          market_block?: string
          scheduled_for?: string
          sent_at?: string | null
          subject_line?: string
          updated_at?: string
        }
        Relationships: []
      }
      broadcast_weekly_summary: {
        Row: {
          created_at: string
          failures_count: number | null
          id: string
          success_rate: number | null
          summary_sent: boolean | null
          summary_sent_at: string | null
          total_broadcasts_scheduled: number | null
          total_broadcasts_sent: number | null
          total_emails_sent: number | null
          total_subscribers: number | null
          week_end: string
          week_start: string
        }
        Insert: {
          created_at?: string
          failures_count?: number | null
          id?: string
          success_rate?: number | null
          summary_sent?: boolean | null
          summary_sent_at?: string | null
          total_broadcasts_scheduled?: number | null
          total_broadcasts_sent?: number | null
          total_emails_sent?: number | null
          total_subscribers?: number | null
          week_end: string
          week_start: string
        }
        Update: {
          created_at?: string
          failures_count?: number | null
          id?: string
          success_rate?: number | null
          summary_sent?: boolean | null
          summary_sent_at?: string | null
          total_broadcasts_scheduled?: number | null
          total_broadcasts_sent?: number | null
          total_emails_sent?: number | null
          total_subscribers?: number | null
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          content_id: string
          content_type: string
          created_at: string
          id: string
          is_helpful: boolean
          likes_count: number
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          is_helpful?: boolean
          likes_count?: number
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          is_helpful?: boolean
          likes_count?: number
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          admin_notes: string | null
          commission_amount_cents: number
          created_at: string
          id: string
          paid_at: string | null
          plan_type: string
          referred_user_id: string
          referrer_id: string
          status: string
          subscription_amount_cents: number
          subscription_id: string
        }
        Insert: {
          admin_notes?: string | null
          commission_amount_cents: number
          created_at?: string
          id?: string
          paid_at?: string | null
          plan_type: string
          referred_user_id: string
          referrer_id: string
          status?: string
          subscription_amount_cents: number
          subscription_id: string
        }
        Update: {
          admin_notes?: string | null
          commission_amount_cents?: number
          created_at?: string
          id?: string
          paid_at?: string | null
          plan_type?: string
          referred_user_id?: string
          referrer_id?: string
          status?: string
          subscription_amount_cents?: number
          subscription_id?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          email: string
          id: string
          ip_address: string | null
          name: string
          subject: string
          submitted_at: string
        }
        Insert: {
          email: string
          id?: string
          ip_address?: string | null
          name: string
          subject: string
          submitted_at?: string
        }
        Update: {
          email?: string
          id?: string
          ip_address?: string | null
          name?: string
          subject?: string
          submitted_at?: string
        }
        Relationships: []
      }
      course_progress: {
        Row: {
          completed_modules: number[] | null
          completion_percentage: number | null
          course_id: number
          created_at: string | null
          id: string
          last_accessed: string | null
          started_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_modules?: number[] | null
          completion_percentage?: number | null
          course_id: number
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          started_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_modules?: number[] | null
          completion_percentage?: number | null
          course_id?: number
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          started_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          category: string
          created_at: string
          description: string | null
          early_access_date: string | null
          id: number
          is_active: boolean
          price_cents: number | null
          public_release_date: string | null
          stripe_price_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          early_access_date?: string | null
          id?: number
          is_active?: boolean
          price_cents?: number | null
          public_release_date?: string | null
          stripe_price_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          early_access_date?: string | null
          id?: number
          is_active?: boolean
          price_cents?: number | null
          public_release_date?: string | null
          stripe_price_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_logins: {
        Row: {
          created_at: string
          id: string
          login_date: string
          points_awarded: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          login_date: string
          points_awarded?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          login_date?: string
          points_awarded?: boolean
          user_id?: string
        }
        Relationships: []
      }
      digital_downloads: {
        Row: {
          created_at: string
          download_count: number
          download_token: string
          expires_at: string
          file_ids: Json
          id: string
          max_downloads: number
          order_id: string
          product_id: number
          product_name: string
          product_type: string
          updated_at: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          download_count?: number
          download_token: string
          expires_at: string
          file_ids: Json
          id?: string
          max_downloads?: number
          order_id: string
          product_id: number
          product_name: string
          product_type: string
          updated_at?: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          download_count?: number
          download_token?: string
          expires_at?: string
          file_ids?: Json
          id?: string
          max_downloads?: number
          order_id?: string
          product_id?: number
          product_name?: string
          product_type?: string
          updated_at?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      digital_product_files: {
        Row: {
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          product_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          product_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          product_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          applies_to: string
          code: string
          created_at: string | null
          current_uses: number | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_purchase_amount: number | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applies_to: string
          code: string
          created_at?: string | null
          current_uses?: number | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_purchase_amount?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applies_to?: string
          code?: string
          created_at?: string | null
          current_uses?: number | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_purchase_amount?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      discount_usage: {
        Row: {
          created_at: string | null
          discount_amount: number
          discount_id: string
          id: string
          order_amount: number
          stripe_session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          discount_amount: number
          discount_id: string
          id?: string
          order_amount: number
          stripe_session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          discount_amount?: number
          discount_id?: string
          id?: string
          order_amount?: number
          stripe_session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discount_usage_discount_id_fkey"
            columns: ["discount_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_replies: {
        Row: {
          content: string
          created_at: string
          discussion_id: string
          id: string
          is_solution: boolean
          likes_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          discussion_id: string
          id?: string
          is_solution?: boolean
          likes_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          discussion_id?: string
          id?: string
          is_solution?: boolean
          likes_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_replies_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
        ]
      }
      discussions: {
        Row: {
          content_id: string | null
          content_type: string
          created_at: string
          description: string
          id: string
          is_solved: boolean
          replies_count: number
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          views_count: number
        }
        Insert: {
          content_id?: string | null
          content_type: string
          created_at?: string
          description: string
          id?: string
          is_solved?: boolean
          replies_count?: number
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          views_count?: number
        }
        Update: {
          content_id?: string | null
          content_type?: string
          created_at?: string
          description?: string
          id?: string
          is_solved?: boolean
          replies_count?: number
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          views_count?: number
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string
          edge_function_name: string
          email_type: string
          error_message: string | null
          id: string
          metadata: Json | null
          recipient_email: string
          related_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          edge_function_name: string
          email_type: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email: string
          related_id?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          edge_function_name?: string
          email_type?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email?: string
          related_id?: string | null
          status?: string
        }
        Relationships: []
      }
      feature_suggestions: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string
          id: string
          reviewed_at: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description: string
          id?: string
          reviewed_at?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string
          id?: string
          reviewed_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      founding33_purchases: {
        Row: {
          amount_paid: number
          created_at: string
          customer_email: string
          customer_name: string | null
          id: string
          purchased_at: string | null
          seat_number: number | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid?: number
          created_at?: string
          customer_email: string
          customer_name?: string | null
          id?: string
          purchased_at?: string | null
          seat_number?: number | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          customer_email?: string
          customer_name?: string | null
          id?: string
          purchased_at?: string | null
          seat_number?: number | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      grandfathered_emails: {
        Row: {
          access_type: string | null
          claimed_at: string | null
          claimed_by: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
        }
        Insert: {
          access_type?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
        }
        Update: {
          access_type?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
        }
        Relationships: []
      }
      monthly_rewards: {
        Row: {
          claimed: boolean
          claimed_at: string | null
          created_at: string
          id: string
          month_year: string
          rank: number
          reward_details: Json | null
          reward_type: string
          user_id: string
        }
        Insert: {
          claimed?: boolean
          claimed_at?: string | null
          created_at?: string
          id?: string
          month_year: string
          rank: number
          reward_details?: Json | null
          reward_type: string
          user_id: string
        }
        Update: {
          claimed?: boolean
          claimed_at?: string | null
          created_at?: string
          id?: string
          month_year?: string
          rank?: number
          reward_details?: Json | null
          reward_type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_action_logs: {
        Row: {
          action_type: string
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          order_id: string
          status: string
        }
        Insert: {
          action_type: string
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          order_id: string
          status: string
        }
        Update: {
          action_type?: string
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string
          status?: string
        }
        Relationships: []
      }
      premium_content_announcements: {
        Row: {
          announcement_sent_at: string | null
          content_id: string
          content_type: string
          created_at: string | null
          description: string | null
          early_access_date: string | null
          id: string
          public_release_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          announcement_sent_at?: string | null
          content_id: string
          content_type: string
          created_at?: string | null
          description?: string | null
          early_access_date?: string | null
          id?: string
          public_release_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          announcement_sent_at?: string | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          description?: string | null
          early_access_date?: string | null
          id?: string
          public_release_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      printify_orders: {
        Row: {
          address_to: Json
          amount_paid: number | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          delivered_at: string | null
          external_id: string
          id: string
          line_items: Json
          printify_order_id: string
          shipped_at: string | null
          shipping_method: number | null
          status: string
          total_price: number | null
          total_shipping: number | null
          total_tax: number | null
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address_to: Json
          amount_paid?: number | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          delivered_at?: string | null
          external_id: string
          id?: string
          line_items: Json
          printify_order_id: string
          shipped_at?: string | null
          shipping_method?: number | null
          status: string
          total_price?: number | null
          total_shipping?: number | null
          total_tax?: number | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address_to?: Json
          amount_paid?: number | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          delivered_at?: string | null
          external_id?: string
          id?: string
          line_items?: Json
          printify_order_id?: string
          shipped_at?: string | null
          shipping_method?: number | null
          status?: string
          total_price?: number | null
          total_shipping?: number | null
          total_tax?: number | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      printify_products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          images: Json | null
          is_active: boolean | null
          printify_id: string
          shop_id: string
          stripe_prices: Json | null
          stripe_product_id: string | null
          tags: string[] | null
          title: string
          updated_at: string
          variants: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          printify_id: string
          shop_id: string
          stripe_prices?: Json | null
          stripe_product_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          variants?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          printify_id?: string
          shop_id?: string
          stripe_prices?: Json | null
          stripe_product_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          variants?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          is_bot: boolean
          payout_crypto_network: string | null
          payout_details: string | null
          payout_method: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_bot?: boolean
          payout_crypto_network?: string | null
          payout_details?: string | null
          payout_method?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_bot?: boolean
          payout_crypto_network?: string | null
          payout_details?: string | null
          payout_method?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json
          completed_at: string | null
          created_at: string
          id: string
          passed: boolean
          quiz_id: string
          score: number
          started_at: string
          time_taken: number | null
          user_id: string
        }
        Insert: {
          answers: Json
          completed_at?: string | null
          created_at?: string
          id?: string
          passed?: boolean
          quiz_id: string
          score: number
          started_at?: string
          time_taken?: number | null
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          created_at?: string
          id?: string
          passed?: boolean
          quiz_id?: string
          score?: number
          started_at?: string
          time_taken?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes_public"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          course_id: number
          created_at: string
          description: string | null
          id: string
          max_attempts: number | null
          module_id: string
          passing_score: number | null
          questions: Json
          time_limit: number | null
          title: string
          updated_at: string
        }
        Insert: {
          course_id: number
          created_at?: string
          description?: string | null
          id?: string
          max_attempts?: number | null
          module_id: string
          passing_score?: number | null
          questions: Json
          time_limit?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: number
          created_at?: string
          description?: string | null
          id?: string
          max_attempts?: number | null
          module_id?: string
          passing_score?: number | null
          questions?: Json
          time_limit?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      raffle_entries: {
        Row: {
          created_at: string
          entry_count: number
          id: string
          raffle_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_count?: number
          id?: string
          raffle_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry_count?: number
          id?: string
          raffle_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "raffle_entries_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
        ]
      }
      raffle_tasks: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          instagram_username: string | null
          raffle_id: string
          task_type: string
          user_id: string
          verification_status: string | null
          verified_at: string | null
          x_username: string | null
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          instagram_username?: string | null
          raffle_id: string
          task_type: string
          user_id: string
          verification_status?: string | null
          verified_at?: string | null
          x_username?: string | null
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          instagram_username?: string | null
          raffle_id?: string
          task_type?: string
          user_id?: string
          verification_status?: string | null
          verified_at?: string | null
          x_username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raffle_tasks_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
        ]
      }
      raffle_tickets: {
        Row: {
          created_at: string
          earned_at: string
          id: string
          metadata: Json | null
          raffle_id: string
          task_id: string | null
          ticket_source: string
          user_id: string
        }
        Insert: {
          created_at?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          raffle_id: string
          task_id?: string | null
          ticket_source: string
          user_id: string
        }
        Update: {
          created_at?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          raffle_id?: string
          task_id?: string | null
          ticket_source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "raffle_tickets_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_tickets_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "raffle_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      raffles: {
        Row: {
          created_at: string
          description: string
          end_date: string
          id: string
          is_active: boolean
          prize: string
          prize_amount: number
          start_date: string
          title: string
          updated_at: string
          winner_selected_at: string | null
          winner_user_id: string | null
        }
        Insert: {
          created_at?: string
          description: string
          end_date: string
          id?: string
          is_active?: boolean
          prize: string
          prize_amount: number
          start_date: string
          title: string
          updated_at?: string
          winner_selected_at?: string | null
          winner_user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          end_date?: string
          id?: string
          is_active?: boolean
          prize?: string
          prize_amount?: number
          start_date?: string
          title?: string
          updated_at?: string
          winner_selected_at?: string | null
          winner_user_id?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action_type: string
          created_at: string
          id: string
          identifier: string
          request_count: number
          window_end: string
          window_start: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          identifier: string
          request_count?: number
          window_end: string
          window_start?: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          identifier?: string
          request_count?: number
          window_end?: string
          window_start?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          id: string
          rating: number
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          rating: number
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_terms_acceptance: {
        Row: {
          accepted_at: string
          created_at: string
          id: string
          ip_address: string | null
          terms_version: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          terms_version?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          terms_version?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          bonus_awarded: boolean
          created_at: string
          id: string
          raffle_id: string | null
          referred_user_id: string
          referrer_id: string
        }
        Insert: {
          bonus_awarded?: boolean
          created_at?: string
          id?: string
          raffle_id?: string | null
          referred_user_id: string
          referrer_id: string
        }
        Update: {
          bonus_awarded?: boolean
          created_at?: string
          id?: string
          raffle_id?: string | null
          referred_user_id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmap_items: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          status: string | null
          title: string
          updated_at: string | null
          voting_ends_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string | null
          title: string
          updated_at?: string | null
          voting_ends_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          voting_ends_at?: string | null
        }
        Relationships: []
      }
      roadmap_reminder_sent: {
        Row: {
          id: string
          reminder_type: string
          roadmap_item_id: string
          sent_at: string | null
        }
        Insert: {
          id?: string
          reminder_type: string
          roadmap_item_id: string
          sent_at?: string | null
        }
        Update: {
          id?: string
          reminder_type?: string
          roadmap_item_id?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_reminder_sent_roadmap_item_id_fkey"
            columns: ["roadmap_item_id"]
            isOneToOne: false
            referencedRelation: "roadmap_items"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmap_votes: {
        Row: {
          created_at: string | null
          id: string
          roadmap_item_id: string
          user_id: string
          vote_type: string
          vote_weight: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          roadmap_item_id: string
          user_id: string
          vote_type?: string
          vote_weight?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          roadmap_item_id?: string
          user_id?: string
          vote_type?: string
          vote_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_votes_roadmap_item_id_fkey"
            columns: ["roadmap_item_id"]
            isOneToOne: false
            referencedRelation: "roadmap_items"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_description: string
          badge_name: string
          badge_type: string
          earned_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          badge_description: string
          badge_name: string
          badge_type: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          badge_description?: string
          badge_name?: string
          badge_type?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_points: {
        Row: {
          action_id: string | null
          action_type: string
          created_at: string
          id: string
          metadata: Json | null
          month_year: string
          points: number
          user_id: string
        }
        Insert: {
          action_id?: string | null
          action_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          month_year: string
          points: number
          user_id: string
        }
        Update: {
          action_id?: string | null
          action_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          month_year?: string
          points?: number
          user_id?: string
        }
        Relationships: []
      }
      user_points_monthly: {
        Row: {
          id: string
          month_year: string
          rank: number | null
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          month_year: string
          rank?: number | null
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          month_year?: string
          rank?: number | null
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          last_seen: string | null
          metadata: Json | null
          progress_percentage: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          last_seen?: string | null
          metadata?: Json | null
          progress_percentage?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          last_seen?: string | null
          metadata?: Json | null
          progress_percentage?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_purchases: {
        Row: {
          amount_paid: number | null
          created_at: string
          id: string
          product_id: number
          purchase_date: string
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string
          id?: string
          product_id: number
          purchase_date?: string
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          created_at?: string
          id?: string
          product_id?: number
          purchase_date?: string
          stripe_session_id?: string | null
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
          role: Database["public"]["Enums"]["app_role"]
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
      user_trials: {
        Row: {
          converted_at: string | null
          created_at: string
          id: string
          trial_end: string
          trial_start: string
          user_id: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          id?: string
          trial_end?: string
          trial_start?: string
          user_id: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          id?: string
          trial_end?: string
          trial_start?: string
          user_id?: string
        }
        Relationships: []
      }
      vault_waitlist: {
        Row: {
          created_at: string | null
          email: string
          id: string
          vault_name: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          vault_name: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          vault_name?: string
        }
        Relationships: []
      }
      vault_whitelist: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_verified: string | null
          nft_balance: number | null
          nft_token_id: number | null
          updated_at: string | null
          user_id: string | null
          verified_at: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_verified?: string | null
          nft_balance?: number | null
          nft_token_id?: number | null
          updated_at?: string | null
          user_id?: string | null
          verified_at?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_verified?: string | null
          nft_balance?: number | null
          nft_token_id?: number | null
          updated_at?: string | null
          user_id?: string | null
          verified_at?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      wallet_addresses: {
        Row: {
          chain_id: number | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          linked_at: string | null
          updated_at: string | null
          user_id: string
          wallet_address: string
        }
        Insert: {
          chain_id?: number | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          linked_at?: string | null
          updated_at?: string | null
          user_id: string
          wallet_address: string
        }
        Update: {
          chain_id?: number | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          linked_at?: string | null
          updated_at?: string | null
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      printify_products_public: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          images: Json | null
          is_active: boolean | null
          printify_id: string | null
          shop_id: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          variants: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          images?: Json | null
          is_active?: boolean | null
          printify_id?: string | null
          shop_id?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          variants?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          images?: Json | null
          is_active?: boolean | null
          printify_id?: string | null
          shop_id?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          variants?: Json | null
        }
        Relationships: []
      }
      profiles_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          is_bot: boolean | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          is_bot?: boolean | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          is_bot?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      quizzes_public: {
        Row: {
          course_id: number | null
          created_at: string | null
          description: string | null
          id: string | null
          max_attempts: number | null
          module_id: string | null
          passing_score: number | null
          questions: Json | null
          time_limit: number | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          course_id?: number | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          max_attempts?: number | null
          module_id?: string | null
          passing_score?: number | null
          questions?: never
          time_limit?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          course_id?: number | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          max_attempts?: number | null
          module_id?: string | null
          passing_score?: number | null
          questions?: never
          time_limit?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      roadmap_vote_counts: {
        Row: {
          no_votes: number | null
          roadmap_item_id: string | null
          yes_votes: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      auto_cleanup_rate_limits: { Args: never; Returns: undefined }
      award_user_points: {
        Args: {
          _action_id?: string
          _action_type: string
          _metadata?: Json
          _points: number
          _user_id: string
        }
        Returns: {
          message: string
          points_awarded: number
          success: boolean
        }[]
      }
      check_daily_login: {
        Args: { _user_id: string }
        Returns: {
          already_logged_in: boolean
          points_awarded: number
        }[]
      }
      check_rate_limit: {
        Args: {
          _action_type: string
          _identifier: string
          _max_requests?: number
          _window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_old_email_logs: { Args: never; Returns: undefined }
      cleanup_old_presence: { Args: never; Returns: undefined }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      cleanup_old_security_logs: { Args: never; Returns: undefined }
      create_profile_for_user: {
        Args: { _display_name: string; _user_id: string }
        Returns: undefined
      }
      get_average_rating: { Args: never; Returns: number }
      get_founding33_spots_remaining: { Args: never; Returns: number }
      get_next_founding33_seat: { Args: never; Returns: number }
      get_points_leaderboard: {
        Args: { _limit?: number }
        Returns: {
          avatar_url: string
          display_name: string
          rank: number
          total_points: number
          user_id: string
        }[]
      }
      get_profiles_batch: {
        Args: { user_ids: string[] }
        Returns: {
          avatar_url: string
          display_name: string
          user_id: string
        }[]
      }
      get_roadmap_vote_counts: {
        Args: never
        Returns: {
          no_votes: number
          roadmap_item_id: string
          yes_votes: number
        }[]
      }
      get_total_courses_count: { Args: never; Returns: number }
      get_total_users_count: { Args: never; Returns: number }
      get_user_emails_with_profiles: {
        Args: never
        Returns: {
          created_at: string
          display_name: string
          email: string
          user_id: string
        }[]
      }
      get_user_points_rank: {
        Args: { _user_id: string }
        Returns: {
          rank: number
          total_points: number
          total_users: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          _details?: Json
          _event_type: string
          _ip_address?: string
          _user_agent?: string
          _user_id?: string
        }
        Returns: undefined
      }
      user_has_founding33_access: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      user_has_purchased_course: {
        Args: { course_id: number }
        Returns: boolean
      }
      user_has_purchased_product: {
        Args: { product_id: number }
        Returns: boolean
      }
      validate_discount_code: {
        Args: { _amount: number; _code: string; _product_type: string }
        Returns: {
          discount_amount: number
          discount_id: string
          is_valid: boolean
          message: string
        }[]
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
