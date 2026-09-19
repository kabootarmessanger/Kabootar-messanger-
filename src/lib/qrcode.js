export function makeQRSvg(text, size = 200) {
  const cells = 21;
  const cs = size / cells;
  let seed = 0;
  for (let i = 0; i < text.length; i++) seed = ((seed << 5) - seed + text.charCodeAt(i)) | 0;
  seed = Math.abs(seed);
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  let rects = "";
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      const corner = (x < 7 && y < 7) || (x >= cells - 7 && y < 7) || (x < 7 && y >= cells - 7);
      const edge =
        (x === 0 || x === 6 || y === 0 || y === 6) && ((x < 7) || (x >= cells - 7)) && ((y < 7) || (y >= cells - 7));
      const center =
        (x >= 2 && x <= 4 && y >= 2 && y <= 4) ||
        (x >= cells - 5 && x <= cells - 3 && y >= 2 && y <= 4) ||
        (x >= 2 && x <= 4 && y >= cells - 5 && y <= cells - 3);
      const on = corner ? edge || center : rnd() > 0.5;
      if (on) rects += `<rect x="${x * cs}" y="${y * cs}" width="${cs}" height="${cs}" fill="#111B21"/>`;
    }
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border-radius:12px;padding:12px">${rects}</svg>`;
}
