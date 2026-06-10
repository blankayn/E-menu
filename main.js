import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ─── GSAP CONTEXT SETUP ───
const mainScope = '#app'
const ctx = gsap.context(() => {}, document.body)

// ─── SCENE ───
const scene = new THREE.Scene()
scene.background = null

const container = document.getElementById('three-canvas')
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 0, 12)

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.3
container.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.enableZoom = false
controls.enablePan = false

// ─── LIGHTING ───
scene.add(new THREE.AmbientLight(0xffffff, 0.6))

const keyLight = new THREE.DirectionalLight(0xffffff, 1.6)
keyLight.position.set(4, 6, 8)
keyLight.castShadow = true
scene.add(keyLight)

const fillLight = new THREE.DirectionalLight(0xccddff, 0.5)
fillLight.position.set(-4, 2, -4)
scene.add(fillLight)

const rimLight = new THREE.PointLight(0xffffff, 0.8, 15)
rimLight.position.set(-6, 4, 6)
scene.add(rimLight)

const hemiLight = new THREE.HemisphereLight(0x1a1a2e, 0x0a0a0a, 0.4)
scene.add(hemiLight)

// ─── SCREEN STATE ───
let screenMode = 'full'
let screenTexture, screenMat
const screenCanvas = document.createElement('canvas')
screenCanvas.width = 1024
screenCanvas.height = 640
const screenCtx = screenCanvas.getContext('2d')

// Load menu image as background
const menuBgImage = new Image()
menuBgImage.src = 'newmenu.png'
menuBgImage.onload = () => {
  drawScreen()
  screenTexture && (screenTexture.needsUpdate = true)
}

function roundRect(x, y, w, h, r) {
  screenCtx.beginPath()
  screenCtx.moveTo(x + r, y)
  screenCtx.lineTo(x + w - r, y)
  screenCtx.quadraticCurveTo(x + w, y, x + w, y + r)
  screenCtx.lineTo(x + w, y + h - r, x + w, y + h)
  screenCtx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  screenCtx.lineTo(x + r, y + h)
  screenCtx.quadraticCurveTo(x, y + h, x, y + h - r)
  screenCtx.lineTo(x, y + r)
  screenCtx.quadraticCurveTo(x, y, x + r, y)
  screenCtx.closePath()
}

function drawMenuItem(x, y, w, h, name, price, bgColor) {
  roundRect(x, y, w, h, 6)
  screenCtx.fillStyle = '#1a1e28'
  screenCtx.fill()
  screenCtx.strokeStyle = 'rgba(255,255,255,0.08)'
  screenCtx.lineWidth = 1
  screenCtx.stroke()
  roundRect(x + 6, y + 6, w - 12, h * 0.55, 4)
  screenCtx.fillStyle = bgColor
  screenCtx.fill()
  screenCtx.font = '600 11px Inter, sans-serif'
  screenCtx.fillStyle = '#ffffff'
  screenCtx.textAlign = 'left'
  screenCtx.fillText(name, x + 8, y + h * 0.68 + 12)
  screenCtx.font = '700 12px Inter, sans-serif'
  screenCtx.fillStyle = '#ffffff'
  screenCtx.fillText('P' + price, x + 8, y + h * 0.68 + 27)
}

let clockInterval

function updateClock() {
  const now = new Date()
  let h = now.getHours()
  const m = String(now.getMinutes()).padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  screenCtx.font = 'bold 120px Inter, sans-serif'
  screenCtx.fillStyle = '#ffffff'
  screenCtx.textAlign = 'center'
  screenCtx.textBaseline = 'middle'
  screenCtx.fillText(`${h}:${m} ${ampm}`, 512, 260)
  screenCtx.font = '300 26px Inter, sans-serif'
  screenCtx.fillStyle = 'rgba(255,255,255,0.4)'
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  screenCtx.fillText(`${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`, 512, 340)
  screenCtx.textBaseline = 'alphabetic'
  screenCtx.font = '300 16px Inter, sans-serif'
  screenCtx.fillStyle = '#ffffff'
  screenCtx.fillText('Tap for menu', 512, 560)
}

function drawScreen() {
  screenCtx.clearRect(0, 0, 1024, 640)

  if (screenMode === 'full') {
    if (menuBgImage.complete && menuBgImage.naturalHeight > 0) {
      screenCtx.drawImage(menuBgImage, 0, 0, 1024, 640)
    } else {
      screenCtx.fillStyle = '#1a1a1a'
      screenCtx.fillRect(0, 0, 1024, 640)
    }
  }

  if (screenMode === 'minimal') {
    const g = screenCtx.createLinearGradient(0, 0, 0, 640)
    g.addColorStop(0, '#0a0a0a')
    g.addColorStop(1, '#111')
    screenCtx.fillStyle = g
    screenCtx.fillRect(0, 0, 1024, 640)
    updateClock()
  }
}

// ─── CLOCK ───
clockInterval = setInterval(() => {
  if (screenMode === 'minimal') {
    drawScreen()
    screenTexture.needsUpdate = true
  }
}, 1000)

// ─── TABLET ───
function createTablet() {
  const g = new THREE.Group()
  const W = 8.44, H = 4.98, D = 0.32

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(W, H, D),
    new THREE.MeshPhysicalMaterial({ color: 0x1a1a1a, metalness: 0.8, roughness: 0.2, clearcoat: 0.6, clearcoatRoughness: 0.1 })
  )
  body.castShadow = true
  g.add(body)

  // Screen
  drawScreen()
  screenTexture = new THREE.CanvasTexture(screenCanvas)
  screenTexture.colorSpace = THREE.SRGBColorSpace
  screenMat = new THREE.MeshPhysicalMaterial({
    map: screenTexture, metalness: 0.05, roughness: 0.02, clearcoat: 1.0, clearcoatRoughness: 0,
    emissive: new THREE.Color(0x39ff14), emissiveMap: screenTexture, emissiveIntensity: 0.12,
  })
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.08, H - 0.08), screenMat)
  screen.position.z = D / 2 + 0.005
  screen.userData.clickable = true
  g.add(screen)

  // Bezel
  const bezel = new THREE.Mesh(
    new THREE.PlaneGeometry(W, H),
    new THREE.MeshPhysicalMaterial({ color: 0x0a0a0a, metalness: 0.9, roughness: 0.15 })
  )
  bezel.position.z = D / 2 + 0.004
  g.add(bezel)

  // Camera
  const cam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16),
    new THREE.MeshPhysicalMaterial({ color: 0x0a0a0a, metalness: 0.9, roughness: 0.05 })
  )
  cam.rotation.x = Math.PI / 2
  cam.position.set(-W / 2 + 0.4, -H / 2 + 0.4, D / 2 + 0.01)
  g.add(cam)

  // Buttons
  const bm = new THREE.MeshPhysicalMaterial({ color: 0x222222, metalness: 0.6, roughness: 0.4 })
  const pb = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.25, 0.04), bm)
  pb.position.set(W / 2 + 0.02, 0.4, 0)
  g.add(pb)
  const v1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.3, 0.04), bm)
  v1.position.set(W / 2 + 0.02, 1.1, 0)
  g.add(v1)
  const v2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.3, 0.04), bm)
  v2.position.set(W / 2 + 0.02, 1.65, 0)
  g.add(v2)

  // Speakers
  const sm = new THREE.MeshPhysicalMaterial({ color: 0x050505, metalness: 0.3, roughness: 0.7 })
  const sg = new THREE.CapsuleGeometry(0.025, 0.12, 4, 8)
  for (let i = 0; i < 4; i++) {
    const s1 = new THREE.Mesh(sg, sm)
    s1.position.set(-W / 3 + i * 0.15, -H / 2 - 0.005, D / 3)
    s1.rotation.y = Math.PI / 2
    g.add(s1)
    const s2 = new THREE.Mesh(sg, sm)
    s2.position.set(W / 3 + i * 0.15, -H / 2 - 0.005, D / 3)
    s2.rotation.y = Math.PI / 2
    g.add(s2)
  }

  // Port
  const port = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.08, 0.08),
    new THREE.MeshPhysicalMaterial({ color: 0x050505 })
  )
  port.position.set(0, -H / 2 - 0.005, 0)
  g.add(port)

  // Samsung logo (back, transparent bg)
  const lc = document.createElement('canvas')
  lc.width = 512
  lc.height = 128
  const lx = lc.getContext('2d')
  lx.clearRect(0, 0, 512, 128)
  lx.font = 'bold 48px Inter, sans-serif'
  lx.fillStyle = '#666'
  lx.textAlign = 'center'
  lx.fillText('SAMSUNG', 256, 80)
  const logo = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 0.6),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lc), transparent: true })
  )
  logo.position.set(0, 0, -D / 2 - 0.001)
  logo.rotation.y = Math.PI
  g.add(logo)

  return g
}

const tablet = createTablet()
tablet.position.set(3.5, 0, -8)
tablet.rotation.y = -Math.PI / 5
tablet.rotation.x = 0.05
tablet.scale.setScalar(0)
scene.add(tablet)

// ─── TABLET ENTRANCE ANIMATION ───
gsap.to(tablet.scale, {
  x: 0.75, y: 0.75, z: 0.75,
  duration: 1.8, ease: 'power3.out', delay: 0.3,
})
gsap.to(tablet.position, {
  z: 0,
  duration: 2, ease: 'power3.out', delay: 0.3,
})

// ─── CLICK ───
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
let clickCD = false

renderer.domElement.addEventListener('click', (e) => {
  const r = renderer.domElement.getBoundingClientRect()
  mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1
  mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1
  raycaster.setFromCamera(mouse, camera)
  for (const h of raycaster.intersectObjects(tablet.children, true)) {
    if (h.object.userData.clickable && !clickCD) {
      clickCD = true
      setTimeout(() => clickCD = false, 300)
      screenMode = screenMode === 'full' ? 'minimal' : 'full'
      drawScreen()
      screenTexture.needsUpdate = true
      screenMat.emissiveIntensity = 0.5
      setTimeout(() => screenMat.emissiveIntensity = 0.12, 100)
      break
    }
  }
})

// ─── PARTICLES ───
const pGeo = new THREE.BufferGeometry()
const pPos = new Float32Array(80 * 3)
for (let i = 0; i < 80; i++) {
  pPos[i * 3] = (Math.random() - 0.5) * 25
  pPos[i * 3 + 1] = (Math.random() - 0.5) * 18
  pPos[i * 3 + 2] = (Math.random() - 0.5) * 12
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.03, color: 0xffffff, transparent: true, opacity: 0.15, sizeAttenuation: true })))

// ─── GSAP SCROLL ANIMATIONS ───
ctx.add(() => {
  // Hero entrance
  const heroTl = gsap.timeline({ delay: 0.6 })
  heroTl
    .to('.hero-text', { opacity: 1, y: 0, duration: 0.8, ease: 'power4.out' })
    .from('.hero-title', { scale: 0.92, duration: 0.6, ease: 'back.out(1.4)' }, '-=0.5')
    .from('.hero-subtitle', { opacity: 0, y: 15, duration: 0.6, ease: 'power3.out' }, '-=0.3')
    .to('.hero-visual', { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')

  // Fade out 3D tablet when scrolling past hero
  gsap.to('#three-canvas', {
    opacity: 0,
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    }
  })

  // Features grid - unique animations per card direction
  gsap.utils.toArray('.bento-card').forEach((card, i) => {
    const dir = card.dataset.anim || 'bottom'
    const fromVars = { opacity: 0 }
    if (dir === 'left') {
      fromVars.x = -80
      fromVars.rotationY = 15
    } else if (dir === 'right') {
      fromVars.x = 80
      fromVars.rotationY = -15
    } else if (dir === 'bottom') {
      fromVars.scale = 0.88
      fromVars.y = 80
    }
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: card,
        start: 'top 82%',
        toggleActions: 'play none none none',
      }
    })
    tl.fromTo(card, fromVars, {
      opacity: 1, x: 0, y: 0, scale: 1, rotationY: 0,
      duration: 0.9,
      ease: 'back.out(1.4)',
      delay: i * 0.12
    })
    tl.fromTo(card.querySelector('.card-content'), { y: 20, opacity: 0 }, {
      y: 0, opacity: 1,
      duration: 0.5,
      ease: 'power2.out'
    }, '-=0.4')
    // Hover tilt
    card.addEventListener('mouseenter', () => {
      gsap.to(card, { scale: 1.03, duration: 0.4, ease: 'power2.out' })
    })
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { scale: 1, duration: 0.4, ease: 'power2.out' })
    })
  })

  // Steps - unique animations per direction
  gsap.utils.toArray('.step-card').forEach((card, i) => {
    const dir = card.dataset.anim || 'bottom'
    const fromVars = { opacity: 0 }
    if (dir === 'left') {
      fromVars.x = -100
      fromVars.skewX = 8
    } else if (dir === 'right') {
      fromVars.x = 100
      fromVars.skewX = -8
    } else if (dir === 'scale') {
      fromVars.scale = 0.7
      fromVars.y = 40
    } else if (dir === 'bottom') {
      fromVars.y = 80
      fromVars.rotationX = -15
    }
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: card,
        start: 'top 84%',
        toggleActions: 'play none none none',
      }
    })
    tl.fromTo(card, fromVars, {
      opacity: 1, x: 0, y: 0, scale: 1, skewX: 0, rotationX: 0,
      duration: 0.75,
      ease: 'power3.out',
      delay: i * 0.15
    })
    // Icon pop
    tl.fromTo(card.querySelector('.step-icon'), { scale: 0, rotation: -45 }, {
      scale: 1, rotation: 0,
      duration: 0.5,
      ease: 'back.out(2)'
    }, '-=0.35')
    // Text fade
    tl.fromTo(card.querySelector('.step-body'), { y: 12, opacity: 0 }, {
      y: 0, opacity: 1,
      duration: 0.4,
      ease: 'power2.out'
    }, '-=0.25')
    // Hover: gentle lift + glow
    card.addEventListener('mouseenter', () => {
      gsap.to(card, { y: -4, scale: 1.02, duration: 0.35, ease: 'power2.out' })
    })
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { y: 0, scale: 1, duration: 0.35, ease: 'power2.out' })
    })
  })

  // Contact entry
  gsap.from('.contact-info', {
    opacity: 0, x: -30,
    duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '#contact', start: 'top 72%', toggleActions: 'play none none none' },
  })
  gsap.from('.contact-form', {
    opacity: 0, x: 30,
    duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '#contact', start: 'top 72%', toggleActions: 'play none none none' },
  })
})

// ─── ANIMATION LOOP ───
const clock = new THREE.Clock()
let isDragging = false
let autoRotate = true
let dragTimeout

controls.addEventListener('start', () => { isDragging = true; autoRotate = false; clearTimeout(dragTimeout) })
controls.addEventListener('end', () => { isDragging = false; dragTimeout = setTimeout(() => autoRotate = true, 3000) })

function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()
  const elapsed = clock.getElapsedTime()

  if (autoRotate) tablet.rotation.y = -Math.PI / 5 + Math.sin(elapsed * 0.4) * 0.15

  rimLight.intensity = 0.5 + Math.sin(elapsed * 1.5) * 0.1

  controls.update()
  renderer.render(scene, camera)
}

// ─── RESIZE ───
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// ─── NAV SCROLL ───
document.querySelectorAll('.nav-link, .footer-links a').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href')
    if (href?.startsWith('#')) {
      e.preventDefault()
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    }
  })
})

// ─── START ───
animate()
const loading = document.getElementById('loading')
if (loading) {
  loading.classList.add('hidden')
  setTimeout(() => { if (loading.parentNode) loading.style.display = 'none' }, 600)
}
