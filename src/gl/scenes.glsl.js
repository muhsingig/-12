// One fragment program that draws a still of each project, so a single canvas can cross-fade between
// them. Colours are display-referred; each scene keeps its own light, and the visitor's lamp (uLamp)
// enters where the work itself would respond to it.

export const sceneVert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

export const sceneFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes;
uniform float uTime;
uniform int uScene;
uniform int uPrev;
uniform float uMix;
uniform float uVariant;
uniform vec3 uLamp;
uniform float uWalk; // < 0: the tunnel walks itself; otherwise the visitor's position, in arches

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a*noise(p); p *= 2.03; a *= 0.5; } return v; }
float box(vec2 p, vec2 c, vec2 s){ vec2 d = abs(p - c) - s; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }

vec3 kelvin(float k){
  float t = k / 100.0;
  vec3 c;
  c.r = t <= 66.0 ? 1.0 : clamp(1.29293618606 * pow(t - 60.0, -0.1332047592), 0.0, 1.0);
  c.g = t <= 66.0 ? clamp(0.39008157876 * log(t) - 0.63184144378, 0.0, 1.0) : clamp(1.12989086089 * pow(t - 60.0, -0.0755148492), 0.0, 1.0);
  c.b = t >= 66.0 ? 1.0 : (t <= 19.0 ? 0.0 : clamp(0.54320678911 * log(t - 10.0) - 1.19625408914, 0.0, 1.0));
  return c;
}

// ---- Midvinter: a snow tunnel of arches, cool at the entrance and candle-warm at the far end
vec3 sMidvinter(vec2 p, float t){
  float hor = 0.06;
  vec3 col = mix(vec3(0.012, 0.02, 0.05), vec3(0.035, 0.06, 0.12), smoothstep(0.5, hor, p.y));
  vec2 sp = floor(p * 110.0);
  col += step(0.992, hash(sp)) * hash(sp + 4.0) * 0.7 * smoothstep(hor, 0.4, p.y);
  float camH = 0.62, f = 0.95, R = 1.25;
  bool walking = uWalk >= 0.0;
  float walk = walking ? uWalk : t * 0.35;
  if (walking) p.y += 0.006 * sin(walk * 6.2832);
  vec3 acc = vec3(0.0);
  float ground = p.y < hor ? 1.0 : 0.0;
  float zg = camH * f / max(hor - p.y, 0.001);
  float xg = p.x * zg / f;
  vec3 pool = vec3(0.0);
  for (int i = 0; i < 24; i++){
    float fi = float(i);
    float z = 0.7 + fi * 0.85 - fract(walk) * 0.85;
    float depth = clamp((z - 0.7) / 11.0, 0.0, 1.0);
    float k = mix(5200.0, 1800.0, pow(depth, 0.7));
    if (walking){
      float idx = floor(walk) + fi;
      if (idx > 96.0) break;
      k = mix(5200.0, 1800.0, idx / 96.0);
    }
    if (uVariant > 0.5 && uVariant < 1.5) k = 2700.0;
    vec3 lc = kelvin(k);
    if (uVariant > 1.5) lc = vec3(0.45, 0.62, 1.0);
    vec2 c = vec2(0.0, hor - camH * f / z);
    float r = R * f / z;
    float d = abs(length(p - c) - r);
    float upper = smoothstep(-0.003, 0.006, p.y - c.y);
    float w = 0.014 / z;
    float core = smoothstep(w, w * 0.2, d);
    float halo = exp(-d * z * 16.0) * 0.32;
    float fade = 1.0 / (1.0 + z * 0.12);
    acc += lc * (core * 1.5 + halo) * upper * fade;
    // light thrown on the snow floor under each arch
    float dz = zg - z;
    pool += lc * exp(-dz * dz * 3.0) * exp(-xg * xg * 0.35) * 0.55 * fade;
  }
  if (ground > 0.5){
    float snow = 0.02 + 0.025 * fbm(vec2(xg * 2.0, zg * 2.0));
    vec3 s = vec3(snow * 0.8, snow * 0.9, snow * 1.3) + pool * 0.55 * (0.55 + 0.45 * fbm(vec2(xg * 6.0, zg * 6.0)));
    float sparkle = step(0.996, hash(floor(p * vec2(260.0, 520.0)))) * clamp(length(pool), 0.0, 1.0);
    col = s + sparkle * 0.6;
    col *= smoothstep(0.0, 0.03, hor - p.y) * 0.6 + 0.4;
  }
  if (walking){
    // the far end: a snow wall lit by one candle
    float endZ = 0.7 + (97.0 - walk) * 0.85;
    if (endZ > 0.25 && endZ < 22.0){
      vec2 c = vec2(0.0, hor - camH * f / endZ);
      float r = R * f / endZ;
      float inside = smoothstep(r, r * 0.97, length(p - c)) * step(c.y, p.y);
      vec3 warm = kelvin(1800.0) * (0.18 + 0.5 * exp(-length(p - vec2(0.0, c.y + r * 0.18)) * 9.0 * endZ)) / (1.0 + endZ * 0.08);
      vec2 fl = (p - vec2(0.0, c.y + r * 0.2)) / (0.05 * r);
      float flame = smoothstep(1.0, 0.6, length(vec2(fl.x * 2.2, fl.y * 0.9 - 0.2 * sin(t * 7.0))));
      col = mix(col, warm + kelvin(1900.0) * flame * 1.4, inside);
      acc *= 1.0 - inside;
    }
  }
  return col + acc;
}

// ---- Tidvatten: a terminal façade drawing the tide, mirrored in the harbour
vec3 sTide(vec2 p, float t){
  float water = -0.1;
  vec2 q = p;
  bool refl = p.y < water;
  if (refl){
    q.y = 2.0 * water - p.y;
    q.x += sin(p.y * 140.0 + t * 1.6) * 0.0035 * (water - p.y) * 6.0;
  }
  vec3 col = mix(vec3(0.015, 0.02, 0.04), vec3(0.04, 0.06, 0.11), smoothstep(0.5, -0.1, q.y));
  // city behind
  float sky = step(q.y, 0.05 + 0.12 * step(0.5, noise(vec2(floor(q.x * 18.0), 2.0))) * noise(vec2(floor(q.x * 9.0), 1.0)));
  col = mix(col, vec3(0.02, 0.022, 0.03), sky);
  float bx0 = -0.46, bx1 = 0.46, by0 = water + 0.015, by1 = 0.2;
  if (q.x > bx0 && q.x < bx1 && q.y > by0 && q.y < by1){
    float u = (q.x - bx0) / (bx1 - bx0);
    float v = (q.y - by0) / (by1 - by0);
    float n = 56.0;
    float id = floor(u * n);
    float fu = fract(u * n);
    float tide = 0.5 + 0.3 * sin(id * 0.16 - t * 0.45) + 0.07 * sin(id * 0.71 + t * 0.3);
    float lit = smoothstep(tide + 0.01, tide - 0.01, v) * smoothstep(0.42, 0.18, abs(fu - 0.5));
    vec3 lc = mix(vec3(0.62, 0.86, 1.0), uLamp, 0.4);
    vec3 glass = vec3(0.035, 0.045, 0.06) + vec3(0.03) * step(0.93, fract(v * 5.0));
    col = glass + lc * lit * 1.5;
    // the top of each line is brightest: the reading itself
    col += lc * smoothstep(0.03, 0.0, abs(v - tide)) * smoothstep(0.42, 0.1, abs(fu - 0.5)) * 1.2;
  }
  // roof slab
  if (abs(q.y - by1 - 0.012) < 0.012 && q.x > bx0 - 0.03 && q.x < bx1 + 0.03) col = vec3(0.05, 0.055, 0.065);
  if (refl){
    col *= 0.42 * (0.65 + 0.35 * noise(vec2(p.x * 30.0, p.y * 260.0 + t * 1.2)));
    col += vec3(0.008, 0.012, 0.02);
  }
  return col;
}

// ---- En soluppgång: a sunrise replayed on a gallery wall, two visitors on the bench
vec3 sSunrise(vec2 p, float t){
  float ph = fract(t / 14.0);
  float horizon = -0.02;
  vec3 night = vec3(0.03, 0.035, 0.09);
  vec3 low = mix(vec3(0.08, 0.05, 0.12), vec3(1.0, 0.5, 0.22), smoothstep(0.08, 0.5, ph));
  low = mix(low, vec3(1.0, 0.86, 0.66), smoothstep(0.6, 1.0, ph));
  vec3 top = mix(night, vec3(0.42, 0.56, 0.8), smoothstep(0.3, 0.95, ph));
  float y = p.y;
  vec3 wallc = mix(low, top, smoothstep(horizon, 0.38, y));
  wallc *= mix(0.55, 1.0, smoothstep(-0.3, horizon + 0.05, y));
  vec2 sun = vec2(0.17, mix(-0.32, 0.22, ph));
  float sd = length(p - sun);
  wallc += mix(vec3(1.0, 0.45, 0.2), vec3(1.0, 0.95, 0.85), ph) * smoothstep(0.075, 0.06, sd) * 0.9;
  wallc += vec3(1.0, 0.6, 0.3) * exp(-sd * 9.0) * 0.25 * (1.0 - ph * 0.5);
  // wall bounds and the room
  float wx = 0.44, wy0 = -0.24, wy1 = 0.4;
  vec3 col;
  vec3 avg = mix(low, top, 0.4);
  if (abs(p.x) < wx && y > wy0 && y < wy1){
    col = wallc;
  } else if (y <= wy0){
    // floor: polished concrete picking up the wall
    float d = wy0 - y;
    vec3 r = mix(low, top, 0.2) * 0.35 * exp(-d * 5.0);
    col = vec3(0.025) + r * (0.8 + 0.2 * noise(vec2(p.x * 40.0, d * 90.0)));
  } else {
    col = avg * 0.12 + vec3(0.01);
    col *= 1.0 - smoothstep(wx, wx + 0.2, abs(p.x)) * 0.5;
  }
  // bench and two silhouettes
  float s = 1e5;
  s = min(s, box(p, vec2(0.0, -0.205), vec2(0.2, 0.008)));
  s = min(s, box(p, vec2(-0.17, -0.235), vec2(0.008, 0.03)));
  s = min(s, box(p, vec2(0.17, -0.235), vec2(0.008, 0.03)));
  s = min(s, box(p, vec2(-0.07, -0.16), vec2(0.028, 0.04)) - 0.012);
  s = min(s, length(p - vec2(-0.07, -0.088)) - 0.022);
  s = min(s, box(p, vec2(0.05, -0.165), vec2(0.026, 0.036)) - 0.012);
  s = min(s, length(p - vec2(0.05, -0.1)) - 0.021);
  col = mix(col, vec3(0.008), smoothstep(0.002, -0.001, s));
  return col;
}

// ---- Low Tide: twelve beams through haze, the band in silhouette
vec3 sStage(vec2 p, float t){
  vec3 col = vec3(0.006, 0.006, 0.012);
  float haze = fbm(p * 3.0 + vec2(t * 0.05, -t * 0.03));
  float cue = floor(t / 4.5);
  vec3 cA = kelvin(2600.0) * vec3(1.0, 0.85, 0.7);
  vec3 cB = vec3(0.2, 0.35, 1.0);
  for (int i = 0; i < 12; i++){
    float fi = float(i);
    vec2 o = vec2(-0.46 + fi * 0.0836, 0.5);
    float a = 0.32 * sin(t * 0.55 + fi * 0.9 + cue) * (mod(cue, 2.0) < 1.0 ? 1.0 : -1.0);
    a += (fi - 5.5) * 0.035;
    vec2 d = vec2(sin(a), -cos(a));
    vec2 rp = p - o;
    float along = dot(rp, d);
    float perp = length(rp - along * d);
    float w = 0.004 + along * 0.06;
    float beam = smoothstep(w, w * 0.15, perp) * step(0.0, along) * exp(-along * 0.9);
    vec3 bc = mod(fi + cue, 2.0) < 1.0 ? cA : cB;
    col += bc * beam * (0.3 + haze * 0.9);
    col += bc * exp(-length(rp) * 60.0) * 0.6;
  }
  // truss
  if (abs(p.y - 0.5) < 0.012) col = vec3(0.04);
  // floor and riser
  float floorY = -0.3;
  if (p.y < floorY) col = col * 0.25 + vec3(0.01);
  float s = 1e5;
  s = min(s, box(p, vec2(0.0, -0.27), vec2(0.13, 0.03)));
  s = min(s, box(p, vec2(0.0, -0.2), vec2(0.035, 0.04)) - 0.015);
  s = min(s, length(p - vec2(0.0, -0.13)) - 0.022);
  s = min(s, length(p - vec2(0.065, -0.19)) - 0.045);
  s = min(s, box(p, vec2(-0.27, -0.2), vec2(0.022, 0.1)) - 0.012);
  s = min(s, length(p - vec2(-0.27, -0.065)) - 0.024);
  s = min(s, box(p, vec2(-0.235, -0.19), vec2(0.05, 0.012)));
  s = min(s, box(p, vec2(0.28, -0.2), vec2(0.024, 0.1)) - 0.012);
  s = min(s, length(p - vec2(0.28, -0.07)) - 0.023);
  s = min(s, box(p, vec2(0.28, -0.13), vec2(0.004, 0.05)));
  col = mix(col, vec3(0.004), smoothstep(0.002, -0.001, s));
  return col;
}

// ---- Fyrregistret: every light on a dark coast, each blinking its own character
float landF(vec2 p){ return fbm(p * 2.6 + vec2(3.1, 1.7)) + (-p.x - 0.05) * 1.1; }
vec3 sLights(vec2 p, float t){
  float lf = landF(p);
  float land = step(0.52, lf);
  vec3 sea = vec3(0.016, 0.03, 0.06) + vec3(0.0, 0.006, 0.012) * noise(p * 50.0 + t * 0.2);
  vec3 col = mix(sea, vec3(0.05, 0.055, 0.06) + 0.03 * fbm(p * 12.0), land);
  // depth contours at sea
  float c = fract(lf * 14.0);
  col += (1.0 - land) * vec3(0.0, 0.02, 0.04) * smoothstep(0.08, 0.0, abs(c - 0.5) - 0.42) * smoothstep(0.1, 0.52, lf);
  // coast edge
  col += vec3(0.05, 0.06, 0.07) * smoothstep(0.012, 0.0, abs(lf - 0.52));
  float cell = 0.045;
  vec2 g = floor(p / cell);
  for (int j = -1; j <= 1; j++){
    for (int i = -1; i <= 1; i++){
      vec2 id = g + vec2(float(i), float(j));
      float h = hash(id);
      vec2 pos = (id + 0.25 + 0.5 * vec2(hash(id + 1.3), hash(id + 2.7))) * cell;
      float near = abs(landF(pos) - 0.52);
      if (near < 0.07 && h > 0.12){
        float period = 4.0 + floor(h * 8.0);
        float flashes = 1.0 + floor(hash(id + 9.0) * 3.0);
        float ph = mod(t + h * 20.0, period);
        float on = (ph < flashes * 0.7 && fract(ph / 0.7) < 0.45) ? 1.0 : 0.0;
        float kind = hash(id + 5.0);
        vec3 lc = kind < 0.7 ? vec3(1.0, 0.95, 0.85) : (kind < 0.85 ? vec3(1.0, 0.25, 0.2) : vec3(0.3, 1.0, 0.5));
        float d = length(p - pos);
        col += lc * (smoothstep(0.004, 0.0015, d) * (0.25 + on) + exp(-d * 70.0) * on * 0.5);
      }
    }
  }
  // the great light: a slow sweeping sector
  vec2 big = vec2(0.12, 0.06);
  vec2 v = p - big;
  float ang = atan(v.y, v.x) - t * 0.7;
  float sector = smoothstep(0.25, 0.0, abs(mod(ang + 3.14159, 6.28318) - 3.14159));
  col += vec3(1.0, 0.92, 0.75) * sector * exp(-length(v) * 3.5) * 0.18 * (1.0 - land);
  col += vec3(1.0, 0.95, 0.85) * smoothstep(0.006, 0.002, length(v));
  return col;
}

// ---- Kelvin House: a lobby on the sky's own schedule
vec3 sLobby(vec2 p, float t){
  float ph = fract(t / 18.0);
  float day = smoothstep(0.1, 0.35, ph) * (1.0 - smoothstep(0.65, 0.9, ph));
  float dusk = exp(-pow((ph - 0.78) * 9.0, 2.0)) + exp(-pow((ph - 0.2) * 9.0, 2.0)) * 0.6;
  vec3 skyTop = mix(vec3(0.02, 0.03, 0.08), vec3(0.45, 0.62, 0.88), day);
  vec3 skyLow = mix(skyTop * 1.2, vec3(1.0, 0.52, 0.25), dusk * 0.8);
  float roomK = mix(2200.0, 6000.0, day);
  vec3 room = kelvin(roomK) * mix(0.55, 0.9, day);
  float wy0 = -0.18, wy1 = 0.3;
  vec3 col = vec3(0.07, 0.065, 0.06) * (0.4 + 0.6 * mix(0.6, 1.0, day));
  // wall wash from the cove
  col += room * 0.35 * exp(-(0.42 - p.y) * 3.5);
  // windows
  for (int i = 0; i < 3; i++){
    float cx = -0.3 + float(i) * 0.3;
    vec2 q = p - vec2(cx, 0.06);
    if (abs(q.x) < 0.09 && p.y > wy0 && p.y < wy1){
      float v = (p.y - wy0) / (wy1 - wy0);
      vec3 sk = mix(skyLow, skyTop, smoothstep(0.0, 0.8, v));
      float city = step(v, 0.12 + 0.18 * hash(vec2(floor((p.x + 1.0) * 60.0), 3.0)));
      sk = mix(sk, sk * 0.25 + vec3(0.01), city);
      sk += vec3(1.0, 0.8, 0.5) * city * step(0.93, hash(floor(p * 240.0))) * (1.0 - day);
      col = sk;
      if (abs(q.x) < 0.004) col = vec3(0.03);
    }
  }
  // cove line
  if (p.y > 0.4 && p.y < 0.415) col = room * 1.4;
  if (p.y >= 0.415) col = vec3(0.03, 0.03, 0.03) + room * 0.05;
  // floor with reflections
  float fy = -0.24;
  if (p.y < fy){
    vec2 r = vec2(p.x, 2.0 * fy - p.y);
    float inWin = 0.0;
    for (int i = 0; i < 3; i++){ float cx = -0.3 + float(i) * 0.3; inWin += step(abs(r.x - cx), 0.09) * step(wy0, r.y); }
    vec3 base = vec3(0.04, 0.038, 0.035) + room * 0.06;
    col = base + mix(skyLow, skyTop, 0.3) * inWin * 0.22 * (0.7 + 0.3 * noise(vec2(p.x * 80.0, p.y * 20.0)));
  }
  // sofa and two reading lamps
  float s = box(p, vec2(0.0, -0.215), vec2(0.17, 0.03)) - 0.01;
  s = min(s, box(p, vec2(0.0, -0.17), vec2(0.17, 0.018)) - 0.01);
  col = mix(col, vec3(0.015) + room * 0.03, smoothstep(0.002, -0.001, s));
  for (int i = 0; i < 2; i++){
    float lx = i == 0 ? -0.26 : 0.26;
    col = mix(col, vec3(0.01), smoothstep(0.002, -0.001, box(p, vec2(lx, -0.12), vec2(0.0025, 0.12))));
    vec2 sh = p - vec2(lx, 0.005);
    float shade = box(sh, vec2(0.0), vec2(0.03, 0.022));
    vec3 lampc = mix(kelvin(2700.0), uLamp, 0.5);
    col = mix(col, lampc * 0.9, smoothstep(0.002, -0.001, shade));
    col += lampc * exp(-length(p - vec2(lx, -0.03)) * 9.0) * 0.18;
  }
  return col;
}

// ---- Nattbiblioteket: 140 reading lamps on a snowy square, seen from the library windows
vec3 sSquare(vec2 p, float t){
  float tilt = 0.55;
  float z = 1.6 / (1.0 + (p.y + 0.5) * tilt * 1.4);
  vec2 w = vec2(p.x * z * 2.2, (p.y + 0.5) * z * 2.6);
  vec3 snow = vec3(0.05, 0.06, 0.09) + vec3(0.03, 0.035, 0.05) * fbm(w * 3.0);
  // trodden paths
  float path = smoothstep(0.08, 0.0, abs(w.x - 0.25 * sin(w.y * 1.3)) - 0.06);
  snow *= 1.0 - path * 0.35;
  vec3 col = snow;
  vec2 g = floor(w / 0.32);
  vec3 lamp = kelvin(2700.0);
  for (int j = -1; j <= 1; j++){
    for (int i = -1; i <= 1; i++){
      vec2 id = g + vec2(float(i), float(j));
      if (abs(id.x) > 6.0 || id.y < 0.0 || id.y > 9.0) continue;
      float h = hash(id);
      if (h < 0.3) continue;
      vec2 c = (id + 0.3 + 0.4 * vec2(hash(id + 3.1), hash(id + 7.7))) * 0.32;
      float on = step(0.48, noise(vec2(h * 40.0, t * 0.22 + h * 3.0)));
      float d = length(w - c);
      col += lamp * on * exp(-d * d * 55.0) * 0.95 * (0.8 + 0.2 * fbm(w * 9.0));
      // chair, and someone in it when the lamp is on
      float chair = box(w, c + vec2(0.0, -0.02), vec2(0.022, 0.02));
      col = mix(col, vec3(0.02, 0.018, 0.016), smoothstep(0.006, 0.0, chair));
      float person = length(w - (c + vec2(0.0, -0.015))) - 0.028;
      col = mix(col, vec3(0.03, 0.025, 0.03), on * smoothstep(0.006, 0.0, person));
      // the lamp head, seen from above
      col = mix(col, lamp * (0.25 + on * 1.4), smoothstep(0.012, 0.004, length(w - c - vec2(0.0, 0.045))));
    }
  }
  float sparkle = step(0.988, hash(floor(p * vec2(300.0, 300.0)))) * 0.4;
  return col + sparkle * length(col - snow);
}

vec3 sceneById(int id, vec2 p, float t){
  if (id == 0) return sMidvinter(p, t);
  if (id == 1) return sTide(p, t);
  if (id == 2) return sSunrise(p, t);
  if (id == 3) return sStage(p, t);
  if (id == 4) return sLights(p, t);
  if (id == 5) return sLobby(p, t);
  return sSquare(p, t);
}

void main(){
  float aspect = uRes.x / uRes.y;
  vec2 p = (vUv - 0.5);
  // frame the scene in a unit square: wider frames show more width, taller frames show more height
  if (aspect >= 1.0) p.x *= aspect; else p.y /= aspect;
  p *= 0.92;
  vec3 c = sceneById(uScene, p, uTime);
  if (uMix < 1.0) c = mix(sceneById(uPrev, p, uTime), c, uMix);
  c = clamp(c, 0.0, 1.0);
  c += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
  gl_FragColor = vec4(c, 1.0);
}
`;
