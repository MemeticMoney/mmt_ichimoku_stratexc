# TradingView Publication Notes

This document records the public TradingView publication state and target public script set for the scripts in this repository.

## Live Publication Status

Three scripts are currently published publicly on TradingView under the `memeticmoney` profile.

- Profile page:
  - [memeticmoney published scripts](https://www.tradingview.com/u/memeticmoney/#published-scripts)
- Current live titles:
  - `MMT Ichi Workflow Overlay`
  - `MMT Ichi Workflow Strategy`
  - `MMT Ichi Workflow Overlay Profiles`

Additional source-included scripts are available for review before any public TradingView publication:

- `MMT IchiOP Crypto Doubled Strategy`
- `MMT Ichi 2D Overlay Profiles`
- `MMT Ichi 2D Overlay Profiles Strategy`

## Naming Note

The repository and the TradingView publications use the same `MMT Ichi Workflow` naming so GitHub and TradingView stay aligned.

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

### Overlay Profiles Description

`MMT Ichi Workflow Overlay Profiles` is the symbol-profile-aware execution companion for the base workflow.

It is intended for operators who want the overlay layer to switch into ticker-specific defaults where a vetted profile exists.

It displays:

- the same core execution dashboard as the base overlay
- the active profile label and resolved cloud lengths
- ticker-specific direction defaults where defined
- breakout, checklist, Kijun bounce, and edge-to-edge conditions
- flat-Kumo targets and invalidation levels

Default behavior:

- symbol profiles enabled
- falls back to manual settings when no profile exists
- keeps the same chart-side execution role as the standard overlay

The profile strategy companion is included in source for validation workflows, with most chart visuals hidden by default.

### 2D Overlay Profiles Description

`MMT Ichi 2D Overlay Profiles` is the 2D-specific execution layer for the optimized profile model.

It displays:

- the active 2D profile label and resolved cloud lengths
- ticker-specific confirmation timeframe and direction defaults
- a `2D OK` / `USE 2D` timeframe state
- the same trade-call, target, and invalidation concepts as the profile overlay

Default behavior:

- symbol profiles enabled
- designed for `2D` charts
- falls back to manual controls when no profile exists

### 2D Overlay Profiles Strategy Description

`MMT Ichi 2D Overlay Profiles Strategy` is the validation companion for the 2D overlay.

It uses:

- the same 2D profile table as the overlay
- 75% equity sizing
- 0.1% commission
- 1 tick slippage
- no pyramiding

The 4H confirmation results from research remain experimental review items and are not the default promoted settings.

## Suggested Tags

Recommended custom tags:

- `ichimoku`
- `trend`
- `trend-following`
- `kumo`
- `cloud`
- `strategy`
- `overlay`
- `profiles`
- `2D`
- `crypto`

For the built-in category menu, choose the closest available trend-analysis and strategy categories shown in the TradingView publish form.

## Clean Chart Checklist

Before publishing:

- Remove all unrelated indicators.
- Remove drawings and notes.
- Use a clean symbol and timeframe.
- Make sure only the script being published is visible.
- If publishing the strategy, make sure the Strategy Tester output looks reasonable and not misleading.
- If publishing the profiles overlay, confirm the active profile label and direction default are correct on a covered ticker.
- If publishing the 2D pair, confirm the chart is set to `2D` and the dashboard shows `2D OK`.
- Avoid screenshots that look promotional or over-decorated.

## Publish Order

Recommended sequence for future updates:

1. Update the Pine source locally.
2. Review the chart preview for the script being updated.
3. If updating a profile-aware or 2D script, confirm it should remain a separate public script instead of replacing the base overlay.
4. Update the existing public script if the change is minor and the live page already looks clean.
5. Recheck the profile `Scripts` tab after the update lands.

## Suggested First Release Notes

### Overlay Release Notes

Initial public release of the execution layer for the Ichimoku workflow.

### Strategy Release Notes

Initial public release of the validation and backtesting layer for the Ichimoku workflow.

### Overlay Profiles Release Notes

Public release of the symbol-profile-aware execution overlay for the Ichimoku workflow.

### 2D Overlay Profiles Release Notes

Public review release of the 2D-specific profile overlay and validation strategy for the core optimized symbol set.

## GitHub Alignment

GitHub should mirror the public TradingView release set:

- use the same TradingView titles as the source scripts where applicable
- link to the public TradingView profile page
- keep GitHub as the canonical source repository
- use TradingView as the chart-user distribution layer
- keep `MMFE` scripts and intermarket research out of this public repository
