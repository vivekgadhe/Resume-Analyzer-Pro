from werkzeug.security import check_password_hash, generate_password_hash

from extensions import db
from models.user import User
from services.password_service import PasswordService


class AuthService:

    @staticmethod
    def register_user(
        full_name: str,
        email: str,
        password: str,
    ):
        email = email.strip().lower()

        # Validate password strength
        is_valid, password_error = PasswordService.validate_password(password)

        if not is_valid:
            return None, password_error

        # Check whether the email already exists
        existing_user = User.query.filter_by(
            email=email
        ).first()

        if existing_user:
            return None, "Email is already registered."

        # Hash password
        password_hash = generate_password_hash(password)

        user = User(
            full_name=full_name.strip(),
            email=email,
            password_hash=password_hash,
        )

        db.session.add(user)
        db.session.commit()

        return user, None

    @staticmethod
    def authenticate_user(
        email: str,
        password: str,
    ):
        email = email.strip().lower()

        user = User.query.filter_by(
            email=email
        ).first()

        if user is None:
            return None

        if not check_password_hash(
            user.password_hash,
            password
        ):
            return None

        return user