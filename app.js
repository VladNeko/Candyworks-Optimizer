const { findPath, runOracle, optimizeStock, CAPACITY } = window.CandySolver;
const COLORS = 5;


const COLOR_NAMES_I18N = {
  en: ['Green', 'Red', 'Purple', 'Blue', 'Black'],
  ru: ['Зелёные', 'Красные', 'Фиолетовые', 'Голубые', 'Чёрные'],
  uk: ['Зелені', 'Червоні', 'Фіолетові', 'Блакитні', 'Чорні'],
};

const STEPS_WORD_I18N = {
  en: (n) => (n === 1 ? 'trade' : 'trades'),
  ru: (n) => {
    const mod10 = n % 10, mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'обмен';
    if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'обмена';
    return 'обменов';
  },
  uk: (n) => {
    const mod10 = n % 10, mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'обмін';
    if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'обміни';
    return 'обмінів';
  },
};

const I18N = {
  en: {
    page_title: 'Candyworks Optimizer — Dota 2 Candy Shop calculator',
    subtitle: 'Finds the cheapest candy trade route for the Dota 2 Candy Shop event',
    lang_label: 'Language',

    target_title: 'Purchase target',
    clear: 'Clear',
    target_empty: 'Set the reward price using the counters above',
    find_path_btn: 'Find path to purchase',
    max_volume_btn: 'Max volume',
    balance_btn: 'Perfect balance',

    result_title: 'Result',
    steps_unit: 'step(s)',

    steps_col_title: 'Trade steps',
    steps_prompt: 'Set a target above, then press "Find path to purchase".',
    oracle_col_title: 'Oracle — is it worth waiting?',
    oracle_hint_default: 'Shows which possible candies from the daily forecast would make the trade cheaper.',
    oracle_prompt: 'Set a target and calculate the path first.',

    set_target_to_see_plan: 'Set a purchase target to see the trade plan.',
    unreachable: 'Unreachable with your current stock and recipes. Stock left untouched — try different recipes, or check the Oracle for what would unlock it.',
    already_enough: 'You already have everything you need — no trades required.',
    no_loss: 'No loss — this trade is completely free',
    loss_label: 'Loss on trades',
    leftover_title: 'Leftover after purchase',

    no_oracle_scenarios: 'No likely drop (+1..+3 candies) improves the current plan — safe to trade right now.',
    unlock_badge: 'unlocks purchase',
    cheaper_badge: 'cheaper to wait',
    unlock_detail: (steps, word) => `Purchase is currently unreachable. With this drop, it becomes possible in ${steps} ${word}.`,
    cheaper_detail: (before, after, save) => `Cuts losses from ${before} to ${after} candies (saves ${save}) if you wait for this drop.`,

    inventory_title: 'Your candies',
    clear_stock: 'Clear stock',
    recipes_title: 'Weekly recipes',
    reset_recipes: 'Reset recipes',

    max_volume_hint: 'Max volume mode: pushes your stock as high as possible (up to the 30 cap), regardless of any specific goal.',
    balance_hint: 'Perfect balance mode: aims for an equal stock of each color (6 each), so you\'re ready for any recipe next week.',
    already_optimal: 'Stock is already optimal for this — no trades needed.',
    total_candies: (total, cap) => `Total candies: <b>${total} / ${cap}</b>`,
    total_candies_deviation: (total, cap, dev) => `Total candies: <b>${total} / ${cap}</b>, deviation from ideal (6 of each): <b>${dev}</b>`,
    stock_result_title: (mode) => (mode === 'max_volume' ? 'Stock result — max volume' : 'Stock result — even balance'),

    empty: 'Empty',
    nothing: 'nothing',
    tip_remove: 'Click to remove',
    tip_recipe_slot: 'Click to change color (cycles through empty too)',
  },

  ru: {
    page_title: 'Candyworks Optimizer — калькулятор Лавки конфет Dota 2',
    subtitle: 'Считает самый выгодный обмен конфет в Лавке конфет',
    lang_label: 'Язык',

    target_title: 'Цель покупки',
    clear: 'Очистить',
    target_empty: 'Задайте цену награды счётчиками выше',
    find_path_btn: 'Найти путь до покупки',
    max_volume_btn: 'Максимальный объём',
    balance_btn: 'Идеальный баланс',

    result_title: 'Результат',
    steps_unit: 'шаг(ов)',

    steps_col_title: 'Шаги обмена',
    steps_prompt: 'Задайте цель выше и нажмите «Найти путь до покупки».',
    oracle_col_title: 'Оракул — стоит ли подождать',
    oracle_hint_default: 'Показывает, какие возможные конфеты из ежедневного прогноза сделают обмен дешевле.',
    oracle_prompt: 'Сначала задайте цель и посчитайте путь.',

    set_target_to_see_plan: 'Задайте цель покупки, чтобы увидеть план обменов.',
    unreachable: 'Недостижимо с текущим складом и рецептами. Склад не менялся — попробуйте другие рецепты или загляните в Оракул, что могло бы это разблокировать.',
    already_enough: 'Все конфеты уже есть — можно покупать без обменов.',
    no_loss: 'Потерь нет — обмен полностью безубыточен',
    loss_label: 'Потери на обменах',
    leftover_title: 'Остаток после покупки',

    no_oracle_scenarios: 'Ни одно вероятное выпадение (+1..+3 конфеты) не улучшает текущий план — можно смело обменивать сейчас.',
    unlock_badge: 'разблокирует покупку',
    cheaper_badge: 'выгоднее ждать',
    unlock_detail: (steps, word) => `Сейчас покупка недостижима. С этим выпадением обмен станет возможен за ${steps} ${word}.`,
    cheaper_detail: (before, after, save) => `Сократит потери с ${before} до ${after} конфет (экономия ${save}), если дождаться этого выпадения.`,

    inventory_title: 'Ваши конфеты',
    clear_stock: 'Очистить склад',
    recipes_title: 'Рецепты недели',
    reset_recipes: 'Сбросить рецепты',

    max_volume_hint: 'Режим «Максимальный объём»: разгоняет склад до предела капы (30 шт), не привязываясь к конкретной цели.',
    balance_hint: 'Режим «Идеальный баланс»: стремится к равному запасу каждого цвета (по 6 шт), чтобы быть готовым к любым рецептам следующей недели.',
    already_optimal: 'Склад уже в этом состоянии оптимален — обмены не нужны.',
    total_candies: (total, cap) => `Итого конфет: <b>${total} / ${cap}</b>`,
    total_candies_deviation: (total, cap, dev) => `Итого конфет: <b>${total} / ${cap}</b>, отклонение от идеала (по 6 каждого цвета): <b>${dev}</b>`,
    stock_result_title: (mode) => (mode === 'max_volume' ? 'Итог склада — максимальный объём' : 'Итог склада — равномерный баланс'),

    empty: 'Пусто',
    nothing: 'ничего',
    tip_remove: 'Нажмите, чтобы убрать',
    tip_recipe_slot: 'Нажмите, чтобы сменить цвет (или убрать слот)',
  },

  uk: {
    page_title: 'Candyworks Optimizer — калькулятор Крамниці цукерок Dota 2',
    subtitle: 'Рахує найвигідніший обмін цукерок у Крамниці цукерок',
    lang_label: 'Мова',

    target_title: 'Мета покупки',
    clear: 'Очистити',
    target_empty: 'Задайте ціну нагороди лічильниками вище',
    find_path_btn: 'Знайти шлях до покупки',
    max_volume_btn: 'Максимальний обсяг',
    balance_btn: 'Ідеальний баланс',

    result_title: 'Результат',
    steps_unit: 'крок(ів)',

    steps_col_title: 'Кроки обміну',
    steps_prompt: 'Задайте мету вище та натисніть «Знайти шлях до покупки».',
    oracle_col_title: 'Оракул — чи варто зачекати',
    oracle_hint_default: 'Показує, які можливі цукерки з щоденного прогнозу зроблять обмін дешевшим.',
    oracle_prompt: 'Спочатку задайте мету і порахуйте шлях.',

    set_target_to_see_plan: 'Задайте мету покупки, щоб побачити план обмінів.',
    unreachable: 'Недосяжно з поточним складом і рецептами. Склад не змінено — спробуйте інші рецепти або перевірте Оракул, що могло б це розблокувати.',
    already_enough: 'Усі цукерки вже є — можна купувати без обмінів.',
    no_loss: 'Втрат немає — обмін повністю безкоштовний',
    loss_label: 'Втрати на обмінах',
    leftover_title: 'Залишок після покупки',

    no_oracle_scenarios: 'Жодне ймовірне випадіння (+1..+3 цукерки) не покращує поточний план — можна сміливо обмінювати зараз.',
    unlock_badge: 'розблоковує покупку',
    cheaper_badge: 'вигідніше зачекати',
    unlock_detail: (steps, word) => `Зараз покупка недосяжна. З цим випадінням обмін стане можливим за ${steps} ${word}.`,
    cheaper_detail: (before, after, save) => `Скоротить втрати з ${before} до ${after} цукерок (економія ${save}), якщо зачекати на це випадіння.`,

    inventory_title: 'Ваші цукерки',
    clear_stock: 'Очистити склад',
    recipes_title: 'Рецепти тижня',
    reset_recipes: 'Скинути рецепти',

    max_volume_hint: 'Режим «Максимальний обсяг»: розганяє склад до межі капи (30 шт), незалежно від конкретної мети.',
    balance_hint: 'Режим «Ідеальний баланс»: прагне до рівного запасу кожного кольору (по 6 шт), щоб бути готовим до будь-яких рецептів наступного тижня.',
    already_optimal: 'Склад вже в цьому стані оптимальний — обміни не потрібні.',
    total_candies: (total, cap) => `Всього цукерок: <b>${total} / ${cap}</b>`,
    total_candies_deviation: (total, cap, dev) => `Всього цукерок: <b>${total} / ${cap}</b>, відхилення від ідеалу (по 6 кожного кольору): <b>${dev}</b>`,
    stock_result_title: (mode) => (mode === 'max_volume' ? 'Підсумок складу — максимальний обсяг' : 'Підсумок складу — рівномірний баланс'),

    empty: 'Порожньо',
    nothing: 'нічого',
    tip_remove: 'Натисніть, щоб прибрати',
    tip_recipe_slot: 'Натисніть, щоб змінити колір (або прибрати слот)',
  },
};

const SUPPORTED_LANGS = ['en', 'ru', 'uk'];
let currentLang = localStorage.getItem('candyOptimizerLang') || 'en';
if (!SUPPORTED_LANGS.includes(currentLang)) currentLang = 'en';

function t(key, ...args) {
  const entry = I18N[currentLang][key];
  if (typeof entry === 'function') return entry(...args);
  return entry;
}

function colorName(idx) {
  return COLOR_NAMES_I18N[currentLang][idx];
}

function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  currentLang = lang;
  localStorage.setItem('candyOptimizerLang', lang);
  document.documentElement.lang = lang;
  applyStaticTranslations();
  renderInventory();
  renderTarget();
  renderRecipes();
  resetResultsPanel();
}

function applyStaticTranslations() {
  document.title = t('page_title');
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.getElementById('langSelect').value = currentLang;
}

function resetResultsPanel() {
  document.getElementById('stepsList').innerHTML = `<div class="empty-note">${t('steps_prompt')}</div>`;
  document.getElementById('oracleList').innerHTML = `<div class="empty-note">${t('oracle_prompt')}</div>`;
  document.getElementById('oracleHint').textContent = t('oracle_hint_default');
  document.getElementById('stepsCount').textContent = '0';
}


let inventory = [0, 0, 0, 0, 0];
let target = [0, 0, 0, 0, 0];

let recipeSlots = [
  { give: [-1, -1, -1, -1], get: [-1, -1, -1, -1] },
  { give: [-1, -1, -1, -1], get: [-1, -1, -1, -1] },
  { give: [-1, -1, -1, -1], get: [-1, -1, -1, -1] },
  { give: [-1, -1, -1, -1], get: [-1, -1, -1, -1] },
];

function sumVec(arr) { return arr.reduce((a, b) => a + b, 0); }

function getRecipesVectors() {
  return recipeSlots.map(r => {
    const give = [0, 0, 0, 0, 0];
    const get = [0, 0, 0, 0, 0];
    r.give.forEach(c => { if (c >= 0) give[c]++; });
    r.get.forEach(c => { if (c >= 0) get[c]++; });
    return { give, get };
  });
}

function renderGemEl(colorIdx, sizeClass = '') {
  return `<span class="gem g-${colorIdx} ${sizeClass}"></span>`;
}

function renderCandyRow(vector) {
  let icons = '';
  vector.forEach((count, cIdx) => {
    for (let i = 0; i < count; i++) icons += renderGemEl(cIdx, 'sm');
  });
  if (!icons) return `<div class="empty-note">${t('empty')}</div>`;
  return `<div class="candy-row">${icons}</div>`;
}

function renderColorBreakdown(vector) {
  const parts = vector
    .map((n, i) => (n !== 0 ? { n, i } : null))
    .filter(Boolean)
    .map(({ n, i }) => `<span><span class="swatch-dot" style="background:var(--c${i})"></span>${colorName(i)}: ${n}</span>`);
  if (parts.length === 0) return '';
  return `<div class="color-breakdown">${parts.join('')}</div>`;
}

function renderCandiesInline(vector) {
  let html = '';
  vector.forEach((count, cIdx) => {
    for (let i = 0; i < count; i++) html += renderGemEl(cIdx, 'sm');
  });
  return html || `<span style="color:var(--muted)">${t('nothing')}</span>`;
}

function lossLine(loss) {
  let cls = 'loss-none';
  if (loss > 0 && loss <= 2) cls = 'loss-low';
  else if (loss > 2) cls = 'loss-high';
  const label = loss <= 0 ? t('no_loss') : t('loss_label');
  const value = loss <= 0 ? '0' : `−${loss}`;
  return `<div class="loss-line ${cls}"><span class="loss-value">${value}</span><span>${label}</span></div>`;
}

function renderControls(containerId, values, onInc, onDec) {
  const el = document.getElementById(containerId);
  el.innerHTML = '';
  for (let i = 0; i < COLORS; i++) {
    const col = document.createElement('div');
    col.className = 'ctrl-col';
    col.innerHTML = `
      ${renderGemEl(i)}
      <div class="count-label">${values[i]}</div>
      <button class="btn-step" data-act="inc">+</button>
      <button class="btn-step" data-act="dec">−</button>
    `;
    col.querySelector('[data-act="inc"]').onclick = () => onInc(i);
    col.querySelector('[data-act="dec"]').onclick = () => onDec(i);
    el.appendChild(col);
  }
}

function renderInventory() {
  renderControls('invControls', inventory,
    (c) => { if (sumVec(inventory) < CAPACITY) { inventory[c]++; renderInventory(); } },
    (c) => { if (inventory[c] > 0) { inventory[c]--; renderInventory(); } }
  );

  const grid = document.getElementById('invGrid');
  grid.innerHTML = '';
  let flatList = [];
  inventory.forEach((count, colorIdx) => { for (let c = 0; c < count; c++) flatList.push(colorIdx); });
  document.getElementById('invCount').textContent = flatList.length;

  for (let s = 0; s < CAPACITY; s++) {
    const slot = document.createElement('div');
    if (s < flatList.length) {
      const colorIdx = flatList[s];
      slot.className = 'inv-slot filled';
      slot.innerHTML = renderGemEl(colorIdx);
      slot.title = t('tip_remove');
      slot.onclick = () => { inventory[colorIdx]--; renderInventory(); };
    } else {
      slot.className = 'inv-slot';
    }
    grid.appendChild(slot);
  }
}

function renderTarget() {
  renderControls('targetControls', target,
    (c) => { target[c]++; renderTarget(); },
    (c) => { if (target[c] > 0) { target[c]--; renderTarget(); } }
  );

  const display = document.getElementById('targetDisplay');
  display.innerHTML = '';
  if (sumVec(target) === 0) {
    display.innerHTML = `<div class="empty-note">${t('target_empty')}</div>`;
    return;
  }
  target.forEach((count, colorIdx) => {
    for (let c = 0; c < count; c++) {
      const item = document.createElement('div');
      item.className = 'target-item';
      item.title = t('tip_remove');
      item.innerHTML = renderGemEl(colorIdx, 'sm');
      item.onclick = () => { target[colorIdx]--; renderTarget(); };
      display.appendChild(item);
    }
  });
}

function renderRecipes() {
  const list = document.getElementById('recipesList');
  list.innerHTML = '';

  recipeSlots.forEach((r, rIdx) => {
    const isEmpty = r.give.every(v => v < 0) && r.get.every(v => v < 0);
    const row = document.createElement('div');
    row.className = 'recipe-row' + (isEmpty ? ' recipe-off' : '');

    const createGroup = (side) => {
      const grp = document.createElement('div');
      grp.className = 'slots-group';
      r[side].forEach((val, slotIdx) => {
        const slot = document.createElement('div');
        slot.className = `recipe-slot ${val >= 0 ? 'active' : ''}`;
        if (val >= 0) slot.innerHTML = renderGemEl(val);
        slot.title = t('tip_recipe_slot');
        slot.onclick = () => {
          let nextVal = (val + 2) % 6 - 1;
          recipeSlots[rIdx][side][slotIdx] = nextVal;
          renderRecipes();
        };
        grp.appendChild(slot);
      });
      return grp;
    };

    row.appendChild(createGroup('give'));
    const arrow = document.createElement('div');
    arrow.className = 'arrow';
    arrow.textContent = '→';
    row.appendChild(arrow);
    row.appendChild(createGroup('get'));

    list.appendChild(row);
  });
}

function renderResults() {
  const stepsList = document.getElementById('stepsList');
  const oracleList = document.getElementById('oracleList');
  const stepsCount = document.getElementById('stepsCount');
  const oracleHint = document.getElementById('oracleHint');

  stepsList.innerHTML = '';
  oracleList.innerHTML = '';
  oracleHint.textContent = t('oracle_hint_default');

  if (sumVec(target) === 0) {
    stepsList.innerHTML = `<div class="empty-note">${t('set_target_to_see_plan')}</div>`;
    oracleList.innerHTML = `<div class="empty-note">${t('oracle_prompt')}</div>`;
    stepsCount.textContent = '0';
    return;
  }

  const recipes = getRecipesVectors();
  const baseline = findPath(inventory, recipes, target);

  if (!baseline.reachable) {
    stepsList.innerHTML = `<div class="empty-note" style="color:var(--bad)">${t('unreachable')}</div>`;
    stepsCount.textContent = '0';
  } else if (baseline.steps === 0) {
    stepsList.innerHTML = `
      <div class="step-card" style="border-bottom:none;">${t('already_enough')}</div>
      ${lossLine(0)}
    `;
    stepsCount.textContent = '0';
  } else {
    stepsCount.textContent = baseline.steps;
    baseline.path.forEach((step, i) => {
      const card = document.createElement('div');
      card.className = 'step-card';
      card.innerHTML = `
        <div class="step-num">${i + 1}</div>
        <div class="step-candies">
          ${renderCandiesInline(step.give)}
          <span style="color:var(--muted); font-size:11px; margin:0 2px;">→</span>
          ${renderCandiesInline(step.get)}
        </div>
      `;
      stepsList.appendChild(card);
    });

    const summary = document.createElement('div');
    summary.className = 'summary-box';
    summary.innerHTML = `
      ${lossLine(baseline.loss)}
      <div class="summary-title" style="margin-top:10px;">${t('leftover_title')}</div>
      ${renderCandyRow(baseline.leftover)}
      ${renderColorBreakdown(baseline.leftover)}
    `;
    stepsList.appendChild(summary);
  }

  const { scenarios: oracleScenarios } = runOracle(inventory, recipes, target);
  if (oracleScenarios.length === 0) {
    oracleList.innerHTML = `<div class="empty-note">${t('no_oracle_scenarios')}</div>`;
  } else {
    oracleScenarios.forEach(s => {
      const card = document.createElement('div');
      card.className = `oracle-card ${s.unlocksPurchase ? 'unlock' : 'cheaper'}`;
      const word = STEPS_WORD_I18N[currentLang](s.steps);
      if (s.unlocksPurchase) {
        card.innerHTML = `
          <div class="oracle-line">
            <span class="badge">${t('unlock_badge')}</span>
            <b>+${s.delta}</b> ${renderGemEl(s.color, 'sm')} ${colorName(s.color)}
          </div>
          <div class="oracle-detail">${t('unlock_detail', s.steps, word)}</div>
        `;
      } else {
        card.innerHTML = `
          <div class="oracle-line">
            <span class="badge">${t('cheaper_badge')}</span>
            <b>+${s.delta}</b> ${renderGemEl(s.color, 'sm')} ${colorName(s.color)}
          </div>
          <div class="oracle-detail">${t('cheaper_detail', baseline.loss, s.loss, s.benefitLoss)}</div>
        `;
      }
      oracleList.appendChild(card);
    });
  }
}

function renderModeB(mode) {
  const stepsList = document.getElementById('stepsList');
  const oracleList = document.getElementById('oracleList');
  const stepsCount = document.getElementById('stepsCount');
  const oracleHint = document.getElementById('oracleHint');

  stepsList.innerHTML = '';
  oracleHint.textContent = '';
  oracleList.innerHTML = `<div class="empty-note">${mode === 'max_volume' ? t('max_volume_hint') : t('balance_hint')}</div>`;

  const recipes = getRecipesVectors();
  const res = optimizeStock(inventory, recipes, mode);
  stepsCount.textContent = res.steps;

  if (res.steps === 0) {
    stepsList.innerHTML = `<div class="step-card" style="border-bottom:none;">${t('already_optimal')}</div>`;
  } else {
    res.path.forEach((step, i) => {
      const card = document.createElement('div');
      card.className = 'step-card';
      card.innerHTML = `
        <div class="step-num">${i + 1}</div>
        <div class="step-candies">
          ${renderCandiesInline(step.give)}
          <span style="color:var(--muted); font-size:11px; margin:0 2px;">→</span>
          ${renderCandiesInline(step.get)}
        </div>
      `;
      stepsList.appendChild(card);
    });
  }

  const total = sumVec(res.finalState);
  const extra = mode === 'max_volume'
    ? `<div class="ledger-line">${t('total_candies', total, CAPACITY)}</div>`
    : `<div class="ledger-line">${t('total_candies_deviation', total, CAPACITY, res.deviation)}</div>`;

  const summary = document.createElement('div');
  summary.className = 'summary-box';
  summary.innerHTML = `
    <div class="summary-title">${t('stock_result_title', mode)}</div>
    ${renderCandyRow(res.finalState)}
    ${renderColorBreakdown(res.finalState)}
    ${extra}
  `;
  stepsList.appendChild(summary);
}


const candyColors = ['green', 'red', 'purple', 'blue', 'black'];
candyColors.forEach((color, idx) => {
  const img = new Image();
  img.onerror = () => {
    document.documentElement.classList.add(`no-img-${idx}`);
  };
  img.src = `img/candy_${color}.png`;
});

document.getElementById('clearInvBtn').onclick = () => { inventory = [0,0,0,0,0]; renderInventory(); };
document.getElementById('clearTargetBtn').onclick = () => { target = [0,0,0,0,0]; renderTarget(); };
document.getElementById('clearRecipesBtn').onclick = () => {
  recipeSlots = Array(4).fill(null).map(() => ({ give: [-1,-1,-1,-1], get: [-1,-1,-1,-1] }));
  renderRecipes();
};

document.getElementById('calcBtn').onclick = renderResults;
document.getElementById('maxVolumeBtn').onclick = () => renderModeB('max_volume');
document.getElementById('balanceBtn').onclick = () => renderModeB('balance');
document.getElementById('langSelect').onchange = (e) => setLanguage(e.target.value);

document.documentElement.lang = currentLang;
applyStaticTranslations();
renderInventory();
renderTarget();
renderRecipes();
resetResultsPanel();
