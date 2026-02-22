import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://0ec90b57d6e95fcbda19832f.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'present' : 'missing',
    key: supabaseAnonKey ? 'present' : 'missing'
  });
  throw new Error('Missing Supabase environment variables');
}

console.log('Supabase client initialized successfully');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface VIPTier {
  id: string;
  name: string;
  level: number;
  price_monthly: number;
  commission_rate: number;
  max_tasks_per_day: number;
  max_annotations_per_month: number;
  max_projects: number;
  max_team_members: number;
  requires_support_contact: boolean;
  features: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  vip_tier_id: string;
  subscription_status: string;
  subscription_ends_at: string | null;
  annotations_this_month: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  project_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Dataset {
  id: string;
  project_id: string;
  data_type: string;
  data_url: string;
  status: string;
  created_at: string;
}

export interface Annotation {
  id: string;
  dataset_id: string;
  user_id: string;
  annotation_data: Record<string, any>;
  confidence_score: number;
  created_at: string;
  updated_at: string;
}
