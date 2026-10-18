"""
Resume text extraction service for Resume Analyzer Pro.

Handles text extraction from supported resume files.
"""

from pathlib import Path

import docx
import PyPDF2


class ParserService:

    @staticmethod
    def extract_resume_text(
        file_path: str,
    ) -> str:

        extension = (
            Path(file_path)
            .suffix
            .lower()
        )

        if extension == ".pdf":
            return ParserService.extract_pdf_text(file_path)

        if extension == ".docx":
            return ParserService.extract_docx_text(file_path)

        raise ValueError(
            "Unsupported file type."
        )

    @staticmethod
    def extract_pdf_text(
        file_path: str,
    ) -> str:

        text = ""

        try:
            with open(
                file_path,
                "rb"
            ) as pdf_file:

                reader = PyPDF2.PdfReader(pdf_file)

                for page in reader.pages:

                    page_text = page.extract_text()

                    if page_text:
                        text += page_text + "\n"

        except Exception as error:

            raise RuntimeError(
                f"PDF extraction failed: {error}"
            )

        return text.strip()

    @staticmethod
    def extract_docx_text(
        file_path: str,
    ) -> str:

        try:
            document = docx.Document(file_path)

            paragraphs = [
                paragraph.text
                for paragraph in document.paragraphs
                if paragraph.text.strip()
            ]

            return "\n".join(paragraphs)

        except Exception as error:

            raise RuntimeError(
                f"DOCX extraction failed: {error}"
            )