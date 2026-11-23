// Dominio: seba. Carga de la fuente pixel antes de dibujar texto (Phaser rasteriza el texto al crearlo).
export async function loadFonts(timeoutMs = 2500): Promise<void> {
  if (typeof FontFace === 'undefined' || typeof document === 'undefined') return;
  const face = new FontFace('Silkscreen', 'url(assets/ui/fonts/Silkscreen-Regular.ttf)');
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, timeoutMs));
  try {
    await Promise.race([face.load().then((f) => { document.fonts.add(f); }), timeout]);
  } catch {
    /* sin fuente: se usa monospace */
  }
}
