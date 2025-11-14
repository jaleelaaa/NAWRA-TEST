# NAWRA Library Management System
## Comprehensive Bilingual Integration Analysis & Implementation Plan

**Document Version:** 1.0
**Last Updated:** 2025-11-14
**Analysis Date:** 2025-11-14
**System:** NAWRA (Bilingual Library Management System - Arabic/English)

---

## Executive Summary

The NAWRA Library Management System is **70% complete** with excellent bilingual infrastructure (Arabic/English) and RTL support. The system has:

- ✅ **Complete:** Authentication, Dashboard, User Management, Reports, Settings
- ⚠️ **Partial:** Books Catalog, Circulation (UI exists, using mock data)
- ❌ **Missing:** Backend integration for Books & Circulation modules

This document provides a **complete roadmap** for finishing the bilingual integration.

---

## Table of Contents

1. [Current System Status](#current-system-status)
2. [Bilingual Support Analysis](#bilingual-support-analysis)
3. [Missing Backend Integrations (Critical)](#missing-backend-integrations-critical)
4. [Missing UI Components](#missing-ui-components)
5. [Sequential Implementation Plan](#sequential-implementation-plan)
6. [Detailed Integration Specifications](#detailed-integration-specifications)
7. [Testing Checklist](#testing-checklist)
8. [Future Enhancements](#future-enhancements)

---

## Current System Status

### ✅ Fully Integrated Modules (UI + Backend + Bilingual)

| Module | Frontend Page | Backend Endpoint | Bilingual | RTL | Status |
|--------|--------------|------------------|-----------|-----|--------|
| **Authentication** | `/login` | `/auth/login`, `/auth/logout` | ✅ | ✅ | 100% Complete |
| **Dashboard** | `/dashboard` | `/dashboard/stats` | ✅ | ✅ | 100% Complete |
| **User Management** | `/admin/users` | `/users/*` (8 endpoints) | ✅ | ✅ | 100% Complete |
| **Reports & Analytics** | `/admin/reports` | `/reports/*` (9 endpoints) | ✅ | ✅ | 100% Complete |
| **Settings** | `/admin/settings` | `/settings/*` (4 endpoints) | ✅ | ✅ | 100% Complete |

### ⚠️ Partially Integrated (UI Ready, Backend Exists, NOT Connected)

| Module | Frontend Status | Backend Status | Integration Status | Completion |
|--------|----------------|----------------|-------------------|------------|
| **Books Catalog** | ✅ UI Complete | ✅ 11 endpoints | ❌ Using mock data | **40%** |
| **Circulation** | ✅ UI Complete | ✅ 8 endpoints | ❌ Using mock data | **40%** |

### ❌ Missing Components

| Item | Description | Priority |
|------|-------------|----------|
| Books API Client | `frontend/lib/api/books.ts` | 🔴 Critical |
| Circulation API Client | `frontend/lib/api/circulation.ts` | 🔴 Critical |
| Categories API Client | `frontend/lib/api/categories.ts` | 🔴 Critical |
| Analytics UI | Dashboard for `/analytics` endpoint | 🟡 Medium |
| Auth Refresh Endpoint | `/auth/refresh` token refresh | 🟠 High |
| Auth Me Endpoint | `/auth/me` current user | 🟠 High |
| Fines Management UI | Fine calculation and payment tracking | 🟡 Medium |
| Notifications System | Real-time notifications | 🟢 Low |

---

## Bilingual Support Analysis

### ✅ Translation Coverage (Excellent)

Both `en.json` and `ar.json` have **728 lines** with complete coverage:

```json
{
  "common": { /* 15+ keys */ },
  "nav": { /* 10+ menu items */ },
  "login": { /* 20+ keys */ },
  "dashboard": { /* 25+ keys */ },
  "users": { /* 150+ keys - COMPLETE */ },
  "books": { /* 100+ keys - COMPLETE */ },
  "circulation": { /* 80+ keys - COMPLETE */ },
  "reports": { /* 60+ keys - COMPLETE */ },
  "settings": { /* 200+ keys - COMPLETE */ }
}
```

**Status:** ✅ No translation gaps identified

### ✅ RTL Implementation (Excellent)

**Pattern Used Throughout:**
```tsx
const locale = useLocale();
const isRTL = locale === 'ar';

<div dir={isRTL ? 'rtl' : 'ltr'}>
  <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
    <Icon className={isRTL ? 'ml-2' : 'mr-2'} />
    <span>{t('label')}</span>
  </div>
</div>
```

**Files with RTL Support:**
- ✅ All page components (`/app/[locale]/`)
- ✅ AdminLayout sidebar
- ✅ All forms and modals
- ✅ All data tables
- ✅ Breadcrumbs and navigation

### ✅ Bilingual Database Schema

**Tables with Dual-Language Fields:**

```sql
-- Users Table
users (
  id, email, password_hash,
  full_name,        -- English name
  arabic_name,      -- Arabic name
  role, is_active, phone, address, created_at, updated_at
)

-- Books Table
books (
  id, isbn,
  title,            -- English title
  title_ar,         -- Arabic title
  author,           -- English author
  author_ar,        -- Arabic author
  category_id, publisher, publication_year,
  language, pages, quantity, available, status, location,
  cover_url, description, created_at, updated_at
)

-- Categories Table
categories (
  id,
  name,             -- English name
  name_ar,          -- Arabic name
  description,      -- English description
  description_ar,   -- Arabic description
  created_at, updated_at
)

-- Transactions Table (Circulation)
transactions (
  id, user_id, book_id,
  issue_date, due_date, return_date,
  status, fine_amount, notes,
  issued_by, returned_by, created_at, updated_at
)

-- User Settings Table
user_settings (
  id, user_id,
  language, theme, notifications_enabled,
  date_format, time_format, items_per_page,
  settings_json, created_at, updated_at
)
```

**Status:** ✅ All primary entities support bilingual data

---

## Missing Backend Integrations (Critical)

### 🔴 1. Books Catalog Integration

**Current State:**
- ✅ Frontend UI: `frontend/app/[locale]/admin/catalog/page.tsx` (Complete)
- ✅ Backend API: `backend/app/api/v1/endpoints/books.py` (11 endpoints)
- ❌ API Client: Using mock data from `frontend/lib/data/books.ts`

**Backend Endpoints Available:**
```
GET    /books                      # List books (paginated, filtered)
GET    /books/{book_id}           # Get single book
POST   /books                      # Create book
PUT    /books/{book_id}           # Update book
DELETE /books/{book_id}           # Delete book
PATCH  /books/{id}/quantity       # Update quantity
GET    /books/{id}/availability   # Check availability
POST   /books/bulk-update         # Bulk update
POST   /books/bulk-delete         # Bulk delete
GET    /books/statistics          # Statistics

GET    /categories                # List categories
GET    /categories/{id}           # Get category
POST   /categories                # Create category
PUT    /categories/{id}           # Update category
DELETE /categories/{id}           # Delete category
```

**What's Missing:**

1. **API Client File:** `frontend/lib/api/books.ts`
   ```typescript
   // Need to create this file with:
   - fetchBooks() - with pagination, search, filters
   - fetchBookById()
   - createBook()
   - updateBook()
   - deleteBook()
   - updateBookQuantity()
   - checkBookAvailability()
   - bulkUpdateBooks()
   - bulkDeleteBooks()
   - fetchBookStatistics()
   - fetchCategories()
   - fetchCategoryById()
   - createCategory()
   - updateCategory()
   - deleteCategory()
   ```

2. **API Client File:** `frontend/lib/api/categories.ts`
   ```typescript
   // Separate file for categories management
   - fetchCategories()
   - fetchCategoryById()
   - createCategory()
   - updateCategory()
   - deleteCategory()
   ```

3. **React Query Hooks:** `frontend/hooks/useBooks.ts`
   ```typescript
   // Need to create:
   - useBooks(filters) - Query hook
   - useBook(id) - Single book query
   - useCreateBook() - Mutation hook
   - useUpdateBook() - Mutation hook
   - useDeleteBook() - Mutation hook
   - useBulkUpdateBooks() - Mutation hook
   - useBookStatistics() - Statistics query
   ```

4. **React Query Hooks:** `frontend/hooks/useCategories.ts`
   ```typescript
   // Need to create:
   - useCategories() - Query hook
   - useCategory(id) - Single category query
   - useCreateCategory() - Mutation hook
   - useUpdateCategory() - Mutation hook
   - useDeleteCategory() - Mutation hook
   ```

5. **Types File:** `frontend/lib/types/books.ts`
   ```typescript
   // Need to create TypeScript types matching backend models:
   - Book
   - BookCreate
   - BookUpdate
   - BookFilters
   - BookStatistics
   - Category
   - CategoryCreate
   - CategoryUpdate
   - BookStatus enum
   - Language enum
   ```

6. **Integration in Page:** `frontend/app/[locale]/admin/catalog/page.tsx`
   ```typescript
   // Need to replace:
   - Remove import from 'lib/data/books'
   - Add useBooks() hook
   - Add useCategories() hook
   - Update all CRUD operations to use API
   - Add proper error handling
   - Add loading states
   ```

**Mock Data Location to Remove:**
- File: `frontend/lib/data/books.ts` (currently has 30+ mock books)

---

### 🔴 2. Circulation Integration

**Current State:**
- ✅ Frontend UI: `frontend/app/[locale]/admin/circulation/page.tsx` (Complete)
- ✅ Backend API: `backend/app/api/v1/endpoints/circulation.py` (8 endpoints)
- ❌ Integration: Using hardcoded mock records in page component

**Backend Endpoints Available:**
```
GET    /circulation               # List circulation records
GET    /circulation/stats         # Statistics
GET    /circulation/export        # CSV export
GET    /circulation/{record_id}   # Get single record
POST   /circulation               # Issue book
POST   /circulation/{id}/return   # Return book
PATCH  /circulation/{record_id}   # Update record
DELETE /circulation/{record_id}   # Delete record
```

**What's Missing:**

1. **API Client File:** `frontend/lib/api/circulation.ts`
   ```typescript
   // Need to create this file with:
   - fetchCirculationRecords() - with pagination, filters
   - fetchCirculationById()
   - issueBook() - POST circulation
   - returnBook() - POST circulation/{id}/return
   - updateCirculation()
   - deleteCirculation()
   - fetchCirculationStats()
   - exportCirculation() - CSV download
   ```

2. **React Query Hooks:** `frontend/hooks/useCirculation.ts`
   ```typescript
   // Need to create:
   - useCirculation(filters) - Query hook
   - useCirculationRecord(id) - Single record query
   - useIssueBook() - Mutation hook
   - useReturnBook() - Mutation hook
   - useUpdateCirculation() - Mutation hook
   - useDeleteCirculation() - Mutation hook
   - useCirculationStats() - Statistics query
   - useExportCirculation() - Export mutation
   ```

3. **Types File:** `frontend/lib/types/circulation.ts`
   ```typescript
   // Need to create TypeScript types:
   - CirculationRecord
   - CirculationCreate
   - CirculationReturn
   - CirculationUpdate
   - CirculationFilters
   - CirculationStatistics
   - CirculationStatus enum
   ```

4. **Integration in Page:** `frontend/app/[locale]/admin/circulation/page.tsx`
   ```typescript
   // Need to replace:
   - Remove hardcoded mock records array
   - Add useCirculation() hook
   - Add useCirculationStats() hook
   - Update IssueBookModal to use useIssueBook()
   - Update ReturnBookModal to use useReturnBook()
   - Add proper error handling
   - Add loading states
   ```

5. **Integration in Components:**
   - `frontend/components/circulation/CirculationTable.tsx` - Use API data
   - `frontend/components/circulation/IssueBookModal.tsx` - Connect to API
   - `frontend/components/circulation/ReturnBookModal.tsx` - Connect to API
   - `frontend/components/circulation/StatisticsCards.tsx` - Use API stats

**Mock Data Location to Remove:**
- Hardcoded in: `frontend/app/[locale]/admin/circulation/page.tsx` (lines ~80-120)

---

### 🟠 3. Authentication Completion

**Current State:**
- ✅ Login/Logout: Fully functional
- ⚠️ Token Management: Frontend has refresh logic, backend needs endpoint
- ⚠️ Current User: Placeholder endpoint exists

**What's Missing:**

1. **Backend Endpoint:** `/auth/refresh`
   ```python
   # File: backend/app/api/v1/endpoints/auth.py
   # Need to implement:
   @router.post("/refresh", response_model=TokenResponse)
   async def refresh_token(
       refresh_token: str = Body(..., embed=True)
   ):
       # Validate refresh token
       # Generate new access token
       # Return new tokens
   ```

2. **Backend Endpoint:** `/auth/me`
   ```python
   # File: backend/app/api/v1/endpoints/auth.py
   # Need to implement properly:
   @router.get("/me", response_model=UserResponse)
   async def get_current_user(
       current_user: User = Depends(get_current_user)
   ):
       # Return authenticated user info
   ```

3. **JWT Middleware:**
   ```python
   # File: backend/app/core/security.py
   # Need to implement:
   - get_current_user() dependency
   - verify_token() function
   - decode_access_token() function
   - create_refresh_token() function
   ```

4. **Protected Routes:**
   ```python
   # Update all endpoints to use authentication:
   - Add Depends(get_current_user) to all protected routes
   - Remove X-User-Id header workaround
   ```

---

## Missing UI Components

### 🟡 1. Analytics Dashboard

**Backend Exists:** `GET /analytics`

**What's Missing:**
- Page: `frontend/app/[locale]/admin/analytics/page.tsx`
- Components:
  - `AnalyticsHeader.tsx`
  - `MetricsGrid.tsx`
  - `TrendCharts.tsx`
  - `InsightsPanel.tsx`
- API Client: `frontend/lib/api/analytics.ts`
- Hooks: `frontend/hooks/useAnalytics.ts`
- Types: `frontend/lib/types/analytics.ts`
- Translations: Add `"analytics": {}` section to en.json and ar.json

**Recommended Features:**
- Real-time metrics dashboard
- User behavior analytics
- Popular books/categories
- Peak usage times
- Geographic distribution (if available)
- Custom date range selection
- Export analytics reports

---

### 🟡 2. Fines Management UI

**Backend Support:** Partial (circulation has `fine_amount` field)

**What's Missing:**
- Page: `frontend/app/[locale]/admin/fines/page.tsx`
- Components:
  - `FinesTable.tsx` - List of all fines
  - `FineDetailsDialog.tsx` - Fine details
  - `PaymentModal.tsx` - Record payment
  - `FineStatistics.tsx` - Statistics cards
- Backend Endpoints:
  - `GET /fines` - List fines
  - `GET /fines/{id}` - Get fine details
  - `POST /fines/{id}/pay` - Record payment
  - `GET /fines/statistics` - Statistics
- Database Table:
  ```sql
  fines (
    id, transaction_id, user_id, book_id,
    amount, paid_amount, status,
    reason, payment_date, payment_method,
    notes, created_at, updated_at
  )
  ```
- Translations: Add `"fines": {}` section to messages

**Features:**
- List all outstanding fines
- Filter by user, status, date range
- Record payments (cash, card, online)
- Partial payment support
- Fine waiving (admin only)
- Payment history
- Fine reports
- Email reminders for overdue fines

---

### 🟢 3. Notifications System

**Backend Support:** Settings has notification preferences

**What's Missing:**
- Real-time notification component
- Backend endpoints:
  - `GET /notifications` - List notifications
  - `PATCH /notifications/{id}/read` - Mark as read
  - `DELETE /notifications/{id}` - Delete
  - WebSocket support for real-time
- Database Table:
  ```sql
  notifications (
    id, user_id, type, title, message,
    is_read, created_at, read_at,
    action_url, metadata_json
  )
  ```
- Component: `frontend/components/NotificationBell.tsx`
- Translations: Add notification types to messages

**Features:**
- Bell icon with unread count
- Dropdown with recent notifications
- Mark as read/unread
- Notification types:
  - Book due soon (3 days before)
  - Book overdue
  - Book available (waitlist)
  - Fine added
  - System announcements
  - Account updates

---

### 🟢 4. Search Functionality

**Global Search Across All Entities**

**What's Missing:**
- Global search bar in AdminLayout
- Component: `frontend/components/GlobalSearch.tsx`
- Backend endpoint: `GET /search?q={query}&type={type}`
- Search types:
  - Books (title, author, ISBN)
  - Users (name, email, ID)
  - Circulation records
  - Categories
- Features:
  - Autocomplete suggestions
  - Recent searches
  - Search filters
  - Keyboard shortcut (Ctrl+K / Cmd+K)

---

## Sequential Implementation Plan

### Phase 1: Critical Backend Integrations (Week 1)

**Priority: 🔴 CRITICAL**

#### Day 1-2: Books Catalog Integration

**Tasks:**
1. Create API client
   - [ ] File: `frontend/lib/api/books.ts`
   - [ ] File: `frontend/lib/api/categories.ts`
   - [ ] Implement all 15 API functions

2. Create TypeScript types
   - [ ] File: `frontend/lib/types/books.ts`
   - [ ] Define all interfaces and enums

3. Create React Query hooks
   - [ ] File: `frontend/hooks/useBooks.ts`
   - [ ] File: `frontend/hooks/useCategories.ts`
   - [ ] Implement query and mutation hooks

4. Integrate with UI
   - [ ] Update: `frontend/app/[locale]/admin/catalog/page.tsx`
   - [ ] Replace mock data with API calls
   - [ ] Update: `frontend/components/books/BookCard.tsx`
   - [ ] Update: `frontend/components/books/SearchAndFilters.tsx`
   - [ ] Add loading states and error handling

5. Testing
   - [ ] Test CRUD operations (Create, Read, Update, Delete)
   - [ ] Test bulk operations
   - [ ] Test search and filters
   - [ ] Test pagination
   - [ ] Test bilingual data display (Arabic/English)
   - [ ] Test RTL layout

**Estimated Time:** 16 hours

---

#### Day 3-4: Circulation Integration

**Tasks:**
1. Create API client
   - [ ] File: `frontend/lib/api/circulation.ts`
   - [ ] Implement all 8 API functions

2. Create TypeScript types
   - [ ] File: `frontend/lib/types/circulation.ts`
   - [ ] Define all interfaces and enums

3. Create React Query hooks
   - [ ] File: `frontend/hooks/useCirculation.ts`
   - [ ] Implement query and mutation hooks

4. Integrate with UI
   - [ ] Update: `frontend/app/[locale]/admin/circulation/page.tsx`
   - [ ] Remove hardcoded mock records
   - [ ] Update: `frontend/components/circulation/IssueBookModal.tsx`
   - [ ] Update: `frontend/components/circulation/ReturnBookModal.tsx`
   - [ ] Update: `frontend/components/circulation/CirculationTable.tsx`
   - [ ] Update: `frontend/components/circulation/StatisticsCards.tsx`
   - [ ] Add loading states and error handling

5. Testing
   - [ ] Test issue book flow
   - [ ] Test return book flow
   - [ ] Test fine calculation
   - [ ] Test overdue detection
   - [ ] Test filters and search
   - [ ] Test CSV export
   - [ ] Test bilingual data display

**Estimated Time:** 16 hours

---

#### Day 5: Authentication Completion

**Tasks:**
1. Backend Implementation
   - [ ] Implement: `/auth/refresh` endpoint
   - [ ] Implement: `/auth/me` endpoint properly
   - [ ] File: `backend/app/core/security.py`
   - [ ] Add JWT middleware functions:
     - `get_current_user()`
     - `verify_token()`
     - `decode_access_token()`
     - `create_refresh_token()`

2. Update Protected Routes
   - [ ] Add `Depends(get_current_user)` to all endpoints
   - [ ] Remove `X-User-Id` header workaround
   - [ ] Update: `backend/app/api/v1/endpoints/users.py`
   - [ ] Update: `backend/app/api/v1/endpoints/books.py`
   - [ ] Update: `backend/app/api/v1/endpoints/circulation.py`
   - [ ] Update: `backend/app/api/v1/endpoints/settings.py`
   - [ ] Update: `backend/app/api/v1/endpoints/reports.py`

3. Frontend Updates
   - [ ] Update: `frontend/lib/api/client.ts`
   - [ ] Verify token refresh interceptor works with new endpoint
   - [ ] Test automatic token refresh

4. Testing
   - [ ] Test login flow
   - [ ] Test token expiration and refresh
   - [ ] Test protected routes return 401 when unauthenticated
   - [ ] Test logout clears tokens
   - [ ] Test concurrent requests with token refresh

**Estimated Time:** 8 hours

---

### Phase 2: UI Enhancements (Week 2)

**Priority: 🟡 MEDIUM**

#### Day 1-2: Analytics Dashboard

**Tasks:**
1. Backend Implementation
   - [ ] Review existing `/analytics` endpoint
   - [ ] Enhance if needed with more metrics

2. Frontend Implementation
   - [ ] Page: `frontend/app/[locale]/admin/analytics/page.tsx`
   - [ ] Component: `frontend/components/analytics/AnalyticsHeader.tsx`
   - [ ] Component: `frontend/components/analytics/MetricsGrid.tsx`
   - [ ] Component: `frontend/components/analytics/TrendCharts.tsx`
   - [ ] Component: `frontend/components/analytics/InsightsPanel.tsx`

3. API & Hooks
   - [ ] File: `frontend/lib/api/analytics.ts`
   - [ ] File: `frontend/hooks/useAnalytics.ts`
   - [ ] File: `frontend/lib/types/analytics.ts`

4. Translations
   - [ ] Add analytics section to `en.json`
   - [ ] Add analytics section to `ar.json`
   - [ ] Test bilingual display

5. Integration
   - [ ] Add menu item to `AdminLayout.tsx`
   - [ ] Add route to navigation

**Estimated Time:** 16 hours

---

#### Day 3-4: Fines Management

**Tasks:**
1. Backend Implementation
   - [ ] Database migration: Create `fines` table
   - [ ] Model: `backend/app/models/fines.py`
   - [ ] Service: `backend/app/services/fines_service.py`
   - [ ] Endpoints: `backend/app/api/v1/endpoints/fines.py`
     - `GET /fines`
     - `GET /fines/{id}`
     - `POST /fines/{id}/pay`
     - `GET /fines/statistics`

2. Frontend Implementation
   - [ ] Page: `frontend/app/[locale]/admin/fines/page.tsx`
   - [ ] Component: `frontend/components/fines/FinesTable.tsx`
   - [ ] Component: `frontend/components/fines/FineDetailsDialog.tsx`
   - [ ] Component: `frontend/components/fines/PaymentModal.tsx`
   - [ ] Component: `frontend/components/fines/FineStatistics.tsx`

3. API & Hooks
   - [ ] File: `frontend/lib/api/fines.ts`
   - [ ] File: `frontend/hooks/useFines.ts`
   - [ ] File: `frontend/lib/types/fines.ts`

4. Translations
   - [ ] Add fines section to `en.json`
   - [ ] Add fines section to `ar.json`

5. Integration
   - [ ] Link fines in Circulation page
   - [ ] Add menu item to AdminLayout
   - [ ] Update circulation return flow to calculate fines

**Estimated Time:** 16 hours

---

#### Day 5: Notifications System

**Tasks:**
1. Backend Implementation
   - [ ] Database migration: Create `notifications` table
   - [ ] Model: `backend/app/models/notifications.py`
   - [ ] Service: `backend/app/services/notifications_service.py`
   - [ ] Endpoints: `backend/app/api/v1/endpoints/notifications.py`
   - [ ] Background job: Due date checker
   - [ ] Background job: Overdue checker

2. Frontend Implementation
   - [ ] Component: `frontend/components/NotificationBell.tsx`
   - [ ] Component: `frontend/components/NotificationDropdown.tsx`
   - [ ] Component: `frontend/components/NotificationItem.tsx`

3. API & Hooks
   - [ ] File: `frontend/lib/api/notifications.ts`
   - [ ] File: `frontend/hooks/useNotifications.ts`
   - [ ] File: `frontend/lib/types/notifications.ts`

4. Integration
   - [ ] Add to AdminLayout header
   - [ ] Add polling or WebSocket for real-time

5. Translations
   - [ ] Add notification types to translations

**Estimated Time:** 8 hours

---

### Phase 3: Advanced Features (Week 3)

**Priority: 🟢 LOW**

#### Global Search

**Tasks:**
- [ ] Backend: `GET /search` endpoint
- [ ] Component: `GlobalSearch.tsx`
- [ ] Add to AdminLayout
- [ ] Keyboard shortcut support

**Estimated Time:** 8 hours

---

#### User Profile Page

**Tasks:**
- [ ] Page: `frontend/app/[locale]/profile/page.tsx`
- [ ] View/edit personal information
- [ ] Change password
- [ ] View borrowing history
- [ ] View fines

**Estimated Time:** 8 hours

---

#### Barcode Scanning

**Tasks:**
- [ ] Install barcode scanner library
- [ ] Add barcode input to Issue Book modal
- [ ] Add barcode input to Return Book modal
- [ ] Add barcode to book details

**Estimated Time:** 4 hours

---

#### Email Notifications

**Tasks:**
- [ ] Backend: Email service setup (SendGrid/AWS SES)
- [ ] Templates for:
  - Book due reminder
  - Overdue notification
  - Fine notification
  - Account created
  - Password reset

**Estimated Time:** 8 hours

---

#### Advanced Reporting

**Tasks:**
- [ ] Custom report builder
- [ ] Scheduled reports
- [ ] Email delivery of reports
- [ ] More chart types

**Estimated Time:** 16 hours

---

## Detailed Integration Specifications

### 1. Books Catalog Integration Specification

#### 1.1 Create API Client: `frontend/lib/api/books.ts`

```typescript
import { apiClient } from './client';
import type {
  Book,
  BookCreate,
  BookUpdate,
  BookFilters,
  BookStatistics,
  BooksResponse,
  BulkUpdateRequest,
  BulkDeleteRequest,
} from '../types/books';

// List books with filters
export async function fetchBooks(params: BookFilters) {
  const { data } = await apiClient.get<BooksResponse>('/books', { params });
  return data;
}

// Get single book
export async function fetchBookById(id: string) {
  const { data } = await apiClient.get<Book>(`/books/${id}`);
  return data;
}

// Create book
export async function createBook(book: BookCreate) {
  const { data } = await apiClient.post<Book>('/books', book);
  return data;
}

// Update book
export async function updateBook(id: string, book: BookUpdate) {
  const { data } = await apiClient.put<Book>(`/books/${id}`, book);
  return data;
}

// Delete book
export async function deleteBook(id: string) {
  await apiClient.delete(`/books/${id}`);
}

// Update book quantity
export async function updateBookQuantity(id: string, quantity: number) {
  const { data } = await apiClient.patch<Book>(`/books/${id}/quantity`, { quantity });
  return data;
}

// Check book availability
export async function checkBookAvailability(id: string) {
  const { data } = await apiClient.get<{ available: boolean; available_count: number }>(
    `/books/${id}/availability`
  );
  return data;
}

// Bulk update books
export async function bulkUpdateBooks(request: BulkUpdateRequest) {
  const { data } = await apiClient.post('/books/bulk-update', request);
  return data;
}

// Bulk delete books
export async function bulkDeleteBooks(request: BulkDeleteRequest) {
  const { data } = await apiClient.post('/books/bulk-delete', request);
  return data;
}

// Get book statistics
export async function fetchBookStatistics() {
  const { data } = await apiClient.get<BookStatistics>('/books/statistics');
  return data;
}
```

---

#### 1.2 Create Types: `frontend/lib/types/books.ts`

```typescript
export enum BookStatus {
  AVAILABLE = 'available',
  CHECKED_OUT = 'checked_out',
  RESERVED = 'reserved',
  MAINTENANCE = 'maintenance',
  LOST = 'lost',
}

export enum BookLanguage {
  ENGLISH = 'en',
  ARABIC = 'ar',
  BILINGUAL = 'bilingual',
  OTHER = 'other',
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  title_ar: string | null;
  author: string;
  author_ar: string | null;
  category_id: string;
  category?: Category;
  publisher: string | null;
  publication_year: number | null;
  language: BookLanguage;
  pages: number | null;
  quantity: number;
  available: number;
  status: BookStatus;
  location: string | null;
  cover_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookCreate {
  isbn: string;
  title: string;
  title_ar?: string;
  author: string;
  author_ar?: string;
  category_id: string;
  publisher?: string;
  publication_year?: number;
  language: BookLanguage;
  pages?: number;
  quantity: number;
  location?: string;
  cover_url?: string;
  description?: string;
}

export interface BookUpdate {
  isbn?: string;
  title?: string;
  title_ar?: string;
  author?: string;
  author_ar?: string;
  category_id?: string;
  publisher?: string;
  publication_year?: number;
  language?: BookLanguage;
  pages?: number;
  quantity?: number;
  location?: string;
  cover_url?: string;
  description?: string;
  status?: BookStatus;
}

export interface BookFilters {
  page?: number;
  page_size?: number;
  search?: string;
  category_id?: string;
  status?: BookStatus;
  language?: BookLanguage;
  year_from?: number;
  year_to?: number;
  sort_by?: 'title' | 'author' | 'publication_year' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface BooksResponse {
  data: Book[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface BookStatistics {
  total_books: number;
  total_copies: number;
  available_copies: number;
  checked_out_copies: number;
  by_category: Record<string, number>;
  by_language: Record<string, number>;
  by_status: Record<string, number>;
}

export interface BulkUpdateRequest {
  book_ids: string[];
  updates: BookUpdate;
}

export interface BulkDeleteRequest {
  book_ids: string[];
}

export interface Category {
  id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  books_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryCreate {
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
}

export interface CategoryUpdate {
  name?: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
}
```

---

#### 1.3 Create React Query Hooks: `frontend/hooks/useBooks.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchBooks,
  fetchBookById,
  createBook,
  updateBook,
  deleteBook,
  updateBookQuantity,
  checkBookAvailability,
  bulkUpdateBooks,
  bulkDeleteBooks,
  fetchBookStatistics,
} from '@/lib/api/books';
import type { BookFilters, BookCreate, BookUpdate } from '@/lib/types/books';
import { toast } from 'sonner';

// Query: List books
export function useBooks(filters: BookFilters) {
  return useQuery({
    queryKey: ['books', filters],
    queryFn: () => fetchBooks(filters),
    staleTime: 30000, // 30 seconds
  });
}

// Query: Single book
export function useBook(id: string) {
  return useQuery({
    queryKey: ['books', id],
    queryFn: () => fetchBookById(id),
    enabled: !!id,
  });
}

// Query: Book statistics
export function useBookStatistics() {
  return useQuery({
    queryKey: ['books', 'statistics'],
    queryFn: fetchBookStatistics,
    staleTime: 60000, // 1 minute
  });
}

// Mutation: Create book
export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (book: BookCreate) => createBook(book),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to create book');
    },
  });
}

// Mutation: Update book
export function useUpdateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, book }: { id: string; book: BookUpdate }) =>
      updateBook(id, book),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['books', id] });
      toast.success('Book updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to update book');
    },
  });
}

// Mutation: Delete book
export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to delete book');
    },
  });
}

// Mutation: Update quantity
export function useUpdateBookQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      updateBookQuantity(id, quantity),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['books', id] });
      toast.success('Book quantity updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to update quantity');
    },
  });
}

// Mutation: Bulk update
export function useBulkUpdateBooks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkUpdateBooks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Books updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to update books');
    },
  });
}

// Mutation: Bulk delete
export function useBulkDeleteBooks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkDeleteBooks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Books deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to delete books');
    },
  });
}
```

---

#### 1.4 Update Page: `frontend/app/[locale]/admin/catalog/page.tsx`

**Key Changes:**
```typescript
// BEFORE (Mock Data):
import { mockBooks } from '@/lib/data/books';
const [filteredBooks, setFilteredBooks] = useState(mockBooks);

// AFTER (API Integration):
import { useBooks, useBookStatistics } from '@/hooks/useBooks';
import { useCategories } from '@/hooks/useCategories';

const [filters, setFilters] = useState<BookFilters>({
  page: 1,
  page_size: 12,
  search: '',
  category_id: undefined,
  status: undefined,
  language: undefined,
});

const { data: booksData, isLoading, error } = useBooks(filters);
const { data: statistics } = useBookStatistics();
const { data: categories } = useCategories();

// Add loading state
if (isLoading) return <BooksSkeleton />;

// Add error state
if (error) return <ErrorDisplay error={error} />;

// Use API data
const books = booksData?.data || [];
const totalBooks = booksData?.total || 0;
```

---

### 2. Circulation Integration Specification

#### 2.1 Create API Client: `frontend/lib/api/circulation.ts`

```typescript
import { apiClient } from './client';
import type {
  CirculationRecord,
  CirculationCreate,
  CirculationReturn,
  CirculationUpdate,
  CirculationFilters,
  CirculationStatistics,
  CirculationResponse,
} from '../types/circulation';

// List circulation records
export async function fetchCirculationRecords(params: CirculationFilters) {
  const { data } = await apiClient.get<CirculationResponse>('/circulation', { params });
  return data;
}

// Get single circulation record
export async function fetchCirculationById(id: string) {
  const { data } = await apiClient.get<CirculationRecord>(`/circulation/${id}`);
  return data;
}

// Issue book
export async function issueBook(record: CirculationCreate) {
  const { data } = await apiClient.post<CirculationRecord>('/circulation', record);
  return data;
}

// Return book
export async function returnBook(id: string, returnData: CirculationReturn) {
  const { data } = await apiClient.post<CirculationRecord>(
    `/circulation/${id}/return`,
    returnData
  );
  return data;
}

// Update circulation record
export async function updateCirculation(id: string, record: CirculationUpdate) {
  const { data } = await apiClient.patch<CirculationRecord>(`/circulation/${id}`, record);
  return data;
}

// Delete circulation record
export async function deleteCirculation(id: string) {
  await apiClient.delete(`/circulation/${id}`);
}

// Get circulation statistics
export async function fetchCirculationStats() {
  const { data } = await apiClient.get<CirculationStatistics>('/circulation/stats');
  return data;
}

// Export circulation records to CSV
export async function exportCirculation(params: CirculationFilters) {
  const { data } = await apiClient.get('/circulation/export', {
    params,
    responseType: 'blob',
  });
  return data;
}
```

---

#### 2.2 Create Types: `frontend/lib/types/circulation.ts`

```typescript
export enum CirculationStatus {
  ACTIVE = 'active',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  LOST = 'lost',
}

export interface CirculationRecord {
  id: string;
  user_id: string;
  user_name?: string;
  user_arabic_name?: string;
  book_id: string;
  book_title?: string;
  book_title_ar?: string;
  issue_date: string;
  due_date: string;
  return_date: string | null;
  status: CirculationStatus;
  fine_amount: number;
  notes: string | null;
  issued_by: string;
  returned_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CirculationCreate {
  user_id: string;
  book_id: string;
  due_date: string;
  notes?: string;
}

export interface CirculationReturn {
  return_date: string;
  notes?: string;
}

export interface CirculationUpdate {
  due_date?: string;
  notes?: string;
}

export interface CirculationFilters {
  page?: number;
  page_size?: number;
  user_id?: string;
  book_id?: string;
  status?: CirculationStatus;
  from_date?: string;
  to_date?: string;
  overdue_only?: boolean;
  sort_by?: 'issue_date' | 'due_date' | 'return_date';
  sort_order?: 'asc' | 'desc';
}

export interface CirculationResponse {
  data: CirculationRecord[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CirculationStatistics {
  total_issued: number;
  currently_active: number;
  overdue_count: number;
  returned_today: number;
  total_fines: number;
  average_loan_duration: number;
  most_borrowed_books: Array<{
    book_id: string;
    book_title: string;
    borrow_count: number;
  }>;
}
```

---

#### 2.3 Create React Query Hooks: `frontend/hooks/useCirculation.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCirculationRecords,
  fetchCirculationById,
  issueBook,
  returnBook,
  updateCirculation,
  deleteCirculation,
  fetchCirculationStats,
  exportCirculation,
} from '@/lib/api/circulation';
import type {
  CirculationFilters,
  CirculationCreate,
  CirculationReturn,
  CirculationUpdate,
} from '@/lib/types/circulation';
import { toast } from 'sonner';

// Query: List circulation records
export function useCirculation(filters: CirculationFilters) {
  return useQuery({
    queryKey: ['circulation', filters],
    queryFn: () => fetchCirculationRecords(filters),
    staleTime: 10000, // 10 seconds
  });
}

// Query: Single record
export function useCirculationRecord(id: string) {
  return useQuery({
    queryKey: ['circulation', id],
    queryFn: () => fetchCirculationById(id),
    enabled: !!id,
  });
}

// Query: Statistics
export function useCirculationStats() {
  return useQuery({
    queryKey: ['circulation', 'stats'],
    queryFn: fetchCirculationStats,
    staleTime: 30000, // 30 seconds
  });
}

// Mutation: Issue book
export function useIssueBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (record: CirculationCreate) => issueBook(record),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circulation'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book issued successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to issue book');
    },
  });
}

// Mutation: Return book
export function useReturnBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, returnData }: { id: string; returnData: CirculationReturn }) =>
      returnBook(id, returnData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circulation'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book returned successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to return book');
    },
  });
}

// Mutation: Update circulation
export function useUpdateCirculation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, record }: { id: string; record: CirculationUpdate }) =>
      updateCirculation(id, record),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['circulation'] });
      queryClient.invalidateQueries({ queryKey: ['circulation', id] });
      toast.success('Record updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to update record');
    },
  });
}

// Mutation: Delete circulation
export function useDeleteCirculation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCirculation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circulation'] });
      toast.success('Record deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to delete record');
    },
  });
}

// Mutation: Export to CSV
export function useExportCirculation() {
  return useMutation({
    mutationFn: (filters: CirculationFilters) => exportCirculation(filters),
    onSuccess: (blob) => {
      // Download the CSV file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `circulation_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Export completed');
    },
    onError: (error: any) => {
      toast.error('Failed to export data');
    },
  });
}
```

---

#### 2.4 Update Page: `frontend/app/[locale]/admin/circulation/page.tsx`

**Key Changes:**
```typescript
// BEFORE (Mock Data):
const mockRecords = [
  { id: '1', user: 'Ahmad', book: 'Clean Code', ... },
  // ... more mock data
];
const [records, setRecords] = useState(mockRecords);

// AFTER (API Integration):
import { useCirculation, useCirculationStats } from '@/hooks/useCirculation';

const [filters, setFilters] = useState<CirculationFilters>({
  page: 1,
  page_size: 20,
  status: undefined,
  overdue_only: false,
});

const { data: circulationData, isLoading, error } = useCirculation(filters);
const { data: statistics } = useCirculationStats();

// Add loading state
if (isLoading) return <CirculationSkeleton />;

// Add error state
if (error) return <ErrorDisplay error={error} />;

// Use API data
const records = circulationData?.data || [];
const totalRecords = circulationData?.total || 0;
```

---

### 3. Authentication Completion Specification

#### 3.1 Backend: JWT Middleware (`backend/app/core/security.py`)

```python
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from supabase import Client

from ..db.supabase_client import get_supabase
from ..core.config import settings

# Configuration
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Password hashing
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# Token creation
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Token validation
def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def decode_refresh_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

# Get current user dependency
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase)
):
    token = credentials.credentials
    payload = decode_access_token(token)

    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    # Fetch user from database
    response = supabase.table("users").select("*").eq("id", user_id).single().execute()

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    user = response.data

    # Check if user is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )

    return user

# Role-based access control
def require_role(allowed_roles: list[str]):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role", "user")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user
    return role_checker

# Admin only
async def get_current_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user
```

---

#### 3.2 Backend: Auth Endpoints Update (`backend/app/api/v1/endpoints/auth.py`)

```python
from fastapi import APIRouter, Depends, HTTPException, status, Body
from supabase import Client
from ....db.supabase_client import get_supabase
from ....core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    get_current_user,
)
from ....models.auth import (
    LoginRequest,
    LoginResponse,
    TokenResponse,
    UserResponse,
    RefreshTokenRequest,
)

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    supabase: Client = Depends(get_supabase)
):
    # Fetch user by email
    response = supabase.table("users").select("*").eq("email", request.email).single().execute()

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    user = response.data

    # Verify password
    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # Check if user is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )

    # Create tokens
    access_token = create_access_token(data={"sub": user["id"]})
    refresh_token = create_refresh_token(data={"sub": user["id"]})

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse(**user)
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    supabase: Client = Depends(get_supabase)
):
    # Decode and validate refresh token
    payload = decode_refresh_token(request.refresh_token)
    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    # Verify user still exists and is active
    response = supabase.table("users").select("id, is_active").eq("id", user_id).single().execute()

    if not response.data or not response.data.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    # Create new access token
    access_token = create_access_token(data={"sub": user_id})

    return TokenResponse(
        access_token=access_token,
        token_type="bearer"
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user)
):
    return UserResponse(**current_user)

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    # In a real implementation, you might want to:
    # 1. Blacklist the token
    # 2. Delete refresh token from database
    # 3. Clear user session

    return {"message": "Successfully logged out"}
```

---

#### 3.3 Backend: Update All Protected Endpoints

**Example: Update Users Endpoint**

```python
# BEFORE:
@router.get("/users")
async def list_users(
    supabase: Client = Depends(get_supabase),
    user_id: str = Header(..., alias="X-User-Id")
):
    # ... implementation

# AFTER:
from ....core.security import get_current_user, get_current_admin

@router.get("/users")
async def list_users(
    supabase: Client = Depends(get_supabase),
    current_user: dict = Depends(get_current_admin)  # Only admins can list users
):
    # Use current_user["id"] instead of user_id header
    # ... implementation
```

**Apply to all endpoints in:**
- `backend/app/api/v1/endpoints/users.py`
- `backend/app/api/v1/endpoints/books.py`
- `backend/app/api/v1/endpoints/circulation.py`
- `backend/app/api/v1/endpoints/settings.py`
- `backend/app/api/v1/endpoints/reports.py`

---

## Testing Checklist

### ✅ Phase 1: Books Catalog Testing

- [ ] **Authentication**
  - [ ] Unauthenticated requests return 401
  - [ ] Expired token returns 401
  - [ ] Valid token grants access

- [ ] **CRUD Operations**
  - [ ] Create book with English data
  - [ ] Create book with bilingual data (EN + AR)
  - [ ] Fetch book by ID
  - [ ] Update book details
  - [ ] Delete book
  - [ ] Verify deleted book is gone

- [ ] **Search & Filters**
  - [ ] Search by title (English)
  - [ ] Search by title (Arabic)
  - [ ] Search by author (English)
  - [ ] Search by author (Arabic)
  - [ ] Search by ISBN
  - [ ] Filter by category
  - [ ] Filter by status
  - [ ] Filter by language
  - [ ] Filter by publication year range
  - [ ] Combine multiple filters

- [ ] **Sorting**
  - [ ] Sort by title ascending
  - [ ] Sort by title descending
  - [ ] Sort by author
  - [ ] Sort by publication year
  - [ ] Sort by created date

- [ ] **Pagination**
  - [ ] Page 1 loads correctly
  - [ ] Navigate to page 2
  - [ ] Navigate to last page
  - [ ] Change page size (10, 25, 50)
  - [ ] Total pages calculated correctly

- [ ] **Bulk Operations**
  - [ ] Select multiple books
  - [ ] Bulk update status
  - [ ] Bulk update category
  - [ ] Bulk delete books

- [ ] **Quantity Management**
  - [ ] Update quantity
  - [ ] Available count updates correctly
  - [ ] Cannot set quantity below checked-out count

- [ ] **Statistics**
  - [ ] Total books correct
  - [ ] Total copies correct
  - [ ] Available copies correct
  - [ ] By category breakdown correct
  - [ ] By language breakdown correct

- [ ] **Categories**
  - [ ] List all categories
  - [ ] Create new category (bilingual)
  - [ ] Update category
  - [ ] Delete category (only if no books)
  - [ ] Category dropdown in book form

- [ ] **Bilingual Support**
  - [ ] Switch to Arabic - UI in Arabic
  - [ ] Switch to Arabic - book titles in Arabic displayed
  - [ ] Switch to English - UI in English
  - [ ] Switch to English - book titles in English displayed
  - [ ] RTL layout correct in Arabic
  - [ ] LTR layout correct in English
  - [ ] Forms accept Arabic text
  - [ ] Search works with Arabic text

- [ ] **Error Handling**
  - [ ] Network error displays toast
  - [ ] Validation error displays inline
  - [ ] Duplicate ISBN shows error
  - [ ] Required fields validated

- [ ] **Loading States**
  - [ ] Skeleton loader shows on initial load
  - [ ] Button shows spinner during save
  - [ ] Pagination disabled during load

- [ ] **UI/UX**
  - [ ] Book cards display correctly
  - [ ] Modal opens/closes smoothly
  - [ ] Animations work
  - [ ] Responsive on mobile
  - [ ] Responsive on tablet
  - [ ] Breadcrumbs show correct path

---

### ✅ Phase 2: Circulation Testing

- [ ] **Issue Book Flow**
  - [ ] Open issue book modal
  - [ ] Select user from dropdown
  - [ ] Select book from dropdown
  - [ ] Set due date
  - [ ] Submit form
  - [ ] Book status changes to "checked_out"
  - [ ] Available count decreases
  - [ ] Record appears in circulation table
  - [ ] Success toast displays

- [ ] **Return Book Flow**
  - [ ] Open return book modal
  - [ ] Select active circulation record
  - [ ] Return date auto-filled (today)
  - [ ] Submit form
  - [ ] Book status changes to "available"
  - [ ] Available count increases
  - [ ] Record status changes to "returned"
  - [ ] Success toast displays

- [ ] **Fine Calculation**
  - [ ] Returned on time - no fine
  - [ ] Returned 1 day late - fine calculated
  - [ ] Returned 7 days late - fine calculated
  - [ ] Fine amount displayed in return modal
  - [ ] Fine recorded in circulation record

- [ ] **Overdue Detection**
  - [ ] Books past due date marked as overdue
  - [ ] Overdue count in statistics correct
  - [ ] Overdue filter shows only overdue items
  - [ ] Overdue badge displayed on records

- [ ] **Search & Filters**
  - [ ] Filter by status (active, returned, overdue)
  - [ ] Filter by user
  - [ ] Filter by book
  - [ ] Filter by date range
  - [ ] Search by user name
  - [ ] Search by book title

- [ ] **Statistics**
  - [ ] Total issued count correct
  - [ ] Currently active count correct
  - [ ] Overdue count correct
  - [ ] Returned today count correct
  - [ ] Total fines correct
  - [ ] Most borrowed books list correct

- [ ] **CSV Export**
  - [ ] Export all records
  - [ ] Export filtered records
  - [ ] File downloads correctly
  - [ ] File contains correct data
  - [ ] File name includes timestamp

- [ ] **Bilingual Support**
  - [ ] User names display in current language
  - [ ] Book titles display in current language
  - [ ] Status labels translated
  - [ ] Date formats correct per locale
  - [ ] RTL layout correct

- [ ] **Validation**
  - [ ] Cannot issue unavailable book
  - [ ] Cannot issue to inactive user
  - [ ] Due date must be future date
  - [ ] Cannot return already returned book

- [ ] **Error Handling**
  - [ ] Network error shows toast
  - [ ] Validation errors shown inline
  - [ ] Book not available error
  - [ ] User not found error

---

### ✅ Phase 3: Authentication Testing

- [ ] **Login Flow**
  - [ ] Login with valid credentials
  - [ ] Login with invalid credentials (wrong password)
  - [ ] Login with non-existent email
  - [ ] Login with inactive account
  - [ ] Access token received
  - [ ] Refresh token received
  - [ ] User data received
  - [ ] Redirected to dashboard

- [ ] **Token Refresh**
  - [ ] Access token expires after 30 minutes
  - [ ] Refresh token automatically used
  - [ ] New access token received
  - [ ] Request retried with new token
  - [ ] No interruption to user

- [ ] **Protected Routes**
  - [ ] Unauthenticated user redirected to login
  - [ ] Authenticated user can access dashboard
  - [ ] Token in Authorization header
  - [ ] Expired token triggers refresh
  - [ ] Invalid token redirects to login

- [ ] **Logout**
  - [ ] Logout button clicked
  - [ ] Tokens cleared from storage
  - [ ] Redirected to login page
  - [ ] Cannot access protected routes after logout

- [ ] **Current User**
  - [ ] `/auth/me` returns user data
  - [ ] User data matches logged-in user
  - [ ] User role correct
  - [ ] User profile displays correctly

- [ ] **Role-Based Access**
  - [ ] Admin can access all routes
  - [ ] Librarian can access circulation
  - [ ] User can only view their own data
  - [ ] Insufficient permissions returns 403

---

### ✅ Phase 4: End-to-End Testing

- [ ] **Complete User Journey**
  1. [ ] Login as admin
  2. [ ] View dashboard statistics
  3. [ ] Navigate to users page
  4. [ ] Create new user (member)
  5. [ ] Navigate to books catalog
  6. [ ] Add new book (bilingual)
  7. [ ] Navigate to circulation
  8. [ ] Issue book to new user
  9. [ ] Check statistics updated
  10. [ ] Switch language to Arabic
  11. [ ] Verify all UI in Arabic
  12. [ ] Return book
  13. [ ] View reports
  14. [ ] Export data to CSV
  15. [ ] Change settings
  16. [ ] Logout
  17. [ ] Login as regular user
  18. [ ] Verify limited access

- [ ] **Bilingual Consistency**
  - [ ] All pages in English
  - [ ] All pages in Arabic
  - [ ] Data displays in both languages
  - [ ] No missing translations
  - [ ] RTL layout throughout
  - [ ] Dates formatted per locale
  - [ ] Numbers formatted per locale

---

## Future Enhancements

### Phase 4: Advanced Features (Optional)

1. **Mobile App**
   - React Native app for users
   - Barcode scanning for book checkout
   - Push notifications for due dates
   - Offline mode

2. **Advanced Search**
   - Full-text search with Elasticsearch
   - Fuzzy matching
   - Search suggestions
   - Recent searches

3. **Recommendations**
   - Personalized book recommendations
   - "Users who borrowed this also borrowed..."
   - Popular books in user's favorite categories

4. **Waiting List**
   - Users can join waitlist for checked-out books
   - Automatic notification when available
   - Priority based on request date

5. **E-Books Integration**
   - Digital books support
   - Online reading interface
   - DRM protection
   - Download for offline reading

6. **Advanced Analytics**
   - Machine learning insights
   - Trend forecasting
   - User behavior analysis
   - Collection optimization suggestions

7. **Multi-Library Support**
   - Multiple library branches
   - Inter-library transfers
   - Unified catalog
   - Branch-specific settings

8. **Integration APIs**
   - REST API for third-party apps
   - Webhooks for events
   - OAuth2 for external auth
   - OpenAPI documentation

9. **Social Features**
   - Book reviews and ratings
   - Reading lists/shelves
   - Friend recommendations
   - Book clubs

10. **Automated Processes**
    - Auto-email overdue reminders
    - Auto-generate reports
    - Auto-backup database
    - Auto-archive old records

---

## Summary

### Current Completion: 70%

**✅ Completed:**
- Authentication (login/logout)
- Dashboard with statistics
- User management (full CRUD)
- Reports & analytics
- Settings management
- Bilingual support infrastructure
- RTL layout throughout
- Translation files complete

**⚠️ In Progress:**
- Books catalog backend integration
- Circulation backend integration
- Authentication completion (JWT middleware)

**❌ Not Started:**
- Analytics UI
- Fines management UI
- Notifications system
- Global search

### Estimated Time to 100% Completion

- **Phase 1 (Critical):** 5 days (40 hours)
- **Phase 2 (Medium Priority):** 5 days (40 hours)
- **Phase 3 (Low Priority):** 3 days (24 hours)

**Total:** ~13 days (104 hours) for complete system

---

## Next Steps

1. **Start with Phase 1, Day 1-2: Books Catalog Integration**
   - Create `frontend/lib/api/books.ts`
   - Create `frontend/lib/types/books.ts`
   - Create `frontend/hooks/useBooks.ts`
   - Update catalog page to use API

2. **Continue with Phase 1, Day 3-4: Circulation Integration**
   - Create `frontend/lib/api/circulation.ts`
   - Create `frontend/lib/types/circulation.ts`
   - Create `frontend/hooks/useCirculation.ts`
   - Update circulation page to use API

3. **Complete Phase 1, Day 5: Authentication**
   - Implement JWT middleware
   - Add `/auth/refresh` and `/auth/me` endpoints
   - Update all protected routes
   - Remove `X-User-Id` header workaround

4. **Test Thoroughly**
   - Use testing checklist above
   - Test in both languages (Arabic/English)
   - Test on different devices
   - Fix any bugs

5. **Deploy to Production**
   - Backend to Render/Heroku
   - Frontend to Vercel/Netlify
   - Set up environment variables
   - Configure domain and SSL

---

**Document End**

For questions or clarifications, please refer to:
- Backend API documentation: `backend/README.md`
- Frontend documentation: `frontend/README.md`
- Settings page design: `.claude/settings-page-design-prompt.md`
