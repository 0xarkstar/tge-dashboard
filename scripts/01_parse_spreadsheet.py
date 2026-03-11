"""
Step 01: Parse the TGE spreadsheet CSV into base_tokens.json.

Input:  seed/tge_spreadsheet.csv
Output: data/base_tokens.json
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

# Add scripts dir to path for imports
sys.path.insert(0, str(Path(__file__).parent))

import structlog

from config import DATA_DIR, SEED_DIR, CATEGORY_OVERRIDES, COINGECKO_ID_OVERRIDES
from utils import parse_spreadsheet_csv

log = structlog.get_logger()


def load_verified_seed() -> dict[str, dict]:
    """Load the 28 manually verified tokens as a seed lookup."""
    seed_path = SEED_DIR / "tge_2025_verified.json"
    if not seed_path.exists():
        return {}
    with open(seed_path) as f:
        tokens = json.load(f)
    return {t["symbol"]: t for t in tokens}


def enrich_with_seed(tokens: list[dict], seed: dict[str, dict]) -> list[dict]:
    """Merge seed data (category, chain, tge_date, VC, coingecko_id) into parsed tokens."""
    enriched = []
    for token in tokens:
        ticker = token["ticker"]
        row = dict(token)

        # CoinGecko ID: override > seed > null
        if ticker in COINGECKO_ID_OVERRIDES:
            row["coingecko_id"] = COINGECKO_ID_OVERRIDES[ticker]
        elif ticker in seed and seed[ticker].get("coingecko_id"):
            row["coingecko_id"] = seed[ticker]["coingecko_id"]
        else:
            row["coingecko_id"] = None

        # Category: override > seed > Other
        if ticker in CATEGORY_OVERRIDES:
            row["category"] = CATEGORY_OVERRIDES[ticker]
        elif ticker in seed and seed[ticker].get("category"):
            row["category"] = seed[ticker]["category"]
        else:
            row["category"] = "Other"

        # Chain: seed > unknown
        if ticker in seed and seed[ticker].get("chain"):
            row["chain"] = seed[ticker]["chain"]
        else:
            row["chain"] = "unknown"

        # TGE date: seed > null
        if ticker in seed and seed[ticker].get("tge_date"):
            row["tge_date"] = seed[ticker]["tge_date"]
        else:
            row["tge_date"] = None

        # VC data: seed > null
        if ticker in seed:
            vc_raised = seed[ticker].get("vc_total_raised", 0)
            if vc_raised and vc_raised > 0:
                row["vc_total_raised"] = vc_raised
                investors_str = seed[ticker].get("lead_investors", "")
                row["lead_investors"] = [
                    inv.strip()
                    for inv in investors_str.split(",")
                    if inv.strip() and inv.strip() != "Unknown"
                ]
                row["vc_data_source"] = "manual"
            else:
                row["vc_total_raised"] = None
                row["lead_investors"] = []
                row["vc_data_source"] = None
        else:
            row["vc_total_raised"] = None
            row["lead_investors"] = []
            row["vc_data_source"] = None

        enriched.append(row)

    return enriched


def validate_parsed_data(tokens: list[dict]) -> list[str]:
    """Run basic validation on parsed data. Returns list of warnings."""
    warnings = []

    if len(tokens) != 118:
        warnings.append(f"Expected 118 tokens, got {len(tokens)}")

    tickers = [t["ticker"] for t in tokens]
    if len(tickers) != len(set(tickers)):
        dupes = [t for t in tickers if tickers.count(t) > 1]
        warnings.append(f"Duplicate tickers: {set(dupes)}")

    for token in tokens:
        # Cross-check fdv_change_pct
        if token.get("current_fdv") and token["starting_fdv"] > 0:
            computed = (token["current_fdv"] - token["starting_fdv"]) / token["starting_fdv"] * 100
            spreadsheet_val = token.get("fdv_change_pct_spreadsheet")
            if spreadsheet_val is not None:
                diff = abs(computed - spreadsheet_val)
                if diff > 1.0:
                    warnings.append(
                        f"{token['ticker']}: FDV change mismatch - "
                        f"computed={computed:.2f}%, spreadsheet={spreadsheet_val:.2f}%"
                    )

        if token["starting_fdv"] < 0:
            warnings.append(f"{token['ticker']}: Negative starting FDV")

    return warnings


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    # Parse CSV
    csv_path = SEED_DIR / "tge_spreadsheet.csv"
    tokens = parse_spreadsheet_csv(csv_path)

    if not tokens:
        log.error("no_tokens_parsed")
        sys.exit(1)

    # Load seed data
    seed = load_verified_seed()
    log.info("seed_loaded", count=len(seed))

    # Enrich with seed
    tokens = enrich_with_seed(tokens, seed)

    # Validate
    warnings = validate_parsed_data(tokens)
    for w in warnings:
        log.warning("validation", message=w)

    # Save
    output_path = DATA_DIR / "base_tokens.json"
    with open(output_path, "w") as f:
        json.dump(tokens, f, indent=2, ensure_ascii=False)

    log.info(
        "base_tokens_saved",
        count=len(tokens),
        with_coingecko_id=sum(1 for t in tokens if t.get("coingecko_id")),
        with_category=sum(1 for t in tokens if t.get("category") != "Other"),
        with_vc_data=sum(1 for t in tokens if t.get("vc_total_raised")),
        warnings=len(warnings),
        path=str(output_path),
    )


if __name__ == "__main__":
    main()
