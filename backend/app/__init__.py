import os
from datetime import timedelta

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from sqlalchemy.engine import URL


db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app():
    load_dotenv()

    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.getenv(
        "SECRET_KEY",
        "development-secret-key",
    )

    required_settings = [
        "DB_HOST",
        "DB_USER",
        "DB_PASSWORD",
    ]

    missing_settings = [
        setting
        for setting in required_settings
        if not os.getenv(setting)
    ]

    if missing_settings:
        raise RuntimeError(
            "缺少数据库配置：" + ", ".join(missing_settings)
        )

    jwt_secret_key = os.getenv("JWT_SECRET_KEY")

    if not jwt_secret_key:
        raise RuntimeError("缺少配置：JWT_SECRET_KEY")

    app.config["JWT_SECRET_KEY"] = jwt_secret_key
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

    database_url = URL.create(
        drivername="postgresql+psycopg",
        username=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", "5432")),
        database=os.getenv("DB_NAME", "postgres"),
        query={"sslmode": "require"},
    )

    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }

    db.init_app(app)

    # 加载数据库模型
    from . import models

    migrate.init_app(app, db)
    jwt.init_app(app)

    # 注册所有 API 蓝图
    from .auth_routes import auth_bp
    from .content_routes import contents_bp
    from .favorite_routes import favorites_bp
    from .feedback_routes import feedback_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(contents_bp)
    app.register_blueprint(favorites_bp)
    app.register_blueprint(feedback_bp)

    cors_origins = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://localhost:5173",
        ).split(",")
        if origin.strip()
    ]

    CORS(
        app,
        origins=cors_origins,
        allow_headers=[
            "Content-Type",
            "Authorization",
        ],
        methods=[
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],
        supports_credentials=True,
    )

    @app.get("/api/health")
    def health():
        return jsonify(
            status="ok",
            service="sustainable-xjtlu-api",
        )

    @app.get("/api/db-health")
    def database_health():
        try:
            database_name = db.session.execute(
                text("SELECT current_database()")
            ).scalar_one()

            return jsonify(
                status="ok",
                database=database_name,
                engine="PostgreSQL",
            )

        except Exception:
            app.logger.exception("Database connection failed")

            return jsonify(
                status="error",
                message="数据库连接失败，请查看后端日志",
            ), 503

    return app
