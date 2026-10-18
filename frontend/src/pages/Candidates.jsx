import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000").replace(/\/$/, "");
const HISTORY_ENDPOINT = `${API_BASE_URL}/api/resumes`;

// Show the full role catalog even before a role has been returned by the API.
const JOB_ROLES = [
  "Python Developer", "Python Full Stack Developer", "Backend Developer",
  "Frontend Developer", "Full Stack Developer", "AI Engineer",
  "Machine Learning Engineer", "Data Analyst", "Data Scientist",
  "Java Developer", "MERN Stack Developer", "DevOps Engineer",
  "Software Engineer", "Other",
];

const normalizeRoleKey = (value) => String(value || "")
  .normalize("NFKC")
  .trim()
  .toLowerCase()
  .replace(/[._-]+/g, " ")
  .replace(/\s+/g, " ");

const numberOrNull = (...values) => {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value))) return Number(value);
  }
  return null;
};

function listify(value) {
  if (Array.isArray(value)) return value.map((item) => typeof item === "string" ? item : item?.name || item?.skill || item?.text || item?.message || "").filter(Boolean);
  if (typeof value === "string") return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function firstValue(objects, keys) {
  for (const object of objects) {
    if (!object || typeof object !== "object" || Array.isArray(object)) continue;
    for (const key of keys) {
      const value = object[key];
      if (value !== null && value !== undefined && value !== "") return value;
    }
  }
  return undefined;
}

function normalizeCandidate(item, index) {
  const resume = item?.resume || item?.resume_data || item || {};

  // APIs may return analysis as an object, an array, or nested under result/data.
  const possibleAnalysis = [
    item?.analysis,
    item?.latest_analysis,
    item?.result,
    item?.analysis_result,
    resume?.analysis,
    resume?.latest_analysis,
    item?.analyses,
    resume?.analyses,
    item?.data?.analysis,
    item?.data?.latest_analysis,
    item?.data?.result,
    resume?.data?.analysis,
  ];

  let analysis = {};
  for (const entry of possibleAnalysis) {
    if (Array.isArray(entry)) {
      const first = entry.find(Boolean);
      if (first) {
        analysis = first.analysis || first.result || first;
        break;
      }
    } else if (entry && typeof entry === "object") {
      analysis = entry.analysis || entry.result || entry;
      if (Object.keys(analysis || {}).length) break;
    }
  }

  const objects = [
    analysis,
    analysis?.analysis,
    analysis?.result,
    item?.analysis,
    item?.latest_analysis,
    item?.result,
    item?.analysis_result,
    resume?.analysis,
    resume?.latest_analysis,
    item,
    resume,
    item?.data,
    resume?.data,
  ];

  const rawSkills = firstValue(objects, [
    "detected_skills", "skills", "technical_skills",
  ]) || [];
  const score = numberOrNull(firstValue(objects, [
    "ats_score", "overall_score", "overall_rating", "score",
  ]));
  const name = firstValue(objects, [
    "candidate_name", "full_name", "name",
  ]) || "";

  const roleValue = firstValue(objects, [
    "job_role",
    "selected_job_role",
    "target_job_role",
    "desired_job_role",
    "job_title",
    "target_role",
    "role",
    "position_applied",
  ]);
  const role = typeof roleValue === "string" ? roleValue.trim() : "";

  const skillsScore = numberOrNull(firstValue(objects, [
    "skills_score", "skills_match", "skill_match_score",
  ]));

  // The API's match_percentage is the authoritative job-match score.
  // Fall back to skills_score only for older records without a match score.
  const match = numberOrNull(firstValue(objects, [
    "match_percentage",
    "job_match_percentage",
    "job_match_score",
    "match_score",
    "job_match",
    "role_match_percentage",
    "skills_match_percentage",
  ]));

  return {
    id: resume?.id ?? item?.id ?? `candidate-${index}`,
    resumeUrl: (resume?.id ?? item?.id) != null
      ? `${API_BASE_URL}/api/resumes/${resume?.id ?? item?.id}/file`
      : null,
    candidateName: name || "Name not provided",
    email: firstValue(objects, ["candidate_email", "email"]) || "",
    phone: firstValue(objects, ["candidate_phone", "phone", "mobile"]) || "",
    filename: firstValue(objects, [
      "original_filename", "filename", "file_name",
    ]) || "Resume file",
    ats: score,
    skillsScore,
    jobMatch: match ?? skillsScore,
    match: match ?? skillsScore,
    date: firstValue(objects, [
      "analyzed_at", "uploaded_at", "created_at", "date",
    ]) || null,
    skills: listify(rawSkills),
    recommendations: listify(firstValue(objects, [
      "suggestions", "recommendations", "weaknesses",
    ]) || []),
    matchedSkills: listify(firstValue(objects, [
      "matched_skills", "matching_skills",
    ]) || []),
    missingSkills: listify(firstValue(objects, [
      "missing_skills", "skills_to_learn",
    ]) || []),
    jobRole: role,
  };
}
function formatDate(value) {
  if (!value) return "Date unavailable";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function scoreLabel(score) {
  if (score === null || score === undefined) return "Not scored";
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Very good";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs improvement";
  return "Needs attention";
}

function scoreTone(score) {
  if (score === null || score === undefined) return "from-slate-500 to-slate-400";
  if (score >= 90) return "from-emerald-500 to-teal-400";
  if (score >= 80) return "from-blue-600 to-cyan-400";
  if (score >= 70) return "from-amber-500 to-yellow-400";
  return "from-rose-600 to-orange-400";
}

function Panel({ children, className = "" }) {
  return <section className={`rounded-3xl border border-slate-200/80 bg-white/90 shadow-[0_12px_35px_rgba(15,23,42,0.06)] transition-all duration-300 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)] dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20 ${className}`}>{children}</section>;
}

function StatCard({ icon, label, value, detail, accent = "from-violet-500 to-blue-500" }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{value}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{detail}</p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-lg text-white shadow-lg transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110`}><i className={`fa-solid ${icon}`} aria-hidden="true" /></span>
      </div>
    </div>
  );
}

function downloadCandidateInsights(candidate) {
  // Open a self-contained report in a new tab. Users can print it or choose
  // "Save as PDF" in the browser's print dialog.
  const reportWindow = window.open("", "_blank");
  if (!reportWindow) {
    window.alert("Your browser blocked the report window. Please allow pop-ups for this site and try again.");
    return;
  }

  const safeText = (value, fallback = "Not provided") => {
    if (value === null || value === undefined || value === "") return fallback;
    return String(value);
  };
  const escapeHtml = (value) => safeText(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);

  const score = (value) => value === null || value === undefined || value === ""
    ? "N/A"
    : `${Math.round(Number(value) * 10) / 10}%`;
  const listItems = (items, emptyMessage) => {
    const list = Array.isArray(items) ? items.filter(Boolean) : [];
    if (!list.length) return `<li class="muted">${escapeHtml(emptyMessage)}</li>`;
    return list.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  };
  const skillPills = (items, emptyMessage) => {
    const list = Array.isArray(items) ? items.filter(Boolean) : [];
    if (!list.length) return `<span class="muted">${escapeHtml(emptyMessage)}</span>`;
    return list.map((item) => `<span class="pill">${escapeHtml(item)}</span>`).join("");
  };

  const name = safeText(candidate.candidateName, "Candidate");
  const generatedAt = new Date().toLocaleString();
  const role = safeText(candidate.jobRole, "Target role not provided");
  const atsValue = candidate.ats == null ? null : Number(candidate.ats);
  const matchValue = candidate.jobMatch == null ? null : Number(candidate.jobMatch);
  const atsLabel = score(candidate.ats);
  const matchLabel = score(candidate.jobMatch);
  const skillsLabel = score(candidate.skillsScore);
  const safeFileName = name.normalize("NFKD").replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "Candidate";

  reportWindow.document.open();
  reportWindow.document.write(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(name)} — Resume Insights | ResumeAI Pro</title>
<style>
  :root{color-scheme:light;--ink:#172033;--muted:#64748b;--line:#e2e8f0;--purple:#6d28d9;--blue:#2563eb;--cyan:#0891b2;--green:#059669;--surface:#f8fafc}
  *{box-sizing:border-box}
  body{margin:0;background:#edf2f9;color:var(--ink);font:14px/1.45 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
  .toolbar{position:sticky;top:0;z-index:5;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px max(18px,calc((100% - 980px)/2));background:#111827;color:#fff}
  .brand{font-weight:850;letter-spacing:-.04em;font-size:17px}.brand span{color:#22d3ee}
  .actions{display:flex;gap:8px;flex-wrap:wrap}
  .btn{border:0;border-radius:9px;padding:9px 13px;font-weight:750;cursor:pointer;font-size:12px}
  .btn-print{background:linear-gradient(100deg,#7c3aed,#0891b2);color:white}.btn-close{background:#263449;color:white}
  .sheet{width:min(980px,calc(100% - 32px));margin:22px auto;padding:30px;background:#fff;border:1px solid #e5eaf2;border-radius:20px;box-shadow:0 16px 48px rgba(15,23,42,.1)}
  .hero{padding:23px 25px;border-radius:15px;background:linear-gradient(120deg,#111827 0%,#25204c 58%,#0e7490 100%);color:#fff;position:relative;overflow:hidden}
  .eyebrow{font-size:10px;letter-spacing:.16em;text-transform:uppercase;font-weight:800;color:#a5f3fc}
  h1{font-size:29px;line-height:1.12;letter-spacing:-.04em;margin:8px 0 7px}
  .intro{margin:0;color:#dbeafe;font-size:12px;max-width:650px}
  .hero-foot{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:17px;color:#dbeafe;font-size:10px}
  .section{margin-top:18px}.section-head{display:flex;align-items:center;gap:8px;margin:0 0 10px;font-size:13px;font-weight:850;letter-spacing:-.02em}
  .section-head:before{content:"";width:4px;height:16px;border-radius:8px;background:linear-gradient(#7c3aed,#06b6d4)}
  .identity{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:10px}
  .info,.score-card,.panel{border:1px solid var(--line);border-radius:12px;padding:12px;min-width:0}
  .label{font-size:9px;letter-spacing:.08em;text-transform:uppercase;font-weight:800;color:var(--muted);margin-bottom:5px}
  .value{font-size:12px;font-weight:750;overflow-wrap:anywhere}
  .score-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
  .score-card{background:linear-gradient(140deg,#fff,#f8fafc)}
  .score-value{font-size:24px;line-height:1.1;font-weight:900;letter-spacing:-.04em;color:var(--purple);margin:3px 0}
  .score-note{font-size:10px;color:var(--muted)}
  .bar{height:5px;background:#e2e8f0;border-radius:10px;overflow:hidden;margin-top:8px}.bar span{display:block;height:100%;border-radius:10px;background:linear-gradient(90deg,#7c3aed,#06b6d4)}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .panel h3{margin:0 0 8px;font-size:11px}
  .pills{display:flex;flex-wrap:wrap;gap:5px}
  .pill{display:inline-block;background:#eef2ff;color:#4338ca;border:1px solid #e0e7ff;border-radius:999px;padding:4px 7px;font-size:10px;font-weight:750}
  .pill.match{background:#ecfdf5;color:#047857;border-color:#d1fae5}.pill.missing{background:#fff7ed;color:#c2410c;border-color:#fed7aa}
  ul{padding-left:17px;margin:0;display:grid;gap:4px;font-size:10px}li::marker{color:#7c3aed}.muted{color:var(--muted);font-size:10px}
  .recommendations{background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:13px}
  .recommendations ul{font-size:10.5px}
  .closing{margin-top:18px;padding:14px 18px;text-align:center;border-radius:12px;background:#f8fafc;border:1px solid var(--line)}
  .closing strong{display:block;font-size:15px;color:#4338ca;margin-bottom:3px}.closing p{margin:0;color:var(--muted);font-size:10px}
  .footer{display:flex;justify-content:space-between;gap:10px;margin-top:12px;color:#94a3b8;font-size:9px}
  @media(max-width:650px){.toolbar{align-items:flex-start;flex-direction:column;padding:12px 16px}.sheet{width:100%;margin:0;padding:16px;border-radius:0}.identity{grid-template-columns:1fr 1fr}.identity .info:first-child{grid-column:1/-1}.score-grid{gap:6px}.score-card{padding:9px}.score-value{font-size:20px}.two-col{grid-template-columns:1fr}h1{font-size:25px}.hero{padding:18px}}
  @page{size:A4;margin:9mm}
  @media print{
    body{background:#fff;font-size:10px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .toolbar{display:none!important}.sheet{width:100%;margin:0;padding:0;border:0;border-radius:0;box-shadow:none}
    .hero{padding:15px 18px}h1{font-size:23px}.section{margin-top:11px}.section-head{margin-bottom:6px;font-size:11px}
    .info,.score-card,.panel{padding:8px}.score-value{font-size:19px}.pill{padding:3px 5px;font-size:8px}
    .closing{margin-top:10px;padding:9px}.footer{margin-top:7px}
    .section,.hero,.identity,.score-grid,.two-col,.panel,.closing{break-inside:avoid;page-break-inside:avoid}
  }
</style>
</head>
<body>
  <div class="toolbar">
    <div class="brand">ResumeAI<span> Pro</span> <span style="color:#cbd5e1;font-weight:500;font-size:11px">/ Candidate Insight</span></div>
    <div class="actions">
      <button class="btn btn-print" onclick="window.print()">Print / Save as PDF</button>
      <button class="btn btn-close" onclick="window.close()">Close report</button>
    </div>
  </div>
  <main class="sheet">
    <header class="hero">
      <div class="eyebrow">ResumeAI Pro · Candidate Review</div>
      <h1>Resume Insights Report</h1>
      <p class="intro">A concise review of the candidate's resume signals, role alignment, skills evidence, and suggested next steps. Scores are screening indicators—not a hiring decision.</p>
      <div class="hero-foot"><span>Prepared for: <strong>${escapeHtml(name)}</strong></span><span>Generated: ${escapeHtml(generatedAt)}</span></div>
    </header>

    <section class="section">
      <h2 class="section-head">01 · Candidate Profile</h2>
      <div class="identity">
        <div class="info"><div class="label">Candidate name</div><div class="value">${escapeHtml(name)}</div></div>
        <div class="info"><div class="label">Email</div><div class="value">${escapeHtml(candidate.email, "Not provided")}</div></div>
        <div class="info"><div class="label">Phone</div><div class="value">${escapeHtml(candidate.phone, "Not provided")}</div></div>
        <div class="info"><div class="label">Resume file</div><div class="value">${escapeHtml(candidate.filename, "Filename unavailable")}</div></div>
        <div class="info"><div class="label">Analysis / upload date</div><div class="value">${escapeHtml(formatDate(candidate.date))}</div></div>
        <div class="info"><div class="label">Target job role</div><div class="value">${escapeHtml(role)}</div></div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-head">02 · Match & Score Summary</h2>
      <div class="score-grid">
        <div class="score-card"><div class="label">ATS score</div><div class="score-value">${escapeHtml(atsLabel)}</div><div class="score-note">Resume screening signal</div><div class="bar"><span style="width:${Math.max(0,Math.min(100,atsValue ?? 0))}%"></span></div></div>
        <div class="score-card"><div class="label">Job match</div><div class="score-value">${escapeHtml(matchLabel)}</div><div class="score-note">Alignment with selected role</div><div class="bar"><span style="width:${Math.max(0,Math.min(100,matchValue ?? 0))}%"></span></div></div>
        <div class="score-card"><div class="label">Skills score</div><div class="score-value">${escapeHtml(skillsLabel)}</div><div class="score-note">Skills signal from analysis</div><div class="bar"><span style="width:${Math.max(0,Math.min(100,Number(candidate.skillsScore) || 0))}%"></span></div></div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-head">03 · Skills Review</h2>
      <div class="two-col">
        <div class="panel"><h3>Detected skills</h3><div class="pills">${skillPills(candidate.skills, "No detected skills returned by the analysis.")}</div></div>
        <div class="panel"><h3>Skills matching the target role</h3><div class="pills">${skillPills(candidate.matchedSkills, "Matched skills were not returned by the analysis.").replace(/class="pill"/g,'class="pill match"')}</div></div>
        <div class="panel"><h3>Skills to develop / missing skills</h3><div class="pills">${skillPills(candidate.missingSkills, "Missing skills were not returned by the analysis.").replace(/class="pill"/g,'class="pill missing"')}</div></div>
        <div class="panel"><h3>Role alignment snapshot</h3><p style="font-size:10px;margin:0 0 5px"><strong>Target role:</strong> ${escapeHtml(role)}</p><p style="font-size:10px;margin:0"><strong>Interpretation:</strong> Use the match score and listed skills together. A score alone does not confirm suitability; validate experience, projects, and communication in follow-up review.</p></div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-head">04 · Review & Recommendations</h2>
      <div class="recommendations">
        <ul>${listItems(candidate.recommendations, "No specific recommendations were returned by the saved analysis. Review the missing skills and target-role requirements to plan next steps.")}</ul>
      </div>
    </section>

    <section class="closing">
      <strong>Thank you for using ResumeAI Pro</strong>
      <p>Helping turn resume data into clearer, more actionable career insights.</p>
    </section>
    <div class="footer"><span>ResumeAI Pro · Candidate Insights</span><span>Confidential review · Use alongside human judgment</span></div>
  </main>
</body>
</html>`);
  reportWindow.document.close();
  reportWindow.focus();
}
function CandidateCard({ candidate, onView }) {
  const score = candidate.ats;
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_20px_50px_rgba(99,102,241,0.12)] dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-violet-500/50 sm:p-6">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${scoreTone(score)}`} />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 text-xl font-bold text-white shadow-lg shadow-violet-500/15">
            {candidate.candidateName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || <i className="fa-solid fa-user" />}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-slate-900 dark:text-white">{candidate.candidateName}</h3>
            <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{candidate.email || "Email not provided"}</p>
            <span className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800 dark:bg-cyan-500/10 dark:text-cyan-300"><i className="fa-solid fa-briefcase" /> <span className="truncate">{candidate.jobRole || "Target role unavailable for this record"}</span></span>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"><i className="fa-solid fa-file-circle-check" /> Resume analyzed</span>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start">
          <div className={`flex h-[76px] w-[76px] shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${scoreTone(score)} text-white shadow-md`}>
            <span className="text-2xl font-extrabold leading-none">{score === null ? "—" : score}</span><span className="mt-1 text-[10px] font-bold tracking-wider">ATS SCORE</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-3 dark:bg-slate-800/70"><i className="fa-regular fa-file-lines w-4 text-center text-violet-500" /><span className="truncate text-sm text-slate-600 dark:text-slate-300" title={candidate.filename}>{candidate.filename}</span></div>
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-3 dark:bg-slate-800/70"><i className="fa-regular fa-calendar w-4 text-center text-violet-500" /><span className="text-sm text-slate-600 dark:text-slate-300">{formatDate(candidate.date)}</span></div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-3"><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">ATS compatibility</span><span className="text-sm font-bold text-slate-800 dark:text-white">{score === null ? "Not available" : `${score}%`}</span></div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full bg-gradient-to-r ${scoreTone(score)} transition-[width] duration-1000 ease-out`} style={{ width: `${Math.min(100, Math.max(0, score || 0))}%` }} /></div>
        <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400"><span>{scoreLabel(score)}</span><span>{candidate.jobRole || "Role not specified"}</span></div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 min-[480px]:gap-3">
        <div className="rounded-xl border border-slate-100 p-3.5 dark:border-slate-800"><p className="text-xs text-slate-500 dark:text-slate-400">Skills score</p><p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{candidate.skillsScore === null ? "—" : `${candidate.skillsScore}%`}</p></div>
        <div className="rounded-xl border border-slate-100 p-3.5 dark:border-slate-800"><p className="text-xs text-slate-500 dark:text-slate-400">Job Match Score</p><p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{candidate.jobMatch === null ? "—" : `${candidate.jobMatch}%`}</p></div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between"><h4 className="text-sm font-bold text-slate-800 dark:text-slate-100"><i className="fa-solid fa-code mr-2 text-violet-500" />Detected skills</h4><span className="text-xs text-slate-500">{candidate.skills.length} found</span></div>
        {candidate.skills.length ? <div className="flex flex-wrap gap-2">{candidate.skills.slice(0, 8).map((skill) => <span key={skill} className="rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 transition hover:-translate-y-0.5 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">{skill}</span>)}{candidate.skills.length > 8 && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">+{candidate.skills.length - 8} more</span>}</div> : <p className="text-sm text-slate-500 dark:text-slate-400">No skills returned for this record.</p>}
      </div>

      {candidate.recommendations.length > 0 && <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50/70 p-3.5 dark:border-amber-500/20 dark:bg-amber-500/5"><p className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300"><i className="fa-solid fa-lightbulb mr-2" />Next improvement</p><p className="text-sm leading-6 text-slate-700 dark:text-slate-300">{candidate.recommendations[0]}</p></div>}

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <span className="truncate text-xs text-slate-500 dark:text-slate-400">{candidate.phone || "Contact details not provided"}</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!candidate.resumeUrl}
            onClick={() => {
              if (!candidate.resumeUrl) return;
              window.open(candidate.resumeUrl, "_blank", "noopener,noreferrer");
            }}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            title={candidate.resumeUrl ? "Open original resume in a new tab" : "Original resume URL is unavailable"}
          >
            <i className="fa-solid fa-eye" /> View Resume
          </button>
          <button
            type="button"
            onClick={() => downloadCandidateInsights(candidate)}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            title="Download this candidate's insights report"
          >
            <i className="fa-solid fa-download" /> Download Insights
          </button>
          <button type="button" onClick={() => onView(candidate)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-violet-700 active:scale-[0.98] dark:bg-violet-600 dark:hover:bg-violet-500"><i className="fa-solid fa-arrow-up-right-from-square" /> Details</button>
        </div>
      </div>
    </article>
  );
}

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [atsFilter, setAtsFilter] = useState("");
  const [skillsFilter, setSkillsFilter] = useState("");
  const [jobRoleFilter, setJobRoleFilter] = useState("");
  const [matchFilter, setMatchFilter] = useState("");
  const [sortType, setSortType] = useState("date");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const loadLiveCandidates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("accessToken") || localStorage.getItem("token");
      const headers = { Accept: "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(HISTORY_ENDPOINT, { headers });
      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json") ? await response.json() : { message: await response.text() };
      if (!response.ok) throw new Error(payload.message || payload.error || `Could not load candidates (HTTP ${response.status}).`);
      const rows = Array.isArray(payload) ? payload : payload.resumes || payload.candidates || payload.history || payload.data?.resumes || payload.data?.candidates || payload.data || [];
      if (!Array.isArray(rows)) throw new Error("The history endpoint returned an unexpected response format.");
      setCandidates(rows.map(normalizeCandidate));
      setLastUpdated(new Date());
    } catch (err) {
      setCandidates([]);
      setError(`${err.message || "Could not load candidates."} Check that Flask is running and that the public resume endpoint is enabled.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadLiveCandidates(); }, [loadLiveCandidates]);

  const filteredCandidates = useMemo(() => {
    let rows = [...candidates];
    const query = searchText.trim().toLowerCase();
    if (query) rows = rows.filter((candidate) => [candidate.candidateName, candidate.email, candidate.filename, candidate.jobRole, ...candidate.skills].join(" ").toLowerCase().includes(query));
    if (atsFilter) rows = rows.filter((candidate) => candidate.ats !== null && candidate.ats >= Number(atsFilter));
    if (skillsFilter === "skills") rows = rows.filter((candidate) => candidate.skills.length > 0);
    if (skillsFilter === "no-skills") rows = rows.filter((candidate) => candidate.skills.length === 0);
    if (jobRoleFilter) {
      const selectedRole = normalizeRoleKey(jobRoleFilter);
      rows = rows.filter((candidate) => {
        const role = normalizeRoleKey(candidate.jobRole);
        if (!role) return false;
        const aliases = {
          "python full stack": "python full stack developer",
          "python full stack development": "python full stack developer",
          "full stack python developer": "python full stack developer",
          "backend": "backend developer",
          "back end": "backend developer",
          "back end developer": "backend developer",
          "frontend": "frontend developer",
          "front end": "frontend developer",
          "front end developer": "frontend developer",
          "mern": "mern stack developer",
          "machine learning": "machine learning engineer",
          "ai": "ai engineer",
          "data analytics": "data analyst",
        };
        const canonicalRole = aliases[role] || role;
        const canonicalSelectedRole = aliases[selectedRole] || selectedRole;
        return canonicalRole === canonicalSelectedRole;
      });
    }
    if (matchFilter) rows = rows.filter((candidate) => candidate.jobMatch !== null && candidate.jobMatch >= Number(matchFilter));
    rows.sort((a, b) => {
      if (sortType === "name") return a.candidateName.localeCompare(b.candidateName);
      if (sortType === "ats") return (b.ats ?? -1) - (a.ats ?? -1);
      if (sortType === "match") return (b.jobMatch ?? -1) - (a.jobMatch ?? -1);
      return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
    });
    return rows;
  }, [candidates, searchText, atsFilter, skillsFilter, jobRoleFilter, matchFilter, sortType]);

  const stats = useMemo(() => {
    const scored = candidates.filter((candidate) => candidate.ats !== null);
    const avg = (field) => {
      const values = candidates.map((candidate) => candidate[field]).filter((value) => value !== null && value !== undefined && Number.isFinite(Number(value)));
      return values.length ? Math.round(values.reduce((sum, value) => sum + Number(value), 0) / values.length) : null;
    };
    return { total: candidates.length, averageAts: avg("ats"), excellent: scored.filter((candidate) => candidate.ats >= 90).length, withSkills: candidates.filter((candidate) => candidate.skills.length > 0).length };
  }, [candidates]);

  const availableRoles = useMemo(() => {
    // Include every supported role, then append any custom roles found in saved records.
    const observedRoles = candidates.map((candidate) => candidate.jobRole).filter(Boolean);
    const byKey = new Map();
    [...JOB_ROLES, ...observedRoles].forEach((role) => {
      const key = normalizeRoleKey(role);
      if (key && !byKey.has(key)) byKey.set(key, role);
    });
    return [...byKey.values()].sort((a, b) => a.localeCompare(b));
  }, [candidates]);

  const resetFilters = () => { setSearchText(""); setAtsFilter(""); setSkillsFilter(""); setJobRoleFilter(""); setMatchFilter(""); setSortType("date"); };

  return (
    <main className="min-h-[calc(100vh-72px)] w-full overflow-x-clip bg-slate-50 px-3 pb-10 pt-5 text-slate-800 dark:bg-slate-950 dark:text-slate-100 min-[480px]:px-4 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8">
      <div className="mx-auto w-full max-w-[1480px]">
        <header className="relative mb-5 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 px-4 py-5 min-[480px]:rounded-[24px] min-[480px]:px-5 min-[480px]:py-6 sm:mb-8 sm:rounded-[28px] sm:px-9 sm:py-10 text-white shadow-xl shadow-indigo-950/10 sm:px-9 sm:py-10">
          <div className="pointer-events-none absolute -right-10 -top-24 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 right-1/3 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl" />
          <div className="relative flex min-w-0 flex-col justify-between gap-5 sm:gap-7 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200"><i className="fa-solid fa-users" /> Candidate intelligence</span>
              <h1 className="mt-4 break-words text-2xl font-extrabold tracking-tight min-[480px]:text-3xl sm:text-4xl lg:text-5xl">Candidate <span className="text-cyan-300">Workspace</span></h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Review analyzed resumes, compare ATS signals, explore detected skills, and find the records that need attention.</p>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-300"><span className="inline-flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${loading ? "animate-pulse bg-amber-300" : "bg-emerald-300"}`} />Live saved resume records</span>{lastUpdated && <span>Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>}</div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={loadLiveCandidates} disabled={loading} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-sm font-bold min-[420px]:w-auto min-[420px]:px-4 text-slate-900 transition hover:-translate-y-0.5 hover:bg-cyan-100 disabled:opacity-60"><i className={`fa-solid fa-rotate ${loading ? "animate-spin" : ""}`} /> Refresh</button>
              <Link to="/resume-analyzer" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-400 px-3 py-3 text-sm font-bold min-[420px]:w-auto min-[420px]:px-4 text-slate-950 transition hover:-translate-y-0.5 hover:brightness-110"><i className="fa-solid fa-plus" /> Analyze resume</Link>
            </div>
          </div>
        </header>

        {error && <div role="alert" className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"><i className="fa-solid fa-circle-exclamation mt-0.5" /><p>{error}</p></div>}

        <section className="mb-5 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:mb-7 sm:gap-4 xl:grid-cols-4">
          <StatCard icon="fa-users" label="Candidate records" value={stats.total} detail="Saved records returned by the API" accent="from-violet-500 to-blue-500" />
          <StatCard icon="fa-chart-line" label="Average ATS score" value={stats.averageAts === null ? "—" : `${stats.averageAts}%`} detail="Across records with a score" accent="from-blue-500 to-cyan-400" />
          <StatCard icon="fa-award" label="Excellent scores" value={stats.excellent} detail="ATS score of 90 or higher" accent="from-emerald-500 to-teal-400" />
          <StatCard icon="fa-code" label="Records with skills" value={stats.withSkills} detail="At least one detected skill" accent="from-amber-500 to-orange-400" />
        </section>

        <Panel className="mb-5 p-3 min-[480px]:p-4 sm:mb-6 sm:p-5">
          <div className="mb-4 flex flex-col items-stretch justify-between gap-3 min-[480px]:flex-row min-[480px]:items-center"><div><h2 className="font-bold text-slate-900 dark:text-white">Find candidates</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Search, filter, and sort the current records.</p></div><button type="button" onClick={resetFilters} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><i className="fa-solid fa-filter-circle-xmark" /> Reset filters</button></div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            <label className="relative block xl:col-span-1"><span className="sr-only">Search candidates</span><i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-violet-500" /><input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Name, email, file, job role, skill..." className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500" /></label>
            <label><span className="sr-only">Filter by ATS score</span><select value={atsFilter} onChange={(event) => setAtsFilter(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="">Any ATS score</option><option value="90">90+ · Excellent</option><option value="80">80+ · Very good</option><option value="70">70+ · Good</option><option value="50">50+ · Developing</option></select></label>
            <label><span className="sr-only">Filter by skills</span><select value={skillsFilter} onChange={(event) => setSkillsFilter(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="">All skill states</option><option value="skills">Has detected skills</option><option value="no-skills">No detected skills</option></select></label>
            <label><span className="sr-only">Filter by job role</span><select value={jobRoleFilter} onChange={(event) => setJobRoleFilter(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="">All job roles</option>{availableRoles.map((role) => <option key={role} value={role}>{role}</option>)}</select></label>
            <label><span className="sr-only">Filter by job match score</span><select value={matchFilter} onChange={(event) => setMatchFilter(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="">Any job match score</option><option value="90">90%+ match</option><option value="80">80%+ match</option><option value="70">70%+ match</option><option value="50">50%+ match</option></select></label>
            <label><span className="sr-only">Sort candidates</span><select value={sortType} onChange={(event) => setSortType(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="date">Newest first</option><option value="ats">Highest ATS first</option><option value="match">Highest job match first</option><option value="name">Name A–Z</option></select></label>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400"><span><strong className="text-slate-800 dark:text-slate-200">{filteredCandidates.length}</strong> of {candidates.length} records shown</span><span>Scores are screening signals, not hiring decisions.</span></div>
        </Panel>

        {loading ? <Panel className="px-6 py-20 text-center"><div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600 dark:border-slate-700 dark:border-t-violet-400" /><p className="mt-4 font-semibold text-slate-700 dark:text-slate-200">Loading candidate records…</p><p className="mt-1 text-sm text-slate-500">Connecting to the resume service</p></Panel> : filteredCandidates.length ? <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">{filteredCandidates.map((candidate, index) => <div key={candidate.id ?? `${candidate.filename}-${index}`} className="animate-[candidateIn_450ms_ease_both]" style={{ animationDelay: `${Math.min(index * 55, 330)}ms` }}><CandidateCard candidate={candidate} onView={setSelectedCandidate} /></div>)}</section> : <Panel className="px-6 py-16 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-2xl text-violet-600 dark:bg-violet-500/10 dark:text-violet-300"><i className="fa-solid fa-users-slash" /></div><h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">{!error ? "No saved candidates yet" : "Candidates could not be loaded"}</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">{error ? "Check the message above and confirm the backend is running." : "Analyze a resume to create a saved record, or reset filters to show all records."}</p><div className="mt-5 flex flex-wrap justify-center gap-3"><button type="button" onClick={resetFilters} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Reset filters</button><Link to="/resume-analyzer" className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700">Analyze a resume</Link></div></Panel>}

        <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center"><span><i className="fa-solid fa-shield-halved mr-2 text-emerald-500" />Resume details are displayed only when returned by the backend.</span><span>ResumeAI Pro · Candidate Workspace</span></footer>
      </div>

      {selectedCandidate && <div className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-slate-950/65 p-2 backdrop-blur-sm min-[480px]:items-center min-[480px]:p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedCandidate(null); }}><div role="dialog" aria-modal="true" aria-labelledby="candidate-detail-title" className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-4 sm:rounded-3xl sm:p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-500">Candidate details</p><h2 id="candidate-detail-title" className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{selectedCandidate.candidateName}</h2><p className="mt-1 break-all text-sm text-slate-500 dark:text-slate-400">{selectedCandidate.filename}</p></div><button type="button" onClick={() => setSelectedCandidate(null)} aria-label="Close details" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><i className="fa-solid fa-xmark" /></button></div><div className="mt-5 grid min-w-0 grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:mt-6">{[["Email", selectedCandidate.email], ["Phone", selectedCandidate.phone], ["Analysis date", formatDate(selectedCandidate.date)], ["Target role", selectedCandidate.jobRole], ["ATS score", selectedCandidate.ats === null ? "Not available" : `${selectedCandidate.ats}%`], ["Skills score", selectedCandidate.skillsScore === null ? "Not available" : `${selectedCandidate.skillsScore}%`], ["Job Match Score", selectedCandidate.jobMatch === null ? "Not available" : `${selectedCandidate.jobMatch}%`]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800"><p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-semibold text-slate-900 dark:text-white">{value || "Not provided"}</p></div>)}</div><div className="mt-6"><h3 className="font-bold text-slate-900 dark:text-white">Detected skills</h3><div className="mt-3 flex flex-wrap gap-2">{selectedCandidate.skills.length ? selectedCandidate.skills.map((skill) => <span key={skill} className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">{skill}</span>) : <p className="text-sm text-slate-500">No skills available.</p>}</div></div><div className="mt-5 grid min-w-0 grid-cols-1 gap-5 min-[480px]:grid-cols-2 sm:mt-6"><section><h3 className="font-bold text-slate-900 dark:text-white">Matched job skills</h3><div className="mt-3 flex flex-wrap gap-2">{selectedCandidate.matchedSkills.length ? selectedCandidate.matchedSkills.map((skill) => <span key={skill} className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{skill}</span>) : <p className="text-sm text-slate-500">Not returned by API.</p>}</div></section><section><h3 className="font-bold text-slate-900 dark:text-white">Missing job skills</h3><div className="mt-3 flex flex-wrap gap-2">{selectedCandidate.missingSkills.length ? selectedCandidate.missingSkills.map((skill) => <span key={skill} className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">{skill}</span>) : <p className="text-sm text-slate-500">Not returned by API.</p>}</div></section></div><div className="mt-6"><h3 className="font-bold text-slate-900 dark:text-white">Recommendations</h3>{selectedCandidate.recommendations.length ? <ul className="mt-3 space-y-2">{selectedCandidate.recommendations.map((item, index) => <li key={`${item}-${index}`} className="flex gap-2 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700 dark:bg-slate-800 dark:text-slate-300"><i className="fa-solid fa-check mt-1 text-emerald-500" />{item}</li>)}</ul> : <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No recommendations returned for this record.</p>}</div><div className="mt-7 flex justify-end"><button type="button" onClick={() => setSelectedCandidate(null)} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 dark:bg-violet-600">Close</button></div></div></div>}

      <style>{`@keyframes candidateIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } } @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; } }`}</style>
    </main>
  );
}
