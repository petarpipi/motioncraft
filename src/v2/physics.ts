export type Spring = { x: number; y: number; vx: number; vy: number }
export function advanceSpring(
  state: Spring,
  target: { x: number; y: number },
  elapsed: number,
): Spring {
  const dt = Math.max(0, Math.min(elapsed, 1 / 30))
  const damping = Math.exp(-10 * dt)
  const vx = (state.vx + (target.x - state.x) * 170 * dt) * damping
  const vy = (state.vy + (target.y - state.y) * 170 * dt) * damping
  return { x: state.x + vx * dt, y: state.y + vy * dt, vx, vy }
}
export function springSettled(state: Spring, target: { x: number; y: number }) {
  return (
    Math.abs(state.x - target.x) +
      Math.abs(state.y - target.y) +
      Math.abs(state.vx) +
      Math.abs(state.vy) <
    0.06
  )
}
