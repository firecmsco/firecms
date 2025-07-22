-- Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database if it doesn't exist (this will be handled by Docker)
-- The database 'firecms' should already be created by the Docker environment

-- Enable JSONB operations optimization
CREATE INDEX IF NOT EXISTS idx_entities_values_gin ON entities USING gin(values);

-- Additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_entities_path_values ON entities(path, (values::text));
CREATE INDEX IF NOT EXISTS idx_entities_updated_at ON entities(updated_at);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_entities_updated_at ON entities;
CREATE TRIGGER update_entities_updated_at
    BEFORE UPDATE ON entities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
