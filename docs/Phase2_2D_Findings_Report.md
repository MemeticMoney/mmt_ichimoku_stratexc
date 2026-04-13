# Phase 2 2D Findings Report

## Purpose

This focused pass tested whether a separate `2D` MMT Ichi profile pair could increase trade frequency while preserving the strong profitability and drawdown profile seen in the existing `3D` profile strategy.

The answer is mixed but useful:

- `2D` is strategically useful for selected symbols.
- The best headline BTC, ETH, SOL, and GLD rows came from experimental `240` confirmation, so they require manual trade-level review before promotion.
- The promoted default 2D profiles should use only non-4H confirmation paths.

## Scope

- Symbols: core 8
- Chart timeframe: `2D`
- Confirmation candidates: `W`, `D`, and experimental `240`
- Direction diagnostics: `Long Only`, `Short Only`, and `Both`
- Official direction defaults: long for all symbols except `LQD`, which remains short
- Strategy defaults: `75%` equity, `0.1%` commission, `1` slippage, no pyramiding

## Promotion Rules

- `2D Strategic`: passing non-4H result, profit factor at least `1.75`, max drawdown at or below `25%`, and more all-time trades than the 3D baseline.
- `2D Tactical`: passing non-4H result, profit factor at least `1.75`, and max drawdown at or below `40%`.
- `Experimental 4H Review`: best result came from the lower-timeframe `240` confirmation path.
- `Do Not Promote`: failed quality gates, was thin-data, or relied only on an unsuitable branch.

## Results

| Symbol | 2D Class | Best 2D HTF | 2D Cloud | 2D PF | 2D Win % | 2D DD % | 2D Trades | 3D PF | 3D DD % | 3D Trades |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `COINBASE:BTCUSD` | Experimental 4H Review | `240` | `20/73/120/36` | `121.65` | `82.35` | `21.49` | `17` | `13.98` | `10.39` | `10` |
| `COINBASE:ETHUSD` | Experimental 4H Review | `240` | `9/26/44/22` | `5.87` | `57.14` | `30.19` | `28` | `4.21` | `23.47` | `12` |
| `COINBASE:SOLUSD` | Experimental 4H Review | `240` | `22/40/104/40` | `3.01` | `45.45` | `16.18` | `11` | `4.05` | `19.57` | `6` |
| `SPY` | 2D Strategic | `D` | `14/64/80/52` | `5.50` | `54.00` | `13.99` | `50` | `3.45` | `16.07` | `34` |
| `GLD` | Experimental 4H Review | `240` | `22/64/128/40` | `16.42` | `64.71` | `6.00` | `17` | `3.92` | `11.59` | `29` |
| `DBC` | 2D Strategic | `W` | `7/26/60/26` | `3.44` | `46.15` | `13.54` | `26` | `3.22` | `12.51` | `17` |
| `LQD` | 2D Strategic | `W` | `7/30/60/30` | `4.47` | `55.56` | `3.09` | `18` | `8.27` | `1.62` | `13` |
| `KRE` | 2D Strategic | `D` | `11/26/44/22` | `5.21` | `62.50` | `6.43` | `16` | `4.94` | `13.17` | `13` |

## Practical Takeaway

Use the 2D pair as a separate tool, not as a replacement for the 3D profile model.

The cleanest promoted 2D candidates are:

- `SPY` with `D` confirmation
- `DBC` with `W` confirmation
- `LQD` with `W` confirmation
- `KRE` with `D` confirmation

The crypto and `GLD` 2D results are interesting, but the best rows rely on `240` confirmation. Treat those as research leads until actual trade distribution and dependency risk are reviewed manually.
