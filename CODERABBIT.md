# CodeRabbit Integration Guide

## Overview

CodeRabbit is an AI-powered code review tool that automatically reviews pull requests, providing intelligent feedback on code quality, security, performance, and best practices.

## Features

### 🤖 Automated Reviews
- **AI-Powered Analysis**: Uses advanced AI models to understand code context
- **Comprehensive Coverage**: Reviews code, documentation, and tests
- **Context-Aware**: Understands project structure and patterns

### 🔒 Security Scanning
- Identifies security vulnerabilities
- Checks for common security anti-patterns
- Suggests security best practices

### ⚡ Performance Optimization
- Identifies performance bottlenecks
- Suggests optimizations
- Reviews database queries and API calls

### 📚 Best Practices
- Django best practices for backend code
- React/Next.js best practices for frontend
- API design patterns
- Code maintainability

### ✨ Auto-Fix Suggestions
- Formatting issues
- Linting errors
- Simple refactoring opportunities

## Setup

### Step 1: Install CodeRabbit GitHub App

1. Visit [CodeRabbit GitHub App](https://github.com/apps/coderabbitai)
2. Click **"Install"**
3. Select this repository (`job_tracker`)
4. Grant necessary permissions:
   - Read access to code
   - Write access to pull requests (for comments)
   - Read access to metadata

### Step 2: Configuration

The repository includes a `.coderabbit.yaml` configuration file with the following settings:

```yaml
# Review settings
reviews:
  pull_requests:
    enabled: true
  code_suggestions:
    enabled: true
  documentation:
    enabled: true

# Paths to review
paths:
  include:
    - backend/**/*.py
    - frontend/src/**/*.{js,jsx}
  exclude:
    - node_modules/**
    - venv/**
    - migrations/**
```

### Step 3: Optional - GitHub Actions Integration

For advanced features, you can use the GitHub Actions workflow:

1. **Add OpenAI API Key** (optional):
   - Go to repository Settings → Secrets and variables → Actions
   - Add new secret: `OPENAI_API_KEY`
   - Get your API key from [OpenAI](https://platform.openai.com/api-keys)

2. **Workflow File**:
   - Already configured in `.github/coderabbit.yml`
   - Automatically runs on pull requests

## Configuration

### Customizing Reviews

Edit `.coderabbit.yaml` to customize:

```yaml
# Focus areas
focus:
  - code_quality
  - security
  - performance
  - best_practices
  - documentation
  - testing

# Comment settings
comments:
  max_comments: 50
  minor_issues: true
  suggestions: true

# Auto-fix settings
auto_fix:
  enabled: true
  types:
    - formatting
    - linting
    - simple_refactoring
```

### Path Filters

Include/exclude specific paths:

```yaml
paths:
  include:
    - backend/**/*.py
    - frontend/src/**/*.{js,jsx}
  exclude:
    - node_modules/**
    - venv/**
    - __pycache__/**
    - migrations/**
    - tests/**
```

### Ignore Patterns

Ignore specific file patterns:

```yaml
ignore:
  - "*.test.js"
  - "*.spec.js"
  - "__pycache__"
  - "migrations"
```

## Usage

### Automatic Reviews

CodeRabbit automatically reviews:
- ✅ New pull requests
- ✅ Updated pull requests (on new commits)
- ✅ Reopened pull requests

### Review Types

1. **Code Quality**
   - Code structure and organization
   - Naming conventions
   - Code complexity

2. **Security**
   - SQL injection risks
   - XSS vulnerabilities
   - Authentication issues
   - Data validation

3. **Performance**
   - Database query optimization
   - API response times
   - Frontend rendering performance

4. **Best Practices**
   - Django patterns
   - React hooks usage
   - Error handling
   - State management

5. **Documentation**
   - Function/class documentation
   - README updates
   - Code comments

### Review Comments

CodeRabbit provides:
- **Inline Comments**: On specific lines of code
- **Summary Comments**: Overall PR review
- **Suggestions**: Actionable improvements
- **Auto-fix**: Simple fixes that can be applied automatically

## Examples

### Example Review Comment

```python
# Before
def get_user(id):
    return User.objects.get(id=id)

# CodeRabbit suggests:
def get_user(user_id: int) -> User:
    """
    Retrieve a user by ID.
    
    Args:
        user_id: The ID of the user to retrieve
        
    Returns:
        User instance
        
    Raises:
        User.DoesNotExist: If user not found
    """
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise
```

### Security Review

```python
# CodeRabbit flags:
user_input = request.GET.get('query')
query = f"SELECT * FROM users WHERE name = '{user_input}'"

# Suggests:
from django.db import connection
user_input = request.GET.get('query')
with connection.cursor() as cursor:
    cursor.execute("SELECT * FROM users WHERE name = %s", [user_input])
```

## Best Practices

### 1. Review CodeRabbit Suggestions

- Read all suggestions carefully
- Apply relevant improvements
- Ask questions if unclear

### 2. Use Auto-fix Wisely

- Review auto-fix suggestions before applying
- Test after applying fixes
- Don't auto-fix complex logic changes

### 3. Customize Configuration

- Adjust focus areas based on project needs
- Exclude files that don't need review
- Set appropriate comment limits

### 4. Integrate with CI/CD

- Use GitHub Actions for automated reviews
- Combine with other quality tools
- Set up review requirements

## Troubleshooting

### CodeRabbit Not Reviewing PRs

1. **Check App Installation**:
   - Verify CodeRabbit app is installed
   - Check repository permissions

2. **Check Configuration**:
   - Verify `.coderabbit.yaml` exists
   - Check path filters

3. **Check Workflow**:
   - Verify `.github/coderabbit.yml` is correct
   - Check GitHub Actions logs

### Too Many Comments

Adjust in `.coderabbit.yaml`:
```yaml
comments:
  max_comments: 20  # Reduce from default
  minor_issues: false  # Disable minor issues
```

### Missing Reviews

1. Check if paths are excluded
2. Verify file extensions are included
3. Check ignore patterns

## Advanced Configuration

### Custom Instructions

Add project-specific instructions:

```yaml
instructions: |
  This is a Job Tracker application with:
  - Backend: Django REST Framework
  - Frontend: Next.js with React 19
  
  Focus on:
  1. Django best practices
  2. React/Next.js patterns
  3. API design
  4. Security
```

### Model Settings

```yaml
model:
  provider: openai
  temperature: 0.2  # Lower = more focused
```

### Review Triggers

```yaml
reviews:
  pull_requests:
    enabled: true
  commits:
    enabled: true
  code_suggestions:
    enabled: true
```

## Integration with Other Tools

### ESLint / Prettier
CodeRabbit works alongside:
- ESLint for JavaScript linting
- Prettier for code formatting
- Black for Python formatting

### Testing
CodeRabbit reviews:
- Test coverage
- Test quality
- Test organization

### CI/CD
Integrates with:
- GitHub Actions
- Automated testing
- Deployment pipelines

## Resources

- [CodeRabbit Documentation](https://docs.coderabbit.ai)
- [GitHub App](https://github.com/apps/coderabbitai)
- [Configuration Guide](https://docs.coderabbit.ai/configuration)
- [Best Practices](https://docs.coderabbit.ai/best-practices)

## Support

For issues or questions:
1. Check [CodeRabbit Documentation](https://docs.coderabbit.ai)
2. Review configuration in `.coderabbit.yaml`
3. Check GitHub Actions logs
4. Open an issue in the repository

---

**Last Updated**: February 3, 2026  
**Status**: ✅ Configured and Ready
