#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { assertRequiredInputs, buildStrategyInputIdMap } from './lib/strategy-input-map.mjs';
import { buildNeighborhoodCandidates, buildPresetCandidates } from './lib/candidates.mjs';
import {
  buildBestSettingSummaries,
  buildPhase1SeedMap,
  buildRobustSettingSummaries,
  compareRunResults,
  evaluateQuality,
  extractNormalizedMetrics,
} from './lib/metrics.mjs';
import {
  applyStrategyInputs,
  ensureStrategySession,
  readStrategyResults,
  resolveHigherTimeframe,
  setChartContext,
} from './lib/tv-session.mjs';
import { writeOptimizerArtifacts } from './lib/reporting.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const defaultConfigPath = path.resolve(__dirname, 'config.example.json');

const REQUIRED_INPUTS = [
  'preset',
  'customConversion',
  'customBase',
  'customSpanB',
  'customDisplacement',
  'htfTimeframe',
  'enableBreakout',
  'enableChecklist',
  'enableKijun',
  'directionFilter',
  'showMarkers',
  'showInvalidation',
  'showRegimeShading',
  'showValidationDashboard',
  'validationPositionLabel',
  'pushValidationBelowBanner',
  'backtestWindowMode',
];

function parseArgs(argv) {
  const args = {
    configPath: defaultConfigPath,
    phase: 'full',
    maxRuns: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--config') {
      args.configPath = path.resolve(process.cwd(), argv[index + 1]);
      index += 1;
    } else if (token === '--phase') {
      args.phase = argv[index + 1] ?? 'full';
      index += 1;
    } else if (token === '--max-runs') {
      args.maxRuns = Number(argv[index + 1]);
      index += 1;
    }
  }

  return args;
}

function loadConfig(configPath) {
  const source = fs.readFileSync(configPath, 'utf8');
  return {
    config: JSON.parse(source),
    configDirectory: path.dirname(configPath),
  };
}

function resolveConfigPath(configDirectory, filePath) {
  const configRelativePath = path.resolve(configDirectory, filePath);
  if (fs.existsSync(configRelativePath)) {
    return configRelativePath;
  }

  return path.resolve(projectRoot, filePath);
}

function makeRunId() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function buildStrategyInputPayload({
  inputIdMap,
  candidate,
  htfTimeframe,
  directionMode,
  windowMode,
  fixedInputs,
}) {
  return {
    [inputIdMap.preset]: candidate.family === 'preset' ? candidate.presetName : 'Custom',
    [inputIdMap.customConversion]: candidate.conversion,
    [inputIdMap.customBase]: candidate.base,
    [inputIdMap.customSpanB]: candidate.spanB,
    [inputIdMap.customDisplacement]: candidate.displacement,
    [inputIdMap.htfTimeframe]: htfTimeframe,
    [inputIdMap.enableBreakout]: fixedInputs.enableBreakout,
    [inputIdMap.enableChecklist]: fixedInputs.enableChecklist,
    [inputIdMap.enableKijun]: fixedInputs.enableKijun,
    [inputIdMap.directionFilter]: directionMode,
    [inputIdMap.showMarkers]: fixedInputs.showMarkers,
    [inputIdMap.showInvalidation]: fixedInputs.showInvalidation,
    [inputIdMap.showRegimeShading]: fixedInputs.showRegimeShading,
    [inputIdMap.showValidationDashboard]: fixedInputs.showValidationDashboard,
    [inputIdMap.validationPositionLabel]: fixedInputs.validationPositionLabel,
    [inputIdMap.pushValidationBelowBanner]: fixedInputs.pushValidationBelowBanner,
    [inputIdMap.backtestWindowMode]: windowMode,
  };
}

function logRunPrefix(counter, total, phase, symbol, timeframe, directionMode, windowMode, candidateLabel) {
  const progress = total ? `[${counter}/${total}] ` : '';
  return `${progress}${phase} ${symbol} ${timeframe} ${directionMode} ${windowMode} ${candidateLabel}`;
}

function robustSeedGroupKey(symbol, directionMode, windowMode) {
  return [symbol, directionMode, windowMode].join('|');
}

async function executeRuns({
  phase,
  config,
  inputIdMap,
  candidatesForGroup,
  maxRuns,
}) {
  const results = [];
  let runCounter = 0;

  for (const symbol of config.symbols) {
    for (const timeframe of config.timeframes) {
      const htfTimeframe = resolveHigherTimeframe(config.higherTimeframeMap, timeframe);
      const strategyStudy = await setChartContext({
        strategyName: config.strategyName,
        symbol,
        timeframe,
        delaysMs: config.delaysMs,
      });

      for (const directionMode of config.directionModes) {
        for (const windowMode of config.windows) {
          const groupCandidates = candidatesForGroup({ symbol, timeframe, directionMode, windowMode });
          if (groupCandidates.length === 0) {
            continue;
          }

          for (const candidate of groupCandidates) {
            if (maxRuns !== null && runCounter >= maxRuns) {
              return results;
            }

            runCounter += 1;
            const prefix = logRunPrefix(
              runCounter,
              maxRuns,
              phase,
              symbol,
              timeframe,
              directionMode,
              windowMode,
              candidate.label
            );
            console.log(prefix);

            const inputs = buildStrategyInputPayload({
              inputIdMap,
              candidate,
              htfTimeframe,
              directionMode,
              windowMode,
              fixedInputs: config.fixedInputs,
            });

            await applyStrategyInputs({
              entityId: strategyStudy.id,
              inputs,
              delaysMs: config.delaysMs,
            });

            const rawMetrics = await readStrategyResults({
              retries: config.metricRetries,
              delaysMs: config.delaysMs,
            });
            const metrics = extractNormalizedMetrics(rawMetrics.metrics);
            const quality = evaluateQuality(metrics, config.qualityGates, windowMode);

            results.push({
              phase,
              symbol,
              timeframe,
              htfTimeframe,
              directionMode,
              windowMode,
              candidateId: candidate.id,
              candidateLabel: candidate.label,
              candidateFamily: candidate.family,
              presetName: candidate.presetName,
              conversion: candidate.conversion,
              base: candidate.base,
              spanB: candidate.spanB,
              displacement: candidate.displacement,
              pass: quality.pass,
              failureReasons: quality.failures,
              rawMetricCount: rawMetrics.metric_count,
              rawError: rawMetrics.error ?? null,
              ...metrics,
              ...(config.reports?.includeRawMetrics ? { rawMetrics: rawMetrics.metrics } : {}),
            });
          }
        }
      }
    }
  }

  return results;
}

function summarizeTopSeeds(seedMap) {
  const summary = {};
  for (const [groupKey, seeds] of Object.entries(seedMap)) {
    summary[groupKey] = seeds.map((seed) => `${seed.presetName} (${seed.conversion}/${seed.base}/${seed.spanB}/${seed.displacement})`);
  }
  return summary;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { config, configDirectory } = loadConfig(args.configPath);
  const strategyPath = resolveConfigPath(configDirectory, config.strategyPath ?? './pine/Ichi_Workflow_Strategy.pine');
  const outputRoot = resolveConfigPath(configDirectory, config.outputDir ?? './optimizer/output');

  const { map: inputIdMap } = buildStrategyInputIdMap(strategyPath);
  assertRequiredInputs(inputIdMap, REQUIRED_INPUTS);

  const startedAt = new Date().toISOString();
  const runId = makeRunId();
  const outputDir = path.join(outputRoot, runId);

  console.log(`Using config: ${args.configPath}`);
  console.log(`Strategy path: ${strategyPath}`);
  console.log(`Output dir: ${outputDir}`);

  await ensureStrategySession(config.strategyName);

  const phase1Candidates = buildPresetCandidates(config.phase1?.presetNames);
  const phase1Results = await executeRuns({
    phase: 'phase1',
    config,
    inputIdMap,
    maxRuns: args.maxRuns,
    candidatesForGroup: () => phase1Candidates,
  });

  let phase2Results = [];
  let phase1SeedMap = {};

  if (args.phase === 'full' && config.phase2?.enabled !== false) {
    phase1SeedMap = buildPhase1SeedMap(phase1Results, {
      maxSeeds: config.phase2?.maxPresetSeedsPerGroup ?? 2,
    });
    console.log('Phase 1 seed winners:', summarizeTopSeeds(phase1SeedMap));

    const phase2Budget = args.maxRuns === null ? null : Math.max(args.maxRuns - phase1Results.length, 0);
    if (phase2Budget !== 0) {
      phase2Results = await executeRuns({
        phase: 'phase2',
        config,
        inputIdMap,
        maxRuns: phase2Budget,
        candidatesForGroup: ({ symbol, directionMode, windowMode }) => {
          const groupKey = robustSeedGroupKey(symbol, directionMode, windowMode);
          const seeds = phase1SeedMap[groupKey] ?? [];
          return buildNeighborhoodCandidates(seeds, config.phase2);
        },
      });
    }
  }

  const allResults = [...phase1Results, ...phase2Results];
  const bestSettingSummaries = buildBestSettingSummaries(allResults);
  const robustSettingSummaries = buildRobustSettingSummaries(allResults);
  const finishedAt = new Date().toISOString();

  writeOptimizerArtifacts({
    outputDir,
    config,
    phase1SeedMap,
    allResults,
    bestSettingSummaries,
    robustSettingSummaries,
    startedAt,
    finishedAt,
  });

  const overallTop = [...bestSettingSummaries].sort(compareRunResults)[0];
  if (overallTop) {
    console.log(
      `Top run: ${overallTop.symbol} ${overallTop.timeframe} ${overallTop.directionMode} ${overallTop.windowMode} ${overallTop.candidateLabel} | PF ${overallTop.profitFactor ?? 'n/a'} | Win ${overallTop.winRatePct ?? 'n/a'}`
    );
  }
  console.log(`Wrote optimizer artifacts to ${outputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
