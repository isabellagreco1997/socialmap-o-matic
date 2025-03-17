-- Add handle fields to edges table
ALTER TABLE edges
ADD COLUMN source_handle TEXT,
ADD COLUMN target_handle TEXT;

-- Set existing edges to use null handles
UPDATE edges
SET source_handle = NULL, target_handle = NULL
WHERE source_handle IS NULL AND target_handle IS NULL;
