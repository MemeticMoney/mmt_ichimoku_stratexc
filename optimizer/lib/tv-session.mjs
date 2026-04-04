import { chart, data, health, indicators, ui } from '../../../tradingview-mcp/src/core/index.js';

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function studyMatchesName(study, strategyName) {
  if (!study?.name) {
    return false;
  }
  return study.name === strategyName || study.name.includes(strategyName) || strategyName.includes(study.name);
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
  await chart.setTimeframe({ timeframe });
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

  return lastResponse;
}
