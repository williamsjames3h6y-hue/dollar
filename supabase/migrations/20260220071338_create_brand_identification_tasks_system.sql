/*
  # Create Brand Identification Tasks System
  
  1. New Tables
    - `admin_tasks`
      - `id` (uuid, primary key)
      - `task_order` (integer) - Order in which tasks should be completed
      - `vip_level_required` (integer) - VIP level required to access this task
      - `image_url` (text) - URL to the brand image
      - `brand_name` (text) - Correct brand name answer
      - `earning_amount` (decimal) - Amount earned for completing this task
      - `created_at` (timestamptz)
    
    - `user_task_submissions`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to user
      - `task_id` (uuid) - Reference to admin_tasks
      - `user_answer` (text) - User's submitted answer
      - `status` (text) - pending, completed, rejected
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz)
  
  2. VIP Tier Updates
    - VIP 1: $100+ per week, 35 tasks per day
    - VIP 2: $500+ per week
    - VIP 3: $1000+ per week
    - VIP 4: $2000+ per week
    - VIP 5: $5000+ per week
  
  3. Security
    - Enable RLS on both tables
    - Users can read admin_tasks for their VIP level
    - Users can create and read their own submissions
    - Only authenticated users can access
*/

-- Create admin_tasks table
CREATE TABLE IF NOT EXISTS admin_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_order integer NOT NULL DEFAULT 0,
  vip_level_required integer NOT NULL DEFAULT 1,
  image_url text NOT NULL,
  brand_name text NOT NULL,
  earning_amount numeric(10,2) NOT NULL DEFAULT 2.14,
  created_at timestamptz DEFAULT now()
);

-- Create user_task_submissions table
CREATE TABLE IF NOT EXISTS user_task_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES admin_tasks(id) ON DELETE CASCADE,
  user_answer text NOT NULL,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'rejected')),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, task_id)
);

-- Enable RLS
ALTER TABLE admin_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_task_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_tasks
CREATE POLICY "Users can view tasks for their VIP level"
  ON admin_tasks FOR SELECT
  TO authenticated
  USING (
    vip_level_required <= (
      SELECT vt.level 
      FROM user_profiles up 
      JOIN vip_tiers vt ON up.vip_tier_id = vt.id 
      WHERE up.id = auth.uid()
    )
  );

-- RLS Policies for user_task_submissions
CREATE POLICY "Users can view own submissions"
  ON user_task_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create submissions"
  ON user_task_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions"
  ON user_task_submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update VIP tiers
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vip_tiers' AND column_name = 'weekly_earning_limit') THEN
    UPDATE vip_tiers SET weekly_earning_limit = 100 WHERE level = 1;
    UPDATE vip_tiers SET weekly_earning_limit = 500 WHERE level = 2;
    UPDATE vip_tiers SET weekly_earning_limit = 1000 WHERE level = 3;
    UPDATE vip_tiers SET weekly_earning_limit = 2000 WHERE level = 4;
    UPDATE vip_tiers SET weekly_earning_limit = 5000 WHERE level = 5;
  ELSE
    ALTER TABLE vip_tiers ADD COLUMN weekly_earning_limit numeric(10,2) DEFAULT 100;
    UPDATE vip_tiers SET weekly_earning_limit = 100 WHERE level = 1;
    UPDATE vip_tiers SET weekly_earning_limit = 500 WHERE level = 2;
    UPDATE vip_tiers SET weekly_earning_limit = 1000 WHERE level = 3;
    UPDATE vip_tiers SET weekly_earning_limit = 2000 WHERE level = 4;
    UPDATE vip_tiers SET weekly_earning_limit = 5000 WHERE level = 5;
  END IF;
END $$;

-- Update VIP 1 max tasks per day to 35
UPDATE vip_tiers SET max_tasks_per_day = 35 WHERE level = 1;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_tasks_vip_order ON admin_tasks(vip_level_required, task_order);
CREATE INDEX IF NOT EXISTS idx_user_submissions_user ON user_task_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_submissions_task ON user_task_submissions(task_id);

-- Insert sample brand identification tasks for VIP 1 (35 tasks)
-- Using varied earning amounts that total approximately $75
INSERT INTO admin_tasks (task_order, vip_level_required, image_url, brand_name, earning_amount) VALUES
(1, 1, '/1.jpg', 'Brand 1', 2.25),
(2, 1, '/2.jpg', 'Brand 2', 2.10),
(3, 1, '/3.jpg', 'Brand 3', 2.30),
(4, 1, '/4.jpg', 'Brand 4', 1.95),
(5, 1, '/5.jpg', 'Brand 5', 2.40),
(6, 1, '/6.jpg', 'Brand 6', 2.15),
(7, 1, '/7.jpg', 'Brand 7', 2.05),
(8, 1, '/8.jpg', 'Brand 8', 2.35),
(9, 1, '/9.jpg', 'Brand 9', 2.20),
(10, 1, '/1.jpg', 'Brand 10', 2.00),
(11, 1, '/2.jpg', 'Brand 11', 2.25),
(12, 1, '/3.jpg', 'Brand 12', 2.10),
(13, 1, '/4.jpg', 'Brand 13', 2.30),
(14, 1, '/5.jpg', 'Brand 14', 1.85),
(15, 1, '/6.jpg', 'Brand 15', 2.45),
(16, 1, '/7.jpg', 'Brand 16', 2.15),
(17, 1, '/8.jpg', 'Brand 17', 2.05),
(18, 1, '/9.jpg', 'Brand 18', 2.30),
(19, 1, '/1.jpg', 'Brand 19', 2.20),
(20, 1, '/2.jpg', 'Brand 20', 2.00),
(21, 1, '/3.jpg', 'Brand 21', 2.25),
(22, 1, '/4.jpg', 'Brand 22', 2.10),
(23, 1, '/5.jpg', 'Brand 23', 2.35),
(24, 1, '/6.jpg', 'Brand 24', 1.90),
(25, 1, '/7.jpg', 'Brand 25', 2.40),
(26, 1, '/8.jpg', 'Brand 26', 2.15),
(27, 1, '/9.jpg', 'Brand 27', 2.05),
(28, 1, '/1.jpg', 'Brand 28', 2.30),
(29, 1, '/2.jpg', 'Brand 29', 2.20),
(30, 1, '/3.jpg', 'Brand 30', 2.00),
(31, 1, '/4.jpg', 'Brand 31', 2.25),
(32, 1, '/5.jpg', 'Brand 32', 2.10),
(33, 1, '/6.jpg', 'Brand 33', 2.30),
(34, 1, '/7.jpg', 'Brand 34', 2.15),
(35, 1, '/8.jpg', 'Brand 35', 2.05)
ON CONFLICT DO NOTHING;
