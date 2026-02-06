# Tests Directory

This directory contains all tests for the JobJourney application, organized into backend and frontend subdirectories.

## Structure

```
tests/
├── backend/           # Backend (Django) tests
│   └── applications/
│       ├── __init__.py
│       ├── test_models.py
│       ├── test_serializers.py
│       ├── test_views.py
│       └── test_integration.py
└── frontend/          # Frontend (Next.js) tests
    ├── app/
    │   ├── test_page.js
    │   ├── add-application/
    │   │   └── test_page.js
    │   └── application/
    │       └── test_page.js
    ├── config/
    │   └── test_api.js
    ├── utils/
    │   └── test_colors.js
    └── components/
        └── test_ErrorBoundary.js
```

## Test Mapping

### Backend
- `backend/applications/models.py` → `tests/backend/applications/test_models.py`
- `backend/applications/views.py` → `tests/backend/applications/test_views.py`
- `backend/applications/serializers.py` → `tests/backend/applications/test_serializers.py`

### Frontend
- `frontend/src/config/api.js` → `tests/frontend/config/test_api.js`
- `frontend/src/utils/colors.js` → `tests/frontend/utils/test_colors.js`
- `frontend/src/components/ErrorBoundary.js` → `tests/frontend/components/test_ErrorBoundary.js`
- `frontend/src/app/page.js` → `tests/frontend/app/test_page.js`

## Running Tests

### Backend Tests
```bash
# From root directory
cd backend
python manage.py test ../tests/backend

# From backend directory
python manage.py test ../tests/backend --verbosity=2
```

### Frontend Tests
```bash
# From root directory
cd frontend
npm test

# CI mode
npm run test:ci
```

## Test Statistics

- **Backend**: 29 tests (100% coverage)
- **Frontend**: 24 tests (90%+ coverage)
- **Total**: 53 tests

## Adding New Tests

When adding a new feature:

1. **Backend**: Create test file in `tests/backend/applications/test_<feature>.py`
2. **Frontend**: Create test file in `tests/frontend/<folder>/test_<file>.js`

Both should mirror the structure of the source code they're testing.

---

See [TESTING.md](../TESTING.md) for complete testing documentation.
