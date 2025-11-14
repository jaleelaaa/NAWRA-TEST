-- =====================================================
-- Migration: Create Preservation Records Table
-- Description: Track artifact condition, conservation history, and restoration needs
-- Date: 2025-11-14
-- =====================================================

-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Preservation Records Table
-- =====================================================
CREATE TABLE IF NOT EXISTS preservation_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,

    -- Condition Assessment
    condition_status VARCHAR(50) NOT NULL CHECK (condition_status IN ('excellent', 'good', 'fair', 'poor', 'critical')),
    condition_notes TEXT,

    -- Conservation History (JSONB array of {date, action, conservator, cost, notes})
    conservation_history JSONB DEFAULT '[]'::jsonb,
    last_conservation_date DATE,
    conservator_name VARCHAR(200),

    -- Restoration Tracking
    restoration_needed BOOLEAN DEFAULT FALSE,
    restoration_priority VARCHAR(20) CHECK (restoration_priority IN ('low', 'medium', 'high', 'urgent')),
    restoration_notes TEXT,
    estimated_cost DECIMAL(10, 2),

    -- Inspection Schedule
    last_inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
    next_inspection_date DATE,
    inspection_frequency VARCHAR(50), -- monthly, quarterly, yearly

    -- Environmental Conditions
    storage_temperature DECIMAL(5, 2),
    storage_humidity DECIMAL(5, 2),
    light_exposure VARCHAR(50), -- minimal, moderate, high

    -- Damage Documentation
    damage_types TEXT[], -- water, mold, pest, physical, chemical, fire, uv, wear
    damage_severity VARCHAR(20), -- minor, moderate, severe
    damage_photos TEXT[], -- URLs to damage photos

    -- Metadata
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================
CREATE INDEX idx_preservation_book_id ON preservation_records(book_id);
CREATE INDEX idx_preservation_status ON preservation_records(condition_status);
CREATE INDEX idx_preservation_restoration ON preservation_records(restoration_needed);
CREATE INDEX idx_preservation_next_inspection ON preservation_records(next_inspection_date);
CREATE INDEX idx_preservation_created_at ON preservation_records(created_at DESC);

-- =====================================================
-- Database Function: Get Preservation By Condition
-- =====================================================
CREATE OR REPLACE FUNCTION get_preservation_by_condition()
RETURNS TABLE (condition_status VARCHAR, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pr.condition_status::VARCHAR,
        COUNT(*)::BIGINT
    FROM preservation_records pr
    GROUP BY pr.condition_status
    ORDER BY pr.condition_status;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Trigger: Update timestamp on record update
-- =====================================================
CREATE OR REPLACE FUNCTION update_preservation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_preservation_timestamp
    BEFORE UPDATE ON preservation_records
    FOR EACH ROW
    EXECUTE FUNCTION update_preservation_timestamp();

-- =====================================================
-- Comments for Documentation
-- =====================================================
COMMENT ON TABLE preservation_records IS 'Tracks artifact condition, conservation history, and restoration needs for library materials';
COMMENT ON COLUMN preservation_records.conservation_history IS 'JSONB array of conservation activities: [{date, action, conservator, cost, notes}]';
COMMENT ON COLUMN preservation_records.damage_types IS 'Array of damage type keywords for quick filtering';
COMMENT ON COLUMN preservation_records.condition_status IS 'Current condition: excellent, good, fair, poor, or critical';
COMMENT ON COLUMN preservation_records.restoration_priority IS 'Priority level for restoration: low, medium, high, or urgent';
COMMENT ON COLUMN preservation_records.inspection_frequency IS 'How often to inspect: monthly, quarterly, or yearly';
