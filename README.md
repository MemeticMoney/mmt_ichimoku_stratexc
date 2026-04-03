# MemeticMoney Ichimoku Strategy Execution

Open-source TradingView Pine v6 scripts for a two-layer Ichimoku workflow.

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
  - Pine script title in this repo: `MMT Ichi Workflow Overlay`
- [`pine/Ichi_Workflow_Strategy.pine`](./pine/Ichi_Workflow_Strategy.pine)
  - Pine script title in this repo: `MMT Ichi Workflow Strategy`

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

More detail on the dashboards is in [`docs/Ichi_Workflow_Metrics.md`](./docs/Ichi_Workflow_Metrics.md).

TradingView publication prep notes are in [`docs/TRADINGVIEW_PUBLICATION.md`](./docs/TRADINGVIEW_PUBLICATION.md).

## Design Notes

- The overlay is fully usable without live alerts.
- The strategy excludes edge-to-edge auto-orders by design.
- Flat-Kumo levels are visual targets, not guaranteed exits.
- Everything is intended for TradingView-native use.

## Repository Layout

- [`pine/Ichi_Workflow_Overlay.pine`](./pine/Ichi_Workflow_Overlay.pine)
- [`pine/Ichi_Workflow_Strategy.pine`](./pine/Ichi_Workflow_Strategy.pine)
- [`docs/Ichi_Workflow_Metrics.md`](./docs/Ichi_Workflow_Metrics.md)
- [`docs/TRADINGVIEW_PUBLICATION.md`](./docs/TRADINGVIEW_PUBLICATION.md)
- [`DISCLAIMER.md`](./DISCLAIMER.md)
- [`LICENSE`](./LICENSE)

## Attribution

Copyright (c) 2026 MemeticMoney.

## Disclaimer

This project is for educational and research use only. See [`DISCLAIMER.md`](./DISCLAIMER.md).

## License

Released under the MIT License. See [`LICENSE`](./LICENSE).
