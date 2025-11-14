-- Migration: Insert Mock Dev User
-- Purpose: Create a mock user for development/testing with predictable UUID
-- Date: 2025-11-14
--
-- This user is used by the dev-login.html helper for quick authentication bypass

-- Insert mock dev user with specific UUID
INSERT INTO users (
    id,
    email,
    full_name,
    role,
    user_type,
    password_hash,
    is_active,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,  -- Predictable UUID for dev mode
    'admin@nawra.om',                               -- Email used in dev-login.html
    'Test Admin',                                   -- Display name
    'Administrator',                                -- Role
    'staff',                                        -- User type
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7TzH3XluDq',  -- Hashed password: "password123"
    true,                                           -- Active user
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;  -- Skip if user already exists

-- Verify user was created
SELECT
    id,
    email,
    full_name,
    role,
    user_type,
    is_active,
    created_at
FROM users
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Mock dev user created successfully!';
    RAISE NOTICE 'Email: admin@nawra.om';
    RAISE NOTICE 'Password: password123';
    RAISE NOTICE 'UUID: 00000000-0000-0000-0000-000000000001';
END $$;
