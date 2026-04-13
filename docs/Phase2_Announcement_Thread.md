# Phase 2 Announcement Thread

## Short Version

```text
Phase 2 optimizer testing is complete.

Main conclusion:
one Ichimoku cloud does not fit everything.

I ran an open-source sweep across 23 symbols to test whether one cloud family was really best across crypto, commodities, bonds, rates, and equity proxies.

It wasn’t.

The better workflow is:
- one broad default family
- a small number of serious alternate cloud families
- ticker-specific refinement only where it clearly improves the result

Full writeup and open-source code:
https://github.com/MemeticMoney/mmt_ichimoku_stratexc
```

## Recommended 4-Post Thread

### Post 1

```text
Phase 2 optimizer testing is complete.

Main conclusion:
one Ichimoku cloud does not fit everything.

I ran an open-source sweep across 23 symbols to test whether one cloud family really was best across crypto, commodities, bonds, rates, and equity proxies.
```

### Post 2

```text
The answer was no.

Different symbols leaned toward different cloud behaviors:
- some faster standard-style clouds
- some crypto-style clouds
- some doubled / macro-style clouds
- some cleaner long-only behavior
- some more useful short / both-direction behavior

So the result was not one perfect cloud.

The result was a better framework.
```

### Post 3

```text
A few of the strongest Phase 2 standouts:

BTC 3D Long All-Time:
22/40/104/64
PF 13.98

GLD W Both All-Time:
11/30/52/26
PF 12.71

LQD 3D Short All-Time:
9/26/60/30
PF 8.27

There were also several low-trade outliers with huge PF values, but I’m weighting the higher-trade results more heavily than the flashy ones.
```

### Post 4

```text
The practical takeaway is simple:

stop forcing one cloud profile onto every market.

The better model is:
- one broad default family
- a small number of strong alternates
- ticker-specific refinement only where testing clearly supports it

All of the Pine scripts, optimizer logic, and findings are open-source here:
https://github.com/MemeticMoney/mmt_ichimoku_stratexc
```
