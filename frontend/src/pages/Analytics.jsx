import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut, Line, Radar } from "react-chartjs-2";
import { Link } from "react-router-dom";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, RadialLinearScale, Filler, Tooltip, Legend
);

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000").replace(/\/$/, "");
const PERIODS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

// All sample numbers below are fictional preview data, not database records.
const DEMO = {
  totalAnalyses: 248,
  averageScore: 74,
  averageSkillsScore: 69,
  analysesToday: 12,
  averageProcessingTime: 1.8,
  analyzedCandidates: 231,
  activeQueue: 3,
  uploadTrend: [
    { label: "May 18", uploads: 18, completed: 16 },
    { label: "May 25", uploads: 24, completed: 21 },
    { label: "Jun 01", uploads: 21, completed: 20 },
    { label: "Jun 08", uploads: 33, completed: 29 },
    { label: "Jun 15", uploads: 29, completed: 26 },
    { label: "Jun 22", uploads: 41, completed: 38 },
    { label: "Jun 29", uploads: 46, completed: 43 },
  ],
  scoreTrend: [
    { label: "May 18", ats: 68, skills: 64 },
    { label: "May 25", ats: 70, skills: 66 },
    { label: "Jun 01", ats: 69, skills: 65 },
    { label: "Jun 08", ats: 72, skills: 67 },
    { label: "Jun 15", ats: 71, skills: 68 },
    { label: "Jun 22", ats: 73, skills: 68 },
    { label: "Jun 29", ats: 74, skills: 69 },
  ],
  scoreDistribution: [
    { range: "0–49", count: 8 }, { range: "50–59", count: 15 },
    { range: "60–69", count: 42 }, { range: "70–79", count: 71 },
    { range: "80–89", count: 74 }, { range: "90–100", count: 38 },
  ],
  topSkills: [
    { skill: "Python", count: 182 }, { skill: "SQL", count: 146 },
    { skill: "JavaScript", count: 132 }, { skill: "React", count: 104 },
    { skill: "Flask", count: 91 }, { skill: "REST API", count: 87 },
    { skill: "Git", count: 79 }, { skill: "Machine Learning", count: 63 },
  ],
  scoreDimensions: [
    { label: "Skills", score: 69 }, { label: "Experience", score: 72 },
    { label: "Education", score: 81 }, { label: "Keywords", score: 66 },
    { label: "Structure", score: 78 }, { label: "Impact", score: 61 },
  ],
  roleReadiness: [
    { role: "Python Dev", score: 82 }, { role: "Full Stack", score: 76 },
    { role: "Data Analyst", score: 71 }, { role: "AI Engineer", score: 64 },
    { role: "Backend Dev", score: 79 },
  ],
  recentActivity: [
    { id: "RA-0248", date: "Jun 29, 2026 · 14:32", score: 91, skills: 86, time: 1.4, status: "Completed" },
    { id: "RA-0247", date: "Jun 29, 2026 · 14:18", score: 78, skills: 72, time: 1.8, status: "Completed" },
    { id: "RA-0246", date: "Jun 29, 2026 · 13:56", score: 64, skills: 58, time: 2.1, status: "Completed" },
    { id: "RA-0245", date: "Jun 29, 2026 · 13:42", score: 84, skills: 80, time: 1.6, status: "Completed" },
    { id: "RA-0244", date: "Jun 29, 2026 · 13:20", score: 53, skills: 47, time: 2.4, status: "Completed" },
  ],
  queue: [
    { id: 1, name: "Resume batch #018", file: "python_developer_resume.pdf", progress: 78, status: "Analyzing" },
    { id: 2, name: "Resume batch #019", file: "fullstack_profile.docx", progress: 46, status: "Extracting text" },
    { id: 3, name: "Resume batch #020", file: "ai_engineer_resume.pdf", progress: 24, status: "Queued" },
  ],
};

const PALETTE = {
  violet: "#6C63FF", cyan: "#00C2FF", green: "#00B887",
  amber: "#F6AD3C", coral: "#FF6B7A", blue: "#4F8CFF",
  grid: "rgba(148,163,184,.16)", tick: "#8490A5",
};

function useAnimatedCounter(target, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame;
    let start;
    const animate = (now) => {
      if (start === undefined) start = now;
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue((Number(target) || 0) * eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

function MetricCard({ icon, title, value, suffix = "", decimals = 0, note, iconTone, trend }) {
  const animated = useAnimatedCounter(value);
  return (
    <article className="analytics-reveal group relative min-w-0 overflow-hidden rounded-[22px] border border-white/70 bg-white/90 p-4 shadow-[0_14px_40px_rgba(75,85,150,.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_48px_rgba(75,85,150,.15)] dark:border-slate-700/70 dark:bg-slate-900/85 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400" />
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${iconTone}`}><i className={icon} /></div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"><i className="fa-solid fa-arrow-trend-up mr-1" />{trend}</span>
      </div>
      <div className="mt-5 text-[34px] font-extrabold leading-none tracking-tight text-slate-800 dark:text-white sm:text-[39px]">
        {decimals ? animated.toFixed(decimals) : Math.round(animated).toLocaleString()}{suffix}
      </div>
      <h3 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{note}</p>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="metric-shimmer h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{ width: `${Math.min(100, Math.max(8, Number(value) || 0))}%` }} /></div>
    </article>
  );
}

function Panel({ title, subtitle, icon, children, className = "", action }) {
  return (
    <section className={`analytics-reveal min-w-0 rounded-[22px] border border-white/70 bg-white/90 p-4 shadow-[0_12px_36px_rgba(75,85,150,.07)] transition-all duration-300 hover:shadow-[0_18px_42px_rgba(75,85,150,.11)] dark:border-slate-700/70 dark:bg-slate-900/85 sm:p-6 ${className}`}>
      <div className="mb-4 flex min-w-0 items-start justify-between gap-3 sm:mb-5">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-800 dark:text-white sm:text-lg"><i className={`${icon} text-violet-500`} />{title}</h2>
          {subtitle && <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 900, easing: "easeOutQuart" },
  interaction: { intersect: false, mode: "index" },
  plugins: {
    legend: { labels: { usePointStyle: true, pointStyle: "circle", padding: 18, color: PALETTE.tick, font: { size: 11, weight: "600" } } },
    tooltip: { backgroundColor: "#111827", titleColor: "#fff", bodyColor: "#E2E8F0", padding: 12, cornerRadius: 10, displayColors: true },
  },
};

function axisOptions({ horizontal = false, percent = false } = {}) {
  return {
    ...baseChartOptions,
    indexAxis: horizontal ? "y" : "x",
    scales: {
      x: { beginAtZero: true, grid: { display: horizontal ? true : false, color: PALETTE.grid }, border: { display: false }, ticks: { color: PALETTE.tick, font: { size: 12 }, precision: 0 } },
      y: { beginAtZero: true, max: percent ? 100 : undefined, grid: { color: PALETTE.grid }, border: { display: false }, ticks: { color: PALETTE.tick, font: { size: 12 }, precision: 0 } },
    },
  };
}

function scoreTone(score) {
  if (score >= 80) return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
  if (score >= 65) return "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300";
  if (score >= 50) return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
  return "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300";
}

function scoredCountForChart(data) {
  return (data.scoreDistribution || []).reduce((total, item) => total + (Number(item.count) || 0), 0);
}

function ChartEmptyState({ message = "No saved data available for this period." }) {
  return <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400"><i className="fa-solid fa-chart-simple mb-2 text-2xl opacity-50" /><p>{message}</p><p className="mt-1 text-xs">Analyze resumes to populate this chart.</p></div>;
}

export default function Analytics() {
  const [period, setPeriod] = useState("30");
  const [demoMode, setDemoMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [liveData, setLiveData] = useState(null);
  const [error, setError] = useState("");

  const loadLiveData = useCallback(async () => {
    setIsRefreshing(true);
    setError("");
    try {
      // Build analytics from the same saved resume records used by the Candidates page.
      const response = await fetch(`${API_BASE}/api/resumes`, {
        headers: { Accept: "application/json" },
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(json.message || `Resume API returned ${response.status}`);
      }

      const resumes = Array.isArray(json.resumes) ? json.resumes : [];
      const now = new Date();
      const days = period === "all" ? null : Number(period);
      const cutoff = days ? new Date(now.getTime() - days * 24 * 60 * 60 * 1000) : null;
      const toDate = (value) => {
        if (!value) return null;
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
      };
      const getAnalysis = (resume) => resume?.analysis || resume?.latest_analysis || {};
      const inPeriod = (resume) => {
        const date = toDate(getAnalysis(resume).analyzed_at || resume.uploaded_at);
        return !cutoff || !date || date >= cutoff;
      };
      const records = resumes.filter(inPeriod);
      const scoreOf = (resume) => {
        const a = getAnalysis(resume);
        const value = a.ats_score ?? a.overall_rating ?? a.overall_score ?? a.score;
        return value === null || value === undefined || value === "" ? null : Number(value);
      };
      const skillsScoreOf = (resume) => {
        const a = getAnalysis(resume);
        const value = a.skills_score ?? a.skills_match;
        return value === null || value === undefined || value === "" ? null : Number(value);
      };
      const dateLabel = (value) => {
        const date = toDate(value);
        return date ? date.toLocaleDateString(undefined, { month: "short", day: "2-digit" }) : "Unknown date";
      };
      const avg = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

      const scored = records.filter((resume) => scoreOf(resume) !== null && Number.isFinite(scoreOf(resume)));
      const skillScored = records.filter((resume) => skillsScoreOf(resume) !== null && Number.isFinite(skillsScoreOf(resume)));
      const todayKey = now.toDateString();
      const analysesToday = records.filter((resume) => {
        const a = getAnalysis(resume);
        const date = toDate(a.analyzed_at || resume.uploaded_at);
        return date && date.toDateString() === todayKey;
      }).length;

      const byDay = new Map();
      records.forEach((resume) => {
        const uploadedDate = toDate(resume.uploaded_at);
        if (!uploadedDate) return;
        const key = uploadedDate.toISOString().slice(0, 10);
        const row = byDay.get(key) || { date: uploadedDate, uploads: 0, completed: 0, atsTotal: 0, atsCount: 0, skillsTotal: 0, skillsCount: 0 };
        row.uploads += 1;
        const analysis = getAnalysis(resume);
        if (analysis && Object.keys(analysis).length) row.completed += 1;
        const score = scoreOf(resume);
        if (score !== null && Number.isFinite(score)) { row.atsTotal += score; row.atsCount += 1; }
        const skillsScore = skillsScoreOf(resume);
        if (skillsScore !== null && Number.isFinite(skillsScore)) { row.skillsTotal += skillsScore; row.skillsCount += 1; }
        byDay.set(key, row);
      });
      const dailyRows = [...byDay.values()].sort((a, b) => a.date - b.date);
      const uploadTrend = dailyRows.map((row) => ({
        label: dateLabel(row.date),
        uploads: row.uploads,
        completed: row.completed,
      }));
      const scoreTrend = dailyRows.filter((row) => row.atsCount || row.skillsCount).map((row) => ({
        label: dateLabel(row.date),
        ats: row.atsCount ? row.atsTotal / row.atsCount : 0,
        skills: row.skillsCount ? row.skillsTotal / row.skillsCount : 0,
      }));

      const buckets = [
        { range: "0–49", min: 0, max: 49, count: 0 },
        { range: "50–59", min: 50, max: 59, count: 0 },
        { range: "60–69", min: 60, max: 69, count: 0 },
        { range: "70–79", min: 70, max: 79, count: 0 },
        { range: "80–89", min: 80, max: 89, count: 0 },
        { range: "90–100", min: 90, max: 100, count: 0 },
      ];
      scored.forEach((resume) => {
        const score = scoreOf(resume);
        const bucket = buckets.find((item) => score >= item.min && score <= item.max);
        if (bucket) bucket.count += 1;
      });

      const skillCounts = new Map();
      records.forEach((resume) => {
        const skills = getAnalysis(resume).detected_skills;
        if (!Array.isArray(skills)) return;
        skills.forEach((skill) => {
          const name = String(typeof skill === "string" ? skill : skill?.name || skill?.skill || "").trim();
          if (name) skillCounts.set(name, (skillCounts.get(name) || 0) + 1);
        });
      });
      const topSkills = [...skillCounts.entries()]
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      const dimensions = [
        ["Skills", "skills_score"],
        ["Experience", "experience_score"],
        ["Education", "education_score"],
        ["Keywords", "keyword_score"],
      ];
      const scoreDimensions = dimensions.map(([label, key]) => {
        const values = records.map((resume) => getAnalysis(resume)[key]).filter((value) => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value))).map(Number);
        return { label, score: Math.round(avg(values)) };
      }).filter((item) => records.some((resume) => getAnalysis(resume)[dimensions.find((d) => d[0] === item.label)?.[1]] !== null && getAnalysis(resume)[dimensions.find((d) => d[0] === item.label)?.[1]] !== undefined));

      const roleCounts = new Map();
      records.forEach((resume) => {
        const analysis = getAnalysis(resume);
        const role = String(analysis.job_role || analysis.selected_job_role || analysis.target_job_role || resume.job_role || "").trim();
        const score = analysis.match_percentage ?? analysis.job_match_percentage ?? analysis.ats_score;
        if (!role) return;
        const entry = roleCounts.get(role) || { total: 0, scoreTotal: 0, scoreCount: 0 };
        entry.total += 1;
        if (score !== null && score !== undefined && score !== "" && Number.isFinite(Number(score))) {
          entry.scoreTotal += Number(score);
          entry.scoreCount += 1;
        }
        roleCounts.set(role, entry);
      });
      const roleReadiness = [...roleCounts.entries()].map(([role, entry]) => ({
        role,
        score: entry.scoreCount ? Math.round(entry.scoreTotal / entry.scoreCount) : 0,
      })).sort((a, b) => b.score - a.score).slice(0, 8);

      const recentActivity = [...records]
        .sort((a, b) => new Date(getAnalysis(b).analyzed_at || b.uploaded_at || 0) - new Date(getAnalysis(a).analyzed_at || a.uploaded_at || 0))
        .slice(0, 10)
        .map((resume) => {
          const analysis = getAnalysis(resume);
          return {
            id: analysis.id || resume.id || "—",
            date: analysis.analyzed_at || resume.uploaded_at || "—",
            score: scoreOf(resume) ?? 0,
            skills: skillsScoreOf(resume) ?? 0,
            time: Number(analysis.processing_time || 0),
            status: Object.keys(analysis).length ? "Completed" : "Uploaded",
          };
        });

      const averageProcessingValues = records.map((resume) => Number(getAnalysis(resume).processing_time)).filter(Number.isFinite).filter((value) => value > 0);
      setLiveData({
        totalAnalyses: records.filter((resume) => Object.keys(getAnalysis(resume)).length > 0).length,
        averageScore: Math.round(avg(scored.map(scoreOf))),
        averageSkillsScore: Math.round(avg(skillScored.map(skillsScoreOf))),
        analysesToday,
        averageProcessingTime: Number(avg(averageProcessingValues).toFixed(1)),
        analyzedCandidates: scored.length,
        activeQueue: 0,
        uploadTrend,
        scoreTrend,
        scoreDistribution: buckets.map(({ range, count }) => ({ range, count })),
        topSkills,
        scoreDimensions,
        roleReadiness,
        recentActivity,
        queue: [],
      });
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Unable to load live analytics.");
    } finally {
      setIsRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    if (!demoMode) loadLiveData();
  }, [demoMode, loadLiveData]);

  useEffect(() => {
    const nodes = document.querySelectorAll(".analytics-reveal");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("analytics-visible"));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("analytics-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [demoMode, period, error]);

  const data = useMemo(() => {
    if (demoMode) return DEMO;
    const raw = liveData || {};
    const rows = raw.recent_activity || raw.recentActivity || [];
    const dist = raw.score_distribution || raw.scoreDistribution || [];
    const skills = raw.top_skills || raw.topSkills || [];
    return {
      totalAnalyses: raw.total_analyses ?? raw.totalAnalyses ?? raw.total_resumes ?? 0,
      averageScore: raw.average_score ?? raw.average_ats_score ?? raw.averageScore ?? 0,
      averageSkillsScore: raw.average_skills_score ?? raw.averageSkillsScore ?? 0,
      analysesToday: raw.analyses_today ?? raw.analysesToday ?? 0,
      averageProcessingTime: raw.average_processing_time ?? raw.averageProcessingTime ?? 0,
      analyzedCandidates: raw.analyzed_candidates ?? raw.analyzedCandidates ?? raw.total_analyses ?? 0,
      activeQueue: raw.active_queue ?? raw.activeQueue ?? 0,
      uploadTrend: (raw.upload_trend || raw.uploadTrend || []).map((x) => ({ label: x.label || x.month || x.date || "", uploads: x.uploads ?? x.count ?? 0, completed: x.completed ?? x.count ?? 0 })),
      scoreTrend: (raw.score_trend || raw.scoreTrend || []).map((x) => ({ label: x.label || x.date || "", ats: x.ats ?? x.ats_score ?? x.score ?? 0, skills: x.skills ?? x.skills_score ?? 0 })),
      scoreDistribution: dist.map((x) => ({ range: x.range || x.label || x.bucket || "N/A", count: x.count ?? x.total ?? 0 })),
      topSkills: skills.map((x) => ({ skill: x.skill || x.name || x.label || "Skill", count: x.count ?? x.total ?? 0 })),
      scoreDimensions: (raw.score_dimensions || raw.scoreDimensions || []).map((x) => ({ label: x.label || x.name, score: x.score ?? x.value ?? 0 })),
      roleReadiness: (raw.role_readiness || raw.roleReadiness || []).map((x) => ({ role: x.role || x.label, score: x.score ?? x.value ?? 0 })),
      recentActivity: rows.map((x, i) => ({ id: x.id || `RA-${i + 1}`, date: x.date || x.analyzed_at || x.created_at || "—", score: x.ats_score ?? x.score ?? 0, skills: x.skills_score ?? x.skill_score ?? 0, time: x.processing_time ?? x.processingTime ?? 0, status: "Completed" })),
      queue: [],
    };
  }, [demoMode, liveData]);

  const uploadChart = useMemo(() => ({
    labels: data.uploadTrend.map((x) => x.label),
    datasets: [
      { label: "Uploaded", data: data.uploadTrend.map((x) => x.uploads), borderColor: PALETTE.violet, backgroundColor: "rgba(108,99,255,.13)", fill: true, tension: .42, borderWidth: 3, pointRadius: 3, pointHoverRadius: 7, pointBackgroundColor: "#fff", pointBorderWidth: 2 },
      { label: "Analyzed", data: data.uploadTrend.map((x) => x.completed), borderColor: PALETTE.cyan, backgroundColor: "rgba(0,194,255,.06)", fill: true, tension: .42, borderWidth: 2.5, pointRadius: 2, pointHoverRadius: 6, pointBackgroundColor: PALETTE.cyan },
    ],
  }), [data]);

  const scoreTrendChart = useMemo(() => ({
    labels: data.scoreTrend.map((x) => x.label),
    datasets: [
      { label: "ATS score", data: data.scoreTrend.map((x) => x.ats), borderColor: PALETTE.green, backgroundColor: "rgba(0,184,135,.12)", fill: true, tension: .4, borderWidth: 3, pointRadius: 3, pointHoverRadius: 6 },
      { label: "Skills score", data: data.scoreTrend.map((x) => x.skills), borderColor: PALETTE.amber, backgroundColor: "rgba(246,173,60,.08)", fill: false, tension: .4, borderWidth: 2.5, pointRadius: 3 },
    ],
  }), [data]);

  const distributionChart = useMemo(() => ({
    labels: data.scoreDistribution.map((x) => x.range),
    datasets: [{ label: "Resume analyses", data: data.scoreDistribution.map((x) => x.count), backgroundColor: [PALETTE.coral, PALETTE.amber, "#F5D66E", PALETTE.violet, PALETTE.cyan, PALETTE.green], borderRadius: 9, borderSkipped: false, maxBarThickness: 48, hoverBackgroundColor: [ "#FF8490", "#FFC25E", "#F9E58F", "#918AFF", "#48D4FF", "#36D7A9" ], categoryPercentage: .72, barPercentage: .78 }],
  }), [data]);

  const skillsBarChart = useMemo(() => ({
    labels: data.topSkills.map((x) => x.skill),
    datasets: [{ label: "Resume mentions", data: data.topSkills.map((x) => x.count), backgroundColor: data.topSkills.map((_, i) => [PALETTE.violet, PALETTE.cyan, PALETTE.green, PALETTE.amber, PALETTE.blue, PALETTE.coral, "#8B5CF6", "#14B8A6"][i % 8]), borderRadius: 8, borderSkipped: false, maxBarThickness: 23, barPercentage: .68, categoryPercentage: .76 }],
  }), [data]);

  const skillsDonut = useMemo(() => ({
    labels: data.topSkills.slice(0, 5).map((x) => x.skill),
    datasets: [{ data: data.topSkills.slice(0, 5).map((x) => x.count), backgroundColor: [PALETTE.violet, PALETTE.cyan, PALETTE.green, PALETTE.amber, PALETTE.coral], borderWidth: 0, hoverOffset: 12, spacing: 3 }],
  }), [data]);

  const dimensionsChart = useMemo(() => ({
    labels: data.scoreDimensions.map((x) => x.label),
    datasets: [{ label: "Average score", data: data.scoreDimensions.map((x) => x.score), borderColor: PALETTE.violet, backgroundColor: "rgba(108,99,255,.19)", pointBackgroundColor: PALETTE.cyan, pointBorderColor: "#fff", pointRadius: 4, borderWidth: 2.5 }],
  }), [data]);

  const roleChart = useMemo(() => ({
    labels: data.roleReadiness.map((x) => x.role),
    datasets: [{ label: "Readiness score", data: data.roleReadiness.map((x) => x.score), backgroundColor: data.roleReadiness.map((_, i) => [PALETTE.violet, PALETTE.cyan, PALETTE.green, PALETTE.amber, PALETTE.blue][i % 5]), borderRadius: 8, borderSkipped: false, maxBarThickness: 30 }],
  }), [data]);

  const activityChartOptions = useMemo(() => ({
    ...baseChartOptions,
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { color: PALETTE.tick, font: { size: 12 }, maxRotation: 0 } },
      y: { beginAtZero: true, grid: { color: PALETTE.grid }, border: { display: false }, ticks: { color: PALETTE.tick, precision: 0 } },
    },
  }), []);

  const lineScoreOptions = useMemo(() => ({
    ...activityChartOptions,
    scales: {
      ...activityChartOptions.scales,
      y: { ...activityChartOptions.scales.y, min: 0, max: 100, ticks: { color: PALETTE.tick, stepSize: 20, callback: (v) => `${v}%` } },
    },
  }), [activityChartOptions]);

  const distributionOptions = useMemo(() => ({
    ...axisOptions(),
    scales: { ...axisOptions().scales, y: { ...axisOptions().scales.y, ticks: { color: PALETTE.tick, precision: 0, stepSize: 20 } } },
  }), []);

  const skillsBarOptions = useMemo(() => ({
    ...axisOptions({ horizontal: true }),
    scales: {
      x: { beginAtZero: true, grid: { color: PALETTE.grid }, border: { display: false }, ticks: { color: PALETTE.tick, precision: 0 } },
      y: { grid: { display: false }, border: { display: false }, ticks: { color: PALETTE.tick, font: { size: 12, weight: "600" } } },
    },
  }), []);

  const doughnutOptions = useMemo(() => ({
    ...baseChartOptions,
    cutout: "70%",
    plugins: { ...baseChartOptions.plugins, legend: { position: "bottom", labels: { usePointStyle: true, pointStyle: "circle", padding: 14, color: PALETTE.tick, font: { size: 12, weight: "600" } } } },
  }), []);

  const radarOptions = useMemo(() => ({
    ...baseChartOptions,
    scales: { r: { min: 0, max: 100, ticks: { display: false, stepSize: 20 }, grid: { color: PALETTE.grid }, angleLines: { color: PALETTE.grid }, pointLabels: { color: PALETTE.tick, font: { size: 12, weight: "600" } } } },
    plugins: { ...baseChartOptions.plugins, legend: { display: false } },
  }), []);

  const roleOptions = useMemo(() => ({
    ...axisOptions(),
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { color: PALETTE.tick, font: { size: 12 } } },
      y: { beginAtZero: true, max: 100, grid: { color: PALETTE.grid }, border: { display: false }, ticks: { color: PALETTE.tick, callback: (v) => `${v}%` } },
    },
  }), []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (demoMode) {
      await new Promise((resolve) => setTimeout(resolve, 650));
      setLastUpdated(new Date());
      setIsRefreshing(false);
    } else {
      await loadLiveData();
    }
  };

  const safeRows = data.recentActivity || [];
  const topSkill = data.topSkills[0];
  const highScoreCount = data.scoreDistribution.filter((x) => /80|90|100/.test(x.range)).reduce((sum, x) => sum + (Number(x.count) || 0), 0);
  const lowScoreCount = data.scoreDistribution.filter((x) => /0|49|50|59/.test(x.range)).reduce((sum, x) => sum + (Number(x.count) || 0), 0);

  return (
    <main className="analytics-page min-h-screen w-full overflow-x-clip bg-[radial-gradient(ellipse_at_top_left,_#eef2ff_0%,_#f8fbff_45%,_#f8fafc_100%)] px-3 pb-10 pt-20 text-slate-800 dark:bg-[radial-gradient(ellipse_at_top_left,_#1e293b_0%,_#0f172a_48%,_#020617_100%)] dark:text-slate-100 sm:px-4 sm:pb-14 sm:pt-24 md:px-6">
      <style>{`
        .analytics-page .analytics-reveal { opacity: 0; transform: translateY(18px); transition: opacity .65s ease, transform .65s cubic-bezier(.2,.7,.2,1); }
        .analytics-page .analytics-reveal.analytics-visible { opacity: 1; transform: translateY(0); }
        .analytics-page .metric-shimmer { animation: metricLoad 1.3s ease-out both; }
        .analytics-page .chart-frame { position: relative; height: 260px; width: 100%; min-width: 0; }
        .analytics-page .chart-frame.tall { height: 290px; }
        .analytics-page .chart-frame.compact { height: 220px; }
        @media (min-width: 640px) { .analytics-page .chart-frame { height: 310px; } .analytics-page .chart-frame.tall { height: 355px; } .analytics-page .chart-frame.compact { height: 260px; } }
        .analytics-page .progress-fill { transition: width .8s cubic-bezier(.2,.7,.2,1); }
        .analytics-page .mode-switch { transition: all .25s ease; }
        .analytics-page .status-pulse { animation: statusPulse 1.8s ease-in-out infinite; }
        @keyframes metricLoad { from { width: 0; opacity: .4; } to { opacity: 1; } }
        @keyframes statusPulse { 0%,100% { opacity: 1; } 50% { opacity: .45; } }
        @media (prefers-reduced-motion: reduce) { .analytics-page *, .analytics-page *::before, .analytics-page *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; } }
      `}</style>
      <div className="mx-auto w-full min-w-0 max-w-[1600px]">
        <header className="analytics-reveal mb-6 flex min-w-0 flex-col gap-4 sm:mb-8 sm:gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-100/80 px-3.5 py-1.5 text-xs font-bold text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
              <span className="status-pulse h-2 w-2 rounded-full bg-emerald-500" /> ADVANCED ANALYTICS <span className="text-violet-400">/</span> RESUME INTELLIGENCE
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl md:text-[38px]">Resume Analytics <span className="bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">Studio</span></h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">Explore upload activity, ATS score quality, skill demand, role readiness, and resume-analysis performance in one place.</p>
            <p className="mt-3 text-sm text-slate-400 dark:text-slate-500"><i className="fa-regular fa-clock mr-1.5" /> Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {demoMode ? "Demo preview data" : "Live saved resume data"}</p>
          </div>
          <div className="grid w-full grid-cols-1 items-center gap-3 sm:w-auto lg:grid-cols-[auto_minmax(180px,1fr)_minmax(150px,1fr)]">
            <div className="flex w-full items-center gap-1 rounded-2xl border border-slate-200 bg-white/80 p-1 dark:border-slate-700 dark:bg-slate-900/80 min-[420px]:w-auto">
              <button type="button" onClick={() => setDemoMode(true)} className={`mode-switch rounded-xl px-3.5 py-2.5 text-xs font-bold ${demoMode ? "bg-violet-600 text-white shadow-md shadow-violet-500/20" : "text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}>Demo data</button>
              <button type="button" onClick={() => setDemoMode(false)} className={`mode-switch rounded-xl px-3.5 py-2.5 text-xs font-bold ${!demoMode ? "bg-violet-600 text-white shadow-md shadow-violet-500/20" : "text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}>Live data</button>
            </div>
            <select aria-label="Analytics time period" value={period} onChange={(e) => setPeriod(e.target.value)} className="h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-violet-500/20">
              {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <button type="button" onClick={handleRefresh} disabled={isRefreshing} className="inline-flex h-11 w-full min-w-0 items-center whitespace-nowrap justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-4 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-wait disabled:opacity-70">
              <i className={`fa-solid fa-rotate-right ${isRefreshing ? "animate-spin" : ""}`} /> {isRefreshing ? "Refreshing" : "Refresh"}
            </button>
          </div>
        </header>

        {error && !demoMode && <div role="alert" className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"><i className="fa-solid fa-triangle-exclamation mt-0.5" /><div><p className="font-bold">Live analytics could not be loaded</p><p className="mt-1">{error}. Check that Flask is running and <code>/api/resumes</code> is available.</p></div></div>}

        {demoMode && <div className="analytics-reveal mb-6 flex items-center gap-3 rounded-2xl border border-cyan-200/80 bg-gradient-to-r from-cyan-50/90 via-white/90 to-violet-50/90 px-4 py-3 dark:border-cyan-500/20 dark:from-cyan-500/5 dark:via-slate-900/80 dark:to-violet-500/5"><i className="fa-solid fa-flask text-lg text-cyan-600 dark:text-cyan-400" /><p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300"><strong>Preview mode:</strong> charts and metrics below use fictional sample values to demonstrate the finished layout. Switch to <strong>Live data</strong> to request information from Flask.</p></div>}

        <section className="mb-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:mb-7 sm:gap-4 xl:grid-cols-4">
          <MetricCard icon="fa-solid fa-file-circle-check" title="Total Resume Analyses" value={data.totalAnalyses} note="Analyses represented in this view" trend={demoMode ? "+12.8%" : "Live"} iconTone="bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300" />
          <MetricCard icon="fa-solid fa-gauge-high" title="Average ATS Score" value={data.averageScore} suffix="%" note="Average heuristic resume score" trend={demoMode ? "+4.6%" : "Live"} iconTone="bg-cyan-100 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300" />
          <MetricCard icon="fa-solid fa-list-check" title="Average Skills Score" value={data.averageSkillsScore} suffix="%" note="Skills signal across analyzed resumes" trend={demoMode ? "+3.2%" : "Live"} iconTone="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300" />
          <MetricCard icon="fa-solid fa-bolt" title="Analyses Today" value={data.analysesToday} note={`${data.averageProcessingTime || 0}s average processing time`} trend={demoMode ? "+8.1%" : "Live"} iconTone="bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300" />
        </section>

        <section className="mb-5 grid min-w-0 grid-cols-1 gap-4 sm:mb-6 sm:gap-6 xl:grid-cols-5">
          <Panel title="Resume Processing Volume" subtitle="Uploads compared with completed analyses over time" icon="fa-solid fa-chart-line" className="xl:col-span-3">
            <div className="chart-frame tall">{data.uploadTrend.length ? <Line data={uploadChart} options={activityChartOptions} /> : <ChartEmptyState />}</div>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div><p className="text-sm text-slate-500 dark:text-slate-400">Uploaded</p><p className="mt-1 text-xl font-extrabold text-slate-800 dark:text-white">{data.uploadTrend.reduce((s, x) => s + Number(x.uploads || 0), 0).toLocaleString()}</p></div>
              <div><p className="text-sm text-slate-500 dark:text-slate-400">Analyzed</p><p className="mt-1 text-xl font-extrabold text-cyan-600">{data.uploadTrend.reduce((s, x) => s + Number(x.completed || 0), 0).toLocaleString()}</p></div>
              <div><p className="text-sm text-slate-500 dark:text-slate-400">Completion ratio</p><p className="mt-1 text-xl font-extrabold text-emerald-600">{Math.round(data.uploadTrend.reduce((s, x) => s + Number(x.completed || 0), 0) / Math.max(1, data.uploadTrend.reduce((s, x) => s + Number(x.uploads || 0), 0)) * 100)}%</p></div>
            </div>
          </Panel>
          <Panel title="Skill Signal Mix" subtitle="Share of the top detected skills" icon="fa-solid fa-chart-pie" className="xl:col-span-2">
            <div className="chart-frame tall">{data.topSkills.length ? <Doughnut data={skillsDonut} options={doughnutOptions} /> : <ChartEmptyState message="No detected skills have been saved yet." />}</div>
            <div className="mt-3 rounded-xl bg-violet-50/80 p-3 dark:bg-violet-500/10"><p className="text-xs font-semibold text-violet-700 dark:text-violet-300">Most detected skill</p><p className="mt-1 text-lg font-extrabold text-slate-800 dark:text-white">{topSkill?.skill || "Not available"} <span className="text-sm font-semibold text-slate-500">· {topSkill?.count ?? 0} mentions</span></p></div>
          </Panel>
        </section>

        <section className="mb-5 grid min-w-0 grid-cols-1 gap-4 sm:mb-6 sm:gap-6 xl:grid-cols-2">
          <Panel title="ATS Score Distribution" subtitle="How resume scores are spread across score bands" icon="fa-solid fa-chart-column">
            <div className="chart-frame">{scoredCountForChart(data) ? <Bar data={distributionChart} options={distributionOptions} /> : <ChartEmptyState message="No ATS scores are available yet." />}</div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"><i className="fa-solid fa-circle-check mr-1" />80+ score: {highScoreCount}</span><span className="rounded-full bg-amber-50 px-3 py-1.5 font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"><i className="fa-solid fa-circle-exclamation mr-1" />Lower score bands: {lowScoreCount}</span></div>
          </Panel>
          <Panel title="Average Score Movement" subtitle="ATS score versus skills score across the selected timeline" icon="fa-solid fa-arrow-trend-up">
            <div className="chart-frame">{data.scoreTrend.length ? <Line data={scoreTrendChart} options={lineScoreOptions} /> : <ChartEmptyState message="No score trend is available yet." />}</div>
            <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-500 dark:bg-slate-800/70 dark:text-slate-400"><i className="fa-solid fa-circle-info mr-1.5 text-cyan-500" />Trend data is grouped from completed resume analyses in the selected period.</p>
          </Panel>
        </section>

        <section className="mb-5 grid min-w-0 grid-cols-1 gap-4 sm:mb-6 sm:gap-6 xl:grid-cols-5">
          <Panel title="Most Detected Skills" subtitle="Frequently occurring skills across analyzed resumes" icon="fa-solid fa-ranking-star" className="xl:col-span-3">
            <div className="chart-frame tall">{data.topSkills.length ? <Bar data={skillsBarChart} options={skillsBarOptions} /> : <ChartEmptyState message="No skill data is available yet." />}</div>
            <p className="mt-3 text-sm text-slate-400">Counts represent skill mentions extracted from resumes analyzed in the selected period.</p>
          </Panel>
          <Panel title="Resume Quality Fingerprint" subtitle="Average score across key evaluation dimensions" icon="fa-solid fa-bullseye" className="xl:col-span-2">
            <div className="chart-frame tall">{data.scoreDimensions.length ? <Radar data={dimensionsChart} options={radarOptions} /> : <ChartEmptyState message="No score dimensions are available yet." />}</div>
            <div className="mt-3 grid grid-cols-2 gap-2">{data.scoreDimensions.slice(0, 4).map((d) => <div key={d.label} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70"><div className="flex items-center justify-between gap-2"><span className="text-sm text-slate-500 dark:text-slate-400">{d.label}</span><strong className="text-sm text-slate-800 dark:text-white">{d.score}%</strong></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className="progress-fill h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{ width: `${Math.min(100, Math.max(0, d.score))}%` }} /></div></div>)}</div>
          </Panel>
        </section>

        <section className="mb-5 grid min-w-0 grid-cols-1 gap-4 sm:mb-6 sm:gap-6 xl:grid-cols-2">
          <Panel title="Role Readiness Comparison" subtitle="Average saved job-match score grouped by target role" icon="fa-solid fa-briefcase-business">
            <div className="chart-frame">{data.roleReadiness.length ? <Bar data={roleChart} options={roleOptions} /> : <ChartEmptyState message="No saved job-role data is available yet." />}</div>
            <p className="mt-3 text-sm text-slate-400">This chart uses target roles and match scores available in saved resume analyses.</p>
          </Panel>
          <Panel title="Processing Queue" subtitle="Sample pipeline activity to illustrate the dashboard layout" icon="fa-solid fa-layer-group" action={<span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">{demoMode ? data.activeQueue : 0} Active</span>}>
            {demoMode && data.queue.length ? <div className="space-y-3">{data.queue.map((item) => <div key={item.id} className="rounded-2xl bg-slate-50 p-4 transition hover:bg-violet-50/70 dark:bg-slate-800/70 dark:hover:bg-slate-800"><div className="flex flex-wrap items-center justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{item.name}</p><p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{item.file}</p></div><span className="rounded-full bg-cyan-100 px-2.5 py-1 text-[11px] font-bold text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">{item.status}</span></div><div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400"><span>Progress</span><strong className="text-slate-700 dark:text-slate-200">{item.progress}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className="progress-fill h-full rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400" style={{ width: `${item.progress}%` }} /></div></div>)}</div> : <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl bg-slate-50 text-center dark:bg-slate-800/60"><i className="fa-solid fa-circle-check text-3xl text-emerald-500" /><p className="mt-3 font-bold text-slate-700 dark:text-slate-200">No live queue data</p><p className="mt-1 max-w-xs text-sm text-slate-500 dark:text-slate-400">Connect a queue endpoint if you want live processing status here.</p></div>}
          </Panel>
        </section>

        <Panel title="Recent Analysis Activity" subtitle="Latest analysis events with scores and processing time" icon="fa-solid fa-clock-rotate-left" action={<Link to="/resume-analyzer" className="text-xs font-bold text-violet-600 transition hover:text-cyan-600 dark:text-violet-400">Analyze a resume <i className="fa-solid fa-arrow-right ml-1" /></Link>}>
          <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain rounded-xl">
            <table className="w-full min-w-[620px] border-collapse text-left text-xs sm:min-w-[680px] sm:text-sm">
              <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400 dark:border-slate-800"><th className="px-3 py-3 font-bold">Analysis ID</th><th className="px-3 py-3 font-bold">Date / Time</th><th className="px-3 py-3 font-bold">ATS Score</th><th className="px-3 py-3 font-bold">Skills Score</th><th className="px-3 py-3 font-bold">Processing</th><th className="px-3 py-3 font-bold">Status</th></tr></thead>
              <tbody>{safeRows.length ? safeRows.map((row, index) => <tr key={row.id || index} className="border-b border-slate-50 transition hover:bg-violet-50/50 dark:border-slate-800/70 dark:hover:bg-slate-800/60"><td className="px-3 py-4 text-sm font-extrabold text-violet-600 dark:text-violet-300">{row.id}</td><td className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">{row.date}</td><td className="px-3 py-4"><span className={`rounded-lg px-2.5 py-1.5 text-xs font-extrabold ${scoreTone(Number(row.score) || 0)}`}>{row.score}%</span></td><td className="px-3 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">{row.skills}%</td><td className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">{Number(row.time || 0).toFixed(1)}s</td><td className="px-3 py-4"><span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{row.status}</span></td></tr>) : <tr><td colSpan="6" className="px-3 py-12 text-center text-sm text-slate-500 dark:text-slate-400">No analysis activity is available for this period.</td></tr>}</tbody>
            </table>
          </div>
        </Panel>

        <section className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 xl:grid-cols-3">
          <Link to="/resume-analyzer" className="analytics-reveal group flex items-center gap-4 rounded-2xl border border-white/70 bg-white/90 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg dark:border-slate-700/70 dark:bg-slate-900/85 dark:hover:border-violet-500/40"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition group-hover:scale-105 dark:bg-violet-500/10 dark:text-violet-300"><i className="fa-solid fa-cloud-arrow-up" /></div><div className="min-w-0 flex-1"><h3 className="font-bold text-slate-800 dark:text-white">Analyze Resume</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Upload and evaluate a new resume</p></div><i className="fa-solid fa-arrow-right text-sm text-slate-400 transition group-hover:translate-x-1 group-hover:text-violet-500" /></Link>
          <Link to="/candidates" className="analytics-reveal group flex items-center gap-4 rounded-2xl border border-white/70 bg-white/90 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg dark:border-slate-700/70 dark:bg-slate-900/85 dark:hover:border-cyan-500/40 dark:bg-slate-900/85"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 transition group-hover:scale-105 dark:bg-cyan-500/10 dark:text-cyan-300"><i className="fa-solid fa-users" /></div><div className="min-w-0 flex-1"><h3 className="font-bold text-slate-800 dark:text-white">Explore Analyses</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Return to resume analysis tools</p></div><i className="fa-solid fa-arrow-right text-sm text-slate-400 transition group-hover:translate-x-1 group-hover:text-cyan-500" /></Link>
          <button type="button" onClick={() => window.print()} className="analytics-reveal group flex items-center gap-4 rounded-2xl border border-white/70 bg-white/90 p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg dark:border-slate-700/70 dark:bg-slate-900/85 dark:hover:border-emerald-500/40"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition group-hover:scale-105 dark:bg-emerald-500/10 dark:text-emerald-300"><i className="fa-solid fa-file-pdf" /></div><div className="min-w-0 flex-1"><h3 className="font-bold text-slate-800 dark:text-white">Export Analytics</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Print or save this report as PDF</p></div><i className="fa-solid fa-arrow-right text-sm text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-500" /></button>
        </section>
      </div>
    </main>
  );
}
