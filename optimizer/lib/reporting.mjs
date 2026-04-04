import fs from 'node:fs';
import path from 'node:path';

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function csvEscape(value) {
  if (value === null || value === undefined) {
    return '';
  }
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function writeCsv(filePath, rows) {
  const keys = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const lines = [
    keys.join(','),
    ...rows.map((row) => keys.map((key) => csvEscape(row[key])).join(',')),
  ];
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');
}

function markdownTable(headers, rows) {
  const headerLine = `| ${headers.join(' | ')} |`;
  const dividerLine = `| ${headers.map(() => '---').join(' | ')} |`;
  const bodyLines = rows.map((row) => `| ${row.map((value) => value ?? '').join(' | ')} |`);
  return [headerLine, dividerLine, ...bodyLines].join('\n');
}

function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'n/a';
  }
  return Number(value).toFixed(digits);
}

function flattenRun(result) {
  return {
    phase: result.phase,
    symbol: result.symbol,
    timeframe: result.timeframe,
    htfTimeframe: result.htfTimeframe,
    directionMode: result.directionMode,
    windowMode: result.windowMode,
    candidateId: result.candidateId,
    candidateLabel: result.candidateLabel,
    candidateFamily: result.candidateFamily,
    presetName: result.presetName,
    conversion: result.conversion,
    base: result.base,
    spanB: result.spanB,
    displacement: result.displacement,
    pass: result.pass,
    failureReasons: result.failureReasons.join('; '),
    profitFactor: result.profitFactor,
    winRatePct: result.winRatePct,
    netProfitPct: result.netProfitPct,
    netProfit: result.netProfit,
    maxDrawdownPct: result.maxDrawdownPct,
    totalTrades: result.totalTrades,
    marginCalls: result.marginCalls,
    rawMetricCount: result.rawMetricCount,
    rawError: result.rawError,
  };
}

export function writeOptimizerArtifacts({
  outputDir,
  config,
  phase1SeedMap,
  allResults,
  bestSettingSummaries,
  robustSettingSummaries,
  startedAt,
  finishedAt,
}) {
  ensureDirectory(outputDir);

  const flattenedRuns = allResults.map(flattenRun);
  writeJson(path.join(outputDir, 'raw-results.json'), allResults);
  writeJson(path.join(outputDir, 'phase1-seeds.json'), phase1SeedMap);
  writeCsv(path.join(outputDir, 'all-runs.csv'), flattenedRuns);
  writeCsv(path.join(outputDir, 'best-settings.csv'), bestSettingSummaries.map(flattenRun));
  writeCsv(path.join(outputDir, 'robust-settings.csv'), robustSettingSummaries);

  const summaryLines = [
    '# V2 Optimizer Summary',
    '',
    `- Started: ${startedAt}`,
    `- Finished: ${finishedAt}`,
    `- Symbols: ${config.symbols.join(', ')}`,
    `- Timeframes: ${config.timeframes.join(', ')}`,
    `- Direction modes: ${config.directionModes.join(', ')}`,
    `- Windows: ${config.windows.join(', ')}`,
    `- Total runs: ${allResults.length}`,
    '',
    '## Best Settings By Symbol / Timeframe / Direction / Window',
    '',
    markdownTable(
      ['Symbol', 'TF', 'Direction', 'Window', 'Cloud', 'PF', 'Win %', 'DD %', 'Trades', 'Pass'],
      bestSettingSummaries.map((summary) => [
        summary.symbol,
        summary.timeframe,
        summary.directionMode,
        summary.windowMode,
        summary.candidateLabel,
        formatNumber(summary.profitFactor),
        formatNumber(summary.winRatePct),
        formatNumber(summary.maxDrawdownPct),
        formatNumber(summary.totalTrades, 0),
        summary.pass ? 'Yes' : 'No',
      ])
    ),
    '',
    '## Robust Winners By Symbol / Direction / Window',
    '',
    markdownTable(
      ['Symbol', 'Direction', 'Window', 'Cloud', 'Pass TFs', 'Avg PF', 'Avg Win %', 'Avg DD %', 'TFs'],
      robustSettingSummaries.map((summary) => [
        summary.symbol,
        summary.directionMode,
        summary.windowMode,
        summary.candidateLabel,
        `${summary.passCount}/${summary.timeframeCount}`,
        formatNumber(summary.averageProfitFactor),
        formatNumber(summary.averageWinRatePct),
        formatNumber(summary.averageMaxDrawdownPct),
        summary.timeframes.join(', '),
      ])
    ),
    '',
    '## Files',
    '',
    '- `raw-results.json`',
    '- `all-runs.csv`',
    '- `best-settings.csv`',
    '- `robust-settings.csv`',
    '- `phase1-seeds.json`',
  ];

  fs.writeFileSync(path.join(outputDir, 'summary.md'), `${summaryLines.join('\n')}\n`, 'utf8');
}
