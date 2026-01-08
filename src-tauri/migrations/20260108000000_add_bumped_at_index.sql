-- Add index on bumped_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_items_bumped_at ON items(bumped_at DESC);
