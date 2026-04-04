import { chart, data, health, indicators, ui } from '../../../tradingview-mcp/src/core/index.js';

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function normalizeSymbol(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
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

  const actualTicker = normalizedActual.split(':').pop();
  const expectedTicker = normalizedExpected.split(':').pop();
  return actualTicker === expectedTicker;
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

function studyMatchesName(study, strategyName) {
  if (!study?.name) {
    return false;
  }
  return study.name === strategyName || study.name.includes(strategyName) || strategyName.includes(study.name);
}

async function waitForMarketData({ symbol, timeframe, retries = 20, delayMs = 1000 }) {
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

async function getStrategyStudy(strategyName) {
  const state = await chart.getState();
  const exactMatch = state.studies.find((study) => study.name === strategyName);
  const study = exactMatch ?? state.studies.find((candidate) => studyMatchesName(candidate, strategyName));
  if (!study) {
    const studyNames = state.studies.map((candidate) => candidate.name).join(', ');
    throw new Error(`Strategy study "${strategyName}" not found on chart. Current studies: ${studyNames}`);
  }
  return study;
}

export async function ensureStrategySession(strategyName) {
  const connectionHealth = await health.healthCheck();
  if (!connectionHealth.api_available) {
    throw new Error('TradingView chart API is not available.');
  }

  await ui.openPanel({ panel: 'strategy-tester', action: 'open' });
  const study = await getStrategyStudy(strategyName);
  await indicators.toggleVisibility({ entity_id: study.id, visible: true });

  return {
    connectionHealth,
    strategyStudy: study,
  };
}

export async function setChartContext({ strategyName, symbol, timeframe, delaysMs = {} }) {
  await chart.setSymbol({ symbol });
  await waitForMarketData({
    symbol,
    retries: delaysMs.chartReadyRetries ?? 20,
    delayMs: delaysMs.chartReadyPoll ?? Math.max(delaysMs.afterChartChange ?? 0, 1000),
  });

  await chart.setTimeframe({ timeframe });
  await waitForMarketData({
    symbol,
    timeframe,
    retries: delaysMs.chartReadyRetries ?? 20,
    delayMs: delaysMs.chartReadyPoll ?? Math.max(delaysMs.afterChartChange ?? 0, 1000),
  });

  if ((delaysMs.afterChartChange ?? 0) > 0) {
    await sleep(delaysMs.afterChartChange);
  }

  await ui.openPanel({ panel: 'strategy-tester', action: 'open' });
  return getStrategyStudy(strategyName);
}

export async function applyStrategyInputs({ entityId, inputs, delaysMs = {} }) {
  await indicators.setInputs({ entity_id: entityId, inputs });
  if ((delaysMs.afterInputChange ?? 0) > 0) {
    await sleep(delaysMs.afterInputChange);
  }
}

export async function readStrategyResults({ retries = 6, delaysMs = {} } = {}) {
  let lastResponse = { metric_count: 0, metrics: {}, error: 'Strategy metrics not requested yet.' };

  for (let attempt = 0; attempt < retries; attempt += 1) {
    lastResponse = await data.getStrategyResults();
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
