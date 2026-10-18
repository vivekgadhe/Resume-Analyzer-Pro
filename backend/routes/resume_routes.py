"""Resume endpoints with job-description-driven analysis and guest access."""
import os
import tempfile

from flask import Blueprint, current_app, jsonify, request, send_file
from pathlib import Path
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from models.user import User
from models.resume import Resume
from services.resume_service import ResumeService
from services.parser_service import ParserService

resume_bp = Blueprint("resumes", __name__, url_prefix="/api/resumes")
MAX_JOB_DESCRIPTION_BYTES = 10 * 1024 * 1024
ALLOWED_JOB_DESCRIPTION_EXTENSIONS = {".pdf", ".docx", ".txt"}


def get_optional_user_id():
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        if identity is None:
            return None
        user = User.query.get(int(identity))
        return user.id if user and user.is_verified else None
    except Exception:
        return None


def _read_job_description_file(upload):
    """Extract text from PDF/DOCX/TXT without permanently storing the JD."""
    if upload is None or not upload.filename:
        return "", None

    filename = os.path.basename(upload.filename)
    extension = os.path.splitext(filename)[1].lower()
    if extension not in ALLOWED_JOB_DESCRIPTION_EXTENSIONS:
        raise ValueError("Job description file must be PDF, DOCX, or TXT.")

    raw = upload.read()
    if not raw:
        raise ValueError("The job description file is empty.")
    if len(raw) > MAX_JOB_DESCRIPTION_BYTES:
        raise ValueError("The job description file exceeds the 10 MB limit.")

    if extension == ".txt":
        try:
            return raw.decode("utf-8-sig"), filename
        except UnicodeDecodeError:
            return raw.decode("latin-1"), filename

    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=extension, delete=False) as temp:
            temp.write(raw)
            temp_path = temp.name
        return ParserService.extract_resume_text(temp_path) or "", filename
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


def _get(source, *names):
    if source is None:
        return None
    for name in names:
        value = source.get(name) if isinstance(source, dict) else getattr(source, name, None)
        if value is not None and value != "":
            return value
    return None


def _as_list(value):
    return value if isinstance(value, list) else []


def serialize_analysis(analysis):
    if analysis is None:
        return None

    ats_score = _get(analysis, "ats_score", "overall_rating", "overall_score", "score")
    suggestions = _get(analysis, "suggestions", "recommendations")
    analyzed_at = _get(analysis, "analyzed_at")
    if hasattr(analyzed_at, "isoformat"):
        analyzed_at = analyzed_at.isoformat()

    return {
        "id": _get(analysis, "id"),
        "ats_score": ats_score,
        "overall_rating": ats_score,
        "skills_score": _get(analysis, "skills_score", "skills_match"),
        "detected_skills": _as_list(_get(analysis, "detected_skills", "skills")),
        "experience_score": _get(analysis, "experience_score"),
        "education_score": _get(analysis, "education_score"),
        "keyword_score": _get(analysis, "keyword_score"),
        "strengths": _get(analysis, "strengths") or "",
        "weaknesses": _get(analysis, "weaknesses") or "",
        "suggestions": suggestions or "",
        "recommendations": suggestions or "",
        "processing_time": _get(analysis, "processing_time"),
        "analyzed_at": analyzed_at,
        "job_role": _get(analysis, "job_role", "selected_job_role", "target_job_role"),
        "selected_job_role": _get(analysis, "selected_job_role"),
        "target_job_role": _get(analysis, "target_job_role"),
        "match_percentage": _get(
            analysis, "match_percentage", "job_match_percentage",
            "job_match", "role_match_percentage"
        ),
        "job_match_percentage": _get(
            analysis, "job_match_percentage", "match_percentage",
            "job_match", "role_match_percentage"
        ),
        "matched_skills": _as_list(_get(analysis, "matched_skills")),
        "missing_skills": _as_list(_get(analysis, "missing_skills")),
        "target_skills": _as_list(_get(analysis, "target_skills")),
        "matched_keywords": _as_list(_get(analysis, "matched_keywords")),
        "missing_keywords": _as_list(_get(analysis, "missing_keywords")),
        "analysis_basis": _get(analysis, "analysis_basis"),
        "match_method": _get(analysis, "match_method"),
    }


def serialize_resume(resume, analysis=None):
    serialized_analysis = serialize_analysis(analysis)
    role = _get(serialized_analysis, "job_role", "selected_job_role", "target_job_role")
    match = _get(serialized_analysis, "match_percentage", "job_match_percentage")

    return {
        "id": resume.id,
        "filename": resume.original_filename,
        "original_filename": resume.original_filename,
        "candidate_name": resume.candidate_name,
        "candidate_email": resume.candidate_email,
        "candidate_phone": resume.candidate_phone,
        "candidate_location": resume.candidate_location,
        "file_size": resume.file_size,
        "uploaded_at": resume.uploaded_at.isoformat() if resume.uploaded_at else None,
        "job_role": role,
        "selected_job_role": _get(serialized_analysis, "selected_job_role"),
        "target_job_role": _get(serialized_analysis, "target_job_role"),
        "match_percentage": match,
        "analysis": serialized_analysis,
    }


@resume_bp.post("/analyze")
def analyze_resume():
    user_id = get_optional_user_id()
    if "resume" not in request.files:
        return jsonify({
            "status": "error",
            "message": "No resume file was provided. Use the 'resume' field.",
        }), 400

    uploaded_file = request.files["resume"]
    job_role = (request.form.get("job_role") or "").strip()
    job_description = (request.form.get("job_description") or "").strip()
    jd_upload = request.files.get("job_description_file")

    if len(job_role) > 100:
        return jsonify({"status": "error", "message": "Job role must be 100 characters or fewer."}), 400
    if len(job_description) > 100_000:
        return jsonify({"status": "error", "message": "Pasted job description is too long (maximum 100,000 characters)."}), 400

    try:
        file_description, jd_filename = _read_job_description_file(jd_upload)
        if job_description and file_description.strip():
            return jsonify({
                "status": "error",
                "message": "Provide the job description either as pasted text or as a file, not both.",
            }), 400

        final_description = job_description or file_description
        if final_description.strip() and len(final_description.strip()) < 30:
            return jsonify({
                "status": "error",
                "message": "The job description is too short. Please provide the full role requirements or leave it empty to analyze by job role.",
            }), 400
        if not final_description.strip() and not job_role:
            return jsonify({
                "status": "error",
                "message": "Provide a job description or select a target job role.",
            }), 400

        result = ResumeService.analyze_uploaded_resume(
            uploaded_file,
            user_id=user_id,
            job_role=job_role or None,
            job_description=final_description or None,
        )
        analysis_result = result["analysis_result"]
        analysis = result["analysis"]
        resume = result["resume"]

        analysis_payload = {
            **(serialize_analysis(analysis) or {}),
            "detected_sections": analysis_result.get("detected_sections", []),
            "job_role": analysis_result.get("job_role") or job_role or None,
            "selected_job_role": job_role or None,
            "job_description_source": (
                "file" if jd_filename else
                "text" if final_description.strip() else
                "job_role_fallback"
            ),
            "job_description_filename": jd_filename,
            "job_description_word_count": analysis_result.get("job_description_word_count", 0),
            "analysis_basis": analysis_result.get("analysis_basis", "job_description"),
            "match_percentage": analysis_result.get("match_percentage"),
            "matched_skills": analysis_result.get("matched_skills", []),
            "missing_skills": analysis_result.get("missing_skills", []),
            "target_skills": analysis_result.get("target_skills", []),
            "matched_keywords": analysis_result.get("matched_keywords", []),
            "missing_keywords": analysis_result.get("missing_keywords", []),
            "word_count": analysis_result.get("word_count", 0),
            "quantified_results_count": analysis_result.get("quantified_results_count", 0),
            "experience_match": analysis_result.get("experience_match"),
            "education_match": analysis_result.get("education_match"),
            "match_method": analysis_result.get("match_method"),
        }

        resume_payload = serialize_resume(resume, analysis)
        resume_payload["job_role"] = analysis_payload["job_role"]
        resume_payload["selected_job_role"] = analysis_payload["selected_job_role"]
        resume_payload["match_percentage"] = analysis_payload["match_percentage"]
        resume_payload["analysis"] = analysis_payload

        return jsonify({
            "status": "success",
            "message": "Resume compared with the provided job description successfully.",
            "resume": resume_payload,
            "analysis": analysis_payload,
            "job_role": analysis_payload["job_role"],
            "job_description_filename": jd_filename,
            "analysis_basis": analysis_payload["analysis_basis"],
            "processing_time": result.get("processing_time"),
        }), 201

    except ValueError as error:
        return jsonify({"status": "error", "message": str(error)}), 400
    except Exception:
        current_app.logger.exception("Resume analysis failed.")
        return jsonify({"status": "error", "message": "Resume analysis failed. Please try again."}), 500


@resume_bp.get("")
def list_resumes():
    """Return saved resume analyses for the public, no-sign-in workspace."""
    resumes = Resume.query.order_by(Resume.uploaded_at.desc()).all()
    items = []

    for resume in resumes:
        analysis = resume.analysis
        if isinstance(analysis, list):
            analysis = analysis[-1] if analysis else None
        items.append(serialize_resume(resume, analysis))

    return jsonify({"status": "success", "resumes": items, "count": len(items)}), 200


@resume_bp.get("/<int:resume_id>")
def get_resume_analysis(resume_id):
    """Return one saved analysis without requiring sign-in."""
    resume = Resume.query.get(resume_id)
    if resume is None:
        return jsonify({"status": "error", "message": "Resume not found."}), 404

    analysis = resume.analysis
    if isinstance(analysis, list):
        analysis = analysis[-1] if analysis else None
    if analysis is None:
        return jsonify({"status": "error", "message": "Analysis not found for this resume."}), 404

    serialized_analysis = serialize_analysis(analysis)
    resume_payload = serialize_resume(resume, analysis)
    resume_payload["analysis"] = serialized_analysis

    return jsonify({
        "status": "success",
        "resume": resume_payload,
        "analysis": serialized_analysis,
    }), 200


@resume_bp.get("/<int:resume_id>/file")
def get_resume_file(resume_id):
    """Serve the original stored resume inline or as a download."""
    resume = Resume.query.get(resume_id)
    if resume is None:
        return jsonify({"status": "error", "message": "Resume not found."}), 404

    configured_folder = current_app.config.get("RESUME_UPLOAD_FOLDER")
    upload_root = Path(configured_folder) if configured_folder else (
        Path(current_app.root_path) / "uploads" / "resumes"
    )
    upload_root = upload_root.resolve()

    try:
        file_path = Path(resume.file_path).resolve()
        # Only serve files stored inside the configured resume-upload folder.
        file_path.relative_to(upload_root)
    except (OSError, ValueError):
        current_app.logger.warning(
            "Resume %s has a path outside the configured upload directory.",
            resume_id,
        )
        return jsonify({
            "status": "error",
            "message": "The stored resume path is invalid.",
        }), 403

    if not file_path.is_file():
        return jsonify({
            "status": "error",
            "message": "The original resume file is unavailable.",
        }), 404

    extension = Path(resume.original_filename).suffix.lower()
    mimetype = {
        ".pdf": "application/pdf",
        ".docx": (
            "application/vnd.openxmlformats-officedocument."
            "wordprocessingml.document"
        ),
    }.get(extension, "application/octet-stream")

    download = request.args.get("download", "false").lower() == "true"

    return send_file(
        file_path,
        mimetype=mimetype,
        as_attachment=download,
        download_name=Path(resume.original_filename).name,
        conditional=True,
    )

