# TradingView Publication Prep

This document prepares the scripts in this repository for public publication on TradingView.

## Branding Note

The Pine files in this repository use `MMT` in their script titles.

For public TradingView publication, the safer path is to use neutral publication titles in the publish dialog, even if the underlying Pine title contains `MMT`.

Why:

- TradingView's publishing documentation says public script titles should not include advertisement or promotional text.
- TradingView's support guidance also says public scripts should not contain company names or external promotion.
- `MMT` may be accepted, but it could also be interpreted as a brand reference by moderation.

Recommended public TradingView titles:

- `Ichimoku Workflow Overlay`
- `Ichimoku Workflow Strategy`

Higher-risk optional titles:

- `MMT Ichimoku Workflow Overlay`
- `MMT Ichimoku Workflow Strategy`

Recommended approach:

1. Publish first with the neutral titles above.
2. Let your TradingView profile provide the authorship.
3. Keep the GitHub repository attributed to MemeticMoney.

## Public Script Descriptions

### Overlay Description

`Ichimoku Workflow Overlay` is a chart-side execution layer built around a dual-timeframe Ichimoku workflow.

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

`Ichimoku Workflow Strategy` is the validation layer for the same Ichimoku model used by the overlay.

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

Recommended sequence:

1. Publish a private draft first.
2. Review the script page.
3. Confirm title, description, and chart preview are clean.
4. Publish a separate public version once the draft looks correct.

## Suggested First Release Notes

### Overlay Release Notes

Initial public release of the execution layer for the Ichimoku workflow.

### Strategy Release Notes

Initial public release of the validation and backtesting layer for the Ichimoku workflow.

## GitHub Update After TradingView Publish

After both scripts are live on TradingView, add a short section to the GitHub README:

`Published on TradingView`

- `Ichimoku Workflow Overlay`: `<link>`
- `Ichimoku Workflow Strategy`: `<link>`

Keep GitHub as the canonical source repo, and use TradingView as the distribution layer for chart users.
