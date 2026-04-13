import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');

let tvModulesPromise = null;

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function resolveTradingViewMcpRoot() {
  const candidates = [
    process.env.TRADINGVIEW_MCP_ROOT,
    path.resolve(repoRoot, 'tradingview-mcp'),
    path.resolve(repoRoot, '../tradingview-mcp'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, 'src/core/index.js'))) {
      return candidate;
    }
  }

  throw new Error(
    'TradingView MCP checkout not found. Set TRADINGVIEW_MCP_ROOT or place tradingview-mcp next to this repository.'
  );
}

async function importFromMcp(mcpRoot, relativePath) {
  return import(pathToFileURL(path.join(mcpRoot, relativePath)).href);
}

async function getTvModules() {
  if (!tvModulesPromise) {
    tvModulesPromise = (async () => {
      const mcpRoot = resolveTradingViewMcpRoot();
      const core = await importFromMcp(mcpRoot, 'src/core/index.js');
      const connection = await importFromMcp(mcpRoot, 'src/connection.js');
      const tab = core.tab ?? await importFromMcp(mcpRoot, 'src/core/tab.js');
      return {
        mcpRoot,
        chart: core.chart,
        data: core.data,
        health: core.health,
        indicators: core.indicators,
        tab,
        ui: core.ui,
        evaluateAsync: connection.evaluateAsync,
      };
    })();
  }

  return tvModulesPromise;
}

function normalizeSymbol(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

function normalizeTickerOnly(value) {
  return normalizeSymbol(value).split(':').pop();
}

function symbolsMatch(actual, expected) {
  const normalizedActual = normalizeSymbol(actual);
  const normalizedExpected = normalizeSymbol(expected);
  if (!normalizedActual || !normalizedExpected) {
    return false;
  }
  if (normalizedActual === normalizedExpected) {
    return true;
  }

  return normalizeTickerOnly(actual) === normalizeTickerOnly(expected);
}

function normalizeTimeframe(value) {
  const timeframe = String(value ?? '').trim().toUpperCase();
  if (timeframe === 'D') return '1D';
  if (timeframe === 'W') return '1W';
  if (timeframe === 'M') return '1M';
  return timeframe;
}

function timeframesMatch(actual, expected) {
  const normalizedActual = normalizeTimeframe(actual);
  const normalizedExpected = normalizeTimeframe(expected);
  return !!normalizedActual && !!normalizedExpected && normalizedActual === normalizedExpected;
}

function studyMatchesName(study, studyName) {
  if (!study?.name) {
    return false;
  }

  return study.name === studyName
    || study.name.includes(studyName)
    || studyName.includes(study.name);
}

async function waitForMarketData({ symbol, timeframe, retries = 20, delayMs = 1000 }) {
  const { chart, data } = await getTvModules();
  let lastError = null;

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const state = await chart.getState();
      const symbolReady = !symbol || symbolsMatch(state.symbol, symbol);
      const timeframeReady = !timeframe || timeframesMatch(state.resolution, timeframe);

      if (symbolReady && timeframeReady) {
        const quote = await data.getQuote({});
        if (quote?.success && Number.isFinite(quote.last)) {
          return;
        }
      }
    } catch (error) {
      lastError = error;
    }

    await sleep(delayMs);
  }

  const target = [symbol, timeframe].filter(Boolean).join(' / ');
  const detail = lastError ? ` (${lastError.message})` : '';
  throw new Error(`Chart data did not become ready for ${target}${detail}`);
}

export function resolveHigherTimeframe(higherTimeframeMap, timeframe) {
  const higherTimeframe = higherTimeframeMap?.[timeframe];
  if (!higherTimeframe) {
    throw new Error(`No higher timeframe mapping found for ${timeframe}`);
  }
  return higherTimeframe;
}

async function getStudyByName(studyName) {
  const { chart } = await getTvModules();
  const state = await chart.getState();
  const exactMatch = state.studies.find((study) => study.name === studyName);
  const study = exactMatch ?? state.studies.find((candidate) => studyMatchesName(candidate, studyName));
  if (!study) {
    const studyNames = state.studies.map((candidate) => candidate.name).join(', ');
    throw new Error(`Strategy study "${studyName}" not found on chart. Current studies: ${studyNames}`);
  }
  return study;
}

async function getStudyCalculationState(entityId) {
  const { evaluateAsync } = await getTvModules();
  const escapedEntityId = JSON.stringify(entityId);
  return evaluateAsync(`
    (async () => {
      const widgetValue = window.TradingViewApi && window.TradingViewApi._activeChartWidgetWV && window.TradingViewApi._activeChartWidgetWV.value
        ? window.TradingViewApi._activeChartWidgetWV.value()
        : null;
      const chart = widgetValue ? widgetValue._chartWidget : null;
      const sources = chart ? chart.model().model().dataSources() : [];
      const source = sources.find((candidate) => {
        try {
          return candidate.id && candidate.id() === ${escapedEntityId};
        } catch (error) {
          return false;
        }
      });
      if (!source) {
        return { found: false };
      }

      function unwrap(value) {
        if (value && typeof value.value === 'function') {
          try {
            return value.value();
          } catch (error) {
            return null;
          }
        }
        return value;
      }

      return {
        found: true,
        loading: typeof source.isLoading === 'function' ? source.isLoading() : false,
        calculationTime: unwrap(typeof source.calculationTime === 'function' ? source.calculationTime() : source._calculationTime),
        status: unwrap(typeof source.status === 'function' ? source.status() : source._status),
      };
    })()
  `);
}

async function waitForStudyCalculation({ entityId, previousCalculationTime, timeoutMs = 30000, pollMs = 500 } = {}) {
  if (!entityId) {
    return { success: true, skipped: true };
  }

  const startedAt = Date.now();
  let sawLoading = false;
  let lastState = null;

  while (Date.now() - startedAt < timeoutMs) {
    lastState = await getStudyCalculationState(entityId);
    if (!lastState?.found) {
      return { success: false, error: `Study ${entityId} was not found while waiting for recalculation.` };
    }

    if (lastState.loading) {
      sawLoading = true;
    }

    const calculationChanged = previousCalculationTime === null
      || previousCalculationTime === undefined
      || lastState.calculationTime !== previousCalculationTime;

    if (!lastState.loading && (sawLoading || calculationChanged)) {
      return { success: true, state: lastState };
    }

    await sleep(pollMs);
  }

  return {
    success: false,
    timeout: true,
    state: lastState,
  };
}

export async function applyStrategyInputs({ entityId, inputs, delaysMs = {} }) {
  const { indicators } = await getTvModules();
  if (!inputs || Object.keys(inputs).length === 0) {
    return { success: true, skipped: true };
  }

  const beforeCalculation = await getStudyCalculationState(entityId).catch(() => null);
  await indicators.setInputs({
    entity_id: entityId,
    inputs,
  });

  if ((delaysMs.afterInputChange ?? 0) > 0) {
    await sleep(delaysMs.afterInputChange);
  }

  if (delaysMs.waitForCalculation !== false) {
    await waitForStudyCalculation({
      entityId,
      previousCalculationTime: beforeCalculation?.calculationTime,
      timeoutMs: delaysMs.calculationTimeoutMs ?? 30000,
      pollMs: delaysMs.calculationPollMs ?? 500,
    });
  }

  return { success: true, entityId, inputCount: Object.keys(inputs).length };
}

export async function ensureStrategySession(strategyName) {
  const { health, indicators, ui } = await getTvModules();
  const connectionHealth = await health.healthCheck();
  if (!connectionHealth.api_available) {
    throw new Error('TradingView chart API is not available.');
  }

  await ui.openPanel({ panel: 'strategy-tester', action: 'open' });
  const study = await getStudyByName(strategyName);
  await indicators.toggleVisibility({ entity_id: study.id, visible: true });

  return {
    connectionHealth,
    strategyStudy: study,
  };
}

export async function setChartContext({ strategyName, symbol, timeframe, delaysMs = {} }) {
  const { chart, ui } = await getTvModules();
  const stateBefore = await chart.getState();

  if (!symbolsMatch(stateBefore.symbol, symbol)) {
    await chart.setSymbol({ symbol, skip_wait: true });
    await waitForMarketData({
      symbol,
      retries: delaysMs.chartReadyRetries ?? 20,
      delayMs: delaysMs.chartReadyPoll ?? Math.max(delaysMs.afterChartChange ?? 0, 1000),
    });
  }

  const stateAfterSymbol = symbolsMatch(stateBefore.symbol, symbol) ? stateBefore : await chart.getState();
  if (!timeframesMatch(stateAfterSymbol.resolution, timeframe)) {
    await chart.setTimeframe({ timeframe, skip_wait: true });
    await waitForMarketData({
      symbol,
      timeframe,
      retries: delaysMs.chartReadyRetries ?? 20,
      delayMs: delaysMs.chartReadyPoll ?? Math.max(delaysMs.afterChartChange ?? 0, 1000),
    });
  } else if (!symbolsMatch(stateBefore.symbol, symbol)) {
    await waitForMarketData({
      symbol,
      timeframe,
      retries: delaysMs.chartReadyRetries ?? 20,
      delayMs: delaysMs.chartReadyPoll ?? Math.max(delaysMs.afterChartChange ?? 0, 1000),
    });
  }

  if ((delaysMs.afterChartChange ?? 0) > 0) {
    await sleep(delaysMs.afterChartChange);
  }

  await ui.openPanel({ panel: 'strategy-tester', action: 'open' });
  return strategyName ? getStudyByName(strategyName) : null;
}

export async function readStrategyResults({ retries = 6, delaysMs = {}, entityId, studyName } = {}) {
  const { data, ui } = await getTvModules();
  let lastResponse = { metric_count: 0, metrics: {}, error: 'Strategy metrics not requested yet.' };

  for (let attempt = 0; attempt < retries; attempt += 1) {
    lastResponse = await data.getStrategyResults({ entity_id: entityId, study_name: studyName });
    if (lastResponse.metric_count > 0 && !lastResponse.error) {
      return lastResponse;
    }

    await ui.openPanel({ panel: 'strategy-tester', action: 'open' });
    if ((delaysMs.betweenRetries ?? 0) > 0) {
      await sleep(delaysMs.betweenRetries);
    }
  }

  if (!lastResponse.error) {
    lastResponse = {
      ...lastResponse,
      error: 'Strategy metrics remained empty after retries.',
    };
  }

  return lastResponse;
}
