"""Fetch only the explicitly selected official XJTLU sustainability pages.

Usage:
  python -m ingestion.crawl_xjtlu
  python -m ingestion.crawl_xjtlu --output ingestion/data/xjtlu_content.json
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup
from dateutil import parser as date_parser
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_INPUT = BASE_DIR / "data" / "xjtlu_selected_pages.json"
DEFAULT_OUTPUT = BASE_DIR / "data" / "xjtlu_content.json"
ALLOWED_HOST = "www.xjtlu.edu.cn"
USER_AGENT = "SustainableXJTLU-Ingestion/0.1 (research content validation)"

SDG_KEYWORDS = {
    "SDG 2 Zero Hunger": ("food", "agriculture", "organic farm", "hunger"),
    "SDG 3 Good Health and Well-being": ("health", "wellbeing", "well-being"),
    "SDG 4 Quality Education": ("education", "learning", "students", "curriculum"),
    "SDG 7 Affordable and Clean Energy": ("energy", "solar", "renewable", "low-carbon"),
    "SDG 9 Industry, Innovation and Infrastructure": ("innovation", "technology", "infrastructure"),
    "SDG 11 Sustainable Cities and Communities": ("urban", "city", "campus", "community"),
    "SDG 12 Responsible Consumption and Production": ("plastic", "reuse", "recycling", "waste", "circular"),
    "SDG 13 Climate Action": ("climate", "carbon", "earth week", "emission"),
    "SDG 14 Life Below Water": ("ocean", "water", "marine"),
    "SDG 15 Life on Land": ("biodiversity", "bird", "ecology", "nature", "wildlife"),
    "SDG 17 Partnerships for the Goals": ("partnership", "collaboration", "seminar", "prme"),
}


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def property_text(soup: BeautifulSoup, *names: str) -> str | None:
    for name in names:
        tag = soup.select_one(f'meta[property="{name}"], meta[name="{name}"]')
        if tag and tag.get("content"):
            return clean_text(tag["content"])
    return None


def parse_date(value: str | None) -> str | None:
    if not value:
        return None
    try:
        parsed = date_parser.parse(value, fuzzy=True)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.isoformat()
    except (ValueError, TypeError, OverflowError):
        return None


def content_root(soup: BeautifulSoup):
    selectors = ("article", "main article", "main", ".article-content", ".news-content", ".entry-content")
    for selector in selectors:
        root = soup.select_one(selector)
        if root:
            return root
    return soup.body or soup


def extract_body(root) -> str:
    for node in root.select("script, style, nav, header, footer, form, aside, .share, .breadcrumb"):
        node.decompose()
    blocks = [clean_text(node.get_text(" ", strip=True)) for node in root.select("h2, h3, h4, p, li")]
    blocks = [block for block in blocks if len(block) > 20]
    return "\n\n".join(blocks)


def infer_category(soup: BeautifulSoup, body: str) -> str:
    trail = clean_text(" ".join(node.get_text(" ", strip=True) for node in soup.select(".breadcrumb, .category, .categories")))
    text = f"{trail} {body[:1600]}".lower()
    if any(word in text for word in ("earth week", "club", "workshop", "forum", "seminar", "event")):
        return "Activity"
    if any(word in text for word in ("research", "study", "professor", "conference")):
        return "Research"
    return "News"


def infer_sdg_tags(text: str) -> list[str]:
    lower = text.lower()
    return [tag for tag, terms in SDG_KEYWORDS.items() if any(term in lower for term in terms)]


def build_session(retries: int) -> requests.Session:
    """Retry transient connection, timeout, and gateway errors without widening scope."""
    retry = Retry(
        total=retries,
        connect=retries,
        read=retries,
        status=retries,
        backoff_factor=1,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=("GET",),
    )
    session = requests.Session()
    session.mount("https://", HTTPAdapter(max_retries=retry))
    return session


def extract_html(html: str, url: str) -> dict:
    """Turn one already-fetched official news page into the public JSON shape."""
    soup = BeautifulSoup(html, "html.parser")
    root = content_root(soup)
    title_node = soup.find("h1") or soup.title
    title = property_text(soup, "og:title", "twitter:title") or clean_text(
        title_node.get_text(" ", strip=True) if title_node else ""
    )
    if not title:
        raise ValueError(f"No title found in selected page: {url}")
    body = extract_body(root)
    if not body:
        raise ValueError(f"No article body found in selected page: {url}")
    description = property_text(soup, "og:description", "description")
    summary = description or clean_text(body[:360])
    image_url = property_text(soup, "og:image", "twitter:image")
    date_value = property_text(soup, "article:published_time", "publish-date", "date")
    if not date_value:
        date_node = soup.select_one("time, .date, .article-date, .post-date")
        date_value = date_node.get_text(" ", strip=True) if date_node else None

    combined_text = f"{title} {summary} {body}"
    return {
        "title": title,
        "summary": summary,
        "content": body,
        "publish_date": parse_date(date_value),
        "source": "Xi'an Jiaotong-Liverpool University",
        "url": url,
        "image_url": image_url,
        "category": infer_category(soup, body),
        "sdg_tags": infer_sdg_tags(combined_text),
        "retrieved_at": datetime.now(timezone.utc).isoformat(),
    }


def extract_page(url: str, timeout: int, session: requests.Session | None = None) -> dict:
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.netloc != ALLOWED_HOST or not parsed.path.startswith("/en/news/"):
        raise ValueError(f"URL is outside the selected official XJTLU news scope: {url}")

    response = (session or build_session(3)).get(
        url,
        headers={"User-Agent": USER_AGENT},
        timeout=timeout,
    )
    response.raise_for_status()
    return extract_html(response.text, response.url)


def main() -> None:
    parser = argparse.ArgumentParser(description="Crawl selected official XJTLU sustainability news pages")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--timeout", type=int, default=20)
    parser.add_argument("--retries", type=int, default=3)
    args = parser.parse_args()

    pages = json.loads(args.input.read_text(encoding="utf-8"))
    records, failures = [], []
    session = build_session(max(args.retries, 0))
    for item in pages:
        url = item["url"]
        try:
            records.append(extract_page(url, args.timeout, session))
            print(f"collected: {url}")
        except (requests.RequestException, ValueError) as error:
            failures.append({"url": url, "error": str(error)})
            print(f"failed: {url} — {error}")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps({"items": records, "failures": failures}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {len(records)} records and {len(failures)} failures to {args.output}")


if __name__ == "__main__":
    main()
