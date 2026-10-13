/** 生成自包含的 SVG 占位图（不依赖外网，离线可用） */

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const enc = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

/** 低饱和配色（与主题令牌同族） */
export const PALETTE = [
  '#5b7fa6',
  '#a6474a',
  '#4f7a63',
  '#8a7a5c',
  '#6b6f8a',
  '#7a5c6e',
  '#57707f',
  '#8f6b52',
]

export function pickColor(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

/** 首字头像：实色圆底 + 白字，明暗主题下都清晰 */
export function avatarUrl(name: string, color?: string) {
  const c = color || pickColor(name || '?')
  const ch = esc((name || '?').trim().slice(0, 1))
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="${c}"/><text x="48" y="52" font-family="-apple-system,Segoe UI,PingFang SC,Microsoft YaHei,sans-serif" font-size="40" font-weight="500" fill="#ffffff" text-anchor="middle" dominant-baseline="central">${ch}</text></svg>`
  return enc(svg)
}

function lcg(seed: number) {
  let s = seed >>> 0 || 1
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** 抽象几何占位画作 */
export function artUrl(seed: number, label = '', w = 600, h = 760) {
  const rnd = lcg(seed * 7919 + 13)
  const base = PALETTE[Math.floor(rnd() * PALETTE.length)]
  const base2 = PALETTE[Math.floor(rnd() * PALETTE.length)]
  const parts: string[] = []

  parts.push(
    `<rect width="${w}" height="${h}" fill="${base}" fill-opacity="0.07"/>`
  )

  const shapes = 3 + Math.floor(rnd() * 3)
  for (let i = 0; i < shapes; i++) {
    const c = rnd() > 0.5 ? base : base2
    const op = (0.08 + rnd() * 0.12).toFixed(3)
    const kind = rnd()
    if (kind < 0.4) {
      const cx = (rnd() * w).toFixed(1)
      const cy = (rnd() * h).toFixed(1)
      const r = (60 + rnd() * Math.min(w, h) * 0.35).toFixed(1)
      parts.push(
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" fill-opacity="${op}"/>`
      )
    } else if (kind < 0.75) {
      const x = (rnd() * w * 0.7).toFixed(1)
      const y = (rnd() * h * 0.7).toFixed(1)
      const rw = (80 + rnd() * w * 0.45).toFixed(1)
      const rh = (80 + rnd() * h * 0.45).toFixed(1)
      const rot = ((rnd() * 60 - 30) | 0).toString()
      parts.push(
        `<rect x="${x}" y="${y}" width="${rw}" height="${rh}" rx="18" fill="${c}" fill-opacity="${op}" transform="rotate(${rot} ${x} ${y})"/>`
      )
    } else {
      const x1 = (rnd() * w).toFixed(1)
      const y1 = (rnd() * h).toFixed(1)
      const x2 = (rnd() * w).toFixed(1)
      const y2 = (rnd() * h).toFixed(1)
      const x3 = (rnd() * w).toFixed(1)
      const y3 = (rnd() * h).toFixed(1)
      parts.push(
        `<polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3}" fill="${c}" fill-opacity="${op}"/>`
      )
    }
  }

  const caption = label
    ? `<text x="${w / 2}" y="${h - 46}" font-family="-apple-system,Segoe UI,PingFang SC,Microsoft YaHei,sans-serif" font-size="26" font-weight="500" fill="${base}" text-anchor="middle">${esc(label)}</text>`
    : ''

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${parts.join('')}${caption}</svg>`
  return enc(svg)
}
