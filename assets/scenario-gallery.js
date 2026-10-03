// Keep DOM reading order while placing each card in the shortest column.
for (const grid of document.querySelectorAll('.gallery-grid')) {
  const cards = [...grid.children];
  let frame = 0;
  let previousWidth = 0;
  const layout = () => {
    frame = 0;
    const style = getComputedStyle(grid);
    const columns = Number(style.getPropertyValue('--gallery-columns')) || 1;
    const gap = parseFloat(style.columnGap) || 24;
    const width = grid.clientWidth;
    if (!width) return;
    grid.classList.add('is-masonry');
    const cardWidth = (width - gap * (columns - 1)) / columns;
    for (const card of cards) card.style.width = `${cardWidth}px`;
    const heights = Array(columns).fill(0);
    for (const card of cards) {
      const column = heights.indexOf(Math.min(...heights));
      card.style.left = `${column * (cardWidth + gap)}px`;
      card.style.top = `${heights[column]}px`;
      heights[column] += card.getBoundingClientRect().height + gap;
    }
    grid.style.height = `${Math.max(...heights) - gap}px`;
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(layout); };
  const observer = new ResizeObserver(entries => {
    let changed = false;
    for (const entry of entries) {
      if (entry.target !== grid) changed = true;
      else if (grid.clientWidth !== previousWidth) {
        previousWidth = grid.clientWidth;
        changed = true;
      }
    }
    if (changed) schedule();
  });
  observer.observe(grid);
  for (const card of cards) observer.observe(card);
  schedule();
}
