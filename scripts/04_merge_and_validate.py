"""
Step 04: Merge all data sources into final tokens.json + stats.json.

Input:  data/enriched_tokens.json, data/vc_data.json
Output: data/tokens.json, data/stats.json
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import structlog

from config import DATA_DIR, FDV_TIERS, OUTLIER_TICKERS
from utils import compute_median

log = structlog.get_logger()


def merge_vc_data(tokens: list[dict], vc_data: list[dict]) -> list[dict]:
    """Merge VC data into token records."""
    vc_lookup = {v["ticker"]: v for v in vc_data}
    merged = []

    for token in tokens:
        row = dict(token)
        ticker = token["ticker"]

        if ticker in vc_lookup:
            vc = vc_lookup[ticker]
            if vc.get("vc_total_raised"):
                row["vc_total_raised"] = vc["vc_total_raised"]
                row["lead_investors"] = vc.get("lead_investors", [])
                row["vc_data_source"] = vc.get("vc_data_source")

        # Compute derived fields
        if row.get("starting_fdv") and row["starting_fdv"] > 0:
            row["initial_circ_ratio"] = round(
                row.get("starting_mc", 0) / row["starting_fdv"], 4
            )

            if row.get("current_fdv"):
                row["fdv_change_pct"] = round(
                    (row["current_fdv"] - row["starting_fdv"]) / row["starting_fdv"] * 100,
                    2,
                )
            else:
                row["fdv_change_pct"] = row.get("fdv_change_pct_spreadsheet")

            # FDV tier
            if row["starting_fdv"] >= FDV_TIERS["mega"]:
                row["fdv_tier"] = "mega"
            elif row["starting_fdv"] >= FDV_TIERS["large"]:
                row["fdv_tier"] = "large"
            elif row["starting_fdv"] >= FDV_TIERS["mid"]:
                row["fdv_tier"] = "mid"
            else:
                row["fdv_tier"] = "small"
        else:
            row["initial_circ_ratio"] = None
            row["fdv_change_pct"] = None
            row["fdv_tier"] = "small"

        # Performance status
        pct = row.get("fdv_change_pct")
        row["performance_status"] = "green" if pct is not None and pct >= 0 else "red"

        # Illiquid flag
        vol = row.get("volume_24h")
        row["is_illiquid"] = vol is None or vol < 10_000

        # Status
        row["status"] = row.get("status", "launched")

        # Timestamp
        row["last_updated"] = datetime.now(timezone.utc).isoformat()

        # Clean up intermediate fields
        row.pop("fdv_change_pct_spreadsheet", None)

        merged.append(row)

    return merged


def compute_stats(tokens: list[dict]) -> dict:
    """Compute aggregate dashboard statistics."""
    now = datetime.now(timezone.utc).isoformat()

    # Filter out outliers for aggregate stats
    non_outlier = [t for t in tokens if t["ticker"] not in OUTLIER_TICKERS]
    launched = [t for t in non_outlier if t.get("status") == "launched"]

    changes = [t["fdv_change_pct"] for t in launched if t.get("fdv_change_pct") is not None]
    green = [c for c in changes if c >= 0]
    red = [c for c in changes if c < 0]

    # Category stats
    by_category: dict[str, dict] = {}
    for token in launched:
        cat = token.get("category", "Other")
        if cat not in by_category:
            by_category[cat] = {"changes": [], "vc_raised": 0.0, "count": 0}
        by_category[cat]["count"] += 1
        if token.get("fdv_change_pct") is not None:
            by_category[cat]["changes"].append(token["fdv_change_pct"])
        if token.get("vc_total_raised"):
            by_category[cat]["vc_raised"] += token["vc_total_raised"]

    category_stats = {}
    for cat, data in by_category.items():
        cat_changes = data["changes"]
        cat_green = [c for c in cat_changes if c >= 0]
        category_stats[cat] = {
            "count": data["count"],
            "median_change": compute_median(cat_changes),
            "avg_change": round(sum(cat_changes) / len(cat_changes), 2) if cat_changes else 0.0,
            "pct_green": round(len(cat_green) / len(cat_changes) * 100, 1) if cat_changes else 0.0,
            "total_vc_raised": data["vc_raised"],
        }

    # FDV tier stats
    tier_ranges = {
        "mega": f"≥${FDV_TIERS['mega'] / 1e6:.0f}M",
        "large": f"${FDV_TIERS['large'] / 1e6:.0f}M–${FDV_TIERS['mega'] / 1e6:.0f}M",
        "mid": f"${FDV_TIERS['mid'] / 1e6:.0f}M–${FDV_TIERS['large'] / 1e6:.0f}M",
        "small": f"<${FDV_TIERS['mid'] / 1e6:.0f}M",
    }

    by_tier: dict[str, dict] = {}
    for token in launched:
        tier = token.get("fdv_tier", "small")
        if tier not in by_tier:
            by_tier[tier] = {"changes": [], "starting_fdvs": [], "count": 0}
        by_tier[tier]["count"] += 1
        by_tier[tier]["starting_fdvs"].append(token["starting_fdv"])
        if token.get("fdv_change_pct") is not None:
            by_tier[tier]["changes"].append(token["fdv_change_pct"])

    tier_stats = {}
    for tier in ["mega", "large", "mid", "small"]:
        data = by_tier.get(tier, {"changes": [], "starting_fdvs": [], "count": 0})
        tier_changes = data["changes"]
        tier_green = [c for c in tier_changes if c >= 0]
        tier_stats[tier] = {
            "range_label": tier_ranges[tier],
            "count": data["count"],
            "median_starting_fdv": compute_median(data["starting_fdvs"]),
            "median_change": compute_median(tier_changes),
            "pct_green": round(len(tier_green) / len(tier_changes) * 100, 1) if tier_changes else 0.0,
        }

    total_vc = sum(t.get("vc_total_raised", 0) or 0 for t in launched)
    vc_coverage = sum(1 for t in tokens if t.get("vc_total_raised"))

    return {
        "total_tokens": len(tokens),
        "launched_tokens": len(launched),
        "green_count": len(green),
        "red_count": len(red),
        "green_pct": round(len(green) / len(changes) * 100, 1) if changes else 0.0,
        "median_fdv_change": compute_median(changes),
        "total_vc_raised": total_vc,
        "vc_data_coverage": vc_coverage,
        "by_category": category_stats,
        "by_fdv_tier": tier_stats,
        "outliers": OUTLIER_TICKERS,
        "last_updated": now,
    }


def main() -> None:
    enriched_path = DATA_DIR / "enriched_tokens.json"
    vc_path = DATA_DIR / "vc_data.json"
    tokens_path = DATA_DIR / "tokens.json"
    stats_path = DATA_DIR / "stats.json"

    base_path = DATA_DIR / "base_tokens.json"

    if enriched_path.exists():
        log.info("using_enriched", path=str(enriched_path))
        with open(enriched_path) as f:
            tokens = json.load(f)
    elif base_path.exists():
        log.info("using_base_fallback", path=str(base_path))
        with open(base_path) as f:
            tokens = json.load(f)
    else:
        log.error("no_token_data_found", enriched=str(enriched_path), base=str(base_path))
        sys.exit(1)

    # Load VC data if available
    vc_data = []
    if vc_path.exists():
        with open(vc_path) as f:
            vc_data = json.load(f)

    # Merge
    merged = merge_vc_data(tokens, vc_data)

    # Compute stats
    stats = compute_stats(merged)

    # Save tokens.json
    with open(tokens_path, "w") as f:
        json.dump(merged, f, indent=2, ensure_ascii=False)

    # Save stats.json
    with open(stats_path, "w") as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)

    log.info(
        "merge_complete",
        tokens=len(merged),
        green=stats["green_count"],
        red=stats["red_count"],
        green_pct=stats["green_pct"],
        median_change=stats["median_fdv_change"],
        vc_coverage=stats["vc_data_coverage"],
        tokens_path=str(tokens_path),
        stats_path=str(stats_path),
    )


if __name__ == "__main__":
    main()
