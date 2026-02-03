# CodeRabbit Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Install GitHub App

1. Go to: https://github.com/apps/coderabbitai
2. Click **"Install"**
3. Select **"Only select repositories"**
4. Choose **`job_tracker`** repository
5. Click **"Install"**

### Step 2: Verify Installation

1. Create a test pull request
2. CodeRabbit will automatically comment on the PR
3. Review the suggestions

**That's it!** CodeRabbit is now active. 🎉

---

## 📋 What CodeRabbit Reviews

✅ **Code Quality**
- Code structure and organization
- Naming conventions
- Complexity analysis

✅ **Security**
- SQL injection risks
- XSS vulnerabilities
- Authentication issues
- Data validation

✅ **Performance**
- Database queries
- API optimization
- Frontend rendering

✅ **Best Practices**
- Django patterns
- React/Next.js patterns
- Error handling

✅ **Documentation**
- Function documentation
- Code comments
- README updates

---

## ⚙️ Configuration

The repository includes `.coderabbit.yaml` with optimized settings for:
- Django backend code
- Next.js/React frontend code
- Security scanning
- Performance analysis

### Customize Settings

Edit `.coderabbit.yaml` to adjust:
- Review focus areas
- Comment limits
- Auto-fix preferences
- Path filters

See [CODERABBIT.md](CODERABBIT.md) for detailed configuration options.

---

## 🔧 Optional: Advanced Setup

### GitHub Actions Integration

For advanced features, you can enable the GitHub Actions workflow:

1. **Add OpenAI API Key** (optional):
   - Repository → Settings → Secrets and variables → Actions
   - New repository secret: `OPENAI_API_KEY`
   - Get key from: https://platform.openai.com/api-keys

2. **Workflow is already configured** in `.github/coderabbit.yml`

### Custom Instructions

Add project-specific guidance in `.coderabbit.yaml`:

```yaml
instructions: |
  This is a Job Tracker application.
  Focus on Django REST Framework and Next.js best practices.
```

---

## 📊 Review Examples

### Example 1: Security Issue

**CodeRabbit flags:**
```python
# ❌ Security risk
user_input = request.GET.get('query')
query = f"SELECT * FROM users WHERE name = '{user_input}'"
```

**Suggests:**
```python
# ✅ Safe
from django.db import connection
user_input = request.GET.get('query')
with connection.cursor() as cursor:
    cursor.execute("SELECT * FROM users WHERE name = %s", [user_input])
```

### Example 2: Performance Optimization

**CodeRabbit suggests:**
```python
# ❌ N+1 query problem
for app in applications:
    print(app.interview.date)  # Queries database for each app

# ✅ Optimized
applications = JobApplication.objects.select_related('interview').all()
for app in applications:
    print(app.interview.date)  # Single query
```

### Example 3: Best Practice

**CodeRabbit suggests:**
```javascript
// ❌ Missing error handling
const data = await fetch(url).then(r => r.json())

// ✅ With error handling
try {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Network error')
  const data = await response.json()
} catch (error) {
  console.error('Fetch error:', error)
}
```

---

## 🎯 Best Practices

1. **Review All Suggestions**
   - Read CodeRabbit comments carefully
   - Apply relevant improvements
   - Ask questions if unclear

2. **Use Auto-fix Wisely**
   - Review before applying
   - Test after applying
   - Don't auto-fix complex logic

3. **Address Security Issues**
   - Prioritize security suggestions
   - Fix vulnerabilities immediately
   - Don't ignore security warnings

4. **Improve Documentation**
   - Add missing docstrings
   - Update README if needed
   - Document complex logic

---

## ❓ Troubleshooting

### CodeRabbit Not Reviewing PRs

**Check:**
1. ✅ App is installed: https://github.com/apps/coderabbitai
2. ✅ Repository is selected in app settings
3. ✅ `.coderabbit.yaml` exists in repository
4. ✅ PR is not in draft mode

### Too Many Comments

**Solution:** Edit `.coderabbit.yaml`:
```yaml
comments:
  max_comments: 20  # Reduce from default
  minor_issues: false
```

### Missing Reviews

**Check:**
1. Path filters in `.coderabbit.yaml`
2. Ignore patterns
3. File extensions included

---

## 📚 Resources

- **Full Documentation**: [CODERABBIT.md](CODERABBIT.md)
- **CodeRabbit Docs**: https://docs.coderabbit.ai
- **GitHub App**: https://github.com/apps/coderabbitai
- **Configuration Guide**: https://docs.coderabbit.ai/configuration

---

## ✅ Verification

After setup, verify CodeRabbit is working:

1. Create a test PR with a small change
2. Wait 1-2 minutes
3. Check PR comments for CodeRabbit review
4. Review should appear automatically

**Status**: ✅ CodeRabbit is configured and ready!

---

**Setup Time**: ~5 minutes  
**Configuration**: ✅ Complete  
**Status**: Ready to use
