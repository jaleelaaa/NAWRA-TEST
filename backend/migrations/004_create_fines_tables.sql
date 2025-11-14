-- =====================================================
-- Migration: Fines Management System
-- Description: Track and manage overdue fines and payments
-- Phase: 3 - Enhanced Features (Day 14)
-- =====================================================

-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Fine Rules Table (Configurable fine calculation)
-- =====================================================
CREATE TABLE IF NOT EXISTS fine_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Rule Details
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    description TEXT,
    description_ar TEXT,

    -- Rule Type
    rule_type VARCHAR(50) NOT NULL CHECK (
        rule_type IN ('per_day', 'fixed', 'tiered', 'percentage')
    ),

    -- Calculation Parameters
    amount_per_day DECIMAL(10, 2), -- For per_day type
    fixed_amount DECIMAL(10, 2), -- For fixed type
    minimum_amount DECIMAL(10, 2) DEFAULT 0,
    maximum_amount DECIMAL(10, 2), -- NULL = no maximum

    -- Tiered Configuration (JSONB)
    -- Example: [{"days": 7, "amount": 1.00}, {"days": 14, "amount": 2.00}, {"days": 30, "amount": 5.00}]
    tiered_config JSONB DEFAULT '[]'::jsonb,

    -- Grace Period
    grace_period_days INTEGER DEFAULT 0, -- No fine for first N days

    -- Applicability
    applies_to_user_types TEXT[], -- e.g., ['patron', 'staff']
    applies_to_categories UUID[], -- Category IDs
    applies_to_material_types TEXT[], -- e.g., ['book', 'magazine', 'dvd']

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0, -- Higher priority rules apply first

    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fine rules
CREATE INDEX idx_fine_rules_active ON fine_rules(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_fine_rules_priority ON fine_rules(priority DESC);

-- =====================================================
-- Fines Table
-- =====================================================
CREATE TABLE IF NOT EXISTS fines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Associated Records
    circulation_id UUID REFERENCES circulation(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    book_id UUID REFERENCES books(id) ON DELETE SET NULL,

    -- Fine Details
    fine_type VARCHAR(50) NOT NULL CHECK (
        fine_type IN ('overdue', 'damage', 'lost', 'other')
    ),

    -- Amounts
    original_amount DECIMAL(10, 2) NOT NULL CHECK (original_amount >= 0),
    current_amount DECIMAL(10, 2) NOT NULL CHECK (current_amount >= 0),
    paid_amount DECIMAL(10, 2) DEFAULT 0 CHECK (paid_amount >= 0),
    waived_amount DECIMAL(10, 2) DEFAULT 0 CHECK (waived_amount >= 0),

    -- Calculation Details
    fine_rule_id UUID REFERENCES fine_rules(id) ON DELETE SET NULL,
    calculation_details JSONB DEFAULT '{}'::jsonb, -- Store how fine was calculated
    days_overdue INTEGER,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'partial', 'paid', 'waived', 'cancelled')
    ),

    -- Dates
    assessed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE, -- When fine should be paid
    paid_date DATE,
    waived_date DATE,

    -- Notes and Reasons
    notes TEXT,
    waiver_reason TEXT,
    waiver_approved_by UUID REFERENCES users(id),

    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fines
CREATE INDEX idx_fines_circulation ON fines(circulation_id) WHERE circulation_id IS NOT NULL;
CREATE INDEX idx_fines_user ON fines(user_id);
CREATE INDEX idx_fines_book ON fines(book_id) WHERE book_id IS NOT NULL;
CREATE INDEX idx_fines_status ON fines(status);
CREATE INDEX idx_fines_type ON fines(fine_type);
CREATE INDEX idx_fines_assessed_date ON fines(assessed_date DESC);
CREATE INDEX idx_fines_unpaid ON fines(user_id, status) WHERE status IN ('pending', 'partial');

-- =====================================================
-- Fine Payments Table
-- =====================================================
CREATE TABLE IF NOT EXISTS fine_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Payment Details
    fine_id UUID NOT NULL REFERENCES fines(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),

    -- Payment Method
    payment_method VARCHAR(50) NOT NULL CHECK (
        payment_method IN ('cash', 'card', 'bank_transfer', 'online', 'check', 'waiver')
    ),

    -- Transaction Details
    transaction_id VARCHAR(255), -- External transaction ID
    transaction_reference VARCHAR(255),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Payment Status
    payment_status VARCHAR(50) DEFAULT 'completed' CHECK (
        payment_status IN ('pending', 'completed', 'failed', 'refunded')
    ),

    -- Notes
    notes TEXT,
    receipt_number VARCHAR(100),

    -- Staff Processing
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Refund Information
    refund_amount DECIMAL(10, 2) DEFAULT 0,
    refund_date DATE,
    refund_reason TEXT,
    refunded_by UUID REFERENCES users(id),

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for payments
CREATE INDEX idx_fine_payments_fine ON fine_payments(fine_id);
CREATE INDEX idx_fine_payments_date ON fine_payments(transaction_date DESC);
CREATE INDEX idx_fine_payments_status ON fine_payments(payment_status);
CREATE INDEX idx_fine_payments_method ON fine_payments(payment_method);

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Function to update fine status based on payments
CREATE OR REPLACE FUNCTION update_fine_status()
RETURNS TRIGGER AS $$
DECLARE
    fine_record RECORD;
    total_paid DECIMAL(10, 2);
    total_waived DECIMAL(10, 2);
BEGIN
    -- Get fine details
    SELECT original_amount, current_amount, waived_amount
    INTO fine_record
    FROM fines
    WHERE id = NEW.fine_id;

    -- Calculate total paid for this fine
    SELECT COALESCE(SUM(amount), 0)
    INTO total_paid
    FROM fine_payments
    WHERE fine_id = NEW.fine_id
    AND payment_status = 'completed';

    -- Update fine amounts and status
    UPDATE fines
    SET
        paid_amount = total_paid,
        current_amount = GREATEST(0, original_amount - total_paid - COALESCE(waived_amount, 0)),
        status = CASE
            WHEN (original_amount - total_paid - COALESCE(waived_amount, 0)) <= 0 THEN 'paid'
            WHEN total_paid > 0 THEN 'partial'
            ELSE status
        END,
        paid_date = CASE
            WHEN (original_amount - total_paid - COALESCE(waived_amount, 0)) <= 0 THEN CURRENT_DATE
            ELSE paid_date
        END,
        updated_at = NOW()
    WHERE id = NEW.fine_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update fine status when payment is added
DROP TRIGGER IF EXISTS trigger_update_fine_status ON fine_payments;
CREATE TRIGGER trigger_update_fine_status
    AFTER INSERT OR UPDATE
    ON fine_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_fine_status();

-- Function to auto-calculate overdue fines
CREATE OR REPLACE FUNCTION calculate_overdue_fine(
    p_circulation_id UUID,
    p_days_overdue INTEGER
) RETURNS DECIMAL AS $$
DECLARE
    v_fine_amount DECIMAL(10, 2) := 0;
    v_book_id UUID;
    v_user_id UUID;
    v_user_type VARCHAR(20);
    v_category_id UUID;
    v_rule RECORD;
    v_tier JSONB;
BEGIN
    -- Get circulation details
    SELECT c.book_id, c.user_id, u.user_type, b.category_id
    INTO v_book_id, v_user_id, v_user_type, v_category_id
    FROM circulation c
    JOIN users u ON u.id = c.user_id
    LEFT JOIN books b ON b.id = c.book_id
    WHERE c.id = p_circulation_id;

    -- Find applicable rule (highest priority, most specific)
    SELECT *
    INTO v_rule
    FROM fine_rules
    WHERE is_active = TRUE
    AND rule_type = 'per_day'
    AND (
        applies_to_user_types IS NULL OR
        v_user_type = ANY(applies_to_user_types)
    )
    AND (
        applies_to_categories IS NULL OR
        v_category_id = ANY(applies_to_categories)
    )
    ORDER BY priority DESC, created_at DESC
    LIMIT 1;

    -- Calculate fine based on rule
    IF v_rule IS NOT NULL THEN
        -- Apply grace period
        IF p_days_overdue > COALESCE(v_rule.grace_period_days, 0) THEN
            v_fine_amount := (p_days_overdue - COALESCE(v_rule.grace_period_days, 0)) * COALESCE(v_rule.amount_per_day, 0);

            -- Apply minimum
            IF v_rule.minimum_amount IS NOT NULL THEN
                v_fine_amount := GREATEST(v_fine_amount, v_rule.minimum_amount);
            END IF;

            -- Apply maximum
            IF v_rule.maximum_amount IS NOT NULL THEN
                v_fine_amount := LEAST(v_fine_amount, v_rule.maximum_amount);
            END IF;
        END IF;
    ELSE
        -- Default: 0.50 per day
        v_fine_amount := p_days_overdue * 0.50;
    END IF;

    RETURN v_fine_amount;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_fines_updated_at ON fines;
CREATE TRIGGER update_fines_updated_at
    BEFORE UPDATE ON fines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fine_rules_updated_at ON fine_rules;
CREATE TRIGGER update_fine_rules_updated_at
    BEFORE UPDATE ON fine_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Insert Default Fine Rules
-- =====================================================
INSERT INTO fine_rules (
    name, name_ar, description, description_ar,
    rule_type, amount_per_day, minimum_amount, maximum_amount,
    grace_period_days, is_active, priority
) VALUES
(
    'Standard Overdue Fine',
    'غرامة التأخير القياسية',
    'Default fine for overdue books - 0.50 OMR per day',
    'غرامة افتراضية للكتب المتأخرة - 0.50 ريال عماني في اليوم',
    'per_day',
    0.50,
    1.00,
    20.00,
    2,
    TRUE,
    100
),
(
    'Patron Overdue Fine',
    'غرامة تأخير القراء',
    'Fine for patron users - 0.25 OMR per day with 3 day grace period',
    'غرامة لمستخدمي القراء - 0.25 ريال عماني في اليوم مع فترة سماح 3 أيام',
    'per_day',
    0.25,
    0.50,
    15.00,
    3,
    TRUE,
    90
),
(
    'Staff Overdue Fine',
    'غرامة تأخير الموظفين',
    'Reduced fine for staff members - 0.10 OMR per day',
    'غرامة مخفضة للموظفين - 0.10 ريال عماني في اليوم',
    'per_day',
    0.10,
    0.25,
    10.00,
    5,
    TRUE,
    80
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Comments for Documentation
-- =====================================================
COMMENT ON TABLE fine_rules IS 'Configurable rules for fine calculation';
COMMENT ON TABLE fines IS 'Individual fines assessed to users';
COMMENT ON TABLE fine_payments IS 'Payment records for fines';

COMMENT ON COLUMN fines.original_amount IS 'Original fine amount assessed';
COMMENT ON COLUMN fines.current_amount IS 'Remaining amount to be paid (original - paid - waived)';
COMMENT ON COLUMN fines.calculation_details IS 'JSONB with details: {rule_applied, days_overdue, rate, grace_period}';

-- =====================================================
-- Utility Views
-- =====================================================

-- View for unpaid fines summary
CREATE OR REPLACE VIEW v_unpaid_fines AS
SELECT
    f.id,
    f.user_id,
    u.full_name as user_name,
    u.email as user_email,
    f.book_id,
    b.title as book_title,
    f.fine_type,
    f.original_amount,
    f.current_amount,
    f.paid_amount,
    f.days_overdue,
    f.assessed_date,
    f.status,
    CURRENT_DATE - f.assessed_date as days_outstanding
FROM fines f
JOIN users u ON u.id = f.user_id
LEFT JOIN books b ON b.id = f.book_id
WHERE f.status IN ('pending', 'partial')
ORDER BY f.assessed_date;

COMMENT ON VIEW v_unpaid_fines IS 'Active unpaid or partially paid fines';

-- =====================================================
-- Verification Query
-- =====================================================
-- SELECT
--     (SELECT COUNT(*) FROM fine_rules WHERE is_active = TRUE) as active_rules,
--     (SELECT COUNT(*) FROM fines WHERE status IN ('pending', 'partial')) as unpaid_fines,
--     (SELECT COALESCE(SUM(current_amount), 0) FROM fines WHERE status IN ('pending', 'partial')) as total_outstanding;
