/*
  # Create Wallet and Earnings Tables

  1. New Tables
    - `wallets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `balance` (decimal, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `wallet_id` (uuid, references wallets)
      - `type` (text: 'deposit', 'withdraw', 'earnings')
      - `amount` (decimal)
      - `status` (text: 'pending', 'completed', 'failed')
      - `description` (text)
      - `created_at` (timestamptz)
    
    - `daily_earnings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `date` (date)
      - `tasks_completed` (integer, default 0)
      - `commission_earned` (decimal, default 0)
      - `base_salary` (decimal, default 0)
      - `total_earnings` (decimal, default 0)
      - `can_withdraw` (boolean, default false)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance decimal(10,2) DEFAULT 0.00 NOT NULL CHECK (balance >= 0),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wallet_id uuid REFERENCES wallets(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('deposit', 'withdraw', 'earnings')),
  amount decimal(10,2) NOT NULL CHECK (amount > 0),
  status text DEFAULT 'completed' NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  description text DEFAULT '',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create daily_earnings table
CREATE TABLE IF NOT EXISTS daily_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date DEFAULT CURRENT_DATE NOT NULL,
  tasks_completed integer DEFAULT 0 NOT NULL CHECK (tasks_completed >= 0),
  commission_earned decimal(10,2) DEFAULT 0.00 NOT NULL,
  base_salary decimal(10,2) DEFAULT 0.00 NOT NULL,
  total_earnings decimal(10,2) DEFAULT 0.00 NOT NULL,
  can_withdraw boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_earnings ENABLE ROW LEVEL SECURITY;

-- Wallets policies
CREATE POLICY "Users can view own wallet"
  ON wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet"
  ON wallets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet"
  ON wallets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Daily earnings policies
CREATE POLICY "Users can view own earnings"
  ON daily_earnings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own earnings"
  ON daily_earnings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own earnings"
  ON daily_earnings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to automatically create wallet for new users
CREATE OR REPLACE FUNCTION create_wallet_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id, balance)
  VALUES (NEW.id, 0.00);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create wallet when user signs up
DROP TRIGGER IF EXISTS create_wallet_on_signup ON auth.users;
CREATE TRIGGER create_wallet_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_wallet_for_user();