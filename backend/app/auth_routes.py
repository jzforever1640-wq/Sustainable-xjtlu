import re

from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required,
)
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from werkzeug.security import (
    check_password_hash,
    generate_password_hash,
)

from . import db
from .models import User


auth_bp = Blueprint("auth", __name__)

EMAIL_PATTERN = re.compile(
    r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
)


def serialize_user(user):
    return {
        "id": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "role": user.role,
        "created_at": (
            user.created_at.isoformat()
            if user.created_at
            else None
        ),
    }


@auth_bp.post("/api/auth/register")
def register():
    payload = request.get_json(silent=True)

    if not isinstance(payload, dict):
        return jsonify({
            "status": "error",
            "message": "Request body must be valid JSON",
        }), 400

    email = str(payload.get("email", "")).strip().lower()
    display_name = str(
        payload.get("display_name", "")
    ).strip()

    password = payload.get("password")

    if not email or not EMAIL_PATTERN.fullmatch(email):
        return jsonify({
            "status": "error",
            "message": "Please enter a valid email address",
        }), 400

    if len(email) > 255:
        return jsonify({
            "status": "error",
            "message": "Email address is too long",
        }), 400

    if len(display_name) < 2 or len(display_name) > 100:
        return jsonify({
            "status": "error",
            "message": (
                "Display name must contain "
                "between 2 and 100 characters"
            ),
        }), 400

    if not isinstance(password, str):
        return jsonify({
            "status": "error",
            "message": "Password is required",
        }), 400

    if len(password) < 8 or len(password) > 128:
        return jsonify({
            "status": "error",
            "message": (
                "Password must contain "
                "between 8 and 128 characters"
            ),
        }), 400

    existing_user = db.session.execute(
        select(User).where(User.email == email)
    ).scalar_one_or_none()

    if existing_user is not None:
        return jsonify({
            "status": "error",
            "message": "An account with this email already exists",
        }), 409

    user = User(
        email=email,
        display_name=display_name,
        password_hash=generate_password_hash(password),
        role="user",
    )

    try:
        db.session.add(user)
        db.session.commit()

    except IntegrityError:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "An account with this email already exists",
        }), 409

    except SQLAlchemyError:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to create account",
        }), 500

    access_token = create_access_token(
        identity=str(user.id)
    )

    return jsonify({
        "status": "ok",
        "message": "Account created successfully",
        "access_token": access_token,
        "user": serialize_user(user),
    }), 201


@auth_bp.post("/api/auth/login")
def login():
    payload = request.get_json(silent=True)

    if not isinstance(payload, dict):
        return jsonify({
            "status": "error",
            "message": "Request body must be valid JSON",
        }), 400

    email = str(payload.get("email", "")).strip().lower()
    password = payload.get("password")

    if not email or not isinstance(password, str):
        return jsonify({
            "status": "error",
            "message": "Invalid email or password",
        }), 401

    user = db.session.execute(
        select(User).where(User.email == email)
    ).scalar_one_or_none()

    if (
        user is None
        or not check_password_hash(
            user.password_hash,
            password,
        )
    ):
        return jsonify({
            "status": "error",
            "message": "Invalid email or password",
        }), 401

    access_token = create_access_token(
        identity=str(user.id)
    )

    return jsonify({
        "status": "ok",
        "message": "Login successful",
        "access_token": access_token,
        "user": serialize_user(user),
    })


@auth_bp.get("/api/auth/me")
@jwt_required()
def get_current_user():
    try:
        user_id = int(get_jwt_identity())
    except (TypeError, ValueError):
        return jsonify({
            "status": "error",
            "message": "Invalid authentication token",
        }), 401

    user = db.session.get(User, user_id)

    if user is None:
        return jsonify({
            "status": "error",
            "message": "User not found",
        }), 404

    return jsonify({
        "status": "ok",
        "user": serialize_user(user),
    })