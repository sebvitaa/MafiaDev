/** Creates the 20 crisp CSS segments used by volume controls in the DOM menu. */
export function pixelBar(parent: HTMLElement, value: number): HTMLDivElement {
  const bar = document.createElement('div');
  bar.className = 'hd-pixel-bar';
  bar.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 20; i++) bar.appendChild(document.createElement('i'));
  parent.appendChild(bar);
  updatePixelBar(bar, value);
  return bar;
}

export function updatePixelBar(bar: HTMLElement, value: number): void {
  const amount = Math.round(Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0)) * 20);
  Array.from(bar.children).forEach((segment, index) => {
    segment.classList.toggle('is-filled', index < amount);
  });
}
