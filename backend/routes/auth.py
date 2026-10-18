from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
)
from extensions import db
from models.user import User
from services.auth_service import AuthService
from services.email_service import EmailService
from services.otp_service import OTPService
from datetime import timedelta
import secrets

from werkzeug.security import generate_password_hash

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# ============================================================
# SEND REGISTRATION OTP
# ============================================================


@auth_bp.post("/send-registration-otp")
def send_registration_otp():
    """Create or reuse an unverified account and send an email OTP.

    The password is intentionally collected only after the email is verified.
    """
    data = request.get_json(silent=True) or {}

    full_name = data.get("full_name", "").strip()
    email = data.get("email", "").strip().lower()

    if not full_name:
        return jsonify({"status": "error", "message": "Full name is required."}), 400

    if not email:
        return jsonify({"status": "error", "message": "Email is required."}), 400

    existing_user = User.query.filter_by(email=email).first()
    is_new_user = existing_user is None

    if existing_user and existing_user.is_verified:
        return (
            jsonify({
                "status": "error",
                "message": "Email is already registered. Please sign in.",
            }),
            409,
        )

    if is_new_user:
        # This temporary password is replaced when registration is completed.
        temporary_password = secrets.token_urlsafe(32)
        user = User(
            full_name=full_name,
            email=email,
            password_hash=generate_password_hash(temporary_password),
            is_verified=False,
        )
        db.session.add(user)
        db.session.commit()
    else:
        user = existing_user
        user.full_name = full_name
        db.session.commit()

    otp = OTPService.create_otp(user.id, OTPService.EMAIL_VERIFICATION)
    email_sent, email_error = EmailService.send_otp_email(user.email, otp)

    if not email_sent:
        if is_new_user:
            db.session.delete(user)
            db.session.commit()
        return (
            jsonify({
                "status": "error",
                "message": email_error or "Unable to send verification email.",
            }),
            500,
        )

    return (
        jsonify({
            "status": "success",
            "message": f"OTP sent successfully to {user.email}.",
            "requires_verification": True,
            "user_id": user.id,
            "email": user.email,
        }),
        200,
    )


# ============================================================
# VERIFY EMAIL OTP
# ============================================================


@auth_bp.post("/verify-otp")
def verify_otp():
    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")
    otp = str(data.get("otp", "")).strip()

    if not user_id:
        return jsonify({"status": "error", "message": "User ID is required."}), 400

    if not otp:
        return jsonify({"status": "error", "message": "OTP is required."}), 400

    if not otp.isdigit() or len(otp) != 6:
        return (
            jsonify({"status": "error", "message": "OTP must be a 6-digit number."}),
            400,
        )

    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        return jsonify({"status": "error", "message": "Invalid user ID."}), 400

    user = db.session.get(User, user_id)

    if user is None:
        return jsonify({"status": "error", "message": "User not found."}), 404

    # A verified account should sign in instead of completing registration again.
    if user.is_verified:
        return (
            jsonify({
                "status": "error",
                "message": "Email is already verified. Please sign in.",
            }),
            409,
        )

    verified, message = OTPService.verify_otp(
        user_id, otp, OTPService.EMAIL_VERIFICATION
    )

    if not verified:
        return jsonify({"status": "error", "message": message}), 400

    # Do not activate the account yet. The user must set a password first.
    registration_token = create_access_token(
        identity=str(user.id),
        additional_claims={"token_type": "registration_completion"},
        expires_delta=timedelta(minutes=10),
    )

    return (
        jsonify({
            "status": "success",
            "message": "Email verified successfully. Please create your password.",
            "registration_token": registration_token,
        }),
        200,
    )


# ============================================================
# COMPLETE REGISTRATION
# ============================================================


@auth_bp.post("/complete-registration")
@jwt_required()
def complete_registration():
    claims = get_jwt()

    if claims.get("token_type") != "registration_completion":
        return (
            jsonify(
                {"status": "error", "message": "Invalid or expired registration token."}
            ),
            401,
        )

    data = request.get_json(silent=True) or {}
    password = data.get("password", "")

    if not password:
        return jsonify({"status": "error", "message": "Password is required."}), 400

    # Strong password validation.
    if len(password) < 8:
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Password must be at least 8 characters.",
                }
            ),
            400,
        )

    if not any(c.isupper() for c in password):
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Password must contain an uppercase letter.",
                }
            ),
            400,
        )

    if not any(c.islower() for c in password):
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Password must contain a lowercase letter.",
                }
            ),
            400,
        )

    if not any(c.isdigit() for c in password):
        return (
            jsonify({"status": "error", "message": "Password must contain a number."}),
            400,
        )

    if not any(not c.isalnum() for c in password):
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Password must contain a special symbol.",
                }
            ),
            400,
        )

    try:
        user_id = int(get_jwt_identity())
    except (TypeError, ValueError):
        return (
            jsonify({"status": "error", "message": "Invalid registration token."}),
            401,
        )

    user = db.session.get(User, user_id)

    if user is None:
        return (
            jsonify({"status": "error", "message": "Registration account not found."}),
            404,
        )

    if user.is_verified:
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "This account has already been activated.",
                }
            ),
            409,
        )

    user.password_hash = generate_password_hash(password)
    user.is_verified = True

    db.session.commit()

    return (
        jsonify(
            {
                "status": "success",
                "message": "Registration completed successfully. You can now sign in.",
            }
        ),
        201,
    )


# ============================================================
# RESEND EMAIL VERIFICATION OTP
# ============================================================


@auth_bp.post("/resend-otp")
def resend_otp():
    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"status": "error", "message": "User ID is required."}), 400

    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        return jsonify({"status": "error", "message": "Invalid user ID."}), 400

    user = User.query.get(user_id)

    if user is None:
        return jsonify({"status": "error", "message": "User not found."}), 404

    if user.is_verified:
        return (
            jsonify({"status": "error", "message": "Email is already verified."}),
            400,
        )

    # Generate a fresh email verification OTP
    otp = OTPService.create_otp(user.id, OTPService.EMAIL_VERIFICATION)

    # Send the new OTP
    email_sent, email_error = EmailService.send_otp_email(user.email, otp)

    if not email_sent:
        return jsonify({"status": "error", "message": email_error}), 500

    return (
        jsonify(
            {
                "status": "success",
                "message": "A new OTP has been sent to your email address.",
            }
        ),
        200,
    )


# ============================================================
# LOGIN
# ============================================================


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return (
            jsonify({"status": "error", "message": "Email and password are required."}),
            400,
        )

    user = AuthService.authenticate_user(email, password)

    if user is None:
        return (
            jsonify({"status": "error", "message": "Invalid email or password."}),
            401,
        )

    # Require email verification
    if not user.is_verified:
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Please verify your email before signing in.",
                    "requires_verification": True,
                    "user_id": user.id,
                    "email": user.email,
                }
            ),
            403,
        )

    access_token = create_access_token(identity=str(user.id))

    return (
        jsonify(
            {
                "status": "success",
                "message": "Login successful.",
                "access_token": access_token,
                "user": {
                    "id": user.id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "role": user.role,
                },
            }
        ),
        200,
    )


# ============================================================
# CURRENT USER
# ============================================================


@auth_bp.get("/me")
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()

    user = User.query.get(int(user_id))

    if user is None:
        return jsonify({"status": "error", "message": "User not found."}), 404

    return (
        jsonify(
            {
                "status": "success",
                "user": {
                    "id": user.id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "role": user.role,
                    "is_verified": user.is_verified,
                },
            }
        ),
        200,
    )

    # FORGOT PASSWORD


@auth_bp.post("/forgot-password")
def forgot_password():
    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({"status": "error", "message": "Email is required."}), 400

    user = User.query.filter_by(email=email).first()

    # Do not reveal whether the email exists.
    if user is None:
        return (
            jsonify(
                {
                    "status": "success",
                    "message": "If an account exists with this email, a password reset OTP has been sent.",
                }
            ),
            200,
        )

    otp = OTPService.create_otp(user.id, OTPService.PASSWORD_RESET)

    email_sent, email_error = EmailService.send_password_reset_otp_email(
        user.email, otp
    )

    if not email_sent:
        return jsonify({"status": "error", "message": email_error}), 500

    return (
        jsonify(
            {
                "status": "success",
                "message": "If an account exists with this email, a password reset OTP has been sent.",
            }
        ),
        200,
    )


# VERIFY PASSWORD RESET OTP
@auth_bp.post("/verify-reset-otp")
def verify_reset_otp():
    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    otp = str(data.get("otp", "")).strip()

    if not email:
        return jsonify({"status": "error", "message": "Email is required."}), 400

    if not otp:
        return jsonify({"status": "error", "message": "OTP is required."}), 400

    if not otp.isdigit() or len(otp) != 6:
        return (
            jsonify({"status": "error", "message": "OTP must be a 6-digit number."}),
            400,
        )

    user = User.query.filter_by(email=email).first()

    if user is None:
        return jsonify({"status": "error", "message": "Invalid OTP."}), 400

    verified, message = OTPService.verify_otp(user.id, otp, OTPService.PASSWORD_RESET)

    if not verified:
        return jsonify({"status": "error", "message": message}), 400

    reset_token = create_access_token(
        identity=str(user.id),
        additional_claims={"token_type": "password_reset"},
        expires_delta=timedelta(minutes=10),
    )

    return (
        jsonify(
            {
                "status": "success",
                "message": "OTP verified successfully. You can now reset your password.",
                "reset_token": reset_token,
            }
        ),
        200,
    )


# RESET PASSWORD
@auth_bp.post("/reset-password")
@jwt_required()
def reset_password():
    claims = get_jwt()

    if claims.get("token_type") != "password_reset":
        return (
            jsonify({"status": "error", "message": "Invalid password reset token."}),
            401,
        )

    data = request.get_json(silent=True) or {}

    new_password = data.get("new_password", "")

    if not new_password:
        return jsonify({"status": "error", "message": "New password is required."}), 400

    if len(new_password) < 8:
        return jsonify({"status": "error", "message": "Password must be at least 8 characters."}), 400

    if not any(c.isupper() for c in new_password):
        return jsonify({"status": "error", "message": "Password must contain an uppercase letter."}), 400

    if not any(c.islower() for c in new_password):
        return jsonify({"status": "error", "message": "Password must contain a lowercase letter."}), 400

    if not any(c.isdigit() for c in new_password):
        return jsonify({"status": "error", "message": "Password must contain a number."}), 400

    if not any(not c.isalnum() for c in new_password):
        return jsonify({"status": "error", "message": "Password must contain a special symbol."}), 400

    user_id = get_jwt_identity()

    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        return jsonify({"status": "error", "message": "Invalid reset token."}), 401

    user = User.query.get(user_id)

    if user is None:
        return jsonify({"status": "error", "message": "User not found."}), 404

    user.password_hash = generate_password_hash(new_password)

    db.session.commit()

    return (
        jsonify(
            {
                "status": "success",
                "message": "Password reset successfully. You can now sign in.",
            }
        ),
        200,
    )
