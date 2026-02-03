"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS, getAuthHeaders } from "@/config/api";
import { useAuth } from "@/contexts/AuthContext";

// ─── Icons (matching dashboard) ───────────────────────────────
const Icon = ({ name, size = 18, color = "currentColor" }) => {
  const paths = {
    arrowLeft: <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
    upload:    <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
    check:     <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
    alert:     <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
    x:         <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    loader:    <><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></>,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

export default function AddJobApplication() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // All hooks must be called before any conditional returns
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    status: "Applied",
    applied_date: new Date().toISOString().split("T")[0],
    resume: null,
    job_description: "",
    contact_email: "",
    contact_phone: "",
    company_website: "",
    notes: "",
  });
  const [interviewData, setInterviewData] = useState({
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    type: "Technical",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ text: "", isError: false });
  const [showInterviewFields, setShowInterviewFields] = useState(false);
  const [resumeFileName, setResumeFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ fontSize: '16px', color: '#6b7280' }}>Loading...</div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("interview.")) {
      const field = name.split(".")[1];
      setInterviewData({ ...interviewData, [field]: value });
    } else {
      setFormData({ ...formData, [name]: value });
      if (name === "status" && value.toLowerCase() === "interviewing") {
        setShowInterviewFields(true);
      } else if (name === "status") {
        setShowInterviewFields(false);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, resume: file });
      setResumeFileName(file.name);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFormData({ ...formData, resume: file });
      setResumeFileName(file.name);
    }
  };

  const removeFile = () => {
    setFormData({ ...formData, resume: null });
    setResumeFileName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage({ text: "", isError: false });

    try {
      const submitData = new FormData();
      submitData.append("company", formData.company);
      submitData.append("position", formData.position);
      submitData.append("status", formData.status);
      submitData.append("applied_date", formData.applied_date);
      
      if (formData.resume) {
        submitData.append("resume", formData.resume);
      }

      if (formData.job_description) {
        submitData.append("job_description", formData.job_description);
      }
      if (formData.contact_email) {
        submitData.append("contact_email", formData.contact_email);
      }
      if (formData.contact_phone) {
        submitData.append("contact_phone", formData.contact_phone);
      }
      if (formData.company_website) {
        submitData.append("company_website", formData.company_website);
      }
      if (formData.notes) {
        submitData.append("notes", formData.notes);
      }

      if (showInterviewFields) {
        submitData.append("interview_date", interviewData.date);
        submitData.append("interview_time", interviewData.time);
        submitData.append("interview_type", interviewData.type);
      }

      // For FormData, don't include Content-Type header (browser sets it with boundary)
      const response = await fetch(API_ENDPOINTS.ADD_JOB_APPLICATION, {
        method: "POST",
        headers: getAuthHeaders(false), // false = don't include Content-Type for FormData
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit application");
      }

      setSubmitMessage({ text: "Application added successfully!", isError: false });
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error submitting application:", error);
      setSubmitMessage({ 
        text: error.message || "Failed to add application. Please try again.", 
        isError: true 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = ["Applied", "Ghosted", "Interviewing", "Assessment", "Offered"];

  // ── Styles (matching login/register) ──
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
    container: { maxWidth: 800, margin: "0 auto", padding: "0" },
    header: { marginBottom: 32, textAlign: "center" },
    title: { fontSize: 28, fontWeight: "bold", color: "#1f2937", marginBottom: 8 },
    subtitle: { fontSize: 14, color: "#6b7280" },
    alert: (isError) => ({
      background: isError ? "#fee2e2" : "#f0fdf4",
      border: `1px solid ${isError ? "#fecaca" : "#bbf7d0"}`,
      borderRadius: 8,
      padding: "12px",
      marginBottom: 20,
      display: "flex",
      alignItems: "center",
      gap: 12,
      fontSize: 14,
      color: isError ? "#dc2626" : "#166534",
      fontWeight: 500,
    }),
    card: {
      background: "#fff",
      borderRadius: 16,
      border: "none",
      padding: 40,
      boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    },
    form: { display: "flex", flexDirection: "column", gap: 24 },
    fieldGroup: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
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
      minHeight: 100,
    },
    uploadZone: (active) => ({
      border: `2px dashed ${active ? "#667eea" : "#d1d5db"}`,
      borderRadius: 8,
      padding: 40,
      textAlign: "center",
      cursor: "pointer",
      transition: "all 0.2s",
      background: active ? "#fafafa" : "#fff",
      position: "relative",
    }),
    uploadInput: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      opacity: 0,
      cursor: "pointer",
    },
    uploadIcon: { margin: "0 auto 12px", width: 40, height: 40, borderRadius: 10, background: "#f0f0f3", display: "flex", alignItems: "center", justifyContent: "center" },
    uploadText: { fontSize: 13, color: "#1a1a2e", fontWeight: 600, marginBottom: 4 },
    uploadHint: { fontSize: 11, color: "#9ca3af" },
    filePreview: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12 },
    fileName: { fontSize: 13, fontWeight: 600, color: "#1a1a2e" },
    removeBtn: {
      width: 28,
      height: 28,
      borderRadius: 6,
      border: "none",
      background: "#fef2f2",
      color: "#ef4444",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "background 0.2s",
    },
    divider: { borderTop: "1px solid #f0f0f0", marginTop: 8 },
    submitBtn: (disabled) => ({
      width: "100%",
      padding: "12px",
      background: disabled ? "#9ca3af" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      fontSize: 16,
      fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.2s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      boxShadow: disabled ? "none" : "0 4px 12px rgba(102, 126, 234, 0.4)",
    }),
  };

  return (
    <div style={S.root}>
      {/* Top Bar */}
      <header style={S.topbar}>
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
        {/* Form Card */}
        <div style={S.card}>
          {/* Header */}
          <div style={S.header}>
            <h1 style={S.title}>Add New Application</h1>
            <p style={S.subtitle}>Fill in the details of your job application</p>
          </div>

          {/* Alert Message */}
          {submitMessage.text && (
            <div style={S.alert(submitMessage.isError)}>
              <Icon name={submitMessage.isError ? "alert" : "check"} size={18} color={submitMessage.isError ? "#dc2626" : "#166534"} />
              <span>{submitMessage.text}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} style={S.form}>
            {/* Company & Position */}
            <div style={S.fieldGroup}>
              <div style={S.field}>
                <label htmlFor="company" style={S.label}>Company Name *</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Google"
                  style={S.input}
                  onFocus={(e) => (e.target.style.border = "1px solid #667eea")}
                  onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
                />
              </div>

              <div style={S.field}>
                <label htmlFor="position" style={S.label}>Position *</label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Senior Frontend Engineer"
                  style={S.input}
                  onFocus={(e) => (e.target.style.border = "1px solid #667eea")}
                  onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
                />
              </div>
            </div>

            {/* Status & Date */}
            <div style={S.fieldGroup}>
              <div style={S.field}>
                <label htmlFor="status" style={S.label}>Status *</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  style={S.input}
                  onFocus={(e) => (e.target.style.border = "1px solid #667eea")}
                  onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div style={S.field}>
                <label htmlFor="applied_date" style={S.label}>Applied Date *</label>
                <input
                  type="date"
                  id="applied_date"
                  name="applied_date"
                  value={formData.applied_date}
                  onChange={handleChange}
                  required
                  style={S.input}
                  onFocus={(e) => (e.target.style.border = "1px solid #667eea")}
                  onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
                />
              </div>
            </div>

            {/* Resume Upload */}
            <div style={S.field}>
              <label style={S.label}>Resume / CV</label>
              <div
                style={S.uploadZone(dragActive)}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="resume"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  style={S.uploadInput}
                />
                {resumeFileName ? (
                  <div style={S.filePreview}>
                    <Icon name="check" size={20} color="#16a34a" />
                    <span style={S.fileName}>{resumeFileName}</span>
                    <button type="button" onClick={removeFile} style={S.removeBtn} onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")} onMouseLeave={(e) => (e.currentTarget.style.background = "#fef2f2")}>
                      <Icon name="x" size={14} color="#ef4444" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={S.uploadIcon}>
                      <Icon name="upload" size={18} color="#1a1a2e" />
                    </div>
                    <p style={S.uploadText}>Drop your resume here or click to browse</p>
                    <p style={S.uploadHint}>PDF, DOC, or DOCX (Max 5MB)</p>
                  </>
                )}
              </div>
            </div>

            {/* Additional Details */}
            <div style={S.divider} />
            
            <div style={S.field}>
              <label htmlFor="job_description" style={S.label}>Job Description</label>
              <textarea
                id="job_description"
                name="job_description"
                value={formData.job_description}
                onChange={handleChange}
                rows={4}
                placeholder="Paste or type the job description here..."
                style={S.textarea}
                onFocus={(e) => (e.target.style.border = "1px solid #667eea")}
                onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
              />
            </div>

            {/* Contact Information */}
            <div style={S.fieldGroup}>
              <div style={S.field}>
                <label htmlFor="contact_email" style={S.label}>Contact Email</label>
                <input
                  type="email"
                  id="contact_email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  placeholder="recruiter@company.com"
                  style={S.input}
                  onFocus={(e) => (e.target.style.border = "1px solid #667eea")}
                  onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
                />
              </div>

              <div style={S.field}>
                <label htmlFor="contact_phone" style={S.label}>Contact Phone</label>
                <input
                  type="tel"
                  id="contact_phone"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  style={S.input}
                  onFocus={(e) => (e.target.style.border = "1px solid #667eea")}
                  onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
                />
              </div>
            </div>

            <div style={S.field}>
              <label htmlFor="company_website" style={S.label}>Company Website</label>
              <input
                type="url"
                id="company_website"
                name="company_website"
                value={formData.company_website}
                onChange={handleChange}
                placeholder="https://company.com"
                style={S.input}
                onFocus={(e) => (e.target.style.border = "1px solid #1a1a2e")}
                onBlur={(e) => (e.target.style.border = "1px solid #e5e7eb")}
              />
            </div>

            <div style={S.field}>
              <label htmlFor="notes" style={S.label}>Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Add any additional notes or reminders..."
                style={S.textarea}
                onFocus={(e) => (e.target.style.border = "1px solid #667eea")}
                onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
              />
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
                    <label htmlFor="interview.date" style={{ ...S.label, fontSize: 11 }}>Date</label>
                    <input
                      type="date"
                      id="interview.date"
                      name="interview.date"
                      value={interviewData.date}
                      onChange={handleChange}
                      style={S.input}
                      onFocus={(e) => (e.target.style.border = "1px solid #667eea")}
                      onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
                    />
                  </div>

                  <div style={S.field}>
                    <label htmlFor="interview.time" style={{ ...S.label, fontSize: 11 }}>Time</label>
                    <input
                      type="time"
                      id="interview.time"
                      name="interview.time"
                      value={interviewData.time}
                      onChange={handleChange}
                      style={S.input}
                      onFocus={(e) => (e.target.style.border = "1px solid #667eea")}
                      onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
                    />
                  </div>

                  <div style={S.field}>
                    <label htmlFor="interview.type" style={{ ...S.label, fontSize: 11 }}>Type</label>
                    <select
                      id="interview.type"
                      name="interview.type"
                      value={interviewData.type}
                      onChange={handleChange}
                      style={S.input}
                      onFocus={(e) => (e.target.style.border = "1px solid #667eea")}
                      onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
                    >
                      <option value="Technical">Technical</option>
                      <option value="HR">HR</option>
                      <option value="Behavioral">Behavioral</option>
                      <option value="Final">Final</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={S.submitBtn(isSubmitting)}
              onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.opacity = "1")}
            >
              {isSubmitting ? (
                <>
                  <Icon name="loader" size={16} color="#fff" />
                  Adding Application...
                </>
              ) : (
                "Add Application"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
