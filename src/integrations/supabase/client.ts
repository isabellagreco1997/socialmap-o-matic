// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qlyrnrzhgybxvwxriobu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFseXJucnpoZ3lieHZ3eHJpb2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MzAzOTYsImV4cCI6MjA1NjAwNjM5Nn0.shGRGom-iEaF5_gU4oXIwnG0wpTEGPRIbZ2qjYB3C_Y";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);