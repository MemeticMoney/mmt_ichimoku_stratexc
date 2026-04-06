# Phase 2 Findings Report

## Purpose

Phase 2 was the refinement pass.

Phase 1 asked which preset family was the strongest starting point across the full universe.

Phase 2 asked the harder question:

> If cloud settings are refined around the strongest preset families, do the results converge on one universal cloud, or do different symbols prefer different cloud behavior?

The final answer is clear:

- one cloud does **not** fit everything
- the best practical model is a small family of defaults
- symbol-specific refinement is useful where the evidence is strong

## Scope

Phase 2 used the symbol-aware optimizer plan from [Phase2_Candidate_Grid.md](/Users/stubookpro/Desktop/mmt_ichi/public_repo/docs/Phase2_Candidate_Grid.md) and [Phase2_Execution_Checklist.md](/Users/stubookpro/Desktop/mmt_ichi/public_repo/docs/Phase2_Execution_Checklist.md).

It did **not** run a full Cartesian brute-force search.

Instead, it:

- started from the strongest Phase 1 seed families
- searched a tight custom neighborhood around those seeds
- focused on the highest-priority timeframes and branches for each symbol
- kept the original quality gates intact

## Test Matrix

- Symbols: `23`
- Full symbol list:
  - `COINBASE:BTCUSD`
  - `COINBASE:ETHUSD`
  - `COINBASE:SOLUSD`
  - `DBC`
  - `EEM`
  - `EFA`
  - `EMB`
  - `GLD`
  - `HYG`
  - `IEF`
  - `IWM`
  - `IYR`
  - `KRE`
  - `LQD`
  - `MUB`
  - `SHY`
  - `SPY`
  - `TIP`
  - `TLT`
  - `UUP`
  - `XHB`
  - `XLE`
  - `XLF`
- Timeframes available to the optimizer:
  - `1W`, `3D`, `1D`, `4H`, `1H`, `15m`
- Timeframes actually emphasized by the Phase 2 symbol plan:
  - mostly `1W`, `3D`, `1D`, `4H`
- Direction modes:
  - `Long Only`
  - `Short Only`
  - `Both`
- Windows:
  - `All-Time`
  - `Last 3 Years`

Source artifacts:

- [summary.md](/Users/stubookpro/Desktop/mmt_ichi/public_repo/optimizer/output/phase2/_latest/summary.md)
- [best-settings.csv](/Users/stubookpro/Desktop/mmt_ichi/public_repo/optimizer/output/phase2/_latest/best-settings.csv)
- [robust-settings.csv](/Users/stubookpro/Desktop/mmt_ichi/public_repo/optimizer/output/phase2/_latest/robust-settings.csv)
- [raw-results.json](/Users/stubookpro/Desktop/mmt_ichi/public_repo/optimizer/output/phase2/_latest/raw-results.json)

## Quality Gates

Phase 2 kept the Phase 1 quality gates.

`All-Time`

- minimum trades: `10`
- max drawdown: `40%`
- net profit must be positive
- margin calls must equal `0`

`Last 3 Years`

- minimum trades: `6`
- max drawdown: `40%`
- net profit must be positive
- margin calls must equal `0`

This matters because the optimizer was not allowed to promote a setting on profit factor alone.

## Data Quality

- Planned runs: `18,711`
- Completed runs: `18,708`
- Passing runs: `7,408`
- Read failures: `3`
- Empty-metric rows: `3`

The run quality was strong enough to trust the broad conclusions.

## Executive Summary

If one message from Phase 2 must be remembered, it should be this:

- the broad winner is a **faster standard-style neighborhood**
- but there is no single universal cloud that dominates every symbol

Phase 2 supports:

- one broad default family
- one crypto / beta-sensitive alternate family
- one doubled / macro-sensitive alternate family
- ticker-specific refinement where the evidence is clearly strong

## Convergence Summary

### Robust Winner Counts

These counts are based on the robust winners in [robust-settings.csv](/Users/stubookpro/Desktop/mmt_ichi/public_repo/optimizer/output/phase2/_latest/robust-settings.csv).

| Neighborhood family | Robust winner count |
| --- | ---: |
| Standard neighborhood | `19` |
| Crypto neighborhood | `16` |
| Doubled neighborhood | `10` |

### Passing Best-Cell Counts

These counts are based on the passing best cells in [best-settings.csv](/Users/stubookpro/Desktop/mmt_ichi/public_repo/optimizer/output/phase2/_latest/best-settings.csv).

| Neighborhood family | Passing best-cell count |
| --- | ---: |
| Standard neighborhood | `41` |
| Crypto neighborhood | `33` |
| Doubled neighborhood | `33` |

### Reading The Result

- The broadest winner is the faster standard neighborhood.
- The crypto neighborhood is still highly relevant.
- The doubled neighborhood remains useful in macro, index, and rate-sensitive contexts.
- This is strong evidence against a one-cloud-for-everything model.

## Family-Level Defaults

### Best Broad Default Family

Use a faster standard-style cloud as the broad default.

Recommended working neighborhood:

- conversion: `7` to `11`
- base: `22` to `30`
- span B: `44` to `60`
- displacement: `22` to `30`

This is the strongest broad family-level conclusion from Phase 2.

### Best Crypto / Beta Alternate

Use a crypto-style neighborhood when the symbol behaves more like `BTC`, energy, builders, regional banks, or high-beta trend structures.

Recommended working neighborhood:

- conversion: `16` to `24`
- base: `49` to `73`
- span B: `96` to `144`
- displacement: `24` to `36`

### Best Doubled / Macro Alternate

Use a doubled-style neighborhood in symbols that behave more like macro, rates, or slower index structures.

Recommended working neighborhood:

- conversion: `14` to `22`
- base: `40` to `64`
- span B: `80` to `128`
- displacement: `40` to `64`

## Timeframe Findings

Passing best-cell counts by timeframe:

| Timeframe | Passing best cells |
| --- | ---: |
| `3D` | `39` |
| `1D` | `39` |
| `4H` | `26` |
| `1W` | `3` |

Interpretation:

- The strongest Phase 2 targets remained `3D`, `1D`, and `4H`.
- `1W` still produced several excellent outcomes, but in a smaller number of symbol groups.
- `1H` and `15m` were effectively removed from the serious Phase 2 search budget, which was the right decision.

## Direction / Window Findings

Passing best-cell counts by direction and window:

| Direction / Window | Passing best cells |
| --- | ---: |
| `Long Only / All-Time` | `45` |
| `Both / All-Time` | `25` |
| `Long Only / Last 3 Years` | `19` |
| `Short Only / All-Time` | `16` |
| `Both / Last 3 Years` | `2` |

Interpretation:

- `Long Only / All-Time` stayed the cleanest broad mode-window.
- `Both / All-Time` remained more useful than expected in selected ETFs and commodity proxies.
- `Short Only / All-Time` is important in bonds and credit.
- The optimizer found very little broad value in recent `Both / Last 3 Years` behavior.

## Most Convincing Standouts

The rows below use a minimum trade count of `10` so that low-trade outliers do not dominate the headline conclusions.

| Symbol | TF | Direction | Window | Cloud | PF | Win % | DD % | Trades |
| --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: |
| `COINBASE:BTCUSD` | `3D` | `Long Only` | `All-Time` | `22/40/104/64` | `13.98` | `60.00` | `10.39` | `10` |
| `GLD` | `1W` | `Both` | `All-Time` | `11/30/52/26` | `12.71` | `60.00` | `7.13` | `10` |
| `GLD` | `1W` | `Long Only` | `All-Time` | `11/30/44/26` | `12.59` | `40.00` | `8.23` | `10` |
| `LQD` | `3D` | `Short Only` | `All-Time` | `9/26/60/30` | `8.27` | `46.15` | `1.62` | `13` |
| `SPY` | `1W` | `Long Only` | `All-Time` | `22/52/128/52` | `6.53` | `70.00` | `15.00` | `10` |
| `DBC` | `3D` | `Long Only` | `All-Time` | `7/22/60/30` | `5.77` | `62.50` | `5.00` | `16` |
| `XLF` | `3D` | `Long Only` | `All-Time` | `20/73/144/30` | `5.25` | `44.44` | `12.98` | `18` |
| `KRE` | `3D` | `Long Only` | `All-Time` | `20/61/96/30` | `4.96` | `53.85` | `16.23` | `13` |

## Important Outliers

The optimizer also found several headline results with extraordinary profit factor but low trade count.

These are still interesting, but they should not be treated as production defaults by themselves:

- `BTC / 3D / Long Only / Last 3 Years / 20/49/96/30`
  - PF `749.99`
  - trades `6`
- `SPY / 3D / Long Only / Last 3 Years / 7/22/52/26`
  - PF `21.65`
  - trades `7`

These rows reinforce the neighborhood direction, but they are not as trustworthy as the higher-trade standouts.

## Ticker-Level Robust Winners

The table below lists the robust winner by symbol and branch.

| Symbol | Branch | Robust winner |
| --- | --- | --- |
| `COINBASE:BTCUSD` | `Long Only / All-Time` | `22/40/104/64` |
| `COINBASE:BTCUSD` | `Long Only / Last 3 Years` | `20/49/96/30` |
| `COINBASE:ETHUSD` | `Long Only / All-Time` | `11/26/44/30` |
| `COINBASE:ETHUSD` | `Long Only / Last 3 Years` | `14/40/104/40` |
| `COINBASE:SOLUSD` | `Long Only / All-Time` | `7/22/52/22` |
| `COINBASE:SOLUSD` | `Long Only / Last 3 Years` | `7/22/52/22` |
| `DBC` | `Long Only / All-Time` | `7/26/44/30` |
| `DBC` | `Both / All-Time` | `7/26/60/30` |
| `EEM` | `Long Only / All-Time` | `14/52/104/64` |
| `EEM` | `Long Only / Last 3 Years` | `18/40/80/40` |
| `EFA` | `Long Only / All-Time` | `24/73/120/24` |
| `EFA` | `Long Only / Last 3 Years` | `24/49/144/36` |
| `EMB` | `Both / All-Time` | `Traditional Standard (9/26/52/26)` |
| `EMB` | `Short Only / All-Time` | `7/26/44/30` |
| `GLD` | `Both / All-Time` | `11/30/52/22` |
| `GLD` | `Long Only / All-Time` | `11/30/44/26` |
| `HYG` | `Both / All-Time` | `20/61/120/24` |
| `HYG` | `Short Only / All-Time` | `20/61/120/24` |
| `IEF` | `Both / All-Time` | `14/40/80/64` |
| `IEF` | `Short Only / All-Time` | `18/52/80/64` |
| `IWM` | `Both / All-Time` | `7/26/60/22` |
| `IWM` | `Long Only / All-Time` | `20/73/96/30` |
| `IYR` | `Both / All-Time` | `20/49/96/30` |
| `IYR` | `Long Only / All-Time` | `20/49/120/30` |
| `KRE` | `Both / All-Time` | `Traditional Standard (9/26/52/26)` |
| `KRE` | `Long Only / All-Time` | `24/61/96/36` |
| `LQD` | `Both / All-Time` | `Traditional Standard (9/26/52/26)` |
| `LQD` | `Short Only / All-Time` | `9/26/60/30` |
| `MUB` | `Both / All-Time` | `7/22/60/22` |
| `MUB` | `Short Only / All-Time` | `11/26/44/22` |
| `SHY` | `Short Only / All-Time` | `16/61/96/30` |
| `SPY` | `Long Only / All-Time` | `22/64/104/52` |
| `SPY` | `Long Only / Last 3 Years` | `7/22/44/30` |
| `TIP` | `Both / All-Time` | `11/30/44/26` |
| `TIP` | `Both / Last 3 Years` | `7/26/44/30` |
| `TLT` | `Long Only / All-Time` | `18/40/128/64` |
| `TLT` | `Short Only / All-Time` | `24/49/120/36` |
| `UUP` | `Both / All-Time` | `22/52/80/52` |
| `UUP` | `Long Only / All-Time` | `22/52/80/40` |
| `XHB` | `Long Only / All-Time` | `24/49/96/36` |
| `XHB` | `Long Only / Last 3 Years` | `24/49/144/36` |
| `XLE` | `Long Only / All-Time` | `24/49/120/30` |
| `XLE` | `Long Only / Last 3 Years` | `24/49/96/36` |
| `XLF` | `Both / All-Time` | `Traditional Standard (9/26/52/26)` |
| `XLF` | `Long Only / All-Time` | `20/73/144/30` |

## Asset-Family Interpretation

### Crypto

- `BTC` stayed crypto / doubled sensitive
- `ETH` shifted toward a faster standard-style cloud
- `SOL` settled into a fast standard-style cloud

Interpretation:

- crypto is not one homogeneous bucket
- `BTC` behaves differently from `ETH` and `SOL`

### Commodity / Gold

- `GLD` emerged as one of the strongest and cleanest winners in the whole run
- it favored fast standard-style weekly clouds

Interpretation:

- gold responded very well to symbol-specific cloud tuning

### Credit / Bonds / Rates

- `LQD`, `EMB`, `MUB`, `IEF`, `SHY`, and `TLT` all showed meaningful short-side or both-direction behavior
- several of them preferred standard or doubled neighborhoods rather than crypto-style ones

Interpretation:

- the short-side and both-direction logic is genuinely useful in this part of the universe

### Equity / Beta / Financials

- `SPY` leaned doubled for all-time long behavior and faster standard for last-3-years long behavior
- `KRE`, `XHB`, `XLE`, and `XLF` showed more mixed behavior
- several high-beta equity proxies still leaned crypto-style

Interpretation:

- equities are not one clean family either
- some behave like macro / doubled structures
- some behave more like beta / crypto structures

## Final Conclusion

Phase 2 does not support one universal cloud.

It supports this model:

1. Use a faster standard neighborhood as the broad default.
2. Use a crypto-style neighborhood for `BTC` and several beta-sensitive symbols.
3. Use a doubled-style neighborhood for selected macro, index, and rate-sensitive contexts.
4. Promote ticker-specific settings only where the evidence is clearly stronger than the family default.

In practical terms:

- the repo should not market one “best cloud”
- it should market an evidence-based family of defaults
- Phase 2 makes the strategy layer more useful because it shows where symbol-sensitive clouds are worth the complexity

