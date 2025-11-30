/*
  # Complete Farm Schema Update
  
  Ensures all fields from the Add Farm form are present in the database
  This migration is idempotent and safe to run multiple times
  
  Fields covered:
  - Field Name (name)
  - Field Size (size) 
  - Unit (unit)
  - Crop Type (crop_type)
  - Soil Type (soil_type)
  - Location (location, latitude, longitude)
  - Soil Data (soil_data)
  - Sowing Date (sowing_date)
*/

-- Ensure farms table exists with all required columns
DO $$ 
BEGIN
  -- Add latitude column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farms' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE farms ADD COLUMN latitude DECIMAL(10, 8);
    RAISE NOTICE 'Added latitude column';
  END IF;

  -- Add longitude column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farms' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE farms ADD COLUMN longitude DECIMAL(11, 8);
    RAISE NOTICE 'Added longitude column';
  END IF;

  -- Add soil_data column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farms' AND column_name = 'soil_data'
  ) THEN
    ALTER TABLE farms ADD COLUMN soil_data JSONB;
    RAISE NOTICE 'Added soil_data column';
  END IF;

  -- Add sowing_date column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farms' AND column_name = 'sowing_date'
  ) THEN
    ALTER TABLE farms ADD COLUMN sowing_date DATE;
    RAISE NOTICE 'Added sowing_date column';
  END IF;
END $$;

-- Create indexes for performance (IF NOT EXISTS is built-in for indexes)
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON farms(user_id);
CREATE INDEX IF NOT EXISTS idx_farms_location ON farms(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_farms_sowing_date ON farms(sowing_date);
CREATE INDEX IF NOT EXISTS idx_farms_soil_data ON farms USING GIN(soil_data);
CREATE INDEX IF NOT EXISTS idx_farms_crop_type ON farms(crop_type);
CREATE INDEX IF NOT EXISTS idx_farms_soil_type ON farms(soil_type);

-- Add or update column comments for documentation
COMMENT ON COLUMN farms.id IS 'Unique identifier for each farm (auto-generated)';
COMMENT ON COLUMN farms.user_id IS 'Reference to the user who owns this farm';
COMMENT ON COLUMN farms.name IS 'Field Name - User-provided name for the farm/field';
COMMENT ON COLUMN farms.size IS 'Field Size - Numeric size of the farm';
COMMENT ON COLUMN farms.unit IS 'Unit - Measurement unit (hectares, acres, or bigha)';
COMMENT ON COLUMN farms.crop_type IS 'Crop Type - Type of crop being grown on this farm';
COMMENT ON COLUMN farms.soil_type IS 'Soil Type (Auto-detected) - Type of soil detected or manually entered';
COMMENT ON COLUMN farms.location IS 'Human-readable location name/address from geolocation';
COMMENT ON COLUMN farms.latitude IS 'GPS latitude coordinate from "Get My Location & Soil Type" button';
COMMENT ON COLUMN farms.longitude IS 'GPS longitude coordinate from "Get My Location & Soil Type" button';
COMMENT ON COLUMN farms.soil_data IS 'Detailed soil properties and analysis data as JSON';
COMMENT ON COLUMN farms.sowing_date IS 'Sowing Date - Date when the crop was sowed/planted (dd-mm-yyyy format)';
COMMENT ON COLUMN farms.created_at IS 'Timestamp when the farm record was created';
COMMENT ON COLUMN farms.updated_at IS 'Timestamp when the farm record was last updated';

-- Verify all columns exist
DO $$
DECLARE
  missing_columns TEXT[];
  required_columns TEXT[] := ARRAY['id', 'user_id', 'name', 'size', 'unit', 'crop_type', 
                                     'soil_type', 'location', 'latitude', 'longitude', 
                                     'soil_data', 'sowing_date', 'created_at', 'updated_at'];
  col TEXT;
BEGIN
  FOREACH col IN ARRAY required_columns
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'farms' AND column_name = col
    ) THEN
      missing_columns := array_append(missing_columns, col);
    END IF;
  END LOOP;
  
  IF array_length(missing_columns, 1) > 0 THEN
    RAISE WARNING 'Missing columns in farms table: %', array_to_string(missing_columns, ', ');
  ELSE
    RAISE NOTICE 'All required columns exist in farms table ✓';
  END IF;
END $$;

-- Display current schema for verification
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'farms'
ORDER BY ordinal_position;
