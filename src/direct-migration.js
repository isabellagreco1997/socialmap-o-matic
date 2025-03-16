// This script directly applies the migration using raw SQL queries
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qlyrnrzhgybxvwxriobu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFseXJucnpoZ3lieHZ3eHJpb2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MzAzOTYsImV4cCI6MjA1NjAwNjM5Nn0.shGRGom-iEaF5_gU4oXIwnG0wpTEGPRIbZ2qjYB3C_Y";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function applyDirectMigration() {
  try {
    // Add color column to edges table
    const { data: addColorData, error: addColorError } = await supabase
      .from('edges')
      .select('color')
      .limit(1);
    
    if (addColorError && addColorError.code === 'PGRST204') {
      console.log('Color column does not exist. Attempting to add it...');
      
      // Since we can't directly execute ALTER TABLE with the JavaScript client,
      // we need to use the Supabase dashboard SQL editor to run:
      // ALTER TABLE public.edges ADD COLUMN IF NOT EXISTS color VARCHAR(50);
      // ALTER TABLE public.edges ADD COLUMN IF NOT EXISTS notes TEXT;
      // SELECT pg_notify('pgrst', 'reload schema');
      
      console.log('Please go to the Supabase dashboard SQL editor and run the following SQL:');
      console.log(`
        -- Add color column to edges table if it doesn't exist
        ALTER TABLE public.edges ADD COLUMN IF NOT EXISTS color VARCHAR(50);
        ALTER TABLE public.edges ADD COLUMN IF NOT EXISTS notes TEXT;
        
        -- Reload the PostgREST schema cache
        SELECT pg_notify('pgrst', 'reload schema');
      `);
    } else {
      console.log('Color column already exists or there was a different error:', addColorError);
      console.log('Sample data:', addColorData);
    }
  } catch (error) {
    console.error('Exception during migration:', error);
  }
}

// Execute the direct migration
applyDirectMigration(); 