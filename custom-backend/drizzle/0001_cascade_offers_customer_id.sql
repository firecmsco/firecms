-- Migration: enforce ON DELETE CASCADE for offers.customer_id
ALTER TABLE IF EXISTS offers DROP CONSTRAINT IF EXISTS offers_customer_id_fkey;
ALTER TABLE offers
  ADD CONSTRAINT offers_customer_id_fkey
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

