# V2 Optimizer

This folder contains the local V2 optimizer harness for `MMT Ichi Workflow Strategy`.

The optimizer does not run inside Pine. It uses TradingView Desktop plus the local `tradingview-mcp` project to:

- switch symbols and timeframes
- change strategy inputs
- run repeated backtests
- collect Strategy Tester metrics
- rank cloud-setting candidates

## What It Tests

The optimizer is built to search for the strongest cloud settings across:

- `1W`
- `3D`
- `1D`
- `4H`
- `1H`
- `15m`

It runs each cloud candidate through:

- `Long Only`
- `Short Only`
- `Both`

And it produces separate result families for:

- `All-Time`
- `Last 3 Years`

## What It Does Not Optimize Yet

V2 keeps these fixed:

- modules: `Breakout + Checklist + Kijun Bounce`
- sizing: `75% of equity`
- commission: `0.1%`
- slippage: `1`
- bar-close confirmed logic

## Before You Run It

1. Launch TradingView Desktop with CDP enabled.
2. Open a chart in TradingView.
3. Add `MMT Ichi Workflow Strategy` to the chart.
4. Make sure the local `tradingview-mcp` checkout is available at:
   - `/Users/stubookpro/Desktop/mmt_ichi/tradingview-mcp`
5. Edit [config.example.json](/Users/stubookpro/Desktop/mmt_ichi/public_repo/optimizer/config.example.json) with the ticker universe you want to test first.

## Run It

```bash
node optimizer/run_optimizer.mjs --config optimizer/config.example.json
```

Helpful options:

```bash
node optimizer/run_optimizer.mjs --config optimizer/config.example.json --phase phase1
node optimizer/run_optimizer.mjs --config optimizer/config.example.json --max-runs 10
```

## Output

Each run writes a timestamped folder under `optimizer/output/` containing:

- `summary.md`
- `raw-results.json`
- `all-runs.csv`
- `best-settings.csv`
- `robust-settings.csv`
- `phase1-seeds.json`

## Notes

- The harness assumes the strategy is already loaded on the chart.
- The harness treats TradingView Strategy Tester data as the source of truth.
- If a public-search style sweep becomes too broad, reduce the symbol list first rather than widening the cloud search space.
