import secrets
from datetime import datetime, timedelta

from werkzeug.security import check_password_hash, generate_password_hash

from extensions import db
from models.email_otp import EmailOTP


class OTPService:

    OTP_EXPIRY_MINUTES = 10
    MAX_ATTEMPTS = 5

    EMAIL_VERIFICATION = "email_verification"
    PASSWORD_RESET = "password_reset"

    @staticmethod
    def generate_otp():
        """
        Generate a secure 6-digit OTP.
        """
        return f"{secrets.randbelow(1_000_000):06d}"

    @staticmethod
    def create_otp(user_id, purpose=EMAIL_VERIFICATION):
        """
        Create a new OTP for a user and purpose.
        Previous OTPs for the same user and purpose are removed.
        """

        EmailOTP.query.filter_by(
            user_id=user_id,
            purpose=purpose
        ).delete(
            synchronize_session=False
        )

        otp = OTPService.generate_otp()

        otp_record = EmailOTP(
            user_id=user_id,
            otp_hash=generate_password_hash(otp),
            purpose=purpose,
            expires_at=(
                datetime.utcnow()
                + timedelta(minutes=OTPService.OTP_EXPIRY_MINUTES)
            ),
            attempts=0,
        )

        db.session.add(otp_record)
        db.session.commit()

        return otp

    @staticmethod
    def verify_otp(user_id, otp, purpose=EMAIL_VERIFICATION):
        """
        Verify an OTP for a user and purpose.
        """

        otp_record = (
            EmailOTP.query
            .filter_by(
                user_id=user_id,
                purpose=purpose
            )
            .order_by(EmailOTP.created_at.desc())
            .first()
        )

        if otp_record is None:
            return False, "No OTP found. Please request a new OTP."

        if datetime.utcnow() > otp_record.expires_at:
            db.session.delete(otp_record)
            db.session.commit()

            return False, "OTP has expired. Please request a new OTP."

        if otp_record.attempts >= OTPService.MAX_ATTEMPTS:
            db.session.delete(otp_record)
            db.session.commit()

            return False, "Too many incorrect attempts. Please request a new OTP."

        otp_record.attempts += 1

        if not check_password_hash(
            otp_record.otp_hash,
            otp
        ):
            db.session.commit()

            return False, "Invalid OTP."

        db.session.delete(otp_record)
        db.session.commit()

        return True, "OTP verified successfully."