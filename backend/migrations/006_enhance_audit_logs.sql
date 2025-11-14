-- =====================================================
-- Migration: Enhance Audit Logs Table
-- Description: Add comprehensive audit logging capabilities
-- Date: 2025-11-14
-- =====================================================

-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Create or Enhance Audit Logs Table
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Who performed the action
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    username VARCHAR(255),
    user_role VARCHAR(50),

    -- What action was performed
    action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT, ACCESS, EXPORT, etc.
    entity_type VARCHAR(50) NOT NULL, -- books, users, circulation, preservation, etc.
    entity_id UUID, -- ID of the affected entity
    entity_name VARCHAR(500), -- Human-readable name/title

    -- Action details
    description TEXT NOT NULL,
    changes JSONB, -- Before/after values for UPDATE actions
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional context data

    -- Request information
    ip_address INET,
    user_agent TEXT,
    request_method VARCHAR(10), -- GET, POST, PUT, DELETE, PATCH
    request_path VARCHAR(500),

    -- Status and result
    status VARCHAR(20) DEFAULT 'success', -- success, failure, warning
    error_message TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id, created_at DESC);

-- =====================================================
-- Function: Log Activity
-- =====================================================
CREATE OR REPLACE FUNCTION log_activity(
    p_user_id UUID,
    p_action VARCHAR,
    p_entity_type VARCHAR,
    p_entity_id UUID,
    p_description TEXT,
    p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
    log_id UUID;
    user_data RECORD;
BEGIN
    -- Get user details
    SELECT username, role INTO user_data FROM users WHERE id = p_user_id;

    -- Insert audit log
    INSERT INTO audit_logs (
        user_id,
        username,
        user_role,
        action,
        entity_type,
        entity_id,
        description,
        metadata,
        status
    ) VALUES (
        p_user_id,
        COALESCE(user_data.username, 'unknown'),
        user_data.role,
        p_action,
        p_entity_type,
        p_entity_id,
        p_description,
        p_metadata,
        'success'
    ) RETURNING id INTO log_id;

    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Function: Get Activity Summary
-- =====================================================
CREATE OR REPLACE FUNCTION get_activity_summary(days INTEGER DEFAULT 7)
RETURNS TABLE (
    action VARCHAR,
    entity_type VARCHAR,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        al.action,
        al.entity_type,
        COUNT(*)::BIGINT
    FROM audit_logs al
    WHERE al.created_at >= NOW() - (days || ' days')::INTERVAL
    GROUP BY al.action, al.entity_type
    ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Function: Get User Activity
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_activity(p_user_id UUID, days INTEGER DEFAULT 30)
RETURNS TABLE (
    date DATE,
    action_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE(al.created_at) as date,
        COUNT(*)::BIGINT as action_count
    FROM audit_logs al
    WHERE al.user_id = p_user_id
        AND al.created_at >= NOW() - (days || ' days')::INTERVAL
    GROUP BY DATE(al.created_at)
    ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Comments for Documentation
-- =====================================================
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all system activities';
COMMENT ON COLUMN audit_logs.changes IS 'JSONB object with before/after values for UPDATE actions';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional contextual information about the action';
COMMENT ON FUNCTION log_activity IS 'Helper function to log activities with automatic user lookup';
COMMENT ON FUNCTION get_activity_summary IS 'Get summary of activities by action and entity type';
COMMENT ON FUNCTION get_user_activity IS 'Get daily activity count for a specific user';
