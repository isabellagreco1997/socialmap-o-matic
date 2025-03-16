-- Add color column to nodes table
ALTER TABLE public.nodes ADD COLUMN IF NOT EXISTS color VARCHAR(50);

-- Update the REST API schema cache
SELECT
  pg_notify('pgrst', 'reload schema'); 