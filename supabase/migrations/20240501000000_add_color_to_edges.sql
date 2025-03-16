-- Add color column to edges table
ALTER TABLE public.edges ADD COLUMN IF NOT EXISTS color VARCHAR(50);
ALTER TABLE public.edges ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update the REST API schema cache
SELECT
  pg_notify('pgrst', 'reload schema'); 