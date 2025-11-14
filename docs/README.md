# 📚 NAWRA Documentation

Welcome to the NAWRA Library Management System documentation!

## 📖 Available Guides

### For Users and Testers

#### [🧪 Testing Guide](TESTING_GUIDE.md)
**Perfect for:** Developers, QA Testers, System Administrators

Learn how to:
- Set up and test the application
- Run automated tests with Playwright and Pytest
- Test all features manually
- Verify bilingual support (English/Arabic)
- Generate screenshots for documentation
- Troubleshoot common issues

**Start here if you want to:** Test the system, verify features, or capture screenshots

---

#### [👥 User Guide](USER_GUIDE.md)
**Perfect for:** Librarians, Library Staff, Administrators, End Users

Learn how to:
- Use the library management system
- Manage books and catalog
- Handle circulation operations (check-out/check-in)
- Manage users and patrons
- Generate reports and analytics
- Configure system settings
- Use bilingual features

**Start here if you want to:** Learn how to use NAWRA in your daily library operations

---

## 🖼️ Screenshots

Real screenshots of the NAWRA system are available in the [`screenshots/`](screenshots/) directory:

### Dashboard Views
- `dashboard-english.png` - Main dashboard in English
- `dashboard-arabic.png` - Main dashboard in Arabic (RTL)
- `dashboard-mobile-english.png` - Mobile-optimized view
- `dashboard-tablet-english.png` - Tablet-optimized view

### Comparison Views
- `comparison-english.png` - Feature comparison in English
- `comparison-arabic.png` - Feature comparison in Arabic

### Generating More Screenshots

You can generate fresh screenshots automatically using our Playwright script:

```bash
cd frontend
npx playwright test tests/capture-screenshots.spec.ts
```

Screenshots will be saved to this `docs/screenshots/` directory.

---

## 🚀 Quick Start

### For First-Time Users

1. **Read the [User Guide](USER_GUIDE.md)** to understand how to use the system
2. **Follow the Quick Start section** to get the app running in 5 minutes
3. **Login with test credentials** provided in the guide
4. **Explore the features** using the step-by-step instructions

### For Testers

1. **Read the [Testing Guide](TESTING_GUIDE.md)** for complete testing instructions
2. **Set up your test environment** using Docker or manual installation
3. **Run manual tests** using the feature testing checklist
4. **Run automated tests** to verify system functionality
5. **Report any issues** you find

---

## 📚 Additional Resources

### Technical Documentation

- **API Documentation**: http://localhost:8000/docs (when backend is running)
- **Main README**: [../README.md](../README.md)
- **Architecture Guide**: Coming soon
- **Developer Guide**: Coming soon
- **Deployment Guide**: Coming soon

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Administrator | admin@nawra.om | Admin@123 |
| Librarian | librarian@ministry.om | Librarian@123 |
| Circulation Staff | circulation@ministry.om | Circ@123 |
| Cataloger | cataloger@ministry.om | Cataloger@123 |
| Patron | patron@student.om | Patron@123 |

⚠️ **Note:** These are test credentials only. Change them in production!

---

## 🔗 Useful Links

- **Live Demo**: http://localhost:3000 (local)
- **API Docs**: http://localhost:8000/docs (local)
- **GitHub Repository**: https://github.com/your-username/nawra-lms
- **Issues**: https://github.com/your-username/nawra-lms/issues
- **Discussions**: https://github.com/your-username/nawra-lms/discussions

---

## 🆘 Getting Help

### If you're stuck:

1. **Check the relevant guide** (Testing Guide or User Guide)
2. **Search the FAQ section** in the User Guide
3. **Check common issues** in the Testing Guide
4. **Review API documentation** at http://localhost:8000/docs
5. **Ask for help**:
   - 📧 Email: support@nawra.om
   - 🐛 GitHub Issues: [Create an issue](https://github.com/your-username/nawra-lms/issues)
   - 💬 Discussions: [Start a discussion](https://github.com/your-username/nawra-lms/discussions)

---

## 📝 Document Status

| Document | Status | Last Updated | Version |
|----------|--------|--------------|---------|
| Testing Guide | ✅ Complete | 2025 | 1.0 |
| User Guide | ✅ Complete | 2025 | 1.0 |
| Architecture Guide | 🚧 Coming Soon | - | - |
| Developer Guide | 🚧 Coming Soon | - | - |
| Deployment Guide | 🚧 Coming Soon | - | - |

---

## 🌍 Language Support

All documentation is currently available in **English**.

**Arabic documentation** is coming soon! 🔜

عربي قريباً!

---

## 🤝 Contributing to Documentation

Found a typo? Want to improve the documentation?

1. Fork the repository
2. Edit the documentation files (Markdown)
3. Submit a pull request
4. We'll review and merge!

**Guidelines:**
- Use clear, simple language
- Include screenshots where helpful
- Provide step-by-step instructions
- Test all instructions before submitting
- Follow the existing style and format

---

## 📋 Documentation Standards

Our documentation follows these principles:

- ✅ **Accessible** - Easy for anyone to understand
- ✅ **Comprehensive** - Covers all features and workflows
- ✅ **Up-to-date** - Reflects current system functionality
- ✅ **Visual** - Includes screenshots and examples
- ✅ **Practical** - Focuses on real-world use cases
- ✅ **Searchable** - Well-organized with clear headings

---

## 🎯 Documentation Roadmap

### Planned Documentation

- [ ] Architecture Guide - System design and technical architecture
- [ ] Developer Guide - For contributors and developers
- [ ] Deployment Guide - Production deployment instructions
- [ ] API Guide - Detailed API reference and examples
- [ ] Integration Guide - Integrating with other systems
- [ ] Migration Guide - Migrating from other library systems
- [ ] Troubleshooting Guide - Common problems and solutions
- [ ] Video Tutorials - Visual learning resources

### Translations

- [ ] Arabic (عربي) - Complete translation of all guides
- [ ] French (Français) - For French-speaking users
- [ ] Spanish (Español) - For Spanish-speaking users

---

**Thank you for using NAWRA! 🙏**

*NAWRA - نَوْرَة - Enlightening Knowledge*
