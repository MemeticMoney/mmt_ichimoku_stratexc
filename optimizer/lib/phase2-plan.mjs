import fs from 'node:fs';

import { buildNeighborhoodCandidates, buildPresetCandidate } from './candidates.mjs';
import { normalizeOptimizerTimeframe, resolveHigherTimeframeCandidates } from './timeframe-candidates.mjs';

function normalizeBranch(branch) {
  if (branch === null || branch === undefined) {
    return null;
  }

  if (Array.isArray(branch) && branch.length >= 2) {
    return `${String(branch[0]).trim()}|${String(branch[1]).trim()}`;
  }

  const value = String(branch).trim();
  if (!value) {
    return null;
  }

  if (value.includes('|')) {
    const [directionMode, windowMode] = value.split('|').map((part) => part.trim());
    return `${directionMode}|${windowMode}`;
  }

  if (value.includes('/')) {
    const [directionMode, windowMode] = value.split('/').map((part) => part.trim());
    return `${directionMode}|${windowMode}`;
  }

  return value;
}

function normalizeSymbolEntry(entry = {}, defaults = {}) {
  return {
    primarySeed: entry.primarySeed ?? defaults.primarySeed ?? null,
    secondarySeed: entry.secondarySeed ?? defaults.secondarySeed ?? null,
    priorityTimeframes: (entry.priorityTimeframes ?? defaults.defaultPriorityTimeframes ?? [])
      .map(normalizeOptimizerTimeframe)
      .filter(Boolean),
    priorityBranches: (entry.priorityBranches ?? defaults.defaultPriorityBranches ?? [])
      .map(normalizeBranch)
      .filter(Boolean),
  };
}

export function loadPhase2SymbolPlan(planPath) {
  const source = fs.readFileSync(planPath, 'utf8');
  return JSON.parse(source);
}

export function resolvePhase2SymbolPlan(symbolPlan, symbol) {
  if (!symbolPlan) {
    return null;
  }

  const symbolEntry = symbolPlan.symbols?.[symbol] ?? {};
  return normalizeSymbolEntry(symbolEntry, symbolPlan);
}

export function isPhase2GroupAllowed({ symbolPlan, symbol, timeframe, directionMode, windowMode }) {
  if (!symbolPlan) {
    return true;
  }

  const entry = resolvePhase2SymbolPlan(symbolPlan, symbol);
  const branchKey = `${directionMode}|${windowMode}`;
  const normalizedTimeframe = normalizeOptimizerTimeframe(timeframe);

  const timeframeAllowed = entry.priorityTimeframes.length === 0 || entry.priorityTimeframes.includes(normalizedTimeframe);
  const branchAllowed = entry.priorityBranches.length === 0 || entry.priorityBranches.includes(branchKey);

  return timeframeAllowed && branchAllowed;
}

function appendPresetName(target, presetName) {
  if (!presetName) {
    return;
  }
  if (!target.includes(presetName)) {
    target.push(presetName);
  }
}

export function resolvePhase2SeedPresetNames({
  symbolPlan,
  symbol,
  phase1SeedMap,
  groupKey,
  maxPresetSeedsPerGroup,
}) {
  const names = [];
  const planEntry = resolvePhase2SymbolPlan(symbolPlan, symbol);

  appendPresetName(names, planEntry?.primarySeed);
  appendPresetName(names, planEntry?.secondarySeed);

  for (const seed of phase1SeedMap[groupKey] ?? []) {
    appendPresetName(names, seed.presetName);
  }

  return names.slice(0, maxPresetSeedsPerGroup);
}

export function makePhase2CandidatesResolver({
  config,
  phase1SeedMap,
  symbolPlan,
  robustSeedGroupKey,
}) {
  const maxPresetSeedsPerGroup = config.phase2?.maxPresetSeedsPerGroup ?? 2;

  return ({ symbol, timeframe, directionMode, windowMode }) => {
    if (!isPhase2GroupAllowed({ symbolPlan, symbol, timeframe, directionMode, windowMode })) {
      return [];
    }

    const groupKey = robustSeedGroupKey(symbol, directionMode, windowMode);
    const presetNames = resolvePhase2SeedPresetNames({
      symbolPlan,
      symbol,
      phase1SeedMap,
      groupKey,
      maxPresetSeedsPerGroup,
    });

    if (presetNames.length === 0) {
      return [];
    }

    const seeds = presetNames.map((presetName) => buildPresetCandidate(presetName));
    return buildNeighborhoodCandidates(seeds, config.phase2);
  };
}

export function calculatePhase2ExpectedRuns({ config, candidatesForGroup }) {
  let totalRuns = 0;

  for (const symbol of config.symbols) {
    for (const timeframe of config.timeframes) {
      const higherTimeframeCount = resolveHigherTimeframeCandidates(config, timeframe).length;
      for (const directionMode of config.directionModes) {
        for (const windowMode of config.windows) {
          totalRuns += higherTimeframeCount * candidatesForGroup({ symbol, timeframe, directionMode, windowMode }).length;
        }
      }
    }
  }

  return totalRuns;
}
