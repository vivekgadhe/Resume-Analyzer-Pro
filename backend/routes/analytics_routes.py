from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from flask import Blueprint, jsonify, request
from sqlalchemy import desc

from extensions import db
from models.resume import Resume
from models.resume_analysis import ResumeAnalysis

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")


def _as_number(value):
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def _date_label(value, days):
    if days <= 7:
        return value.strftime("%b %d")
    if days <= 90:
        monday = value.date() - timedelta(days=value.weekday())
        return monday.strftime("%b %d")
    return value.strftime("%b %Y")


def _skill_list(value):
    if isinstance(value, dict):
        return [str(k) for k, v in value.items() if v]
    if isinstance(value, list):
        result = []
        for item in value:
            if isinstance(item, str):
                result.append(item)
            elif isinstance(item, dict):
                name = item.get("name") or item.get("skill") or item.get("label")
                if name:
                    result.append(str(name))
        return result
    return []


@analytics_bp.get("/summary")
def analytics_summary():
    period_value = request.args.get("days", "30").lower()
    if period_value == "all":
        days = None
    else:
        try:
            days = int(period_value)
            if days not in (7, 30, 90):
                return jsonify({"message": "days must be 7, 30, 90, or all"}), 400
        except ValueError:
            return jsonify({"message": "days must be 7, 30, 90, or all"}), 400

    query = db.session.query(ResumeAnalysis, Resume).join(
        Resume, Resume.id == ResumeAnalysis.resume_id
    )
    now = datetime.now(timezone.utc)
    if days is not None:
        cutoff = now - timedelta(days=days)
        # SQLite commonly stores naive datetimes; compare with a naive cutoff when needed.
        try:
            query = query.filter(ResumeAnalysis.analyzed_at >= cutoff.replace(tzinfo=None))
        except Exception:
            query = query.filter(ResumeAnalysis.analyzed_at >= cutoff)

    records = query.order_by(desc(ResumeAnalysis.analyzed_at)).all()
    analyses = [pair[0] for pair in records]
    total = len(analyses)

    ats_values = [_as_number(a.ats_score) for a in analyses]
    skill_values = [_as_number(a.skills_score) for a in analyses]
    experience_values = [_as_number(a.experience_score) for a in analyses]
    education_values = [_as_number(a.education_score) for a in analyses]
    keyword_values = [_as_number(a.keyword_score) for a in analyses]
    times = [_as_number(a.processing_time) for a in analyses if a.processing_time is not None]

    skill_counts = Counter()
    bucket_counts = Counter({"0–49": 0, "50–59": 0, "60–69": 0, "70–79": 0, "80–89": 0, "90–100": 0})
    grouped = defaultdict(lambda: {"uploads": 0, "completed": 0, "ats_values": [], "skill_values": []})
    for analysis in analyses:
        stamp = analysis.analyzed_at
        if stamp is None:
            continue
        if stamp.tzinfo is not None:
            stamp = stamp.astimezone(timezone.utc).replace(tzinfo=None)
        label = _date_label(stamp, days or 3650)
        grouped[label]["uploads"] += 1
        grouped[label]["completed"] += 1
        grouped[label]["ats_values"].append(_as_number(analysis.ats_score))
        grouped[label]["skill_values"].append(_as_number(analysis.skills_score))
        score = _as_number(analysis.ats_score)
        if score < 50: bucket_counts["0–49"] += 1
        elif score < 60: bucket_counts["50–59"] += 1
        elif score < 70: bucket_counts["60–69"] += 1
        elif score < 80: bucket_counts["70–79"] += 1
        elif score < 90: bucket_counts["80–89"] += 1
        else: bucket_counts["90–100"] += 1
        for skill in _skill_list(analysis.detected_skills):
            normalized = skill.strip()
            if normalized:
                skill_counts[normalized] += 1

    # Sort bucket keys chronologically by the first matching analysis timestamp.
    labels = sorted(grouped, key=lambda label: min(
        (a.analyzed_at.replace(tzinfo=None) if a.analyzed_at and a.analyzed_at.tzinfo else a.analyzed_at)
        for a in analyses if a.analyzed_at and _date_label(a.analyzed_at.replace(tzinfo=None) if a.analyzed_at.tzinfo else a.analyzed_at, days or 3650) == label
    )) if grouped else []
    upload_trend = [{"label": label, "uploads": grouped[label]["uploads"], "completed": grouped[label]["completed"]} for label in labels]
    score_trend = [{
        "label": label,
        "ats": round(sum(grouped[label]["ats_values"]) / len(grouped[label]["ats_values"])) if grouped[label]["ats_values"] else 0,
        "skills": round(sum(grouped[label]["skill_values"]) / len(grouped[label]["skill_values"])) if grouped[label]["skill_values"] else 0,
    } for label in labels]

    recent = []
    for analysis, resume in records[:10]:
        stamp = analysis.analyzed_at
        recent.append({
            "id": f"RA-{analysis.id}",
            "date": stamp.isoformat(sep=" ", timespec="minutes") if stamp else "—",
            "ats_score": round(_as_number(analysis.ats_score)),
            "skills_score": round(_as_number(analysis.skills_score)),
            "processing_time": round(_as_number(analysis.processing_time), 2),
            "filename": getattr(resume, "original_filename", None) or getattr(resume, "stored_filename", None) or "Resume",
        })

    dimensions = [
        {"label": "Skills", "score": round(sum(skill_values) / len(skill_values)) if skill_values else 0},
        {"label": "Experience", "score": round(sum(experience_values) / len(experience_values)) if experience_values else 0},
        {"label": "Education", "score": round(sum(education_values) / len(education_values)) if education_values else 0},
        {"label": "Keywords", "score": round(sum(keyword_values) / len(keyword_values)) if keyword_values else 0},
    ]
    average = lambda values: round(sum(values) / len(values), 1) if values else 0
    today = datetime.now().date()
    today_count = sum(1 for a in analyses if a.analyzed_at and a.analyzed_at.date() == today)

    return jsonify({"data": {
        "total_analyses": total,
        "total_resumes": total,
        "analyzed_candidates": len({getattr(r, "candidate_email", None) or r.id for _, r in records}),
        "average_score": average(ats_values),
        "average_ats_score": average(ats_values),
        "average_skills_score": average(skill_values),
        "analyses_today": today_count,
        "average_processing_time": average(times),
        "active_queue": 0,
        "upload_trend": upload_trend,
        "score_trend": score_trend,
        "score_distribution": [{"range": key, "count": bucket_counts[key]} for key in bucket_counts],
        "top_skills": [{"skill": name, "count": count} for name, count in skill_counts.most_common(8)],
        "score_dimensions": dimensions,
        "role_readiness": [],
        "recent_activity": recent,
    }})
