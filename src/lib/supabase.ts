import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anon);

export type DbUser = {
  id: number;
  name: string;
  courses: string[];
  schedule: string;
  study_style: 'Visual' | 'Auditory' | 'Kinesthetic' | 'Reader' | null;
  bio: string;
  phone: string;
  email: string;
  instagram: string;
  created_at: string;
};

export type DbAvailability = {
  id: number;
  user_id: number;
  start_at: string;
  end_at: string;
  note: string;
  created_at: string;
};

export type DbSession = {
  id: number;
  from_user_id: number;
  to_user_id: number;
  start_at: string;
  end_at: string;
  note: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
};
