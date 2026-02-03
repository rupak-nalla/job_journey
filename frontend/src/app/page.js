"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/config/api";

// ─── Status Config ────────────────────────────────────────────
const STATUS_CONFIG = {
  Applied:      { bg: "#eef2ff", text: "#4f46e5", dot: "#4f46e5" },
  Interviewing: { bg: "#fefce8", text: "#ca8a04", dot: "#ca8a04" },
  Assessment:   { bg: "#f0fdf4", text: "#16a34a", dot: "#16a34a" },
  Ghosted:      { bg: "#f3f4f6", text: "#6b7280", dot: "#9ca3af" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Applied;
  return (
    <span style={{ background: cfg.bg, color: cfg.text }} className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full">
      <span style={{ background: cfg.dot, width: 6, height: 6, borderRadius: "50%", display: "inline-block" }} />
      {status}
    </span>
  );
};

// ─── Icons (inline SVG) ───────────────────────────────────────
const Icon = ({ name, size = 18, color = "currentColor", className = "" }) => {
  const paths = {
    briefcase: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></>,
    clock:     <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    check:     <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
    users:     <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    eye:       <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
    edit:      <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    trash:     <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></>,
    plus:      <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    calendar:  <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    file:      <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>,
    arrow:     <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
    alert:     <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name]}
    </svg>
  );
};

// ─── Main Dashboard ──────────────────────────────────────────
export default function JobTrackingDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [apps, setApps] = useState([]);
  const [stats, setStats] = useState({ total: 0, applied: 0, ghosted: 0, interviewing: 0, assessment: 0 });
  const [interviews, setInterviews] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interviewModal, setInterviewModal] = useState(null);
  const [interviewData, setInterviewData] = useState({
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    type: "Technical",
  });

  const recent = apps.slice(0, 5);

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([fetchStats(), fetchApplications(), fetchInterviews()]);
    } catch (err) {
      setError("Failed to load data. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.JOB_STATS);
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.RECENT_APPLICATIONS);
      if (!response.ok) throw new Error("Failed to fetch applications");
      const data = await response.json();
      setApps(data);
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  const fetchInterviews = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.UPCOMING_INTERVIEWS);
      if (!response.ok) throw new Error("Failed to fetch interviews");
      const data = await response.json();
      setInterviews(data);
    } catch (err) {
      console.error("Error fetching interviews:", err);
    }
  };

  const handleStatusChange = async (id, val) => {
    // If changing to Interviewing, show interview modal
    if (val === "Interviewing") {
      setInterviewModal(id);
      setEditingId(null);
      return;
    }

    // Otherwise, update status directly
    try {
      const response = await fetch(API_ENDPOINTS.UPDATE_JOB_APPLICATION(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: val }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      
      // Update local state
      setApps(prev => prev.map(a => a.id === id ? { ...a, status: val } : a));
      setEditingId(null);
      
      // Refresh stats
      fetchStats();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status. Please try again.");
    }
  };

  const handleInterviewSubmit = async () => {
    if (!interviewModal) return;

    try {
      const response = await fetch(API_ENDPOINTS.UPDATE_JOB_APPLICATION(interviewModal), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "Interviewing",
          interview_date: interviewData.date,
          interview_time: interviewData.time,
          interview_type: interviewData.type,
        }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      
      // Update local state
      setApps(prev => prev.map(a => a.id === interviewModal ? { ...a, status: "Interviewing" } : a));
      setInterviewModal(null);
      
      // Reset interview data
      setInterviewData({
        date: new Date().toISOString().split("T")[0],
        time: "10:00",
        type: "Technical",
      });
      
      // Refresh data
      fetchStats();
      fetchInterviews();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(API_ENDPOINTS.DELETE_JOB_APPLICATION(id), {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete application");
      
      // Update local state
      setApps(prev => prev.filter(a => a.id !== id));
      setDeleteConfirm(null);
      
      // Refresh stats
      fetchStats();
    } catch (err) {
      console.error("Error deleting application:", err);
      alert("Failed to delete application. Please try again.");
    }
  };

  // ── Styles ──
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
    logo: {
      display: "flex",
      alignItems: "center",
      gap: 10,
    },
    logoIcon: {
      width: 34,
      height: 34,
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      borderRadius: 9,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    logoText: { fontSize: 18, fontWeight: 700, color: "#1a1a2e", letterSpacing: "-0.5px" },
    addBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      background: "#1a1a2e",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "9px 18px",
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      letterSpacing: "0.2px",
      transition: "background 0.2s",
    },
    container: { maxWidth: 1180, margin: "0 auto", padding: "32px 24px" },
    // Tabs
    tabRow: { display: "flex", gap: 4, marginBottom: 28 },
    tab: (active) => ({
      padding: "8px 20px",
      borderRadius: 7,
      border: "none",
      background: active ? "#1a1a2e" : "transparent",
      color: active ? "#fff" : "#6b7280",
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      letterSpacing: "0.3px",
      transition: "all 0.2s",
    }),
    // Stats Grid
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 },
    statCard: (accent) => ({
      background: "#fff",
      borderRadius: 14,
      padding: "22px 22px 20px",
      border: "1px solid #eee",
      position: "relative",
      overflow: "hidden",
    }),
    statAccent: (color) => ({
      position: "absolute",
      top: 0, left: 0, right: 0,
      height: 3,
      background: color,
    }),
    statIcon: (bg, color) => ({
      width: 40, height: 40, borderRadius: 10,
      background: bg, display: "flex", alignItems: "center", justifyContent: "center",
      marginBottom: 14, color,
    }),
    statLabel: { fontSize: 12, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 },
    statVal: { fontSize: 32, fontWeight: 700, color: "#1a1a2e", lineHeight: 1 },
    // Cards
    card: { background: "#fff", borderRadius: 14, border: "1px solid #eee", overflow: "hidden" },
    cardHead: {
      padding: "18px 24px",
      borderBottom: "1px solid #f0f0f0",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    },
    cardTitle: { fontSize: 15, fontWeight: 700, color: "#1a1a2e" },
    cardLink: { fontSize: 12, fontWeight: 600, color: "#1a1a2e", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, opacity: 0.5 },
    // Table
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.8px", padding: "12px 24px", borderBottom: "1px solid #f0f0f0", background: "#fafafa" },
    td: { padding: "15px 24px", borderBottom: "1px solid #f5f5f5", fontSize: 13, color: "#374151" },
    // Actions
    actionBtn: (color, bg) => ({
      width: 34, height: 34, borderRadius: 7,
      border: "none", background: "transparent",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", color, transition: "background 0.15s",
    }),
    // Interview cards
    interviewCard: {
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "18px 24px", borderBottom: "1px solid #f5f5f5", gap: 16,
    },
    interviewMeta: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9ca3af", marginTop: 6 },
    typeBadge: { fontSize: 11, fontWeight: 700, color: "#1a1a2e", background: "#f0f0f0", borderRadius: 5, padding: "3px 10px", letterSpacing: "0.3px" },
    // Delete modal
    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
    modal: { background: "#fff", borderRadius: 14, padding: 32, maxWidth: 380, width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" },
    modalTitle: { fontSize: 17, fontWeight: 700, marginBottom: 8, color: "#1a1a2e" },
    modalDesc: { fontSize: 13, color: "#6b7280", marginBottom: 24, lineHeight: 1.5 },
    modalBtns: { display: "flex", gap: 10, justifyContent: "center" },
    btnGhost: { padding: "8px 20px", borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer" },
    btnDanger: { padding: "8px 20px", borderRadius: 7, border: "none", background: "#ef4444", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" },
    // Interviews tab stats
    intStatsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 },
    empty: { padding: "56px 24px", textAlign: "center" },
  };

  // ── Overview ──
  const renderOverview = () => (
    <>
      <div style={S.statsGrid}>
        {[
          { label: "Total Applied", value: stats.total, icon: "briefcase", accent: "#1a1a2e", iconBg: "#f0f0f3", iconColor: "#1a1a2e" },
          { label: "Interviewing", value: stats.interviewing, icon: "clock", accent: "#ca8a04", iconBg: "#fefce8", iconColor: "#ca8a04" },
          { label: "In Assessment", value: stats.assessment, icon: "check", accent: "#16a34a", iconBg: "#f0fdf4", iconColor: "#16a34a" },
          { label: "Ghosted", value: stats.ghosted, icon: "users", accent: "#9ca3af", iconBg: "#f3f4f6", iconColor: "#9ca3af" },
        ].map((s) => (
          <div key={s.label} style={S.statCard(s.accent)}>
            <div style={S.statAccent(s.accent)} />
            <div style={S.statIcon(s.iconBg, s.iconColor)}><Icon name={s.icon} size={18} color={s.iconColor} /></div>
            <p style={S.statLabel}>{s.label}</p>
            <p style={S.statVal}>{s.value}</p>
          </div>
        ))}
        </div>
        
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Recent Applications */}
        <div style={S.card}>
          <div style={S.cardHead}>
            <span style={S.cardTitle}>Recent Applications</span>
            <span style={S.cardLink} onClick={() => setActiveTab("applications")}>View all <Icon name="arrow" size={13} /></span>
          </div>
          <div>
            {recent.length > 0 ? (
              recent.map((app) => (
                <div key={app.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid #f5f5f5" }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e", marginBottom: 2 }}>{app.company}</p>
                    <p style={{ fontSize: 12, color: "#9ca3af" }}>{app.position} · {app.applied_date || app.date}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))
            ) : (
              <div style={{ padding: "40px 24px", textAlign: "center" }}>
                <Icon name="briefcase" size={32} color="#d1d5db" />
                <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 12 }}>No applications yet</p>
              </div>
            )}
                </div>
              </div>
              
        {/* Upcoming Interviews */}
        <div style={S.card}>
          <div style={S.cardHead}>
            <span style={S.cardTitle}>Upcoming Interviews</span>
            <span style={S.cardLink} onClick={() => setActiveTab("interviews")}>Calendar <Icon name="arrow" size={13} /></span>
                  </div>
                  <div>
            {interviews.length > 0 ? (
              interviews.map((iv) => (
                <div key={iv.id} style={S.interviewCard}>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f0f0f3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon name="calendar" size={18} color="#1a1a2e" />
                  </div>
                  <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e", marginBottom: 2 }}>{iv.company}</p>
                      <p style={{ fontSize: 12, color: "#9ca3af" }}>{iv.position}</p>
                      <div style={S.interviewMeta}><Icon name="clock" size={12} color="#9ca3af" /> {iv.date} at {iv.time}</div>
                    </div>
                  </div>
                  <span style={S.typeBadge}>{iv.type}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: "40px 24px", textAlign: "center" }}>
                <Icon name="calendar" size={32} color="#d1d5db" />
                <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 12 }}>No upcoming interviews</p>
                    </div>
                  )}
                </div>
              </div>
      </div>
    </>
  );

  // ── Applications Table ──
  const renderApplications = () => (
      <div style={S.card}>
        <div style={S.cardHead}>
          <span style={S.cardTitle}>All Applications</span>
                  <button 
            style={S.addBtn}
            onClick={() => router.push("/add-application")}
                  >
            <Icon name="plus" size={14} color="#fff" /> Add Application
                  </button>
                </div>
      <div style={{ overflowX: "auto" }}>
        <table style={S.table}>
          <thead>
            <tr>
              {["Company", "Position", "Date", "Resume", "Status", "Actions"].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {apps.length > 0 ? apps.map((app) => (
              <tr key={app.id} style={{ transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={S.td}><span style={{ fontWeight: 600, color: "#1a1a2e" }}>{app.company}</span></td>
                <td style={S.td}>{app.position}</td>
                <td style={S.td}><span style={{ color: "#9ca3af", fontSize: 12 }}>{app.applied_date}</span></td>
                <td style={S.td}>
                  {app.resume
                    ? <a href={app.resume.startsWith("http") ? app.resume : `${API_ENDPOINTS.MEDIA_BASE}${app.resume}`} target="_blank" rel="noopener noreferrer">
                        <div style={{ width: 30, height: 30, borderRadius: 6, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="file" size={15} color="#4f46e5" /></div>
                      </a>
                    : <span style={{ color: "#d1d5db", fontSize: 18 }}>—</span>
                  }
                </td>
                <td style={S.td}>
                  {editingId === app.id ? (
                    <select autoFocus defaultValue={app.status} onBlur={() => setEditingId(null)} onChange={e => handleStatusChange(app.id, e.target.value)}
                      style={{ fontSize: 12, border: "1px solid #e0e0e0", borderRadius: 6, padding: "5px 10px", outline: "none", background: "#fff" }}>
                      <option value="Applied">Applied</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Assessment">Assessment</option>
                      <option value="Ghosted">Ghosted</option>
                    </select>
                  ) : (
                    <span onClick={() => setEditingId(app.id)} style={{ cursor: "pointer" }}><StatusBadge status={app.status} /></span>
                  )}
                          </td>
                <td style={S.td}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button 
                      style={S.actionBtn("#4f46e5")} 
                      onClick={() => router.push(`/application/${app.id}`)}
                      onMouseEnter={e => e.currentTarget.style.background = "#eef2ff"} 
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"} 
                      title="View"
                    >
                      <Icon name="eye" size={16} color="#4f46e5" />
                    </button>
                    <button 
                      style={S.actionBtn("#16a34a")} 
                      onClick={() => router.push(`/application/${app.id}`)}
                      onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"} 
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"} 
                      title="Edit"
                    >
                      <Icon name="edit" size={16} color="#16a34a" />
                    </button>
                    <button 
                      style={S.actionBtn("#ef4444")} 
                      onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"} 
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"} 
                      title="Delete" 
                      onClick={() => setDeleteConfirm(app.id)}
                    >
                      <Icon name="trash" size={16} color="#ef4444" />
                              </button>
                            </div>
                          </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" style={{ ...S.td, padding: "60px 24px", textAlign: "center" }}>
                  <Icon name="briefcase" size={40} color="#d1d5db" />
                  <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 16, marginBottom: 20 }}>No applications found</p>
                  <button 
                    style={{ ...S.addBtn, display: "inline-flex" }}
                    onClick={() => router.push("/add-application")}
                  >
                    <Icon name="plus" size={14} color="#fff" /> Add Your First Application
                  </button>
                </td>
              </tr>
            )}
          </tbody>
                </table>
              </div>
            </div>
  );

  // ── Interviews Tab ──
  const renderInterviews = () => (
    <>
      <div style={S.intStatsGrid}>
        {[
          { label: "Upcoming", value: interviews.length, sub: "Next 7 days", icon: "clock", accent: "#4f46e5", iconBg: "#eef2ff", iconColor: "#4f46e5" },
          { label: "Completed", value: 8, sub: "Last 30 days", icon: "check", accent: "#16a34a", iconBg: "#f0fdf4", iconColor: "#16a34a" },
          { label: "Success Rate", value: "62%", sub: "Pass rate", icon: "users", accent: "#ca8a04", iconBg: "#fefce8", iconColor: "#ca8a04" },
        ].map((s) => (
          <div key={s.label} style={S.statCard()}>
            <div style={S.statAccent(s.accent)} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={S.statIcon(s.iconBg, s.iconColor)}><Icon name={s.icon} size={18} color={s.iconColor} /></div>
              <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{s.sub}</span>
            </div>
            <p style={S.statLabel}>{s.label}</p>
            <p style={S.statVal}>{s.value}</p>
          </div>
        ))}
              </div>
              
      <div style={S.card}>
        <div style={S.cardHead}>
          <span style={S.cardTitle}>Scheduled Interviews</span>
                  </div>
        {interviews.length > 0 ? interviews.map((iv, i) => (
          <div key={iv.id} style={{ ...S.interviewCard, borderBottom: i < interviews.length - 1 ? "1px solid #f5f5f5" : "none" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: "#f0f0f3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="calendar" size={20} color="#1a1a2e" />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", marginBottom: 2 }}>{iv.company}</p>
                <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>{iv.position}</p>
                <div style={S.interviewMeta}><Icon name="clock" size={13} color="#9ca3af" /> {iv.date} · {iv.time}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={S.typeBadge}>{iv.type}</span>
              <button 
                style={{ ...S.addBtn, padding: "7px 14px", fontSize: 12 }}
                onClick={() => router.push(`/application/${iv.id}`)}
              >
                Details
              </button>
            </div>
          </div>
        )) : (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <Icon name="calendar" size={48} color="#d1d5db" />
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", marginTop: 16 }}>No Upcoming Interviews</p>
            <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 8 }}>You do not have any interviews scheduled yet</p>
          </div>
        )}
      </div>
    </>
  );

  // Loading state
  if (isLoading) {
    return (
      <div style={S.root}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#f0f0f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="loader" size={22} color="#1a1a2e" />
                      </div>
          <p style={{ fontSize: 13, color: "#9ca3af", fontWeight: 600 }}>Loading your applications...</p>
                    </div>
                  </div>
    );
  }

  return (
    <div style={S.root}>
      {/* Error Message */}
      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "14px 18px", margin: "20px 40px", display: "flex", alignItems: "center", gap: 12 }}>
          <Icon name="alert" size={18} color="#991b1b" />
          <span style={{ fontSize: 13, color: "#991b1b", fontWeight: 500 }}>{error}</span>
                </div>
              )}

      {/* Top Bar */}
      <header style={S.topbar}>
        <div style={S.logo}>
          <div style={S.logoIcon}><Icon name="briefcase" size={17} color="#fff" /></div>
          <span style={S.logoText}>JobTracker</span>
        </div>
        <button 
          style={S.addBtn} 
          onClick={() => router.push("/add-application")}
          onMouseEnter={e => e.currentTarget.style.background = "#16213e"} 
          onMouseLeave={e => e.currentTarget.style.background = "#1a1a2e"}
        >
          <Icon name="plus" size={14} color="#fff" /> Add Application
        </button>
      </header>

      {/* Body */}
      <main style={S.container}>
        {/* Page Title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a2e", letterSpacing: "-0.5px", marginBottom: 4 }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: "#9ca3af" }}>Track and manage all your job applications in one place</p>
        </div>

        {/* Tabs */}
        <div style={S.tabRow}>
          {["overview", "applications", "interviews"].map(t => (
            <button key={t} style={S.tab(activeTab === t)} onClick={() => setActiveTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "overview" && renderOverview()}
        {activeTab === "applications" && renderApplications()}
        {activeTab === "interviews" && renderInterviews()}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={S.overlay} onClick={() => setDeleteConfirm(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Icon name="trash" size={22} color="#ef4444" />
            </div>
            <p style={S.modalTitle}>Delete Application</p>
            <p style={S.modalDesc}>This action cannot be undone. The application will be permanently removed from your tracker.</p>
            <div style={S.modalBtns}>
              <button style={S.btnGhost} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button style={S.btnDanger} onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Interview Details Modal */}
      {interviewModal && (
        <div style={S.overlay} onClick={() => setInterviewModal(null)}>
          <div style={{ ...S.modal, maxWidth: 480, textAlign: "left" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Icon name="calendar" size={22} color="#4f46e5" />
            </div>
            <p style={{ ...S.modalTitle, textAlign: "center", marginBottom: 6 }}>Schedule Interview</p>
            <p style={{ ...S.modalDesc, textAlign: "center", marginBottom: 24 }}>Please provide the interview details for this application.</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>Interview Date</label>
                <input
                  type="date"
                  value={interviewData.date}
                  onChange={(e) => setInterviewData({ ...interviewData, date: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13, outline: "none", fontFamily: "inherit" }}
                />
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>Time</label>
                  <input
                    type="time"
                    value={interviewData.time}
                    onChange={(e) => setInterviewData({ ...interviewData, time: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13, outline: "none", fontFamily: "inherit" }}
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>Type</label>
                  <select
                    value={interviewData.type}
                    onChange={(e) => setInterviewData({ ...interviewData, type: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13, outline: "none", fontFamily: "inherit" }}
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
            </div>
            
            <div style={S.modalBtns}>
              <button style={S.btnGhost} onClick={() => setInterviewModal(null)}>Cancel</button>
              <button 
                style={{ ...S.btnDanger, background: "#4f46e5" }} 
                onClick={handleInterviewSubmit}
                onMouseEnter={e => e.currentTarget.style.background = "#4338ca"}
                onMouseLeave={e => e.currentTarget.style.background = "#4f46e5"}
              >
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}