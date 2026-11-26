# Elin Solvik — portfolio (concept piece)

A one-page portfolio for a **hypothetical** Stockholm lighting designer, built as a freelance showcase.
Everything about Elin, her projects, clients, figures and rates is invented sample content.

## The idea
The visitor holds the light.
- **Hero:** a plaster wall at night with the name cut into it in relief (three.js shader). A pendant lamp
  hangs on a cord in front of it: the anchor follows the pointer along the ceiling, you can grab the lamp
  and swing it (real pendulum), and clicking it switches it off and on with a synthesised switch click.
  The shade throws a cone of light, the letters cast shadows, dust turns in the beam, and moonlight from
  a window falls across the wall. **Your lamp** sets its colour temperature from 1,800 K to 6,500 K.
- **Kelvin ribbons:** two scroll-velocity strips of colour temperatures (each in its own colour) and project names.
- **Night gallery (work):** a pinned 3D room with seven lightboxes, each showing its project live, a wet
  floor holding their reflections and their colour spilling onto the wall. Scroll walks along the wall;
  click a lightbox or the button to open the case study.
- **Midvinter walk:** a pinned scroll scene that walks you through the 96 arches of the snow tunnel while
  metres, colour temperature and the time of day (running backwards) update live.
- **Lights off:** the switch in the fixed bar darkens the whole site; the lamp becomes a pool of warm
  light that follows the pointer.
- Contact rows gain weight as the pointer nears (React Bits VariableProximity).

## Stack
Vite + React 18, three.js (hero relief shader + one fragment program that draws all seven projects),
GSAP + ScrollTrigger, Lenis smooth scroll, and React Bits components pulled with the shadcn CLI:
ScrollReveal, SplitText, CountUp, Magnet, ClickSpark, ScrollVelocity, VariableProximity, TextPressure
(`src/components/reactbits`).

## Run it
Vite cannot serve a folder whose path contains `#`, so it runs through a junction with a clean name:

```powershell
# once, if the junction is missing
New-Item -ItemType Junction -Path "$HOME\Downloads\elin-solvik" -Target "$HOME\Downloads\#12"
```
```powershell
cd "$HOME\Downloads\elin-solvik"; npm run dev    # http://localhost:5250
```
```powershell
cd "$HOME\Downloads\elin-solvik"; npm run build:local  # dist/
```
`dev-scenes.html` (dev only) renders all seven project stills side by side; `dev-frame.html` shows the
site scaled down at 1440×900 (add `?phone=1` for 390×844), handy for screenshots.

## Where to edit
- `src/data/projects.js` — projects, Midvinter editions, the five "Taught by light" pictures, rates.
- `src/gl/scenes.glsl.js` — the seven drawn project scenes.
- `src/gl/HeroLight.js` — the wall, relief, pendant lamp physics and its intro.
- `src/gl/Gallery.js` — the night gallery room; `src/sections/MidvinterWalk.jsx` — the tunnel walk.
- `src/styles.css` — tokens at the top (palette, type steps, margins).

## Pictures (open licences, credited in the footer)
See `src/credits.json` / `assets/credits.json`: Stockholm by night (Holger.Ellgaard, CC BY-SA 3.0),
Fresnel lens (Frank Schulenburg, CC BY-SA 3.0), Aurora over Kiruna (Martin Eklund, CC0),
spectrum by refraction (Wellcome Collection, CC BY 4.0), candle flame (CC BY 4.0), gas lamps in
Zagreb (Jorge Lascar, CC BY 2.0), lighthouse (Joshua Hibbert, Unsplash licence). The project images
are drawn in code, not photographs.

## Swap before any real launch
Name, email (`hej@elinsolvik.se`), phone, address, every project and figure, rates.
