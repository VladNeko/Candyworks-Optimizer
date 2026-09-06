# Candyworks Optimizer

A free, no-install calculator for Dota 2's **Candy Shop** event. Set what you're trying to buy, punch in your candy stock and this week's trade recipes, and it works out the cheapest way to get there — no signup, no ads, runs entirely in your browser.

**[Open the calculator](#)** *(replace with your GitHub Pages link once enabled — see below)*

## Why this one

Most candy-shop calculators just tell you a path exists or don't. This one goes further:

- **Loss-aware pathfinding.** It doesn't just find *a* path — it finds the path that burns the fewest candies. A shorter path that wastes more candies loses to a longer one that wastes less, every time.
- **Capacity Guard.** The inventory cap (30 slots) is enforced at every step, so it never suggests a trade you can't actually make because your stock is full.
- **Oracle / sensitivity analysis.** Before you trade, it simulates what happens if the daily forecast drops you 1–3 more candies of each color — and tells you plainly whether it's worth waiting: either because it unlocks a purchase that's currently impossible, or because it noticeably cuts your losses.
- **Stock optimizer** for weeks when there's nothing worth buying yet: push your stock to the maximum (up to the cap), or rebalance it evenly across all five colors so you're ready for whatever next week's recipes bring.

## How to use it

1. Set your **purchase target** — how many of each candy color the reward costs.
2. Enter your current **candy stock** and this week's **4 trade recipes** (the base 3-for-1 converter is always factored in automatically, no need to enter it).
3. Hit **Find path to purchase** for a step-by-step trade plan, loss total, and the Oracle panel telling you if it's worth waiting instead.
4. Nothing worth buying this week? Use **Max volume** or **Perfect balance** to get the most out of your current recipes anyway.

Available in English, Russian, and Ukrainian (switch in the top-right corner).

Files:

| File | What it does |
|---|---|
| `index.html` | Page markup |
| `styles.css` | All styling |
| `solver.js` | The actual calculator engine (pathfinding, Oracle, stock optimizer) — no UI code, framework-free |
| `app.js` | UI logic: rendering, event handling, translations |
| `img/` | Candy icons (see note below) |

## A couple of honest notes

- This is an unofficial fan-made tool. **Dota 2**, the Candy Shop event, and all related names/art are property of **Valve Corporation**. This project isn't affiliated with or endorsed by Valve.
- The candy icons in `img/` are cropped from a personal in-game screenshot, for illustrative use in a free fan tool only — not for resale or redistribution as standalone assets. If you fork this and want to be extra safe, swap them for your own icons or plain color swatches (the CSS already falls back to a solid background color if an image is missing). Valve's [fan content policies](https://store.steampowered.com/legal) are worth a read if you're unsure what's allowed for your own fork.
- The calculator's logic (everything in `solver.js`/`app.js`/`styles.css`/`index.html`) is available under the MIT license in this repo — do whatever you want with it.
