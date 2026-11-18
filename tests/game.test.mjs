import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(import.meta.dirname, '..');

function createSandbox() {
  const storage = new Map();
  const sandbox = {
    console,
    Math,
    Date,
    JSON,
    Map,
    Set,
    Array,
    Object,
    Number,
    String,
    Boolean,
    RegExp,
    Error,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    navigator: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    window: { matchMedia: () => ({ matches: false }) },
    localStorage: {
      getItem: (k) => (storage.has(k) ? storage.get(k) : null),
      setItem: (k, v) => storage.set(k, String(v)),
      removeItem: (k) => storage.delete(k),
      clear: () => storage.clear(),
    },
  };
  sandbox.globalThis = sandbox;
  return vm.createContext(sandbox);
}

function loadScript(ctx, relPath) {
  const fullPath = path.join(ROOT, relPath);
  const code = fs.readFileSync(fullPath, 'utf8');
  // Transform top-level const/let/class into var/global assignments when needed?
  // In vm.runInContext, top-level const/let/class stay in the context lexical scope,
  // which is accessible across subsequent vm.runInContext calls in the same context!
  vm.runInContext(code, ctx, { filename: relPath });
}

test('constants.js loads F1_DRIVERS, F1_POINTS and GEAR_RATIOS correctly', () => {
  const ctx = createSandbox();
  loadScript(ctx, 'js/constants.js');
  const result = vm.runInContext('({ drivers: F1_DRIVERS.length, points: F1_POINTS.length, gears: GEAR_RATIOS.length, totalRacers: TOTAL_RACERS })', ctx);
  assert.equal(result.drivers, 19);
  assert.equal(result.points, 10);
  assert.equal(result.gears, 5);
  assert.equal(result.totalRacers, 20);
});

test('ParticlePool spawns, updates and recycles particles without exceeding pool size', () => {
  const ctx = createSandbox();
  loadScript(ctx, 'js/particles.js');
  const stats = vm.runInContext(`
    const pool = new ParticlePool(3);
    const p1 = pool.spawn(0, 0, 0, 10, 0, 0.5, '#FFF');
    const p2 = pool.spawn(1, 0, 0, 10, 0, 1.0, '#F00');
    const p3 = pool.spawn(2, 0, 0, 10, 0, 1.0, '#0F0');
    const p4 = pool.spawn(3, 0, 0, 10, 0, 1.0, '#00F'); // pool full -> null
    pool.update(0.6); // p1 expires
    const p5 = pool.spawn(4, 0, 0, 10, 0, 1.0, '#FF0'); // reuses slot
    ({ p1: !!p1, p4: p4 === null, p5: !!p5, activeCount: pool.pool.filter(p => p.active).length });
  `, ctx);
  assert.equal(stats.p1, true);
  assert.equal(stats.p4, true);
  assert.equal(stats.p5, true);
  assert.equal(stats.activeCount, 3);
});

test('TrackBuilder builds all 31 tracks cleanly with valid segments and synced map curves', () => {
  const ctx = createSandbox();
  loadScript(ctx, 'js/constants.js');
  loadScript(ctx, 'js/tracks_data.js');
  loadScript(ctx, 'js/tracks.js');
  const report = vm.runInContext(`
    const issues = [];
    for (let i = 0; i < TRACK_DEFINITIONS.length; i++) {
      const def = TRACK_DEFINITIONS[i];
      const built = TrackBuilder.build(def);
      const segs = Array.isArray(built) ? built : built.segments;
      if (!segs || segs.length < 50) {
        issues.push({ id: def.id, count: segs ? segs.length : 0 });
        continue;
      }
      let hasInvalidCurve = false;
      let nonZeroCurves = 0;
      for (const s of segs) {
        if (!Number.isFinite(s.curve) || Math.abs(s.curve) > 4.21) {
          hasInvalidCurve = true;
          break;
        }
        if (s.curve !== 0) nonZeroCurves++;
      }
      if (hasInvalidCurve || nonZeroCurves < 20) {
        issues.push({ id: def.id, hasInvalidCurve, nonZeroCurves });
      }
    }
    ({ totalTracks: TRACK_DEFINITIONS.length, issues });
  `, ctx);
  assert.equal(report.totalTracks, 31);
  assert.equal(report.issues.length, 0, JSON.stringify(report.issues));
});

test('Car transmission and SaveManager work as expected', () => {
  const ctx = createSandbox();
  loadScript(ctx, 'js/constants.js');
  vm.runInContext('const BOT_BODY_COLORS = ["#FF0000", "#00FF00"];', ctx);
  loadScript(ctx, 'js/car.js');
  loadScript(ctx, 'js/save.js');

  const res = vm.runInContext(`
    const car = new Car(1, { maxSpeed: 280, primaryColor: '#FF0000' }, true);
    car.speed = 140;
    car.updateTransmission();
    const gearAtHalf = car.currentGear;
    const rpmAtHalf = car.rpm;

    SaveManager.saveSlot(1, { playerName: 'PILOTO', seasonStage: 5, money: 12000 });
    const loaded = SaveManager.getSlot(1);
    SaveManager.deleteSlot(1);
    const afterDelete = SaveManager.getSlot(1);

    TrackRecords.update('salvador', 48.12, 2);
    TrackRecords.update('salvador', 52.00, 1); // keeps 48.12 bestLap and improves bestRank to 1
    const rec = TrackRecords.get('salvador');

    const careerRes = CareerStats.recordRace({ rank: 1, km: 12.5, isRain: true, startPos: 20, carId: 'fusca', isChampion: false });
    ({ gearAtHalf, rpmAtHalf, loadedName: loaded?.playerName, loadedStage: loaded?.seasonStage, afterDelete, recLap: rec?.bestLap, recRank: rec?.bestRank, careerWins: careerRes.stats.wins, unlockedCount: careerRes.newlyUnlocked.length });
  `, ctx);

  assert.ok(res.gearAtHalf >= 2 && res.gearAtHalf <= 4);
  assert.ok(res.rpmAtHalf > 1000);
  assert.equal(res.loadedName, 'PILOTO');
  assert.equal(res.loadedStage, 5);
  assert.equal(res.afterDelete, null);
  assert.equal(res.recLap, 48.12);
  assert.equal(res.recRank, 1);
  assert.equal(res.careerWins, 1);
  assert.ok(res.unlockedCount >= 4);
});

test('All JS files have valid syntax and renderer mixins attach to LH44RacingGame', () => {
  const jsDir = path.join(ROOT, 'js');
  const files = fs.readdirSync(jsDir).filter((f) => f.endsWith('.js'));
  assert.ok(files.length >= 13);
  for (const file of files) {
    const code = fs.readFileSync(path.join(jsDir, file), 'utf8');
    new vm.Script(code, { filename: `js/${file}` });
  }

  const ctx = createSandbox();
  vm.runInContext('class LH44RacingGame {}', ctx);
  loadScript(ctx, 'js/sky_renderer.js');
  loadScript(ctx, 'js/road_renderer.js');
  loadScript(ctx, 'js/hud_renderer.js');
  loadScript(ctx, 'js/menu_renderer.js');
  const protoCheck = vm.runInContext(`({
    updateEnv: typeof LH44RacingGame.prototype.updateEnv,
    renderSky: typeof LH44RacingGame.prototype.renderSky,
    renderRoad: typeof LH44RacingGame.prototype.renderRoad,
    renderParticles: typeof LH44RacingGame.prototype.renderParticles,
    renderSpeedLines: typeof LH44RacingGame.prototype.renderSpeedLines,
    renderHUD: typeof LH44RacingGame.prototype.renderHUD,
    renderMenu: typeof LH44RacingGame.prototype.renderMenu,
    renderEndingScene: typeof LH44RacingGame.prototype.renderEndingScene
  })`, ctx);
  assert.equal(protoCheck.updateEnv, 'function');
  assert.equal(protoCheck.renderSky, 'function');
  assert.equal(protoCheck.renderRoad, 'function');
  assert.equal(protoCheck.renderParticles, 'function');
  assert.equal(protoCheck.renderSpeedLines, 'function');
  assert.equal(protoCheck.renderHUD, 'function');
  assert.equal(protoCheck.renderMenu, 'function');
  assert.equal(protoCheck.renderEndingScene, 'function');
});
