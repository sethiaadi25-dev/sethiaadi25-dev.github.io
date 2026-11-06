import { SITE, HERO_SCENES, PROJECTS } from "./projects.js";

const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);
const CAT = { "3d": "3D & Animation", game: "Game Design", environment: "Environment / Set" };

/* =====================================================================
   HERO — "hover to render"
   Outside the lens: a viewport look (real blockout if provided, else a
   generated solid + edge view). Inside: the final render, resolving in
   noisy tiles at the rim like a path tracer.
   ===================================================================== */
const canvas = $("#render");
const hero = $(".hero");
const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });

const VERT = `attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uFinA, uClayA, uFinB, uClayB;
uniform float uHasClayA, uHasClayB, uAspA, uAspB, uMix, uTime, uRadius;
uniform vec2 uRes, uMouse, uPar;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }

vec2 cover(vec2 uv, float imgAsp){
  float sAsp = uRes.x / uRes.y;
  vec2 s = sAsp > imgAsp ? vec2(1.0, imgAsp / sAsp) : vec2(sAsp / imgAsp, 1.0);
  return (uv - 0.5) * s / 1.06 + 0.5 + uPar * 0.018;
}

vec3 viewport(sampler2D fin, sampler2D clay, float hasClay, vec2 uv){
  vec3 c;
  vec2 px = 1.4 / uRes;
  if (hasClay > 0.5) {
    c = texture2D(clay, uv).rgb * 0.95;
  } else {
    float tl = lum(texture2D(fin, uv + px * vec2(-1.,  1.)).rgb);
    float t  = lum(texture2D(fin, uv + px * vec2( 0.,  1.)).rgb);
    float tr = lum(texture2D(fin, uv + px * vec2( 1.,  1.)).rgb);
    float l  = lum(texture2D(fin, uv + px * vec2(-1.,  0.)).rgb);
    float r  = lum(texture2D(fin, uv + px * vec2( 1.,  0.)).rgb);
    float bl = lum(texture2D(fin, uv + px * vec2(-1., -1.)).rgb);
    float b  = lum(texture2D(fin, uv + px * vec2( 0., -1.)).rgb);
    float br = lum(texture2D(fin, uv + px * vec2( 1., -1.)).rgb);
    float gx = -tl - 2.0 * l - bl + tr + 2.0 * r + br;
    float gy = -bl - 2.0 * b - br + tl + 2.0 * t + tr;
    float e = length(vec2(gx, gy));
    float L = lum(texture2D(fin, uv).rgb);
    c = vec3(0.10 + pow(L, 0.8) * 0.42);
    c = mix(c, vec3(0.37, 0.95, 0.90), smoothstep(0.12, 0.55, e) * 0.9);
  }
  // viewport grid
  vec2 g = abs(fract(vUv * vec2(uRes.x / uRes.y, 1.0) * 12.0) - 0.5);
  c += smoothstep(0.485, 0.5, max(g.x, g.y)) * 0.05;
  return c;
}

vec3 finalCol(sampler2D fin, vec2 uv, float ca){
  vec2 dir = normalize(vUv - uMouse + 1e-5) * ca;
  return vec3(texture2D(fin, uv + dir).r, texture2D(fin, uv).g, texture2D(fin, uv - dir).b);
}

vec3 scene(sampler2D fin, sampler2D clay, float hasClay, float asp){
  vec2 uv = cover(vUv, asp);
  float aspect = uRes.x / uRes.y;
  float d = length((vUv - uMouse) * vec2(aspect, 1.0));
  float r = uRadius;
  float inner = r * 0.7;
  float rim = clamp((d - inner) / max(r - inner, 1e-4), 0.0, 1.0);

  vec3 vp = viewport(fin, clay, hasClay, uv);
  vec3 fc = finalCol(fin, uv, smoothstep(inner, r, d) * 0.006);

  // path-tracer style resolve: tiles near the rim are still "sampling"
  vec2 tile = floor(vUv * uRes / 16.0);
  float done = step(rim, hash(tile + floor(uTime * 6.0) * 0.13) * 0.9 + 0.05);
  vec3 noisy = fc * (0.4 + 1.4 * hash(vUv * uRes + uTime));
  vec3 inside = mix(noisy, fc, done);
  inside = mix(inside, fc, 1.0 - smoothstep(0.0, 0.25, rim));

  float m = 1.0 - smoothstep(r - 0.002, r + 0.002, d);
  vec3 col = mix(vp, inside, m);
  col += vec3(1.0, 0.18, 0.25) * smoothstep(0.0025, 0.0, abs(d - r)) * 0.9;
  return col;
}

void main(){
  vec3 a = scene(uFinA, uClayA, uHasClayA, uAspA);
  vec3 b = scene(uFinB, uClayB, uHasClayB, uAspB);
  float band = floor(vUv.y * 28.0);
  float th = hash(vec2(band, 3.0)) * 0.55 + vUv.x * 0.45;
  float show = step(th, uMix * 1.05);
  float edge = (1.0 - abs(uMix * 2.0 - 1.0));
  vec3 col = mix(a, b, show);
  col += edge * step(abs(th - uMix), 0.03) * vec3(1.0, 0.18, 0.25);
  // vignette + grain
  col *= 1.0 - smoothstep(0.55, 1.15, length((vUv - 0.5) * vec2(1.25, 1.0)));
  col += (hash(vUv * uRes + fract(uTime) * 91.0) - 0.5) * 0.05;
  gl_FragColor = vec4(col, 1.0);
}`;

let prog, U = {};
const scenes = HERO_SCENES.map((s) => ({ ...s, fin: null, clayTex: null, asp: 16 / 9 }));

function compile(type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}
function texFrom(img) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}
const loadImg = (src) =>
  new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });

// Boot / loading
const bootTotal = scenes.reduce((n, s) => n + (s.clay ? 2 : 1), 0);
let bootCount = 0;
$("#boot-total").textContent = bootTotal;
const tickBoot = () => {
  bootCount++;
  $("#boot-count").textContent = bootCount;
  $(".boot-bar i").style.width = `${(bootCount / bootTotal) * 100}%`;
};
const finishBoot = () => setTimeout(() => $("#boot").classList.add("done"), 250);

// State
const st = {
  cur: 0, prev: 0, mix: 1,
  mouse: { x: 0.62, y: 0.55 }, target: { x: 0.62, y: 0.55 },
  radius: 0, radiusTarget: fine ? 0.24 : 0.3,
  holding: false, lastInput: -1e9, samples: 0,
};

function setScene(i) {
  if (!scenes.length) return;
  i = (i + scenes.length) % scenes.length;
  if (i === st.cur && st.mix >= 1) return;
  st.prev = st.cur;
  st.cur = i;
  st.mix = reduce ? 1 : 0;
  st.samples = 0;
  sceneLabels(i);
}
function sceneLabels(i) {
  const s = scenes[i];
  $("#scene-num").textContent = String(i + 1).padStart(2, "0");
  $("#scene-title").textContent = s.title;
  $("#scene-sub").textContent = s.sub;
}
$("#scene-total").textContent = String(scenes.length).padStart(2, "0");

async function initGL() {
  if (!gl) throw new Error("no webgl");
  prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  for (const n of ["uFinA", "uClayA", "uFinB", "uClayB", "uHasClayA", "uHasClayB", "uAspA", "uAspB", "uMix", "uTime", "uRadius", "uRes", "uMouse", "uPar"])
    U[n] = gl.getUniformLocation(prog, n);
  [["uFinA", 0], ["uClayA", 1], ["uFinB", 2], ["uClayB", 3]].forEach(([n, u]) => gl.uniform1i(U[n], u));

  // first scene first, so the hero appears fast; the rest stream in
  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    const img = await loadImg(s.final);
    s.fin = texFrom(img);
    s.asp = img.width / img.height;
    tickBoot();
    if (s.clay) {
      s.clayTex = texFrom(await loadImg(s.clay));
      tickBoot();
    }
    if (i === 0) {
      sceneLabels(0);
      finishBoot();
      requestAnimationFrame(frame);
    }
  }
}

function resize() {
  const dpr = Math.min(devicePixelRatio, 1.75);
  canvas.width = Math.round(hero.clientWidth * dpr);
  canvas.height = Math.round(hero.clientHeight * dpr);
  gl && gl.viewport(0, 0, canvas.width, canvas.height);
}
addEventListener("resize", resize);

let heroVisible = true;
new IntersectionObserver(([e]) => (heroVisible = e.isIntersecting)).observe(hero);
let last = performance.now();
const t0 = performance.now();

function bind(unit, tex) {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
}

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  const t = (now - t0) / 1000;
  if (!heroVisible) return;

  const idle = now - st.lastInput > 2500;
  if (idle) {
    st.target.x = 0.5 + Math.sin(t * 0.37) * 0.28;
    st.target.y = 0.5 + Math.sin(t * 0.53 + 1.2) * 0.2;
  }
  // auto-advance scenes when nobody is interacting
  if (now - st.lastInput > 9000 && t % 9 < dt && st.mix >= 1) setScene(st.cur + 1);

  const k = 1 - Math.pow(0.0008, dt);
  st.mouse.x += (st.target.x - st.mouse.x) * k;
  st.mouse.y += (st.target.y - st.mouse.y) * k;
  const full = Math.hypot(canvas.width / canvas.height, 1) + 0.1;
  const rT = st.holding ? full : st.radiusTarget;
  st.radius += (rT - st.radius) * (1 - Math.pow(st.holding ? 0.02 : 0.004, dt));
  if (st.mix < 1) st.mix = Math.min(1, st.mix + dt * 1.25);
  st.samples = Math.min(4096, st.samples + dt * 600);

  const A = scenes[st.prev], B = scenes[st.cur];
  bind(0, A.fin); bind(1, A.clayTex || A.fin); bind(2, B.fin); bind(3, B.clayTex || B.fin);
  gl.uniform1f(U.uHasClayA, A.clayTex ? 1 : 0);
  gl.uniform1f(U.uHasClayB, B.clayTex ? 1 : 0);
  gl.uniform1f(U.uAspA, A.asp);
  gl.uniform1f(U.uAspB, B.asp);
  gl.uniform1f(U.uMix, st.mix);
  gl.uniform1f(U.uTime, t);
  gl.uniform1f(U.uRadius, st.radius);
  gl.uniform2f(U.uRes, canvas.width, canvas.height);
  gl.uniform2f(U.uMouse, st.mouse.x, st.mouse.y);
  gl.uniform2f(U.uPar, st.mouse.x - 0.5, st.mouse.y - 0.5);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  // HUD
  const asp = canvas.width / canvas.height;
  const pct = Math.min(1, (Math.PI * st.radius * st.radius) / asp);
  $("#pct").textContent = `${Math.round(pct * 100)}%`;
  $("#meter").style.width = `${pct * 100}%`;
  $("#samples").textContent = Math.floor(st.samples);
  const modeEl = $("#mode");
  const fullNow = pct > 0.97;
  modeEl.textContent = fullNow ? "RENDERED" : "SOLID";
  modeEl.classList.toggle("final", fullNow);
  const fr = Math.floor(t * 24);
  const pad = (n) => String(n).padStart(2, "0");
  $("#tc").textContent = `${pad(Math.floor(t / 3600))}:${pad(Math.floor(t / 60) % 60)}:${pad(Math.floor(t) % 60)}:${pad(fr % 24)}`;
}

// Input
let downAt = 0, downPos = null, holdTimer = null;
function toUv(e) {
  const r = hero.getBoundingClientRect();
  return { x: (e.clientX - r.left) / r.width, y: 1 - (e.clientY - r.top) / r.height };
}
hero.addEventListener("pointermove", (e) => {
  if (e.pointerType !== "mouse" && !downPos) return;
  st.target = toUv(e);
  st.lastInput = performance.now();
});
hero.addEventListener("pointerdown", (e) => {
  if (e.target.closest("button, a")) return;
  downAt = performance.now();
  downPos = { x: e.clientX, y: e.clientY };
  st.target = toUv(e);
  st.lastInput = downAt;
  holdTimer = setTimeout(() => (st.holding = true), 260);
});
addEventListener("pointerup", (e) => {
  if (!downPos) return;
  clearTimeout(holdTimer);
  const quick = performance.now() - downAt < 260 && Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) < 8;
  if (quick && !st.holding) setScene(st.cur + 1);
  st.holding = false;
  downPos = null;
});
$("#next").onclick = () => { st.lastInput = performance.now(); setScene(st.cur + 1); };
$("#prev").onclick = () => { st.lastInput = performance.now(); setScene(st.cur - 1); };
addEventListener("keydown", (e) => {
  if (!heroVisible || $("#case").classList.contains("open")) return;
  if (e.key === "ArrowRight") setScene(st.cur + 1);
  if (e.key === "ArrowLeft") setScene(st.cur - 1);
});
if (fine) $("#hint").textContent = "MOVE TO RENDER · HOLD TO RENDER ALL · CLICK FOR NEXT SCENE";
else $("#hint").textContent = "DRAG TO RENDER · TAP FOR NEXT SCENE";

resize();
initGL().catch((err) => {
  console.warn("WebGL hero unavailable, using a still image.", err);
  hero.style.background = `#000 url(${HERO_SCENES[0].final}) center/cover`;
  canvas.remove();
  $(".hud-side").remove();
  sceneLabels(0);
  finishBoot();
});

/* =====================================================================
   PAGE
   ===================================================================== */
// Ticker
const tickerHTML = `<span>3D Animation <i>アニメ</i> Game Design <i>ゲーム</i> Environment &amp; Set <i>美術</i> </span>`;
$(".ticker-track").innerHTML = tickerHTML.repeat(4);

// Nav background after the hero
const nav = $(".nav");
new IntersectionObserver(([e]) => nav.classList.toggle("solid", !e.isIntersecting), { threshold: 0.08 }).observe(hero);

// Index
const list = $("#index");
PROJECTS.forEach((p, i) => {
  const li = document.createElement("li");
  li.className = "row rv";
  li.dataset.cat = p.category;
  li.style.transitionDelay = `${(i % 6) * 0.05}s`;
  li.innerHTML = `<button data-big>
    <img class="thumb" alt="" loading="lazy" />
    <span class="n"></span><h3></h3><span class="meta cat"></span><span class="meta tools"></span><span class="meta yr"></span>
  </button>`;
  li.querySelector(".thumb").src = p.cover;
  li.querySelector(".n").textContent = String(i + 1).padStart(2, "0");
  li.querySelector("h3").textContent = p.title;
  li.querySelector(".cat").textContent = CAT[p.category];
  li.querySelector(".tools").textContent = p.tools.join(" · ");
  li.querySelector(".yr").textContent = p.year;
  li.querySelector("button").onclick = () => (location.hash = `p/${p.id}`);
  li.addEventListener("pointerenter", () => showPeek(p.cover));
  list.appendChild(li);
});
["all", "3d", "game", "environment"].forEach((c) => {
  $(`#c-${c}`).textContent = c === "all" ? PROJECTS.length : PROJECTS.filter((p) => p.category === c).length;
});
document.querySelectorAll(".filters button").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll(".filters button").forEach((x) => x.classList.toggle("on", x === b));
    list.querySelectorAll(".row").forEach((r) => {
      r.classList.toggle("hidden", b.dataset.f !== "all" && r.dataset.cat !== b.dataset.f);
      r.classList.add("in");
    });
  })
);

// Hover peek image that trails the cursor
const peek = $("#peek"), peekImg = peek.querySelector("img");
const pk = { x: 0, y: 0, tx: 0, ty: 0 };
function showPeek(src) {
  if (!fine) return;
  if (!peekImg.src.endsWith(src)) peekImg.src = src;
  peek.classList.add("on");
}
list.addEventListener("pointerleave", () => peek.classList.remove("on"));

// Case study
const caseEl = $("#case");
function mediaEl(src, opts = {}) {
  if (/youtube\.com|youtu\.be/.test(src)) {
    const id = src.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/)?.[1];
    const f = document.createElement("iframe");
    f.src = `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&rel=0`;
    f.allow = "autoplay; fullscreen; encrypted-media";
    return f;
  }
  if (/vimeo\.com/.test(src)) {
    const f = document.createElement("iframe");
    f.src = `https://player.vimeo.com/video/${src.match(/vimeo\.com\/(\d+)/)?.[1]}?autoplay=1&muted=1`;
    f.allow = "autoplay; fullscreen";
    return f;
  }
  if (/\.(mp4|webm|mov)$/i.test(src)) {
    const v = document.createElement("video");
    Object.assign(v, { src, muted: true, loop: true, autoplay: true, playsInline: true, controls: !!opts.controls });
    return v;
  }
  const img = document.createElement("img");
  img.src = src;
  img.loading = "lazy";
  img.alt = "";
  if (/\.png$/i.test(src)) img.className = "contain";
  return img;
}
function openCase(id) {
  const i = PROJECTS.findIndex((p) => p.id === id);
  if (i < 0) return closeCase();
  const p = PROJECTS[i];
  const media = $("#case-media");
  media.replaceChildren(mediaEl(p.video || p.cover, { controls: !!p.video }));
  $("#case-kicker").textContent = `${CAT[p.category]} · ${p.year}`;
  $("#case-title").textContent = p.title;
  $("#case-desc").textContent = p.description;
  const facts = $("#case-facts");
  facts.replaceChildren(
    ...(p.facts || []).map(([k, v]) => {
      const d = document.createElement("div");
      d.innerHTML = "<dt></dt><dd></dd>";
      d.firstChild.textContent = k;
      d.lastChild.textContent = v;
      return d;
    })
  );
  $("#case-tools").replaceChildren(...p.tools.map((t) => Object.assign(document.createElement("li"), { textContent: t })));
  const gal = $("#case-gallery");
  const items = p.video ? [p.cover, ...p.gallery] : p.gallery;
  gal.replaceChildren(...items.map((s) => mediaEl(s)));
  const nxt = PROJECTS[(i + 1) % PROJECTS.length];
  const nb = $("#case-next");
  nb.querySelector("b").textContent = nxt.title;
  nb.onclick = () => (location.hash = `p/${nxt.id}`);
  caseEl.classList.add("open");
  caseEl.setAttribute("aria-hidden", "false");
  caseEl.querySelector(".case-scroll").scrollTop = 0;
  document.body.style.overflow = "hidden";
  peek.classList.remove("on");
}
function closeCase() {
  if (!caseEl.classList.contains("open")) return;
  caseEl.classList.remove("open");
  caseEl.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  setTimeout(() => {
    if (!caseEl.classList.contains("open")) {
      $("#case-media").replaceChildren();
      $("#case-gallery").replaceChildren();
    }
  }, 800);
}
function route() {
  const m = location.hash.match(/^#p\/(.+)$/);
  if (m) openCase(m[1]);
  else closeCase();
}
addEventListener("hashchange", route);
$(".case-close").onclick = () => history.length > 1 && location.hash.startsWith("#p/") ? history.back() : (location.hash = "work");
addEventListener("keydown", (e) => e.key === "Escape" && caseEl.classList.contains("open") && $(".case-close").click());
document.querySelectorAll("[data-open]").forEach((b) => (b.onclick = () => (location.hash = `p/${b.dataset.open}`)));
route();

// About
const aboutEl = $("#about-text");
aboutEl.replaceChildren(
  ...SITE.about.split(" ").flatMap((w, i) => [i ? " " : "", Object.assign(document.createElement("span"), { className: "w", textContent: w })])
);
const words = [...aboutEl.querySelectorAll(".w")];
$("#tools").replaceChildren(...SITE.tools.map((t) => Object.assign(document.createElement("li"), { textContent: t })));
function onScroll() {
  const r = aboutEl.getBoundingClientRect();
  const prog = Math.max(0, Math.min(1, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
  const n = Math.round(prog * words.length);
  words.forEach((w, i) => w.classList.toggle("lit", i < n));
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Contact
const mail = $("#mail");
mail.textContent = SITE.email;
mail.href = `mailto:${SITE.email}`;
$("#links").replaceChildren(
  ...SITE.links.filter(([, u]) => u).map(([n, u]) => Object.assign(document.createElement("a"), { textContent: `${n} ↗`, href: u, target: "_blank", rel: "noopener" }))
);
$("#year").textContent = new Date().getFullYear();

// Reveal on scroll
document.querySelectorAll(".sec-head, .about-grid, .feature-copy, .contact-inner").forEach((el) => el.classList.add("rv"));
const ro = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), ro.unobserve(e.target))), { threshold: 0.12 });
document.querySelectorAll(".rv").forEach((el) => ro.observe(el));

// Feature video only plays while visible
const fv = $("#feature video");
new IntersectionObserver(([e]) => (e.isIntersecting ? fv.play().catch(() => {}) : fv.pause()), { threshold: 0.2 }).observe(fv);

// Cursor
const cursor = $("#cursor");
const cur = { x: -100, y: -100, tx: -100, ty: -100 };
addEventListener("pointermove", (e) => {
  cur.tx = e.clientX;
  cur.ty = e.clientY;
  pk.tx = e.clientX;
  pk.ty = e.clientY;
  const t = e.target;
  cursor.classList.toggle("big", !!t.closest?.("a, button"));
  cursor.classList.toggle("hide", !!t.closest?.(".hero") && !t.closest("a, button"));
});
(function loop() {
  cur.x += (cur.tx - cur.x) * 0.3;
  cur.y += (cur.ty - cur.y) * 0.3;
  cursor.style.transform = `translate(${cur.x}px, ${cur.y}px)`;
  pk.x += (pk.tx - pk.x) * 0.12;
  pk.y += (pk.ty - pk.y) * 0.12;
  peek.style.left = `${pk.x}px`;
  peek.style.top = `${pk.y}px`;
  requestAnimationFrame(loop);
})();
