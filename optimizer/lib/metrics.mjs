function toNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizePercent(value) {
  if (value === null) {
    return null;
  }
  return Math.abs(value) <= 1 ? value * 100 : value;
}

function desc(left, right) {
  const safeLeft = left ?? Number.NEGATIVE_INFINITY;
  const safeRight = right ?? Number.NEGATIVE_INFINITY;
  return safeRight - safeLeft;
}

function asc(left, right) {
  const safeLeft = left ?? Number.POSITIVE_INFINITY;
  const safeRight = right ?? Number.POSITIVE_INFINITY;
  return safeLeft - safeRight;
}

function robustGroupKey(result) {
  return [result.symbol, result.directionMode, result.windowMode].join('|');
}

function bestGroupKey(result) {
  return [result.symbol, result.timeframe, result.directionMode, result.windowMode].join('|');
}

function aggregateSeedScore(results) {
  const passCount = results.filter((result) => result.pass).length;
  const averageProfitFactor = average(results.map((result) => result.profitFactor));
  const averageWinRatePct = average(results.map((result) => result.winRatePct));
  const averageNetProfitPct = average(results.map((result) => result.netProfitPct));
  const averageMaxDrawdownPct = average(results.map((result) => result.maxDrawdownPct));

  return {
    passCount,
    totalCount: results.length,
    averageProfitFactor,
    averageWinRatePct,
    averageNetProfitPct,
    averageMaxDrawdownPct,
  };
}

function average(values) {
  const numericValues = values.filter((value) => value !== null && value !== undefined);
  if (numericValues.length === 0) {
    return null;
  }
  return numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length;
}

export function extractNormalizedMetrics(rawMetrics = {}) {
  return {
    profitFactor: toNumber(rawMetrics.performance_all_profitFactor),
    winRatePct: normalizePercent(toNumber(rawMetrics.performance_all_percentProfitable)),
    netProfitPct: normalizePercent(toNumber(rawMetrics.performance_all_netProfitPercent)),
    netProfit: toNumber(rawMetrics.performance_all_netProfit),
    maxDrawdownPct: normalizePercent(toNumber(rawMetrics.performance_maxStrategyDrawDownPercent)),
    totalTrades: toNumber(rawMetrics.performance_all_totalTrades),
    marginCalls: toNumber(rawMetrics.performance_all_marginCalls) ?? 0,
    sharpe: toNumber(rawMetrics.performance_all_sharpeRatio),
    sortino: toNumber(rawMetrics.performance_all_sortinoRatio),
  };
}

export function evaluateQuality(metrics, qualityGates, windowMode) {
  const gate = qualityGates?.[windowMode] ?? {};
  const failures = [];

  if ((gate.minimumTrades ?? 0) > 0 && (metrics.totalTrades ?? 0) < gate.minimumTrades) {
    failures.push(`Trades < ${gate.minimumTrades}`);
  }
  if (gate.requirePositiveNetProfit && (metrics.netProfit ?? Number.NEGATIVE_INFINITY) <= 0) {
    failures.push('Net profit <= 0');
  }
  if ((gate.maxDrawdownPct ?? Number.POSITIVE_INFINITY) < (metrics.maxDrawdownPct ?? Number.POSITIVE_INFINITY)) {
    failures.push(`Drawdown > ${gate.maxDrawdownPct}%`);
  }
  if ((gate.maxMarginCalls ?? Number.POSITIVE_INFINITY) < (metrics.marginCalls ?? Number.POSITIVE_INFINITY)) {
    failures.push(`Margin calls > ${gate.maxMarginCalls}`);
  }

  return {
    pass: failures.length === 0,
    failures,
  };
}

export function compareRunResults(left, right) {
  return desc(left.pass ? 1 : 0, right.pass ? 1 : 0)
    || desc(left.profitFactor, right.profitFactor)
    || desc(left.winRatePct, right.winRatePct)
    || desc(left.netProfitPct, right.netProfitPct)
    || desc(left.totalTrades, right.totalTrades)
    || asc(left.maxDrawdownPct, right.maxDrawdownPct);
}

function compareAggregateResults(left, right) {
  return desc(left.passCount, right.passCount)
    || desc(left.averageProfitFactor, right.averageProfitFactor)
    || desc(left.averageWinRatePct, right.averageWinRatePct)
    || desc(left.averageNetProfitPct, right.averageNetProfitPct)
    || asc(left.averageMaxDrawdownPct, right.averageMaxDrawdownPct);
}

export function buildBestSettingSummaries(results) {
  const grouped = new Map();

  for (const result of results) {
    const key = bestGroupKey(result);
    const existing = grouped.get(key);
    if (!existing || compareRunResults(result, existing) < 0) {
      grouped.set(key, result);
    }
  }

  return [...grouped.values()].sort((left, right) =>
    left.symbol.localeCompare(right.symbol)
    || left.directionMode.localeCompare(right.directionMode)
    || left.windowMode.localeCompare(right.windowMode)
    || left.timeframe.localeCompare(right.timeframe)
  );
}

export function buildRobustSettingSummaries(results) {
  const grouped = new Map();

  for (const result of results) {
    const key = `${robustGroupKey(result)}|${result.candidateId}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(result);
  }

  const aggregates = [...grouped.values()].map((bucket) => {
    const first = bucket[0];
    const score = aggregateSeedScore(bucket);
    return {
      symbol: first.symbol,
      directionMode: first.directionMode,
      windowMode: first.windowMode,
      candidateId: first.candidateId,
      candidateLabel: first.candidateLabel,
      candidateFamily: first.candidateFamily,
      conversion: first.conversion,
      base: first.base,
      spanB: first.spanB,
      displacement: first.displacement,
      passCount: score.passCount,
      timeframeCount: score.totalCount,
      averageProfitFactor: score.averageProfitFactor,
      averageWinRatePct: score.averageWinRatePct,
      averageNetProfitPct: score.averageNetProfitPct,
      averageMaxDrawdownPct: score.averageMaxDrawdownPct,
      timeframes: bucket.map((result) => result.timeframe).sort(),
    };
  });

  const bestPerGroup = new Map();
  for (const aggregate of aggregates) {
    const key = robustGroupKey(aggregate);
    const existing = bestPerGroup.get(key);
    if (!existing || compareAggregateResults(aggregate, existing) < 0) {
      bestPerGroup.set(key, aggregate);
    }
  }

  return [...bestPerGroup.values()].sort((left, right) =>
    left.symbol.localeCompare(right.symbol)
    || left.directionMode.localeCompare(right.directionMode)
    || left.windowMode.localeCompare(right.windowMode)
  );
}

export function buildPhase1SeedMap(results, options = {}) {
  const maxSeeds = options.maxSeeds ?? 2;
  const presetRuns = results.filter((result) => result.phase === 'phase1' && result.candidateFamily === 'preset');
  const grouped = new Map();

  for (const result of presetRuns) {
    const key = `${robustGroupKey(result)}|${result.candidateId}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(result);
  }

  const aggregates = [...grouped.values()].map((bucket) => {
    const first = bucket[0];
    const score = aggregateSeedScore(bucket);
    return {
      groupKey: robustGroupKey(first),
      candidate: {
        id: first.candidateId,
        label: first.candidateLabel,
        family: first.candidateFamily,
        presetName: first.presetName,
        conversion: first.conversion,
        base: first.base,
        spanB: first.spanB,
        displacement: first.displacement,
      },
      ...score,
    };
  });

  const seedMap = {};
  for (const aggregate of aggregates) {
    if (!seedMap[aggregate.groupKey]) {
      seedMap[aggregate.groupKey] = [];
    }
    seedMap[aggregate.groupKey].push(aggregate);
  }

  for (const key of Object.keys(seedMap)) {
    seedMap[key] = seedMap[key]
      .sort(compareAggregateResults)
      .slice(0, maxSeeds)
      .map((entry) => entry.candidate);
  }

  return seedMap;
}
