"""Database model for resume analysis results."""
from datetime import datetime

from extensions import db


class ResumeAnalysis(db.Model):
    __tablename__ = "resume_analysis"

    id = db.Column(db.Integer, primary_key=True)

    resume_id = db.Column(
        db.Integer,
        db.ForeignKey("resumes.id"),
        nullable=False,
        index=True,
    )

    ats_score = db.Column(db.Float, nullable=False)
    skills_score = db.Column(db.Float, nullable=False)
    detected_skills = db.Column(db.JSON, nullable=True)
    experience_score = db.Column(db.Float, nullable=False)
    education_score = db.Column(db.Float, nullable=False)
    keyword_score = db.Column(db.Float, nullable=False)

    # Persist job-specific data so it remains available in the Candidates page.
    job_role = db.Column(db.String(100), nullable=True, index=True)
    match_percentage = db.Column(db.Float, nullable=True)
    matched_skills = db.Column(db.JSON, nullable=True)
    missing_skills = db.Column(db.JSON, nullable=True)
    target_skills = db.Column(db.JSON, nullable=True)
    matched_keywords = db.Column(db.JSON, nullable=True)
    missing_keywords = db.Column(db.JSON, nullable=True)
    analysis_basis = db.Column(db.String(50), nullable=True)
    match_method = db.Column(db.String(100), nullable=True)

    strengths = db.Column(db.Text, nullable=True)
    weaknesses = db.Column(db.Text, nullable=True)
    suggestions = db.Column(db.Text, nullable=True)

    processing_time = db.Column(db.Float, nullable=False, default=0.0)
    analyzed_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    resume = db.relationship(
        "Resume",
        backref=db.backref("analysis", lazy=True, order_by="ResumeAnalysis.analyzed_at"),
    )

    def __repr__(self):
        return f"<ResumeAnalysis {self.id}>"
