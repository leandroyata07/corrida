/**
 * LH44 - LOW TO HIGH SPEED
 * Renderização de céu, iluminação e clima dinâmico
 */
(function () {
  class SkyRenderer {
    // ==========================================
    // AMBIENTE: transição suave de horário/clima + rolagem do cenário de fundo pela CURVA
    // ==========================================
    updateEnv(dt) {
      const track = TRACK_DEFINITIONS[this.trackIndex];
      let target, key;
      const isRacing = (this.player && (this.state === 'RACING' || this.state === 'COUNTDOWN' || this.state === 'RESUME_COUNTDOWN'));

      if (this.envCond === 'DINAMICO') {
        if (!this.dynamicPhases || this.dynamicPhases.length === 0) {
          this.initDynamicWeather();
        }
        this.envTime += dt;
        const seg = DYN_HOLD + DYN_BLEND;
        const total = this.dynamicPhases.length * seg;
        const tt = this.envTime % total;
        const i = Math.floor(tt / seg);
        const within = tt - i * seg;
        const condA = this.dynamicPhases[i];
        const condB = this.dynamicPhases[(i + 1) % this.dynamicPhases.length];
        const A = getEnvTarget(track, condA);
        if (within < DYN_HOLD) {
          target = A;
        } else {
          const B = getEnvTarget(track, condB);
          const k = (within - DYN_HOLD) / DYN_BLEND;
          target = lerpEnv(A, B, k * k * (3 - 2 * k));
        }
        key = 'DINAMICO|' + track.id;
      } else if (isRacing) {
        // Transição Dinâmica e Orgânica ao longo das 3 voltas da corrida
        const raceProgress = Math.max(0, Math.min(1.0, (this.player.laps + (this.player.z / Math.max(1, this.track.totalLength))) / TOTAL_LAPS));
        if (this.envCond === 'TARDE') {
          // Pôr do sol (laranja) até o anoitecer gradual com faróis acesos
          const A = getEnvTarget(track, 'TARDE');
          const B = getEnvTarget(track, 'NOITE');
          target = lerpEnv(A, B, raceProgress);
          key = 'TARDE_TO_NOITE|' + track.id;
        } else if (this.envCond === 'CHUVA') {
          // Início de garoa fina transparente aumentando até chuva forte
          const A = getEnvTarget(track, 'DIA');
          const B = getEnvTarget(track, 'CHUVA');
          const drizzleK = 0.22 + raceProgress * 0.78;
          target = lerpEnv(A, B, drizzleK);
          key = 'DRIZZLE_TO_RAIN|' + track.id;
        } else {
          target = getEnvTarget(track, this.envCond);
          key = this.envCond + '|' + track.id;
        }
      } else {
        target = getEnvTarget(track, this.envCond);
        key = this.envCond + '|' + track.id;
      }

      if (key !== this.envKey) {
        this.envFrom = this.envCur || target;
        this.envBlend = this.envCur ? 0 : 1;
        this.envKey = key;
      }
      if (this.envBlend < 1) {
        this.envBlend = Math.min(1, this.envBlend + dt / 0.7);
        const k = this.envBlend * this.envBlend * (3 - 2 * this.envBlend);
        this.envCur = lerpEnv(this.envFrom, target, k);
      } else {
        this.envCur = target;
      }

      const c = this.envCur.css;
      this.segColLight = { road: c.roadLight, grass: c.grassLight, rumble: c.rumbleLight, lane: c.lane };
      this.segColDark = { road: c.roadDark, grass: c.grassDark, rumble: c.rumbleDark, lane: 'transparent' };

      // Silencia e desativa totalmente qualquer aviso de texto na tela durante a corrida
      this.envBanner = null;
    }

    // As montanhas/nuvens só se deslocam quando a estrada CURVA (e não mais com o simples avanço em reta)
    updateSkyScroll(dt) {
      if (!this.track) return;
      let seg = null;
      let segPerSec = 0;
      if (this.state === 'MENU' || this.state === 'MODE_SELECT' || this.state === 'DIFFICULTY_SELECT' || this.state === 'TRACK_SELECT' || this.state === 'CAR_SELECT' || this.state === 'COLOR_SELECT' || this.state === 'RACE_SETUP' || this.state === 'SLOT_SELECT' || this.state === 'SAVE_PROGRESS') {
        seg = this.findSegment(this.menuCameraZ);
        segPerSec = (this.state === 'MENU' ? 1100 : 850) / SEGMENT_LENGTH;
      } else if (this.player && (this.state === 'RACING' || this.state === 'COUNTDOWN')) {
        seg = this.findSegment(this.player.z);
        segPerSec = this.player.speed * 20 / SEGMENT_LENGTH;
      }
      if (seg) this.skyScroll += seg.curve * segPerSec * dt * SKY_PARALLAX_K;
    }

    renderSky(ctx, def) {
      if (!this.envCur) this.updateEnv(0.016);
      const E = this.envCur;
      if (!E) return;
      const css = E.css;
      const S = E.s;
      const isAttract = (this.state === 'MENU' || this.state === 'MODE_SELECT' || this.state === 'DIFFICULTY_SELECT' || this.state === 'TRACK_SELECT' || this.state === 'CAR_SELECT' || this.state === 'COLOR_SELECT' || this.state === 'RACE_SETUP');
      const camZ = isAttract ? this.menuCameraZ : (this.player ? this.wrapZ(this.player.z - PLAYER_Z_OFFSET) : 0);
      const baseSeg = this.findSegment(camZ);
      const curveShift = baseSeg.curve * 2.0;
      const horizonY = INTERNAL_HEIGHT / 2;
      const scroll = this.skyScroll;

      // Se a câmera estiver dentro do túnel, preenche o céu com a abóbada de rocha escura
      // evitando qualquer vazamento ou corte do céu externo no teto!
      if (baseSeg && !!baseSeg.tunnel) {
        const isStone = (baseSeg.tunnel === 'stone') || (def && def.theme === 'SERRA');
        const darkGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
        darkGrad.addColorStop(0, isStone ? '#0D0907' : '#04070D');
        darkGrad.addColorStop(1, isStone ? '#1A1410' : '#0B111A');
        ctx.fillStyle = darkGrad;
        ctx.fillRect(-20, -20, INTERNAL_WIDTH + 40, horizonY + 20);
        return;
      }

      if (typeof MonumentArt !== 'undefined' && MonumentArt.renderSkyLandmark) {
        this.renderSkyBase(ctx, def, horizonY, E, S, curveShift);
        MonumentArt.renderSkyLandmark(ctx, def, scroll, curveShift, horizonY, E, S);
      } else if (def && def.id === 'serra') {
        this.renderSkySerra(ctx, def, scroll, curveShift, horizonY, E, S);
      } else if (def && def.id === 'noite') {
        this.renderSkyNoite(ctx, def, scroll, curveShift, horizonY, E, S);
      } else {
        this.renderSkyBrasil(ctx, def, scroll, curveShift, horizonY, E, S);
      }
    }

    renderSkyBase(ctx, def, horizonY, E, S, curveShift) {
      const nowSec = performance.now() * 0.003;
      const isNight = S.night > 0.28;
      const isDusk = S.dusk > 0.25;

      // 1. Céu dinâmico conforme E.css e E.s
      const grad = ctx.createLinearGradient(0, -20, 0, horizonY);
      grad.addColorStop(0, E.css.skyTop);
      grad.addColorStop(0.45, E.css.skyMid);
      grad.addColorStop(1.0, E.css.skyBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(-20, -20, INTERNAL_WIDTH + 40, horizonY + 20);

      if (isNight) {
        // Microestrelas cintilantes no céu noturno
        for (let s = 8; s < INTERNAL_WIDTH; s += 22) {
          const sx = (s * 19) % INTERNAL_WIDTH;
          const sy = (s * 11) % Math.floor(horizonY * 0.38);
          const tw = 0.35 + 0.65 * Math.abs(Math.sin(nowSec + s));
          ctx.fillStyle = `rgba(240, 248, 255, ${tw.toFixed(2)})`;
          ctx.fillRect(sx, sy, (s % 3 === 0 ? 1.5 : 1), (s % 3 === 0 ? 1.5 : 1));
        }

        // Lua prateada (posicionada na altura do horizonte para passar atrás de montanhas e prédios)
        const moonX = INTERNAL_WIDTH * 0.78 - curveShift * 0.3;
        const moonY = 38;
        const mGlow = ctx.createRadialGradient(moonX, moonY, 4, moonX, moonY, 28);
        mGlow.addColorStop(0, 'rgba(215, 238, 255, 0.45)');
        mGlow.addColorStop(1, 'rgba(180, 220, 255, 0)');
        ctx.fillStyle = mGlow;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.arc(moonX, moonY, 10.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (S.sun > 0.1) {
        // Sol diurno ou crepuscular sobre o circuito (em paralaxe real atrás das montanhas)
        const sunX = INTERNAL_WIDTH * 0.72 - curveShift * 0.35;
        const sunY = Math.max(38, S.sunY || (isDusk ? horizonY - 22 : 42));
        const sSize = S.sunSize || 1.0;
        const sGlow = ctx.createRadialGradient(sunX, sunY, 3, sunX, sunY, 34 * sSize);
        sGlow.addColorStop(0, E.css.sunCore || '#FFFDE7');
        sGlow.addColorStop(0.4, E.css.sunGlow || '#FFEE58');
        sGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = sGlow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 34 * sSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 10.5 * sSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // =========================================================================
    // PISTA 1: BRASIL GP — ORLA COSTEIRA AO PÔR DO SOL (ESTILO EXATO DA IMAGEM!)
    // Céu crepúsculo 4 cores, estrelas, ponte pênsil iluminada, metrópole na baía com reflexos na água e montanhas roxas
    // =========================================================================
    renderSkyBrasil(ctx, def, scroll, curveShift, horizonY, E, S) {
      const nowSec = performance.now() * 0.003;
      const isNight = S.night > 0.28;
      const isDusk = S.dusk > 0.25;

      // 1. Céu dinâmico conforme E.css e E.s
      const grad = ctx.createLinearGradient(0, -20, 0, horizonY);
      grad.addColorStop(0, E.css.skyTop);
      grad.addColorStop(0.45, E.css.skyMid);
      grad.addColorStop(1.0, E.css.skyBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(-20, -20, INTERNAL_WIDTH + 40, horizonY + 20);

      if (isNight) {
        // Microestrelas cintilantes no céu noturno
        for (let s = 8; s < INTERNAL_WIDTH; s += 22) {
          const sx = (s * 19) % INTERNAL_WIDTH;
          const sy = (s * 11) % Math.floor(horizonY * 0.38);
          const tw = 0.35 + 0.65 * Math.abs(Math.sin(nowSec + s));
          ctx.fillStyle = `rgba(240, 248, 255, ${tw.toFixed(2)})`;
          ctx.fillRect(sx, sy, (s % 3 === 0 ? 1.5 : 1), (s % 3 === 0 ? 1.5 : 1));
        }

        // Lua prateada
        const moonX = INTERNAL_WIDTH * 0.80 - curveShift * 0.3;
        const moonY = 24;
        const mGlow = ctx.createRadialGradient(moonX, moonY, 4, moonX, moonY, 28);
        mGlow.addColorStop(0, 'rgba(215, 238, 255, 0.45)');
        mGlow.addColorStop(1, 'rgba(180, 220, 255, 0)');
        ctx.fillStyle = mGlow;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.arc(moonX, moonY, 11, 0, Math.PI * 2);
        ctx.fill();
      } else if (S.sun > 0.1) {
        // Sol diurno ou crepuscular sobre a orla
        const sunX = INTERNAL_WIDTH * 0.72 - curveShift * 0.35;
        const sunY = S.sunY || (isDusk ? horizonY - 14 : 26);
        const sSize = S.sunSize || 1.0;
        const sGlow = ctx.createRadialGradient(sunX, sunY, 3, sunX, sunY, 38 * sSize);
        sGlow.addColorStop(0, E.css.sunCore || '#FFFDE7');
        sGlow.addColorStop(0.4, E.css.sunGlow || '#FFEE58');
        sGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = sGlow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 38 * sSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 11 * sSize, 0, Math.PI * 2);
        ctx.fill();

        // Nuvens suaves
        ctx.fillStyle = isDusk ? 'rgba(255, 170, 80, 0.30)' : 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.ellipse(sunX - 45, sunY - 4, 34, 6, 0, 0, Math.PI * 2);
        ctx.ellipse(sunX - 35, sunY - 8, 22, 9, 0, 0, Math.PI * 2);
        ctx.ellipse(sunX + 50, sunY + 6, 42, 7, 0, 0, Math.PI * 2);
        ctx.ellipse(sunX + 60, sunY + 3, 26, 10, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // =========================================================================
      // CAMADA 1 (PARALLAX DISTANTE - FATOR 0.16): PONTE PÊNSIL, METRÓPOLE & BAÍA
      // =========================================================================
      const PW = 640;
      const farShift = ((scroll * 0.16 + curveShift * 0.3) % PW + PW) % PW;

      ctx.save();
      for (let tile = -1; tile <= 1; tile++) {
        const bx = tile * PW - farShift;
        if (bx + PW < -40 || bx > INTERNAL_WIDTH + 40) continue;

        // --- A. PONTE PÊNSIL (à esquerda da baía, bx + 30 até bx + 225) ---
        const bBridgeStart = bx + 30;
        const bBridgeEnd = bx + 225;
        const t1X = bx + 85;
        const t2X = bx + 170;
        const towerTopY = horizonY - 54;
        const deckY = horizonY - 18;

        // Duas torres de suspensão com treliças
        const drawTower = (tx) => {
          ctx.fillStyle = isNight ? '#2A1820' : (isDusk ? '#6E1C27' : '#D32F2F');
          ctx.fillRect(tx - 3, towerTopY, 6, deckY - towerTopY + 4);
          ctx.fillStyle = isNight ? '#44222E' : (isDusk ? '#8B2635' : '#EF5350');
          ctx.fillRect(tx - 1.5, towerTopY, 3, deckY - towerTopY + 4);
          // Travessas horizontais da torre
          ctx.fillStyle = isNight ? '#1A0E14' : (isDusk ? '#4A121A' : '#B71C1C');
          ctx.fillRect(tx - 4, towerTopY + 12, 8, 2);
          ctx.fillRect(tx - 4, towerTopY + 24, 8, 2);
          ctx.fillRect(tx - 4, towerTopY + 34, 8, 2);
          // Luz de topo
          ctx.fillStyle = isNight ? '#FFE082' : (isDusk ? '#FFE082' : '#FFF9C4');
          ctx.fillRect(tx - 1, towerTopY - 2, 2, 2);
        };
        drawTower(t1X);
        drawTower(t2X);

        // Cabo mestre de sustentação (catenária)
        ctx.strokeStyle = isNight ? '#351820' : (isDusk ? '#5A1822' : '#B71C1C');
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(bBridgeStart, deckY);
        ctx.lineTo(t1X, towerTopY);
        ctx.quadraticCurveTo((t1X + t2X) * 0.5, deckY - 6, t2X, towerTopY);
        ctx.lineTo(bBridgeEnd, deckY);
        ctx.stroke();

        // Tirantes verticais
        ctx.strokeStyle = isNight ? 'rgba(230, 180, 170, 0.25)' : (isDusk ? 'rgba(230, 180, 170, 0.45)' : 'rgba(255, 255, 255, 0.65)');
        ctx.lineWidth = 0.8;
        for (let hx = bBridgeStart + 6; hx < bBridgeEnd; hx += 7) {
          let topWireY = deckY;
          if (hx < t1X) {
            topWireY = deckY + (towerTopY - deckY) * ((hx - bBridgeStart) / (t1X - bBridgeStart));
          } else if (hx < t2X) {
            const f = (hx - t1X) / (t2X - t1X);
            topWireY = towerTopY + (deckY - 6 - towerTopY) * 4 * f * (1 - f);
          } else {
            topWireY = towerTopY + (deckY - towerTopY) * ((hx - t2X) / (bBridgeEnd - t2X));
          }
          ctx.beginPath();
          ctx.moveTo(hx, topWireY);
          ctx.lineTo(hx, deckY);
          ctx.stroke();
        }

        // Tabuleiro da ponte e tráfego iluminado
        ctx.fillStyle = isNight ? '#161324' : (isDusk ? '#3A141A' : '#37474F');
        ctx.fillRect(bBridgeStart - 5, deckY, (bBridgeEnd - bBridgeStart) + 10, 3);
        ctx.fillStyle = isNight ? '#FFE082' : (isDusk ? '#FFD166' : '#ECEFF1');
        for (let tx = bBridgeStart; tx < bBridgeEnd; tx += 9) {
          ctx.fillRect(tx, deckY + 0.5, 2, 1);
        }

        // --- B. METRÓPOLE DE ARRANHA-CÉUS (bx + 210 até bx + 630) ---
        const bldgs = [
          { x: 215, w: 16, h: 42, style: 'spire' },
          { x: 233, w: 14, h: 32, style: 'flat' },
          { x: 249, w: 22, h: 56, style: 'stepped' },
          { x: 273, w: 18, h: 38, style: 'flat' },
          { x: 293, w: 15, h: 48, style: 'spire' },
          { x: 310, w: 20, h: 62, style: 'sloped' },
          { x: 332, w: 17, h: 36, style: 'flat' },
          { x: 351, w: 26, h: 68, style: 'spire' }, // Edifício mais alto estilo Willis / Empire
          { x: 379, w: 19, h: 44, style: 'stepped' },
          { x: 400, w: 16, h: 52, style: 'flat' },
          { x: 418, w: 24, h: 64, style: 'spire' },
          { x: 444, w: 17, h: 40, style: 'sloped' },
          { x: 463, w: 22, h: 58, style: 'stepped' },
          { x: 487, w: 18, h: 46, style: 'flat' },
          { x: 507, w: 15, h: 38, style: 'spire' },
          { x: 524, w: 24, h: 60, style: 'sloped' },
          { x: 550, w: 18, h: 48, style: 'stepped' },
          { x: 570, w: 22, h: 54, style: 'spire' },
          { x: 594, w: 16, h: 36, style: 'flat' },
          { x: 612, w: 18, h: 42, style: 'flat' }
        ];

        for (let b = 0; b < bldgs.length; b++) {
          const bd = bldgs[b];
          const bX = bx + bd.x;
          const bY = horizonY - 12 - bd.h;
          const bW = bd.w;
          const bH = bd.h;

          // Silhueta do prédio adaptativa
          if (isNight) {
            ctx.fillStyle = (b % 2 === 0) ? '#1E1A38' : '#2A234A';
          } else if (isDusk) {
            ctx.fillStyle = (b % 2 === 0) ? '#2B1E32' : '#3E2A48';
          } else {
            ctx.fillStyle = (b % 2 === 0) ? '#2B3D52' : '#394E66';
          }
          ctx.fillRect(bX, bY, bW, bH);
          ctx.fillStyle = isNight ? '#15122B' : (isDusk ? '#1D1424' : '#1F2C3B');
          ctx.fillRect(bX + bW - 2, bY, 2, bH);

          // Topos estilizados
          if (bd.style === 'spire') {
            ctx.fillStyle = isNight ? '#15122B' : '#1F2C3B';
            ctx.fillRect(bX + bW * 0.5 - 1, bY - 10, 2, 10);
            const beaconLit = (Math.sin(nowSec * 7 + b) > 0);
            ctx.fillStyle = beaconLit ? '#FF1744' : '#5A1122';
            ctx.fillRect(bX + bW * 0.5 - 1, bY - 11, 2, 2);
          } else if (bd.style === 'stepped') {
            ctx.fillStyle = isNight ? '#2A234A' : '#394E66';
            ctx.fillRect(bX + 3, bY - 4, bW - 6, 4);
          } else if (bd.style === 'sloped') {
            ctx.fillStyle = isNight ? '#2A234A' : '#394E66';
            ctx.beginPath();
            ctx.moveTo(bX, bY);
            ctx.lineTo(bX + bW, bY - 5);
            ctx.lineTo(bX + bW, bY);
            ctx.closePath();
            ctx.fill();
          }

          // Janelas iluminadas (amarelo quente, âmbar e ciano) ou reflexos diurnos
          for (let wy = bY + 4; wy < horizonY - 16; wy += 4) {
            for (let wx = bX + 2; wx < bX + bW - 3; wx += 4) {
              const seed = (wx * 13 + wy * 17 + b * 23);
              if (seed % 3 !== 0) {
                if (isNight || isDusk) {
                  const isCyan = (seed % 7 === 0);
                  const isAmber = (seed % 5 === 0);
                  ctx.fillStyle = isCyan ? '#80DEEA' : (isAmber ? '#FFB74D' : '#FFE082');
                } else {
                  ctx.fillStyle = (seed % 4 === 0) ? '#B2EBF2' : '#E0F7FA';
                }
                ctx.fillRect(wx, wy, 2, 2);
              }
            }
          }
        }

        // --- C. ÁGUA DA BAÍA COM REFLEXOS CINTILANTES (horizonY - 12 até horizonY) ---
        ctx.fillStyle = isNight ? '#0C1322' : (isDusk ? '#241F44' : '#1976D2');
        ctx.fillRect(bx, horizonY - 12, PW, 12);

        // Ondas de reflexo
        for (let rx = bx + 20; rx < bx + PW - 10; rx += 7) {
          const wavePhase = Math.sin(nowSec * 4 + rx * 0.12);
          const rw = 5 + Math.abs(wavePhase) * 4;
          const ry = horizonY - 10 + ((rx * 7) % 9);
          if (isNight) {
            ctx.fillStyle = '#38BDF8';
          } else if (isDusk) {
            ctx.fillStyle = (rx % 2 === 0) ? '#E77A42' : '#F4A258';
          } else {
            ctx.fillStyle = (rx % 2 === 0) ? '#64B5F6' : '#90CAF9';
          }
          ctx.fillRect(rx + wavePhase * 1.5, ry, rw, 1);
        }
      }
      ctx.restore();

      // =========================================================================
      // CAMADA 2 (PARALLAX MÉDIO - FATOR 0.38): CORDILHEIRA DE MONTANHAS
      // =========================================================================
      const midShift = ((scroll * 0.38 + curveShift * 0.6) % 640 + 640) % 640;
      ctx.fillStyle = isNight ? '#0B101E' : (isDusk ? '#1C1635' : '#1B5E20');
      ctx.beginPath();
      ctx.moveTo(-20, horizonY);
      for (let x = -40; x <= INTERNAL_WIDTH + 40; x += 14) {
        const mx = x + midShift;
        const peak = Math.sin(mx * 0.016) * 18 + Math.cos(mx * 0.038) * 8 + 12;
        ctx.lineTo(x, horizonY - peak);
      }
      ctx.lineTo(INTERNAL_WIDTH + 20, horizonY);
      ctx.closePath();
      ctx.fill();

      // Encostas frontais sombreadas
      ctx.fillStyle = isNight ? '#11182B' : (isDusk ? '#2A2046' : '#2E7D32');
      ctx.beginPath();
      ctx.moveTo(-20, horizonY);
      for (let x = -40; x <= INTERNAL_WIDTH + 40; x += 14) {
        const mx = x + midShift;
        const peak = Math.sin(mx * 0.016 + 1.2) * 12 + 8;
        ctx.lineTo(x, horizonY - peak);
      }
      ctx.lineTo(INTERNAL_WIDTH + 20, horizonY);
      ctx.closePath();
      ctx.fill();

      // =========================================================================
      // CAMADA 3 (PARALLAX PRÓXIMO - FATOR 0.68): LINHA DE PALMEIRAS E VEGETAÇÃO
      // =========================================================================
      const nearShift = ((scroll * 0.68 + curveShift * 0.9) % 480 + 480) % 480;
      ctx.fillStyle = isNight ? '#060A14' : (isDusk ? '#0C1613' : '#0D3315');
      ctx.beginPath();
      ctx.moveTo(-20, horizonY);
      for (let x = -30; x <= INTERNAL_WIDTH + 30; x += 8) {
        const nx = x + nearShift;
        const bump = Math.cos(nx * 0.045) * 5 + Math.sin(nx * 0.12) * 3 + 6;
        ctx.lineTo(x, horizonY - bump);
      }
      ctx.lineTo(INTERNAL_WIDTH + 20, horizonY);
      ctx.closePath();
      ctx.fill();
    }

    // =========================================================================
    // PISTA 2: SERRA BRASILEIRA — PICOS ALPINOS E FLORESTA DE ARAUCÁRIAS
    // Adaptável ao clima: dia azul, pôr do sol dourado ou noite estrelada
    // =========================================================================
    renderSkySerra(ctx, def, scroll, curveShift, horizonY, E, S) {
      const nowSec = performance.now() * 0.003;
      const isNight = S.night > 0.28;
      const isDusk = S.dusk > 0.25;

      // 1. Céu dinâmico conforme E.css e E.s
      const grad = ctx.createLinearGradient(0, -20, 0, horizonY);
      grad.addColorStop(0, E.css.skyTop);
      grad.addColorStop(0.45, E.css.skyMid);
      grad.addColorStop(1.0, E.css.skyBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(-20, -20, INTERNAL_WIDTH + 40, horizonY + 20);

      // Sol ou Lua conforme clima/horário
      if (isNight) {
        // Microestrelas cintilantes no céu límpido de serra
        for (let s = 10; s < INTERNAL_WIDTH; s += 24) {
          const sx = (s * 17) % INTERNAL_WIDTH;
          const sy = (s * 9) % Math.floor(horizonY * 0.40);
          const tw = 0.35 + 0.65 * Math.abs(Math.sin(nowSec + s));
          ctx.fillStyle = `rgba(240, 248, 255, ${tw.toFixed(2)})`;
          ctx.fillRect(sx, sy, 1.2, 1.2);
        }
        // Lua cheia de serra com halo prateado
        const moonX = INTERNAL_WIDTH * 0.74 - curveShift * 0.3;
        const moonY = 24;
        const mGlow = ctx.createRadialGradient(moonX, moonY, 3, moonX, moonY, 32);
        mGlow.addColorStop(0, 'rgba(215, 238, 255, 0.45)');
        mGlow.addColorStop(1, 'rgba(180, 220, 255, 0)');
        ctx.fillStyle = mGlow;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.arc(moonX, moonY, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#CBD5E1';
        ctx.beginPath();
        ctx.arc(moonX - 3.5, moonY - 3, 2.5, 0, Math.PI * 2);
        ctx.arc(moonX + 3.0, moonY + 4, 3.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (S.sun > 0.1) {
        // Sol diurno ou poente
        const sunX = INTERNAL_WIDTH * 0.72 - curveShift * 0.35;
        const sunY = S.sunY || (isDusk ? horizonY - 14 : 26);
        const sSize = S.sunSize || 1.0;
        const sGlow = ctx.createRadialGradient(sunX, sunY, 3, sunX, sunY, 44 * sSize);
        sGlow.addColorStop(0, E.css.sunCore || 'rgba(255, 246, 208, 0.95)');
        sGlow.addColorStop(0.35, E.css.sunGlow || 'rgba(255, 123, 37, 0.40)');
        sGlow.addColorStop(1, 'rgba(255, 80, 20, 0)');
        ctx.fillStyle = sGlow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 44 * sSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isDusk ? '#FFF8E1' : '#FFFFFF';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 13 * sSize, 0, Math.PI * 2);
        ctx.fill();

        // Nuvens horizontais de serra
        ctx.fillStyle = isDusk ? 'rgba(255, 170, 80, 0.32)' : 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.ellipse(sunX - 35, sunY + 4, 42, 4.5, 0, 0, Math.PI * 2);
        ctx.ellipse(sunX + 32, sunY - 2, 46, 4.0, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Paletas das montanhas conforme clima/horário
      const farPeakCol = isNight ? '#161324' : (isDusk ? '#38131E' : '#2A4B58');
      const ridgeCol   = isNight ? '#251E36' : (isDusk ? '#7D2E42' : '#467182');
      const slopeCol   = isNight ? '#121C18' : (isDusk ? '#251A24' : '#1D5A3A');
      const pineCol    = isNight ? '#0A120E' : (isDusk ? '#121C16' : '#133D24');

      // Camada 1: Picos escarpados e agulhas de pedra (Parallax Lento 0.16)
      const farShift = ((scroll * 0.16 + curveShift * 0.3) % 640 + 640) % 640;
      ctx.fillStyle = farPeakCol;
      ctx.beginPath();
      ctx.moveTo(-20, horizonY);
      for (let x = -40; x <= INTERNAL_WIDTH + 40; x += 16) {
        const fx = x + farShift;
        const peak = Math.abs(Math.sin(fx * 0.018)) * 34 + Math.sin(fx * 0.045) * 12 + 14;
        ctx.lineTo(x, horizonY - peak);
      }
      ctx.lineTo(INTERNAL_WIDTH + 20, horizonY);
      ctx.closePath();
      ctx.fill();

      // Cristas rochosas iluminadas
      ctx.fillStyle = ridgeCol;
      ctx.beginPath();
      ctx.moveTo(-20, horizonY);
      for (let x = -40; x <= INTERNAL_WIDTH + 40; x += 16) {
        const fx = x + farShift;
        const peak = Math.abs(Math.sin(fx * 0.018 + 0.3)) * 22 + 10;
        ctx.lineTo(x, horizonY - peak);
      }
      ctx.lineTo(INTERNAL_WIDTH + 20, horizonY);
      ctx.closePath();
      ctx.fill();

      // Camada 2: Encostas florestadas de pinhais (Parallax Médio 0.40)
      const midShift = ((scroll * 0.40 + curveShift * 0.6) % 540 + 540) % 540;
      ctx.fillStyle = slopeCol;
      ctx.beginPath();
      ctx.moveTo(-20, horizonY);
      for (let x = -30; x <= INTERNAL_WIDTH + 30; x += 12) {
        const mx = x + midShift;
        const ridge = Math.cos(mx * 0.032) * 14 + 11;
        ctx.lineTo(x, horizonY - ridge);
      }
      ctx.lineTo(INTERNAL_WIDTH + 20, horizonY);
      ctx.closePath();
      ctx.fill();

      // Camada 3: Silhuetas de Araucárias e Pinheiros no horizonte (Parallax Próximo 0.70)
      const nearShift = ((scroll * 0.70 + curveShift * 0.9) % 480 + 480) % 480;
      ctx.fillStyle = pineCol;
      ctx.beginPath();
      ctx.moveTo(-20, horizonY);
      for (let x = -20; x <= INTERNAL_WIDTH + 20; x += 6) {
        const nx = x + nearShift;
        const isAraucaria = (Math.floor(nx / 16) % 3 === 0);
        const h = isAraucaria ? (12 + (nx % 5)) : (6 + (nx % 3));
        ctx.lineTo(x, horizonY - h);
      }
      ctx.lineTo(INTERNAL_WIDTH + 20, horizonY);
      ctx.closePath();
      ctx.fill();
    }

    // =========================================================================
    // PISTA 3: CIDADE METRÓPOLE — ARRANHA-CÉUS MODERNOS E VIADUTOS EXPRESSOS
    // Totalmente adaptável ao clima: dia ensolarado, crepúsculo ou noite iluminada
    // =========================================================================
    renderSkyNoite(ctx, def, scroll, curveShift, horizonY, E, S) {
      const nowSec = performance.now() * 0.003;
      const isNight = S.night > 0.28;
      const isDusk = S.dusk > 0.25;

      // 1. Céu dinâmico conforme E.css e E.s
      const grad = ctx.createLinearGradient(0, -20, 0, horizonY);
      grad.addColorStop(0, E.css.skyTop);
      grad.addColorStop(0.45, E.css.skyMid);
      grad.addColorStop(1.0, E.css.skyBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(-20, -20, INTERNAL_WIDTH + 40, horizonY + 20);

      // Elementos celestes: Sol ou Lua
      if (isNight) {
        // Céu estrelado
        for (let s = 10; s < INTERNAL_WIDTH; s += 20) {
          const sx = (s * 17) % INTERNAL_WIDTH;
          const sy = (s * 9) % Math.floor(horizonY * 0.42);
          const tw = 0.45 + 0.55 * Math.abs(Math.sin(nowSec * 1.5 + s));
          ctx.fillStyle = `rgba(220, 240, 255, ${tw.toFixed(2)})`;
          ctx.fillRect(sx, sy, 1.2, 1.2);
        }

        // Lua prateada com halo
        const moonX = INTERNAL_WIDTH * 0.82 - curveShift * 0.3;
        const moonY = 24;
        const mGlow = ctx.createRadialGradient(moonX, moonY, 4, moonX, moonY, 32);
        mGlow.addColorStop(0, 'rgba(215, 238, 255, 0.45)');
        mGlow.addColorStop(1, 'rgba(180, 220, 255, 0)');
        ctx.fillStyle = mGlow;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.arc(moonX, moonY, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#CBD5E1';
        ctx.beginPath();
        ctx.arc(moonX - 3.5, moonY - 3, 2.5, 0, Math.PI * 2);
        ctx.arc(moonX + 3.0, moonY + 4, 3.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (S.sun > 0.1) {
        // Sol de metrópole e nuvens
        const sunX = INTERNAL_WIDTH * 0.75 - curveShift * 0.32;
        const sunY = S.sunY || (isDusk ? horizonY - 14 : 26);
        const sSize = S.sunSize || 1.0;
        const sGlow = ctx.createRadialGradient(sunX, sunY, 3, sunX, sunY, 42 * sSize);
        sGlow.addColorStop(0, E.css.sunCore || '#FFFDE7');
        sGlow.addColorStop(0.4, E.css.sunGlow || '#FFEE58');
        sGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = sGlow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 42 * sSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 12 * sSize, 0, Math.PI * 2);
        ctx.fill();

        // Nuvens urbanas suaves
        ctx.fillStyle = isDusk ? 'rgba(255, 170, 80, 0.30)' : 'rgba(255, 255, 255, 0.48)';
        ctx.beginPath();
        ctx.ellipse(sunX - 42, sunY - 4, 36, 6, 0, 0, Math.PI * 2);
        ctx.ellipse(sunX - 32, sunY - 8, 22, 9, 0, 0, Math.PI * 2);
        ctx.ellipse(sunX + 48, sunY + 5, 40, 7, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Megalópole com arranha-céus e viaduto expresso
      // Parallax Lento 0.16
      const PW = 640;
      const farShift = ((scroll * 0.16 + curveShift * 0.3) % PW + PW) % PW;

      ctx.save();
      for (let tile = -1; tile <= 1; tile++) {
        const bx = tile * PW - farShift;
        if (bx + PW < -40 || bx > INTERNAL_WIDTH + 40) continue;

        // Fileira de 26 arranha-céus futuristas
        for (let b = 0; b < 26; b++) {
          const bX = bx + b * 24;
          const seed = (b * 19) % 31;
          const bH = 36 + seed * 1.5;
          const bY = horizonY - bH;

          // Cores dos edifícios conforme dia/noite
          if (isNight) {
            ctx.fillStyle = (b % 2 === 0) ? '#0D1424' : '#141D34';
          } else if (isDusk) {
            ctx.fillStyle = (b % 2 === 0) ? '#2B1A28' : '#3E2436';
          } else {
            ctx.fillStyle = (b % 2 === 0) ? '#243B53' : '#334E68';
          }
          ctx.fillRect(bX, bY, 22, bH);

          // Sombra lateral/perspectiva
          ctx.fillStyle = isNight ? '#080C16' : (isDusk ? '#1A0F18' : '#102A43');
          ctx.fillRect(bX + 20, bY, 2, bH);

          // Faixas verticais decorativas / neon
          if (isNight) {
            if (b % 4 === 0) {
              ctx.fillStyle = '#FF007F';
              ctx.fillRect(bX + 2, bY + 2, 2, bH - 6);
            } else if (b % 4 === 2) {
              ctx.fillStyle = '#00F0FF';
              ctx.fillRect(bX + 18, bY + 2, 2, bH - 6);
            }
          } else if (!isNight && !isDusk) {
            // Vidros reflexivos diurnos
            if (b % 3 === 0) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
              ctx.fillRect(bX + 2, bY + 2, 3, bH - 4);
            }
          }

          // Janelas iluminadas (noturnas ou reflexivas diurnas)
          for (let wy = bY + 4; wy < horizonY - 10; wy += 4) {
            for (let wx = bX + 5; wx < bX + 18; wx += 4) {
              if ((wx * 11 + wy * 13 + b) % 3 !== 0) {
                if (isNight) {
                  ctx.fillStyle = (b % 3 === 0) ? '#00E5FF' : '#FFE082';
                } else if (isDusk) {
                  ctx.fillStyle = (b % 3 === 0) ? '#FF9E80' : '#FFE082';
                } else {
                  // Dia: reflexo suave das janelas de vidro
                  ctx.fillStyle = (b % 2 === 0) ? '#9FB3C8' : '#D9E2EC';
                }
                ctx.fillRect(wx, wy, 2, 2);
              }
            }
          }

          // Antena com sinalizador de topo
          if (b % 3 === 1) {
            ctx.fillStyle = isNight ? '#080C16' : '#627D98';
            ctx.fillRect(bX + 10, bY - 8, 2, 8);
            ctx.fillStyle = (Math.sin(nowSec * 8 + b) > 0) ? '#FF1744' : (isNight ? '#4A0D15' : '#D32F2F');
            ctx.fillRect(bX + 10, bY - 9, 2, 2);
          }
        }

        // Viaduto expresso no rodapé dos edifícios (conectado suavemente ao horizonte)
        const vY = horizonY - 8;
        ctx.fillStyle = isNight ? '#0B1120' : (isDusk ? '#201625' : '#1F2937');
        ctx.fillRect(bx, vY, PW, 8);
        ctx.fillStyle = isNight ? '#1E293B' : (isDusk ? '#3D2F44' : '#4B5563');
        ctx.fillRect(bx, vY, PW, 1.5); // Guarda-corpo superior

        // Fluxo contínuo de tráfego veicular sobre o viaduto
        for (let tx = bx; tx < bx + PW; tx += 14) {
          if (isNight || isDusk) {
            ctx.fillStyle = '#FF2D55'; // Lanternas vermelhas
            ctx.fillRect(tx, vY + 3, 3, 1.5);
            ctx.fillStyle = '#FFF9D2'; // Faróis brancos/dourados no fluxo oposto
            ctx.fillRect(tx + 7, vY + 3, 3, 1.5);
          } else {
            // Dia: pequenos carros em movimento no viaduto
            ctx.fillStyle = (tx % 3 === 0) ? '#DC2626' : ((tx % 3 === 1) ? '#2563EB' : '#F3F4F6');
            ctx.fillRect(tx, vY + 2, 4, 2);
          }
        }
      }
      ctx.restore();
    }

    // Efeitos de clima por cima de toda a cena (antes do HUD): luz, chuva, neve e brilho do sol
    renderWeatherFx(ctx) {
      const E = this.envCur;
      if (!E) return;
      const S = E.s;
      const W = INTERNAL_WIDTH;
      const H = INTERNAL_HEIGHT;
      const t = performance.now() / 1000;
      ctx.save();

      if (S.night > 0.02) {
        ctx.fillStyle = `rgba(6, 10, 40, ${(0.30 * S.night).toFixed(3)})`;
        ctx.fillRect(0, 0, W, H);
      }
      if (S.dusk > 0.02) {
        ctx.fillStyle = `rgba(255, 110, 30, ${(0.09 * S.dusk).toFixed(3)})`;
        ctx.fillRect(0, 0, W, H);
      }
      if (S.rain > 0.02) {
        ctx.fillStyle = `rgba(30, 42, 58, ${(0.20 * S.rain).toFixed(3)})`;
        ctx.fillRect(0, 0, W, H);
        const n = Math.floor(120 * S.rain);
        ctx.strokeStyle = `rgba(205, 225, 245, ${(0.50 * S.rain).toFixed(2)})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const x = ((i * 53.13 + t * 95) % (W + 40)) - 20;
          const y = ((i * 97.37 + t * (430 + (i % 5) * 45)) % (H + 30)) - 15;
          ctx.moveTo(x, y);
          ctx.lineTo(x - 2.6, y + 10.5);
        }
        ctx.stroke();
      }
      if (S.snow > 0.02) {
        ctx.fillStyle = `rgba(235, 242, 255, ${(0.10 * S.snow).toFixed(3)})`;
        ctx.fillRect(0, 0, W, H);
        const n = Math.floor(95 * S.snow);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
        for (let i = 0; i < n; i++) {
          const x = ((i * 61.7 + t * 14 + Math.sin(t * 0.9 + i) * 9) % (W + 20) + (W + 20)) % (W + 20) - 10;
          const y = ((i * 83.3 + t * (32 + (i % 4) * 11)) % (H + 10)) - 5;
          ctx.beginPath();
          ctx.arc(x, y, 0.7 + (i % 3) * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (S.glare > 0.02 && S.sun > 0.1) {
        const gx = W * 0.74;
        const gy = S.sunY;
        const gg = ctx.createRadialGradient(gx, gy, 6, gx, gy, 170);
        gg.addColorStop(0, `rgba(255, 246, 200, ${(0.30 * S.glare * S.sun).toFixed(3)})`);
        gg.addColorStop(1, 'rgba(255, 246, 200, 0)');
        ctx.fillStyle = gg;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = `rgba(255, 238, 175, ${(0.05 * S.glare).toFixed(3)})`;
        ctx.fillRect(0, 0, W, H);
      }
      ctx.restore();
    }


  }
  const descs = Object.getOwnPropertyDescriptors(SkyRenderer.prototype);
  delete descs.constructor;
  Object.defineProperties(LH44RacingGame.prototype, descs);
})();
