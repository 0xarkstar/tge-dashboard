"""
Pydantic v2 models for TGE Dashboard data pipeline.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, computed_field


Category = Literal[
    "DeFi", "Infra", "AI", "Gaming", "L1", "L2",
    "Consumer", "Social", "RWA", "DeSci",
    "Perp DEX", "Stablecoin", "Data", "Other",
]

FdvTier = Literal["mega", "large", "mid", "small"]
TokenStatus = Literal["launched", "pending", "delisted"]
DataSource = Literal["live", "static"]
VcDataSource = Literal["manual", "defillama", "both"]


class BaseToken(BaseModel, frozen=True):
    """Parsed from spreadsheet CSV."""
    ticker: str
    name: str
    starting_fdv: float
    starting_mc: float
    current_fdv: float | None = None
    current_mc: float | None = None
    volume_24h: float | None = None
    fdv_change_pct: float | None = None
    half: Literal["H1", "H2"]


class TGEToken(BaseModel, frozen=True):
    """Full enriched token record."""
    # Identity
    ticker: str
    name: str
    coingecko_id: str | None = None

    # Classification
    category: Category = "Other"
    chain: str = "unknown"
    half: Literal["H1", "H2"] = "H1"
    tge_date: str | None = None

    # TGE Static Data
    starting_fdv: float
    starting_mc: float

    # Live Market Data
    current_fdv: float | None = None
    current_mc: float | None = None
    volume_24h: float | None = None
    current_price: float | None = None

    # VC Data
    vc_total_raised: float | None = None
    lead_investors: tuple[str, ...] = ()
    vc_data_source: VcDataSource | None = None

    # Historical
    ath: float | None = None
    atl: float | None = None

    # Meta
    data_source: DataSource = "static"
    status: TokenStatus = "launched"
    last_updated: str = ""

    @computed_field  # type: ignore[prop-decorator]
    @property
    def initial_circ_ratio(self) -> float | None:
        if self.starting_fdv > 0:
            return round(self.starting_mc / self.starting_fdv, 4)
        return None

    @computed_field  # type: ignore[prop-decorator]
    @property
    def fdv_change_pct(self) -> float | None:
        if self.current_fdv is not None and self.starting_fdv > 0:
            return round(
                (self.current_fdv - self.starting_fdv) / self.starting_fdv * 100, 2
            )
        return None

    @computed_field  # type: ignore[prop-decorator]
    @property
    def fdv_tier(self) -> FdvTier:
        from config import FDV_TIERS
        if self.starting_fdv >= FDV_TIERS["mega"]:
            return "mega"
        if self.starting_fdv >= FDV_TIERS["large"]:
            return "large"
        if self.starting_fdv >= FDV_TIERS["mid"]:
            return "mid"
        return "small"

    @computed_field  # type: ignore[prop-decorator]
    @property
    def performance_status(self) -> Literal["green", "red"]:
        pct = self.fdv_change_pct
        if pct is not None and pct >= 0:
            return "green"
        return "red"

    @computed_field  # type: ignore[prop-decorator]
    @property
    def is_illiquid(self) -> bool:
        from config import ILLIQUID_VOLUME_THRESHOLD
        if self.volume_24h is None:
            return True
        return self.volume_24h < ILLIQUID_VOLUME_THRESHOLD


class CategoryStats(BaseModel, frozen=True):
    count: int = 0
    median_change: float = 0.0
    avg_change: float = 0.0
    pct_green: float = 0.0
    total_vc_raised: float = 0.0


class TierStats(BaseModel, frozen=True):
    range_label: str = ""
    count: int = 0
    median_starting_fdv: float = 0.0
    median_change: float = 0.0
    pct_green: float = 0.0


class DashboardStats(BaseModel, frozen=True):
    total_tokens: int = 0
    launched_tokens: int = 0
    green_count: int = 0
    red_count: int = 0
    green_pct: float = 0.0
    median_fdv_change: float = 0.0
    total_vc_raised: float = 0.0
    vc_data_coverage: int = 0
    by_category: dict[str, CategoryStats] = {}
    by_fdv_tier: dict[str, TierStats] = {}
    outliers: tuple[str, ...] = ()
    last_updated: str = ""
