import { createClient } from '@supabase/supabase-js';
import type { Database, Transaction, Category, Remittance } from './database.types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(url, key, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// ── Transactions ──────────────────────────────────────────

export async function getTransactions(opts: {
  month?: string;
  category?: string;
  search?: string;
  limit?: number;
} = {}): Promise<Transaction[]> {
  let q = supabase.from('transactions').select('*').order('date', { ascending: false }).order('created_at', { ascending: false });

  if (opts.month) {
    const [y, m] = opts.month.split('-').map(Number);
    const start = `${opts.month}-01`;
    const end   = new Date(y, m, 1).toISOString().split('T')[0];
    q = q.gte('date', start).lt('date', end);
  }
  if (opts.category) q = q.eq('category_name', opts.category);
  if (opts.search)   q = q.or(`note.ilike.%${opts.search}%,category_name.ilike.%${opts.search}%`);
  if (opts.limit)    q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function addTransaction(tx: {
  amount: number;
  date?: string;
  category_name: string;
  payment_method: string;
  note?: string;
  is_setup_cost?: boolean;
  is_wealth_building?: boolean;
}): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert([tx] as any)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}

export async function searchTransactions(query: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .or(`note.ilike.%${query}%,category_name.ilike.%${query}%`)
    .order('date', { ascending: false })
    .limit(25);
  if (error) throw error;
  return data ?? [];
}

// ── Monthly metrics ───────────────────────────────────────

export interface MonthMetrics {
  totalSpent: number;
  trueBurn: number;
  wealthBuilding: number;
  setupCosts: number;
  familySupport: number;
  investments: number;
  dailyBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
}

export async function getMonthlyMetrics(month: string): Promise<MonthMetrics> {
  const [y, m] = month.split('-').map(Number);
  const start = `${month}-01`;
  const end   = new Date(y, m, 1).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('transactions')
    .select('amount,is_setup_cost,is_wealth_building,category_name,date')
    .gte('date', start)
    .lt('date', end);

  if (error) throw error;

  const metrics: MonthMetrics = {
    totalSpent: 0, trueBurn: 0, wealthBuilding: 0,
    setupCosts: 0, familySupport: 0, investments: 0,
    dailyBreakdown: {}, categoryBreakdown: {},
  };

  for (const t of data ?? []) {
    const amt = Number(t.amount);
    metrics.totalSpent += amt;
    if (!t.is_setup_cost)    metrics.trueBurn      += amt;
    if (t.is_wealth_building) metrics.wealthBuilding += amt;
    if (t.is_setup_cost)     metrics.setupCosts    += amt;
    if (t.category_name === 'Family Support')    metrics.familySupport += amt;
    if (t.category_name === 'SIP/Investments')   metrics.investments   += amt;
    metrics.dailyBreakdown[t.date] = (metrics.dailyBreakdown[t.date] ?? 0) + amt;
    metrics.categoryBreakdown[t.category_name] = (metrics.categoryBreakdown[t.category_name] ?? 0) + amt;
  }
  return metrics;
}

// ── Categories ────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

// ── Remittances ───────────────────────────────────────────

export async function getRemittances(): Promise<Remittance[]> {
  const { data, error } = await supabase
    .from('remittances')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addRemittance(r: {
  amount: number;
  date?: string;
  recipient?: string;
  note?: string;
  payment_method: string;
}): Promise<Remittance> {
  const { data, error } = await supabase
    .from('remittances')
    .insert([r])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Budgets ───────────────────────────────────────────────

export async function getBudget(month: string) {
  const { data } = await supabase
    .from('budgets')
    .select('*')
    .eq('month', month)
    .single();
  return data;
}

export async function upsertBudget(b: {
  month: string;
  monthly_income: number;
  wants_budget: number;
  needs_budget: number;
  savings_target: number;
}) {
  const { data, error } = await supabase.from('budgets').upsert(b).select().single();
  if (error) throw error;
  return data;
}
