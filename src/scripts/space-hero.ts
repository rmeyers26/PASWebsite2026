// Type-only import: erased at build, so it costs nothing at runtime.
import type * as T from 'three';
import { prefersReducedMotion as getPrefersReducedMotion } from './utils/motion';

// Torn down and re-created across view transitions, which swap the DOM without
// a document load, so a module-scope init would only ever run once.
let teardown: (() => void) | null = null;
let pendingStart: number | undefined;

function boot() {
  teardown?.();
  teardown = null;

  const section = document.getElementById('space-hero');
  const existingCanvas = document.getElementById('space-hero-canvas') as HTMLCanvasElement | null;
  if (!section || !existingCanvas) return;

  // Astro's view-transition swap morphs unchanged elements in place rather
  // than replacing them, so this exact <canvas> node — and its WebGL
  // context — survives across navigations even though it isn't marked
  // transition:persist. A disposed WebGLRenderer can leave global GL state
  // set on that context (three.js sets UNPACK_FLIP_Y_WEBGL for CanvasTexture
  // uploads and never resets it), which a new WebGLRenderer on the same
  // context then inherits, breaking its placeholder 3D/array texture setup
  // (Chrome logs "texImage3D: FLIP_Y or PREMULTIPLY_ALPHA isn't allowed for
  // uploading 3D textures"). Cloning the node guarantees a pristine context.
  const canvas = existingCanvas.cloneNode(false) as HTMLCanvasElement;
  existingCanvas.replaceWith(canvas);

  // three.js is ~124KB gzipped and cannot be meaningfully tree-shaken —
  // WebGLRenderer alone pulls in most of the library. The hero has a CSS
  // gradient fallback painted underneath, so the scene is deferred until the
  // browser is idle rather than competing with LCP for bandwidth.
  const start = () => void renderScene(section, canvas);
  if ('requestIdleCallback' in window) {
    pendingStart = requestIdleCallback(start, { timeout: 2500 });
  } else {
    pendingStart = setTimeout(start, 300) as unknown as number;
  }
}

function cancelPendingStart() {
  if (pendingStart === undefined) return;
  if (typeof cancelIdleCallback === 'function') cancelIdleCallback(pendingStart);
  else clearTimeout(pendingStart);
  pendingStart = undefined;
}

export function initSpaceHero(): void {
  boot();
  // Fires on every view-transition navigation (and again on a full load, which
  // is why boot() tears down anything already running before re-initialising).
  document.addEventListener('astro:page-load', boot);
  document.addEventListener('astro:before-swap', () => {
    cancelPendingStart();
    teardown?.();
    teardown = null;
  });
}

async function renderScene(section: HTMLElement, canvas: HTMLCanvasElement) {
  const prefersReducedMotion = getPrefersReducedMotion();

  const {
    AdditiveBlending,
    AmbientLight,
    BufferAttribute,
    BufferGeometry,
    CanvasTexture,
    Clock,
    Color,
    DirectionalLight,
    DoubleSide,
    Group,
    Line,
    LineBasicMaterial,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    PerspectiveCamera,
    Points,
    PointsMaterial,
    RingGeometry,
    Scene,
    ShaderMaterial,
    SphereGeometry,
    Sprite,
    SpriteMaterial,
    Vector3,
    WebGLRenderer,
  } = await import('three');

  let renderer: T.WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
  } catch {
    return; // No WebGL — the CSS gradient fallback behind the canvas stands on its own.
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new Scene();
  const camera = new PerspectiveCamera(50, 1, 0.1, 300);
  camera.position.set(0, 0, 20);

  // Assigned once the scene objects exist. Every hero body is placed from the
  // camera frustum rather than hard-coded world coordinates, so the whole
  // composition recomposes for portrait instead of falling off the edges.
  let layoutScene: (() => void) | null = null;

  function setSize() {
    const width = section.clientWidth;
    const height = section.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
    layoutScene?.();
  }
  setSize();

  // --- Lighting: a single warm "sun" plus soft ambient fill, so lit faces read as 3D ---
  const sunLight = new DirectionalLight(0xfff2d9, 1.6);
  sunLight.position.set(-10, 5, 12);
  scene.add(sunLight);
  scene.add(new AmbientLight(0x30345a, 1.1));

  // --- Procedural textures (no network assets) ---
  function makeSaturnTexture() {
    const size = 512;
    const el = document.createElement('canvas');
    el.width = size;
    el.height = size;
    const ctx = el.getContext('2d')!;
    const bands = [
      '#e8d9b5',
      '#dfc9a0',
      '#e3d3ab',
      '#cbb182',
      '#e6d8b8',
      '#d4bd90',
      '#ecdfc0',
      '#d8c497',
    ];
    const bandHeight = size / bands.length;
    bands.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(0, i * bandHeight, size, bandHeight + 1);
    });
    const imageData = ctx.getImageData(0, 0, size, size);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 12;
      imageData.data[i] += n;
      imageData.data[i + 1] += n;
      imageData.data[i + 2] += n;
    }
    ctx.putImageData(imageData, 0, 0);
    return new CanvasTexture(el);
  }

  function makeRingTexture() {
    const size = 512;
    const el = document.createElement('canvas');
    el.width = size;
    el.height = 1;
    const ctx = el.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, size, 0);
    gradient.addColorStop(0.0, 'rgba(232,217,181,0)');
    gradient.addColorStop(0.12, 'rgba(232,217,181,0.5)');
    gradient.addColorStop(0.22, 'rgba(196,176,136,0.12)');
    gradient.addColorStop(0.34, 'rgba(232,217,181,0.6)');
    gradient.addColorStop(0.5, 'rgba(210,195,160,0.3)');
    gradient.addColorStop(0.68, 'rgba(232,217,181,0.65)');
    gradient.addColorStop(0.82, 'rgba(196,176,136,0.15)');
    gradient.addColorStop(1.0, 'rgba(232,217,181,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, 1);
    return new CanvasTexture(el);
  }

  function makeMoonTexture() {
    const size = 512;
    const el = document.createElement('canvas');
    el.width = size;
    el.height = size;
    const ctx = el.getContext('2d')!;
    ctx.fillStyle = '#c9c9d1';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = `rgba(118,118,132,${0.15 + Math.random() * 0.15})`;
      ctx.beginPath();
      ctx.ellipse(
        Math.random() * size,
        Math.random() * size,
        40 + Math.random() * 70,
        30 + Math.random() * 50,
        Math.random() * Math.PI,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 2 + Math.random() * 13;
      const grd = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
      grd.addColorStop(0, 'rgba(255,255,255,0.28)');
      grd.addColorStop(0.5, 'rgba(85,85,96,0.35)');
      grd.addColorStop(1, 'rgba(85,85,96,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    return new CanvasTexture(el);
  }

  function makeNebulaTexture(color: string) {
    const size = 256;
    const el = document.createElement('canvas');
    el.width = size;
    el.height = size;
    const ctx = el.getContext('2d')!;
    const grd = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grd.addColorStop(0, `${color}99`);
    grd.addColorStop(0.5, `${color}33`);
    grd.addColorStop(1, `${color}00`);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, size, size);
    return new CanvasTexture(el);
  }

  // --- Starfield: two layers at different radii/speeds for a parallax depth cue.
  // Each star twinkles on its own time-driven phase (a GPU shader, not a hover/mouse
  // effect), so it plays identically on touch devices with no pointer at all.
  const starTwinkleMaterials: T.ShaderMaterial[] = [];
  function makeStarfield(count: number, radius: number, size: number, opacity: number) {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = radius * (0.55 + Math.random() * 0.45);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi) - radius * 0.3;
      sizes[i] = size * (0.6 + Math.random() * 0.8);
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.6 + Math.random() * 1.8;
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new BufferAttribute(sizes, 1));
    geometry.setAttribute('aPhase', new BufferAttribute(phases, 1));
    geometry.setAttribute('aSpeed', new BufferAttribute(speeds, 1));

    const material = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color(0xf1f3f8) },
        uOpacity: { value: opacity },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      vertexShader: `
        attribute float aSize;
        attribute float aPhase;
        attribute float aSpeed;
        uniform float uTime;
        uniform float uPixelRatio;
        varying float vTwinkle;
        void main() {
          vTwinkle = 0.45 + 0.55 * sin(uTime * aSpeed + aPhase);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          // Attenuation constant kept low so distant stars stay point-like; a
          // large value here renders them as soft bokeh discs rather than stars.
          gl_PointSize = max(1.0, aSize * uPixelRatio * (90.0 / -mvPosition.z));
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        varying float vTwinkle;
        void main() {
          // A tight core with a fast falloff reads as a star; a linear ramp
          // across the whole point reads as a blurred disc.
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float alpha = pow(smoothstep(1.0, 0.0, d), 2.5);
          gl_FragColor = vec4(uColor, alpha * uOpacity * vTwinkle);
        }
      `,
    });
    starTwinkleMaterials.push(material);
    return new Points(geometry, material);
  }
  const starsFar = makeStarfield(1400, 110, 0.9, 0.7);
  const starsNear = makeStarfield(500, 70, 1.5, 0.9);
  scene.add(starsFar, starsNear);

  // --- Nebula clouds: soft additive sprites drifting slowly in the background ---
  const nebulaGroup = new Group();
  const nebulaSpecs: [string, [number, number, number], number][] = [
    ['#8b5cf6', [10, 4, -55], 42],
    ['#2dd4bf', [-14, -3, -60], 38],
    ['#f5b942', [2, -8, -70], 30],
  ];
  for (const [color, [x, y, z], scale] of nebulaSpecs) {
    const material = new SpriteMaterial({
      map: makeNebulaTexture(color),
      transparent: true,
      opacity: 0.45,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const sprite = new Sprite(material);
    sprite.position.set(x, y, z);
    sprite.scale.set(scale, scale, 1);
    nebulaGroup.add(sprite);
  }
  scene.add(nebulaGroup);

  // --- The Andromeda Galaxy (M31): a tightly-wound two-armed spiral with a warm, bright
  // core and a cool blue-white disk, seen at Andromeda's real steeply-inclined angle
  // (~77° from face-on), plus its two brightest satellite galaxies, M32 and M110.
  function makeAndromeda() {
    const count = 6000;
    const radius = 13;
    const branches = 2;
    const spin = 2.4;
    const randomness = 0.4;
    const randomnessPower = 3;
    const colorCore = new Color('#fff3d6'); // warm golden-white nucleus
    const colorMid = new Color('#dbe4ff'); // pale blue-white disk
    const colorOutside = new Color('#8fa8e8'); // cooler blue outer arms

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = Math.pow(Math.random(), 1.5) * radius;
      const spinAngle = r * spin;
      const branchAngle = ((i % branches) / branches) * Math.PI * 2;
      const rand = () =>
        Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;

      positions[i3] = Math.cos(branchAngle + spinAngle) * r + rand();
      positions[i3 + 1] = rand() * 0.12; // a thin disk, flattened further by the tilt below
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + rand();

      const mixed =
        r < radius * 0.35
          ? colorMid.clone().lerp(colorCore, 1 - r / (radius * 0.35))
          : colorMid.clone().lerp(colorOutside, (r - radius * 0.35) / (radius * 0.65));
      colors[i3] = mixed.r;
      colors[i3 + 1] = mixed.g;
      colors[i3 + 2] = mixed.b;
      sizes[i] = r < radius * 0.2 ? 0.22 : 0.14;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));
    geometry.setAttribute('size', new BufferAttribute(sizes, 1));
    const material = new PointsMaterial({
      size: 0.16,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    return new Points(geometry, material);
  }
  // Andromeda and its companions ride in a group so the whole system can be
  // re-placed as one when the viewport changes.
  const GALAXY_DEPTH = -30;
  const galaxyGroup = new Group();
  scene.add(galaxyGroup);

  const galaxy = makeAndromeda();
  galaxy.rotation.x = 1.35; // Andromeda's steep, near-edge-on real-world inclination
  galaxy.rotation.z = 0.3;
  galaxy.scale.setScalar(1.8);
  galaxyGroup.add(galaxy);

  // A soft glowing core sprite sells Andromeda's bright, star-like nucleus at a distance.
  const galaxyCoreGlow = new Sprite(
    new SpriteMaterial({
      map: makeNebulaTexture('#fff3d6'),
      transparent: true,
      opacity: 0.8,
      blending: AdditiveBlending,
      depthWrite: false,
    })
  );
  galaxyCoreGlow.scale.setScalar(6.5);
  galaxyGroup.add(galaxyCoreGlow);

  // M32 and M110 — Andromeda's two brightest satellite galaxies, as small soft
  // smudges, offset relative to the galaxy rather than in world space.
  const satelliteSpecs: [string, [number, number, number], number][] = [
    ['#e9e2c9', [3, 1.8, 1], 3],
    ['#c9d4e9', [-4.5, -1.5, -2], 3.8],
  ];
  for (const [color, [x, y, z], scale] of satelliteSpecs) {
    const satellite = new Sprite(
      new SpriteMaterial({
        map: makeNebulaTexture(color),
        transparent: true,
        opacity: 0.55,
        blending: AdditiveBlending,
        depthWrite: false,
      })
    );
    satellite.position.set(x, y, z);
    satellite.scale.setScalar(scale);
    galaxyGroup.add(satellite);
  }

  // Placed further down, once Saturn and the moon exist too.

  // --- Saturn: sphere + a UV-remapped ring so the radial gradient texture maps correctly ---
  const SATURN_DEPTH = 2;
  const saturnGroup = new Group();
  saturnGroup.rotation.z = 0.46; // axial tilt

  // Limb darkening: a real gas giant dims toward its edge because the line of
  // sight there passes obliquely through more atmosphere. Without it, flat
  // banding reads as a beach ball. Approximated the usual way, by falling off
  // with the view angle (N·V) and applied to the lit colour.
  const saturnMaterial = new MeshStandardMaterial({
    map: makeSaturnTexture(),
    roughness: 0.9,
    metalness: 0,
  });
  saturnMaterial.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         varying vec3 vViewPosition_ld;`
      )
      .replace(
        '#include <dithering_fragment>',
        `#include <dithering_fragment>
         float ndv = clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0);
         gl_FragColor.rgb *= mix(0.35, 1.0, pow(ndv, 0.55));`
      );
  };

  const saturnMesh = new Mesh(new SphereGeometry(2.1, 48, 48), saturnMaterial);
  saturnGroup.add(saturnMesh);

  function makeRingGeometry(innerRadius: number, outerRadius: number) {
    const geometry = new RingGeometry(innerRadius, outerRadius, 128, 1);
    const pos = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    const v3 = new Vector3();
    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      const u = (v3.length() - innerRadius) / (outerRadius - innerRadius);
      uv.setXY(i, u, 1);
    }
    return geometry;
  }
  const ringTexture = makeRingTexture();
  const ringMesh = new Mesh(
    makeRingGeometry(2.8, 4.6),
    new MeshBasicMaterial({
      map: ringTexture,
      side: DoubleSide,
      transparent: true,
      opacity: 0.92,
    })
  );
  ringMesh.rotation.x = Math.PI / 2 - 0.35;
  saturnGroup.add(ringMesh);
  scene.add(saturnGroup);

  // --- Moon: cratered sphere with subtle relief via a bump map from the same texture ---
  const MOON_DEPTH = 4;
  const moonTexture = makeMoonTexture();
  const moonMesh = new Mesh(
    new SphereGeometry(0.85, 40, 40),
    new MeshStandardMaterial({
      map: moonTexture,
      bumpMap: moonTexture,
      bumpScale: 0.04,
      roughness: 1,
    })
  );
  scene.add(moonMesh);

  // --- Responsive composition -------------------------------------------------
  // Each body gets a target expressed as a fraction of the visible frustum at
  // its own depth, so the scene recomposes for portrait rather than sliding off
  // the edges. Landscape keeps the original arrangement; portrait pulls
  // everything inward, widens the FOV, and clears the vertical middle where the
  // headline sits (bodies stay beyond |y| > 0.55).
  const BASE_CAMERA_Z = 20;
  const composition = {
    landscape: {
      fov: 50,
      galaxy: { x: -0.62, y: 0.52 },
      saturn: { x: 0.55, y: 0.22, scale: 1 },
      moon: { x: -0.45, y: -0.26, scale: 1 },
    },
    portrait: {
      fov: 64,
      galaxy: { x: -0.45, y: 0.72 },
      saturn: { x: 0.4, y: -0.6, scale: 0.8 },
      moon: { x: -0.46, y: -0.72, scale: 0.75 },
    },
  };

  function frustumAt(depth: number) {
    const distance = BASE_CAMERA_Z - depth;
    const halfHeight = Math.tan((camera.fov * Math.PI) / 360) * distance;
    return { halfHeight, halfWidth: halfHeight * camera.aspect };
  }

  layoutScene = () => {
    const layout = camera.aspect >= 1 ? composition.landscape : composition.portrait;

    // FOV first — every frustum measurement below depends on it.
    camera.fov = layout.fov;
    camera.updateProjectionMatrix();

    const galaxyFrustum = frustumAt(GALAXY_DEPTH);
    galaxyGroup.position.set(
      galaxyFrustum.halfWidth * layout.galaxy.x,
      galaxyFrustum.halfHeight * layout.galaxy.y,
      GALAXY_DEPTH
    );

    const saturnFrustum = frustumAt(SATURN_DEPTH);
    saturnGroup.position.set(
      saturnFrustum.halfWidth * layout.saturn.x,
      saturnFrustum.halfHeight * layout.saturn.y,
      SATURN_DEPTH
    );
    saturnGroup.scale.setScalar(layout.saturn.scale);

    const moonFrustum = frustumAt(MOON_DEPTH);
    moonMesh.position.set(
      moonFrustum.halfWidth * layout.moon.x,
      moonFrustum.halfHeight * layout.moon.y,
      MOON_DEPTH
    );
    moonMesh.scale.setScalar(layout.moon.scale);
  };
  layoutScene();

  // --- Occasional shooting stars ---
  let shootingStarTimer: ReturnType<typeof setTimeout> | undefined;
  function spawnShootingStar() {
    const startX = -30 + Math.random() * 20;
    const startY = 12 + Math.random() * 6;
    const startZ = -20 + Math.random() * 15;
    const length = 3 + Math.random() * 2;
    const dir = new Vector3(1, -0.55, 0).normalize();

    const positions = new Float32Array([
      0,
      0,
      0,
      -dir.x * length,
      -dir.y * length,
      -dir.z * length,
    ]);
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    const material = new LineBasicMaterial({ color: 0xf1f3f8, transparent: true, opacity: 0 });
    const line = new Line(geometry, material);
    const startPos = new Vector3(startX, startY, startZ);
    line.position.copy(startPos);
    scene.add(line);

    const travel = 22;
    const duration = 900 + Math.random() * 400;
    const start = performance.now();

    function step(now: number) {
      const t = Math.min((now - start) / duration, 1);
      line.position.copy(startPos).addScaledVector(dir, travel * t);
      material.opacity = t < 0.15 ? t / 0.15 : t > 0.7 ? Math.max(0, 1 - (t - 0.7) / 0.3) : 1;
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        scene.remove(line);
        geometry.dispose();
        material.dispose();
      }
    }
    requestAnimationFrame(step);

    shootingStarTimer = setTimeout(spawnShootingStar, 4500 + Math.random() * 5500);
  }

  // --- Mouse parallax + scroll dolly ---
  let mouseX = 0;
  let mouseY = 0;
  let smoothedX = 0;
  let smoothedY = 0;
  function onMouseMove(event: MouseEvent) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = (event.clientY / window.innerHeight) * 2 - 1;
  }

  let scrollProgress = 0;
  function onScroll() {
    const rect = section.getBoundingClientRect();
    const total = rect.height + window.innerHeight;
    scrollProgress = Math.min(Math.max(-rect.top / total, 0), 1);
  }

  let visible = true;
  const observer = new IntersectionObserver((entries) => (visible = entries[0].isIntersecting), {
    threshold: 0,
  });
  observer.observe(section);

  let resizeRaf = 0;
  function onResize() {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(setSize);
  }

  const clock = new Clock();
  let rafId = 0;
  // Reduced motion still gets a gentle, ambient animation (slow rotation + twinkle) —
  // WCAG asks to avoid large/vestibular-triggering motion, not to freeze entirely. What's
  // cut under reduced motion is anything driven by user input: mouse parallax, scroll
  // dolly, and the (larger, sudden) shooting stars.
  const motionScale = prefersReducedMotion ? 0.3 : 1;

  function tick() {
    rafId = requestAnimationFrame(tick);
    if (!visible) return;

    const elapsed = clock.getElapsedTime() * motionScale;
    for (const material of starTwinkleMaterials) material.uniforms.uTime.value = elapsed;
    saturnMesh.rotation.y = elapsed * 0.08;
    ringTexture.offset.x = elapsed * 0.01; // gentle shimmer
    moonMesh.rotation.y = elapsed * 0.035;
    galaxy.rotation.y = elapsed * 0.015; // keeps the fixed x/z tilt, just turns slowly in-plane
    starsNear.rotation.y = elapsed * 0.006;
    starsFar.rotation.y = -elapsed * 0.003;
    nebulaGroup.children.forEach((sprite, i) => {
      sprite.position.x += Math.sin(elapsed * 0.05 + i) * 0.003;
    });

    if (!prefersReducedMotion) {
      smoothedX += (mouseX - smoothedX) * 0.03;
      smoothedY += (mouseY - smoothedY) * 0.03;
      camera.position.x = smoothedX * 1.4;
      camera.position.y = -smoothedY * 0.9;
      camera.position.z = 20 + scrollProgress * 6;
      camera.lookAt(0, 0, 0);
    }

    renderer.render(scene, camera);
  }

  window.addEventListener('resize', onResize, { passive: true });
  if (!prefersReducedMotion) {
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    shootingStarTimer = setTimeout(spawnShootingStar, 2500 + Math.random() * 3000);
  }

  tick();
  canvas.classList.add('is-ready');

  const dispose = () => {
    cancelAnimationFrame(rafId);
    clearTimeout(shootingStarTimer);
    observer.disconnect();
    window.removeEventListener('resize', onResize);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('scroll', onScroll);
    renderer.dispose();
  };
  teardown = dispose;
  window.addEventListener('pagehide', dispose, { once: true });
}
