"""
Step 02: Enrich tokens with CoinGecko data (category, chain, ATH/ATL, price).

Input:  data/base_tokens.json
Output: data/enriched_tokens.json

Supports checkpoint/resume — re-run skips already-enriched tokens.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import structlog

from config import COINGECKO_ID_OVERRIDES, DATA_DIR
from utils import coingecko_get

log = structlog.get_logger()


def load_checkpoint(path: Path) -> dict[str, dict]:
    """Load existing enrichment checkpoint."""
    if path.exists():
        with open(path) as f:
            tokens = json.load(f)
        return {t["ticker"]: t for t in tokens}
    return {}


def enrich_token(token: dict) -> dict:
    """Fetch CoinGecko data for a single token and merge."""
    enriched = dict(token)
    cg_id = token.get("coingecko_id")

    if not cg_id:
        enriched["data_source"] = "static"
        return enriched

    data = coingecko_get(f"/coins/{cg_id}", params={
        "localization": "false",
        "tickers": "false",
        "market_data": "true",
        "community_data": "false",
        "developer_data": "false",
        "sparkline": "false",
    })

    if data is None:
        log.warning("coingecko_fetch_failed", ticker=token["ticker"], cg_id=cg_id)
        enriched["data_source"] = "static"
        return enriched

    # Market data
    market = data.get("market_data", {})
    enriched["current_price"] = market.get("current_price", {}).get("usd")
    enriched["current_fdv"] = market.get("fully_diluted_valuation", {}).get("usd") or enriched.get("current_fdv")
    enriched["current_mc"] = market.get("market_cap", {}).get("usd") or enriched.get("current_mc")
    enriched["volume_24h"] = market.get("total_volume", {}).get("usd") or enriched.get("volume_24h")
    enriched["ath"] = market.get("ath", {}).get("usd")
    enriched["atl"] = market.get("atl", {}).get("usd")

    # Chain from platforms
    platforms = data.get("platforms", {})
    if platforms:
        chains = [k for k in platforms if k]
        if chains:
            enriched["chain"] = chains[0]

    # TGE date from genesis_date
    genesis = data.get("genesis_date")
    if genesis and not enriched.get("tge_date"):
        enriched["tge_date"] = genesis

    enriched["data_source"] = "live"

    log.info(
        "enriched",
        ticker=token["ticker"],
        price=enriched.get("current_price"),
        fdv=enriched.get("current_fdv"),
    )
    return enriched


def main() -> None:
    input_path = DATA_DIR / "base_tokens.json"
    output_path = DATA_DIR / "enriched_tokens.json"

    if not input_path.exists():
        log.error("input_not_found", path=str(input_path))
        sys.exit(1)

    with open(input_path) as f:
        tokens = json.load(f)

    # Load checkpoint
    checkpoint = load_checkpoint(output_path)
    log.info("checkpoint_loaded", already_enriched=len(checkpoint))

    enriched = []
    skipped = 0
    fetched = 0

    for token in tokens:
        ticker = token["ticker"]

        # Skip if already enriched and has live data
        if ticker in checkpoint and checkpoint[ticker].get("data_source") == "live":
            enriched.append(checkpoint[ticker])
            skipped += 1
            continue

        result = enrich_token(token)
        enriched.append(result)
        fetched += 1

        # Save checkpoint after each fetch
        if fetched % 5 == 0:
            with open(output_path, "w") as f:
                json.dump(enriched + [t for t in tokens[len(enriched):] if t["ticker"] not in {e["ticker"] for e in enriched}], f, indent=2, ensure_ascii=False)

    # Final save
    with open(output_path, "w") as f:
        json.dump(enriched, f, indent=2, ensure_ascii=False)

    log.info(
        "enrichment_complete",
        total=len(enriched),
        fetched=fetched,
        skipped=skipped,
        live=sum(1 for t in enriched if t.get("data_source") == "live"),
        static=sum(1 for t in enriched if t.get("data_source") == "static"),
        path=str(output_path),
    )


if __name__ == "__main__":
    main()
