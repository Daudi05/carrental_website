import os
import logging
from datetime import timedelta

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri="memory://"
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s"
)


def create_app():
    app = Flask(__name__)

    app.config.update(
        SECRET_KEY=os.getenv("SECRET_KEY", "dev-secret"),
        JWT_SECRET_KEY=os.getenv("JWT_SECRET_KEY", "dev-jwt"),
        JWT_ACCESS_TOKEN_EXPIRES=timedelta(hours=8),
        JWT_REFRESH_TOKEN_EXPIRES=timedelta(days=30),
        SQLALCHEMY_DATABASE_URI=os.getenv("DATABASE_URL"),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        SQLALCHEMY_ENGINE_OPTIONS={
            "pool_pre_ping": True,
            "pool_recycle": 300
        },
        MAX_CONTENT_LENGTH=int(
            os.getenv("MAX_CONTENT_LENGTH", 10485760)
        ),
        UPLOAD_FOLDER=os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "uploads"
        ),
    )

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    limiter.init_app(app)

    # CORS Configuration
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:3000",
                    "http://localhost:5173",
                    "http://localhost:5174",
                    os.getenv("FRONTEND_URL", "http://localhost:5174")
                ]
            }
        },
        supports_credentials=True,
        allow_headers=[
            "Content-Type",
            "Authorization",
            "Accept",
            "Origin"
        ],
        methods=[
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ]
    )

    @app.after_request
    def security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

    @app.after_request
    def add_cors_headers(response):
        origin = request.headers.get("Origin")

        allowed_origins = [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
            os.getenv("FRONTEND_URL", "http://localhost:5174")
        ]

        if origin in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin

        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Headers"] = (
            "Content-Type, Authorization, Accept, Origin"
        )
        response.headers["Access-Control-Allow-Methods"] = (
            "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        )

        return response

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.vehicles import vehicles_bp
    from app.routes.bookings import bookings_bp
    from app.routes.payments import payments_bp
    from app.routes.reviews import reviews_bp
    from app.routes.admin import admin_bp
    from app.routes.public import public_bp
    from app.routes.uploads import uploads_bp





    @jwt.invalid_token_loader
    def invalid_token(reason):
        app.logger.warning(f'JWT invalid token: {reason}')
        return jsonify(success=False, message=f'Invalid token: {reason}'), 422

    # Add this new one:
    @jwt.token_verification_failed_loader  
    def token_verification_failed(jwt_header, jwt_payload):
        return jsonify(success=False, message="Token verification failed"), 422
    
   




    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(vehicles_bp, url_prefix="/api/vehicles")
    app.register_blueprint(bookings_bp, url_prefix="/api/bookings")
    app.register_blueprint(payments_bp, url_prefix="/api/payments")
    app.register_blueprint(reviews_bp, url_prefix="/api/reviews")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(public_bp, url_prefix="/api/public")
    app.register_blueprint(uploads_bp, url_prefix="/api/uploads")

    @app.errorhandler(404)
    def not_found(error):
        return jsonify(
            success=False,
            message="Not found"
        ), 404

    @app.errorhandler(500)
    def server_error(error):
        app.logger.exception("Internal server error")
        return jsonify(
            success=False,
            message="Internal server error"
        ), 500

    @app.errorhandler(429)
    def rate_limited(error):
        return jsonify(
            success=False,
            message="Too many requests"
        ), 429

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify(
            status="ok",
            service="CarRental API v1.0"
        )

    return app