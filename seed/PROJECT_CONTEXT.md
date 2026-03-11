# 2025 TGE Performance Tracker — 프로젝트 컨텍스트

## 프로젝트 목표

2025년 한 해 동안 TGE(Token Generation Event)를 진행한 VC-backed 프로젝트들의 펀드레이징 밸류에이션 vs 실제 시장 퍼포먼스를 추적/비교하는 리서치 대시보드 구축.

**최종 산출물:**
1. Dune Analytics 대시보드 (온체인 데이터)
2. 커스텀 웹사이트 (Dune API + 오프체인 데이터 통합)
3. Claude Code MCP로 Dune 연동하여 개발 워크플로우에 통합

---

## 핵심 배경 데이터 (Memento Research, 2025-12-20 기준)

- **118개 TGE 추적** → 84.7% (100/118)가 TGE 가격 이하
- 중앙값 FDV drawdown: **-71.1%**, 중앙값 MC drawdown: -66.8%
- Equal-weighted basket: -33.3% / FDV-weighted basket: **-61.5%** (큰 런칭이 더 나빴음)
- 18/118 (15.3%)만 Green, 중앙값 Green 토큰: +109.7% (≈2.1x)

### FDV 구간별 성과 (가장 중요한 인사이트)
| FDV 구간 | N | 중앙값 FDV 변동 | Green 비율 |
|----------|---|----------------|-----------|
| $25M - $200M | 35 | -26% | **40%** |
| $210M - $489M | 24 | -73% | 13% |
| $500M - $940M | 29 | -82% | 3% |
| $958M - $28.1B | 30 | -83% | **0%** |

### 카테고리별 성과
| 카테고리 | N | 중앙값 | Green% |
|---------|---|--------|--------|
| Infra | 46 | -72% | 9% |
| AI | 23 | -82% | 13% |
| DeFi | 19 | -52% | **32%** |
| Consumer | 14 | -61% | 14% |
| Gaming | 6 | -86% | 17% |
| Perp DEX | 3 | -31% | 33% |
| DeSci | 1 | -93% | 0% |

---

## 현재 진행 상황

### ✅ 완료된 것

1. **수동 검증 토큰 리스트 28개** (`tge_2025_token_list.py`)
   - 교차 검증 소스: Memento Research, CryptoRank, ICO Drops, The Block, CryptoSlate, CoinGecko
   - 포함 데이터: symbol, name, category, tge_date, tge_fdv, current_fdv, vc_total_raised, lead_investors, fdv_change_pct, chain, coingecko_id
   - 총 VC 투자금: $1.21B (28개 합산)
   - Top VC raises: Monad($225M), Berachain($142M), Story Protocol($140M), Walrus($140M)

2. **자동화 스크래핑 파이프라인** (`scrape_tge_data.py`)
   - CoinGecko Free API로 실시간 가격/FDV/유통량 자동 수집
   - CryptoRank API 키 있으면 전체 펀딩 라운드 데이터 추가
   - 자동으로 Dune CTE SQL 생성
   - CSV + JSON 출력

3. **Dune SQL 쿼리 7개** (이전 버전, 토큰 리스트 빈약 — 업데이트 필요)
   - 01: TGE 토큰 마스터 리스트 CTE
   - 02: TGE FDV vs 현재 FDV 비교 테이블
   - 03: 개별 토큰 가격 추이 (파라미터 선택형)
   - 04: TGE 이후 DEX 거래량
   - 05: 카테고리별 퍼포먼스
   - 06: FDV 구간별 생존율 분석
   - 07: 대시보드 요약 카운터

### ❌ 아직 안 한 것

1. **토큰 리스트 확장** — 현재 28개, 목표 118개 (Memento 전체)
   - CryptoRank API ($99/월) 구독하면 한번에 해결
   - 또는 Ash(@ahboyash)에게 원본 스프레드시트 요청 (t.me/ahboyash)
2. **contract_address 매핑** — CoinGecko platforms 필드에서 추출 가능
3. **Dune 계정 생성 + 쿼리 실행** — dune.com 가입 필요
4. **Dune 대시보드 조립** — 쿼리 저장 후 위젯 추가
5. **API 키 발급 + Claude Code MCP 연동**
6. **커스텀 웹사이트 개발** (Next.js)

---

## 아키텍처 결정사항

### Dune + 웹사이트 = 하이브리드 구조
- **Dune은 데이터 엔진** (온체인: 가격, 거래량, 홀더, DEX 데이터)
- **웹사이트는 프레젠테이션 레이어** (오프체인 데이터 결합 + 커스텀 UI)
- Dune의 모든 쿼리 = API 엔드포인트 (query ID로 JSON/CSV 결과 호출)

### Claude Code 연동 3가지 방법
1. **Dune MCP Server** (대화형 쿼리) — `@kukapay/dune-analytics-mcp`
   ```bash
   claude mcp add-json "dune-analytics" '{"command":"npx","args":["-y","@kukapay/dune-analytics-mcp"],"env":{"DUNE_API_KEY":"your-key"}}'
   ```
2. **spice CLI** (Paradigm, 스크립트/파이프라인용)
   ```bash
   pip install spice
   spice 21693  # query ID로 실행
   spice "SELECT * FROM ethereum.blocks LIMIT 5"  # 생 SQL
   ```
3. **dune-client SDK** (Python/TS, 웹앱 백엔드)
   ```bash
   uv add dune-client
   ```

### 데이터 소스 역할 분담
| 데이터 | 소스 | 방법 |
|--------|------|------|
| 토큰 가격 히스토리 | Dune `prices.usd` | SQL 쿼리 |
| DEX 거래량 | Dune `dex.trades` | SQL 쿼리 |
| 홀더 분포 | Dune `tokens_*.transfers` | SQL 쿼리 |
| VC 밸류에이션/라운드 | CryptoRank API | REST API |
| 총 공급량/유통량 | CoinGecko API | REST API |
| TGE 날짜/메타데이터 | 수동 수집 + API | CTE 인라인 |

---

## 기존 Dune 대시보드 (참고/Fork 대상)

| 대시보드 | URL | 용도 |
|---------|-----|------|
| Token Analyzooor (God Mode) | dune.com/defimochi/token-god-mode | 개별 토큰 분석 |
| Token Overview Metrics | dune.com/ilemi/Token-Overview-Metrics | 매수/매도자 행동 |
| Crypto Narratives | dune.com/cryptokoryo/narratives | 내러티브별 퍼포먼스 |
| Crypto VC Fundraise | dune.com/usc-blockchain-club/vc-fundraise | VC 트렌드 |

---

## 파일 구조

```
dune-tge-tracker/
├── tge_2025_token_list.py    # 수동 검증 28개 토큰 + 카테고리/쿼타일 요약
├── scrape_tge_data.py        # CoinGecko + CryptoRank 자동 스크래핑 파이프라인
├── tge_2025_verified.json    # 28개 토큰 JSON 출력
├── 01_tge_token_list.sql     # Dune CTE (토큰 리스트 업데이트 필요)
├── 02_fdv_comparison.sql     # FDV 비교 쿼리
├── 03_price_trend.sql        # 가격 추이 (파라미터)
├── 04_dex_volume.sql         # DEX 거래량
├── 05_category_performance.sql
├── 06_fdv_quartile_analysis.sql
├── 07_summary_counters.sql
├── data_pipeline.py          # 이전 버전 파이프라인 (scrape_tge_data.py로 대체)
└── SETUP_GUIDE.md            # 셋업 가이드 (한글)
```

---

## 다음 단계 (Claude Code에서 이어서)

### 즉시 실행 가능
1. `scrape_tge_data.py` 실행 → CoinGecko에서 28개 토큰 실시간 데이터 수집
2. 생성된 `tge_2025_dune_cte.sql`을 SQL 쿼리들의 CTE로 교체
3. Dune MCP 서버를 Claude Code에 추가

### Dune 계정 생성 후
4. dune.com 가입 → API 키 발급
5. 쿼리 7개 복붙 → Run → Save
6. 대시보드 조립

### 데이터 확장
7. CryptoRank API 구독 ($99/월) 또는 Ash 스프레드시트 확보
8. 118개 전체 토큰으로 리스트 확장
9. contract_address 매핑 완료

### 웹사이트 개발
10. Next.js 프로젝트 초기화
11. Dune API + CoinGecko + CryptoRank 통합 백엔드
12. 대시보드 프론트엔드

---

## 환경변수 (필요 시 설정)

```bash
export DUNE_API_KEY=""           # Dune Analytics API key
export CRYPTORANK_API_KEY=""     # CryptoRank API key ($99/month)
# CoinGecko Free API는 키 불필요
```

---

*Last updated: 2026-03-11*
*Context for: Arkstar's 2025 TGE Research Project*
