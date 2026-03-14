// breeds.js - Cute pet breed definitions & Canvas renderer
// Style: kawaii / chibi — round shapes, simple faces, soft colors

const BREEDS = [
  {
    id: 'corgi-pink',
    name: '甜心柯基',
    colors: { body: '#FFD4D4', stroke: '#C48888', ear: '#FFB8B8', earInner: '#FFCECE', nose: '#4A3030', belly: '#FFF0F0', blush: '#FFB0B0', tongue: '#FF8080' },
    shape: { earType: 'pointed', tailType: 'short', hasBow: true, bowColor: '#FF80A0' }
  },
  {
    id: 'shiba-gold',
    name: '金色柴犬',
    colors: { body: '#FFD060', stroke: '#C89830', ear: '#FFBA30', earInner: '#FFE0A0', nose: '#3A2A1A', belly: '#FFFBE8', blush: '#FFB860', tongue: '#FF8080' },
    shape: { earType: 'pointed', tailType: 'curly' }
  },
  {
    id: 'border-collie',
    name: '黑白边牧',
    colors: { body: '#FAFAFA', stroke: '#555', ear: '#3A3A3A', earInner: '#666', nose: '#222', belly: '#FFF', blush: '#FFB8B8', tongue: '#FF8888', patch: '#3A3A3A' },
    shape: { earType: 'floppy', tailType: 'long', hasBackPatch: true }
  },
  {
    id: 'bichon',
    name: '棉花糖比熊',
    colors: { body: '#FAFAFA', stroke: '#B8B8B8', ear: '#F0F0F0', earInner: '#FFE0E0', nose: '#333', belly: '#FFF', blush: '#FFD0D0', tongue: '#FF9090' },
    shape: { earType: 'round', tailType: 'short', fluffy: true }
  },
  {
    id: 'pom-orange',
    name: '香甜博美',
    colors: { body: '#FFB848', stroke: '#C88030', ear: '#FF9830', earInner: '#FFD090', nose: '#3A2A1A', belly: '#FFE8C0', blush: '#FFA050', tongue: '#FF8080' },
    shape: { earType: 'pointed', tailType: 'fluffy', fluffy: true }
  },
  {
    id: 'pug-tan',
    name: '村口巴哥',
    colors: { body: '#E8D0B0', stroke: '#A08060', ear: '#C8A878', earInner: '#D8C0A0', nose: '#333', belly: '#F0E0D0', blush: '#E0A888', tongue: '#FF8888', mask: '#8B6940' },
    shape: { earType: 'floppy', tailType: 'curly', hasMask: true }
  },
  {
    id: 'westie',
    name: '甜白西高地',
    colors: { body: '#FAFAFA', stroke: '#AAA', ear: '#F5F5F5', earInner: '#FFE8E8', nose: '#333', belly: '#FFF', blush: '#FFD0D0', tongue: '#FF9090' },
    shape: { earType: 'pointed', tailType: 'up' }
  },
  {
    id: 'cat-orange',
    name: '小橘猫',
    colors: { body: '#FFB848', stroke: '#C88830', ear: '#FF9828', earInner: '#FFC888', nose: '#FF9090', belly: '#FFECC8', blush: '#FFA858', tongue: '#FF8888', stripe: '#E89820' },
    shape: { earType: 'cat', tailType: 'cattail', hasStripes: true }
  },
  {
    id: 'cat-tuxedo',
    name: '奶牛猫',
    colors: { body: '#FAFAFA', stroke: '#555', ear: '#333', earInner: '#666', nose: '#FFB0B0', belly: '#FFF', blush: '#FFD0D0', tongue: '#FF9090', patch: '#333' },
    shape: { earType: 'cat', tailType: 'cattail', hasFacePatch: true }
  },
  // ---- Geese ----
  {
    id: 'goose-white',
    name: '大白鹅',
    colors: { body: '#FAFAFA', stroke: '#999', ear: '#FAFAFA', earInner: '#EEE', nose: '#FF8C00', belly: '#FFF', blush: '#FFD0D0', tongue: '#FF9090', beak: '#FF8C00', beakStroke: '#CC6600', feet: '#FF8C00' },
    shape: { earType: 'goose', tailType: 'goose', animalType: 'goose' }
  },
  {
    id: 'goose-grey',
    name: '灰雁鹅',
    colors: { body: '#D0CCC0', stroke: '#888', ear: '#C0B8A8', earInner: '#D8D0C0', nose: '#E07020', belly: '#E8E4D8', blush: '#E0B8A0', tongue: '#FF9090', beak: '#E07020', beakStroke: '#A05010', feet: '#E07020' },
    shape: { earType: 'goose', tailType: 'goose', animalType: 'goose' }
  },
  // ---- Pigs ----
  {
    id: 'pig-pink',
    name: '粉红小猪',
    colors: { body: '#FFB8C8', stroke: '#CC8898', ear: '#FF9BB0', earInner: '#FFCCD8', nose: '#FF7090', belly: '#FFD8E0', blush: '#FF90A8', tongue: '#FF8080', snout: '#FF90A8', snoutStroke: '#CC7088' },
    shape: { earType: 'pig', tailType: 'pigtail', animalType: 'pig' }
  },
  {
    id: 'pig-spotted',
    name: '花花小猪',
    colors: { body: '#FFD0D8', stroke: '#BB8898', ear: '#FFB0C0', earInner: '#FFD8E0', nose: '#FF7090', belly: '#FFE8EC', blush: '#FFA0B0', tongue: '#FF8888', snout: '#FFA0B8', snoutStroke: '#CC7888', patch: '#CC8898' },
    shape: { earType: 'pig', tailType: 'pigtail', animalType: 'pig', hasSpots: true }
  },
  // ---- Ducks ----
  {
    id: 'duck-yellow',
    name: '小黄鸭',
    colors: { body: '#FFE44D', stroke: '#CC9900', ear: '#FFE44D', earInner: '#FFD700', nose: '#FF8C00', belly: '#FFF0A0', blush: '#FFD060', tongue: '#FF9090', beak: '#FF8C00', beakStroke: '#CC6600', feet: '#FF8C00' },
    shape: { earType: 'duck', tailType: 'ducktail', animalType: 'duck' }
  },
  {
    id: 'duck-mandarin',
    name: '鸳鸯鸭',
    colors: { body: '#8B5E3C', stroke: '#5C3A20', ear: '#2E8B57', earInner: '#3CB371', nose: '#FF6347', belly: '#FFF8DC', blush: '#DEB887', tongue: '#FF8888', beak: '#FF4500', beakStroke: '#CC3300', feet: '#FF8C00', crest: '#2E8B57' },
    shape: { earType: 'duck', tailType: 'ducktail', animalType: 'duck', hasCrest: true }
  },
  // ---- Penguin ----
  {
    id: 'penguin-classic',
    name: '小企鹅',
    colors: { body: '#333', stroke: '#111', ear: '#333', earInner: '#444', nose: '#FF8C00', belly: '#FAFAFA', blush: '#FFB8B8', tongue: '#FF8888', beak: '#FF8C00', beakStroke: '#CC6600', feet: '#FF8C00' },
    shape: { earType: 'penguin', tailType: 'short', animalType: 'penguin' }
  },
];

// ===================== Drawing Helpers =====================

function drawEllipse(ctx, cx, cy, rx, ry, fill, stroke, lw) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke(); }
}

function drawCircle(ctx, cx, cy, r, fill, stroke, lw) {
  drawEllipse(ctx, cx, cy, r, r, fill, stroke, lw);
}

function drawRoundBody(ctx, cx, cy, w, h, fill, stroke, lw, fluffy) {
  if (fluffy) {
    ctx.beginPath();
    const steps = 32;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const wobble = Math.sin(a * 10) * 2 + Math.sin(a * 6) * 1.5;
      const rx = w + wobble;
      const ry = h + wobble;
      const x = cx + Math.cos(a) * rx;
      const y = cy + Math.sin(a) * ry;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke(); }
  } else {
    drawEllipse(ctx, cx, cy, w, h, fill, stroke, lw);
  }
}

function drawBow(ctx, x, y, color, size) {
  const s = size || 6;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x - s * 1.5, y - s, x - s * 0.3, y - s * 0.5);
  ctx.quadraticCurveTo(x, y - s * 0.3, x, y);
  ctx.quadraticCurveTo(x + s * 0.3, y - s * 0.3, x + s * 1.5, y - s * 0.5);
  ctx.quadraticCurveTo(x + s * 0.3, y + s * 0.3, x, y);
  ctx.fill();
  drawCircle(ctx, x, y - 1, s * 0.25, color, null);
}

// ===================== Pose Calculations (Refined) =====================

function getPose(state, t) {
  const s = Math.sin;
  const c = Math.cos;
  // Smooth easing helper
  const ease = (v) => (s(v) + 1) / 2; // 0~1 smooth

  const poses = {
    stand: {
      bodyY: 0,
      bodyTilt: 0,
      headY: s(t * 1.5) * 0.5,
      headTilt: s(t * 0.7) * 1.5,
      legFL: s(t * 1.2) * 0.5, legFR: s(t * 1.2 + 0.5) * 0.5,
      legBL: s(t * 1.2 + Math.PI) * 0.4, legBR: s(t * 1.2 + Math.PI + 0.5) * 0.4,
      tailWag: s(t * 4) * 8 + s(t * 2.8) * 3,
      eyeOpen: 1,
      mouthOpen: 0,
      breathe: s(t * 1.5) * 1.2,
    },
    walk: (() => {
      // Realistic quadruped walk cycle
      // Phase: 0→1 per cycle, each leg offset by 0.25 (diagonal gait)
      const spd = 5;
      const phase = (t * spd) % (Math.PI * 2);
      // Each leg has a swing phase (forward+up) and stance phase (on ground, pushing back)
      const legCycle = (ph) => {
        const p = ((phase + ph) % (Math.PI * 2));
        // Swing: 0→π (leg moves forward, lifts up)
        // Stance: π→2π (leg on ground, slides back)
        const swing = p < Math.PI;
        const fwd = swing ? s(p) : -s(p) * 0.3; // forward swing is bigger than pushback
        const lift = swing ? Math.max(0, s(p)) : 0; // only lift during swing
        return { fwd: fwd * 7, lift: lift * 10 };
      };
      const fl = legCycle(0);
      const br = legCycle(0.3);              // diagonal pair
      const fr = legCycle(Math.PI);
      const bl = legCycle(Math.PI + 0.3);    // other diagonal pair
      // Body bounces up when diagonal pair pushes off
      const bounce = (Math.abs(s(phase)) + Math.abs(s(phase + Math.PI))) * 0.6 - 0.6;
      return {
        bodyY: bounce,
        bodyTilt: s(phase) * 0.5,
        headY: s(phase + 0.4) * 0.8,
        headTilt: s(t * 2.5) * 2,
        legFL: fl.fwd, legFR: fr.fwd, legBL: bl.fwd, legBR: br.fwd,
        legLiftFL: fl.lift, legLiftFR: fr.lift, legLiftBL: bl.lift, legLiftBR: br.lift,
        tailWag: s(t * 7) * 10 + s(t * 4.5) * 4,
        eyeOpen: 1,
        mouthOpen: 0.1 + Math.max(0, s(t * 3)) * 0.12,
        breathe: s(t * 3) * 0.6,
      };
    })(),
    sit: {
      bodyY: 8,
      bodyTilt: -2,
      headY: 2,
      headTilt: s(t * 1.8) * 3,
      legFL: 1, legFR: -1,
      legBL: -90, legBR: -90,
      tailWag: s(t * 3) * 6 + s(t * 7) * 2,
      eyeOpen: 1 + s(t * 4) * 0.05,
      mouthOpen: 0,
      breathe: s(t * 1.2) * 1,
    },
    sleep: {
      bodyY: 16,
      bodyTilt: 3,
      headY: 14,
      headTilt: 8,
      legFL: -8, legFR: -6,
      legBL: -8, legBR: -10,
      tailWag: s(t * 0.5) * 2,
      eyeOpen: 0,
      mouthOpen: s(t * 0.6) > 0.8 ? 0.1 : 0,
      breathe: s(t * 0.8) * 2.5,
      zzz: true,
    },
    jump: {
      bodyY: -15 * Math.abs(s(t * 4.5)) + 3,
      bodyTilt: s(t * 4.5) * 2,
      headY: -4 * Math.abs(s(t * 4.5 + 0.3)),
      headTilt: s(t * 6) * 2,
      legFL: -4 - Math.abs(s(t * 4.5)) * 6,
      legFR: 4 + Math.abs(s(t * 4.5)) * 6,
      legBL: -3 - Math.abs(s(t * 4.5)) * 5,
      legBR: 3 + Math.abs(s(t * 4.5)) * 5,
      tailWag: s(t * 10) * 12 + s(t * 7) * 5,
      eyeOpen: 0.5,
      mouthOpen: 0.4 + Math.abs(s(t * 4.5)) * 0.2,
      breathe: 0,
      sparkle: true,
    },
    beg: {
      bodyY: 6,
      bodyTilt: -3,
      headY: -2,
      headTilt: s(t * 2.5) * 5 + s(t * 1.2) * 2,
      legFL: -70, legFR: -70,
      legBL: -90, legBR: -90,
      tailWag: s(t * 8) * 12 + s(t * 12) * 4,
      eyeOpen: 1.2,
      mouthOpen: 0.1 + s(t * 3) * 0.1,
      breathe: s(t * 2) * 0.8,
      pawsUp: true,
      pawWiggle: s(t * 4) * 3,
    },
    chase: {
      bodyY: Math.abs(s(t * 8)) * 2 - 1,
      bodyTilt: s(t * 8) * 1.5,
      headY: s(t * 8 + 0.5) * 1.5,
      headTilt: s(t * 5) * 5,
      legFL: s(t * 9) * 9,
      legFR: s(t * 9 + Math.PI) * 9,
      legBL: s(t * 9 + Math.PI + 0.2) * 8,
      legBR: s(t * 9 + 0.2) * 8,
      tailWag: s(t * 6) * 14,
      eyeOpen: 1.1,
      mouthOpen: 0.4 + s(t * 4) * 0.2,
      breathe: 0,
      spin: t,
    },
    lonely: {
      bodyY: 12,
      bodyTilt: 2,
      headY: 10,
      headTilt: -4 + s(t * 0.8) * 1.5,
      legFL: -6, legFR: -8,
      legBL: -6, legBR: -5,
      tailWag: s(t * 1) * 2,
      eyeOpen: 0.65,
      mouthOpen: 0,
      breathe: s(t * 1) * 1.5,
      sad: true,
    },
    yawn: {
      bodyY: 2,
      bodyTilt: -1,
      headY: -1 + s(t * 1.5) * 1,
      headTilt: -5 + s(t * 1.5) * 2,
      legFL: 1, legFR: -1, legBL: 0, legBR: 0,
      tailWag: s(t * 2) * 4,
      eyeOpen: 0.2 + Math.max(0, -s(t * 1.5)) * 0.15,
      mouthOpen: 0.3 + Math.max(0, s(t * 1.5)) * 0.5,
      breathe: s(t * 1.5) * 1.5,
    },
    stretch: {
      bodyY: 4,
      bodyTilt: -6,
      headY: 6,
      headTilt: 3,
      legFL: 10, legFR: 8,
      legBL: -1, legBR: 0,
      tailWag: s(t * 2.5) * 8,
      eyeOpen: 0.4,
      mouthOpen: 0.1,
      breathe: s(t * 1.2) * 1.5,
    },
    tilt: {
      bodyY: 0,
      bodyTilt: 0,
      headY: -1,
      headTilt: 18 + s(t * 1.5) * 6,
      legFL: 0, legFR: 0, legBL: 0, legBR: 0,
      tailWag: s(t * 4) * 12 + s(t * 7) * 5,
      eyeOpen: 1.25,
      mouthOpen: 0,
      breathe: s(t * 1.5) * 1.5,
    },
    poop: {
      bodyY: 8,
      bodyTilt: -4,
      headY: 4,
      headTilt: s(t * 2) * 2,
      legFL: 2, legFR: -2,
      legBL: -90, legBR: -90,
      tailWag: s(t * 1.5) * 4,
      eyeOpen: 0.6 + s(t * 3) * 0.1,
      mouthOpen: s(t * 2) > 0.5 ? 0.15 : 0,
      breathe: s(t * 2) * 1,
      pooping: true,
      poopPhase: Math.min(1, t * 0.25),
    },
    typing: (() => {
      // Fast alternating front paw tapping like typing on keyboard
      const spd = 12;
      const phase = t * spd;
      const lTap = Math.max(0, s(phase)) * 10;
      const rTap = Math.max(0, s(phase + Math.PI)) * 10;
      return {
        bodyY: 2 + Math.abs(s(phase * 0.5)) * 1.5,
        bodyTilt: -3 + s(phase * 0.3) * 1,
        headY: -2 + s(t * 4) * 1,
        headTilt: s(t * 3) * 3,
        legFL: -5 - lTap, legFR: -5 - rTap,
        legLiftFL: lTap * 1.5, legLiftFR: rTap * 1.5,
        legBL: 0, legBR: 0,
        tailWag: s(t * 5) * 6,
        eyeOpen: 0.85,
        mouthOpen: 0,
        breathe: s(t * 2) * 0.6,
        typing: true,
        typingPhaseL: Math.max(0, s(phase)),
        typingPhaseR: Math.max(0, s(phase + Math.PI)),
      };
    })(),
    click: (() => {
      // Right paw reaches forward with punching motion
      const clickPhase = t * 6;
      const punch = Math.max(0, s(clickPhase));
      return {
        bodyY: 1 + punch * 2,
        bodyTilt: -2 - punch * 3,
        headY: -3 + punch * 1,
        headTilt: 4 + s(t * 3) * 2,
        legFL: 0, legFR: -15 - punch * 8,
        legLiftFL: 0, legLiftFR: 8 + punch * 6,
        legBL: 0, legBR: 0,
        tailWag: s(t * 5) * 8,
        eyeOpen: 1.15,
        mouthOpen: punch > 0.5 ? 0.15 : 0,
        breathe: s(t * 2) * 0.6,
        clicking: true,
        clickPunch: punch,
      };
    })(),

    // ---- Funny / silly poses ----

    sneeze: (() => {
      // Build-up then explosive sneeze
      const cycle = (t * 1.5) % 4; // 4-second cycle
      const buildup = cycle < 2.5;
      const explode = cycle >= 2.5 && cycle < 3.2;
      const recover = cycle >= 3.2;
      if (buildup) {
        const squint = Math.min(1, cycle / 2.5);
        return {
          bodyY: -2 * squint, bodyTilt: -4 * squint,
          headY: -6 * squint, headTilt: -8 * squint + s(t * 12) * 2 * squint,
          legFL: 0, legFR: 0, legBL: 0, legBR: 0,
          tailWag: s(t * 2) * 3,
          eyeOpen: 0.3 - squint * 0.2, mouthOpen: squint * 0.3,
          breathe: s(t * 8) * squint * 2,
        };
      } else if (explode) {
        return {
          bodyY: 6, bodyTilt: 8,
          headY: 12, headTilt: 15,
          legFL: -6, legFR: -8, legBL: 4, legBR: 3,
          legLiftFL: 5, legLiftFR: 6,
          tailWag: 20,
          eyeOpen: 0, mouthOpen: 0.9,
          breathe: 0, sneeze: true,
        };
      } else {
        const r = (cycle - 3.2) / 0.8;
        return {
          bodyY: 6 * (1 - r), bodyTilt: 8 * (1 - r),
          headY: 12 * (1 - r), headTilt: 15 * (1 - r),
          legFL: 0, legFR: 0, legBL: 0, legBR: 0,
          tailWag: s(t * 3) * 5,
          eyeOpen: 0.6 + r * 0.4, mouthOpen: 0.1 * (1 - r),
          breathe: s(t * 2) * 1, dizzyStars: !recover,
        };
      }
    })(),

    dance: (() => {
      // Happy bouncing dance - side to side with paw waves
      const beat = t * 6;
      const bounce = Math.abs(s(beat)) * 8;
      const sway = s(beat * 0.5) * 5;
      const armL = s(beat) > 0;
      const armR = s(beat + Math.PI) > 0;
      return {
        bodyY: -bounce,
        bodyTilt: sway,
        headY: -bounce * 0.5 - 2,
        headTilt: -sway * 1.5 + s(t * 8) * 3,
        legFL: armL ? -60 : -5,
        legFR: armR ? -60 : -5,
        legLiftFL: armL ? 12 : 0,
        legLiftFR: armR ? 12 : 0,
        legBL: s(beat) * 3, legBR: s(beat + Math.PI) * 3,
        tailWag: s(t * 10) * 18 + s(t * 6) * 8,
        eyeOpen: 1.2,
        mouthOpen: 0.3 + s(t * 4) * 0.15,
        breathe: 0,
        sparkle: true,
        pawsUp: true,
        pawWiggle: s(t * 8) * 5,
      };
    })(),

    shake: (() => {
      // Shaking body like after a bath - super fast side-to-side
      const freq = t * 25;
      const shakeAmp = 4 + s(t * 2) * 2;
      return {
        bodyY: 2,
        bodyTilt: s(freq) * shakeAmp,
        headY: -1,
        headTilt: s(freq + 1) * shakeAmp * 1.5,
        legFL: s(freq) * 3, legFR: s(freq + Math.PI) * 3,
        legBL: s(freq + 0.5) * 2, legBR: s(freq + Math.PI + 0.5) * 2,
        tailWag: s(freq * 0.8) * 20,
        eyeOpen: 0.3,
        mouthOpen: 0.15,
        breathe: 0,
        shaking: true,
        shakePhase: s(freq),
      };
    })(),

    lick: (() => {
      // Tongue out, head moves side to side licking
      const lickPhase = t * 3;
      const tongueOut = 0.5 + Math.abs(s(lickPhase)) * 0.5;
      return {
        bodyY: 2,
        bodyTilt: -2,
        headY: 0,
        headTilt: s(lickPhase) * 12,
        legFL: 0, legFR: -3, legBL: 0, legBR: 0,
        tailWag: s(t * 6) * 10 + s(t * 4) * 4,
        eyeOpen: 0.7 + s(t * 2) * 0.15,
        mouthOpen: tongueOut,
        breathe: s(t * 2) * 0.8,
        licking: true,
      };
    })(),

    dizzy: (() => {
      // Spinning head, wobbling body, spiral eyes
      const wobble = t * 3;
      return {
        bodyY: s(wobble) * 4 + 2,
        bodyTilt: s(wobble * 0.7) * 8,
        headY: c(wobble * 1.3) * 3,
        headTilt: s(wobble) * 15,
        legFL: s(wobble) * 4, legFR: c(wobble) * 4,
        legBL: -s(wobble) * 3, legBR: -c(wobble) * 3,
        tailWag: s(t * 2) * 5,
        eyeOpen: 0.8,
        mouthOpen: 0.2,
        breathe: s(t * 1.5) * 1,
        spiralEyes: true,
        dizzyStars: true,
      };
    })(),

    hiccup: (() => {
      // Sudden body jerks with surprised expression
      const cycle = (t * 2) % 2;
      const jerk = cycle < 0.15 ? Math.sin(cycle / 0.15 * Math.PI) : 0;
      return {
        bodyY: -jerk * 10 + 1,
        bodyTilt: jerk * 6,
        headY: -jerk * 8,
        headTilt: jerk * -5 + s(t * 1.5) * 2,
        legFL: jerk * -4, legFR: jerk * -3,
        legLiftFL: jerk * 6, legLiftFR: jerk * 5,
        legBL: 0, legBR: 0,
        tailWag: s(t * 4) * 6 + jerk * 12,
        eyeOpen: jerk > 0.3 ? 1.3 : 1,
        mouthOpen: jerk > 0.3 ? 0.5 : 0,
        breathe: s(t * 2) * 1,
        hiccup: jerk > 0.3,
      };
    })(),

    zoomies: (() => {
      // Crazy fast erratic running - pure chaos energy
      const spd = t * 12;
      const chaos = s(spd) * s(spd * 1.7) * s(spd * 0.3);
      return {
        bodyY: -Math.abs(s(spd * 1.5)) * 12 + 2,
        bodyTilt: s(spd * 0.8) * 6 + chaos * 4,
        headY: s(spd + 1) * 4 - 3,
        headTilt: s(spd * 1.2) * 10,
        legFL: s(spd * 2) * 12, legFR: s(spd * 2 + Math.PI) * 12,
        legBL: s(spd * 2 + 1) * 10, legBR: s(spd * 2 + Math.PI + 1) * 10,
        legLiftFL: Math.max(0, s(spd * 2)) * 14,
        legLiftFR: Math.max(0, s(spd * 2 + Math.PI)) * 14,
        tailWag: s(spd) * 22,
        eyeOpen: 1.25,
        mouthOpen: 0.5 + s(t * 5) * 0.2,
        breathe: 0,
        sparkle: true,
      };
    })(),

    roll: (() => {
      // Rolling on the ground playfully
      const rollPhase = t * 3;
      const onBack = s(rollPhase) > 0;
      return {
        bodyY: 14 + s(rollPhase * 2) * 3,
        bodyTilt: s(rollPhase) * 25,
        headY: 10 + c(rollPhase) * 3,
        headTilt: s(rollPhase) * 20,
        legFL: onBack ? -70 : -5,
        legFR: onBack ? -65 : -8,
        legBL: onBack ? -80 : 0,
        legBR: onBack ? -75 : 2,
        legLiftFL: onBack ? 8 : 0,
        legLiftFR: onBack ? 10 : 0,
        tailWag: s(t * 6) * 10,
        eyeOpen: 0.6 + s(t * 4) * 0.2,
        mouthOpen: 0.2 + Math.abs(s(t * 3)) * 0.2,
        breathe: 0,
        pawsUp: onBack,
        pawWiggle: s(t * 6) * 5,
      };
    })(),

    flop: (() => {
      // Dramatic flop to the side - playing dead
      const flopT = Math.min(1, t * 0.8);
      const twitch = flopT >= 1 ? s(t * 6) * 0.5 : 0;
      return {
        bodyY: 16 * flopT,
        bodyTilt: 20 * flopT,
        headY: 14 * flopT,
        headTilt: 25 * flopT + twitch,
        legFL: -60 * flopT, legFR: -50 * flopT,
        legBL: -70 * flopT, legBR: -65 * flopT,
        tailWag: s(t * 0.5) * 2 * flopT,
        eyeOpen: flopT >= 1 ? 0 : (1 - flopT * 0.8),
        mouthOpen: flopT >= 1 ? (twitch > 0 ? 0.1 : 0) : 0.3 * flopT,
        breathe: flopT >= 1 ? s(t * 0.6) * 0.8 : 0,
        tongue: flopT >= 1,
      };
    })(),

    // ---- New actions / skills ----

    dig: (() => {
      // Digging motion - front paws alternate scratching ground
      const digPhase = t * 8;
      const lDig = Math.max(0, s(digPhase)) * 12;
      const rDig = Math.max(0, s(digPhase + Math.PI)) * 12;
      const dirtKick = Math.max(0, s(digPhase * 0.5));
      return {
        bodyY: 6 + s(digPhase * 0.5) * 2,
        bodyTilt: -8 + s(digPhase * 0.3) * 2,
        headY: 8 + s(digPhase * 0.5) * 2,
        headTilt: -6 + s(t * 3) * 3,
        legFL: 8 - lDig, legFR: 8 - rDig,
        legLiftFL: lDig * 0.8, legLiftFR: rDig * 0.8,
        legBL: -2, legBR: -1,
        tailWag: s(t * 6) * 10 + s(t * 4) * 4,
        eyeOpen: 0.9,
        mouthOpen: 0.1 + dirtKick * 0.15,
        breathe: s(t * 3) * 0.5,
        digging: true,
        dirtPhase: dirtKick,
      };
    })(),

    bow: (() => {
      // 作揖 - Traditional greeting bow with paws together
      const bowCycle = (t * 1.8) % 4;
      const bowing = bowCycle < 2.5;
      const rising = bowCycle >= 2.5;
      const bowDepth = bowing ? Math.min(1, bowCycle / 1.2) : Math.max(0, 1 - (bowCycle - 2.5) / 1.5);
      return {
        bodyY: 4 + bowDepth * 6,
        bodyTilt: -bowDepth * 12,
        headY: -2 + bowDepth * 14,
        headTilt: -bowDepth * 20 + s(t * 2) * 2,
        legFL: -60 - bowDepth * 10, legFR: -60 - bowDepth * 10,
        legLiftFL: 6 + bowDepth * 4, legLiftFR: 6 + bowDepth * 4,
        legBL: 0, legBR: 0,
        tailWag: s(t * 3) * 6,
        eyeOpen: rising ? 1.1 : 0.7,
        mouthOpen: rising ? 0.2 : 0,
        breathe: s(t * 1.5) * 0.8,
        pawsUp: true,
        pawWiggle: bowing ? s(t * 6) * 2 : 0,
      };
    })(),

    playDead: (() => {
      // Playing dead - falls over dramatically, legs stiff in air
      const fallT = Math.min(1, t * 1.2);
      const stiff = fallT >= 1;
      const twitch = stiff ? (s(t * 8) > 0.95 ? s(t * 20) * 2 : 0) : 0;
      return {
        bodyY: 18 * fallT,
        bodyTilt: 30 * fallT + twitch,
        headY: 16 * fallT,
        headTilt: 35 * fallT,
        legFL: -80 * fallT + twitch, legFR: -75 * fallT,
        legBL: -85 * fallT, legBR: -80 * fallT + twitch,
        legLiftFL: stiff ? 10 : 0, legLiftFR: stiff ? 12 : 0,
        tailWag: stiff ? 0 : s(t * 2) * 3,
        eyeOpen: stiff ? 0 : Math.max(0, 1 - fallT * 1.5),
        mouthOpen: stiff ? (twitch !== 0 ? 0.1 : 0) : 0.4 * fallT,
        breathe: stiff ? s(t * 0.4) * 0.5 : 0,
        tongue: stiff,
        xEyes: stiff,
      };
    })(),

    spinTrick: (() => {
      // Spinning in circles - fast rotation with happy expression
      const spinPhase = t * 5;
      const rotAngle = spinPhase;
      const bounce = Math.abs(s(spinPhase * 2)) * 4;
      return {
        bodyY: -bounce,
        bodyTilt: s(rotAngle) * 15,
        headY: -bounce * 0.6 - 2,
        headTilt: c(rotAngle) * 12,
        legFL: s(rotAngle) * 8, legFR: s(rotAngle + Math.PI) * 8,
        legBL: c(rotAngle) * 6, legBR: c(rotAngle + Math.PI) * 6,
        legLiftFL: Math.max(0, s(rotAngle)) * 6,
        legLiftFR: Math.max(0, s(rotAngle + Math.PI)) * 6,
        tailWag: s(t * 12) * 20,
        eyeOpen: 1.2,
        mouthOpen: 0.3 + s(t * 4) * 0.15,
        breathe: 0,
        sparkle: true,
        spinning: true,
      };
    })(),

    tantrum: (() => {
      // Throwing a tantrum - rolling on ground, kicking legs
      const tanPhase = t * 5;
      const kick = s(tanPhase);
      const rollSide = s(tanPhase * 0.7) * 20;
      return {
        bodyY: 16 + s(tanPhase * 2) * 3,
        bodyTilt: rollSide,
        headY: 12 + s(tanPhase * 1.5) * 3,
        headTilt: -rollSide * 0.8 + s(t * 8) * 5,
        legFL: kick > 0 ? -70 + kick * 15 : -55,
        legFR: kick < 0 ? -70 - kick * 15 : -55,
        legBL: -80 + s(tanPhase + 1) * 15,
        legBR: -80 + s(tanPhase + 2) * 15,
        legLiftFL: Math.abs(kick) * 10,
        legLiftFR: Math.abs(s(tanPhase + Math.PI)) * 10,
        tailWag: s(t * 8) * 15,
        eyeOpen: 0.4 + s(t * 6) * 0.2,
        mouthOpen: 0.5 + Math.abs(s(t * 4)) * 0.3,
        breathe: 0,
        pawsUp: true,
        pawWiggle: s(t * 10) * 8,
      };
    })(),

    headBob: (() => {
      // Head bobbing side to side like listening to music
      const bobPhase = t * 4;
      const nodX = s(bobPhase) * 18;
      const nodY = s(bobPhase * 2) * 5;
      return {
        bodyY: 1 + s(bobPhase * 0.5) * 1.5,
        bodyTilt: s(bobPhase * 0.5) * 3,
        headY: -1 + nodY,
        headTilt: nodX,
        legFL: s(bobPhase * 0.5) * 2, legFR: -s(bobPhase * 0.5) * 2,
        legBL: 0, legBR: 0,
        tailWag: s(t * 5) * 10 + s(t * 3) * 4,
        eyeOpen: 0.9 + s(t * 3) * 0.1,
        mouthOpen: 0.1 + Math.max(0, s(bobPhase * 2)) * 0.15,
        breathe: s(t * 2) * 0.8,
      };
    })(),

    snack: (() => {
      // Sneaking food - looking around then nomming
      const cycle = (t * 1.5) % 5;
      const lookAround = cycle < 2;
      const nomming = cycle >= 2 && cycle < 4;
      const guilty = cycle >= 4;
      if (lookAround) {
        const look = s(cycle * 4);
        return {
          bodyY: 2,
          bodyTilt: -2,
          headY: -3,
          headTilt: look * 25,
          legFL: 0, legFR: 0, legBL: 0, legBR: 0,
          tailWag: s(t * 2) * 3,
          eyeOpen: 1.3,
          mouthOpen: 0,
          breathe: s(t * 2) * 0.6,
        };
      } else if (nomming) {
        const chew = s(t * 12);
        return {
          bodyY: 4,
          bodyTilt: -4,
          headY: 6,
          headTilt: -8 + s(t * 2) * 3,
          legFL: 3, legFR: -3, legBL: 0, legBR: 0,
          tailWag: s(t * 8) * 14,
          eyeOpen: 0.5 + chew * 0.1,
          mouthOpen: 0.2 + Math.abs(chew) * 0.3,
          breathe: 0,
          nomming: true,
        };
      } else {
        return {
          bodyY: 1,
          bodyTilt: 0,
          headY: -2,
          headTilt: s(t * 1.5) * 5,
          legFL: 0, legFR: 0, legBL: 0, legBR: 0,
          tailWag: s(t * 1) * 2,
          eyeOpen: 0.7,
          mouthOpen: 0,
          breathe: s(t * 1.5) * 1,
          blush: true,
        };
      }
    })(),

    shy: (() => {
      // Shy hiding - body shrinks, paws cover face
      const shyPhase = Math.min(1, t * 0.6);
      const peek = shyPhase >= 1 ? (s(t * 1.5) > 0.7 ? (s(t * 1.5) - 0.7) / 0.3 : 0) : 0;
      return {
        bodyY: 8 * shyPhase,
        bodyTilt: -2,
        headY: 4 * shyPhase,
        headTilt: -6 * shyPhase + peek * 4,
        legFL: -70 * shyPhase, legFR: -70 * shyPhase,
        legLiftFL: 10 * shyPhase, legLiftFR: 10 * shyPhase,
        legBL: -90 * shyPhase, legBR: -90 * shyPhase,
        tailWag: s(t * 1.5) * 3,
        eyeOpen: peek > 0 ? 0.8 * peek : 0.1,
        mouthOpen: 0,
        breathe: s(t * 1.5) * 1,
        pawsUp: true,
        pawWiggle: s(t * 2) * 1.5,
        blush: true,
      };
    })(),

    sing: (() => {
      // Singing/howling - head up, mouth open, musical notes
      const singPhase = t * 3;
      const howl = s(singPhase);
      const intensity = 0.5 + Math.abs(howl) * 0.5;
      return {
        bodyY: -2 + s(singPhase * 0.5) * 2,
        bodyTilt: s(singPhase * 0.3) * 3,
        headY: -8 - intensity * 6,
        headTilt: -15 - intensity * 10 + s(t * 5) * 3,
        legFL: 0, legFR: 0, legBL: 0, legBR: 0,
        tailWag: s(t * 4) * 8 + s(t * 6) * 4,
        eyeOpen: 0.3,
        mouthOpen: 0.4 + intensity * 0.4,
        breathe: s(singPhase) * 2,
        singing: true,
        notePhase: (t * 2) % 1,
      };
    })(),

    handshake: (() => {
      // Handshake / give paw - one paw extended forward
      const shakeCycle = t * 3;
      const pumpPhase = s(shakeCycle);
      const extended = Math.min(1, t * 1.5);
      return {
        bodyY: 4 * extended,
        bodyTilt: -4 * extended,
        headY: 0,
        headTilt: 8 * extended + s(t * 2) * 3,
        legFL: -80 * extended, legFR: 0,
        legLiftFL: 12 * extended + pumpPhase * 4 * extended,
        legBL: -90 * extended, legBR: -90 * extended,
        tailWag: s(t * 6) * 12 + s(t * 4) * 5,
        eyeOpen: 1.15,
        mouthOpen: 0.15 + Math.max(0, pumpPhase) * 0.1,
        breathe: s(t * 2) * 0.8,
        pawsUp: true,
      };
    })(),

    frisbee: (() => {
      // Catching frisbee - jump up with mouth open, then land with it
      const cycle = (t * 1.2) % 4;
      const crouch = cycle < 1;
      const leap = cycle >= 1 && cycle < 2.2;
      const land = cycle >= 2.2;
      if (crouch) {
        const prep = cycle;
        return {
          bodyY: 6 + prep * 4,
          bodyTilt: -6 * prep,
          headY: 4 * prep,
          headTilt: -15 * prep,
          legFL: prep * 5, legFR: prep * 3,
          legBL: -prep * 4, legBR: -prep * 3,
          tailWag: s(t * 6) * 8,
          eyeOpen: 1.3,
          mouthOpen: 0.1,
          breathe: 0,
        };
      } else if (leap) {
        const leapT = (cycle - 1) / 1.2;
        const height = s(leapT * Math.PI) * 25;
        return {
          bodyY: -height,
          bodyTilt: -8 + leapT * 12,
          headY: -height * 0.8 - 4,
          headTilt: -20 + leapT * 25,
          legFL: -50 - leapT * 20, legFR: -40 - leapT * 20,
          legBL: 10 + leapT * 15, legBR: 8 + leapT * 12,
          tailWag: s(t * 10) * 15,
          eyeOpen: 1.2,
          mouthOpen: 0.6 + leapT * 0.3,
          breathe: 0,
          sparkle: true,
        };
      } else {
        const landT = Math.min(1, (cycle - 2.2) / 1.8);
        return {
          bodyY: 2 + s(landT * 3) * 2,
          bodyTilt: -2,
          headY: 0,
          headTilt: s(t * 2) * 4,
          legFL: 0, legFR: 0, legBL: 0, legBR: 0,
          tailWag: s(t * 10) * 18 + s(t * 6) * 6,
          eyeOpen: 1.2,
          mouthOpen: 0.15,
          breathe: s(t * 2) * 1,
          sparkle: landT < 0.3,
          proud: true,
        };
      }
    })(),

    butterfly: (() => {
      // Looking up at butterfly - head tilted up, eyes tracking
      const flyPath = t * 1.5;
      const bfX = s(flyPath) * 15;
      const bfY = c(flyPath * 1.3) * 8;
      return {
        bodyY: 0,
        bodyTilt: s(flyPath * 0.3) * 2,
        headY: -6 - Math.abs(bfY) * 0.3,
        headTilt: -18 + bfX * 0.8 + s(t * 0.8) * 3,
        legFL: 0, legFR: 0, legBL: 0, legBR: 0,
        tailWag: s(t * 3) * 6 + s(t * 5) * 3,
        eyeOpen: 1.25,
        mouthOpen: 0.05,
        breathe: s(t * 1.5) * 1.2,
        butterfly: true,
        butterflyX: 100 + bfX * 2.5,
        butterflyY: 30 + bfY * 1.5 + s(flyPath * 2.7) * 6,
        butterflyWing: s(t * 12),
      };
    })(),
  };
  return poses[state] || poses.stand;
}

// ===================== Main Renderer =====================

function renderPet(ctx, breed, state, t, size, accessories, dir) {
  const sz = size || 200;
  const scale = sz / 200;
  ctx.clearRect(0, 0, sz, sz);
  ctx.save();
  ctx.scale(scale, scale);

  const col = breed.colors;
  const sh = breed.shape;
  const pose = getPose(state, t);
  const isCat = sh.earType === 'cat';
  const aType = sh.animalType || (isCat ? 'cat' : 'dog');
  const isBird = aType === 'goose' || aType === 'duck' || aType === 'penguin';
  const isPig = aType === 'pig';

  // Base positions — centered layout so parts stay connected
  const bodyCX = 100;
  const bodyCY = 118 + pose.bodyY + pose.breathe;
  const bodyW = isBird ? 40 : (isPig ? 46 : 44);
  const bodyH = isBird ? 30 : (isPig ? 30 : 28);
  // Head sits ON the body (overlapping slightly) so they feel connected
  const headOffX = isCat ? 8 : (isBird ? 26 : (isPig ? 20 : 22));
  const headOffY = isBird ? -26 : -28;
  const headR = isCat ? 25 : (isBird ? 20 : (isPig ? 24 : 23));

  // Global tilt — everything rotates together from body center
  if (pose.bodyTilt) {
    ctx.translate(bodyCX, bodyCY);
    ctx.rotate((pose.bodyTilt || 0) * Math.PI / 180);
    ctx.translate(-bodyCX, -bodyCY);
  }

  // Spin for chase
  if (pose.spin !== undefined) {
    ctx.translate(bodyCX, bodyCY);
    ctx.rotate(Math.sin(pose.spin * 4) * 0.15);
    ctx.translate(-bodyCX, -bodyCY);
  }

  // Head position derived from body so they stay connected
  const headCX = bodyCX + headOffX;
  const headCY = bodyCY + headOffY + pose.headY * 0.5;

  // ---- TAIL ----
  drawTail(ctx, bodyCX, bodyCY, bodyW, col, sh, pose, t);

  // ---- BACK LEGS ----
  drawLegs(ctx, bodyCX, bodyCY, bodyW, bodyH, col, sh, pose, 'back');

  // ---- BODY ----
  // Shadow under body
  ctx.globalAlpha = 0.08;
  drawEllipse(ctx, bodyCX, bodyCY + bodyH + 15, bodyW * 0.7, 5, '#000', null);
  ctx.globalAlpha = 1;

  drawRoundBody(ctx, bodyCX, bodyCY, bodyW, bodyH, col.body, col.stroke, 2.5, sh.fluffy);

  // Back patch (border collie)
  if (sh.hasBackPatch && col.patch) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(bodyCX, bodyCY, bodyW, bodyH, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.beginPath();
    ctx.ellipse(bodyCX - 15, bodyCY - 5, 25, 20, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = col.patch;
    ctx.fill();
    ctx.restore();
    drawRoundBody(ctx, bodyCX, bodyCY, bodyW, bodyH, null, col.stroke, 2.5, sh.fluffy);
  }

  // Belly highlight
  if (aType === 'penguin') {
    // Penguin white belly - large and prominent
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(bodyCX, bodyCY, bodyW, bodyH, 0, 0, Math.PI * 2);
    ctx.clip();
    drawEllipse(ctx, bodyCX + 8, bodyCY + 2, bodyW * 0.55, bodyH * 0.7, col.belly, null);
    ctx.restore();
    drawRoundBody(ctx, bodyCX, bodyCY, bodyW, bodyH, null, col.stroke, 2.5, false);
  } else {
    ctx.globalAlpha = 0.3;
    drawEllipse(ctx, bodyCX + 10, bodyCY + 3, bodyW * 0.4, bodyH * 0.45, col.belly, null);
    ctx.globalAlpha = 1;
  }

  // Body stripes for cats
  if (sh.hasStripes && col.stripe) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(bodyCX, bodyCY, bodyW, bodyH, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = col.stripe;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const bx = bodyCX - 15 + i * 12;
      ctx.beginPath();
      ctx.moveTo(bx, bodyCY - bodyH * 0.6);
      ctx.quadraticCurveTo(bx + 3, bodyCY, bx - 2, bodyCY + bodyH * 0.5);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ---- FRONT LEGS ----
  drawLegs(ctx, bodyCX, bodyCY, bodyW, bodyH, col, sh, pose, 'front');

  // ---- HEAD ----
  ctx.save();
  ctx.translate(headCX, headCY);
  ctx.rotate((pose.headTilt || 0) * Math.PI / 180);

  if (sh.fluffy) {
    drawRoundBody(ctx, 0, 0, headR, headR, col.body, col.stroke, 2.5, true);
  } else {
    drawCircle(ctx, 0, 0, headR, col.body, col.stroke, 2.5);
  }

  // Penguin white face
  if (aType === 'penguin') {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, headR, 0, Math.PI * 2);
    ctx.clip();
    drawEllipse(ctx, 2, 3, headR * 0.65, headR * 0.7, col.belly, null);
    ctx.restore();
    drawCircle(ctx, 0, 0, headR, null, col.stroke, 2.5);
  }

  // Goose/Duck head bump (forehead knob for geese)
  if (aType === 'goose') {
    drawCircle(ctx, 6, -headR * 0.6, 5, col.beak || col.nose, col.beakStroke || col.stroke, 1.5);
  }

  // Face patch for tuxedo cat
  if (sh.hasFacePatch && col.patch) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, headR, 0, Math.PI * 2);
    ctx.clip();
    ctx.beginPath();
    ctx.ellipse(-8, -5, 16, 14, -0.2, 0, Math.PI * 2);
    ctx.fillStyle = col.patch;
    ctx.fill();
    ctx.restore();
    drawCircle(ctx, 0, 0, headR, null, col.stroke, 2.5);
  }

  // Pug mask
  if (sh.hasMask && col.mask) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, headR, 0, Math.PI * 2);
    ctx.clip();
    drawEllipse(ctx, 2, 2, 14, 16, col.mask, null);
    ctx.restore();
    drawCircle(ctx, 0, 0, headR, null, col.stroke, 2.5);
  }

  // ---- EARS ----
  drawEars(ctx, headR, col, sh, pose);

  // ---- FACE ----
  drawFace(ctx, col, sh, pose, isCat);

  // Bow
  if (sh.hasBow) {
    drawBow(ctx, -headR + 3, -headR + 5, sh.bowColor, 7);
  }

  // ---- ACCESSORIES ----
  drawAccessories(ctx, headR, accessories, dir);

  ctx.restore(); // head transform

  // ---- EFFECTS ----
  if (pose.zzz) {
    // Floating Zzz with drift
    const drift = t * 8;
    for (let i = 0; i < 3; i++) {
      const phase = (drift + i * 30) % 60;
      const alpha = phase < 40 ? Math.min(1, phase / 10) : Math.max(0, 1 - (phase - 40) / 20);
      const yOff = -phase * 1.2;
      const xOff = Math.sin(phase * 0.15) * 8;
      ctx.globalAlpha = alpha * 0.7;
      ctx.font = `bold ${12 + i * 3}px Arial`;
      ctx.fillStyle = '#88AADD';
      ctx.fillText(i < 2 ? 'z' : 'Z', headCX + 18 + xOff + i * 6, headCY - 20 + yOff);
    }
    ctx.globalAlpha = 1;
  }

  if (pose.sparkle) {
    const sparkles = [
      { x: headCX + 22, y: headCY - 22, s: 12, sp: 6, ph: 0 },
      { x: bodyCX - 32, y: headCY - 8, s: 10, sp: 5, ph: 2 },
      { x: headCX + 5, y: headCY - 35, s: 8, sp: 7, ph: 4 },
    ];
    for (const sp of sparkles) {
      const alpha = 0.3 + Math.abs(Math.sin(t * sp.sp + sp.ph)) * 0.7;
      const scale = 0.6 + Math.abs(Math.sin(t * sp.sp + sp.ph)) * 0.4;
      ctx.globalAlpha = alpha;
      ctx.font = `${Math.round(sp.s * scale)}px Arial`;
      ctx.fillStyle = '#FFD700';
      ctx.fillText('✦', sp.x + Math.sin(t * 3 + sp.ph) * 3, sp.y + Math.cos(t * 4 + sp.ph) * 3);
    }
    ctx.globalAlpha = 1;
  }

  // Typing indicator - minimal SF-style keyboard icon
  if (pose.typing) {
    const ix = headCX + 20;
    const iy = headCY - 28;
    const bounce = Math.sin(t * 8) * 1.5;
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.translate(ix, iy + bounce);
    // Rounded pill background
    const pw = 22, ph = 14, pr = 5;
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.beginPath();
    ctx.roundRect(- pw/2, -ph/2, pw, ph, pr);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // Tiny keyboard keys (3x2 grid)
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const kx = -7 + c * 5.5;
        const ky = -3.5 + r * 5;
        ctx.beginPath();
        ctx.roundRect(kx, ky, 4, 3.5, 0.8);
        ctx.fill();
      }
    }
    // Space bar
    ctx.beginPath();
    ctx.roundRect(-5, 3, 10, 2.5, 0.8);
    ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  // Click indicator - minimal SF-style cursor icon
  if (pose.clicking) {
    const punch = pose.clickPunch || 0;
    const ix = headCX + 22;
    const iy = headCY - 28;
    const bounce = punch * -2;
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.translate(ix, iy + bounce);
    // Pill background
    const pw = 18, ph = 18, pr = 6;
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.beginPath();
    ctx.roundRect(-pw/2, -ph/2, pw, ph, pr);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // macOS cursor arrow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.moveTo(-3, -5);
    ctx.lineTo(-3, 5);
    ctx.lineTo(0, 3);
    ctx.lineTo(3, 6);
    ctx.lineTo(4, 5);
    ctx.lineTo(1.5, 2);
    ctx.lineTo(4, 2);
    ctx.closePath();
    ctx.fill();
    // Click ripple
    if (punch > 0.5) {
      const rAlpha = (1 - punch) * 1.2;
      ctx.globalAlpha = Math.max(0, rAlpha) * 0.4;
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 0.8;
      const radius = 6 + punch * 6;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  if (pose.pooping) {
    const phase = pose.poopPhase || 0;
    const bagX = bodyCX + 20;
    const bagY = bodyCY + bodyH + 8;

    // Garbage bag appears from below
    const bagSlide = Math.min(1, phase * 3); // bag slides in fast
    const bagOffY = (1 - bagSlide) * 30;
    ctx.save();
    ctx.translate(0, bagOffY);

    // Bag body
    ctx.beginPath();
    ctx.moveTo(bagX - 12, bagY - 10);
    ctx.lineTo(bagX - 14, bagY + 14);
    ctx.quadraticCurveTo(bagX, bagY + 20, bagX + 14, bagY + 14);
    ctx.lineTo(bagX + 12, bagY - 10);
    ctx.closePath();
    ctx.fillStyle = '#5A5A5A';
    ctx.fill();
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Bag opening / tie
    ctx.beginPath();
    ctx.ellipse(bagX, bagY - 10, 13, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#4A4A4A';
    ctx.fill();
    ctx.stroke();

    // Poop falls if phase > 0.3
    if (phase > 0.3) {
      const poopProgress = Math.min(1, (phase - 0.3) / 0.4);
      const poopY = bodyCY + bodyH - 5 + poopProgress * 18;
      // Little poop swirl
      ctx.fillStyle = '#8B6914';
      ctx.beginPath();
      ctx.arc(bagX, poopY, 4, 0, Math.PI * 2);
      ctx.fill();
      if (poopProgress > 0.3) {
        ctx.beginPath();
        ctx.arc(bagX - 2, poopY - 5, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      if (poopProgress > 0.6) {
        ctx.beginPath();
        ctx.arc(bagX + 1, poopY - 9, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Bag closes at end
    if (phase > 0.85) {
      ctx.beginPath();
      ctx.moveTo(bagX - 6, bagY - 12);
      ctx.lineTo(bagX, bagY - 16);
      ctx.lineTo(bagX + 6, bagY - 12);
      ctx.strokeStyle = '#D44';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();

    // Effort sweat drops
    ctx.fillStyle = '#88CCFF';
    const sweatAlpha = 0.4 + Math.sin(t * 6) * 0.3;
    ctx.globalAlpha = sweatAlpha;
    ctx.font = '10px Arial';
    ctx.fillText('💧', headCX + 20, headCY - 10 + Math.sin(t * 4) * 3);
    ctx.globalAlpha = 1;
  }

  if (pose.sad) {
    // Slow floating dots
    ctx.globalAlpha = 0.3 + Math.sin(t * 1.2) * 0.2;
    ctx.font = '14px Arial';
    ctx.fillStyle = '#AAA';
    const dotY = Math.sin(t * 0.8) * 3;
    ctx.fillText('...', headCX + 12, headCY - 18 + dotY);
    ctx.globalAlpha = 1;
  }

  // Sneeze explosion particles
  if (pose.sneeze) {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 0.8 - Math.PI * 0.1;
      const dist = 15 + Math.sin(t * 8 + i) * 8;
      const px = headCX + headOffX + Math.cos(angle) * dist;
      const py = headCY + 8 + Math.sin(angle) * dist * 0.5;
      ctx.globalAlpha = 0.5 + Math.sin(t * 6 + i * 2) * 0.3;
      ctx.fillStyle = '#88CCFF';
      ctx.beginPath();
      ctx.arc(px, py, 2 + Math.sin(t * 4 + i) * 1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Shake water droplets
  if (pose.shaking) {
    for (let i = 0; i < 5; i++) {
      const angle = (t * 15 + i * 72) * Math.PI / 180;
      const dist = 30 + Math.sin(t * 8 + i * 3) * 10;
      const dx = bodyCX + Math.cos(angle) * dist;
      const dy = bodyCY - 10 + Math.sin(angle) * dist * 0.6;
      ctx.globalAlpha = 0.4 + Math.sin(t * 6 + i) * 0.3;
      ctx.fillStyle = '#AAD8FF';
      ctx.beginPath();
      // Teardrop shape
      ctx.moveTo(dx, dy - 3);
      ctx.quadraticCurveTo(dx + 2.5, dy, dx, dy + 3);
      ctx.quadraticCurveTo(dx - 2.5, dy, dx, dy - 3);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Dizzy floating stars
  if (pose.dizzyStars) {
    const stars = ['⭐', '💫', '✨'];
    for (let i = 0; i < 3; i++) {
      const orbitAngle = t * 3 + (i * Math.PI * 2 / 3);
      const ox = headCX + Math.cos(orbitAngle) * 22;
      const oy = headCY - 20 + Math.sin(orbitAngle) * 8;
      ctx.globalAlpha = 0.6 + Math.sin(t * 4 + i) * 0.3;
      ctx.font = '10px Arial';
      ctx.fillText(stars[i], ox, oy);
    }
    ctx.globalAlpha = 1;
  }

  // Hiccup bubble
  if (pose.hiccup) {
    const bubbleY = headCY - 25 - Math.abs(Math.sin(t * 8)) * 10;
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#88CCFF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(headCX + 18, bubbleY, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#CCECFF';
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Tongue drip for licking
  if (pose.licking) {
    const dripY = Math.sin(t * 2) * 3;
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#FF8888';
    ctx.font = '8px Arial';
    ctx.fillText('💗', headCX + 20, headCY - 15 + dripY);
    ctx.globalAlpha = 1;
  }

  // Flop tongue hanging out
  if (pose.tongue) {
    ctx.globalAlpha = 0.6;
    ctx.font = '10px Arial';
    ctx.fillText('😵', headCX + 20, headCY - 18 + Math.sin(t * 0.5) * 2);
    ctx.globalAlpha = 1;
  }

  // Digging dirt particles
  if (pose.digging) {
    const dirtPhase = pose.dirtPhase || 0;
    for (let i = 0; i < 5; i++) {
      const angle = -Math.PI * 0.3 + (i / 5) * Math.PI * 0.6;
      const dist = 10 + dirtPhase * 20 + Math.sin(t * 6 + i * 2) * 5;
      const dx = bodyCX + bodyW * 0.3 + Math.cos(angle) * dist;
      const dy = bodyCY + bodyH + 5 - Math.sin(angle) * dist * 0.4;
      ctx.globalAlpha = 0.6 - dirtPhase * 0.3;
      ctx.fillStyle = '#C8A878';
      ctx.beginPath();
      ctx.arc(dx, dy, 2 + Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // X eyes for playing dead
  if (pose.xEyes) {
    ctx.globalAlpha = 0.5;
    ctx.font = '12px Arial';
    ctx.fillText('✕', headCX + 12, headCY - 8);
    ctx.fillText('✕', headCX + 24, headCY - 8);
    ctx.globalAlpha = 1;
  }

  // Spinning sparkle trail
  if (pose.spinning) {
    for (let i = 0; i < 4; i++) {
      const trail = (t * 5 + i * 1.5) % (Math.PI * 2);
      const tx2 = bodyCX + Math.cos(trail) * 35;
      const ty2 = bodyCY - 5 + Math.sin(trail) * 15;
      ctx.globalAlpha = 0.3 + Math.sin(t * 6 + i) * 0.3;
      ctx.font = `${8 + i * 2}px Arial`;
      ctx.fillText('✦', tx2, ty2);
    }
    ctx.globalAlpha = 1;
  }

  // Snack nomming crumbs
  if (pose.nomming) {
    for (let i = 0; i < 4; i++) {
      const crumbX = headCX + 10 + Math.sin(t * 4 + i * 3) * 8;
      const crumbY = headCY + 10 + i * 4 + Math.sin(t * 3 + i) * 3;
      ctx.globalAlpha = 0.5 + Math.sin(t * 5 + i) * 0.2;
      ctx.fillStyle = '#D4A860';
      ctx.beginPath();
      ctx.arc(crumbX, crumbY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Blush cheeks effect
  if (pose.blush) {
    ctx.globalAlpha = 0.3 + Math.sin(t * 2) * 0.15;
    ctx.fillStyle = '#FFB0B0';
    drawCircle(ctx, headCX + 6, headCY + 2, 6, '#FFB0B0', null);
    drawCircle(ctx, headCX + 30, headCY + 2, 6, '#FFB0B0', null);
    ctx.globalAlpha = 1;
  }

  // Singing musical notes
  if (pose.singing) {
    const notes = ['♪', '♫', '♩', '🎵'];
    for (let i = 0; i < 4; i++) {
      const notePhase = (t * 2 + i * 0.8) % 3;
      const noteX = headCX + 5 + Math.sin(notePhase * 2 + i) * 15 + i * 8;
      const noteY = headCY - 30 - notePhase * 15;
      const alpha = notePhase < 2 ? Math.min(1, notePhase) : Math.max(0, 3 - notePhase);
      ctx.globalAlpha = alpha * 0.7;
      ctx.font = `${10 + i * 2}px Arial`;
      ctx.fillStyle = '#FF69B4';
      ctx.fillText(notes[i], noteX, noteY);
    }
    ctx.globalAlpha = 1;
  }

  // Proud sparkle burst
  if (pose.proud) {
    ctx.globalAlpha = 0.6;
    ctx.font = '14px Arial';
    ctx.fillText('⭐', headCX + 20, headCY - 25 + Math.sin(t * 3) * 3);
    ctx.globalAlpha = 1;
  }

  // Butterfly
  if (pose.butterfly) {
    const bx = pose.butterflyX || 100;
    const by = pose.butterflyY || 40;
    const wing = pose.butterflyWing || 0;
    ctx.save();
    ctx.translate(bx, by);
    // Body
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(0, 0, 1.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Wings
    const wingOpen = 0.3 + Math.abs(wing) * 0.7;
    ctx.fillStyle = '#FF88CC';
    ctx.globalAlpha = 0.8;
    // Left wing
    ctx.beginPath();
    ctx.ellipse(-5 * wingOpen, -1, 6 * wingOpen, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // Right wing
    ctx.beginPath();
    ctx.ellipse(5 * wingOpen, -1, 6 * wingOpen, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Wing pattern
    ctx.fillStyle = '#FF55AA';
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(-5 * wingOpen, -2, 3 * wingOpen, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5 * wingOpen, -2, 3 * wingOpen, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ---- Sub-renderers ----

function drawTail(ctx, bodyCX, bodyCY, bodyW, c, sh, pose, t) {
  const tx = bodyCX - bodyW + 5;
  const ty = bodyCY - 10;
  const wag = pose.tailWag || 0;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (sh.tailType === 'curly') {
    // Shiba/Pug curly tail - thicker, more curl
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    const cx1 = tx - 16 + wag * 0.15;
    const cy1 = ty - 22;
    const cx2 = tx + 5 + wag * 0.1;
    const cy2 = ty - 36;
    const ex = tx + 8;
    const ey = ty - 25;
    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, ex, ey);
    ctx.strokeStyle = c.body;
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.strokeStyle = c.stroke;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else if (sh.tailType === 'fluffy') {
    const tailEndX = tx - 10 + wag * 0.06;
    const tailEndY = ty - 26;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx - 14, ty - 14, tailEndX, tailEndY);
    ctx.strokeStyle = c.body;
    ctx.lineWidth = 7;
    ctx.stroke();
    drawRoundBody(ctx, tailEndX, tailEndY, 9, 9, c.body, c.stroke, 2, true);
  } else if (sh.tailType === 'cattail') {
    // S-curve cat tail with animated tip
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    const tipWag = wag * 0.4;
    ctx.bezierCurveTo(
      tx - 15, ty + 5,
      tx - 28 + tipWag * 0.2, ty - 20,
      tx - 18 + tipWag * 0.3, ty - 42 + Math.sin(t * 3) * 4
    );
    ctx.strokeStyle = c.body;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.strokeStyle = c.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
    // Tapered tip
    drawCircle(ctx, tx - 18 + tipWag * 0.3, ty - 42 + Math.sin(t * 3) * 4, 3, c.body, c.stroke, 1.5);
  } else if (sh.tailType === 'long') {
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.bezierCurveTo(tx - 15, ty - 10 + wag * 0.2, tx - 22, ty - 22, tx - 14, ty - 32 + wag * 0.1);
    ctx.strokeStyle = c.body;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.strokeStyle = c.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (sh.tailType === 'short') {
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx - 8 + wag * 0.1, ty - 12, tx - 3 + wag * 0.08, ty - 18);
    ctx.strokeStyle = c.body;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.strokeStyle = c.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (sh.tailType === 'goose') {
    // Short upturned feathery tail
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx - 12, ty - 8, tx - 8 + wag * 0.05, ty - 18);
    ctx.strokeStyle = c.body;
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.strokeStyle = c.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
    // Feather tips
    for (let i = 0; i < 3; i++) {
      drawCircle(ctx, tx - 6 + i * 3 + wag * 0.03, ty - 18 - i * 2, 3, c.body, c.stroke, 1);
    }
  } else if (sh.tailType === 'pigtail') {
    // Curly pig tail (corkscrew)
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const p = i / steps;
      const angle = p * Math.PI * 3;
      const px = tx - 8 - p * 12 + Math.cos(angle) * 5 + wag * 0.05;
      const py = ty - 8 + Math.sin(angle) * 5;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = c.body;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.strokeStyle = c.stroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (sh.tailType === 'ducktail') {
    // Short perky duck tail
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx - 10 + wag * 0.08, ty - 14, tx - 5, ty - 20);
    ctx.strokeStyle = c.body;
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.strokeStyle = c.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
    drawCircle(ctx, tx - 5, ty - 20, 3.5, c.body, c.stroke, 1.5);
  } else {
    // up tail
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx - 16 + wag * 0.15, ty - 24, tx - 8 + wag * 0.1, ty - 36);
    ctx.strokeStyle = c.body;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.strokeStyle = c.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

function drawLegs(ctx, bodyCX, bodyCY, bodyW, bodyH, c, sh, pose, which) {
  const legW = 8;
  const legH = 22;
  const groundY = bodyCY + bodyH - 2;
  const aType = sh.animalType;

  ctx.lineCap = 'round';

  // --- Bird / Penguin: only 2 legs (drawn as "front"), wings as "back" ---
  if (aType === 'goose' || aType === 'duck') {
    if (which === 'back') return; // no back legs for birds
    // Webbed feet
    const lx = bodyCX + bodyW * 0.05;
    const rx = bodyCX + bodyW * 0.35;
    const feetColor = c.feet || c.nose;
    for (const fx of [lx, rx]) {
      const offset = fx === lx ? (pose.legFL || 0) : (pose.legFR || 0);
      const lift = fx === lx ? (pose.legLiftFL || 0) : (pose.legLiftFR || 0);
      const footX = fx + offset * 0.12;
      const footY = groundY + legH - lift;
      // Thin leg
      ctx.beginPath();
      ctx.moveTo(fx, groundY);
      ctx.lineTo(footX, footY);
      ctx.strokeStyle = feetColor; ctx.lineWidth = 3; ctx.stroke();
      // Webbed foot
      ctx.beginPath();
      ctx.moveTo(footX - 5, footY);
      ctx.lineTo(footX + 8, footY);
      ctx.lineTo(footX + 2, footY + 4);
      ctx.closePath();
      ctx.fillStyle = feetColor; ctx.fill();
      ctx.strokeStyle = c.stroke; ctx.lineWidth = 1; ctx.stroke();
    }
    return;
  }

  if (aType === 'penguin') {
    if (which === 'back') {
      // Wings (as "back" layer, behind body)
      const wingWag = Math.sin((pose.tailWag || 0) * 0.1) * 3;
      // Left wing
      ctx.beginPath();
      ctx.moveTo(bodyCX - bodyW * 0.5, bodyCY - 5);
      ctx.quadraticCurveTo(bodyCX - bodyW - 5, bodyCY + 10 + wingWag, bodyCX - bodyW * 0.3, bodyCY + bodyH + 5);
      ctx.strokeStyle = c.body; ctx.lineWidth = 8; ctx.stroke();
      ctx.strokeStyle = c.stroke; ctx.lineWidth = 2; ctx.stroke();
      // Right wing
      ctx.beginPath();
      ctx.moveTo(bodyCX + bodyW * 0.5, bodyCY - 5);
      ctx.quadraticCurveTo(bodyCX + bodyW + 5, bodyCY + 10 - wingWag, bodyCX + bodyW * 0.3, bodyCY + bodyH + 5);
      ctx.strokeStyle = c.body; ctx.lineWidth = 8; ctx.stroke();
      ctx.strokeStyle = c.stroke; ctx.lineWidth = 2; ctx.stroke();
      return;
    }
    // Penguin feet
    const feetColor = c.feet || c.nose;
    const lx = bodyCX + bodyW * 0.05;
    const rx = bodyCX + bodyW * 0.35;
    for (const fx of [lx, rx]) {
      const offset = fx === lx ? (pose.legFL || 0) : (pose.legFR || 0);
      const footX = fx + offset * 0.1;
      const footY = groundY + legH * 0.6;
      ctx.beginPath();
      ctx.moveTo(fx, groundY + 2);
      ctx.lineTo(footX, footY);
      ctx.strokeStyle = feetColor; ctx.lineWidth = 4; ctx.stroke();
      drawEllipse(ctx, footX + 2, footY + 1, 6, 3, feetColor, c.stroke, 1);
    }
    return;
  }

  if (which === 'back') {
    const blX = bodyCX - bodyW * 0.52;
    const brX = bodyCX - bodyW * 0.22;
    if (pose.legBL === -90) {
      // Sitting: round folded haunches
      drawEllipse(ctx, blX + 5, groundY + 8, 12, 8, c.body, c.stroke, 2);
      drawEllipse(ctx, brX + 5, groundY + 8, 12, 8, c.body, c.stroke, 2);
      // Little paw tips visible
      drawCircle(ctx, blX + 14, groundY + 13, 4, c.body, c.stroke, 1.5);
      drawCircle(ctx, brX + 14, groundY + 13, 4, c.body, c.stroke, 1.5);
    } else {
      drawLeg(ctx, blX, groundY, legW, legH, pose.legBL || 0, c.body, c.stroke, pose.legLiftBL || 0);
      drawLeg(ctx, brX, groundY, legW, legH, pose.legBR || 0, c.body, c.stroke, pose.legLiftBR || 0);
    }
  } else {
    const flX = bodyCX + bodyW * 0.18;
    const frX = bodyCX + bodyW * 0.48;

    if (pose.pawsUp) {
      // Begging paws - more natural curve with wiggle
      const wiggle = pose.pawWiggle || 0;
      ctx.save();
      // Left raised paw
      const lPawTipY = bodyCY - 12 + wiggle;
      ctx.beginPath();
      ctx.moveTo(flX, groundY);
      ctx.quadraticCurveTo(flX - 3, bodyCY, flX + 5, lPawTipY);
      ctx.strokeStyle = c.body;
      ctx.lineWidth = legW;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.strokeStyle = c.stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
      drawCircle(ctx, flX + 5, lPawTipY, 4.5, c.body, c.stroke, 1.5);

      // Right raised paw
      const rPawTipY = bodyCY - 10 - wiggle;
      ctx.beginPath();
      ctx.moveTo(frX, groundY);
      ctx.quadraticCurveTo(frX + 3, bodyCY, frX - 2, rPawTipY);
      ctx.strokeStyle = c.body;
      ctx.lineWidth = legW;
      ctx.stroke();
      ctx.strokeStyle = c.stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
      drawCircle(ctx, frX - 2, rPawTipY, 4.5, c.body, c.stroke, 1.5);
      ctx.restore();
    } else {
      drawLeg(ctx, flX, groundY, legW, legH, pose.legFL || 0, c.body, c.stroke, pose.legLiftFL || 0);
      drawLeg(ctx, frX, groundY, legW, legH, pose.legFR || 0, c.body, c.stroke, pose.legLiftFR || 0);
    }
  }
}

function drawLeg(ctx, x, groundY, w, h, offset, fill, stroke, lift) {
  const liftY = lift || 0; // vertical lift (0 = on ground)
  const footX = x + offset * 0.14;
  const footY = groundY + h - liftY;
  // Knee bends more when leg is lifted
  const kneeBend = liftY > 2 ? offset * 0.06 + liftY * 0.3 : offset * 0.04;
  const midX = x + kneeBend;
  const midY = groundY + h * 0.45 - liftY * 0.3;

  ctx.beginPath();
  ctx.moveTo(x, groundY);
  ctx.quadraticCurveTo(midX, midY, footX, footY - 4);
  ctx.strokeStyle = fill;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Round paw foot (slightly angled when lifted)
  const pawTilt = liftY > 2 ? 0.3 : 0;
  ctx.save();
  ctx.translate(footX, footY);
  ctx.rotate(pawTilt);
  drawEllipse(ctx, 0, 0, 5, 3.5, fill, stroke, 1.5);
  // Toe lines
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-2, 1); ctx.lineTo(-2, 3);
  ctx.moveTo(2, 1); ctx.lineTo(2, 3);
  ctx.stroke();
  ctx.restore();
}

function drawEars(ctx, headR, c, sh, pose) {
  const earH = headR * 0.7;

  if (sh.earType === 'pointed') {
    // Left ear (slightly curved edges for softness)
    ctx.beginPath();
    ctx.moveTo(-headR * 0.5, -headR * 0.55);
    ctx.quadraticCurveTo(-headR * 0.75, -headR - earH * 0.5, -headR * 0.65, -headR - earH * 0.8);
    ctx.quadraticCurveTo(-headR * 0.3, -headR - earH * 0.3, -headR * 0.05, -headR * 0.3);
    ctx.closePath();
    ctx.fillStyle = c.ear; ctx.fill();
    ctx.strokeStyle = c.stroke; ctx.lineWidth = 2; ctx.stroke();
    // Inner
    ctx.beginPath();
    ctx.moveTo(-headR * 0.42, -headR * 0.5);
    ctx.quadraticCurveTo(-headR * 0.6, -headR - earH * 0.3, -headR * 0.55, -headR - earH * 0.5);
    ctx.quadraticCurveTo(-headR * 0.3, -headR * 0.3, -headR * 0.15, -headR * 0.35);
    ctx.closePath();
    ctx.fillStyle = c.earInner; ctx.fill();

    // Right ear
    ctx.beginPath();
    ctx.moveTo(headR * 0.1, -headR * 0.55);
    ctx.quadraticCurveTo(headR * 0.15, -headR - earH * 0.5, headR * 0.3, -headR - earH * 0.8);
    ctx.quadraticCurveTo(headR * 0.55, -headR - earH * 0.3, headR * 0.55, -headR * 0.3);
    ctx.closePath();
    ctx.fillStyle = c.ear; ctx.fill();
    ctx.strokeStyle = c.stroke; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(headR * 0.18, -headR * 0.5);
    ctx.quadraticCurveTo(headR * 0.25, -headR - earH * 0.3, headR * 0.32, -headR - earH * 0.5);
    ctx.quadraticCurveTo(headR * 0.48, -headR * 0.3, headR * 0.45, -headR * 0.35);
    ctx.closePath();
    ctx.fillStyle = c.earInner; ctx.fill();

  } else if (sh.earType === 'floppy') {
    // More natural droopy ears with rounded tips
    ctx.beginPath();
    ctx.moveTo(-headR * 0.65, -headR * 0.25);
    ctx.bezierCurveTo(-headR - 10, -headR * 0.15, -headR - 8, headR * 0.15, -headR - 2, headR * 0.3);
    ctx.quadraticCurveTo(-headR + 3, headR * 0.35, -headR * 0.45, headR * 0.1);
    ctx.closePath();
    ctx.fillStyle = c.ear; ctx.fill();
    ctx.strokeStyle = c.stroke; ctx.lineWidth = 2; ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(headR * 0.25, -headR * 0.25);
    ctx.bezierCurveTo(headR + 10, -headR * 0.15, headR + 8, headR * 0.15, headR + 2, headR * 0.3);
    ctx.quadraticCurveTo(headR - 3, headR * 0.35, headR * 0.45, headR * 0.1);
    ctx.closePath();
    ctx.fillStyle = c.ear; ctx.fill();
    ctx.strokeStyle = c.stroke; ctx.lineWidth = 2; ctx.stroke();

  } else if (sh.earType === 'round') {
    drawRoundBody(ctx, -headR * 0.65, -headR * 0.4, 10, 10, c.ear, c.stroke, 2, true);
    drawRoundBody(ctx, headR * 0.35, -headR * 0.4, 10, 10, c.ear, c.stroke, 2, true);

  } else if (sh.earType === 'cat') {
    // Tall triangular cat ears with curved inner
    ctx.beginPath();
    ctx.moveTo(-headR * 0.62, -headR * 0.4);
    ctx.lineTo(-headR * 0.5, -headR - earH * 1.05);
    ctx.lineTo(-headR * 0.02, -headR * 0.45);
    ctx.closePath();
    ctx.fillStyle = c.ear; ctx.fill();
    ctx.strokeStyle = c.stroke; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-headR * 0.52, -headR * 0.45);
    ctx.lineTo(-headR * 0.47, -headR - earH * 0.65);
    ctx.lineTo(-headR * 0.12, -headR * 0.48);
    ctx.closePath();
    ctx.fillStyle = c.earInner; ctx.fill();

    ctx.beginPath();
    ctx.moveTo(headR * 0.22, -headR * 0.4);
    ctx.lineTo(headR * 0.18, -headR - earH * 1.05);
    ctx.lineTo(headR * 0.62, -headR * 0.45);
    ctx.closePath();
    ctx.fillStyle = c.ear; ctx.fill();
    ctx.strokeStyle = c.stroke; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(headR * 0.27, -headR * 0.45);
    ctx.lineTo(headR * 0.22, -headR - earH * 0.65);
    ctx.lineTo(headR * 0.52, -headR * 0.48);
    ctx.closePath();
    ctx.fillStyle = c.earInner; ctx.fill();

  } else if (sh.earType === 'goose' || sh.earType === 'duck') {
    // No visible ears - just tiny feather tufts
    ctx.beginPath();
    ctx.ellipse(-headR * 0.3, -headR * 0.6, 4, 3, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = c.ear; ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headR * 0.1, -headR * 0.6, 4, 3, 0.3, 0, Math.PI * 2);
    ctx.fillStyle = c.ear; ctx.fill();
    // Duck crest
    if (sh.hasCrest && c.crest) {
      ctx.beginPath();
      ctx.moveTo(-headR * 0.1, -headR * 0.9);
      ctx.quadraticCurveTo(-headR * 0.3, -headR * 1.5, -headR * 0.05, -headR * 1.3);
      ctx.quadraticCurveTo(headR * 0.1, -headR * 1.5, headR * 0.05, -headR * 0.9);
      ctx.fillStyle = c.crest; ctx.fill();
      ctx.strokeStyle = c.stroke; ctx.lineWidth = 1.5; ctx.stroke();
    }

  } else if (sh.earType === 'pig') {
    // Floppy pig ears - wider, droopy triangles
    ctx.beginPath();
    ctx.moveTo(-headR * 0.55, -headR * 0.35);
    ctx.quadraticCurveTo(-headR * 0.9, -headR * 0.7, -headR * 0.85, -headR * 0.1);
    ctx.quadraticCurveTo(-headR * 0.7, headR * 0.05, -headR * 0.35, -headR * 0.15);
    ctx.closePath();
    ctx.fillStyle = c.ear; ctx.fill();
    ctx.strokeStyle = c.stroke; ctx.lineWidth = 2; ctx.stroke();
    // Inner
    ctx.beginPath();
    ctx.moveTo(-headR * 0.5, -headR * 0.3);
    ctx.quadraticCurveTo(-headR * 0.75, -headR * 0.5, -headR * 0.72, -headR * 0.1);
    ctx.quadraticCurveTo(-headR * 0.6, 0, -headR * 0.4, -headR * 0.15);
    ctx.closePath();
    ctx.fillStyle = c.earInner; ctx.fill();

    // Right ear
    ctx.beginPath();
    ctx.moveTo(headR * 0.15, -headR * 0.35);
    ctx.quadraticCurveTo(headR * 0.5, -headR * 0.7, headR * 0.55, -headR * 0.1);
    ctx.quadraticCurveTo(headR * 0.4, headR * 0.05, headR * 0.1, -headR * 0.15);
    ctx.closePath();
    ctx.fillStyle = c.ear; ctx.fill();
    ctx.strokeStyle = c.stroke; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(headR * 0.18, -headR * 0.3);
    ctx.quadraticCurveTo(headR * 0.42, -headR * 0.5, headR * 0.45, -headR * 0.1);
    ctx.quadraticCurveTo(headR * 0.35, 0, headR * 0.13, -headR * 0.15);
    ctx.closePath();
    ctx.fillStyle = c.earInner; ctx.fill();

  } else if (sh.earType === 'penguin') {
    // No ears, just smooth head
  }
}

function drawFace(ctx, c, sh, pose, isCat) {
  const eyeOpen = pose.eyeOpen || 1;
  const mouthOpen = pose.mouthOpen || 0;
  const aType = sh.animalType || (isCat ? 'cat' : 'dog');
  const isBird = aType === 'goose' || aType === 'duck' || aType === 'penguin';
  const isPig = aType === 'pig';

  const eyeLX = isCat ? -8 : (isBird ? -6 : (isPig ? -7 : -6));
  const eyeRX = isCat ? 8 : (isBird ? 6 : (isPig ? 7 : 10));
  const eyeY = isCat ? -3 : (isBird ? -4 : -2);
  const eyeR = 3.5 * Math.min(eyeOpen, 1.3);

  // --- Eyes (shared across all animals) ---
  if (pose.spiralEyes) {
    // Dizzy spiral eyes
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    for (const ex of [eyeLX, eyeRX]) {
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 4; a += 0.15) {
        const r = a * 0.8;
        const px = ex + Math.cos(a) * r;
        const py = eyeY + Math.sin(a) * r;
        if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  } else if (eyeOpen >= 0.8) {
    drawCircle(ctx, eyeLX, eyeY, eyeR, '#111', null);
    drawCircle(ctx, eyeRX, eyeY, eyeR, '#111', null);
    drawCircle(ctx, eyeLX - 1, eyeY - 1.5, eyeR * 0.4, '#FFF', null);
    drawCircle(ctx, eyeRX - 1, eyeY - 1.5, eyeR * 0.4, '#FFF', null);
    drawCircle(ctx, eyeLX + 1.2, eyeY + 0.8, eyeR * 0.18, '#FFF', null);
    drawCircle(ctx, eyeRX + 1.2, eyeY + 0.8, eyeR * 0.18, '#FFF', null);
    if (eyeOpen >= 1.2) {
      drawCircle(ctx, eyeLX - 0.5, eyeY - 1, eyeR * 0.5, 'rgba(255,255,255,0.6)', null);
      drawCircle(ctx, eyeRX - 0.5, eyeY - 1, eyeR * 0.5, 'rgba(255,255,255,0.6)', null);
    }
  } else if (eyeOpen >= 0.4) {
    ctx.strokeStyle = '#333'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(eyeLX, eyeY + 1, 4, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    ctx.beginPath(); ctx.arc(eyeRX, eyeY + 1, 4, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  } else {
    ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(eyeLX - 3.5, eyeY); ctx.quadraticCurveTo(eyeLX, eyeY + 1.5, eyeLX + 3.5, eyeY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(eyeRX - 3.5, eyeY); ctx.quadraticCurveTo(eyeRX, eyeY + 1.5, eyeRX + 3.5, eyeY); ctx.stroke();
  }

  // --- Nose / Beak / Snout ---
  if (isBird) {
    // Beak - flat wide shape
    const bx = 8, by = 4;
    ctx.beginPath();
    ctx.moveTo(bx - 6, by - 2);
    ctx.quadraticCurveTo(bx + 10, by - 3, bx + 12, by + 1);
    ctx.quadraticCurveTo(bx + 10, by + 4, bx - 6, by + 3);
    ctx.closePath();
    ctx.fillStyle = c.beak || c.nose; ctx.fill();
    ctx.strokeStyle = c.beakStroke || c.stroke; ctx.lineWidth = 1.5; ctx.stroke();
    // Nostril dot
    drawCircle(ctx, bx + 4, by + 0.5, 1, c.beakStroke || c.stroke, null);
    // Mouth line
    ctx.beginPath();
    ctx.moveTo(bx - 4, by + 1);
    ctx.lineTo(bx + 10, by + 1);
    ctx.strokeStyle = c.beakStroke || c.stroke; ctx.lineWidth = 1; ctx.stroke();
  } else if (isPig) {
    // Pig snout - big round nose
    const sx = 3, sy = 5;
    drawEllipse(ctx, sx, sy, 9, 7, c.snout || c.nose, c.snoutStroke || c.stroke, 2);
    // Nostrils
    drawEllipse(ctx, sx - 3, sy, 2.2, 2.8, c.snoutStroke || c.stroke, null);
    drawEllipse(ctx, sx + 3, sy, 2.2, 2.8, c.snoutStroke || c.stroke, null);
    // Highlight
    ctx.globalAlpha = 0.25;
    drawCircle(ctx, sx - 1, sy - 2, 2, '#FFF', null);
    ctx.globalAlpha = 1;
    // Mouth
    ctx.strokeStyle = '#555'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx, sy + 7);
    ctx.quadraticCurveTo(sx - 5, sy + 10, sx - 7, sy + 8);
    ctx.stroke();
    // Pig spots
    if (sh.hasSpots && c.patch) {
      ctx.globalAlpha = 0.4;
      drawCircle(ctx, -12, -8, 5, c.patch, null);
      drawCircle(ctx, 10, -10, 3, c.patch, null);
      drawCircle(ctx, 14, 2, 4, c.patch, null);
      ctx.globalAlpha = 1;
    }
  } else if (isCat) {
    const noseX = 1, noseY = 5;
    ctx.beginPath();
    ctx.moveTo(noseX, noseY - 2.5);
    ctx.quadraticCurveTo(noseX - 3.5, noseY + 2, noseX, noseY + 1);
    ctx.quadraticCurveTo(noseX + 3.5, noseY + 2, noseX, noseY - 2.5);
    ctx.fillStyle = c.nose; ctx.fill();
    // Mouth
    ctx.strokeStyle = '#555'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(noseX - 5, noseY + 5);
    ctx.quadraticCurveTo(noseX - 1.5, noseY + 7.5, noseX, noseY + 3.5);
    ctx.quadraticCurveTo(noseX + 1.5, noseY + 7.5, noseX + 5, noseY + 5);
    ctx.stroke();
    // Whiskers
    ctx.lineWidth = 0.8; ctx.strokeStyle = c.stroke;
    for (const side of [-1, 1]) {
      for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        ctx.moveTo(noseX + side * 7, noseY + 1 + i * 3);
        ctx.lineTo(noseX + side * 22, noseY - 1 + i * 4);
        ctx.stroke();
      }
    }
  } else {
    // Dog nose
    const noseX = 6, noseY = 5;
    drawEllipse(ctx, noseX, noseY, 4, 3, c.nose, null);
    ctx.globalAlpha = 0.3;
    drawCircle(ctx, noseX - 1, noseY - 1, 1.5, '#FFF', null);
    ctx.globalAlpha = 1;
    // Mouth
    ctx.strokeStyle = '#555'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(noseX, noseY + 3);
    ctx.quadraticCurveTo(noseX - 4, noseY + 7, noseX - 6, noseY + 5);
    ctx.stroke();
  }

  // Tongue (dogs, cats, pigs)
  if (!isBird && mouthOpen > 0.15) {
    const ts = mouthOpen * 7;
    const tongueY = (isCat ? 11 : (isPig ? 14 : 12));
    const tongueX = (isCat ? 1 : (isPig ? 1 : 4));
    ctx.beginPath();
    ctx.ellipse(tongueX, tongueY, ts * 0.8, ts * 1.1, 0, 0, Math.PI * 2);
    ctx.fillStyle = c.tongue; ctx.fill();
    ctx.strokeStyle = c.stroke; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tongueX, tongueY - ts * 0.5);
    ctx.lineTo(tongueX, tongueY + ts * 0.7);
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 0.8; ctx.stroke();
  }

  // Blush
  ctx.globalAlpha = 0.35;
  drawEllipse(ctx, eyeLX - 4, eyeY + 9, 5, 3.5, c.blush, null);
  drawEllipse(ctx, eyeRX + 4, eyeY + 9, 5, 3.5, c.blush, null);
  ctx.globalAlpha = 1;

  // Cat forehead stripes
  if (sh.hasStripes && c.stripe) {
    ctx.strokeStyle = c.stripe; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-2, -14); ctx.lineTo(0, -8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(3, -15); ctx.lineTo(4, -9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-6, -13); ctx.lineTo(-4, -8); ctx.stroke();
  }
}

// ===================== Thumbnail / Utility =====================

// ===================== Accessories =====================

const ACCESSORIES = {
  headwear: [
    { id: 'crown', name: '皇冠', icon: '👑' },
    { id: 'party-hat', name: '派对帽', icon: '🎉' },
    { id: 'flower', name: '花环', icon: '🌸' },
    { id: 'cap', name: '鸭舌帽', icon: '🧢' },
    { id: 'ribbon', name: '蝴蝶结', icon: '🎀' },
    { id: 'halo', name: '天使光环', icon: '😇' },
  ],
  glasses: [
    { id: 'sunglasses', name: '墨镜', icon: '🕶️' },
    { id: 'round-glasses', name: '圆眼镜', icon: '👓' },
    { id: 'heart-glasses', name: '爱心眼镜', icon: '💕' },
    { id: 'pixel-glasses', name: '像素眼镜', icon: '🤓' },
  ],
  scarf: [
    { id: 'red-scarf', name: '红围巾', icon: '🧣', color: '#E53935' },
    { id: 'blue-scarf', name: '蓝围巾', icon: '🧣', color: '#1E88E5' },
    { id: 'rainbow-scarf', name: '彩虹围巾', icon: '🌈', color: 'rainbow' },
    { id: 'gold-scarf', name: '金色围巾', icon: '✨', color: '#FFD700' },
  ],
  costume: [
    { id: 'bowtie', name: '领结', icon: '🎩' },
    { id: 'cape', name: '披风', icon: '🦸' },
    { id: 'bandana', name: '三角巾', icon: '🏴‍☠️' },
    { id: 'bell', name: '铃铛项圈', icon: '🔔' },
  ],
  mbti: [
    { id: 'INTJ', name: 'INTJ', icon: 'INTJ', label: '策略家', colors: ['#7C4DFF','#B388FF'] },
    { id: 'INTP', name: 'INTP', icon: 'INTP', label: '逻辑学家', colors: ['#7C4DFF','#CE93D8'] },
    { id: 'ENTJ', name: 'ENTJ', icon: 'ENTJ', label: '指挥官', colors: ['#7C4DFF','#9FA8DA'] },
    { id: 'ENTP', name: 'ENTP', icon: 'ENTP', label: '辩论家', colors: ['#7C4DFF','#80CBC4'] },
    { id: 'INFJ', name: 'INFJ', icon: 'INFJ', label: '提倡者', colors: ['#00C853','#A5D6A7'] },
    { id: 'INFP', name: 'INFP', icon: 'INFP', label: '调停者', colors: ['#00C853','#80CBC4'] },
    { id: 'ENFJ', name: 'ENFJ', icon: 'ENFJ', label: '主人公', colors: ['#00C853','#FFF59D'] },
    { id: 'ENFP', name: 'ENFP', icon: 'ENFP', label: '竞选者', colors: ['#00C853','#FFCC80'] },
    { id: 'ISTJ', name: 'ISTJ', icon: 'ISTJ', label: '物流师', colors: ['#2196F3','#90CAF9'] },
    { id: 'ISFJ', name: 'ISFJ', icon: 'ISFJ', label: '守卫者', colors: ['#2196F3','#80CBC4'] },
    { id: 'ESTJ', name: 'ESTJ', icon: 'ESTJ', label: '总经理', colors: ['#2196F3','#CE93D8'] },
    { id: 'ESFJ', name: 'ESFJ', icon: 'ESFJ', label: '执政官', colors: ['#2196F3','#FFCC80'] },
    { id: 'ISTP', name: 'ISTP', icon: 'ISTP', label: '鉴赏家', colors: ['#FFC107','#FFF59D'] },
    { id: 'ISFP', name: 'ISFP', icon: 'ISFP', label: '探险家', colors: ['#FFC107','#A5D6A7'] },
    { id: 'ESTP', name: 'ESTP', icon: 'ESTP', label: '企业家', colors: ['#FFC107','#FFCC80'] },
    { id: 'ESFP', name: 'ESFP', icon: 'ESFP', label: '表演者', colors: ['#FFC107','#F48FB1'] },
  ],
};

function drawAccessories(ctx, headR, accessories, dir) {
  if (!accessories) return;

  // === HEADWEAR (drawn on top of head) ===
  if (accessories.headwear) {
    const topY = -headR - 2;
    switch (accessories.headwear) {
      case 'crown':
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-12, topY); ctx.lineTo(-14, topY - 14);
        ctx.lineTo(-7, topY - 8); ctx.lineTo(0, topY - 16);
        ctx.lineTo(7, topY - 8); ctx.lineTo(14, topY - 14);
        ctx.lineTo(12, topY); ctx.closePath();
        ctx.fill(); ctx.stroke();
        // Gems
        ctx.fillStyle = '#E53935'; drawCircle(ctx, 0, topY - 6, 2, '#E53935');
        ctx.fillStyle = '#1E88E5'; drawCircle(ctx, -8, topY - 4, 1.5, '#1E88E5');
        ctx.fillStyle = '#1E88E5'; drawCircle(ctx, 8, topY - 4, 1.5, '#1E88E5');
        break;
      case 'party-hat':
        ctx.beginPath();
        ctx.moveTo(0, topY - 20); ctx.lineTo(-10, topY + 2); ctx.lineTo(10, topY + 2);
        ctx.closePath();
        ctx.fillStyle = '#FF6B9D'; ctx.fill();
        ctx.strokeStyle = '#D84C7A'; ctx.lineWidth = 1.5; ctx.stroke();
        // Stripes
        ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(-6, topY - 3); ctx.lineTo(6, topY - 3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-3, topY - 11); ctx.lineTo(3, topY - 11); ctx.stroke();
        // Pom
        drawCircle(ctx, 0, topY - 21, 3, '#FFD700');
        break;
      case 'flower':
        const petalColors = ['#FFB6C1', '#FFD4E8', '#FFC0CB', '#FFB0D0', '#FFDAE8'];
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
          drawCircle(ctx, Math.cos(a) * 7, topY - 6 + Math.sin(a) * 7, 4, petalColors[i]);
        }
        drawCircle(ctx, 0, topY - 6, 3, '#FFE082');
        break;
      case 'cap':
        ctx.fillStyle = '#1565C0';
        ctx.beginPath();
        ctx.ellipse(0, topY + 3, headR + 2, 4, 0, Math.PI, 0);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, topY + 3, headR - 2, Math.PI, 0);
        ctx.fill();
        // Brim
        ctx.beginPath();
        ctx.ellipse(headR - 2, topY + 4, 12, 3, 0.2, 0, Math.PI * 2);
        ctx.fillStyle = '#0D47A1'; ctx.fill();
        break;
      case 'ribbon':
        drawBow(ctx, 0, topY - 2, '#FF69B4', 10);
        break;
      case 'halo':
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(0, topY - 8, 14, 4, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#FFF176';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, topY - 8, 14, 4, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
    }
  }

  // === GLASSES ===
  if (accessories.glasses) {
    const eyeY = -2;
    switch (accessories.glasses) {
      case 'sunglasses':
        ctx.fillStyle = 'rgba(30,30,30,0.85)';
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1.5;
        // Left lens
        ctx.beginPath();
        ctx.roundRect(-15, eyeY - 5, 12, 9, 2);
        ctx.fill(); ctx.stroke();
        // Right lens
        ctx.beginPath();
        ctx.roundRect(3, eyeY - 5, 12, 9, 2);
        ctx.fill(); ctx.stroke();
        // Bridge
        ctx.beginPath(); ctx.moveTo(-3, eyeY); ctx.lineTo(3, eyeY);
        ctx.stroke();
        break;
      case 'round-glasses':
        ctx.strokeStyle = '#8B6914';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(-9, eyeY, 6, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(9, eyeY, 6, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-3, eyeY); ctx.lineTo(3, eyeY); ctx.stroke();
        break;
      case 'heart-glasses':
        ctx.fillStyle = 'rgba(255,80,120,0.7)';
        ctx.strokeStyle = '#E91E63';
        ctx.lineWidth = 1;
        for (const ox of [-9, 9]) {
          ctx.beginPath();
          ctx.moveTo(ox, eyeY + 3);
          ctx.bezierCurveTo(ox - 5, eyeY - 4, ox - 8, eyeY + 1, ox, eyeY + 6);
          ctx.bezierCurveTo(ox + 8, eyeY + 1, ox + 5, eyeY - 4, ox, eyeY + 3);
          ctx.fill(); ctx.stroke();
        }
        ctx.strokeStyle = '#E91E63'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(-3, eyeY + 1); ctx.lineTo(3, eyeY + 1); ctx.stroke();
        break;
      case 'pixel-glasses':
        ctx.fillStyle = '#222';
        // Pixel style (small rectangles)
        for (const ox of [-14, 2]) {
          for (let py = 0; py < 3; py++) {
            for (let px = 0; px < 4; px++) {
              if (py === 1 && (px === 1 || px === 2)) continue; // lens hole
              ctx.fillRect(ox + px * 3, eyeY - 4 + py * 3, 2.5, 2.5);
            }
          }
        }
        ctx.fillRect(-2, eyeY - 1, 4, 2.5); // bridge
        break;
    }
  }

  // === SCARF (around neck area, drawn at bottom of head) ===
  if (accessories.scarf) {
    const scarfItem = ACCESSORIES.scarf.find(s => s.id === accessories.scarf);
    const neckY = headR - 2;
    ctx.save();

    if (scarfItem && scarfItem.color === 'rainbow') {
      const rainbow = ['#E53935', '#FF9800', '#FDD835', '#43A047', '#1E88E5', '#8E24AA'];
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = rainbow[i];
        ctx.fillRect(-14 + i * 5, neckY, 5, 6);
      }
      ctx.strokeStyle = '#666'; ctx.lineWidth = 0.5;
      ctx.strokeRect(-14, neckY, 30, 6);
      // Dangling end
      ctx.fillStyle = '#8E24AA';
      ctx.fillRect(10, neckY, 5, 14);
      ctx.fillStyle = '#E53935';
      ctx.fillRect(12, neckY + 2, 5, 12);
    } else {
      const c = scarfItem ? scarfItem.color : '#E53935';
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.ellipse(0, neckY + 3, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = c === '#FFD700' ? '#DAA520' : '#00000033';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Dangling ends
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(6, neckY + 5); ctx.lineTo(10, neckY + 18);
      ctx.lineTo(14, neckY + 16); ctx.lineTo(8, neckY + 5);
      ctx.fill();
    }
    ctx.restore();
  }

  // === MBTI Badge (floats above head) ===
  if (accessories.mbti) {
    const mbtiItem = ACCESSORIES.mbti.find(m => m.id === accessories.mbti);
    if (mbtiItem) {
      const bx = 0, by = -headR - 22;
      const c1 = mbtiItem.colors[0], c2 = mbtiItem.colors[1];
      // Banner shape
      ctx.save();
      // Counter-flip so text is never mirrored
      if (dir === -1) { ctx.scale(-1, 1); }
      const grad = ctx.createLinearGradient(bx - 18, by, bx + 18, by + 14);
      grad.addColorStop(0, c1); grad.addColorStop(1, c2);
      ctx.fillStyle = grad;
      // Ribbon shape
      ctx.beginPath();
      ctx.moveTo(bx - 20, by + 2);
      ctx.lineTo(bx - 22, by - 2);
      ctx.quadraticCurveTo(bx, by - 8, bx + 22, by - 2);
      ctx.lineTo(bx + 20, by + 2);
      ctx.quadraticCurveTo(bx + 18, by + 10, bx + 14, by + 13);
      ctx.lineTo(bx - 14, by + 13);
      ctx.quadraticCurveTo(bx - 18, by + 10, bx - 20, by + 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Text
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 2;
      ctx.fillText(mbtiItem.id, bx, by + 4);
      ctx.shadowBlur = 0;
      ctx.textAlign = 'start';
      ctx.textBaseline = 'alphabetic';
      ctx.restore();
    }
  }

  // === COSTUME ===
  if (accessories.costume) {
    const neckY = headR - 2;
    switch (accessories.costume) {
      case 'bowtie':
        drawBow(ctx, 0, neckY + 4, '#E53935', 8);
        drawCircle(ctx, 0, neckY + 4, 2.5, '#B71C1C');
        break;
      case 'cape':
        ctx.save();
        ctx.fillStyle = 'rgba(156,39,176,0.7)';
        ctx.beginPath();
        ctx.moveTo(-12, neckY);
        ctx.quadraticCurveTo(-20, neckY + 30, -8, neckY + 38);
        ctx.lineTo(8, neckY + 38);
        ctx.quadraticCurveTo(20, neckY + 30, 12, neckY);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#7B1FA2'; ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();
        break;
      case 'bandana':
        ctx.fillStyle = '#D32F2F';
        ctx.beginPath();
        ctx.moveTo(-14, neckY + 1);
        ctx.lineTo(0, neckY + 12);
        ctx.lineTo(14, neckY + 1);
        ctx.quadraticCurveTo(0, neckY + 5, -14, neckY + 1);
        ctx.fill();
        // Dots
        ctx.fillStyle = '#FFCDD2';
        drawCircle(ctx, -4, neckY + 5, 1.2, '#FFCDD2');
        drawCircle(ctx, 4, neckY + 5, 1.2, '#FFCDD2');
        drawCircle(ctx, 0, neckY + 8, 1.2, '#FFCDD2');
        break;
      case 'bell':
        // Collar
        ctx.strokeStyle = '#D32F2F';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, neckY, 14, 0.2, Math.PI - 0.2);
        ctx.stroke();
        // Bell
        ctx.fillStyle = '#FFD700';
        drawCircle(ctx, 0, neckY + 8, 4, '#FFD700', '#DAA520', 1);
        ctx.fillStyle = '#333';
        ctx.fillRect(-0.5, neckY + 8, 1, 3);
        break;
    }
  }
}

function renderThumbnail(canvas, breed) {
  const ctx = canvas.getContext('2d');
  renderPet(ctx, breed, 'stand', 0, canvas.width);
}

function getBreedById(id) {
  return BREEDS.find(b => b.id === id) || null;
}
