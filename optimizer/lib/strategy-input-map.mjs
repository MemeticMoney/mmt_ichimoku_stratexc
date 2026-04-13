import fs from 'node:fs';
import path from 'node:path';

const INPUT_RE = /^\s*(?:[A-Za-z_][\w<>\[\]\s]*\s+)?(?<variableName>[A-Za-z_]\w*)\s*=\s*input\.(?<kind>[A-Za-z_]+)\(/;

export function parseStrategyInputsFromSource(source) {
  const inputs = [];
  const lines = source.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const match = line.match(INPUT_RE);
    if (!match?.groups) {
      continue;
    }

    inputs.push({
      inputId: `in_${inputs.length}`,
      variableName: match.groups.variableName,
      kind: match.groups.kind,
      line: index + 1,
      source: line.trim(),
    });
  }

  return inputs;
}

export function loadStrategyInputs(strategyPath) {
  const resolvedPath = path.resolve(strategyPath);
  const source = fs.readFileSync(resolvedPath, 'utf8');
  return parseStrategyInputsFromSource(source);
}

export function buildStrategyInputIdMap(strategyPath) {
  const inputs = loadStrategyInputs(strategyPath);
  const map = {};
  for (const input of inputs) {
    map[input.variableName] = input.inputId;
  }
  return { map, inputs };
}

export function assertRequiredInputs(map, requiredVariables) {
  const missing = requiredVariables.filter((variableName) => !map[variableName]);
  if (missing.length > 0) {
    throw new Error(`Missing strategy inputs: ${missing.join(', ')}`);
  }
}
