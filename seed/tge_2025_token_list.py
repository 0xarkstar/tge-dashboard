"""
2025 VC-Backed TGE Token List - Verified Data
=============================================
Sources: Memento Research, CryptoRank, CoinGecko, ICO Drops, The Block, CryptoSlate
Last updated: 2025-12-20 (Memento data cutoff)

각 필드 설명:
- symbol: 토큰 티커
- name: 프로젝트 이름
- category: 섹터 분류
- tge_date: TGE 날짜
- tge_fdv: TGE 오프닝 FDV (USD)
- current_fdv: 현재 FDV (Memento 기준 2025-12-20)
- vc_total_raised: VC 총 펀드레이징 금액 (USD)
- lead_investors: 리드 투자자
- fdv_change_pct: FDV 변동률 (%)
- total_supply: 총 토큰 공급량
- initial_circ_pct: TGE 시 초기 유통 비율 (%)
- chain: 메인 체인
- coingecko_id: CoinGecko API ID
"""

TGE_2025_TOKENS = [
    # ============================================================
    # Tier 1: $1B+ FDV 런칭 (28개 중 0% 생존, 중앙값 -81%)
    # ============================================================
    {
        "symbol": "XPL", "name": "Plasma", "category": "L1",
        "tge_date": "2025-06-15", "tge_fdv": 12_970_000_000, "current_fdv": 1_310_000_000,
        "vc_total_raised": 0, "lead_investors": "Self-funded",
        "fdv_change_pct": -89.9, "chain": "plasma", "coingecko_id": "plasma-network",
    },
    {
        "symbol": "FF", "name": "Falcon Finance", "category": "DeFi",
        "tge_date": "2025-07-01", "tge_fdv": 6_700_000_000, "current_fdv": 949_700_000,
        "vc_total_raised": 0, "lead_investors": "Unknown",
        "fdv_change_pct": -85.8, "chain": "ethereum", "coingecko_id": "falcon-finance",
    },
    {
        "symbol": "OG", "name": "OG", "category": "Social",
        "tge_date": "2025-05-20", "tge_fdv": 4_900_000_000, "current_fdv": 763_600_000,
        "vc_total_raised": 0, "lead_investors": "Unknown",
        "fdv_change_pct": -84.4, "chain": "ethereum", "coingecko_id": None,
    },
    {
        "symbol": "BERA", "name": "Berachain", "category": "L1",
        "tge_date": "2025-02-06", "tge_fdv": 4_460_000_000, "current_fdv": 305_000_000,
        "vc_total_raised": 142_000_000,
        "lead_investors": "Polychain Capital, Hack VC, Framework Ventures, Brevan Howard Digital",
        "fdv_change_pct": -93.2, "total_supply": 500_000_000, "initial_circ_pct": 21.5,
        "chain": "berachain", "coingecko_id": "berachain-bera",
    },
    {
        "symbol": "IP", "name": "Story Protocol", "category": "Infra",
        "tge_date": "2025-02-13", "tge_fdv": 2_500_000_000, "current_fdv": 1_200_000_000,
        "vc_total_raised": 140_000_000,
        "lead_investors": "a16z, Polychain Capital",
        "fdv_change_pct": -52.0, "total_supply": 1_000_000_000, "initial_circ_pct": 25.0,
        "chain": "story", "coingecko_id": "story-protocol",
    },
    {
        "symbol": "BIO", "name": "Bio Protocol", "category": "DeSci",
        "tge_date": "2025-01-03", "tge_fdv": 2_060_000_000, "current_fdv": 143_000_000,
        "vc_total_raised": 33_000_000,
        "lead_investors": "Binance Labs, 1kx",
        "fdv_change_pct": -93.1, "total_supply": 3_320_000_000, "initial_circ_pct": 8.0,
        "chain": "ethereum", "coingecko_id": "bio-protocol",
    },
    {
        "symbol": "XAN", "name": "Anoma", "category": "Infra",
        "tge_date": "2025-08-01", "tge_fdv": 1_600_000_000, "current_fdv": 156_200_000,
        "vc_total_raised": 57_750_000,
        "lead_investors": "Polychain Capital, Electric Capital",
        "fdv_change_pct": -90.2, "chain": "anoma", "coingecko_id": None,
    },
    {
        "symbol": "PLUME", "name": "Plume Network", "category": "RWA",
        "tge_date": "2025-04-01", "tge_fdv": 1_300_000_000, "current_fdv": 158_000_000,
        "vc_total_raised": 20_000_000,
        "lead_investors": "Haun Ventures, Galaxy Digital",
        "fdv_change_pct": -87.8, "chain": "plume", "coingecko_id": "plume-network",
    },
    {
        "symbol": "WAL", "name": "Walrus", "category": "Infra",
        "tge_date": "2025-03-27", "tge_fdv": 2_000_000_000, "current_fdv": 1_100_000_000,
        "vc_total_raised": 140_000_000,
        "lead_investors": "a16z, Standard Crypto",
        "fdv_change_pct": -45.0, "chain": "sui", "coingecko_id": "walrus-2",
    },
    {
        "symbol": "MON", "name": "Monad", "category": "L1",
        "tge_date": "2025-11-24", "tge_fdv": 2_500_000_000, "current_fdv": None,
        "vc_total_raised": 225_000_000,
        "lead_investors": "Paradigm, Electric Capital",
        "fdv_change_pct": None, "total_supply": 100_000_000_000, "initial_circ_pct": None,
        "chain": "monad", "coingecko_id": "monad",
    },

    # ============================================================
    # Tier 2: $500M - $1B FDV 런칭 (29개 중 3% 생존, 중앙값 -82%)
    # ============================================================
    {
        "symbol": "KAITO", "name": "Kaito AI", "category": "AI",
        "tge_date": "2025-02-20", "tge_fdv": 1_200_000_000, "current_fdv": 350_000_000,
        "vc_total_raised": 10_800_000,
        "lead_investors": "Sequoia Capital, Dragonfly Capital",
        "fdv_change_pct": -70.8, "total_supply": 1_000_000_000, "initial_circ_pct": 24.1,
        "chain": "base", "coingecko_id": "kaito",
    },
    {
        "symbol": "SYND", "name": "Syndicate", "category": "Infra",
        "tge_date": "2025-09-01", "tge_fdv": 940_000_000, "current_fdv": 59_800_000,
        "vc_total_raised": 27_000_000,
        "lead_investors": "a16z",
        "fdv_change_pct": -93.6, "chain": "ethereum", "coingecko_id": None,
    },
    {
        "symbol": "ANIME", "name": "Animecoin", "category": "Consumer",
        "tge_date": "2025-02-05", "tge_fdv": 870_000_000, "current_fdv": 55_700_000,
        "vc_total_raised": 50_000_000,
        "lead_investors": "Animoca Brands, Azuki",
        "fdv_change_pct": -93.6, "total_supply": 10_000_000_000, "initial_circ_pct": 5.0,
        "chain": "ethereum", "coingecko_id": "animecoin",
    },
    {
        "symbol": "NIL", "name": "Nillion", "category": "Infra",
        "tge_date": "2025-03-24", "tge_fdv": 720_000_000, "current_fdv": 63_300_000,
        "vc_total_raised": 50_000_000,
        "lead_investors": "Hack VC, Distributed Global",
        "fdv_change_pct": -91.2, "total_supply": 1_000_000_000, "initial_circ_pct": 19.5,
        "chain": "nillion", "coingecko_id": "nillion",
    },
    {
        "symbol": "TOWNS", "name": "Towns", "category": "Social",
        "tge_date": "2025-08-15", "tge_fdv": 691_800_000, "current_fdv": 60_700_000,
        "vc_total_raised": 25_500_000,
        "lead_investors": "a16z, Benchmark",
        "fdv_change_pct": -91.2, "chain": "base", "coingecko_id": None,
    },
    {
        "symbol": "TREE", "name": "Tree", "category": "DeFi",
        "tge_date": "2025-07-10", "tge_fdv": 670_000_000, "current_fdv": 71_400_000,
        "vc_total_raised": 0, "lead_investors": "Unknown",
        "fdv_change_pct": -89.3, "chain": "ethereum", "coingecko_id": None,
    },
    {
        "symbol": "CAMP", "name": "Camp Network", "category": "Infra",
        "tge_date": "2025-06-20", "tge_fdv": 637_000_000, "current_fdv": 69_400_000,
        "vc_total_raised": 30_000_000,
        "lead_investors": "1kx, OKX Ventures",
        "fdv_change_pct": -89.1, "chain": "camp", "coingecko_id": None,
    },
    {
        "symbol": "INIT", "name": "Initia", "category": "Infra",
        "tge_date": "2025-04-24", "tge_fdv": 600_000_000, "current_fdv": None,
        "vc_total_raised": 14_000_000,
        "lead_investors": "Binance Labs, Delphi Ventures",
        "fdv_change_pct": None, "chain": "initia", "coingecko_id": "initia",
    },
    {
        "symbol": "MOVE", "name": "Movement", "category": "L1",
        "tge_date": "2025-01-09", "tge_fdv": 800_000_000, "current_fdv": None,
        "vc_total_raised": 41_400_000,
        "lead_investors": "Polychain Capital, Hack VC",
        "fdv_change_pct": None, "chain": "movement", "coingecko_id": "movement",
    },

    # ============================================================
    # Tier 3: $100M - $500M FDV (24개 중 13% 생존, 중앙값 -73%)
    # ============================================================
    {
        "symbol": "XTER", "name": "Xterio", "category": "Gaming",
        "tge_date": "2025-02-20", "tge_fdv": 420_000_000, "current_fdv": 30_000_000,
        "vc_total_raised": 55_000_000,
        "lead_investors": "Binance Labs, FunPlus",
        "fdv_change_pct": -92.9, "chain": "xter", "coingecko_id": "xterio",
    },
    {
        "symbol": "YALA", "name": "Yala", "category": "DeFi",
        "tge_date": "2025-09-15", "tge_fdv": 240_000_000, "current_fdv": 20_100_000,
        "vc_total_raised": 8_000_000,
        "lead_investors": "Polychain Capital, Ethereal Ventures",
        "fdv_change_pct": -91.6, "chain": "bitcoin", "coingecko_id": None,
    },
    {
        "symbol": "LITKEY", "name": "Lit Protocol", "category": "Infra",
        "tge_date": "2025-08-20", "tge_fdv": 210_000_000, "current_fdv": 16_700_000,
        "vc_total_raised": 18_000_000,
        "lead_investors": "1kx, Blockchain Capital",
        "fdv_change_pct": -92.1, "chain": "ethereum", "coingecko_id": None,
    },
    {
        "symbol": "EPT", "name": "Balance", "category": "Gaming",
        "tge_date": "2025-03-15", "tge_fdv": 170_000_000, "current_fdv": 16_000_000,
        "vc_total_raised": 12_000_000,
        "lead_investors": "a16z GAMES, Animoca Brands",
        "fdv_change_pct": -90.6, "chain": "ethereum", "coingecko_id": None,
    },
    {
        "symbol": "HMND", "name": "Humanity Protocol", "category": "Infra",
        "tge_date": "2025-05-01", "tge_fdv": 400_000_000, "current_fdv": None,
        "vc_total_raised": 30_000_000,
        "lead_investors": "Kingsway Capital, Animoca Brands",
        "fdv_change_pct": None, "chain": "polygon", "coingecko_id": "humanity-protocol",
    },
    {
        "symbol": "ABSTRACT", "name": "Abstract Chain", "category": "L2",
        "tge_date": "2025-01-27", "tge_fdv": 300_000_000, "current_fdv": None,
        "vc_total_raised": 11_000_000,
        "lead_investors": "1kx, Igloo (Pudgy Penguins)",
        "fdv_change_pct": None, "chain": "abstract", "coingecko_id": None,
    },

    # ============================================================
    # Tier 4: <$100M FDV (35개 중 40% 생존, 중앙값 -26%) 
    # ============================================================
    {
        "symbol": "ASTER", "name": "Aster DEX", "category": "Perp DEX",
        "tge_date": "2025-09-17", "tge_fdv": 50_000_000, "current_fdv": 400_000_000,
        "vc_total_raised": 0,
        "lead_investors": "YZi Labs (Binance Labs), CZ backed",
        "fdv_change_pct": 700.0, "chain": "bnb", "coingecko_id": "aster-dex",
        "note": "Best performer of 2025 TGEs, +700% from TGE"
    },

    # ============================================================
    # 추가 주요 VC-Backed 프로젝트 (기사에서 확인된 것들)
    # ============================================================
    {
        "symbol": "ZORA", "name": "Zora", "category": "Consumer",
        "tge_date": "2025-04-23", "tge_fdv": None, "current_fdv": None,
        "vc_total_raised": 60_000_000,
        "lead_investors": "Haun Ventures, Coinbase Ventures",
        "fdv_change_pct": None, "chain": "zora", "coingecko_id": "zora",
        "note": "One of the few 'green' tokens"
    },
    {
        "symbol": "BEDROCK", "name": "Bedrock", "category": "DeFi",
        "tge_date": "2025-05-01", "tge_fdv": None, "current_fdv": None,
        "vc_total_raised": 8_000_000,
        "lead_investors": "OKX Ventures, Amber Group",
        "fdv_change_pct": None, "chain": "ethereum", "coingecko_id": "bedrock-defi",
        "note": "Green — maintained value post-TGE"
    },
]

# ============================================================
# Memento Research 카테고리별 요약 (118개 전체)
# ============================================================
CATEGORY_SUMMARY = {
    "Infra":      {"count": 46, "avg_change": -45, "median_change": -72, "pct_green": 9},
    "AI":         {"count": 23, "avg_change": -52, "median_change": -82, "pct_green": 13},
    "DeFi":       {"count": 19, "avg_change": -34, "median_change": -52, "pct_green": 32},
    "Consumer":   {"count": 14, "avg_change": -28, "median_change": -61, "pct_green": 14},
    "Gaming":     {"count": 6,  "avg_change": 17,  "median_change": -86, "pct_green": 17},
    "Stablecoin": {"count": 4,  "avg_change": -70, "median_change": -77, "pct_green": 0},
    "Perp DEX":   {"count": 3,  "avg_change": 213, "median_change": -31, "pct_green": 33},
    "Data":       {"count": 2,  "avg_change": 0.7, "median_change": 0.7, "pct_green": 50},
    "DeSci":      {"count": 1,  "avg_change": -93, "median_change": -93, "pct_green": 0},
}

# ============================================================
# FDV Quartile별 성과 (Memento Research 원본)
# ============================================================
FDV_QUARTILES = [
    {"range": "$25M - $200M",      "count": 35, "median_starting_fdv": 126_000_000,   "median_change": -26, "pct_green": 40},
    {"range": "$210M - $489M",     "count": 24, "median_starting_fdv": 335_000_000,   "median_change": -73, "pct_green": 13},
    {"range": "$500M - $940M",     "count": 29, "median_starting_fdv": 680_000_000,   "median_change": -82, "pct_green": 3},
    {"range": "$958M - $28.1B",    "count": 30, "median_starting_fdv": 1_580_000_000, "median_change": -83, "pct_green": 0},
]


if __name__ == "__main__":
    import json
    
    print(f"Total tokens in manual list: {len(TGE_2025_TOKENS)}")
    print(f"\nTokens with VC funding data:")
    
    vc_backed = [t for t in TGE_2025_TOKENS if t.get("vc_total_raised", 0) > 0]
    print(f"  VC-backed: {len(vc_backed)}")
    
    total_vc = sum(t.get("vc_total_raised", 0) for t in TGE_2025_TOKENS)
    print(f"  Total VC raised: ${total_vc / 1e6:.1f}M")
    
    print(f"\nTop VC raises:")
    for t in sorted(vc_backed, key=lambda x: x["vc_total_raised"], reverse=True)[:10]:
        print(f"  {t['symbol']:8s} {t['name']:25s} ${t['vc_total_raised']/1e6:>7.1f}M  |  {', '.join(t['lead_investors'].split(', ')[:2])}")
    
    print(f"\n--- Category Summary (Memento Research, N=118) ---")
    for cat, data in sorted(CATEGORY_SUMMARY.items(), key=lambda x: x[1]["count"], reverse=True):
        print(f"  {cat:12s}  N={data['count']:>2d}  median={data['median_change']:>+6.1f}%  green={data['pct_green']:>2d}%")
    
    # JSON 출력
    with open("tge_2025_verified.json", "w") as f:
        json.dump(TGE_2025_TOKENS, f, indent=2, default=str, ensure_ascii=False)
    print(f"\n✓ Saved to tge_2025_verified.json")
