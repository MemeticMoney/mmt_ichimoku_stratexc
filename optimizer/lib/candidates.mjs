const PRESET_DEFINITIONS = {
  'Traditional Standard': { conversion: 9, base: 26, spanB: 52, displacement: 26 },
  'Traditional Doubled': { conversion: 18, base: 52, spanB: 104, displacement: 52 },
  'Crypto Doubled': { conversion: 20, base: 61, spanB: 120, displacement: 30 },
};

function slugify(label) {
  return String(label)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function candidateKey(candidate) {
  return `${candidate.conversion}-${candidate.base}-${candidate.spanB}-${candidate.displacement}`;
}

export function formatCandidateLabel(candidate) {
  return `${candidate.conversion}/${candidate.base}/${candidate.spanB}/${candidate.displacement}`;
}

function makePresetCandidate(presetName) {
  const values = PRESET_DEFINITIONS[presetName];
  if (!values) {
    throw new Error(`Unknown preset: ${presetName}`);
  }

  return {
    id: `preset:${slugify(presetName)}`,
    family: 'preset',
    label: `${presetName} (${formatCandidateLabel(values)})`,
    presetName,
    conversion: values.conversion,
    base: values.base,
    spanB: values.spanB,
    displacement: values.displacement,
    seedLabel: null,
  };
}

function clampBounds(value, bounds = {}) {
  if (typeof bounds.min === 'number' && value < bounds.min) {
    return null;
  }
  if (typeof bounds.max === 'number' && value > bounds.max) {
    return null;
  }
  return value;
}

function isValidCandidateShape(candidate, bounds = {}) {
  if (candidate.base <= candidate.conversion) {
    return false;
  }
  if (candidate.spanB <= candidate.base) {
    return false;
  }

  const baseMinusConversionMin = bounds.baseMinusConversionMin ?? 1;
  const spanBMinusBaseMin = bounds.spanBMinusBaseMin ?? 1;
  if ((candidate.base - candidate.conversion) < baseMinusConversionMin) {
    return false;
  }
  if ((candidate.spanB - candidate.base) < spanBMinusBaseMin) {
    return false;
  }

  return true;
}

function applyBounds(candidate, bounds = {}) {
  const conversion = clampBounds(candidate.conversion, bounds.conversion);
  const base = clampBounds(candidate.base, bounds.base);
  const spanB = clampBounds(candidate.spanB, bounds.spanB);
  const displacement = clampBounds(candidate.displacement, bounds.displacement);

  if ([conversion, base, spanB, displacement].some((value) => value === null)) {
    return null;
  }

  const boundedCandidate = { ...candidate, conversion, base, spanB, displacement };
  return isValidCandidateShape(boundedCandidate, bounds) ? boundedCandidate : null;
}

export function buildPresetCandidates(presetNames = Object.keys(PRESET_DEFINITIONS)) {
  return presetNames.map(makePresetCandidate);
}

export function buildNeighborhoodCandidates(seedCandidates, phase2Config = {}) {
  const offsets = phase2Config.neighborhoodOffsets ?? {
    conversion: [-4, 0, 4],
    base: [-12, 0, 12],
    spanB: [-24, 0, 24],
    displacement: [-6, 0, 6],
  };
  const bounds = phase2Config.bounds ?? {};
  const deduped = new Map();

  for (const seed of seedCandidates) {
    for (const conversionOffset of offsets.conversion ?? [0]) {
      for (const baseOffset of offsets.base ?? [0]) {
        for (const spanBOffset of offsets.spanB ?? [0]) {
          for (const displacementOffset of offsets.displacement ?? [0]) {
            const rawCandidate = {
              family: 'custom',
              presetName: 'Custom',
              conversion: seed.conversion + conversionOffset,
              base: seed.base + baseOffset,
              spanB: seed.spanB + spanBOffset,
              displacement: seed.displacement + displacementOffset,
              seedLabel: seed.label,
            };
            const boundedCandidate = applyBounds(rawCandidate, bounds);
            if (!boundedCandidate) {
              continue;
            }

            const key = candidateKey(boundedCandidate);
            deduped.set(key, {
              ...boundedCandidate,
              id: `custom:${key}`,
              label: `Custom (${formatCandidateLabel(boundedCandidate)})`,
            });
          }
        }
      }
    }
  }

  return [...deduped.values()].sort((left, right) =>
    left.conversion - right.conversion
    || left.base - right.base
    || left.spanB - right.spanB
    || left.displacement - right.displacement
  );
}
