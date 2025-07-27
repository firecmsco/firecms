-- Add CASCADE foreign key constraint to existing offers table
-- This will only affect the foreign key relationship, not the data

-- Drop existing foreign key constraint if it exists
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_customer_id_customers_id_fk;
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_customer_id_fkey;

-- Add new foreign key constraint with CASCADE delete
ALTER TABLE offers
ADD CONSTRAINT offers_customer_id_customers_id_fk
FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
