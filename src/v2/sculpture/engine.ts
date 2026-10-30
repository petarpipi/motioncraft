import {
  Color,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { fragmentShader, vertexShader } from './shaders'
import { sculptureInput, sculptureState } from './state'
import type { SculptureState, Tier } from './state'

export type SculptureHandle = {
  canvas: HTMLCanvasElement
  setActive: (active: boolean) => void
  dispose: () => void
  /** Renders one frame with the given state and returns it as a WebP data URL (tooling only). */
  snapshot: (state: Partial<SculptureState>, width: number, height: number) => string
}

const FOV = 30
const CAMERA_Z = 9.5
/** Idle frames are halved after this long without input to save battery. */
const IDLE_AFTER_MS = 5000

export async function createSculpture(
  host: HTMLElement,
  tier: Tier,
  onLost: () => void,
): Promise<SculptureHandle> {
  const renderer = new WebGLRenderer({
    alpha: true,
    antialias: tier.antialias,
    powerPreference: tier.name === 'high' ? 'high-performance' : 'low-power',
  })
  renderer.setPixelRatio(tier.dpr)
  renderer.setClearColor(0x000000, 0)
  const canvas = renderer.domElement
  canvas.setAttribute('aria-hidden', 'true')
  canvas.dataset.renderer = 'sculpture'
  canvas.dataset.tier = tier.name
  canvas.dataset.blades = String(tier.blades)
  canvas.dataset.frames = '0'
  canvas.dataset.instance = String(Math.round(performance.now()))

  const scene = new Scene()
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 40)
  camera.position.set(0, 0, CAMERA_Z)

  const base = new RoundedBoxGeometry(2.1, 0.075, 0.52, 2, 0.035)
  const geometry = new InstancedBufferGeometry()
  geometry.index = base.index
  geometry.setAttribute('position', base.getAttribute('position'))
  geometry.setAttribute('normal', base.getAttribute('normal'))
  geometry.instanceCount = tier.blades
  const order = new Float32Array(tier.blades)
  const random = new Float32Array(tier.blades)
  for (let i = 0; i < tier.blades; i++) {
    order[i] = i / (tier.blades - 1)
    random[i] = i % 2 ? 0.25 + ((i * 0.618) % 0.25) : 0.75 - ((i * 0.382) % 0.25)
  }
  geometry.setAttribute('aT', new InstancedBufferAttribute(order, 1))
  geometry.setAttribute('aRand', new InstancedBufferAttribute(random, 1))

  const uniforms = {
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uAssemble: { value: 0 },
    uCoil: { value: 3.3 },
    uSpin: { value: 0 },
    uImpulse: { value: 0 },
    uImpulseAt: { value: 0.5 },
    uPointer: { value: new Vector2() },
    uAcid: { value: new Color('#c7ff5e') },
  }
  const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader })
  const mesh = new Mesh(geometry, material)
  mesh.frustumCulled = false
  scene.add(mesh)
  host.appendChild(canvas)

  let width = 0,
    height = 0,
    visibleH = 1,
    visibleW = 1,
    baseScale = 1
  const resize = () => {
    const w = window.innerWidth,
      h = window.innerHeight
    // Mobile URL bars resize the viewport while scrolling; ignore small height changes.
    if (w === width && Math.abs(h - height) < 120) return
    width = w
    height = h
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    visibleH = 2 * Math.tan((FOV * Math.PI) / 360) * CAMERA_Z
    visibleW = visibleH * camera.aspect
    baseScale = Math.min(visibleH / 5.1, visibleW / 2.9)
    // Pixels per world unit at scale 1, for DOM masks that must align with the form.
    document.documentElement.style.setProperty(
      '--sculpture-unit',
      `${((baseScale * h) / visibleH).toFixed(2)}px`,
    )
  }
  resize()

  // Pointer, touch and scroll all feed the same damped inputs.
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  let lastInput = performance.now()
  const onPointerMove = (event: PointerEvent) => {
    const nx = (event.clientX / width) * 2 - 1
    const ny = -((event.clientY / height) * 2 - 1)
    const speed = Math.hypot(nx - pointer.tx, ny - pointer.ty)
    pointer.tx = nx
    pointer.ty = ny
    if (speed > 0.02) sculptureInput.pluck(Math.min(0.25, speed * 0.9), ny * 0.5 + 0.5)
    lastInput = performance.now()
  }
  const onPointerDown = (event: PointerEvent) => {
    const ny = -((event.clientY / height) * 2 - 1)
    sculptureInput.pluck(0.75, ny * 0.5 + 0.5)
    pointer.tx = (event.clientX / width) * 2 - 1
    pointer.ty = ny
    lastInput = performance.now()
  }
  let lastScroll = window.scrollY
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerdown', onPointerDown, { passive: true })
  window.addEventListener('resize', resize)

  let frame = 0,
    active = true,
    disposed = false,
    last = 0,
    time = 0,
    impulse = 0,
    tick = 0,
    rendered = 0
  const pointerTilt = new Vector2()

  const applyState = (state: SculptureState) => {
    uniforms.uMorph.value = state.morph
    uniforms.uAssemble.value = state.assemble
    uniforms.uCoil.value = state.coil
    uniforms.uSpin.value = state.spin
    mesh.position.set(state.x * visibleW, state.y * visibleH, 0)
    mesh.scale.setScalar(state.scale * baseScale)
  }

  const draw = (now: number) => {
    frame = 0
    if (disposed || !active || document.hidden) return
    const dt = Math.min((now - (last || now)) / 1000, 0.05) || 1 / 60
    last = now
    const scrollDelta = window.scrollY - lastScroll
    lastScroll = window.scrollY
    if (Math.abs(scrollDelta) > 2) {
      sculptureInput.pluck(Math.min(0.12, Math.abs(scrollDelta) / 900), scrollDelta > 0 ? 0.2 : 0.8)
      lastInput = now
    }
    if (sculptureInput.pending) {
      impulse = Math.min(1.6, impulse + sculptureInput.pending)
      uniforms.uImpulseAt.value = sculptureInput.at
      sculptureInput.pending = 0
    }
    impulse *= Math.exp(-2.2 * dt)
    time += dt
    const damping = 1 - Math.exp(-6 * dt)
    pointer.x += (pointer.tx - pointer.x) * damping
    pointer.y += (pointer.ty - pointer.y) * damping
    uniforms.uTime.value = time
    uniforms.uImpulse.value = impulse
    uniforms.uPointer.value.set(pointer.x, pointer.y)
    applyState(sculptureState)
    pointerTilt.set(pointer.x * 0.32, -pointer.y * 0.18)
    mesh.rotation.set(0.1 + pointerTilt.y, pointerTilt.x, 0)

    tick++
    const idle = now - lastInput > IDLE_AFTER_MS && impulse < 0.02
    // Idle motion continues at half rate; interaction and scroll run every frame.
    if (!idle || tick % 2 === 0) {
      renderer.render(scene, camera)
      rendered++
      if (rendered % 10 === 0 || rendered < 3) {
        canvas.dataset.frames = String(rendered)
        canvas.dataset.impulse = impulse.toFixed(3)
        canvas.dataset.pointer = `${pointer.x.toFixed(3)},${pointer.y.toFixed(3)}`
        canvas.dataset.spin = sculptureState.spin.toFixed(3)
      }
    }
    request()
  }
  const request = () => {
    if (!frame && !disposed && active && !document.hidden) frame = requestAnimationFrame(draw)
  }
  const onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(frame)
      frame = 0
    } else {
      last = 0
      request()
    }
  }
  document.addEventListener('visibilitychange', onVisibility)
  const onLostContext = (event: Event) => {
    event.preventDefault()
    cancelAnimationFrame(frame)
    frame = 0
    onLost()
  }
  canvas.addEventListener('webglcontextlost', onLostContext)

  // Compile off the critical path where KHR_parallel_shader_compile exists.
  applyState(sculptureState)
  await renderer.compileAsync(scene, camera)
  if (!disposed) {
    renderer.render(scene, camera)
    rendered = 1
    canvas.dataset.frames = '1'
    canvas.dataset.firstFrameMs = String(Math.round(performance.now()))
    request()
  }

  return {
    canvas,
    setActive(next) {
      if (next === active) return
      active = next
      canvas.dataset.active = String(next)
      if (next) {
        last = 0
        lastScroll = window.scrollY
        request()
      } else {
        cancelAnimationFrame(frame)
        frame = 0
      }
    },
    snapshot(state, w, h) {
      const previous = { ...sculptureState }
      Object.assign(sculptureState, state)
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      visibleW = visibleH * camera.aspect
      applyState(sculptureState)
      mesh.rotation.set(0.1, 0, 0)
      renderer.render(scene, camera)
      const url = canvas.toDataURL('image/webp', 0.9)
      Object.assign(sculptureState, previous)
      // Force the next resize to restore the live viewport size.
      width = 0
      height = 0
      resize()
      return url
    },
    dispose() {
      disposed = true
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
      canvas.removeEventListener('webglcontextlost', onLostContext)
      geometry.dispose()
      material.dispose()
      scene.clear()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
      document.documentElement.style.removeProperty('--sculpture-unit')
    },
  }
}
