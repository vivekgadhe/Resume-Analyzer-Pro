from datetime import datetime

from extensions import db


class Resume(db.Model):
    __tablename__ = "resumes"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    candidate_name = db.Column(
        db.String(255),
        nullable=True
    )

    candidate_email = db.Column(
        db.String(255),
        nullable=True
    )

    candidate_phone = db.Column(
        db.String(20),
        nullable=True
    )

    candidate_location = db.Column(
        db.String(255),
        nullable=True
    )

    original_filename = db.Column(
        db.String(255),
        nullable=False
    )

    stored_filename = db.Column(
        db.String(255),
        nullable=False
    )

    file_path = db.Column(
        db.String(500),
        nullable=False
    )

    file_size = db.Column(
        db.Integer,
        nullable=False
    )

    resume_text = db.Column(
        db.Text,
        nullable=False
    )

    uploaded_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    user = db.relationship(
        "User",
        backref=db.backref(
            "resumes",
            lazy=True
        )
    )

    def __repr__(self):
        return f"<Resume {self.original_filename}>"