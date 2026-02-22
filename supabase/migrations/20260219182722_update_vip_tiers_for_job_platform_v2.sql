/*
  # Update VIP Tiers for Job/Task Platform with Commission Rates

  1. Changes
    - Update vip_tiers table to add commission_rate column
    - Add max_tasks_per_day column for daily task limits
    - Update to 5 VIP levels (VIP 1-5) with incremental benefits
    - VIP 1: 3% commission, VIP 2: 5%, VIP 3: 7%, VIP 4: 9%, VIP 5: 12%
    - Update existing tiers instead of deleting to preserve foreign key relationships
    
  2. New Structure
    - VIP 1: Free (available on signup), 3% commission, 5 tasks/day
    - VIP 2: $50/month, 5% commission, 10 tasks/day (contact support)
    - VIP 3: $100/month, 7% commission, 20 tasks/day (contact support)
    - VIP 4: $200/month, 9% commission, 40 tasks/day (contact support)
    - VIP 5: $500/month, 12% commission, unlimited tasks (contact support)
*/

-- Add new columns to vip_tiers if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vip_tiers' AND column_name = 'commission_rate'
  ) THEN
    ALTER TABLE vip_tiers ADD COLUMN commission_rate decimal(5,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vip_tiers' AND column_name = 'max_tasks_per_day'
  ) THEN
    ALTER TABLE vip_tiers ADD COLUMN max_tasks_per_day integer DEFAULT 5;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vip_tiers' AND column_name = 'requires_support_contact'
  ) THEN
    ALTER TABLE vip_tiers ADD COLUMN requires_support_contact boolean DEFAULT false;
  END IF;
END $$;

-- Update existing tiers and insert new ones
DO $$
DECLARE
  tier_id_1 uuid;
  tier_id_2 uuid;
  tier_id_3 uuid;
  tier_id_4 uuid;
  tier_id_5 uuid;
BEGIN
  -- Update or insert VIP 1
  INSERT INTO vip_tiers (name, level, price_monthly, commission_rate, max_tasks_per_day, max_annotations_per_month, max_projects, max_team_members, requires_support_contact, features)
  VALUES (
    'VIP 1', 
    1, 
    0, 
    3.00, 
    5, 
    150, 
    3, 
    1, 
    false,
    '["3% commission rate", "5 tasks per day", "Basic data optimization jobs", "Email support"]'::jsonb
  )
  ON CONFLICT (level) DO UPDATE SET
    name = EXCLUDED.name,
    price_monthly = EXCLUDED.price_monthly,
    commission_rate = EXCLUDED.commission_rate,
    max_tasks_per_day = EXCLUDED.max_tasks_per_day,
    max_annotations_per_month = EXCLUDED.max_annotations_per_month,
    max_projects = EXCLUDED.max_projects,
    max_team_members = EXCLUDED.max_team_members,
    requires_support_contact = EXCLUDED.requires_support_contact,
    features = EXCLUDED.features
  RETURNING id INTO tier_id_1;

  -- Update users on old tier 0 to new VIP 1
  UPDATE user_profiles SET vip_tier_id = tier_id_1 WHERE vip_tier_id IN (
    SELECT id FROM vip_tiers WHERE level = 0
  );

  -- Insert VIP 2
  INSERT INTO vip_tiers (name, level, price_monthly, commission_rate, max_tasks_per_day, max_annotations_per_month, max_projects, max_team_members, requires_support_contact, features)
  VALUES (
    'VIP 2', 
    2, 
    50, 
    5.00, 
    10, 
    300, 
    10, 
    2, 
    true,
    '["5% commission rate", "10 tasks per day", "Priority job access", "Advanced data tasks", "Email & chat support"]'::jsonb
  )
  ON CONFLICT (level) DO UPDATE SET
    name = EXCLUDED.name,
    price_monthly = EXCLUDED.price_monthly,
    commission_rate = EXCLUDED.commission_rate,
    max_tasks_per_day = EXCLUDED.max_tasks_per_day,
    max_annotations_per_month = EXCLUDED.max_annotations_per_month,
    max_projects = EXCLUDED.max_projects,
    max_team_members = EXCLUDED.max_team_members,
    requires_support_contact = EXCLUDED.requires_support_contact,
    features = EXCLUDED.features;

  -- Insert VIP 3
  INSERT INTO vip_tiers (name, level, price_monthly, commission_rate, max_tasks_per_day, max_annotations_per_month, max_projects, max_team_members, requires_support_contact, features)
  VALUES (
    'VIP 3', 
    3, 
    100, 
    7.00, 
    20, 
    600, 
    25, 
    5, 
    true,
    '["7% commission rate", "20 tasks per day", "Premium job categories", "Bonus opportunities", "Priority support", "Performance analytics"]'::jsonb
  )
  ON CONFLICT (level) DO UPDATE SET
    name = EXCLUDED.name,
    price_monthly = EXCLUDED.price_monthly,
    commission_rate = EXCLUDED.commission_rate,
    max_tasks_per_day = EXCLUDED.max_tasks_per_day,
    max_annotations_per_month = EXCLUDED.max_annotations_per_month,
    max_projects = EXCLUDED.max_projects,
    max_team_members = EXCLUDED.max_team_members,
    requires_support_contact = EXCLUDED.requires_support_contact,
    features = EXCLUDED.features;

  -- Insert VIP 4
  INSERT INTO vip_tiers (name, level, price_monthly, commission_rate, max_tasks_per_day, max_annotations_per_month, max_projects, max_team_members, requires_support_contact, features)
  VALUES (
    'VIP 4', 
    4, 
    200, 
    9.00, 
    40, 
    1200, 
    50, 
    10, 
    true,
    '["9% commission rate", "40 tasks per day", "Exclusive high-value jobs", "Weekly bonuses", "Dedicated account manager", "Advanced tools"]'::jsonb
  )
  ON CONFLICT (level) DO UPDATE SET
    name = EXCLUDED.name,
    price_monthly = EXCLUDED.price_monthly,
    commission_rate = EXCLUDED.commission_rate,
    max_tasks_per_day = EXCLUDED.max_tasks_per_day,
    max_annotations_per_month = EXCLUDED.max_annotations_per_month,
    max_projects = EXCLUDED.max_projects,
    max_team_members = EXCLUDED.max_team_members,
    requires_support_contact = EXCLUDED.requires_support_contact,
    features = EXCLUDED.features;

  -- Insert VIP 5
  INSERT INTO vip_tiers (name, level, price_monthly, commission_rate, max_tasks_per_day, max_annotations_per_month, max_projects, max_team_members, requires_support_contact, features)
  VALUES (
    'VIP 5', 
    5, 
    500, 
    12.00, 
    999999, 
    999999, 
    100, 
    25, 
    true,
    '["12% commission rate", "Unlimited tasks", "VIP exclusive jobs", "Monthly bonus packages", "24/7 premium support", "API access", "Custom solutions"]'::jsonb
  )
  ON CONFLICT (level) DO UPDATE SET
    name = EXCLUDED.name,
    price_monthly = EXCLUDED.price_monthly,
    commission_rate = EXCLUDED.commission_rate,
    max_tasks_per_day = EXCLUDED.max_tasks_per_day,
    max_annotations_per_month = EXCLUDED.max_annotations_per_month,
    max_projects = EXCLUDED.max_projects,
    max_team_members = EXCLUDED.max_team_members,
    requires_support_contact = EXCLUDED.requires_support_contact,
    features = EXCLUDED.features;

  -- Delete old tier 0 if it exists
  DELETE FROM vip_tiers WHERE level = 0;
END $$;
