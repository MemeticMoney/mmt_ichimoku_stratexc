# TradingView Publication Notes

This document records the live TradingView publication details for the scripts in this repository.

## Live Publication Status

Both scripts are published publicly on TradingView under the `memeticmoney` profile.

- Profile page:
  - [memeticmoney published scripts](https://www.tradingview.com/u/memeticmoney/#published-scripts)
- Public titles:
  - `MMT Ichi Workflow Overlay`
  - `MMT Ichi Workflow Strategy`

## Naming Note

The repository and the TradingView publications now use the same `MMT Ichi Workflow` naming so GitHub and TradingView stay aligned.

## Public Script Descriptions

### Overlay Description

`MMT Ichi Workflow Overlay` is a chart-side execution layer built around a dual-timeframe Ichimoku workflow.

It displays:

- current timeframe score
- higher timeframe confirmation score
- regime state
- active trade call
- setup markers
- flat-Kumo targets
- invalidation levels

The overlay is designed for discretionary chart reading and does not place trades.

Default model:

- Crypto Doubled preset
- 20 / 61 / 120 / 30
- higher timeframe confirmation enabled
- bar-close confirmed logic

### Strategy Description

`MMT Ichi Workflow Strategy` is the validation layer for the same Ichimoku model used by the overlay.

It is intended to answer whether the currently selected ticker and timeframe behave well with this workflow.

It displays:

- model summary
- module summary
- net profit
- profit factor
- max drawdown
- trades and win rate
- overall verdict

Default model:

- Crypto Doubled preset
- 20 / 61 / 120 / 30
- Long Only
- 75% of equity
- bar-close confirmed entries

This strategy is intended for research and validation, not trade automation or financial advice.

## Suggested Tags

Recommended custom tags:

- `ichimoku`
- `trend`
- `trend-following`
- `kumo`
- `cloud`
- `strategy`
- `overlay`
- `crypto`

For the built-in category menu, choose the closest available trend-analysis and strategy categories shown in the TradingView publish form.

## Clean Chart Checklist

Before publishing:

- Remove all unrelated indicators.
- Remove drawings and notes.
- Use a clean symbol and timeframe.
- Make sure only the script being published is visible.
- If publishing the strategy, make sure the Strategy Tester output looks reasonable and not misleading.
- Avoid screenshots that look promotional or over-decorated.

## Publish Order

Recommended sequence for future updates:

1. Update the Pine source locally.
2. Review the chart preview for the script being updated.
3. Update the existing public script if the change is minor and the live page already looks clean.
4. Recheck the profile `Scripts` tab after the update lands.

## Suggested First Release Notes

### Overlay Release Notes

Initial public release of the execution layer for the Ichimoku workflow.

### Strategy Release Notes

Initial public release of the validation and backtesting layer for the Ichimoku workflow.

## GitHub Alignment

GitHub should mirror the live TradingView release:

- use the same `MMT Ichi Workflow Overlay` and `MMT Ichi Workflow Strategy` titles
- link to the public TradingView profile page
- keep GitHub as the canonical source repository
- use TradingView as the chart-user distribution layer
