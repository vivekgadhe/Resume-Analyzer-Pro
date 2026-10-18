"""Coordinates resume file handling, parsing, analysis, and database persistence."""
import re
import time

from extensions import db
from models.resume import Resume
from models.resume_analysis import ResumeAnalysis
from services.analysis_service import AnalysisService
from services.file_service import FileService
from services.parser_service import ParserService


class ResumeService:
    @staticmethod
    def _extract_candidate_details(resume_text):
        email_match = re.search(
            r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b",
            resume_text,
            re.I,
        )
        phone_match = re.search(
            r"(?<!\w)\+?\d[\d\s().-]{7,}\d(?!\w)",
            resume_text,
        )
        lines = [line.strip() for line in resume_text.splitlines() if line.strip()]
        candidate_name = None

        if lines:
            first_line = lines[0]
            if (
                len(first_line) <= 80
                and "@" not in first_line
                and not re.search(r"\d", first_line)
                and len(first_line.split()) <= 5
                and not re.search(
                    r"\b(resume|curriculum vitae|cv|profile|summary|objective)\b",
                    first_line,
                    re.I,
                )
            ):
                candidate_name = first_line

        return {
            "candidate_name": candidate_name,
            "candidate_email": email_match.group(0) if email_match else None,
            "candidate_phone": (
                re.sub(r"\s+", " ", phone_match.group(0)).strip()
                if phone_match else None
            ),
            "candidate_location": None,
        }

    @staticmethod
    def analyze_uploaded_resume(file, user_id=None, job_role=None, job_description=None):
        started_at = time.perf_counter()
        saved_file_path = None
        transaction_started = False

        try:
            selected_role = (job_role or "").strip() or None
            selected_description = (job_description or "").strip() or None

            if not selected_description and not selected_role:
                raise ValueError("Provide a job description or select a target job role.")

            file_info = FileService.validate_file(file)
            saved_file = FileService.save_file(file, file_info["extension"])
            saved_file_path = saved_file["file_path"]

            resume_text = ParserService.extract_resume_text(saved_file_path)
            if not resume_text.strip():
                raise ValueError(
                    "No readable text was found. Upload a text-based PDF or DOCX resume."
                )

            analysis_result = AnalysisService.analyze_resume(
                resume_text,
                job_role=selected_role,
                job_description=selected_description,
            )
            candidate = ResumeService._extract_candidate_details(resume_text)
            processing_time = round(time.perf_counter() - started_at, 3)

            resume = Resume(
                user_id=user_id,
                candidate_name=candidate["candidate_name"],
                candidate_email=candidate["candidate_email"],
                candidate_phone=candidate["candidate_phone"],
                candidate_location=candidate["candidate_location"],
                original_filename=file_info["original_filename"],
                stored_filename=saved_file["stored_filename"],
                file_path=saved_file_path,
                file_size=file_info["file_size"],
                resume_text=resume_text,
            )

            transaction_started = True
            db.session.add(resume)
            db.session.flush()

            analysis = ResumeAnalysis(
                resume_id=resume.id,
                ats_score=analysis_result["ats_score"],
                skills_score=analysis_result["skills_score"],
                detected_skills=analysis_result.get("detected_skills", []),
                experience_score=analysis_result["experience_score"],
                education_score=analysis_result["education_score"],
                keyword_score=analysis_result["keyword_score"],
                job_role=analysis_result.get("job_role") or selected_role,
                match_percentage=analysis_result.get("match_percentage"),
                matched_skills=analysis_result.get("matched_skills", []),
                missing_skills=analysis_result.get("missing_skills", []),
                target_skills=analysis_result.get("target_skills", []),
                matched_keywords=analysis_result.get("matched_keywords", []),
                missing_keywords=analysis_result.get("missing_keywords", []),
                analysis_basis=analysis_result.get("analysis_basis"),
                match_method=analysis_result.get("match_method"),
                strengths="\n".join(analysis_result.get("strengths", [])),
                weaknesses="\n".join(analysis_result.get("weaknesses", [])),
                suggestions="\n".join(analysis_result.get("suggestions", [])),
                processing_time=processing_time,
            )

            db.session.add(analysis)
            db.session.commit()

            return {
                "resume": resume,
                "analysis": analysis,
                "analysis_result": analysis_result,
                "detected_sections": analysis_result.get("detected_sections", []),
                "processing_time": processing_time,
            }

        except Exception:
            if transaction_started:
                db.session.rollback()
            if saved_file_path:
                FileService.delete_file(saved_file_path)
            raise

    @staticmethod
    def get_user_resumes(user_id):
        return Resume.query.filter_by(user_id=user_id).order_by(
            Resume.uploaded_at.desc()
        ).all()

    @staticmethod
    def get_user_resume_analysis(resume_id, user_id):
        resume = Resume.query.filter_by(id=resume_id, user_id=user_id).first()
        if resume is None:
            return None

        analysis = ResumeAnalysis.query.filter_by(
            resume_id=resume.id
        ).order_by(ResumeAnalysis.analyzed_at.desc()).first()

        return resume, analysis
