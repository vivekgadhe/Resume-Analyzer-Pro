from datetime import datetime

from extensions import db


class EmailOTP(db.Model):
    __tablename__ = "email_otps"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    otp_hash = db.Column(db.String(255), nullable=False)

    purpose = db.Column(
        db.String(30),
        nullable=False,
        default="email_verification",
        index=True,
    )

    expires_at = db.Column(db.DateTime, nullable=False)

    attempts = db.Column(db.Integer, nullable=False, default=0)

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    user = db.relationship(
        "User",
        backref=db.backref("email_otps", lazy=True),
    )

    def __repr__(self):
        return f"<EmailOTP user_id={self.user_id} purpose={self.purpose}>"