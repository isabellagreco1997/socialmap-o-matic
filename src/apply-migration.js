// This script applies the migration to add color and notes columns to the edges table
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qlyrnrzhgybxvwxriobu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFseXJucnpoZ3lieHZ3eHJpb2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MzAzOTYsImV4cCI6MjA1NjAwNjM5Nn0.shGRGom-iEaF5_gU4oXIwnG0wpTEGPRIbZ2qjYB3C_Y";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function applyMigration() {
  try {
    // Add color and notes columns to edges table
    const { data, error } = await supabase.rpc('apply_migration');
    
    if (error) {
      console.error('Error applying migration:', error);
    } else {
      console.log('Migration applied successfully:', data);
    }
  } catch (error) {
    console.error('Exception during migration:', error);
  }
}

// Execute the migration
applyMigration(); 