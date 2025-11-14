# 🛠️ NAWRA - Development Setup Guide

Get NAWRA running on your local machine in minutes!

---

## ⚡ Quick Start (5 Minutes)

### Option 1: Docker (Easiest)

```bash
# 1. Clone repository
git clone https://github.com/your-org/nawra-lms.git
cd nawra-lms

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env with your Supabase credentials
nano .env

# 4. Start everything
docker-compose up -d

# 5. Visit http://localhost:3000
# Login: admin@ministry.om / Admin@123
```

**Done! 🎉**

---

## 🔧 Option 2: Manual Setup

### Prerequisites

- **Node.js 20+** - `node --version`
- **Python 3.11+** - `python --version`
- **PostgreSQL 15+** OR Supabase account

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
nano .env  # Add your credentials

# Start server
uvicorn main:app --reload --port 8000
```

Backend running at: http://localhost:8000

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
nano .env.local  # Should point to http://localhost:8000/api/v1

# Start development server
npm run dev
```

Frontend running at: http://localhost:3000

---

## 📊 Database Setup

### Using Supabase (Recommended)

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Click "New Project"
   - Note your credentials

2. **Run Migrations**
   - Open Supabase Dashboard → SQL Editor
   - Copy and run each file:

   ```sql
   -- Run in order:
   1. backend/sql/001_initial_schema.sql
   2. backend/migrations/002_create_books_tables.sql
   3. backend/migrations/003_create_circulation_tables.sql
   4. backend/migrations/create_user_settings_table.sql
   ```

3. **Create Storage Bucket**
   - Storage → New Bucket
   - Name: `library-files`
   - Public: ✅ Yes

4. **Get Credentials**
   - Settings → API
   - Copy:
     - Project URL
     - anon/public key
     - service_role key
   - Settings → Database → Connection String

5. **Update .env Files**

   `backend/.env`:
   ```bash
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_KEY=eyJxxxxx...
   SUPABASE_SERVICE_KEY=eyJxxxxx...
   DATABASE_URL=postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres
   SECRET_KEY=your-secret-key-here
   RESEND_API_KEY=re_xxxxx  # Optional for now
   ```

   `frontend/.env.local`:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

---

## 🧪 Testing the Setup

### 1. Test Backend

```bash
# Health check
curl http://localhost:8000/health

# Get API docs
open http://localhost:8000/docs

# Test users endpoint
curl http://localhost:8000/api/v1/users/stats
```

### 2. Test Frontend

```bash
# Open in browser
open http://localhost:3000

# Login with:
Email: admin@ministry.om
Password: Admin@123
```

### 3. Test Features

- [ ] Login works
- [ ] Dashboard loads
- [ ] Users page shows data
- [ ] Books catalog loads
- [ ] Can create a new user
- [ ] Can add a new book

---

## 🔑 Default Test Accounts

| Role | Email | Password | Use For |
|------|-------|----------|---------|
| Administrator | `admin@ministry.om` | `Admin@123` | Full access |
| Librarian | `librarian@ministry.om` | `Admin@123` | Catalog + Circulation |
| Circulation Staff | `circulation@ministry.om` | `Admin@123` | Check-in/out |
| Cataloger | `cataloger@ministry.om` | `Admin@123` | Catalog only |
| Patron | `patron@ministry.om` | `Admin@123` | End-user view |

---

## 📁 Project Structure

```
nawra-lms/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── models/         # Pydantic models
│   │   ├── services/       # Business logic
│   │   ├── core/           # Config & security
│   │   └── db/             # Database client
│   ├── migrations/         # Database migrations
│   ├── requirements.txt    # Python dependencies
│   └── main.py            # App entry point
│
├── frontend/               # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── lib/               # Utilities & API clients
│   ├── messages/          # Translations (AR/EN)
│   └── package.json       # Node dependencies
│
├── docker-compose.yml     # Docker setup
└── README.md             # Main documentation
```

---

## 🎨 Development Tools

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "ms-python.python",
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag"
  ]
}
```

### Code Formatting

```bash
# Backend (Black)
cd backend
black .

# Frontend (Prettier)
cd frontend
npm run format
```

### Run Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

---

## 🐛 Common Development Issues

### Issue: "Module not found"

**Backend:**
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

**Frontend:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Database connection failed"

1. Check Supabase project is running
2. Verify DATABASE_URL in .env
3. Test connection:
   ```bash
   python -c "from app.db.supabase_client import get_supabase_client; client = get_supabase_client(); print('✅ Connected')"
   ```

### Issue: "CORS error"

Add to `backend/.env`:
```bash
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Issue: "Port already in use"

```bash
# Find and kill process
# Backend (port 8000)
lsof -ti:8000 | xargs kill -9

# Frontend (port 3000)
lsof -ti:3000 | xargs kill -9
```

---

## 🔄 Development Workflow

### Daily Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
cd backend && pip install -r requirements.txt
cd ../frontend && npm install

# 3. Start development servers
# Terminal 1: Backend
cd backend && uvicorn main:app --reload

# Terminal 2: Frontend
cd frontend && npm run dev

# 4. Make changes and test
# 5. Commit and push
git add .
git commit -m "Description of changes"
git push
```

### Adding New Features

1. **Create feature branch**
   ```bash
   git checkout -b feature/new-feature-name
   ```

2. **Make changes**
   - Backend: Add endpoint in `backend/app/api/v1/endpoints/`
   - Frontend: Add page/component in `frontend/`

3. **Test locally**
   - Test API: http://localhost:8000/docs
   - Test UI: http://localhost:3000

4. **Commit and push**
   ```bash
   git add .
   git commit -m "Add new feature"
   git push origin feature/new-feature-name
   ```

5. **Create Pull Request**
   - Go to GitHub
   - Create PR from feature branch to main

---

## 📚 Learn More

### Documentation

- **Backend API:** http://localhost:8000/docs (Swagger UI)
- **FastAPI:** https://fastapi.tiangolo.com/
- **Next.js:** https://nextjs.org/docs
- **Supabase:** https://supabase.com/docs

### Key Technologies

- **Backend:** FastAPI, Python 3.11, Supabase (PostgreSQL)
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Auth:** JWT tokens, bcrypt
- **i18n:** next-intl (Arabic/English)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## ❓ FAQ

**Q: Do I need to pay for Supabase?**
A: No, Supabase has a generous free tier perfect for development.

**Q: Can I use a local PostgreSQL instead of Supabase?**
A: Yes, but you'll need to set up the database yourself and won't have the storage feature.

**Q: How do I add sample data?**
A: Use the Swagger UI at http://localhost:8000/docs to create books, users, etc.

**Q: Where are the translations?**
A: `frontend/messages/en.json` and `frontend/messages/ar.json`

**Q: How do I add a new API endpoint?**
A: Create it in `backend/app/api/v1/endpoints/` and it will auto-register.

---

## 📞 Need Help?

- 📧 Email: support@nawra.om
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/nawra-lms/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-org/nawra-lms/discussions)

---

**Happy Coding! 🚀**

**نَوْرَة • Enlightening Knowledge**
