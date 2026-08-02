// Generates a physically-plausible star field at build time: varied size/brightness,
// as a CSS box-shadow string. Pure CSS animation when used, no images, no client JS.
export function makeLayer(count: number, maxOpacity: number) {
  const shadows: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.round(Math.random() * 100 * 10) / 10;
    const y = Math.round(Math.random() * 100 * 10) / 10;
    const opacity = (Math.random() * maxOpacity + 0.1).toFixed(2);
    shadows.push(`${x}vw ${y}vh 0 rgba(241,243,248,${opacity})`);
  }
  return shadows.join(', ');
}
