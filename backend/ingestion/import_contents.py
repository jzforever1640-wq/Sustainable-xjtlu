"""Import crawler JSON into the existing PostgreSQL contents table.

The importer is idempotent by source URL and conservatively skips records whose
title is materially similar to a stored record. It does not need Supabase.
"""

from __future__ import annotations

import argparse
import json
import re
from difflib import SequenceMatcher
from pathlib import Path

from dateutil import parser as date_parser
from sqlalchemy import select

from app import create_app, db
from app.models import Content


DEFAULT_INPUT = Path(__file__).resolve().parent / "data" / "xjtlu_content.json"


def normalise_title(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def title_similarity(first: str, second: str) -> float:
    return SequenceMatcher(None, normalise_title(first), normalise_title(second)).ratio()


def is_duplicate(record: dict, similarity_threshold: float) -> tuple[bool, str]:
    existing_url = db.session.execute(
        select(Content.id).where(Content.source_url == record["url"])
    ).scalar_one_or_none()
    if existing_url is not None:
        return True, "matching URL"

    candidates = db.session.execute(select(Content.id, Content.title)).all()
    for _, title in candidates:
        if title_similarity(record["title"], title) >= similarity_threshold:
            return True, "similar title"
    return False, ""


def import_records(path: Path, status: str, dry_run: bool, threshold: float) -> dict[str, int]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    summary = {"inserted": 0, "skipped": 0, "invalid": 0}
    for record in payload.get("items", []):
        if not record.get("title") or not record.get("content") or not record.get("url"):
            summary["invalid"] += 1
            continue
        duplicate, reason = is_duplicate(record, threshold)
        if duplicate:
            summary["skipped"] += 1
            print(f"skipped ({reason}): {record['title']}")
            continue

        published_at = date_parser.isoparse(record["publish_date"]) if record.get("publish_date") else None
        content = Content(
            title=record["title"][:255],
            summary=record.get("summary") or None,
            body=record["content"],
            category=record.get("category") or "News",
            source_url=record["url"],
            cover_image_url=record.get("image_url") or None,
            status=status,
            published_at=published_at,
        )
        summary["inserted"] += 1
        if not dry_run:
            db.session.add(content)
        print(f"{'would import' if dry_run else 'imported'}: {content.title}")

    if not dry_run:
        db.session.commit()
    return summary


def main() -> None:
    parser = argparse.ArgumentParser(description="Import selected XJTLU content JSON into PostgreSQL")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--status", choices=("draft", "published"), default="draft")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--title-threshold", type=float, default=0.92)
    args = parser.parse_args()

    app = create_app()
    with app.app_context():
        result = import_records(args.input, args.status, args.dry_run, args.title_threshold)
        print(result)


if __name__ == "__main__":
    main()
