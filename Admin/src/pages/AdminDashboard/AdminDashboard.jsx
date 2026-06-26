import React, { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users, FileText, Download, Flag, AlertTriangle,
  LayoutDashboard, RefreshCw, TrendingUp, Activity,
} from "lucide-react";
import "./AdminDashboard.css";

// ── Colour palettes ────────────────────────────────────────────────────
const PIE_COLORS = ["#7c3aed", "#0ea5e9", "#10b981", "#f59e0b"];

const AUTH_HEADER = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

// ── Custom Tooltip ──────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="ad-tooltip">
      <p className="ad-tooltip-label">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <strong>{p.value.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════
const AdminDashboard = () => {
  const [stats,        setStats]        = useState(null);
  const [chartData,    setChartData]    = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [error,        setError]        = useState("");
  const [activeChart,  setActiveChart]  = useState("area");

  // ── Fetch all 3 endpoints in parallel ──────────────────────────────
  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const [s, c, cat] = await Promise.all([
        fetch("http://localhost:5000/api/admin/stats",          { headers: AUTH_HEADER() }).then(r => r.json()),
        fetch("http://localhost:5000/api/admin/chart-stats",    { headers: AUTH_HEADER() }).then(r => r.json()),
        fetch("http://localhost:5000/api/admin/category-stats", { headers: AUTH_HEADER() }).then(r => r.json()),
      ]);
      setStats(s);
      setChartData(Array.isArray(c) ? c : []);
      setCategoryData(Array.isArray(cat) ? cat : []);
    } catch {
      setError("Failed to load dashboard data. Is the backend running?");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Auto-refresh every 60 s ─────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => fetchAll(true), 60_000);
    return () => clearInterval(id);
  }, [fetchAll]);

  // ── Stat cards config ───────────────────────────────────────────────
  const statCards = stats ? [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "#7c3aed",
      bg: "rgba(124,58,237,0.10)",
      border: "rgba(124,58,237,0.25)",
      trend: "+12%",
      trendUp: true,
    },
    {
      label: "Total Files",
      value: stats.totalFiles,
      icon: FileText,
      color: "#0ea5e9",
      bg: "rgba(14,165,233,0.10)",
      border: "rgba(14,165,233,0.25)",
      trend: "+8%",
      trendUp: true,
    },
    {
      label: "Total Downloads",
      value: stats.totalDownloads,
      icon: Download,
      color: "#10b981",
      bg: "rgba(16,185,129,0.10)",
      border: "rgba(16,185,129,0.25)",
      trend: "+24%",
      trendUp: true,
    },
    {
      label: "Total Reports",
      value: stats.totalReports,
      icon: Flag,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.10)",
      border: "rgba(245,158,11,0.25)",
      trend: "-3%",
      trendUp: false,
    },
    {
      label: "Pending Reports",
      value: stats.pendingReports,
      icon: AlertTriangle,
      color: stats.pendingReports > 0 ? "#ef4444" : "#10b981",
      bg: stats.pendingReports > 0 ? "rgba(239,68,68,0.10)" : "rgba(16,185,129,0.10)",
      border: stats.pendingReports > 0 ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.25)",
      trend: stats.pendingReports > 0 ? "Action needed" : "All clear",
      trendUp: stats.pendingReports === 0,
    },
  ] : [];

  // ── Loading screen ───────────────────────────────────────────────────
  if (loading) return (
    <div className="ad-root">
      <div className="ad-loader">
        <div className="ad-spinner" />
        <p>Loading dashboard…</p>
      </div>
    </div>
  );

  return (
    <div className="ad-root">
      <div className="ad-container">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="ad-header">
          <div className="ad-header-left">
            <div className="ad-header-icon">
              <LayoutDashboard size={24} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <h1>Admin Dashboard</h1>
            </div>
          </div>
          <button
            className={`ad-refresh-btn ${refreshing ? "ad-refreshing" : ""}`}
            onClick={() => fetchAll(true)}
            disabled={refreshing}
          >
            <RefreshCw size={14} strokeWidth={2.5} className="ad-refresh-icon" />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {error && <div className="ad-error">{error}</div>}

        {/* ── Stat Cards ─────────────────────────────────────── */}
        {stats && (
          <div className="ad-stat-grid">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="ad-stat-card"
                  style={{
                    "--card-color": card.color,
                    "--card-bg": card.bg,
                    "--card-border": card.border,
                  }}
                >
                  <div className="ad-stat-icon-wrap">
                    <Icon size={22} strokeWidth={1.8} color={card.color} />
                  </div>
                  <div className="ad-stat-body">
                    <p className="ad-stat-label">{card.label}</p>
                    <p className="ad-stat-value" style={{ color: card.color }}>
                      {card.value.toLocaleString()}
                    </p>
                    <p
                      className={`ad-stat-trend ${card.trendUp ? "ad-trend-up" : "ad-trend-down"}`}
                    >
                      <TrendingUp size={10} strokeWidth={2} />
                      {card.trend}
                    </p>
                  </div>
                  <div className="ad-stat-glow" />
                </div>
              );
            })}
          </div>
        )}

        {/* ── Monthly Trend Chart ─────────────────────────────── */}
        {chartData.length > 0 && (
          <div className="ad-chart-card">
            <div className="ad-chart-header">
              <div className="ad-chart-title-group">
                <div className="ad-chart-icon">
                  <Activity size={16} color="#a78bfa" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="ad-chart-title">Monthly Activity</h2>
                </div>
              </div>
              <div className="ad-chart-tabs">
                {[["area", "Area"], ["bar", "Bar"], ["line", "Line"]].map(([v, l]) => (
                  <button
                    key={v}
                    className={`ad-tab ${activeChart === v ? "ad-tab-active" : ""}`}
                    onClick={() => setActiveChart(v)}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              {activeChart === "area" ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    {[["uploads","#7c3aed"],["downloads","#10b981"],["newUsers","#0ea5e9"],["reports","#f59e0b"]].map(([k,c]) => (
                      <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={c} stopOpacity={0.28}/>
                        <stop offset="95%" stopColor={c} stopOpacity={0.01}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: "#7c6fb0", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#7c6fb0", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: "#9d8fd4", fontSize: 12, paddingTop: "12px" }} />
                  <Area type="monotone" dataKey="uploads"   name="Uploads"   stroke="#7c3aed" fill="url(#grad-uploads)"   strokeWidth={2} dot={{ r: 3, fill: "#7c3aed", strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="downloads" name="Downloads" stroke="#10b981" fill="url(#grad-downloads)" strokeWidth={2} dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="newUsers"  name="New Users" stroke="#0ea5e9" fill="url(#grad-newUsers)"  strokeWidth={2} dot={{ r: 3, fill: "#0ea5e9", strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="reports"   name="Reports"   stroke="#f59e0b" fill="url(#grad-reports)"   strokeWidth={2} dot={{ r: 3, fill: "#f59e0b", strokeWidth: 0 }} />
                </AreaChart>
              ) : activeChart === "bar" ? (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={3} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#7c6fb0", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#7c6fb0", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(124,58,237,0.05)" }} />
                  <Legend wrapperStyle={{ color: "#9d8fd4", fontSize: 12, paddingTop: "12px" }} />
                  <Bar dataKey="uploads"   name="Uploads"   fill="#7c3aed" radius={[4,4,0,0]} />
                  <Bar dataKey="downloads" name="Downloads" fill="#10b981" radius={[4,4,0,0]} />
                  <Bar dataKey="newUsers"  name="New Users" fill="#0ea5e9" radius={[4,4,0,0]} />
                  <Bar dataKey="reports"   name="Reports"   fill="#f59e0b" radius={[4,4,0,0]} />
                </BarChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: "#7c6fb0", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#7c6fb0", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: "#9d8fd4", fontSize: 12, paddingTop: "12px" }} />
                  <Line type="monotone" dataKey="uploads"   name="Uploads"   stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 3, fill: "#7c3aed", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="downloads" name="Downloads" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="newUsers"  name="New Users" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3, fill: "#0ea5e9", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="reports"   name="Reports"   stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, fill: "#f59e0b", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Bottom Row: Pie + Category Bar ─────────────────── */}
        <div className="ad-bottom-grid">

          {/* Pie — overall totals */}
          {stats && (
            <div className="ad-chart-card ad-chart-card--half">
              <div className="ad-chart-header">
                <div className="ad-chart-title-group">
                  <div className="ad-chart-icon">
                    <Activity size={16} color="#a78bfa" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="ad-chart-title">Platform Overview</h2>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Users",     value: stats.totalUsers     },
                      { name: "Files",     value: stats.totalFiles     },
                      { name: "Downloads", value: stats.totalDownloads },
                      { name: "Reports",   value: stats.totalReports   },
                    ]}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                  >
                    {PIE_COLORS.map((color, i) => (
                      <Cell key={i} fill={color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={9} wrapperStyle={{ color: "#9d8fd4", fontSize: 12, paddingTop: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category bar */}
          {categoryData.length > 0 && (
            <div className="ad-chart-card ad-chart-card--half">
              <div className="ad-chart-header">
                <div className="ad-chart-title-group">
                  <div className="ad-chart-icon">
                    <FileText size={16} color="#a78bfa" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="ad-chart-title">Files by Category</h2>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#7c6fb0", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#9d8fd4", fontSize: 11 }} axisLine={false} tickLine={false} width={88} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(124,58,237,0.05)" }} />
                  <Legend wrapperStyle={{ color: "#9d8fd4", fontSize: 12, paddingTop: "8px" }} />
                  <Bar dataKey="files"     name="Files"     fill="#7c3aed" radius={[0,4,4,0]} />
                  <Bar dataKey="downloads" name="Downloads" fill="#10b981" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>



      </div>
    </div>
  );
};

export default AdminDashboard;
