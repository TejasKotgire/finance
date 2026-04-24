export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string;
          amount: number;
          date: string;
          category_id: string | null;
          category_name: string;
          payment_method: 'UPI' | 'Cash' | 'Card' | 'Bank Transfer' | 'EMI';
          note: string | null;
          is_setup_cost: boolean;
          is_wealth_building: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          is_setup_cost?: boolean;
          is_wealth_building?: boolean;
          date?: string;
          category_id?: string | null;
          note?: string | null;
        };
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          icon: string;
          color: string;
          is_wealth_building: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['categories']['Row']> & { name: string };
        Update: Partial<Database['public']['Tables']['categories']['Row']>;
      };
      remittances: {
        Row: {
          id: string;
          amount: number;
          date: string;
          recipient: string;
          note: string | null;
          payment_method: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['remittances']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
          date?: string;
          recipient?: string;
          note?: string | null;
        };
        Update: Partial<Database['public']['Tables']['remittances']['Insert']>;
      };
      budgets: {
        Row: {
          id: string;
          month: string;
          monthly_income: number;
          wants_budget: number;
          needs_budget: number;
          savings_target: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['budgets']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['budgets']['Insert']>;
      };
    };
    Views: Record<string, never>;
  };
}

export type Transaction  = Database['public']['Tables']['transactions']['Row'];
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
export type Category     = Database['public']['Tables']['categories']['Row'];
export type Remittance   = Database['public']['Tables']['remittances']['Row'];
export type Budget       = Database['public']['Tables']['budgets']['Row'];

export type PaymentMethod = 'UPI' | 'Cash' | 'Card' | 'Bank Transfer' | 'EMI';
