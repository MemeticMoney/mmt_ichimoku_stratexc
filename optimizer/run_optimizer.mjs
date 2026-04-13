#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { assertRequiredInputs, buildStrategyInputIdMap } from './lib/strategy-input-map.mjs';
import { buildPresetCandidates } from './lib/candidates.mjs';
import {
  buildBestSettingSummaries,
  buildPhase1SeedMap,
  buildRobustSettingSummaries,
  compareRunResults,
  evaluateQuality,
  extractNormalizedMetrics,
} from './lib/metrics.mjs';
import {
  calculatePhase2ExpectedRuns,
  loadPhase2SymbolPlan,
  makePhase2CandidatesResolver,
} from './lib/phase2-plan.mjs';
import {
  applyStrategyInputs,
  ensureStrategySession,
  readStrategyResults,
  setChartContext,
} from './lib/tv-session.mjs';
import { resolveHigherTimeframeCandidates } from './lib/timeframe-candidates.mjs';
import { writeOptimizerArtifacts } from './lib/reporting.mjs';
import { writeCheckpointArtifacts } from './lib/reporting.mjs';

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
  'backtestWindowMode',
];

const DASHBOARD_INPUT_ALIASES = [
  ['showValidationDashboard', 'showDashboard'],
  ['validationPositionLabel', 'dashboardPositionLabel'],
  ['pushValidationBelowBanner', 'pushDashboardBelowBanner'],
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
  if (path.isAbsolute(filePath)) {
    return filePath;
  }
  return path.resolve(configDirectory, filePath);
}

function makeRunId() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function assertRequiredInputAlias(map, aliases) {
  if (!aliases.some((variableName) => map[variableName])) {
    throw new Error(`Missing script input: one of ${aliases.join(', ')}`);
  }
}

function setFirstMappedInput(payload, inputIdMap, aliases, value) {
  const variableName = aliases.find((candidate) => inputIdMap[candidate]);
  if (variableName) {
    payload[inputIdMap[variableName]] = value;
  }
}

function buildStrategyInputPayload({
  inputIdMap,
  candidate,
  htfTimeframe,
  directionMode,
  windowMode,
  fixedInputs,
}) {
  const payload = {
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
    [inputIdMap.backtestWindowMode]: windowMode,
  };

  setFirstMappedInput(payload, inputIdMap, ['showValidationDashboard', 'showDashboard'], fixedInputs.showValidationDashboard ?? fixedInputs.showDashboard);
  setFirstMappedInput(payload, inputIdMap, ['validationPositionLabel', 'dashboardPositionLabel'], fixedInputs.validationPositionLabel ?? fixedInputs.dashboardPositionLabel);
  setFirstMappedInput(payload, inputIdMap, ['pushValidationBelowBanner', 'pushDashboardBelowBanner'], fixedInputs.pushValidationBelowBanner ?? fixedInputs.pushDashboardBelowBanner);

  if (inputIdMap.enableEdge) {
    payload[inputIdMap.enableEdge] = fixedInputs.enableEdge ?? true;
  }
  if (inputIdMap.useSymbolProfiles && fixedInputs.useSymbolProfiles !== undefined) {
    payload[inputIdMap.useSymbolProfiles] = fixedInputs.useSymbolProfiles;
  }

  return payload;
}

function logRunPrefix(counter, total, phase, symbol, timeframe, directionMode, windowMode, candidateLabel) {
  const progress = total ? `[${counter}/${total}] ` : '';
  return `${progress}${phase} ${symbol} ${timeframe} ${directionMode} ${windowMode} ${candidateLabel}`;
}

function robustSeedGroupKey(symbol, directionMode, windowMode) {
  return [symbol, directionMode, windowMode].join('|');
}

function calculateTotalRuns({ config, candidateCount }) {
  const runsPerSymbol = config.timeframes.reduce((timeframeTotal, timeframe) => (
      timeframeTotal
      + resolveHigherTimeframeCandidates(config, timeframe).length
        * config.directionModes.length
        * config.windows.length
        * candidateCount
    ), 0);
  return config.symbols.length * runsPerSymbol;
}

function capExpectedRuns(expectedRuns, maxRuns) {
  if (maxRuns === null || maxRuns === undefined) {
    return expectedRuns;
  }
  if (expectedRuns === null || expectedRuns === undefined) {
    return maxRuns;
  }
  return Math.min(expectedRuns, maxRuns);
}

async function executeRuns({
  phase,
  config,
  inputIdMap,
  candidatesForGroup,
  expectedRuns,
  checkpointEveryRuns,
  onCheckpoint,
  maxRuns,
}) {
  const results = [];
  let runCounter = 0;

  for (const symbol of config.symbols) {
    for (const timeframe of config.timeframes) {
      const htfTimeframes = resolveHigherTimeframeCandidates(config, timeframe);
      let strategyStudy;
      try {
        strategyStudy = await setChartContext({
          strategyName: config.strategyName,
          symbol,
          timeframe,
          delaysMs: config.delaysMs,
        });
      } catch (error) {
        console.error(`Skipping ${symbol} ${timeframe}: ${error.message}`);
        continue;
      }

      for (const htfTimeframe of htfTimeframes) {
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
              const prefix = `${logRunPrefix(
                runCounter,
                maxRuns ?? expectedRuns,
                phase,
                symbol,
                timeframe,
                directionMode,
                windowMode,
                candidate.label
              )} HTF ${htfTimeframe}`;
              console.log(prefix);

              const inputs = buildStrategyInputPayload({
                inputIdMap,
                candidate,
                htfTimeframe,
                directionMode,
                windowMode,
                fixedInputs: config.fixedInputs,
              });

              let rawMetrics;
              let metrics;
              let quality;
              try {
                await applyStrategyInputs({
                  entityId: strategyStudy.id,
                  inputs,
                  delaysMs: config.delaysMs,
                });

                rawMetrics = await readStrategyResults({
                  retries: config.metricRetries,
                  delaysMs: config.delaysMs,
                  entityId: strategyStudy.id,
                  studyName: config.strategyName,
                });
                metrics = extractNormalizedMetrics(rawMetrics.metrics);
                quality = evaluateQuality(metrics, config.qualityGates, windowMode);
              } catch (error) {
                console.error(`Run failed for ${prefix}: ${error.message}`);
                rawMetrics = {
                  metric_count: 0,
                  metrics: {},
                  error: error.message,
                };
                metrics = extractNormalizedMetrics(rawMetrics.metrics);
                quality = {
                  pass: false,
                  failures: [error.message],
                };
              }

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

              if (checkpointEveryRuns > 0 && runCounter % checkpointEveryRuns === 0) {
                await onCheckpoint?.({
                  phase,
                  completedRuns: runCounter,
                  expectedRuns,
                  results,
                });
              }
            }
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
  const phase2SymbolPlanPath = config.phase2?.symbolPlanPath
    ? resolveConfigPath(configDirectory, config.phase2.symbolPlanPath)
    : null;
  const phase2SymbolPlan = phase2SymbolPlanPath ? loadPhase2SymbolPlan(phase2SymbolPlanPath) : null;

  const { map: inputIdMap } = buildStrategyInputIdMap(strategyPath);
  assertRequiredInputs(inputIdMap, REQUIRED_INPUTS);
  for (const aliases of DASHBOARD_INPUT_ALIASES) {
    assertRequiredInputAlias(inputIdMap, aliases);
  }

  const startedAt = new Date().toISOString();
  const runId = makeRunId();
  const outputDir = path.join(outputRoot, runId);

  console.log(`Using config: ${args.configPath}`);
  console.log(`Strategy path: ${strategyPath}`);
  console.log(`Output dir: ${outputDir}`);
  if (phase2SymbolPlanPath) {
    console.log(`Phase 2 symbol plan: ${phase2SymbolPlanPath}`);
  }

  await ensureStrategySession(config.strategyName);

  const phase1Candidates = buildPresetCandidates(config.phase1?.presetNames);
  const shouldRunPhase1 = args.phase === 'full' || args.phase === 'phase1';
  const shouldRunPhase2 = (args.phase === 'full' || args.phase === 'phase2') && config.phase2?.enabled !== false;
  const phase1ExpectedRuns = shouldRunPhase1 ? calculateTotalRuns({
    config,
    candidateCount: phase1Candidates.length,
  }) : 0;
  const checkpointEveryRuns = config.checkpointEveryRuns ?? 0;
  const makeCheckpoint = async ({ phase, completedRuns, expectedRuns, results }) => {
    const bestSettingSummaries = buildBestSettingSummaries(results);
    const robustSettingSummaries = buildRobustSettingSummaries(results);
    writeCheckpointArtifacts({
      outputRoot,
      config,
      phase1SeedMap: phase === 'phase1' ? {} : buildPhase1SeedMap(results.filter((result) => result.phase === 'phase1'), {
        maxSeeds: config.phase2?.maxPresetSeedsPerGroup ?? 2,
      }),
      allResults: results,
      bestSettingSummaries,
      robustSettingSummaries,
      startedAt,
      finishedAt: new Date().toISOString(),
      progress: {
        phase,
        completedRuns,
        expectedRuns,
        symbolsCompletedApprox: expectedRuns
          ? Math.floor((completedRuns / expectedRuns) * config.symbols.length)
          : null,
      },
    });
  };
  const phase1Results = shouldRunPhase1
    ? await executeRuns({
      phase: 'phase1',
      config,
      inputIdMap,
      expectedRuns: capExpectedRuns(phase1ExpectedRuns, args.maxRuns),
      checkpointEveryRuns,
      onCheckpoint: makeCheckpoint,
      maxRuns: args.maxRuns,
      candidatesForGroup: () => phase1Candidates,
    })
    : [];

  let phase2Results = [];
  let phase1SeedMap = {};

  if (shouldRunPhase1) {
    phase1SeedMap = buildPhase1SeedMap(phase1Results, {
      maxSeeds: config.phase2?.maxPresetSeedsPerGroup ?? 2,
    });
  }

  if (shouldRunPhase2) {
    if (args.phase === 'phase2' && !phase2SymbolPlan && Object.keys(phase1SeedMap).length === 0) {
      throw new Error('Phase 2 requires either phase2.symbolPlanPath or a preceding Phase 1 run that produces seed winners.');
    }

    const phase2CandidatesForGroup = makePhase2CandidatesResolver({
      config,
      phase1SeedMap,
      symbolPlan: phase2SymbolPlan,
      robustSeedGroupKey,
    });
    const phase2ExpectedRuns = calculatePhase2ExpectedRuns({
      config,
      candidatesForGroup: phase2CandidatesForGroup,
    });

    if (Object.keys(phase1SeedMap).length > 0) {
      console.log('Phase 1 seed winners:', summarizeTopSeeds(phase1SeedMap));
    }
    console.log(`Phase 2 planned runs: ${phase2ExpectedRuns}`);

    const phase2Budget = args.maxRuns === null ? null : Math.max(args.maxRuns - phase1Results.length, 0);
    if (phase2Budget !== 0) {
      phase2Results = await executeRuns({
        phase: 'phase2',
        config,
        inputIdMap,
        expectedRuns: capExpectedRuns(phase2ExpectedRuns, phase2Budget),
        checkpointEveryRuns,
        onCheckpoint: async ({ phase, completedRuns, results }) => {
          const mergedResults = [...phase1Results, ...results];
          await makeCheckpoint({
            phase,
            completedRuns: phase1Results.length + completedRuns,
            expectedRuns: capExpectedRuns(phase1ExpectedRuns + phase2ExpectedRuns, args.maxRuns),
            results: mergedResults,
          });
        },
        maxRuns: phase2Budget,
        candidatesForGroup: phase2CandidatesForGroup,
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
