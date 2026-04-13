# Phase 2 Candidate Grid

## Purpose

This document defines the candidate neighborhoods and the symbol-by-symbol seed map for Phase 2.

Use it to decide:

- which preset family each symbol should start from
- which secondary seed is worth testing
- which timeframes and direction branches deserve search budget

## Search Neighborhoods

Phase 2 should start with a tight neighborhood around the seed family, not a wide brute-force mesh.

### Traditional Standard Seed

- Seed: `9 / 26 / 52 / 26`

Recommended first neighborhood:

| Field | Values |
| --- | --- |
| Conversion | `7`, `9`, `11` |
| Base | `22`, `26`, `30` |
| Span B | `44`, `52`, `60` |
| Displacement | `22`, `26`, `30` |

### Traditional Doubled Seed

- Seed: `18 / 52 / 104 / 52`

Recommended first neighborhood:

| Field | Values |
| --- | --- |
| Conversion | `14`, `18`, `22` |
| Base | `40`, `52`, `64` |
| Span B | `80`, `104`, `128` |
| Displacement | `40`, `52`, `64` |

### Crypto Doubled Seed

- Seed: `20 / 61 / 120 / 30`

Recommended first neighborhood:

| Field | Values |
| --- | --- |
| Conversion | `16`, `20`, `24` |
| Base | `49`, `61`, `73` |
| Span B | `96`, `120`, `144` |
| Displacement | `24`, `30`, `36` |

## Candidate Rules

Keep only candidates that satisfy:

- `conversion < base < spanB`
- `base - conversion >= 6`
- `spanB - base >= 10`
- displacement stays inside the assigned neighborhood

## Symbol Seed Grid

### Column Notes

- `Primary seed`: first family to search
- `Secondary seed`: second family to search if needed
- `Priority TFs`: first timeframes to search in Phase 2
- `Priority branches`: first direction/window branches to search

| Symbol | Primary seed | Secondary seed | Priority TFs | Priority branches | Notes |
| --- | --- | --- | --- | --- | --- |
| `COINBASE:BTCUSD` | Crypto Doubled | Traditional Doubled | `3D`, `1D`, `4H` | `Long Only / All-Time`, `Long Only / Last 3 Years` | Strong crypto-specific behavior; keep crypto bias active |
| `COINBASE:ETHUSD` | Traditional Standard | Traditional Doubled | `3D`, `1D`, `4H` | `Long Only / All-Time`, `Long Only / Last 3 Years` | Strong long-side fit on standard family |
| `COINBASE:SOLUSD` | Traditional Standard | Traditional Doubled | `4H`, `1D`, `3D` | `Long Only / Last 3 Years`, `Long Only / All-Time` | Best single run came from doubled family, so test both |
| `DBC` | Traditional Standard | none | `3D`, `1D`, `4H` | `Long Only / All-Time`, `Both / All-Time` | Clean standard-family result |
| `EEM` | Traditional Standard | Traditional Doubled | `4H`, `1D`, `3D` | `Long Only / All-Time`, `Long Only / Last 3 Years` | Mixed but still standard-led |
| `EFA` | Traditional Standard | Crypto Doubled | `3D`, `1D`, `4H` | `Long Only / All-Time`, `Long Only / Last 3 Years` | True mixed Phase 1 case |
| `EMB` | Traditional Standard | none | `4H`, `1D`, `3D` | `Short Only / All-Time`, `Both / All-Time` | Credit ETF with meaningful short-side behavior |
| `GLD` | Traditional Standard | Traditional Doubled | `1W`, `3D`, `1D` | `Both / All-Time`, `Long Only / All-Time` | Strongest overall best run in Phase 1 |
| `HYG` | Traditional Standard | Crypto Doubled | `3D`, `1D`, `4H` | `Short Only / All-Time`, `Both / All-Time` | Weak broad fit, but short-side branches matter |
| `IEF` | Traditional Standard | Traditional Doubled | `1D`, `4H`, `3D` | `Short Only / All-Time`, `Both / All-Time` | Tie between standard and doubled; test both |
| `IWM` | Traditional Standard | Crypto Doubled | `3D`, `1D`, `4H` | `Long Only / All-Time`, `Both / All-Time` | Small-cap beta keeps crypto family relevant |
| `IYR` | Traditional Doubled | Crypto Doubled | `3D`, `1D`, `4H` | `Long Only / All-Time`, `Both / All-Time` | Mixed real estate profile; no standard edge |
| `KRE` | Traditional Standard | Crypto Doubled | `3D`, `1D`, `4H` | `Long Only / All-Time`, `Both / All-Time` | Regional-bank beta makes crypto seed worth a secondary pass |
| `LQD` | Traditional Standard | none | `3D`, `1D`, `4H` | `Short Only / All-Time`, `Both / All-Time` | Clear standard-family short-side behavior |
| `MUB` | Traditional Standard | Traditional Doubled | `3D`, `1D`, `4H` | `Short Only / All-Time`, `Both / All-Time` | Mixed muni profile; standard still cleaner |
| `SHY` | Crypto Doubled | none | `3D`, `1D`, `4H` | `Short Only / All-Time` | Crypto family clearly led this symbol |
| `SPY` | Traditional Doubled | Traditional Standard | `1W`, `3D`, `1D` | `Long Only / All-Time`, `Long Only / Last 3 Years` | Strong doubled-family macro / index profile |
| `TIP` | Traditional Standard | none | `3D`, `1D`, `4H` | `Both / Last 3 Years`, `Both / All-Time` | Standard family best broad fit |
| `TLT` | Traditional Doubled | Crypto Doubled | `3D`, `1D`, `4H` | `Long Only / All-Time`, `Short Only / All-Time` | No convergence; test two seeds before expanding |
| `UUP` | Traditional Doubled | none | `1D`, `4H`, `3D` | `Long Only / All-Time`, `Both / All-Time` | Clear doubled-family dollar profile |
| `XHB` | Crypto Doubled | Traditional Standard | `3D`, `1D`, `4H` | `Long Only / All-Time`, `Long Only / Last 3 Years` | High-beta homebuilder behavior favors crypto family |
| `XLE` | Crypto Doubled | none | `4H`, `1D`, `3D` | `Long Only / Last 3 Years`, `Long Only / All-Time` | Clear crypto-family energy profile |
| `XLF` | Traditional Standard | Crypto Doubled | `3D`, `1D`, `4H` | `Long Only / All-Time`, `Both / All-Time` | Standard robust majority, crypto best single run |

## What To Skip First

In the first Phase 2 pass, skip or defer:

- `15m`
- weak `1W` branches unless Phase 1 already showed strength
- `Short Only / Last 3 Years` except where a symbol clearly justified it
- any third seed family unless the symbol had no convergence in Phase 1

## Recommended Search Order

1. Run all primary seeds on the priority branches.
2. Run secondary seeds only for mixed or tied symbols.
3. Compare custom winners against the seed preset baseline.
4. Promote only if the custom candidate is clearly better and still robust.
