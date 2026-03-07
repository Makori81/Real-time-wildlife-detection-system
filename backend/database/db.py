"""
================================================================
  backend/database/db.py  — DATABASE LAYER
  Everything related to SQLite lives here.

  Functions exported (used by api/routes.py):
    init_database()           → creates tables on first run
    save_detection(det)       → inserts one detection record
    get_detection_logs(...)   → fetches log rows for the history table
    get_detection_stats()     → returns totals by species
    delete_detection_by_id()  → removes one row
    mark_alert_sent()         → called by email service after alert fires
================================================================
"""

import sqlite3
from datetime import datetime

DATABASE_PATH = "wildlife_detections.db"


def get_conn():
    """Returns a database connection. Rows behave like dicts."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# ── CREATE TABLES ─────────────────────────────────────────────────────────────
def init_database():
    """
    Creates tables if they don't exist yet.
    Matches the ER diagram from Chapter 4:
      users       — single admin user
      detections  — every animal detection event
    """
    conn = get_conn()
    c = conn.cursor()

    # Users table (single-user system per spec)
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            username   TEXT NOT NULL,
            email      TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Detections table — one row per detection event
    c.execute("""
        CREATE TABLE IF NOT EXISTS detections (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            species        TEXT    NOT NULL,
            confidence     REAL    NOT NULL,
            timestamp      TEXT    NOT NULL,   -- e.g. "14:32:05"
            date           TEXT    NOT NULL,   -- e.g. "2024-01-15"
            frame_snapshot TEXT,               -- base64 JPEG (optional)
            alert_sent     INTEGER DEFAULT 0,  -- 1 after email alert fires
            user_id        INTEGER,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    # Seed default user if table is empty
    c.execute("SELECT COUNT(*) FROM users")
    if c.fetchone()[0] == 0:
        c.execute(
            "INSERT INTO users (username, email) VALUES (?, ?)",
            ("admin", "admin@example.com"),
        )

    conn.commit()
    conn.close()
    print("✅ Database ready:", DATABASE_PATH)


# ── WRITE ─────────────────────────────────────────────────────────────────────
def save_detection(detection: dict, frame_bytes: bytes = None):
    """
    Inserts one detection into the database.
    Called by detection/model.py after every confirmed detection.

    detection = {
        "species":    "lion",
        "confidence": 0.87,
        "bbox":       [x1, y1, x2, y2]   (not stored, just drawn on frame)
    }
    """
    import base64
    now = datetime.now()
    snapshot = base64.b64encode(frame_bytes).decode() if frame_bytes else None

    conn = get_conn()
    conn.execute(
        """INSERT INTO detections (species, confidence, timestamp, date, frame_snapshot)
           VALUES (?, ?, ?, ?, ?)""",
        (
            detection["species"],
            detection["confidence"],
            now.strftime("%H:%M:%S"),
            now.strftime("%Y-%m-%d"),
            snapshot,
        ),
    )
    conn.commit()
    conn.close()


def mark_alert_sent(species: str):
    """
    Marks the most recent detection of that species as alerted.
    Uses subquery because SQLite doesn't support ORDER BY in UPDATE.
    """
    conn = get_conn()
    conn.execute(
        """UPDATE detections SET alert_sent=1 
           WHERE id = (
               SELECT id FROM detections 
               WHERE species=? 
               ORDER BY id DESC 
               LIMIT 1
           )""",
        (species,),
    )
    conn.commit()
    conn.close()


def delete_detection_by_id(detection_id: int):
    """Removes one row. Called when user clicks Delete in the history table."""
    conn = get_conn()
    conn.execute("DELETE FROM detections WHERE id=?", (detection_id,))
    conn.commit()
    conn.close()


# ── READ ──────────────────────────────────────────────────────────────────────
def get_detection_logs(limit: int = 50, species_filter: str = None) -> list:
    """
    Returns detection rows for the history table.
    Optionally filtered by species.
    """
    conn = get_conn()
    if species_filter:
        rows = conn.execute(
            "SELECT * FROM detections WHERE species=? ORDER BY id DESC LIMIT ?",
            (species_filter, limit),
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM detections ORDER BY id DESC LIMIT ?", (limit,)
        ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_detection_stats() -> dict:
    """
    Returns total counts used by the stats panel.
    Response shape matches what the frontend expects:
    {
      "total": 245,
      "by_species": { "lion": 120, "hyena": 85, "buffalo": 40 },
      "today": 30
    }
    """
    conn = get_conn()

    total = conn.execute("SELECT COUNT(*) FROM detections").fetchone()[0]

    rows = conn.execute(
        "SELECT species, COUNT(*) as cnt FROM detections GROUP BY species"
    ).fetchall()
    by_species = {r["species"]: r["cnt"] for r in rows}

    today = datetime.now().strftime("%Y-%m-%d")
    today_count = conn.execute(
        "SELECT COUNT(*) FROM detections WHERE date=?", (today,)
    ).fetchone()[0]

    conn.close()
    return {"total": total, "by_species": by_species, "today": today_count}
