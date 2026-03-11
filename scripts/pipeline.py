"""
Pipeline orchestrator: runs all data pipeline steps in sequence.

Usage:
    python scripts/pipeline.py              # Full pipeline (01-04)
    python scripts/pipeline.py --skip-api   # Skip API calls (01 + 04 only)
    python scripts/pipeline.py --prices     # Price update only
"""

from __future__ import annotations

import subprocess
import sys
import time
from pathlib import Path

import structlog

log = structlog.get_logger()

SCRIPTS_DIR = Path(__file__).parent

STEPS = [
    ("01_parse_spreadsheet.py", "Parse spreadsheet CSV"),
    ("02_enrich_coingecko.py", "Enrich with CoinGecko data"),
    ("03_fetch_vc_data.py", "Fetch VC data from DeFiLlama"),
    ("04_merge_and_validate.py", "Merge and compute stats"),
]

SKIP_API_STEPS = [
    ("01_parse_spreadsheet.py", "Parse spreadsheet CSV"),
    ("04_merge_and_validate.py", "Merge and compute stats"),
]

PRICE_ONLY = [
    ("update_prices.py", "Update prices"),
]

VALIDATE = ("validate.py", "Validate output")


def run_step(script: str, description: str) -> bool:
    """Run a pipeline step. Returns True on success."""
    script_path = SCRIPTS_DIR / script
    log.info("step_start", script=script, description=description)
    start = time.monotonic()

    result = subprocess.run(
        [sys.executable, str(script_path)],
        capture_output=True,
        text=True,
    )

    elapsed = round(time.monotonic() - start, 1)

    if result.returncode != 0:
        log.error(
            "step_failed",
            script=script,
            elapsed=f"{elapsed}s",
            stderr=result.stderr[-500:] if result.stderr else "",
        )
        return False

    log.info("step_complete", script=script, elapsed=f"{elapsed}s")
    if result.stdout:
        for line in result.stdout.strip().split("\n")[-5:]:
            print(f"  {line}")
    return True


def main() -> None:
    args = set(sys.argv[1:])

    if "--prices" in args:
        steps = PRICE_ONLY
    elif "--skip-api" in args:
        steps = SKIP_API_STEPS
    else:
        steps = STEPS

    log.info("pipeline_start", steps=len(steps), mode="prices" if "--prices" in args else "skip-api" if "--skip-api" in args else "full")

    start_total = time.monotonic()
    failed = []

    for script, description in steps:
        success = run_step(script, description)
        if not success:
            failed.append(script)
            if script in ("01_parse_spreadsheet.py",):
                log.error("critical_step_failed", script=script)
                sys.exit(1)

    # Always run validation at the end
    validate_success = run_step(*VALIDATE)

    total_elapsed = round(time.monotonic() - start_total, 1)

    if failed:
        log.warning(
            "pipeline_complete_with_errors",
            elapsed=f"{total_elapsed}s",
            failed=failed,
        )
        sys.exit(1)
    elif not validate_success:
        log.error("pipeline_validation_failed", elapsed=f"{total_elapsed}s")
        sys.exit(1)
    else:
        log.info("pipeline_complete", elapsed=f"{total_elapsed}s")


if __name__ == "__main__":
    main()
