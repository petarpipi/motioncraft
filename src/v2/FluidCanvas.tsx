import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Ref } from 'react'
import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from 'three'
import { useMotion } from '../motion'
import { ContourArt } from './Art'
export type FluidHandle = { pulse: () => void; reset: () => void }
const fragment = `
precision highp float;
uniform vec2 uMouse; uniform float uTime; uniform float uEnergy; uniform float uAspect;
varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float field(vec2 p){float v=0.;v+=noise(p)*.6;v+=noise(p*2.1)*.28;v+=noise(p*4.3)*.12;return v;}
void main(){
 vec2 uv=(vUv-.5)*vec2(uAspect,1.);
 vec2 mouse=(uMouse-.5)*vec2(uAspect,1.);
 float d=length(uv-mouse);
 float ripple=sin(d*23.-uTime*5.)*exp(-d*3.5)*uEnergy;
 vec2 p=uv*3.;p+=vec2(field(p+uTime*.04),field(p+vec2(5.,2.)))*1.8;
 float liquid=sin((p.x*.8+p.y+field(p*1.1)*1.6+ripple*.38)*9.);
 float band=smoothstep(-.8,.85,liquid);
 float spec=pow(max(liquid,0.),12.);
 vec3 color=mix(vec3(.022,.023,.025),vec3(.62,.64,.66),band);
 color+=spec*.4;
 float fine=pow(max(sin((p.x*.8+p.y+field(p*1.1)*1.6+ripple*.38)*9.+.6),0.),55.);
 color=mix(color,vec3(.78,1.,.37),fine*.32);
 color*=.7+.3*(1.-smoothstep(.1,1.3,length(uv)));
 gl_FragColor=vec4(color,1.);
}`

export default function FluidCanvas({ ref }: { ref?: Ref<FluidHandle> }) {
  const host = useRef<HTMLDivElement>(null)
  const controls = useRef<FluidHandle>({ pulse: () => {}, reset: () => {} })
  const [failed, setFailed] = useState(false)
  const { reduced } = useMotion()
  useImperativeHandle(
    ref,
    () => ({ pulse: () => controls.current.pulse(), reset: () => controls.current.reset() }),
    [],
  )
  useEffect(() => {
    const el = host.current
    if (!el) return
    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({ antialias: false, powerPreference: 'low-power' })
    } catch {
      setFailed(true)
      return
    }
    setFailed(false)
    renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 768 ? 0.8 : 1.25))
    const scene = new Scene(),
      camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const geometry = new PlaneGeometry(2, 2)
    const uniforms = {
      uMouse: { value: new Vector2(0.5, 0.5) },
      uTime: { value: 0 },
      uEnergy: { value: 0 },
      uAspect: { value: 1 },
    }
    const material = new ShaderMaterial({
      uniforms,
      vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1.);}',
      fragmentShader: fragment,
    })
    scene.add(new Mesh(geometry, material))
    const canvas = renderer.domElement
    canvas.dataset.renderer = 'fluid-webgl'
    canvas.setAttribute('aria-hidden', 'true')
    el.appendChild(canvas)
    let frame = 0,
      visible = true,
      disposed = false,
      last = 0,
      energy = 0,
      mx = 0.5,
      my = 0.5,
      time = 0
    const draw = (now: number) => {
      frame = 0
      if (disposed || !visible || document.hidden) return
      const dt = Math.min((now - (last || now)) / 1000, 0.04) || 0.016
      last = now
      const blend = reduced ? 1 : 1 - Math.exp(-9 * dt)
      uniforms.uMouse.value.x += (mx - uniforms.uMouse.value.x) * blend
      uniforms.uMouse.value.y += (my - uniforms.uMouse.value.y) * blend
      if (!reduced) {
        energy *= Math.exp(-2.5 * dt)
        time += dt
      }
      uniforms.uEnergy.value = reduced ? 0 : energy
      uniforms.uTime.value = time
      renderer.render(scene, camera)
      canvas.dataset.frames = String(Number(canvas.dataset.frames || 0) + 1)
      canvas.dataset.field = `${uniforms.uMouse.value.x.toFixed(3)},${uniforms.uMouse.value.y.toFixed(3)},${energy.toFixed(3)}`
      if (
        !reduced &&
        (energy > 0.002 ||
          Math.abs(mx - uniforms.uMouse.value.x) + Math.abs(my - uniforms.uMouse.value.y) > 0.001)
      )
        requestDraw()
    }
    function requestDraw() {
      if (!frame && !disposed && visible && !document.hidden) frame = requestAnimationFrame(draw)
    }
    const resize = new ResizeObserver(() => {
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height) return
      renderer.setSize(r.width, r.height, false)
      uniforms.uAspect.value = r.width / r.height
      requestDraw()
    })
    resize.observe(el)
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) {
        last = 0
        requestDraw()
      } else {
        cancelAnimationFrame(frame)
        frame = 0
      }
    })
    observer.observe(el)
    const move = (event: PointerEvent) => {
      if (reduced) return
      const r = el.getBoundingClientRect()
      mx = (event.clientX - r.left) / r.width
      my = 1 - (event.clientY - r.top) / r.height
      energy = 0.8
      requestDraw()
    }
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame)
        frame = 0
      } else {
        last = 0
        requestDraw()
      }
    }
    const lost = (event: Event) => {
      event.preventDefault()
      setFailed(true)
      cancelAnimationFrame(frame)
      frame = 0
    }
    const restored = () => {
      setFailed(false)
      requestDraw()
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerdown', move)
    document.addEventListener('visibilitychange', visibility)
    canvas.addEventListener('webglcontextlost', lost)
    canvas.addEventListener('webglcontextrestored', restored)
    controls.current = {
      pulse: () => {
        mx = 0.35 + Math.random() * 0.3
        my = 0.3 + Math.random() * 0.4
        energy = 1.8
        time = 0
        requestDraw()
      },
      reset: () => {
        mx = 0.5
        my = 0.5
        energy = 0
        time = 0
        requestDraw()
      },
    }
    requestDraw()
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      resize.disconnect()
      observer.disconnect()
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerdown', move)
      document.removeEventListener('visibilitychange', visibility)
      canvas.removeEventListener('webglcontextlost', lost)
      canvas.removeEventListener('webglcontextrestored', restored)
      geometry.dispose()
      material.dispose()
      scene.clear()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
      controls.current = { pulse: () => {}, reset: () => {} }
    }
  }, [reduced])
  return (
    <div
      ref={host}
      className={`fluid-canvas ${failed ? 'render-fallback' : ''}`}
      role="img"
      aria-label={
        failed
          ? 'Static contour artwork. WebGL is unavailable.'
          : 'An interactive silver liquid field that deforms around the pointer. Use Wake the surface for keyboard or touch.'
      }
    >
      {failed && (
        <>
          <ContourArt />
          <span className="fallback-label">STILL FIELD / WEBGL UNAVAILABLE</span>
        </>
      )}
    </div>
  )
}
