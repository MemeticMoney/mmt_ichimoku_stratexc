# Phase 1 Findings Report

## Purpose

Phase 1 tested the three current cloud presets across the approved ticker universe to answer one question:

Which cloud family is the strongest starting point for Phase 2 optimization across symbols, timeframes, direction modes, and date windows?

Phase 1 was a preset sweep only. It did not search custom cloud values yet.

## Test Scope

- Symbols: 23
- Timeframes: `1W`, `3D`, `1D`, `4H`, `1H`, `15m`
- Direction modes: `Long Only`, `Short Only`, `Both`
- Windows: `All-Time`, `Last 3 Years`
- Cloud presets:
  - `Traditional Standard (9/26/52/26)`
  - `Traditional Doubled (18/52/104/52)`
  - `Crypto Doubled (20/61/120/30)`
- Total runs: `2484`

Quality gates:

- `All-Time`
  - minimum trades: `10`
  - max drawdown: `40%`
  - net profit must be positive
  - margin calls must equal `0`
- `Last 3 Years`
  - minimum trades: `6`
  - max drawdown: `40%`
  - net profit must be positive
  - margin calls must equal `0`

Source artifacts:

- [summary.md](/Users/stubookpro/Desktop/mmt_ichi/public_repo/optimizer/output/phase1-universe/2026-04-04T20-12-59-050Z/summary.md)
- [best-settings.csv](/Users/stubookpro/Desktop/mmt_ichi/public_repo/optimizer/output/phase1-universe/2026-04-04T20-12-59-050Z/best-settings.csv)
- [robust-settings.csv](/Users/stubookpro/Desktop/mmt_ichi/public_repo/optimizer/output/phase1-universe/2026-04-04T20-12-59-050Z/robust-settings.csv)
- [raw-results.json](/Users/stubookpro/Desktop/mmt_ichi/public_repo/optimizer/output/phase1-universe/2026-04-04T20-12-59-050Z/raw-results.json)

## Data Quality

- Completed matrix: `2484 / 2484`
- Distinct symbols covered: `23`
- Distinct timeframes covered: `6`
- Distinct direction modes covered: `3`
- Distinct windows covered: `2`
- Read failures: `1`

The single failed row was:

- `EEM / 240 / Long Only / All-Time / Traditional Standard`

That case was manually rechecked after the run and remained a real fail because net profit was negative, so it does not change the Phase 1 conclusion.

## Executive Summary

If one universal default must be chosen after Phase 1, it should be:

- `Traditional Standard (9/26/52/26)`

Why:

- It won the most robust groupings.
- It produced the most passing best-cell outcomes.
- It was the cleanest broad default across equities, commodity proxies, bond proxies, and mixed-direction buckets.

Important nuance:

- Convergence is real, but not absolute.
- `Crypto Doubled` still matters for `BTC`, some crypto-adjacent behavior, and several high-beta / cyclical symbols.
- `Traditional Doubled` remains the strongest secondary profile for a smaller but meaningful set of macro and index-like symbols.

## Convergence Summary

### Robust Winners Across All Symbol / Direction / Window Groups

| Cloud preset | Robust winner count |
| --- | ---: |
| Traditional Standard (9/26/52/26) | 64 |
| Crypto Doubled (20/61/120/30) | 37 |
| Traditional Doubled (18/52/104/52) | 37 |

### Passing Best-Cell Outcomes

| Cloud preset | Passing best-cell count |
| --- | ---: |
| Traditional Standard (9/26/52/26) | 66 |
| Crypto Doubled (20/61/120/30) | 51 |
| Traditional Doubled (18/52/104/52) | 51 |

### Reading The Result

- `Traditional Standard` is the best broad default.
- `Crypto Doubled` is not a niche loser. It remains a real contender in crypto and several momentum-heavy symbols.
- `Traditional Doubled` is also not noise. It shows up repeatedly in macro / ETF contexts such as `SPY` and `UUP`.

## Timeframe Findings

Passing best-cell counts by timeframe:

| Timeframe | Passing cells | Total cells |
| --- | ---: | ---: |
| `4H` | 53 | 138 |
| `3D` | 42 | 138 |
| `1D` | 40 | 138 |
| `1H` | 21 | 138 |
| `1W` | 10 | 138 |
| `15m` | 2 | 138 |

Interpretation:

- The strongest optimization targets are `4H`, `3D`, and `1D`.
- `1H` is mixed and may still be useful in selected symbols.
- `1W` works, but less often.
- `15m` is materially weak and should be deprioritized in Phase 2.

## Direction / Window Findings

Passing best-cell counts by direction mode and window:

| Direction / Window | Passing cells | Total cells |
| --- | ---: | ---: |
| `Long Only / All-Time` | 46 | 138 |
| `Short Only / All-Time` | 32 | 138 |
| `Both / All-Time` | 31 | 138 |
| `Long Only / Last 3 Years` | 30 | 138 |
| `Both / Last 3 Years` | 21 | 138 |
| `Short Only / Last 3 Years` | 8 | 138 |

Interpretation:

- `Long Only / All-Time` is the cleanest overall mode-window.
- `Short Only / Last 3 Years` is the weakest mode-window by a wide margin.
- Short-side behavior is still useful in some bond and rate-sensitive ETFs, but not as a broad default.

## Ticker-Level Findings

The table below uses two views:

- `Robust majority` = the preset that won the most robust groups for that ticker
- `Best run` = the single strongest passing cell observed for that ticker

| Symbol | Robust majority | Best run |
| --- | --- | --- |
| `COINBASE:BTCUSD` | Crypto Doubled | `3D / Long Only / All-Time / Crypto Doubled` |
| `COINBASE:ETHUSD` | Traditional Standard | `3D / Long Only / All-Time / Traditional Standard` |
| `COINBASE:SOLUSD` | Traditional Standard | `4H / Long Only / Last 3 Years / Traditional Doubled` |
| `DBC` | Traditional Standard | `3D / Long Only / All-Time / Traditional Standard` |
| `EEM` | Traditional Standard | `4H / Long Only / All-Time / Traditional Doubled` |
| `EFA` | Tie: Traditional Standard / Crypto Doubled | `3D / Long Only / All-Time / Crypto Doubled` |
| `EMB` | Traditional Standard | `4H / Short Only / All-Time / Traditional Standard` |
| `GLD` | Traditional Standard | `1W / Both / All-Time / Traditional Standard` |
| `HYG` | Traditional Standard | `3D / Short Only / All-Time / Crypto Doubled` |
| `IEF` | Tie: Traditional Standard / Traditional Doubled | `1D / Short Only / All-Time / Crypto Doubled` |
| `IWM` | Traditional Standard | `3D / Long Only / All-Time / Crypto Doubled` |
| `IYR` | Tie: Crypto Doubled / Traditional Doubled | `3D / Long Only / All-Time / Traditional Doubled` |
| `KRE` | Traditional Standard | `3D / Long Only / All-Time / Crypto Doubled` |
| `LQD` | Traditional Standard | `3D / Short Only / All-Time / Traditional Standard` |
| `MUB` | Tie: Traditional Standard / Traditional Doubled | `3D / Short Only / All-Time / Traditional Standard` |
| `SHY` | Crypto Doubled | `3D / Short Only / All-Time / Crypto Doubled` |
| `SPY` | Traditional Doubled | `1W / Long Only / All-Time / Traditional Doubled` |
| `TIP` | Traditional Standard | `3D / Both / Last 3 Years / Traditional Standard` |
| `TLT` | No convergence | `3D / Long Only / All-Time / Crypto Doubled` |
| `UUP` | Traditional Doubled | `1D / Long Only / All-Time / Traditional Doubled` |
| `XHB` | Crypto Doubled | `3D / Long Only / All-Time / Crypto Doubled` |
| `XLE` | Crypto Doubled | `4H / Long Only / Last 3 Years / Crypto Doubled` |
| `XLF` | Traditional Standard | `3D / Long Only / All-Time / Crypto Doubled` |

## What Phase 1 Says About Defaults

### Best Universal Default

- `Traditional Standard (9/26/52/26)`

Use this when the model needs one clean public default that behaves best across the full cross-asset sample.

### Best Secondary Defaults

- `Crypto Doubled (20/61/120/30)`
  - Best for `BTC`
  - Strong for `XLE`, `XHB`, `SHY`
  - Competitive in several `3D` and `4H` momentum cases

- `Traditional Doubled (18/52/104/52)`
  - Best broad secondary profile for `SPY` and `UUP`
  - Competitive in `SOL`, `EEM`, `IYR`, and some `4H` / `1D` contexts

## Recommended Interpretation

Phase 1 does **not** support the idea that a single cloud family is best for every symbol.

Phase 1 **does** support:

- one strong broad default: `Traditional Standard`
- one crypto / beta-tilted alternate: `Crypto Doubled`
- one macro / index alternate: `Traditional Doubled`

That is strong enough to proceed into Phase 2 with confidence.

## Objective Of Phase 2

Phase 2 should **not** run a wide brute-force search.

The objective of Phase 2 is:

- start from the Phase 1 winning preset family for each symbol / direction / window group
- search a small custom neighborhood around that winner
- improve `profit factor` and `win rate` **without breaking** the Phase 1 quality gates
- prioritize `4H`, `3D`, and `1D`
- deprioritize or skip `15m`

In short:

Phase 2 is a **precision refinement pass**, not a new discovery pass.

## Recommended Phase 2 Priorities

1. Keep `Traditional Standard` as the universal baseline seed.
2. Keep `Crypto Doubled` active for crypto and high-beta symbols.
3. Keep `Traditional Doubled` active for macro / index / rate-sensitive symbols.
4. Focus the search budget on `4H`, `3D`, and `1D`.
5. Start with `Long Only`, then extend to the strongest short-capable ETF groups.
