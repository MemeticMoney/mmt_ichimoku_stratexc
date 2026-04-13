import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { makePhase2CandidatesResolver, loadPhase2SymbolPlan } from '../lib/phase2-plan.mjs';
import { normalizeOptimizerTimeframe, resolveHigherTimeframeCandidates } from '../lib/timeframe-candidates.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const optimizerRoot = path.resolve(__dirname, '..');

function loadJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.resolve(optimizerRoot, relativePath), 'utf8'));
}

function robustSeedGroupKey(symbol, directionMode, windowMode) {
  return [symbol, directionMode, windowMode].join('|');
}

test('normalizes 2D and common human timeframe labels', () => {
  assert.equal(normalizeOptimizerTimeframe('2d'), '2D');
  assert.equal(normalizeOptimizerTimeframe('2D'), '2D');
  assert.equal(normalizeOptimizerTimeframe('4h'), '240');
  assert.equal(normalizeOptimizerTimeframe('1d'), 'D');
});

test('expands configured 2D confirmation timeframe candidates', () => {
  const config = loadJson('phase2-2d-core8.json');
  assert.deepEqual(resolveHigherTimeframeCandidates(config, '2d'), ['W', 'D', '240']);
});

test('falls back to single higher timeframe map when candidates are omitted', () => {
  const config = {
    higherTimeframeMap: {
      '2D': 'W',
    },
  };
  assert.deepEqual(resolveHigherTimeframeCandidates(config, '2D'), ['W']);
});

test('core 8 baseline profile settings appear in the 2D candidate grid', () => {
  const config = loadJson('phase2-2d-core8.json');
  const symbolPlan = loadPhase2SymbolPlan(path.resolve(optimizerRoot, 'phase2-2d-core8-symbol-plan.json'));
  const candidatesForGroup = makePhase2CandidatesResolver({
    config,
    phase1SeedMap: {},
    symbolPlan,
    robustSeedGroupKey,
  });

  const baselines = [
    ['COINBASE:BTCUSD', 'Long Only', '22-40-104-64'],
    ['COINBASE:ETHUSD', 'Long Only', '11-26-44-30'],
    ['COINBASE:SOLUSD', 'Long Only', '7-22-52-22'],
    ['SPY', 'Long Only', '22-64-104-52'],
    ['GLD', 'Long Only', '11-30-44-26'],
    ['DBC', 'Long Only', '7-26-44-30'],
    ['LQD', 'Short Only', '9-26-60-30'],
    ['KRE', 'Long Only', '24-61-96-36'],
  ];

  for (const [symbol, directionMode, candidateKey] of baselines) {
    const candidates = candidatesForGroup({
      symbol,
      timeframe: '2D',
      directionMode,
      windowMode: 'All-Time',
    });
    assert.ok(
      candidates.some((candidate) => candidate.id === `custom:${candidateKey}`),
      `${symbol} ${directionMode} baseline ${candidateKey} should be tested`
    );
  }
});
