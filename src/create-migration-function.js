// This script creates a stored procedure to apply the migration
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qlyrnrzhgybxvwxriobu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFseXJucnpoZ3lieHZ3eHJpb2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MzAzOTYsImV4cCI6MjA1NjAwNjM5Nn0.shGRGom-iEaF5_gU4oXIwnG0wpTEGPRIbZ2qjYB3C_Y";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function createMigrationFunction() {
  try {
    // Create a stored procedure to apply the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION public.apply_migration()
        RETURNS json
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
          result json;
        BEGIN
          -- Add color column to edges table if it doesn't exist
          ALTER TABLE public.edges ADD COLUMN IF NOT EXISTS color VARCHAR(50);
          ALTER TABLE public.edges ADD COLUMN IF NOT EXISTS notes TEXT;
          
          -- Reload the PostgREST schema cache
          PERFORM pg_notify('pgrst', 'reload schema');
          
          result := json_build_object('success', true, 'message', 'Migration applied successfully');
          RETURN result;
        EXCEPTION WHEN OTHERS THEN
          result := json_build_object('success', false, 'message', SQLERRM);
          RETURN result;
        END;
        $$;
      `
    });
    
    if (error) {
      console.error('Error creating migration function:', error);
    } else {
      console.log('Migration function created successfully:', data);
    }
  } catch (error) {
    console.error('Exception during function creation:', error);
  }
}

// Execute the function creation
createMigrationFunction(); 