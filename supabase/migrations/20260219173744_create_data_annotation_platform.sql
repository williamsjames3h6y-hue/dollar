/*
  Data Annotation Platform with VIP Tiers

  1. New Tables
    - vip_tiers: Defines VIP membership levels (Free, Basic, Pro, Enterprise)
      * id, name, level, price_monthly, max_annotations_per_month, max_projects, max_team_members, features, created_at
    
    - user_profiles: Extended user information linked to auth.users
      * id (FK to auth.users), email, full_name, vip_tier_id (FK), subscription_status, subscription_ends_at, annotations_this_month, created_at, updated_at
    
    - projects: Data annotation projects
      * id, owner_id (FK to user_profiles), name, description, project_type, status, created_at, updated_at
    
    - datasets: Individual data items to annotate
      * id, project_id (FK), data_type, data_url, status, created_at
    
    - annotations: Annotations on datasets
      * id, dataset_id (FK), user_id (FK), annotation_data (jsonb), confidence_score, created_at, updated_at
    
    - team_members: Team collaboration
      * id, project_id (FK), user_id (FK), role, joined_at

  2. Security
    - RLS enabled on all tables
    - Users access own data and shared projects only
    - VIP tiers publicly readable
    - Role-based access for team members

  3. Initial Data
    - Seeds four VIP tiers with default pricing and limits
*/

-- Create VIP tiers table
CREATE TABLE IF NOT EXISTS vip_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  level integer NOT NULL UNIQUE,
  price_monthly decimal(10,2) NOT NULL DEFAULT 0,
  max_annotations_per_month integer NOT NULL DEFAULT 100,
  max_projects integer NOT NULL DEFAULT 1,
  max_team_members integer NOT NULL DEFAULT 1,
  features jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  vip_tier_id uuid REFERENCES vip_tiers(id),
  subscription_status text DEFAULT 'active',
  subscription_ends_at timestamptz,
  annotations_this_month integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  project_type text DEFAULT 'text',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create datasets table
CREATE TABLE IF NOT EXISTS datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  data_type text NOT NULL,
  data_url text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create annotations table
CREATE TABLE IF NOT EXISTS annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id uuid REFERENCES datasets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  annotation_data jsonb DEFAULT '{}'::jsonb,
  confidence_score decimal(3,2) DEFAULT 0.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create team members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'viewer',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Enable RLS
ALTER TABLE vip_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- VIP Tiers policies (publicly readable for pricing page)
CREATE POLICY "VIP tiers are viewable by everyone"
  ON vip_tiers FOR SELECT
  TO authenticated, anon
  USING (true);

-- User Profiles policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.project_id = projects.id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Project owners can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Project owners can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Datasets policies
CREATE POLICY "Users can view datasets in accessible projects"
  ON datasets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = datasets.project_id
      AND (
        projects.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.project_id = projects.id
          AND team_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Project members can insert datasets"
  ON datasets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = datasets.project_id
      AND (
        projects.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.project_id = projects.id
          AND team_members.user_id = auth.uid()
          AND team_members.role IN ('owner', 'editor')
        )
      )
    )
  );

CREATE POLICY "Project editors can update datasets"
  ON datasets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = datasets.project_id
      AND (
        projects.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.project_id = projects.id
          AND team_members.user_id = auth.uid()
          AND team_members.role IN ('owner', 'editor')
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = datasets.project_id
      AND (
        projects.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.project_id = projects.id
          AND team_members.user_id = auth.uid()
          AND team_members.role IN ('owner', 'editor')
        )
      )
    )
  );

CREATE POLICY "Project editors can delete datasets"
  ON datasets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = datasets.project_id
      AND (
        projects.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.project_id = projects.id
          AND team_members.user_id = auth.uid()
          AND team_members.role IN ('owner', 'editor')
        )
      )
    )
  );

-- Annotations policies
CREATE POLICY "Users can view annotations in accessible projects"
  ON annotations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM datasets
      JOIN projects ON projects.id = datasets.project_id
      WHERE datasets.id = annotations.dataset_id
      AND (
        projects.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.project_id = projects.id
          AND team_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create annotations"
  ON annotations FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM datasets
      JOIN projects ON projects.id = datasets.project_id
      WHERE datasets.id = annotations.dataset_id
      AND (
        projects.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.project_id = projects.id
          AND team_members.user_id = auth.uid()
          AND team_members.role IN ('owner', 'editor')
        )
      )
    )
  );

CREATE POLICY "Users can update own annotations"
  ON annotations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own annotations"
  ON annotations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Team members policies
CREATE POLICY "Users can view team members of accessible projects"
  ON team_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = team_members.project_id
      AND (
        projects.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.project_id = projects.id
          AND tm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Project owners can add team members"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = team_members.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can update team members"
  ON team_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = team_members.project_id
      AND projects.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = team_members.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can remove team members"
  ON team_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = team_members.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Insert default VIP tiers
INSERT INTO vip_tiers (name, level, price_monthly, max_annotations_per_month, max_projects, max_team_members, features)
VALUES 
  ('Free', 0, 0, 100, 1, 1, '["Basic annotation tools", "Text data support"]'::jsonb),
  ('Basic', 1, 29, 1000, 5, 3, '["Basic annotation tools", "Text data support", "Image annotation", "Export to JSON/CSV"]'::jsonb),
  ('Pro', 2, 79, 10000, 20, 10, '["All Basic features", "Video annotation", "Audio annotation", "AI-assisted labeling", "Priority support", "Advanced analytics"]'::jsonb),
  ('Enterprise', 3, 299, 100000, 100, 50, '["All Pro features", "Custom workflows", "API access", "Dedicated support", "SSO integration", "Advanced security"]'::jsonb)
ON CONFLICT (name) DO NOTHING;