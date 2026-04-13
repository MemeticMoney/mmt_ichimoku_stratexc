const HUMAN_TIMEFRAME_MAP = {
  '15m': '15',
  '1h': '60',
  '4h': '240',
  '1d': 'D',
  '2d': '2D',
  '3d': '3D',
  '1w': 'W',
  '1m': 'M',
};

export function normalizeOptimizerTimeframe(timeframe) {
  if (timeframe === null || timeframe === undefined) {
    return null;
  }

  const value = String(timeframe).trim();
  if (!value) {
    return null;
  }

  return HUMAN_TIMEFRAME_MAP[value.toLowerCase()] ?? value;
}

export function resolveHigherTimeframeCandidates(config, timeframe) {
  const normalizedTimeframe = normalizeOptimizerTimeframe(timeframe);
  const configuredCandidates = config.higherTimeframeCandidates?.[normalizedTimeframe]
    ?? config.higherTimeframeCandidates?.[timeframe];

  if (Array.isArray(configuredCandidates) && configuredCandidates.length > 0) {
    return configuredCandidates
      .map(normalizeOptimizerTimeframe)
      .filter(Boolean);
  }

  const fallback = config.higherTimeframeMap?.[normalizedTimeframe]
    ?? config.higherTimeframeMap?.[timeframe];
  if (!fallback) {
    throw new Error(`No higher timeframe mapping found for ${timeframe}`);
  }

  return [normalizeOptimizerTimeframe(fallback)];
}
