/**
 * LH44 - LOW TO HIGH SPEED
 * Renderização de pista 2.5D, cenários e partículas
 */
(function () {
  class RoadRenderer {
    renderRoad(ctx, def) {
      const isAttract = (this.state === 'MENU' || this.state === 'MODE_SELECT' || this.state === 'DIFFICULTY_SELECT' || this.state === 'TRACK_SELECT' || this.state === 'CAR_SELECT' || this.state === 'COLOR_SELECT');
      const p = isAttract ? { z: this.menuCameraZ, x: 0 } : (this.player || { z: 1600, x: 0 });
      const playerZ = this.wrapZ(p.z);
      // Quando o nosso carro bandeirou, a câmera PARA exatamente no local da bandeirada:
      const camOriginZ = this.finishingRace
        ? this.finishCamOriginZ
        : (isAttract ? playerZ : this.wrapZ(playerZ - PLAYER_Z_OFFSET));

      const baseSegment = this.findSegment(camOriginZ);
      const basePercent = (camOriginZ % SEGMENT_LENGTH) / SEGMENT_LENGTH;

      const refSeg = this.findSegment(playerZ);
      const refPercent = (playerZ % SEGMENT_LENGTH) / SEGMENT_LENGTH;
      const playerWorldY = (1 - refPercent) * refSeg.p1.world.y + refPercent * refSeg.p2.world.y;

      let dx = -(baseSegment.curve * basePercent);
      let x = 0;
      let maxY = INTERNAL_HEIGHT;
      if (!this.foregroundBots) this.foregroundBots = [];
      else this.foregroundBots.length = 0;

      const totalSegs = this.track.segments.length;
      for (let n = 0; n < DRAW_DISTANCE; n++) {
        const seg = this.track.segments[(baseSegment.index + n) % totalSegs];
        if (!seg.cars) seg.cars = [];
        else seg.cars.length = 0;
        seg.clipY = INTERNAL_HEIGHT;
      }

      if (!isAttract) {
        for (let i = 0; i < this.cars.length; i++) {
          const car = this.cars[i];
          if (car.isPlayer) continue;

          const carZ = this.wrapZ(car.z);
          const relCamZ = (carZ >= camOriginZ) ? (carZ - camOriginZ) : (this.track.totalLength - camOriginZ + carZ);
          if (relCamZ >= 150 && relCamZ < DRAW_DISTANCE * SEGMENT_LENGTH) {
            const carSeg = this.findSegment(carZ);
            car.renderRelCamZ = relCamZ;
            car.renderPct = (carZ % SEGMENT_LENGTH) / SEGMENT_LENGTH;
            if (!carSeg.cars) carSeg.cars = [];
            carSeg.cars.push(car);
          }
        }
      }

      const spd = (!isAttract && this.player) ? this.player.speed : 0;
      const normalMax = this.getEffectiveMaxSpeed(this.player);
      const overspeedRatio = Math.max(0, (spd - normalMax) / 70);
      const spdFactor = Math.min(1.0, (spd / normalMax) * 0.70 + overspeedRatio * 0.30);
      // Sensação de velocidade: FOV dinâmico suave mantendo a altura da pista e horizonte equilibrados
      this.currentCameraDepth = CAMERA_DEPTH * (1.0 - spdFactor * 0.12);
      const camH = CAMERA_HEIGHT * (1.0 - spdFactor * 0.04);

      const cameraX = this.finishingRace ? this.finishCameraX : (p.x * ROAD_WIDTH * 0.65);
      const cameraY = this.finishingRace ? this.finishCameraY : (camH + playerWorldY);
      const drawnSegs = (def && def.id === 'teste') ? new Set() : null;
      for (let n = 0; n < DRAW_DISTANCE; n++) {
        const segment = this.track.segments[(baseSegment.index + n) % totalSegs];
        const looped = segment.index < baseSegment.index;
        const cameraZ = camOriginZ - (looped ? this.track.totalLength : 0);

        this.project(segment.p1, cameraX - x, cameraY, cameraZ);
        x += dx;
        dx += segment.curve;
        this.project(segment.p2, cameraX - x, cameraY, cameraZ);

        segment.clipY = maxY;
        if ((segment.p1.camera.z <= CAMERA_DEPTH) || (segment.p2.screen.y >= maxY)) {
          continue;
        }

        if (drawnSegs) drawnSegs.add(segment.index);
        this.renderSegment(ctx, segment, maxY);
        maxY = segment.p2.screen.y;
      }

      // Interpolação 3D exata em perspectiva (elimina 100% da oscilação/lag entre segmentos!)
      if (!isAttract && refSeg.p1.camera && refSeg.p2.camera) {
        const pRoad = this.projectInterpolated(refSeg, refPercent);
        const neutralX = (INTERNAL_WIDTH / 2) - (pRoad.w * 0.65 * p.x);
        const rawCurveShift = pRoad.x - neutralX;
        this.smoothCurveScreenX += (rawCurveShift - this.smoothCurveScreenX) * 0.35;
        this.smoothRoadY += (pRoad.y - this.smoothRoadY) * 0.45;

        // Avanço suave na aceleração mantendo um espaço agradável entre o para-choque e a margem inferior da tela
        const speedAdvance = Math.min(6, (spd / normalMax) * 4.5 + overspeedRatio * 2.5);
        this.playerRenderPos = {
          x: neutralX + this.smoothCurveScreenX + pRoad.w * p.x,
          y: this.smoothRoadY - 18 - speedAdvance
        };
      }

      const inTunnel = (refSeg && !!refSeg.tunnel);
      const nightIntensity = inTunnel ? 1.0 : (this.envCur ? (this.envCur.s.night || 0) : 0);
      const isNight = nightIntensity > 0.28;
      const isDusk = this.envCur ? ((this.envCur.s.dusk || 0) > 0.22) : false;
      const isDark = isNight || isDusk || inTunnel || (def && (def.theme === 'NOITE' || def.theme === 'TARDE'));
      for (let n = DRAW_DISTANCE - 1; n >= 0; n--) {
        const segment = this.track.segments[(baseSegment.index + n) % totalSegs];
        if (segment.p1.camera.z <= CAMERA_DEPTH) continue;

        if (segment.index === START_LINE_SEG && segment.p1.screen.y <= segment.clipY + 4) {
          this.renderFinishArch(ctx, segment);
        }

        if (segment.tunnelPortal && segment.p1.screen.y <= segment.clipY + 8) {
          this.renderTunnelPortal(ctx, segment, def);
        }

        if (segment.overheadBridge && segment.p1.screen.y <= segment.clipY + 8) {
          this.renderOverheadBridge(ctx, segment, def);
        }

        if (def && def.id === 'teste' && drawnSegs && drawnSegs.has(segment.index) && segment.p1.screen.w > 6) {
          const prevSeg = this.track.segments[(segment.index - 1 + totalSegs) % totalSegs];
          const prevNotDrawn = !!(drawnSegs && !drawnSegs.has(prevSeg.index) && segment.p1.screen.y < INTERNAL_HEIGHT + 24 && segment.p1.screen.y > segment.p2.screen.y + 0.5);
          const makeNearSeg = (seg) => {
            const sp1 = seg.p1.screen, sp2 = seg.p2.screen;
            const targetY = INTERNAL_HEIGHT + 240;
            const t = Math.min(25, (targetY - sp2.y) / (sp1.y - sp2.y));
            return {
              index: seg.index,
              pitSide: seg.pitSide,
              grandstandSide: seg.grandstandSide,
              p1: { screen: { x: sp2.x + (sp1.x - sp2.x) * t, y: targetY, w: sp2.w + (sp1.w - sp2.w) * t } },
              p2: { screen: { x: sp1.x, y: sp1.y, w: sp1.w } }
            };
          };
          if (segment.pitWall) {
            const gs = -(segment.pitSide || 1);
            this.renderTesteGrandstand(ctx, segment, isDark, nightIntensity, gs, segment.index === 18, segment.index === 89);
            if (prevNotDrawn && prevSeg.pitWall && segment.index !== 18) {
              this.renderTesteGrandstand(ctx, makeNearSeg(segment), isDark, nightIntensity, gs, false, false);
            }
            if (segment.index >= 18 && segment.index < 72) {
              this.renderTestePitGarages(ctx, segment, isDark, nightIntensity);
              if (prevNotDrawn && prevSeg.pitWall && segment.index > 18 && prevSeg.index >= 18 && prevSeg.index < 72) {
                this.renderTestePitGarages(ctx, makeNearSeg(segment), isDark, nightIntensity);
              }
            }
          }
          if (segment.grandstandSide) {
            this.renderTesteGrandstand(ctx, segment, isDark, nightIntensity, segment.grandstandSide, !!segment.grandstandStart, !!segment.grandstandEnd);
            if (prevNotDrawn && !segment.grandstandStart && prevSeg.grandstandSide === segment.grandstandSide) {
              this.renderTesteGrandstand(ctx, makeNearSeg(segment), isDark, nightIntensity, segment.grandstandSide, false, false);
            }
          }
        }

        if (segment.scenery && segment.p1.screen.y <= segment.clipY + 2) {
          if (Array.isArray(segment.scenery)) {
            for (let sc = 0; sc < segment.scenery.length; sc++) {
              this.renderScenery(ctx, segment, segment.scenery[sc], def);
            }
          } else {
            this.renderScenery(ctx, segment, segment.scenery, def);
          }
        }

        if (segment.cars && segment.cars.length > 0) {
          if (segment.cars.length > 1) {
            segment.cars.sort((a, b) => b.renderRelCamZ - a.renderRelCamZ);
          }

          for (let c = 0; c < segment.cars.length; c++) {
            const bot = segment.cars[c];
            const cRoad = this.projectInterpolated(segment, bot.renderPct);
            const cRoadX = cRoad.x;
            const cRoadY = cRoad.y;
            const cRoadW = cRoad.w;

            if (cRoadY > segment.clipY + 12) continue;

            const distScale = PLAYER_Z_OFFSET / Math.max(1, bot.renderRelCamZ);
            const carW = PLAYER_CAR_W * distScale;
            const carH = PLAYER_CAR_H * distScale;
            const carX = cRoadX + cRoadW * bot.x;
            const carY = cRoadY - carH * (24 / 68);

            if (carW > 3.5 && carH > 2.5) {
              if (bot.renderRelCamZ < PLAYER_Z_OFFSET) {
                this.foregroundBots.push({ bot, x: carX, y: carY, w: carW, h: carH });
              } else {
                const needClip = cRoadY > segment.clipY;
                if (needClip) {
                  ctx.save();
                  ctx.beginPath();
                  ctx.rect(0, 0, INTERNAL_WIDTH, segment.clipY);
                  ctx.clip();
                }
                if (isNight && carW > 10) {
                  this.renderBotHeadlightBeams(ctx, carX, carY, carW, carH, bot.steerAngle || 0, nightIntensity);
                }
                if (this.envCur && this.envCur.s.rain > 0.04) {
                  this.renderWetReflection(ctx, carX, carY, carW, carH, bot.isBraking, this.envCur.s.rain);
                }
                bot.model.render(
                  ctx,
                  carX,
                  carY,
                  carW,
                  carH,
                  bot.isBraking,
                  bot.steerAngle || 0,
                  bot.bodyColor,
                  {
                    isNitro: !!bot.isNitro,
                    wheelPhase: bot.z * 0.035,
                    isNight: isDark,
                    speed: bot.speed
                  }
                );
                if (carW >= 14 && bot.driverCode) {
                  this.renderDriverBadge(ctx, bot.driverCode, carX, carY - carH * 0.44, carW);
                }
                if (needClip) ctx.restore();
              }
            }
          }
        }
      }
    }

    renderTesteGrandstand(ctx, segment, isDark = false, nightIntensity = 0, gsOverride = null, isStart = false, isEnd = false) {
      const p1 = segment.p1.screen;
      const p2 = segment.p2.screen;
      if (p1.w <= 6 || p2.y >= p1.y) return;

      const ps = segment.pitSide || 1;
      const gs = (gsOverride !== null) ? gsOverride : -ps;
      const segBottomY = p1.y;
      const topY = p2.y;

      const rail1 = p1.x + p1.w * gs * 1.21, rail2 = p2.x + p2.w * gs * 1.21;
      const baseIn1 = p1.x + p1.w * gs * 1.30, baseIn2 = p2.x + p2.w * gs * 1.30;
      const t1Out1 = p1.x + p1.w * gs * 1.60, t1Out2 = p2.x + p2.w * gs * 1.60;
      const t2Out1 = p1.x + p1.w * gs * 1.92, t2Out2 = p2.x + p2.w * gs * 1.92;
      const t3Out1 = p1.x + p1.w * gs * 2.24, t3Out2 = p2.x + p2.w * gs * 2.24;
      const t4Out1 = p1.x + p1.w * gs * 2.54, t4Out2 = p2.x + p2.w * gs * 2.54;

      const hBase1 = p1.w * 0.14, hBase2 = p2.w * 0.14;
      const hT1_1 = p1.w * 0.28, hT1_2 = p2.w * 0.28;
      const hT2_1 = p1.w * 0.42, hT2_2 = p2.w * 0.42;
      const hT3_1 = p1.w * 0.56, hT3_2 = p2.w * 0.56;
      const hRoof1 = p1.w * 0.76, hRoof2 = p2.w * 0.76;

      // Parede traseira contínua suave sustentando a estrutura
      this.drawPoly(ctx, t3Out1, segBottomY, t3Out1, segBottomY - hRoof1 * 1.04, t3Out2, topY - hRoof2 * 1.04, t3Out2, topY, '#0F172A');
      // Mureta de base contínua + friso superior discreto
      this.drawPoly(ctx, baseIn1, segBottomY, baseIn1, segBottomY - hBase1, baseIn2, topY - hBase2, baseIn2, topY, '#1E293B');
      this.drawPoly(ctx, baseIn1, segBottomY - hBase1 * 0.84, baseIn1, segBottomY - hBase1, baseIn2, topY - hBase2, baseIn2, topY - hBase2 * 0.84, '#475569');

      // 3 degraus contínuos e suaves (sem quadriculado por segmento)
      this.drawPoly(ctx, baseIn1, segBottomY - hBase1, t1Out1, segBottomY - hT1_1, t1Out2, topY - hT1_2, baseIn2, topY - hBase2, '#334155');
      this.drawPoly(ctx, t1Out1, segBottomY - hT1_1, t2Out1, segBottomY - hT2_1, t2Out2, topY - hT2_2, t1Out2, topY - hT1_2, '#3E4C5E');
      this.drawPoly(ctx, t2Out1, segBottomY - hT2_1, t3Out1, segBottomY - hT3_1, t3Out2, topY - hT3_2, t2Out2, topY - hT2_2, '#334155');

      // Cobertura inclinada contínua + testeira vermelha elegante
      this.drawPoly(ctx, baseIn1, segBottomY - hRoof1, t4Out1, segBottomY - hRoof1 * 1.06, t4Out2, topY - hRoof2 * 1.06, baseIn2, topY - hRoof2, '#1E293B');
      const fasciaH1 = p1.w * 0.048, fasciaH2 = p2.w * 0.048;
      this.drawPoly(ctx, baseIn1, segBottomY - hRoof1 + fasciaH1, baseIn1, segBottomY - hRoof1, baseIn2, topY - hRoof2, baseIn2, topY - hRoof2 + fasciaH2, '#DC2626');

      // Torcida diversa (homens e mulheres, variações de pele branca, parda e negra)
      if (p1.w > 9 && !isStart && !isEnd) {
        const shirtCols = ['#EF4444', '#FACC15', '#38BDF8', '#E2E8F0', '#22C55E', '#F97316', '#EC4899', '#A855F7'];
        const skinCols = ['#FDE2C4', '#FDBA74', '#C68642', '#9A5B25', '#6F4E37', '#4A2E1B'];
        const hairCols = ['#111827', '#291709', '#5C3317', '#92400E', '#D97706', '#7C2D12'];
        const tiers = [
          { off: 1.38, h: 0.21 },
          { off: 1.69, h: 0.34 },
          { off: 2.01, h: 0.48 }
        ];
        const rBody = Math.max(1.2, p1.w * 0.018);
        const rHead = Math.max(0.9, p1.w * 0.011);
        for (let t = 0; t < tiers.length; t++) {
          for (let sub = 0; sub < 2; sub++) {
            const seed = (segment.index * 17 + t * 7 + sub * 11);
            const cx = p1.x + p1.w * gs * (tiers[t].off + sub * 0.13);
            const cy = segBottomY - p1.w * (tiers[t].h + sub * 0.025);
            const shirt = shirtCols[seed % shirtCols.length];
            const skin = skinCols[(seed * 3 + t) % skinCols.length];
            const hair = hairCols[(seed * 5 + sub) % hairCols.length];
            const isWoman = ((seed + t) % 2 === 1);
            // Ombros/tronco arredondados
            ctx.fillStyle = shirt;
            ctx.beginPath();
            ctx.arc(cx, cy - rBody * 0.5, rBody, Math.PI, 0);
            ctx.lineTo(cx + rBody, cy);
            ctx.lineTo(cx - rBody, cy);
            ctx.closePath();
            ctx.fill();
            // Cabelo longo atrás/dos lados para mulheres (desenhado antes do rosto)
            if (isWoman && p1.w > 13) {
              ctx.fillStyle = hair;
              ctx.beginPath();
              ctx.arc(cx, cy - rBody * 1.50, rHead * 1.24, Math.PI * 0.85, Math.PI * 0.15);
              ctx.lineTo(cx + rHead * 1.15, cy - rBody * 0.55);
              ctx.lineTo(cx - rHead * 1.15, cy - rBody * 0.55);
              ctx.closePath();
              ctx.fill();
            }
            // Cabeça circular com tom de pele variado
            ctx.fillStyle = skin;
            ctx.beginPath();
            ctx.arc(cx, cy - rBody * 1.55, rHead, 0, Math.PI * 2);
            ctx.fill();
            if (p1.w > 16) {
              ctx.fillStyle = hair;
              ctx.beginPath();
              ctx.arc(cx, cy - rBody * 1.68, rHead * 0.98, Math.PI, 0);
              ctx.fill();
              if (isWoman && (seed % 3 === 0)) {
                // Coque/rabo de cavalo no topo
                ctx.beginPath();
                ctx.arc(cx, cy - rBody * 2.15, rHead * 0.45, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        }
      }

      // Pilares estruturais a cada 6 segmentos + Refletor de teto ligado à noite/tarde
      if (segment.index % 6 === 0 && p1.w > 8) {
        const colW = Math.max(1.5, p1.w * 0.032);
        ctx.fillStyle = '#475569';
        ctx.fillRect(t3Out1 - colW * 0.5, segBottomY - hRoof1 * 1.04, colW, hRoof1 * 1.04 - hT3_1);
        ctx.fillRect(baseIn1 - colW * 0.4, segBottomY - hRoof1, colW * 0.8, hRoof1 - hBase1);

        // Suporte + refletor no topo da marquise apontado para a pista (contraface aos boxes)
        const toTrack = -gs;
        const lampX = baseIn1;
        const lampY = segBottomY - hRoof1 - p1.w * 0.032;
        const lampW = Math.max(2.5, p1.w * 0.055);
        const lampH = Math.max(1.5, p1.w * 0.026);
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(lampX - lampW * 0.35, lampY);
        ctx.lineTo(lampX + lampW * 0.35 + toTrack * lampW * 0.3, lampY + lampH * 0.2);
        ctx.lineTo(lampX + lampW * 0.25 + toTrack * lampW * 0.4, lampY + lampH);
        ctx.lineTo(lampX - lampW * 0.35, lampY + lampH * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = isDark ? '#FFFDE7' : '#94A3B8';
        ctx.fillRect(lampX + (toTrack > 0 ? 0 : -lampW * 0.45), lampY + lampH * 0.25, lampW * 0.48, lampH * 0.55);

        if (isDark && p1.w > 12) {
          const glowAlpha = Math.max(0.24, Math.min(0.52, 0.30 + nightIntensity * 0.22));
          const beamEndY = lampY + lampH + (segBottomY - lampY) * 0.48;
          const coneGrad = ctx.createLinearGradient(lampX, lampY + lampH, lampX + toTrack * p1.w * 0.24, beamEndY);
          coneGrad.addColorStop(0, `rgba(255, 249, 196, ${glowAlpha.toFixed(2)})`);
          coneGrad.addColorStop(1, 'rgba(255, 238, 88, 0)');
          ctx.fillStyle = coneGrad;
          ctx.beginPath();
          ctx.moveTo(lampX, lampY + lampH * 0.3);
          ctx.lineTo(lampX + toTrack * lampW * 0.45, lampY + lampH);
          ctx.lineTo(lampX + toTrack * p1.w * 0.46, beamEndY);
          ctx.lineTo(lampX + toTrack * p1.w * 0.04, beamEndY);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Guardrail contínuo na frente da arquibancada por toda a extensão
      const gh1 = Math.max(2.5, p1.w * 0.09), gh2 = Math.max(1.2, p2.w * 0.09);
      const rw1 = Math.max(1.2, p1.w * 0.028) * gs, rw2 = Math.max(0.6, p2.w * 0.028) * gs;
      if (segment.index % 3 === 0) {
        const postW = Math.max(1, p1.w * 0.018);
        ctx.fillStyle = '#64748B';
        ctx.fillRect(rail1 - postW * 0.5, segBottomY - gh1 * 1.1, postW, gh1 * 1.1);
      }
      this.drawPoly(ctx, rail1, segBottomY - gh1, rail1 + rw1, segBottomY - gh1, rail2 + rw2, topY - gh2, rail2, topY - gh2, '#CBD5E1');
      this.drawPoly(ctx, rail1, segBottomY - gh1 * 0.52, rail1 + rw1, segBottomY - gh1 * 0.52, rail2 + rw2, topY - gh2 * 0.52, rail2, topY - gh2 * 0.52, '#94A3B8');

      // Parede lateral de fechamento no início/fim da arquibancada
      if (isStart || isEnd) {
        this.drawPoly(ctx, baseIn1, segBottomY, t3Out1, segBottomY, t3Out1, segBottomY - hRoof1 * 1.04, baseIn1, segBottomY - hRoof1, '#1E293B');
      }
    }

    renderTestePitGarages(ctx, segment, isDark = false, nightIntensity = 0) {
      const p1 = segment.p1.screen;
      const p2 = segment.p2.screen;
      if (p1.w <= 6 || p2.y >= p1.y) return;

      const ps = segment.pitSide || 1;
      const segBottomY = p1.y;
      const topY = p2.y;

      const garIn1 = p1.x + p1.w * ps * 2.34, garIn2 = p2.x + p2.w * ps * 2.34;
      const garOut1 = p1.x + p1.w * ps * 3.24, garOut2 = p2.x + p2.w * ps * 3.24;
      const roofIn1 = p1.x + p1.w * ps * 2.18, roofIn2 = p2.x + p2.w * ps * 2.18;

      const hGar1 = p1.w * 0.36, hGar2 = p2.w * 0.36;
      const hFas1 = p1.w * 0.50, hFas2 = p2.w * 0.50;
      const hPad1 = p1.w * 0.72, hPad2 = p2.w * 0.72;
      const hRoof1 = p1.w * 0.79, hRoof2 = p2.w * 0.79;

      const TEAM_BOXES = [
        { col: '#DC2626', code: 'FER' },
        { col: '#06B6D4', code: 'MER' },
        { col: '#F97316', code: 'MCL' },
        { col: '#2563EB', code: 'RBR' },
        { col: '#10B981', code: 'AST' },
        { col: '#EC4899', code: 'ALP' },
        { col: '#38BDF8', code: 'WIL' },
        { col: '#E11D48', code: 'HAS' },
        { col: '#A855F7', code: 'LH44' }
      ];
      const bayIdx = Math.floor((segment.index - 18) / 6);
      const bayLocal = (segment.index - 18) % 6;
      const team = TEAM_BOXES[bayIdx % TEAM_BOXES.length];

      // Interior contínuo e suave do box (sem alternância quadriculada)
      this.drawPoly(ctx, garIn1, segBottomY, garIn1, segBottomY - hGar1, garIn2, topY - hGar2, garIn2, topY, bayLocal === 0 ? '#475569' : '#0B1120');
      if (bayLocal !== 0 && p1.w > 10) {
        // Piso epóxi contínuo da garagem
        this.drawPoly(ctx, garIn1, segBottomY, garIn1, segBottomY - hGar1 * 0.14, garIn2, topY - hGar2 * 0.14, garIn2, topY, '#1E293B');
      }

      // Divisória estrutural entre boxes ou equipamentos suaves internos
      if (bayLocal === 0) {
        this.drawPoly(ctx, garIn1, segBottomY, garOut1, segBottomY, garOut1, segBottomY - hPad1, garIn1, segBottomY - hPad1, '#334155');
      } else if (p1.w > 12) {
        if (bayLocal === 1 || bayLocal === 5) {
          // Pilha arredondada de pneus slick dentro do box
          const tr = Math.max(1.5, p1.w * 0.032);
          const tx = garIn1 + ps * p1.w * 0.06;
          for (let st = 0; st < 3; st++) {
            ctx.fillStyle = '#18181B';
            ctx.beginPath();
            ctx.arc(tx, segBottomY - tr * (0.9 + st * 1.45), tr, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = team.col;
            ctx.lineWidth = Math.max(0.6, tr * 0.25);
            ctx.stroke();
          }
        } else if (bayLocal === 3) {
          // Painel de telemetria suave + luz interna do box
          const monW = Math.max(2.5, p1.w * 0.10);
          const monH = Math.max(2, hGar1 * 0.34);
          const mx = garIn1 + ps * p1.w * 0.04 - (ps < 0 ? monW : 0);
          ctx.fillStyle = '#0284C7';
          ctx.fillRect(mx, segBottomY - hGar1 * 0.66, monW, monH);
          ctx.fillStyle = '#E0F2FE';
          ctx.fillRect(mx, segBottomY - hGar1 * 0.94, monW * 1.15, Math.max(1, hGar1 * 0.06));
        }
      }

      // Faixa contínua da equipe acima da porta do box + sigla
      this.drawPoly(ctx, garIn1, segBottomY - hGar1, garIn1, segBottomY - hFas1, garIn2, topY - hFas2, garIn2, topY - hGar2, team.col);
      if (bayLocal === 3 && p1.w > 12) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.max(3, (hFas1 - hGar1) * 0.62).toFixed(1)}px monospace`;
        ctx.textAlign = ps > 0 ? 'left' : 'right';
        ctx.fillText(team.code, garIn1 + ps * p1.w * 0.04, segBottomY - (hGar1 + hFas1) * 0.46);
      }

      // 2º andar Paddock Club: vidro contínuo suave + faixa de reflexo horizontal + guarda-corpo
      this.drawPoly(ctx, garIn1, segBottomY - hFas1, garIn1, segBottomY - hPad1, garIn2, topY - hPad2, garIn2, topY - hFas2, '#0F172A');
      this.drawPoly(ctx, garIn1, segBottomY - hFas1 * 1.12, garIn1, segBottomY - hPad1 * 0.92, garIn2, topY - hPad2 * 0.92, garIn2, topY - hFas2 * 1.12, isDark ? '#172554' : '#1E3A5F');
      this.drawPoly(ctx, garIn1, segBottomY - hFas1, garIn1, segBottomY - hFas1 * 1.05, garIn2, topY - hFas2 * 1.05, garIn2, topY - hFas2, '#CBD5E1');
      if (segment.index % 3 === 0 && p1.w > 10) {
        const mullW = Math.max(0.8, p1.w * 0.012);
        ctx.fillStyle = '#475569';
        ctx.fillRect(garIn1 - mullW * 0.5, segBottomY - hPad1, mullW, hPad1 - hFas1);
      }

      // Marquise contínua suave dos boxes avançando sobre o Pit Lane
      this.drawPoly(ctx, roofIn1, segBottomY - hPad1, garOut1, segBottomY - hRoof1, garOut2, topY - hRoof2, roofIn2, topY - hPad2, '#1E293B');

      // Refletores de teto dos boxes (ligados automaticamente com isDark igual aos postes, apontados para o Pit Lane/pista)
      if (bayLocal === 3 && p1.w > 8) {
        const toTrack = -ps;
        const lampX = roofIn1;
        const lampY = segBottomY - hPad1 - p1.w * 0.025;
        const lampW = Math.max(2.5, p1.w * 0.055);
        const lampH = Math.max(1.5, p1.w * 0.026);
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(lampX - lampW * 0.35, lampY);
        ctx.lineTo(lampX + lampW * 0.35 + toTrack * lampW * 0.3, lampY + lampH * 0.2);
        ctx.lineTo(lampX + lampW * 0.25 + toTrack * lampW * 0.4, lampY + lampH);
        ctx.lineTo(lampX - lampW * 0.35, lampY + lampH * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = isDark ? '#FFFDE7' : '#94A3B8';
        ctx.fillRect(lampX + (toTrack > 0 ? 0 : -lampW * 0.45), lampY + lampH * 0.25, lampW * 0.48, lampH * 0.55);

        if (isDark && p1.w > 12) {
          const glowAlpha = Math.max(0.24, Math.min(0.52, 0.30 + nightIntensity * 0.22));
          const beamEndY = lampY + lampH + (segBottomY - lampY) * 0.62;
          const coneGrad = ctx.createLinearGradient(lampX, lampY + lampH, lampX + toTrack * p1.w * 0.22, beamEndY);
          coneGrad.addColorStop(0, `rgba(255, 249, 196, ${glowAlpha.toFixed(2)})`);
          coneGrad.addColorStop(1, 'rgba(255, 238, 88, 0)');
          ctx.fillStyle = coneGrad;
          ctx.beginPath();
          ctx.moveTo(lampX, lampY + lampH * 0.3);
          ctx.lineTo(lampX + toTrack * lampW * 0.45, lampY + lampH);
          ctx.lineTo(lampX + toTrack * p1.w * 0.40, beamEndY);
          ctx.lineTo(lampX + toTrack * p1.w * 0.03, beamEndY);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Parede lateral de fechamento no início/fim do prédio dos boxes
      if (segment.index === 18 || segment.index === 71) {
        this.drawPoly(ctx, garIn1, segBottomY, garOut1, segBottomY, garOut1, segBottomY - hRoof1, garIn1, segBottomY - hPad1, '#1E293B');
      }
    }

    renderFinishArch(ctx, segment) {
      const p1 = segment.p1.screen;
      if (p1.w < 12 || p1.y <= INTERNAL_HEIGHT / 2) return;
      const archH = p1.w * 0.52;
      const postW = Math.max(2, p1.w * 0.07);
      const bannerH = Math.max(4, p1.w * 0.14);
      const leftX = p1.x - p1.w * (segment.pitWall && segment.pitSide === -1 ? 2.28 : 1.06);
      const rightX = p1.x + p1.w * (segment.pitWall && segment.pitSide !== -1 ? 2.28 : 1.06);
      const topY = p1.y - archH;

      ctx.save();
      // Colunas metálicas laterais
      ctx.fillStyle = '#2C3E50';
      ctx.fillRect(leftX - postW, topY, postW, archH);
      ctx.fillRect(rightX, topY, postW, archH);
      ctx.fillStyle = '#95A5A6';
      ctx.fillRect(leftX - postW * 0.7, topY, postW * 0.35, archH);
      ctx.fillRect(rightX + postW * 0.35, topY, postW * 0.35, archH);

      // Pórtico superior
      const spanW = (rightX + postW) - (leftX - postW);
      ctx.fillStyle = '#111622';
      ctx.fillRect(leftX - postW, topY, spanW, bannerH);
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = Math.max(1, p1.w * 0.012);
      ctx.strokeRect(leftX - postW, topY, spanW, bannerH);

      // Quadriculado lateral no pórtico
      const chkW = Math.max(2, bannerH * 0.5);
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          ctx.fillStyle = ((r + c) % 2 === 0) ? '#FFF' : '#111';
          ctx.fillRect(leftX - postW + 2 + c * chkW, topY + r * (bannerH / 2), chkW, bannerH / 2);
          ctx.fillRect(rightX + postW - 2 - (c + 1) * chkW, topY + r * (bannerH / 2), chkW, bannerH / 2);
        }
      }

      if (p1.w > 14) {
        ctx.fillStyle = '#FFD700';
        ctx.font = `bold ${Math.max(3, Math.floor(bannerH * 0.62))}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('LH44 GRAND PRIX', p1.x, topY + bannerH * 0.73);
      }
      ctx.restore();
    }

    renderTunnelPortal(ctx, segment, def) {
      const p1 = segment.p1.screen;
      if (p1.w < 8) return;
      const isStone = (segment.tunnel === 'stone') || (def && def.theme === 'SERRA');
      const portalH = p1.w * 0.95;
      const postW = Math.max(3.5, p1.w * 0.16);
      // wallDist = 1.38 posiciona os pilares fora da pista e da zebra (zebra termina em 1.17)
      const leftInner = p1.x - p1.w * 1.38;
      const rightInner = p1.x + p1.w * 1.38;
      const leftOuter = leftInner - postW;
      const rightOuter = rightInner + postW;
      const topY = p1.y - portalH;
      const bannerH = Math.max(5.5, p1.w * 0.22);

      ctx.save();
      // Parede de rocha da montanha acima do arco (veda o céu estritamente acima do pórtico, sem invadir a pista)
      const rockCol = isStone ? '#2E221B' : '#0B111E';
      if (topY > 0) {
        ctx.fillStyle = rockCol;
        ctx.fillRect(0, 0, INTERNAL_WIDTH, topY + 2);
      }

      // Pilares laterais do portal
      ctx.fillStyle = isStone ? '#3E2F26' : '#1E293B';
      ctx.fillRect(leftOuter, topY, postW, portalH);
      ctx.fillRect(rightInner, topY, postW, portalH);
      ctx.fillStyle = isStone ? '#5A463B' : '#334155';
      ctx.fillRect(leftOuter + postW * 0.3, topY, postW * 0.35, portalH);
      ctx.fillRect(rightInner + postW * 0.35, topY, postW * 0.35, portalH);

      // Arco superior
      const spanW = rightOuter - leftOuter;
      ctx.fillStyle = isStone ? '#2E221B' : '#0F172A';
      ctx.fillRect(leftOuter, topY, spanW, bannerH);
      ctx.strokeStyle = isStone ? '#8D6E63' : '#00E5FF';
      ctx.lineWidth = Math.max(1, p1.w * 0.015);
      ctx.strokeRect(leftOuter, topY, spanW, bannerH);

      // Placa de identificação no portal
      if (p1.w > 30) {
        ctx.fillStyle = isStone ? '#FFD54F' : '#00E5FF';
        ctx.font = `bold ${Math.max(5.5, Math.floor(bannerH * 0.52))}px monospace`;
        ctx.textAlign = 'center';
        const label = isStone ? '▲ TÚNEL DA SERRA ▲' : '⚡ METRO TUNNEL ⚡';
        ctx.fillText(label, p1.x, topY + bannerH * 0.68);
      }
      ctx.restore();
    }

    renderOverheadBridge(ctx, segment, def) {
      const p1 = segment.p1.screen;
      if (p1.w < 8) return;
      const archH = p1.w * 0.66;
      const postW = Math.max(2.5, p1.w * 0.08);
      const bannerH = Math.max(5, p1.w * 0.18);
      const leftX = p1.x - p1.w * (segment.pitWall && segment.pitSide === -1 ? 2.28 : 1.10);
      const rightX = p1.x + p1.w * (segment.pitWall && segment.pitSide !== -1 ? 2.28 : 1.10);
      const topY = p1.y - archH;

      ctx.save();
      // Estrutura treliçada lateral
      ctx.fillStyle = '#334155';
      ctx.fillRect(leftX - postW, topY, postW, archH);
      ctx.fillRect(rightX, topY, postW, archH);
      ctx.fillStyle = '#64748B';
      ctx.fillRect(leftX - postW * 0.6, topY, postW * 0.3, archH);
      ctx.fillRect(rightX + postW * 0.3, topY, postW * 0.3, archH);

      // Passarela aérea superior
      const spanW = (rightX + postW) - (leftX - postW);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(leftX - postW, topY, spanW, bannerH);
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = Math.max(1, p1.w * 0.012);
      ctx.strokeRect(leftX - postW, topY, spanW, bannerH);

      if (p1.w > 12) {
        const isBrasil = (!def || def.id === 'brasil');
        const isNoite = (def && def.id === 'noite');
        ctx.fillStyle = isBrasil ? '#FEDD00' : (isNoite ? '#00E5FF' : '#FFFFFF');
        ctx.font = `bold ${Math.max(3, Math.floor(bannerH * 0.58))}px monospace`;
        ctx.textAlign = 'center';
        const trackTitle = def ? (def.name || 'BRASIL GP') : 'BRASIL GP';
        const txt = isBrasil ? '★ LH44 BRASIL GP - INTERLAGOS ★' : (isNoite ? '★ CYBER CITY GP ★' : `★ GP ${trackTitle} ★`);
        ctx.fillText(txt, p1.x, topY + bannerH * 0.70);
      }
      ctx.restore();
    }

    renderSegment(ctx, segment, maxY) {
      const rawP1 = segment.p1.screen;
      const p2 = segment.p2.screen;
      const c = segment.color;

      // Se for o primeiro segmento visível do quadro e p1 não encostar no fundo da tela (INTERNAL_HEIGHT),
      // extrapola as coordenadas da pista até a borda inferior, impedindo que a grama do fundo vaze sob o asfalto.
      const isFirst = (maxY >= INTERNAL_HEIGHT);
      let p1 = rawP1;
      if (isFirst && rawP1.y < INTERNAL_HEIGHT) {
        const dy = rawP1.y - p2.y;
        const ext = (dy > 0.1) ? ((INTERNAL_HEIGHT - rawP1.y) / dy) : 0;
        p1 = {
          x: rawP1.x + (rawP1.x - p2.x) * ext,
          y: INTERNAL_HEIGHT,
          w: rawP1.w + (rawP1.w - p2.w) * ext,
          scale: rawP1.scale
        };
      }

      const bottomY = isFirst ? INTERNAL_HEIGHT : Math.min(p1.y, maxY);
      if (p2.y >= bottomY) return;

      // Sobreposição vertical de subpixel entre trapézios adjacentes: elimina 100% de linhas e frestas na pista
      const segOverlap = 1.0;
      const topY = Math.max(0, p2.y - segOverlap);
      const segBottomY = isFirst ? INTERNAL_HEIGHT : Math.min(INTERNAL_HEIGHT, bottomY + 0.6);

      const r1 = p1.w / 6;
      const r2 = p2.w / 6;

      // Laterais: Túnel 3D, Ponte Suspensa ou Grama Natural
      if (segment.tunnel) {
        const isStone = (segment.tunnel === 'stone');
        const wallDist = 1.38; // Posicionado além da zebra (rumble = 1.17) para nunca cortar a pista
        const wallH1 = p1.w * 0.90;
        const wallH2 = p2.w * 0.90;
        const roofY1 = p1.y - wallH1;
        const roofY2 = p2.y - wallH2;

        const leftEdge1 = p1.x - p1.w - r1;
        const leftEdge2 = p2.x - p2.w - r2;
        const rightEdge1 = p1.x + p1.w + r1;
        const rightEdge2 = p2.x + p2.w + r2;

        const leftWall1 = p1.x - p1.w * wallDist;
        const leftWall2 = p2.x - p2.w * wallDist;
        const rightWall1 = p1.x + p1.w * wallDist;
        const rightWall2 = p2.x + p2.w * wallDist;

        const isLight = Math.floor(segment.index / 3) % 2 === 0;
        const wallBase = isStone ? (isLight ? '#2A201A' : '#1C1512') : (isLight ? '#1A2332' : '#0F1622');
        const wallHighlight = isStone ? '#3D2F27' : '#2C3B54';
        const walkCol = isStone ? (isLight ? '#382B22' : '#271D17') : (isLight ? '#1E293B' : '#131B26');

        // Acostamento/calçada entre a zebra e a parede do túnel
        this.drawPoly(ctx, leftWall1, segBottomY, leftEdge1, segBottomY, leftEdge2, topY, leftWall2, topY, walkCol);
        this.drawPoly(ctx, rightEdge1, segBottomY, rightWall1, segBottomY, rightWall2, topY, rightEdge2, topY, walkCol);

        // Parede Esquerda e Direita (além do acostamento, estendendo até as bordas da tela)
        this.drawPoly(ctx, 0, segBottomY, leftWall1, segBottomY, leftWall2, topY, 0, topY, wallBase);
        this.drawPoly(ctx, rightWall1, segBottomY, INTERNAL_WIDTH, segBottomY, INTERNAL_WIDTH, topY, rightWall2, topY, wallBase);

        // Teto do Túnel (Abóbada escura conectando os dois lados)
        const roofColor = isStone ? (isLight ? '#140E0C' : '#0D0907') : (isLight ? '#0D131C' : '#070B11');
        this.drawPoly(ctx, leftWall1, roofY1, rightWall1, roofY1, rightWall2, roofY2, leftWall2, roofY2, roofColor);

        // Preenchimento de rocha escura acima do teto para que o céu exterior nunca vaze
        const rockCap = isStone ? '#140E0C' : '#070B11';
        if (roofY2 > 0) {
          ctx.fillStyle = rockCap;
          ctx.fillRect(0, 0, INTERNAL_WIDTH, roofY2 + 2);
        }

        // Iluminação interna no teto do túnel
        if (isStone) {
          if (segment.index % 6 === 0 && p1.w > 12) {
            const lampW = Math.max(2, p1.w * 0.08);
            ctx.fillStyle = '#FFA726';
            ctx.fillRect(p1.x - lampW * 0.5, roofY1, lampW, Math.max(1.5, wallH1 * 0.06));
            // Brilho dourado no asfalto
            const spotGrad = ctx.createRadialGradient(p1.x, p1.y - 4, 2, p1.x, p1.y - 4, p1.w * 0.5);
            spotGrad.addColorStop(0, 'rgba(255, 183, 77, 0.22)');
            spotGrad.addColorStop(1, 'rgba(255, 183, 77, 0)');
            ctx.fillStyle = spotGrad;
            ctx.beginPath();
            ctx.ellipse(p1.x, p1.y - 4, p1.w * 0.5, Math.max(2, (segBottomY - topY) * 2), 0, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Túnel Metro: Tiras contínuas de LED Neon no centro do teto
          const neonW1 = Math.max(1, p1.w * 0.04);
          const neonW2 = Math.max(0.6, p2.w * 0.04);
          const neonCol = (Math.floor(segment.index / 2) % 2 === 0) ? '#00E5FF' : '#FF007F';
          this.drawPoly(ctx, p1.x - neonW1, roofY1, p1.x + neonW1, roofY1, p2.x + neonW2, roofY2, p2.x - neonW2, roofY2, neonCol);
        }
      } else if (segment.bridge) {
        // Laterais da Ponte / Viaduto: Abismo escuro nas laterais (sem colunas invasivas no chão)
        const abyssCol = '#0A0E17';
        this.drawPoly(ctx, 0, segBottomY, p1.x - p1.w - r1, segBottomY, p2.x - p2.w - r2, topY, 0, topY, abyssCol);
        this.drawPoly(ctx, p1.x + p1.w + r1, segBottomY, INTERNAL_WIDTH, segBottomY, INTERNAL_WIDTH, topY, p2.x + p2.w + r2, topY, abyssCol);
      } else {
        // Grama lateral padrão com sobreposição contínua
        this.drawPoly(ctx, 0, segBottomY, p1.x - p1.w - r1, segBottomY, p2.x - p2.w - r2, topY, 0, topY, c.grass);
        this.drawPoly(ctx, p1.x + p1.w + r1, segBottomY, INTERNAL_WIDTH, segBottomY, INTERNAL_WIDTH, topY, p2.x + p2.w + r2, topY, c.grass);
      }

      this.drawPoly(ctx, p1.x - p1.w - r1, segBottomY, p1.x - p1.w, segBottomY, p2.x - p2.w, topY, p2.x - p2.w - r2, topY, c.rumble);
      this.drawPoly(ctx, p1.x + p1.w, segBottomY, p1.x + p1.w + r1, segBottomY, p2.x + p2.w + r2, topY, p2.x + p2.w, topY, c.rumble);

      // Corredor do Pit Lane (estilo Top Gear 1: direita ou esquerda, entrada verde e saída em diagonal)
      if (segment.pitWall) {
        const ps = segment.pitSide || 1;
        const isLightPit = Math.floor(segment.index / 3) % 2 === 0;
        const pitAsphalt = isLightPit ? '#2B3340' : '#242B36';
        const outer1 = segment.pitExit ? (2.26 - 1.22 * (segment.pitExitT1 || 0)) : 2.26;
        const outer2 = segment.pitExit ? (2.26 - 1.22 * (segment.pitExitT2 || 0)) : 2.26;
        const mid1 = segment.pitExit ? (1.65 - 0.65 * (segment.pitExitT1 || 0)) : 1.65;
        const mid2 = segment.pitExit ? (1.65 - 0.65 * (segment.pitExitT2 || 0)) : 1.65;
        this.drawPoly(ctx, p1.x + p1.w * ps * 1.04, segBottomY, p1.x + p1.w * ps * outer1, segBottomY, p2.x + p2.w * ps * outer2, topY, p2.x + p2.w * ps * 1.04, topY, pitAsphalt);
        // Faixa central amarela no corredor dos boxes (acompanhando a diagonal na saída)
        if (segment.index % 4 < 2) {
          this.drawPoly(ctx, p1.x + p1.w * ps * (mid1 - 0.02), segBottomY, p1.x + p1.w * ps * (mid1 + 0.02), segBottomY, p2.x + p2.w * ps * (mid2 + 0.02), topY, p2.x + p2.w * ps * (mid2 - 0.02), topY, '#FACC15');
        }
        // Marcação luminosa de entrada (lista verde contínua no chão + faixas) / saída no Pit Lane
        const pitClosedNow = !this.player || this.raceTimer <= 6.5 || this.player.totalDistance <= (START_LINE_Z + 1800);
        if (!pitClosedNow && segment.pitEntry) {
          // Lista verde contínua na borda da entrada para reconhecer imediatamente onde entrar
          this.drawPoly(ctx, p1.x + p1.w * ps * 1.02, segBottomY, p1.x + p1.w * ps * 1.24, segBottomY, p2.x + p2.w * ps * 1.24, topY, p2.x + p2.w * ps * 1.02, topY, '#00E676');
          if (segment.index % 4 === 0) {
            const blinkEntry = (Math.sin(performance.now() / 110) + 1) * 0.5;
            const entryCol = blinkEntry > 0.45 ? '#00FF88' : '#059669';
            this.drawPoly(ctx, p1.x + p1.w * ps * 1.24, segBottomY, p1.x + p1.w * ps * 2.18, segBottomY, p2.x + p2.w * ps * 2.18, topY, p2.x + p2.w * ps * 1.24, topY, entryCol);
          }
        } else if (!pitClosedNow && segment.pitExit && segment.index % 4 === 0) {
          const markOut1 = Math.max(1.12, outer1 - 0.08);
          const markOut2 = Math.max(1.12, outer2 - 0.08);
          this.drawPoly(ctx, p1.x + p1.w * ps * 1.10, segBottomY, p1.x + p1.w * ps * markOut1, segBottomY, p2.x + p2.w * ps * markOut2, topY, p2.x + p2.w * ps * 1.10, topY, '#38BDF8');
        }
        // Barreira de pneus/piquetes 3D (alta verticalmente): sempre no trecho central; na Volta 1 (largada) fecha entrada/saída também!
        if ((segment.pitBarrier || pitClosedNow) && p1.w > 6 && segment.index % 2 === 0) {
          const tx1 = p1.x + p1.w * ps * 1.05;
          const tw1 = Math.max(3.0, p1.w * 0.09);
          const th1 = Math.max(6.0, p1.w * 0.22);
          const isClosedGate = !segment.pitBarrier && pitClosedNow;
          const tireCol = isClosedGate
            ? ((Math.floor(segment.index / 2) % 2 === 0) ? '#F97316' : '#F8FAFC')
            : ((Math.floor(segment.index / 2) % 2 === 0) ? '#DC2626' : '#F8FAFC');
          ctx.fillStyle = isClosedGate ? '#7C2D12' : '#0F172A';
          ctx.fillRect(tx1 - tw1 * 0.5, segBottomY - th1, tw1, th1);
          ctx.fillStyle = tireCol;
          ctx.fillRect(tx1 - tw1 * 0.42, segBottomY - th1 * 0.86, tw1 * 0.84, th1 * 0.44);
        }
      }

      // Guardrails 3D metálicos com faixas alternadas vermelho e branco (estilo Top Gear)
      if (segment.guardrailLeft && p1.w > 7) {
        const gw1 = p1.w * 0.05, gw2 = p2.w * 0.05;
        const gh1 = Math.max(2.5, p1.w * 0.11), gh2 = Math.max(1.2, p2.w * 0.11);
        const gx1 = p1.x - p1.w - r1, gx2 = p2.x - p2.w - r2;
        const railColor = (Math.floor(segment.index / 2) % 2 === 0) ? '#D62828' : '#F0F4F8';
        if (segment.index % 4 === 0) {
          ctx.fillStyle = '#8B0000';
          ctx.fillRect(gx1 - gw1 * 0.5, segBottomY - gh1 * 1.15, Math.max(1, gw1 * 0.4), gh1 * 1.15);
        }
        this.drawPoly(ctx, gx1 - gw1, segBottomY - gh1, gx1, segBottomY - gh1, gx2, topY - gh2, gx2 - gw2, topY - gh2, railColor);
        this.drawPoly(ctx, gx1 - gw1, segBottomY - gh1 * 0.5, gx1, segBottomY - gh1 * 0.5, gx2, topY - gh2 * 0.5, gx2 - gw2, topY - gh2 * 0.5, railColor);
      }
      if (segment.guardrailRight && p1.w > 7) {
        const gw1 = p1.w * 0.05, gw2 = p2.w * 0.05;
        const gh1 = Math.max(2.5, p1.w * 0.11), gh2 = Math.max(1.2, p2.w * 0.11);
        const gx1 = p1.x + p1.w + r1, gx2 = p2.x + p2.w + r2;
        const railColor = (Math.floor(segment.index / 2) % 2 === 0) ? '#D62828' : '#F0F4F8';
        if (segment.index % 4 === 0) {
          ctx.fillStyle = '#8B0000';
          ctx.fillRect(gx1, segBottomY - gh1 * 1.15, Math.max(1, gw1 * 0.4), gh1 * 1.15);
        }
        this.drawPoly(ctx, gx1, segBottomY - gh1, gx1 + gw1, segBottomY - gh1, gx2 + gw2, topY - gh2, gx2, topY - gh2, railColor);
        this.drawPoly(ctx, gx1, segBottomY - gh1 * 0.5, gx1 + gw1, segBottomY - gh1 * 0.5, gx2 + gw2, topY - gh2 * 0.5, gx2, topY - gh2 * 0.5, railColor);
      }

      // Mureta dos Boxes 3D contínua na Reta Principal (por fora do corredor do Pit Lane, fechando em diagonal na saída)
      if (segment.pitWall && p1.w > 6) {
        const ps = segment.pitSide || 1;
        const wallDist1 = segment.pitExit ? (2.26 - 1.22 * (segment.pitExitT1 || 0)) : 2.26;
        const wallDist2 = segment.pitExit ? (2.26 - 1.22 * (segment.pitExitT2 || 0)) : 2.26;
        const wx1 = p1.x + p1.w * ps * wallDist1;
        const wx2 = p2.x + p2.w * ps * wallDist2;
        const wh1 = Math.max(3.5, p1.w * 0.18);
        const wh2 = Math.max(1.8, p2.w * 0.18);
        const ww1 = Math.max(2.2, p1.w * 0.06) * ps;
        const ww2 = Math.max(1.2, p2.w * 0.06) * ps;

        // Mureta de concreto
        const isLightWall = Math.floor(segment.index / 3) % 2 === 0;
        const wallBase = isLightWall ? '#475569' : '#334155';
        const wallTop = '#64748B';
        // Face superior e lateral frontal
        this.drawPoly(ctx, wx1, segBottomY - wh1, wx1 + ww1, segBottomY - wh1, wx2 + ww2, topY - wh2, wx2, topY - wh2, wallTop);
        this.drawPoly(ctx, wx1, segBottomY, wx1, segBottomY - wh1, wx2, topY - wh2, wx2, topY, wallBase);

        // Faixa de advertência amarela/preta no topo da mureta
        this.drawPoly(ctx, wx1, segBottomY - wh1 * 0.88, wx1, segBottomY - wh1, wx2, topY - wh2, wx2, topY - wh2 * 0.88, isLightWall ? '#FBBF24' : '#1E293B');

        // Postes de tela de proteção (grade de segurança) e telas de telemetria
        if (segment.index % 4 === 0 && p1.w > 10) {
          const fenceH = wh1 * 1.5;
          ctx.strokeStyle = '#94A3B8';
          ctx.lineWidth = Math.max(1, p1.w * 0.015);
          ctx.beginPath();
          ctx.moveTo(wx1, segBottomY - wh1);
          ctx.lineTo(wx1, segBottomY - fenceH);
          ctx.stroke();

          // Monitor de telemetria da equipe voltado para a pista
          const scrW = Math.max(3, p1.w * 0.08);
          const scrH = Math.max(2, wh1 * 0.45);
          ctx.fillStyle = '#0284C7';
          ctx.fillRect(ps > 0 ? wx1 : (wx1 - scrW), segBottomY - wh1 * 0.8, scrW, scrH);
        }
      }

      // Asfalto com sobreposição perfeita e trilhas sutis de rolagem 2.5D HD (zero frestas/linhas)
      this.drawPoly(ctx, p1.x - p1.w, segBottomY, p1.x + p1.w, segBottomY, p2.x + p2.w, topY, p2.x - p2.w, topY, c.road);
      const grooveCol = 'rgba(0, 0, 0, 0.08)';
      this.drawPoly(ctx, p1.x - p1.w * 0.55, segBottomY, p1.x - p1.w * 0.18, segBottomY, p2.x - p2.w * 0.18, topY, p2.x - p2.w * 0.55, topY, grooveCol);
      this.drawPoly(ctx, p1.x + p1.w * 0.18, segBottomY, p1.x + p1.w * 0.55, segBottomY, p2.x + p2.w * 0.55, topY, p2.x + p2.w * 0.18, topY, grooveCol);

      // Mancha de iluminação oval no asfalto e zebra gerada pelo poste arqueado (efeito dinâmico idêntico à imagem de referência!)
      if (segment.lampOffset !== null && segment.lampOffset !== undefined && p1.w > 10) {
        const lampSide = segment.lampOffset > 0 ? 1 : -1;
        const spotX = p1.x + p1.w * lampSide * 0.64;
        const spotY = (segBottomY + topY) * 0.5;
        const rx = p1.w * 0.44;
        const ry = Math.max(2.5, (segBottomY - topY) * 2.8);
        const glow = ctx.createRadialGradient(spotX, spotY, 2, spotX, spotY, rx);
        glow.addColorStop(0, 'rgba(255, 238, 140, 0.35)');
        glow.addColorStop(0.5, 'rgba(255, 215, 90, 0.18)');
        glow.addColorStop(1, 'rgba(255, 190, 60, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.ellipse(spotX, spotY, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();

        // Reflexo vertical no asfalto molhado em corridas de chuva
        if (this.envCur && this.envCur.s.rain > 0.04) {
          ctx.fillStyle = `rgba(255, 235, 140, ${(0.16 * this.envCur.s.rain).toFixed(3)})`;
          ctx.fillRect(spotX - rx * 0.25, segBottomY, rx * 0.5, Math.min(24, (segBottomY - topY) * 2.5));
        }
      }

      // Marcas dinâmicas de pneu no asfalto ao contornar curvas no limite
      if (segment.skidUntil && segment.skidUntil > this.raceTimer) {
        const alpha = Math.min(0.38, (segment.skidUntil - this.raceTimer) * 0.08);
        const sx = segment.skidX || 0;
        const tireOff = 0.095;
        const tw1 = Math.max(0.6, p1.w * 0.022);
        const tw2 = Math.max(0.3, p2.w * 0.022);
        const skidCol = `rgba(12, 14, 18, ${alpha.toFixed(2)})`;
        const lx1 = p1.x + p1.w * (sx - tireOff), lx2 = p2.x + p2.w * (sx - tireOff);
        const rx1 = p1.x + p1.w * (sx + tireOff), rx2 = p2.x + p2.w * (sx + tireOff);
        this.drawPoly(ctx, lx1 - tw1, segBottomY, lx1 + tw1, segBottomY, lx2 + tw2, topY, lx2 - tw2, topY, skidCol);
        this.drawPoly(ctx, rx1 - tw1, segBottomY, rx1 + tw1, segBottomY, rx2 + tw2, topY, rx2 - tw2, topY, skidCol);
      }

      // Linhas brancas contínuas de acostamento (delimitação nítida da pista)
      const edgeW1 = Math.max(0.8, p1.w / 38);
      const edgeW2 = Math.max(0.4, p2.w / 38);
      const edgeColor = 'rgba(240, 244, 250, 0.65)';
      this.drawPoly(ctx, p1.x - p1.w + edgeW1, segBottomY, p1.x - p1.w + edgeW1 * 2.4, segBottomY, p2.x - p2.w + edgeW2 * 2.4, topY, p2.x - p2.w + edgeW2, topY, edgeColor);
      this.drawPoly(ctx, p1.x + p1.w - edgeW1 * 2.4, segBottomY, p1.x + p1.w - edgeW1, segBottomY, p2.x + p2.w - edgeW2, topY, p2.x + p2.w - edgeW2 * 2.4, topY, edgeColor);

      // Faixa Quadriculada de Largada / Chegada (à frente do grid F1)
      if (segment.index === START_LINE_SEG || segment.index === START_LINE_SEG + 1) {
        const cols = 10;
        for (let k = 0; k < cols; k++) {
          const tA = -1 + (k * 2) / cols;
          const tB = -1 + ((k + 1) * 2) / cols;
          const sqColor = ((k + segment.index) % 2 === 0) ? '#FFFFFF' : '#151515';
          this.drawPoly(
            ctx,
            p1.x + p1.w * tA, segBottomY,
            p1.x + p1.w * tB, segBottomY,
            p2.x + p2.w * tB, topY,
            p2.x + p2.w * tA, topY,
            sqColor
          );
        }
        return;
      }

      // Colchetes brancos de posição no Grid estilo Fórmula 1 ([   ])
      if (segment.gridBox) {
        const cx = segment.gridBox === 'left' ? -GRID_COL_X : GRID_COL_X;
        const halfW = 0.165;
        const lineT = 0.022;
        const segH = segBottomY - topY;
        const yFrontA = topY;
        const yFrontB = topY + segH * 0.22;
        const yBack = topY + segH * 0.78;
        const xAt = (yVal, normX) => {
          const t = (p1.y === p2.y) ? 0 : (yVal - p2.y) / (p1.y - p2.y);
          const rx = p2.x + (p1.x - p2.x) * t;
          const rw = p2.w + (p1.w - p2.w) * t;
          return rx + rw * normX;
        };
        const boxColor = 'rgba(245, 248, 255, 0.86)';
        // Barra frontal do colchete F1
        this.drawPoly(
          ctx,
          xAt(yFrontB, cx - halfW), yFrontB,
          xAt(yFrontB, cx + halfW), yFrontB,
          xAt(yFrontA, cx + halfW), yFrontA,
          xAt(yFrontA, cx - halfW), yFrontA,
          boxColor
        );
        // Hastes laterais esquerda e direita do colchete F1
        this.drawPoly(
          ctx,
          xAt(yBack, cx - halfW), yBack,
          xAt(yBack, cx - halfW + lineT), yBack,
          xAt(yFrontB, cx - halfW + lineT), yFrontB,
          xAt(yFrontB, cx - halfW), yFrontB,
          boxColor
        );
        this.drawPoly(
          ctx,
          xAt(yBack, cx + halfW - lineT), yBack,
          xAt(yBack, cx + halfW), yBack,
          xAt(yFrontB, cx + halfW), yFrontB,
          xAt(yFrontB, cx + halfW - lineT), yFrontB,
          boxColor
        );
      }

      // Faixa Central Tracejada (omitida na reta limpa do Grid de Fórmula 1)
      const inGridZone = (segment.index >= 7 && segment.index <= START_LINE_SEG + 1);
      if (!inGridZone && c.lane !== 'transparent') {
        const laneW1 = p1.w / 28;
        const laneW2 = p2.w / 28;
        this.drawPoly(ctx, p1.x - laneW1, segBottomY, p1.x + laneW1, segBottomY, p2.x + laneW2, topY, p2.x - laneW2, topY, c.lane);
      }
    }

    drawPoly(ctx, x1, y1, x2, y2, x3, y3, x4, y4, color) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.lineTo(x4, y4);
      ctx.closePath();
      ctx.fill();
    }

    renderScenery(ctx, segment, scenery, def) {
      const scale = segment.p1.screen.scale;
      const sX = segment.p1.screen.x + (scale * scenery.offset * ROAD_WIDTH * REF_WIDTH / 2);
      const sY = segment.p1.screen.y;
      const size = 95 * scale * (REF_WIDTH / 2);

      if (size < 0.22) return;
      if (sX < -size * 6.0 || sX > INTERNAL_WIDTH + size * 6.0) return;

      // Estado do clima e iluminação do circuito
      const E = this.envCur;
      const S = E ? E.s : { night: 0, dusk: 0, rain: 0, snow: 0, sun: 1 };
      const isNight = S.night > 0.28;
      const isDusk = S.dusk > 0.25;
      const isSnow = (S.snow || 0) > 0.20;

      ctx.save();
      ctx.translate(sX, sY);

      // Sombra projetada no solo (ajustada para dia/noite)
      ctx.fillStyle = isNight ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.8, Math.max(1.5, size * 0.20), 0, 0, Math.PI * 2);
      ctx.fill();

      // Renderiza monumentos e pontos turísticos das capitais brasileiras
      if (typeof MonumentArt !== 'undefined' && MonumentArt.renderScenery) {
        MonumentArt.renderScenery(ctx, scenery.type, size, isNight, isDusk);
      }

      if (scenery.type === 'timing_tower') {
        // Torre alta de cronometragem de autódromo estilo Interlagos / Suzuka
        const tw = size * 2.1;
        const th = size * 6.8;
        const ty = -th;

        // Sombra na base
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.fillRect(-tw * 0.55, -size * 0.1, tw * 1.1, size * 0.3);

        // Estrutura metálica treliçada
        ctx.fillStyle = isNight ? '#0F172A' : '#1E293B';
        ctx.fillRect(-tw * 0.5, ty, tw, th);
        ctx.strokeStyle = isNight ? '#334155' : '#64748B';
        ctx.lineWidth = Math.max(1, size * 0.05);
        ctx.strokeRect(-tw * 0.5, ty, tw, th);

        // Painel digital luminoso preto
        const pw = tw * 0.88;
        const ph = th * 0.88;
        ctx.fillStyle = '#050912';
        ctx.fillRect(-pw * 0.5, ty + th * 0.06, pw, ph);

        // Topo com lâmpadas vermelhas de sinalização (piscando à noite)
        const blink = isNight ? (Math.sin(performance.now() * 0.008) > 0) : true;
        ctx.fillStyle = blink ? '#EF4444' : '#450A0A';
        ctx.fillRect(-tw * 0.4, ty - size * 0.16, tw * 0.8, size * 0.14);

        // Linhas de classificação digital luminosa (LED verde/âmbar)
        if (tw >= 5) {
          ctx.fillStyle = isNight ? '#FFEB3B' : '#FFD700';
          ctx.font = `bold ${Math.max(2.5, tw * 0.23).toFixed(1)}px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText('LEADER', 0, ty + th * 0.16);
          const topDrivers = ['1 HAM', '2 VER', '3 LEC', '4 NOR', '5 ALO'];
          for (let d = 0; d < topDrivers.length; d++) {
            ctx.fillStyle = d === 0 ? (isNight ? '#34D399' : '#10B981') : (isNight ? '#FDE047' : '#FBBF24');
            ctx.font = `bold ${Math.max(2.2, tw * 0.20).toFixed(1)}px monospace`;
            ctx.fillText(topDrivers[d], 0, ty + th * (0.30 + d * 0.13));
          }
        }
      } else if (scenery.type === 'pit_wall') {
        // Mureta dos boxes de autódromo com computadores e sinalização
        const pw = size * 3.0;
        const ph = size * 1.6;
        const py = -ph;

        ctx.fillStyle = isNight ? '#1E293B' : '#334155';
        ctx.fillRect(-pw * 0.5, py, pw, ph);
        ctx.fillStyle = '#DC2626';
        ctx.fillRect(-pw * 0.5, py, pw, ph * 0.14);
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(-pw * 0.5, py + ph * 0.14, pw, ph * 0.08);

        // Monitores de telemetria dos boxes (brilham no escuro)
        if (pw >= 14) {
          ctx.fillStyle = isNight ? '#38BDF8' : '#0284C7';
          ctx.fillRect(-pw * 0.38, py + ph * 0.24, pw * 0.32, ph * 0.38);
          ctx.fillStyle = isNight ? '#4ADE80' : '#10B981';
          ctx.fillRect(pw * 0.06, py + ph * 0.24, pw * 0.32, ph * 0.38);
        }
      } else if (scenery.type === 'palm') {
        // Palmeira tropical costeira alta estilo Top Gear / Arcade (proporção da imagem de referência)
        const toward = scenery.offset < 0 ? 1 : -1;
        const trunkCol = isNight ? '#1F140E' : (isDusk ? '#331B12' : '#4E342E');
        const trunkLight = isNight ? '#2E1E16' : (isDusk ? '#4A2B1D' : '#6D4C41');

        // Tronco alto e esguio curvado suavemente
        const trunkH = size * 10.5;
        const crownX = toward * size * 1.4;
        const crownY = -trunkH;

        ctx.strokeStyle = trunkCol;
        ctx.lineWidth = Math.max(2.4, size * 0.32);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(toward * size * 0.8, -trunkH * 0.52, crownX, crownY);
        ctx.stroke();

        ctx.strokeStyle = trunkLight;
        ctx.lineWidth = Math.max(1.2, size * 0.14);
        ctx.beginPath();
        ctx.moveTo(toward * size * 0.05, 0);
        ctx.quadraticCurveTo(toward * size * 0.75, -trunkH * 0.52, crownX - toward * size * 0.05, crownY);
        ctx.stroke();

        // Anéis da casca do tronco
        for (let k = 1; k < 9; k++) {
          const frac = k / 9;
          const kx = toward * size * 0.7 * Math.sin(frac * Math.PI);
          const ky = -trunkH * frac;
          ctx.strokeStyle = isNight ? '#140D09' : '#27160F';
          ctx.lineWidth = Math.max(1.0, size * 0.06);
          ctx.beginPath();
          ctx.moveTo(kx - size * 0.16, ky);
          ctx.lineTo(kx + size * 0.16, ky);
          ctx.stroke();
        }

        // Copa exuberante de palmas em leque (multi-camadas)
        const frondCols = isNight 
          ? ['#0A1C12', '#0E291B', '#133925', '#1B4A31']
          : (isDusk 
            ? ['#1C331B', '#274724', '#385C2E', '#4B7337']
            : ['#1B5E20', '#2E7D32', '#388E3C', '#4CAF50']);

        for (let f = 0; f < 10; f++) {
          const ang = (f / 9) * Math.PI * 1.15 - 0.15;
          const fx = crownX + Math.cos(ang) * size * 3.4;
          const fy = crownY - Math.sin(ang) * size * 1.8 + Math.abs(Math.cos(ang)) * size * 1.2;
          ctx.strokeStyle = frondCols[f % 4];
          ctx.lineWidth = Math.max(1.6, size * 0.18);
          ctx.beginPath();
          ctx.moveTo(crownX, crownY);
          ctx.quadraticCurveTo((crownX + fx) * 0.5, crownY - size * 1.4, fx, fy);
          ctx.stroke();
        }

        // Arbusto tropical denso na base do tronco (como no print)
        const b1 = isNight ? '#08170D' : (isDusk ? '#162C17' : '#1B5E20');
        const b2 = isNight ? '#0F2617' : (isDusk ? '#204221' : '#2E7D32');
        ctx.fillStyle = b1;
        ctx.beginPath();
        ctx.ellipse(0, -size * 0.45, size * 1.4, size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = b2;
        ctx.beginPath();
        ctx.ellipse(toward * size * 0.35, -size * 0.65, size * 1.0, size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (scenery.type === 'pine' || (scenery.type === 'tree' && def && def.theme === 'SERRA')) {
        // Pinheiro Araucária da Serra Catarinense (adaptável a dia, tarde, noite e neve)
        const trunkCol = isNight ? '#1B110B' : (isDusk ? '#2C1B12' : '#3E2419');
        ctx.fillStyle = trunkCol;
        ctx.fillRect(-size * 0.05, -size * 0.95, size * 0.10, size * 0.95);

        const layers = isNight
          ? [
              { y: -size * 0.94, rx: size * 0.46, ry: size * 0.13, c: '#0A1D13' },
              { y: -size * 0.98, rx: size * 0.36, ry: size * 0.10, c: '#0F281B' },
              { y: -size * 0.80, rx: size * 0.29, ry: size * 0.08, c: '#143624' },
              { y: -size * 0.64, rx: size * 0.23, ry: size * 0.06, c: '#122F20' }
            ]
          : (isDusk
            ? [
                { y: -size * 0.94, rx: size * 0.46, ry: size * 0.13, c: '#1B3322' },
                { y: -size * 0.98, rx: size * 0.36, ry: size * 0.10, c: '#23442D' },
                { y: -size * 0.80, rx: size * 0.29, ry: size * 0.08, c: '#2F5C3E' },
                { y: -size * 0.64, rx: size * 0.23, ry: size * 0.06, c: '#254E33' }
              ]
            : [
                { y: -size * 0.94, rx: size * 0.46, ry: size * 0.13, c: '#143C25' },
                { y: -size * 0.98, rx: size * 0.36, ry: size * 0.10, c: '#1C5233' },
                { y: -size * 0.80, rx: size * 0.29, ry: size * 0.08, c: '#267347' },
                { y: -size * 0.64, rx: size * 0.23, ry: size * 0.06, c: '#1E5E3A' }
              ]);

        for (let l of layers) {
          ctx.fillStyle = l.c;
          ctx.beginPath();
          ctx.ellipse(0, l.y, l.rx, l.ry, 0, 0, Math.PI * 2);
          ctx.fill();

          // Acúmulo de neve branca nos patamares da Araucária
          if (isSnow) {
            ctx.fillStyle = isNight ? '#CBD5E1' : '#FFFFFF';
            ctx.beginPath();
            ctx.ellipse(0, l.y - l.ry * 0.25, l.rx * 0.76, l.ry * 0.45, 0, Math.PI, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (scenery.type === 'bush') {
        // Arbustos costeiros verdes na beira da pista
        const b1 = isNight ? '#08170D' : (isDusk ? '#162C17' : '#0F3317');
        const b2 = isNight ? '#0F2617' : (isDusk ? '#204221' : '#185025');
        const b3 = isNight ? '#163821' : (isDusk ? '#2D5E32' : '#267A3B');
        ctx.fillStyle = b1;
        ctx.beginPath();
        ctx.ellipse(0, -size * 0.14, size * 0.34, size * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = b2;
        ctx.beginPath();
        ctx.ellipse(-size * 0.12, -size * 0.18, size * 0.22, size * 0.16, 0, 0, Math.PI * 2);
        ctx.ellipse(size * 0.12, -size * 0.16, size * 0.22, size * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = b3;
        ctx.beginPath();
        ctx.ellipse(0, -size * 0.22, size * 0.20, size * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (scenery.type === 'tree') {
        // Árvore frondosa com variação de tons e Ipês coloridos no Cerrado/Sudeste
        const trunkCol = isNight ? '#251A16' : (isDusk ? '#3B2723' : '#4E342E');
        ctx.fillStyle = trunkCol;
        ctx.fillRect(-size * 0.22, -size * 7.5, size * 0.44, size * 7.5);

        const ipeTracks = new Set(['brasilia', 'goiania', 'cuiaba', 'campo_grande', 'palmas', 'belo_horizonte', 'sao_paulo', 'brasil']);
        const isIpe = def && ipeTracks.has(def.id) && (Math.abs(segment.index) % 5 === 0);
        const isPurpleIpe = isIpe && (Math.abs(segment.index) % 10 === 0);

        let c1, c2, c3;
        if (isIpe && !isSnow) {
          if (isPurpleIpe) {
            c1 = isNight ? '#3B0764' : (isDusk ? '#7E22CE' : '#9333EA');
            c2 = isNight ? '#581C87' : (isDusk ? '#A855F7' : '#C084FC');
            c3 = isNight ? '#7E22CE' : (isDusk ? '#D8B4FE' : '#E9D5FF');
          } else {
            c1 = isNight ? '#713F12' : (isDusk ? '#CA8A04' : '#EAB308');
            c2 = isNight ? '#A16207' : (isDusk ? '#EAB308' : '#FACC15');
            c3 = isNight ? '#CA8A07' : (isDusk ? '#FDE047' : '#FEF08A');
          }
        } else {
          const altTone = (Math.abs(segment.index) % 3 === 1);
          c1 = isNight ? '#0B1F14' : (isDusk ? '#193B23' : (altTone ? '#166534' : '#145A32'));
          c2 = isNight ? '#112B1C' : (isDusk ? '#254F30' : (altTone ? '#15803D' : '#1E8449'));
          c3 = isNight ? '#183825' : (isDusk ? '#32663E' : (altTone ? '#4ADE80' : '#2ECC71'));
        }

        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.arc(0, -size * 7.2, size * 3.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = c2;
        ctx.beginPath();
        ctx.arc(-size * 1.4, -size * 7.8, size * 2.6, 0, Math.PI * 2);
        ctx.arc(size * 1.4, -size * 7.6, size * 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = c3;
        ctx.beginPath();
        ctx.arc(-size * 0.4, -size * 9.2, size * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Acúmulo de neve no topo da copa
        if (isSnow) {
          ctx.fillStyle = isNight ? '#CBD5E1' : '#FFFFFF';
          ctx.beginPath();
          ctx.ellipse(0, -size * 10.2, size * 2.2, size * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (scenery.type === 'sign_right' || scenery.type === 'sign_left') {
        // Placa indicativa de curva estilo autódromo com poste listrado e sombra no solo
        const sw = size * 1.65;
        const sh = size * 1.22;
        const sy = -size * 2.05;

        // Sombra oval na base
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.beginPath();
        ctx.ellipse(0, 0, sw * 0.42, Math.max(0.8, size * 0.14), 0, 0, Math.PI * 2);
        ctx.fill();

        // Haste listrada (amarelo/preto) de sustentação
        const postW = Math.max(1, size * 0.12);
        const postH = -sy - sh;
        ctx.fillStyle = isNight ? '#1E2530' : '#334155';
        ctx.fillRect(-postW * 0.5, sy + sh, postW, postH);
        ctx.fillStyle = isNight ? '#CA8A04' : '#FACC15';
        for (let st = 0; st < 3; st++) {
          ctx.fillRect(-postW * 0.5, sy + sh + postH * (st * 0.34), postW, postH * 0.16);
        }

        // Moldura externa escura com chanfro 3D
        ctx.fillStyle = isNight ? '#080C14' : '#0F172A';
        ctx.fillRect(-sw * 0.5, sy, sw, sh);
        ctx.fillStyle = isNight ? '#334155' : '#475569';
        ctx.fillRect(-sw * 0.5, sy, sw, Math.max(0.6, size * 0.06));

        // Painel interno da placa
        const border = Math.max(0.6, size * 0.08);
        const iw = sw - border * 2;
        const ih = sh - border * 2;
        const ix = -sw * 0.5 + border;
        const iy = sy + border;

        if (isNight) {
          ctx.save();
          ctx.shadowColor = '#FFEA00';
          ctx.shadowBlur = Math.max(1.5, size * 0.35);
          ctx.fillStyle = '#FFD54F';
          ctx.fillRect(ix, iy, iw, ih);

          // Borda retrorrefletiva
          ctx.strokeStyle = '#FFF9C4';
          ctx.lineWidth = Math.max(0.5, size * 0.04);
          ctx.strokeRect(ix, iy, iw, ih);
        } else if (isDusk) {
          ctx.fillStyle = '#FFA000';
          ctx.fillRect(ix, iy, iw, ih);
        } else {
          ctx.fillStyle = '#FFC107';
          ctx.fillRect(ix, iy, iw, ih);
        }

        // 1 único ponteiro indicando a direção (▶ ou ◀) em arte vetorial geométrica nítida
        const aw = iw * 0.50;
        const ah = ih * 0.60;
        const cx = ix + iw * 0.5;
        const cy = iy + ih * 0.5;

        ctx.fillStyle = '#111111';
        ctx.beginPath();
        if (scenery.type === 'sign_right') {
          // Ponteiro único apontando para a direita ▶
          ctx.moveTo(cx - aw * 0.5, cy - ah * 0.5);
          ctx.lineTo(cx + aw * 0.5, cy);
          ctx.lineTo(cx - aw * 0.5, cy + ah * 0.5);
        } else {
          // Ponteiro único apontando para a esquerda ◀
          ctx.moveTo(cx + aw * 0.5, cy - ah * 0.5);
          ctx.lineTo(cx - aw * 0.5, cy);
          ctx.lineTo(cx + aw * 0.5, cy + ah * 0.5);
        }
        ctx.closePath();
        ctx.fill();

        if (isNight) {
          ctx.restore();
        }
      } else if (scenery.type === 'streetlamp' || scenery.type === 'pole') {
        // Poste metálico moderno de iluminação pública alto (Padrão exato da imagem de referência)
        const towardRoad = scenery.offset < 0 ? 1 : -1;
        const poleCol = isNight ? '#475569' : (isDusk ? '#64748B' : '#94A3B8');
        const poleHighlight = isNight ? '#64748B' : (isDusk ? '#CBD5E1' : '#F1F5F9');
        const sleeveCol = isNight ? '#334155' : (isDusk ? '#475569' : '#CBD5E1');

        const poleH = size * 14.5;
        const mastH = size * 11.2;
        const sleeveW = size * 0.44;
        const sleeveH = size * 2.4;

        // Sombra oval na base do poste
        ctx.fillStyle = 'rgba(0, 0, 0, 0.26)';
        ctx.beginPath();
        ctx.ellipse(0, 0, sleeveW * 1.1, Math.max(0.8, size * 0.16), 0, 0, Math.PI * 2);
        ctx.fill();

        // 1. Manga cilíndrica de ancoragem alargada na base (conforme o print)
        ctx.fillStyle = sleeveCol;
        ctx.fillRect(-sleeveW * 0.5, -sleeveH, sleeveW, sleeveH);
        ctx.fillStyle = poleHighlight;
        ctx.fillRect(-sleeveW * 0.5, -sleeveH, sleeveW * 0.35, sleeveH);
        // Anel de transição do topo da manga
        ctx.fillStyle = isNight ? '#1E293B' : '#64748B';
        ctx.fillRect(-sleeveW * 0.58, -sleeveH - size * 0.18, sleeveW * 1.16, size * 0.18);

        // 2. Mastro tubular prateado esguio e alto
        ctx.strokeStyle = poleCol;
        ctx.lineWidth = Math.max(0.8, size * 0.22);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -sleeveH);
        ctx.lineTo(0, -mastH);
        // Curva suave de pescoço de ganso projetando sobre a pista
        const lampX = towardRoad * size * 3.4;
        const lampY = -poleH;
        ctx.quadraticCurveTo(0, lampY, lampX, lampY);
        ctx.stroke();

        // Chanfro metálico de reflexo de luz tubular
        ctx.strokeStyle = poleHighlight;
        ctx.lineWidth = Math.max(0.9, size * 0.08);
        ctx.beginPath();
        ctx.moveTo(towardRoad * 0.5, -sleeveH);
        ctx.lineTo(towardRoad * 0.5, -mastH);
        ctx.quadraticCurveTo(towardRoad * 0.5, lampY + size * 0.10, lampX, lampY + size * 0.10);
        ctx.stroke();

        // 3. Cabeçote retangular moderno da luminária
        const headW = size * 1.6;
        const headH = size * 0.42;
        ctx.fillStyle = isNight ? '#0F172A' : '#1E293B';
        ctx.fillRect(lampX - headW * 0.5, lampY - headH * 0.5, headW, headH);
        ctx.fillStyle = isNight ? '#334155' : '#64748B';
        ctx.fillRect(lampX - headW * 0.5, lampY - headH * 0.5, headW, headH * 0.28);

        if (isNight) {
          // NOITE: LÂMPADA PROPORCIONAL À DISTÂNCIA + FOCO NO ASFALTO MANTIDO
          const bulbR = Math.max(0.9, size * 0.70);
          const bulbGlow = ctx.createRadialGradient(lampX, lampY + size * 0.20, 0.2, lampX, lampY + size * 0.20, bulbR);
          bulbGlow.addColorStop(0, 'rgba(255, 255, 240, 0.70)');
          bulbGlow.addColorStop(0.40, 'rgba(255, 238, 120, 0.30)');
          bulbGlow.addColorStop(1, 'rgba(255, 215, 64, 0)');
          ctx.fillStyle = bulbGlow;
          ctx.beginPath();
          ctx.arc(lampX, lampY + size * 0.20, bulbR, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFFDE7';
          ctx.beginPath();
          ctx.arc(lampX, lampY + size * 0.20, Math.max(0.4, size * 0.20), 0, Math.PI * 2);
          ctx.fill();

          // Feixe cônico volumétrico translúcido iluminando a pista (como no print)
          const coneGrad = ctx.createLinearGradient(lampX, lampY, lampX, 0);
          coneGrad.addColorStop(0, 'rgba(255, 245, 157, 0.46)');
          coneGrad.addColorStop(0.40, 'rgba(255, 235, 110, 0.22)');
          coneGrad.addColorStop(1, 'rgba(255, 215, 64, 0.02)');
          ctx.fillStyle = coneGrad;
          ctx.beginPath();
          ctx.moveTo(lampX - size * 0.6, lampY + size * 0.35);
          ctx.lineTo(lampX + size * 0.6, lampY + size * 0.35);
          ctx.lineTo(lampX + size * 3.8, 0);
          ctx.lineTo(lampX - size * 3.8, 0);
          ctx.closePath();
          ctx.fill();

          // Poça elíptica quente de luz brilhante no asfalto (como no print)
          ctx.fillStyle = 'rgba(255, 235, 110, 0.32)';
          ctx.beginPath();
          ctx.ellipse(lampX, 0, size * 4.2, Math.max(2.5, size * 0.95), 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(255, 255, 220, 0.45)';
          ctx.beginPath();
          ctx.ellipse(lampX, 0, size * 2.6, Math.max(1.8, size * 0.60), 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (isDusk) {
          // TARDE / CREPÚSCULO (EXATAMENTE O CLIMA DO PRINT DE REFERÊNCIA)
          const duskR = Math.max(1.2, size * 1.5);
          const bulbGlow = ctx.createRadialGradient(lampX, lampY + size * 0.22, 0.3, lampX, lampY + size * 0.22, duskR);
          bulbGlow.addColorStop(0, 'rgba(255, 238, 170, 0.95)');
          bulbGlow.addColorStop(0.45, 'rgba(255, 193, 7, 0.65)');
          bulbGlow.addColorStop(1, 'rgba(255, 160, 0, 0)');
          ctx.fillStyle = bulbGlow;
          ctx.beginPath();
          ctx.arc(lampX, lampY + size * 0.22, duskR, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFF8E1';
          ctx.beginPath();
          ctx.arc(lampX, lampY + size * 0.22, Math.max(0.45, size * 0.25), 0, Math.PI * 2);
          ctx.fill();

          // Cone crepuscular
          const coneGrad = ctx.createLinearGradient(lampX, lampY, lampX, 0);
          coneGrad.addColorStop(0, 'rgba(255, 213, 79, 0.38)');
          coneGrad.addColorStop(0.50, 'rgba(255, 183, 77, 0.18)');
          coneGrad.addColorStop(1, 'rgba(255, 152, 0, 0.02)');
          ctx.fillStyle = coneGrad;
          ctx.beginPath();
          ctx.moveTo(lampX - size * 0.5, lampY + size * 0.35);
          ctx.lineTo(lampX + size * 0.5, lampY + size * 0.35);
          ctx.lineTo(lampX + size * 3.4, 0);
          ctx.lineTo(lampX - size * 3.4, 0);
          ctx.closePath();
          ctx.fill();

          // Poça quente dourada no asfalto
          ctx.fillStyle = 'rgba(255, 202, 40, 0.28)';
          ctx.beginPath();
          ctx.ellipse(lampX, 0, size * 3.8, Math.max(2.2, size * 0.85), 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // DIA: Lâmpada desligada proporcional à distância
          ctx.fillStyle = '#CBD5E1';
          ctx.beginPath();
          ctx.arc(lampX, lampY + size * 0.22, Math.max(0.4, size * 0.22), 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (scenery.type === 'building') {
        // Prédio 3D com parede lateral e janelas adaptadas ao horário
        const bGrad = isNight ? '#16202B' : (isDusk ? '#263238' : '#37474F');
        const bSide = isNight ? '#0D131A' : (isDusk ? '#1C252B' : '#263238');
        ctx.fillStyle = bGrad;
        ctx.fillRect(-size * 0.46, -size * 1.18, size * 0.78, size * 1.18);
        ctx.fillStyle = bSide;
        ctx.fillRect(size * 0.32, -size * 1.12, size * 0.16, size * 1.12);

        // Balizamento de topo piscante
        const bBeacon = (Math.sin(performance.now() * 0.006 + segment.index) > 0);
        ctx.fillStyle = bBeacon ? '#FF1744' : (isNight ? '#4A0812' : '#D32F2F');
        ctx.fillRect(-size * 0.08, -size * 1.24, size * 0.04, size * 0.04);

        for (let r = 0; r < 5; r++) {
          for (let c = 0; c < 3; c++) {
            const lit = ((segment.index + r * 3 + c) % 4 !== 0);
            if (isNight) {
              ctx.fillStyle = lit ? ((r + c) % 2 === 0 ? '#FFE082' : '#80DEEA') : '#1E293B';
            } else if (isDusk) {
              ctx.fillStyle = lit ? ((r + c) % 2 === 0 ? '#FFD54F' : '#B2EBF2') : '#37474F';
            } else {
              // Dia: reflexo suave dos vidros
              ctx.fillStyle = (r + c) % 2 === 0 ? '#CFD8DC' : '#ECEFF1';
            }
            ctx.fillRect(-size * 0.38 + c * (size * 0.23), -size * 1.06 + r * (size * 0.20), size * 0.13, size * 0.11);
          }
        }
      } else if (scenery.type === 'billboard') {
        // Outdoors retrô com suporte metálico duplo (Padrão da imagem de referência)
        const billIdx = Math.abs(segment.index) % 6;
        const bw = size * 7.5;
        const bh = size * 3.8;
        const by = -size * 6.0;

        // Sombra no solo entre os suportes do outdoor
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(-bw * 0.44, -size * 0.08, bw * 0.88, size * 0.22);

        // Pés metálicos duplos de sustentação fincados no solo (como no print)
        const legW = Math.max(1.6, size * 0.18);
        const legX1 = -bw * 0.34;
        const legX2 = bw * 0.34;
        const legCol = isNight ? '#1E2530' : '#475569';
        const legLight = isNight ? '#334155' : '#94A3B8';

        ctx.fillStyle = legCol;
        ctx.fillRect(legX1 - legW * 0.5, by + bh, legW, -by - bh);
        ctx.fillRect(legX2 - legW * 0.5, by + bh, legW, -by - bh);
        ctx.fillStyle = legLight;
        ctx.fillRect(legX1 - legW * 0.5, by + bh, legW * 0.4, -by - bh);
        ctx.fillRect(legX2 - legW * 0.5, by + bh, legW * 0.4, -by - bh);

        // Moldura externa da placa (Borda 16-bit com relevo)
        ctx.fillStyle = isNight ? '#0A0F1A' : '#0F172A';
        ctx.fillRect(-bw * 0.5, by, bw, bh);
        ctx.strokeStyle = isNight ? '#475569' : '#E2E8F0';
        ctx.lineWidth = Math.max(1.2, size * 0.14);
        ctx.strokeRect(-bw * 0.5, by, bw, bh);

        const pad = size * 0.20;
        const pw = bw - pad * 2;
        const ph = bh - pad * 2;
        const px = -bw * 0.5 + pad;
        const py = by + pad;

        const BRAZIL_STATES = [
          'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
          'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
          'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
        ];
        const stateCode = (def && def.stateCode && BRAZIL_STATES.includes(def.stateCode)) ? def.stateCode : null;

        if (stateCode) {
          const variant = billIdx % 3;
          if (variant === 0) {
            // Bandeira autêntica do estado da pista no outdoor
            this.renderStateFlag(ctx, stateCode, px, py, pw, ph, isNight);
          } else if (variant === 1) {
            // Placa de boas-vindas da capital / circuito
            ctx.fillStyle = isNight ? '#0B1324' : '#1E293B';
            ctx.fillRect(px, py, pw, ph);
            ctx.fillStyle = '#009739';
            ctx.fillRect(px, py, pw, ph * 0.18);
            ctx.fillStyle = '#FEDD00';
            ctx.fillRect(px, py + ph * 0.18, pw, ph * 0.10);
            if (pw > 7) {
              ctx.fillStyle = '#FFFFFF';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.font = `bold ${Math.max(2.5, ph * 0.26).toFixed(1)}px monospace`;
              ctx.fillText(def.name || stateCode, px + pw * 0.5, py + ph * 0.58);
              ctx.fillStyle = '#00E5FF';
              ctx.font = `bold ${Math.max(2, ph * 0.18).toFixed(1)}px monospace`;
              ctx.fillText('CIRCUITO OFICIAL F1', px + pw * 0.5, py + ph * 0.83);
            }
          } else {
            // Patrocinador retrô estilo F1
            const sponsors = [
              { bg: '#991B1B', accent: '#FACC15', title: 'APEX TIRES', sub: 'ULTRA GRIP' },
              { bg: '#0F172A', accent: '#00E5FF', title: 'NITRO TURBO', sub: 'MAX BOOST' },
              { bg: '#064E3B', accent: '#FEDD00', title: 'LH44 RACING', sub: 'BRASIL TOUR' }
            ];
            const sp = sponsors[Math.abs(segment.index) % sponsors.length];
            ctx.fillStyle = sp.bg;
            ctx.fillRect(px, py, pw, ph);
            ctx.fillStyle = sp.accent;
            ctx.fillRect(px, py + ph * 0.78, pw, ph * 0.22);
            if (pw > 7) {
              ctx.fillStyle = '#FFFFFF';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.font = `bold ${Math.max(2.5, ph * 0.30).toFixed(1)}px sans-serif`;
              ctx.fillText(sp.title, px + pw * 0.5, py + ph * 0.40);
              ctx.fillStyle = '#0F172A';
              ctx.font = `bold ${Math.max(2, ph * 0.16).toFixed(1)}px monospace`;
              ctx.fillText(sp.sub, px + pw * 0.5, py + ph * 0.89);
            }
          }
        } else {
          // Pistas sem estado (ex: Interlagos GP, Serra do Rio do Rastro, Cidade Metrópole, Cânions):
          // Mantém as placas exatamente como são atualmente
          const isBrasil = (!def || def.id === 'brasil');
          const isSerra = (def && def.id === 'serra');

          if (isBrasil) {
            if (billIdx === 0 || billIdx === 3) {
              // "LH44" com arco-íris retrô (Padrão Top Gear)
              ctx.fillStyle = isNight ? '#0F1A2E' : '#16233B';
              ctx.fillRect(px, py, pw, ph);
              const rCols = ['#E65100', '#F57C00', '#FFB300', '#00ACC1', '#1E88E5'];
              for (let r = 0; r < rCols.length; r++) {
                ctx.fillStyle = rCols[r];
                ctx.beginPath();
                ctx.moveTo(px, py + ph * 0.42 + r * (ph * 0.10));
                ctx.quadraticCurveTo(px + pw * 0.5, py + ph * 0.32 + r * (ph * 0.10), px + pw * 0.74, py + ph);
                ctx.lineTo(px + pw * 0.64, py + ph);
                ctx.quadraticCurveTo(px + pw * 0.45, py + ph * 0.38 + r * (ph * 0.10), px, py + ph * 0.50 + r * (ph * 0.10));
                ctx.fill();
              }
              if (size >= 1.2) {
                ctx.fillStyle = isNight ? '#FFFFFF' : '#F8FAFC';
                ctx.font = `900 ${Math.max(2.5, size * 1.45).toFixed(1)}px sans-serif`;
                ctx.textAlign = 'left';
                ctx.fillText('LH44', px + pw * 0.08, py + ph * 0.52);
              }
              ctx.fillStyle = isNight ? '#FFE082' : '#FFD54F';
              ctx.beginPath();
              ctx.arc(px + pw * 0.82, py + ph * 0.55, ph * 0.28, 0, Math.PI * 2);
              ctx.fill();
            } else if (billIdx === 1 || billIdx === 4) {
              // "LH44" vermelho clássico
              ctx.fillStyle = isNight ? '#7F1D1D' : '#B71C1C';
              ctx.fillRect(px, py, pw, ph);
              ctx.fillStyle = '#FFE082';
              ctx.fillRect(px, py + ph * 0.74, pw, ph * 0.14);
              if (size >= 1.2) {
                ctx.fillStyle = '#FFF';
                ctx.font = `900 ${Math.max(2.5, size * 1.35).toFixed(1)}px monospace`;
                ctx.textAlign = 'center';
                ctx.fillText('LH44', 0, py + ph * 0.54);
              }
            } else {
              // "LH44" verde/dourado
              ctx.fillStyle = isNight ? '#14461B' : '#1B5E20';
              ctx.fillRect(px, py, pw, ph);
              ctx.fillStyle = '#FDD835';
              ctx.fillRect(px + pw * 0.05, py + ph * 0.16, pw * 0.90, ph * 0.10);
              if (size >= 1.2) {
                ctx.fillStyle = '#FFF';
                ctx.font = `900 ${Math.max(2.5, size * 1.35).toFixed(1)}px monospace`;
                ctx.textAlign = 'center';
                ctx.fillText('LH44', 0, py + ph * 0.65);
              }
            }
          } else if (isSerra) {
            if (billIdx % 2 === 0) {
              // "LH44" laranja montanha
              ctx.fillStyle = isNight ? '#9A3412' : '#E65100';
              ctx.fillRect(px, py, pw, ph);
              if (size >= 1.2) {
                ctx.fillStyle = '#FFF';
                ctx.font = `900 ${Math.max(2.5, size * 1.35).toFixed(1)}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText('LH44', 0, py + ph * 0.58);
              }
            } else {
              // "LH44" verde rali
              ctx.fillStyle = isNight ? '#0E2317' : '#1A3826';
              ctx.fillRect(px, py, pw, ph);
              ctx.fillStyle = '#F59E0B';
              ctx.fillRect(px, py + ph * 0.78, pw, ph * 0.12);
              if (size >= 1.2) {
                ctx.fillStyle = '#FFF';
                ctx.font = `900 ${Math.max(2.5, size * 1.35).toFixed(1)}px monospace`;
                ctx.textAlign = 'center';
                ctx.fillText('LH44', 0, py + ph * 0.56);
              }
            }
          } else {
            // "LH44" neon metrópole
            ctx.fillStyle = (billIdx % 2 === 0) ? (isNight ? '#17092C' : '#1E1238') : (isNight ? '#07161F' : '#0B1D28');
            ctx.fillRect(px, py, pw, ph);
            if (size >= 1.2) {
              ctx.fillStyle = (billIdx % 2 === 0) ? '#FF007F' : '#00F0FF';
              ctx.font = `900 ${Math.max(2.5, size * 1.4).toFixed(1)}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.fillText('LH44', 0, py + ph * 0.58);
            }
          }
        }

        // Hastes de refletores superiores (iluminação noturna)
        const spotX1 = -bw * 0.28;
        const spotX2 = bw * 0.28;
        const spotArmY = by - size * 0.35;
        ctx.strokeStyle = isNight ? '#475569' : '#64748B';
        ctx.lineWidth = Math.max(1.0, size * 0.10);
        ctx.beginPath();
        ctx.moveTo(spotX1, by);
        ctx.lineTo(spotX1, spotArmY);
        ctx.moveTo(spotX2, by);
        ctx.lineTo(spotX2, spotArmY);
        ctx.stroke();

        // Lâmpadas dos refletores
        if (isNight) {
          for (let sx of [spotX1, spotX2]) {
            ctx.fillStyle = '#FFFDE7';
            ctx.beginPath();
            ctx.arc(sx, spotArmY, Math.max(1.5, size * 0.16), 0, Math.PI * 2);
            ctx.fill();

            const spotGrad = ctx.createLinearGradient(sx, spotArmY, sx, by + bh);
            spotGrad.addColorStop(0, 'rgba(255, 249, 196, 0.45)');
            spotGrad.addColorStop(1, 'rgba(255, 238, 88, 0)');
            ctx.fillStyle = spotGrad;
            ctx.beginPath();
            ctx.moveTo(sx - size * 0.20, spotArmY);
            ctx.lineTo(sx + size * 0.20, spotArmY);
            ctx.lineTo(sx + size * 1.5, by + bh);
            ctx.lineTo(sx - size * 1.5, by + bh);
            ctx.closePath();
            ctx.fill();
          }
        } else if (isDusk) {
          for (let sx of [spotX1, spotX2]) {
            ctx.fillStyle = '#FFE082';
            ctx.beginPath();
            ctx.arc(sx, spotArmY, Math.max(1.2, size * 0.12), 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          ctx.fillStyle = '#94A3B8';
          ctx.beginPath();
          ctx.arc(spotX1, spotArmY, Math.max(1.0, size * 0.10), 0, Math.PI * 2);
          ctx.arc(spotX2, spotArmY, Math.max(1.0, size * 0.10), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }

    renderStateFlag(ctx, stateCode, px, py, pw, ph, isNight) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(px, py, pw, ph);
      ctx.clip();

      const cx = px + pw * 0.5;
      const cy = py + ph * 0.5;

      switch (stateCode) {
        case 'BA': { // BAHIA: 4 listras horizontais + cantão azul com triângulo branco
          const sh = ph / 4;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(px, py, pw, sh);
          ctx.fillRect(px, py + sh * 2, pw, sh);
          ctx.fillStyle = '#DC2626';
          ctx.fillRect(px, py + sh, pw, sh);
          ctx.fillRect(px, py + sh * 3, pw, sh);
          const cw = pw * 0.38;
          const ch = sh * 2;
          ctx.fillStyle = '#1D4ED8';
          ctx.fillRect(px, py, cw, ch);
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.moveTo(px + cw * 0.5, py + ch * 0.18);
          ctx.lineTo(px + cw * 0.82, py + ch * 0.82);
          ctx.lineTo(px + cw * 0.18, py + ch * 0.82);
          ctx.closePath();
          ctx.fill();
          break;
        }

        case 'SP': { // SÃO PAULO: 13 listras preto/branco + cantão vermelho com círculo
          const sh = ph / 13;
          for (let i = 0; i < 13; i++) {
            ctx.fillStyle = (i % 2 === 0) ? '#111827' : '#F8FAFC';
            ctx.fillRect(px, py + i * sh, pw, sh);
          }
          const cw = pw * 0.40;
          const ch = sh * 5;
          ctx.fillStyle = '#DC2626';
          ctx.fillRect(px, py, cw, ch);
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(px + cw * 0.5, py + ch * 0.5, ch * 0.34, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1E3A8A';
          ctx.beginPath();
          ctx.arc(px + cw * 0.5, py + ch * 0.5, ch * 0.25, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#FBBF24';
          const starPts = [
            [px + cw * 0.14, py + ch * 0.20],
            [px + cw * 0.86, py + ch * 0.20],
            [px + cw * 0.14, py + ch * 0.80],
            [px + cw * 0.86, py + ch * 0.80]
          ];
          for (let pt of starPts) {
            ctx.beginPath();
            ctx.arc(pt[0], pt[1], Math.max(1, ch * 0.08), 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }

        case 'RJ': { // RIO DE JANEIRO: Esquartelada branco e azul celeste com brasão
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(px, py, pw * 0.5, ph * 0.5);
          ctx.fillRect(px + pw * 0.5, py + ph * 0.5, pw * 0.5, ph * 0.5);
          ctx.fillStyle = '#38BDF8';
          ctx.fillRect(px + pw * 0.5, py, pw * 0.5, ph * 0.5);
          ctx.fillRect(px, py + ph * 0.5, pw * 0.5, ph * 0.5);
          ctx.strokeStyle = '#15803D';
          ctx.lineWidth = Math.max(1.5, ph * 0.07);
          ctx.beginPath();
          ctx.ellipse(cx, cy, pw * 0.15, ph * 0.32, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#0284C7';
          ctx.beginPath();
          ctx.ellipse(cx, cy, pw * 0.11, ph * 0.24, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#F8FAFC';
          ctx.beginPath();
          ctx.arc(cx, cy - ph * 0.05, ph * 0.08, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'MG': { // MINAS GERAIS: Campo branco com triângulo vermelho central
          ctx.fillStyle = '#F8FAFC';
          ctx.fillRect(px, py, pw, ph);
          ctx.fillStyle = '#DC2626';
          ctx.beginPath();
          ctx.moveTo(cx, cy - ph * 0.36);
          ctx.lineTo(cx + pw * 0.24, cy + ph * 0.28);
          ctx.lineTo(cx - pw * 0.24, cy + ph * 0.28);
          ctx.closePath();
          ctx.fill();
          break;
        }

        case 'DF': { // DISTRITO FEDERAL: Campo branco com Cruz de Brasília verde e amarela
          ctx.fillStyle = '#F8FAFC';
          ctx.fillRect(px, py, pw, ph);
          const sq = ph * 0.50;
          ctx.fillStyle = '#15803D';
          ctx.fillRect(cx - sq * 0.5, cy - sq * 0.5, sq, sq);
          ctx.fillStyle = '#FBBF24';
          const fLen = sq * 0.38;
          ctx.fillRect(cx - sq * 0.12, cy - sq * 0.5, sq * 0.24, fLen);
          ctx.fillRect(cx - sq * 0.12, cy + sq * 0.5 - fLen, sq * 0.24, fLen);
          ctx.fillRect(cx - sq * 0.5, cy - sq * 0.12, fLen, sq * 0.24);
          ctx.fillRect(cx + sq * 0.5 - fLen, cy - sq * 0.12, fLen, sq * 0.24);
          break;
        }

        case 'RS': { // RIO GRANDE DO SUL: 3 faixas diagonais (Verde, Vermelho, Amarelo)
          ctx.fillStyle = '#15803D';
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + pw * 0.55, py);
          ctx.lineTo(px, py + ph * 0.65);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#DC2626';
          ctx.beginPath();
          ctx.moveTo(px + pw * 0.55, py);
          ctx.lineTo(px + pw, py);
          ctx.lineTo(px + pw, py + ph * 0.35);
          ctx.lineTo(px + pw * 0.45, py + ph);
          ctx.lineTo(px, py + ph);
          ctx.lineTo(px, py + ph * 0.65);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#FBBF24';
          ctx.beginPath();
          ctx.moveTo(px + pw, py + ph * 0.35);
          ctx.lineTo(px + pw, py + ph);
          ctx.lineTo(px + pw * 0.45, py + ph);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.ellipse(cx, cy, pw * 0.14, ph * 0.26, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#D97706';
          ctx.lineWidth = Math.max(1, ph * 0.04);
          ctx.stroke();
          break;
        }

        case 'PR': { // PARANÁ: Campo verde, faixa diagonal branca, esfera azul com estrelas
          ctx.fillStyle = '#15803D';
          ctx.fillRect(px, py, pw, ph);
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.moveTo(px, py + ph * 0.22);
          ctx.lineTo(px + pw * 0.25, py);
          ctx.lineTo(px + pw, py + ph * 0.78);
          ctx.lineTo(px + pw * 0.75, py + ph);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#1E3A8A';
          ctx.beginPath();
          ctx.arc(cx, cy, ph * 0.22, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(1, ph * 0.04), 0, Math.PI * 2);
          ctx.arc(cx - ph * 0.08, cy - ph * 0.05, Math.max(1, ph * 0.035), 0, Math.PI * 2);
          ctx.arc(cx + ph * 0.08, cy - ph * 0.04, Math.max(1, ph * 0.035), 0, Math.PI * 2);
          ctx.arc(cx, cy - ph * 0.10, Math.max(1, ph * 0.035), 0, Math.PI * 2);
          ctx.arc(cx + ph * 0.04, cy + ph * 0.08, Math.max(1, ph * 0.03), 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'PE': { // PERNAMBUCO: Azul/Branco com arco-íris, sol, estrela e cruz vermelha
          ctx.fillStyle = '#1E3A8A';
          ctx.fillRect(px, py, pw, ph * 0.55);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(px, py + ph * 0.55, pw, ph * 0.45);
          const rbColors = ['#DC2626', '#FBBF24', '#16A34A'];
          for (let r = 0; r < 3; r++) {
            ctx.strokeStyle = rbColors[r];
            ctx.lineWidth = Math.max(1.2, ph * 0.045);
            ctx.beginPath();
            ctx.arc(cx, py + ph * 0.54, ph * (0.34 - r * 0.045), Math.PI, 0);
            ctx.stroke();
          }
          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.arc(cx, py + ph * 0.54, ph * 0.14, Math.PI, 0);
          ctx.fill();
          ctx.fillStyle = '#FBBF24';
          ctx.beginPath();
          ctx.arc(cx, py + ph * 0.12, Math.max(1.5, ph * 0.05), 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#DC2626';
          const cw = pw * 0.045;
          const ch = ph * 0.30;
          ctx.fillRect(cx - cw * 0.5, py + ph * 0.62, cw, ch);
          ctx.fillRect(cx - cw * 1.8, py + ph * 0.70, cw * 3.6, cw);
          break;
        }

        case 'CE': { // CEARÁ: Campo verde, losango amarelo e círculo branco/verde
          ctx.fillStyle = '#15803D';
          ctx.fillRect(px, py, pw, ph);
          ctx.fillStyle = '#FBBF24';
          ctx.beginPath();
          ctx.moveTo(cx, py + ph * 0.10);
          ctx.lineTo(px + pw * 0.90, cy);
          ctx.lineTo(cx, py + ph * 0.90);
          ctx.lineTo(px + pw * 0.10, cy);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(cx, cy, ph * 0.22, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#15803D';
          ctx.beginPath();
          ctx.arc(cx, cy, ph * 0.15, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'SC': { // SANTA CATARINA: Vermelho, Branco, Vermelho com losango verde
          const sh = ph / 3;
          ctx.fillStyle = '#DC2626';
          ctx.fillRect(px, py, pw, sh);
          ctx.fillRect(px, py + sh * 2, pw, sh);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(px, py + sh, pw, sh);
          ctx.fillStyle = '#15803D';
          ctx.beginPath();
          ctx.moveTo(cx, py + ph * 0.18);
          ctx.lineTo(cx + pw * 0.18, cy);
          ctx.lineTo(cx, py + ph * 0.82);
          ctx.lineTo(cx - pw * 0.18, cy);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#FBBF24';
          ctx.beginPath();
          ctx.arc(cx, cy, ph * 0.08, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'GO': { // GOIÁS: 8 listras verdes e amarelas com cantão azul e estrelas
          const sh = ph / 8;
          for (let i = 0; i < 8; i++) {
            ctx.fillStyle = (i % 2 === 0) ? '#15803D' : '#FBBF24';
            ctx.fillRect(px, py + i * sh, pw, sh);
          }
          const cw = pw * 0.38;
          const ch = sh * 4;
          ctx.fillStyle = '#1E3A8A';
          ctx.fillRect(px, py, cw, ch);
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(px + cw * 0.5, py + ch * 0.5, Math.max(1, ch * 0.08), 0, Math.PI * 2);
          ctx.arc(px + cw * 0.5, py + ch * 0.24, Math.max(1, ch * 0.07), 0, Math.PI * 2);
          ctx.arc(px + cw * 0.5, py + ch * 0.76, Math.max(1, ch * 0.07), 0, Math.PI * 2);
          ctx.arc(px + cw * 0.28, py + ch * 0.45, Math.max(1, ch * 0.07), 0, Math.PI * 2);
          ctx.arc(px + cw * 0.72, py + ch * 0.45, Math.max(1, ch * 0.07), 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'ES': { // ESPÍRITO SANTO: Azul Claro, Branco, Rosa com lema
          const sh = ph / 3;
          ctx.fillStyle = '#38BDF8';
          ctx.fillRect(px, py, pw, sh);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(px, py + sh, pw, sh);
          ctx.fillStyle = '#F472B6';
          ctx.fillRect(px, py + sh * 2, pw, sh);
          ctx.fillStyle = '#0284C7';
          ctx.font = `bold ${Math.max(4, Math.floor(ph * 0.16))}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('TRABALHA E CONFIA', cx, py + sh * 1.62);
          break;
        }

        case 'AM': { // AMAZONAS: Branco, Vermelho, Branco com cantão azul
          const sh = ph / 3;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(px, py, pw, sh);
          ctx.fillRect(px, py + sh * 2, pw, sh);
          ctx.fillStyle = '#DC2626';
          ctx.fillRect(px, py + sh, pw, sh);
          const cw = pw * 0.42;
          const ch = sh * 2;
          ctx.fillStyle = '#1E3A8A';
          ctx.fillRect(px, py, cw, ch);
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(px + cw * 0.5, py + ch * 0.5, Math.max(1.5, ch * 0.12), 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'PA': { // PARÁ: Vermelho com faixa branca diagonal e estrela azul
          ctx.fillStyle = '#DC2626';
          ctx.fillRect(px, py, pw, ph);
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.moveTo(px, py + ph * 0.18);
          ctx.lineTo(px + pw * 0.22, py);
          ctx.lineTo(px + pw, py + ph * 0.82);
          ctx.lineTo(px + pw * 0.78, py + ph);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#1E3A8A';
          ctx.beginPath();
          ctx.arc(cx, cy, ph * 0.12, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'RN': { // RIO GRANDE DO NORTE: Verde e Branco com escudo dourado
          ctx.fillStyle = '#15803D';
          ctx.fillRect(px, py, pw, ph * 0.5);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(px, py + ph * 0.5, pw, ph * 0.5);
          ctx.fillStyle = '#FBBF24';
          ctx.beginPath();
          ctx.ellipse(cx, cy, pw * 0.15, ph * 0.28, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#15803D';
          ctx.fillRect(cx - 1, cy - ph * 0.12, 2, ph * 0.22);
          ctx.beginPath();
          ctx.arc(cx, cy - ph * 0.12, ph * 0.08, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'AL': { // ALAGOAS: Vermelho, Branco, Azul vertical com brasão
          const sw = pw / 3;
          ctx.fillStyle = '#DC2626';
          ctx.fillRect(px, py, sw, ph);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(px + sw, py, sw, ph);
          ctx.fillStyle = '#1E3A8A';
          ctx.fillRect(px + sw * 2, py, sw, ph);
          ctx.fillStyle = '#FBBF24';
          ctx.beginPath();
          ctx.arc(cx, cy, ph * 0.18, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'PB': { // PARAÍBA: Preto 1/3, Vermelho 2/3 com texto NÉGO
          const bw = pw * 0.33;
          ctx.fillStyle = '#111827';
          ctx.fillRect(px, py, bw, ph);
          ctx.fillStyle = '#DC2626';
          ctx.fillRect(px + bw, py, pw - bw, ph);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `900 ${Math.max(6, Math.floor(ph * 0.30))}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('NÉGO', px + bw + (pw - bw) * 0.5, cy + ph * 0.10);
          break;
        }

        case 'MA': { // MARANHÃO: 9 listras horizontais com cantão azul e estrela
          const sh = ph / 9;
          const mCols = ['#FFFFFF', '#111827', '#DC2626'];
          for (let i = 0; i < 9; i++) {
            ctx.fillStyle = mCols[i % 3];
            ctx.fillRect(px, py + i * sh, pw, sh);
          }
          const cw = pw * 0.38;
          const ch = sh * 4;
          ctx.fillStyle = '#1E3A8A';
          ctx.fillRect(px, py, cw, ch);
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(px + cw * 0.5, py + ch * 0.5, Math.max(1.5, ch * 0.20), 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'PI': { // PIAUÍ: 13 listras verdes/amarelas com cantão azul
          const sh = ph / 13;
          for (let i = 0; i < 13; i++) {
            ctx.fillStyle = (i % 2 === 0) ? '#15803D' : '#FBBF24';
            ctx.fillRect(px, py + i * sh, pw, sh);
          }
          const cw = pw * 0.40;
          const ch = sh * 6;
          ctx.fillStyle = '#1E3A8A';
          ctx.fillRect(px, py, cw, ch);
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(px + cw * 0.5, py + ch * 0.5, Math.max(1.5, ch * 0.20), 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'SE': { // SERGIPE: 4 listras verdes e amarelas com cantão azul e 5 estrelas
          const sh = ph / 4;
          ctx.fillStyle = '#15803D';
          ctx.fillRect(px, py, pw, sh);
          ctx.fillRect(px, py + sh * 2, pw, sh);
          ctx.fillStyle = '#FBBF24';
          ctx.fillRect(px, py + sh, pw, sh);
          ctx.fillRect(px, py + sh * 3, pw, sh);
          const cw = pw * 0.38;
          const ch = sh * 2;
          ctx.fillStyle = '#1E3A8A';
          ctx.fillRect(px, py, cw, ch);
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(px + cw * 0.5, py + ch * 0.5, Math.max(1, ch * 0.08), 0, Math.PI * 2);
          ctx.arc(px + cw * 0.28, py + ch * 0.32, Math.max(1, ch * 0.06), 0, Math.PI * 2);
          ctx.arc(px + cw * 0.72, py + ch * 0.32, Math.max(1, ch * 0.06), 0, Math.PI * 2);
          ctx.arc(px + cw * 0.28, py + ch * 0.68, Math.max(1, ch * 0.06), 0, Math.PI * 2);
          ctx.arc(px + cw * 0.72, py + ch * 0.68, Math.max(1, ch * 0.06), 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'MT': { // MATO GROSSO: Azul com losango branco, círculo verde e estrela amarela
          ctx.fillStyle = '#1E3A8A';
          ctx.fillRect(px, py, pw, ph);
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.moveTo(cx, py + ph * 0.12);
          ctx.lineTo(px + pw * 0.88, cy);
          ctx.lineTo(cx, py + ph * 0.88);
          ctx.lineTo(px + pw * 0.12, cy);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#15803D';
          ctx.beginPath();
          ctx.arc(cx, cy, ph * 0.24, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#FBBF24';
          ctx.beginPath();
          ctx.arc(cx, cy, ph * 0.12, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'MS': { // MATO GROSSO DO SUL: Verde, faixa branca, Azul com estrela dourada
          ctx.fillStyle = '#15803D';
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + pw, py);
          ctx.lineTo(px, py + ph);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#1E3A8A';
          ctx.beginPath();
          ctx.moveTo(px + pw, py);
          ctx.lineTo(px + pw, py + ph);
          ctx.lineTo(px, py + ph);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = Math.max(2, ph * 0.14);
          ctx.beginPath();
          ctx.moveTo(px, py + ph);
          ctx.lineTo(px + pw, py);
          ctx.stroke();

          ctx.fillStyle = '#FBBF24';
          ctx.beginPath();
          ctx.arc(px + pw * 0.82, py + ph * 0.75, ph * 0.11, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'RO': { // RONDÔNIA: Azul/Verde com triângulo branco e estrela amarela
          ctx.fillStyle = '#1E3A8A';
          ctx.fillRect(px, py, pw, ph * 0.5);
          ctx.fillStyle = '#15803D';
          ctx.fillRect(px, py + ph * 0.5, pw, ph * 0.5);
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.moveTo(px, py + ph);
          ctx.lineTo(cx, py + ph * 0.25);
          ctx.lineTo(px + pw, py + ph);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#FBBF24';
          ctx.beginPath();
          ctx.arc(cx, py + ph * 0.55, ph * 0.14, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'AC': { // ACRE: Diagonal Amarelo/Verde com estrela vermelha
          ctx.fillStyle = '#FBBF24';
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + pw, py);
          ctx.lineTo(px, py + ph);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#15803D';
          ctx.beginPath();
          ctx.moveTo(px + pw, py);
          ctx.lineTo(px + pw, py + ph);
          ctx.lineTo(px, py + ph);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#DC2626';
          ctx.beginPath();
          ctx.arc(px + pw * 0.22, py + ph * 0.28, ph * 0.12, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'AP': { // AMAPÁ: Azul/Verde com faixa branca/amarela e triângulo verde
          ctx.fillStyle = '#0284C7';
          ctx.fillRect(px, py, pw, ph * 0.45);
          ctx.fillStyle = '#15803D';
          ctx.fillRect(px, py + ph * 0.55, pw, ph * 0.45);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(px, py + ph * 0.45, pw, ph * 0.10);
          ctx.fillStyle = '#FBBF24';
          ctx.fillRect(px, py + ph * 0.48, pw, ph * 0.04);
          ctx.fillStyle = '#15803D';
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + pw * 0.28, cy);
          ctx.lineTo(px, py + ph);
          ctx.closePath();
          ctx.fill();
          break;
        }

        case 'RR': { // RORAIMA: Diagonais Azul/Branco/Verde com estrela amarela e linha vermelha
          ctx.fillStyle = '#0284C7';
          ctx.fillRect(px, py, pw, ph);
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.moveTo(px, py + ph);
          ctx.lineTo(px + pw * 0.35, py);
          ctx.lineTo(px + pw * 0.70, py);
          ctx.lineTo(px + pw, py + ph * 0.65);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#15803D';
          ctx.beginPath();
          ctx.moveTo(px + pw * 0.70, py);
          ctx.lineTo(px + pw, py);
          ctx.lineTo(px + pw, py + ph * 0.65);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#DC2626';
          ctx.fillRect(px, py + ph * 0.90, pw, ph * 0.10);
          ctx.fillStyle = '#FBBF24';
          ctx.beginPath();
          ctx.arc(cx, cy, ph * 0.18, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'TO': { // TOCANTINS: Diagonais Azul/Branco/Amarelo com sol estilizado
          ctx.fillStyle = '#1E3A8A';
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + pw * 0.55, py);
          ctx.lineTo(px, py + ph * 0.65);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.moveTo(px + pw * 0.55, py);
          ctx.lineTo(px + pw, py);
          ctx.lineTo(px + pw, py + ph * 0.35);
          ctx.lineTo(px + pw * 0.45, py + ph);
          ctx.lineTo(px, py + ph);
          ctx.lineTo(px, py + ph * 0.65);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#FBBF24';
          ctx.beginPath();
          ctx.moveTo(px + pw, py + ph * 0.35);
          ctx.lineTo(px + pw, py + ph);
          ctx.lineTo(px + pw * 0.45, py + ph);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.arc(cx, cy, ph * 0.16, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        default:
          break;
      }

      ctx.restore();
    }

    renderParticles(ctx) {
      if (!this.player || (this.state !== 'RACING' && this.state !== 'COUNTDOWN' && this.state !== 'PAUSED')) return;
      const anchorX = this.playerRenderPos ? this.playerRenderPos.x : (INTERNAL_WIDTH / 2);
      const anchorY = this.playerRenderPos ? (this.playerRenderPos.y + 18) : (INTERNAL_HEIGHT - 22);
      ctx.save();
      for (let pt of this.particlePool.pool) {
        if (!pt.active) continue;
        const dz = this.shortestDeltaZ(this.player.z, pt.z);
        const scale = Math.max(0.15, pt.life / pt.maxLife);
        const sX = anchorX + (pt.x - this.player.x) * (REF_WIDTH * 0.5);
        const sY = anchorY + pt.y * 45 + dz * 0.06;
        if (sY > INTERNAL_HEIGHT + 8 || sY < INTERNAL_HEIGHT * 0.45) continue;
        ctx.globalAlpha = Math.min(1, scale * 1.15);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(sX, sY, 2.2 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

  }
  const descs = Object.getOwnPropertyDescriptors(RoadRenderer.prototype);
  delete descs.constructor;
  Object.defineProperties(LH44RacingGame.prototype, descs);
})();
