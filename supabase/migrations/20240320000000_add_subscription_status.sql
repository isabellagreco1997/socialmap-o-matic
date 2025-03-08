-- Add subscription_status column to profiles table
ALTER TABLE profiles ADD COLUMN subscription_status text DEFAULT NULL;

-- Create an index on subscription_status for faster queries
CREATE INDEX idx_profiles_subscription_status ON profiles(subscription_status);

-- Add a check constraint to ensure valid subscription status values
ALTER TABLE profiles ADD CONSTRAINT chk_subscription_status CHECK (subscription_status IN ('active', 'inactive', 'cancelled', NULL)); 