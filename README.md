# MemeticMoney Ichimoku Strategy Execution

Open-source TradingView Pine scripts for an Ichimoku-based two-layer workflow:

- `pine/Ichi_Workflow_Overlay.pine`
- `pine/Ichi_Workflow_Strategy.pine`

Created by MemeticMoney.

## What This Repo Contains

- `MemeticMoney Ichi Workflow Overlay`
  - A chart-side execution layer for discretionary decision support
  - Dual-timeframe Ichimoku scorecard
  - Visible trade markers, regime shading, flat-Kumo targets, invalidation, and trade-call guidance
- `MemeticMoney Ichi Workflow Strategy`
  - A validation layer for backtesting the same core model on the current symbol and timeframe
  - Strategy Tester integration
  - Order-fill alert payloads
  - Validation dashboard for quick ticker assessment

## Defaults

- Preset: `Crypto Doubled`
- Ichimoku lengths: `20 / 61 / 120 / 30`
- Higher timeframe confirmation: `D`
- Direction filter: `Long Only`
- Strategy sizing: `75% of equity`
- Signal model: bar-close confirmed

## File Layout

- [`pine/Ichi_Workflow_Overlay.pine`](./pine/Ichi_Workflow_Overlay.pine)
- [`pine/Ichi_Workflow_Strategy.pine`](./pine/Ichi_Workflow_Strategy.pine)
- [`docs/Ichi_Workflow_Metrics.md`](./docs/Ichi_Workflow_Metrics.md)
- [`DISCLAIMER.md`](./DISCLAIMER.md)

## How To Use

1. Open the TradingView Pine Editor.
2. Create a new indicator and paste in `pine/Ichi_Workflow_Overlay.pine`.
3. Create a new strategy and paste in `pine/Ichi_Workflow_Strategy.pine`.
4. Add both to the same chart.
5. Use the strategy layer to validate the current ticker and timeframe.
6. Use the overlay layer to manage live chart decisions.

## Notes

- The overlay includes alert conditions, but it is fully usable without alerts.
- The strategy excludes edge-to-edge auto-orders by design.
- Flat-Kumo levels are used as visual targets.
- The scripts are intended for TradingView-native use.

## Attribution

Copyright (c) 2026 MemeticMoney.

## License

Released under the MIT License. See [`LICENSE`](./LICENSE).
