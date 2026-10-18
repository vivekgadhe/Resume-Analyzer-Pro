from flask import Flask, jsonify
from sqlalchemy import text

from extensions import db, cors, jwt, mail, migrate

from routes.auth import auth_bp
from routes.resume_routes import resume_bp
from routes.analytics_routes import analytics_bp

import models

from config.settings import (
    APP_NAME,
    APP_VERSION,
    DATABASE_URL,
    FRONTEND_URL,
    SECRET_KEY,
    SQLALCHEMY_TRACK_MODIFICATIONS,
    JWT_SECRET_KEY,
    MAIL_SERVER,
    MAIL_PORT,
    MAIL_USERNAME,
    MAIL_PASSWORD,
    MAIL_USE_TLS,
    MAIL_FROM,
)


def create_app():
    app = Flask(__name__)

    # ---------------------------------------------
    # Application Configuration
    # ---------------------------------------------

    app.config["SECRET_KEY"] = SECRET_KEY
    app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY
    app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = (
        SQLALCHEMY_TRACK_MODIFICATIONS
    )

    app.config["MAIL_SERVER"] = MAIL_SERVER
    app.config["MAIL_PORT"] = MAIL_PORT
    app.config["MAIL_USERNAME"] = MAIL_USERNAME
    app.config["MAIL_PASSWORD"] = MAIL_PASSWORD
    app.config["MAIL_USE_TLS"] = MAIL_USE_TLS
    app.config["MAIL_DEFAULT_SENDER"] = MAIL_FROM

    # ---------------------------------------------
    # Initialize Extensions
    # ---------------------------------------------

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)

    # ---------------------------------------------
    # Configure CORS
    # ---------------------------------------------

    allowed_origins = [
        "https://resume-analyzer-kiacpuxbz-vgti.vercel.app",
        "https://resume-analyzer-pro-five.vercel.app",
        "http://localhost:5173",
    ]

    # Include the frontend URL configured on Render.
    if FRONTEND_URL:
        configured_origin = FRONTEND_URL.rstrip("/")

        if configured_origin not in allowed_origins:
            allowed_origins.append(configured_origin)

    cors.init_app(
        app,
        resources={
            r"/api/*": {
                "origins": allowed_origins,
                "methods": [
                    "GET",
                    "POST",
                    "PUT",
                    "PATCH",
                    "DELETE",
                    "OPTIONS",
                ],
                "allow_headers": [
                    "Content-Type",
                    "Authorization",
                ],
            }
        },
    )

    # ---------------------------------------------
    # Register Blueprints
    # ---------------------------------------------

    app.register_blueprint(auth_bp)
    app.register_blueprint(resume_bp)
    app.register_blueprint(analytics_bp)

    # ---------------------------------------------
    # Create Missing Database Tables
    # ---------------------------------------------

    with app.app_context():
        db.create_all()

    # ---------------------------------------------
    # Health Check
    # ---------------------------------------------

    @app.get("/api/health")
    def health_check():
        return jsonify({
            "status": "success",
            "message": f"{APP_NAME} API is running",
            "version": APP_VERSION,
        }), 200

    # ---------------------------------------------
    # Database Connection Test
    # ---------------------------------------------

    @app.get("/api/db-test")
    def database_test():
        try:
            result = db.session.execute(
                text("SELECT 1")
            ).scalar()

            return jsonify({
                "status": "success",
                "message": "PostgreSQL connection successful",
                "result": result,
            }), 200

        except Exception:
            db.session.rollback()

            app.logger.exception(
                "Database connection test failed."
            )

            return jsonify({
                "status": "error",
                "message": "PostgreSQL connection failed.",
            }), 500

    return app


# ---------------------------------------------
# Create Application
# ---------------------------------------------

app = create_app()


# ---------------------------------------------
# Run Development Server
# ---------------------------------------------

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True,
    )