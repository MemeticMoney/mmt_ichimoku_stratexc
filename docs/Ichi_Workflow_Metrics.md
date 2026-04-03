# Ichi Workflow Metrics

This note explains the dashboard fields used by the public Pine scripts.

## Overlay Dashboard

The overlay dashboard is the execution console.

Fields:

- `Chart`
  - The active symbol and timeframe
- `Preset`
  - The active Ichimoku preset and lengths
- `CTF Score`
  - Current timeframe score from `-4` to `+4`
- `HTF Score`
  - Higher timeframe score from `-4` to `+4`
- `Regime`
  - `Bull`, `Bear`, or `Neutral`
- `Trade Call` or `Active Setup`
  - `NO TRADE RIGHT NOW` when no setup is active
  - Otherwise the current active setup
- `Wait For` or `Execution`
  - Next condition to wait for when no setup is active
  - Or the current execution row in compact form:
    - `E` = entry
    - `T` = target
    - `X` = invalidation

## Score Components

Each timeframe score is built from four components:

- `Price vs Cloud`
  - `+1` above cloud
  - `0` inside cloud
  - `-1` below cloud
- `Future Cloud`
  - `+1` bullish
  - `-1` bearish
- `TK Alignment`
  - `+1` Tenkan above Kijun
  - `-1` Tenkan below Kijun
- `Chikou Confirmation`
  - `+1`, `0`, or `-1` based on lagging-span confirmation

## Strategy Validation Card

The strategy dashboard is the validation layer for the currently selected chart.

Fields:

- `Chart`
- `Model`
- `Modules`
- `Net P/L`
- `Profit Factor`
- `Max DD`
- `Trades / Win`
- `Verdict`

## Intended Workflow

1. Select a symbol and timeframe.
2. Check the strategy validation card first.
3. If the ticker looks tradable, use the overlay for execution decisions.
