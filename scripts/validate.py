"""
Schema validation + sanity checks on tokens.json and stats.json.

Exit code 0 = valid, 1 = validation failures (blocks auto-commit).
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import structlog

from config import DATA_DIR, OUTLIER_TICKERS

log = structlog.get_logger()

EXPECTED_TOKEN_COUNT = 118
REQUIRED_FIELDS = ["ticker", "name", "starting_fdv", "starting_mc", "half"]
VALID_CATEGORIES = {
    "DeFi", "Infra", "AI", "Gaming", "L1", "L2",
    "Consumer", "Social", "RWA", "DeSci",
    "Perp DEX", "Stablecoin", "Data", "Other",
}
VALID_TIERS = {"mega", "large", "mid", "small"}
VALID_HALVES = {"H1", "H2"}


def validate_tokens(tokens: list[dict]) -> list[str]:
    """Run all validation checks. Returns list of errors."""
    errors = []

    # 1. Token count
    if len(tokens) != EXPECTED_TOKEN_COUNT:
        errors.append(f"Expected {EXPECTED_TOKEN_COUNT} tokens, got {len(tokens)}")

    # 2. Duplicate tickers
    tickers = [t["ticker"] for t in tokens]
    seen = set()
    dupes = set()
    for t in tickers:
        if t in seen:
            dupes.add(t)
        seen.add(t)
    if dupes:
        errors.append(f"Duplicate tickers: {dupes}")

    for token in tokens:
        ticker = token.get("ticker", "UNKNOWN")

        # 3. Required fields
        for field in REQUIRED_FIELDS:
            if field not in token or token[field] is None:
                errors.append(f"{ticker}: Missing required field '{field}'")

        # 4. Negative FDV
        if token.get("starting_fdv") is not None and token["starting_fdv"] < 0:
            errors.append(f"{ticker}: Negative starting_fdv ({token['starting_fdv']})")

        if token.get("current_fdv") is not None and token["current_fdv"] < 0:
            errors.append(f"{ticker}: Negative current_fdv ({token['current_fdv']})")

        # 5. Valid category
        cat = token.get("category", "Other")
        if cat not in VALID_CATEGORIES:
            errors.append(f"{ticker}: Invalid category '{cat}'")

        # 6. Valid half
        half = token.get("half")
        if half and half not in VALID_HALVES:
            errors.append(f"{ticker}: Invalid half '{half}'")

        # 7. Valid FDV tier
        tier = token.get("fdv_tier")
        if tier and tier not in VALID_TIERS:
            errors.append(f"{ticker}: Invalid fdv_tier '{tier}'")

        # 8. FDV change cross-check
        if (
            token.get("current_fdv") is not None
            and token.get("starting_fdv")
            and token["starting_fdv"] > 0
            and token.get("fdv_change_pct") is not None
        ):
            computed = (token["current_fdv"] - token["starting_fdv"]) / token["starting_fdv"] * 100
            diff = abs(computed - token["fdv_change_pct"])
            if diff > 1.0:
                errors.append(
                    f"{ticker}: fdv_change_pct mismatch — "
                    f"stored={token['fdv_change_pct']:.2f}%, computed={computed:.2f}%"
                )

        # 9. Outlier detection (warning, not error)
        if token.get("fdv_change_pct") is not None and abs(token["fdv_change_pct"]) > 500:
            if ticker not in OUTLIER_TICKERS:
                log.warning(
                    "potential_outlier",
                    ticker=ticker,
                    fdv_change_pct=token["fdv_change_pct"],
                )

        # 10. Volume sanity
        if token.get("volume_24h") is not None and token["volume_24h"] < 0:
            errors.append(f"{ticker}: Negative volume_24h ({token['volume_24h']})")

    return errors


def validate_stats(stats: dict) -> list[str]:
    """Validate stats.json structure."""
    errors = []

    required_keys = [
        "total_tokens", "launched_tokens", "green_count", "red_count",
        "green_pct", "median_fdv_change", "by_category", "by_fdv_tier",
        "last_updated",
    ]

    for key in required_keys:
        if key not in stats:
            errors.append(f"stats.json: Missing key '{key}'")

    # Green + red should roughly equal launched (excluding tokens without fdv_change_pct)
    green = stats.get("green_count", 0)
    red = stats.get("red_count", 0)
    total = green + red
    launched = stats.get("launched_tokens", 0)

    if total > 0 and launched > 0:
        pct = stats.get("green_pct", 0)
        expected_pct = round(green / total * 100, 1)
        if abs(pct - expected_pct) > 0.2:
            errors.append(
                f"stats.json: green_pct mismatch — "
                f"stored={pct}%, computed={expected_pct}%"
            )

    return errors


def main() -> None:
    tokens_path = DATA_DIR / "tokens.json"
    stats_path = DATA_DIR / "stats.json"

    all_errors = []

    # Validate tokens
    if tokens_path.exists():
        with open(tokens_path) as f:
            tokens = json.load(f)
        token_errors = validate_tokens(tokens)
        all_errors.extend(token_errors)
        log.info("tokens_validated", count=len(tokens), errors=len(token_errors))
    else:
        all_errors.append(f"tokens.json not found at {tokens_path}")

    # Validate stats
    if stats_path.exists():
        with open(stats_path) as f:
            stats = json.load(f)
        stats_errors = validate_stats(stats)
        all_errors.extend(stats_errors)
        log.info("stats_validated", errors=len(stats_errors))
    else:
        log.warning("stats_not_found", path=str(stats_path))

    # Report
    if all_errors:
        for error in all_errors:
            log.error("validation_error", message=error)
        log.error("validation_failed", total_errors=len(all_errors))
        sys.exit(1)
    else:
        log.info("validation_passed")
        sys.exit(0)


if __name__ == "__main__":
    main()
