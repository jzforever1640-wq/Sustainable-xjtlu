from . import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    display_name = db.Column(db.String(100), nullable=False)
    role = db.Column(
        db.String(30),
        nullable=False,
        default="user",
        server_default="user",
    )
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        server_default=db.func.now(),
    )

    favorites = db.relationship(
        "Favorite",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    feedback_items = db.relationship(
        "Feedback",
        back_populates="user",
        passive_deletes=True,
    )


class Content(db.Model):
    __tablename__ = "contents"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    summary = db.Column(db.Text)
    body = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100), nullable=False, index=True)
    source_url = db.Column(db.String(1000))
    cover_image_url = db.Column(db.String(1000))
    status = db.Column(
        db.String(30),
        nullable=False,
        default="draft",
        server_default="draft",
        index=True,
    )
    published_at = db.Column(db.DateTime(timezone=True), index=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        server_default=db.func.now(),
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        server_default=db.func.now(),
        onupdate=db.func.now(),
    )

    favorites = db.relationship(
        "Favorite",
        back_populates="content",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    feedback_items = db.relationship(
        "Feedback",
        back_populates="content",
        passive_deletes=True,
    )


class Feedback(db.Model):
    __tablename__ = "feedback"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    content_id = db.Column(
        db.Integer,
        db.ForeignKey("contents.id", ondelete="SET NULL"),
        nullable=True,
    )
    feedback_type = db.Column(
        db.String(50),
        nullable=False,
        default="general",
        server_default="general",
    )
    message = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer)
    status = db.Column(
        db.String(30),
        nullable=False,
        default="pending",
        server_default="pending",
    )
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        server_default=db.func.now(),
    )

    user = db.relationship("User", back_populates="feedback_items")
    content = db.relationship("Content", back_populates="feedback_items")

    __table_args__ = (
        db.CheckConstraint(
            "rating IS NULL OR (rating >= 1 AND rating <= 5)",
            name="ck_feedback_rating_range",
        ),
    )


class Favorite(db.Model):
    __tablename__ = "favorites"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    content_id = db.Column(
        db.Integer,
        db.ForeignKey("contents.id", ondelete="CASCADE"),
        nullable=False,
    )
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        server_default=db.func.now(),
    )

    user = db.relationship("User", back_populates="favorites")
    content = db.relationship("Content", back_populates="favorites")

    __table_args__ = (
        db.UniqueConstraint(
            "user_id",
            "content_id",
            name="uq_favorites_user_content",
        ),
    )