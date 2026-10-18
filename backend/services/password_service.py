import re


class PasswordService:

    MIN_LENGTH = 8

    @staticmethod
    def validate_password(password):
        if len(password) < PasswordService.MIN_LENGTH:
            return False, "Password must be at least 8 characters."

        if not re.search(r"[A-Z]", password):
            return False, "Password must contain at least one uppercase letter."

        if not re.search(r"[a-z]", password):
            return False, "Password must contain at least one lowercase letter."

        if not re.search(r"\d", password):
            return False, "Password must contain at least one number."

        if not re.search(r"[^A-Za-z0-9]", password):
            return False, "Password must contain at least one special symbol."

        return True, None