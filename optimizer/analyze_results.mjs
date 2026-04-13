#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {
    inputDir: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--input-dir') {
      args.inputDir = path.resolve(process.cwd(), argv[index + 1]);
      index += 1;
    }
  }

  if (!args.inputDir) {
    throw new Error('Usage: node optimizer/analyze_results.mjs --input-dir <optimizer/output/run-folder>');
  }

  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function compareResults(left, right) {
  const leftPass = left.pass ? 1 : 0;
  const rightPass = right.pass ? 1 : 0;
  return rightPass - leftPass
    || (right.profitFactor ?? Number.NEGATIVE_INFINITY) - (left.profitFactor ?? Number.NEGATIVE_INFINITY)
    || (right.winRatePct ?? Number.NEGATIVE_INFINITY) - (left.winRatePct ?? Number.NEGATIVE_INFINITY)
    || (right.netProfitPct ?? Number.NEGATIVE_INFINITY) - (left.netProfitPct ?? Number.NEGATIVE_INFINITY)
    || (right.totalTrades ?? Number.NEGATIVE_INFINITY) - (left.totalTrades ?? Number.NEGATIVE_INFINITY)
    || (left.maxDrawdownPct ?? Number.POSITIVE_INFINITY) - (right.maxDrawdownPct ?? Number.POSITIVE_INFINITY);
}

function average(values) {
  const filtered = values.filter((value) => value !== null && value !== undefined);
  if (filtered.length === 0) {
    return null;
  }
  return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
}

function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'n/a';
  }
  return Number(value).toFixed(digits);
}

function markdownTable(headers, rows) {
  const header = `| ${headers.join(' | ')} |`;
  const divider = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${row.join(' | ')} |`);
  return [header, divider, ...body].join('\n');
}

function groupBy(items, keyFn) {
  const grouped = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(item);
  }
  return grouped;
}

function buildBestPerGroup(results) {
  const groups = groupBy(results, (result) => [result.symbol, result.timeframe, result.directionMode, result.windowMode].join('|'));
  return [...groups.values()].map((group) => [...group].sort(compareResults)[0]);
}

function buildRobustPerGroup(results) {
  const candidateGroups = groupBy(results, (result) => [result.symbol, result.directionMode, result.windowMode, result.candidateLabel].join('|'));
  const aggregates = [...candidateGroups.values()].map((group) => {
    const first = group[0];
    const passCount = group.filter((result) => result.pass).length;
    return {
      symbol: first.symbol,
      directionMode: first.directionMode,
      windowMode: first.windowMode,
      candidateLabel: first.candidateLabel,
      conversion: first.conversion,
      base: first.base,
      spanB: first.spanB,
      displacement: first.displacement,
      passCount,
      timeframeCount: group.length,
      averageProfitFactor: average(group.map((result) => result.profitFactor)),
      averageWinRatePct: average(group.map((result) => result.winRatePct)),
      averageNetProfitPct: average(group.map((result) => result.netProfitPct)),
      averageMaxDrawdownPct: average(group.map((result) => result.maxDrawdownPct)),
      timeframes: group.map((result) => result.timeframe).sort(),
    };
  });

  const robustGroups = groupBy(aggregates, (aggregate) => [aggregate.symbol, aggregate.directionMode, aggregate.windowMode].join('|'));
  return [...robustGroups.values()].map((group) =>
    [...group].sort((left, right) =>
      right.passCount - left.passCount
      || (right.averageProfitFactor ?? Number.NEGATIVE_INFINITY) - (left.averageProfitFactor ?? Number.NEGATIVE_INFINITY)
      || (right.averageWinRatePct ?? Number.NEGATIVE_INFINITY) - (left.averageWinRatePct ?? Number.NEGATIVE_INFINITY)
      || (right.averageNetProfitPct ?? Number.NEGATIVE_INFINITY) - (left.averageNetProfitPct ?? Number.NEGATIVE_INFINITY)
      || (left.averageMaxDrawdownPct ?? Number.POSITIVE_INFINITY) - (right.averageMaxDrawdownPct ?? Number.POSITIVE_INFINITY)
    )[0]
  );
}

function buildConvergenceCounts(items, key = 'candidateLabel') {
  const counts = new Map();
  for (const item of items) {
    const label = item[key];
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${content}\n`, 'utf8');
}

function buildTickerReport(symbol, bestResults, robustResults) {
  const lines = [
    `# ${symbol}`,
    '',
    '## Best Settings',
    '',
    markdownTable(
      ['TF', 'Direction', 'Window', 'Cloud', 'PF', 'Win %', 'DD %', 'Trades', 'Pass'],
      bestResults.map((result) => [
        result.timeframe,
        result.directionMode,
        result.windowMode,
        result.candidateLabel,
        formatNumber(result.profitFactor),
        formatNumber(result.winRatePct),
        formatNumber(result.maxDrawdownPct),
        formatNumber(result.totalTrades, 0),
        result.pass ? 'Yes' : 'No',
      ])
    ),
    '',
    '## Robust Winners',
    '',
    markdownTable(
      ['Direction', 'Window', 'Cloud', 'Pass TFs', 'Avg PF', 'Avg Win %', 'Avg DD %', 'TFs'],
      robustResults.map((result) => [
        result.directionMode,
        result.windowMode,
        result.candidateLabel,
        `${result.passCount}/${result.timeframeCount}`,
        formatNumber(result.averageProfitFactor),
        formatNumber(result.averageWinRatePct),
        formatNumber(result.averageMaxDrawdownPct),
        result.timeframes.join(', '),
      ])
    ),
  ];

  return lines.join('\n');
}

function main() {
  const { inputDir } = parseArgs(process.argv.slice(2));
  const rawResults = readJson(path.join(inputDir, 'raw-results.json'));
  const bestResults = buildBestPerGroup(rawResults);
  const robustResults = buildRobustPerGroup(rawResults);
  const passingBestResults = bestResults.filter((result) => result.pass);
  const passingRobustResults = robustResults.filter((result) => result.passCount > 0);

  const bestConvergence = buildConvergenceCounts(passingBestResults);
  const robustConvergence = buildConvergenceCounts(passingRobustResults);

  const overviewLines = [
    '# Phase 1 Analysis',
    '',
    `- Input directory: ${inputDir}`,
    `- Total runs: ${rawResults.length}`,
    `- Best result groups: ${bestResults.length}`,
    `- Passing best groups: ${passingBestResults.length}`,
    `- Robust winner groups: ${robustResults.length}`,
    `- Passing robust groups: ${passingRobustResults.length}`,
    '',
    '## Convergence By Passing Best Results',
    '',
    markdownTable(
      ['Cloud', 'Winning Groups'],
      bestConvergence.map((item) => [item.label, item.count])
    ),
    '',
    '## Convergence By Robust Winners',
    '',
    markdownTable(
      ['Cloud', 'Robust Groups'],
      robustConvergence.map((item) => [item.label, item.count])
    ),
  ];

  writeFile(path.join(inputDir, 'analysis.md'), overviewLines.join('\n'));

  const tickerDirectory = path.join(inputDir, 'ticker_summaries');
  const symbols = [...new Set(rawResults.map((result) => result.symbol))].sort();
  for (const symbol of symbols) {
    const symbolBest = bestResults.filter((result) => result.symbol === symbol)
      .sort((left, right) =>
        left.directionMode.localeCompare(right.directionMode)
        || left.windowMode.localeCompare(right.windowMode)
        || left.timeframe.localeCompare(right.timeframe)
      );
    const symbolRobust = robustResults.filter((result) => result.symbol === symbol)
      .sort((left, right) =>
        left.directionMode.localeCompare(right.directionMode)
        || left.windowMode.localeCompare(right.windowMode)
      );
    writeFile(path.join(tickerDirectory, `${symbol.replace(/[^A-Za-z0-9]+/g, '_')}.md`), buildTickerReport(symbol, symbolBest, symbolRobust));
  }

  console.log(`Wrote analysis to ${path.join(inputDir, 'analysis.md')}`);
}

main();
