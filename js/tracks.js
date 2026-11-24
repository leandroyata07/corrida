/**
 * LH44 - LOW TO HIGH SPEED
 * Condições climáticas, definições de pistas e construtor de circuitos 3D
 */

const ENV_CONDITIONS = [
  { id: 'DIA',         label: 'DIA',         icon: '🌤' },
  { id: 'TARDE',       label: 'TARDE',       icon: '🌇' },
  { id: 'NOITE',       label: 'NOITE',       icon: '🌙' },
  { id: 'DINAMICO',    label: 'DINÂMICO',    icon: '🔄' },
  { id: 'CHUVA',       label: 'CHUVA DIA',   icon: '🌧' },
  { id: 'CHUVA_NOITE', label: 'CHUVA NOITE', icon: '⛈' },
  { id: 'NEVE',        label: 'NEVE DIA',    icon: '❄' },
  { id: 'NEVE_NOITE',  label: 'NEVE NOITE',  icon: '🌨' }
];
const DYN_ORDER = ['DIA', 'TARDE', 'NOITE', 'CHUVA', 'CHUVA_NOITE', 'NEVE', 'NEVE_NOITE'];
const DYN_HOLD = 18;   // segundos estáveis em cada condição
const DYN_BLEND = 16;  // segundos de transição ultra-suave entre horários/climas

const ENV_COLOR_KEYS = [
  'skyTop', 'skyMid', 'skyBottom', 'mountainColor', 'mountainFront',
  'roadDark', 'roadLight', 'grassDark', 'grassLight', 'rumbleDark', 'rumbleLight', 'lane',
  'cloudTop', 'cloudBot', 'sunCore', 'sunGlow'
];
const ENV_SCALARS = ['night', 'rain', 'snow', 'sun', 'dusk', 'cover', 'sunY', 'sunSize', 'glare'];

const ENV_PRESETS = {
  DIA: {
    sky: ['#1557B0', '#3B8BEB', '#92CEFF'], mtn: ['#1B5E20', '#2E7D32'], cloud: ['#FFFFFF', '#D0E5FF'],
    sunC: '#FFFDE7', sunG: '#FFEE58',
    ground: { mul: [1, 1, 1], add: [0, 0, 0], sat: 1 },
    s: { night: 0, rain: 0, snow: 0, sun: 1, dusk: 0, cover: 0.75, sunY: 30, sunSize: 1.15, glare: 0 }
  },
  TARDE: {
    sky: ['#2E103D', '#8E2E52', '#F28B30'], mtn: ['#451B26', '#682836'], cloud: ['#732648', '#FFA260'],
    sunC: '#FFE082', sunG: '#FF7043',
    ground: { mul: [1, 0.74, 0.58], add: [16, 4, -6], sat: 1.05 },
    s: { night: 0, rain: 0, snow: 0, sun: 1, dusk: 1, cover: 0.7, sunY: 48, sunSize: 1.25, glare: 0.25 }
  },
  NOITE: {
    sky: ['#040610', '#0A1126', '#162447'], mtn: ['#090D1A', '#11182D'], cloud: ['#1B2742', '#0E1630'],
    sunC: '#FFFFFF', sunG: '#FFFFFF',
    ground: { mul: [0.27, 0.31, 0.5], add: [0, 0, 8], sat: 0.9 },
    s: { night: 1, rain: 0, snow: 0, sun: 0, dusk: 0, cover: 0.3, sunY: 33, sunSize: 1, glare: 0 }
  },
  CHUVA: {
    sky: ['#38424E', '#505C6A', '#7A8896'], mtn: ['#283533', '#354440'], cloud: ['#4D5763', '#2E3640'],
    sunC: '#FFFFFF', sunG: '#FFFFFF',
    ground: { mul: [0.60, 0.65, 0.68], add: [0, 0, 0], sat: 0.55 },
    s: { night: 0, rain: 1, snow: 0, sun: 0, dusk: 0, cover: 1, sunY: 33, sunSize: 1, glare: 0 }
  },
  CHUVA_NOITE: {
    sky: ['#03050C', '#070C1B', '#0E1626'], mtn: ['#060912', '#0C111E'], cloud: ['#101726', '#080C14'],
    sunC: '#FFFFFF', sunG: '#FFFFFF',
    ground: { mul: [0.22, 0.25, 0.40], add: [0, 0, 6], sat: 0.8 },
    s: { night: 1, rain: 1, snow: 0, sun: 0, dusk: 0, cover: 0.9, sunY: 33, sunSize: 1, glare: 0 }
  },
  CHUVA_TARDE: {
    sky: ['#2A162B', '#5A2A3E', '#A84E3A'], mtn: ['#2F1820', '#4A232E'], cloud: ['#441F32', '#7A3845'],
    sunC: '#FFB74D', sunG: '#FF7043',
    ground: { mul: [0.55, 0.48, 0.44], add: [8, 2, -4], sat: 0.8 },
    s: { night: 0, rain: 1, snow: 0, sun: 0.2, dusk: 1, cover: 0.95, sunY: 48, sunSize: 1.1, glare: 0.15 }
  },
  NEVE: {
    sky: ['#869EB6', '#B0C2D4', '#E0EAF4'], mtn: ['#C8D6E4', '#E8F0F8'], cloud: ['#F2F6FA', '#C9D6E3'],
    sunC: '#FFFFFF', sunG: '#E6F0FA',
    ground: { mul: [0.96, 0.98, 1.0], add: [6, 8, 12], sat: 0.55, grass: ['#EEF4FA', '#E0EAF3'] },
    s: { night: 0, rain: 0, snow: 1, sun: 0.12, dusk: 0, cover: 0.95, sunY: 38, sunSize: 0.9, glare: 0 }
  },
  NEVE_TARDE: {
    sky: ['#42284A', '#7A4058', '#C97558'], mtn: ['#5A3644', '#8A5266'], cloud: ['#6B3C52', '#B86B60'],
    sunC: '#FFE082', sunG: '#FF8A65',
    ground: { mul: [0.85, 0.72, 0.75], add: [14, 6, 8], sat: 0.85, grass: ['#D6C2CE', '#BA9CAE'] },
    s: { night: 0, rain: 0, snow: 1, sun: 0.2, dusk: 1, cover: 0.85, sunY: 48, sunSize: 1.15, glare: 0.18 }
  },
  NEVE_NOITE: {
    sky: ['#03050E', '#070E20', '#121D38'], mtn: ['#091020', '#141E38'], cloud: ['#16223C', '#0A1224'],
    sunC: '#FFFFFF', sunG: '#FFFFFF',
    ground: { mul: [0.30, 0.36, 0.52], add: [8, 12, 18], sat: 0.75, grass: ['#6B7C96', '#4A5870'] },
    s: { night: 1, rain: 0, snow: 1, sun: 0, dusk: 0, cover: 0.6, sunY: 33, sunSize: 1, glare: 0 }
  }
};

const _envCache = new Map();
function finalizeEnv(T) {
  const css = {};
  for (let i = 0; i < ENV_COLOR_KEYS.length; i++) {
    const k = ENV_COLOR_KEYS[i];
    css[k] = ColorUtil.css(T.c[k]);
  }
  T.css = css;
  return T;
}

function getEnvTarget(track, cond) {
  const key = track.id + '|' + cond;
  let T = _envCache.get(key);
  if (T) return T;
  const P = ENV_PRESETS[cond];
  const base = track.day || track.colors;
  const g = P.ground;
  const rgb = (h) => ColorUtil.parse(h);
  const gx = (h) => ColorUtil.xform(h, g.mul, g.add, g.sat);
  T = { c: {}, s: {} };
  T.c.skyTop = rgb(P.sky[0]);
  T.c.skyMid = rgb(P.sky[1]);
  T.c.skyBottom = rgb(P.sky[2]);
  T.c.mountainColor = rgb(P.mtn[0]);
  T.c.mountainFront = rgb(P.mtn[1]);
  T.c.cloudTop = rgb(P.cloud[0]);
  T.c.cloudBot = rgb(P.cloud[1]);
  T.c.sunCore = rgb(P.sunC);
  T.c.sunGlow = rgb(P.sunG);
  T.c.roadDark = gx(base.roadDark);
  T.c.roadLight = gx(base.roadLight);
  T.c.rumbleDark = gx(base.rumbleDark);
  T.c.rumbleLight = gx(base.rumbleLight);
  T.c.lane = gx(base.lane);
  T.c.grassDark = g.grass ? rgb(g.grass[1]) : gx(base.grassDark);
  T.c.grassLight = g.grass ? rgb(g.grass[0]) : gx(base.grassLight);
  for (let i = 0; i < ENV_SCALARS.length; i++) {
    T.s[ENV_SCALARS[i]] = P.s[ENV_SCALARS[i]];
  }
  finalizeEnv(T);
  _envCache.set(key, T);
  return T;
}

function lerpEnv(A, B, t) {
  const R = { c: {}, s: {} };
  for (let i = 0; i < ENV_COLOR_KEYS.length; i++) {
    const k = ENV_COLOR_KEYS[i];
    R.c[k] = ColorUtil.mix(A.c[k], B.c[k], t);
  }
  for (let i = 0; i < ENV_SCALARS.length; i++) {
    const k = ENV_SCALARS[i];
    R.s[k] = A.s[k] + (B.s[k] - A.s[k]) * t;
  }
  return finalizeEnv(R);
}

const BOT_BODY_COLORS = [
  '#E74C3C', '#3498DB', '#F1C40F', '#2ECC71', '#9B59B6',
  '#E67E22', '#1ABC9C', '#ECF0F1', '#34495E', '#D35400',
  '#C0392B', '#2980B9', '#27AE60', '#8E44AD', '#F39C12',
  '#16A085', '#BDC3C7', '#7F8C8D', '#E84393'
];

// ==========================================
// PISTAS DO CAMPEONATO NACIONAL (27 CAPITAIS DO BRASIL)
// Circuitos contínuos fechados com elevações, relevos e monumentos históricos
// ==========================================
// TRACK_DEFINITIONS carregado de js/tracks_data.js

class TrackBuilder {
  static build(trackDef, mirrored = false) {
    const segments = [];
    const pitSide = (typeof trackDef.pitSide === 'number')
      ? (trackDef.pitSide < 0 ? -1 : 1)
      : ((trackDef.sections[1] && trackDef.sections[1].curve > 0) ? -1 : 1);
    const sections = trackDef.sections;
    const hasCustomMap = !!(trackDef.mapPoints && trackDef.mapPoints.length > 16);
    const lengthScale = 1.5;

    for (let s = 0; s < sections.length; s++) {
      const sec = sections[s];
      const segCount = Math.max(1, Math.round(sec.length * lengthScale));
      const maxCurve = sec.curve;
      const maxHill  = sec.hill || 0;

      for (let i = 0; i < segCount; i++) {
        const idx = segments.length;

        // Transição senoidal longa (36%) na entrada e saída de cada curva para máxima fluidez
        let curveRatio = 1.0;
        const ramp = Math.floor(segCount * 0.36);
        if (ramp > 0) {
          if (i < ramp) {
            curveRatio = 0.5 - 0.5 * Math.cos((i / ramp) * Math.PI);
          } else if (i > segCount - ramp) {
            curveRatio = 0.5 - 0.5 * Math.cos(((segCount - i) / ramp) * Math.PI);
          }
        }
        const curveVal = maxCurve * curveRatio;

        const prevY = (idx === 0) ? 0 : segments[idx - 1].p2.world.y;
        let y2 = prevY;
        if (maxHill !== 0) {
          const phase = (i / segCount) * Math.PI * 2;
          const currentH = (1 - Math.cos(phase)) * 0.5 * maxHill;
          const nextPhase = ((i + 1) / segCount) * Math.PI * 2;
          const nextH = (1 - Math.cos(nextPhase)) * 0.5 * maxHill;
          y2 = prevY + (nextH - currentH);
        }

        const isLight = Math.floor(idx / 3) % 2 === 0;
        const segColors = {
          road:   isLight ? trackDef.colors.roadLight   : trackDef.colors.roadDark,
          grass:  isLight ? trackDef.colors.grassLight  : trackDef.colors.grassDark,
          rumble: (sec.rumbleTheme === 'brasil')
            ? (isLight ? '#FEDD00' : '#009739')
            : (isLight ? trackDef.colors.rumbleLight : trackDef.colors.rumbleDark),
          lane:   isLight ? trackDef.colors.lane        : 'transparent'
        };

        const guardrailBoth = (sec.guardrail === 'both') || !!sec.bridge;
        const guardLeft = guardrailBoth || (sec.guardrail === 'left');
        const guardRight = guardrailBoth || (sec.guardrail === 'right');

        const isTunnel = !!sec.tunnel;
        const isBridge = !!sec.bridge;
        let tunnelPortal = null;
        if (isTunnel) {
          if (i === 0) tunnelPortal = 'entry';
          else if (i === segCount - 1) tunnelPortal = 'exit';
        }

        // Passarela aérea / Pórtico patrocinado
        const isOverhead = !!sec.overheadBridge && (s === 0 ? (i === 44) : (i === Math.floor(segCount / 2)));

        // --- SISTEMA RICO DE CENÁRIOS E PROPS LATERAIS DUPLOS ---
        const sceneries = [];

        // 1. Elementos da Reta de Largada / Boxes (Seção 0)
        if (sec.timingTower && (i === 24 || i === 64)) {
          sceneries.push({ type: 'timing_tower', offset: -1.35 * pitSide });
        }

        // 2. Monumentos Principais e Secundários da Seção
        if (sec.monument && i === Math.floor(segCount * 0.45)) {
          const mOffset = (typeof sec.monumentOffset === 'number')
            ? sec.monumentOffset
            : (sec.curve > 0 ? -1.82 : 1.82);
          sceneries.push({ type: sec.monument, offset: mOffset });
        }
        if (sec.monument2 && i === Math.floor(segCount * 0.78)) {
          const mOffset2 = (typeof sec.monument2Offset === 'number')
            ? sec.monument2Offset
            : (sec.curve > 0 ? 1.82 : -1.82);
          sceneries.push({ type: sec.monument2, offset: mOffset2 });
        }

        // 3. Povoamento Rítmico das Margens (Cada 6 a 8 segmentos)
        const isSharp = Math.abs(sec.curve) >= 1.5;
        if (isSharp) {
          // Curva acentuada: Placas refletivas com setas no lado externo da curva
          if (idx % 8 === 0) {
            if (sec.curve < 0) {
              sceneries.push({ type: 'sign_left', offset: 1.76 }); // Seta para esquerda no bordo externo direito
            } else {
              sceneries.push({ type: 'sign_right', offset: -1.76 }); // Seta para direita no bordo externo esquerdo
            }
          }
          // Lado interno da curva: flora regional (palmeira, pinheiro ou árvore)
          if (idx % 12 === 4) {
            const innerSide = (sec.curve < 0) ? -1.86 : 1.86;
            const flora = sec.flora || trackDef.defaultFlora || 'tree';
            sceneries.push({ type: flora, offset: innerSide });
          }
        } else {
          // Reta ou curva suave: Postes de iluminação, flora regional e outdoors retrô
          if (sec.bridge) {
            // Pontes e viadutos contam com postes duplos iluminados
            if (idx % 10 === 0) {
              sceneries.push({ type: 'streetlamp', offset: -1.68 });
              sceneries.push({ type: 'streetlamp', offset: 1.68 });
            }
          } else if (sec.scenery === 'building') {
            if (idx % 12 === 0) {
              sceneries.push({ type: 'building', offset: (idx % 24 === 0 ? -1.92 : 1.92) });
              sceneries.push({ type: 'streetlamp', offset: (idx % 24 === 0 ? 1.78 : -1.78) });
            }
          } else {
            // Margem com iluminação rítmica
            if (idx % 8 === 0) {
              const lampSide = (idx % 16 === 0) ? -1.80 : 1.80;
              const lampType = trackDef.urbanLighting ? 'streetlamp' : (trackDef.ruralPoles ? 'pole' : 'streetlamp');
              sceneries.push({ type: lampType, offset: lampSide });
            }
            // Margem oposta com vegetação regional nativa
            if (idx % 12 === 6) {
              const floraSide = (idx % 24 === 6) ? 1.88 : -1.88;
              const floraType = sec.flora || trackDef.defaultFlora || (sec.scenery && sec.scenery !== 'streetlamp' ? sec.scenery : 'tree');
              sceneries.push({ type: floraType, offset: floraSide });
            }
            // Outdoors de patrocinadores clássicos (LH44, Champion, Pirelli, Petrobras)
            if (idx % 20 === 10) {
              const billSide = (idx % 40 === 10) ? -1.86 : 1.86;
              sceneries.push({ type: 'billboard', offset: billSide });
            }
          }
        }

        const hasPitWall = !!(idx >= 18 && idx < 90 && !isTunnel && !isBridge);
        const pitEntry = !!(hasPitWall && idx >= START_LINE_SEG && idx < START_LINE_SEG + 20);
        const pitExitStart = 74;
        const pitExit = !!(hasPitWall && idx >= pitExitStart);
        const pitExitLen = 90 - pitExitStart;
        const pitExitT1 = pitExit ? Math.max(0, Math.min(1, (idx - pitExitStart) / pitExitLen)) : 0;
        const pitExitT2 = pitExit ? Math.max(0, Math.min(1, (idx + 1 - pitExitStart) / pitExitLen)) : 0;
        const pitBarrier = !!(hasPitWall && !pitEntry && !pitExit);

        // No trecho do Pit Lane (e margem de ±4 segs), todo item de paisagem do lado dos boxes fica bem na grama externa
        if (idx >= 14 && idx < 94 && sceneries.length > 0) {
          for (let si = 0; si < sceneries.length; si++) {
            if (sceneries[si].offset * pitSide > 0) {
              sceneries[si].offset = pitSide * Math.max(2.75, Math.abs(sceneries[si].offset) + 0.95);
            }
          }
        }

        const sceneryObj = (sceneries.length === 1) ? sceneries[0] : (sceneries.length > 1 ? sceneries : null);

        segments.push({
          index: idx,
          p1: { world: { x: 0, y: prevY, z: idx * SEGMENT_LENGTH }, camera: {}, screen: {} },
          p2: { world: { x: 0, y: y2,    z: (idx + 1) * SEGMENT_LENGTH }, camera: {}, screen: {} },
          curve: curveVal,
          color: segColors,
          scenery: sceneryObj,
          guardrailLeft: (hasPitWall && pitSide === -1) ? false : guardLeft,
          guardrailRight: (hasPitWall && pitSide === 1) ? false : guardRight,
          pitWall: hasPitWall,
          pitSide: pitSide,
          pitEntry: pitEntry,
          pitExit: pitExit,
          pitExitT1: pitExitT1,
          pitExitT2: pitExitT2,
          pitBarrier: pitBarrier,
          tunnel: sec.tunnel || null,
          tunnelPortal: tunnelPortal,
          bridge: isBridge,
          overheadBridge: isOverhead,
          gridBox: null,
          clipY: INTERNAL_HEIGHT,
          cars: []
        });
      }
    }

    // Marca os 20 colchetes brancos do Grid de Largada estilo Fórmula 1 no asfalto
    for (let slot = 1; slot <= TOTAL_RACERS; slot++) {
      const rowFromBack = Math.floor((TOTAL_RACERS - slot) / 2);
      const isLeft = (slot % 2 === 1);
      const slotZ = 1600 + rowFromBack * GRID_ROW_SPACING + (isLeft ? GRID_STAGGER_Z : 0);
      const boxSegIdx = Math.floor((slotZ + 45) / SEGMENT_LENGTH);
      if (boxSegIdx >= 0 && boxSegIdx < segments.length) {
        segments[boxSegIdx].gridBox = isLeft ? 'left' : 'right';
      }
    }

    // Garante continuidade vertical (sem degrau na linha de chegada ao fechar a volta)
    if (segments.length > 0) {
      const totalSegs = segments.length;
      const residualY = segments[totalSegs - 1].p2.world.y;
      if (Math.abs(residualY) > 0.0001) {
        for (let i = 0; i < totalSegs; i++) {
          segments[i].p1.world.y -= (i / totalSegs) * residualY;
          segments[i].p2.world.y -= ((i + 1) / totalSegs) * residualY;
        }
      }
    }

    // =========================================================================
    // SINCRONIZAÇÃO 1:1 ENTRE O MAPA OFICIAL (mapPoints) E A PISTA 3D
    // Quando a pista possui mapPoints próprios (os 27 circuitos estaduais de F1),
    // reamostramos o mapa para a extensão 1.5x (~1440 segmentos) e derivamos
    // curvas suaves, sem micro-oscilações e com força centrífuga agradável (<= 2.6).
    // =========================================================================
    const K_HEADING = 0.0118;
    let resampledMapPoints = null;
    if (hasCustomMap && segments.length > 24) {
      const srcPts = trackDef.mapPoints;
      const srcN = srcPts.length;
      const N = segments.length;
      resampledMapPoints = new Array(N);
      for (let i = 0; i < N; i++) {
        const f = (i / N) * srcN;
        const i0 = Math.floor(f) % srcN;
        const i1 = (i0 + 1) % srcN;
        const t = f - Math.floor(f);
        resampledMapPoints[i] = {
          x: srcPts[i0].x + (srcPts[i1].x - srcPts[i0].x) * t,
          z: srcPts[i0].z + (srcPts[i1].z - srcPts[i0].z) * t
        };
      }

      const win = 12;
      const tangents = new Array(N);
      for (let i = 0; i < N; i++) {
        const pPrev = resampledMapPoints[(i - win + N) % N];
        const pNext = resampledMapPoints[(i + win) % N];
        tangents[i] = Math.atan2(pNext.x - pPrev.x, -(pNext.z - pPrev.z));
      }
      const dAngles = new Array(N);
      for (let i = 0; i < N; i++) {
        let d = tangents[(i + 1) % N] - tangents[i];
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        dAngles[i] = d;
      }
      const smoothR = 10;
      const smoothLen = smoothR * 2 + 1;
      const curves = new Array(N);
      for (let i = 0; i < N; i++) {
        let sum = 0;
        for (let k = -smoothR; k <= smoothR; k++) {
          sum += dAngles[(i + k + N) % N];
        }
        const raw = ((sum / smoothLen) / K_HEADING) * lengthScale;
        let cv = 2.4 * Math.tanh(raw / 6.0);
        if (Math.abs(cv) < 0.38) cv = 0;
        curves[i] = cv;
      }

      // Remove micro-oscilações curtas (< 12 segmentos) para retas limpas e curvas previsíveis
      let runIdx = 0;
      while (runIdx < N) {
        const sign = Math.sign(curves[runIdx]);
        let nextIdx = runIdx + 1;
        while (nextIdx < N && Math.sign(curves[nextIdx]) === sign) nextIdx++;
        if (sign !== 0 && (nextIdx - runIdx) < 12) {
          for (let k = runIdx; k < nextIdx; k++) curves[k] = 0;
        }
        runIdx = nextIdx;
      }

      for (let i = 0; i < N; i++) {
        const seg = segments[i];
        const cv = curves[i];
        seg.curve = cv;

        // Atualiza placas de sinalização de curva para bater com a direção real do mapa
        if (seg.scenery) {
          if (Array.isArray(seg.scenery)) {
            seg.scenery = seg.scenery.filter(s => s.type !== 'sign_left' && s.type !== 'sign_right');
            if (seg.scenery.length === 1) seg.scenery = seg.scenery[0];
            else if (seg.scenery.length === 0) seg.scenery = null;
          } else if (seg.scenery.type === 'sign_left' || seg.scenery.type === 'sign_right') {
            seg.scenery = null;
          }
        }
        if (Math.abs(cv) >= 1.4 && (i % 10 === 0) && !seg.tunnel && !seg.pitWall) {
          const signObj = (cv < 0)
            ? { type: 'sign_left', offset: 1.76 }
            : { type: 'sign_right', offset: -1.76 };
          if (!seg.scenery) seg.scenery = signObj;
          else if (Array.isArray(seg.scenery)) seg.scenery.push(signObj);
          else seg.scenery = [seg.scenery, signObj];
        }
      }
    }

    // =========================================================================
    // GERADOR DE MINIMAPA GEOMETRICAMENTE EXATO (CORRESPONDÊNCIA 100% COM A PISTA)
    // =========================================================================
    const angles = [0];
    let curAngle = 0;
    for (let i = 0; i < segments.length; i++) {
      curAngle += segments[i].curve * K_HEADING;
      angles.push(curAngle);
    }
    const totalAngle = angles[angles.length - 1];
    const targetTurn = (totalAngle >= 0) ? (Math.PI * 2) : (-Math.PI * 2);
    const errAngle = targetTurn - totalAngle;
    const totalSegs = segments.length;

    // Distribui o resíduo angular de forma suave e contínua ao longo de toda a extensão
    const corrAngles = [];
    for (let i = 0; i < totalSegs; i++) {
      corrAngles.push(angles[i] + errAngle * (i / totalSegs));
    }

    // Integração de passos espaciais no plano cartesiano 2D
    let curX = 0, curZ = 0;
    const rawPoints = [{ x: 0, z: 0 }];
    for (let i = 0; i < totalSegs; i++) {
      curX += Math.sin(corrAngles[i]);
      curZ -= Math.cos(corrAngles[i]);
      rawPoints.push({ x: curX, z: curZ });
    }

    // Fechamento contínuo por interpolação cúbica Hermite:
    // Garante que o ponto final encoste perfeitamente no ponto inicial em (0,0) sem alterar
    // a orientação frontal retilínea da reta de largada/chegada
    const driftX = rawPoints[totalSegs].x;
    const driftZ = rawPoints[totalSegs].z;
    for (let i = 0; i <= totalSegs; i++) {
      const t = i / totalSegs;
      const w = 3 * t * t - 2 * t * t * t;
      rawPoints[i].x -= driftX * w;
      rawPoints[i].z -= driftZ * w;
    }

    // Normaliza para a caixa delimitadora 0..1 preservando as proporções naturais da pista (aspect ratio)
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (let i = 0; i < totalSegs; i++) {
      const p = rawPoints[i];
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.z < minZ) minZ = p.z;
      if (p.z > maxZ) maxZ = p.z;
    }
    const rangeX = Math.max(1, maxX - minX);
    const rangeZ = Math.max(1, maxZ - minZ);
    const maxDim = Math.max(rangeX, rangeZ);
    const padX = (maxDim - rangeX) * 0.5;
    const padZ = (maxDim - rangeZ) * 0.5;

    const normMap = [];
    for (let i = 0; i < totalSegs; i++) {
      normMap.push({
        x: (rawPoints[i].x - minX + padX) / maxDim,
        z: (rawPoints[i].z - minZ + padZ) / maxDim
      });
    }

    const finalMap = resampledMapPoints || normMap;
    if (mirrored) {
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        seg.curve = -seg.curve;
        if (seg.pitSide) seg.pitSide = -seg.pitSide;
        const tmpGuard = seg.guardrailLeft;
        seg.guardrailLeft = seg.guardrailRight;
        seg.guardrailRight = tmpGuard;
        if (seg.gridBox === 'left') seg.gridBox = 'right';
        else if (seg.gridBox === 'right') seg.gridBox = 'left';
        if (seg.scenery) {
          const flipSc = (sc) => {
            sc.offset = -sc.offset;
            if (sc.type === 'sign_left') sc.type = 'sign_right';
            else if (sc.type === 'sign_right') sc.type = 'sign_left';
          };
          if (Array.isArray(seg.scenery)) seg.scenery.forEach(flipSc);
          else flipSc(seg.scenery);
        }
      }
      for (let i = 0; i < finalMap.length; i++) {
        finalMap[i] = { x: 1.0 - finalMap[i].x, z: finalMap[i].z };
      }
    }

    return {
      segments: segments,
      totalLength: segments.length * SEGMENT_LENGTH,
      mapPoints: finalMap
    };
  }
}
