# MMT Ichi Workflow Flowchart

This companion note turns the script logic into a visual decision map.

It is meant to be read alongside:

- [`Ichi_Workflow_Logic.md`](./Ichi_Workflow_Logic.md)
- [`Ichi_Workflow_Metrics.md`](./Ichi_Workflow_Metrics.md)

## Reading Guide

- `CTF` means current timeframe score.
- `HTF` means higher timeframe score.
- `TK` means `Tenkan vs Kijun`.
- `Chikou` confirmation in this model means current close is above or below the displaced candle body and displaced cloud structure.
- All decisions are made on `bar close`.

## 1. Shared Decision Flow

```mermaid
flowchart TD
    A["New closed bar"] --> B["Resolve preset lengths<br/>Compute Tenkan, Kijun, Span A, Span B"]
    B --> C["Build CTF score<br/>Price vs Cloud + Future Cloud + TK + Chikou"]
    C --> D["Build HTF score<br/>using last confirmed HTF bar only"]
    D --> E{"Direction filter"}
    E -->|"Long Only"| F["Only evaluate long states"]
    E -->|"Short Only"| G["Only evaluate short states"]
    E -->|"Both"| H["Evaluate both long and short states"]
    F --> I
    G --> I
    H --> I
    I{"HTF gate passes?"}
    I -->|"Long side: HTF >= +3"| J["Long setup checks allowed"]
    I -->|"Short side: HTF <= -3"| K["Short setup checks allowed"]
    I -->|"No"| L["No active setup<br/>Show wait-state guidance"]
    J --> M["Evaluate setup priority"]
    K --> M
    M --> N["Checklist"]
    M --> O["Kijun Bounce"]
    M --> P["Breakout"]
    M --> Q["Edge-to-Edge (overlay only)"]
    N --> R{"Any setup triggered on this bar?"}
    O --> R
    P --> R
    Q --> R
    R -->|"No"| L
    R -->|"Yes"| S["Activate recommendation / trade state"]
    S --> T["Assign entry, target, invalidation"]
    T --> U["Monitor invalidation on each new bar"]
    U --> V{"Invalidated?"}
    V -->|"No"| U
    V -->|"Yes"| L
```

## 2. Shared Score Logic

```mermaid
flowchart LR
    A["CTF or HTF Score"] --> B["Price vs Cloud<br/>+1 above cloud<br/>0 inside cloud<br/>-1 below cloud"]
    A --> C["Future Cloud<br/>+1 Span A > Span B<br/>-1 Span A < Span B"]
    A --> D["TK Alignment<br/>+1 Tenkan > Kijun<br/>-1 Tenkan < Kijun"]
    A --> E["Chikou Confirmation<br/>+1 close > displaced price body and cloud top<br/>-1 close < displaced price body and cloud bottom"]
```

## 3. Overlay Flow

```mermaid
flowchart TD
    A["Overlay receives new closed bar"] --> B{"Regime"}
    B -->|"Close above cloud"| C["Bull regime"]
    B -->|"Close below cloud"| D["Bear regime"]
    B -->|"Inside cloud"| E["Neutral regime"]

    C --> F{"HTF bullish and longs allowed?"}
    D --> G{"HTF bearish and shorts allowed?"}
    E --> H["No trade right now<br/>Wait for full cloud alignment"]

    F -->|"No"| I["No trade right now<br/>Wait for bullish cloud alignment"]
    G -->|"No"| J["No trade right now<br/>Wait for bearish cloud alignment"]
    F -->|"Yes"| K["Check long setups in priority order"]
    G -->|"Yes"| L["Check short setups in priority order"]

    K --> M["1. Checklist Long"]
    K --> N["2. Kijun Bounce Long"]
    K --> O["3. Breakout Long"]
    K --> P["4. Edge-to-Edge Long"]

    L --> Q["1. Checklist Short"]
    L --> R["2. Kijun Bounce Short"]
    L --> S["3. Breakout Short"]
    L --> T["4. Edge-to-Edge Short"]

    M --> U{"Triggered?"}
    N --> U
    O --> U
    P --> U
    Q --> V{"Triggered?"}
    R --> V
    S --> V
    T --> V

    U -->|"No"| W["Trade Call = NO TRADE RIGHT NOW<br/>Watch for next long trigger"]
    V -->|"No"| X["Trade Call = NO TRADE RIGHT NOW<br/>Watch for next short trigger"]
    U -->|"Yes"| Y["Trade Call = LONG RECOMMENDATION<br/>Active Setup = matched long state"]
    V -->|"Yes"| Z["Trade Call = SHORT RECOMMENDATION<br/>Active Setup = matched short state"]

    Y --> AA["Execution row shows<br/>E entry | T target | X invalidation"]
    Z --> BB["Execution row shows<br/>E entry | T target | X invalidation"]
```

## 4. Overlay State Notes

### Long States

| Overlay State | Required Subconditions |
| --- | --- |
| `Checklist Long` | `Price vs Cloud = +1`, so close is above the cloud. `Future Cloud = +1`, so Span A is above Span B. `TK = +1`, so Tenkan is above Kijun. `Chikou = +1`, so current close is above the displaced candle body and displaced cloud top. `CTF = +4`. `HTF Score >= +3`. Longs must be allowed by the direction filter. |
| `Kijun Bounce Long` | Bull structure must already be in place: `Price vs Cloud = +1`, `Future Cloud = +1`, and `CTF >= +3`. HTF must be bullish. The current bar must tag or dip through Kijun with `low <= Kijun`, then reclaim it with `close > Kijun`. The bar must close green with `close > open`. The prior bar must already have been above Kijun with `close[1] > Kijun[1]`. |
| `Breakout Long` | The previous bar must have closed inside the cloud. The current bar must close above the cloud top. `CTF >= +2`. HTF must be bullish. Longs must be allowed. This is intentionally looser than the full checklist, so Chikou and TK do not both need to be perfect. |
| `Edge-to-Edge Long` | Price must close into the cloud from below. HTF must already be bullish. Longs must be allowed. This is a cloud-travel state, not a full trend-confirmation checklist state. |

### Short States

| Overlay State | Required Subconditions |
| --- | --- |
| `Checklist Short` | `Price vs Cloud = -1`, so close is below the cloud. `Future Cloud = -1`, so Span A is below Span B. `TK = -1`, so Tenkan is below Kijun. `Chikou = -1`, so current close is below the displaced candle body and displaced cloud bottom. `CTF = -4`. `HTF Score <= -3`. Shorts must be allowed by the direction filter. |
| `Kijun Bounce Short` | Bear structure must already be in place: `Price vs Cloud = -1`, `Future Cloud = -1`, and `CTF <= -3`. HTF must be bearish. The current bar must tag or wick into Kijun with `high >= Kijun`, then reject it with `close < Kijun`. The bar must close red with `close < open`. The prior bar must already have been below Kijun with `close[1] < Kijun[1]`. |
| `Breakout Short` | The previous bar must have closed inside the cloud. The current bar must close below the cloud bottom. `CTF <= -2`. HTF must be bearish. Shorts must be allowed. This is intentionally looser than the full checklist. |
| `Edge-to-Edge Short` | Price must close into the cloud from above. HTF must already be bearish. Shorts must be allowed. This is a cloud-travel state, not a full trend-confirmation checklist state. |

### Overlay Target / Invalidation Notes

```mermaid
flowchart TD
    A["Active Overlay State"] --> B{"State type"}
    B -->|"Checklist / Kijun / Breakout long"| C["Target = nearest flat-Kumo level above<br/>Invalidation = min(Kijun, cloud bottom)"]
    B -->|"Checklist / Kijun / Breakout short"| D["Target = nearest flat-Kumo level below<br/>Invalidation = max(Kijun, cloud top)"]
    B -->|"Edge-to-Edge long"| E["Target = opposite cloud edge = cloud top<br/>Invalidation = cloud bottom"]
    B -->|"Edge-to-Edge short"| F["Target = opposite cloud edge = cloud bottom<br/>Invalidation = cloud top"]
    C --> G["Invalidate on bearish TK cross<br/>or close below Kijun<br/>or close back into / through cloud"]
    D --> H["Invalidate on bullish TK cross<br/>or close above Kijun<br/>or close back into / through cloud"]
    E --> I["Invalidate on close below cloud bottom"]
    F --> J["Invalidate on close above cloud top"]
```

## 5. Strategy Flow

```mermaid
flowchart TD
    A["Strategy receives new closed bar"] --> B["Compute same CTF / HTF model as overlay"]
    B --> C{"Flat position?"}
    C -->|"No"| D["Manage existing trade<br/>watch invalidation"]
    C -->|"Yes"| E["Check entries by priority"]

    E --> F["1. Checklist"]
    E --> G["2. Kijun Bounce"]
    E --> H["3. Breakout"]

    F --> I{"Long or short setup passes?"}
    G --> I
    H --> I

    I -->|"No"| J["No new trade"]
    I -->|"Yes"| K["Enter trade with setup-specific order ID"]

    K --> L["Long IDs: L_CHECKLIST / L_KIJUN / L_BREAKOUT"]
    K --> M["Short IDs: S_CHECKLIST / S_KIJUN / S_BREAKOUT"]

    D --> N{"Exit condition hit?"}
    N -->|"No"| D
    N -->|"Yes"| O["Close active side as invalidated"]
```

## 6. Strategy State Notes

### Entry States

| Strategy State | Required Subconditions |
| --- | --- |
| `Long Checklist Entry` | Same full long checklist as the overlay: close above cloud, future cloud bullish, Tenkan above Kijun, Chikou confirmed above displaced price and cloud, `CTF = +4`, `HTF >= +3`, longs allowed, and no existing position. |
| `Long Kijun Bounce Entry` | Same long bounce logic as the overlay: bullish cloud structure, `CTF >= +3`, HTF bullish, current bar touches Kijun then reclaims it, closes green, previous close already above Kijun, and no existing position. |
| `Long Breakout Entry` | Previous close inside cloud, current close above cloud, `CTF >= +2`, HTF bullish, longs allowed, and no existing position. |
| `Short Checklist Entry` | Same full short checklist as the overlay: close below cloud, future cloud bearish, Tenkan below Kijun, Chikou confirmed below displaced price and cloud, `CTF = -4`, `HTF <= -3`, shorts allowed, and no existing position. |
| `Short Kijun Bounce Entry` | Same short bounce logic as the overlay: bearish cloud structure, `CTF <= -3`, HTF bearish, current bar touches Kijun then rejects it, closes red, previous close already below Kijun, and no existing position. |
| `Short Breakout Entry` | Previous close inside cloud, current close below cloud, `CTF <= -2`, HTF bearish, shorts allowed, and no existing position. |

### Exit States

| Strategy Exit State | Subconditions |
| --- | --- |
| `Exit Long` | Position is long and at least one of these is true: bearish TK cross, close below Kijun, or close back into / through the cloud from above. |
| `Exit Short` | Position is short and at least one of these is true: bullish TK cross, close above Kijun, or close back into / through the cloud from below. |

## 7. Validation Card Flow

```mermaid
flowchart TD
    A["Finished backtest on current chart"] --> B["Read metrics<br/>Net P/L, Profit Factor, Max DD, Trades, Win Rate"]
    B --> C{"Closed trades == 0?"}
    C -->|"Yes"| D["Verdict = Avoid"]
    C -->|"No"| E{"Net P/L <= 0<br/>or Profit Factor < 1.15<br/>or Max DD > 50?"}
    E -->|"Yes"| D
    E -->|"No"| F{"Closed trades < 5?"}
    F -->|"Yes"| G["Verdict = Thin Data"]
    F -->|"No"| H{"Profit Factor < 1.75<br/>or Max DD > 35<br/>or Win Rate < 25?"}
    H -->|"Yes"| I["Verdict = Caution"]
    H -->|"No"| J["Verdict = Valid"]
```

## 8. Validation Verdict Notes

| Verdict | Exact Logic | Practical Read |
| --- | --- | --- |
| `Valid` | Not `Avoid`, not `Thin Data`, not `Caution` | Strongest validation state in the strategy |
| `Caution` | At least 5 closed trades, but profit factor, drawdown, or win rate is weaker than desired | Tradable only if you are comfortable with weaker model quality |
| `Thin Data` | Fewer than 5 closed trades, but not bad enough to be `Avoid` | Sample size is too small to trust confidently |
| `Avoid` | No closed trades, non-positive net return, profit factor below `1.15`, or max drawdown above `50%` | Weakest validation state; best to skip or change ticker / timeframe |

## 9. Practical Use

```mermaid
flowchart TD
    A["Select ticker and timeframe"] --> B["Read strategy card first"]
    B --> C{"Verdict"}
    C -->|"Avoid"| D["Skip the chart or change settings"]
    C -->|"Thin Data"| E["Treat as unproven"]
    C -->|"Caution"| F["Trade only with extra discretion"]
    C -->|"Valid"| G["Move to overlay"]
    G --> H["Read regime, CTF, HTF, trade call"]
    H --> I{"Active setup?"}
    I -->|"No"| J["Wait for next confirmed trigger"]
    I -->|"Yes"| K["Use entry, target, and invalidation shown by overlay"]
```
