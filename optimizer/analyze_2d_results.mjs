#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { compareRunResults } from './lib/metrics.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CORE_PROFILES = {
  'COINBASE:BTCUSD': { direction: 'Long Only', cloud: '22/40/104/64' },
  'COINBASE:ETHUSD': { direction: 'Long Only', cloud: '11/26/44/30' },
  'COINBASE:SOLUSD': { direction: 'Long Only', cloud: '7/22/52/22' },
  SPY: { direction: 'Long Only', cloud: '22/64/104/52' },
  GLD: { direction: 'Long Only', cloud: '11/30/44/26' },
  DBC: { direction: 'Long Only', cloud: '7/26/44/30' },
  LQD: { direction: 'Short Only', cloud: '9/26/60/30' },
  KRE: { direction: 'Long Only', cloud: '24/61/96/36' },
};

function parseArgs(argv) {
  const defaults = {
    twoDDir: path.resolve(__dirname, 'output/phase2-2d-core8/_latest'),
    baselinePath: path.resolve(__dirname, 'output/phase2/_latest/raw-results.json'),
  };

  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--two-d-dir') {
      defaults.twoDDir = path.resolve(process.cwd(), argv[index + 1]);
      index += 1;
    } else if (argv[index] === '--baseline') {
      defaults.baselinePath = path.resolve(process.cwd(), argv[index + 1]);
      index += 1;
    }
  }

  return defaults;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function cloudKey(result) {
  return [result.conversion, result.base, result.spanB, result.displacement].join('/');
}

function bestResult(results) {
  return [...results].sort(compareRunResults)[0] ?? null;
}

function fmt(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return 'n/a';
  }
  return Number(value).toFixed(digits);
}

function classify(twoD, baseline) {
  if (!twoD?.pass) {
    return 'Do Not Promote';
  }
  if (twoD.htfTimeframe === '240') {
    return 'Experimental 4H Review';
  }
  if ((twoD.profitFactor ?? 0) >= 1.75 && (twoD.maxDrawdownPct ?? 100) <= 25 && (twoD.totalTrades ?? 0) > (baseline?.totalTrades ?? 0)) {
    return '2D Strategic';
  }
  if ((twoD.profitFactor ?? 0) >= 1.75 && (twoD.maxDrawdownPct ?? 100) <= 40) {
    return '2D Tactical';
  }
  return 'Do Not Promote';
}

function main() {
  const { twoDDir, baselinePath } = parseArgs(process.argv.slice(2));
  const twoDPath = path.join(twoDDir, 'raw-results.json');
  if (!fs.existsSync(twoDPath)) {
    throw new Error(`2D optimizer results not found: ${twoDPath}`);
  }
  if (!fs.existsSync(baselinePath)) {
    throw new Error(`3D baseline results not found: ${baselinePath}`);
  }

  const twoDResults = readJson(twoDPath);
  const baselineResults = readJson(baselinePath);
  const lines = [
    '# 2D MMT IchiOPS Findings',
    '',
    '| Symbol | 2D Class | Best 2D HTF | 2D Cloud | 2D PF | 2D Win % | 2D DD % | 2D Trades | 3D PF | 3D DD % | 3D Trades |',
    '| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ];

  for (const [symbol, profile] of Object.entries(CORE_PROFILES)) {
    const officialTwoD = twoDResults.filter((result) =>
      result.symbol === symbol
      && result.timeframe === '2D'
      && result.directionMode === profile.direction
      && result.windowMode === 'All-Time'
    );
    const baseline = bestResult(baselineResults.filter((result) =>
      result.symbol === symbol
      && result.timeframe === '3D'
      && result.directionMode === profile.direction
      && result.windowMode === 'All-Time'
      && cloudKey(result) === profile.cloud
    ));
    const twoD = bestResult(officialTwoD);
    const classification = classify(twoD, baseline);

    lines.push([
      `| ${symbol}`,
      classification,
      twoD?.htfTimeframe ?? 'n/a',
      twoD ? cloudKey(twoD) : 'n/a',
      fmt(twoD?.profitFactor),
      fmt(twoD?.winRatePct),
      fmt(twoD?.maxDrawdownPct),
      fmt(twoD?.totalTrades, 0),
      fmt(baseline?.profitFactor),
      fmt(baseline?.maxDrawdownPct),
      fmt(baseline?.totalTrades, 0),
      '|',
    ].join(' | '));
  }

  lines.push(
    '',
    'Promotion labels are deterministic: `2D Strategic` requires a passing non-4H result, PF >= 1.75, DD <= 25%, and more all-time trades than the 3D baseline. `2D Tactical` passes with PF >= 1.75 and DD <= 40%. `Experimental 4H Review` means the best result came from the lower-timeframe 4H confirmation path.'
  );

  fs.writeFileSync(path.join(twoDDir, 'phase2-2d-findings.md'), `${lines.join('\n')}\n`, 'utf8');
}

main();
