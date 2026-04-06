# MMT Ichi Workflow

Open-source TradingView Pine v6 scripts for the live `MMT Ichi Workflow` overlay and strategy.

Created by MemeticMoney.

## Overview

This repository separates Ichimoku trading into two jobs:

- `Overlay`
  - The execution layer
  - Reads the current chart, shows trade calls, marks setups, and displays targets and invalidation
- `Strategy`
  - The validation layer
  - Backtests the same core model on the currently selected ticker and timeframe

The idea is simple:

1. Validate the ticker with the strategy layer.
2. Execute with the overlay layer.

## Included Scripts

- [`pine/Ichi_Workflow_Overlay.pine`](./pine/Ichi_Workflow_Overlay.pine)
  - TradingView title: `MMT Ichi Workflow Overlay`
- [`pine/Ichi_Workflow_Strategy.pine`](./pine/Ichi_Workflow_Strategy.pine)
  - TradingView title: `MMT Ichi Workflow Strategy`

## Published On TradingView

- Profile scripts page: [`memeticmoney` on TradingView](https://www.tradingview.com/u/memeticmoney/#published-scripts)
- Public script titles:
  - `MMT Ichi Workflow Overlay`
  - `MMT Ichi Workflow Strategy`

If TradingView search lags, the profile scripts page is the most reliable place to find the live publications.

## What The Overlay Does

- Builds a dual-timeframe Ichimoku scorecard
- Shows current regime as `Bull`, `Bear`, or `Neutral`
- Displays trade-call guidance directly on chart
- Highlights breakout, checklist, Kijun bounce, and edge-to-edge conditions
- Draws flat-Kumo targets and invalidation levels

## What The Strategy Does

- Uses the same core Ichimoku logic as the overlay
- Backtests the current chart symbol and timeframe
- Displays a validation card for quick ticker assessment
- Emits order-fill alert payloads if you choose to use strategy alerts

## Default Model

- Preset: `Crypto Doubled`
- Ichimoku lengths: `20 / 61 / 120 / 30`
- Higher timeframe confirmation: `D`
- Direction filter: `Long Only`
- Strategy sizing: `75% of equity`
- Signal model: bar-close confirmed

## Phase 2 Result

Phase 2 optimization showed that one Ichimoku cloud does not fit every market.

The strongest broad result was a faster standard-style neighborhood, while crypto-style and doubled-style neighborhoods still mattered in specific symbol groups.

The practical model after Phase 2 is:

- one broad default family
- one crypto / beta-sensitive alternate
- one doubled / macro-sensitive alternate
- symbol-specific refinement only where the evidence is strong

See:

- [`docs/Phase1_Findings_Report.md`](./docs/Phase1_Findings_Report.md)
- [`docs/Phase2_Findings_Report.md`](./docs/Phase2_Findings_Report.md)
- [`docs/Phase2_Public_Update.md`](./docs/Phase2_Public_Update.md)

## Quick Start

1. Open the TradingView Pine Editor.
2. Create a new indicator and paste in [`pine/Ichi_Workflow_Overlay.pine`](./pine/Ichi_Workflow_Overlay.pine).
3. Create a new strategy and paste in [`pine/Ichi_Workflow_Strategy.pine`](./pine/Ichi_Workflow_Strategy.pine).
4. Add both to the same chart.
5. Read the strategy card first.
6. If the ticker looks valid, use the overlay for trade execution decisions.

## Recommended Workflow

1. Select a ticker and timeframe in TradingView.
2. Check the strategy layer for `Net P/L`, `Profit Factor`, `Max DD`, `Trades / Win`, and `Verdict`.
3. If the strategy layer looks acceptable, shift to the overlay.
4. Use the overlay to read `CTF Score`, `HTF Score`, `Regime`, `Trade Call`, and `Execution`.

## Documentation

### Start Here

- [`docs/Ichi_Workflow_Executive_Flowchart.md`](./docs/Ichi_Workflow_Executive_Flowchart.md)
  - Best first read for most users
  - One-screen workflow showing how the strategy and overlay work together
- [`docs/Ichi_Workflow_Logic.md`](./docs/Ichi_Workflow_Logic.md)
  - Best second read
  - Full human-readable trading logic, state conditions, targets, and invalidations

### Reference

- [`docs/Ichi_Workflow_Metrics.md`](./docs/Ichi_Workflow_Metrics.md)
  - Dashboard field definitions
- [`docs/Ichi_Workflow_Flowchart.md`](./docs/Ichi_Workflow_Flowchart.md)
  - Full visual decision map with deeper state notes
- [`docs/Phase1_Findings_Report.md`](./docs/Phase1_Findings_Report.md)
  - Preset sweep conclusions
- [`docs/Phase2_Findings_Report.md`](./docs/Phase2_Findings_Report.md)
  - Final optimizer conclusions after custom neighborhood refinement
- [`docs/Phase2_Public_Update.md`](./docs/Phase2_Public_Update.md)
  - Public-facing Phase 2 summary
- [`docs/Phase2_Announcement_Thread.md`](./docs/Phase2_Announcement_Thread.md)
  - Social / thread draft based on final results
- [`docs/TRADINGVIEW_PUBLICATION.md`](./docs/TRADINGVIEW_PUBLICATION.md)
  - TradingView publication notes

The recommended reading order is:

1. Executive flowchart
2. Logic document
3. Metrics reference
4. Full flowchart deep dive

## Design Notes

- The overlay is fully usable without live alerts.
- The strategy excludes edge-to-edge auto-orders by design.
- Flat-Kumo levels are visual targets, not guaranteed exits.
- Everything is intended for TradingView-native use.

## Repository Layout

- [`pine/Ichi_Workflow_Overlay.pine`](./pine/Ichi_Workflow_Overlay.pine)
- [`pine/Ichi_Workflow_Strategy.pine`](./pine/Ichi_Workflow_Strategy.pine)
- [`docs/Ichi_Workflow_Metrics.md`](./docs/Ichi_Workflow_Metrics.md)
- [`docs/Ichi_Workflow_Logic.md`](./docs/Ichi_Workflow_Logic.md)
- [`docs/Ichi_Workflow_Flowchart.md`](./docs/Ichi_Workflow_Flowchart.md)
- [`docs/Ichi_Workflow_Executive_Flowchart.md`](./docs/Ichi_Workflow_Executive_Flowchart.md)
- [`docs/Phase1_Findings_Report.md`](./docs/Phase1_Findings_Report.md)
- [`docs/Phase2_Findings_Report.md`](./docs/Phase2_Findings_Report.md)
- [`docs/Phase2_Public_Update.md`](./docs/Phase2_Public_Update.md)
- [`docs/Phase2_Announcement_Thread.md`](./docs/Phase2_Announcement_Thread.md)
- [`docs/TRADINGVIEW_PUBLICATION.md`](./docs/TRADINGVIEW_PUBLICATION.md)
- [`DISCLAIMER.md`](./DISCLAIMER.md)
- [`LICENSE`](./LICENSE)

## Attribution

Copyright (c) 2026 MemeticMoney.

## Disclaimer

This project is for educational and research use only. See [`DISCLAIMER.md`](./DISCLAIMER.md).

## License

Released under the MIT License. See [`LICENSE`](./LICENSE).
