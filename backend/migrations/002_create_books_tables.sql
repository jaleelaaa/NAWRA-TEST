-- =====================================================
-- Migration: Create Books and Categories Tables
-- Description: Core tables for library catalog management
-- =====================================================

-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Categories Table
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    dewey_decimal VARCHAR(20),
    description TEXT,
    description_ar TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT unique_category_name UNIQUE (name),
    CONSTRAINT unique_dewey_decimal UNIQUE (dewey_decimal)
);

-- Index for category lookups
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_dewey ON categories(dewey_decimal) WHERE dewey_decimal IS NOT NULL;
CREATE INDEX idx_categories_parent ON categories(parent_id) WHERE parent_id IS NOT NULL;

-- =====================================================
-- Books Table
-- =====================================================
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Identifiers
    isbn VARCHAR(20),
    barcode VARCHAR(50),

    -- Basic Information
    title VARCHAR(500) NOT NULL,
    title_ar VARCHAR(500),
    subtitle VARCHAR(500),
    subtitle_ar VARCHAR(500),

    -- Author Information
    author VARCHAR(255) NOT NULL,
    author_ar VARCHAR(255),
    co_authors TEXT,
    co_authors_ar TEXT,

    -- Publication Details
    publisher VARCHAR(255),
    publisher_ar VARCHAR(255),
    publication_year INTEGER,
    publication_place VARCHAR(255),
    edition VARCHAR(100),

    -- Classification
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    dewey_decimal VARCHAR(20),

    -- Physical Description
    language VARCHAR(10) DEFAULT 'en',
    pages INTEGER,
    dimensions VARCHAR(50),
    binding_type VARCHAR(50),

    -- Content Description
    description TEXT,
    description_ar TEXT,
    table_of_contents TEXT,
    table_of_contents_ar TEXT,
    subjects TEXT,
    subjects_ar TEXT,
    keywords TEXT,

    -- Media
    cover_image_url VARCHAR(500),
    thumbnail_url VARCHAR(500),

    -- Inventory Management
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    available_quantity INTEGER NOT NULL DEFAULT 1 CHECK (available_quantity >= 0),
    shelf_location VARCHAR(100),

    -- Acquisition Information
    acquisition_date DATE,
    acquisition_method VARCHAR(50),
    price DECIMAL(10, 2),
    vendor VARCHAR(255),

    -- Status Management
    status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (
        status IN (
            'available',
            'checked_out',
            'reserved',
            'processing',
            'damaged',
            'lost',
            'withdrawn',
            'on_order',
            'in_repair'
        )
    ),

    -- Additional Metadata
    notes TEXT,
    notes_ar TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT unique_isbn UNIQUE (isbn),
    CONSTRAINT unique_barcode UNIQUE (barcode),
    CONSTRAINT check_available_quantity CHECK (available_quantity <= quantity)
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Primary search fields
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_title_ar ON books(title_ar) WHERE title_ar IS NOT NULL;
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_author_ar ON books(author_ar) WHERE author_ar IS NOT NULL;

-- Lookup fields
CREATE INDEX idx_books_isbn ON books(isbn) WHERE isbn IS NOT NULL;
CREATE INDEX idx_books_barcode ON books(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_books_category ON books(category_id) WHERE category_id IS NOT NULL;
CREATE INDEX idx_books_status ON books(status);

-- Filter fields
CREATE INDEX idx_books_language ON books(language);
CREATE INDEX idx_books_publication_year ON books(publication_year) WHERE publication_year IS NOT NULL;
CREATE INDEX idx_books_acquisition_date ON books(acquisition_date) WHERE acquisition_date IS NOT NULL;

-- Full-text search indexes
CREATE INDEX idx_books_title_trgm ON books USING gin(title gin_trgm_ops);
CREATE INDEX idx_books_author_trgm ON books USING gin(author gin_trgm_ops);

-- Composite indexes for common queries
CREATE INDEX idx_books_category_status ON books(category_id, status);
CREATE INDEX idx_books_status_available ON books(status, available_quantity) WHERE status = 'available';

-- =====================================================
-- Triggers for Updated At
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for categories
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for books
CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Insert Default Categories
-- =====================================================

INSERT INTO categories (name, name_ar, dewey_decimal, description, description_ar) VALUES
    ('General Works', 'أعمال عامة', '000', 'Computer science, information, and general works', 'علوم الحاسوب والمعلومات والأعمال العامة'),
    ('Philosophy & Psychology', 'الفلسفة وعلم النفس', '100', 'Philosophy and psychology', 'الفلسفة وعلم النفس'),
    ('Religion', 'الأديان', '200', 'Religion and theology', 'الدين واللاهوت'),
    ('Social Sciences', 'العلوم الاجتماعية', '300', 'Social sciences, sociology, and anthropology', 'العلوم الاجتماعية وعلم الاجتماع والأنثروبولوجيا'),
    ('Language', 'اللغات', '400', 'Language and linguistics', 'اللغة واللسانيات'),
    ('Science', 'العلوم', '500', 'Pure sciences', 'العلوم البحتة'),
    ('Technology', 'التكنولوجيا', '600', 'Technology and applied sciences', 'التكنولوجيا والعلوم التطبيقية'),
    ('Arts & Recreation', 'الفنون والترفيه', '700', 'Arts, recreation, and entertainment', 'الفنون والترفيه والتسلية'),
    ('Literature', 'الأدب', '800', 'Literature and rhetoric', 'الأدب والبلاغة'),
    ('History & Geography', 'التاريخ والجغرافيا', '900', 'History, geography, and biography', 'التاريخ والجغرافيا والسيرة الذاتية')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE categories IS 'Library catalog categories based on Dewey Decimal Classification';
COMMENT ON TABLE books IS 'Main books catalog table with bilingual support';

COMMENT ON COLUMN books.isbn IS 'International Standard Book Number';
COMMENT ON COLUMN books.barcode IS 'Library barcode for physical identification';
COMMENT ON COLUMN books.quantity IS 'Total number of copies owned by library';
COMMENT ON COLUMN books.available_quantity IS 'Number of copies currently available for checkout';
COMMENT ON COLUMN books.status IS 'Current status of the book in the library system';

-- =====================================================
-- Verification Query
-- =====================================================

-- Run this to verify the tables were created successfully
-- SELECT
--     table_name,
--     (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
-- FROM information_schema.tables t
-- WHERE table_schema = 'public'
-- AND table_name IN ('categories', 'books');
