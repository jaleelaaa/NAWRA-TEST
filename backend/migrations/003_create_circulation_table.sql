-- =====================================================
-- Migration: Create Circulation Records Table
-- Description: Core table for tracking book loans and returns
-- =====================================================

-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Circulation Records Table
-- =====================================================
CREATE TABLE IF NOT EXISTS circulation_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- References
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,

    -- Dates
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE,

    -- Status and Condition
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'overdue', 'returned', 'reserved')
    ),
    book_condition VARCHAR(20) CHECK (
        book_condition IN ('good', 'fair', 'damaged')
    ),

    -- Fines
    fine_amount DECIMAL(10, 2) DEFAULT 0.00,
    fine_paid BOOLEAN DEFAULT FALSE,

    -- Additional Information
    notes TEXT,
    renewal_count INTEGER DEFAULT 0,

    -- Staff References
    issued_by UUID REFERENCES users(id) ON DELETE SET NULL,
    returned_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_dates CHECK (due_date >= issue_date),
    CONSTRAINT valid_return_date CHECK (return_date IS NULL OR return_date >= issue_date),
    CONSTRAINT valid_fine CHECK (fine_amount >= 0),
    CONSTRAINT valid_renewal_count CHECK (renewal_count >= 0)
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- User lookups (find all books borrowed by a user)
CREATE INDEX idx_circulation_user_id ON circulation_records(user_id);

-- Book lookups (find all loans for a book)
CREATE INDEX idx_circulation_book_id ON circulation_records(book_id);

-- Status filtering (active, overdue, returned)
CREATE INDEX idx_circulation_status ON circulation_records(status);

-- Due date sorting and overdue queries
CREATE INDEX idx_circulation_due_date ON circulation_records(due_date);

-- Return date filtering
CREATE INDEX idx_circulation_return_date ON circulation_records(return_date) WHERE return_date IS NOT NULL;

-- Combined index for common queries (user + status)
CREATE INDEX idx_circulation_user_status ON circulation_records(user_id, status);

-- Combined index for book availability queries (book + status)
CREATE INDEX idx_circulation_book_status ON circulation_records(book_id, status);

-- Fine tracking (unpaid fines)
CREATE INDEX idx_circulation_fines ON circulation_records(fine_paid, fine_amount) WHERE fine_amount > 0;

-- Date range queries (issue_date)
CREATE INDEX idx_circulation_issue_date ON circulation_records(issue_date DESC);

-- Staff audit (issued_by, returned_by)
CREATE INDEX idx_circulation_issued_by ON circulation_records(issued_by) WHERE issued_by IS NOT NULL;
CREATE INDEX idx_circulation_returned_by ON circulation_records(returned_by) WHERE returned_by IS NOT NULL;

-- =====================================================
-- Trigger for Updated At Timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_circulation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER circulation_updated_at
    BEFORE UPDATE ON circulation_records
    FOR EACH ROW
    EXECUTE FUNCTION update_circulation_updated_at();

-- =====================================================
-- Trigger to Auto-Update Book Available Quantity
-- =====================================================
CREATE OR REPLACE FUNCTION update_book_availability()
RETURNS TRIGGER AS $$
BEGIN
    -- When a book is issued (INSERT with status 'active')
    IF TG_OP = 'INSERT' AND NEW.status IN ('active', 'overdue') THEN
        UPDATE books
        SET available_quantity = available_quantity - 1
        WHERE id = NEW.book_id AND available_quantity > 0;

    -- When a book is returned (UPDATE to status 'returned')
    ELSIF TG_OP = 'UPDATE' AND OLD.status IN ('active', 'overdue') AND NEW.status = 'returned' THEN
        UPDATE books
        SET available_quantity = available_quantity + 1
        WHERE id = NEW.book_id;

    -- When a circulation record is deleted
    ELSIF TG_OP = 'DELETE' AND OLD.status IN ('active', 'overdue') THEN
        UPDATE books
        SET available_quantity = available_quantity + 1
        WHERE id = OLD.book_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_book_availability_on_circulation
    AFTER INSERT OR UPDATE OR DELETE ON circulation_records
    FOR EACH ROW
    EXECUTE FUNCTION update_book_availability();

-- =====================================================
-- Trigger to Auto-Update Status to Overdue
-- =====================================================
CREATE OR REPLACE FUNCTION check_overdue_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Automatically set status to overdue if past due date and still active
    IF NEW.status = 'active' AND NEW.due_date < CURRENT_DATE THEN
        NEW.status = 'overdue';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_overdue_status
    BEFORE INSERT OR UPDATE ON circulation_records
    FOR EACH ROW
    EXECUTE FUNCTION check_overdue_status();

-- =====================================================
-- Function to Calculate Fines
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_fine(
    p_circulation_id UUID
) RETURNS DECIMAL AS $$
DECLARE
    v_due_date DATE;
    v_return_date DATE;
    v_days_overdue INTEGER;
    v_fine_amount DECIMAL(10,2);
    v_fine_per_day DECIMAL(10,2) := 0.50; -- 0.50 OMR per day
    v_max_fine DECIMAL(10,2) := 50.00; -- Maximum 50 OMR
BEGIN
    -- Get circulation record details
    SELECT due_date, COALESCE(return_date, CURRENT_DATE)
    INTO v_due_date, v_return_date
    FROM circulation_records
    WHERE id = p_circulation_id;

    -- Calculate days overdue
    v_days_overdue := GREATEST(0, v_return_date - v_due_date);

    -- Calculate fine (capped at maximum)
    v_fine_amount := LEAST(v_days_overdue * v_fine_per_day, v_max_fine);

    RETURN v_fine_amount;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- View for Active Circulation with Details
-- =====================================================
CREATE OR REPLACE VIEW v_active_circulation AS
SELECT
    cr.id,
    cr.user_id,
    u.full_name AS user_name,
    u.email AS user_email,
    r.name AS user_role,
    cr.book_id,
    b.title AS book_title,
    b.title_ar AS book_title_ar,
    b.isbn AS book_isbn,
    b.author AS book_author,
    cat.name AS category,
    b.shelf_location,
    cr.issue_date,
    cr.due_date,
    cr.return_date,
    cr.status,
    cr.book_condition,
    cr.fine_amount,
    cr.fine_paid,
    cr.renewal_count,
    cr.notes,
    CURRENT_DATE - cr.due_date AS days_overdue,
    cr.created_at,
    cr.updated_at
FROM circulation_records cr
JOIN users u ON cr.user_id = u.id
LEFT JOIN roles r ON u.role_id = r.id
JOIN books b ON cr.book_id = b.id
LEFT JOIN categories cat ON b.category_id = cat.id
WHERE cr.status IN ('active', 'overdue');

-- =====================================================
-- Comments
-- =====================================================
COMMENT ON TABLE circulation_records IS 'Tracks book loans, returns, and circulation history';
COMMENT ON COLUMN circulation_records.status IS 'Current status: active, overdue, returned, reserved';
COMMENT ON COLUMN circulation_records.book_condition IS 'Condition when returned: good, fair, damaged';
COMMENT ON COLUMN circulation_records.fine_amount IS 'Fine amount in OMR (0.50/day, max 50.00)';
COMMENT ON COLUMN circulation_records.renewal_count IS 'Number of times this loan has been renewed';
COMMENT ON COLUMN circulation_records.issued_by IS 'Staff member who issued the book';
COMMENT ON COLUMN circulation_records.returned_by IS 'Staff member who processed the return';

COMMENT ON FUNCTION calculate_fine(UUID) IS 'Calculate fine for a circulation record (0.50 OMR/day, max 50 OMR)';
COMMENT ON VIEW v_active_circulation IS 'Active and overdue loans with full user and book details';

-- =====================================================
-- Grant Permissions
-- =====================================================
-- Grant appropriate permissions to application role
-- GRANT SELECT, INSERT, UPDATE, DELETE ON circulation_records TO app_role;
-- GRANT SELECT ON v_active_circulation TO app_role;

-- =====================================================
-- Insert Sample Data (Optional - for testing)
-- =====================================================
-- Uncomment to insert sample data after users and books exist

/*
-- Sample: Issue a book (status will auto-set to active or overdue based on dates)
INSERT INTO circulation_records (user_id, book_id, issue_date, due_date, issued_by)
SELECT
    u.id AS user_id,
    b.id AS book_id,
    CURRENT_DATE - 10 AS issue_date,
    CURRENT_DATE + 4 AS due_date,
    u.id AS issued_by
FROM users u
CROSS JOIN books b
WHERE u.email = 'admin@nawra.om'
  AND b.isbn LIKE '%978%'
LIMIT 1;
*/

-- =====================================================
-- Migration Complete
-- =====================================================
