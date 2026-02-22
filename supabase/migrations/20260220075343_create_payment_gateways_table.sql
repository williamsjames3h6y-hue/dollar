/*
  # Create Payment Gateways System

  1. New Tables
    - `payment_gateways`
      - `id` (uuid, primary key)
      - `name` (text: gateway name like 'PayPal', 'Stripe', etc.)
      - `type` (text: 'crypto', 'bank', 'mobile_money', 'card')
      - `is_active` (boolean: whether gateway is enabled)
      - `config` (jsonb: gateway-specific configuration)
      - `fees` (jsonb: fee structure)
      - `min_amount` (decimal: minimum transaction amount)
      - `max_amount` (decimal: maximum transaction amount)
      - `supported_currencies` (jsonb: array of currency codes)
      - `instructions` (text: user instructions)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `updated_by` (uuid, references auth.users)

  2. Security
    - Enable RLS on payment_gateways table
    - Users can view active gateways
    - Only admins can modify gateways
*/

-- Create payment_gateways table
CREATE TABLE IF NOT EXISTS payment_gateways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('crypto', 'bank', 'mobile_money', 'card', 'other')),
  is_active boolean DEFAULT true NOT NULL,
  config jsonb DEFAULT '{}'::jsonb NOT NULL,
  fees jsonb DEFAULT '{"fixed": 0, "percentage": 0}'::jsonb NOT NULL,
  min_amount decimal(10,2) DEFAULT 10.00 NOT NULL,
  max_amount decimal(10,2) DEFAULT 10000.00 NOT NULL,
  supported_currencies jsonb DEFAULT '["USD"]'::jsonb NOT NULL,
  instructions text DEFAULT '' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;

-- Payment gateways policies
CREATE POLICY "Anyone can view active payment gateways"
  ON payment_gateways FOR SELECT
  TO authenticated
  USING (is_active = true OR is_admin(auth.uid()));

CREATE POLICY "Admins can insert payment gateways"
  ON payment_gateways FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update payment gateways"
  ON payment_gateways FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete payment gateways"
  ON payment_gateways FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Insert default payment gateways
INSERT INTO payment_gateways (name, type, is_active, config, fees, min_amount, max_amount, supported_currencies, instructions)
VALUES 
  ('PayPal', 'card', true, '{"email": ""}'::jsonb, '{"fixed": 0.30, "percentage": 2.9}'::jsonb, 1.00, 10000.00, '["USD", "EUR", "GBP"]'::jsonb, 'Enter your PayPal email address to receive payments.'),
  ('Bitcoin (BTC)', 'crypto', true, '{"wallet_address": ""}'::jsonb, '{"fixed": 0, "percentage": 0}'::jsonb, 10.00, 100000.00, '["BTC"]'::jsonb, 'Send Bitcoin to the provided wallet address.'),
  ('USDT (TRC20)', 'crypto', true, '{"wallet_address": ""}'::jsonb, '{"fixed": 1, "percentage": 0}'::jsonb, 10.00, 50000.00, '["USDT"]'::jsonb, 'Send USDT on TRC20 network to the provided address.'),
  ('Bank Transfer', 'bank', true, '{"account_name": "", "account_number": "", "bank_name": "", "routing_number": ""}'::jsonb, '{"fixed": 0, "percentage": 0}'::jsonb, 50.00, 50000.00, '["USD"]'::jsonb, 'Transfer funds to the provided bank account.')
ON CONFLICT DO NOTHING;