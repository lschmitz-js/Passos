#!/usr/bin/env python3
"""Coleta passos diários do Garmin Connect e armazena em SQLite."""

import argparse
import json
import os
import sqlite3
import sys
import time
from datetime import date, datetime, timedelta
from getpass import getpass
from pathlib import Path

from garminconnect import Garmin

TOKENSTORE = os.environ.get("TOKENSTORE", str(Path("~/.garminconnect").expanduser()))
DB_PATH = os.environ.get("DB_PATH", "/data/passos.db")
NAMES_FILE = Path(os.environ.get("NAMES_FILE", "/data/names.json"))
LEADERBOARD_PATH = "/usersummary-service/stats/wellness/leaderboard/FOLLOWING"

FAMILY_IDS = {
    "136367709",  # Joana
    "136467633",  # Joao Bruno
    "133104715",  # Alice
    "111100771",  # Leo
    "139402941",  # Ivana
    "111133818",  # Elisabeth
    "149194897",  # Laurent
}

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
  profile_pk  TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  group_name  TEXT NOT NULL DEFAULT 'todos' CHECK(group_name IN ('familia','amigos','todos')),
  created_at  INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS daily_steps (
  profile_pk  TEXT NOT NULL REFERENCES users(profile_pk),
  date        TEXT NOT NULL,
  steps       INTEGER NOT NULL DEFAULT 0,
  captured_at INTEGER NOT NULL,
  PRIMARY KEY (profile_pk, date)
);
CREATE INDEX IF NOT EXISTS idx_daily_date ON daily_steps(date);
CREATE INDEX IF NOT EXISTS idx_daily_user_date ON daily_steps(profile_pk, date);
"""


def open_db() -> sqlite3.Connection:
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    conn.executescript(SCHEMA)
    return conn


def login() -> Garmin:
    g = Garmin()
    try:
        g.login(TOKENSTORE)
        print(f"Login com tokens salvos em {TOKENSTORE}.")
        return g
    except Exception as e:
        print(f"Falha ao carregar tokens: {e}", file=sys.stderr)

    if not sys.stdin.isatty():
        print("Sem tokens válidos e sem TTY — abortando.", file=sys.stderr)
        sys.exit(1)

    email = input("Email Garmin: ").strip()
    password = getpass("Senha Garmin: ")
    g = Garmin(email=email, password=password, prompt_mfa=lambda: input("Código MFA: ").strip())
    g.login(TOKENSTORE)
    print(f"Login realizado, tokens salvos em {TOKENSTORE}.")
    return g


def fetch_day(g: Garmin, day_iso: str) -> dict:
    return g.connectapi(
        LEADERBOARD_PATH,
        params={
            "start": "1",
            "limit": "999",
            "metricId": "29",
            "startDate": day_iso,
            "endDate": day_iso,
        },
    )


def parse_entries(raw: dict) -> list[dict]:
    out = []
    for stat in raw.get("userStats", []):
        if stat.get("allPrivate"):
            continue
        out.append(
            {
                "id": str(stat["userProfilePk"]),
                "steps": int(stat.get("totalValue", 0) or 0),
            }
        )
    return out


def load_names() -> dict[str, str]:
    if NAMES_FILE.exists():
        data = json.loads(NAMES_FILE.read_text())
        return {k: v for k, v in data.items() if not k.startswith("_")}
    # Fallback: repo-bundled names.json one level up
    fallback = Path(__file__).parent.parent / "names.json"
    if fallback.exists():
        data = json.loads(fallback.read_text())
        return {k: v for k, v in data.items() if not k.startswith("_")}
    return {}


def upsert_users(conn: sqlite3.Connection, names: dict[str, str], profile_pks: list[str]):
    now = int(time.time())
    for pk in profile_pks:
        name = names.get(pk, f"User {pk}")
        group = "familia" if pk in FAMILY_IDS else "amigos"
        conn.execute(
            """INSERT INTO users(profile_pk, name, group_name, created_at)
               VALUES(?, ?, ?, ?)
               ON CONFLICT(profile_pk) DO UPDATE SET name=excluded.name, group_name=excluded.group_name""",
            (pk, name, group, now),
        )


def upsert_day(conn: sqlite3.Connection, day_iso: str, entries: list[dict]):
    now = int(time.time())
    for e in entries:
        conn.execute(
            """INSERT INTO daily_steps(profile_pk, date, steps, captured_at)
               VALUES(?, ?, ?, ?)
               ON CONFLICT(profile_pk, date) DO UPDATE SET steps=excluded.steps, captured_at=excluded.captured_at""",
            (e["id"], day_iso, e["steps"], now),
        )


def collect(g: Garmin, conn: sqlite3.Connection, names: dict[str, str], days: list[str]):
    for day_iso in days:
        try:
            raw = fetch_day(g, day_iso)
            entries = parse_entries(raw)
            upsert_users(conn, names, [e["id"] for e in entries])
            upsert_day(conn, day_iso, entries)
            conn.commit()
            top = max(entries, key=lambda e: e["steps"]) if entries else None
            top_str = f", top: {top['steps']:,}" if top else ""
            print(f"  {day_iso}: {len(entries)} users{top_str}")
        except Exception as e:
            print(f"  {day_iso}: erro {e}")
        time.sleep(1)


def days_to_collect(since: str | None, lookback: int) -> list[str]:
    if since:
        d = date.fromisoformat(since)
        end = date.today()
        n = (end - d).days
        return [(d + timedelta(days=i)).isoformat() for i in range(n + 1)]
    today = date.today()
    days = [(today - timedelta(days=i)).isoformat() for i in range(lookback + 1)]
    days.reverse()
    return days


def main():
    parser = argparse.ArgumentParser(description="Coleta passos diários do Garmin")
    parser.add_argument("--since", type=str, help="Backfill desde YYYY-MM-DD")
    parser.add_argument(
        "--lookback-days",
        type=int,
        default=int(os.environ.get("LOOKBACK_DAYS", "2")),
        help="Quantos dias anteriores a hoje recoletar a cada rodada",
    )
    parser.add_argument("--loop", action="store_true", help="Continuar rodando a cada INTERVAL_SECONDS")
    args = parser.parse_args()

    conn = open_db()
    g = login()
    names = load_names()

    def run_once():
        days = days_to_collect(args.since, args.lookback_days)
        print(f"[{datetime.now().isoformat(timespec='seconds')}] Coletando {len(days)} dia(s)...")
        collect(g, conn, names, days)

    run_once()

    if args.loop:
        interval = int(os.environ.get("INTERVAL_SECONDS", "21600"))
        # --since is a one-shot backfill flag; subsequent loop iterations only
        # need the rolling lookback window.
        args.since = None
        while True:
            print(f"Aguardando {interval}s...")
            time.sleep(interval)
            try:
                run_once()
            except Exception as e:
                print(f"Erro no loop: {e}", file=sys.stderr)
                time.sleep(60)


if __name__ == "__main__":
    main()
