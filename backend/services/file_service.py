"""
File service for Resume Analyzer Pro.

Validates and stores uploaded resume files.
"""

import os
import uuid
from pathlib import Path

from flask import current_app
from werkzeug.utils import secure_filename


class FileService:
    ALLOWED_EXTENSIONS = {".pdf", ".docx"}
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

    @staticmethod
    def validate_file(file):
        """Validate the uploaded resume file."""

        if file is None or not file.filename:
            raise ValueError("Please select a resume file.")

        original_filename = secure_filename(file.filename)

        if not original_filename:
            raise ValueError("Invalid filename.")

        extension = Path(original_filename).suffix.lower()

        if extension not in FileService.ALLOWED_EXTENSIONS:
            raise ValueError(
                "Unsupported file type. Upload a PDF or DOCX file."
            )

        # Check the actual uploaded size, not a client-provided size.
        file.stream.seek(0, os.SEEK_END)
        file_size = file.stream.tell()
        file.stream.seek(0)

        if file_size == 0:
            raise ValueError("The uploaded file is empty.")

        if file_size > FileService.MAX_FILE_SIZE:
            raise ValueError("Resume size must not exceed 10 MB.")

        return {
            "original_filename": original_filename,
            "extension": extension,
            "file_size": file_size,
        }

    @staticmethod
    def save_file(file, extension):
        """Save the file using a unique server-generated filename."""

        upload_directory = Path(
            current_app.config.get(
                "RESUME_UPLOAD_FOLDER",
                str(
                    Path(current_app.root_path)
                    / "uploads"
                    / "resumes"
                ),
            )
        )

        upload_directory.mkdir(
            parents=True,
            exist_ok=True,
        )

        stored_filename = f"{uuid.uuid4().hex}{extension}"
        file_path = upload_directory / stored_filename

        try:
            file.save(str(file_path))
        except Exception:
            # Remove a partially written file if saving fails.
            if file_path.exists():
                file_path.unlink()
            raise

        return {
            "stored_filename": stored_filename,
            "file_path": str(file_path.resolve()),
        }

    @staticmethod
    def delete_file(file_path):
        """Delete a stored file when cleanup is necessary."""

        if not file_path:
            return

        try:
            path = Path(file_path)
            upload_directory = (
                Path(
                    current_app.config.get(
                        "RESUME_UPLOAD_FOLDER",
                        str(
                            Path(current_app.root_path)
                            / "uploads"
                            / "resumes"
                        ),
                    )
                )
                .resolve()
            )

            # Only delete files inside the configured upload directory.
            if path.resolve().parent == upload_directory and path.is_file():
                path.unlink()

        except OSError:
            current_app.logger.exception(
                "Could not delete uploaded resume."
            )