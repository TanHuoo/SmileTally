// Card nodes are reused when switching modes, preserving open answers and focus.
const grids = [...document.querySelectorAll('.gallery-grid')];
const cards = [...document.querySelectorAll('.gallery-card')];
const groups = grids.filter(grid => !grid.classList.contains('gallery-all'))
  .map(grid => ({ grid, cards: [...grid.children] }));
const allGrid = document.querySelector('.gallery-all');
const toggle = document.querySelector('#gallery-grouping');
let frame = 0;
const widths = new WeakMap();
function layout() {
  frame = 0;
  for (const grid of grids) {
    const width = grid.clientWidth;
    if (!width) continue;
    const items = [...grid.children];
    const style = getComputedStyle(grid);
    const columns = Number(style.getPropertyValue('--gallery-columns')) || 1;
    const gap = parseFloat(style.columnGap) || 24;
    const cardWidth = (width - gap * (columns - 1)) / columns;
    grid.classList.add('is-masonry');
    for (const card of items) card.style.width = `${cardWidth}px`;
    const heights = Array(columns).fill(0);
    for (const card of items) {
      const column = heights.indexOf(Math.min(...heights));
      card.style.left = `${column * (cardWidth + gap)}px`;
      card.style.top = `${heights[column]}px`;
      heights[column] += card.getBoundingClientRect().height + gap;
    }
    grid.style.height = `${items.length ? Math.max(...heights) - gap : 0}px`;
  }
}
function schedule() { if (!frame) frame = requestAnimationFrame(layout); }
const observer = new ResizeObserver(entries => {
  let changed = false;
  for (const entry of entries) {
    if (entry.target.classList.contains('gallery-card')) changed = true;
    else if (entry.target.clientWidth !== widths.get(entry.target)) {
      widths.set(entry.target, entry.target.clientWidth);
      changed = true;
    }
  }
  if (changed) schedule();
});
for (const grid of grids) observer.observe(grid);
for (const card of cards) observer.observe(card);
if (toggle && allGrid) {
  toggle.disabled = false;
  toggle.addEventListener('change', () => {
    const grouped = toggle.checked;
    if (grouped) {
      for (const group of groups) group.grid.append(...group.cards);
    } else {
      allGrid.append(...cards);
    }
    for (const group of groups) group.grid.closest('.gallery-section').hidden = !grouped;
    document.querySelector('.gallery-categories').hidden = !grouped;
    allGrid.hidden = grouped;
    layout();
  });
}
schedule();
