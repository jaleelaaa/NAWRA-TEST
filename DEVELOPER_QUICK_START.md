# Developer Quick Start Guide
## Get Started with NAWRA Development in 5 Minutes

This guide will help you set up your development environment and start contributing to NAWRA.

---

## 🚀 Quick Setup

### 1. Prerequisites Check

```bash
# Check Node.js version (need 18+)
node --version

# Check Python version (need 3.11+)
python --version

# Check Git
git --version
```

### 2. Clone & Install

```bash
# Clone the repository
git clone https://github.com/jaleelaaa/NAWRA-TEST.git
cd NAWRA-TEST

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Environment Setup

**Frontend (.env.local):**
```bash
cd frontend
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Backend (.env):**
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your Supabase credentials.

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📱 Phase 4 Features (PWA & Mobile)

### New Components Added

#### 1. PWA Components
```typescript
// PWA Initializer - Auto-registers service worker
import { PWAInitializer } from '@/components/pwa/PWAInitializer';

// In your layout or app
<PWAInitializer />
```

#### 2. Barcode Scanner
```typescript
// Full scanner with dialog
import { BarcodeLookupDialog } from '@/components/barcode/BarcodeLookupDialog';

<BarcodeLookupDialog
  onBookFound={(book) => console.log(book)}
  redirectOnFind={true}
/>

// Scanner only
import { BarcodeScanner } from '@/components/barcode/BarcodeScanner';

<BarcodeScanner
  onScan={(barcode) => handleBarcode(barcode)}
  onClose={() => setOpen(false)}
/>
```

#### 3. Mobile Navigation
```typescript
// Bottom navigation for mobile
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';

// Add to your layout
<MobileBottomNav />
```

#### 4. Mobile Quick Search
```typescript
import { MobileQuickSearch } from '@/components/mobile/MobileQuickSearch';

<MobileQuickSearch
  onClose={() => setOpen(false)}
  autoFocus
/>
```

#### 5. Advanced Search
```typescript
import { AdvancedSearchDialog } from '@/components/search/AdvancedSearchDialog';

<AdvancedSearchDialog
  onSearch={(filters) => handleSearch(filters)}
  initialFilters={{}}
/>
```

### Service Worker Management

```typescript
import {
  register,
  unregister,
  updateServiceWorker,
  isAppInstalled,
  subscribeToPushNotifications
} from '@/lib/pwa/serviceWorkerRegistration';

// Register SW
register({
  onSuccess: () => console.log('SW registered'),
  onUpdate: () => console.log('Update available'),
});

// Check if installed
const installed = isAppInstalled();

// Force update
updateServiceWorker();

// Subscribe to push
const subscription = await subscribeToPushNotifications();
```

### Barcode API Functions

```typescript
import { getBookByBarcode, generateBarcode } from '@/lib/api/books';

// Lookup by barcode
const book = await getBookByBarcode('1234567890');

// Generate barcode
const result = await generateBarcode(bookId);
```

---

## 🏗️ Project Structure

```
NAWRA-TEST/
├── frontend/
│   ├── app/                      # Next.js App Router
│   │   ├── [locale]/            # Localized routes
│   │   │   ├── dashboard/
│   │   │   ├── login/
│   │   │   └── admin/
│   │   │       ├── catalog/
│   │   │       ├── circulation/
│   │   │       ├── reports/
│   │   │       ├── settings/
│   │   │       └── users/
│   │   └── layout.tsx           # Root layout
│   ├── components/
│   │   ├── ui/                  # Radix UI components
│   │   ├── pwa/                 # PWA components ⭐
│   │   ├── barcode/             # Barcode components ⭐
│   │   ├── mobile/              # Mobile components ⭐
│   │   ├── search/              # Search components ⭐
│   │   ├── books/
│   │   ├── circulation/
│   │   ├── dashboard/
│   │   ├── reports/
│   │   └── users/
│   ├── lib/
│   │   ├── api/                 # API client functions
│   │   ├── pwa/                 # PWA utilities ⭐
│   │   ├── types/               # TypeScript types
│   │   └── utils.ts
│   ├── hooks/                   # React hooks
│   ├── stores/                  # Zustand stores
│   ├── messages/                # i18n translations
│   ├── public/
│   │   ├── manifest.json        # PWA manifest ⭐
│   │   ├── sw.js                # Service worker ⭐
│   │   ├── icons/               # PWA icons ⭐
│   │   └── robots.txt           # SEO ⭐
│   └── scripts/
│       └── generate-icons.js    # Icon generator ⭐
│
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # API routes
│   │   ├── core/               # Config & security
│   │   ├── db/                 # Database
│   │   ├── models/             # Pydantic models
│   │   └── services/           # Business logic
│   ├── migrations/             # SQL migrations
│   └── main.py                 # FastAPI app
│
└── docs/                       # Documentation
```

⭐ = New in Phase 4

---

## 🔧 Common Development Tasks

### Add a New Page

```bash
# Create page file
touch frontend/app/[locale]/admin/my-feature/page.tsx
```

```typescript
// page.tsx
export default function MyFeaturePage() {
  return (
    <div>
      <h1>My Feature</h1>
    </div>
  );
}
```

### Add a New API Endpoint

```python
# backend/app/api/v1/endpoints/my_endpoint.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_items():
    return {"items": []}
```

```python
# Register in backend/app/api/v1/router.py
from .endpoints import my_endpoint

api_router.include_router(
    my_endpoint.router,
    prefix="/my-endpoint",
    tags=["my-endpoint"]
)
```

### Add a New Component

```bash
# Create component
touch frontend/components/my-component/MyComponent.tsx
```

```typescript
// MyComponent.tsx
'use client';

interface MyComponentProps {
  title: string;
}

export function MyComponent({ title }: MyComponentProps) {
  return <div>{title}</div>;
}
```

### Add Translations

```json
// frontend/messages/en.json
{
  "myFeature": {
    "title": "My Feature",
    "description": "Feature description"
  }
}

// frontend/messages/ar.json
{
  "myFeature": {
    "title": "ميزتي",
    "description": "وصف الميزة"
  }
}
```

```typescript
// Use in component
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('myFeature');
  return <h1>{t('title')}</h1>;
}
```

---

## 🧪 Testing

### Frontend Tests

```bash
cd frontend

# Unit tests (if configured)
npm test

# E2E tests with Playwright
npm run test:e2e

# Lint
npm run lint

# Type check
npm run type-check
```

### Backend Tests

```bash
cd backend
source venv/bin/activate

# Run all tests
pytest

# Run with coverage
pytest --cov

# Run specific test
pytest tests/test_auth.py
```

### PWA Testing

```bash
# Test service worker
# 1. Open Chrome DevTools
# 2. Go to Application → Service Workers
# 3. Verify registration

# Test offline
# 1. DevTools → Application → Service Workers
# 2. Check "Offline"
# 3. Navigate app

# Run Lighthouse audit
npx lighthouse http://localhost:3000 --view
```

---

## 🐛 Debugging

### Frontend Debugging

**VS Code launch.json:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    }
  ]
}
```

**Browser DevTools:**
- React DevTools extension
- Redux DevTools (if using Redux)
- Network tab for API calls
- Console for errors

### Backend Debugging

**VS Code launch.json:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": [
        "main:app",
        "--reload"
      ],
      "jinja": true
    }
  ]
}
```

**Print Debugging:**
```python
import logging
logger = logging.getLogger(__name__)

logger.debug("Debug message")
logger.info("Info message")
logger.error("Error message")
```

---

## 📦 Building for Production

### Frontend

```bash
cd frontend

# Build
npm run build

# Test production build
npm run start

# Check build size
npm run build -- --analyze
```

### Backend

```bash
cd backend

# No build needed, but ensure:
# 1. Environment variables set
# 2. Dependencies installed
# 3. Migrations run

# Test production mode
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 🔑 Environment Variables Reference

### Frontend

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# PWA (Optional)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_key

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=GA-XXXXXXXXX
```

### Backend

```env
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Security
SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# Email (Optional)
RESEND_API_KEY=your-resend-key

# Push Notifications (Optional)
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_PUBLIC_KEY=your-vapid-public-key
```

---

## 🎨 Code Style

### TypeScript/React

```typescript
// Use functional components
export function MyComponent({ prop }: Props) {
  // Hooks at top
  const [state, setState] = useState();
  const t = useTranslations();

  // Effects after hooks
  useEffect(() => {}, []);

  // Handlers after effects
  const handleClick = () => {};

  // Return at end
  return <div />;
}

// Use TypeScript types
interface Props {
  title: string;
  count?: number;
}

// Use named exports
export { MyComponent };
```

### Python/FastAPI

```python
# Use type hints
def get_user(user_id: UUID) -> User:
    pass

# Use async/await
async def fetch_data():
    result = await db.fetch()
    return result

# Use Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str

# Use dependency injection
@router.get("/")
async def endpoint(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pass
```

---

## 🆘 Getting Help

### Resources
- [Next.js Docs](https://nextjs.org/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

### Project Documentation
- `PHASE_4_IMPLEMENTATION_COMPLETE.md` - Phase 4 features
- `PWA_SETUP_GUIDE.md` - PWA configuration
- `README.md` - Project overview

### Ask for Help
- Check existing issues
- Create a GitHub issue
- Ask in discussions
- Contact the team

---

## ✅ Development Checklist

Before submitting a PR:

- [ ] Code follows style guidelines
- [ ] TypeScript has no errors
- [ ] All tests pass
- [ ] New features have tests
- [ ] Documentation updated
- [ ] Translations added (en + ar)
- [ ] No console errors
- [ ] Tested on Chrome and Firefox
- [ ] Tested mobile responsive
- [ ] Git commit messages are clear

---

## 🚀 Next Steps

1. **Explore the codebase**
   - Read through existing components
   - Understand the folder structure
   - Check the API documentation

2. **Try the PWA features**
   - Install the app
   - Test offline mode
   - Try barcode scanner
   - Use mobile navigation

3. **Make your first contribution**
   - Find a "good first issue"
   - Fix a bug
   - Add a feature
   - Improve documentation

4. **Stay updated**
   - Watch the repository
   - Read commit messages
   - Check the project board

---

**Happy Coding! 🎉**

If you have questions, don't hesitate to ask!
