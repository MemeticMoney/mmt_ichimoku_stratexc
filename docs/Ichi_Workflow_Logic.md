# MMT Ichi Workflow Logic

This document explains the implemented trading logic for both public Pine scripts:

- `MMT Ichi Workflow Overlay`
- `MMT Ichi Workflow Strategy`

The code is the source of truth. This document is meant to translate that code into plain English.

## Core Rules

- All signals are `bar-close confirmed`.
- The higher timeframe (`HTF`) score uses the `last confirmed HTF bar`, not the still-forming one.
- Both scripts share the same base Ichimoku scoring model.
- The overlay is the `execution layer`.
- The strategy is the `validation / backtesting layer`.
- Default settings are:
  - Preset: `Crypto Doubled`
  - Lengths: `20 / 61 / 120 / 30`
  - HTF: `D`
  - Direction filter: `Long Only`
  - Strategy size: `75% of equity`

## Shared Scoring Model

Both scripts score the current timeframe and higher timeframe from `-4` to `+4`.

### Score Components

| Component | Bullish | Bearish | Neutral |
| --- | --- | --- | --- |
| Price vs Cloud | Close is above the current cloud top | Close is below the current cloud bottom | Close is inside the cloud or cloud data is not available |
| Future Cloud | Senkou Span A is above Senkou Span B | Senkou Span A is below Senkou Span B | Spans are equal or unavailable |
| TK Alignment | Tenkan is above Kijun | Tenkan is below Kijun | Values are equal or unavailable |
| Chikou Confirmation | Current close is above the displaced candle body and displaced cloud top | Current close is below the displaced candle body and displaced cloud bottom | Confirmation is mixed or unavailable |

### Score Meaning

| Score | Interpretation |
| --- | --- |
| `+4` | Full bullish checklist alignment |
| `+3` | Strong bullish alignment |
| `+2` | Enough bullish context for breakout-style continuation |
| `0` | Mixed / neutral structure |
| `-2` | Enough bearish context for breakdown-style continuation |
| `-3` | Strong bearish alignment |
| `-4` | Full bearish checklist alignment |

### Higher Timeframe Gate

| Direction | HTF Requirement |
| --- | --- |
| Long setups | `HTF Score >= +3` |
| Short setups | `HTF Score <= -3` |

### Direction Filter

| Filter | Effect |
| --- | --- |
| `Long Only` | Only long setups can trigger |
| `Short Only` | Only short setups can trigger |
| `Both` | Both long and short setups can trigger |

## Overlay Logic

The overlay is designed to answer: `What should I do on this chart right now?`

It does that with three things:

- a shared Ichimoku scorecard
- setup detection
- a recommendation state with entry, target, and invalidation

### Overlay Dashboard States

| Dashboard State | Condition | Meaning |
| --- | --- | --- |
| `Regime = Bull` | Current close is above the cloud | Price is trading in bullish cloud structure |
| `Regime = Bear` | Current close is below the cloud | Price is trading in bearish cloud structure |
| `Regime = Neutral` | Current close is inside the cloud or cloud data is incomplete | No clear cloud regime |
| `Trade Call = NO TRADE RIGHT NOW` | No active setup is currently being tracked | Stand aside and wait for alignment |
| `Trade Call = LONG RECOMMENDATION` | A long setup has just triggered and is still active | Long trade is being tracked |
| `Trade Call = SHORT RECOMMENDATION` | A short setup has just triggered and is still active | Short trade is being tracked |
| `Wait For` | No setup is active | Shows the next condition the overlay wants to see |
| `Execution` | A setup is active | Shows `E` entry, `T` target, and `X` invalidation |

### Overlay No-Trade Messages

When no setup is active, the overlay chooses one of these recommendation messages:

| Message | Condition |
| --- | --- |
| `Watch for breakout, checklist, or kijun bounce` | Bull regime, HTF bullish, and longs allowed |
| `Watch for breakdown, checklist, or kijun bounce` | Bear regime, HTF bearish, and shorts allowed |
| `Wait for bullish cloud alignment` | Direction filter is `Long Only`, but the chart is not fully aligned yet |
| `Wait for bearish cloud alignment` | Direction filter is `Short Only`, but the chart is not fully aligned yet |
| `Wait for full Ichimoku alignment` | Mixed conditions with `Both` enabled |

### Overlay Setup Conditions

Only the `first qualifying closed bar` triggers a new setup state.

| Setup | Long Condition | Short Condition | Notes |
| --- | --- | --- | --- |
| Kumo Breakout | Previous close was inside the cloud, current close breaks above the cloud, `CTF >= +2`, HTF bullish | Previous close was inside the cloud, current close breaks below the cloud, `CTF <= -2`, HTF bearish | Breakout setup is earlier and looser than full checklist |
| Full Checklist | `Price = +1`, `Future = +1`, `TK = +1`, `Chikou = +1`, so `CTF = +4`, plus HTF bullish | All four components bearish, so `CTF = -4`, plus HTF bearish | This is the strictest setup |
| Kijun Bounce | Price and future cloud bullish, `CTF >= +3`, price tags or dips through Kijun, then closes back above Kijun on a green candle, with the prior close already above Kijun | Mirror logic on the short side: price and future cloud bearish, `CTF <= -3`, price tags Kijun and closes back below it on a red candle, with prior close already below Kijun | Designed to catch pullback continuation |
| Edge-to-Edge | Price closes into the cloud from below, with HTF bullish | Price closes into the cloud from above, with HTF bearish | Overlay only. The strategy does not auto-trade this setup |

### Overlay Setup Priority

If more than one setup qualifies on the same bar, the overlay tracks them in this order:

1. `Checklist`
2. `Kijun Bounce`
3. `Breakout`
4. `Edge-to-Edge`

That means the dashboard will show the highest-priority matching setup, not every matching setup at once.

### Overlay Target Logic

| Situation | Target Used |
| --- | --- |
| Active long breakout / checklist / Kijun bounce | Nearest detected flat-Kumo level above price |
| Active short breakout / checklist / Kijun bounce | Nearest detected flat-Kumo level below price |
| Active long edge-to-edge | Opposite edge of the current cloud, which is the cloud top |
| Active short edge-to-edge | Opposite edge of the current cloud, which is the cloud bottom |

Flat-Kumo targets are found by scanning recent Span A and Span B values for three-bar flat levels and keeping the nearest two above and the nearest two below current price.

### Overlay Invalidation Logic

| Active State | Invalidation Line | Signal Is Invalidated When |
| --- | --- | --- |
| Long breakout / checklist / Kijun bounce | `min(Kijun, cloud bottom)` | Bearish TK cross, or close below Kijun, or close back into / through the bullish side of the cloud |
| Short breakout / checklist / Kijun bounce | `max(Kijun, cloud top)` | Bullish TK cross, or close above Kijun, or close back into / through the bearish side of the cloud |
| Long edge-to-edge | Cloud bottom | Close below the cloud bottom |
| Short edge-to-edge | Cloud top | Close above the cloud top |

When invalidation happens, the active setup is cleared and the overlay returns to a no-trade state.

### Overlay Alerts

The overlay exposes these alert conditions:

- `Long Breakout Confirmed`
- `Short Breakout Confirmed`
- `Long Checklist Confirmed`
- `Short Checklist Confirmed`
- `Long Kijun Bounce Confirmed`
- `Short Kijun Bounce Confirmed`
- `Long Edge-to-Edge Active`
- `Short Edge-to-Edge Active`
- `Active Signal Invalidated`

## Strategy Logic

The strategy is designed to answer: `Does this ticker and timeframe behave well with this model?`

It uses the same shared Ichimoku score model as the overlay, but it only auto-trades three setup families:

- `Breakout`
- `Checklist`
- `Kijun Bounce`

It does `not` auto-trade `Edge-to-Edge`.

### Strategy Entry Conditions

The strategy can only enter when it is flat.

| Setup | Long Entry | Short Entry | Order ID |
| --- | --- | --- | --- |
| Checklist | Full bullish checklist, HTF bullish, longs allowed | Full bearish checklist, HTF bearish, shorts allowed | `L_CHECKLIST` / `S_CHECKLIST` |
| Kijun Bounce | Bullish Kijun bounce conditions, HTF bullish, longs allowed | Bearish Kijun bounce conditions, HTF bearish, shorts allowed | `L_KIJUN` / `S_KIJUN` |
| Breakout | Bullish breakout conditions, HTF bullish, longs allowed | Bearish breakout conditions, HTF bearish, shorts allowed | `L_BREAKOUT` / `S_BREAKOUT` |

### Strategy Entry Priority

If more than one setup is valid on the same bar, the strategy uses this priority:

1. `Checklist`
2. `Kijun Bounce`
3. `Breakout`

That means a checklist signal will win over a bounce or breakout if multiple entries line up together.

### Strategy Exit Conditions

| Position | Exit Trigger |
| --- | --- |
| Long | Bearish TK cross, or close below Kijun, or close back into / through the bullish side of the cloud |
| Short | Bullish TK cross, or close above Kijun, or close back into / through the bearish side of the cloud |

When a side invalidates, the strategy sends a close command to every order ID on that side so the open position is flattened cleanly.

### Strategy Validation Card

The validation card summarizes the current chart using these fields:

| Field | Meaning |
| --- | --- |
| `Chart` | Current symbol and timeframe |
| `Model` | Preset, direction filter, and HTF |
| `Modules` | Which entry modules are enabled: `BO`, `CL`, `KJ` |
| `Net P/L` | Net strategy return in percent and compact currency form |
| `Profit Factor` | Gross profit divided by absolute gross loss |
| `Max DD` | Maximum drawdown percent |
| `Trades / Win` | Closed trades and win rate |
| `Verdict` | Quick read on whether the chart looks usable for this model |

### Strategy Verdict Logic

| Verdict | Condition | Interpretation |
| --- | --- | --- |
| `Valid` | Not `Avoid`, not `Caution`, not `Thin Data` | Best case. The chart is behaving acceptably for this model |
| `Caution` | Not `Avoid`, at least 5 closed trades, but one of these is weak: `Profit Factor < 1.75`, `Max DD > 35%`, or `Win Rate < 25%` | Tradable only with extra skepticism |
| `Thin Data` | Not `Avoid`, but fewer than 5 closed trades | Too little sample size to trust the result yet |
| `Avoid` | No closed trades, or `Net P/L <= 0`, or `Profit Factor < 1.15`, or `Max DD > 50%` | The current chart does not validate well with this model |

`Thin Data` takes precedence over `Caution` whenever the sample size is too small but the chart is not already in `Avoid`.

## Practical State Guide

### Overlay

| What You See | Practical Meaning |
| --- | --- |
| `Regime = Neutral` and `NO TRADE RIGHT NOW` | Stay patient. The cloud structure is not clear enough yet |
| `Bull` regime with bullish HTF but no active setup | The chart is constructive, but the trigger has not fired yet |
| `Checklist Long` active | Strongest long state in the script |
| `Kijun Bounce Long` active | Trend continuation after a pullback |
| `Breakout Long` active | Early continuation signal after price exits the cloud |
| `Edge-to-Edge Long` active | Price has entered the cloud from below and is attempting a full cloud traverse |
| `Active Signal Invalidated` | The setup failed and the overlay has stepped back to neutral guidance |

### Strategy

| What You See | Practical Meaning |
| --- | --- |
| `Valid` | This ticker / timeframe is behaving well enough to consider for the overlay |
| `Caution` | The setup can work, but the backtest quality is not strong |
| `Thin Data` | There is not enough trade history yet to trust the readout |
| `Avoid` | Move on or change ticker / timeframe before using the overlay aggressively |

## Design Notes

The public scripts are implementation-first. The main ideas reflected in the model are:

- the `checklist` should be stricter than a simple breakout
- `Chikou` confirmation matters, especially for clean checklist entries
- candle `closes` matter more than temporary intrabar pokes
- `edge-to-edge` is a cloud-travel idea, not the same thing as a breakout
- cloud and Kijun structure can be used for invalidation and stop placement
- a bullish or bearish `cloud picture` should be in place before leaning too hard into a trade

## One-Line Summary

- Use the `strategy` first to decide whether the chart is worth trading.
- Use the `overlay` second to decide whether there is a clean trade right now.
