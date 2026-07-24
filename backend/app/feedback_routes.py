from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required,
)
from sqlalchemy.exc import SQLAlchemyError

from . import db
from .models import Content, Feedback, User


feedback_bp = Blueprint("feedback", __name__)

ALLOWED_FEEDBACK_TYPES = {
    "general",
    "suggestion",
    "content_issue",
    "bug",
}


def serialize_feedback(feedback):
    return {
        "id": feedback.id,
        "user_id": feedback.user_id,
        "content_id": feedback.content_id,
        "feedback_type": feedback.feedback_type,
        "message": feedback.message,
        "rating": feedback.rating,
        "status": feedback.status,
        "created_at": (
            feedback.created_at.isoformat()
            if feedback.created_at
            else None
        ),
    }


@feedback_bp.post("/api/feedback")
@jwt_required(optional=True)
def create_feedback():
    payload = request.get_json(silent=True)

    if not isinstance(payload, dict):
        return jsonify({
            "status": "error",
            "message": "Request body must be valid JSON",
        }), 400

    message = str(payload.get("message", "")).strip()

    if not message:
        return jsonify({
            "status": "error",
            "message": "Message is required",
            "fields": ["message"],
        }), 400

    if len(message) > 3000:
        return jsonify({
            "status": "error",
            "message": "Message must not exceed 3000 characters",
        }), 400

    feedback_type = str(
        payload.get("feedback_type", "general")
    ).strip()

    if feedback_type not in ALLOWED_FEEDBACK_TYPES:
        return jsonify({
            "status": "error",
            "message": "Invalid feedback type",
            "allowed_values": sorted(ALLOWED_FEEDBACK_TYPES),
        }), 400

    rating = payload.get("rating")

    if rating is not None:
        if (
            isinstance(rating, bool)
            or not isinstance(rating, int)
            or rating < 1
            or rating > 5
        ):
            return jsonify({
                "status": "error",
                "message": "Rating must be an integer from 1 to 5",
            }), 400

    content_id = payload.get("content_id")

    if content_id is not None:
        if isinstance(content_id, bool):
            return jsonify({
                "status": "error",
                "message": "Content ID must be an integer",
            }), 400

        try:
            content_id = int(content_id)
        except (TypeError, ValueError):
            return jsonify({
                "status": "error",
                "message": "Content ID must be an integer",
            }), 400

        content = db.session.get(Content, content_id)

        if content is None or content.status != "published":
            return jsonify({
                "status": "error",
                "message": "Published content not found",
            }), 404

    identity = get_jwt_identity()
    user_id = None

    if identity is not None:
        try:
            user_id = int(identity)
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
            }), 401

    feedback = Feedback(
        user_id=user_id,
        content_id=content_id,
        feedback_type=feedback_type,
        message=message,
        rating=rating,
        status="pending",
    )

    try:
        db.session.add(feedback)
        db.session.commit()

    except SQLAlchemyError:
        db.session.rollback()
        current_app.logger.exception(
            "Failed to create feedback"
        )

        return jsonify({
            "status": "error",
            "message": "Failed to submit feedback",
        }), 500

    return jsonify({
        "status": "ok",
        "message": "Feedback submitted successfully",
        "item": serialize_feedback(feedback),
    }), 201