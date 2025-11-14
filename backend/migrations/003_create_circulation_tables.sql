-- =====================================================
-- Migration: Create Circulation System Tables
-- Description: Complete circulation management with loans, reservations, fines, and notifications
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- 1. CIRCULATION RECORDS (Loans/Borrowing)
-- =====================================================
CREATE TABLE IF NOT EXISTS circulation_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- References
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,

    -- Dates
    issue_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    return_date TIMESTAMP WITH TIME ZONE,
    renewal_date TIMESTAMP WITH TIME ZONE,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'returned', 'overdue', 'lost', 'damaged')
    ),

    -- Book condition tracking
    issue_condition VARCHAR(20) DEFAULT 'good' CHECK (
        issue_condition IN ('excellent', 'good', 'fair', 'poor', 'damaged')
    ),
    return_condition VARCHAR(20) CHECK (
        return_condition IN ('excellent', 'good', 'fair', 'poor', 'damaged')
    ),

    -- Fine/Fee management
    fine_amount DECIMAL(10, 2) DEFAULT 0.00 CHECK (fine_amount >= 0),
    fine_paid BOOLEAN DEFAULT FALSE,
    fine_waived BOOLEAN DEFAULT FALSE,
    fine_waived_by UUID REFERENCES users(id) ON DELETE SET NULL,
    fine_waived_reason TEXT,

    -- Renewal tracking
    renewal_count INTEGER DEFAULT 0 CHECK (renewal_count >= 0),
    max_renewals INTEGER DEFAULT 3,

    -- Staff tracking
    issued_by UUID REFERENCES users(id) ON DELETE SET NULL,
    returned_to UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Notes
    notes TEXT,
    notes_ar TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT check_dates CHECK (due_date > issue_date),
    CONSTRAINT check_return_after_issue CHECK (return_date IS NULL OR return_date >= issue_date)
);

-- Indexes for circulation_records
CREATE INDEX idx_circulation_user_id ON circulation_records(user_id);
CREATE INDEX idx_circulation_book_id ON circulation_records(book_id);
CREATE INDEX idx_circulation_status ON circulation_records(status);
CREATE INDEX idx_circulation_issue_date ON circulation_records(issue_date DESC);
CREATE INDEX idx_circulation_due_date ON circulation_records(due_date);
CREATE INDEX idx_circulation_return_date ON circulation_records(return_date);
CREATE INDEX idx_circulation_overdue ON circulation_records(due_date, status)
    WHERE status = 'active' AND return_date IS NULL;
CREATE INDEX idx_circulation_active_loans ON circulation_records(user_id, status)
    WHERE status = 'active';

-- =====================================================
-- 2. RESERVATIONS (Holds)
-- =====================================================
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- References
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,

    -- Reservation details
    reservation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_sent_at TIMESTAMP WITH TIME ZONE,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'available', 'fulfilled', 'cancelled', 'expired')
    ),

    -- Fulfillment tracking
    fulfilled_date TIMESTAMP WITH TIME ZONE,
    fulfilled_by UUID REFERENCES users(id) ON DELETE SET NULL,
    circulation_record_id UUID REFERENCES circulation_records(id) ON DELETE SET NULL,

    -- Cancellation tracking
    cancelled_date TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID REFERENCES users(id) ON DELETE SET NULL,
    cancellation_reason TEXT,

    -- Priority & Queue
    priority INTEGER DEFAULT 0,
    queue_position INTEGER,

    -- Pickup location
    pickup_location VARCHAR(255),

    -- Notes
    notes TEXT,
    notes_ar TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT check_expiry_after_reservation CHECK (expiry_date > reservation_date)
);

-- Indexes for reservations
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_book_id ON reservations(book_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_date ON reservations(reservation_date DESC);
CREATE INDEX idx_reservations_expiry ON reservations(expiry_date);
CREATE INDEX idx_reservations_queue ON reservations(book_id, queue_position)
    WHERE status = 'pending';
CREATE INDEX idx_reservations_pending ON reservations(status, user_id)
    WHERE status = 'pending';

-- =====================================================
-- 3. FINES (Financial Transactions)
-- =====================================================
CREATE TABLE IF NOT EXISTS fines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- References
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    circulation_record_id UUID REFERENCES circulation_records(id) ON DELETE SET NULL,

    -- Fine details
    fine_type VARCHAR(50) NOT NULL CHECK (
        fine_type IN ('overdue', 'lost_book', 'damaged_book', 'late_return', 'other')
    ),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) DEFAULT 'OMR',

    -- Payment status
    status VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (
        status IN ('unpaid', 'paid', 'partially_paid', 'waived', 'cancelled')
    ),
    amount_paid DECIMAL(10, 2) DEFAULT 0.00 CHECK (amount_paid >= 0),
    balance DECIMAL(10, 2) GENERATED ALWAYS AS (amount - amount_paid) STORED,

    -- Payment tracking
    payment_date TIMESTAMP WITH TIME ZONE,
    payment_method VARCHAR(50) CHECK (
        payment_method IN ('cash', 'card', 'bank_transfer', 'online', 'other')
    ),
    payment_reference VARCHAR(255),
    payment_received_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Waiver tracking
    waived BOOLEAN DEFAULT FALSE,
    waived_date TIMESTAMP WITH TIME ZONE,
    waived_by UUID REFERENCES users(id) ON DELETE SET NULL,
    waiver_reason TEXT,
    waiver_reason_ar TEXT,

    -- Calculation details
    calculation_basis JSONB DEFAULT '{}'::jsonb,
    days_overdue INTEGER,
    rate_per_day DECIMAL(10, 2),

    -- Description
    description TEXT,
    description_ar TEXT,

    -- Notes
    notes TEXT,
    notes_ar TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT check_amount_paid_not_exceed CHECK (amount_paid <= amount)
);

-- Indexes for fines
CREATE INDEX idx_fines_user_id ON fines(user_id);
CREATE INDEX idx_fines_circulation_id ON fines(circulation_record_id);
CREATE INDEX idx_fines_status ON fines(status);
CREATE INDEX idx_fines_type ON fines(fine_type);
CREATE INDEX idx_fines_unpaid ON fines(user_id, status) WHERE status = 'unpaid';
CREATE INDEX idx_fines_created ON fines(created_at DESC);

-- =====================================================
-- 4. NOTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Recipient
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Notification details
    type VARCHAR(50) NOT NULL CHECK (
        type IN (
            'due_soon', 'overdue', 'reservation_ready', 'reservation_expired',
            'fine_added', 'fine_reminder', 'account_suspended', 'book_recalled',
            'renewal_success', 'renewal_failed', 'system_announcement', 'other'
        )
    ),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (
        priority IN ('low', 'normal', 'high', 'urgent')
    ),

    -- Content (bilingual)
    title VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255),
    message TEXT NOT NULL,
    message_ar TEXT,

    -- Related entities
    related_type VARCHAR(50) CHECK (
        related_type IN ('book', 'circulation', 'reservation', 'fine', 'user', 'system')
    ),
    related_id UUID,

    -- Delivery channels
    channels JSONB DEFAULT '["in_app"]'::jsonb,
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    sms_sent BOOLEAN DEFAULT FALSE,
    sms_sent_at TIMESTAMP WITH TIME ZONE,

    -- Status
    status VARCHAR(20) DEFAULT 'unread' CHECK (
        status IN ('unread', 'read', 'archived', 'deleted')
    ),
    read_at TIMESTAMP WITH TIME ZONE,

    -- Action link
    action_url VARCHAR(500),
    action_label VARCHAR(100),
    action_label_ar VARCHAR(100),

    -- Expiry
    expires_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, status)
    WHERE status = 'unread';
CREATE INDEX idx_notifications_priority ON notifications(priority, created_at DESC)
    WHERE status = 'unread';

-- =====================================================
-- 5. BOOK COPIES (Individual Physical Copies)
-- =====================================================
CREATE TABLE IF NOT EXISTS book_copies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Reference to parent book
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,

    -- Unique identifiers
    copy_number INTEGER NOT NULL,
    barcode VARCHAR(50) UNIQUE,
    rfid_tag VARCHAR(50) UNIQUE,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (
        status IN (
            'available', 'checked_out', 'reserved', 'processing',
            'damaged', 'lost', 'withdrawn', 'in_repair', 'missing'
        )
    ),

    -- Condition
    condition VARCHAR(20) DEFAULT 'good' CHECK (
        condition IN ('excellent', 'good', 'fair', 'poor', 'damaged')
    ),

    -- Location
    location VARCHAR(100),
    shelf_location VARCHAR(100),

    -- Acquisition
    acquisition_date DATE,
    acquisition_cost DECIMAL(10, 2),
    vendor VARCHAR(255),

    -- Circulation stats
    circulation_count INTEGER DEFAULT 0,
    last_circulated_at TIMESTAMP WITH TIME ZONE,
    current_circulation_id UUID REFERENCES circulation_records(id) ON DELETE SET NULL,

    -- Notes
    notes TEXT,
    notes_ar TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT unique_book_copy_number UNIQUE (book_id, copy_number)
);

-- Indexes for book_copies
CREATE INDEX idx_book_copies_book_id ON book_copies(book_id);
CREATE INDEX idx_book_copies_barcode ON book_copies(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_book_copies_status ON book_copies(status);
CREATE INDEX idx_book_copies_available ON book_copies(book_id, status)
    WHERE status = 'available';

-- =====================================================
-- 6. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Circulation records trigger
CREATE TRIGGER update_circulation_records_updated_at
    BEFORE UPDATE ON circulation_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Reservations trigger
CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Fines trigger
CREATE TRIGGER update_fines_updated_at
    BEFORE UPDATE ON fines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Notifications trigger
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Book copies trigger
CREATE TRIGGER update_book_copies_updated_at
    BEFORE UPDATE ON book_copies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. AUTOMATIC FINE CALCULATION TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_overdue_fine()
RETURNS TRIGGER AS $$
DECLARE
    days_overdue INTEGER;
    fine_per_day DECIMAL(10, 2) := 0.50; -- 0.50 OMR per day
    calculated_fine DECIMAL(10, 2);
BEGIN
    -- Only calculate if status changed to overdue
    IF NEW.status = 'overdue' AND (OLD.status IS NULL OR OLD.status != 'overdue') THEN
        days_overdue := EXTRACT(DAY FROM (NOW() - NEW.due_date));

        IF days_overdue > 0 THEN
            calculated_fine := days_overdue * fine_per_day;

            -- Insert fine record
            INSERT INTO fines (
                user_id,
                circulation_record_id,
                fine_type,
                amount,
                days_overdue,
                rate_per_day,
                description,
                description_ar,
                calculation_basis
            ) VALUES (
                NEW.user_id,
                NEW.id,
                'overdue',
                calculated_fine,
                days_overdue,
                fine_per_day,
                'Overdue fine for ' || days_overdue || ' days',
                'غرامة تأخير لمدة ' || days_overdue || ' أيام',
                jsonb_build_object(
                    'days_overdue', days_overdue,
                    'rate_per_day', fine_per_day,
                    'due_date', NEW.due_date,
                    'calculated_at', NOW()
                )
            );

            -- Update circulation record with fine amount
            NEW.fine_amount := calculated_fine;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_overdue_fine
    BEFORE UPDATE ON circulation_records
    FOR EACH ROW
    EXECUTE FUNCTION calculate_overdue_fine();

-- =====================================================
-- 8. RESERVATION QUEUE MANAGEMENT
-- =====================================================

CREATE OR REPLACE FUNCTION update_reservation_queue()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate queue positions for the book
    WITH ranked_reservations AS (
        SELECT
            id,
            ROW_NUMBER() OVER (
                ORDER BY priority DESC, reservation_date ASC
            ) as new_position
        FROM reservations
        WHERE book_id = COALESCE(NEW.book_id, OLD.book_id)
            AND status = 'pending'
    )
    UPDATE reservations r
    SET queue_position = rr.new_position
    FROM ranked_reservations rr
    WHERE r.id = rr.id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reservation_queue
    AFTER INSERT OR UPDATE OR DELETE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_reservation_queue();

-- =====================================================
-- 9. BOOK AVAILABILITY TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_book_availability()
RETURNS TRIGGER AS $$
DECLARE
    total_copies INTEGER;
    available_copies INTEGER;
BEGIN
    -- Count total and available copies
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'available')
    INTO total_copies, available_copies
    FROM book_copies
    WHERE book_id = COALESCE(NEW.book_id, OLD.book_id);

    -- Update books table
    UPDATE books
    SET
        quantity = COALESCE(total_copies, 0),
        available_quantity = COALESCE(available_copies, 0),
        status = CASE
            WHEN COALESCE(available_copies, 0) > 0 THEN 'available'
            WHEN COALESCE(total_copies, 0) = 0 THEN 'withdrawn'
            ELSE 'checked_out'
        END
    WHERE id = COALESCE(NEW.book_id, OLD.book_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_book_availability
    AFTER INSERT OR UPDATE OR DELETE ON book_copies
    FOR EACH ROW
    EXECUTE FUNCTION update_book_availability();

-- =====================================================
-- 10. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE circulation_records IS 'Tracks all book loans/borrowing with complete circulation history';
COMMENT ON TABLE reservations IS 'Manages book reservations/holds with queue system';
COMMENT ON TABLE fines IS 'Financial transactions including fines, fees, and payments';
COMMENT ON TABLE notifications IS 'User notifications with multi-channel delivery support';
COMMENT ON TABLE book_copies IS 'Individual physical copies of books for granular tracking';

COMMENT ON COLUMN circulation_records.status IS 'Current status: active, returned, overdue, lost, damaged';
COMMENT ON COLUMN reservations.queue_position IS 'Position in reservation queue, automatically managed';
COMMENT ON COLUMN fines.balance IS 'Calculated field: amount - amount_paid';
COMMENT ON COLUMN notifications.channels IS 'JSON array of delivery channels: in_app, email, sms';

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Uncomment to verify table creation:
-- SELECT
--     table_name,
--     (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
-- FROM information_schema.tables t
-- WHERE table_schema = 'public'
-- AND table_name IN ('circulation_records', 'reservations', 'fines', 'notifications', 'book_copies')
-- ORDER BY table_name;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
