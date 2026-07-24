from datetime import datetime, timezone

from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required,
)
from sqlalchemy import func, or_, select
from sqlalchemy.exc import SQLAlchemyError

from . import db
from .models import Content, User


contents_bp = Blueprint("contents", __name__)


def serialize_content(content):
    return {
        "id": content.id,
        "title": content.title,
        "summary": content.summary,
        "body": content.body,
        "category": content.category,
        "source_url": content.source_url,
        "cover_image_url": content.cover_image_url,
        "status": content.status,
        "published_at": (
            content.published_at.isoformat()
            if content.published_at
            else None
        ),
        "created_at": (
            content.created_at.isoformat()
            if content.created_at
            else None
        ),
        "updated_at": (
            content.updated_at.isoformat()
            if content.updated_at
            else None
        ),
    }


@contents_bp.get("/api/contents")
def get_contents():
    """Return published content with server-side search and pagination."""
    query = str(request.args.get("q", "")).strip()
    category = str(request.args.get("category", "")).strip()

    try:
        page = max(int(request.args.get("page", 1)), 1)
        page_size = min(max(int(request.args.get("page_size", 12)), 1), 50)
    except ValueError:
        return jsonify({
            "status": "error",
            "message": "page and page_size must be integers",
        }), 400

    statement = (
        select(Content)
        .where(Content.status == "published")
    )

    count_statement = select(func.count(Content.id)).where(
        Content.status == "published"
    )

    if category:
        statement = statement.where(Content.category == category)
        count_statement = count_statement.where(Content.category == category)

    if query:
        pattern = f"%{query}%"
        search_filter = or_(
            Content.title.ilike(pattern),
            Content.summary.ilike(pattern),
            Content.body.ilike(pattern),
            Content.category.ilike(pattern),
        )
        statement = statement.where(search_filter)
        count_statement = count_statement.where(search_filter)

    total = db.session.execute(count_statement).scalar_one()
    contents = db.session.execute(
        statement.order_by(
            Content.published_at.desc(),
            Content.id.desc(),
        ).offset((page - 1) * page_size).limit(page_size)
    ).scalars().all()

    return jsonify({
        "status": "ok",
        "count": len(contents),
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [
            serialize_content(content)
            for content in contents
        ],
    })


@contents_bp.get("/api/contents/<int:content_id>")
def get_content(content_id):
    content = db.session.get(Content, content_id)

    if content is None or content.status != "published":
        return jsonify({
            "status": "error",
            "message": "Content not found",
        }), 404

    return jsonify({
        "status": "ok",
        "item": serialize_content(content),
    })


@contents_bp.post("/api/contents")
@jwt_required()
def create_content():
    try:
        user_id = int(get_jwt_identity())
    except (TypeError, ValueError):
        return jsonify({
            "status": "error",
            "message": "Invalid authentication token",
        }), 401

    current_user = db.session.get(User, user_id)

    if current_user is None:
        return jsonify({
            "status": "error",
            "message": "User not found",
        }), 401

    if current_user.role != "admin":
        return jsonify({
            "status": "error",
            "message": "Administrator access required",
        }), 403

    payload = request.get_json(silent=True)

    if not isinstance(payload, dict):
        return jsonify({
            "status": "error",
            "message": "Request body must be valid JSON",
        }), 400

    required_fields = [
        "title",
        "body",
        "category",
    ]

    missing_fields = [
        field
        for field in required_fields
        if not str(payload.get(field, "")).strip()
    ]

    if missing_fields:
        return jsonify({
            "status": "error",
            "message": "Missing required fields",
            "fields": missing_fields,
        }), 400

    status = str(payload.get("status", "draft")).strip().lower()

    if status not in {"draft", "published"}:
        return jsonify({
            "status": "error",
            "message": "Status must be draft or published",
        }), 400

    content = Content(
        title=str(payload["title"]).strip(),
        summary=(
            str(payload.get("summary", "")).strip()
            or None
        ),
        body=str(payload["body"]).strip(),
        category=str(payload["category"]).strip(),
        source_url=(
            str(payload.get("source_url", "")).strip()
            or None
        ),
        cover_image_url=(
            str(payload.get("cover_image_url", "")).strip()
            or None
        ),
        status=status,
        published_at=(
            datetime.now(timezone.utc)
            if status == "published"
            else None
        ),
    )

    try:
        db.session.add(content)
        db.session.commit()

    except SQLAlchemyError:
        db.session.rollback()
        current_app.logger.exception(
            "Failed to create content"
        )

        return jsonify({
            "status": "error",
            "message": "Failed to create content",
        }), 500

    return jsonify({
        "status": "ok",
        "message": "Content created",
        "item": serialize_content(content),
    }), 201
