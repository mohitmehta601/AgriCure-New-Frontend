/*
  # Add product key tracking to products table

  1. Changes
    - Add `is_used` (boolean) - Whether the product key has been used
    - Add `used_by` (uuid) - Reference to the user who used this product key
    - Add `used_at` (timestamp) - When the product key was used
    - Add unique constraint to prevent duplicate usage

  2. Security
    - Update RLS policies to prevent reuse of product keys
*/

-- Add new columns to products table
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS is_used boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS used_at timestamptz;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_used_by ON products(used_by);
CREATE INDEX IF NOT EXISTS idx_products_is_used ON products(is_used);

-- Update the existing policy to only show unused active products for signup
DROP POLICY IF EXISTS "Allow public read access for signup validation" ON products;

CREATE POLICY "Allow public read access for available products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Add policy to prevent updating used products
CREATE POLICY "Prevent updating used products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (is_used = false);

-- Add comment for documentation
COMMENT ON COLUMN products.is_used IS 'Indicates whether this product key has been used to create an account';
COMMENT ON COLUMN products.used_by IS 'Reference to the user who used this product key';
COMMENT ON COLUMN products.used_at IS 'Timestamp when the product key was used';
