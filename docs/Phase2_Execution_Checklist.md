# Phase 2 Execution Checklist

## Objective

Phase 2 is a precision refinement pass.

The objective is to start from the strongest Phase 1 preset family for each symbol group, search a small custom neighborhood around that seed, and improve `profit factor` and `win rate` without breaking the Phase 1 quality gates.

## Phase 2 Rules

- Do not run a wide brute-force search.
- Keep the strategy logic fixed.
- Keep modules fixed:
  - `Breakout`
  - `Checklist`
  - `Kijun Bounce`
- Keep sizing fixed:
  - `75% of equity`
- Keep commission fixed:
  - `0.1%`
- Keep slippage fixed:
  - `1`
- Keep signal timing fixed:
  - `bar-close confirmed`

## Priority Order

### 1. Timeframe Priority

Run Phase 2 in this order:

1. `4H`
2. `3D`
3. `1D`
4. `1H` only where Phase 1 was competitive
5. `1W` only for symbols where Phase 1 already showed strength
6. Skip or heavily deprioritize `15m`

### 2. Direction / Window Priority

Run Phase 2 in this order:

1. `Long Only / All-Time`
2. `Long Only / Last 3 Years`
3. `Both / All-Time`
4. `Short Only / All-Time`
5. `Both / Last 3 Years`
6. `Short Only / Last 3 Years` only for symbols that clearly supported it in Phase 1

## Preflight Checklist

Before launching Phase 2:

1. Confirm the strategy build on chart matches the local Phase 2 branch.
2. Confirm `Backtest Window` inputs still work correctly.
3. Confirm chart hydration is stable on:
   - one crypto symbol
   - one equity ETF
   - one bond ETF
4. Confirm sample runs return non-empty metrics on:
   - `4H`
   - `3D`
   - `1D`
5. Confirm the optimizer still writes:
   - `raw-results.json`
   - `best-settings.csv`
   - `robust-settings.csv`
   - `summary.md`

## Search Structure

### Pass A: Primary Seed Search

For each symbol:

1. Start with the primary Phase 1 seed family.
2. Search only the priority timeframes.
3. Search only the priority direction / window combinations.
4. Use the Phase 2 neighborhood grid from [Phase2_Candidate_Grid.md](./Phase2_Candidate_Grid.md).
5. Rank survivors by:
   - `pass`
   - `profit factor`
   - `win rate`
   - `net profit %`
   - `trade count`
   - lower `max drawdown %`

### Pass B: Secondary Seed Search

Run the secondary seed only when at least one of these is true:

- the symbol showed mixed Phase 1 convergence
- the symbol had a tie between seed families
- the Phase 1 best run came from a different family than the robust majority
- the primary seed produced weak or unstable Phase 2 candidates

### Pass C: Tiebreak / Exception Search

Run a third seed only when:

- Phase 1 showed no convergence
- or the asset is structurally unusual
- or both primary and secondary searches fail the quality gates

This pass should be rare.

## Quality Gates

Keep the Phase 1 gates in force:

### All-Time

- minimum trades: `10`
- max drawdown: `40%`
- net profit must be positive
- margin calls must be `0`

### Last 3 Years

- minimum trades: `6`
- max drawdown: `40%`
- net profit must be positive
- margin calls must be `0`

## Candidate Review Checklist

For any candidate to move forward:

1. It must pass the quality gate.
2. It must improve `profit factor`, `win rate`, or robustness versus the Phase 1 seed.
3. It should not win on tiny trade counts alone.
4. It should not win solely because of one anomalous timeframe.
5. It should still make sense in the context of the symbol.

## Output Requirements

For each symbol, produce:

1. Primary seed tested
2. Secondary seed tested, if used
3. Best custom candidate
4. Best preset baseline for comparison
5. Improvement summary:
   - `PF delta`
   - `Win rate delta`
   - `DD delta`
   - `Trade count delta`
6. Final recommendation:
   - `Promote`
   - `Keep preset`
   - `Needs more testing`

## Promotion Criteria

Promote a custom Phase 2 setting only if:

1. It beats the best preset baseline on the target group.
2. It does not introduce a materially worse drawdown profile.
3. It remains credible across the priority timeframes.
4. The result is not dependent on `15m`.

## Stop Conditions

Stop expanding a symbol search when:

- the primary seed already dominates and the neighborhood adds nothing
- secondary seed search fails clearly
- the candidate improvements are too small to justify model complexity
- the symbol has no practical signal quality in the target mode

## Recommended Phase 2 Run Order

### Bucket 1: Highest Priority

- `COINBASE:BTCUSD`
- `COINBASE:ETHUSD`
- `COINBASE:SOLUSD`
- `SPY`
- `GLD`
- `XLE`

### Bucket 2: Strong Secondary Priority

- `DBC`
- `EEM`
- `EFA`
- `IWM`
- `XLF`
- `KRE`
- `UUP`

### Bucket 3: Macro / Rate / Credit Short-Useful Group

- `EMB`
- `HYG`
- `IEF`
- `LQD`
- `MUB`
- `SHY`
- `TIP`
- `TLT`
- `IYR`

### Bucket 4: Lowest Priority / Mixed Value

- symbols that remain weak after primary seed testing
- `15m`
- any `Short Only / Last 3 Years` branch without a strong Phase 1 reason

## Definition Of Success

Phase 2 succeeds if it gives us one of these:

- a better symbol-specific cloud setting than the preset baseline
- confirmation that the preset baseline is already the right answer

Both outcomes are useful.
