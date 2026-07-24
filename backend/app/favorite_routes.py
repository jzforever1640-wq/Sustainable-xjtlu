from flask import Blueprint, jsonify
from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required,
)
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from . import db
from .content_routes import serialize_content
from .models import Content, Favorite


favorites_bp = Blueprint("favorites", __name__)


def get_current_user_id():
    try:
        return int(get_jwt_identity())
    except (TypeError, ValueError):
        return None


@favorites_bp.get("/api/favorites")
@jwt_required()
def get_favorites():
    user_id = get_current_user_id()

    if user_id is None:
        return jsonify({
            "status": "error",
            "message": "Invalid authentication token",
        }), 401

    statement = (
        select(Favorite, Content)
        .join(
            Content,
            Favorite.content_id == Content.id,
        )
        .where(
            Favorite.user_id == user_id,
            Content.status == "published",
        )
        .order_by(
            Favorite.created_at.desc(),
            Favorite.id.desc(),
        )
    )

    rows = db.session.execute(statement).all()

    items = [
        {
            "favorite_id": favorite.id,
            "created_at": (
                favorite.created_at.isoformat()
                if favorite.created_at
                else None
            ),
            "content": serialize_content(content),
        }
        for favorite, content in rows
    ]

    return jsonify({
        "status": "ok",
        "count": len(items),
        "items": items,
    })


@favorites_bp.post("/api/favorites/<int:content_id>")
@jwt_required()
def add_favorite(content_id):
    user_id = get_current_user_id()

    if user_id is None:
        return jsonify({
            "status": "error",
            "message": "Invalid authentication token",
        }), 401

    content = db.session.get(Content, content_id)

    if content is None or content.status != "published":
        return jsonify({
            "status": "error",
            "message": "Published content not found",
        }), 404

    existing_favorite = db.session.execute(
        select(Favorite).where(
            Favorite.user_id == user_id,
            Favorite.content_id == content_id,
        )
    ).scalar_one_or_none()

    if existing_favorite is not None:
        return jsonify({
            "status": "ok",
            "message": "Content is already in favorites",
            "favorite_id": existing_favorite.id,
        })

    favorite = Favorite(
        user_id=user_id,
        content_id=content_id,
    )

    try:
        db.session.add(favorite)
        db.session.commit()

    except IntegrityError:
        db.session.rollback()

        return jsonify({
            "status": "ok",
            "message": "Content is already in favorites",
        })

    except SQLAlchemyError:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to add favorite",
        }), 500

    return jsonify({
        "status": "ok",
        "message": "Content added to favorites",
        "favorite_id": favorite.id,
        "content": serialize_content(content),
    }), 201


@favorites_bp.delete("/api/favorites/<int:content_id>")
@jwt_required()
def remove_favorite(content_id):
    user_id = get_current_user_id()

    if user_id is None:
        return jsonify({
            "status": "error",
            "message": "Invalid authentication token",
        }), 401

    favorite = db.session.execute(
        select(Favorite).where(
            Favorite.user_id == user_id,
            Favorite.content_id == content_id,
        )
    ).scalar_one_or_none()

    if favorite is None:
        return jsonify({
            "status": "error",
            "message": "Favorite not found",
        }), 404

    try:
        db.session.delete(favorite)
        db.session.commit()

    except SQLAlchemyError:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to remove favorite",
        }), 500

    return jsonify({
        "status": "ok",
        "message": "Favorite removed successfully",
    })