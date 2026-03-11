"""
Configuration constants for TGE Dashboard data pipeline.
"""

from pathlib import Path

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
SEED_DIR = PROJECT_ROOT / "seed"
DATA_DIR = PROJECT_ROOT / "data"
PUBLIC_DATA_DIR = PROJECT_ROOT / "public" / "data"

# API
COINGECKO_BASE = "https://api.coingecko.com/api/v3"
DEFILLAMA_RAISES_URL = "https://api.llama.fi/raises"

# Rate limits
COINGECKO_REQ_PER_MIN = 10
COINGECKO_RETRY_MAX = 3
COINGECKO_RETRY_WAIT = 65  # seconds on 429

# FDV Tier boundaries (from Memento Research quartiles)
FDV_TIERS = {
    "mega": 958_000_000,    # >= $958M
    "large": 500_000_000,   # $500M - $940M
    "mid": 210_000_000,     # $210M - $489M
    # "small": everything below $210M
}

# Category mapping (CoinGecko categories → our categories)
CATEGORY_MAP = {
    "layer-1": "L1",
    "layer-2": "L2",
    "decentralized-finance-defi": "DeFi",
    "artificial-intelligence": "AI",
    "gaming": "Gaming",
    "infrastructure": "Infra",
    "social": "Social",
    "real-world-assets": "RWA",
    "decentralized-science-desci": "DeSci",
    "stablecoins": "Stablecoin",
    "perpetuals": "Perp DEX",
    "consumer": "Consumer",
    "data": "Data",
}

# Outlier tickers (excluded from aggregate stats by default)
OUTLIER_TICKERS = ["WLFI"]

# Volume threshold for illiquid flag
ILLIQUID_VOLUME_THRESHOLD = 10_000  # USD

# Manual CoinGecko ID overrides for known ticker collisions
# Format: ticker → coingecko_id
COINGECKO_ID_OVERRIDES = {
    "BERA": "berachain-bera",
    "IP": "story-protocol",
    "BIO": "bio-protocol",
    "WAL": "walrus-2",
    "MON": "monad",
    "KAITO": "kaito",
    "ANIME": "animecoin",
    "NIL": "nillion",
    "MOVE": "movement",
    "INIT": "initia",
    "PLUME": "plume-network",
    "XTER": "xterio",
    "ASTER": "aster-dex",
    "ZORA": "zora",
    "XPL": "plasma-network",
    "FF": "falcon-finance",
    "HMND": "humanity-protocol",
    "EPT": "balance-fun",
    "PUMP": "pump-fun",
    "BABY": "babylon-staking",
    "SIGN": "sign-3",
    "LAYER": "solayer",
    "SOPH": "sophon",
    "RED": "redstone-oracles",
    "NXPC": "nexpace",
    "LINEA": "linea",
    "DOOD": "doodles-official",
    "SXT": "space-and-time",
    "SOLV": "solv-protocol",
    "SUPER": "superverse",
    "SAHARA": "sahara",
    "RECALL": "recall",
    "SHELL": "myshell",
    "GUN": "gunzilla-gun",
    "KERNEL": "kerneldao",
    "CAMP": "camp-network",
    "SYND": "syndicate-2",
    "TOWNS": "towns",
    "TREE": "tree-3",
    "LITKEY": "lit-protocol",
    "YALA": "yala",
    "BEDROCK": "bedrock-defi",
    "ABSTRACT": "abstract",
    "XAN": "anoma",
    "BR": "bedrock-defi",
    "H": "humanity-protocol",
    "0G": "0g-network",
    "WLFI": "world-liberty-financial",
    "CC": "canton",
    "2Z": "doublezero",
    "STABLE": "stable-2",
    "KITE": "kite-ai",
    "WCT": "walletconnect",
    "PROVE": "succinct",
    "HYPER": "hyperlane",
    "LA": "lagrange",
    "MET": "meteora",
    "CORN": "corn-3",
    "IRYS": "irys",
    "FHE": "mind-network",
    "STO": "stakestone",
    "LIGHT": "bitlight-protocol",
    "UB": "unibase",
    "COAI": "chainopera-ai",
    "PIEVERSE": "pieverse",
    "ESPORTS": "yooldo-games",
    "WET": "humidifi",
    "HEMI": "hemi",
    "BARD": "lombard-finance",
    "SOON": "soon",
    "AVNT": "avantis",
    "HOME": "home-3",
    "RAVE": "ravedao",
    "BID": "creatorbid",
    "DOLO": "dolomite",
    "BOB": "bob-network",
    "SAPIEN": "sapien",
    "ROAM": "roam",
    "ZKP": "zkpass",
    "CLO": "yei-finance",
    "IR": "infrared-finance",
    "FOLKS": "folks-finance",
    "TRUTH": "swarm-network",
    "AKE": "akedo",
    "LAB": "lab",
    "MMT": "momentum-2",
    "MITO": "mito",
    "SOMI": "somnia",
    "HAEDAL": "haedal-protocol",
    "THQ": "theoriq",
    "SPK": "spark-2",
    "AT": "apro",
    "VOOI": "vooi",
    "AIA": "deagentai",
    "RESOLV": "resolv",
    "U": "union-2",
    "STBL": "stbl",
    "YB": "yield-basis",
    "GPS": "goplus-security",
    "SWTCH": "switchboard",
    "CUDIS": "cudis",
    "GAIB": "gaib",
    "BMT": "bubblemaps",
    "B3": "b3-2",
    "NEWT": "newton-protocol",
    "EVAA": "evaa-protocol",
    "NOM": "nomina",
    "BLUAI": "bluwhale",
    "FLOCK": "flock-2",
    "TANSSI": "tanssi",
    "TRUST": "intuition",
    "ALMANAK": "almanak",
    "ZBT": "zerobase",
    "ZKC": "boundless",
    "MIRA": "mira-network",
    "VVV": "venice-token",
    "HOLO": "holoworld",
    "EDEN": "openeden",
    "ENSO": "enso-finance",
    "ALLO": "allora",
    "GUN": "gunz",
    "OPEN": "openledger",
    "PARTI": "particle-network",
    "DOOD": "doodles",
}

# Manual category overrides
CATEGORY_OVERRIDES = {
    "BERA": "L1", "IP": "Infra", "BIO": "DeSci", "WAL": "Infra",
    "MON": "L1", "KAITO": "AI", "ANIME": "Consumer", "NIL": "Infra",
    "MOVE": "L1", "INIT": "Infra", "PLUME": "RWA", "XTER": "Gaming",
    "ASTER": "Perp DEX", "ZORA": "Consumer", "XPL": "L1", "FF": "DeFi",
    "HMND": "Infra", "EPT": "Gaming", "PUMP": "DeFi", "BABY": "Infra",
    "SIGN": "Infra", "LAYER": "Infra", "SOPH": "Infra", "RED": "Infra",
    "NXPC": "Gaming", "LINEA": "L2", "DOOD": "Consumer", "SXT": "Infra",
    "SOLV": "DeFi", "SUPER": "Gaming", "SAHARA": "AI", "RECALL": "AI",
    "SHELL": "AI", "GUN": "Gaming", "KERNEL": "DeFi", "CAMP": "Infra",
    "SYND": "Infra", "TOWNS": "Social", "TREE": "DeFi", "LITKEY": "Infra",
    "YALA": "DeFi", "BEDROCK": "DeFi", "BR": "DeFi", "ABSTRACT": "L2",
    "XAN": "Infra", "H": "Infra", "0G": "Infra", "OG": "Social",
    "WLFI": "DeFi", "CC": "DeFi", "2Z": "Infra", "STABLE": "Stablecoin",
    "KITE": "AI", "WCT": "Infra", "PROVE": "Infra", "HYPER": "Infra",
    "LA": "Infra", "MET": "DeFi", "CORN": "DeFi", "IRYS": "Infra",
    "FHE": "Infra", "STO": "DeFi", "LIGHT": "Infra", "UB": "Infra",
    "COAI": "AI", "PIEVERSE": "Gaming", "ESPORTS": "Gaming",
    "WET": "DeFi", "HEMI": "L2", "BARD": "DeFi", "SOON": "L2",
    "AVNT": "Perp DEX", "HOME": "Consumer", "RAVE": "DeFi",
    "BID": "AI", "DOLO": "DeFi", "BOB": "L2", "SAPIEN": "AI",
    "ROAM": "Infra", "ZKP": "Infra", "CLO": "DeFi", "IR": "DeFi",
    "FOLKS": "DeFi", "TRUTH": "AI", "AKE": "Gaming", "LAB": "AI",
    "MMT": "DeFi", "MITO": "DeFi", "SOMI": "L1", "HAEDAL": "DeFi",
    "THQ": "AI", "SPK": "DeFi", "AT": "Infra", "VOOI": "Perp DEX",
    "AIA": "AI", "RESOLV": "DeFi", "U": "Infra", "STBL": "Stablecoin",
    "YB": "DeFi", "GPS": "Infra", "SWTCH": "Infra", "CUDIS": "Consumer",
    "GAIB": "AI", "BMT": "Infra", "B3": "Gaming", "NEWT": "DeFi",
    "EVAA": "DeFi", "NOM": "Infra", "BLUAI": "AI", "FLOCK": "AI",
    "TANSSI": "Infra", "TRUST": "Infra", "ALMANAK": "AI",
    "ZBT": "Infra", "ZKC": "Infra", "MIRA": "AI", "VVV": "AI",
    "HOLO": "AI", "EDEN": "DeFi", "ENSO": "DeFi", "ALLO": "AI",
    "OPEN": "AI", "PARTI": "Infra",
}
