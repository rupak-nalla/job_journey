"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_ENDPOINTS, getAuthHeaders } from "@/config/api";
import { useAuth } from "@/contexts/AuthContext";

// ─── Icons (matching dashboard) ───────────────────────────────
const Icon = ({ name, size = 18, color = "currentColor", style }) => {
  const paths = {
    arrowLeft: <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
    edit:      <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    trash:     <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></>,
    save:      <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></>,
    x:         <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    calendar:  <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    file:      <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>,
    loader:    <><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></>,
    link:      <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      {paths[name]}
    </svg>
  );
};

export default function ApplicationDetail() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [showInterviewFields, setShowInterviewFields] = useState(false);
  const [interviewData, setInterviewData] = useState({
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    type: "Technical",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchApplication();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, isAuthenticated, authLoading]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa',
      }}>
        <div style={{ fontSize: '16px', color: '#6b7280' }}>Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const fetchApplication = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.GET_JOB_APPLICATION(params.id));
      if (!response.ok) throw new Error("Failed to fetch application");
      const data = await response.json();
      setApplication(data);
      setFormData(data);
      
      // If status is Interviewing, show interview fields and populate data
      if (data.status === "Interviewing") {
        setShowInterviewFields(true);
        if (data.interview_date || data.interview_time || data.interview_type) {
          setInterviewData({
            date: data.interview_date || new Date().toISOString().split("T")[0],
            time: data.interview_time || "10:00",
            type: data.interview_type || "Technical",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching application:", error);
      setApplication(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Show interview fields if status changed to Interviewing
    if (name === "status" && value === "Interviewing") {
      setShowInterviewFields(true);
    } else if (name === "status") {
      setShowInterviewFields(false);
    }
  };

  const handleInterviewChange = (e) => {
    const { name, value } = e.target;
    setInterviewData({ ...interviewData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      
      // Add interview data if status is Interviewing
      if (formData.status === "Interviewing" && showInterviewFields) {
        submitData.interview_date = interviewData.date;
        submitData.interview_time = interviewData.time;
        submitData.interview_type = interviewData.type;
      }

      const response = await fetch(API_ENDPOINTS.UPDATE_JOB_APPLICATION(params.id), {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(submitData),
      });

      if (!response.ok) throw new Error("Failed to update application");
      
      const updatedData = await response.json();
      setApplication(updatedData);
      setIsEditing(false);
      setShowInterviewFields(false);
    } catch (error) {
      console.error("Error updating application:", error);
      alert("Failed to update application. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.DELETE_JOB_APPLICATION(params.id), {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to delete application");
      
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("Failed to delete application. Please try again.");
    }
  };

  const statusOptions = ["Applied", "Ghosted", "Interviewing", "Assessment"];

  // ── Styles (matching dashboard) ──
  const S = {
    root: {
      minHeight: "100vh",
      background: "#f8f9fa",
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      color: "#1a1a2e",
    },
    topbar: {
      background: "#fff",
      borderBottom: "1px solid #e8eaed",
      padding: "0 40px",
      height: 72,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 10,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
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
    container: { maxWidth: 900, margin: "0 auto", padding: "32px 24px 80px" },
    header: { marginBottom: 32 },
    title: { fontSize: 28, fontWeight: 700, color: "#1a1a2e", letterSpacing: "-0.5px", marginBottom: 6 },
    subtitle: { fontSize: 13, color: "#9ca3af" },
    card: {
      background: "#fff",
      borderRadius: 14,
      border: "1px solid #eee",
      padding: 32,
    },
    loading: { textAlign: "center", padding: 80 },
    loadingIcon: { margin: "0 auto 16px", width: 48, height: 48, borderRadius: 12, background: "#f0f0f3", display: "flex", alignItems: "center", justifyContent: "center" },
    companyHeader: { marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #f0f0f0" },
    companyName: { fontSize: 32, fontWeight: 700, color: "#1a1a2e", letterSpacing: "-0.7px", marginBottom: 8 },
    positionName: { fontSize: 18, color: "#6b7280", marginBottom: 16 },
    statusBadge: (status) => {
      const colors = {
        Applied: { bg: "#eef2ff", text: "#4f46e5" },
        Interviewing: { bg: "#fefce8", text: "#ca8a04" },
        Assessment: { bg: "#f0fdf4", text: "#16a34a" },
        Ghosted: { bg: "#f3f4f6", text: "#6b7280" },
      };
      const c = colors[status] || colors.Applied;
      return {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: c.bg,
        color: c.text,
        fontSize: 12,
        fontWeight: 700,
        padding: "6px 14px",
        borderRadius: 7,
        letterSpacing: "0.3px",
      };
    },
    section: { marginBottom: 32 },
    sectionTitle: { fontSize: 13, fontWeight: 700, color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 14 },
    detailsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 },
    detailItem: { display: "flex", alignItems: "center", gap: 12 },
    detailIcon: { width: 36, height: 36, borderRadius: 9, background: "#f0f0f3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    detailLabel: { fontSize: 11, color: "#9ca3af", fontWeight: 600, marginBottom: 3 },
    detailValue: { fontSize: 13, fontWeight: 600, color: "#1a1a2e" },
    detailLink: { fontSize: 13, fontWeight: 600, color: "#4f46e5", textDecoration: "none" },
    contactList: { display: "flex", flexDirection: "column", gap: 16 },
    textBlock: { fontSize: 13, color: "#374151", lineHeight: 1.7, whiteSpace: "pre-wrap" },
    form: { display: "flex", flexDirection: "column", gap: 24 },
    fieldGroup: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
    field: { display: "flex", flexDirection: "column", gap: 8 },
    label: { fontSize: 12, fontWeight: 700, color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.6px" },
    input: {
      padding: "11px 14px",
      border: "1px solid #e5e7eb",
      borderRadius: 8,
      fontSize: 13,
      color: "#1a1a2e",
      outline: "none",
      transition: "all 0.2s",
      fontFamily: "inherit",
    },
    textarea: {
      padding: "11px 14px",
      border: "1px solid #e5e7eb",
      borderRadius: 8,
      fontSize: 13,
      color: "#1a1a2e",
      outline: "none",
      transition: "all 0.2s",
      fontFamily: "inherit",
      resize: "vertical",
      minHeight: 100,
    },
    divider: { borderTop: "1px solid #f0f0f0", marginTop: 8, marginBottom: 8 },
    actions: { display: "flex", gap: 12, paddingTop: 24, borderTop: "1px solid #f0f0f0" },
    btn: (variant) => {
      const styles = {
        primary: { background: "#1a1a2e", color: "#fff" },
        secondary: { background: "#f3f4f6", color: "#374151" },
        danger: { background: "#ef4444", color: "#fff" },
      };
      const s = styles[variant] || styles.primary;
      return {
        flex: 1,
        padding: "11px 20px",
        border: "none",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        letterSpacing: "0.2px",
        transition: "all 0.2s",
        ...s,
      };
    },
  };

  if (isLoading) {
    return (
      <div style={S.root}>
        <header style={S.topbar}>
          <span style={S.backLink} onClick={() => router.push("/")} onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}>
            <Icon name="arrowLeft" size={16} /> Back to Dashboard
          </span>
        </header>
        <main style={S.container}>
          <div style={S.loading}>
            <div style={S.loadingIcon}>
              <Icon name="loader" size={22} color="#1a1a2e" />
            </div>
            <p style={{ fontSize: 13, color: "#9ca3af", fontWeight: 600 }}>Loading application...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!application) {
    return (
      <div style={S.root}>
        <header style={S.topbar}>
          <span style={S.backLink} onClick={() => router.push("/")} onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}>
            <Icon name="arrowLeft" size={16} /> Back to Dashboard
          </span>
        </header>
        <main style={S.container}>
          <div style={{ ...S.card, textAlign: "center", padding: 60 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: "#1a1a2e" }}>Application Not Found</h2>
            <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 24 }}>This application does not exist or has been removed.</p>
            <button style={S.btn("primary")} onClick={() => router.push("/")} onMouseEnter={(e) => (e.currentTarget.style.background = "#16213e")} onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1a2e")}>
              <Icon name="arrowLeft" size={16} color="#fff" /> Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={S.root}>
      {/* Top Bar */}
      <header style={S.topbar}>
        <span style={S.backLink} onClick={() => router.push("/")} onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}>
          <Icon name="arrowLeft" size={16} /> Back to Dashboard
        </span>
      </header>

      {/* Main Content */}
      <main style={S.container}>
        {/* Header */}
        <div style={S.header}>
          <h1 style={S.title}>Application Details</h1>
          <p style={S.subtitle}>View and manage your application information</p>
        </div>

        {/* Content Card */}
        <div style={S.card}>
          {isEditing ? (
            /* Edit Mode */
            <form onSubmit={handleSubmit} style={S.form}>
              <div style={S.fieldGroup}>
                <div style={S.field}>
                  <label htmlFor="company" style={S.label}>Company Name</label>
                  <input type="text" id="company" name="company" value={formData.company || ""} onChange={handleChange} style={S.input} onFocus={(e) => (e.target.style.border = "1px solid #1a1a2e")} onBlur={(e) => (e.target.style.border = "1px solid #e5e7eb")} />
                </div>
                <div style={S.field}>
                  <label htmlFor="position" style={S.label}>Position</label>
                  <input type="text" id="position" name="position" value={formData.position || ""} onChange={handleChange} style={S.input} onFocus={(e) => (e.target.style.border = "1px solid #1a1a2e")} onBlur={(e) => (e.target.style.border = "1px solid #e5e7eb")} />
                </div>
              </div>

              <div style={S.fieldGroup}>
                <div style={S.field}>
                  <label htmlFor="status" style={S.label}>Status</label>
                  <select id="status" name="status" value={formData.status || "Applied"} onChange={handleChange} style={S.input} onFocus={(e) => (e.target.style.border = "1px solid #1a1a2e")} onBlur={(e) => (e.target.style.border = "1px solid #e5e7eb")}>
                    {statusOptions.map((status) => (<option key={status} value={status}>{status}</option>))}
                  </select>
                </div>
                <div style={S.field}>
                  <label htmlFor="applied_date" style={S.label}>Applied Date</label>
                  <input type="date" id="applied_date" name="applied_date" value={formData.applied_date || ""} onChange={handleChange} style={S.input} onFocus={(e) => (e.target.style.border = "1px solid #1a1a2e")} onBlur={(e) => (e.target.style.border = "1px solid #e5e7eb")} />
                </div>
              </div>

              <div style={S.divider} />

              <div style={S.fieldGroup}>
                <div style={S.field}>
                  <label htmlFor="contact_email" style={S.label}>Contact Email</label>
                  <input type="email" id="contact_email" name="contact_email" value={formData.contact_email || ""} onChange={handleChange} style={S.input} onFocus={(e) => (e.target.style.border = "1px solid #1a1a2e")} onBlur={(e) => (e.target.style.border = "1px solid #e5e7eb")} />
                </div>
                <div style={S.field}>
                  <label htmlFor="contact_phone" style={S.label}>Contact Phone</label>
                  <input type="tel" id="contact_phone" name="contact_phone" value={formData.contact_phone || ""} onChange={handleChange} style={S.input} onFocus={(e) => (e.target.style.border = "1px solid #1a1a2e")} onBlur={(e) => (e.target.style.border = "1px solid #e5e7eb")} />
                </div>
              </div>

              <div style={S.field}>
                <label htmlFor="job_description" style={S.label}>Job Description</label>
                <textarea id="job_description" name="job_description" value={formData.job_description || ""} onChange={handleChange} rows={5} style={S.textarea} onFocus={(e) => (e.target.style.border = "1px solid #1a1a2e")} onBlur={(e) => (e.target.style.border = "1px solid #e5e7eb")} />
              </div>

              <div style={S.field}>
                <label htmlFor="notes" style={S.label}>Notes</label>
                <textarea id="notes" name="notes" value={formData.notes || ""} onChange={handleChange} rows={4} style={S.textarea} onFocus={(e) => (e.target.style.border = "1px solid #1a1a2e")} onBlur={(e) => (e.target.style.border = "1px solid #e5e7eb")} />
              </div>

              {/* Interview Fields (Conditional) */}
              {showInterviewFields && (
                <>
                  <div style={S.divider} />
                  <div style={S.field}>
                    <label style={S.label}>Interview Details</label>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
                    <div style={S.field}>
                      <label htmlFor="interview_date" style={{ ...S.label, fontSize: 11 }}>Date</label>
                      <input
                        type="date"
                        id="interview_date"
                        name="date"
                        value={interviewData.date}
                        onChange={handleInterviewChange}
                        style={S.input}
                        onFocus={(e) => (e.target.style.border = "1px solid #1a1a2e")}
                        onBlur={(e) => (e.target.style.border = "1px solid #e5e7eb")}
                      />
                    </div>

                    <div style={S.field}>
                      <label htmlFor="interview_time" style={{ ...S.label, fontSize: 11 }}>Time</label>
                      <input
                        type="time"
                        id="interview_time"
                        name="time"
                        value={interviewData.time}
                        onChange={handleInterviewChange}
                        style={S.input}
                        onFocus={(e) => (e.target.style.border = "1px solid #1a1a2e")}
                        onBlur={(e) => (e.target.style.border = "1px solid #e5e7eb")}
                      />
                    </div>

                    <div style={S.field}>
                      <label htmlFor="interview_type" style={{ ...S.label, fontSize: 11 }}>Type</label>
                      <select
                        id="interview_type"
                        name="type"
                        value={interviewData.type}
                        onChange={handleInterviewChange}
                        style={S.input}
                        onFocus={(e) => (e.target.style.border = "1px solid #1a1a2e")}
                        onBlur={(e) => (e.target.style.border = "1px solid #e5e7eb")}
                      >
                        <option value="Technical">Technical</option>
                        <option value="HR">HR</option>
                        <option value="Behavioral">Behavioral</option>
                        <option value="Final">Final</option>
                        <option value="Phone Screen">Phone Screen</option>
                        <option value="System Design">System Design</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div style={S.actions}>
                <button type="submit" style={S.btn("primary")} onMouseEnter={(e) => (e.currentTarget.style.background = "#16213e")} onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1a2e")}>
                  <Icon name="save" size={16} color="#fff" /> Save Changes
                </button>
                <button type="button" onClick={() => { setIsEditing(false); setFormData(application); }} style={S.btn("secondary")} onMouseEnter={(e) => (e.currentTarget.style.background = "#e5e7eb")} onMouseLeave={(e) => (e.currentTarget.style.background = "#f3f4f6")}>
                  <Icon name="x" size={16} /> Cancel
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <>
              <div style={S.companyHeader}>
                <h2 style={S.companyName}>{application.company}</h2>
                <p style={S.positionName}>{application.position}</p>
                <span style={S.statusBadge(application.status)}>{application.status}</span>
              </div>

              <div style={S.section}>
                <h3 style={S.sectionTitle}>Application Details</h3>
                <div style={S.detailsGrid}>
                  <div style={S.detailItem}>
                    <div style={S.detailIcon}><Icon name="calendar" size={16} color="#1a1a2e" /></div>
                    <div>
                      <p style={S.detailLabel}>Applied Date</p>
                      <p style={S.detailValue}>{application.applied_date}</p>
                    </div>
                  </div>
                  {application.resume && (
                    <div style={S.detailItem}>
                      <div style={S.detailIcon}><Icon name="file" size={16} color="#1a1a2e" /></div>
                      <div>
                        <p style={S.detailLabel}>Resume</p>
                        <a 
                          href={application.resume.startsWith("http") ? application.resume : `${API_ENDPOINTS.MEDIA_BASE}${application.resume}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={S.detailLink}
                        >
                          View Resume
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {(application.contact_email || application.contact_phone || application.company_website) && (
                <div style={S.section}>
                  <h3 style={S.sectionTitle}>Contact Information</h3>
                  <div style={S.contactList}>
                    {application.contact_email && (
                      <div>
                        <p style={S.detailLabel}>Email</p>
                        <a href={`mailto:${application.contact_email}`} style={S.detailLink}>{application.contact_email}</a>
                      </div>
                    )}
                    {application.contact_phone && (
                      <div>
                        <p style={S.detailLabel}>Phone</p>
                        <a href={`tel:${application.contact_phone}`} style={S.detailLink}>{application.contact_phone}</a>
                      </div>
                    )}
                    {application.company_website && (
                      <div>
                        <p style={S.detailLabel}>Company Website</p>
                        <a href={application.company_website} target="_blank" rel="noopener noreferrer" style={S.detailLink}>
                          <Icon name="link" size={14} color="currentColor" style={{ display: "inline-block", verticalAlign: "middle", marginRight: 4 }} />
                          {application.company_website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {application.job_description && (
                <div style={S.section}>
                  <h3 style={S.sectionTitle}>Job Description</h3>
                  <p style={S.textBlock}>{application.job_description}</p>
                </div>
              )}

              {application.notes && (
                <div style={S.section}>
                  <h3 style={S.sectionTitle}>Notes</h3>
                  <p style={S.textBlock}>{application.notes}</p>
                </div>
              )}

              <div style={S.actions}>
                <button onClick={() => setIsEditing(true)} style={S.btn("primary")} onMouseEnter={(e) => (e.currentTarget.style.background = "#16213e")} onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1a2e")}>
                  <Icon name="edit" size={16} color="#fff" /> Edit Application
                </button>
                <button onClick={handleDelete} style={S.btn("danger")} onMouseEnter={(e) => (e.currentTarget.style.background = "#dc2626")} onMouseLeave={(e) => (e.currentTarget.style.background = "#ef4444")}>
                  <Icon name="trash" size={16} color="#fff" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
