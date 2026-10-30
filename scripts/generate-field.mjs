import { writeFileSync } from 'node:fs'
const paths = Array.from({ length: 70 }, (_, i) => {
  const d = Array.from({ length: 101 }, (_, j) => {
    const x = j * 8,
      y = 35 + i * 10.5,
      dist = Math.hypot((x - 400) * 1.1, y - 400)
    return `${j ? 'L' : 'M'}${x} ${(y + Math.sin(dist * 0.022) * Math.max(0, 190 - dist * 0.48)).toFixed(1)}`
  }).join(' ')
  return `<path d="${d}"/>`
}).join('')
writeFileSync(
  'public/art/field.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><title>Interference field — original generative artwork</title><rect width="800" height="800" fill="#c7ff5e"/><g fill="none" stroke="#102006" stroke-width="2">${paths}</g></svg>`,
)
console.log('Original interference field generated.')
