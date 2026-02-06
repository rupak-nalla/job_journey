"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api';

// ─── Icons ───────────────────────────────────────────────
const Icon = ({ name, size = 18, color = "currentColor" }) => {
  const paths = {
    briefcase: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></>,
    arrowLeft: <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
    mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>,
    check: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
    loader: <><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></>,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

export default function SupportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username || '',
    email: user?.email || '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ success: false, error: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (submitStatus.error) {
      setSubmitStatus({ success: false, error: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ success: false, error: '' });

    try {
      const response = await fetch(API_ENDPOINTS.SUBMIT_SUPPORT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({ success: true, error: '' });
        // Reset form after successful submission
        setFormData({
          name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username || '',
          email: user?.email || '',
          subject: '',
          message: '',
        });
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus({ success: false, error: '' });
        }, 5000);
      } else {
        setSubmitStatus({ success: false, error: data.error || 'Failed to submit support request. Please try again.' });
      }
    } catch (error) {
      console.error('Error submitting support request:', error);
      setSubmitStatus({ success: false, error: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Styles ──
  const S = {
    root: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      color: "#1f2937",
      padding: "20px",
    },
    topbar: {
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
      padding: "0 40px",
      height: 72,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 20,
      zIndex: 10,
      borderRadius: "16px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
      marginBottom: "20px",
    },
    backLink: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      color: "#1a1a2e",
      textDecoration: "none",
      fontSize: 13,
      fontWeight: 600,
      opacity: 0.6,
      transition: "opacity 0.2s",
      cursor: "pointer",
    },
    container: { maxWidth: 600, margin: "0 auto", padding: "0" },
    header: { marginBottom: 32, textAlign: "center" },
    title: { fontSize: 28, fontWeight: "bold", color: "#1f2937", marginBottom: 8, textAlign: "center" },
    subtitle: { fontSize: 14, color: "#f9fafb", textAlign: "center" },
    card: {
      background: "#fff",
      borderRadius: 16,
      border: "none",
      padding: 40,
      boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    },
    form: { display: "flex", flexDirection: "column", gap: 24 },
    field: { display: "flex", flexDirection: "column", gap: 8 },
    label: { fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8, display: "block" },
    input: {
      width: "100%",
      padding: "12px",
      border: "1px solid #d1d5db",
      borderRadius: 8,
      fontSize: 16,
      color: "#1f2937",
      outline: "none",
      transition: "all 0.2s",
      fontFamily: "inherit",
      boxSizing: "border-box",
      background: "#fff",
    },
    textarea: {
      width: "100%",
      padding: "12px",
      border: "1px solid #d1d5db",
      borderRadius: 8,
      fontSize: 16,
      color: "#1f2937",
      outline: "none",
      transition: "all 0.2s",
      fontFamily: "inherit",
      boxSizing: "border-box",
      resize: "vertical",
      minHeight: 150,
      background: "#fff",
    },
    alert: (isSuccess) => ({
      background: isSuccess ? "#f0fdf4" : "#fee2e2",
      border: `1px solid ${isSuccess ? "#bbf7d0" : "#fecaca"}`,
      borderRadius: 8,
      padding: "12px",
      marginBottom: 20,
      display: "flex",
      alignItems: "center",
      gap: 12,
      fontSize: 14,
      color: isSuccess ? "#166534" : "#dc2626",
      fontWeight: 500,
    }),
    btn: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#fff",
      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
      padding: "12px 20px",
      border: "none",
      borderRadius: 8,
      fontSize: 16,
      fontWeight: 600,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      letterSpacing: "0.2px",
      transition: "all 0.2s",
      fontFamily: "inherit",
      width: "100%",
    },
  };

  return (
    <div style={S.root}>
      {/* Top Bar */}
      <header style={S.topbar}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
        }}
        onClick={() => router.push("/dashboard")}
        >
          <div style={{
            width: 34,
            height: 34,
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Icon name="briefcase" size={17} color="#fff" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e", letterSpacing: "-0.5px" }}>JobJourney</span>
        </div>
        <span
          style={S.backLink}
          onClick={() => router.push("/dashboard")}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
        >
          <Icon name="arrowLeft" size={16} /> Back to Dashboard
        </span>
      </header>

      {/* Main Content */}
      <main style={S.container}>
        {/* Header */}
        <div style={S.header}>
          <h1 style={S.title}>Contact Support</h1>
          <p style={S.subtitle}>Report issues or get help with JobJourney</p>
        </div>

        {/* Form Card */}
        <div style={S.card}>
          {submitStatus.success && (
            <div style={S.alert(true)}>
              <Icon name="check" size={18} color="#166534" />
              <span>Your support request has been submitted successfully. We will get back to you soon.</span>
            </div>
          )}

          {submitStatus.error && (
            <div style={S.alert(false)}>
              <Icon name="alert" size={18} color="#dc2626" />
              <span>{submitStatus.error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={S.form}>
            <div style={S.field}>
              <label htmlFor="name" style={S.label}>Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={S.input}
                onFocus={(e) => (e.target.style.border = "1px solid #667eea")}
                onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
                placeholder="Your name"
              />
            </div>

            <div style={S.field}>
              <label htmlFor="email" style={S.label}>Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={S.input}
                onFocus={(e) => (e.target.style.border = "1px solid #667eea")}
                onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
                placeholder="your.email@example.com"
              />
            </div>

            <div style={S.field}>
              <label htmlFor="subject" style={S.label}>Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                style={S.input}
                onFocus={(e) => (e.target.style.border = "1px solid #667eea")}
                onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
                placeholder="Brief description of your issue"
              />
            </div>

            <div style={S.field}>
              <label htmlFor="message" style={S.label}>Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={8}
                style={S.textarea}
                onFocus={(e) => (e.target.style.border = "1px solid #667eea")}
                onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
                placeholder="Please describe your issue or question in detail..."
              />
            </div>

            <button
              type="submit"
              style={S.btn}
              disabled={isSubmitting}
              onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.opacity = "1")}
            >
              {isSubmitting ? (
                <>
                  <Icon name="loader" size={16} color="#fff" /> Submitting...
                </>
              ) : (
                <>
                  <Icon name="mail" size={16} color="#fff" /> Send Support Request
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
