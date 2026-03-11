"""
Lightweight price refresh using CoinGecko /simple/price (1 API call).

Input:  data/tokens.json
Output: data/tokens.json (updated in-place), data/stats.json (recomputed)

Designed for frequent runs (every 2 hours via GitHub Actions).
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import structlog

from config import DATA_DIR, FDV_TIERS, OUTLIER_TICKERS
from utils import coingecko_get, compute_median

log = structlog.get_logger()


def batch_fetch_prices(cg_ids: list[str]) -> dict[str, dict]:
    """Fetch prices for multiple tokens in one API call."""
    if not cg_ids:
        return {}

    # /simple/price supports up to 250 IDs per call
    results = {}
    batch_size = 250

    for i in range(0, len(cg_ids), batch_size):
        batch = cg_ids[i:i + batch_size]
        ids_str = ",".join(batch)

        data = coingecko_get("/simple/price", params={
            "ids": ids_str,
            "vs_currencies": "usd",
            "include_market_cap": "true",
            "include_24hr_vol": "true",
        })

        if data:
            results.update(data)
        else:
            log.warning("batch_price_failed", batch_start=i, batch_size=len(batch))

    return results


def update_tokens_with_prices(tokens: list[dict], prices: dict[str, dict]) -> list[dict]:
    """Update token records with fresh price data."""
    now = datetime.now(timezone.utc).isoformat()
    updated = []
    price_updates = 0

    for token in tokens:
        row = dict(token)
        cg_id = row.get("coingecko_id")

        if cg_id and cg_id in prices:
            price_data = prices[cg_id]
            new_price = price_data.get("usd")
            new_mc = price_data.get("usd_market_cap")
            new_vol = price_data.get("usd_24h_vol")

            if new_price is not None:
                row["current_price"] = new_price
            if new_mc is not None and new_mc > 0:
                row["current_mc"] = new_mc
            if new_vol is not None:
                row["volume_24h"] = new_vol

            # Estimate current FDV from price if we have it
            # CoinGecko /simple/price doesn't return FDV directly
            # Keep existing current_fdv unless we get a better source
            row["data_source"] = "live"
            row["last_updated"] = now
            price_updates += 1
        else:
            row["last_updated"] = row.get("last_updated", now)

        # Recompute derived fields
        if row.get("starting_fdv") and row["starting_fdv"] > 0:
            if row.get("current_fdv"):
                row["fdv_change_pct"] = round(
                    (row["current_fdv"] - row["starting_fdv"]) / row["starting_fdv"] * 100,
                    2,
                )
            row["performance_status"] = (
                "green" if row.get("fdv_change_pct") is not None and row["fdv_change_pct"] >= 0
                else "red"
            )

        vol = row.get("volume_24h")
        row["is_illiquid"] = vol is None or vol < 10_000

        updated.append(row)

    log.info("prices_updated", total=len(tokens), updated=price_updates)
    return updated


def recompute_stats(tokens: list[dict]) -> dict:
    """Recompute stats.json from updated tokens."""
    # Import the compute_stats function logic inline to avoid circular deps
    now = datetime.now(timezone.utc).isoformat()
    non_outlier = [t for t in tokens if t["ticker"] not in OUTLIER_TICKERS]
    launched = [t for t in non_outlier if t.get("status") == "launched"]

    changes = [t["fdv_change_pct"] for t in launched if t.get("fdv_change_pct") is not None]
    green = [c for c in changes if c >= 0]

    total_vc = sum(t.get("vc_total_raised", 0) or 0 for t in launched)
    vc_coverage = sum(1 for t in tokens if t.get("vc_total_raised"))

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

    # Tier stats
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

    return {
        "total_tokens": len(tokens),
        "launched_tokens": len(launched),
        "green_count": len(green),
        "red_count": len(changes) - len(green),
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
    tokens_path = DATA_DIR / "tokens.json"
    stats_path = DATA_DIR / "stats.json"

    if not tokens_path.exists():
        log.error("tokens_not_found", path=str(tokens_path))
        sys.exit(1)

    with open(tokens_path) as f:
        tokens = json.load(f)

    # Collect CoinGecko IDs
    cg_ids = [t["coingecko_id"] for t in tokens if t.get("coingecko_id")]
    log.info("fetching_prices", count=len(cg_ids))

    # Batch fetch prices
    prices = batch_fetch_prices(cg_ids)
    log.info("prices_fetched", count=len(prices))

    # Update tokens
    updated = update_tokens_with_prices(tokens, prices)

    # Recompute stats
    stats = recompute_stats(updated)

    # Save
    with open(tokens_path, "w") as f:
        json.dump(updated, f, indent=2, ensure_ascii=False)

    with open(stats_path, "w") as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)

    log.info(
        "price_update_complete",
        tokens=len(updated),
        green_pct=stats["green_pct"],
        median_change=stats["median_fdv_change"],
    )


if __name__ == "__main__":
    main()
