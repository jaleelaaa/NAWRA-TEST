-- =====================================================
-- Migration: Enhanced Location Management System
-- Description: Hierarchical location tracking for library items
-- Phase: 3 - Enhanced Features (Day 12)
-- =====================================================

-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Locations Table (Hierarchical Structure)
-- =====================================================
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Location Details
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g., "B1-F2-S3-R4-P5"

    -- Hierarchical Structure
    location_type VARCHAR(50) NOT NULL CHECK (
        location_type IN ('building', 'floor', 'section', 'shelf', 'position')
    ),
    parent_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    full_path TEXT, -- e.g., "Building A > Floor 2 > Section C > Shelf 5 > Position 3"

    -- Physical Details
    capacity INTEGER, -- Maximum number of items
    current_count INTEGER DEFAULT 0, -- Current number of items
    dimensions VARCHAR(100), -- e.g., "2m x 1.5m x 0.3m"

    -- Environmental Conditions (for preservation)
    temperature DECIMAL(5, 2), -- Celsius
    humidity DECIMAL(5, 2), -- Percentage
    has_climate_control BOOLEAN DEFAULT FALSE,

    -- Access Control
    is_restricted BOOLEAN DEFAULT FALSE,
    access_level VARCHAR(50), -- e.g., "public", "staff_only", "admin_only"

    -- Additional Information
    description TEXT,
    description_ar TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT check_capacity CHECK (capacity IS NULL OR capacity >= 0),
    CONSTRAINT check_current_count CHECK (current_count >= 0),
    CONSTRAINT check_count_capacity CHECK (capacity IS NULL OR current_count <= capacity)
);

-- =====================================================
-- Indexes for Performance
-- =====================================================
CREATE INDEX idx_locations_code ON locations(code);
CREATE INDEX idx_locations_type ON locations(location_type);
CREATE INDEX idx_locations_parent ON locations(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_locations_active ON locations(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_locations_name ON locations(name);
CREATE INDEX idx_locations_name_ar ON locations(name_ar) WHERE name_ar IS NOT NULL;

-- Full-text search index
CREATE INDEX idx_locations_full_path ON locations USING gin(to_tsvector('english', full_path));

-- =====================================================
-- Location History Table (Track item movements)
-- =====================================================
CREATE TABLE IF NOT EXISTS location_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Item Information
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,

    -- Location Changes
    from_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    to_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    from_location_text VARCHAR(200), -- Keep text in case location is deleted
    to_location_text VARCHAR(200),

    -- Movement Details
    moved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    moved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason VARCHAR(50), -- e.g., "circulation", "maintenance", "reorganization", "transfer"
    notes TEXT,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for location history
CREATE INDEX idx_location_history_book ON location_history(book_id);
CREATE INDEX idx_location_history_from ON location_history(from_location_id) WHERE from_location_id IS NOT NULL;
CREATE INDEX idx_location_history_to ON location_history(to_location_id) WHERE to_location_id IS NOT NULL;
CREATE INDEX idx_location_history_moved_at ON location_history(moved_at DESC);

-- =====================================================
-- Add location_id to books table
-- =====================================================
-- Add new column for hierarchical location
ALTER TABLE books ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL;

-- Create index for book location lookups
CREATE INDEX IF NOT EXISTS idx_books_location ON books(location_id) WHERE location_id IS NOT NULL;

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Function to update full_path when location hierarchy changes
CREATE OR REPLACE FUNCTION update_location_full_path()
RETURNS TRIGGER AS $$
DECLARE
    path_parts TEXT[];
    current_id UUID;
    current_name TEXT;
BEGIN
    -- Start with current location
    path_parts := ARRAY[NEW.name];
    current_id := NEW.parent_id;

    -- Traverse up the hierarchy
    WHILE current_id IS NOT NULL LOOP
        SELECT name, parent_id INTO current_name, current_id
        FROM locations
        WHERE id = current_id;

        IF current_name IS NOT NULL THEN
            path_parts := array_prepend(current_name, path_parts);
        END IF;
    END LOOP;

    -- Join with " > "
    NEW.full_path := array_to_string(path_parts, ' > ');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update full_path
DROP TRIGGER IF EXISTS trigger_update_location_full_path ON locations;
CREATE TRIGGER trigger_update_location_full_path
    BEFORE INSERT OR UPDATE OF name, parent_id
    ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_location_full_path();

-- Function to update location counts
CREATE OR REPLACE FUNCTION update_location_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Decrement old location count
    IF OLD.location_id IS NOT NULL THEN
        UPDATE locations
        SET current_count = GREATEST(0, current_count - 1)
        WHERE id = OLD.location_id;
    END IF;

    -- Increment new location count
    IF NEW.location_id IS NOT NULL THEN
        UPDATE locations
        SET current_count = current_count + 1
        WHERE id = NEW.location_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update location counts when book location changes
DROP TRIGGER IF EXISTS trigger_update_location_counts ON books;
CREATE TRIGGER trigger_update_location_counts
    AFTER UPDATE OF location_id
    ON books
    FOR EACH ROW
    WHEN (OLD.location_id IS DISTINCT FROM NEW.location_id)
    EXECUTE FUNCTION update_location_counts();

-- Function to log location changes
CREATE OR REPLACE FUNCTION log_location_change()
RETURNS TRIGGER AS $$
DECLARE
    from_text TEXT;
    to_text TEXT;
BEGIN
    -- Get location names
    IF OLD.location_id IS NOT NULL THEN
        SELECT full_path INTO from_text FROM locations WHERE id = OLD.location_id;
        IF from_text IS NULL THEN
            from_text := OLD.shelf_location; -- Fallback to old text field
        END IF;
    ELSE
        from_text := OLD.shelf_location;
    END IF;

    IF NEW.location_id IS NOT NULL THEN
        SELECT full_path INTO to_text FROM locations WHERE id = NEW.location_id;
    END IF;

    -- Log the change
    IF from_text IS DISTINCT FROM to_text THEN
        INSERT INTO location_history (
            book_id,
            from_location_id,
            to_location_id,
            from_location_text,
            to_location_text,
            reason
        ) VALUES (
            NEW.id,
            OLD.location_id,
            NEW.location_id,
            from_text,
            to_text,
            'update'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log location changes
DROP TRIGGER IF EXISTS trigger_log_location_change ON books;
CREATE TRIGGER trigger_log_location_change
    AFTER UPDATE OF location_id, shelf_location
    ON books
    FOR EACH ROW
    WHEN (
        OLD.location_id IS DISTINCT FROM NEW.location_id OR
        OLD.shelf_location IS DISTINCT FROM NEW.shelf_location
    )
    EXECUTE FUNCTION log_location_change();

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Insert Sample Locations
-- =====================================================

-- Building
INSERT INTO locations (name, name_ar, code, location_type, capacity, description, description_ar) VALUES
('Main Library Building', 'مبنى المكتبة الرئيسية', 'MLB', 'building', 10000, 'Main library building for Ministry of Education', 'مبنى المكتبة الرئيسية لوزارة التربية والتعليم'),
('Archive Building', 'مبنى الأرشيف', 'ARB', 'building', 5000, 'Historical archives and special collections', 'الأرشيف التاريخي والمجموعات الخاصة')
ON CONFLICT (code) DO NOTHING;

-- Floors (for Main Library Building)
DO $$
DECLARE
    mlb_id UUID;
    arb_id UUID;
    floor1_id UUID;
    floor2_id UUID;
    section_ref_id UUID;
    section_fic_id UUID;
BEGIN
    -- Get building IDs
    SELECT id INTO mlb_id FROM locations WHERE code = 'MLB';
    SELECT id INTO arb_id FROM locations WHERE code = 'ARB';

    -- Insert Floors
    INSERT INTO locations (name, name_ar, code, location_type, parent_id, capacity, description, description_ar) VALUES
    ('Ground Floor', 'الطابق الأرضي', 'MLB-GF', 'floor', mlb_id, 3000, 'Reference and general collection', 'المراجع والمجموعة العامة'),
    ('First Floor', 'الطابق الأول', 'MLB-F1', 'floor', mlb_id, 3500, 'Fiction and literature', 'الخيال والأدب'),
    ('Second Floor', 'الطابق الثاني', 'MLB-F2', 'floor', mlb_id, 3500, 'Science and technology', 'العلوم والتكنولوجيا')
    ON CONFLICT (code) DO NOTHING
    RETURNING id INTO floor1_id;

    -- Get floor IDs
    SELECT id INTO floor1_id FROM locations WHERE code = 'MLB-GF';
    SELECT id INTO floor2_id FROM locations WHERE code = 'MLB-F1';

    -- Insert Sections
    INSERT INTO locations (name, name_ar, code, location_type, parent_id, capacity, description) VALUES
    ('Reference Section', 'قسم المراجع', 'MLB-GF-REF', 'section', floor1_id, 1000, 'Reference books and encyclopedias'),
    ('Periodicals Section', 'قسم الدوريات', 'MLB-GF-PER', 'section', floor1_id, 500, 'Magazines and journals'),
    ('Fiction Section', 'قسم الخيال', 'MLB-F1-FIC', 'section', floor2_id, 1500, 'Fiction and novels'),
    ('Non-Fiction Section', 'قسم غير الخيالي', 'MLB-F1-NF', 'section', floor2_id, 2000, 'Non-fiction books')
    ON CONFLICT (code) DO NOTHING
    RETURNING id INTO section_ref_id;

    -- Get section ID
    SELECT id INTO section_ref_id FROM locations WHERE code = 'MLB-GF-REF';

    -- Insert Sample Shelves
    INSERT INTO locations (name, name_ar, code, location_type, parent_id, capacity) VALUES
    ('Shelf A1', 'رف أ1', 'MLB-GF-REF-A1', 'shelf', section_ref_id, 50),
    ('Shelf A2', 'رف أ2', 'MLB-GF-REF-A2', 'shelf', section_ref_id, 50),
    ('Shelf B1', 'رف ب1', 'MLB-GF-REF-B1', 'shelf', section_ref_id, 50)
    ON CONFLICT (code) DO NOTHING;
END $$;

-- =====================================================
-- Comments for Documentation
-- =====================================================
COMMENT ON TABLE locations IS 'Hierarchical location management system for tracking physical item placement';
COMMENT ON TABLE location_history IS 'Audit trail of item movements between locations';

COMMENT ON COLUMN locations.code IS 'Unique location code for quick identification (e.g., B1-F2-S3-R4)';
COMMENT ON COLUMN locations.full_path IS 'Auto-generated full path showing complete hierarchy';
COMMENT ON COLUMN locations.current_count IS 'Number of items currently in this location';
COMMENT ON COLUMN locations.capacity IS 'Maximum number of items this location can hold';

-- =====================================================
-- Verification Query
-- =====================================================
-- SELECT
--     l.name,
--     l.code,
--     l.location_type,
--     l.full_path,
--     l.current_count,
--     l.capacity,
--     COUNT(b.id) as actual_book_count
-- FROM locations l
-- LEFT JOIN books b ON b.location_id = l.id
-- GROUP BY l.id, l.name, l.code, l.location_type, l.full_path, l.current_count, l.capacity
-- ORDER BY l.full_path;
