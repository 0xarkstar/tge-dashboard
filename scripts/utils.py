"""
Shared utilities for TGE Dashboard data pipeline.
"""

from __future__ import annotations

import csv
import time
from pathlib import Path

import requests
import structlog

from config import COINGECKO_BASE, COINGECKO_REQ_PER_MIN, COINGECKO_RETRY_MAX, COINGECKO_RETRY_WAIT

log = structlog.get_logger()


class RateLimiter:
    """Token bucket rate limiter."""

    def __init__(self, calls_per_min: int = COINGECKO_REQ_PER_MIN) -> None:
        self.interval = 60.0 / calls_per_min
        self.last_call = 0.0

    def wait(self) -> None:
        elapsed = time.monotonic() - self.last_call
        if elapsed < self.interval:
            time.sleep(self.interval - elapsed)
        self.last_call = time.monotonic()


_rate_limiter = RateLimiter()


def coingecko_get(endpoint: str, params: dict | None = None, retries: int = COINGECKO_RETRY_MAX) -> dict | list | None:
    """Make a rate-limited GET request to CoinGecko API with retry on 429."""
    url = f"{COINGECKO_BASE}{endpoint}"
    for attempt in range(retries):
        _rate_limiter.wait()
        try:
            resp = requests.get(url, params=params, timeout=15)
            if resp.status_code == 200:
                return resp.json()
            if resp.status_code == 429:
                wait_time = COINGECKO_RETRY_WAIT * (attempt + 1)
                log.warning("rate_limited", endpoint=endpoint, wait=wait_time, attempt=attempt + 1)
                time.sleep(wait_time)
                continue
            log.error("api_error", endpoint=endpoint, status=resp.status_code)
            return None
        except requests.RequestException as e:
            log.error("request_failed", endpoint=endpoint, error=str(e), attempt=attempt + 1)
            if attempt < retries - 1:
                time.sleep(5 * (attempt + 1))
    return None


def parse_dollar_amount(value: str) -> float | None:
    """Parse dollar string like '$59,826,220' to float."""
    if not value or not value.strip():
        return None
    cleaned = value.strip().replace("$", "").replace(",", "").replace("\u200b", "")
    try:
        return float(cleaned)
    except ValueError:
        return None


def parse_percentage(value: str) -> float | None:
    """Parse percentage string like '-93.64%' to float."""
    if not value or not value.strip():
        return None
    cleaned = value.strip().replace("%", "").replace("\u200b", "")
    try:
        return float(cleaned)
    except ValueError:
        return None


def parse_spreadsheet_csv(csv_path: Path) -> list[dict]:
    """Parse the TGE spreadsheet CSV into a list of token dicts."""
    tokens = []
    with open(csv_path, encoding="utf-8") as f:
        reader = csv.reader(f)
        rows = list(reader)

    # Find header row (contains "Ticker")
    header_idx = None
    for i, row in enumerate(rows):
        if len(row) >= 10 and any("Ticker" in cell for cell in row):
            header_idx = i
            break

    if header_idx is None:
        log.error("header_not_found", path=str(csv_path))
        return []

    # Column mapping: empty, Ticker, Name, Current FDV, Current MC, 24H Volume, Remarks, Starting FDV, Starting MC, Change in FDV
    for row in rows[header_idx + 1:]:
        if len(row) < 10:
            continue
        ticker = row[1].strip()
        if not ticker or ticker == "Ticker":
            continue
        # Skip header-like rows
        if "Token Launches" in ticker or "Performance" in ticker:
            continue

        name = row[2].strip()
        if not name:
            continue

        current_fdv = parse_dollar_amount(row[3])
        current_mc = parse_dollar_amount(row[4])
        volume_24h = parse_dollar_amount(row[5])
        remarks = row[6].strip()
        starting_fdv = parse_dollar_amount(row[7])
        starting_mc = parse_dollar_amount(row[8])
        fdv_change = parse_percentage(row[9])

        if starting_fdv is None or starting_fdv <= 0:
            log.warning("skipping_no_starting_fdv", ticker=ticker)
            continue

        half = "H2" if remarks == "H2" else "H1"

        tokens.append({
            "ticker": ticker,
            "name": name,
            "current_fdv": current_fdv,
            "current_mc": current_mc,
            "volume_24h": volume_24h,
            "half": half,
            "starting_fdv": starting_fdv,
            "starting_mc": starting_mc or 0,
            "fdv_change_pct_spreadsheet": fdv_change,
        })

    log.info("csv_parsed", count=len(tokens), path=str(csv_path))
    return tokens


def compute_median(values: list[float]) -> float:
    """Compute median of a list of floats."""
    if not values:
        return 0.0
    sorted_vals = sorted(values)
    n = len(sorted_vals)
    if n % 2 == 1:
        return sorted_vals[n // 2]
    return (sorted_vals[n // 2 - 1] + sorted_vals[n // 2]) / 2
