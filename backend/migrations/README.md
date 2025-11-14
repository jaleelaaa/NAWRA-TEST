# NAWRA Library Management System - Database Migrations

This directory contains SQL migration scripts for the NAWRA Library Management System database.

## Overview

The NAWRA system uses PostgreSQL 15+ (via Supabase) as its database. These migration files set up the complete database schema including tables, indexes, functions, and triggers.

## Migration Files

Execute these migrations in order:

### 1. `001_initial_schema.sql` - Core System Tables
**Purpose:** Initial database setup with core tables for authentication and user management.

**Tables Created:**
- `roles` - Role definitions with JSONB permissions
- `users` - User accounts with role assignments
- `refresh_tokens` - JWT refresh token management
- `audit_logs` - Activity tracking (table structure only)

**Key Features:**
- UUID primary keys
- Role-based access control (RBAC) with 5 predefined roles
- JWT token management with automatic cleanup
- Timestamp triggers for updated_at fields

---

### 2. `002_create_books_tables.sql` - Catalog Management
**Purpose:** Library catalog and categorization system.

**Tables Created:**
- `categories` - Hierarchical category structure with Dewey Decimal support
- `books` - Main catalog with comprehensive metadata
- `user_settings` - User preferences and notification settings

**Key Features:**
- Bilingual fields (English/Arabic) for titles, descriptions, etc.
- Full-text search support (pg_trgm extension)
- Status management (available, checked_out, reserved, etc.)
- Inventory tracking (quantity, available_quantity)
- Acquisition metadata (date, method, price, vendor)

---

### 3. `create_user_settings_table.sql` - User Preferences
**Purpose:** Individual user settings and notification preferences.

**Tables Created:**
- `user_settings` - User-specific configuration

**Key Features:**
- Language preference (en/ar)
- Notification preferences (email, SMS, push)
- Display preferences (items per page, date format)

---

### 4. `004_create_preservation_table.sql` - **Phase 2: Preservation Records**
**Purpose:** Track artifact condition and conservation history.

**Tables Created:**
- `preservation_records` - Complete preservation tracking

**Key Features:**
- Condition assessment (excellent → critical)
- Conservation history (JSONB array)
- Restoration tracking with priority levels
- Inspection scheduling (monthly/quarterly/yearly)
- Environmental monitoring (temperature, humidity, light)
- Damage documentation with photo URLs
- **Database Function:** `get_preservation_by_condition()` - Statistics aggregation

**Indexes:**
- `idx_preservation_book_id` - Book lookups
- `idx_preservation_status` - Condition filtering
- `idx_preservation_restoration` - Restoration queries
- `idx_preservation_next_inspection` - Inspection scheduling

---

### 5. `005_add_barcode_fields.sql` - **Phase 2: Barcode System**
**Purpose:** Barcode generation and management.

**Tables Created:**
- `barcode_settings` - Global barcode configuration
- `barcode_history` - Audit trail for barcode changes

**Key Features:**
- Multiple barcode formats (CODE128, CODE39, EAN13, QR)
- Auto-generation with configurable prefix/sequence
- Unique barcode constraint
- Change history tracking
- **Database Function:** `generate_next_barcode()` - Sequential generation
- **Database Function:** `validate_barcode()` - Format validation

**Indexes:**
- `idx_books_barcode` - Fast barcode lookups
- `unique_book_barcode` - Ensures uniqueness

---

### 6. `006_enhance_audit_logs.sql` - **Phase 2: Enhanced Audit Logging**
**Purpose:** Comprehensive activity tracking and compliance.

**Tables Enhanced:**
- `audit_logs` - Full audit trail with detailed tracking

**Key Features:**
- Track 12+ action types (CREATE, UPDATE, DELETE, LOGIN, etc.)
- Before/after change tracking (JSONB)
- IP address and user agent logging
- Request method and path tracking
- **Database Function:** `log_activity()` - Simplified logging
- **Database Function:** `get_activity_summary()` - Statistics
- **Database Function:** `get_user_activity()` - User reports

**Indexes:**
- `idx_audit_logs_user_id` - User-based queries
- `idx_audit_logs_action` - Action filtering
- `idx_audit_logs_entity_type` - Entity filtering
- `idx_audit_logs_created_at` - Chronological queries
- Composite indexes for common query patterns

---

## Running Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Log into your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the migration file content
5. Click **Run** to execute
6. Verify success in the **Table Editor**

### Option 2: psql Command Line

```bash
# Connect to your database
psql "postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"

# Run migrations in order
\i 001_initial_schema.sql
\i 002_create_books_tables.sql
\i create_user_settings_table.sql
\i 004_create_preservation_table.sql
\i 005_add_barcode_fields.sql
\i 006_enhance_audit_logs.sql
```

### Option 3: Supabase CLI

```bash
# Link your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

---

## Verification

After running migrations, verify the database setup:

```sql
-- Check all tables are created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check functions
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Check triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

---

## Important Notes

### Required PostgreSQL Extensions

The following extensions must be enabled:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- Full-text search (optional but recommended)
```

These are included in the migration files but may need manual enablement on some PostgreSQL installations.

### Database User Permissions

The database user must have the following permissions:
- `CREATE` on the database
- `CREATE` on schema public
- `EXECUTE` on functions
- `TRIGGER` on tables

### Data Retention

- **audit_logs**: Consider implementing a retention policy (e.g., 1 year)
- **refresh_tokens**: Automatically cleaned up by triggers after expiration
- **barcode_history**: Permanent retention recommended for compliance

### Performance Considerations

- All foreign key columns are indexed
- Timestamp columns used in queries are indexed
- JSONB columns use GIN indexes where appropriate
- Regular `VACUUM ANALYZE` recommended for optimal performance

---

## Rollback Strategy

If you need to rollback a migration:

```sql
-- Rollback example for preservation table
DROP TABLE IF EXISTS preservation_records CASCADE;
DROP FUNCTION IF EXISTS get_preservation_by_condition();
DROP TRIGGER IF EXISTS trigger_update_preservation_timestamp ON preservation_records;
```

**⚠️ Warning:** Rolling back will delete all data in the affected tables. Always backup before rolling back.

---

## Development vs. Production

### Development
- Run migrations on local Supabase instance or development database
- Test with sample data before production deployment

### Production
1. **Backup** the production database first
2. Test migrations on a staging environment
3. Schedule during maintenance window
4. Run migrations in a transaction where possible
5. Verify data integrity after migration
6. Monitor application logs for errors

---

## Troubleshooting

### Common Issues

**Issue:** "relation already exists"
```sql
-- Check if table exists before creating
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'your_table_name'
);
```

**Issue:** "function already exists"
```sql
-- Use CREATE OR REPLACE FUNCTION instead of CREATE FUNCTION
```

**Issue:** "permission denied"
```sql
-- Grant necessary permissions
GRANT ALL ON SCHEMA public TO your_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO your_user;
```

---

## Support

For migration issues or questions:
1. Check the `COMPLETE_IMPLEMENTATION_PLAN_WITH_ALL_REQUIREMENTS.md` document
2. Review the main project README.md
3. Consult the Supabase documentation: https://supabase.com/docs

---

## Migration History

| Migration | Date | Description | Status |
|-----------|------|-------------|--------|
| 001 | Initial | Core system tables | ✅ Complete |
| 002 | Initial | Books and categories | ✅ Complete |
| user_settings | Initial | User preferences | ✅ Complete |
| 004 | 2025-11-14 | Preservation records | ✅ Phase 2 |
| 005 | 2025-11-14 | Barcode system | ✅ Phase 2 |
| 006 | 2025-11-14 | Enhanced audit logs | ✅ Phase 2 |

**Current System Completion:** 90-100%
**Database Schema Version:** 2.0

---

## Future Migrations (Planned)

Potential future enhancements:
- Enhanced location management (detailed hierarchy)
- Fines management system
- Mobile app optimizations
- Advanced analytics tables
- Report generation templates

---

Last Updated: 2025-11-14
