/**
 * LH44 - LOW TO HIGH SPEED
 * Renderização do HUD de corrida, velocímetro, minigrid e efeitos de velocidade
 */
(function () {
  class HudRenderer {
    renderSpeedLines(ctx) {
      if (!this.player || !this.player.model) return;
      const spd = this.player.speed;
      const maxSpd = this.getEffectiveMaxSpeed(this.player);
      const isNitro = this.player.isNitro;
      const isSlingshot = !isNitro && (this.player.slipstreamDecayTimer > 0);
      const isDraftCharged = !isNitro && this.player.inSlipstream && ((this.player.slipstreamIntensity || 0) >= 0.70);
      const isOverspeed = (spd > maxSpd + 2);
      if (!isNitro && !isSlingshot && !isDraftCharged && !isOverspeed && spd < maxSpd * 0.90) return;

      const pos = this.playerRenderPos || { x: INTERNAL_WIDTH / 2, y: INTERNAL_HEIGHT - 32 };
      const cx = pos.x;
      const cy = pos.y;
      const w = PLAYER_CAR_W;
      const h = PLAYER_CAR_H;

      const overFactor = Math.min(1.0, isOverspeed ? ((spd - maxSpd) / 45) : ((spd - maxSpd * 0.90) / (maxSpd * 0.10)));
      const baseAlpha = isNitro ? 0.72 : (isSlingshot ? 0.65 : (isDraftCharged ? 0.48 : (isOverspeed ? (0.35 + overFactor * 0.35) : 0.22)));
      const strokeStyleBase = isNitro ? '0, 230, 255' : (isSlingshot ? '255, 215, 0' : (isDraftCharged ? '0, 255, 136' : '255, 255, 255'));
      const steerOffset = (this.player.steerAngle || 0) * 16;
      const t = performance.now() / 1000;
      const flowSpeed = Math.max(3.0, (spd / 100) * 4.6);

      // Brilho energético nas bordas laterais da tela durante Slingshot (vácuo carregado 100%)
      if ((isSlingshot || isDraftCharged) && this.state === 'RACING') {
        const edgeAlpha = isSlingshot
          ? (0.20 + 0.10 * Math.sin(t * 18)) * Math.min(1, this.player.slipstreamDecayTimer / 0.5)
          : 0.11;
        const edgeCol = isSlingshot ? `rgba(255, 215, 0, ${edgeAlpha.toFixed(3)})` : `rgba(0, 229, 255, ${edgeAlpha.toFixed(3)})`;
        ctx.save();
        const leftG = ctx.createLinearGradient(0, 0, 22, 0);
        leftG.addColorStop(0, edgeCol);
        leftG.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = leftG;
        ctx.fillRect(0, 0, 22, INTERNAL_HEIGHT);

        const rightG = ctx.createLinearGradient(INTERNAL_WIDTH, 0, INTERNAL_WIDTH - 22, 0);
        rightG.addColorStop(0, edgeCol);
        rightG.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = rightG;
        ctx.fillRect(INTERNAL_WIDTH - 22, 0, 22, INTERNAL_HEIGHT);
        ctx.restore();
      }

      // Chamas pulsantes de Nitro saindo dos escapamentos
      if (isNitro && (this.state === 'RACING')) {
        ctx.save();
        const flameLen = 10 + Math.sin(t * 48) * 3.5;
        for (const side of [-1, 1]) {
          const ex = cx + side * (w * 0.16);
          const ey = cy + h * 0.24;
          ctx.fillStyle = 'rgba(0, 229, 255, 0.78)';
          ctx.beginPath();
          ctx.moveTo(ex - 3.2, ey);
          ctx.lineTo(ex + 3.2, ey);
          ctx.lineTo(ex + (Math.random() - 0.5) * 1.5, ey + flameLen);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
          ctx.beginPath();
          ctx.moveTo(ex - 1.6, ey);
          ctx.lineTo(ex + 1.6, ey);
          ctx.lineTo(ex, ey + flameLen * 0.55);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // Efeito de vento aerodinâmico partindo diretamente do carro (estilo Need for Speed Carbon)
      // O vidro traseiro fica 100% limpo em qualquer carro: nenhum feixe passa pelo vidro.
      // Os feixes centrais iniciam abaixo do vidro traseiro (tampa do motor, placa e difusor).
      // Os feixes laterais iniciam nos ombros externos e para-lamas, bem afastados da cabine.
      const streams = [
        // Feixes laterais externos (completamente fora da cabine / vidro traseiro)
        { rx: -0.48, ry:  0.12, spread: 0.72, len: 64, phase: 0.35, lw: 1.00 },
        { rx:  0.48, ry:  0.12, spread: 0.72, len: 64, phase: 0.85, lw: 1.00 },
        { rx: -0.38, ry:  0.18, spread: 0.58, len: 58, phase: 0.05, lw: 0.90 },
        { rx:  0.38, ry:  0.18, spread: 0.58, len: 58, phase: 0.55, lw: 0.90 },

        // Feixes centrais (iniciam abaixo do vidro traseiro: tampa do motor, para-choque e difusor)
        { rx: -0.14, ry:  0.18, spread: 0.22, len: 44, phase: 0.20, lw: 0.70 },
        { rx:  0.14, ry:  0.18, spread: 0.22, len: 44, phase: 0.70, lw: 0.70 },
        { rx: -0.06, ry:  0.24, spread: 0.14, len: 40, phase: 0.40, lw: 0.65 },
        { rx:  0.06, ry:  0.24, spread: 0.14, len: 40, phase: 0.90, lw: 0.65 },
        { rx: -0.26, ry:  0.30, spread: 0.36, len: 48, phase: 0.10, lw: 0.80 },
        { rx:  0.26, ry:  0.30, spread: 0.36, len: 48, phase: 0.60, lw: 0.80 },
      ];

      ctx.save();
      ctx.lineCap = 'round';

      for (let i = 0; i < streams.length; i++) {
        const s = streams[i];
        // Ponto de desprendimento do fluxo no próprio carro
        const startX = cx + s.rx * w;
        const startY = cy + s.ry * h;

        // Projeção da esteira em perspectiva para trás e ligeiramente para fora
        const spreadX = (s.rx >= 0 ? 1 : -1) * (w * s.spread * 0.45) - steerOffset;
        const totalLen = s.len * (isNitro ? 1.35 : (1.0 + overFactor * 0.4));
        const endX = startX + spreadX;
        const endY = startY + totalLen;

        // Pulso aerodinâmico contínuo fluindo do carro em direção à esteira
        const cycle = (t * flowSpeed + s.phase) % 1.0;
        const segLen = 0.44;
        const p1 = cycle;
        const p0 = Math.max(0, cycle - segLen);

        if (p1 > 0.05) {
          const x0 = startX + (endX - startX) * p0;
          const y0 = startY + (endY - startY) * p0;
          const x1 = startX + (endX - startX) * p1;
          const y1 = startY + (endY - startY) * p1;

          // Gradiente suave para o rastro de ar
          const grad = ctx.createLinearGradient(x0, y0, x1, y1);
          const alphaFade = (baseAlpha * (1.0 - p1 * 0.30)).toFixed(2);
          grad.addColorStop(0, `rgba(${strokeStyleBase}, 0)`);
          grad.addColorStop(0.65, `rgba(${strokeStyleBase}, ${alphaFade})`);
          grad.addColorStop(1, `rgba(${strokeStyleBase}, ${(alphaFade * 1.15).toFixed(2)})`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = s.lw * (isNitro ? 1.25 : 1.0);
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    renderDriverBadge(ctx, code, cx, cy, carW) {
      if (!code) return;
      const bH = Math.max(5.5, Math.min(8.5, carW * 0.125));
      const bW = Math.max(14, bH * 2.3);
      const by = cy - bH - 1.5;
      const bx = cx - bW / 2;

      ctx.save();
      ctx.fillStyle = 'rgba(8, 14, 24, 0.76)';
      ctx.fillRect(bx, by, bW, bH);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(bx, by, bW, bH);

      ctx.font = `bold ${Math.floor(bH * 0.75)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(code, cx, by + bH / 2 + 0.3);
      ctx.restore();
    }

    initConfetti() {
      this.confetti = [];
      const colors = ['#FFD700', '#00E5FF', '#FF5252', '#69F0AE', '#E040FB', '#FFFFFF', '#FFAB00'];
      for (let i = 0; i < 70; i++) {
        this.confetti.push({
          x: Math.random() * INTERNAL_WIDTH,
          y: Math.random() * INTERNAL_HEIGHT - INTERNAL_HEIGHT,
          w: 2 + Math.random() * 2.5,
          h: 3 + Math.random() * 4,
          vy: 35 + Math.random() * 45,
          vx: (Math.random() - 0.5) * 20,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 6,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }

    updateConfetti(dt) {
      if (!this.confetti || this.confetti.length === 0) return;
      for (let i = 0; i < this.confetti.length; i++) {
        const p = this.confetti[i];
        p.y += p.vy * dt;
        p.x += p.vx * dt;
        p.rot += p.vrot * dt;
        if (p.y > INTERNAL_HEIGHT + 10) {
          p.y = -10;
          p.x = Math.random() * INTERNAL_WIDTH;
        }
      }
    }

    renderConfetti(ctx) {
      if (!this.confetti || this.confetti.length === 0) return;
      ctx.save();
      for (let i = 0; i < this.confetti.length; i++) {
        const p = this.confetti[i];
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      ctx.restore();
    }
    renderStartGantry(ctx) {
      const gw = 152;
      const gh = 38;
      const gx = (INTERNAL_WIDTH - gw) / 2;
      const gy = 30;

      ctx.save();
      // Suportes superiores metálicos até o topo da tela
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(gx + 18, 0, 6, gy);
      ctx.fillRect(gx + gw - 24, 0, 6, gy);
      ctx.fillStyle = '#475569';
      ctx.fillRect(gx + 19, 0, 2, gy);
      ctx.fillRect(gx + gw - 23, 0, 2, gy);

      // Carcaça estilo fibra de carbono com chanfro metálico
      ctx.fillStyle = 'rgba(8, 11, 18, 0.96)';
      ctx.fillRect(gx, gy, gw, gh);
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(gx + 2, gy + 2, gw - 4, 4);
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(gx, gy, gw, gh);

      for (let i = 0; i < 4; i++) {
        const lx = gx + 25 + i * 34;
        const ly = gy + gh / 2 + 2;

        let lampColor = '#262A30';
        let glowColor = null;
        if (this.startLightsStage === 5) {
          lampColor = '#00FF66';
          glowColor = 'rgba(0, 255, 102, 0.42)';
        } else if (i < this.startLightsStage) {
          lampColor = '#FF1744';
          glowColor = 'rgba(255, 23, 68, 0.45)';
        }

        // Viseira/pestana do semáforo F1
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(lx - 11.5, ly - 12.5, 23, 4.5);

        if (glowColor) {
          ctx.fillStyle = glowColor;
          ctx.beginPath();
          ctx.arc(lx, ly, 13.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = lampColor;
        ctx.beginPath();
        ctx.arc(lx, ly, 8.5, 0, Math.PI * 2);
        ctx.fill();

        if (glowColor) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(lx, ly, 6.2, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
          ctx.beginPath();
          ctx.arc(lx - 2.6, ly - 2.6, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(lx, ly, 8.5, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    renderF1Leaderboard(ctx) {
      const ranked = this.getRankedCars();
      if (!ranked || ranked.length === 0) return;

      const count = Math.min(20, ranked.length);
      const towerX = 8;
      // Posiciona estritamente abaixo do campo das marchas (MARCHA termina em Y=46.5)
      const towerY = 48.5;
      const towerW = 28;

      // Determina dinamicamente o limite inferior para nunca invadir a área ocupada pelos botões direcionais
      let maxBottomY = 210;
      const dpadEl = document.getElementById('dpad-cluster');
      const isTouchActive = Boolean(
        (this.input && this.input.touchControlsVisible) ||
        (document.body && document.body.classList.contains('mobile-mode'))
      );

      if (isTouchActive && dpadEl && dpadEl.offsetWidth > 0 && this.input && this.input.toViewportLocal) {
        const r = dpadEl.getBoundingClientRect();
        // Projeta os cantos da caixa de direcionais para as coordenadas internas do canvas (altura 216)
        const p1 = this.input.toViewportLocal(r.left, r.top);
        const p2 = this.input.toViewportLocal(r.right, r.top);
        const p3 = this.input.toViewportLocal(r.left, r.bottom);
        const p4 = this.input.toViewportLocal(r.right, r.bottom);
        const minY = Math.min(p1.y, p2.y, p3.y, p4.y);
        const vh = p1.h || 1;
        const dpadTopCanvas = (minY / vh) * 216;
        if (dpadTopCanvas > towerY + 30) {
          maxBottomY = Math.min(maxBottomY, dpadTopCanvas - 3.0);
        }
      }

      // Altura disponível e altura dinâmica de cada linha para acomodar toda a barra completa (20 pilotos)
      const availH = Math.max(76, maxBottomY - towerY);
      const rowH = Math.max(3.6, Math.min(7.8, (availH - 2) / count));
      const towerH = count * rowH + 2;

      // Fundo preto transparente com borda sutil
      ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
      ctx.fillRect(towerX, towerY, towerW, towerH);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(towerX, towerY, towerW, towerH);

      const fSize1 = 'bold ' + Math.max(2.8, Math.min(4.5, rowH * 0.58)).toFixed(1) + 'px monospace';
      const fSizeOther = 'bold ' + Math.max(2.6, Math.min(4.2, rowH * 0.54)).toFixed(1) + 'px monospace';
      const fSizeCode = 'bold ' + Math.max(2.8, Math.min(4.5, rowH * 0.58)).toFixed(1) + 'px monospace';
      const badgeH = Math.max(2.0, rowH * 0.68);
      const textOffsetBottom = rowH * 0.26;

      for (let i = 0; i < count; i++) {
        const pos = i + 1;
        const car = ranked[i];
        const rowY = towerY + 1 + i * rowH;
        const isPlayer = !!car.isPlayer;

        // Destaque sutil na linha do jogador
        if (isPlayer) {
          ctx.fillStyle = 'rgba(0, 229, 255, 0.22)';
          ctx.fillRect(towerX + 0.5, rowY, towerW - 1, rowH);
        }

        // Posição 1 com bloco vermelho sólido no número (estilo F1 broadcast)
        if (pos === 1) {
          ctx.fillStyle = '#E10600';
          ctx.fillRect(towerX + 1, rowY + 0.4, 7.2, rowH - 0.8);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = fSize1;
          ctx.textAlign = 'center';
          ctx.fillText('1', towerX + 4.6, rowY + rowH - textOffsetBottom);
        } else {
          // Posições 2 a 20: números menores em branco / cinza
          ctx.fillStyle = isPlayer ? '#00E5FF' : '#E2E8F0';
          ctx.font = fSizeOther;
          ctx.textAlign = 'right';
          ctx.fillText(String(pos), towerX + 7.8, rowY + rowH - textOffsetBottom);
        }

        // Faixa de cor da equipe / carro
        const badgeColor = car.bodyColor || '#64748B';
        const badgeY = rowY + (rowH - badgeH) * 0.5;
        ctx.fillStyle = badgeColor;
        ctx.fillRect(towerX + 9.2, badgeY, 1.8, badgeH);

        // Iniciais do piloto com exatamente 3 letras maiúsculas
        const rawCode = car.driverCode || (car.isPlayer ? 'VOC' : 'CPU');
        const code = (rawCode + '___').slice(0, 3).toUpperCase();

        ctx.font = fSizeCode;
        ctx.textAlign = 'left';
        ctx.fillStyle = isPlayer ? '#00E5FF' : '#FFFFFF';
        ctx.fillText(code, towerX + 12.2, rowY + rowH - textOffsetBottom);
      }
    }

    renderHUD(ctx) {
      ctx.save();
      const touchHud = this.input.touchControlsVisible;
      const topY = 8;

      // Helper para renderizar textos direto na tela com sombra pixel arcade preta (estilo Top Gear 2)
      const drawPixelText = (text, x, y, color, font, align = 'left') => {
        ctx.font = font;
        ctx.textAlign = align;
        ctx.fillStyle = '#000000';
        ctx.fillText(text, x + 1, y + 1);
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
      };

      // ========================================================
      // 1. LADO ESQUERDO SUPERIOR (DIRETO NA TELA - ESTILO TOP GEAR 2)
      // Tacômetro em Arco, Velocidade KM/H, Nitro N2O e Marchas
      // ========================================================
      const leftX = 8;

      // --- Tacômetro Curvado de Velocidade/RPM estilo Top Gear 2 ---
      const segCount = 14;
      const maxRefSpeed = Math.max(180, this.getEffectiveMaxSpeed(this.player) * 1.15);
      const spdRatio = Math.max(0, Math.min(1, this.player.speed / maxRefSpeed));
      const activeSegs = Math.round(spdRatio * segCount);

      for (let i = 0; i < segCount; i++) {
        const t = i / (segCount - 1);
        // Curva ascendente sutil para a direita
        const sx = leftX + i * 3.3;
        const sy = topY + 12 - Math.sin(t * Math.PI * 0.5) * 6.5;
        const sw = 2.4;
        const sh = 4.8;
        const skew = 1.0;

        // Sombra preta de 1px atrás do segmento
        ctx.beginPath();
        ctx.moveTo(sx + skew + 0.8, sy + 0.8);
        ctx.lineTo(sx + sw + skew + 0.8, sy + 0.8);
        ctx.lineTo(sx + sw + 0.8, sy + sh + 0.8);
        ctx.lineTo(sx + 0.8, sy + sh + 0.8);
        ctx.closePath();
        ctx.fillStyle = '#000000';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(sx + skew, sy);
        ctx.lineTo(sx + sw + skew, sy);
        ctx.lineTo(sx + sw, sy + sh);
        ctx.lineTo(sx, sy + sh);
        ctx.closePath();

        if (i < activeSegs) {
          let fillCol = '#00E5FF';
          if (i >= 11) fillCol = '#FF1744';
          else if (i >= 7) fillCol = '#FFD700';
          else if (i >= 4) fillCol = '#00E676';
          ctx.fillStyle = fillCol;
          ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(26, 36, 52, 0.72)';
          ctx.fill();
        }
      }

      // --- Velocidade Digital + KM/H (sem 888 de fundo) ---
      const spdVal = String(Math.floor(this.player.speed));
      const numX = leftX + 68;

      // Dígitos de velocidade real com sombra
      const spdColor = this.player.isNitro ? '#80F8FF' : '#FFFFFF';
      drawPixelText(spdVal, numX, topY + 11, spdColor, 'bold 10px monospace', 'right');

      // Badge KM/H
      drawPixelText('KM/H', numX, topY + 17, '#FF4444', 'bold 4.8px monospace', 'right');

      // --- Cargas de Nitro N2O estilo Top Gear 2 ---
      const nitroY = topY + 22;
      drawPixelText('NITRO', leftX, nitroY + 4.5, '#00E5FF', 'bold 5px monospace', 'left');

      for (let n = 0; n < 3; n++) {
        const bx = leftX + 24 + n * 17;
        const bw = 14;
        const bh = 4.6;
        const skewN = 1.4;

        // Sombra preta atrás do cartucho
        ctx.beginPath();
        ctx.moveTo(bx + skewN + 0.8, nitroY + 0.8);
        ctx.lineTo(bx + bw + skewN + 0.8, nitroY + 0.8);
        ctx.lineTo(bx + bw + 0.8, nitroY + bh + 0.8);
        ctx.lineTo(bx + 0.8, nitroY + bh + 0.8);
        ctx.closePath();
        ctx.fillStyle = '#000000';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(bx + skewN, nitroY);
        ctx.lineTo(bx + bw + skewN, nitroY);
        ctx.lineTo(bx + bw, nitroY + bh);
        ctx.lineTo(bx, nitroY + bh);
        ctx.closePath();
        ctx.fillStyle = '#111622';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        if (n < this.player.nitroCharges) {
          ctx.beginPath();
          ctx.moveTo(bx + skewN + 0.6, nitroY + 0.6);
          ctx.lineTo(bx + bw + skewN - 0.6, nitroY + 0.6);
          ctx.lineTo(bx + bw - 0.6, nitroY + bh - 0.6);
          ctx.lineTo(bx + 0.6, nitroY + bh - 0.6);
          ctx.closePath();
          ctx.fillStyle = '#00E5FF';
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(bx + skewN + 1, nitroY + 0.8);
          ctx.lineTo(bx + bw + skewN - 1, nitroY + 0.8);
          ctx.lineTo(bx + bw - 0.5, nitroY + 1.8);
          ctx.lineTo(bx + 1, nitroY + 1.8);
          ctx.closePath();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
          ctx.fill();
        } else if (n === this.player.nitroCharges && this.player.isNitro) {
          const burnRatio = Math.max(0, this.player.nitroTimer / 2.4);
          const curW = (bw - 1.2) * burnRatio;
          if (curW > 0.8) {
            ctx.beginPath();
            ctx.moveTo(bx + skewN + 0.6, nitroY + 0.6);
            ctx.lineTo(bx + curW + skewN, nitroY + 0.6);
            ctx.lineTo(bx + curW, nitroY + bh - 0.6);
            ctx.lineTo(bx + 0.6, nitroY + bh - 0.6);
            ctx.closePath();
            ctx.fillStyle = (Math.floor(performance.now() / 80) % 2 === 0) ? '#FFFFFF' : '#80F8FF';
            ctx.fill();
          }
        }
      }

      // --- Linha de Marchas estilo Top Gear 2 ---
      const gearY = topY + 31;
      drawPixelText('MARCHA', leftX, gearY + 6.5, '#FFD700', 'bold 5px monospace', 'left');

      const gears = ['R', '1', '2', '3', '4', '5'];
      const curGear = this.player.currentGear || 1;
      const isRev = (this.player.speed < 0);

      for (let g = 0; g < gears.length; g++) {
        const gx = leftX + 28 + g * 7.8;
        const gLabel = gears[g];
        const isActive = isRev ? (gLabel === 'R') : (gLabel === String(curGear));

        if (isActive) {
          // Sombra da pílula
          ctx.fillStyle = '#000000';
          ctx.fillRect(gx - 1.5, gearY + 0.5, 6.5, 7.5);
          // Pílula neon ativa
          ctx.fillStyle = '#00E5FF';
          ctx.fillRect(gx - 2, gearY, 6.5, 7.5);
          ctx.fillStyle = '#041019';
          ctx.font = 'bold 5.2px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(gLabel, gx + 1.2, gearY + 5.8);
        } else {
          drawPixelText(gLabel, gx + 1.2, gearY + 6.2, '#64748B', 'bold 5px monospace', 'center');
        }
      }

      // --- Classificação em Tempo Real estilo F1 (Iniciais de 1 a 20) ---
      const showF1Tower = !!(this.input.leaderboard || this.f1LeaderboardToggled);
      if (showF1Tower) {
        this.renderF1Leaderboard(ctx);
      }

      // --- Indicador Aerodinâmico de Vácuo (Slipstream / Slingshot) ---
      if (this.player.inSlipstream || this.player.slipstreamDecayTimer > 0) {
        const isSlingshot = !this.player.inSlipstream && this.player.slipstreamDecayTimer > 0;
        const slingshotRatio = Math.max(0, Math.min(1.0, this.player.slipstreamDecayTimer / 1.0));
        const intensity = isSlingshot
          ? Math.max(0.1, slingshotRatio)
          : Math.min(1.0, this.player.slipstreamIntensity || 0.5);
        const vacX = showF1Tower ? (leftX + 31) : leftX;
        const vacY = topY + 41;
        const vacW = showF1Tower ? 56 : 74;
        const vacH = 8;

        ctx.fillStyle = '#000000';
        ctx.fillRect(vacX + 0.8, vacY + 0.8, vacW, vacH);
        ctx.fillStyle = 'rgba(8, 16, 26, 0.85)';
        ctx.fillRect(vacX, vacY, vacW, vacH);
        ctx.strokeStyle = isSlingshot ? '#FFD700' : '#00E5FF';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(vacX, vacY, vacW, vacH);

        const fillW = Math.max(2, (vacW - 3) * intensity);
        const vacGrad = ctx.createLinearGradient(vacX + 1.5, 0, vacX + vacW - 1.5, 0);
        if (isSlingshot) {
          vacGrad.addColorStop(0, '#FFD700');
          vacGrad.addColorStop(1, '#FF7A00');
        } else {
          vacGrad.addColorStop(0, '#00E5FF');
          vacGrad.addColorStop(1, '#00FF66');
        }
        ctx.fillStyle = vacGrad;
        ctx.fillRect(vacX + 1.5, vacY + 1.5, fillW, vacH - 3);

        const label = isSlingshot ? '⚡ SLINGSHOT' : `▲ VÁCUO ${Math.max(5, Math.round(intensity * 100))}%`;
        drawPixelText(label, vacX + vacW / 2, vacY + 6.2, '#FFFFFF', 'bold 5px monospace', 'center');
      }

      // ========================================================
      // 2. LADO DIREITO SUPERIOR (DIRETO NA TELA - ESTILO TOP GEAR 2)
      // Tempos Atual e Melhor, Volta Atual/Total e Posição
      // ========================================================
      const mapBoxW = 58;
      const mapBoxH = 50;
      const mapMarginRight = 8;
      const mapBoxX = INTERNAL_WIDTH - mapBoxW - mapMarginRight;
      const rightEdge = mapBoxX + mapBoxW;
      const hudDataLeft = mapBoxX;

      // Linha 1: Tempo Atual (Rótulo em Amarelo Dourado #FFD700)
      drawPixelText('ATUAL', hudDataLeft, topY + 6, '#FFD700', 'bold 5px monospace', 'left');
      drawPixelText(this.formatTime(this.currentLapTime), rightEdge, topY + 6, '#00E5FF', 'bold 6.2px monospace', 'right');

      // Linha 2: Melhor Volta (Rótulo em Amarelo Dourado #FFD700)
      const bestStr = this.bestLapTime > 0 ? this.formatTime(this.bestLapTime) : '--:--.--';
      drawPixelText('MELHOR', hudDataLeft, topY + 15, '#FFD700', 'bold 5px monospace', 'left');
      drawPixelText(bestStr, rightEdge, topY + 15, '#FFD700', 'bold 6.2px monospace', 'right');

      // Linha 3: Volta Atual e Total (ou QUALY 1/1)
      const targetLaps = this.isQualifying ? 1 : TOTAL_LAPS;
      const curLap = Math.min(this.player.laps + 1, targetLaps);
      const lapColor = (curLap === targetLaps) ? '#FF5252' : '#FFFFFF';
      drawPixelText(this.isQualifying ? 'QUALY' : 'VOLTA', hudDataLeft, topY + 25, this.isQualifying ? '#00E5FF' : '#FFD700', 'bold 5px monospace', 'left');
      drawPixelText(`${curLap}/${targetLaps}`, rightEdge, topY + 25, lapColor, 'bold 6.5px monospace', 'right');

      // Linha 4: Posição na Corrida (ou Modo Solo no Qualy)
      const ranked = this.getRankedCars();
      const playerPos = ranked.findIndex(c => c.isPlayer) + 1;
      if (this.isQualifying) {
        drawPixelText('MODO', hudDataLeft, topY + 35, '#FFD700', 'bold 5px monospace', 'left');
        drawPixelText('1 VOLTA', rightEdge, topY + 35, '#00E676', 'bold 6.5px monospace', 'right');
      } else {
        drawPixelText('POSIÇÃO', hudDataLeft, topY + 35, '#FFD700', 'bold 5px monospace', 'left');

        let posColor = '#FFFFFF';
        if (playerPos === 1) posColor = '#FFD700';
        else if (playerPos === 2) posColor = '#E2E8F0';
        else if (playerPos === 3) posColor = '#F59E0B';
        else if (playerPos <= 10) posColor = '#00E5FF';

        drawPixelText(`${playerPos}º/20`, rightEdge, topY + 35, posColor, 'bold 7px monospace', 'right');
      }

      // ========================================================
      // 3. MINIMAPA SEMPRE ABAIXO DO HUD DE DADOS (TRANSPARÊNCIA AUMENTADA)
      // ========================================================
      const mapBoxY = topY + 44; // Fica sempre diretamente abaixo dos dados de volta e posição

      ctx.fillStyle = 'rgba(8, 12, 20, 0.45)'; // Transparência do fundo aumentada (de 0.84 para 0.45)
      ctx.fillRect(mapBoxX, mapBoxY, mapBoxW, mapBoxH);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
      ctx.lineWidth = 1;
      ctx.strokeRect(mapBoxX, mapBoxY, mapBoxW, mapBoxH);

      const mPoints = this.track.mapPoints;
      ctx.strokeStyle = '#263238';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let i = 0; i < mPoints.length; i += 4) {
        const px = mapBoxX + 5 + mPoints[i].x * (mapBoxW - 10);
        const py = mapBoxY + 5 + mPoints[i].z * (mapBoxH - 10);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.strokeStyle = '#78909C';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Marcador da linha de largada no minimapa
      if (mPoints.length > 0) {
        const startPt = mPoints[START_LINE_SEG % mPoints.length];
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(mapBoxX + 5 + startPt.x * (mapBoxW - 10) - 2, mapBoxY + 5 + startPt.z * (mapBoxH - 10) - 2, 4, 4);
      }

      for (let i = 0; i < this.cars.length; i++) {
        const car = this.cars[i];
        if (car.isPlayer) continue;
        const segIdx = ((Math.floor(car.z / SEGMENT_LENGTH) % mPoints.length) + mPoints.length) % mPoints.length;
        const pt = mPoints[segIdx];
        ctx.fillStyle = '#FF5252';
        ctx.fillRect(mapBoxX + 5 + pt.x * (mapBoxW - 10) - 1, mapBoxY + 5 + pt.z * (mapBoxH - 10) - 1, 2.2, 2.2);
      }

      const pSegIdx = ((Math.floor(this.player.z / SEGMENT_LENGTH) % mPoints.length) + mPoints.length) % mPoints.length;
      const pPt = mPoints[pSegIdx];
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(mapBoxX + 5 + pPt.x * (mapBoxW - 10) - 2, mapBoxY + 5 + pPt.z * (mapBoxH - 10) - 2, 4, 4);

      // ========================================================
      // 4. GAP / DELTA DE TEMPO EM TEMPO REAL ESTILO F1
      // Exibe a diferença de tempo para o carro da frente e de trás
      // ========================================================
      if (this.state === 'RACING' && this.cars.length > 1) {
        const deltaBoxY = mapBoxY + mapBoxH + 3;
        const deltaBoxH = 17;
        ctx.fillStyle = 'rgba(8, 12, 20, 0.50)';
        ctx.fillRect(mapBoxX, deltaBoxY, mapBoxW, deltaBoxH);
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.40)';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(mapBoxX, deltaBoxY, mapBoxW, deltaBoxH);

        const carAhead = playerPos > 1 ? ranked[playerPos - 2] : null;
        const carBehind = playerPos < ranked.length ? ranked[playerPos] : null;
        const avgSpeed = Math.max(70, this.player.speed);

        // Carro à frente
        if (carAhead) {
          const distAhead = Math.max(1, carAhead.totalDistance - this.player.totalDistance);
          const timeGapAhead = Math.min(99.9, distAhead / (avgSpeed * 20));
          const aheadText = `▲ +${timeGapAhead.toFixed(1)}s [${carAhead.driverCode || 'CAR'}]`;
          drawPixelText(aheadText, mapBoxX + 3, deltaBoxY + 6.5, '#00E676', 'bold 4.8px monospace', 'left');
        } else {
          drawPixelText('▲ LÍDER DA PROVA', mapBoxX + 3, deltaBoxY + 6.5, '#FFD700', 'bold 4.8px monospace', 'left');
        }

        // Carro atrás
        if (carBehind) {
          const distBehind = Math.max(1, this.player.totalDistance - carBehind.totalDistance);
          const timeGapBehind = Math.min(99.9, distBehind / (avgSpeed * 20));
          const behindText = `▼ -${timeGapBehind.toFixed(1)}s [${carBehind.driverCode || 'CAR'}]`;
          drawPixelText(behindText, mapBoxX + 3, deltaBoxY + 14, '#FF5252', 'bold 4.8px monospace', 'left');
        } else {
          drawPixelText('▼ ÚLTIMA POSIÇÃO', mapBoxX + 3, deltaBoxY + 14, '#94A3B8', 'bold 4.8px monospace', 'left');
        }
      }

      // ========================================================
      // 5. RADAR DE PROXIMIDADE / ESPELHO RETROVISOR ARCADE
      // Alerta quando um bot rival está no ponto cego ou colado atrás
      // ========================================================
      if (this.state === 'RACING' && this.cars.length > 1) {
        let nearestFollower = null;
        let followerDist = 9999;
        for (let i = 0; i < this.cars.length; i++) {
          const c = this.cars[i];
          if (c.isPlayer) continue;
          const dz = this.shortestDeltaZ(this.player.z, c.z);
          if (dz > 0 && dz < 340 && dz < followerDist) {
            followerDist = dz;
            nearestFollower = c;
          }
        }

        if (nearestFollower) {
          const dx = nearestFollower.x - this.player.x;
          const distMeters = Math.max(2, Math.round(followerDist * 0.12));
          const isVeryClose = (followerDist < 120);
          const pulse = (Math.sin(performance.now() * 0.012) + 1) * 0.5;

          const radarW = 54;
          const radarH = 12;
          const radarY = INTERNAL_HEIGHT - 38;
          let radarX = Math.round(INTERNAL_WIDTH / 2 - radarW / 2);
          let arrow = '▼';

          if (dx < -0.22) {
            radarX = 14;
            arrow = '◀';
          } else if (dx > 0.22) {
            radarX = INTERNAL_WIDTH - radarW - 14;
            arrow = '▶';
          }

          ctx.fillStyle = isVeryClose ? `rgba(220, 38, 38, ${0.45 + pulse * 0.35})` : 'rgba(15, 23, 42, 0.72)';
          ctx.fillRect(radarX, radarY, radarW, radarH);
          ctx.strokeStyle = isVeryClose ? '#FF1744' : '#F59E0B';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(radarX, radarY, radarW, radarH);

          const radarCol = isVeryClose ? '#FFFFFF' : '#FFD700';
          const radarLabel = `${arrow} [${nearestFollower.driverCode}] ${distMeters}m`;
          drawPixelText(radarLabel, radarX + radarW / 2, radarY + 8.5, radarCol, 'bold 5px monospace', 'center');
        }
      }

      if (this.lapBannerTimer > 0 && !this.finishingRace) {
        if (this.isLastLapBanner) {
          const lbW = 204;
          const lbH = 28;
          const lbX = INTERNAL_WIDTH / 2 - lbW / 2;
          const lbY = 44;
          const pulse = (Math.sin(performance.now() / 80) + 1) * 0.5;
          ctx.fillStyle = 'rgba(10, 4, 16, 0.94)';
          ctx.fillRect(lbX, lbY, lbW, lbH);
          ctx.strokeStyle = pulse > 0.5 ? '#FFD700' : '#FF1744';
          ctx.lineWidth = 2;
          ctx.strokeRect(lbX, lbY, lbW, lbH);
          ctx.fillStyle = pulse > 0.5 ? '#FF1744' : '#FFD700';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('⚠️ ÚLTIMA VOLTA! ⚠️', INTERNAL_WIDTH / 2, lbY + 13);
          ctx.fillStyle = '#00E5FF';
          ctx.font = 'bold 7.5px monospace';
          ctx.fillText('FINAL LAP — DÊ TUDO DE SI NA PISTA!', INTERNAL_WIDTH / 2, lbY + 23);
        } else {
          const lbW = 152;
          ctx.fillStyle = 'rgba(8, 12, 22, 0.90)';
          ctx.fillRect(INTERNAL_WIDTH / 2 - lbW / 2, 48, lbW, 24);
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(INTERNAL_WIDTH / 2 - lbW / 2, 48, lbW, 24);
          ctx.fillStyle = '#FFD700';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(this.lapBannerText, INTERNAL_WIDTH / 2, 64);
        }
      }

      // ========================================================
      // 5. ALERTA DE CURVA FECHADA À FRENTE (ANTECIPAÇÃO NO HUD)
      // ========================================================
      if (this.state === 'RACING' && !this.finishingRace && this.player && this.track && this.track.segments) {
        const segs = this.track.segments;
        const N = segs.length;
        const curSegIdx = ((Math.floor(this.player.z / SEGMENT_LENGTH) % N) + N) % N;
        let peakCurve = 0;
        let peakAbs = 0;
        for (let offset = 16; offset <= 62; offset++) {
          const cv = segs[(curSegIdx + offset) % N].curve;
          const absCv = Math.abs(cv);
          if (absCv > peakAbs) {
            peakAbs = absCv;
            peakCurve = cv;
          }
        }
        if (peakAbs >= 1.35 && this.player.speed > 90) {
          const isSharp = peakAbs >= 1.95;
          const isLeft = peakCurve < 0;
          const blink = (Math.sin(performance.now() / (isSharp ? 85 : 130)) + 1) * 0.5;
          const pillW = 68;
          const pillH = 13;
          const pillX = Math.round((INTERNAL_WIDTH - pillW) / 2);
          const pillY = topY + 20; // Abaixo dos botões de Pause e Configurações para nunca sobrepor

          ctx.fillStyle = 'rgba(8, 12, 22, 0.80)';
          ctx.fillRect(pillX, pillY, pillW, pillH);
          ctx.strokeStyle = isSharp
            ? (blink > 0.45 ? '#FF3D71' : '#FFD700')
            : (blink > 0.45 ? '#FFD700' : '#00E5FF');
          ctx.lineWidth = 1.1;
          ctx.strokeRect(pillX, pillY, pillW, pillH);

          ctx.fillStyle = isSharp ? (blink > 0.45 ? '#FF3D71' : '#FFD700') : '#FFD700';
          ctx.font = 'bold 7px monospace';
          ctx.textAlign = 'center';
          const warnTxt = isLeft
            ? (isSharp ? '◀◀ CURVA !' : '◀ CURVA')
            : (isSharp ? '! CURVA ▶▶' : 'CURVA ▶');
          ctx.fillText(warnTxt, INTERNAL_WIDTH / 2, pillY + 9);
        }
      }

      // ========================================================
      // 6. FOGOS NA LINHA DE CHEGADA (PÓDIO NA BANDEIRADA)
      // ========================================================
      if (this.finishingRace && this.finishFireworks && this.finishFireworks.length > 0) {
        for (let i = 0; i < this.finishFireworks.length; i++) {
          const fw = this.finishFireworks[i];
          if (fw.delay > 0 || fw.life <= 0) continue;
          ctx.globalAlpha = Math.max(0, fw.life / fw.maxLife);
          ctx.fillStyle = fw.color;
          ctx.fillRect(fw.x - 1, fw.y - 1, 2.2, 2.2);
        }
        ctx.globalAlpha = 1;
      }

      ctx.restore();
    }

    // Geometria da tela "Escolha de Modo de Jogo" (Campeonato vs Corrida Rápida)
    getModeSelectLayout() {
      const touchSafe = this.input.touchControlsVisible;
      const cardW = touchSafe ? 104 : 116;
      const cardH = touchSafe ? 122 : 138;
      const cardY = touchSafe ? 34 : 36;
      const gap = touchSafe ? 8 : 10;
      const totalW = cardW * 3 + gap * 2;
      const startX = Math.round((INTERNAL_WIDTH - totalW) / 2);
      const card0 = { x: startX, y: cardY, w: cardW, h: cardH };
      const card1 = { x: startX + cardW + gap, y: cardY, w: cardW, h: cardH };
      const card2 = { x: startX + (cardW + gap) * 2, y: cardY, w: cardW, h: cardH };
      const btnW = touchSafe ? 86 : 98;
      const btnH = touchSafe ? 18 : 20;
      const btnY = touchSafe ? 168 : 184;
      const btnBack = { x: startX, y: btnY, w: btnW, h: btnH };
      const btnConfirm = { x: startX + totalW - btnW, y: btnY, w: btnW, h: btnH };
      return { touchSafe, cardW, cardH, cardY, card0, card1, card2, btnBack, btnConfirm };
    }

    // Geometria da tela "Escolha de Pista" (4 Clássicas + 27 Capitais do Brasil)
    getTrackSelectLayout() {
      const touchSafe = this.input.touchControlsVisible;
      const W = INTERNAL_WIDTH;
      const H = INTERNAL_HEIGHT;

      // Row 0: 4 Circuitos Clássicos destacados (Interlagos, Serra, Metrópole, Sertão)
      const classicCount = 4;
      const classicGapX = touchSafe ? 3 : 4;
      const maxGridW = touchSafe ? Math.min(W - 14, 306) : Math.min(W - 18, 314);
      const classicW = Math.floor((maxGridW - (classicCount - 1) * classicGapX) / classicCount);
      const classicH = touchSafe ? 9.5 : 10;
      const classicTotalW = classicCount * classicW + (classicCount - 1) * classicGapX;
      const classicX0 = Math.round((W - classicTotalW) / 2);
      const classicY0 = touchSafe ? 13 : 14;

      const chips = [];
      for (let i = 0; i < 4; i++) {
        chips.push({
          x: classicX0 + i * (classicW + classicGapX),
          y: classicY0,
          w: classicW,
          h: classicH,
          i: i,
          isClassic: true
        });
      }

      // Rows 1..3: 27 Circuitos das Capitais (3 linhas x 9 colunas)
      const cols = 9;
      const rows = 3;
      const gapX = touchSafe ? 2 : 2.5;
      const gapY = 2;
      const capChipW = Math.floor((maxGridW - (cols - 1) * gapX) / cols);
      const capChipH = touchSafe ? 8.5 : 9.5;
      const capGridW = cols * capChipW + (cols - 1) * gapX;
      const capGridX = Math.round((W - capGridW) / 2);
      const capGridY = classicY0 + classicH + (touchSafe ? 2.5 : 3);

      for (let i = 4; i < TRACK_DEFINITIONS.length; i++) {
        const capIdx = i - 4;
        const col = capIdx % cols;
        const row = Math.floor(capIdx / cols);
        chips.push({
          x: capGridX + col * (capChipW + gapX),
          y: capGridY + row * (capChipH + gapY),
          w: capChipW,
          h: capChipH,
          i: i,
          isClassic: false
        });
      }

      const gridBottom = capGridY + rows * capChipH + (rows - 1) * gapY;

      // Card central do showroom da pista
      const bW = touchSafe ? Math.min(W - 16, 280) : Math.min(W - 20, 304);
      const bH = touchSafe ? 116 : 124;
      const bX = Math.round((W - bW) / 2);
      const bY = gridBottom + (touchSafe ? 3.5 : 4);

      // Setas de navegação lateral
      const arrowW = 16;
      const arrowH = 26;
      const btnPrev = { x: bX - arrowW - 2, y: bY + (bH - arrowH) / 2, w: arrowW, h: arrowH };
      const btnNext = { x: bX + bW + 2, y: bY + (bH - arrowH) / 2, w: arrowW, h: arrowH };

      const btnW = touchSafe ? 92 : 108;
      const btnH = touchSafe ? 17 : 19;
      const btnY = bY + bH + (touchSafe ? 5 : 6);
      const btnBack = {
        x: Math.round(bX),
        y: btnY,
        w: btnW,
        h: btnH
      };
      const btnConfirm = {
        x: Math.round(bX + bW - btnW),
        y: btnY,
        w: btnW,
        h: btnH
      };
      return { touchSafe, bW, bH, bX, bY, chips, btnPrev, btnNext, btnBack, btnConfirm };
    }

    // Geometria compartilhada da Garagem com seletor dos 20 carros em 2 fileiras x 10 colunas
    getCarSelectLayout() {
      const touchSafe = this.input.touchControlsVisible;
      const W = INTERNAL_WIDTH;
      const H = INTERNAL_HEIGHT;

      // Grade dos 20 carros (2 linhas x 10 colunas)
      const cols = 10;
      const rows = 2;
      const gapX = touchSafe ? 2 : 3;
      const gapY = 2;
      const maxGridW = touchSafe ? Math.min(W - 14, 308) : Math.min(W - 20, 360);
      const chipW = Math.max(26, Math.floor((maxGridW - (cols - 1) * gapX) / cols));
      const chipH = touchSafe ? 11 : 12;
      const gridW = cols * chipW + (cols - 1) * gapX;
      const gridH = rows * chipH + (rows - 1) * gapY;
      const gridX = Math.round((W - gridW) / 2);
      const gridY = touchSafe ? 15 : 17;

      const chips = [];
      for (let i = 0; i < CAR_MODELS.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        chips.push({
          x: gridX + col * (chipW + gapX),
          y: gridY + row * (chipH + gapY),
          w: chipW,
          h: chipH,
          i: i
        });
      }

      const gridBottom = gridY + gridH;

      // Card central do showroom dos carros
      const bW = touchSafe ? Math.min(W - 16, 260) : Math.min(W - 24, 320);
      const bH = touchSafe ? 116 : 128;
      const bX = Math.round((W - bW) / 2);
      const bY = gridBottom + (touchSafe ? 4 : 5);

      const btnW = touchSafe ? 92 : 108;
      const btnH = touchSafe ? 17 : 19;
      const btnY = bY + bH + (touchSafe ? 5 : 6);
      const btnBack = {
        x: Math.round(bX),
        y: btnY,
        w: btnW,
        h: btnH
      };
      const btnConfirm = {
        x: Math.round(bX + bW - btnW),
        y: btnY,
        w: btnW,
        h: btnH
      };
      return { touchSafe, bW, bH, bX, bY, chips, btnBack, btnConfirm };
    }

    // Geometria da tela de Pintura e Seleção de Cor do Carro (Etapa 2)
    getColorSelectLayout() {
      const touchSafe = this.input.touchControlsVisible;
      const W = INTERNAL_WIDTH;
      const H = INTERNAL_HEIGHT;

      // Card amplo e elegante de personalização e pintura
      const bW = touchSafe ? Math.min(W - 16, 280) : Math.min(W - 24, 330);
      const bH = touchSafe ? 134 : 148;
      const bX = Math.round((W - bW) / 2);
      const bY = touchSafe ? 18 : 20;

      // 10 Amostras de cores amplas e confortáveis para toque e controle
      const numColors = CAR_COLORS.length;
      const swY = bY + (touchSafe ? 88 : 98);
      const swR = touchSafe ? 6.2 : 7.6;
      const swGap = touchSafe ? 19.5 : 23.5;
      const totalSwW = (numColors - 1) * swGap;
      const swStartX = W / 2 - totalSwW / 2;
      const sw = [];
      for (let i = 0; i < numColors; i++) {
        sw.push({ x: swStartX + i * swGap, y: swY, r: swR, i });
      }

      const btnW = touchSafe ? 96 : 112;
      const btnH = touchSafe ? 18 : 20;
      const btnY = bY + bH + (touchSafe ? 6 : 7);
      const btnBack = {
        x: Math.round(bX),
        y: btnY,
        w: btnW,
        h: btnH
      };
      const btnConfirm = {
        x: Math.round(bX + bW - btnW),
        y: btnY,
        w: btnW,
        h: btnH
      };
      return { touchSafe, bW, bH, bX, bY, sw, btnBack, btnConfirm };
    }

    // Geometria da tela "Preparar Corrida" (chips de clima/hora e de música)
  }
  const descs = Object.getOwnPropertyDescriptors(HudRenderer.prototype);
  delete descs.constructor;
  Object.defineProperties(LH44RacingGame.prototype, descs);
})();
