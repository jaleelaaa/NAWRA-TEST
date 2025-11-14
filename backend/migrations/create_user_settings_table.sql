-- Migration: Create user_settings table
-- Description: Table to store user preferences and configuration
-- Date: 2025-11-14

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- General Settings (stored as JSONB for flexibility)
    general JSONB DEFAULT '{
        "display_name": null,
        "language": "en",
        "date_format": "DD/MM/YYYY",
        "time_format": "24h",
        "default_landing_page": "dashboard",
        "items_per_page": 12,
        "default_view_mode": "grid"
    }'::jsonb,

    -- Appearance Settings
    appearance JSONB DEFAULT '{
        "theme": "light",
        "interface_density": "default",
        "font_size": "medium",
        "animation_speed": "default",
        "show_breadcrumbs": true
    }'::jsonb,

    -- Notification Settings
    notifications JSONB DEFAULT '{
        "email": {
            "system_announcements": true,
            "due_date_reminders": true,
            "overdue_notifications": true,
            "new_circulation_requests": true,
            "user_registration": false,
            "daily_digest": false,
            "digest_time": "09:00"
        },
        "in_app": {
            "enabled": true,
            "sound": true,
            "badge_counters": true,
            "position": "top-right",
            "auto_dismiss_time": 5
        }
    }'::jsonb,

    -- Security Settings
    security JSONB DEFAULT '{
        "two_factor_enabled": false,
        "session_timeout": 3600,
        "last_password_change": null
    }'::jsonb,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE user_settings IS 'Stores user-specific preferences and configuration settings';
COMMENT ON COLUMN user_settings.general IS 'General preferences including language, date format, and default views';
COMMENT ON COLUMN user_settings.appearance IS 'UI appearance preferences like theme, density, and font size';
COMMENT ON COLUMN user_settings.notifications IS 'Email and in-app notification preferences';
COMMENT ON COLUMN user_settings.security IS 'Security-related settings like 2FA and session timeout';
