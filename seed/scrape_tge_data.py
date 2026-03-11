"""
2025 TGE Data Scraper - CryptoRank + CoinGecko
================================================
CryptoRank에서 2025년 VC 펀드레이징 데이터를 가져오고,
CoinGecko에서 현재 가격/FDV/유통량을 보충합니다.

사용법:
  pip install requests pandas aiohttp --break-system-packages
  python scrape_tge_data.py

출력:
  - tge_2025_full.csv        (전체 데이터셋)
  - tge_2025_full.json       (JSON 포맷)
  - tge_2025_dune_cte.sql    (Dune 쿼리용 CTE)
"""

import requests
import json
import time
import csv
import os
from datetime import datetime, timedelta
from typing import Optional

# ============================================================
# CoinGecko Free API (rate limit: ~10-30 req/min)
# ============================================================
COINGECKO_BASE = "https://api.coingecko.com/api/v3"

def coingecko_search(query: str) -> Optional[str]:
    """CoinGecko에서 토큰 검색 → coingecko_id 반환"""
    try:
        resp = requests.get(f"{COINGECKO_BASE}/search", params={"query": query}, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            coins = data.get("coins", [])
            if coins:
                return coins[0]["id"]
    except Exception as e:
        print(f"    Search error: {e}")
    return None

def coingecko_coin_data(coin_id: str) -> Optional[dict]:
    """CoinGecko에서 토큰 상세 데이터"""
    try:
        resp = requests.get(
            f"{COINGECKO_BASE}/coins/{coin_id}",
            params={
                "localization": "false",
                "tickers": "false",
                "community_data": "false",
                "developer_data": "false",
            },
            timeout=15
        )
        if resp.status_code == 429:
            print("    Rate limited, waiting 65s...")
            time.sleep(65)
            return coingecko_coin_data(coin_id)  # retry
        if resp.status_code != 200:
            return None
        
        data = resp.json()
        md = data.get("market_data", {})
        
        return {
            "coingecko_id": coin_id,
            "current_price_usd": md.get("current_price", {}).get("usd"),
            "market_cap_usd": md.get("market_cap", {}).get("usd"),
            "fdv_usd": md.get("fully_diluted_valuation", {}).get("usd"),
            "total_volume_24h": md.get("total_volume", {}).get("usd"),
            "circulating_supply": md.get("circulating_supply"),
            "total_supply": md.get("total_supply"),
            "max_supply": md.get("max_supply"),
            "ath_usd": md.get("ath", {}).get("usd"),
            "ath_date": md.get("ath_date", {}).get("usd"),
            "atl_usd": md.get("atl", {}).get("usd"),
            "atl_date": md.get("atl_date", {}).get("usd"),
            "price_change_7d": md.get("price_change_percentage_7d"),
            "price_change_30d": md.get("price_change_percentage_30d"),
            # Contract addresses
            "platforms": data.get("platforms", {}),
        }
    except Exception as e:
        print(f"    Coin data error: {e}")
        return None


def coingecko_market_chart(coin_id: str, days: int = 180) -> Optional[list]:
    """가격 히스토리 (일별)"""
    try:
        resp = requests.get(
            f"{COINGECKO_BASE}/coins/{coin_id}/market_chart",
            params={"vs_currency": "usd", "days": days, "interval": "daily"},
            timeout=15
        )
        if resp.status_code == 200:
            return resp.json().get("prices", [])
    except:
        pass
    return None


# ============================================================
# CryptoRank Public Data (웹 스크래핑 대안)
# ============================================================
# CryptoRank에는 공식 무료 API가 없지만,
# 아래 엔드포인트로 기본 데이터를 가져올 수 있음

def fetch_cryptorank_funding_rounds() -> list:
    """
    CryptoRank의 펀딩 라운드 데이터를 가져옵니다.
    참고: CryptoRank API는 유료이므로 ($99/month),
    대안으로 공개 데이터를 활용합니다.
    
    실제 사용 시:
    - CryptoRank API 키가 있으면: https://api.cryptorank.io/v2/fundraising-rounds
    - 없으면: 수동 데이터 + CoinGecko로 보충
    """
    
    CRYPTORANK_API_KEY = os.environ.get("CRYPTORANK_API_KEY", "")
    
    if CRYPTORANK_API_KEY:
        try:
            resp = requests.get(
                "https://api.cryptorank.io/v2/fundraising-rounds",
                params={
                    "api_key": CRYPTORANK_API_KEY,
                    "limit": 200,
                    "dateFrom": "2025-01-01",
                    "dateTo": "2025-12-31",
                },
                timeout=15
            )
            if resp.status_code == 200:
                return resp.json().get("data", [])
        except Exception as e:
            print(f"CryptoRank API error: {e}")
    
    print("⚠️  CryptoRank API key not found.")
    print("   Set CRYPTORANK_API_KEY env var for full data.")
    print("   Falling back to manual dataset + CoinGecko enrichment.\n")
    return []


# ============================================================
# 수동 데이터셋 (검증된 VC-backed TGE 목록)
# ============================================================
from tge_2025_token_list import TGE_2025_TOKENS


# ============================================================
# Main Pipeline
# ============================================================
def enrich_with_coingecko(tokens: list) -> list:
    """CoinGecko에서 현재 시장 데이터로 보강"""
    enriched = []
    
    for i, token in enumerate(tokens):
        print(f"\n[{i+1}/{len(tokens)}] {token['name']} ({token['symbol']})")
        
        row = dict(token)  # copy
        
        # CoinGecko ID 찾기
        cg_id = token.get("coingecko_id")
        if not cg_id:
            print(f"  Searching CoinGecko for '{token['name']}'...")
            cg_id = coingecko_search(token["name"])
            if cg_id:
                print(f"  Found: {cg_id}")
            else:
                print(f"  ✗ Not found on CoinGecko")
                enriched.append(row)
                continue
        
        # 상세 데이터 가져오기
        print(f"  Fetching market data...")
        data = coingecko_coin_data(cg_id)
        
        if data:
            row["coingecko_id"] = cg_id
            row["live_price"] = data["current_price_usd"]
            row["live_fdv"] = data["fdv_usd"]
            row["live_mcap"] = data["market_cap_usd"]
            row["live_volume_24h"] = data["total_volume_24h"]
            row["live_circ_supply"] = data["circulating_supply"]
            row["live_total_supply"] = data["total_supply"]
            row["ath"] = data["ath_usd"]
            row["atl"] = data["atl_usd"]
            row["platforms"] = json.dumps(data["platforms"])
            
            # 계산
            if data["fdv_usd"] and token.get("tge_fdv"):
                row["live_fdv_change_pct"] = round(
                    (data["fdv_usd"] - token["tge_fdv"]) / token["tge_fdv"] * 100, 2
                )
            
            if data["circulating_supply"] and data["total_supply"] and data["total_supply"] > 0:
                row["float_pct"] = round(data["circulating_supply"] / data["total_supply"] * 100, 2)
            
            price_str = f"${data['current_price_usd']:.4f}" if data['current_price_usd'] else "N/A"
            fdv_str = f"${data['fdv_usd']:,.0f}" if data['fdv_usd'] else "N/A"
            print(f"  ✓ Price: {price_str} | FDV: {fdv_str}")
        else:
            print(f"  ✗ No market data available")
        
        enriched.append(row)
        
        # Rate limit
        time.sleep(2.5)
    
    return enriched


def generate_dune_cte(tokens: list, output_path: str = "tge_2025_dune_cte.sql"):
    """Dune SQL CTE 생성"""
    lines = []
    for t in tokens:
        symbol = t.get("symbol", "?")
        name = t.get("name", "?").replace("'", "''")
        category = t.get("category", "?")
        tge_date = t.get("tge_date", "2025-01-01")
        tge_fdv = int(t.get("tge_fdv") or 0)
        current_fdv = int(t.get("live_fdv") or t.get("current_fdv") or 0)
        vc_raised = int(t.get("vc_total_raised") or 0)
        lead = (t.get("lead_investors") or "Unknown").split(",")[0].strip().replace("'", "''")
        
        lines.append(
            f"    ('{symbol}', '{name}', '{category}', "
            f"TIMESTAMP '{tge_date}', {tge_fdv}, {current_fdv}, {vc_raised}, '{lead}')"
        )
    
    cte = f"""-- Auto-generated Dune CTE for 2025 TGE Analysis
-- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}
-- Tokens: {len(tokens)}

WITH tge_2025 AS (
  SELECT * FROM (VALUES
{',\\n'.join(lines)}
  ) AS t(symbol, name, category, tge_date, tge_fdv, current_fdv, vc_raised, lead_investor)
)

-- === Query 1: Full overview ===
SELECT
  symbol,
  name,
  category,
  tge_date,
  tge_fdv / 1e6 AS tge_fdv_m,
  current_fdv / 1e6 AS current_fdv_m,
  vc_raised / 1e6 AS vc_raised_m,
  lead_investor,
  ROUND((current_fdv - tge_fdv) * 100.0 / NULLIF(tge_fdv, 0), 1) AS fdv_change_pct,
  CASE WHEN current_fdv >= tge_fdv THEN '🟢' ELSE '🔴' END AS status
FROM tge_2025
WHERE tge_fdv > 0
ORDER BY tge_fdv DESC
"""
    
    with open(output_path, "w") as f:
        f.write(cte)
    print(f"✓ Dune CTE saved to {output_path}")


def save_results(tokens: list):
    """CSV + JSON 저장"""
    # JSON
    with open("tge_2025_full.json", "w") as f:
        json.dump(tokens, f, indent=2, default=str, ensure_ascii=False)
    print(f"✓ JSON saved: tge_2025_full.json ({len(tokens)} tokens)")
    
    # CSV
    if tokens:
        keys = set()
        for t in tokens:
            keys.update(t.keys())
        keys = sorted(keys)
        
        with open("tge_2025_full.csv", "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=keys, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(tokens)
        print(f"✓ CSV saved: tge_2025_full.csv")


def print_summary(tokens: list):
    """결과 요약 출력"""
    print("\n" + "=" * 70)
    print("2025 TGE VC-BACKED TOKEN ANALYSIS")
    print("=" * 70)
    
    vc_backed = [t for t in tokens if (t.get("vc_total_raised") or 0) > 0]
    total_vc = sum(t.get("vc_total_raised", 0) for t in tokens)
    
    with_fdv = [t for t in tokens if t.get("tge_fdv") and (t.get("live_fdv") or t.get("current_fdv"))]
    
    green = [t for t in with_fdv 
             if (t.get("live_fdv") or t.get("current_fdv", 0)) >= t["tge_fdv"]]
    
    changes = []
    for t in with_fdv:
        cur = t.get("live_fdv") or t.get("current_fdv", 0)
        if cur and t["tge_fdv"]:
            changes.append((cur - t["tge_fdv"]) / t["tge_fdv"] * 100)
    
    print(f"\nTotal tokens:        {len(tokens)}")
    print(f"VC-backed:           {len(vc_backed)}")
    print(f"Total VC raised:     ${total_vc / 1e6:,.1f}M")
    print(f"With FDV data:       {len(with_fdv)}")
    print(f"Green (above TGE):   {len(green)} ({len(green)/max(len(with_fdv),1)*100:.1f}%)")
    
    if changes:
        changes.sort()
        median = changes[len(changes)//2]
        print(f"Median FDV change:   {median:+.1f}%")
    
    print(f"\n{'Symbol':<10} {'Name':<22} {'Cat':<8} {'TGE FDV':>12} {'Cur FDV':>12} {'Change':>8} {'VC Raised':>10}")
    print("-" * 90)
    
    for t in sorted(with_fdv, key=lambda x: x.get("tge_fdv", 0), reverse=True):
        cur = t.get("live_fdv") or t.get("current_fdv", 0)
        chg = (cur - t["tge_fdv"]) / t["tge_fdv"] * 100 if t["tge_fdv"] else 0
        vc = t.get("vc_total_raised", 0)
        
        print(f"{t['symbol']:<10} {t['name'][:21]:<22} {t['category']:<8} "
              f"${t['tge_fdv']/1e6:>9.1f}M ${cur/1e6:>9.1f}M {chg:>+7.1f}% "
              f"${vc/1e6:>7.1f}M")


# ============================================================
# Entry Point
# ============================================================
def main():
    print("=" * 70)
    print("2025 TGE Data Pipeline")
    print("CryptoRank + CoinGecko → Dune Analytics")
    print("=" * 70)
    
    # Step 1: CryptoRank에서 추가 데이터 시도
    cr_data = fetch_cryptorank_funding_rounds()
    
    # Step 2: 기본 토큰 리스트
    tokens = list(TGE_2025_TOKENS)
    print(f"\nBase dataset: {len(tokens)} tokens")
    
    # Step 3: CoinGecko로 보강
    print("\n--- Enriching with CoinGecko live data ---")
    enriched = enrich_with_coingecko(tokens)
    
    # Step 4: 결과 저장
    save_results(enriched)
    
    # Step 5: Dune CTE 생성
    generate_dune_cte(enriched)
    
    # Step 6: 요약
    print_summary(enriched)
    
    print("\n✅ Pipeline complete!")
    print("Next steps:")
    print("  1. Copy tge_2025_dune_cte.sql → Dune 'New Query' → Run")
    print("  2. Save query → Add to dashboard")
    print("  3. For full 118 tokens: get CryptoRank API ($99/mo)")
    print("     export CRYPTORANK_API_KEY='your-key' && python scrape_tge_data.py")


if __name__ == "__main__":
    main()
