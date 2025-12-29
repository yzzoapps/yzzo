-- Add support for image clipboard items
ALTER TABLE items ADD COLUMN item_type TEXT NOT NULL DEFAULT 'text';
ALTER TABLE items ADD COLUMN file_path TEXT;
ALTER TABLE items ADD COLUMN metadata TEXT;
