import * as THREE from 'three';
import { taperedTube } from './avatar.js';
import { LOW } from './perf.js';

// Personaliza o modelo "BONECO" (DAPENHA, CC BY 4.0) — models/avatar.glb
// As malhas vêm sem cor; aqui cada parte recebe material/cor por região,
// o tronco e os braços viram um moletom e a cabeça ganha cabelo cacheado.
const C = {
  skin: 0xdfaa85,      // Tom de pele do Samir: moreno claro / bege quente natural
  hoodie: 0x18191d,    // Camiseta/moletom preto clássico (como na foto dele)
  rib: 0x22242a,       // Detalhes em preto grafite
  lining: 0x323640,    // Forro interno
  string: 0xffffff,    // Cordões brancos
  aglet: 0x4f8df7,     // Ponteira azul moderno
  shorts: 0x1e2128,    // Bermuda preta/grafite
  belt: 0x0f1115,      // Cinto
  boots: 0xf1f3f7,     // Tênis branco/cinza claro estilo sneaker
  brow: 0x181412,      // Sobrancelhas pretas/castanho bem escuro delineadas
  eye: 0x14100d,       // Olhos castanhos escuros
  hair: 0x161210,      // Cabelo crespo/cacheado escuro com volume
  hairLight: 0x2e221b, // Reflexos castanho escuro naturais
};

const skinMat = (extra = {}) => new THREE.MeshPhysicalMaterial({
  color: C.skin, roughness: 0.55, sheen: 0.35, sheenColor: 0xffcfae, sheenRoughness: 0.45,
  clearcoat: 0.08, clearcoatRoughness: 0.5, ...extra,
});
const fabric = (color) => new THREE.MeshPhysicalMaterial({
  color, roughness: 0.85, sheen: 0.3, sheenRoughness: 0.6, sheenColor: 0x9fc4ff,
});

// Pinta uma malha por vértice: colorOf(x, yf, z) devolve a cor de cada vértice
function paint(mesh, H, colorOf, material) {
  const pos = mesh.geometry.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const col = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    col.set(colorOf(pos.getX(i), pos.getY(i) / H, pos.getZ(i)));
    colors.set([col.r, col.g, col.b], i * 3);
  }
  mesh.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  material.color.set(0xffffff);
  material.vertexColors = true;
  mesh.material = material;
}

// "Infla" vértices ao longo da normal (dá volume de tecido); amount(x, yf) em unidades da cena
function inflate(mesh, H, amount) {
  const pos = mesh.geometry.attributes.position, nor = mesh.geometry.attributes.normal;
  for (let i = 0; i < pos.count; i++) {
    const a = amount(pos.getX(i), pos.getY(i) / H);
    if (!a) continue;
    pos.setXYZ(i, pos.getX(i) + nor.getX(i) * a, pos.getY(i) + nor.getY(i) * a, pos.getZ(i) + nor.getZ(i) * a);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeBoundingBox();
  mesh.geometry.computeBoundingSphere();
}

export function customizeBoneco({ meshes, H, addToHead, addToBody }) {
  // Ordem das malhas no arquivo
  const [features, boots, hemFront, eyes, hemBack, body, shorts, headArms] = meshes;
  const w = (x) => x / H; // largura relativa à altura
  const NECK = 0.735;     // abaixo disso, a malha cabeça+braços vira manga do moletom

  eyes.material = new THREE.MeshPhysicalMaterial({ color: C.eye, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.03 });
  boots.material = new THREE.MeshPhysicalMaterial({ color: C.boots, roughness: 0.6 });
  for (const m of [hemFront, hemBack, shorts]) m.material = fabric(C.shorts);
  paint(features, H, (x, yf) => {
    if (yf < 0.6) return C.belt;
    if (yf > 0.912) return C.brow;
    return C.skin;
  }, skinMat());

  // Medidas: pulso (ponta mais baixa do braço), ombros, pescoço e tronco
  const p = new THREE.Vector3();
  const hp = headArms.geometry.attributes.position, bp = body.geometry.attributes.position;
  let wristY = Infinity, shoulderY = 0;
  const neck = new THREE.Vector3(); let nNeck = 0, neckR = 0;
  const headBox = new THREE.Box3(), torso = new THREE.Box3();
  for (let i = 0; i < hp.count; i++) {
    p.fromBufferAttribute(hp, i);
    if (p.y < NECK * H) wristY = Math.min(wristY, p.y);
    if (p.y > 0.745 * H) headBox.expandByPoint(p);
    if (p.y > 0.725 * H && p.y < 0.742 * H && Math.abs(p.x) < 0.1 * H) { neck.add(p); nNeck++; }
  }
  neck.divideScalar(nNeck || 1);
  for (let i = 0; i < hp.count; i++) {
    p.fromBufferAttribute(hp, i);
    if (p.y > 0.725 * H && p.y < 0.742 * H && Math.abs(p.x) < 0.1 * H) neckR = Math.max(neckR, Math.hypot(p.x - neck.x, p.z - neck.z));
  }
  for (let i = 0; i < bp.count; i++) {
    p.fromBufferAttribute(bp, i);
    if (p.y < 0.745 * H) shoulderY = Math.max(shoulderY, p.y);
    if (p.y > 0.5 * H && p.y < 0.73 * H && Math.abs(w(p.x)) <= 0.17) torso.expandByPoint(p);
  }

  // Moletom: tronco (antiga regata) + braços inteiros como mangas compridas
  const isTop = (x, yf) => yf >= 0.28 && Math.abs(w(x)) <= 0.17;
  paint(body, H, (x, yf) => (!isTop(x, yf) ? C.skin : yf < 0.535 ? C.rib : C.hoodie), fabric(C.hoodie));
  inflate(body, H, (x, yf) => (isTop(x, yf) ? 0.022 * H * THREE.MathUtils.smoothstep(yf, 0.5, 0.52) : 0));

  const cuffY = wristY / H + 0.035;
  paint(headArms, H, (x, yf) => (yf >= NECK ? C.skin : yf < cuffY ? C.rib : C.hoodie), skinMat({ roughness: 0.7 }));
  inflate(headArms, H, (x, yf) => (yf < NECK ? 0.016 * H * (1 - THREE.MathUtils.smoothstep(yf, NECK - 0.02, NECK)) : 0));

  addToBody(buildHood(neck, neckR, shoulderY, torso, body, H));
  addToBody(buildPocket(body, torso, H));
  addToBody(buildNikeSwoosh(torso, H));
  addToHead(buildHair(headArms, headBox, H));

  // Ajusta a postura para sentar e adiciona a cadeira de rodas
  applySittingPosture(meshes, H);
  addToBody(buildWheelchair(H));
}

// Logo oficial da Nike (Swoosh) em alta resolução no peito do moletom
function buildNikeSwoosh(torso, H) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 512, 256);
  ctx.fillStyle = '#ffffff';

  // Desenha o Swoosh da Nike com o traçado oficial
  ctx.save();
  ctx.translate(80, 20);
  ctx.scale(15, 15);
  const p = new Path2D('M24 7.8L6.442 15.276c-1.456.616-2.679.925-3.668.925-1.12 0-1.933-.392-2.437-1.177-.317-.504-.41-1.143-.28-1.918.13-.775.476-1.6 1.036-2.478.467-.71 1.232-1.643 2.297-2.8a6.122 6.122 0 00-.784 1.848c-.28 1.195-.028 2.072.756 2.632.373.261.886.392 1.54.392.522 0 1.11-.084 1.764-.252L24 7.8z');
  ctx.fill(p);
  ctx.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.18), mat);
  // Posicionado no peito esquerdo (lado do coração)
  mesh.position.set(0.19, 0.655 * H, torso.max.z + 0.022);
  mesh.rotation.y = 0.08;
  mesh.rotation.x = -0.06;
  return mesh;
}

// Postura sentada na cadeira de rodas para as malhas inferiores (pernas, bermuda e tênis)
function applySittingPosture(meshes, H) {
  const hipY = 0.495 * H; // ~1.98

  // Pontos de controle da curvatura das pernas: (y, z, theta) de u=0 (quadril) a u=1 (solas)
  const spinePoints = [
    { y: hipY,        z: -0.02, th: 0.00 }, // u=0.00: quadril
    { y: hipY - 0.20, z:  0.34, th: 0.68 }, // u=0.25: meio das coxas descansando no assento
    { y: 1.58,        z:  0.72, th: 1.35 }, // u=0.50: joelhos dobrados na borda da almofada
    { y: 1.02,        z:  0.70, th: 0.25 }, // u=0.75: canelas descendo para os pés
    { y: 0.40,        z:  0.66, th: 0.00 }, // u=1.00: solas dos tênis no apoio de pés
  ];

  function getSpine(u) {
    const clampedU = Math.max(0, Math.min(1, u));
    const idx = Math.min(3, Math.floor(clampedU * 4));
    const t = (clampedU - idx * 0.25) / 0.25;
    const st = t * t * (3 - 2 * t);
    const p0 = spinePoints[idx], p1 = spinePoints[idx + 1];
    return {
      y: p0.y + (p1.y - p0.y) * st,
      z: p0.z + (p1.z - p0.z) * st,
      th: p0.th + (p1.th - p0.th) * st,
    };
  }

  for (const m of meshes) {
    const pos = m.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const origY = pos.getY(i);
      if (origY >= hipY) continue;
      const origZ = pos.getZ(i);
      const u = (hipY - origY) / hipY;
      const sp = getSpine(u);
      const sinTh = Math.sin(sp.th);
      const cosTh = Math.cos(sp.th);
      // Gira a seção transversal para acompanhar a curvatura da perna
      const newY = sp.y + origZ * sinTh;
      const newZ = sp.z + origZ * cosTh;
      pos.setY(i, newY);
      pos.setZ(i, newZ);
    }
    pos.needsUpdate = true;
    m.geometry.computeVertexNormals();
    m.geometry.computeBoundingBox();
    m.geometry.computeBoundingSphere();
  }
}

// Cadeira de rodas 3D esportiva, compacta e harmoniosa com as proporções do corpo
function buildWheelchair(H) {
  const g = new THREE.Group();

  // Materiais
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x1f242d,
    roughness: 0.35,
    metalness: 0.85,
  });
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe0e6ed,
    roughness: 0.18,
    metalness: 0.95,
  });
  const rubberMat = new THREE.MeshStandardMaterial({
    color: 0x111317,
    roughness: 0.88,
    metalness: 0.05,
  });
  const fabricMat = new THREE.MeshPhysicalMaterial({
    color: 0x16181e,
    roughness: 0.85,
    sheen: 0.25,
    sheenColor: 0x3b4252,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    roughness: 0.4,
    metalness: 0.5,
  });

  // 1. Assento (Cushion) compacto e ajustado
  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, 0.12, 0.85),
    fabricMat
  );
  seat.position.set(0, 1.48, 0.28);
  g.add(seat);

  // Base do assento (estrutura sob a almofada)
  const seatBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.02, 0.035, 0.83),
    frameMat
  );
  seatBase.position.set(0, 1.41, 0.28);
  g.add(seatBase);

  // 2. Encosto (Backrest) e Manoplas traseiras
  const backYBot = 1.42, backYTop = 2.45;
  const backZBot = -0.12, backZTop = -0.32;
  for (const s of [-1, 1]) {
    const postPts = [
      new THREE.Vector3(s * 0.46, backYBot, backZBot),
      new THREE.Vector3(s * 0.46, backYTop, backZTop),
    ];
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(postPts), 12, 0.028, 12, false), frameMat));

    // Manoplas de empurrar
    const handlePts = [
      new THREE.Vector3(s * 0.46, backYTop, backZTop),
      new THREE.Vector3(s * 0.46, backYTop + 0.035, backZTop - 0.10),
      new THREE.Vector3(s * 0.46, backYTop, backZTop - 0.22),
    ];
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(handlePts), 16, 0.024, 12, false), rubberMat));
  }

  // Almofada do encosto
  const backrest = new THREE.Mesh(
    new THREE.BoxGeometry(0.86, 0.82, 0.08),
    fabricMat
  );
  backrest.position.set(0, 1.94, -0.23);
  backrest.rotation.x = -0.18;
  g.add(backrest);

  // Faixa decorativa no encosto
  const backStripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.87, 0.10, 0.085),
    accentMat
  );
  backStripe.position.set(0, 2.04, -0.21);
  backStripe.rotation.x = -0.18;
  g.add(backStripe);

  // 3. Protetores Laterais de Roupa e Apoios de Braço
  for (const s of [-1, 1]) {
    const guard = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, 0.55, 0.82),
      frameMat
    );
    guard.position.set(s * 0.53, 1.62, 0.26);
    g.add(guard);

    const armrest = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.045, 0.48),
      rubberMat
    );
    armrest.position.set(s * 0.53, 1.78, 0.20);
    g.add(armrest);
  }

  // 4. Rodas Traseiras Grandes (Drive Wheels) com proporção harmoniosa
  const wheelR = 1.05;
  const hubY = 1.05;
  const hubZ = -0.06;
  const wheelX = 0.64;

  // Eixo transversal conectando as duas rodas
  const axle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, wheelX * 2, 16),
    frameMat
  );
  axle.rotation.z = Math.PI / 2;
  axle.position.set(0, hubY, hubZ);
  g.add(axle);

  for (const s of [-1, 1]) {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(s * wheelX, hubY, hubZ);
    // Camber esportivo sutil (~3 graus)
    wheelGroup.rotation.z = s * 0.05;

    // Pneu com borracha escura
    const tire = new THREE.Mesh(
      new THREE.TorusGeometry(wheelR, 0.052, 16, 64),
      rubberMat
    );
    tire.rotation.y = Math.PI / 2;
    wheelGroup.add(tire);

    // Aro principal
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(wheelR - 0.065, 0.024, 12, 64),
      chromeMat
    );
    rim.rotation.y = Math.PI / 2;
    wheelGroup.add(rim);

    // Aro de impulsão manual (Pushrim)
    const pushrim = new THREE.Mesh(
      new THREE.TorusGeometry(wheelR * 0.85, 0.020, 12, 64),
      chromeMat
    );
    pushrim.rotation.y = Math.PI / 2;
    pushrim.position.x = s * 0.065;
    wheelGroup.add(pushrim);

    // Suportes do pushrim
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      const bracket = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.14, 8),
        chromeMat
      );
      bracket.position.set(s * 0.032, Math.sin(a) * (wheelR * 0.88), Math.cos(a) * (wheelR * 0.88));
      bracket.rotation.z = Math.PI / 2;
      wheelGroup.add(bracket);
    }

    // Cubo central da roda
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.12, 18),
      accentMat
    );
    hub.rotation.z = Math.PI / 2;
    wheelGroup.add(hub);

    // Raios metálicos cruzados (Spokes)
    const spokeCount = 20;
    const spokeLen = wheelR - 0.07;
    for (let k = 0; k < spokeCount; k++) {
      const a = (k / spokeCount) * Math.PI * 2;
      const spoke = new THREE.Mesh(
        new THREE.CylinderGeometry(0.005, 0.005, spokeLen, 6),
        chromeMat
      );
      spoke.position.set(s * (k % 2 === 0 ? 0.018 : -0.018), Math.sin(a) * (spokeLen * 0.5), Math.cos(a) * (spokeLen * 0.5));
      spoke.rotation.x = a + Math.PI / 2;
      wheelGroup.add(spoke);
    }

    g.add(wheelGroup);
  }

  // 5. Chassi Tubular Inferior e Rodinhas Frontais (Casters)
  const casterX = 0.42, casterZ = 0.72, casterR = 0.18;
  for (const s of [-1, 1]) {
    // Tubo inferior ligando traseira à frente
    const framePts = [
      new THREE.Vector3(s * 0.48, hubY, hubZ),
      new THREE.Vector3(s * 0.44, 0.55, 0.22),
      new THREE.Vector3(s * casterX, 0.38, casterZ),
    ];
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(framePts), 20, 0.028, 12, false), frameMat));

    // Sustentação vertical para o assento
    const seatUpPts = [
      new THREE.Vector3(s * 0.44, 0.55, 0.22),
      new THREE.Vector3(s * 0.46, 1.41, 0.28),
    ];
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(seatUpPts), 8, 0.025, 10, false), frameMat));

    // Garfo da rodinha dianteira
    const forkPts = [
      new THREE.Vector3(s * casterX, 0.38, casterZ),
      new THREE.Vector3(s * casterX, casterR, casterZ),
    ];
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(forkPts), 6, 0.020, 10, false), chromeMat));

    // Pneu da rodinha frontal
    const casterTire = new THREE.Mesh(
      new THREE.TorusGeometry(casterR, 0.038, 12, 32),
      rubberMat
    );
    casterTire.position.set(s * casterX, casterR, casterZ);
    casterTire.rotation.y = Math.PI / 2;
    g.add(casterTire);

    // Núcleo da rodinha frontal
    const casterCore = new THREE.Mesh(
      new THREE.CylinderGeometry(casterR * 0.7, casterR * 0.7, 0.05, 16),
      chromeMat
    );
    casterCore.position.set(s * casterX, casterR, casterZ);
    casterCore.rotation.z = Math.PI / 2;
    g.add(casterCore);
  }

  // 6. Barra e Plataforma dos Pés (Footrest Plate)
  const footY = 0.36, footZ = 0.68;
  const footBar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, casterX * 2, 12),
    frameMat
  );
  footBar.position.set(0, footY, footZ);
  footBar.rotation.z = Math.PI / 2;
  g.add(footBar);

  const footPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.025, 0.32),
    frameMat
  );
  footPlate.position.set(0, footY + 0.012, footZ + 0.06);
  g.add(footPlate);

  // Estrias antiderrapantes
  for (let r = 0; r < 3; r++) {
    const rib = new THREE.Mesh(
      new THREE.BoxGeometry(0.60, 0.01, 0.018),
      chromeMat
    );
    rib.position.set(0, footY + 0.028, footZ + 0.01 + r * 0.06);
    g.add(rib);
  }

  // 7. Alavancas de Freio de Estacionamento
  for (const s of [-1, 1]) {
    const brakeLever = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.18, 8),
      accentMat
    );
    brakeLever.position.set(s * 0.55, 1.30, 0.12);
    brakeLever.rotation.x = 0.35;
    g.add(brakeLever);
  }

  return g;
}

// Capuz caído atrás do pescoço, com forro claro e cordões
function buildHood(neck, neckR, shoulderY, torso, body, H) {
  const g = new THREE.Group();
  const R = Math.min(neckR * 1.45, (torso.max.x - torso.min.x) * 0.3), tube = R * 0.3;
  const outer = fabric(C.hoodie), lining = fabric(C.lining);

  const ring = new THREE.Group();
  ring.position.set(neck.x, shoulderY + tube * 0.2, neck.z - R * 0.12);
  ring.rotation.x = 0.28; // frente mais baixa que a nuca
  const outerRing = new THREE.Mesh(new THREE.TorusGeometry(R, tube, 24, 72), outer);
  outerRing.rotation.x = Math.PI / 2;
  outerRing.scale.set(1.12, 1, 0.9);
  const innerRing = new THREE.Mesh(new THREE.TorusGeometry(R * 0.86, tube * 0.55, 20, 72), lining);
  innerRing.rotation.x = Math.PI / 2;
  innerRing.position.y = tube * 0.35;
  innerRing.scale.set(1.12, 1, 0.9);
  ring.add(outerRing, innerRing);

  // Volume do capuz deitado nas costas
  const back = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), outer);
  back.scale.set(R * 1.3, R * 1.0, R * 0.7);
  back.position.set(neck.x, shoulderY - R * 0.15, neck.z - R * 1.15);
  g.add(ring, back);

  // Cordões: descem pela frente seguindo o peito
  const ray = new THREE.Raycaster();
  const front = (x, y) => {
    ray.set(new THREE.Vector3(x, y, torso.max.z + H), new THREE.Vector3(0, 0, -1));
    const hit = ray.intersectObject(body)[0];
    return hit ? hit.point.z : torso.max.z;
  };
  const strMat = new THREE.MeshStandardMaterial({ color: C.string, roughness: 0.6 });
  const agMat = new THREE.MeshStandardMaterial({ color: C.aglet, roughness: 0.35, metalness: 0.4 });
  for (const s of [-1, 1]) {
    const x0 = neck.x + s * R * 0.42;
    const pts = [0, 0.06, 0.12, 0.17].map((d, i) => {
      const y = shoulderY - d * H;
      const x = x0 + s * (i % 2 ? 0.006 : 0) * H;
      return new THREE.Vector3(x, y, (i === 0 ? neck.z + R * 0.95 : front(x, y)) + 0.012 * H);
    });
    g.add(taperedTube(new THREE.CatmullRomCurve3(pts), 0.0055 * H, strMat));
    const end = pts[pts.length - 1];
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.0065 * H, 0.0065 * H, 0.022 * H, 14), agMat);
    tip.position.set(end.x, end.y - 0.01 * H, end.z);
    g.add(tip);
  }
  return g;
}

// Bolso canguru: retalho que acompanha a barriga, um pouco mais escuro
function buildPocket(body, torso, H) {
  const yTop = 0.6 * H, yBot = 0.54 * H;
  const halfTop = (torso.max.x - torso.min.x) * 0.3, halfBot = (torso.max.x - torso.min.x) * 0.38;
  const geo = new THREE.PlaneGeometry(1, 1, 24, 12);
  const pos = geo.attributes.position;
  const ray = new THREE.Raycaster();
  const cx = (torso.min.x + torso.max.x) / 2;
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i) + 0.5, v = pos.getY(i) + 0.5; // 0..1
    const y = yBot + v * (yTop - yBot);
    const half = halfBot + (halfTop - halfBot) * v;
    const x = cx + (u - 0.5) * 2 * half;
    ray.set(new THREE.Vector3(x, y, torso.max.z + H), new THREE.Vector3(0, 0, -1));
    const hit = ray.intersectObject(body)[0];
    pos.setXYZ(i, x, y, (hit ? hit.point.z : torso.max.z) + 0.006 * H);
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, fabric(C.rib));
}

// Cacho pequeno e bem enrolado (espiral apertada), eixo voltado para +z
function curlGeometry() {
  const pts = [];
  for (let i = 0; i <= 70; i++) {
    const t = i / 70;
    const a = t * 2.6 * Math.PI * 2;
    const r = 1 - 0.6 * t;
    pts.push(new THREE.Vector3(r * Math.cos(a), r * Math.sin(a), 1.1 * t));
  }
  const taper = (u) => (1 - 0.4 * u) * Math.min(1, u * 10) ** 0.5 * Math.min(1, (1 - u) * 10) ** 0.6;
  return taperedTube(new THREE.CatmullRomCurve3(pts), 0.38, null, taper, 90, 8).geometry;
}

// Gerador pseudoaleatório determinístico (mulberry32)
function seeded(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildHair(headMesh, headBox, H) {
  // Aleatório com semente fixa: o cabelo sai idêntico em todas as cenas (home, mesa, redes)
  const rand = seeded(20260411);
  const center = headBox.getCenter(new THREE.Vector3());
  const half = headBox.getSize(new THREE.Vector3()).multiplyScalar(0.5);
  const ray = new THREE.Raycaster();
  const surface = (dir) => {
    ray.set(center.clone().addScaledVector(dir, H), dir.clone().negate());
    return ray.intersectObject(headMesh)[0];
  };

  const THETA = 1.42, TILT = -0.65; // testa livre na frente, desce mais atrás
  // Menos cachos no modo leve (celular): carrega e desenha mais rápido
  const COUNT = LOW ? 190 : 340, FRINGE = LOW ? 28 : 46;
  // Fosco: sem clearcoat, só um sheen suave de fio
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.82, sheen: 0.35, sheenColor: 0x4a3a30, sheenRoughness: 0.7,
  });
  const curls = new THREE.InstancedMesh(curlGeometry(), mat, COUNT + FRINGE);
  const dark = new THREE.Color(C.hair), light = new THREE.Color(C.hairLight), col = new THREE.Color();
  const tmp = new THREE.Object3D();
  const Z = new THREE.Vector3(0, 0, 1), X = new THREE.Vector3(1, 0, 0), n = new THREE.Vector3(), spin = new THREE.Quaternion();
  const size = Math.min(half.x, half.y, half.z);
  const cosMax = Math.cos(THETA);

  let i = 0, tries = 0;
  while (i < COUNT + FRINGE && tries++ < 30000) {
    const fringe = i >= COUNT;
    const y = fringe ? Math.cos(THETA + TILT - 0.02 + rand() * 0.22) : cosMax + rand() * (1 - cosMax);
    const phi = rand() * Math.PI * 2;
    const r = Math.sqrt(1 - y * y);
    const dir = new THREE.Vector3(r * Math.cos(phi), y, r * Math.sin(phi));
    if (!fringe) dir.applyAxisAngle(X, TILT);
    if (fringe && dir.z < 0.55) continue;
    const hit = surface(dir.multiply(half).normalize());
    if (!hit) continue;
    const local = hit.point.clone().sub(center);
    // Deixa as orelhas à mostra
    if (Math.abs(local.x) > half.x * 0.75 && local.y < half.y * 0.15 && local.z > -half.z * 0.4) continue;
    n.copy(hit.face.normal).normalize();
    const u = Math.acos(THREE.MathUtils.clamp(local.y / half.y, -1, 1)) / Math.PI;
    tmp.position.copy(hit.point).addScaledVector(n, size * (0.05 + 0.16 * (1 - u)) * (0.5 + 0.5 * rand()));
    n.x += (rand() - 0.5) * 0.8;
    n.y += (rand() - 0.5) * 0.8;
    tmp.quaternion.setFromUnitVectors(Z, n.normalize());
    tmp.quaternion.multiply(spin.setFromAxisAngle(Z, rand() * Math.PI * 2));
    tmp.scale.setScalar(size * (0.15 + rand() * 0.08));
    tmp.updateMatrix();
    curls.setMatrixAt(i, tmp.matrix);
    curls.setColorAt(i, col.copy(dark).lerp(light, rand() ** 2));
    i++;
  }
  curls.count = i;
  return curls;
}
