# XJTLU content ingestion pilot

This pilot intentionally crawls only the 20 URLs in `data/xjtlu_selected_pages.json`. It rejects non-HTTPS URLs, non-XJTLU hosts, and URLs outside `/en/news/`; it does not discover links or crawl the wider website.

## Workflow

```bash
cd backend
python -m ingestion.crawl_xjtlu
python -m ingestion.import_contents --dry-run
python -m ingestion.import_contents --status published
```

The crawler retries transient connection, timeout, and gateway errors three times by default. Adjust this only when needed, for example: `python -m ingestion.crawl_xjtlu --timeout 45 --retries 5`.

`crawl_xjtlu.py` writes `data/xjtlu_content.json` with title, summary, full content, publication date, source, URL, image URL, category, and SDG tags. Check the JSON before import.

Run the parser check without contacting the XJTLU site:

```bash
cd backend
python -m unittest ingestion.tests.test_crawl_xjtlu
```

`import_contents.py` writes to the existing PostgreSQL `contents` table. It skips an item if its source URL already exists or its normalized title has a similarity score of 0.92 or higher with an existing title. Use `--status draft` for review-first ingestion; use `--status published` only after review.

## Current database fit

The existing `contents` table stores title, summary, body, category, source URL, cover image, publication time, status, and `sdg_tags`. SDG tags are stored as a PostgreSQL JSON array so one item can be associated with several goals and the API can filter by an exact goal.

After deploying the migration, re-run the importer to synchronise tags for records already imported:

```bash
python -m ingestion.import_contents --status published
```

Matching source URLs are not duplicated; their SDG tags are updated. In a later analytics phase, `sdg_goals` and `content_sdg_goals` can be added as normalized tables if goal-level reporting needs more relationships or metadata.

The crawler output is generated data and is intentionally not committed. It must be regenerated in an environment that can reach `www.xjtlu.edu.cn`.
