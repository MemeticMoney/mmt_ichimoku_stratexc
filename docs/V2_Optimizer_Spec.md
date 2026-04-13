# V2 Optimizer Design Spec

This document defines the V2 optimizer workflow for the `MMT Ichi Workflow Strategy`.

The goal is to build a local optimizer harness that can run structured cloud-setting trials through TradingView and surface the strongest settings per ticker, timeframe, window, and direction mode.

## Objective

Use the strategy layer to run repeated, structured backtests and answer:

- which cloud settings perform best on a given ticker
- which settings are best `all-time`
- which settings are best over the `last 3 years`
- which settings are strongest on each timeframe from `15m` through `1W`
- which settings are `best` versus which settings are `most robust`
- which settings are strongest for `Long Only`, `Short Only`, and `Both`

## Why V2 Should Be External

The optimizer should not live entirely inside Pine.

Recommended architecture:

- `TradingView strategy` remains the backtest truth source
- `External harness` drives the trials
- `TradingView MCP` reads results and changes inputs between runs

This is the right split because Pine is excellent at strategy logic, but poor at large parameter sweeps. An external harness can:

- iterate many input sets
- change symbols and timeframes
- switch test windows
- collect results into structured tables
- rank results across many runs

## V2 Scope

### In Scope

- Optimize `cloud settings` only
- Run tests per `ticker`
- Run tests on:
  - `15m`
  - `1H`
  - `4H`
  - `1D`
  - `3D`
  - `1W`
- Run tests across direction modes:
  - `Long Only`
  - `Short Only`
  - `Both`
- Produce two result families:
  - `All-Time Best`
  - `Last 3 Years Best`
- Rank by:
  - `Profit Factor`
  - `Win Rate`
- Apply quality gates so the optimizer does not overfit to bad backtests

### Out of Scope for First V2

- Optimizing modules independently
  - `Breakout`
  - `Checklist`
  - `Kijun Bounce`
- Optimizing commission, slippage, or sizing
- Optimizing target or invalidation formulas
- Rewriting the cloud model itself

Direction mode is part of the test matrix in V2, but it is not part of the parameter search itself. We still isolate `cloud settings` first and keep the rest fixed.

## Fixed Variables for V2.0

These should stay fixed during the first optimizer build:

| Variable | Recommended Fixed Value |
| --- | --- |
| Enabled modules | `Breakout + Checklist + Kijun Bounce` |
| Position sizing | `75% of equity` |
| Commission | `0.1%` |
| Slippage | `1` |
| Pyramiding | `0` |
| Signal timing | `bar-close confirmed` |

Why:

- It keeps the experiment focused
- It avoids confounding cloud optimization with other model changes
- It matches the current validated production profile

Direction mode should still be tested as three separate run families:

- `Long Only`
- `Short Only`
- `Both`

That gives us three parallel result sets without turning direction into another optimizer variable.

## What Counts as “Cloud Settings”

For this optimizer, `cloud settings` means:

- `Conversion`
- `Base`
- `Span B`
- `Displacement`

These map directly to the existing custom inputs in the strategy:

- `Custom Conversion`
- `Custom Base`
- `Custom Span B`
- `Custom Displacement`

## Candidate Families

The optimizer should use a `staged search`, not a full brute-force search on day one.

### Phase 1: Preset Sweep

Test the built-in families first:

| Family | Settings |
| --- | --- |
| Traditional Standard | `9 / 26 / 52 / 26` |
| Traditional Doubled | `18 / 52 / 104 / 52` |
| Crypto Doubled | `20 / 61 / 120 / 30` |

This gives us a fast first answer and tells us which family deserves deeper exploration.

### Phase 2: Neighborhood Search

For the top preset families from Phase 1, run a constrained custom search around them.

Recommended approach:

- treat the winning preset as a `seed`
- generate nearby custom variants
- only test values that preserve basic Ichimoku structure

Suggested constraints:

- `conversion < base < spanB`
- `base` must be materially larger than `conversion`
- `spanB` must be materially larger than `base`
- `displacement` must stay within a reasonable bounded range

This is much safer than testing arbitrary random tuples.

### Phase 3: Robustness Selection

After we have raw winners, separate:

- `Best` setting
  - strongest single result
- `Robust` setting
  - strongest cross-timeframe consistency

That second result matters more if we intend to promote a winner into the production model.

## Test Matrix

For each ticker, the optimizer should test:

| Dimension | Values |
| --- | --- |
| Timeframes | `15m`, `1H`, `4H`, `1D`, `3D`, `1W` |
| Direction modes | `Long Only`, `Short Only`, `Both` |
| Windows | `All-Time`, `Last 3 Years` |
| Cloud candidates | Phase 1 presets, then Phase 2 custom candidates |

This means each ticker produces:

- per-timeframe winners
- per-window winners
- cross-timeframe summary winners

## Date Windows

We need two official windows:

### 1. All-Time

- Use the full available history loaded by the strategy

### 2. Last 3 Years

- Use a rolling 3-year window ending on the run date

### Important Design Requirement

To test `Last 3 Years` cleanly, the strategy should eventually support explicit date-window controls.

Recommended future strategy inputs:

- `Backtest Window Mode`
  - `All-Time`
  - `Last 3 Years`
  - `Custom`
- `Start Date`
- `End Date`

Without this, the optimizer would have to rely on chart-history or visible-range workarounds, which is much less reliable.

This requirement is now satisfied in the local V2 branch by adding:

- `Backtest Window`
- `Custom Start`
- `Custom End`

## Higher Timeframe Policy

The optimizer should not optimize HTF selection in V2.0. It should use a fixed mapping.

Recommended default map:

| Base Timeframe | HTF |
| --- | --- |
| `15m` | `1H` |
| `1H` | `4H` |
| `4H` | `1D` |
| `1D` | `1W` |
| `3D` | `1W` |
| `1W` | `1M` |

Reason:

- this is a cleaner “next timeframe up” policy
- it prevents the optimizer from mixing cloud optimization with timeframe-pair optimization

If we want, we can later support a `legacy map` or `custom map`, but that should be a later phase.

## Quality Gates

If we optimize purely on profit factor and win rate, we will overfit.

So the optimizer should first apply hard filters.

Recommended gates:

| Metric | Gate |
| --- | --- |
| Closed trades | minimum count required |
| Net profit | must be positive |
| Max drawdown | must remain below threshold |
| Margin calls | must be zero |

Suggested default thresholds:

| Window | Minimum Trades | Max Drawdown |
| --- | --- | --- |
| All-Time | `10` | `40%` |
| Last 3 Years | `6` | `40%` |

If a ticker produces no passing candidates, the optimizer can log that and optionally retry with a relaxed fallback drawdown cap.

These gates should remain configurable in the harness so we can raise them later for lower timeframes if needed.

## Ranking Logic

After quality gates are applied, rank candidates in this order:

### Single-Run Ranking

1. `Profit Factor` descending
2. `Win Rate` descending
3. `Net Profit %` descending
4. `Max Drawdown %` ascending
5. `Trade Count` descending

This keeps the user’s requested metrics front and center while still preferring more tradable profiles.

### Cross-Timeframe Robustness Ranking

For “robust” winners, rank candidates by:

1. `Pass rate` across tested timeframes
2. `Median Profit Factor`
3. `Median Win Rate`
4. `Median Net Profit %`
5. `Median Max Drawdown %` ascending

This helps prevent a setting from winning only because of one lucky timeframe.

## Output Files

The optimizer should produce structured outputs for each run.

Recommended outputs:

- `raw_trials.csv`
  - one row per ticker / timeframe / window / cloud setting
- `best_by_timeframe.csv`
- `best_by_window.csv`
- `robust_summary.csv`
- `best_settings.json`
  - machine-readable winner set
- `report.md`
  - human-readable summary

## Recommended Local Architecture

This is the architecture I recommend when we build:

### Harness

Use a local script runner that:

- opens the chart
- sets symbol and timeframe
- sets strategy inputs
- requests strategy results
- records metrics

### TradingView Control Layer

Use `tradingview-mcp` to:

- set symbol
- set timeframe
- change strategy inputs
- read strategy tester metrics
- read trades if needed for diagnostics

### Analysis Layer

Use a local analysis program to:

- store trial rows
- apply ranking rules
- compute per-ticker winners
- compute robust cross-timeframe winners
- write final summary tables

## Minimal Strategy Changes Needed Before Build

Before the optimizer is implemented, I recommend two small strategy-side upgrades:

### 1. Backtest Window Controls

Add inputs for:

- `All-Time`
- `Last 3 Years`
- `Custom Start`
- `Custom End`

This is the most important missing feature for reliable automation.

### 2. Optimizer-Friendly Display Mode

Add an optional input that can reduce chart clutter during machine-driven test runs:

- hide markers
- hide invalidation line
- hide validation dashboard if desired

This is not required for correctness, but it makes repeated runs cleaner and faster.

## Proposed Trial Workflow

For each ticker:

1. Run preset sweep on all timeframes and both date windows
2. Identify top preset family per timeframe/window
3. Run neighborhood search around the best family
4. Apply quality gates
5. Rank best per timeframe/window
6. Compute robust winner across all tested timeframes
7. Save results and summary report

## Deliverables We Want From V2

For each ticker, we want these answers:

### All-Time

- best cloud settings on `4H`
- best cloud settings on `1D`
- best cloud settings on `3D`
- best cloud settings on `1W`
- most robust all-time cloud settings across the whole timeframe set

### Last 3 Years

- best cloud settings on `4H`
- best cloud settings on `1D`
- best cloud settings on `3D`
- best cloud settings on `1W`
- most robust 3-year cloud settings across the whole timeframe set

## Recommended Implementation Order

### Phase A

- add backtest-window inputs to the strategy
- verify we can set those inputs through TradingView MCP

### Phase B

- build preset sweep runner
- save raw results
- generate first summary tables

### Phase C

- add neighborhood search around the top preset families
- add robust winner selection

### Phase D

- promote stable winners into candidate production presets

## What I Recommend We Decide Before Coding

These are the only choices I would still want us to lock before implementation:

1. Which tickers are in the first test universe
2. Whether `3D` is definitely part of the core timeframe set
3. Whether we want strict HTF mapping or a custom HTF map
4. Whether the first optimizer run should remain `Long Only`

My recommendation remains:

- use `Long Only` first
- keep `3D` in the matrix
- use strict HTF mapping
- start with preset sweep before any custom search

## One-Line Summary

V2 should be a local optimizer harness that uses TradingView MCP to run structured cloud-setting trials against the strategy, first by preset family, then by constrained custom search, with separate winners for `All-Time`, `Last 3 Years`, and cross-timeframe robustness.
