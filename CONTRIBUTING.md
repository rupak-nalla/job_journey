# Contributing to JobJourney

First off, thank you for considering contributing to Job Application Tracker! It's people like you that make this tool better for everyone.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if relevant**
- **Include your environment details** (OS, browser, Python version, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the proposed functionality**
- **Explain why this enhancement would be useful**
- **List some examples of how it would be used**

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Make your changes**
3. **Follow the coding standards** (see below)
4. **Test your changes thoroughly**
5. **Update documentation** if needed
6. **Write descriptive commit messages**
7. **Submit a pull request**

## Development Setup

### Prerequisites
- Python 3.12+
- Node.js 18+
- Git

### Setup Steps

1. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/job-tracker.git
   cd job-tracker
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   python manage.py migrate
   python manage.py runserver
   ```

3. **Frontend Setup** (in a new terminal)
   ```bash
   cd frontend
   npm install
   cp .env.local.example .env.local
   npm run dev
   ```

## Coding Standards

### Backend (Python/Django)

- **Follow PEP 8** style guide
- **Use meaningful variable names**
- **Write docstrings** for functions and classes
- **Keep functions small and focused**
- **Use type hints** where appropriate

Example:
```python
def calculate_success_rate(applications: list) -> float:
    """
    Calculate the success rate of job applications.
    
    Args:
        applications: List of job application objects
        
    Returns:
        Float representing success rate percentage
    """
    if not applications:
        return 0.0
    # ... implementation
```

### Frontend (JavaScript/React)

- **Use Prettier** for formatting
- **Follow Next.js conventions**
- **Use meaningful component names**
- **Keep components small and reusable**
- **Use prop-types or TypeScript** for type checking

Example:
```javascript
/**
 * StatusBadge component displays application status
 * @param {string} status - The application status
 * @returns {JSX.Element}
 */
export function StatusBadge({ status }) {
  // ... implementation
}
```

### Git Commit Messages

- **Use the present tense** ("Add feature" not "Added feature")
- **Use the imperative mood** ("Move cursor to..." not "Moves cursor to...")
- **Limit the first line to 72 characters**
- **Reference issues and pull requests** after the first line

Example:
```
Add interview scheduling feature

- Implement modal for interview details
- Add backend API for interview creation
- Update dashboard to show upcoming interviews

Fixes #123
```

### Commit Message Format

We follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(dashboard): add interview scheduling modal
fix(api): correct status update endpoint
docs(readme): update installation instructions
```

## Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm run lint
npm run format:check
```

### Manual Testing Checklist

Before submitting a PR, test:
- [ ] Adding new application
- [ ] Editing application
- [ ] Deleting application
- [ ] Changing status to "Interviewing"
- [ ] Viewing application details
- [ ] Resume upload
- [ ] Dashboard statistics update
- [ ] Responsive design on mobile
- [ ] Error handling

## Project Structure

```
job-tracker/
├── backend/           # Django backend
│   ├── applications/  # Main app
│   └── job_journey/   # Settings
└── frontend/          # Next.js frontend
    └── src/
        ├── app/       # Pages
        ├── components/# Reusable components
        ├── config/    # Configuration
        └── utils/     # Utilities
```

## Adding New Features

### Backend Feature
1. Create/update models in `backend/applications/models.py`
2. Create migrations: `python manage.py makemigrations`
3. Update serializers in `backend/applications/serializers.py`
4. Add/update views in `backend/applications/views.py`
5. Update URLs in `backend/applications/urls.py`
6. Test with Django admin or API client

### Frontend Feature
1. Create/update components in `frontend/src/components/`
2. Update pages in `frontend/src/app/`
3. Update API config in `frontend/src/config/api.js`
4. Add styles using Tailwind classes
5. Test in browser

## Documentation

- Update `README.md` for user-facing changes
- Update inline code comments for complex logic
- Update API documentation for endpoint changes
- Add JSDoc/docstrings for new functions

## Release Process

1. Update version numbers
2. Update CHANGELOG.md
3. Create release notes
4. Tag the release
5. Deploy to production

## Questions?

Feel free to open an issue for:
- Questions about the codebase
- Clarifications on contributing guidelines
- Feature discussions

## Recognition

Contributors will be:
- Listed in the README
- Credited in release notes
- Thanked in the community

Thank you for contributing! 🎉
