"""
Fill missing tge_date and vc_total_raised from CoinGecko + DeFiLlama APIs.
Directly updates data/tokens.json.
"""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import requests
import structlog
from thefuzz import fuzz

from config import DATA_DIR, DEFILLAMA_RAISES_URL
from utils import coingecko_get

log = structlog.get_logger()

TOKENS_PATH = DATA_DIR / "tokens.json"


def load_tokens() -> list[dict]:
    with open(TOKENS_PATH) as f:
        return json.load(f)


def save_tokens(tokens: list[dict]) -> None:
    with open(TOKENS_PATH, "w") as f:
        json.dump(tokens, f, indent=2, ensure_ascii=False)


def fetch_defillama_raises() -> list[dict]:
    try:
        resp = requests.get(DEFILLAMA_RAISES_URL, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        raises = data.get("raises", [])
        log.info("defillama_fetched", total=len(raises))
        return raises
    except requests.RequestException as e:
        log.error("defillama_failed", error=str(e))
        return []


def match_raises(token_name: str, token_ticker: str, raises: list[dict]) -> dict | None:
    """Match token to DeFiLlama raises with aggressive matching."""
    best_match = None
    best_score = 0

    # Normalize names for matching
    name_lower = token_name.lower().strip()
    ticker_upper = token_ticker.upper().strip()

    for r in raises:
        raise_name = r.get("name", "")
        raise_symbol = (r.get("symbol") or "").upper().strip()

        # Exact ticker match
        if raise_symbol and raise_symbol == ticker_upper:
            amount = r.get("amount")
            if amount and amount > 0:
                return r

        # Exact name match (case insensitive)
        if raise_name.lower().strip() == name_lower:
            amount = r.get("amount")
            if amount and amount > 0:
                return r

        # Fuzzy match with lower threshold
        if not raise_name:
            continue
        score = fuzz.ratio(name_lower, raise_name.lower())
        if score > best_score and score >= 70:
            amount = r.get("amount")
            if amount and amount > 0:
                best_score = score
                best_match = r

        # Also try partial ratio for substring matches
        partial = fuzz.partial_ratio(name_lower, raise_name.lower())
        if partial > best_score and partial >= 85:
            amount = r.get("amount")
            if amount and amount > 0:
                best_score = partial
                best_match = r

    return best_match


def aggregate_raises(token_name: str, token_ticker: str, raises: list[dict]) -> tuple[float, list[str]]:
    """Find ALL raises for a project and sum them up."""
    total = 0.0
    investors: list[str] = []
    name_lower = token_name.lower().strip()
    ticker_upper = token_ticker.upper().strip()

    for r in raises:
        raise_name = r.get("name", "")
        raise_symbol = (r.get("symbol") or "").upper().strip()

        matched = False
        if raise_symbol and raise_symbol == ticker_upper:
            matched = True
        elif raise_name.lower().strip() == name_lower:
            matched = True
        elif fuzz.ratio(name_lower, raise_name.lower()) >= 80:
            matched = True

        if matched:
            amount = r.get("amount")
            if amount and amount > 0:
                total += amount * 1_000_000 if amount < 10_000 else amount
                for inv in (r.get("leadInvestors") or []):
                    inv_name = inv.get("name", inv) if isinstance(inv, dict) else str(inv)
                    if inv_name and inv_name not in investors:
                        investors.append(inv_name)

    return total, investors


def fill_from_coingecko(tokens: list[dict]) -> int:
    """Fill missing tge_date from CoinGecko genesis_date."""
    filled = 0
    missing = [t for t in tokens if not t.get("tge_date") and t.get("coingecko_id")]

    log.info("coingecko_tge_fetch_start", missing=len(missing))

    for i, token in enumerate(missing):
        cg_id = token["coingecko_id"]
        data = coingecko_get(f"/coins/{cg_id}", params={
            "localization": "false",
            "tickers": "false",
            "market_data": "false",
            "community_data": "false",
            "developer_data": "false",
            "sparkline": "false",
        })

        if data and data.get("genesis_date"):
            token["tge_date"] = data["genesis_date"]
            filled += 1
            log.info("tge_date_filled", ticker=token["ticker"], date=data["genesis_date"])

        # Save checkpoint every 10 tokens
        if (i + 1) % 10 == 0:
            save_tokens(tokens)
            log.info("checkpoint_saved", progress=f"{i+1}/{len(missing)}")

    save_tokens(tokens)
    log.info("coingecko_tge_done", filled=filled, total_missing=len(missing))
    return filled


def fill_from_defillama(tokens: list[dict]) -> int:
    """Fill missing vc_total_raised from DeFiLlama raises."""
    raises = fetch_defillama_raises()
    if not raises:
        return 0

    filled = 0
    missing = [t for t in tokens if not t.get("vc_total_raised") or t["vc_total_raised"] == 0]

    log.info("defillama_vc_fill_start", missing=len(missing), raises_available=len(raises))

    for token in missing:
        total, investors = aggregate_raises(token["name"], token["ticker"], raises)
        if total > 0:
            token["vc_total_raised"] = total
            if investors:
                token["lead_investors"] = investors
            token["vc_data_source"] = "defillama"
            filled += 1
            log.info("vc_filled", ticker=token["ticker"], raised=total, investors=len(investors))

    save_tokens(tokens)
    log.info("defillama_vc_done", filled=filled, total_missing=len(missing))
    return filled


def main() -> None:
    tokens = load_tokens()

    no_date = sum(1 for t in tokens if not t.get("tge_date"))
    no_vc = sum(1 for t in tokens if not t.get("vc_total_raised") or t["vc_total_raised"] == 0)
    log.info("initial_state", total=len(tokens), missing_tge_date=no_date, missing_vc=no_vc)

    # Step 1: DeFiLlama VC data (fast, single API call)
    vc_filled = fill_from_defillama(tokens)

    # Step 2: CoinGecko TGE dates (slow, rate-limited)
    tge_filled = fill_from_coingecko(tokens)

    # Final stats
    tokens = load_tokens()
    still_no_date = sum(1 for t in tokens if not t.get("tge_date"))
    still_no_vc = sum(1 for t in tokens if not t.get("vc_total_raised") or t["vc_total_raised"] == 0)

    log.info(
        "fill_complete",
        tge_filled=tge_filled,
        vc_filled=vc_filled,
        still_missing_tge=still_no_date,
        still_missing_vc=still_no_vc,
    )

    # Print remaining gaps for manual research
    if still_no_date > 0:
        missing_date = [t["ticker"] for t in tokens if not t.get("tge_date")]
        print(f"\n=== STILL MISSING TGE DATE ({still_no_date}) ===")
        print(", ".join(missing_date))

    if still_no_vc > 0:
        missing_vc = [t["ticker"] for t in tokens if not t.get("vc_total_raised") or t["vc_total_raised"] == 0]
        print(f"\n=== STILL MISSING VC DATA ({still_no_vc}) ===")
        print(", ".join(missing_vc))


if __name__ == "__main__":
    main()
