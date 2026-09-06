
(function (root) {
const CAPACITY = 30;
const COLORS = 5;

function key(state) {
  return state.join(',');
}

function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

function satisfies(state, target) {
  for (let i = 0; i < COLORS; i++) {
    if (state[i] < target[i]) return false;
  }
  return true;
}

function canApply(state, give) {
  for (let i = 0; i < COLORS; i++) {
    if (state[i] < give[i]) return false;
  }
  return true;
}

function applyMove(state, give, get) {
  const next = new Array(COLORS);
  for (let i = 0; i < COLORS; i++) {
    next[i] = state[i] - give[i] + get[i];
  }
  return next;
}

function buildTransitions(weeklyRecipes) {
  const transitions = [];

  weeklyRecipes.forEach((r, idx) => {
    transitions.push({
      label: `Рецепт недели #${idx + 1}`,
      give: r.give.slice(),
      get: r.get.slice(),
    });
  });

  for (let c = 0; c < COLORS; c++) {
    for (let t = 0; t < COLORS; t++) {
      if (c === t) continue;
      const give = new Array(COLORS).fill(0);
      const get = new Array(COLORS).fill(0);
      give[c] = 3;
      get[t] = 1;
      transitions.push({
        label: `Конвертер 3:1 (3×${COLOR_NAMES[c]} → 1×${COLOR_NAMES[t]})`,
        give,
        get,
      });
    }
  }

  return transitions;
}

const COLOR_NAMES = ['Зелёные', 'Красные', 'Фиолетовые', 'Голубые', 'Чёрные'];

function findPath(inventory, weeklyRecipes, target, capacity = CAPACITY) {
  const start = inventory.slice();

  if (satisfies(start, target)) {
    return {
      reachable: true,
      steps: 0,
      path: [],
      finalState: start,
      loss: 0,
      leftover: start.map((v, i) => v - target[i]),
    };
  }

  const transitions = buildTransitions(weeklyRecipes);
  const startKey = key(start);
  const dist = new Map([[startKey, { loss: 0, steps: 0 }]]);
  const cameFrom = new Map();

  const queue = [start];
  const inQueue = new Set([startKey]);
  let qHead = 0;

  const MAX_RELAXATIONS = 2_000_000;
  let relaxations = 0;

  while (qHead < queue.length) {
    const state = queue[qHead++];
    const sk = key(state);
    inQueue.delete(sk);
    const curDist = dist.get(sk);

    for (const move of transitions) {
      if (!canApply(state, move.give)) continue;
      const next = applyMove(state, move.give, move.get);
      const total = sum(next);
      if (total > capacity) continue;

      const moveLoss = sum(move.give) - sum(move.get);
      const newLoss = curDist.loss + moveLoss;
      const newSteps = curDist.steps + 1;
      const nk = key(next);
      const existing = dist.get(nk);

      const better =
        !existing ||
        newLoss < existing.loss ||
        (newLoss === existing.loss && newSteps < existing.steps);

      if (better) {
        dist.set(nk, { loss: newLoss, steps: newSteps });
        cameFrom.set(nk, { prevState: state, move, resultState: next });
        if (!inQueue.has(nk)) {
          queue.push(next);
          inQueue.add(nk);
        }
      }

      relaxations++;
      if (relaxations > MAX_RELAXATIONS) break;
    }
    if (relaxations > MAX_RELAXATIONS) break;
  }

  let bestKey = null;
  let bestLoss = Infinity;
  let bestSteps = Infinity;

  for (const [k, d] of dist.entries()) {
    if (k === startKey) continue;
    const state = k.split(',').map(Number);
    if (!satisfies(state, target)) continue;
    if (d.loss < bestLoss || (d.loss === bestLoss && d.steps < bestSteps)) {
      bestLoss = d.loss;
      bestSteps = d.steps;
      bestKey = k;
    }
  }

  if (bestKey === null) {
    return { reachable: false, steps: null, path: [], finalState: null, loss: null, leftover: null };
  }

  const path = [];
  let curKey = bestKey;
  while (cameFrom.has(curKey)) {
    const info = cameFrom.get(curKey);
    path.push({
      label: info.move.label,
      give: info.move.give,
      get: info.move.get,
      resultState: info.resultState,
    });
    curKey = key(info.prevState);
  }
  path.reverse();

  const finalState = path[path.length - 1].resultState;

  return {
    reachable: true,
    steps: path.length,
    path,
    finalState,
    loss: bestLoss,
    leftover: finalState.map((v, i) => v - target[i]),
  };
}

function runOracle(inventory, weeklyRecipes, target, options = {}) {
  const capacity = options.capacity || CAPACITY;
  const maxDelta = options.maxDelta || 3;

  const baseline = findPath(inventory, weeklyRecipes, target, capacity);
  const scenarios = [];

  for (let c = 0; c < COLORS; c++) {
    for (let delta = 1; delta <= maxDelta; delta++) {
      const newInv = inventory.slice();
      newInv[c] += delta;
      if (sum(newInv) > capacity) continue;

      const result = findPath(newInv, weeklyRecipes, target, capacity);
      if (!result.reachable) continue;

      let benefitSteps = null;
      let benefitLoss = null;
      let unlocksPurchase = false;

      if (!baseline.reachable) {
        unlocksPurchase = true;
      } else {
        benefitSteps = baseline.steps - result.steps;
        benefitLoss = baseline.loss - result.loss;
      }

      scenarios.push({
        color: c,
        colorName: COLOR_NAMES[c],
        delta,
        steps: result.steps,
        loss: result.loss,
        leftover: result.leftover,
        unlocksPurchase,
        benefitSteps,
        benefitLoss,
      });
    }
  }

  scenarios.sort((a, b) => {
    if (a.unlocksPurchase !== b.unlocksPurchase) return a.unlocksPurchase ? -1 : 1;
    if (a.unlocksPurchase) {
      if (a.loss !== b.loss) return a.loss - b.loss;
      return a.steps - b.steps;
    }
    const lossA = a.benefitLoss ?? -Infinity;
    const lossB = b.benefitLoss ?? -Infinity;
    if (lossB !== lossA) return lossB - lossA;
    const stepsA = a.benefitSteps ?? -Infinity;
    const stepsB = b.benefitSteps ?? -Infinity;
    return stepsB - stepsA;
  });

  const filtered = scenarios.filter((s) => {
    if (s.unlocksPurchase) return true;
    if (!baseline.reachable) return false;
    return (s.benefitLoss ?? 0) > 0;
  });

  return { baseline, scenarios: filtered };
}

function enumerateReachable(inventory, weeklyRecipes, capacity = CAPACITY) {
  const transitions = buildTransitions(weeklyRecipes);
  const start = inventory.slice();
  const startKey = key(start);

  const steps = new Map([[startKey, 0]]);
  const cameFrom = new Map();

  const queue = [start];
  let qHead = 0;

  while (qHead < queue.length) {
    const state = queue[qHead++];
    const sk = key(state);
    const curSteps = steps.get(sk);

    for (const move of transitions) {
      if (!canApply(state, move.give)) continue;
      const next = applyMove(state, move.give, move.get);
      const total = sum(next);
      if (total > capacity) continue;

      const nk = key(next);
      if (steps.has(nk)) continue;

      steps.set(nk, curSteps + 1);
      cameFrom.set(nk, { prevState: state, move, resultState: next });
      queue.push(next);
    }
  }

  return { steps, cameFrom };
}

function reconstructPath(cameFrom, targetKey) {
  const path = [];
  let curKey = targetKey;
  while (cameFrom.has(curKey)) {
    const info = cameFrom.get(curKey);
    path.push({
      label: info.move.label,
      give: info.move.give,
      get: info.move.get,
      resultState: info.resultState,
    });
    curKey = key(info.prevState);
  }
  path.reverse();
  return path;
}

function optimizeStock(inventory, weeklyRecipes, mode, capacity = CAPACITY) {
  const { steps, cameFrom } = enumerateReachable(inventory, weeklyRecipes, capacity);
  const idealPerColor = capacity / COLORS;

  let bestKey = null;
  let bestTotal = -Infinity;
  let bestSteps = Infinity;
  let bestDeviation = Infinity;

  for (const [k, s] of steps.entries()) {
    const state = k.split(',').map(Number);
    const total = sum(state);

    if (mode === 'max_volume') {
      const better = total > bestTotal || (total === bestTotal && s < bestSteps);
      if (better) {
        bestTotal = total;
        bestSteps = s;
        bestKey = k;
      }
    } else {
      const deviation = state.reduce((acc, v) => acc + Math.abs(v - idealPerColor), 0);
      const better =
        deviation < bestDeviation ||
        (deviation === bestDeviation && total > bestTotal) ||
        (deviation === bestDeviation && total === bestTotal && s < bestSteps);
      if (better) {
        bestDeviation = deviation;
        bestTotal = total;
        bestSteps = s;
        bestKey = k;
      }
    }
  }

  const finalState = bestKey.split(',').map(Number);
  const path = reconstructPath(cameFrom, bestKey);

  return {
    mode,
    finalState,
    total: bestTotal,
    steps: path.length,
    path,
    deviation: mode === 'balance' ? bestDeviation : null,
  };
}

const CandySolver = { findPath, runOracle, optimizeStock, COLOR_NAMES, CAPACITY };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CandySolver;
}
if (typeof root !== 'undefined') {
  root.CandySolver = CandySolver;
}
})(typeof window !== 'undefined' ? window : globalThis);
