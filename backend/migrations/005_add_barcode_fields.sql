-- =====================================================
-- Migration: Add Barcode Fields and Table
-- Description: Enhanced barcode support for library items
-- Date: 2025-11-14
-- =====================================================

-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Update Books Table - Add Generated Barcode Field
-- =====================================================
-- The books table already has a barcode field, but we'll add an index
-- and ensure it's optimized for barcode scanning

-- Create index for fast barcode lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_books_barcode ON books(barcode) WHERE barcode IS NOT NULL;

-- Add unique constraint to ensure barcode uniqueness
-- First, check if constraint exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_book_barcode'
    ) THEN
        ALTER TABLE books ADD CONSTRAINT unique_book_barcode UNIQUE (barcode);
    END IF;
END $$;

-- =====================================================
-- Barcode Generation Settings Table
-- =====================================================
CREATE TABLE IF NOT EXISTS barcode_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Barcode format settings
    prefix VARCHAR(10) DEFAULT 'LIB', -- Library prefix
    format VARCHAR(20) NOT NULL DEFAULT 'CODE128', -- CODE128, CODE39, EAN13, etc.
    include_checksum BOOLEAN DEFAULT TRUE,

    -- Auto-generation settings
    auto_generate BOOLEAN DEFAULT TRUE,
    next_sequence INTEGER DEFAULT 1,
    sequence_length INTEGER DEFAULT 8, -- Number of digits in sequence

    -- Display settings
    show_text BOOLEAN DEFAULT TRUE,
    barcode_height INTEGER DEFAULT 50, -- Height in pixels
    barcode_width INTEGER DEFAULT 2, -- Width of narrow bar in pixels

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO barcode_settings (id, prefix, format, auto_generate, next_sequence, sequence_length)
VALUES (uuid_generate_v4(), 'LIB', 'CODE128', TRUE, 1, 8)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Barcode History Table (for tracking barcode changes)
-- =====================================================
CREATE TABLE IF NOT EXISTS barcode_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,

    -- Barcode details
    old_barcode VARCHAR(50),
    new_barcode VARCHAR(50) NOT NULL,
    change_reason VARCHAR(255),

    -- Who made the change
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for barcode history lookups
CREATE INDEX idx_barcode_history_book_id ON barcode_history(book_id);
CREATE INDEX idx_barcode_history_changed_at ON barcode_history(changed_at DESC);

-- =====================================================
-- Function: Generate Next Barcode
-- =====================================================
CREATE OR REPLACE FUNCTION generate_next_barcode()
RETURNS VARCHAR AS $$
DECLARE
    settings RECORD;
    next_num INTEGER;
    barcode VARCHAR(50);
BEGIN
    -- Get current settings
    SELECT * INTO settings FROM barcode_settings LIMIT 1;

    -- Get and increment sequence
    next_num := settings.next_sequence;
    UPDATE barcode_settings SET next_sequence = next_sequence + 1;

    -- Generate barcode with padding
    barcode := settings.prefix || LPAD(next_num::TEXT, settings.sequence_length, '0');

    RETURN barcode;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Function: Validate Barcode Format
-- =====================================================
CREATE OR REPLACE FUNCTION validate_barcode(barcode_value VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    -- Basic validation: not empty, valid characters, reasonable length
    IF barcode_value IS NULL OR LENGTH(barcode_value) < 3 THEN
        RETURN FALSE;
    END IF;

    -- Check for valid characters (alphanumeric and hyphens)
    IF barcode_value !~ '^[A-Z0-9\-]+$' THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Trigger: Update timestamp on settings change
-- =====================================================
CREATE OR REPLACE FUNCTION update_barcode_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_barcode_settings_timestamp
    BEFORE UPDATE ON barcode_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_barcode_settings_timestamp();

-- =====================================================
-- Comments for Documentation
-- =====================================================
COMMENT ON TABLE barcode_settings IS 'Configuration settings for barcode generation and display';
COMMENT ON TABLE barcode_history IS 'Audit trail for barcode changes on library items';
COMMENT ON FUNCTION generate_next_barcode() IS 'Generates the next sequential barcode based on current settings';
COMMENT ON FUNCTION validate_barcode(VARCHAR) IS 'Validates barcode format and characters';
