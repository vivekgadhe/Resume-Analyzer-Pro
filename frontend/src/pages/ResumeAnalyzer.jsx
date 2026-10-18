import { useEffect, useRef, useState } from "react";
import API_BASE_URL from "../config/api";
const ANALYZE_ENDPOINT = `${API_BASE_URL}/api/resumes/analyze`;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".docx"];
const ALLOWED_JOB_DESCRIPTION_EXTENSIONS = [".pdf", ".docx", ".txt"];

const JOB_ROLES = [
  "Python Developer",
  "Python Full Stack Developer",
  "Backend Developer",
  "Frontend Developer",
  "Full Stack Developer",
  "AI Engineer",
  "Machine Learning Engineer",
  "Data Analyst",
  "Data Scientist",
  "Java Developer",
  "MERN Stack Developer",
  "DevOps Engineer",
  "Software Engineer",
  "Other",
];

function splitText(value) {
  if (Array.isArray(value)) {
    return value.map((item) =>
      typeof item === "string"
        ? item
        : item?.text || item?.message || item?.recommendation || ""
    ).filter(Boolean);
  }
  if (typeof value === "string") {
    return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function normalizeAnalysis(payload, filename) {
  const resume = payload?.resume || {};
  const result = payload?.analysis || payload?.result || payload?.data || {};
  const analysis = result?.analysis || result;
  const metrics = analysis?.metrics || analysis?.scores || {};
  const rawSkills = analysis?.detected_skills || analysis?.skills || [];
  const suggestions = analysis?.recommendations ?? analysis?.suggestions ??
    analysis?.improvement_suggestions ?? resume?.analysis?.suggestions ?? [];

  const numeric = (...values) => {
    for (const value of values) {
      if (value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value))) {
        return Number(value);
      }
    }
    return null;
  };

  return {
    filename: resume.original_filename || resume.filename || analysis.filename ||
      analysis.original_filename || filename,
    date: analysis.analyzed_at || resume.uploaded_at || analysis.date ||
      analysis.created_at || new Date().toLocaleString(),
    overall_rating: numeric(analysis.overall_rating, analysis.ats_score, analysis.overall_score,
      analysis.score, metrics.overall, metrics.ats_score),
    rating_label: analysis.rating_label || analysis.score_label || "Analysis complete",
    candidate_name: resume.candidate_name || analysis.candidate_name || analysis.full_name ||
      analysis.name || null,
    email: resume.candidate_email || analysis.candidate_email || analysis.email || null,
    phone: resume.candidate_phone || analysis.candidate_phone || analysis.phone ||
      analysis.phone_number || null,
    location: resume.candidate_location || analysis.candidate_location ||
      analysis.location || analysis.address || null,
    skills_match: numeric(analysis.skills_score, analysis.skills_match, analysis.skill_match,
      metrics.skills_match),
    experience: numeric(analysis.experience_score, analysis.experience, metrics.experience),
    education: numeric(analysis.education_score, analysis.education, metrics.education),
    keywords: numeric(analysis.keyword_score, analysis.keywords, metrics.keywords),
    skills: Array.isArray(rawSkills)
      ? rawSkills.map((skill) =>
          typeof skill === "string"
            ? { name: skill, score: null }
            : {
                name: skill?.name || skill?.skill || skill?.label || "Unknown skill",
                score: numeric(skill?.score, skill?.match_percentage, skill?.percentage),
              }
        ).filter((skill) => skill.name)
      : [],
    match_percentage: numeric(analysis.match_percentage, analysis.job_match_percentage,
      analysis.job_match, analysis.role_match_percentage),
    recommendations: splitText(suggestions),
    strengths: splitText(analysis.strengths),
    weaknesses: splitText(analysis.weaknesses),
    missing_skills: splitText(analysis.missing_skills),
    matched_skills: splitText(analysis.matched_skills),
    target_skills: splitText(analysis.target_skills),
    word_count: numeric(analysis.word_count),
    quantified_results_count: numeric(analysis.quantified_results_count),
    selected_job_role: analysis.job_role || payload?.job_role || null,
    analysis_basis: analysis.analysis_basis || payload?.analysis_basis || null,
    job_description_source: analysis.job_description_source || payload?.job_description_source || null,
  };
}

function InfoBox({ label, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 p-5">
      <span className="mb-2 block text-sm text-slate-600 dark:text-slate-400">{label}</span>
      <p className="break-words text-base font-semibold text-slate-900 dark:text-white">{value || "Not provided"}</p>
    </div>
  );
}

function MetricCard({ title, value }) {
  const hasValue = value !== null && value !== undefined && value !== "";
  const displayValue = hasValue ? `${Math.round(Number(value) * 10) / 10}%` : "N/A";
  const width = hasValue ? Math.min(100, Math.max(0, Number(value))) : 0;

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/80 sm:p-6 transition hover:-translate-y-1 hover:border-violet-400/60">
      <div className="flex items-center justify-between text-sm font-semibold text-emerald-400">
        <span>{title}</span>
        <i className="fa-regular fa-circle-check" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-3xl font-bold text-violet-400">{displayValue}</h3>
      <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-700"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function ListSection({ title, items, emptyText, icon = "✓" }) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/80 sm:p-6">
      <h3 className="mb-5 text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
      {items.length ? (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-sm text-emerald-400">
                {icon}
              </span>
              <span className="leading-6">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{emptyText}</p>
      )}
    </section>
  );
}

export default function ResumeAnalyzer() {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [jobRole, setJobRole] = useState("Python Developer");
  const [customJobRole, setCustomJobRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [jobDescriptionMode, setJobDescriptionMode] = useState("text");
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [jobDescriptionFile, setJobDescriptionFile] = useState(null);
  const [isJobDescriptionDragging, setIsJobDescriptionDragging] = useState(false);
  const jobDescriptionInputRef = useRef(null);

  const effectiveJobRole = jobRole === "Other" ? customJobRole.trim() : jobRole;

  useEffect(() => {
    if (!analysis) return undefined;
    const timer = window.setTimeout(() => {
      document.querySelectorAll(".resume-progress").forEach((bar) => {
        bar.style.width = `${bar.dataset.width || 0}%`;
      });
    }, 100);
    return () => window.clearTimeout(timer);
  }, [analysis]);

  const analyzeFile = async (file) => {
    if (!file) return;
    setError("");
    setSuccessMessage("");
    setAnalysis(null);

    const lowerName = file.name.toLowerCase();
    if (!ALLOWED_EXTENSIONS.some((extension) => lowerName.endsWith(extension))) {
      setSelectedFile(null);
      setUploadedFile(null);
      setError("Unsupported file type. Please select a PDF or DOCX file.");
      return;
    }
    if (!file.size) {
      setSelectedFile(null);
      setUploadedFile(null);
      setError("The selected file is empty. Please choose another resume.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setUploadedFile(null);
      setError("The selected file exceeds the 10 MB limit.");
      return;
    }
    const hasJobDescription = jobDescriptionMode === "text"
      ? Boolean(jobDescriptionText.trim())
      : Boolean(jobDescriptionFile);

    if (!effectiveJobRole && !hasJobDescription) {
      setError("Please select or enter a target job role, or provide a job description.");
      return;
    }

    setSelectedFile(file);
    setUploadedFile({ name: file.name, size: file.size, status: "processing" });
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      if (effectiveJobRole) formData.append("job_role", effectiveJobRole);
      if (jobDescriptionMode === "text" && jobDescriptionText.trim()) {
        formData.append("job_description", jobDescriptionText.trim());
      } else if (jobDescriptionMode === "file" && jobDescriptionFile) {
        // The Flask endpoint should extract text from this file before matching.
        formData.append("job_description_file", jobDescriptionFile);
      }

      const response = await fetch(ANALYZE_ENDPOINT, {
        method: "POST",
        body: formData,
      });
      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : { message: await response.text() };

      if (!response.ok) {
        throw new Error(data.message || data.error || data.detail ||
          `Resume analysis failed (HTTP ${response.status}).`);
      }

      const normalized = normalizeAnalysis(data, file.name);
      setAnalysis(normalized);
      setUploadedFile({ name: file.name, size: file.size, status: "completed" });
      setSuccessMessage(
        hasJobDescription
          ? "Resume analyzed against your supplied job description."
          : `Resume analyzed using the ${effectiveJobRole} role profile.`
      );
    } catch (requestError) {
      console.error("Resume analysis error:", requestError);
      setUploadedFile({ name: file.name, size: file.size, status: "failed" });
      setError(requestError.message || "Could not connect to the backend. Confirm Flask is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) analyzeFile(file);
    event.target.value = "";
  };

  const handleJobDescriptionFile = (file) => {
    if (!file) return;
    const lowerName = file.name.toLowerCase();
    if (!ALLOWED_JOB_DESCRIPTION_EXTENSIONS.some((extension) => lowerName.endsWith(extension))) {
      setError("Unsupported job description file. Please select a PDF, DOCX, or TXT file.");
      return;
    }
    if (!file.size || file.size > MAX_FILE_SIZE) {
      setError(!file.size
        ? "The job description file is empty. Please choose another file."
        : "The job description file exceeds the 10 MB limit.");
      return;
    }
    setError("");
    setJobDescriptionFile(file);
  };

  const clearWorkspace = () => {
    setSelectedFile(null);
    setUploadedFile(null);
    setAnalysis(null);
    setError("");
    setSuccessMessage("");
    setJobDescriptionText("");
    setJobDescriptionFile(null);
    setJobDescriptionMode("text");
    setIsLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (jobDescriptionInputRef.current) jobDescriptionInputRef.current.value = "";
  };

  const formatFileSize = (bytes) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

  return (
    <main className="min-h-[calc(100vh-72px)] w-full overflow-x-clip bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <section className="mx-auto w-full max-w-[1400px] px-4 pb-6 pt-10 text-center sm:px-6 sm:pt-14 md:px-8 md:pt-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-300">
          <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />
          Resume intelligence
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:mt-5 sm:text-4xl md:text-5xl">
          Resume <span className="text-violet-400">Analyzer</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl px-1 text-sm leading-6 text-slate-600 dark:text-slate-400 sm:mt-4 sm:text-base sm:leading-7 md:text-lg">
          Upload your resume to review its skills, experience, keywords, and improvement suggestions.
        </p>
      </section>

      <section className="mx-auto w-full max-w-[1100px] px-3 sm:px-5 md:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-black/10 dark:border-slate-700 dark:bg-slate-900/90 sm:rounded-3xl sm:p-6 md:p-8">
          <div className="mb-5 flex items-start gap-3 sm:mb-6 sm:items-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-xl text-violet-300">
              <i className="fa-solid fa-bullseye" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">Target job role</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Choose the role you want your resume reviewed for.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Select job role</span>
              <select
                value={jobRole}
                onChange={(event) => setJobRole(event.target.value)}
                disabled={isLoading}
                className="w-full rounded-xl border border-slate-300 bg-white dark:border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-4 py-3.5 text-slate-900 dark:text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
              >
                {JOB_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {jobRole === "Other" ? "Enter custom job title" : "Selected role"}
              </span>
              {jobRole === "Other" ? (
                <input
                  value={customJobRole}
                  onChange={(event) => setCustomJobRole(event.target.value)}
                  placeholder="e.g. Cloud Engineer"
                  disabled={isLoading}
                  className="w-full rounded-xl border border-slate-300 bg-white dark:border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-4 py-3.5 text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                />
              ) : (
                <div className="flex min-h-[52px] items-center gap-3 rounded-xl border border-slate-300 bg-slate-50 dark:border-slate-200 dark:border-slate-700 dark:bg-slate-800/60 px-4 text-slate-800 dark:text-slate-200">
                  <i className="fa-solid fa-check-circle text-emerald-400" aria-hidden="true" />
                  {jobRole}
                </div>
              )}
            </label>
          </div>

          {/* Separate job-description input: paste text OR upload a file. */}
          <section className="mt-6 rounded-2xl border border-blue-400/25 bg-slate-100 p-4 dark:bg-slate-800/45 sm:mt-8 sm:p-5 md:p-6">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-xl text-blue-300">
                <i className="fa-solid fa-briefcase" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Job Description</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Add the job requirements to compare them with the resume. Choose one input method below; this section is separate from the resume upload.
                </p>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap" role="tablist" aria-label="Job description input method">
              <button
                type="button"
                role="tab"
                aria-selected={jobDescriptionMode === "text"}
                onClick={() => { setJobDescriptionMode("text"); setJobDescriptionFile(null); if (jobDescriptionInputRef.current) jobDescriptionInputRef.current.value = ""; }}
                disabled={isLoading}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${jobDescriptionMode === "text" ? "bg-blue-500 text-white shadow-lg shadow-blue-900/20" : "border border-slate-300 bg-white dark:border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-blue-400/60"}`}
              >
                <i className="fa-solid fa-keyboard mr-2" aria-hidden="true" />Paste description
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={jobDescriptionMode === "file"}
                onClick={() => { setJobDescriptionMode("file"); setJobDescriptionText(""); }}
                disabled={isLoading}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${jobDescriptionMode === "file" ? "bg-blue-500 text-white shadow-lg shadow-blue-900/20" : "border border-slate-300 bg-white dark:border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-blue-400/60"}`}
              >
                <i className="fa-solid fa-file-arrow-up mr-2" aria-hidden="true" />Select a file
              </button>
            </div>

            {jobDescriptionMode === "text" ? (
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Paste or type the job description</span>
                <textarea
                  value={jobDescriptionText}
                  onChange={(event) => setJobDescriptionText(event.target.value)}
                  disabled={isLoading}
                  rows={7}
                  placeholder="Paste the job description here, including responsibilities, required skills, qualifications, and experience..."
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white dark:border-slate-200 dark:border-slate-700 dark:bg-slate-900 px-4 py-3.5 leading-6 text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                />
                <span className="mt-2 block text-xs text-slate-500">{jobDescriptionText.trim() ? `${jobDescriptionText.trim().split(/\s+/).length} words added` : "No job description added — role-based analysis can still run."}</span>
              </label>
            ) : (
              <div
                onDragEnter={(event) => { event.preventDefault(); setIsJobDescriptionDragging(true); }}
                onDragOver={(event) => { event.preventDefault(); setIsJobDescriptionDragging(true); }}
                onDragLeave={(event) => { event.preventDefault(); setIsJobDescriptionDragging(false); }}
                onDrop={(event) => { event.preventDefault(); setIsJobDescriptionDragging(false); if (!isLoading) handleJobDescriptionFile(event.dataTransfer.files?.[0]); }}
                className={`rounded-xl border-2 border-dashed p-7 text-center transition ${isJobDescriptionDragging ? "border-blue-400 bg-blue-500/10" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-blue-400/70"}`}
              >
                <input
                  ref={jobDescriptionInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  hidden
                  disabled={isLoading}
                  onChange={(event) => { handleJobDescriptionFile(event.target.files?.[0]); event.target.value = ""; }}
                />
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/15 text-2xl text-blue-300">
                  <i className="fa-solid fa-file-arrow-up" aria-hidden="true" />
                </div>
                <p className="mt-4 font-semibold text-slate-900 dark:text-white">Drop your job description file here</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">or select a file from your device</p>
                <p className="mt-2 text-xs text-slate-500">PDF, DOCX, or TXT · Maximum 10 MB</p>
                <button type="button" onClick={() => jobDescriptionInputRef.current?.click()} disabled={isLoading} className="mt-4 rounded-lg border border-blue-400/40 px-4 py-2.5 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/10 disabled:opacity-60">
                  Browse Job Description
                </button>
                {jobDescriptionFile && (
                  <div className="mx-auto mt-4 flex max-w-xl items-center justify-between gap-3 rounded-lg border border-blue-400/20 bg-blue-500/10 p-3 text-left">
                    <span className="min-w-0 break-all text-sm text-blue-100"><i className="fa-solid fa-file-lines mr-2" aria-hidden="true" />{jobDescriptionFile.name}</span>
                    <button type="button" onClick={() => setJobDescriptionFile(null)} disabled={isLoading} className="shrink-0 text-sm font-semibold text-red-300 hover:text-red-200">Remove</button>
                  </div>
                )}
              </div>
            )}
            <p className="mt-4 text-xs leading-5 text-slate-500">
              This field is optional. If you leave it empty, your resume will be compared with the selected job role's expected skills. If you provide a description, the analysis will use that description instead.
            </p>
          </section>

          <div
            onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragLeave={(event) => { event.preventDefault(); setIsDragging(false); }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              if (!isLoading) analyzeFile(event.dataTransfer.files?.[0]);
            }}
            className={`mt-7 rounded-2xl border-2 border-dashed p-8 text-center transition md:p-12 ${
              isDragging
                ? "border-violet-400 bg-violet-500/10"
                : "border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/40 hover:border-violet-400/70"
            }`}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-2xl text-white shadow-lg shadow-violet-900/30">
              <i className="fa-solid fa-cloud-arrow-up" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white sm:mt-5 sm:text-2xl">Upload your resume</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">Drag and drop your file here, or browse your device.</p>
            <p className="mt-2 text-sm text-slate-500">PDF or DOCX · Maximum 10 MB</p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              hidden
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <div className="mt-5 flex w-full flex-col justify-center gap-3 sm:mt-6 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 px-5 py-3.5 font-bold text-white sm:w-auto sm:px-6 shadow-lg shadow-violet-900/25 transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <i className="fa-solid fa-folder-open mr-2" aria-hidden="true" />
                Choose Resume
              </button>
              <button
                type="button"
                onClick={clearWorkspace}
                disabled={isLoading}
                className="w-full rounded-xl border border-slate-200 px-5 py-3.5 font-semibold dark:border-slate-700 sm:w-auto sm:px-6 text-slate-700 dark:text-slate-300 transition hover:border-red-400 hover:text-red-300 disabled:opacity-60"
              >
                Clear Workspace
              </button>
            </div>
            {selectedFile && (
              <p className="mt-4 break-all text-sm text-violet-300">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>

          {error && (
            <div role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              <i className="fa-solid fa-circle-exclamation mr-2" aria-hidden="true" />{error}
            </div>
          )}
          {successMessage && (
            <div role="status" className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              <i className="fa-solid fa-circle-check mr-2" aria-hidden="true" />{successMessage}
            </div>
          )}
          {uploadedFile && (
            <div className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-200 dark:border-slate-700 dark:bg-slate-800/70 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <i className="fa-solid fa-file-pdf text-2xl text-violet-300" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="break-all font-semibold text-slate-900 dark:text-white">{uploadedFile.name}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{formatFileSize(uploadedFile.size)}</p>
                </div>
              </div>
              <span className={`w-fit rounded-full px-3 py-1.5 text-sm font-semibold ${
                uploadedFile.status === "completed"
                  ? "bg-emerald-500/15 text-emerald-300"
                  : uploadedFile.status === "failed"
                    ? "bg-red-500/15 text-red-300"
                    : "bg-amber-500/15 text-amber-300"
              }`}>
                {uploadedFile.status === "processing" ? "Processing" : uploadedFile.status}
              </span>
            </div>
          )}
        </div>
      </section>

      {analysis && (
        <section className="mx-auto my-8 w-full max-w-[1400px] px-3 sm:my-10 sm:px-5 md:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-black/10 dark:border-slate-700 dark:bg-slate-900/90 sm:rounded-3xl sm:p-6 md:p-9">
            <div className="mb-6 flex flex-col gap-5 sm:mb-8 sm:gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:h-16 sm:w-16 sm:rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-2xl text-white">
                  <i className="fa-solid fa-file-lines" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h2 className="break-all text-base font-bold text-slate-900 dark:text-white sm:text-xl md:text-2xl">{analysis.filename}</h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Analyzed on {analysis.date}</p>
                  <p className="mt-1 text-sm text-violet-300">Target role: {analysis.selected_job_role || effectiveJobRole || "Based on job description"}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Analysis basis: {analysis.analysis_basis === "job_description" || (jobDescriptionMode === "text" && jobDescriptionText.trim()) || (jobDescriptionMode === "file" && jobDescriptionFile) ? "Job description" : "Selected job role"}
                  </p>
                </div>
              </div>
              <div className="text-left xl:text-right">
                <p className="text-4xl font-extrabold text-violet-400 sm:text-5xl">
                  {analysis.overall_rating === null ? "N/A" : `${analysis.overall_rating}%`}
                </p>
                <p className="mt-2 font-semibold text-slate-600 dark:text-slate-400">{analysis.rating_label}</p>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:mb-8 sm:gap-4 xl:grid-cols-4">
              <InfoBox label="Name" value={analysis.candidate_name} />
              <InfoBox label="Email" value={analysis.email} />
              <InfoBox label="Phone" value={analysis.phone} />
              <InfoBox label="Location" value={analysis.location} />
            </div>

            <div className="mb-8 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:mb-10 sm:gap-5 xl:grid-cols-4">
              <MetricCard title="Skills Match" value={analysis.skills_match} />
              <MetricCard title="Experience" value={analysis.experience} />
              <MetricCard title="Education" value={analysis.education} />
              <MetricCard title="Keywords" value={analysis.keywords} />
            </div>

            <section className="mb-10">
              <h3 className="mb-5 text-2xl font-bold text-slate-900 dark:text-white">Detected Skills</h3>
              {analysis.skills.length ? (
                <div className="flex flex-wrap gap-3">
                  {analysis.skills.map((skill, index) => (
                    <span key={`${skill.name}-${index}`} className="max-w-full break-words rounded-full border border-violet-400/30 bg-slate-100 px-3 py-2 text-sm font-semibold dark:bg-slate-800 sm:px-5 sm:py-3 sm:text-base text-slate-800 dark:text-slate-200">
                      {skill.name}
                      {skill.score !== null && <span className="ml-2 text-violet-300">{skill.score}%</span>}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 dark:text-slate-400">No skills were returned by the backend.</p>
              )}
            </section>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:gap-5 lg:grid-cols-2">
              <ListSection title="Strengths" items={analysis.strengths} emptyText="No strengths were returned by the backend." />
              <ListSection title="Areas to improve" items={analysis.weaknesses} emptyText="No weaknesses were returned by the backend." icon="!" />
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 p-7 text-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Job Match Analysis</h3>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{analysis.analysis_basis === "job_description" || (jobDescriptionMode === "text" && jobDescriptionText.trim()) || (jobDescriptionMode === "file" && jobDescriptionFile) ? "Match against supplied job description" : `Match for ${analysis.selected_job_role || effectiveJobRole || "selected role"}`}</p>
                <p className="mt-2 text-5xl font-extrabold text-violet-400">
                  {analysis.match_percentage === null ? "N/A" : `${analysis.match_percentage}%`}
                </p>
                {analysis.match_percentage === null && (
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    The backend must calculate role-specific matching to provide this score.
                  </p>
                )}
                {analysis.target_skills.length > 0 && (
                  <div className="mt-5 w-full text-left">
                    <h4 className="mb-2 font-semibold text-slate-900 dark:text-white">Role skills detected</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.matched_skills.map((skill, index) => (
                        <span key={`matched-${skill}-${index}`} className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-200">{skill}</span>
                      ))}
                    </div>
                    <h4 className="mb-2 mt-4 font-semibold text-slate-900 dark:text-white">Target skills not detected</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missing_skills.map((skill, index) => (
                        <span key={`missing-${skill}-${index}`} className="rounded-full bg-amber-500/10 px-3 py-1.5 text-sm text-amber-200">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <ListSection
                title="Recommendations"
                items={analysis.recommendations}
                emptyText="No recommendations were returned by the backend."
                icon="✓"
              />
            </div>
          </div>
        </section>
      )}

      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm" role="status" aria-label="Analyzing resume">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-violet-400" />
            <p className="mt-5 font-semibold text-slate-900 dark:text-white">Analyzing your resume...</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">This may take a few seconds.</p>
          </div>
        </div>
      )}
    </main>
  );
}
