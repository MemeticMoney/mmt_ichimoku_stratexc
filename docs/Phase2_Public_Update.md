# Phase 2 Findings: One Ichimoku Cloud Does Not Fit Everything

Phase 2 is complete.

We ran an open-source optimization sweep across `23` symbols to test whether one universal Ichimoku cloud setting really was best across the full sample.

It was not.

## What Was Tested

- Symbols: `23`
- Timeframes emphasized in Phase 2: `1W`, `3D`, `1D`, `4H`
- Direction modes: `Long Only`, `Short Only`, `Both`
- Windows: `All-Time`, `Last 3 Years`
- Phase 1: preset sweep
- Phase 2: custom neighborhood refinement around the strongest Phase 1 seed families

The optimizer did not promote settings based on raw profit factor alone.

Candidates still had to pass quality gates such as:

- positive net profit
- minimum trade count
- max drawdown cap
- zero margin calls

## Main Finding

This was the central question behind the entire Phase 2 pass:

- if we refine cloud settings around the strongest preset families
- and test them across symbols, timeframes, direction modes, and date windows
- do the results converge on one universal cloud?

They do not.

What the testing showed instead is that different symbols lean toward different cloud behaviors:

- some symbols favored faster standard-style clouds
- some favored crypto-style clouds
- some favored doubled / macro-style clouds
- some rewarded long-only structures
- some showed more useful short or both-direction behavior

That is a better result than forcing one cloud family onto every market and pretending the variation is not there.

## Best Broad Default

If one broad default family must be chosen after Phase 2, it should be a faster standard-style neighborhood:

- conversion: `7` to `11`
- base: `22` to `30`
- span B: `44` to `60`
- displacement: `22` to `30`

That family produced:

- the most robust winner counts
- the most passing best-cell outcomes
- the broadest usefulness across crypto alternatives, gold, credit, rates, and equities

If someone wants one practical public default, this is the family to start from.

## Alternate Families That Still Matter

The standard neighborhood was not a monopoly.

Two other families still mattered:

- Crypto neighborhood
  - strongest in `BTC`
  - still important in `KRE`, `XHB`, `XLE`, and several beta-sensitive symbols
- Doubled neighborhood
  - strongest in several macro, index, and rate-sensitive contexts
  - important in `SPY`, `TLT`, `UUP`, and part of the bond / rates complex

So the real outcome of Phase 2 is not “throw away the alternates.”

It is:

- keep one broad default
- keep a small number of serious alternates
- use symbol-sensitive refinement where the evidence is strong enough to justify it

## Strongest Standouts

These are some of the most convincing high-quality outcomes with at least `10` trades:

| Symbol | TF | Direction | Window | Cloud | PF | Win % | DD % | Trades |
| --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: |
| `COINBASE:BTCUSD` | `3D` | `Long Only` | `All-Time` | `22/40/104/64` | `13.98` | `60.00` | `10.39` | `10` |
| `GLD` | `1W` | `Both` | `All-Time` | `11/30/52/26` | `12.71` | `60.00` | `7.13` | `10` |
| `LQD` | `3D` | `Short Only` | `All-Time` | `9/26/60/30` | `8.27` | `46.15` | `1.62` | `13` |
| `SPY` | `1W` | `Long Only` | `All-Time` | `22/52/128/52` | `6.53` | `70.00` | `15.00` | `10` |
| `DBC` | `3D` | `Long Only` | `All-Time` | `7/22/60/30` | `5.77` | `62.50` | `5.00` | `16` |

There were also several headline results with extremely high profit factor but very low trade count. Those are still interesting, but they should be treated as clues, not production defaults.

## What This Means

The testing does not support one universal cloud for every market.

It supports a stronger open-source workflow:

- one broad default family
- one crypto / beta-sensitive alternate family
- one doubled / macro-sensitive alternate family
- ticker-specific refinement only where the evidence is clearly strong

In other words:

- the right lesson is not “optimize everything forever”
- the right lesson is “use a small family of defaults that actually respects symbol behavior”

That is cleaner, more honest, and more useful than pretending one static cloud should control every symbol.

## Open Source

Everything in this project remains open-source:

- Pine scripts
- optimizer logic
- documented methodology
- test outputs and findings

See:

- [Phase 1 findings](./Phase1_Findings_Report.md)
- [Phase 2 findings](./Phase2_Findings_Report.md)
- [Phase 2 public update draft](./Phase2_Public_Update_Draft.md)
- [GitHub repository](https://github.com/MemeticMoney/mmt_ichimoku_stratexc)
