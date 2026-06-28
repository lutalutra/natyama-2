import { useEffect, useRef, useState, useCallback } from 'react'
import { LANGS, copy, detectLang } from './i18n'

// Range constraints for the diagonal plane angle (degrees).
const ANGLE_MIN = -45
const ANGLE_MAX = 30
const ANGLE_BASE = -24

// Colourful reactions for the studio corner — re-rolled at random as the
// cursor moves across the text, so lingering/wiggling the cursor feels
// like flipping through a deck of looks ("party" mode).
const HOVER_EFFECTS = ['saturate', 'invert', 'shapeShift', 'split', 'pulse']

// Subdued, minimal reactions for the archive/name corner — greyscale
// shading, a fine grid, or hatched lines instead of colour.
const MONO_EFFECTS = ['shade', 'grid', 'lines']

const ROLL_INTERVAL_MS = 140

export default function App() {
  const canvasRef = useRef(null)

  // Motion state lives in refs so the rAF loop can mutate it without re-renders.
  const motion = useRef({
    currentAngle: ANGLE_BASE,
    targetAngle: ANGLE_BASE,
    scrollAccum: 0,
    translate: 0,
    targetTranslate: 0,
    scale: 1,
    targetScale: 1,
    spread: 0,
    veil: 0.45,
    targetVeil: 0.45,
    time: 0,
    effectMode: null,
    monoMode: null,
  })

  const [hoverKey, setHoverKey] = useState(null)
  const [lang, setLang] = useState('en')

  // Pick up the visitor's browser language on first render.
  useEffect(() => {
    setLang(detectLang())
  }, [])

  const t = copy[lang]

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf = 0
    let width = window.innerWidth
    let height = window.innerHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // Scroll/wheel/touch only ever feed the target angle — never directly
    // drive a transform. The rAF loop below is the single source of motion.
    function onWheel(e) {
      const m = motion.current
      m.scrollAccum += e.deltaY * 0.26
      m.scrollAccum = Math.max(-400, Math.min(400, m.scrollAccum))
      const span = (ANGLE_MAX - ANGLE_MIN) / 2
      m.targetAngle = ANGLE_BASE + (m.scrollAccum / 400) * span
      m.targetTranslate = (m.scrollAccum / 400) * 40
      m.targetScale = 1 + Math.abs(m.scrollAccum / 400) * 0.06
    }
    let touchY = null
    function onTouchStart(e) {
      touchY = e.touches[0].clientY
    }
    function onTouchMove(e) {
      if (touchY == null) return
      const dy = touchY - e.touches[0].clientY
      touchY = e.touches[0].clientY
      // Touch drag needs a much bigger multiplier than wheel deltaY to feel
      // equally lively, since swipe distances are small compared to scroll.
      onWheel({ deltaY: dy * 4.5 })
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    function drawBase() {
      ctx.fillStyle = '#fafaf9'
      ctx.fillRect(0, 0, width, height)
    }

    // Hue offsets are deliberately clustered rather than spread evenly
    // around the wheel, so the bands read as a related palette instead of
    // a literal rainbow.
    const HUE_STEPS = [0, 16, -22, 34, -12, 8]
    const LIGHT_STEPS = [0, -14, 6, -10, 4, -6] // alternating light/dark per band for visible stripe edges

    // A set of soft, blurred diagonal colour bands standing in for the
    // photo plane. Scroll drives both their angle/position (via the shared
    // motion state) and their hue, so the whole composition reacts to
    // scrolling rather than just spinning in place.
    function drawBandSet(cx, cy, diag, angle, hueBase, saturation, lightness, bandAlpha, spreadOffset) {
      const m = motion.current
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate((angle * Math.PI) / 180)
      ctx.filter = 'blur(34px)'

      const bands = 6
      const bandWidth = diag / bands
      for (let i = 0; i < bands; i++) {
        const hue = (hueBase + HUE_STEPS[i % HUE_STEPS.length] + 360) % 360
        const li = Math.max(20, Math.min(92, lightness + LIGHT_STEPS[i % LIGHT_STEPS.length]))
        const wobble = Math.sin(m.time * 0.012 + i * 1.3) * bandWidth * 0.18
        const x = -diag / 2 + i * bandWidth + wobble + spreadOffset
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${li}%, ${bandAlpha})`
        ctx.fillRect(x, -diag / 2, bandWidth * 1.4, diag)
      }
      ctx.restore()
    }

    // Grey, non-rotated bands plus a fine grid or hatched-line overlay —
    // used for the minimalist archive/name corner instead of the colourful
    // effects.
    function drawMonoPlane(mode, bandAlpha) {
      const m = motion.current
      const cx = width / 2 + m.translate
      const cy = height / 2
      const diag = Math.hypot(width, height) * 1.6

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate((m.currentAngle * Math.PI) / 180)
      ctx.scale(m.scale, m.scale)
      ctx.filter = 'blur(30px)'
      const bands = 6
      const bandWidth = diag / bands
      for (let i = 0; i < bands; i++) {
        const grey = 235 - (i % 3) * 28
        ctx.fillStyle = `rgba(${grey}, ${grey}, ${grey}, ${bandAlpha})`
        ctx.fillRect(-diag / 2 + i * bandWidth, -diag / 2, bandWidth * 1.4, diag)
      }
      ctx.restore()

      if (mode === 'grid') {
        ctx.save()
        ctx.filter = 'none'
        ctx.strokeStyle = 'rgba(70, 70, 70, 0.16)'
        ctx.lineWidth = 1
        const gap = 24
        const offset = (m.time * 0.4) % gap
        for (let x = offset; x < width; x += gap) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, height)
          ctx.stroke()
        }
        for (let y = offset; y < height; y += gap) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
          ctx.stroke()
        }
        ctx.restore()
      } else if (mode === 'lines') {
        ctx.save()
        ctx.filter = 'none'
        ctx.strokeStyle = 'rgba(70, 70, 70, 0.18)'
        ctx.lineWidth = 1
        const gap = 18
        const offset = (m.time * 0.6) % gap
        for (let x = -height; x < width + height; x += gap) {
          ctx.beginPath()
          ctx.moveTo(x + offset, 0)
          ctx.lineTo(x + offset - height, height)
          ctx.stroke()
        }
        ctx.restore()
      }
    }

    // The background is two sets of soft diagonal bands crossing each other
    // at an angle (an "X" of light). Hovering the studio text cycles through
    // several distinct, high-contrast reactions; hovering the archive/name
    // corner instead switches the whole plane to a muted greyscale variant.
    function drawColorPlane() {
      const m = motion.current
      const bandAlpha = Math.max(0.3, 0.95 - m.veil)

      if (m.monoMode) {
        drawMonoPlane(m.monoMode, Math.min(1, bandAlpha * 1.1))
        return
      }

      const cx = width / 2 + m.translate
      const cy = height / 2
      const diag = Math.hypot(width, height) * 1.6
      let hueBase = (m.scrollAccum / 400) * 140 + m.time * 0.05
      let saturation = 68
      let lightness = 78
      let alpha = bandAlpha
      let crossSpan = Math.min(70, Math.abs(m.scrollAccum / 400) * 70 + 10)

      if (m.effectMode === 'saturate') {
        saturation = 92
        lightness = 70
        alpha = Math.min(1, alpha * 1.4)
      } else if (m.effectMode === 'invert') {
        hueBase += 180
        saturation = 78
      } else if (m.effectMode === 'shapeShift') {
        crossSpan = 85
        alpha = Math.min(1, alpha * 1.2)
      } else if (m.effectMode === 'split') {
        crossSpan = 30
        hueBase += 60
        saturation = 85
      } else if (m.effectMode === 'pulse') {
        alpha = Math.min(1, alpha * (0.7 + Math.abs(Math.sin(m.time * 0.25)) * 0.6))
        saturation = 95
      }

      ctx.save()
      ctx.scale(m.scale, m.scale)
      drawBandSet(cx / m.scale, cy / m.scale, diag, m.currentAngle - crossSpan, hueBase, saturation, lightness, alpha * 0.75, m.spread * 0.4)
      drawBandSet(cx / m.scale, cy / m.scale, diag, m.currentAngle + crossSpan, hueBase + 50, saturation, lightness, alpha * 0.75, -m.spread * 0.4)
      ctx.restore()
    }

    function loop() {
      const m = motion.current
      m.time += 1

      // Gentle perpetual breathing so the plane is never fully still,
      // even when scroll input has stopped.
      const breathing = Math.sin(m.time * 0.04) * 1.6 + Math.sin(m.time * 0.013) * 0.8

      const easing = 0.22
      m.currentAngle += (m.targetAngle + breathing - m.currentAngle) * easing
      m.currentAngle = Math.max(ANGLE_MIN - 4, Math.min(ANGLE_MAX + 4, m.currentAngle))

      m.translate += (m.targetTranslate + Math.sin(m.time * 0.03) * 6 - m.translate) * easing
      m.scale += (m.targetScale + Math.sin(m.time * 0.035) * 0.01 - m.scale) * easing
      m.veil += (m.targetVeil - m.veil) * 0.1
      m.spread += (0 - m.spread) * 0.12 // relaxes back unless a transition pushes it

      ctx.clearRect(0, 0, width, height)
      drawBase()
      drawColorPlane()

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  const lastRollRef = useRef(0)

  // Re-rolls the active background effect, throttled so moving/wiggling the
  // cursor over the text cycles through looks like flipping a deck of
  // cards rather than firing every single mousemove event.
  const rollEffect = useCallback((key) => {
    const now = performance.now()
    if (now - lastRollRef.current < ROLL_INTERVAL_MS) return
    lastRollRef.current = now
    const m = motion.current
    if (key === 'studio') {
      m.effectMode = HOVER_EFFECTS[Math.floor(Math.random() * HOVER_EFFECTS.length)]
      m.monoMode = null
    } else if (key === 'archive') {
      m.monoMode = MONO_EFFECTS[Math.floor(Math.random() * MONO_EFFECTS.length)]
      m.effectMode = null
    }
  }, [])

  const setHoverVeil = useCallback((reduced) => {
    motion.current.targetVeil = reduced ? 0.18 : 0.45
  }, [])

  const handleEnter = (key) => {
    setHoverKey(key)
    setHoverVeil(true)
    rollEffect(key)
  }
  const handleLeave = () => {
    setHoverKey(null)
    setHoverVeil(false)
    motion.current.effectMode = null
    motion.current.monoMode = null
  }

  // A brief flash when switching language, so the change feels like the
  // whole canvas reacting rather than just the text swapping.
  const changeLang = (code) => {
    setLang(code)
    const m = motion.current
    m.spread = 240
    m.targetVeil = 0.04
    window.setTimeout(() => {
      m.targetVeil = hoverKey ? 0.18 : 0.45
    }, 320)
  }

  return (
    <div className="canvas-page">
      <canvas ref={canvasRef} className="bg-canvas" />

      <div className="overlay">
        <div className="lang-switch">
          {LANGS.map((code, i) => (
            <span key={code}>
              {i > 0 && '/'}
              <button
                className={`lang-option ${lang === code ? 'is-active' : ''}`}
                onClick={() => changeLang(code)}
              >
                {code.toUpperCase()}
              </button>
            </span>
          ))}
        </div>

        <div
          className={`corner corner-tl hover-target ${hoverKey === 'studio' ? 'is-hovered' : ''}`}
          onMouseEnter={() => handleEnter('studio')}
          onMouseMove={() => rollEffect('studio')}
          onMouseLeave={handleLeave}
        >
          <span className="brand">{t.studioBrand}</span>
          <span className="brand-name">{t.studioName}</span>
          <span className="detail">
            {t.studioDetail.map((line, i) => (
              <span key={i}>
                {line}
                {i < t.studioDetail.length - 1 && <br />}
              </span>
            ))}
          </span>
        </div>

        <div
          className={`corner corner-br hover-target ${hoverKey === 'archive' ? 'is-hovered' : ''}`}
          onMouseEnter={() => handleEnter('archive')}
          onMouseMove={() => rollEffect('archive')}
          onMouseLeave={handleLeave}
        >
          <span className="brand">{t.archiveBy}</span>
        </div>
      </div>
    </div>
  )
}
