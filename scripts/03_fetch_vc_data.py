"""
Step 03: Fetch VC funding data from DeFiLlama Raises API.

Input:  data/enriched_tokens.json
Output: data/vc_data.json

Matches tokens by name fuzzy matching against DeFiLlama raises.
Manual seed data takes priority over DeFiLlama matches.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import requests
import structlog
from thefuzz import fuzz

from config import DATA_DIR, DEFILLAMA_RAISES_URL

log = structlog.get_logger()

# Minimum fuzzy match score to accept
FUZZY_THRESHOLD = 85


def fetch_raises() -> list[dict]:
    """Fetch all raises from DeFiLlama."""
    try:
        resp = requests.get(DEFILLAMA_RAISES_URL, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        raises = data.get("raises", [])
        log.info("raises_fetched", total=len(raises))
        return raises
    except requests.RequestException as e:
        log.error("raises_fetch_failed", error=str(e))
        return []


def filter_2025_raises(raises: list[dict]) -> list[dict]:
    """Filter raises to 2025 only."""
    filtered = [
        r for r in raises
        if r.get("date") and str(r["date"]).startswith("2025")
        or (isinstance(r.get("date"), (int, float)) and r["date"] >= 1735689600)
    ]
    log.info("raises_filtered_2025", count=len(filtered))
    return filtered


def match_token_to_raises(
    token_name: str,
    token_ticker: str,
    raises: list[dict],
) -> dict | None:
    """Find the best matching raise for a token using fuzzy matching."""
    best_match = None
    best_score = 0

    for raise_entry in raises:
        raise_name = raise_entry.get("name", "")
        if not raise_name:
            continue

        # Exact ticker match (case-insensitive)
        raise_symbol = raise_entry.get("symbol", "")
        if raise_symbol and raise_symbol.upper() == token_ticker.upper():
            return raise_entry

        # Fuzzy name match
        score = fuzz.ratio(token_name.lower(), raise_name.lower())
        if score > best_score and score >= FUZZY_THRESHOLD:
            best_score = score
            best_match = raise_entry

    return best_match


def build_vc_data(tokens: list[dict], raises: list[dict]) -> list[dict]:
    """Match tokens to raises and build VC data records."""
    vc_records = []

    for token in tokens:
        ticker = token["ticker"]
        name = token["name"]
        record = {
            "ticker": ticker,
            "name": name,
        }

        # If token already has manual VC data, preserve it
        if token.get("vc_data_source") == "manual" and token.get("vc_total_raised"):
            record["vc_total_raised"] = token["vc_total_raised"]
            record["lead_investors"] = token.get("lead_investors", [])
            record["vc_data_source"] = "manual"
            vc_records.append(record)
            continue

        # Try DeFiLlama match
        match = match_token_to_raises(name, ticker, raises)
        if match:
            amount = match.get("amount")
            if amount and amount > 0:
                # Convert from millions if needed
                total = amount * 1_000_000 if amount < 10_000 else amount
                investors = match.get("leadInvestors", [])
                investor_names = [
                    inv.get("name", inv) if isinstance(inv, dict) else str(inv)
                    for inv in (investors or [])
                    if inv
                ]

                record["vc_total_raised"] = total
                record["lead_investors"] = investor_names
                record["vc_data_source"] = "defillama"

                # If token also had manual data, mark as "both"
                if token.get("vc_total_raised"):
                    record["vc_data_source"] = "both"

                log.info(
                    "vc_matched",
                    ticker=ticker,
                    source="defillama",
                    raised=total,
                    investors=len(investor_names),
                    match_name=match.get("name"),
                )
                vc_records.append(record)
                continue

        # No match
        record["vc_total_raised"] = token.get("vc_total_raised")
        record["lead_investors"] = token.get("lead_investors", [])
        record["vc_data_source"] = token.get("vc_data_source")
        vc_records.append(record)

    return vc_records


def main() -> None:
    input_path = DATA_DIR / "enriched_tokens.json"
    output_path = DATA_DIR / "vc_data.json"

    if not input_path.exists():
        log.error("input_not_found", path=str(input_path))
        sys.exit(1)

    with open(input_path) as f:
        tokens = json.load(f)

    # Fetch and filter raises
    all_raises = fetch_raises()
    raises_2025 = filter_2025_raises(all_raises)

    # Also use all raises (not just 2025) since some tokens raised earlier
    vc_data = build_vc_data(tokens, all_raises)

    # Save
    with open(output_path, "w") as f:
        json.dump(vc_data, f, indent=2, ensure_ascii=False)

    with_vc = sum(1 for r in vc_data if r.get("vc_total_raised"))
    manual = sum(1 for r in vc_data if r.get("vc_data_source") == "manual")
    defillama = sum(1 for r in vc_data if r.get("vc_data_source") == "defillama")
    both = sum(1 for r in vc_data if r.get("vc_data_source") == "both")

    log.info(
        "vc_data_saved",
        total=len(vc_data),
        with_vc=with_vc,
        manual=manual,
        defillama=defillama,
        both=both,
        path=str(output_path),
    )


if __name__ == "__main__":
    main()
