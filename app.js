/**
 * CHIPLUN FAMILY HOME - 3D Konkan Duplex Architectural Visualizer
 * Client: Supriya Ghag | Location: Chiplun, Maharashtra (Konkan Region)
 * Technology: Three.js, Procedural PBR Textures, Particle Rain Simulation, Tween.js
 */

// Global State
const state = {
  activeFloor: 'full',      // 'full', 'roof-off', 'ground', 'exploded'
  roofStyle: 'modern-skillion', // 'modern-skillion' (default matching reference image) or 'konkan-hipped'
  lightingMode: 'daylight', // 'daylight', 'monsoon', 'golden', 'night'
  rainActive: false,
  xrayMode: false,
  showDimensions: true,
  selectedRoom: null,
};

// Scene, Camera, Renderer, Controls
let scene, camera, renderer, controls;
let groundFloorGroup, firstFloorGroup, roofGroup, modernRoofGroup, konkanRoofGroup, porchKonkanRoof, environmentGroup, dimensionGroup;
let rainParticles, rainCascades, rainSplashes;
let dirLight, ambientLight, interiorLights = [];
let raycaster, mouse;
const roomMeshMap = {};
const roomDataMap = {
  'porch': {
    name: 'Front Porch (Otla / Padwi) - Left Facade',
    area: '14\' 1½" × 5\' 0" (71 ft²)',
    desc: 'The traditional Konkan front sit-out (Otla) occupying the left side of the front facade. Fully enclosed on the right by Ground Floor Master Bedroom 1\'s dividing wall. Features two carved solid Sagwan (teak) pillars standing on polished stone pedestals, built-in Charupadi benches, and a continuous sloping terracotta roof canopy across the entire front.',
    vastu: 'Direction: East-Southeast | Element: Earth & Welcome'
  },
  'living': {
    name: 'Living Room (Double-Height Mezzanine)',
    area: '14\' 1½" × 17\' 2¼" (241 ft²)',
    desc: 'Grand double-height central reception room. Extends up 20+ feet to the exposed timber roof trusses, creating natural stack ventilation that exhausts tropical coastal heat and humidity. Overlooked by the first-floor mezzanine passage.',
    vastu: 'Direction: East / Center | High Ceiling Promotes Positive Energy Flow'
  },
  'pooja': {
    name: 'Pooja Mandir Niche',
    area: '6\' 2" × 2\' 1" (13 ft²)',
    desc: 'A dedicated sanctum nestled adjacent to the staircase. Features a hand-carved teakwood mandir with brass hanging samai lamps and ambient warm lighting.',
    vastu: 'Direction: Northeast (Ishanya Corner) | Optimum Vastu Alignment'
  },
  'stairs': {
    name: 'Doglegged Teakwood Staircase',
    area: '9\' 0" × 10\' 0" (90 ft²)',
    desc: 'A 20-step doglegged staircase with 10 treads rising to an intermediate landing, then 10 treads ascending to the first-floor mezzanine gallery. Traditional turned teak balusters and brass-inlaid handrail.',
    vastu: 'Direction: South / West | Clockwise Ascending Vastu Rule'
  },
  'kitchen': {
    name: 'Kitchen & Dining with Store Room',
    area: '14\' 0" × 13\' 2" (184 ft²)',
    desc: 'Spacious coastal kitchen with polished black granite countertops, stainless double sink, gas hob, modular teak cabinets, dining table, and a dedicated teak exterior exit door leading out to an elevated 5\' × 11\' side utility platform and 4 steps down to the garden yard.',
    vastu: 'Direction: Southeast (Agneya Corner - Fire Element) | Ideal Vastu Position'
  },
  'kitchen-exit': {
    name: 'Kitchen Exterior Exit Door & Steps',
    area: '5\' 0" × 11\' 1¾" Utility Platform (DN 4 Steps)',
    desc: 'Dedicated external access door on the ground floor kitchen right exterior wall leading to an elevated 5ft wide platform and 4 descending steps ("DN 4 3 2 1" from CAD Plan A100). Enables direct exterior access for utility, waste management, and coastal garden circulation.',
    vastu: 'Direction: Southeast (Agneya) / East | Direct exterior utility connection'
  },
  'bed1': {
    name: 'Ground Floor Master Bedroom 1 (Aligned Front Facade)',
    area: '14\' 0" × 16\' 6" (230 ft²)',
    desc: 'Ground floor Master Bedroom positioned on the right side of the front facade, moved forward so its front wall aligns flush with the starting line of the porch area. Its left wall encloses the right side of the porch, eliminating all empty setback gaps. Features ashlar stone cladding, multi-pane casement windows with safety grills, and continuous sloping roof eaves.',
    vastu: 'Direction: Southwest / South (Nairutya Zone) | Promotes Rest & Stability'
  },
  'toilet-ground': {
    name: 'Attached & Common Bathrooms (G.L.)',
    area: 'Attached: 34 ft² | Common: 21 ft²',
    desc: 'Anti-skid matte porcelain flooring with glazed ceramic wall tiles up to 7ft. Efficient plumbing shafts isolated from rain penetration.',
    vastu: 'Direction: Northwest / West | Favorable for Drainage & Sanitation'
  },
  'void': {
    name: 'Open to Below (Living Room Void)',
    area: '14\' 1½" × 17\' 2¼" (~240 ft²)',
    desc: 'The architectural centerpiece of this duplex. The living room ceiling is open to the first floor mezzanine, connecting both levels visually and acoustically while showcasing the steep sloping timber roof above.',
    vastu: 'Creates an expansive Brahma-sthana upward volume with superior daylight'
  },
  'passage': {
    name: 'Upper Mezzanine Gallery & Passage',
    area: '17\' 8½" × 3\' 3" / 5\' 0" (85 ft²)',
    desc: 'Elevated bridge walkway connecting Bedroom 2, Bedroom 3, and the front mezzanine balcony. Features an ornate wooden railing overlooking the living room below.',
    vastu: 'Seamless circulation between upper family suites'
  },
  'bed2': {
    name: 'First Floor Bedroom 2 (Master Suite & Balcony Walkout)',
    area: '14\' 0" × 14\' 6" (204 ft²)',
    desc: 'Grand upper master bedroom suite positioned directly above Ground Floor Bedroom 1. Features an authentic European full-glass French door (porte-fenêtre) opening out onto its own private front balcony, attached private bathroom, ashlar stone cladding, and king bed oriented toward the garden balcony view.',
    vastu: 'Direction: Southwest (Nairutya Zone) | Master Suite Elevation & Serenity'
  },
  'toilet-first': {
    name: 'Attached Bathroom (Bedroom 2)',
    area: '7\' 0" × 5\' 0" (35 ft²)',
    desc: 'Private en-suite bathroom for upper Master Bedroom 2. Fitted with matte designer ceramic flooring, glazed wall tiles, glass walk-in shower partition, modern sanitaryware, and dedicated ventilation.',
    vastu: 'Direction: Northwest / West | Favorable for Drainage & Sanitation'
  },
  'bed3': {
    name: 'First Floor Bedroom 3 (European French Door & Private Balcony)',
    area: '14\' 0" × 10\' 6" (147 ft²)',
    desc: 'Airy upper bedroom suite opening directly onto its private side balcony above the kitchen exit via an authentic European-style full-glass French door (porte-fenêtre) with floor-to-ceiling clear glazing and polished brass cremone bolt hardware. In accordance with the architectural plan, the room features clean solid walls without windows, providing quiet thermal insulation and framing scenic outdoor views through the grand glazed French doors.',
    vastu: 'Direction: Northwest (Vayavya Corner) | Air Element & Peaceful Rest'
  },
  'balcony-front': {
    name: 'First Floor Grand Front Balcony (Unified Full Facade)',
    area: '29\' 0" × 5\' 0" (145 ft²)',
    desc: 'Expansive unified front balcony spanning the entire 29.2 ft first-floor facade, created by joining the mezzanine and bedroom balconies into one seamless continuous terrace. Accessible both from the Mezzanine Gallery via glazed double French doors and directly from Bedroom 2 via its authentic European full-glass French door with cremone bolts. Features continuous solid teak balustrades, a colonnade of four carved Sagwan teak pillars, warm teak paneled ceiling, outdoor bistro lounge seating, and an ornamental triangular dormer gablette overlooking the landscaped grounds.',
    vastu: 'Direction: East-Southeast / Front Elevation | Full Frontal Prana & Abundant Morning Coastal Breeze'
  },
  'balcony-bed2': {
    name: 'First Floor Grand Front Balcony (Bedroom 2 Walkout)',
    area: '29\' 0" × 5\' 0" (145 ft²)',
    desc: 'Direct walkout from Bedroom 2 onto the grand unified front balcony via an authentic European-style full-glass French door (porte-fenêtre) with floor-to-ceiling clear glazing and polished brass cremone bolt (espagnolette) hardware. The balcony extends continuously across the entire front facade, sheltered under the sloping terracotta roof canopy and colonnade of carved Sagwan teak pillars.',
    vastu: 'Direction: South-Southeast / Front Elevation | Private Sunrise Views & Natural Cross-Ventilation'
  },
  'balcony-rear': {
    name: 'Bedroom 3 Private Balcony (European Full-Glass French Door)',
    area: '5\' 0" × 11\' 2" (56 ft²)',
    desc: 'Private outdoor side balcony attached to Bedroom 3 on the first floor via an authentic European full-glass French door (porte-fenêtre), positioned directly above the ground-floor kitchen exit door and utility platform. Features teakwood balustrades, carved support columns, outdoor bistro seating, and a sloping terracotta roof canopy overlooking the east garden.',
    vastu: 'Direction: West-Northwest | Evening Coastal Shade & Air Circulation'
  }
};

// Procedural Texture Generators
function createTerracottaTileTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base terracotta color
  ctx.fillStyle = '#b84324';
  ctx.fillRect(0, 0, 512, 512);

  // Draw tile rows (Mangalore tile pattern)
  const rows = 16;
  const cols = 8;
  const rowHeight = 512 / rows;
  const colWidth = 512 / cols;

  for (let r = 0; r < rows; r++) {
    const y = r * rowHeight;
    // Alternate tile stagger
    const xOffset = (r % 2 === 0) ? 0 : colWidth / 2;

    for (let c = -1; c < cols + 1; c++) {
      const x = c * colWidth + xOffset;

      // Tile color variation
      const hueShift = (Math.random() - 0.5) * 12;
      const shade = 180 + Math.floor(Math.random() * 40);
      ctx.fillStyle = `rgb(${shade + 20}, ${Math.floor(shade * 0.38)}, ${Math.floor(shade * 0.22)})`;
      ctx.fillRect(x + 2, y + 2, colWidth - 4, rowHeight - 4);

      // Flute ridge curve highlight
      const grad = ctx.createLinearGradient(x, y, x + colWidth, y);
      grad.addColorStop(0, 'rgba(0,0,0,0.3)');
      grad.addColorStop(0.3, 'rgba(255,255,255,0.25)');
      grad.addColorStop(0.7, 'rgba(0,0,0,0.1)');
      grad.addColorStop(1, 'rgba(0,0,0,0.4)');
      ctx.fillStyle = grad;
      ctx.fillRect(x + 2, y + 2, colWidth - 4, rowHeight - 4);

      // Horizontal overlap shadow
      ctx.fillStyle = 'rgba(20, 5, 2, 0.45)';
      ctx.fillRect(x, y + rowHeight - 4, colWidth, 4);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

function createLateriteStoneTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base Chira red-brown
  ctx.fillStyle = '#9e4028';
  ctx.fillRect(0, 0, 512, 512);

  // Stone block grid
  const blockH = 64;
  const blockW = 128;
  for (let r = 0; r < 512 / blockH; r++) {
    const y = r * blockH;
    const offset = (r % 2) * (blockW / 2);
    for (let c = -1; c < (512 / blockW) + 1; c++) {
      const x = c * blockW + offset;
      // Porous speckling
      ctx.fillStyle = (Math.random() > 0.5) ? '#a8472d' : '#8c351f';
      ctx.fillRect(x + 2, y + 2, blockW - 4, blockH - 4);

      // Dark porous cavities (typical in Konkan Chira stone)
      for (let p = 0; p < 24; p++) {
        const px = x + 6 + Math.random() * (blockW - 12);
        const py = y + 6 + Math.random() * (blockH - 12);
        const pr = 1 + Math.random() * 2.5;
        ctx.fillStyle = 'rgba(50, 15, 8, 0.6)';
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mortar groove lines
      ctx.fillStyle = 'rgba(230, 220, 210, 0.3)';
      ctx.fillRect(x, y, blockW, 2);
      ctx.fillRect(x, y, 2, blockH);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 2);
  return texture;
}

function createTeakWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Rich Sagwan teak tone
  ctx.fillStyle = '#7a421b';
  ctx.fillRect(0, 0, 256, 512);

  // Grain lines
  for (let i = 0; i < 60; i++) {
    ctx.strokeStyle = (i % 2 === 0) ? '#8e4f22' : '#5f3213';
    ctx.lineWidth = 1 + Math.random() * 3;
    ctx.beginPath();
    ctx.moveTo(Math.random() * 256, 0);
    ctx.bezierCurveTo(
      Math.random() * 256, 170,
      Math.random() * 256, 340,
      Math.random() * 256, 512
    );
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Procedural Stone Tile Cladding Texture (warm beige/tan grooved ashlar blocks from reference photo)
function createStoneTileCladdingTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Warm sandy beige mortar base
  ctx.fillStyle = '#bda796';
  ctx.fillRect(0, 0, 512, 512);

  const rows = 16;
  const cols = 6;
  const rh = 512 / rows;
  const cw = 512 / cols;

  for (let r = 0; r < rows; r++) {
    const y = r * rh;
    const offset = (r % 2) * (cw / 2);
    for (let c = -1; c <= cols; c++) {
      const x = c * cw + offset;
      // Warm beige/light-brown stone tile variation matching reference photo
      const rVal = 175 + Math.floor(Math.random() * 25);
      const gVal = 155 + Math.floor(Math.random() * 20);
      const bVal = 138 + Math.floor(Math.random() * 20);
      ctx.fillStyle = `rgb(${rVal}, ${gVal}, ${bVal})`;
      ctx.fillRect(x + 1.5, y + 1.5, cw - 3, rh - 3);

      // Horizontal subtle cleft shadow
      ctx.strokeStyle = 'rgba(70, 50, 40, 0.28)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 2, y + rh / 2);
      ctx.lineTo(x + cw - 2, y + rh / 2);
      ctx.stroke();

      // Recessed mortar joint border
      ctx.strokeStyle = 'rgba(240, 230, 220, 0.45)';
      ctx.strokeRect(x + 1.5, y + 1.5, cw - 3, rh - 3);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// Procedural Speckled Dark Gravel Forecourt Driveway Texture (from reference photo)
function createDrivewayGravelTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Dark charcoal aggregate base
  ctx.fillStyle = '#32302e';
  ctx.fillRect(0, 0, 512, 512);

  // Thousands of tiny gravel stones, light pebbles, and basalt granules
  for (let i = 0; i < 4500; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 2.2 + 0.6;
    const rand = Math.random();
    if (rand < 0.35) {
      ctx.fillStyle = 'rgba(235, 232, 225, 0.75)'; // white/beige pebble
    } else if (rand < 0.68) {
      ctx.fillStyle = 'rgba(165, 160, 155, 0.65)'; // light grey stone
    } else {
      ctx.fillStyle = 'rgba(18, 16, 15, 0.85)';    // dark basalt grain
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

// Materials Library
let materials = {};

function initMaterials() {
  const tileTex = createTerracottaTileTexture();
  const lateriteTex = createLateriteStoneTexture();
  const woodTex = createTeakWoodTexture();
  const stoneCladTex = createStoneTileCladdingTexture();
  const gravelTex = createDrivewayGravelTexture();

  materials = {
    // Slanted Roof (Authentic Mangalore Terracotta)
    roofTile: new THREE.MeshStandardMaterial({
      map: tileTex,
      roughness: 0.65,
      metalness: 0.05,
      bumpScale: 0.15,
      color: 0xd44d26 // Deep warm terracotta clay tone
    }),
    roofRidge: new THREE.MeshStandardMaterial({
      color: 0xb53c1e,
      roughness: 0.7,
      metalness: 0.05
    }),
    roofFascia: new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.5,
      color: 0x5c3314
    }),
    whiteSoffit: new THREE.MeshStandardMaterial({
      color: 0xfcfbfa,
      roughness: 0.85,
      metalness: 0.02
    }),
    whiteTrim: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.8,
      metalness: 0.02
    }),
    stoneCladding: new THREE.MeshStandardMaterial({
      map: stoneCladTex,
      roughness: 0.75,
      metalness: 0.05,
      color: 0xffffff // Retain full vibrant warm beige/tan ashlar blocks
    }),

    // Modern Split Skillion Roof Materials (Matching Attached Modern Reference Image)
    modernRoofDark: new THREE.MeshStandardMaterial({
      color: 0x222730, // Sleek dark charcoal / standing seam architectural metal finish
      roughness: 0.35,
      metalness: 0.28
    }),
    modernFasciaWhite: new THREE.MeshStandardMaterial({
      color: 0xf5f6f8, // Crisp bold modern white/light-grey fascia
      roughness: 0.25,
      metalness: 0.05
    }),
    modernFasciaDark: new THREE.MeshStandardMaterial({
      color: 0x161a22, // Dark modern accent reveal groove
      roughness: 0.45,
      metalness: 0.12
    }),
    modernSlatWhite: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.32,
      metalness: 0.05
    }),
    modernClerestoryGlass: new THREE.MeshPhysicalMaterial({
      color: 0x60a5fa,
      transmission: 0.85,
      opacity: 0.72,
      transparent: true,
      roughness: 0.05,
      metalness: 0.15,
      ior: 1.52
    }),

    // Walls
    wallExterior: new THREE.MeshStandardMaterial({
      color: 0xf5f0e6, // Smooth off-white / coastal cream stucco
      roughness: 0.85,
      metalness: 0.02
    }),
    wallInterior: new THREE.MeshStandardMaterial({
      color: 0xfbf8f2,
      roughness: 0.9,
      metalness: 0.01
    }),
    plinthLaterite: new THREE.MeshStandardMaterial({
      map: lateriteTex,
      roughness: 0.8,
      metalness: 0.05,
      color: 0xa8452d
    }),

    // Wood & Details (Matching Dark Polished Timber in Reference Photo)
    darkTeakWood: new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.32,
      metalness: 0.12,
      color: 0x3d1c0c // Deep rich mahogany / dark polished teak
    }),
    teakWood: new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.45,
      metalness: 0.1,
      color: 0x824b22
    }),
    carvedColumn: new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.4,
      metalness: 0.15,
      color: 0x6e3d1a
    }),
    glassWindow: new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transmission: 0.7,
      opacity: 0.65,
      transparent: true,
      roughness: 0.1,
      ior: 1.5
    }),
    brassLamp: new THREE.MeshStandardMaterial({
      color: 0xefbf43,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x4a3205
    }),

    // Accent Materials from Reference Photo
    darkTrimBand: new THREE.MeshStandardMaterial({
      color: 0x4a2414, // Deep brown horizontal fascia band under roofline
      roughness: 0.55,
      metalness: 0.08
    }),
    windowGrill: new THREE.MeshStandardMaterial({
      color: 0x181818, // Steel security grill bars
      roughness: 0.3,
      metalness: 0.85
    }),
    sintexTank: new THREE.MeshStandardMaterial({
      color: 0x151515, // Black UV-treated polymer water tank
      roughness: 0.45,
      metalness: 0.1
    }),
    porchRiser: new THREE.MeshStandardMaterial({
      color: 0x5a2d18, // Rich teak/terracotta plinth border for porch base
      roughness: 0.5,
      metalness: 0.05
    }),
    gravelDriveway: new THREE.MeshStandardMaterial({
      map: gravelTex,
      roughness: 0.92,
      metalness: 0.05
    }),

    // Floors
    floorKotaStone: new THREE.MeshStandardMaterial({
      color: 0x647a6b,
      roughness: 0.35,
      metalness: 0.1
    }),
    floorTerracotta: new THREE.MeshStandardMaterial({
      color: 0xb85635,
      roughness: 0.6,
      metalness: 0.05
    }),

    // Highlight overlay for room selection
    roomHighlight: new THREE.MeshBasicMaterial({
      color: 0xe05634,
      transparent: true,
      opacity: 0.35,
      wireframe: false,
      side: THREE.DoubleSide
    })
  };
}

// Initialize Three.js Application
function init() {
  const container = document.getElementById('canvas-wrapper');
  const canvas = document.getElementById('webgl-canvas');

  // Scene: Daylight soft sky matching reference photograph
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa4c6e8);
  scene.fog = new THREE.FogExp2(0xa4c6e8, 0.002);

  // Camera: Framed from dynamic 3D perspective showing front facade and roof depth
  camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.5, 1000);
  camera.position.set(-34.0, 20.0, 42.0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  // OrbitControls: Focused directly on house center
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.maxPolarAngle = Math.PI / 2 - 0.02; // Keep slightly above ground
  controls.minDistance = 10;
  controls.maxDistance = 160;
  controls.target.set(0, 11.2, 6.0);

  // Raycaster for room selection
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Initialize Materials
  initMaterials();

  // Create Lighting
  setupLighting();

  // Build House Components
  buildHouseModel();

  // Build Environment
  buildEnvironment();

  // Build Rain System
  setupMonsoonRain();

  // Setup UI & Events
  setupEventListeners();

  // Resize Handler
  window.addEventListener('resize', onWindowResize);

  // Start Animation Loop
  animate();
}

// Lighting Setup
function setupLighting() {
  // Hemisphere Light (sky & ground ambient)
  ambientLight = new THREE.HemisphereLight(0xffecd2, 0x223344, 0.7);
  scene.add(ambientLight);

  // Directional Sun Light
  dirLight = new THREE.DirectionalLight(0xfffaed, 1.4);
  dirLight.position.set(45, 55, 30);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 10;
  dirLight.shadow.camera.far = 160;
  dirLight.shadow.camera.left = -40;
  dirLight.shadow.camera.right = 40;
  dirLight.shadow.camera.top = 40;
  dirLight.shadow.camera.bottom = -40;
  dirLight.shadow.bias = -0.0004;
  scene.add(dirLight);

  // Interior Warm Point Lights (Double-height living room & Porch)
  const livingLight = new THREE.PointLight(0xffaa44, 2.2, 35);
  livingLight.position.set(-7, 8, 3);
  scene.add(livingLight);
  interiorLights.push(livingLight);

  const porchLight = new THREE.PointLight(0xffaa33, 1.5, 20);
  porchLight.position.set(-7, 5, 12);
  scene.add(porchLight);
  interiorLights.push(porchLight);

  const bed2Light = new THREE.PointLight(0xffb86c, 1.4, 25);
  bed2Light.position.set(7, 16, 7);
  scene.add(bed2Light);
  interiorLights.push(bed2Light);
}

// Stone Cladding Accent Panel Builder (Matching reference photo window surrounds)
function addStoneCladdingPanel(parent, x, y, z, w, h) {
  const panelGroup = new THREE.Group();
  panelGroup.position.set(x, y, z);

  // Outer crisp white frame trim
  const frameGeo = new THREE.BoxGeometry(w + 0.6, h + 0.6, 0.15);
  const frame = new THREE.Mesh(frameGeo, materials.whiteTrim);
  panelGroup.add(frame);

  // Ashlar grooved stone cladding face
  const stoneGeo = new THREE.BoxGeometry(w, h, 0.22);
  const stone = new THREE.Mesh(stoneGeo, materials.stoneCladding);
  stone.position.z = 0.05;
  panelGroup.add(stone);

  parent.add(panelGroup);
}

// Authentic Kerala/Konkan 4-Pane Casement Window with Safety Grills (matching reference photo)
function addPhotoMatchingWindow(parent, x, y, z, w, h) {
  const winGroup = new THREE.Group();
  winGroup.position.set(x, y, z);

  // Outer Dark Teak Frame
  const frameThickness = 0.32;
  const frameDepth = 0.42;
  const frameMat = materials.darkTeakWood;

  // Top header
  const topF = new THREE.Mesh(new THREE.BoxGeometry(w, frameThickness, frameDepth), frameMat);
  topF.position.set(0, h / 2 - frameThickness / 2, 0);
  winGroup.add(topF);

  // Bottom projecting window sill
  const sill = new THREE.Mesh(new THREE.BoxGeometry(w + 0.45, frameThickness + 0.08, frameDepth + 0.22), frameMat);
  sill.position.set(0, -h / 2 + frameThickness / 2, 0.09);
  winGroup.add(sill);

  // Left jamb
  const leftF = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, h, frameDepth), frameMat);
  leftF.position.set(-w / 2 + frameThickness / 2, 0, 0);
  winGroup.add(leftF);

  // Right jamb
  const rightF = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, h, frameDepth), frameMat);
  rightF.position.set(w / 2 - frameThickness / 2, 0, 0);
  winGroup.add(rightF);

  // 3 Vertical Mullions dividing into 4 tall vertical panes (as shown in reference photo)
  const innerW = w - 2 * frameThickness;
  const innerH = h - 2 * frameThickness;
  const paneW = innerW / 4;

  for (let m = 1; m < 4; m++) {
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.18, innerH, frameDepth * 0.9), frameMat);
    mullion.position.set(-innerW / 2 + m * paneW, 0, 0);
    winGroup.add(mullion);
  }

  // Horizontal Transom Bar across middle
  const transom = new THREE.Mesh(new THREE.BoxGeometry(innerW, 0.16, frameDepth * 0.8), frameMat);
  transom.position.set(0, innerH * 0.15, 0);
  winGroup.add(transom);

  // Clear Glass Panes with Daylight Reflections
  const glassGeo = new THREE.BoxGeometry(innerW, innerH, 0.08);
  const glass = new THREE.Mesh(glassGeo, materials.glassWindow);
  glass.position.set(0, 0, 0.02);
  winGroup.add(glass);

  // Horizontal Black Security Grill Bars
  const numBars = 5;
  const barStep = innerH / (numBars + 1);
  for (let b = 1; b <= numBars; b++) {
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, innerW, 6), materials.windowGrill);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, -innerH / 2 + b * barStep, -0.05);
    winGroup.add(bar);
  }

  parent.add(winGroup);
}

// Authentic French Balcony Door with multi-lite divided glass panels, teak stiles, and brass cremone hardware
function addFrenchBalconyDoor(parent, x, y, z, w, h, facing = 'front', openAngleDeg = -32) {
  const group = new THREE.Group();
  group.position.set(x, y, z);

  const frameThickness = 0.28;
  const frameDepth = 0.55;
  const frameMat = materials.darkTeakWood;

  // 1. Heavy Teak Architrave Frame Casing
  const topF = new THREE.Mesh(new THREE.BoxGeometry(w + 0.35, frameThickness + 0.12, frameDepth), frameMat);
  topF.position.set(0, h - (frameThickness + 0.12) / 2, 0);
  topF.castShadow = true;
  group.add(topF);

  const leftF = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, h, frameDepth), frameMat);
  leftF.position.set(-w / 2 + frameThickness / 2, h / 2, 0);
  leftF.castShadow = true;
  group.add(leftF);

  const rightF = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, h, frameDepth), frameMat);
  rightF.position.set(w / 2 - frameThickness / 2, h / 2, 0);
  rightF.castShadow = true;
  group.add(rightF);

  // Projecting Teak / Stone Door Threshold / Sill
  const sill = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 0.22, frameDepth + 0.3), frameMat);
  sill.position.set(0, 0.11, 0.08);
  sill.receiveShadow = true;
  group.add(sill);

  // Door Opening Dimensions
  const innerW = w - 2 * frameThickness;
  const innerH = h - frameThickness - 0.22;
  const leafW = innerW / 2 - 0.03;
  const leafH = innerH;

  // Helper to build a French Door Leaf with multi-lite glass grid
  function createFrenchLeaf(isHingedLeaf = false) {
    const leafGroup = new THREE.Group();

    // Leaf Outer Teak Frame
    const stileW = 0.22;
    const kickH = 1.05; // Raised bottom kick panel
    const railH = 0.22;
    const leafThick = 0.16;

    // Bottom Raised Wood Kick Panel
    const kickPanel = new THREE.Mesh(new THREE.BoxGeometry(leafW, kickH, leafThick), materials.teakWood);
    kickPanel.position.set(leafW / 2, kickH / 2, 0);
    kickPanel.castShadow = true;
    leafGroup.add(kickPanel);

    // Beveled raised moulding on kick panel
    const kickBevel = new THREE.Mesh(new THREE.BoxGeometry(leafW - 0.18, kickH - 0.25, leafThick + 0.05), materials.darkTeakWood);
    kickBevel.position.set(leafW / 2, kickH / 2, 0);
    leafGroup.add(kickBevel);

    // Left and Right Stiles
    const stileL = new THREE.Mesh(new THREE.BoxGeometry(stileW, leafH, leafThick), materials.teakWood);
    stileL.position.set(stileW / 2, leafH / 2, 0);
    stileL.castShadow = true;
    leafGroup.add(stileL);

    const stileR = new THREE.Mesh(new THREE.BoxGeometry(stileW, leafH, leafThick), materials.teakWood);
    stileR.position.set(leafW - stileW / 2, leafH / 2, 0);
    stileR.castShadow = true;
    leafGroup.add(stileR);

    // Top Rail
    const railTop = new THREE.Mesh(new THREE.BoxGeometry(leafW, railH, leafThick), materials.teakWood);
    railTop.position.set(leafW / 2, leafH - railH / 2, 0);
    railTop.castShadow = true;
    leafGroup.add(railTop);

    // Intermediate Mid-Rail above kick panel
    const railMid = new THREE.Mesh(new THREE.BoxGeometry(leafW, railH * 0.9, leafThick), materials.teakWood);
    railMid.position.set(leafW / 2, kickH + railH * 0.45, 0);
    leafGroup.add(railMid);

    // Glass Panes Area
    const glassW = leafW - 2 * stileW;
    const glassH = leafH - kickH - railH - railH * 0.9;
    const glassCenterY = kickH + railH * 0.9 + glassH / 2;

    const glassGeo = new THREE.BoxGeometry(glassW, glassH, 0.06);
    const glass = new THREE.Mesh(glassGeo, materials.glassWindow);
    glass.position.set(leafW / 2, glassCenterY, 0);
    leafGroup.add(glass);

    // French Multi-Lite Wooden Muntins (Glazing Bars: 2 columns × 3 rows of panes)
    const cols = 2;
    const rows = 3;
    const colStep = glassW / cols;
    const rowStep = glassH / rows;

    // Vertical Muntin
    for (let c = 1; c < cols; c++) {
      const vMuntin = new THREE.Mesh(new THREE.BoxGeometry(0.08, glassH, leafThick * 0.7), materials.darkTeakWood);
      vMuntin.position.set(stileW + c * colStep, glassCenterY, 0);
      leafGroup.add(vMuntin);
    }

    // Horizontal Muntins
    for (let r = 1; r < rows; r++) {
      const hMuntin = new THREE.Mesh(new THREE.BoxGeometry(glassW, 0.08, leafThick * 0.7), materials.darkTeakWood);
      hMuntin.position.set(leafW / 2, kickH + railH * 0.9 + r * rowStep, 0);
      leafGroup.add(hMuntin);
    }

    // Brass Cremone Bolt & Lever Handle
    const handleY = kickH + railH * 0.9 + 0.8;
    const leverGeo = new THREE.BoxGeometry(0.35, 0.08, 0.12);
    const lever = new THREE.Mesh(leverGeo, materials.brassLamp);
    lever.position.set(isHingedLeaf ? (leafW - 0.15) : 0.15, handleY, 0.12);
    leafGroup.add(lever);

    const boltRod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, leafH * 0.85, 8), materials.brassLamp);
    boltRod.position.set(isHingedLeaf ? (leafW - 0.15) : 0.15, leafH / 2 + 0.2, 0.1);
    leafGroup.add(boltRod);

    return leafGroup;
  }

  // Left French Door Leaf
  const leftLeaf = createFrenchLeaf(false);
  leftLeaf.position.set(-innerW / 2, 0.22, 0);
  group.add(leftLeaf);

  // Right French Door Leaf (Swung open outward to balcony!)
  const rightLeafPivot = new THREE.Group();
  rightLeafPivot.position.set(innerW / 2, 0.22, 0); // Hinge pivot at right jamb
  const rightLeaf = createFrenchLeaf(true);
  rightLeaf.position.set(-leafW, 0, 0);
  rightLeafPivot.add(rightLeaf);
  rightLeafPivot.rotation.y = THREE.MathUtils.degToRad(openAngleDeg);
  group.add(rightLeafPivot);

  // Orientation / Facing
  if (facing === 'side-right') {
    group.rotation.y = -Math.PI / 2;
  } else if (facing === 'side-left') {
    group.rotation.y = Math.PI / 2;
  } else if (facing === 'rear') {
    group.rotation.y = Math.PI;
  }

  parent.add(group);
  return group;
}

// Authentic French Multi-Lite Casement Window with brass cremone stays and divided lites
function addFrenchCasementWindow(parent, x, y, z, w, h, facing = 'front') {
  const group = new THREE.Group();
  group.position.set(x, y, z);

  const frameThickness = 0.28;
  const frameDepth = 0.45;
  const frameMat = materials.darkTeakWood;

  // Outer Teak Frame
  const topF = new THREE.Mesh(new THREE.BoxGeometry(w, frameThickness, frameDepth), frameMat);
  topF.position.set(0, h / 2 - frameThickness / 2, 0);
  group.add(topF);

  const sill = new THREE.Mesh(new THREE.BoxGeometry(w + 0.45, frameThickness + 0.1, frameDepth + 0.25), frameMat);
  sill.position.set(0, -h / 2 + (frameThickness + 0.1) / 2, 0.1);
  group.add(sill);

  const leftF = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, h, frameDepth), frameMat);
  leftF.position.set(-w / 2 + frameThickness / 2, 0, 0);
  group.add(leftF);

  const rightF = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, h, frameDepth), frameMat);
  rightF.position.set(w / 2 - frameThickness / 2, 0, 0);
  group.add(rightF);

  // Central Vertical Meeting Stile (dividing into twin French sashes)
  const centerStile = new THREE.Mesh(new THREE.BoxGeometry(frameThickness * 0.9, h - 2 * frameThickness, frameDepth * 0.8), frameMat);
  centerStile.position.set(0, 0, 0);
  group.add(centerStile);

  // Clear Glass and French Muntins
  const innerW = (w - 3 * frameThickness) / 2;
  const innerH = h - 2 * frameThickness;

  for (let s of [-1, 1]) {
    const sashCenterX = s * (innerW / 2 + frameThickness * 0.45);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(innerW, innerH, 0.08), materials.glassWindow);
    glass.position.set(sashCenterX, 0, 0.02);
    group.add(glass);

    // French Glazing Muntins (2 columns × 3 rows of panes per sash)
    const vM = new THREE.Mesh(new THREE.BoxGeometry(0.08, innerH, frameDepth * 0.7), frameMat);
    vM.position.set(sashCenterX, 0, 0.03);
    group.add(vM);

    for (let r of [-innerH * 0.25, innerH * 0.25]) {
      const hM = new THREE.Mesh(new THREE.BoxGeometry(innerW, 0.08, frameDepth * 0.7), frameMat);
      hM.position.set(sashCenterX, r, 0.03);
      group.add(hM);
    }

    // Brass cremone turn latch
    const latch = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), materials.brassLamp);
    latch.position.set(s * (frameThickness * 0.55), 0, 0.12);
    group.add(latch);
  }

  // Exterior Slanted Terracotta Chajja (Rain hood)
  const chajja = new THREE.Mesh(new THREE.BoxGeometry(w + 1.4, 0.35, 2.2), materials.roofTile);
  chajja.position.set(0, h / 2 + 0.4, 1.0);
  chajja.rotation.x = THREE.MathUtils.degToRad(24);
  chajja.castShadow = true;
  group.add(chajja);

  // Support brackets
  for (let s of [-1, 1]) {
    const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 1.2), materials.darkTeakWood);
    bracket.position.set(s * (w / 2 - 0.2), h / 2 - 0.2, 0.6);
    group.add(bracket);
  }

  if (facing === 'side-right') {
    group.rotation.y = -Math.PI / 2;
  } else if (facing === 'side-left') {
    group.rotation.y = Math.PI / 2;
  } else if (facing === 'rear') {
    group.rotation.y = Math.PI;
  }

  parent.add(group);
  return group;
}

// Authentic European Full-Glass French Balcony Door (Porte-Fenêtre)
// Floor-to-ceiling glass panes, slimline European architectural profile, brass cremone bolt & lever
function addEuropeanFullGlassFrenchDoor(parent, x, y, z, w, h, facing = 'front', openAngleDeg = -35) {
  const group = new THREE.Group();
  group.position.set(x, y, z);

  const frameThickness = 0.22; // Ultra-slim European frame
  const frameDepth = 0.45;
  const frameMat = materials.darkTeakWood;

  // 1. Slim European Architrave Frame
  const topF = new THREE.Mesh(new THREE.BoxGeometry(w + 0.25, frameThickness, frameDepth), frameMat);
  topF.position.set(0, h - frameThickness / 2, 0);
  topF.castShadow = true;
  group.add(topF);

  const leftF = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, h, frameDepth), frameMat);
  leftF.position.set(-w / 2 + frameThickness / 2, h / 2, 0);
  leftF.castShadow = true;
  group.add(leftF);

  const rightF = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, h, frameDepth), frameMat);
  rightF.position.set(w / 2 - frameThickness / 2, h / 2, 0);
  rightF.castShadow = true;
  group.add(rightF);

  // Low-profile European flush threshold / sill
  const sill = new THREE.Mesh(new THREE.BoxGeometry(w + 0.35, 0.12, frameDepth + 0.2), frameMat);
  sill.position.set(0, 0.06, 0.05);
  sill.receiveShadow = true;
  group.add(sill);

  // Door Opening Dimensions
  const innerW = w - 2 * frameThickness;
  const innerH = h - frameThickness - 0.12;
  const leafW = innerW / 2 - 0.02;
  const leafH = innerH;

  // Helper to build a European Full-Glass French Door Leaf
  function createEuropeanLeaf(isHingedLeaf = false) {
    const leafGroup = new THREE.Group();

    // Ultra-slim European door stiles and rails (maximizing glass area!)
    const stileW = 0.16; // Very slim European stiles
    const railH = 0.18;
    const leafThick = 0.14;

    // Outer frame perimeter
    const stileL = new THREE.Mesh(new THREE.BoxGeometry(stileW, leafH, leafThick), frameMat);
    stileL.position.set(stileW / 2, leafH / 2, 0);
    stileL.castShadow = true;
    leafGroup.add(stileL);

    const stileR = new THREE.Mesh(new THREE.BoxGeometry(stileW, leafH, leafThick), frameMat);
    stileR.position.set(leafW - stileW / 2, leafH / 2, 0);
    stileR.castShadow = true;
    leafGroup.add(stileR);

    const railTop = new THREE.Mesh(new THREE.BoxGeometry(leafW, railH, leafThick), frameMat);
    railTop.position.set(leafW / 2, leafH - railH / 2, 0);
    railTop.castShadow = true;
    leafGroup.add(railTop);

    const railBottom = new THREE.Mesh(new THREE.BoxGeometry(leafW, railH * 1.2, leafThick), frameMat);
    railBottom.position.set(leafW / 2, (railH * 1.2) / 2, 0);
    railBottom.castShadow = true;
    leafGroup.add(railBottom);

    // FULL CLEAR GLASS PANE (extends virtually full height!)
    const glassW = leafW - 2 * stileW;
    const glassH = leafH - railH - railH * 1.2;
    const glassCenterY = railH * 1.2 + glassH / 2;

    const glassGeo = new THREE.BoxGeometry(glassW, glassH, 0.05);
    const glass = new THREE.Mesh(glassGeo, materials.glassWindow);
    glass.position.set(leafW / 2, glassCenterY, 0);
    leafGroup.add(glass);

    // European Astragal Glazing Bars (Ultra-slim 0.04 ft bars dividing into tall graceful French panes)
    const rows = 3;
    const rowStep = glassH / rows;
    for (let r = 1; r < rows; r++) {
      const hBar = new THREE.Mesh(new THREE.BoxGeometry(glassW, 0.05, leafThick * 0.6), frameMat);
      hBar.position.set(leafW / 2, railH * 1.2 + r * rowStep, 0);
      leafGroup.add(hBar);
    }

    // Slim Vertical Center Astragal
    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.05, glassH, leafThick * 0.6), frameMat);
    vBar.position.set(leafW / 2, glassCenterY, 0);
    leafGroup.add(vBar);

    // Polished Brass European Cremone Bolt (Espagnolette) & Lever Handle (both interior & exterior sides)
    const handleY = leafH * 0.45;
    for (let side of [-1, 1]) {
      const gearBox = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.08), materials.brassLamp);
      gearBox.position.set(isHingedLeaf ? (leafW - 0.12) : 0.12, handleY, side * 0.08);
      leafGroup.add(gearBox);

      const lever = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 0.06), materials.brassLamp);
      lever.position.set(isHingedLeaf ? (leafW - 0.26) : 0.26, handleY, side * 0.12);
      leafGroup.add(lever);

      // Vertical brass rods running from gearbox to top and bottom of leaf
      const rodTop = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, leafH - handleY - 0.2, 8), materials.brassLamp);
      rodTop.position.set(isHingedLeaf ? (leafW - 0.12) : 0.12, handleY + (leafH - handleY - 0.2) / 2 + 0.14, side * 0.07);
      leafGroup.add(rodTop);

      const rodBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, handleY - 0.2, 8), materials.brassLamp);
      rodBottom.position.set(isHingedLeaf ? (leafW - 0.12) : 0.12, (handleY - 0.2) / 2 + 0.1, side * 0.07);
      leafGroup.add(rodBottom);
    }

    return leafGroup;
  }

  // Left French Door Leaf (Closed with Cremone bolt)
  const leftLeaf = createEuropeanLeaf(false);
  leftLeaf.position.set(-innerW / 2, 0.12, 0);
  group.add(leftLeaf);

  // Right French Door Leaf (Swung open outward to private balcony!)
  const rightLeafPivot = new THREE.Group();
  rightLeafPivot.position.set(innerW / 2, 0.12, 0);
  const rightLeaf = createEuropeanLeaf(true);
  rightLeaf.position.set(-leafW, 0, 0);
  rightLeafPivot.add(rightLeaf);
  rightLeafPivot.rotation.y = THREE.MathUtils.degToRad(openAngleDeg);
  group.add(rightLeafPivot);

  if (facing === 'side-right') {
    group.rotation.y = -Math.PI / 2;
  } else if (facing === 'side-left') {
    group.rotation.y = Math.PI / 2;
  } else if (facing === 'rear') {
    group.rotation.y = Math.PI;
  }

  parent.add(group);
  return group;
}

// Built-in Luxury Balcony Outdoor Furniture (Bistro Table, Armchairs, Flowering Planter)
function buildBalconyOutdoorFurniture(parent, cx, cy, cz) {
  const group = new THREE.Group();
  group.position.set(cx, cy, cz);

  // Round European Teak Bistro Table
  const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.1, 24), materials.teakWood);
  tableTop.position.set(0, 1.8, 0);
  tableTop.castShadow = true;
  group.add(tableTop);

  const tablePedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 1.75, 12), materials.darkTeakWood);
  tablePedestal.position.set(0, 0.88, 0);
  group.add(tablePedestal);

  const tableBase = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.08, 16), materials.darkTeakWood);
  tableBase.position.set(0, 0.04, 0);
  group.add(tableBase);

  // Two Bistro Armchairs
  for (let s of [-1.6, 1.6]) {
    const chairGroup = new THREE.Group();
    chairGroup.position.set(s, 0, 0);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.1, 1.1), materials.teakWood);
    seat.position.set(0, 1.1, 0);
    seat.castShadow = true;
    chairGroup.add(seat);

    for (let lx of [-0.45, 0.45]) {
      for (let lz of [-0.45, 0.45]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.05, 8), materials.darkTeakWood);
        leg.position.set(lx, 0.53, lz);
        chairGroup.add(leg);
      }
    }

    const back = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 0.08), materials.teakWood);
    back.position.set(0, 1.6, s < 0 ? -0.45 : -0.45);
    back.castShadow = true;
    chairGroup.add(back);

    chairGroup.rotation.y = s < 0 ? Math.PI / 4 : -Math.PI / 4;
    group.add(chairGroup);
  }

  // Terracotta Planter Pot with Flowering Bougainvillea
  const potGeo = new THREE.CylinderGeometry(0.45, 0.32, 0.85, 16);
  const pot = new THREE.Mesh(potGeo, materials.plinthLaterite);
  pot.position.set(-4.5, 0.43, 0.6);
  pot.castShadow = true;
  group.add(pot);

  const plantGeo = new THREE.DodecahedronGeometry(0.65, 1);
  const plantMat = new THREE.MeshStandardMaterial({ color: 0x1f6629, roughness: 0.8 });
  const plant = new THREE.Mesh(plantGeo, plantMat);
  plant.position.set(-4.5, 1.15, 0.6);
  group.add(plant);

  // Pink bougainvillea flowers
  const flowerMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.5 });
  for (let f = 0; f < 5; f++) {
    const fl = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 0), flowerMat);
    fl.position.set(-4.5 + (Math.random() - 0.5) * 0.7, 1.25 + (Math.random() - 0.5) * 0.4, 0.6 + (Math.random() - 0.5) * 0.7);
    group.add(fl);
  }

  parent.add(group);
  return group;
}

// Authentic Black Sintex Water Tank (visible peeking behind roof ridge as in photo)
function buildSintexWaterTank(parent, x, y, z) {
  const tankGroup = new THREE.Group();
  tankGroup.position.set(x, y, z);

  // Cylindrical Main Tank Body
  const tankGeo = new THREE.CylinderGeometry(1.4, 1.4, 2.5, 24);
  const tank = new THREE.Mesh(tankGeo, materials.sintexTank);
  tank.position.set(0, 1.25, 0);
  tank.castShadow = true;
  tankGroup.add(tank);

  // Ribbed Reinforcement Rings around tank body
  for (let r = 0.4; r <= 2.2; r += 0.5) {
    const ringGeo = new THREE.TorusGeometry(1.42, 0.05, 8, 24);
    const ring = new THREE.Mesh(ringGeo, materials.sintexTank);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, r, 0);
    tankGroup.add(ring);
  }

  // Top Domed Lid
  const lidGeo = new THREE.CylinderGeometry(1.0, 1.45, 0.4, 24);
  const lid = new THREE.Mesh(lidGeo, materials.sintexTank);
  lid.position.set(0, 2.6, 0);
  tankGroup.add(lid);

  // White Brand Accent Stripe (simulating "SINTEX" white logo)
  const logoBand = new THREE.Mesh(new THREE.CylinderGeometry(1.43, 1.43, 0.35, 24), materials.whiteTrim);
  logoBand.position.set(0, 1.8, 0);
  tankGroup.add(logoBand);

  parent.add(tankGroup);
}

// Traditional Charupadi Bench Seating (Built-in wooden sit-out bench from reference photo)
function buildCharupadiSeating(parent, x1, y, z1, x2, y2, z2) {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);

  const group = new THREE.Group();
  group.position.set(x1, y, z1);
  group.rotation.y = -angle;

  // Solid dark teak bench seat
  const seat = new THREE.Mesh(new THREE.BoxGeometry(length, 0.35, 1.2), materials.darkTeakWood);
  seat.position.set(length / 2, 1.3, 0);
  seat.castShadow = true;
  group.add(seat);

  // Slanted ergonomic backrest (Charupadi profile)
  const backrest = new THREE.Mesh(new THREE.BoxGeometry(length, 0.35, 0.8), materials.darkTeakWood);
  backrest.position.set(length / 2, 2.3, -0.35);
  backrest.rotation.x = THREE.MathUtils.degToRad(18);
  backrest.castShadow = true;
  group.add(backrest);

  // Vertical turned balusters below seat
  const numSpindles = Math.max(2, Math.floor(length / 0.8));
  const spacing = length / numSpindles;
  for (let i = 0; i <= numSpindles; i++) {
    const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.1, 8), materials.darkTeakWood);
    spindle.position.set(i * spacing, 0.65, 0);
    group.add(spindle);
  }

  parent.add(group);
}

// House Model Assembly
function buildHouseModel() {
  groundFloorGroup = new THREE.Group();
  firstFloorGroup = new THREE.Group();
  roofGroup = new THREE.Group();
  dimensionGroup = new THREE.Group();

  // Coordinate Reference:
  // House Footprint: Width (X) = 30 ft (-15 to +15), Depth (Z) = 30 ft (-15 to +15)
  // Height: Ground floor = Y: 0 to 10.5 ft (Plinth = 0 to 2.5 ft, Ceiling = 10.5 ft)
  // First floor = Y: 10.5 to 20.5 ft
  // Roof = Y: 20.5 to 31 ft (Pitch ~ 38°)

  // ==========================================
  // 1. GROUND FLOOR GROUP
  // ==========================================

  // (A) Elevated Laterite Plinth (Foundation Base - aligned front facade)
  // Left side is Porch and Right side is Master Bedroom 1, both flush on front plane at Z = 14.6!
  const plinthMainGeo = new THREE.BoxGeometry(30.6, 2.5, 30.2);
  const plinthMain = new THREE.Mesh(plinthMainGeo, materials.plinthLaterite);
  plinthMain.position.set(0, 1.25, -0.1);
  plinthMain.receiveShadow = true;
  plinthMain.castShadow = true;
  groundFloorGroup.add(plinthMain);

  // Plinth Steps leading to Porch (Front Left ONLY: X: -6.5, Z: 15.2 to 17.5)
  for (let s = 0; s < 3; s++) {
    const stepGeo = new THREE.BoxGeometry(7.5 - s * 0.8, 0.7, 1.1);
    const step = new THREE.Mesh(stepGeo, materials.plinthLaterite);
    step.position.set(-6.5, 0.35 + s * 0.7, 15.6 + (2 - s) * 1.0);
    step.receiveShadow = true;
    step.castShadow = true;
    groundFloorGroup.add(step);
  }

  // Ground Floor Slab (Kota Stone)
  const floorMainGeo = new THREE.BoxGeometry(30, 0.4, 29.8);
  const floorMain = new THREE.Mesh(floorMainGeo, materials.floorKotaStone);
  floorMain.position.set(0, 2.5, -0.1);
  floorMain.receiveShadow = true;
  groundFloorGroup.add(floorMain);

  // Decorative tropical garden planter bed along the base of Master Bedroom 1's front wall (Z: 15.2 to 16.6)
  const planterGeo = new THREE.BoxGeometry(14.0, 0.5, 1.4);
  const planter = new THREE.Mesh(planterGeo, materials.plinthLaterite);
  planter.position.set(7.5, 0.25, 15.6);
  planter.castShadow = true;
  planter.receiveShadow = true;
  groundFloorGroup.add(planter);

  // Ornamental shrubs / flowering bushes in front of Master Bedroom 1
  const shrubMat = new THREE.MeshStandardMaterial({ color: 0x2e6b28, roughness: 0.8 });
  for (let sx of [2.0, 4.8, 7.5, 10.2, 13.0]) {
    const shrub = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55 + Math.random() * 0.2, 1), shrubMat);
    shrub.position.set(sx, 0.85, 15.6 + (Math.random() - 0.5) * 0.3);
    shrub.castShadow = true;
    groundFloorGroup.add(shrub);
  }

  // (B) Front Porch (Otla/Padwi): X: -15 to 0, Z: 9.6 to 14.6 (Front line aligned with Master Bedroom at Z = 14.6)
  // Two Sturdy Carved Wooden Teak Columns
  const colGeo = new THREE.CylinderGeometry(0.55, 0.65, 8, 16);
  const col1 = new THREE.Mesh(colGeo, materials.carvedColumn);
  col1.position.set(-13.5, 6.5, 14);
  col1.castShadow = true;
  groundFloorGroup.add(col1);

  const col2 = new THREE.Mesh(colGeo, materials.carvedColumn);
  col2.position.set(-0.8, 6.5, 14);
  col2.castShadow = true;
  groundFloorGroup.add(col2);

  // Built-in Traditional Charupadi Benches on Porch
  // Left flank, front-left wing, front-right wing, and right flank along the Master Bedroom dividing wall
  buildCharupadiSeating(groundFloorGroup, -13.5, 2.5, 10.2, -13.5, 2.5, 14.0); // Left flank
  buildCharupadiSeating(groundFloorGroup, -0.6, 2.5, 10.2, -0.6, 2.5, 14.0);   // Right flank against Master Bedroom wall!
  buildCharupadiSeating(groundFloorGroup, -13.5, 2.5, 14.0, -9.5, 2.5, 14.0);  // Front-left wing
  buildCharupadiSeating(groundFloorGroup, -4.5, 2.5, 14.0, -0.8, 2.5, 14.0);   // Front-right wing

  // Porch Timber Header Beam
  const porchBeamGeo = new THREE.BoxGeometry(14.5, 0.8, 1.0);
  const porchBeam = new THREE.Mesh(porchBeamGeo, materials.teakWood);
  porchBeam.position.set(-7.25, 10.2, 14);
  porchBeam.castShadow = true;
  groundFloorGroup.add(porchBeam);

  // GROUND FLOOR SLOPING TERRACOTTA ROOF EAVE (Konkan Style Awning, switchable)
  porchKonkanRoof = new THREE.Group();
  const porchRoofGeo = new THREE.BoxGeometry(15.2, 0.55, 5.5);
  const porchRoof = new THREE.Mesh(porchRoofGeo, materials.roofTile);
  porchRoof.position.set(-7.3, 10.8, 14.8);
  porchRoof.rotation.x = THREE.MathUtils.degToRad(22);
  porchRoof.castShadow = true;
  porchKonkanRoof.add(porchRoof);

  const porchSoffit = new THREE.Mesh(new THREE.BoxGeometry(15.4, 0.2, 5.6), materials.whiteSoffit);
  porchSoffit.position.set(-7.3, 10.55, 14.8);
  porchSoffit.rotation.x = THREE.MathUtils.degToRad(22);
  porchKonkanRoof.add(porchSoffit);
  groundFloorGroup.add(porchKonkanRoof);

  // (C) Exterior & Interior Walls (Ground Floor: Y: 2.5 to 10.5, Height = 8)
  buildGroundWalls(groundFloorGroup);

  // (D) Doglegged Wooden Staircase (X: -14 to -5, Z: -14 to -4)
  buildStaircase(groundFloorGroup);

  // (E) Furniture & Fixtures (Living room sofa, pooja mandir, kitchen counter)
  buildGroundInterior(groundFloorGroup);

  // ==========================================
  // 2. FIRST FLOOR GROUP (Duplex Level)
  // ==========================================

  // (A) First Floor Slab with "OPEN TO BELOW" Cutout!
  // 1. Right side slab covering Bed 2, Bed 3, Toilets (X: 0 to 15, Z: -15 to 14.6, depth = 29.6 ft)
  // Aligned forward to Z = 14.6 matching Bedroom 1 below!
  const slabRightGeo = new THREE.BoxGeometry(15, 0.6, 29.6);
  const slabRight = new THREE.Mesh(slabRightGeo, materials.floorTerracotta);
  slabRight.position.set(7.5, 10.5, -0.2);
  slabRight.receiveShadow = true;
  slabRight.castShadow = true;
  firstFloorGroup.add(slabRight);

  // 2. Rear staircase landing slab (X: -15 to 0, Z: -15 to -4)
  const slabRearGeo = new THREE.BoxGeometry(15, 0.6, 11);
  const slabRear = new THREE.Mesh(slabRearGeo, materials.floorTerracotta);
  slabRear.position.set(-7.5, 10.5, -9.5);
  slabRear.receiveShadow = true;
  firstFloorGroup.add(slabRear);

  // 3. Mezzanine Gallery Passage connecting stairs to Bed 2 (X: -4 to 0, Z: -4 to 10)
  const slabPassageGeo = new THREE.BoxGeometry(4, 0.6, 14);
  const slabPassage = new THREE.Mesh(slabPassageGeo, materials.floorTerracotta);
  slabPassage.position.set(-2, 10.5, 3);
  slabPassage.receiveShadow = true;
  firstFloorGroup.add(slabPassage);

  // 4. Single Large Unified Front Balcony Slab (spanning entire front: X: -14.8 to +14.8, Z: 9.6 to 14.6)
  const slabBalconyGeo = new THREE.BoxGeometry(29.6, 0.6, 5.0);
  const slabBalcony = new THREE.Mesh(slabBalconyGeo, materials.floorTerracotta);
  slabBalcony.position.set(0, 10.5, 12.1);
  slabBalcony.receiveShadow = true;
  firstFloorGroup.add(slabBalcony);

  // (B) Mezzanine & Balcony Wooden Railings (Overlooking "Open to Below"!)
  buildRailing(firstFloorGroup, -4, 10.8, -4, -4, 10.8, 10, 'mezzanine');
  buildRailing(firstFloorGroup, -4, 10.8, 10, 0, 10.8, 10, 'mezzanine');

  // Single Large Unified Front Balcony Railings (Seamless continuous front balustrade!)
  buildRailing(firstFloorGroup, -14.6, 10.8, 14.6, 14.6, 10.8, 14.6, 'balcony'); // Continuous across entire 29.2 ft front!
  buildRailing(firstFloorGroup, -14.6, 10.8, 9.6, -14.6, 10.8, 14.6, 'balcony');   // Left return
  buildRailing(firstFloorGroup, 14.6, 10.8, 9.6, 14.6, 10.8, 14.6, 'balcony');    // Right return

  // Four Symmetrically Spaced Dark Carved Teak Pillars across the Single Large Balcony
  const colUpperGeo = new THREE.CylinderGeometry(0.5, 0.58, 8.5, 16);
  const colU1 = new THREE.Mesh(colUpperGeo, materials.darkTeakWood);
  colU1.position.set(-13.5, 15.0, 14.2);
  colU1.castShadow = true;
  firstFloorGroup.add(colU1);

  const colU2 = new THREE.Mesh(colUpperGeo, materials.darkTeakWood);
  colU2.position.set(-4.5, 15.0, 14.2);
  colU2.castShadow = true;
  firstFloorGroup.add(colU2);

  const colU3 = new THREE.Mesh(colUpperGeo, materials.darkTeakWood);
  colU3.position.set(4.5, 15.0, 14.2);
  colU3.castShadow = true;
  firstFloorGroup.add(colU3);

  const colU4 = new THREE.Mesh(colUpperGeo, materials.darkTeakWood);
  colU4.position.set(13.5, 15.0, 14.2);
  colU4.castShadow = true;
  firstFloorGroup.add(colU4);

  // Grand Balcony Teak Header Beam connecting all 4 pillars
  const grandBalcBeam = new THREE.Mesh(new THREE.BoxGeometry(29.6, 0.7, 0.8), materials.darkTeakWood);
  grandBalcBeam.position.set(0, 19.1, 14.2);
  grandBalcBeam.castShadow = true;
  firstFloorGroup.add(grandBalcBeam);

  // Left First-Floor Open Terrace Parapet (horizontal railing matching photo)
  const terraceParapet = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.8, 4.0), materials.wallExterior);
  terraceParapet.position.set(-14.8, 12.2, 12.0);
  firstFloorGroup.add(terraceParapet);

  // Warm Exterior Sconce Lighting on Front Facade & Balconies
  function addWallSconce(parent, sx, sy, sz) {
    const sFix = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.8, 0.35), materials.darkTeakWood);
    sFix.position.set(sx, sy, sz);
    parent.add(sFix);
    const sLight = new THREE.PointLight(0xffb850, 1.3, 10);
    sLight.position.set(sx, sy, sz + 0.3);
    parent.add(sLight);
  }
  addWallSconce(groundFloorGroup, 2.0, 6.8, 15.0);
  addWallSconce(groundFloorGroup, 13.0, 6.8, 15.0);
  addWallSconce(firstFloorGroup, 2.5, 15.5, 10.0);
  addWallSconce(firstFloorGroup, 12.5, 15.5, 10.0);

  // (C) First Floor Walls & Bedrooms (Y: 10.8 to 19.5, Height = 8.7)
  buildFirstFloorWalls(firstFloorGroup);

  // (D) First Floor Bedroom Furnishings
  buildFirstInterior(firstFloorGroup);

  // ==========================================
  // 3. ROOF GROUP (Dual-Style: Modern Split Skillion & Traditional Konkan)
  // ==========================================
  modernRoofGroup = new THREE.Group();
  konkanRoofGroup = new THREE.Group();

  buildModernSkillionRoof(modernRoofGroup);
  buildKonkanSlantRoof(konkanRoofGroup);

  roofGroup.add(modernRoofGroup);
  roofGroup.add(konkanRoofGroup);

  updateRoofStyleVisibility();

  // ==========================================
  // 4. ROOM HITBOXES FOR 3D CLICK / INSPECTION
  // ==========================================
  buildRoomHitboxes();

  // Add all main groups to scene
  scene.add(groundFloorGroup);
  scene.add(firstFloorGroup);
  scene.add(roofGroup);
  scene.add(dimensionGroup);
}

// Build Ground Floor Walls
function buildGroundWalls(parent) {
  // Helpers to add wall blocks
  function addWall(x, y, z, w, h, d, isExterior = true) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, isExterior ? materials.wallExterior : materials.wallInterior);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  const h = 8;
  const y = 2.5 + h / 2; // Y: 6.5

  // Exterior Perimeter Walls with Openings:
  // Rear Wall (Z = -15): Spanning from -15 to +15
  addWall(0, y, -14.6, 30, h, 0.8, true);

  // Left Wall (X = -15): Spanning from -15 to 10
  // Left Wall (X = -15): Spanning from -15 to 10
  addWall(-14.6, y, -2.5, 0.8, h, 25, true);

  // ========================================================
  // RIGHT EXTERIOR WALL WITH KITCHEN EXIT DOOR (X = +14.6)
  // Per Drawing A100: Kitchen has an exterior door on the right wall
  // leading out to an elevated 5' × 11' 1¾" platform and 4 steps down
  // ========================================================
  
  // Section 1: Kitchen rear sink wall (Z = -15 to -9.6, length = 5.4)
  addWall(14.6, y, -12.3, 0.8, h, 5.4, true);

  // Kitchen side window above sink (facing right garden)
  addWindowWithChajja(parent, 15.2, 6.5, -12.3, 3.5, 3.0, 'side-right');

  // Section 2: Lintel above Kitchen Exit Door (Y: 7.8 to 10.5, height = 2.7, Z: -9.6 to -6.4)
  addWall(14.6, 9.15, -8.0, 0.8, 2.7, 3.2, true);

  // Section 3: Right wall passing Toilets & Master Bedroom 1 (Z = -6.4 to +14.6, length = 21.0 ft)
  addWall(14.6, y, 4.1, 0.8, h, 21.0, true);

  // (A) Kitchen Teakwood Exterior Exit Door Frame & Leaf (Ground Floor)
  const kDoorGroup = new THREE.Group();
  kDoorGroup.position.set(14.6, 2.5, -6.4); // Hinge pivot at wall opening edge
  
  // Door frame casing
  const kFrameMat = materials.darkTeakWood || materials.teakWood;
  const kFrameGeo = new THREE.BoxGeometry(0.85, 5.4, 0.15);
  const kFrameL = new THREE.Mesh(kFrameGeo, kFrameMat);
  kFrameL.position.set(0, 2.7, 0);
  kDoorGroup.add(kFrameL);

  const kFrameR = new THREE.Mesh(kFrameGeo, kFrameMat);
  kFrameR.position.set(0, 2.7, -3.2);
  kDoorGroup.add(kFrameR);

  // Door leaf - slightly ajar (swung outward ~30° towards side yard)
  const kDoorLeafGeo = new THREE.BoxGeometry(0.18, 5.2, 3.0);
  const kDoorLeaf = new THREE.Mesh(kDoorLeafGeo, materials.teakWood);
  kDoorLeaf.position.set(0, 2.6, -1.5);
  kDoorGroup.rotation.y = THREE.MathUtils.degToRad(-35); // Visibly open outward
  kDoorGroup.castShadow = true;
  kDoorGroup.add(kDoorLeaf);

  // Door Brass Handle
  const kHandleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8);
  const kHandle = new THREE.Mesh(kHandleGeo, materials.brassLamp);
  kHandle.position.set(0.14, 2.6, -2.7);
  kDoorGroup.add(kHandle);
  parent.add(kDoorGroup);

  // (B) Weather Protection: Ground floor utility yard is sheltered directly by the Bedroom 3 Balcony slab overhead!
  // Outdoor Warm Teak Casing Lantern above Kitchen Exit Door
  const kLantern = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.4), materials.darkTeakWood);
  kLantern.position.set(15.1, 8.4, -8.0);
  parent.add(kLantern);

  const kLight = new THREE.PointLight(0xffbe6b, 1.2, 12);
  kLight.position.set(15.5, 8.4, -8.0);
  parent.add(kLight);

  // (C) Elevated Side Utility Platform (5' × 11' 1¾" as specified in Drawing A100)
  // X: 15.0 to 20.0 (5ft setback), Z: -14.6 to -3.5 (11.1ft length)
  const platGeo = new THREE.BoxGeometry(5.0, 2.5, 11.2);
  const platform = new THREE.Mesh(platGeo, materials.plinthLaterite);
  platform.position.set(17.5, 1.25, -9.05);
  platform.receiveShadow = true;
  platform.castShadow = true;
  parent.add(platform);

  // Platform Surface (Polished Kota Stone / Non-skid paving)
  const platTopGeo = new THREE.BoxGeometry(5.1, 0.15, 11.3);
  const platTop = new THREE.Mesh(platTopGeo, materials.floorKotaStone);
  platTop.position.set(17.5, 2.52, -9.05);
  platTop.receiveShadow = true;
  parent.add(platTop);

  // (D) Exterior Descending Steps to Garden Yard ("DN 4 3 2 1" from CAD Plan)
  // 4 steps stepping down from Y = 2.5 down to Y = 0
  const stepCount = 4;
  const stepWidth = 4.8;
  const stepTread = 0.85;
  const stepRiser = 2.5 / stepCount; // 0.625 ft per riser
  for (let i = 0; i < stepCount; i++) {
    const sGeo = new THREE.BoxGeometry(stepWidth, stepRiser * (stepCount - i), stepTread);
    const sMesh = new THREE.Mesh(sGeo, materials.plinthLaterite);
    sMesh.position.set(17.4, (stepRiser * (stepCount - i)) / 2, -3.5 + (i + 0.5) * stepTread);
    sMesh.receiveShadow = true;
    sMesh.castShadow = true;
    parent.add(sMesh);
  }

  // Front Wall (Right Side: Master Bedroom 1 facade, X: 0 to 14.6, Z = 14.6 - aligned with Porch front line!)
  addWall(7.3, y, 14.6, 14.6, h, 0.8, true);

  // Dividing Wall between Porch (left) and Master Bedroom 1 (right) (X = 0, Z: 9.6 to 14.6)
  // Completely encloses the right side of the porch, eliminating any empty gap!
  addWall(0, y, 12.1, 0.8, h, 5.0, true);

  // Living Room Front Wall (Behind Porch: X = -15 to 0, Z = 9.6)
  // Completely enclosed with central grand entrance door and vertical glazed sidelights
  addWall(-12.2, y, 9.6, 5.6, h, 0.8, true); // Left section (-15 to -9.4)
  addWall(-1.8, y, 9.6, 3.6, h, 0.8, true);  // Right section (-3.6 to 0)
  addWall(-6.5, y + 2.1, 9.6, 5.8, 4.5, 0.8, true); // Lintel above door (Y: 6.8 to 10.5)

  // (1) Grand Teakwood Entrance Double Doors (Center: X = -6.5, Y = 2.5 to 7.7)
  const dFrameGeo = new THREE.BoxGeometry(4.6, 5.4, 0.35);
  const dFrame = new THREE.Mesh(dFrameGeo, materials.darkTeakWood);
  dFrame.position.set(-6.5, 5.2, 9.6);
  parent.add(dFrame);

  // Double door leaves with traditional raised panels
  for (let s of [-1.05, 1.05]) {
    const dLeafGeo = new THREE.BoxGeometry(2.0, 5.0, 0.2);
    const dLeaf = new THREE.Mesh(dLeafGeo, materials.teakWood);
    dLeaf.position.set(-6.5 + s, 5.2, 9.65);
    parent.add(dLeaf);

    // Vertical Brass Pull Handle
    const bHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.1, 8), materials.brassLamp);
    bHandle.position.set(-6.5 + s * 0.2, 5.2, 9.8);
    parent.add(bHandle);
  }

  // (2) Vertical Glazed Sidelight Windows with Safety Grills flanking Entrance
  addPhotoMatchingWindow(parent, -11.5, 6.4, 9.8, 2.8, 4.2); // Left sidelight
  addPhotoMatchingWindow(parent, -2.2, 6.4, 9.8, 2.4, 4.2);  // Right sidelight

  // Interior Partitions:
  // Spine Wall separating Living / Stairs from Kitchen / Bed 1 (X = 0, Z: -15 to 10)
  // With opening for hallway
  addWall(0, y, -9.5, 0.6, h, 11, false);
  addWall(0, y, 5.5, 0.6, h, 9, false);
  addWall(0, y + 2.5, -1.5, 0.6, 3, 5, false); // Hallway lintel

  // Wall separating Kitchen (rear) from Bedroom 1 (front) (Z = -2, X: 0 to 15)
  addWall(7.5, y, -2, 15, h, 0.6, false);

  // Store room wall in Kitchen (X: 9 to 15, Z: -11)
  addWall(12, y, -11, 6, h, 0.5, false);

  // Pooja Niche Wall (in Living Room corner next to stairs: X = -5, Z: -4 to 1)
  addWall(-5, y, -1.5, 0.5, h, 5, false);

  // (3) Stone Cladding Accent Panel on Bedroom 1 Facade (matching reference photo)
  addStoneCladdingPanel(parent, 7.3, 6.4, 14.95, 13.0, 6.4);

  // (4) Photo-Matching 4-Pane Casement Window on Bedroom 1 Facade (sheltered by continuous eave above!)
  addPhotoMatchingWindow(parent, 7.3, 6.4, 15.05, 5.8, 4.0);

  // Side & Rear Windows with Chajjas
  addWindowWithChajja(parent, 15.2, 6.5, 6.0, 4.0, 3.5, 'side-right'); // Bed 1 side window
  addWindowWithChajja(parent, 7.5, 6.5, -15.2, 4.0, 3.0, 'rear');    // Kitchen rear window
}

// Build Doglegged Staircase
function buildStaircase(parent) {
  const stepsFlight1 = 10;
  const riser = 0.4;
  const tread = 0.9;
  const width = 3.6;

  // Flight 1: Ascends from living room towards rear (Z: -4 to -13, X = -6.5)
  for (let i = 0; i < stepsFlight1; i++) {
    const stepGeo = new THREE.BoxGeometry(width, riser, tread);
    const step = new THREE.Mesh(stepGeo, materials.teakWood);
    step.position.set(-6.8, 2.7 + (i + 0.5) * riser, -4.5 - i * tread);
    step.castShadow = true;
    step.receiveShadow = true;
    parent.add(step);
  }

  // Mid Landing (Y: 6.7, X: -14 to -5, Z: -14.5)
  const landingGeo = new THREE.BoxGeometry(8.5, 0.4, 4);
  const landing = new THREE.Mesh(landingGeo, materials.teakWood);
  landing.position.set(-10, 6.7, -13);
  landing.receiveShadow = true;
  parent.add(landing);

  // Flight 2: Ascends from mid landing up to First Floor Mezzanine (Z: -13 to -5, X = -12)
  for (let i = 0; i < 9; i++) {
    const stepGeo = new THREE.BoxGeometry(width, riser, tread);
    const step = new THREE.Mesh(stepGeo, materials.teakWood);
    step.position.set(-11.5, 6.9 + (i + 0.5) * riser, -12 + i * tread);
    step.castShadow = true;
    step.receiveShadow = true;
    parent.add(step);
  }
}

// Ground Floor Interior Props
function buildGroundInterior(parent) {
  // Living Room Sofa Set
  const sofaGeo = new THREE.BoxGeometry(6.5, 1.8, 2.6);
  const sofaMat = new THREE.MeshStandardMaterial({ color: 0x3d4b68, roughness: 0.8 });
  const sofa = new THREE.Mesh(sofaGeo, sofaMat);
  sofa.position.set(-7, 3.6, 2);
  sofa.castShadow = true;
  parent.add(sofa);

  // Teak Coffee Table
  const tableGeo = new THREE.BoxGeometry(3.6, 1.2, 2.2);
  const table = new THREE.Mesh(tableGeo, materials.teakWood);
  table.position.set(-7, 3.3, 5.5);
  table.castShadow = true;
  parent.add(table);

  // Pooja Mandir (Carved shrine in Pooja niche)
  const mandirGeo = new THREE.BoxGeometry(2.4, 4.2, 1.5);
  const mandir = new THREE.Mesh(mandirGeo, materials.carvedColumn);
  mandir.position.set(-3.2, 4.8, -1.5);
  mandir.castShadow = true;
  parent.add(mandir);

  // Mandir Diya/Brass lamp
  const lampGeo = new THREE.CylinderGeometry(0.2, 0.4, 1.2, 8);
  const lamp = new THREE.Mesh(lampGeo, materials.brassLamp);
  lamp.position.set(-3.2, 4.8, -0.6);
  parent.add(lamp);

  // Kitchen Granite Counter (L-Shape along Rear & Right wall, ending before exit door)
  const counterMat = new THREE.MeshStandardMaterial({ color: 0x1f2429, roughness: 0.2 });
  
  // Rear Counter with Gas Hob (X: 2.5 to 12.5, Z: -13.5)
  const counter1Geo = new THREE.BoxGeometry(10, 2.4, 2.2);
  const counter1 = new THREE.Mesh(counter1Geo, counterMat);
  counter1.position.set(7.5, 3.9, -13.5);
  counter1.castShadow = true;
  parent.add(counter1);

  // Gas Hob Cooktop
  const hobMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.8 });
  const hob = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 1.8), hobMat);
  hob.position.set(7.5, 5.15, -13.5);
  parent.add(hob);

  // Right Sink Counter (ends at Z = -9.8 to allow clear passage to kitchen exit door!)
  const counter2Geo = new THREE.BoxGeometry(2.2, 2.4, 4.8);
  const counter2 = new THREE.Mesh(counter2Geo, counterMat);
  counter2.position.set(13.5, 3.9, -12.2);
  counter2.castShadow = true;
  parent.add(counter2);

  // Stainless Steel Double Sink on right counter
  const sinkMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.2, metalness: 0.9 });
  const sink = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 2.6), sinkMat);
  sink.position.set(13.5, 5.12, -12.2);
  parent.add(sink);

  // Chrome Gooseneck Faucet
  const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 8), sinkMat);
  faucet.position.set(14.2, 5.5, -12.2);
  parent.add(faucet);

  // Solid Teakwood Dining Table & Chairs in Kitchen center (per CAD Drawing A100)
  const dinTable = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.2, 3.0), materials.teakWood);
  dinTable.position.set(7.5, 4.0, -7.5);
  dinTable.castShadow = true;
  parent.add(dinTable);
  
  // Table legs
  for (let lx of [-1.9, 1.9]) {
    for (let lz of [-1.2, 1.2]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8), materials.teakWood);
      leg.position.set(7.5 + lx, 3.25, -7.5 + lz);
      parent.add(leg);
    }
  }

  // Ground Bedroom Bed
  const bedMat = new THREE.MeshStandardMaterial({ color: 0xd9caa5, roughness: 0.7 });
  const bedGeo = new THREE.BoxGeometry(6.5, 1.6, 6.8);
  const bed = new THREE.Mesh(bedGeo, bedMat);
  bed.position.set(8.5, 3.5, 4.5);
  bed.castShadow = true;
  parent.add(bed);
}

// First Floor Walls & Details
function buildFirstFloorWalls(parent) {
  function addWall(x, y, z, w, h, d, isExterior = true) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, isExterior ? materials.wallExterior : materials.wallInterior);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  const h = 8.7;
  const y = 10.8 + h / 2; // Y: 15.15

  // Rear Wall (Z = -15): Across full width
  addWall(0, y, -14.6, 30, h, 0.8, true);

  // Left Wall (Above Living Room: Double-Height Void Wall!)
  // The left exterior wall extends continuously from ground to roof!
  addWall(-14.6, y, -2.5, 0.8, h, 25, true);

  // ========================================================
  // RIGHT EXTERIOR WALL WITH BEDROOM 3 BALCONY DOOR (X = +14.6)
  // EXACTLY ABOVE THE GROUND FLOOR KITCHEN EXIT DOOR — NO WINDOW AS REQUESTED!
  // ========================================================

  // European Full-Glass French Door centered on Bedroom 3 Balcony at Z = -9.05 (width = 5.6 ft, height = 6.8 ft)
  // Door opening is Z: -11.85 to -6.25

  // Section 1: Bedroom 3 rear wall segment (Z = -15.0 to -11.85, length = 3.15 ft) — NO WINDOW!
  addWall(14.6, y, -13.425, 0.8, h, 3.15, true);

  // Section 2: Lintel above European Full-Glass French Door (Y: 17.6 to 19.5, height = 1.9 ft, Z: -11.85 to -6.25)
  addWall(14.6, 18.55, -9.05, 0.8, 1.9, 5.6, true);

  // Section 3: Right wall passing Bedroom 2 & Toilets (Z = -6.25 to +14.6, length = 20.85 ft)
  addWall(14.6, y, 4.175, 0.8, h, 20.85, true);

  // (A) Bedroom 3 European Full-Glass French Balcony Door (porte-fenêtre)
  // Identical European styling to Bedroom 2: floor-to-ceiling glass, slim astragal bars, polished brass cremone bolt!
  addEuropeanFullGlassFrenchDoor(parent, 14.6, 10.8, -9.05, 5.6, 6.8, 'side-right', 35);

  // Bedroom 3 Balcony Outdoor Seating & Terracotta Planters
  const b3BistroGroup = new THREE.Group();
  b3BistroGroup.position.set(17.1, 10.8, -12.5); // Rear corner of balcony
  
  const b3Table = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.08, 18), materials.teakWood);
  b3Table.position.set(0, 1.8, 0);
  b3Table.castShadow = true;
  b3BistroGroup.add(b3Table);

  const b3TableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 1.76, 8), materials.darkTeakWood);
  b3TableLeg.position.set(0, 0.88, 0);
  b3BistroGroup.add(b3TableLeg);

  for (let cz of [-1.1, 1.1]) {
    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.08, 0.85), materials.teakWood);
    chair.position.set(0, 1.1, cz);
    chair.castShadow = true;
    b3BistroGroup.add(chair);

    const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.85, 0.85), materials.teakWood);
    chairBack.position.set(cz < 0 ? 0.35 : -0.35, 1.55, cz);
    b3BistroGroup.add(chairBack);
  }

  // Terracotta flower planter at front corner of balcony (Z = -4.5)
  const potGeo = new THREE.CylinderGeometry(0.5, 0.35, 1.0, 12);
  const pot = new THREE.Mesh(potGeo, materials.roofTile);
  pot.position.set(18.5, 11.3, -4.5);
  parent.add(pot);

  const flowerGeo = new THREE.DodecahedronGeometry(0.65);
  const flowerMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.8 }); // Flowering pink bougainvillea
  const flower = new THREE.Mesh(flowerGeo, flowerMat);
  flower.position.set(18.5, 12.0, -4.5);
  parent.add(flower);

  parent.add(b3BistroGroup);

  // (B) Bedroom 3 Side Balcony Slab (Directly Above Kitchen Exit Door Platform)
  // X: 14.6 to 19.6 (width 5.0 ft), Z: -14.6 to -3.5 (depth 11.2 ft, center Z = -9.05)
  const b3BalcGeo = new THREE.BoxGeometry(5.0, 0.6, 11.2);
  const b3Balc = new THREE.Mesh(b3BalcGeo, materials.floorTerracotta);
  b3Balc.position.set(17.1, 10.5, -9.05);
  b3Balc.receiveShadow = true;
  b3Balc.castShadow = true;
  parent.add(b3Balc);

  // Balcony ceiling underside (crisp white soffit with teak trim)
  const b3BalcSoffit = new THREE.Mesh(new THREE.BoxGeometry(5.1, 0.12, 11.3), materials.whiteSoffit);
  b3BalcSoffit.position.set(17.1, 10.15, -9.05);
  parent.add(b3BalcSoffit);

  // (C) Balcony Railings on all 3 open sides
  // Rear rail: Z = -14.6, X: 14.6 to 19.6
  buildRailing(parent, 14.6, 10.8, -14.6, 19.6, 10.8, -14.6, 'balcony');
  // Outer right rail: X = 19.6, Z: -14.6 to -3.5
  buildRailing(parent, 19.6, 10.8, -14.6, 19.6, 10.8, -3.5, 'balcony');
  // Front rail: Z = -3.5, X: 19.6 to 14.6
  buildRailing(parent, 19.6, 10.8, -3.5, 14.6, 10.8, -3.5, 'balcony');

  // (D) Two Dark Teakwood Support Columns rising from Ground Platform to Balcony Corners
  for (let cz of [-14.0, -4.1]) {
    const colPost = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 8.0, 16), materials.darkTeakWood);
    colPost.position.set(19.2, 6.5, cz);
    colPost.castShadow = true;
    groundFloorGroup.add(colPost);
  }

  // (E) Slanted Mangalore Terracotta Roof Canopy over Bedroom 3 Balcony
  const b3RoofGeo = new THREE.BoxGeometry(5.8, 0.45, 12.0);
  const b3Roof = new THREE.Mesh(b3RoofGeo, materials.roofTile);
  b3Roof.position.set(17.3, 19.5, -9.05);
  b3Roof.rotation.z = THREE.MathUtils.degToRad(-15);
  b3Roof.castShadow = true;
  parent.add(b3Roof);

  // Wooden corbel brackets supporting the canopy
  for (let bz of [-13.5, -9.0, -4.5]) {
    const bracketGeo = new THREE.BoxGeometry(3.0, 0.5, 0.4);
    const bracket = new THREE.Mesh(bracketGeo, materials.darkTeakWood);
    bracket.position.set(15.9, 19.0, bz);
    bracket.rotation.z = THREE.MathUtils.degToRad(-25);
    parent.add(bracket);
  }

  // ========================================================
  // SINGLE LARGE UNIFIED FIRST-FLOOR FRONT BALCONY (Full Facade: X: -14.8 to +14.8)
  // Joined into a single expansive terrace seamlessly connecting Bedroom 2 and Mezzanine Gallery!
  // ========================================================

  // Bedroom 2 Front Wall (Z = 9.6): Features the European Full-Glass French Door opening onto the Grand Balcony!
  // Left wall section (X: 0 to 4.0)
  addWall(2.0, y, 9.6, 4.0, h, 0.8, true);
  // Right wall section (X: 10.6 to 14.6)
  addWall(12.6, y, 9.6, 4.0, h, 0.8, true);
  // Lintel above European French door (Y: 17.6 to 19.5, height = 1.9 ft, X: 4.0 to 10.6)
  addWall(7.3, 18.55, 9.6, 6.6, 1.9, 0.8, true);

  // Authentic European Full-Glass French Balcony Door (porte-fenêtre) opening directly from Bedroom 2 onto the grand balcony!
  addEuropeanFullGlassFrenchDoor(parent, 7.3, 10.8, 9.6, 6.6, 6.8, 'front', -38);

  // Stone Cladding Accent Panels flanking the European French door on Bedroom 2's front wall
  addStoneCladdingPanel(parent, 2.0, 14.8, 9.95, 3.4, 5.8);
  addStoneCladdingPanel(parent, 12.6, 14.8, 9.95, 3.4, 5.8);

  // Grand Balcony Outdoor Furniture (Teak Bistro Table, Armchairs & Flowering Bougainvillea Planter)
  buildBalconyOutdoorFurniture(parent, 7.3, 10.8, 12.2);

  // Front Wall at Balcony (X: -15 to 0, Z = 9.6)
  // Completely enclosed with glazed double balcony doors and sidelights
  addWall(-12.2, y, 9.6, 5.6, h, 0.8, true); // Left section (-15 to -9.4)
  addWall(-1.8, y, 9.6, 3.6, h, 0.8, true);  // Right section (-3.6 to 0)
  addWall(-6.5, y + 2.1, 9.6, 5.8, 4.5, 0.8, true); // Lintel above balcony doors (Y: 15.1 to 19.5)

  // (1) Glazed Balcony Double Doors (Center: X = -6.5, Y = 10.8 to 16.6)
  const bDoorFrameGeo = new THREE.BoxGeometry(4.6, 5.8, 0.35);
  const bDoorFrame = new THREE.Mesh(bDoorFrameGeo, materials.darkTeakWood);
  bDoorFrame.position.set(-6.5, 13.7, 9.6);
  parent.add(bDoorFrame);

  // Glass door leaves with teak stiles
  for (let s of [-1.05, 1.05]) {
    const bLeafGlass = new THREE.Mesh(new THREE.BoxGeometry(1.9, 5.4, 0.1), materials.glassWindow);
    bLeafGlass.position.set(-6.5 + s, 13.7, 9.65);
    parent.add(bLeafGlass);

    // Teak door stile border
    const bStile = new THREE.Mesh(new THREE.BoxGeometry(0.18, 5.4, 0.22), materials.darkTeakWood);
    bStile.position.set(-6.5 + s * 0.2, 13.7, 9.68);
    parent.add(bStile);
  }

  // (2) Vertical Glazed Sidelight Windows flanking Balcony Doors
  addPhotoMatchingWindow(parent, -11.5, 15.0, 9.8, 2.8, 4.2); // Left sidelight
  addPhotoMatchingWindow(parent, -2.2, 15.0, 9.8, 2.4, 4.2);  // Right sidelight

  // (3) Single Large Unified Dark Teak Paneled Ceiling under Balcony Roof (Spanning full 29.6 ft width)
  const grandBalcCeilingGeo = new THREE.BoxGeometry(29.6, 0.3, 5.5);
  const grandBalcCeiling = new THREE.Mesh(grandBalcCeilingGeo, materials.darkTeakWood);
  grandBalcCeiling.position.set(0, 19.3, 12.1);
  parent.add(grandBalcCeiling);

  // Interior Partitions:
  // Wall between Bedroom 2 and Bedroom 3 (Z = 0, X: 0 to 15)
  addWall(7.5, y, 0, 15, h, 0.6, false);

  // Wall separating Mezzanine Gallery from Bedroom 2 & 3 (X = 0, Z: -15 to 10)
  addWall(0, y, -8, 0.6, h, 14, false);
  addWall(0, y, 6.5, 0.6, h, 7, false);
  addWall(0, y + 2.5, 1, 0.6, 3.7, 4, false); // Door lintel

  // Attached toilet partition in Bedroom 2
  addWall(4.5, y, 4.5, 0.5, h, 7, false);

  // Upper Side & Rear Windows with Chajjas
  addWindowWithChajja(parent, 15.2, 15.2, 5.0, 4.0, 3.5, 'side-right'); // Bed 2 side window
  // Bedroom 3 has NO window as requested by user and matching floor plan!

  // High Clerestory Windows on the double-height living room left wall!
  addWindowWithChajja(parent, -15.2, 15.5, 2.5, 7.0, 2.5, 'side-left');
}

// First Floor Interior Furnishings
function buildFirstInterior(parent) {
  // Bedroom 2 Master Bed (centered facing the European French door and private balcony!)
  const bedMat = new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.7 });
  const bedGeo = new THREE.BoxGeometry(6.5, 1.6, 7);
  const bed = new THREE.Mesh(bedGeo, bedMat);
  bed.position.set(7.3, 11.8, 4.5);
  bed.castShadow = true;
  parent.add(bed);

  // Bedroom 3 Bed (positioned against solid rear wall facing the European French door and private balcony!)
  const bed3Mat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.7 });
  const bed3Geo = new THREE.BoxGeometry(6.4, 1.6, 6.8);
  const bed3 = new THREE.Mesh(bed3Geo, bed3Mat);
  bed3.position.set(7.3, 11.8, -10.8);
  bed3.castShadow = true;
  parent.add(bed3);

  // Bedroom 3 Headboard against solid rear wall
  const hbGeo = new THREE.BoxGeometry(6.8, 3.0, 0.4);
  const hb = new THREE.Mesh(hbGeo, materials.teakWood);
  hb.position.set(7.3, 13.0, -14.4);
  parent.add(hb);

  // Twin bedside nightstands with warm reading lamps
  for (let sx of [3.2, 11.4]) {
    const nightstand = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.4), materials.teakWood);
    nightstand.position.set(sx, 11.4, -13.8);
    parent.add(nightstand);

    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.5, 8), materials.brassLamp);
    lampBase.position.set(sx, 12.25, -13.8);
    parent.add(lampBase);

    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.45, 8), materials.whiteTrim);
    shade.position.set(sx, 12.6, -13.8);
    parent.add(shade);
  }

  // Bedroom 3 Study Desk / Console along corridor wall
  const deskGeo = new THREE.BoxGeometry(1.6, 0.15, 3.8);
  const desk = new THREE.Mesh(deskGeo, materials.teakWood);
  desk.position.set(1.2, 12.8, -6.5);
  desk.castShadow = true;
  parent.add(desk);
}

// Balcony & Mezzanine Wooden Railing Builder (Matching reference photo balustrade)
function buildRailing(parent, x1, y, z1, x2, y2, z2, type = 'balcony') {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);

  const railingGroup = new THREE.Group();
  railingGroup.position.set(x1, y, z1);
  railingGroup.rotation.y = -angle;

  const railH = 3.2;
  const woodMat = (type === 'balcony') ? materials.darkTeakWood : materials.teakWood;

  // Top Handrail (Teak)
  const handrailGeo = new THREE.BoxGeometry(length, 0.35, 0.5);
  const handrail = new THREE.Mesh(handrailGeo, woodMat);
  handrail.position.set(length / 2, railH, 0);
  handrail.castShadow = true;
  railingGroup.add(handrail);

  if (type === 'balcony') {
    // Ornate Carved Balustrade with Medallions (as shown in reference photo)
    // 1. Solid carved frieze panel
    const panelH = 1.35;
    const panelGeo = new THREE.BoxGeometry(length, panelH, 0.25);
    const panel = new THREE.Mesh(panelGeo, materials.darkTeakWood);
    panel.position.set(length / 2, 1.25, 0);
    panel.castShadow = true;
    railingGroup.add(panel);

    // 2. Circular Carved Medallions along the panel
    const numMeds = Math.max(2, Math.floor(length / 2.8));
    const medStep = length / (numMeds + 1);
    for (let m = 1; m <= numMeds; m++) {
      const medGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.32, 16);
      const med = new THREE.Mesh(medGeo, materials.carvedColumn);
      med.rotation.x = Math.PI / 2;
      med.position.set(m * medStep, 1.25, 0);
      railingGroup.add(med);
    }

    // 3. Turned wooden spindles above panel
    const numBalusters = Math.max(4, Math.floor(length / 0.7));
    const spacing = length / numBalusters;
    const balusterGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.05, 8);
    for (let i = 0; i <= numBalusters; i++) {
      const baluster = new THREE.Mesh(balusterGeo, materials.darkTeakWood);
      baluster.position.set(i * spacing, 2.5, 0);
      baluster.castShadow = true;
      railingGroup.add(baluster);
    }
  } else {
    // Bottom Rail
    const bottomGeo = new THREE.BoxGeometry(length, 0.25, 0.35);
    const bottom = new THREE.Mesh(bottomGeo, materials.teakWood);
    bottom.position.set(length / 2, 0.4, 0);
    railingGroup.add(bottom);

    // Vertical Balusters (Turned wooden spindles)
    const numBalusters = Math.max(3, Math.floor(length / 0.8));
    const spacing = length / numBalusters;
    const balusterGeo = new THREE.CylinderGeometry(0.08, 0.08, railH - 0.65, 8);
    for (let i = 0; i <= numBalusters; i++) {
      const baluster = new THREE.Mesh(balusterGeo, materials.teakWood);
      baluster.position.set(i * spacing, railH / 2 + 0.1, 0);
      baluster.castShadow = true;
      railingGroup.add(baluster);
    }
  }

  parent.add(railingGroup);
}

// Window with Slanted Protective Rain Hood (Chajja)
function addWindowWithChajja(parent, x, y, z, w, h, facing) {
  // Glass Pane & Wooden Frame
  const frameGeo = new THREE.BoxGeometry(w, h, 0.4);
  const frame = new THREE.Mesh(frameGeo, materials.teakWood);

  const glassGeo = new THREE.BoxGeometry(w - 0.5, h - 0.5, 0.2);
  const glass = new THREE.Mesh(glassGeo, materials.glassWindow);

  const winGroup = new THREE.Group();
  winGroup.add(frame);
  winGroup.add(glass);

  // Slanted Terracotta Chajja (Rain Sunshade overhang)
  const chajjaGeo = new THREE.BoxGeometry(w + 1.6, 0.35, 2.2);
  const chajja = new THREE.Mesh(chajjaGeo, materials.roofTile);
  chajja.position.set(0, h / 2 + 0.4, 0.9);
  chajja.rotation.x = THREE.MathUtils.degToRad(25);
  chajja.castShadow = true;
  chajja.receiveShadow = true;
  winGroup.add(chajja);

  // Timber brackets supporting the chajja
  for (let side of [-1, 1]) {
    const bracketGeo = new THREE.BoxGeometry(0.2, 0.8, 1.2);
    const bracket = new THREE.Mesh(bracketGeo, materials.teakWood);
    bracket.position.set(side * (w / 2), h / 2 - 0.2, 0.6);
    winGroup.add(bracket);
  }

  winGroup.position.set(x, y, z);

  if (facing === 'side-right') {
    winGroup.rotation.y = -Math.PI / 2;
  } else if (facing === 'side-left') {
    winGroup.rotation.y = Math.PI / 2;
  } else if (facing === 'rear') {
    winGroup.rotation.y = Math.PI;
  }

  parent.add(winGroup);
}

// ==========================================
// 3A. MODERN SPLIT SKILLION (SHED) ROOF DESIGN
// (Directly matching the user's reference image!)
// - High left mono-pitch skillion roof (17.5° slope down to left)
// - Lower right mono-pitch skillion roof (13.5° slope down to right)
// - Vertical clerestory offset step with ribbon windows
// - Bold, thick crisp white modern fascia framing (1.35 ft thick)
// - Sleek charcoal standing seam / modern architectural metal panels
// - Modern cantilevered flat box porch canopy with layered trim & stone-clad pillar
// - Crisp white vertical privacy slat screen (brise-soleil fins)
// ==========================================
function buildModernSkillionRoof(parent) {
  const group = new THREE.Group();

  // ----------------------------------------------------
  // (A) LEFT HIGH SHED / SKILLION ROOF (Over Living Void & Mezzanine)
  // Slopes down from center ridge (X = +2.7, Y = 27.6) to left eave (X = -18.8, Y = 20.8)
  // ----------------------------------------------------
  const leftShedGroup = new THREE.Group();
  leftShedGroup.position.set(-8.05, 24.2, 0);
  leftShedGroup.rotation.z = THREE.MathUtils.degToRad(17.5);

  // 1. Dark Charcoal Standing-Seam Metal Roof Slab
  const lRoofGeo = new THREE.BoxGeometry(22.6, 0.55, 35.2);
  const lRoofMesh = new THREE.Mesh(lRoofGeo, materials.modernRoofDark);
  lRoofMesh.castShadow = true;
  lRoofMesh.receiveShadow = true;
  leftShedGroup.add(lRoofMesh);

  // Standing seam decorative ribs along Z axis
  for (let rx = -10.0; rx <= 10.0; rx += 2.0) {
    const ribGeo = new THREE.BoxGeometry(0.12, 0.18, 35.1);
    const rib = new THREE.Mesh(ribGeo, materials.modernRoofDark);
    rib.position.set(rx, 0.35, 0);
    rib.castShadow = true;
    leftShedGroup.add(rib);
  }

  // 2. Crisp White Underside Soffit
  const lSoffitGeo = new THREE.BoxGeometry(22.4, 0.18, 35.0);
  const lSoffitMesh = new THREE.Mesh(lSoffitGeo, materials.modernFasciaWhite);
  lSoffitMesh.position.set(0, -0.32, 0);
  leftShedGroup.add(lSoffitMesh);

  // 3. Bold Front & Rear Sloping Fascia Boards (Angled along the roof slope)
  for (let fz of [17.55, -17.55]) {
    // Outer white fascia body
    const fasciaGeo = new THREE.BoxGeometry(22.7, 1.35, 0.35);
    const fasciaMesh = new THREE.Mesh(fasciaGeo, materials.modernFasciaWhite);
    fasciaMesh.position.set(0, 0, fz);
    fasciaMesh.castShadow = true;
    leftShedGroup.add(fasciaMesh);

    // Dark architectural reveal groove inside fascia
    const grooveGeo = new THREE.BoxGeometry(22.7, 0.32, 0.38);
    const grooveMesh = new THREE.Mesh(grooveGeo, materials.modernFasciaDark);
    grooveMesh.position.set(0, 0, fz);
    leftShedGroup.add(grooveMesh);
  }

  // 4. Left Low Eave Fascia (Facing outward to the left)
  const lEaveFascia = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.35, 35.3), materials.modernFasciaWhite);
  lEaveFascia.position.set(-11.35, 0, 0);
  lEaveFascia.castShadow = true;
  leftShedGroup.add(lEaveFascia);

  // 5. High Ridge Capping at apex
  const lRidgeCap = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.4, 35.3), materials.modernFasciaWhite);
  lRidgeCap.position.set(11.35, 0, 0);
  lRidgeCap.castShadow = true;
  leftShedGroup.add(lRidgeCap);

  group.add(leftShedGroup);

  // ----------------------------------------------------
  // (B) RIGHT LOWER SHED / SKILLION ROOF (Over Bedroom 2 & 3)
  // Starts at X = +1.5 (Y = 24.2), slopes down to right eave (X = +19.0, Y = 19.9)
  // ----------------------------------------------------
  const rightShedGroup = new THREE.Group();
  rightShedGroup.position.set(10.25, 22.05, 0);
  rightShedGroup.rotation.z = THREE.MathUtils.degToRad(-13.5);

  // 1. Dark Charcoal Standing-Seam Metal Roof Slab
  const rRoofGeo = new THREE.BoxGeometry(18.2, 0.55, 35.2);
  const rRoofMesh = new THREE.Mesh(rRoofGeo, materials.modernRoofDark);
  rRoofMesh.castShadow = true;
  rRoofMesh.receiveShadow = true;
  rightShedGroup.add(rRoofMesh);

  // Standing seam ribs
  for (let rx = -8.0; rx <= 8.0; rx += 2.0) {
    const ribGeo = new THREE.BoxGeometry(0.12, 0.18, 35.1);
    const rib = new THREE.Mesh(ribGeo, materials.modernRoofDark);
    rib.position.set(rx, 0.35, 0);
    rib.castShadow = true;
    rightShedGroup.add(rib);
  }

  // 2. White Soffit
  const rSoffitGeo = new THREE.BoxGeometry(18.0, 0.18, 35.0);
  const rSoffitMesh = new THREE.Mesh(rSoffitGeo, materials.modernFasciaWhite);
  rSoffitMesh.position.set(0, -0.32, 0);
  rightShedGroup.add(rSoffitMesh);

  // 3. Bold Front & Rear Sloping Fascia Boards
  for (let fz of [17.55, -17.55]) {
    const fasciaGeo = new THREE.BoxGeometry(18.3, 1.35, 0.35);
    const fasciaMesh = new THREE.Mesh(fasciaGeo, materials.modernFasciaWhite);
    fasciaMesh.position.set(0, 0, fz);
    fasciaMesh.castShadow = true;
    rightShedGroup.add(fasciaMesh);

    const grooveGeo = new THREE.BoxGeometry(18.3, 0.32, 0.38);
    const grooveMesh = new THREE.Mesh(grooveGeo, materials.modernFasciaDark);
    grooveMesh.position.set(0, 0, fz);
    rightShedGroup.add(grooveMesh);
  }

  // 4. Right Low Eave Fascia
  const rEaveFascia = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.35, 35.3), materials.modernFasciaWhite);
  rEaveFascia.position.set(9.15, 0, 0);
  rEaveFascia.castShadow = true;
  rightShedGroup.add(rEaveFascia);

  // 5. High Edge Flashing
  const rHighCap = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 35.3), materials.modernFasciaWhite);
  rHighCap.position.set(-9.15, 0, 0);
  rightShedGroup.add(rHighCap);

  group.add(rightShedGroup);

  // ----------------------------------------------------
  // (C) VERTICAL CLERESTORY OFFSET WALL & RIBBON WINDOWS
  // Connects the high ridge of left roof down to top of right roof
  // ----------------------------------------------------
  const clerestoryGroup = new THREE.Group();
  clerestoryGroup.position.set(2.0, 25.6, 0);

  // Solid exterior wall backing
  const clWallGeo = new THREE.BoxGeometry(0.6, 3.2, 33.0);
  const clWall = new THREE.Mesh(clWallGeo, materials.wallExterior);
  clWall.castShadow = true;
  clerestoryGroup.add(clWall);

  // High Clerestory Ribbon Glazing strip (facing right elevation)
  const clWindowFrame = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.2, 31.0), materials.modernFasciaDark);
  clWindowFrame.position.set(0.35, 0.1, 0);
  clerestoryGroup.add(clWindowFrame);

  const clGlass = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.9, 30.6), materials.modernClerestoryGlass);
  clGlass.position.set(0.38, 0.1, 0);
  clerestoryGroup.add(clGlass);

  // Vertical black mullions
  for (let mz = -13.0; mz <= 13.0; mz += 4.5) {
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2.0, 0.18), materials.modernFasciaDark);
    mullion.position.set(0.36, 0.1, mz);
    clerestoryGroup.add(mullion);
  }

  group.add(clerestoryGroup);

  // ----------------------------------------------------
  // (D) TRIANGULAR GABLE WALL INFILLS (Watertight upper enclosure)
  // ----------------------------------------------------
  function buildGableInfill(x1, y1, x2, y2, x3, y3, x4, y4, zPos, depth) {
    const shape = new THREE.Shape();
    shape.moveTo(x1, y1);
    shape.lineTo(x2, y2);
    shape.lineTo(x3, y3);
    shape.lineTo(x4, y4);
    shape.closePath();
    const extrudeGeo = new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: false });
    const mesh = new THREE.Mesh(extrudeGeo, materials.wallExterior);
    mesh.position.set(0, 0, zPos);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  // Left Front Gable Infill (X: -14.6 to +2.0, Y: 19.5 to slope)
  const lFrontGable = buildGableInfill(-14.6, 19.5, 2.0, 19.5, 2.0, 27.2, -14.6, 22.0, 13.8, 0.8);
  group.add(lFrontGable);

  // Left Rear Gable Infill
  const lRearGable = buildGableInfill(-14.6, 19.5, 2.0, 19.5, 2.0, 27.2, -14.6, 22.0, -14.6, 0.8);
  group.add(lRearGable);

  // Right Front Gable Infill (X: +2.0 to +14.6, Y: 19.5 to slope)
  const rFrontGable = buildGableInfill(2.0, 19.5, 14.6, 19.5, 14.6, 20.8, 2.0, 24.0, 13.8, 0.8);
  group.add(rFrontGable);

  // Right Rear Gable Infill
  const rRearGable = buildGableInfill(2.0, 19.5, 14.6, 19.5, 14.6, 20.8, 2.0, 24.0, -14.6, 0.8);
  group.add(rRearGable);

  // Left & Right Upper Wall Extents
  const lTopWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.5, 28.4), materials.wallExterior);
  lTopWall.position.set(-14.6, 20.75, 0);
  lTopWall.castShadow = true;
  group.add(lTopWall);

  const rTopWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 28.4), materials.wallExterior);
  rTopWall.position.set(14.6, 20.2, 0);
  rTopWall.castShadow = true;
  group.add(rTopWall);

  // ----------------------------------------------------
  // (E) MODERN CANTILEVERED FLAT BOX PORCH CANOPY (Matching Attached Photo!)
  // ----------------------------------------------------
  const porchCanopyGroup = new THREE.Group();
  porchCanopyGroup.position.set(-7.3, 10.4, 14.8);

  // 1. Main White Horizontal Box Slab
  const boxGeo = new THREE.BoxGeometry(15.4, 1.1, 5.6);
  const boxMesh = new THREE.Mesh(boxGeo, materials.modernFasciaWhite);
  boxMesh.castShadow = true;
  boxMesh.receiveShadow = true;
  porchCanopyGroup.add(boxMesh);

  // 2. Layered Recessed Dark Accent Band (signature modern detail from reference image!)
  const recessGeo = new THREE.BoxGeometry(15.55, 0.35, 5.75);
  const recessMesh = new THREE.Mesh(recessGeo, materials.modernFasciaDark);
  porchCanopyGroup.add(recessMesh);

  // 3. Crisp White Ceiling Soffit with Warm Recessed LED Downlights
  const pSoffit = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.1, 5.4), materials.whiteSoffit);
  pSoffit.position.set(0, -0.58, 0);
  porchCanopyGroup.add(pSoffit);

  // Recessed warm LED spotlights underneath
  for (let lx of [-4.5, 0, 4.5]) {
    const sLight = new THREE.PointLight(0xffb86c, 1.2, 12);
    sLight.position.set(lx, -0.8, 0);
    porchCanopyGroup.add(sLight);

    // Fixture ring
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 12), materials.modernFasciaDark);
    ring.position.set(lx, -0.56, 0);
    porchCanopyGroup.add(ring);
  }

  // 4. Modern Square Stone-Clad Pillar at outer front corner (matching photo!)
  const modernColGeo = new THREE.BoxGeometry(1.2, 7.8, 1.2);
  const modernCol = new THREE.Mesh(modernColGeo, materials.stoneCladding);
  modernCol.position.set(-6.2, -4.5, -0.6); // (-13.5 in world space)
  modernCol.castShadow = true;
  porchCanopyGroup.add(modernCol);

  // Stone pillar white capital and plinth bands
  for (let py of [-0.65, -8.3]) {
    const colCap = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.25, 1.4), materials.modernFasciaWhite);
    colCap.position.set(-6.2, py, -0.6);
    porchCanopyGroup.add(colCap);
  }

  group.add(porchCanopyGroup);

  // ----------------------------------------------------
  // (F) MODERN VERTICAL PRIVACY SLAT SCREEN (BRISE-SOLEIL FINS)
  // (Matching the white vertical slat screen in the attached reference photo!)
  // ----------------------------------------------------
  const slatGroup = new THREE.Group();
  slatGroup.position.set(0.2, 6.4, 14.6);

  // Top and bottom mounting rails
  const railGeo = new THREE.BoxGeometry(3.6, 0.18, 0.35);
  const railTop = new THREE.Mesh(railGeo, materials.modernFasciaDark);
  railTop.position.set(1.8, 3.8, 0);
  slatGroup.add(railTop);

  const railBot = new THREE.Mesh(railGeo, materials.modernFasciaDark);
  railBot.position.set(1.8, -3.8, 0);
  slatGroup.add(railBot);

  // Series of vertical white architectural fins
  for (let fx = 0.3; fx <= 3.3; fx += 0.45) {
    const finGeo = new THREE.BoxGeometry(0.12, 7.6, 0.32);
    const fin = new THREE.Mesh(finGeo, materials.modernSlatWhite);
    fin.position.set(fx, 0, 0);
    fin.castShadow = true;
    slatGroup.add(fin);
  }

  group.add(slatGroup);

  // Sintex Water Tank on rear utility deck
  buildSintexWaterTank(group, 4.5, 23.8, -10.5);

  parent.add(group);
  return group;
}

// ==========================================
// 3. KONKAN SLANTED ROOF ARCHITECTURE
// ==========================================
function buildKonkanSlantRoof(parent) {
  // Konkan Style Roof Specs:
  // - Dual-pitch hipped/gabled Mangalore clay tile roof
  // - Pitch: 38° slope for rapid rain discharge (>3,500mm monsoon)
  // - Deep overhanging eaves extending 3.5 ft beyond the walls
  // - Timber roof trusses visible from the double-height living room
  // - Carved wooden fascia/barge boards (friezes)
  // - Rainwater collection gutters and brass rain chains dangling at corners

  const roofBaseY = 19.3;
  const ridgeY = 27.8;

  // ========================================================
  // ========================================================
  // TIER 2: UPPER BALCONY PROJECTING HIPPED ROOF + DORMER
  // (Directly over the single large unified first-floor balcony, supported by upper teak columns)
  // ========================================================
  const balcRoofGroup = new THREE.Group();
  balcRoofGroup.position.set(0, 0, 13.0);

  // Balcony Main Forward Sloping Canopy (Spanning full 32.0 ft front facade!)
  const balcFrontSlopeGeo = new THREE.BoxGeometry(32.0, 0.55, 6.2);
  const balcFrontSlope = new THREE.Mesh(balcFrontSlopeGeo, materials.roofTile);
  balcFrontSlope.position.set(0, 21.6, 1.8);
  balcFrontSlope.rotation.x = THREE.MathUtils.degToRad(24);
  balcFrontSlope.castShadow = true;
  balcRoofGroup.add(balcFrontSlope);

  // White soffit fascia underneath balcony front slope
  const balcFrontSoffit = new THREE.Mesh(new THREE.BoxGeometry(32.2, 0.25, 6.3), materials.whiteSoffit);
  balcFrontSoffit.position.set(0, 21.3, 1.8);
  balcFrontSoffit.rotation.x = THREE.MathUtils.degToRad(24);
  balcRoofGroup.add(balcFrontSoffit);

  // Balcony Left Hip Slope
  const balcLeftSlopeGeo = new THREE.BoxGeometry(5.2, 0.55, 6.8);
  const balcLeftSlope = new THREE.Mesh(balcLeftSlopeGeo, materials.roofTile);
  balcLeftSlope.position.set(-14.8, 21.8, 0.2);
  balcLeftSlope.rotation.z = THREE.MathUtils.degToRad(-24);
  balcLeftSlope.castShadow = true;
  balcRoofGroup.add(balcLeftSlope);

  // Balcony Right Hip Slope
  const balcRightSlopeGeo = new THREE.BoxGeometry(5.2, 0.55, 6.8);
  const balcRightSlope = new THREE.Mesh(balcRightSlopeGeo, materials.roofTile);
  balcRightSlope.position.set(14.8, 21.8, 0.2);
  balcRightSlope.rotation.z = THREE.MathUtils.degToRad(24);
  balcRightSlope.castShadow = true;
  balcRoofGroup.add(balcRightSlope);

  // Balcony Roof Ridge
  const balcRidge = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 29.5, 12), materials.roofRidge);
  balcRidge.position.set(0, 23.4, -0.6);
  balcRidge.rotation.z = Math.PI / 2;
  balcRoofGroup.add(balcRidge);

  // ORNAMENTAL TRIANGULAR DORMER VENT (Koodu / Gablette at front apex, matching reference photo!)
  const dormerGroup = new THREE.Group();
  dormerGroup.position.set(0, 23.6, 2.2);

  // Triangular white frame
  const dormerGeo = new THREE.ConeGeometry(2.4, 2.0, 3);
  const dormerMesh = new THREE.Mesh(dormerGeo, materials.whiteTrim);
  dormerMesh.rotation.y = Math.PI;
  dormerGroup.add(dormerMesh);

  // Miniature terracotta roof cap over dormer
  const dormerCap = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.2, 3), materials.roofTile);
  dormerCap.position.set(0, 1.1, 0);
  dormerCap.rotation.y = Math.PI;
  dormerGroup.add(dormerCap);

  // Dark timber ventilation louvers inside dormer
  const louver = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 0.2), materials.darkTeakWood);
  louver.position.set(0, 0, 0.8);
  dormerGroup.add(louver);

  balcRoofGroup.add(dormerGroup);
  parent.add(balcRoofGroup);

  // ========================================================
  // TIER 3: MAIN UPPER HIPPED ROOF
  // (Covers main house body, void, Bedroom 2, Bedroom 3, stairs)
  // ========================================================
  const mainSpanX = 36.0;
  const mainSpanZ = 33.0;

  // (1) Left Slope (covers living room double-height void: X = -18 to 0)
  const leftSlopeGeo = new THREE.BoxGeometry(20.0, 0.65, mainSpanZ);
  const leftSlope = new THREE.Mesh(leftSlopeGeo, materials.roofTile);
  leftSlope.position.set(-8.8, 23.8, -1.0);
  leftSlope.rotation.z = THREE.MathUtils.degToRad(28);
  leftSlope.castShadow = true;
  leftSlope.receiveShadow = true;
  parent.add(leftSlope);

  // (2) Right Slope (covers Bedroom 2 & 3: X = 0 to 18)
  const rightSlopeGeo = new THREE.BoxGeometry(20.0, 0.65, mainSpanZ);
  const rightSlope = new THREE.Mesh(rightSlopeGeo, materials.roofTile);
  rightSlope.position.set(8.8, 23.8, -1.0);
  rightSlope.rotation.z = THREE.MathUtils.degToRad(-28);
  rightSlope.castShadow = true;
  rightSlope.receiveShadow = true;
  parent.add(rightSlope);

  // (3) Rear Hipped Slope (sloping down to rear eave at Z = -18.0)
  const rearHipGeo = new THREE.BoxGeometry(mainSpanX - 4, 0.65, 8.5);
  const rearHip = new THREE.Mesh(rearHipGeo, materials.roofTile);
  rearHip.position.set(0, 22.8, -14.2);
  rearHip.rotation.x = THREE.MathUtils.degToRad(-26);
  rearHip.castShadow = true;
  parent.add(rearHip);

  // White Soffit Fascia Trim around entire main roof eaves
  const soffitL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, mainSpanZ), materials.whiteSoffit);
  soffitL.position.set(-17.6, 19.3, -1.0);
  parent.add(soffitL);

  const soffitR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, mainSpanZ), materials.whiteSoffit);
  soffitR.position.set(17.6, 19.3, -1.0);
  parent.add(soffitR);

  // Central Hip Ridge Cap along apex (X = 0, Y = 28.0)
  const mainRidge = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 18, 12), materials.roofRidge);
  mainRidge.position.set(0, 28.2, -4.5);
  mainRidge.rotation.x = Math.PI / 2;
  mainRidge.castShadow = true;
  parent.add(mainRidge);

  // Decorative Finials (Kalash / Stupi) on Ridge Apex
  for (let rz of [-11, -4.5, 2]) {
    const finial = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.8, 8), materials.roofRidge);
    finial.position.set(0, 29.2, rz);
    parent.add(finial);
  }

  // Authentic Black Sintex Water Tank (peeking above roof ridge on terrace as in photo)
  buildSintexWaterTank(parent, 4.5, 27.5, -4.5);

  // Exposed Teak Roof Trusses under slopes (visible from inside double-height living room)
  for (let tz of [-12, -4, 3]) {
    const trussTie = new THREE.Mesh(new THREE.BoxGeometry(28, 0.5, 0.4), materials.teakWood);
    trussTie.position.set(0, 19.5, tz);
    parent.add(trussTie);

    const kingP = new THREE.Mesh(new THREE.BoxGeometry(0.5, 8.2, 0.4), materials.teakWood);
    kingP.position.set(0, 23.8, tz);
    parent.add(kingP);
  }

  // Wooden Gable Truss End (Rear pediment only - front has clean hip roof & dormer matching photo)
  buildGableTruss(parent, 0, roofBaseY, -15.0, 30, 10.5, 'rear');

  // Rain Defense: Eave Fascia Boards along eaves
  const mainLength = 36.0;
  const fasciaL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, mainLength), materials.roofFascia);
  fasciaL.position.set(-17.2, 19.3, 0);
  parent.add(fasciaL);

  const fasciaR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, mainLength), materials.roofFascia);
  fasciaR.position.set(17.2, 19.3, 0);
  parent.add(fasciaR);

  // Rain Chains at rear corners
  buildRainChain(parent, -17.0, 19.2, -18.0);
  buildRainChain(parent, 17.0, 19.2, -18.0);
}

// Gable Truss Construction
function buildGableTruss(parent, x, baseY, z, span, height, side) {
  const group = new THREE.Group();
  group.position.set(x, baseY, z);

  // Triangular plaster tympanum with timber frame
  const geom = new THREE.BufferGeometry();
  const halfSpan = span / 2;
  const vertices = new Float32Array([
    -halfSpan, 0, 0,
    halfSpan, 0, 0,
    0, height, 0
  ]);
  geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geom.computeVertexNormals();

  const mesh = new THREE.Mesh(geom, materials.wallExterior);
  mesh.castShadow = true;
  group.add(mesh);

  // Timber Rafter Trusses on facade
  const tieBeam = new THREE.Mesh(new THREE.BoxGeometry(span, 0.6, 0.4), materials.teakWood);
  tieBeam.position.set(0, 0.3, 0.2);
  group.add(tieBeam);

  const kingPost = new THREE.Mesh(new THREE.BoxGeometry(0.6, height - 1, 0.4), materials.teakWood);
  kingPost.position.set(0, (height - 1) / 2 + 0.3, 0.2);
  group.add(kingPost);

  // Decorative Konkan Jali (Ventilation Louver in gable peak to exhaust hot air)
  const jaliGeo = new THREE.BoxGeometry(3.5, 2.5, 0.3);
  const jali = new THREE.Mesh(jaliGeo, materials.teakWood);
  jali.position.set(0, height - 3.5, 0.3);
  group.add(jali);

  parent.add(group);
}

// Brass Rain Chains (Water-channeling coastal element)
function buildRainChain(parent, x, startY, z) {
  const chainGroup = new THREE.Group();
  chainGroup.position.set(x, startY, z);

  const numCups = 16;
  const totalDrop = startY - 2.5; // Down to plinth
  const step = totalDrop / numCups;

  for (let i = 0; i < numCups; i++) {
    // Cup shape
    const cupGeo = new THREE.ConeGeometry(0.35, 0.6, 8, 1, true);
    const cup = new THREE.Mesh(cupGeo, materials.brassLamp);
    cup.position.set(0, -i * step, 0);
    cup.rotation.x = Math.PI; // Upright cup
    cup.castShadow = true;
    chainGroup.add(cup);
  }

  // Gravel Catchment Basin at base
  const basinGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.6, 12);
  const basinMat = new THREE.MeshStandardMaterial({ color: 0x4a4f54, roughness: 0.9 });
  const basin = new THREE.Mesh(basinGeo, basinMat);
  basin.position.set(0, -totalDrop + 0.3, 0);
  chainGroup.add(basin);

  parent.add(chainGroup);
}

// Room Hitboxes for Click & Inspect
function buildRoomHitboxes() {
  const rooms = [
    { id: 'porch', x: -7.5, y: 5.5, z: 12.1, w: 14.5, h: 5.5, d: 5.0 },
    { id: 'living', x: -7.5, y: 7.5, z: 3, w: 14.5, h: 9.5, d: 14 },
    { id: 'pooja', x: -3.5, y: 5.5, z: -1.5, w: 3, h: 5.5, d: 3 },
    { id: 'stairs', x: -10, y: 6.5, z: -9, w: 9, h: 7.5, d: 10 },
    { id: 'kitchen', x: 7.5, y: 6.5, z: -8.5, w: 14, h: 7.5, d: 11 },
    { id: 'kitchen-exit', x: 17.1, y: 4.5, z: -9.05, w: 5.2, h: 5.5, d: 11.2 },
    { id: 'bed1', x: 7.3, y: 6.5, z: 6.3, w: 14.6, h: 7.5, d: 16.6 },
    { id: 'toilet-ground', x: 7.5, y: 6.5, z: -1.5, w: 14, h: 7.5, d: 3 },
    { id: 'void', x: -7.5, y: 15.0, z: 3, w: 14.5, h: 8.0, d: 14 },
    { id: 'passage', x: -2, y: 13.5, z: 3, w: 4, h: 5.5, d: 14 },
    { id: 'bed2', x: 7.3, y: 15.0, z: 4.8, w: 14.0, h: 7.5, d: 9.6 },
    { id: 'toilet-first', x: 11.5, y: 15.0, z: -0.5, w: 5.5, h: 7.5, d: 4.0 },
    { id: 'bed3', x: 7.5, y: 15.0, z: -7.5, w: 14, h: 7.5, d: 13 },
    { id: 'balcony-front', x: 0, y: 13.0, z: 12.1, w: 29.2, h: 5.0, d: 5.0 },
    { id: 'balcony-rear', x: 17.1, y: 13.0, z: -9.05, w: 5.2, h: 5.5, d: 11.2 }
  ];

  rooms.forEach(r => {
    const geo = new THREE.BoxGeometry(r.w, r.h, r.d);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.0, // Invisible until hovered/focused
      depthWrite: false
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(r.x, r.y, r.z);
    mesh.userData = { roomId: r.id };
    scene.add(mesh);
    roomMeshMap[r.id] = mesh;
  });
}

// Surrounding Konkan Tropical Environment
function buildEnvironment() {
  environmentGroup = new THREE.Group();

  // Tropical Lawn / Coastal Red Soil Ground
  const groundGeo = new THREE.PlaneGeometry(160, 160);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x2e4228,
    roughness: 0.95,
    metalness: 0.05
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  environmentGroup.add(ground);

  // Authentic Speckled Dark Gravel Forecourt Driveway (matching reference photo)
  const drivewayGeo = new THREE.PlaneGeometry(80, 70);
  const driveway = new THREE.Mesh(drivewayGeo, materials.gravelDriveway);
  driveway.rotation.x = -Math.PI / 2;
  driveway.position.set(0, 0.08, 38);
  driveway.receiveShadow = true;
  environmentGroup.add(driveway);

  // Two Crisp White Gate Pillars in foreground (matching reference photo)
  for (let px of [-9.5, 9.5]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 6.0, 2.4), materials.whiteTrim);
    pillar.position.set(px, 3.0, 24);
    pillar.castShadow = true;
    environmentGroup.add(pillar);

    // Terracotta 4-Sided Pyramid Tile Cap
    const cap = new THREE.Mesh(new THREE.ConeGeometry(2.1, 1.4, 4), materials.roofRidge);
    cap.position.set(px, 6.7, 24);
    cap.rotation.y = Math.PI / 4;
    cap.castShadow = true;
    environmentGroup.add(cap);
  }

  // Address Plaque on Left Gate Post
  const plaqueMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.7 });
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.6, 0.1), plaqueMat);
  plaque.position.set(-9.5, 4.2, 25.25);
  environmentGroup.add(plaque);

  // White Compound Low Boundary Walls connected to the pillars
  // Left compound wall segment (X: -26 to -10.7)
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(15.3, 3.4, 0.8), materials.whiteTrim);
  leftWall.position.set(-18.35, 1.7, 24);
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  environmentGroup.add(leftWall);

  const leftCoping = new THREE.Mesh(new THREE.BoxGeometry(15.5, 0.25, 1.1), materials.roofRidge);
  leftCoping.position.set(-18.35, 3.5, 24);
  environmentGroup.add(leftCoping);

  // Right compound wall segment (X: 10.7 to 26)
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(15.3, 3.4, 0.8), materials.whiteTrim);
  rightWall.position.set(18.35, 1.7, 24);
  rightWall.castShadow = true;
  rightWall.receiveShadow = true;
  environmentGroup.add(rightWall);

  const rightCoping = new THREE.Mesh(new THREE.BoxGeometry(15.5, 0.25, 1.1), materials.roofRidge);
  rightCoping.position.set(18.35, 3.5, 24);
  environmentGroup.add(rightCoping);

  // Coconut Palms & Areca Nut Trees (Iconic Konkan Flora framing the perimeter)
  const treeCoords = [
    { x: -45, z: -30, h: 28 },
    { x: -45, z: 15, h: 26 },
    { x: 45, z: -30, h: 29 },
    { x: 48, z: -10, h: 27 },
    { x: -45, z: 50, h: 25 },
    { x: 55, z: 65, h: 26 }
  ];

  treeCoords.forEach(pos => {
    buildCoconutPalm(environmentGroup, pos.x, 0, pos.z, pos.h);
  });

  scene.add(environmentGroup);
}

// Coconut Palm Builder
function buildCoconutPalm(parent, x, y, z, height) {
  const palmGroup = new THREE.Group();
  palmGroup.position.set(x, y, z);

  // Slender curved trunk
  const trunkSegments = 10;
  const segHeight = height / trunkSegments;
  let currentY = 0;
  let currentX = 0;
  const curveDirection = (Math.random() - 0.5) * 4;

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a483a, roughness: 0.85 });

  for (let i = 0; i < trunkSegments; i++) {
    const rBottom = 0.8 - (i * 0.03);
    const rTop = 0.8 - ((i + 1) * 0.03);
    const segGeo = new THREE.CylinderGeometry(rTop, rBottom, segHeight, 8);
    const seg = new THREE.Mesh(segGeo, trunkMat);

    currentX += (i / trunkSegments) * (curveDirection / trunkSegments);
    seg.position.set(currentX, currentY + segHeight / 2, 0);
    seg.rotation.z = -(curveDirection / height) * 0.4;
    seg.castShadow = true;
    palmGroup.add(seg);

    currentY += segHeight;
  }

  // Palm Fronds Crown (Radial arched leaves)
  const frondCount = 14;
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x2d6a2f,
    roughness: 0.6,
    side: THREE.DoubleSide
  });

  for (let f = 0; f < frondCount; f++) {
    const angle = (f / frondCount) * Math.PI * 2;
    const frondGeo = new THREE.BoxGeometry(0.3, 0.1, 9.5);
    const frond = new THREE.Mesh(frondGeo, leafMat);

    frond.position.set(currentX, currentY, 0);
    frond.rotation.y = angle;
    frond.rotation.x = THREE.MathUtils.degToRad(35 + Math.random() * 15);
    frond.castShadow = true;
    palmGroup.add(frond);
  }

  parent.add(palmGroup);
}

// ==========================================
// 4. MONSOON RAIN SIMULATION
// ==========================================
function setupMonsoonRain() {
  // (A) Falling Raindrop Particle System (4,000 particles)
  const rainCount = 4500;
  const rainGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(rainCount * 3);
  const velocities = new Float32Array(rainCount);

  for (let i = 0; i < rainCount; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 110;
    positions[i * 3 + 1] = Math.random() * 60 + 5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 110;
    velocities[i] = 1.2 + Math.random() * 0.9;
  }

  rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Custom rain line/drop material
  const rainMat = new THREE.PointsMaterial({
    color: 0xbae6fd,
    size: 0.5,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending
  });

  rainParticles = new THREE.Points(rainGeo, rainMat);
  scene.add(rainParticles);

  // (B) Roof Eave Water Droplet Cascades (falling directly off slanted roof edges!)
  const dripCount = 600;
  const dripGeo = new THREE.BufferGeometry();
  const dripPositions = new Float32Array(dripCount * 3);

  for (let i = 0; i < dripCount; i++) {
    // Eaves positions: Left eave (X: -17.5), Right eave (X: +17.5)
    const side = (Math.random() > 0.5) ? -17.5 : 17.5;
    dripPositions[i * 3 + 0] = side + (Math.random() - 0.5) * 0.4;
    dripPositions[i * 3 + 1] = 19.3 - Math.random() * 16.5; // From eave to ground
    dripPositions[i * 3 + 2] = (Math.random() - 0.5) * 36;
  }

  dripGeo.setAttribute('position', new THREE.BufferAttribute(dripPositions, 3));
  const dripMat = new THREE.PointsMaterial({
    color: 0x7dd3fc,
    size: 0.65,
    transparent: true,
    opacity: 0.75
  });

  rainCascades = new THREE.Points(dripGeo, dripMat);
  scene.add(rainCascades);

  // Set initial visibility according to state (Rain OFF by default for sunlit photo-matching)
  rainParticles.visible = state.rainActive;
  rainCascades.visible = state.rainActive;
}

// Update Rain in Animation Loop
function updateRain() {
  if (!state.rainActive || !rainParticles) return;

  // Animate main rainfall
  const pos = rainParticles.geometry.attributes.position.array;
  for (let i = 0; i < pos.length; i += 3) {
    pos[i + 1] -= 1.6;     // Fall downward
    pos[i + 0] -= 0.35;    // Coastal wind deflection (X axis)
    pos[i + 2] += 0.2;     // Coastal wind deflection (Z axis)

    // Reset when below ground
    if (pos[i + 1] < 0) {
      pos[i + 1] = 55 + Math.random() * 5;
      pos[i + 0] = (Math.random() - 0.5) * 110;
      pos[i + 2] = (Math.random() - 0.5) * 110;
    }
  }
  rainParticles.geometry.attributes.position.needsUpdate = true;

  // Animate roof eave cascades
  const dripPos = rainCascades.geometry.attributes.position.array;
  for (let i = 0; i < dripPos.length; i += 3) {
    dripPos[i + 1] -= 0.95; // Steady heavy drip rate
    if (dripPos[i + 1] < 2.5) {
      dripPos[i + 1] = 19.3;
    }
  }
  rainCascades.geometry.attributes.position.needsUpdate = true;
}

// ==========================================
// 5. ANIMATIONS & CAMERA TRANSITIONS
// ==========================================
function moveCameraTo(coords, targetCoords, duration = 1200) {
  new TWEEN.Tween(camera.position)
    .to(coords, duration)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();

  new TWEEN.Tween(controls.target)
    .to(targetCoords, duration)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
}

function setFloorLevel(level) {
  state.activeFloor = level;

  // Document UI active state
  document.querySelectorAll('.dock-btn[data-floor]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.floor === level);
  });

  const duration = 900;

  if (level === 'full') {
    roofGroup.visible = true;
    firstFloorGroup.visible = true;
    groundFloorGroup.visible = true;

    new TWEEN.Tween(firstFloorGroup.position).to({ y: 0 }, duration).easing(TWEEN.Easing.Back.Out).start();
    new TWEEN.Tween(roofGroup.position).to({ y: 0 }, duration).easing(TWEEN.Easing.Back.Out).start();
    showToast('Full Exterior & Slanted Roof Visible');
  } else if (level === 'roof-off') {
    firstFloorGroup.visible = true;
    groundFloorGroup.visible = true;

    new TWEEN.Tween(firstFloorGroup.position).to({ y: 0 }, duration).start();
    new TWEEN.Tween(roofGroup.position)
      .to({ y: 40 }, duration)
      .easing(TWEEN.Easing.Cubic.In)
      .onComplete(() => { roofGroup.visible = false; })
      .start();
    showToast('Roof Removed: Inspecting First Floor & Double-Height Mezzanine');
  } else if (level === 'ground') {
    groundFloorGroup.visible = true;

    new TWEEN.Tween(roofGroup.position).to({ y: 40 }, 400).onComplete(() => { roofGroup.visible = false; }).start();
    new TWEEN.Tween(firstFloorGroup.position).to({ y: 35 }, 600).onComplete(() => { firstFloorGroup.visible = false; }).start();
    showToast('Ground Floor Plan Visible (Living, Pooja, Kitchen, Bed 1)');
  } else if (level === 'exploded') {
    roofGroup.visible = true;
    firstFloorGroup.visible = true;
    groundFloorGroup.visible = true;

    new TWEEN.Tween(groundFloorGroup.position).to({ y: 0 }, duration).easing(TWEEN.Easing.Cubic.Out).start();
    new TWEEN.Tween(firstFloorGroup.position).to({ y: 14 }, duration).easing(TWEEN.Easing.Cubic.Out).start();
    new TWEEN.Tween(roofGroup.position).to({ y: 30 }, duration).easing(TWEEN.Easing.Cubic.Out).start();
    showToast('Exploded Stack View: 3D Layers Separated');
  }
}

// Roof Style Controller (Modern Split Skillion vs Traditional Konkan)
function setRoofStyle(style) {
  state.roofStyle = style;
  updateRoofStyleVisibility();

  const isModern = (style === 'modern-skillion');
  const label = isModern ? 'Modern Split Skillion Roof (Image Design)' : 'Traditional Konkan Hipped Roof';
  showToast('Switched to ' + label);

  const headerLabel = document.getElementById('roof-style-label');
  if (headerLabel) {
    headerLabel.textContent = isModern ? 'Roof: Modern Skillion' : 'Roof: Konkan Hipped';
  }

  const btnHeader = document.getElementById('btn-toggle-roof-style');
  if (btnHeader) {
    btnHeader.classList.toggle('active', isModern);
  }

  const btnDock = document.getElementById('btn-dock-roof-style');
  if (btnDock) {
    btnDock.classList.toggle('active', isModern);
    const spanText = btnDock.querySelector('.roof-text');
    if (spanText) {
      spanText.textContent = isModern ? 'Modern Skillion Roof' : 'Traditional Konkan Roof';
    }
  }
}

function updateRoofStyleVisibility() {
  const isModern = (state.roofStyle === 'modern-skillion');
  if (modernRoofGroup) {
    modernRoofGroup.visible = isModern;
  }
  if (konkanRoofGroup) {
    konkanRoofGroup.visible = !isModern;
  }
  if (porchKonkanRoof) {
    porchKonkanRoof.visible = !isModern;
  }
}

function setLightingMode(mode) {
  state.lightingMode = mode;
  const icon = document.getElementById('lighting-icon');
  const text = document.getElementById('lighting-text');

  if (mode === 'daylight') {
    icon.textContent = '☀️';
    text.textContent = 'Daylight';
    scene.background.setHex(0x90b5d8);
    scene.fog.color.setHex(0x90b5d8);
    ambientLight.color.setHex(0xffffff);
    ambientLight.intensity = 0.8;
    dirLight.color.setHex(0xfffaed);
    dirLight.intensity = 1.4;
    dirLight.position.set(45, 60, 30);
    interiorLights.forEach(l => l.intensity = 0.5);
  } else if (mode === 'golden') {
    icon.textContent = '🌅';
    text.textContent = 'Golden Hour';
    scene.background.setHex(0x2d2238);
    scene.fog.color.setHex(0x2d2238);
    ambientLight.color.setHex(0xffbb88);
    ambientLight.intensity = 0.65;
    dirLight.color.setHex(0xff7733);
    dirLight.intensity = 1.7;
    dirLight.position.set(55, 30, 20);
    interiorLights.forEach(l => l.intensity = 1.8);
  } else if (mode === 'monsoon') {
    icon.textContent = '⛈️';
    text.textContent = 'Monsoon Storm';
    scene.background.setHex(0x131a26);
    scene.fog.color.setHex(0x131a26);
    ambientLight.color.setHex(0x738da8);
    ambientLight.intensity = 0.5;
    dirLight.color.setHex(0x8da4c4);
    dirLight.intensity = 0.8;
    dirLight.position.set(20, 50, -20);
    interiorLights.forEach(l => l.intensity = 2.4);
  } else if (mode === 'night') {
    icon.textContent = '🌙';
    text.textContent = 'Night Glow';
    scene.background.setHex(0x080b12);
    scene.fog.color.setHex(0x080b12);
    ambientLight.color.setHex(0x1a233a);
    ambientLight.intensity = 0.25;
    dirLight.color.setHex(0x384a6e);
    dirLight.intensity = 0.3;
    interiorLights.forEach(l => l.intensity = 3.2);
  }
}

function toggleRain() {
  state.rainActive = !state.rainActive;
  rainParticles.visible = state.rainActive;
  rainCascades.visible = state.rainActive;

  const btn = document.getElementById('btn-toggle-rain');
  const btnText = document.getElementById('rain-btn-text');
  const weatherDot = document.getElementById('weather-dot');
  const weatherText = document.getElementById('weather-text');

  btn.classList.toggle('active', state.rainActive);
  btnText.textContent = state.rainActive ? 'Monsoon Rain: ON' : 'Monsoon Rain: OFF';
  weatherDot.classList.toggle('rain', state.rainActive);
  weatherText.textContent = state.rainActive
    ? 'Monsoon Rain: Active (Slant Roof Shedding)'
    : 'Weather: Clear Sky';

  showToast(state.rainActive ? 'Monsoon Rain Simulation Activated' : 'Rain Stopped');
}

function toggleXray() {
  state.xrayMode = !state.xrayMode;
  document.getElementById('btn-xray').classList.toggle('active', state.xrayMode);

  materials.wallExterior.wireframe = state.xrayMode;
  materials.wallInterior.wireframe = state.xrayMode;
  materials.roofTile.wireframe = state.xrayMode;

  showToast(state.xrayMode ? 'X-Ray Wireframe Mode Enabled' : 'Solid Shading Restored');
}

function selectRoom(roomId) {
  state.selectedRoom = roomId;

  // Update room pill states in sidebar
  document.querySelectorAll('.room-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.room === roomId);
  });

  // Highlight 3D mesh
  Object.keys(roomMeshMap).forEach(key => {
    const mesh = roomMeshMap[key];
    if (key === roomId) {
      mesh.material.opacity = 0.45;
      mesh.material.color.setHex(0xe05634);
    } else {
      mesh.material.opacity = 0.0;
    }
  });

  const data = roomDataMap[roomId];
  if (data) {
    const card = document.getElementById('room-detail-card');
    card.style.display = 'block';
    document.getElementById('room-detail-title').textContent = data.name;
    document.getElementById('room-detail-desc').textContent = data.desc;
    document.getElementById('room-detail-vastu').textContent = '🧭 ' + data.vastu;

    // Auto switch floor level to make room visible
    if (['porch', 'living', 'pooja', 'stairs', 'kitchen', 'kitchen-exit', 'bed1', 'toilet-ground'].includes(roomId)) {
      if (state.activeFloor === 'roof-off') {
        // Can see it
      } else if (state.activeFloor === 'full') {
        setFloorLevel('roof-off');
      }
    } else if (['void', 'passage', 'bed2', 'toilet-first', 'bed3', 'balcony-front', 'balcony-bed2', 'balcony-rear'].includes(roomId)) {
      if (state.activeFloor === 'ground') {
        setFloorLevel('roof-off');
      }
    }

    // Smoothly focus camera towards the room
    const targetMesh = roomMeshMap[roomId];
    if (targetMesh) {
      const pos = targetMesh.position;
      new TWEEN.Tween(controls.target)
        .to({ x: pos.x, y: pos.y, z: pos.z }, 800)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();

      if (roomId === 'balcony-rear' || roomId === 'kitchen-exit') {
        moveCameraTo({ x: 32, y: 14.5, z: -5 }, { x: 16.5, y: 11.0, z: -9 });
      } else if (roomId === 'bed3') {
        moveCameraTo({ x: 26, y: 18.0, z: -16 }, { x: 8, y: 12.0, z: -9 });
      } else if (roomId === 'balcony-front' || roomId === 'balcony-bed2') {
        moveCameraTo({ x: 0, y: 16.5, z: 28 }, { x: 0, y: 13.0, z: 12.1 });
      } else if (roomId === 'bed2') {
        moveCameraTo({ x: 18, y: 18.0, z: 18 }, { x: 7.3, y: 13.0, z: 6.0 });
      }
    }
  }
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

// UI Event Listeners
function setupEventListeners() {
  // Floor Layer Buttons
  document.querySelectorAll('.dock-btn[data-floor]').forEach(btn => {
    btn.addEventListener('click', () => setFloorLevel(btn.dataset.floor));
  });

  // Camera Presets
  document.querySelectorAll('.cam-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cam-btn[data-view]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const view = btn.dataset.view;
      if (view === 'hero') {
        moveCameraTo({ x: -34, y: 20, z: 42 }, { x: 0, y: 10, z: 4 });
      } else if (view === 'front') {
        moveCameraTo({ x: 0, y: 13, z: 58 }, { x: 0, y: 11, z: 6 });
      } else if (view === 'top') {
        moveCameraTo({ x: 0, y: 68, z: 0.1 }, { x: 0, y: 0, z: 0 });
      } else if (view === 'interior') {
        setFloorLevel('roof-off');
        moveCameraTo({ x: -14, y: 15, z: 12 }, { x: -4, y: 8, z: -3 });
      } else if (view === 'drainage') {
        setFloorLevel('full');
        moveCameraTo({ x: 26, y: 28, z: 32 }, { x: 8, y: 21, z: 8 });
        showToast('Rain Defense View: Mangalore Tile 38° Slope & Deep Eaves');
      } else if (view === 'kitchen-exit') {
        moveCameraTo({ x: 34, y: 14.5, z: -4 }, { x: 16, y: 9.0, z: -8 });
        showToast('Side Elevation: Kitchen Exit Door (Ground) & Bedroom 3 Balcony (First Floor)');
      }
    });
  });

  // Reset Camera
  document.getElementById('btn-reset-cam').addEventListener('click', () => {
    moveCameraTo({ x: -34, y: 20, z: 42 }, { x: 0, y: 10, z: 4 });
    setFloorLevel('full');
  });

  // Toggle Rain
  document.getElementById('btn-toggle-rain').addEventListener('click', toggleRain);

  // Lighting Cycle
  const lightingCycle = ['golden', 'daylight', 'monsoon', 'night'];
  document.getElementById('btn-toggle-lighting').addEventListener('click', () => {
    const currentIndex = lightingCycle.indexOf(state.lightingMode);
    const nextIndex = (currentIndex + 1) % lightingCycle.length;
    setLightingMode(lightingCycle[nextIndex]);
  });

  // X-Ray Mode
  document.getElementById('btn-xray').addEventListener('click', toggleXray);

  // Roof Style Toggle (Modern Split Skillion vs Traditional Konkan)
  const handleRoofStyleToggle = () => {
    const nextStyle = state.roofStyle === 'modern-skillion' ? 'konkan-hipped' : 'modern-skillion';
    setRoofStyle(nextStyle);
  };
  const btnRoofHeader = document.getElementById('btn-toggle-roof-style');
  if (btnRoofHeader) btnRoofHeader.addEventListener('click', handleRoofStyleToggle);
  const btnRoofDock = document.getElementById('btn-dock-roof-style');
  if (btnRoofDock) btnRoofDock.addEventListener('click', handleRoofStyleToggle);

  // Room Pills Click
  document.querySelectorAll('.room-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      selectRoom(pill.dataset.room);
    });
  });

  // Sidebar Toggles
  const sidebar = document.getElementById('sidebar');
  document.getElementById('btn-toggle-sidebar').addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });
  document.getElementById('btn-close-sidebar').addEventListener('click', () => {
    sidebar.classList.add('collapsed');
  });

  // Gallery Modal & Filter Tabs
  const modal = document.getElementById('gallery-modal');
  document.getElementById('btn-open-gallery').addEventListener('click', () => {
    modal.classList.add('open');
  });
  document.getElementById('btn-close-gallery').addEventListener('click', () => {
    modal.classList.remove('open');
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  // Gallery Tab Filtering
  document.querySelectorAll('.gallery-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.gallery-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      const items = document.querySelectorAll('.gallery-item');
      items.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Lightbox Modal Controls
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const btnCloseLightbox = document.getElementById('btn-close-lightbox');

  window.openLightbox = function(src, title, desc) {
    lightboxImg.src = src;
    lightboxTitle.textContent = title;
    lightboxDesc.textContent = desc;
    lightbox.classList.add('open');
  };

  function closeLightbox() {
    lightbox.classList.remove('open');
  }

  if (btnCloseLightbox) {
    btnCloseLightbox.addEventListener('click', closeLightbox);
  }
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      modal.classList.remove('open');
    }
  });

  // Raycasting Click & Hover on Canvas
  const canvas = document.getElementById('webgl-canvas');
  const tag = document.getElementById('room-tag');

  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hitboxes = Object.values(roomMeshMap);
    const intersects = raycaster.intersectObjects(hitboxes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (hit.userData.roomId) {
        selectRoom(hit.userData.roomId);
      }
    }
  });

  canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hitboxes = Object.values(roomMeshMap);
    const intersects = raycaster.intersectObjects(hitboxes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const rId = hit.userData.roomId;
      const data = roomDataMap[rId];
      if (data) {
        tag.style.display = 'block';
        tag.style.left = e.clientX + 'px';
        tag.style.top = (e.clientY - 12) + 'px';
        tag.innerHTML = `<strong>${data.name}</strong><br><span style="color: #ff9d80;">${data.area}</span>`;
      }
    } else {
      tag.style.display = 'none';
    }
  });
}

function onWindowResize() {
  const container = document.getElementById('canvas-wrapper');
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

// Animation Loop
function animate(time) {
  requestAnimationFrame(animate);

  TWEEN.update();
  controls.update();

  updateRain();

  renderer.render(scene, camera);
}

// Boot on Load
window.addEventListener('DOMContentLoaded', () => {
  init();
  setLightingMode('golden');
});
