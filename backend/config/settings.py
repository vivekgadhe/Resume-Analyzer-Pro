import os
from dotenv import load_dotenv

load_dotenv()

# Application
APP_NAME = "Resume Analyzer Pro"
APP_VERSION = "1.0.0"

# Security
SECRET_KEY = os.getenv("SECRET_KEY")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

# Database
DATABASE_URL = os.getenv("DATABASE_URL")
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Frontend
FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)

# Email
MAIL_SERVER = os.getenv("MAIL_SERVER")
MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "true").lower() == "true"
MAIL_FROM = os.getenv("MAIL_FROM", MAIL_USERNAME)

# Validate required configuration
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing from the environment.")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is missing from the environment.")

if not JWT_SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY is missing from the environment.")