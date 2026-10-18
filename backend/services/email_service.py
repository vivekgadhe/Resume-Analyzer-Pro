from flask_mail import Message

from extensions import mail


class EmailService:

    @staticmethod
    def send_otp_email(recipient_email, otp):
        subject = "Verify Your Email - Resume Analyzer Pro"

        body = f"""
Hello,

Thank you for registering with Resume Analyzer Pro.

Your email verification OTP is:

{otp}

This OTP is valid for 10 minutes.

For security reasons, please do not share this OTP with anyone.

If you did not create an account, you can safely ignore this email.

Regards,
Resume Analyzer Pro
"""

        try:
            message = Message(
                subject=subject,
                recipients=[recipient_email],
                body=body,
            )

            mail.send(message)
            return True, None

        except Exception as error:
            print(f"Email sending failed: {error}")
            return False, "Unable to send verification email."

    @staticmethod
    def send_password_reset_otp_email(recipient_email, otp):
        subject = "Password Reset OTP - Resume Analyzer Pro"

        body = f"""
Hello,

We received a request to reset your Resume Analyzer Pro password.

Your password reset OTP is:

{otp}

This OTP is valid for 10 minutes.

For security reasons, please do not share this OTP with anyone.

If you did not request a password reset, you can safely ignore this email.

Regards,
Resume Analyzer Pro
"""

        try:
            message = Message(
                subject=subject,
                recipients=[recipient_email],
                body=body,
            )

            mail.send(message)
            return True, None

        except Exception as error:
            print(f"Password reset email sending failed: {error}")
            return False, "Unable to send password reset email."