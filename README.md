# natyama

Interactive canvas portfolio landing page for Natsumi Sugiyama / natyama.

## Stack

- React + Vite
- Canvas 2D (background gradient/image + animated diagonal plane)
- GSAP (click transition before navigation)
- react-router-dom (`/`, `/studio`, `/archive`)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

The output in `dist/` is a static site and can be deployed to any static host
(Vercel, Netlify, GitHub Pages, etc).

## Replacing the background image

The canvas tries to load `public/bg.jpg` at startup. To use your own photo:

1. Drop a JPG at `public/bg.jpg` (any size — it's cropped to cover the
   viewport and blurred on the canvas).
2. Restart `npm run dev` (or rebuild) so Vite picks up the new static asset.

If `public/bg.jpg` is missing, the page automatically falls back to a
generated soft gradient (white / off-white / pale grey / pale blue) with the
same slow drifting motion, so the page works with no image at all.

## Notes on the motion

- A single `requestAnimationFrame` loop in `src/App.jsx` owns all drawing.
  Scroll/wheel/touch events only ever update a `targetAngle` (and a small
  target translate/scale) — they never touch the canvas directly.
- The plane's `currentAngle` eases toward `targetAngle` every frame
  (`currentAngle += (targetAngle - currentAngle) * easing`), and a low
  amplitude sine "breathing" offset is always added on top, so the plane is
  never perfectly still even with no scroll input.
- The angle is clamped to roughly `-45deg` to `+30deg`.
- Hovering the Studio / Archive / About / Contact text scales it up slightly
  and lowers the background blur target, which the rAF loop eases toward.
- Clicking Studio or Archive triggers a short GSAP tween that widens the
  diagonal plane (`spread`) before the actual navigation/`window.open` fires.
