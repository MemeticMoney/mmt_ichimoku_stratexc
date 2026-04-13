# MMT Ichi Workflow

Open-source TradingView Pine v6 scripts for the public `MMT Ichi Workflow` family.

Created by MemeticMoney.

## Overview

This repository separates Ichimoku trading into base, profile-aware, and 2D-specific jobs:

- `Overlay`
  - The execution layer
  - Reads the current chart, shows trade calls, marks setups, and displays targets and invalidation
- `Strategy`
  - The validation layer
  - Backtests the same core model on the currently selected ticker and timeframe
- `Overlay Profiles`
  - The profile-aware execution layer
  - Applies symbol-specific Ichimoku settings and direction defaults where a profile exists
- `Overlay Profiles Strategy`
  - The profile-aware validation layer
  - Backtests the same profile-aware model while keeping visual output hidden by default
- `2D Overlay Profiles`
  - The 2D-specific execution layer
  - Applies the optimized 2D core-8 profiles and warns when used away from a `2D` chart
- `2D Overlay Profiles Strategy`
  - The 2D-specific validation layer
  - Backtests the optimized 2D profile model with the same 75% equity strategy defaults

The idea is simple:

1. Validate the ticker with the strategy layer.
2. Execute with the matching overlay layer.
3. Use the 2D pair only when you are intentionally reviewing a `2D` chart.

## Included Scripts

- [`pine/Ichi_Workflow_Overlay.pine`](./pine/Ichi_Workflow_Overlay.pine)
  - TradingView title: `MMT Ichi Workflow Overlay`
- [`pine/Ichi_Workflow_Strategy.pine`](./pine/Ichi_Workflow_Strategy.pine)
  - TradingView title: `MMT Ichi Workflow Strategy`
- [`pine/Ichi_Workflow_Overlay_Profiles.pine`](./pine/Ichi_Workflow_Overlay_Profiles.pine)
  - TradingView title: `MMT Ichi Workflow Overlay Profiles`
- [`pine/Ichi_Workflow_Overlay_Profiles_Strategy.pine`](./pine/Ichi_Workflow_Overlay_Profiles_Strategy.pine)
  - TradingView title: `MMT IchiOP Crypto Doubled Strategy`
- [`pine/Ichi_2D_Overlay_Profiles.pine`](./pine/Ichi_2D_Overlay_Profiles.pine)
  - TradingView title: `MMT Ichi 2D Overlay Profiles`
- [`pine/Ichi_2D_Overlay_Profiles_Strategy.pine`](./pine/Ichi_2D_Overlay_Profiles_Strategy.pine)
  - TradingView title: `MMT Ichi 2D Overlay Profiles Strategy`

## TradingView Status

- Profile scripts page: [`memeticmoney` on TradingView](https://www.tradingview.com/u/memeticmoney/#published-scripts)
- Current live public titles:
  - `MMT Ichi Workflow Overlay`
  - `MMT Ichi Workflow Strategy`
  - `MMT Ichi Workflow Overlay Profiles`
- Additional source-included review candidates:
  - `MMT IchiOP Crypto Doubled Strategy`
  - `MMT Ichi 2D Overlay Profiles`
  - `MMT Ichi 2D Overlay Profiles Strategy`

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

## What The Profile Scripts Do

- Apply symbol-profile defaults when a covered ticker is detected
- Keep manual Ichimoku controls available for non-profile symbols
- Add profile-aware direction handling
- Preserve the same on-chart guidance style as the base overlay
- Expose the profile used in the dashboard so the operator can verify the active model
- Provide a matching strategy variant for profile-aware backtesting

## What The 2D Scripts Do

- Use the same profile-aware signal engine on a `2D` chart
- Apply optimized 2D profiles for the core symbols tested in the 2D pass
- Carry a timeframe warning when the chart is not set to `2D`
- Keep experimental lower-timeframe confirmation results out of the default promoted profiles
- Provide a matching strategy for 2D-specific validation

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
- [`docs/Phase2_2D_Findings_Report.md`](./docs/Phase2_2D_Findings_Report.md)
- [`docs/Phase2_Public_Update.md`](./docs/Phase2_Public_Update.md)

## Quick Start

1. Open the TradingView Pine Editor.
2. Create a new indicator and paste in [`pine/Ichi_Workflow_Overlay.pine`](./pine/Ichi_Workflow_Overlay.pine).
3. Create a new strategy and paste in [`pine/Ichi_Workflow_Strategy.pine`](./pine/Ichi_Workflow_Strategy.pine).
4. Optionally create a second indicator and paste in [`pine/Ichi_Workflow_Overlay_Profiles.pine`](./pine/Ichi_Workflow_Overlay_Profiles.pine).
5. For profile-specific validation, create a strategy from [`pine/Ichi_Workflow_Overlay_Profiles_Strategy.pine`](./pine/Ichi_Workflow_Overlay_Profiles_Strategy.pine).
6. For 2D testing, create the 2D overlay and strategy from [`pine/Ichi_2D_Overlay_Profiles.pine`](./pine/Ichi_2D_Overlay_Profiles.pine) and [`pine/Ichi_2D_Overlay_Profiles_Strategy.pine`](./pine/Ichi_2D_Overlay_Profiles_Strategy.pine).
7. Add the matching strategy plus one overlay variant to the same chart.
8. Read the strategy card first.
9. If the ticker looks valid, use the matching overlay for trade execution decisions.

## Recommended Workflow

1. Select a ticker and timeframe in TradingView.
2. Check the strategy layer for `Net P/L`, `Profit Factor`, `Max DD`, `Trades / Win`, and `Verdict`.
3. If the strategy layer looks acceptable, shift to the overlay layer.
4. Use the standard overlay for manual preset control.
5. Use the overlay profiles script when you want symbol-specific profile routing.
6. Use the 2D pair only on `2D` charts and verify the dashboard says `2D OK`.
7. Read `CTF Score`, `HTF Score`, `Regime`, `Trade Call`, and `Execution`.

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
- [`docs/Phase2_2D_Findings_Report.md`](./docs/Phase2_2D_Findings_Report.md)
  - Focused 2D-vs-3D research summary for the core 8
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
- Profile-aware strategy variants hide most chart visuals by default so Strategy Tester can be reviewed without clutter.
- The 2D pair is intentionally separate instead of a toggle inside the 3D/profile scripts.
- The strategy excludes edge-to-edge auto-orders by design.
- Flat-Kumo levels are visual targets, not guaranteed exits.
- Everything is intended for TradingView-native use.

## Repository Layout

- [`pine/Ichi_Workflow_Overlay.pine`](./pine/Ichi_Workflow_Overlay.pine)
- [`pine/Ichi_Workflow_Strategy.pine`](./pine/Ichi_Workflow_Strategy.pine)
- [`pine/Ichi_Workflow_Overlay_Profiles.pine`](./pine/Ichi_Workflow_Overlay_Profiles.pine)
- [`pine/Ichi_Workflow_Overlay_Profiles_Strategy.pine`](./pine/Ichi_Workflow_Overlay_Profiles_Strategy.pine)
- [`pine/Ichi_2D_Overlay_Profiles.pine`](./pine/Ichi_2D_Overlay_Profiles.pine)
- [`pine/Ichi_2D_Overlay_Profiles_Strategy.pine`](./pine/Ichi_2D_Overlay_Profiles_Strategy.pine)
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
