export type BadgeVariant = 'dark' | 'light'
export type BadgeImages = { textureUrl: string; badgeUrl: string }

// The source GLB uses a square UV atlas: front on the left, back on the right.
// Drawing our own artwork preserves the template's real model and material.
export function makeAsterBadge(name: string, variant: BadgeVariant): BadgeImages {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1376
  const ctx = canvas.getContext('2d')!
  const dark = variant === 'dark'
  const styles = getComputedStyle(document.documentElement)
  const color = (token: string) => styles.getPropertyValue(token).trim()
  const bg = color(dark ? '--ll-badge-dark' : '--ll-badge-light')
  const ink = color(dark ? '--ll-text' : '--ll-badge-light-ink')
  const muted = color(dark ? '--ll-muted' : '--ll-badge-light-muted')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 1376, 1376)

  const star = (x: number, y: number, size: number) => {
    ctx.beginPath()
    ctx.moveTo(x, y - size)
    ctx.lineTo(x + size * .22, y - size * .22)
    ctx.lineTo(x + size, y)
    ctx.lineTo(x + size * .22, y + size * .22)
    ctx.lineTo(x, y + size)
    ctx.lineTo(x - size * .22, y + size * .22)
    ctx.lineTo(x - size, y)
    ctx.lineTo(x - size * .22, y - size * .22)
    ctx.closePath()
    ctx.fill()
  }
  ctx.fillStyle = ink
  star(92, 176, 38)
  ctx.font = '600 94px Geist, sans-serif'
  ctx.fillText('aster', 150, 211)
  ctx.textAlign = 'right'
  ctx.font = '24px "Geist Mono", monospace'
  ctx.fillText('IN REAL LIFE', 630, 65)
  ctx.fillStyle = muted
  ctx.fillText('FIND YOUR PEOPLE', 630, 101)
  ctx.textAlign = 'left'
  ctx.fillStyle = ink
  ctx.font = '500 56px Geist, sans-serif'
  ctx.fillText('Crafting', 53, 292)
  ctx.fillText('Constellations', 53, 355)

  // The reference geometric artwork uses the active blue palette.
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 393, 688, 445)
  ctx.clip()
  ctx.strokeStyle = color(dark ? '--ll-badge-ray' : '--ll-badge-light-ray')
  ctx.lineWidth = 1.4
  for (let offset = -720; offset < 1300; offset += 43) {
    ctx.beginPath()
    ctx.moveTo(offset, 393)
    ctx.lineTo(offset + 445, 838)
    ctx.moveTo(offset, 838)
    ctx.lineTo(offset + 445, 393)
    ctx.stroke()
  }
  ctx.restore()
  const points = [[109, 532], [255, 454], [405, 570], [586, 466], [488, 718], [298, 762], [176, 663]]
  ctx.strokeStyle = ink
  ctx.lineWidth = 2
  ctx.beginPath()
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))
  ctx.lineTo(points[0][0], points[0][1])
  ctx.stroke()
  ctx.fillStyle = ink
  points.forEach(([x, y], i) => star(x, y, i === 2 ? 19 : 11))
  ctx.textAlign = 'right'
  ctx.font = '36px "Geist Mono", monospace'
  const displayName = (name.trim() || 'YOUR NAME').toUpperCase()
  const nameWidth = ctx.measureText(displayName).width
  if (nameWidth > 580) ctx.font = `${Math.floor(36 * 580 / nameWidth)}px "Geist Mono", monospace`
  ctx.fillText(displayName, 630, 923)
  ctx.fillStyle = muted
  ctx.font = '25px "Geist Mono", monospace'
  ctx.fillText('ONE HELLO AT A TIME', 630, 967)

  ctx.fillStyle = color(dark ? '--ll-badge-back' : '--ll-badge-light-back')
  ctx.beginPath()
  ctx.roundRect(741, 250, 585, 653, 22)
  ctx.fill()
  ctx.fillStyle = ink
  star(1033, 514, 98)
  ctx.textAlign = 'center'
  ctx.font = '600 79px Geist, sans-serif'
  ctx.fillText('aster', 1033, 692)
  ctx.font = '24px "Geist Mono", monospace'
  ctx.fillStyle = muted
  ctx.fillText('BUILD YOUR CONSTELLATION', 1033, 765)

  const front = document.createElement('canvas')
  front.width = 688
  front.height = 1042
  front.getContext('2d')!.drawImage(canvas, 0, 0, 688, 1042, 0, 0, 688, 1042)
  return { textureUrl: canvas.toDataURL('image/png'), badgeUrl: front.toDataURL('image/png') }
}
