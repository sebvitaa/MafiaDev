// Dominio: seba. La apertura conserva Silkscreen; las capas DOM usan Barlow Condensed.
export async function loadFonts(timeoutMs = 2500): Promise<void> {
  if (typeof document === 'undefined' || typeof FontFace === 'undefined') return;
  if (!document.getElementById('mafiadev-font-faces')) {
    const style = document.createElement('style');
    style.id = 'mafiadev-font-faces';
    style.textContent = `
      @font-face{font-family:"Barlow Condensed";src:url("assets/ui/fonts/BarlowCondensed-Medium.ttf") format("truetype");font-style:normal;font-weight:500;font-display:swap}
      @font-face{font-family:"Barlow Condensed";src:url("assets/ui/fonts/BarlowCondensed-SemiBold.ttf") format("truetype");font-style:normal;font-weight:600;font-display:swap}
    `;
    document.head.appendChild(style);
  }
  const face = new FontFace('Silkscreen', 'url(assets/ui/fonts/Silkscreen-Regular.ttf)');
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, timeoutMs));
  try {
    await Promise.race([Promise.all([
      face.load().then((f) => { document.fonts.add(f); }),
      document.fonts.load('500 16px "Barlow Condensed"'),
      document.fonts.load('600 16px "Barlow Condensed"'),
    ]).then(() => undefined), timeout]);
  } catch {
    /* sin fuente: se usa monospace */
  }
}
