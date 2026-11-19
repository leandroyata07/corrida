/**
 * LH44 - LOW TO HIGH SPEED
 * Renderização de menus, telas de seleção, pausa, loja e encerramento
 */
(function () {
  class MenuRenderer {
    getSetupLayout() {
      const touchSafe = this.input.touchControlsVisible;
      const cw = touchSafe ? 66 : 74;
      const ch = touchSafe ? 8.2 : 8.8;
      const gx = touchSafe ? 2.5 : 3;
      const gy = touchSafe ? 2.0 : 2.2;
      const startX = Math.round(INTERNAL_WIDTH / 2 - (4 * cw + 3 * gx) / 2);
      const y1 = touchSafe ? 31 : 32;
      const conds = [];
      for (let i = 0; i < ENV_CONDITIONS.length; i++) {
        const col = i % 4;
        const row = Math.floor(i / 4);
        conds.push({ x: startX + col * (cw + gx), y: y1 + row * (ch + gy), w: cw, h: ch, i });
      }
      const sw = touchSafe ? 136 : 152;
      const sh = touchSafe ? 8.2 : 8.5;
      const sgx = touchSafe ? 3.5 : 4;
      const sgy = touchSafe ? 2.0 : 2.2;
      const sStartX = Math.round(INTERNAL_WIDTH / 2 - (2 * sw + sgx) / 2);
      const y2 = touchSafe ? 61 : 64;
      const songs = [];
      for (let i = 0; i < SONGS.length; i++) {
        const col = i % 2;
        const row = Math.floor(i / 2);
        songs.push({ x: sStartX + col * (sw + sgx), y: y2 + row * (sh + sgy), w: sw, h: sh, i });
      }
      const showQualy = (this.gameMode !== 'TIME_TRIAL');
      const btnW = touchSafe ? (showQualy ? 72 : 88) : (showQualy ? 80 : 98);
      const qualyW = showQualy ? (touchSafe ? 88 : 102) : 0;
      const startW = touchSafe ? (showQualy ? 96 : 116) : (showQualy ? 108 : 130);
      const btnH = touchSafe ? 15 : 16;
      const btnY = touchSafe ? 138 : 144;
      const gapB = 8;
      const totalBtnsW = showQualy ? (btnW + gapB + qualyW + gapB + startW) : (btnW + 12 + startW);
      const btnStartX = Math.round(INTERNAL_WIDTH / 2 - totalBtnsW / 2);
      const btnBack = {
        x: btnStartX,
        y: btnY,
        w: btnW,
        h: btnH
      };
      const qualyBtn = showQualy ? {
        x: btnStartX + btnW + gapB,
        y: btnY,
        w: qualyW,
        h: btnH
      } : null;
      const startBtn = {
        x: showQualy ? (btnStartX + btnW + gapB + qualyW + gapB) : (btnStartX + btnW + 12),
        y: btnY,
        w: startW,
        h: btnH
      };
      const mirrorBtn = (this.gameMode !== 'CHAMPIONSHIP') ? {
        x: Math.round(INTERNAL_WIDTH / 2 + (touchSafe ? 78 : 92)),
        y: (touchSafe ? 21 : 22) - 7,
        w: touchSafe ? 62 : 70,
        h: 10
      } : null;
      return {
        touchSafe, conds, songs, btnBack, qualyBtn, startBtn, mirrorBtn,
        titleY: touchSafe ? 13 : 14,
        subY: touchSafe ? 21 : 22,
        label1Y: touchSafe ? 28 : 29,
        label2Y: touchSafe ? 57 : 60,
        descY: touchSafe ? 116 : 122,
        gridY: touchSafe ? 122 : 128,
        gridH: touchSafe ? 10.5 : 11,
        gridW: touchSafe ? 280 : 308,
        hintY: touchSafe ? 160 : 168
      };
    }

    renderMenu(ctx) {
      const now = performance.now();
      const touchSafe = this.input.touchControlsVisible;
      const cx = INTERNAL_WIDTH / 2;

      // 1. VINHETA ATMOSFÉRICA PÔR DO SOL / RETRÔ ARCADE SOBRE A PISTA 3D AO VIVO
      // A pista 3D ao vivo e o horizonte continuam 100% visíveis e correndo dinamicamente ao fundo
      const vignetteGrad = ctx.createLinearGradient(0, 0, 0, INTERNAL_HEIGHT);
      vignetteGrad.addColorStop(0, 'rgba(25, 10, 45, 0.40)');
      vignetteGrad.addColorStop(0.48, 'rgba(255, 110, 30, 0.12)');
      vignetteGrad.addColorStop(0.62, 'rgba(0, 0, 0, 0.05)');
      vignetteGrad.addColorStop(1, 'rgba(12, 6, 22, 0.52)');
      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

      ctx.save();

      // =========================================================================
      // 2. LOGOTIPO RETRÔ 16-BIT "LH44" (ESTILO SUPER NINTENDO / TOP GEAR / OUTRUN)
      // =========================================================================
      const logoCenterY = touchSafe ? 54 : 60;

      // Halo / Resplendor solar do pôr do sol atrás do logotipo
      const sunGlow = ctx.createRadialGradient(cx, logoCenterY, 4, cx, logoCenterY, 95);
      sunGlow.addColorStop(0, 'rgba(255, 235, 130, 0.35)');
      sunGlow.addColorStop(0.4, 'rgba(255, 95, 30, 0.20)');
      sunGlow.addColorStop(0.8, 'rgba(170, 30, 90, 0.08)');
      sunGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(cx, logoCenterY, 95, 0, Math.PI * 2);
      ctx.fill();

      // Medição precisa da tipografia para centralização 100% simétrica
      const fontSize = touchSafe ? 34 : 38;
      ctx.font = 'italic 900 ' + fontSize + 'px "Arial Black", Impact, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';

      const lhText = 'LH';
      const numText = '44';
      const gap = 2;
      const lhMetrics = ctx.measureText(lhText);
      const numMetrics = ctx.measureText(numText);
      const totalWidth = lhMetrics.width + gap + numMetrics.width;

      // 2.1 ASAS DE BANDEIRA QUADRICULADA NAS LATERAIS DO LOGO
      const drawCheckeredWing = (baseX, baseY, dir) => {
        const rows = 4;
        const cols = 6;
        const sq = 4.2;
        const slant = -0.28;
        ctx.save();
        ctx.translate(baseX, baseY);
        ctx.transform(1, 0, slant, 1, 0, 0);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const isWingEdge = (dir < 0) ? (c < rows - 1 - r) : (c > r + (cols - rows));
            if (isWingEdge) continue;
            const isDark = (r + c) % 2 === 0;
            if (isDark) {
              ctx.fillStyle = (r === 0) ? '#8A0F2E' : (r === 3 ? '#160824' : '#C4183C');
            } else {
              ctx.fillStyle = (r === 0) ? '#FFF0F5' : '#ECEFF1';
            }
            ctx.fillRect(dir * c * sq, (r - rows / 2) * sq, sq - 0.4, sq - 0.4);
          }
        }
        ctx.restore();
      };

      const wingOffset = totalWidth / 2 + 6;
      drawCheckeredWing(cx - wingOffset, logoCenterY - 2, -1);
      drawCheckeredWing(cx + wingOffset, logoCenterY - 2, 1);

      // 2.2 LETRAS 3D CROMO "LH" E FOGO "44"
      ctx.save();
      ctx.translate(cx, logoCenterY);
      ctx.transform(1, 0, -0.20, 1, 0, 0); // Slant de corrida anos 90

      ctx.font = 'italic 900 ' + fontSize + 'px "Arial Black", Impact, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';

      const startX = -totalWidth / 2;
      const lhX = startX;
      const numX = startX + lhMetrics.width + gap;

      // 2.2.1 PROFUNDIDADE 3D / SOMBRA RETRÔ (EXTRUSÃO EM CAMADAS)
      const depth = 4;
      for (let d = depth; d >= 1; d--) {
        const offX = d * 0.9;
        const offY = d * 1.1;
        ctx.fillStyle = (d === depth) ? '#02040A' : '#0B132B';
        ctx.fillText(lhText, lhX + offX, offY);
        ctx.fillStyle = (d === depth) ? '#1A0202' : '#4A0808';
        ctx.fillText(numText, numX + offX, offY);
      }

      // 2.2.2 BORDA EXTERNA GROSSA
      ctx.lineWidth = 5;
      ctx.lineJoin = 'miter';
      ctx.strokeStyle = '#050711';
      ctx.strokeText(lhText, lhX, 0);
      ctx.strokeStyle = '#180404';
      ctx.strokeText(numText, numX, 0);

      // 2.2.3 PREENCHIMENTO DO "LH" EM CROMO METÁLICO
      const lhGrad = ctx.createLinearGradient(0, -fontSize * 0.45, 0, fontSize * 0.45);
      lhGrad.addColorStop(0.00, '#FFFFFF');
      lhGrad.addColorStop(0.20, '#F0F9FF');
      lhGrad.addColorStop(0.42, '#B0D8F0');
      lhGrad.addColorStop(0.48, '#4A7A96');
      lhGrad.addColorStop(0.52, '#FFFFFF');
      lhGrad.addColorStop(0.68, '#27445C');
      lhGrad.addColorStop(0.90, '#102334');
      lhGrad.addColorStop(1.00, '#091522');
      ctx.fillStyle = lhGrad;
      ctx.fillText(lhText, lhX, 0);

      ctx.lineWidth = 1.0;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.strokeText(lhText, lhX, 0);

      // 2.2.4 PREENCHIMENTO DO "44" EM DEGRADÊ DE VELOCIDADE
      const numGrad = ctx.createLinearGradient(0, -fontSize * 0.45, 0, fontSize * 0.45);
      numGrad.addColorStop(0.00, '#FFF59D');
      numGrad.addColorStop(0.22, '#FFB300');
      numGrad.addColorStop(0.48, '#FF5722');
      numGrad.addColorStop(0.78, '#D50000');
      numGrad.addColorStop(1.00, '#7F0000');
      ctx.fillStyle = numGrad;
      ctx.fillText(numText, numX, 0);

      ctx.lineWidth = 1.0;
      ctx.strokeStyle = 'rgba(255, 240, 160, 0.8)';
      ctx.strokeText(numText, numX, 0);

      ctx.restore();

      // 2.3 SLOGAN BANNER: "LOW TO HIGH SPEED" COM FAIXAS DE VELOCIDADE
      const sloganY = logoCenterY + (touchSafe ? 22 : 25);
      const sloganText = 'LOW TO HIGH SPEED';

      ctx.font = 'italic bold 7.5px "Trebuchet MS", Arial, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const sloganW = ctx.measureText(sloganText).width;

      const drawSpeedStripes = (xStart, xEnd, y) => {
        const stripeGrad = ctx.createLinearGradient(xStart, y, xEnd, y);
        stripeGrad.addColorStop(0, 'rgba(235, 30, 45, 0)');
        stripeGrad.addColorStop(0.3, 'rgba(235, 30, 45, 0.8)');
        stripeGrad.addColorStop(1, 'rgba(255, 75, 45, 1)');
        ctx.fillStyle = stripeGrad;
        ctx.fillRect(Math.min(xStart, xEnd), y - 0.8, Math.abs(xEnd - xStart), 1.6);
        ctx.fillRect(Math.min(xStart, xEnd) + (xStart < xEnd ? 5 : -5), y + 2.2, Math.abs(xEnd - xStart) - 5, 1.0);
      };

      drawSpeedStripes(cx - sloganW / 2 - 24, cx - sloganW / 2 - 4, sloganY);
      drawSpeedStripes(cx + sloganW / 2 + 24, cx + sloganW / 2 + 4, sloganY);

      ctx.fillStyle = '#160404';
      ctx.fillText(sloganText, cx + 0.8, sloganY + 0.8);
      ctx.fillStyle = '#FFD54F';
      ctx.fillText(sloganText, cx, sloganY);

      // =========================================================================
      // 3. BOTÕES 16-BIT RETRÔ: INICIAR / CONTINUAR
      // =========================================================================
      const btnW = touchSafe ? 144 : 156;
      const btnH = touchSafe ? 16 : 17;
      const btnX = Math.round(cx - btnW / 2);
      const slant = 5;

      const btn0_Y = touchSafe ? 100 : 104;
      const btn1_Y = touchSafe ? 120 : 125;
      const btn2_Y = touchSafe ? 140 : 146;

      const mPos = this.input ? (this.input.mouseCanvasPos || this.input.mousePos) : null;
      let hoveredBtn = -1;
      if (mPos) {
        if (mPos.x >= btnX && mPos.x <= btnX + btnW + slant) {
          if (mPos.y >= btn0_Y && mPos.y <= btn0_Y + btnH) hoveredBtn = 0;
          else if (mPos.y >= btn1_Y && mPos.y <= btn1_Y + btnH) hoveredBtn = 1;
          else if (mPos.y >= btn2_Y && mPos.y <= btn2_Y + btnH) hoveredBtn = 2;
        }
      }
      if (hoveredBtn !== -1) {
        this.mainMenuSelection = hoveredBtn;
      }

      const drawSlantedBox = (x, y, w, h, s) => {
        ctx.beginPath();
        ctx.moveTo(x + s + 2.5, y);
        ctx.lineTo(x + w + s - 2.5, y);
        ctx.quadraticCurveTo(x + w + s, y, x + w + s - 1, y + 2);
        ctx.lineTo(x + w + 1, y + h - 2);
        ctx.quadraticCurveTo(x + w, y + h, x + w - 2.5, y + h);
        ctx.lineTo(x + 2.5, y + h);
        ctx.quadraticCurveTo(x, y + h, x + 1, y + h - 2);
        ctx.lineTo(x + s - 1, y + 2);
        ctx.quadraticCurveTo(x + s, y, x + s + 2.5, y);
        ctx.closePath();
      };

      const pulse = 0.35 + 0.25 * Math.sin(now * 0.007);
      const arrowFlash = Math.floor(now / 220) % 2 === 0;

      // --- BOTÃO 0: INICIAR NOVO JOGO ---
      const isSel0 = (this.mainMenuSelection === 0);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      drawSlantedBox(btnX + 1.5, btn0_Y + 2.0, btnW, btnH, slant);
      ctx.fill();

      ctx.strokeStyle = `rgba(255, 230, 0, ${isSel0 ? 0.95 : pulse})`;
      ctx.lineWidth = isSel0 ? 3.0 : 1.5;
      drawSlantedBox(btnX, btn0_Y, btnW, btnH, slant);
      ctx.stroke();

      const grad0 = ctx.createLinearGradient(btnX, btn0_Y, btnX, btn0_Y + btnH);
      if (isSel0) {
        grad0.addColorStop(0.0, '#FFFF8D');
        grad0.addColorStop(0.4, '#FFE082');
        grad0.addColorStop(1.0, '#F57C00');
      } else {
        grad0.addColorStop(0.0, '#FFF176');
        grad0.addColorStop(0.5, '#FFCA28');
        grad0.addColorStop(1.0, '#E65100');
      }
      ctx.fillStyle = grad0;
      drawSlantedBox(btnX, btn0_Y, btnW, btnH, slant);
      ctx.fill();

      ctx.lineWidth = 1.0;
      ctx.strokeStyle = isSel0 ? '#FFFFFF' : '#FFF9C4';
      drawSlantedBox(btnX + 1.0, btn0_Y + 1.0, btnW - 2.0, btnH - 2.0, slant);
      ctx.stroke();

      ctx.lineWidth = 1.2;
      ctx.strokeStyle = '#1B0800';
      drawSlantedBox(btnX, btn0_Y, btnW, btnH, slant);
      ctx.stroke();

      // Ícone Bandeira
      const flagX = btnX + 14;
      const flagY = Math.round(btn0_Y + (btnH - 8) / 2);
      const fsq = 2.0;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
          ctx.fillStyle = ((r + c) % 2 === 0) ? '#FFFFFF' : '#140800';
          ctx.fillRect(flagX + c * fsq, flagY + r * fsq, fsq, fsq);
        }
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'italic 900 9.5px monospace';
      ctx.fillStyle = '#100500';
      ctx.fillText('INICIAR NOVO JOGO', btnX + btnW / 2 + 6, btn0_Y + btnH / 2 + 0.5);

      if (isSel0 && arrowFlash) {
        ctx.font = 'bold 8.5px monospace';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('►', btnX - 7, btn0_Y + btnH / 2);
        ctx.fillText('◄', btnX + btnW + slant + 5, btn0_Y + btnH / 2);
      }

      // --- BOTÃO 1: CONTINUAR (CARREGAR SAVE) ---
      const isSel1 = (this.mainMenuSelection === 1);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      drawSlantedBox(btnX + 1.5, btn1_Y + 2.0, btnW, btnH, slant);
      ctx.fill();

      ctx.strokeStyle = `rgba(0, 229, 255, ${isSel1 ? 0.95 : pulse})`;
      ctx.lineWidth = isSel1 ? 3.0 : 1.5;
      drawSlantedBox(btnX, btn1_Y, btnW, btnH, slant);
      ctx.stroke();

      const grad1 = ctx.createLinearGradient(btnX, btn1_Y, btnX, btn1_Y + btnH);
      if (isSel1) {
        grad1.addColorStop(0.0, '#E0F2FE');
        grad1.addColorStop(0.4, '#38BDF8');
        grad1.addColorStop(1.0, '#0284C7');
      } else {
        grad1.addColorStop(0.0, '#BAE6FD');
        grad1.addColorStop(0.5, '#0284C7');
        grad1.addColorStop(1.0, '#0369A1');
      }
      ctx.fillStyle = grad1;
      drawSlantedBox(btnX, btn1_Y, btnW, btnH, slant);
      ctx.fill();

      ctx.lineWidth = 1.0;
      ctx.strokeStyle = isSel1 ? '#FFFFFF' : '#BAE6FD';
      drawSlantedBox(btnX + 1.0, btn1_Y + 1.0, btnW - 2.0, btnH - 2.0, slant);
      ctx.stroke();

      ctx.lineWidth = 1.2;
      ctx.strokeStyle = '#082F49';
      drawSlantedBox(btnX, btn1_Y, btnW, btnH, slant);
      ctx.stroke();

      // Ícone Disquete
      ctx.font = '9px monospace';
      ctx.fillStyle = '#0F172A';
      ctx.fillText('💾', btnX + 18, btn1_Y + btnH / 2);

      ctx.font = 'italic 900 9.5px monospace';
      ctx.fillStyle = '#082F49';
      ctx.fillText('CONTINUAR (SAVE)', btnX + btnW / 2 + 6, btn1_Y + btnH / 2 + 0.5);

      if (isSel1 && arrowFlash) {
        ctx.font = 'bold 8.5px monospace';
        ctx.fillStyle = '#00E5FF';
        ctx.fillText('►', btnX - 7, btn1_Y + btnH / 2);
        ctx.fillText('◄', btnX + btnW + slant + 5, btn1_Y + btnH / 2);
      }

      // --- BOTÃO 2: ONLINE 2P (FIREBASE) ---
      const isSel2 = (this.mainMenuSelection === 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      drawSlantedBox(btnX + 1.5, btn2_Y + 2.0, btnW, btnH, slant);
      ctx.fill();

      ctx.strokeStyle = `rgba(16, 185, 129, ${isSel2 ? 0.95 : pulse})`;
      ctx.lineWidth = isSel2 ? 3.0 : 1.5;
      drawSlantedBox(btnX, btn2_Y, btnW, btnH, slant);
      ctx.stroke();

      const grad2 = ctx.createLinearGradient(btnX, btn2_Y, btnX, btn2_Y + btnH);
      if (isSel2) {
        grad2.addColorStop(0.0, '#A7F3D0');
        grad2.addColorStop(0.4, '#34D399');
        grad2.addColorStop(1.0, '#059669');
      } else {
        grad2.addColorStop(0.0, '#6EE7B7');
        grad2.addColorStop(0.5, '#10B981');
        grad2.addColorStop(1.0, '#047857');
      }
      ctx.fillStyle = grad2;
      drawSlantedBox(btnX, btn2_Y, btnW, btnH, slant);
      ctx.fill();

      ctx.lineWidth = 1.0;
      ctx.strokeStyle = isSel2 ? '#FFFFFF' : '#A7F3D0';
      drawSlantedBox(btnX + 1.0, btn2_Y + 1.0, btnW - 2.0, btnH - 2.0, slant);
      ctx.stroke();

      ctx.lineWidth = 1.2;
      ctx.strokeStyle = '#022C22';
      drawSlantedBox(btnX, btn2_Y, btnW, btnH, slant);
      ctx.stroke();

      ctx.font = 'italic 900 9.0px monospace';
      ctx.fillStyle = '#022C22';
      ctx.fillText('🌐 ONLINE 2P (BETA)', btnX + btnW / 2 + 2, btn2_Y + btnH / 2 + 0.5);

      if (isSel2 && arrowFlash) {
        ctx.font = 'bold 8.5px monospace';
        ctx.fillStyle = '#34D399';
        ctx.fillText('►', btnX - 7, btn2_Y + btnH / 2);
        ctx.fillText('◄', btnX + btnW + slant + 5, btn2_Y + btnH / 2);
      }

      // Dica de controle abaixo dos botões
      const hintY = btn2_Y + btnH + 10;
      if (this.audio && this.audio.ctx && this.audio.ctx.state !== 'running') {
        const audioPulse = 0.5 + 0.5 * Math.sin(now * 0.008);
        ctx.fillStyle = `rgba(255, 235, 59, ${0.75 + 0.25 * audioPulse})`;
        ctx.font = touchSafe ? 'bold 5.8px monospace' : 'bold 6.6px monospace';
        ctx.fillText('🔊 CLIQUE NA TELA OU PRESSIONE UMA TECLA PARA ATIVAR O SOM', cx, hintY);
      } else if (this.input.gamepadConnected) {
        ctx.fillStyle = '#00E5FF';
        ctx.font = touchSafe ? 'bold 6.5px monospace' : 'bold 7.2px monospace';
        ctx.fillText('🎮 [D-PAD] NAVEGA | [A] CONFIRMA', cx, hintY);
      } else {
        ctx.fillStyle = '#B0BEC5';
        ctx.font = touchSafe ? '6.2px monospace' : '7px monospace';
        ctx.fillText('TOQUE NO BOTÃO OU [↑↓] + [ENTER] / [A]', cx, hintY);
      }

      // =========================================================================
      // 4. CRÉDITOS DO DESENVOLVEDOR NO RODAPÉ
      // =========================================================================
      const creditsY = touchSafe ? 194 : 204;
      const creditsText = 'Desenvolvido por Leandro Yata - 2026 - (75) 99190-2534';

      ctx.font = 'bold 6.2px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const creditW = ctx.measureText(creditsText).width;

      const cGradL = ctx.createLinearGradient(cx - creditW / 2 - 25, creditsY, cx - creditW / 2 - 4, creditsY);
      cGradL.addColorStop(0, 'rgba(255, 180, 0, 0)');
      cGradL.addColorStop(1, 'rgba(255, 180, 0, 0.8)');
      ctx.fillStyle = cGradL;
      ctx.fillRect(cx - creditW / 2 - 25, creditsY - 0.5, 21, 1.0);

      const cGradR = ctx.createLinearGradient(cx + creditW / 2 + 4, creditsY, cx + creditW / 2 + 25, creditsY);
      cGradR.addColorStop(0, 'rgba(255, 180, 0, 0.8)');
      cGradR.addColorStop(1, 'rgba(255, 180, 0, 0)');
      ctx.fillStyle = cGradR;
      ctx.fillRect(cx + creditW / 2 + 4, creditsY - 0.5, 21, 1.0);

      ctx.fillStyle = '#060410';
      ctx.fillText(creditsText, cx + 0.5, creditsY + 0.5);
      ctx.fillStyle = '#FFD54F';
      ctx.fillText(creditsText, cx, creditsY);

      // Resumo discreto de carreira e conquistas (se já houver corridas registradas)
      if (typeof CareerStats !== 'undefined') {
        const st = CareerStats.get();
        if (st.races > 0) {
          ctx.font = 'bold 5.5px monospace';
          ctx.fillStyle = '#94A3B8';
          const achTxt = `${st.achievements.length}/${ACHIEVEMENTS_LIST.length}`;
          ctx.fillText(`🏆 VITÓRIAS: ${st.wins}  |  PÓDIOS: ${st.podiums}  |  ${st.totalKm} KM  |  TROFÉUS: ${achTxt}`, cx, creditsY - 10);
        }
      }

      ctx.restore();
    }

    renderOnlineLobby(ctx) {
      const L = this.getOnlineLobbyLayout();
      const cx = INTERNAL_WIDTH / 2;
      const np = this.netplay;
      const sub = this.onlineSubMode || 'CHOICE';

      ctx.fillStyle = 'rgba(6, 9, 18, 0.86)';
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#34D399';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('🌐 MULTIPLAYER ONLINE 2P', cx, 18);

      const drawBtn = (btn, label, bg, border, fg, font = 'bold 7.2px monospace') => {
        ctx.fillStyle = bg;
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.strokeStyle = border;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
        ctx.textAlign = 'center';
        ctx.fillStyle = fg;
        ctx.font = font;
        ctx.fillText(label, btn.x + btn.w / 2, btn.y + btn.h / 2 + 2.5);
      };

      if (sub === 'CHOICE') {
        ctx.fillStyle = '#CBD5E1';
        ctx.font = '7px monospace';
        ctx.fillText('CORRA CONTRA UM AMIGO ONLINE + 18 BOTS', cx, 36);

        drawBtn(L.btnCreate, '🏁 CRIAR SALA (HOST)', '#065F46', '#10B981', '#FFFFFF');
        drawBtn(L.btnJoin, '🔑 ENTRAR COM CÓDIGO', '#0C4A6E', '#38BDF8', '#FFFFFF');

        if (np && np.errorMsg) {
          ctx.fillStyle = '#F87171';
          ctx.font = 'bold 6.8px monospace';
          ctx.fillText(np.errorMsg, cx, 118);
        } else {
          ctx.fillStyle = '#94A3B8';
          ctx.font = '6.4px monospace';
          ctx.fillText('1 jogador cria a sala e passa o código de 4 letras ao amigo.', cx, 118);
        }

        drawBtn(L.btnBack, '◀ VOLTAR', '#1E293B', '#EF4444', '#EF4444');
        ctx.restore();
        return;
      }

      if (sub === 'JOIN_CODE') {
        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 8.5px monospace';
        ctx.fillText('DIGITE O CÓDIGO DA SALA (4 LETRAS)', cx, 56);

        if (np && np.errorMsg) {
          ctx.fillStyle = '#F87171';
          ctx.font = 'bold 6.8px monospace';
          ctx.fillText(np.errorMsg, cx, 112);
        }

        drawBtn(L.btnJoinGo, 'CONECTAR ▶', '#065F46', '#10B981', '#FFFFFF');
        drawBtn(L.btnBack, '◀ VOLTAR', '#1E293B', '#EF4444', '#EF4444');
        ctx.restore();
        return;
      }

      // sub === 'ROOM'
      const { boxX, boxY, boxW, boxH } = L;
      ctx.fillStyle = 'rgba(14, 22, 38, 0.96)';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = '#34D399';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      const meta = (np && np.meta) ? np.meta : {};
      const isHost = (np && np.role === 'HOST');
      const code = (np && np.roomCode) ? np.roomCode : '----';

      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 9.5px monospace';
      ctx.fillText(`SALA: ${code}   (${isHost ? 'VOCÊ É O HOST' : 'CONVIDADO'})`, cx, boxY + 14);

      // Cards Host vs Convidado
      const halfW = Math.floor((boxW - 22) / 2);
      const drawPlayerBox = (px, py, label, pName, carIdx, ready, accent) => {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(px, py, halfW, 34);
        ctx.strokeStyle = ready ? '#10B981' : accent;
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, halfW, 34);
        ctx.textAlign = 'left';
        ctx.fillStyle = accent;
        ctx.font = 'bold 6px monospace';
        ctx.fillText(label, px + 5, py + 9);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 7px monospace';
        ctx.fillText(pName || 'AGUARDANDO...', px + 5, py + 20);
        const carObj = CAR_MODELS[carIdx || 0] || CAR_MODELS[0];
        ctx.fillStyle = ready ? '#34D399' : '#94A3B8';
        ctx.font = '5.8px monospace';
        ctx.fillText(pName ? `${carObj.name} • ${ready ? 'PRONTO' : 'ESCOLHENDO'}` : 'Passe o código da sala', px + 5, py + 30);
      };

      drawPlayerBox(boxX + 8, boxY + 22, 'HOST (P19)', meta.hostName || 'HOST', meta.hostCarIndex || 0, !!meta.hostReady, '#FFD700');
      drawPlayerBox(boxX + boxW - 8 - halfW, boxY + 22, 'AMIGO (P20)', meta.guestName || '', meta.guestCarIndex || 0, !!meta.guestReady, '#38BDF8');

      // Seleção de carro e cor do jogador local
      const myCar = CAR_MODELS[this.selectedCarIndex] || CAR_MODELS[0];
      drawBtn(L.btnCarPrev, '◀', '#1E293B', '#38BDF8', '#FFFFFF');
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(L.btnCarPrev.x + 20, L.btnCarPrev.y, 120, 16);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 6.4px monospace';
      ctx.fillText(myCar.name, L.btnCarPrev.x + 80, L.btnCarPrev.y + 10.5);
      drawBtn(L.btnCarNext, '▶', '#1E293B', '#38BDF8', '#FFFFFF');
      const curCol = (typeof CAR_COLORS !== 'undefined' && CAR_COLORS[this.colorIndex]) ? CAR_COLORS[this.colorIndex] : { hex: '#EF4444' };
      drawBtn(L.btnColNext, 'COR', '#1E293B', curCol.hex, '#FFFFFF', 'bold 6px monospace');
      ctx.fillStyle = curCol.hex;
      ctx.fillRect(L.btnColNext.x + 4, L.btnColNext.y + 4, 8, L.btnColNext.h - 8);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(L.btnColNext.x + 4, L.btnColNext.y + 4, 8, L.btnColNext.h - 8);

      // Seleção de pista e clima (Host controla)
      const tIdx = (meta.trackIndex !== undefined) ? meta.trackIndex : 0;
      const tDef = TRACK_DEFINITIONS[tIdx] || TRACK_DEFINITIONS[0];
      const env = meta.envCond || 'DIA';
      if (isHost) {
        drawBtn(L.btnTrkPrev, '◀', '#1E293B', '#FFD700', '#FFFFFF');
        drawBtn(L.btnTrkNext, '▶', '#1E293B', '#FFD700', '#FFFFFF');
        drawBtn(L.btnEnvNext, `CLIMA: ${env}`, '#1E293B', '#38BDF8', '#E0F2FE', 'bold 5.8px monospace');
      }
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(L.btnTrkPrev.x + 20, L.btnTrkPrev.y, 160, 16);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 6.2px monospace';
      ctx.fillText(`PISTA: ${tDef.name}`, L.btnTrkPrev.x + 100, L.btnTrkPrev.y + 10.5);
      if (!isHost) {
        ctx.fillStyle = '#94A3B8';
        ctx.font = '5.8px monospace';
        ctx.fillText(`CLIMA: ${env}`, L.btnEnvNext.x + L.btnEnvNext.w / 2, L.btnEnvNext.y + 10.5);
      }

      // Botão Pronto / Iniciar
      const myReady = isHost ? !!meta.hostReady : !!meta.guestReady;
      drawBtn(L.btnReady, myReady ? '✓ ESTOU PRONTO' : 'MARCAR PRONTO', myReady ? '#065F46' : '#1E293B', myReady ? '#10B981' : '#F59E0B', '#FFFFFF');

      drawBtn(L.btnBack, '◀ SAIR DA SALA', '#1E293B', '#EF4444', '#EF4444', 'bold 6.5px monospace');
      if (isHost) {
        const canStart = !!(meta.guestName && meta.hostReady && meta.guestReady);
        drawBtn(L.btnStart, canStart ? '🏁 LARGAR AGORA ▶' : 'AGUARDANDO AMIGO', canStart ? '#065F46' : '#1E293B', canStart ? '#10B981' : '#475569', canStart ? '#FFFFFF' : '#94A3B8', 'bold 6.5px monospace');
      }

      ctx.restore();
    }

    renderModeSelect(ctx) {
      const L = this.getModeSelectLayout();
      const touchSafe = L.touchSafe;
      const now = performance.now();

      // Fundo escuro translúcido revelando a pista ao fundo
      ctx.fillStyle = 'rgba(6, 9, 18, 0.82)';
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#00E5FF';
      ctx.font = touchSafe ? 'bold 11px monospace' : 'bold 13px monospace';
      ctx.fillText('MODOS DE JOGO', INTERNAL_WIDTH / 2, touchSafe ? 19 : 23);

      ctx.fillStyle = '#FFD700';
      ctx.font = touchSafe ? 'bold 6.8px monospace' : 'bold 7.8px monospace';
      ctx.fillText('SELECIONE O TIPO DE DISPUTA', INTERNAL_WIDTH / 2, touchSafe ? 29 : 33);

      const modes = [
        {
          id: 0,
          title: 'CAMPEONATO F1',
          icon: '🏆',
          badge: this.customChampionship ? 'TORNEIO CUSTOM' : 'TEMPORADA COMPLETA',
          color: this.customChampionship ? '#38BDF8' : '#FFD700',
          lines: this.customChampionship ? [
            '• 5 A 31 PISTAS À ESCOLHA',
            '• NA ORDEM QUE VOCÊ DEFINIR',
            '• PRÊMIOS ESCALONADOS'
          ] : [
            `• ${TRACK_DEFINITIONS.length} ETAPAS (FINAL EM SP)`,
            '• PONTUAÇÃO F1 (1º AO 10º)',
            '• DISPUTA DO TÍTULO & PÓDIO'
          ],
          box: L.card0
        },
        {
          id: 1,
          title: 'CORRIDA RÁPIDA',
          icon: '⚡',
          badge: 'AÇÃO IMEDIATA',
          color: '#00E5FF',
          lines: [
            '• ESCOLHA 1 CIRCUITO',
            '• DUELO C/ 19 BOTS',
            '• RESULTADO DIRETO'
          ],
          box: L.card1
        },
        {
          id: 2,
          title: 'TIME TRIAL',
          icon: '⏱',
          badge: 'CARRO FANTASMA',
          color: '#00E676',
          lines: [
            '• PISTA 100% LIVRE',
            '• GRAVA MELHOR VOLTA',
            '• DUELO C/ FANTASMA'
          ],
          box: L.card2
        }
      ];

      for (let m = 0; m < modes.length; m++) {
        const item = modes[m];
        if (!item.box) continue;
        const isSelected = (this.selectedModeIndex === item.id);
        const { x, y, w, h } = item.box;

        // Fundo do card
        const cardGrad = ctx.createLinearGradient(x, y, x, y + h);
        if (isSelected) {
          cardGrad.addColorStop(0, 'rgba(18, 30, 52, 0.96)');
          cardGrad.addColorStop(1, 'rgba(10, 16, 30, 0.98)');
        } else {
          cardGrad.addColorStop(0, 'rgba(12, 16, 26, 0.88)');
          cardGrad.addColorStop(1, 'rgba(6, 9, 16, 0.92)');
        }
        ctx.fillStyle = cardGrad;
        ctx.fillRect(x, y, w, h);

        // Borda com brilho se selecionado
        if (isSelected) {
          ctx.strokeStyle = item.color;
          ctx.lineWidth = 1.8;
          ctx.strokeRect(x, y, w, h);

          ctx.fillStyle = item.color;
          ctx.fillRect(x + 2, y + 2, w - 4, 3);
        } else {
          ctx.strokeStyle = 'rgba(70, 90, 120, 0.4)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, w, h);
        }

        // Tag superior
        ctx.fillStyle = isSelected ? item.color : '#78909C';
        ctx.font = 'bold 5.8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`[ ${item.badge} ]`, x + w / 2, y + 14);

        // Ícone grande
        ctx.font = '16px monospace';
        ctx.fillText(item.icon, x + w / 2, y + 35);

        // Título do modo
        ctx.fillStyle = isSelected ? '#FFFFFF' : '#B0BEC5';
        ctx.font = 'bold 7.8px monospace';
        ctx.fillText(item.title, x + w / 2, y + 52);

        // Linha divisória
        ctx.fillStyle = isSelected ? item.color : 'rgba(100, 120, 150, 0.3)';
        ctx.fillRect(x + 8, y + 58, w - 16, 1);

        // Linhas de descrição
        ctx.textAlign = 'left';
        ctx.font = '6.2px monospace';
        ctx.fillStyle = isSelected ? '#E2E8F0' : '#8898AA';
        for (let l = 0; l < item.lines.length; l++) {
          ctx.fillText(item.lines[l], x + 7, y + 72 + l * 12);
        }

        // Pill de alternância Oficial / Custom dentro do card 0 (Campeonato)
        if (item.id === 0 && L.btnChampType) {
          const tb = L.btnChampType;
          ctx.fillStyle = this.customChampionship ? 'rgba(14, 116, 144, 0.85)' : 'rgba(30, 41, 59, 0.92)';
          ctx.fillRect(tb.x, tb.y, tb.w, tb.h);
          ctx.strokeStyle = this.customChampionship ? '#38BDF8' : '#F59E0B';
          ctx.lineWidth = 1;
          ctx.strokeRect(tb.x, tb.y, tb.w, tb.h);
          ctx.textAlign = 'center';
          ctx.fillStyle = this.customChampionship ? '#E0F2FE' : '#FDE68A';
          ctx.font = 'bold 5.8px monospace';
          ctx.fillText(this.customChampionship ? '◀ CUSTOM (5-31) ▶' : '◀ OFICIAL (31) ▶', tb.x + tb.w / 2, tb.y + tb.h * 0.72);
        }

        // Status no rodapé do card
        ctx.textAlign = 'center';
        if (isSelected) {
          const blink = Math.floor(now / 320) % 2 === 0;
          ctx.fillStyle = blink ? item.color : '#FFFFFF';
          ctx.font = 'bold 6.6px monospace';
          ctx.fillText('▶ SELECIONADO ◀', x + w / 2, y + h - 8);
        } else {
          ctx.fillStyle = '#64748B';
          ctx.font = '6.0px monospace';
          ctx.fillText('TOQUE P/ ESCOLHER', x + w / 2, y + h - 8);
        }
      }

      // Botões inferiores: VOLTAR e CONFIRMAR
      const btnB = L.btnBack;
      if (btnB) {
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(btnB.x, btnB.y, btnB.w, btnB.h);
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 1;
        ctx.strokeRect(btnB.x, btnB.y, btnB.w, btnB.h);
        ctx.fillStyle = '#EF4444';
        ctx.font = touchSafe ? 'bold 6.8px monospace' : 'bold 7.5px monospace';
        ctx.fillText('◀ VOLTAR', btnB.x + btnB.w / 2, btnB.y + btnB.h / 2 + 2.5);
      }

      const btnC = L.btnConfirm;
      if (btnC) {
        ctx.fillStyle = '#065F46';
        ctx.fillRect(btnC.x, btnC.y, btnC.w, btnC.h);
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(btnC.x, btnC.y, btnC.w, btnC.h);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = touchSafe ? 'bold 7.2px monospace' : 'bold 8px monospace';
        ctx.fillText('CONTINUAR ▶', btnC.x + btnC.w / 2, btnC.y + btnC.h / 2 + 2.5);
      }

      ctx.restore();
    }

    renderCustomScheduleSelect(ctx) {
      const L = this.getCustomScheduleLayout();
      const touchSafe = L.touchSafe;
      const schedule = this.customSchedule || [];
      const curIdx = (this.customCursorIndex !== undefined) ? this.customCursorIndex : 0;
      const track = TRACK_DEFINITIONS[curIdx] || TRACK_DEFINITIONS[0];

      ctx.fillStyle = 'rgba(6, 9, 18, 0.84)';
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#38BDF8';
      ctx.font = touchSafe ? 'bold 9px monospace' : 'bold 10px monospace';
      ctx.fillText(`MONTE SEU CAMPEONATO (${schedule.length}/${TRACK_DEFINITIONS.length} — MÍN. 5)`, INTERNAL_WIDTH / 2, touchSafe ? 9.5 : 10.5);

      // Grade de chips das 31 pistas
      for (let c = 0; c < L.chips.length; c++) {
        const chip = L.chips[c];
        const orderPos = schedule.indexOf(chip.i);
        const isAdded = (orderPos !== -1);
        const isCursor = (curIdx === chip.i);
        const tDef = TRACK_DEFINITIONS[chip.i];
        const stateTxt = chip.isClassic
          ? `★ ${tDef.stateCode || tDef.name.split(' ')[0]}`
          : (tDef.stateCode || (chip.i - 3));

        if (isAdded) {
          ctx.fillStyle = '#0284C7';
        } else if (chip.isClassic) {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
        } else {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        }
        ctx.fillRect(chip.x, chip.y, chip.w, chip.h);

        ctx.strokeStyle = isCursor ? '#FFD700' : (isAdded ? '#38BDF8' : (chip.isClassic ? '#F59E0B' : 'rgba(70, 90, 120, 0.4)'));
        ctx.lineWidth = isCursor ? 1.5 : (isAdded ? 1.1 : 0.6);
        ctx.strokeRect(chip.x, chip.y, chip.w, chip.h);

        ctx.fillStyle = isAdded ? '#FFFFFF' : (chip.isClassic ? '#FDE68A' : '#CBD5E1');
        ctx.font = 'bold 5.5px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(stateTxt, chip.x + chip.w / 2, chip.y + chip.h * 0.74);

        // Badge com o número da ordem escolhida
        if (isAdded) {
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(chip.x + 1, chip.y + 1, 9, 5.5);
          ctx.fillStyle = '#041019';
          ctx.font = 'bold 4.8px monospace';
          ctx.fillText(`${orderPos + 1}`, chip.x + 5.5, chip.y + 5.2);
        }
      }

      // Card central de preview + ordem selecionada
      const { bX, bY, bW, bH } = L;
      const cardGrad = ctx.createLinearGradient(bX, bY, bX, bY + bH);
      cardGrad.addColorStop(0, 'rgba(14, 22, 38, 0.95)');
      cardGrad.addColorStop(1, 'rgba(8, 12, 22, 0.97)');
      ctx.fillStyle = cardGrad;
      ctx.fillRect(bX, bY, bW, bH);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.3;
      ctx.strokeRect(bX, bY, bW, bH);

      const curOrder = schedule.indexOf(curIdx);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 7.5px monospace';
      ctx.fillText(`${track.name}`, bX + 8, bY + 12);

      ctx.textAlign = 'right';
      ctx.fillStyle = curOrder !== -1 ? '#10B981' : '#94A3B8';
      ctx.font = 'bold 6.2px monospace';
      ctx.fillText(curOrder !== -1 ? `✓ ETAPA #${curOrder + 1} (CLIQUE P/ REMOVER)` : '+ CLIQUE/ESPAÇO P/ ADICIONAR', bX + bW - 8, bY + 12);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '5.8px monospace';
      ctx.fillText(`MONUMENTO: ${track.monument || track.style || 'CIRCUITO'}`, bX + 8, bY + 22);

      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.fillRect(bX + 8, bY + 26, bW - 16, 1);

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 6px monospace';
      ctx.fillText('ORDEM DO CALENDÁRIO:', bX + 8, bY + 36);

      if (schedule.length === 0) {
        ctx.fillStyle = '#64748B';
        ctx.font = '6px monospace';
        ctx.fillText('Nenhuma pista selecionada. Clique nas pistas acima ou use ALEATÓRIO 10.', bX + 8, bY + 50);
      } else {
        const perRow = 6;
        const maxRows = 4;
        const cellW = Math.floor((bW - 16) / perRow);
        for (let i = 0; i < Math.min(schedule.length, perRow * maxRows); i++) {
          const tDef = TRACK_DEFINITIONS[schedule[i]];
          const code = tDef ? (tDef.stateCode || tDef.name.slice(0, 4).toUpperCase()) : `#${schedule[i]}`;
          const col = i % perRow;
          const row = Math.floor(i / perRow);
          const tx = bX + 8 + col * cellW;
          const ty = bY + 47 + row * 11;
          ctx.fillStyle = (i === schedule.length - 1) ? '#FFD700' : '#E2E8F0';
          ctx.font = 'bold 5.8px monospace';
          ctx.fillText(`${i + 1}.${code}`, tx, ty);
        }
        if (schedule.length > perRow * maxRows) {
          ctx.fillStyle = '#94A3B8';
          ctx.font = '5.5px monospace';
          ctx.fillText(`+ ${schedule.length - perRow * maxRows} etapas...`, bX + 8, bY + bH - 6);
        }
      }

      if (this.customScheduleWarnTimer > 0) {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 6.5px monospace';
        ctx.fillText('SELECIONE NO MÍNIMO 5 PISTAS PARA CONTINUAR!', bX + bW / 2, bY + bH - 6);
      }

      // Botões de ação rápida: ALEATÓRIO 10 e LIMPAR
      const drawActionBtn = (btn, label, bg, border, fg) => {
        ctx.fillStyle = bg;
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.strokeStyle = border;
        ctx.lineWidth = 1;
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
        ctx.textAlign = 'center';
        ctx.fillStyle = fg;
        ctx.font = 'bold 6.2px monospace';
        ctx.fillText(label, btn.x + btn.w / 2, btn.y + btn.h * 0.72);
      };

      drawActionBtn(L.btnRandom, '🎲 ALEATÓRIO (10)', '#1E293B', '#38BDF8', '#E0F2FE');
      drawActionBtn(L.btnClear, '🗑 LIMPAR TUDO', '#1E293B', '#F59E0B', '#FDE68A');

      // Botões inferiores: VOLTAR e CONFIRMAR
      drawActionBtn(L.btnBack, '◀ VOLTAR', '#1E293B', '#EF4444', '#EF4444');
      const ready = (schedule.length >= 5);
      drawActionBtn(
        L.btnConfirm,
        ready ? `CONFIRMAR (${schedule.length}) ▶` : `MÍN. 5 PISTAS (${schedule.length}/5)`,
        ready ? '#065F46' : '#1E293B',
        ready ? '#10B981' : '#475569',
        ready ? '#FFFFFF' : '#94A3B8'
      );

      ctx.restore();
    }

    renderTrackSelect(ctx) {
      const L = this.getTrackSelectLayout();
      const touchSafe = L.touchSafe;
      const now = performance.now();
      const track = TRACK_DEFINITIONS[this.selectedQuickTrackIndex] || TRACK_DEFINITIONS[0];

      // Fundo escuro translúcido permitindo ver o circuito e monumentos rolando em 3D atrás!
      ctx.fillStyle = 'rgba(6, 9, 18, 0.82)';
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#00E5FF';
      ctx.font = touchSafe ? 'bold 9.5px monospace' : 'bold 10.5px monospace';
      ctx.fillText('CIRCUITOS DO BRASIL — 4 CLÁSSICAS & 27 CAPITAIS', INTERNAL_WIDTH / 2, touchSafe ? 9.5 : 10.5);

      // 1. Grade de Chips (Fileira Clássica Dourada + 27 Capitais)
      for (let c = 0; c < L.chips.length; c++) {
        const chip = L.chips[c];
        const isSel = (this.selectedQuickTrackIndex === chip.i);
        const tDef = TRACK_DEFINITIONS[chip.i];
        const stateTxt = chip.isClassic 
          ? `★ ${tDef.stateCode || tDef.name.split(' ')[0]}`
          : (tDef.stateCode || (chip.i - 3));

        if (chip.isClassic) {
          ctx.fillStyle = isSel ? '#FFD700' : 'rgba(245, 158, 11, 0.22)';
          ctx.fillRect(chip.x, chip.y, chip.w, chip.h);
          ctx.strokeStyle = isSel ? '#FFFFFF' : '#F59E0B';
          ctx.lineWidth = isSel ? 1.3 : 0.8;
          ctx.strokeRect(chip.x, chip.y, chip.w, chip.h);
          ctx.fillStyle = isSel ? '#041019' : '#FDE68A';
          ctx.font = 'bold 5.8px monospace';
        } else {
          ctx.fillStyle = isSel ? '#00E5FF' : 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(chip.x, chip.y, chip.w, chip.h);
          ctx.strokeStyle = isSel ? '#FFD700' : 'rgba(70, 90, 120, 0.4)';
          ctx.lineWidth = isSel ? 1.2 : 0.6;
          ctx.strokeRect(chip.x, chip.y, chip.w, chip.h);
          ctx.fillStyle = isSel ? '#041019' : '#CBD5E1';
          ctx.font = 'bold 5.6px monospace';
        }
        ctx.textAlign = 'center';
        ctx.fillText(stateTxt, chip.x + chip.w / 2, chip.y + chip.h * 0.75);

        // Medalha de melhor resultado salvo no chip do estado
        const rec = (typeof TrackRecords !== 'undefined') ? TrackRecords.get(tDef.id) : null;
        if (rec && rec.bestRank > 0 && rec.bestRank <= 3) {
          ctx.fillStyle = rec.bestRank === 1 ? '#FFD700' : (rec.bestRank === 2 ? '#E2E8F0' : '#D97706');
          ctx.fillRect(chip.x + chip.w - 3.5, chip.y + 1.2, 2.4, 2.4);
        }
      }

      // 2. Card Central da Capital & Monumento
      const { bX, bY, bW, bH } = L;
      const cardGrad = ctx.createLinearGradient(bX, bY, bX, bY + bH);
      cardGrad.addColorStop(0, 'rgba(14, 22, 38, 0.95)');
      cardGrad.addColorStop(1, 'rgba(8, 12, 22, 0.97)');
      ctx.fillStyle = cardGrad;
      ctx.fillRect(bX, bY, bW, bH);

      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(bX, bY, bW, bH);

      // Faixa superior colorida do card
      ctx.fillStyle = '#00E5FF';
      ctx.fillRect(bX + 2, bY + 2, bW - 4, 2.5);

      // Título: [ 01 / 27 ]  CAPITAL • UF
      const numStr = (this.selectedQuickTrackIndex + 1 < 10 ? '0' : '') + (this.selectedQuickTrackIndex + 1);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(`[ ${numStr} / ${TRACK_DEFINITIONS.length} ]  ${track.name}`, bX + bW / 2, bY + 13);

      // Subtítulo do Monumento
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 6.2px monospace';
      ctx.fillText(`${track.flag} MONUMENTO: ${track.monument}`, bX + bW / 2, bY + 22);

      // Linha divisória
      ctx.fillStyle = 'rgba(0, 229, 255, 0.25)';
      ctx.fillRect(bX + 8, bY + 26, bW - 16, 1);

      // Lado Esquerdo do Card: Minimapa da Pista
      const mapBoxW = 75;
      const mapBoxH = 65;
      const mapX = bX + 10;
      const mapY = bY + 31;

      ctx.fillStyle = 'rgba(4, 8, 16, 0.75)';
      ctx.fillRect(mapX, mapY, mapBoxW, mapBoxH);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(mapX, mapY, mapBoxW, mapBoxH);

      // Renderiza o traçado vetorial do minimapa
      if (this.track && this.track.mapPoints) {
        const pts = this.track.mapPoints;
        ctx.strokeStyle = '#263238';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < pts.length; i++) {
          const mx = mapX + 5 + pts[i].x * (mapBoxW - 10);
          const my = mapY + 5 + pts[i].z * (mapBoxH - 10);
          if (i === 0) ctx.moveTo(mx, my);
          else ctx.lineTo(mx, my);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Ponto de largada / chegada (Verde)
        if (pts.length > 0) {
          const startX = mapX + 5 + pts[0].x * (mapBoxW - 10);
          const startY = mapY + 5 + pts[0].z * (mapBoxH - 10);
          ctx.fillStyle = '#00E676';
          ctx.beginPath();
          ctx.arc(startX, startY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Distância do circuito abaixo do mapa
      const kmStr = (this.track ? (this.track.totalLength / 1000).toFixed(1) : '3.2') + ' KM';
      ctx.fillStyle = '#FEDD00';
      ctx.font = 'bold 5.8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`CIRCUITO: ${kmStr}`, mapX + mapBoxW / 2, mapY + mapBoxH + 9);

      // Lado Direito do Card: Detalhes, Vibe e Monumento
      const infoX = bX + mapBoxW + 18;
      ctx.textAlign = 'left';

      // Linha 1: Região / Vibe
      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 6.2px monospace';
      ctx.fillText(`• ESTILO: ${track.themeTag}`, infoX, bY + 38);

      // Linha 2: Clima Padrão
      ctx.fillStyle = '#F8FAFC';
      ctx.font = '6px monospace';
      ctx.fillText(`• CLIMA PADRÃO: ${track.theme}`, infoX, bY + 50);

      // Linha 3: Voltas & Recorde Salvo
      const trackRec = (typeof TrackRecords !== 'undefined') ? TrackRecords.get(track.id) : null;
      const medalIcon = (trackRec && trackRec.bestRank === 1) ? '🥇' : (trackRec && trackRec.bestRank === 2 ? '🥈' : (trackRec && trackRec.bestRank === 3 ? '🥉' : ''));
      const recLapStr = (trackRec && trackRec.bestLap > 0) ? this.formatTime(trackRec.bestLap) : '--:--.--';
      ctx.fillStyle = '#E2E8F0';
      ctx.fillText(`• PROVA: ${TOTAL_LAPS} VOLTAS  ${medalIcon}`, infoX, bY + 62);

      // Linha 4: Recorde de Melhor Volta
      ctx.fillStyle = '#00E676';
      ctx.font = 'bold 6px monospace';
      ctx.fillText(`• RECORDE: ${recLapStr}`, infoX, bY + 74);
      ctx.fillStyle = '#FFD700';
      ctx.font = '5.6px monospace';
      ctx.fillText(`★ ${track.monument}`, infoX, bY + 84);

      // Tag de status selecionado
      const blink = Math.floor(now / 300) % 2 === 0;
      ctx.fillStyle = blink ? '#00E5FF' : '#FFFFFF';
      ctx.font = 'bold 6.2px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('▶ CIRCUITO PRONTO PARA CORRER ◀', bX + bW / 2, bY + bH - 6);

      // Setas laterais de navegação ◀ e ▶
      const drawSideArrow = (btn, isLeft) => {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 1;
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
        ctx.fillStyle = '#00E5FF';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(isLeft ? '◀' : '▶', btn.x + btn.w / 2, btn.y + btn.h / 2 + 3.5);
      };
      if (L.btnPrev) drawSideArrow(L.btnPrev, true);
      if (L.btnNext) drawSideArrow(L.btnNext, false);

      // Botões inferiores: VOLTAR e ESCOLHER CARRO
      const btnB = L.btnBack;
      if (btnB) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
        ctx.fillRect(btnB.x, btnB.y, btnB.w, btnB.h);
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 1;
        ctx.strokeRect(btnB.x, btnB.y, btnB.w, btnB.h);
        ctx.fillStyle = '#EF4444';
        ctx.font = touchSafe ? 'bold 6.8px monospace' : 'bold 7.5px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('◀ VOLTAR [B]', btnB.x + btnB.w / 2, btnB.y + btnB.h / 2 + 2.5);
      }

      const btnC = L.btnConfirm;
      if (btnC) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
        ctx.fillRect(btnC.x, btnC.y, btnC.w, btnC.h);
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(btnC.x, btnC.y, btnC.w, btnC.h);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = touchSafe ? 'bold 7.2px monospace' : 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ESCOLHER CARRO [A] ▶', btnC.x + btnC.w / 2, btnC.y + btnC.h / 2 + 2.5);
      }

      ctx.restore();
    }

    renderNameInput(ctx) {
      const touchSafe = this.input.touchControlsVisible;
      const now = performance.now();
      const car = CAR_MODELS[this.selectedCarIndex];
      const color = CAR_COLORS[this.colorIndex];

      ctx.fillStyle = 'rgba(6, 9, 18, 0.88)';
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

      ctx.save();
      ctx.textAlign = 'center';

      // Titulo
      ctx.fillStyle = '#00E5FF';
      ctx.font = touchSafe ? 'bold 11px monospace' : 'bold 13px monospace';
      ctx.fillText('IDENTIFICA\u00C7\u00C3O DO PILOTO', INTERNAL_WIDTH / 2, touchSafe ? 24 : 28);

      // Caixa Central Elegante
      const boxW = touchSafe ? 220 : 250;
      const boxH = touchSafe ? 130 : 142;
      const boxX = INTERNAL_WIDTH / 2 - boxW / 2;
      const boxY = touchSafe ? 36 : 42;

      ctx.fillStyle = 'rgba(14, 22, 38, 0.94)';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      // Miniatura do carro escolhido
      CarArt.renderModel(
        ctx,
        car,
        INTERNAL_WIDTH / 2,
        boxY + (touchSafe ? 34 : 38),
        touchSafe ? 88 : 98,
        touchSafe ? 55 : 62,
        false,
        0,
        color.hex,
        { isNitro: false, wheelPhase: now * 0.012, isNight: false, speed: 0 }
      );

      ctx.fillStyle = '#B0BEC5';
      ctx.font = 'bold 8.5px monospace';
      ctx.fillText(`${car.name} - ${color.name}`, INTERNAL_WIDTH / 2, boxY + (touchSafe ? 58 : 64));

      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('DIGITE SEU NOME DE PILOTO ABAIXO:', INTERNAL_WIDTH / 2, boxY + (touchSafe ? 74 : 80));

      // Botões VOLTAR e CONFIRMAR
      const btnW = touchSafe ? 88 : 100;
      const btnH = touchSafe ? 18 : 20;
      const btnY = boxY + boxH - (touchSafe ? 24 : 26);
      const btnBackX = boxX + 12;
      const btnConfirmX = boxX + boxW - 12 - btnW;
      const blink = Math.floor(now / 350) % 2 === 0;

      // Botão ◀ VOLTAR
      const backGrad = ctx.createLinearGradient(btnBackX, btnY, btnBackX, btnY + btnH);
      backGrad.addColorStop(0, '#2C3E50');
      backGrad.addColorStop(1, '#1A252F');
      ctx.fillStyle = backGrad;
      ctx.fillRect(btnBackX, btnY, btnW, btnH);
      ctx.strokeStyle = '#E74C3C';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(btnBackX, btnY, btnW, btnH);
      ctx.fillStyle = '#ECF0F1';
      ctx.font = touchSafe ? 'bold 8px monospace' : 'bold 9px monospace';
      ctx.fillText('◀ VOLTAR [B]', btnBackX + btnW / 2, btnY + btnH / 2 + 3);

      // Botão CONFIRMAR ▶
      const confirmGrad = ctx.createLinearGradient(btnConfirmX, btnY, btnConfirmX, btnY + btnH);
      confirmGrad.addColorStop(0, blink ? '#00E5FF' : '#00B0FF');
      confirmGrad.addColorStop(1, blink ? '#0091EA' : '#005F9E');
      ctx.fillStyle = confirmGrad;
      ctx.fillRect(btnConfirmX, btnY, btnW, btnH);
      ctx.strokeStyle = blink ? '#FFFFFF' : '#FFD700';
      ctx.lineWidth = 1.3;
      ctx.strokeRect(btnConfirmX, btnY, btnW, btnH);
      ctx.fillStyle = '#060D1A';
      ctx.font = touchSafe ? 'bold 8px monospace' : 'bold 9px monospace';
      ctx.fillText('CONFIRMAR [A] ▶', btnConfirmX + btnW / 2, btnY + btnH / 2 + 3);

      ctx.fillStyle = '#90A4AE';
      ctx.font = touchSafe ? '6.5px monospace' : '7.5px monospace';
      ctx.fillText('[A] / [ENTER] CONFIRMAR | [B] / [ESC] VOLTAR AO CARRO', INTERNAL_WIDTH / 2, touchSafe ? 182 : 204);

      ctx.restore();
    }

    wrapText(ctx, text, maxWidth) {
      if (!text) return [];
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(testLine).width <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    }

    renderCarSelect(ctx) {
      const L = this.getCarSelectLayout();
      const touchSafe = L.touchSafe;

      // Fundo translúcido deixando a pista rolar suavemente atrás da garagem
      ctx.fillStyle = 'rgba(6, 9, 18, 0.82)';
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#00E5FF';
      ctx.font = touchSafe ? 'bold 9px monospace' : 'bold 11px monospace';
      ctx.fillText('GARAGEM LH44 — ESCOLHA SUA MÁQUINA', INTERNAL_WIDTH / 2, touchSafe ? 11 : 12);

      const CAR_SHORT_NAMES = [
        '1 UNO',    '2 FUS',    '3 206',    '4 HB2',    '5 OPA',
        '6 GOL',    '7 CHE',    '8 BRA',    '9 COR',    '10 CEL',
        '11 ONX',   '12 KA',    '13 PAL',   '14 KWI',   '15 FOC',
        '16 SAN',   '17 MOB',   '18 SNT',   '19 RUR',   '20 KOM'
      ];

      // Grade dos 20 carros no topo (2 linhas x 10 colunas)
      if (L.chips) {
        for (let c = 0; c < L.chips.length; c++) {
          const chip = L.chips[c];
          const isSel = (chip.i === this.selectedCarIndex);

          if (isSel) {
            const selGrad = ctx.createLinearGradient(chip.x, chip.y, chip.x, chip.y + chip.h);
            selGrad.addColorStop(0, '#00E5FF');
            selGrad.addColorStop(1, '#0284C7');
            ctx.fillStyle = selGrad;
            ctx.fillRect(chip.x, chip.y, chip.w, chip.h);
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(chip.x, chip.y, chip.w, chip.h);

            ctx.fillStyle = '#060D1A';
            ctx.font = `900 ${touchSafe ? 5.8 : 6.4}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(CAR_SHORT_NAMES[chip.i] || `${chip.i + 1}`, chip.x + chip.w / 2, chip.y + chip.h * 0.78);
          } else {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
            ctx.fillRect(chip.x, chip.y, chip.w, chip.h);
            ctx.strokeStyle = 'rgba(100, 116, 139, 0.45)';
            ctx.lineWidth = 0.8;
            ctx.strokeRect(chip.x, chip.y, chip.w, chip.h);

            ctx.fillStyle = '#94A3B8';
            ctx.font = `bold ${touchSafe ? 5.4 : 6.0}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(CAR_SHORT_NAMES[chip.i] || `${chip.i + 1}`, chip.x + chip.w / 2, chip.y + chip.h * 0.78);
          }
        }
      }

      const car = CAR_MODELS[this.selectedCarIndex];
      const color = CAR_COLORS[this.colorIndex];
      const now = performance.now();
      const { bW, bH, bX, bY } = L;

      // Card principal do showroom
      const panelGrad = ctx.createLinearGradient(0, bY, 0, bY + bH);
      panelGrad.addColorStop(0, 'rgba(16, 22, 36, 0.95)');
      panelGrad.addColorStop(1, 'rgba(9, 13, 22, 0.97)');
      ctx.fillStyle = panelGrad;
      ctx.fillRect(bX, bY, bW, bH);
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 1.1;
      ctx.strokeRect(bX, bY, bW, bH);

      // Botões laterais ◀ ▶ de navegação
      const pulseX = Math.sin(now * 0.006) * 2;
      ctx.fillStyle = '#00E5FF';
      ctx.font = touchSafe ? 'bold 15px monospace' : 'bold 18px monospace';
      ctx.fillText('◀', bX - 12 - pulseX, bY + bH / 2 + 5);
      ctx.fillText('▶', bX + bW + 12 + pulseX, bY + bH / 2 + 5);

      // Plataforma iluminada centralizada
      const platX = INTERNAL_WIDTH / 2;
      const platY = bY + (touchSafe ? 38 : 43);
      ctx.fillStyle = 'rgba(0, 229, 255, 0.12)';
      ctx.beginPath();
      ctx.ellipse(platX, platY, touchSafe ? 52 : 66, touchSafe ? 8.5 : 10.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(platX, platY, touchSafe ? 48 : 62, touchSafe ? 7.0 : 8.8, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Carro em exibição na plataforma giratória charmosa movimentando suavemente de um lado para o outro
      const showcaseSteer = Math.sin(now * 0.0020) * 0.76;
      const showcaseBrake = (Math.floor(now / 1800) % 4 === 0);
      car.render(
        ctx,
        platX,
        bY + (touchSafe ? 25 : 29),
        touchSafe ? 84 : 98,
        touchSafe ? 52 : 62,
        showcaseBrake,
        showcaseSteer,
        color.hex,
        {
          isNitro: false,
          wheelPhase: now * 0.008,
          isNight: true,
          speed: 0
        }
      );

      // Identificação e número do carro selecionado posicionado com folga e destaque ABAIXO do carro (sem invadir tetos ou escadas)
      const carIdxNum = (this.selectedCarIndex + 1).toString().padStart(2, '0');
      const badgeTitleY = bY + (touchSafe ? 53 : 60);
      const badgeTitleW = Math.min(bW - 24, 200);
      const badgeTitleH = touchSafe ? 11 : 12;
      ctx.fillStyle = 'rgba(6, 12, 22, 0.88)';
      ctx.fillRect(INTERNAL_WIDTH / 2 - badgeTitleW / 2, badgeTitleY - badgeTitleH + 2.5, badgeTitleW, badgeTitleH);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.55)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(INTERNAL_WIDTH / 2 - badgeTitleW / 2, badgeTitleY - badgeTitleH + 2.5, badgeTitleW, badgeTitleH);

      ctx.fillStyle = '#FFD700';
      ctx.font = touchSafe ? 'bold 6.8px monospace' : 'bold 7.8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`[ ${carIdxNum} / 20 ]  ${car.name}`, INTERNAL_WIDTH / 2, badgeTitleY);

      // Barras de estatísticas dinâmicas (Ficha Técnica: 4 Atributos)
      const statW = Math.floor((bW - 32) / 4);
      const s1 = bX + 6;
      const s2 = s1 + statW + 5;
      const s3 = s2 + statW + 5;
      const s4 = s3 + statW + 5;
      const statY = bY + (touchSafe ? 69 : 78);
      const isAdv = (this.diffMode === 'ADVANCED');
      const dispSpeed = isAdv ? 280 : car.maxSpeed;
      const speedRatio = (dispSpeed - 190) / 115;
      const speedLabel = isAdv ? 'VEL. (280)' : 'VELOCIDADE';
      const nitroRatio = (car.nitroPower || 0.88) * 0.88;
      this.drawStat(ctx, s1, statY, speedLabel, speedRatio, '#FF5252', statW);
      this.drawStat(ctx, s2, statY, 'ACELERAÇÃO', car.acceleration, '#FFB300', statW);
      this.drawStat(ctx, s3, statY, 'ADERÊNCIA', car.handling, '#00E676', statW);
      this.drawStat(ctx, s4, statY, 'POT. NITRO', nitroRatio, '#00E5FF', statW);

      // Descrição do carro com quebra automática de linha contida estritamente dentro do retângulo azul
      ctx.textAlign = 'center';
      ctx.fillStyle = '#CFD8DC';
      ctx.font = touchSafe ? '5.4px monospace' : '6.4px monospace';
      const descLines = this.wrapText(ctx, car.desc, bW - 24);
      const descLineH = touchSafe ? 7.2 : 8.4;
      const descStartY = bY + (touchSafe ? 88 : 98);
      for (let li = 0; li < descLines.length; li++) {
        ctx.fillText(descLines[li], INTERNAL_WIDTH / 2, descStartY + li * descLineH);
      }

      const blink = Math.floor(now / 380) % 2 === 0;

      // BOTÃO ◀ VOLTAR
      const btnB = L.btnBack;
      if (btnB) {
        const backGrad = ctx.createLinearGradient(btnB.x, btnB.y, btnB.x, btnB.y + btnB.h);
        backGrad.addColorStop(0, '#2C3E50');
        backGrad.addColorStop(1, '#1A252F');
        ctx.fillStyle = backGrad;
        ctx.fillRect(btnB.x, btnB.y, btnB.w, btnB.h);
        ctx.strokeStyle = '#E74C3C';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(btnB.x, btnB.y, btnB.w, btnB.h);
        ctx.fillStyle = '#ECF0F1';
        ctx.font = touchSafe ? 'bold 7.8px monospace' : 'bold 8.8px monospace';
        ctx.fillText('◀ VOLTAR [B]', btnB.x + btnB.w / 2, btnB.y + btnB.h / 2 + 3);
      }

      // BOTÃO ESCOLHER COR ▶
      const btnC = L.btnConfirm;
      if (btnC) {
        const confirmGrad = ctx.createLinearGradient(btnC.x, btnC.y, btnC.x, btnC.y + btnC.h);
        confirmGrad.addColorStop(0, blink ? '#00E5FF' : '#00B0FF');
        confirmGrad.addColorStop(1, blink ? '#0091EA' : '#005F9E');
        ctx.fillStyle = confirmGrad;
        ctx.fillRect(btnC.x, btnC.y, btnC.w, btnC.h);
        ctx.strokeStyle = blink ? '#FFFFFF' : '#FFD700';
        ctx.lineWidth = 1.3;
        ctx.strokeRect(btnC.x, btnC.y, btnC.w, btnC.h);
        ctx.fillStyle = '#060D1A';
        ctx.font = touchSafe ? 'bold 7.8px monospace' : 'bold 8.8px monospace';
        ctx.fillText('ESCOLHER COR [A] ▶', btnC.x + btnC.w / 2, btnC.y + btnC.h / 2 + 3);
      }

      ctx.fillStyle = '#90A4AE';
      ctx.font = touchSafe ? '6.0px monospace' : '7.2px monospace';
      ctx.fillText(
        touchSafe
          ? '◄ ► ▲ ▼ TROCA CARRO | TOQUE NO CARRO | [A] ESCOLHER COR | [B] VOLTAR'
          : '◄ ► ▲ ▼ NAVEGA NOS 20 CARROS | CLIQUE NO CARRO | [A] / ENTER ESCOLHER COR | [B] VOLTAR',
        INTERNAL_WIDTH / 2,
        touchSafe ? 193 : 209
      );
      ctx.restore();
    }

    // ========================================================
    // RENDERIZAÇÃO DA ETAPA 2: ESCOLHA DE COR DO CARRO
    // ========================================================
    renderColorSelect(ctx) {
      const L = this.getColorSelectLayout();
      const touchSafe = L.touchSafe;

      // Fundo translúcido deixando a pista rolar suavemente atrás da garagem
      ctx.fillStyle = 'rgba(6, 9, 18, 0.85)';
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#00E5FF';
      ctx.font = touchSafe ? 'bold 9px monospace' : 'bold 11px monospace';
      ctx.fillText('GARAGEM LH44 — ESCOLHA A COR DA SUA MÁQUINA', INTERNAL_WIDTH / 2, touchSafe ? 11 : 12);

      const car = CAR_MODELS[this.selectedCarIndex];
      const color = CAR_COLORS[this.colorIndex];
      const now = performance.now();
      const { bW, bH, bX, bY, sw } = L;

      // Card principal de personalização
      const panelGrad = ctx.createLinearGradient(0, bY, 0, bY + bH);
      panelGrad.addColorStop(0, 'rgba(16, 22, 36, 0.96)');
      panelGrad.addColorStop(1, 'rgba(9, 13, 22, 0.98)');
      ctx.fillStyle = panelGrad;
      ctx.fillRect(bX, bY, bW, bH);
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(bX, bY, bW, bH);

      // Botões laterais ◀ ▶ de navegação de cor
      const pulseX = Math.sin(now * 0.006) * 2;
      ctx.fillStyle = '#00E5FF';
      ctx.font = touchSafe ? 'bold 16px monospace' : 'bold 20px monospace';
      ctx.fillText('◀', bX - 14 - pulseX, bY + bH / 2 + 5);
      ctx.fillText('▶', bX + bW + 14 + pulseX, bY + bH / 2 + 5);

      // Plataforma iluminada centralizada
      const platX = INTERNAL_WIDTH / 2;
      const platY = bY + (touchSafe ? 50 : 58);
      ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
      ctx.beginPath();
      ctx.ellipse(platX, platY, touchSafe ? 62 : 78, touchSafe ? 11 : 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.55)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(platX, platY, touchSafe ? 56 : 72, touchSafe ? 9 : 11.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Carro em exibição na cor selecionada com movimento suave de um lado para o outro
      const showcaseSteerColor = Math.sin(now * 0.0020) * 0.76;
      const showcaseBrakeColor = (Math.floor(now / 1800) % 4 === 0);
      car.render(
        ctx,
        platX,
        bY + (touchSafe ? 33 : 39),
        touchSafe ? 96 : 116,
        touchSafe ? 60 : 72,
        showcaseBrakeColor,
        showcaseSteerColor,
        color.hex,
        {
          isNitro: false,
          wheelPhase: now * 0.008,
          isNight: true,
          speed: 0
        }
      );

      // Badge com o nome do carro e cor selecionada (posicionado com segurança abaixo da plataforma)
      const colIdxNum = (this.colorIndex + 1).toString().padStart(2, '0');
      const badgeY = bY + (touchSafe ? 69 : 79);
      const badgeW = Math.min(bW - 24, 215);
      const badgeH = touchSafe ? 12 : 13.5;
      ctx.fillStyle = 'rgba(6, 12, 22, 0.88)';
      ctx.fillRect(INTERNAL_WIDTH / 2 - badgeW / 2, badgeY, badgeW, badgeH);
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 0.85;
      ctx.strokeRect(INTERNAL_WIDTH / 2 - badgeW / 2, badgeY, badgeW, badgeH);
      ctx.fillStyle = '#FFD700';
      ctx.font = `bold ${touchSafe ? 6.4 : 7.4}px monospace`;
      ctx.fillText(`[ ETAPA 2/2 ]  ${car.name} · COR ${colIdxNum}/10 (${color.name.toUpperCase()})`, INTERNAL_WIDTH / 2, badgeY + (touchSafe ? 8.6 : 9.8));

      // 10 Amostras circulares de cores com destaque pulsante
      if (sw) {
        for (let k = 0; k < sw.length; k++) {
          const s = sw[k];
          const selected = (s.i === this.colorIndex);

          if (selected) {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r + 3.8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 229, 255, 0.30)';
            ctx.fill();
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2.2;
            ctx.stroke();
          }

          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r + (selected ? 1.0 : 0), 0, Math.PI * 2);
          ctx.fillStyle = CAR_COLORS[s.i].hex;
          ctx.fill();
          ctx.lineWidth = selected ? 1.8 : 1.0;
          ctx.strokeStyle = selected ? '#FFFFFF' : 'rgba(200, 215, 230, 0.55)';
          ctx.stroke();

          // Ponto de brilho interno se selecionada
          if (selected) {
            ctx.beginPath();
            ctx.arc(s.x, s.y, 1.8, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
          }

          // Número do atalho (1 a 10) abaixo de cada amostra
          ctx.fillStyle = selected ? '#FFD700' : '#64748B';
          ctx.font = `bold ${touchSafe ? 5.2 : 6.0}px monospace`;
          ctx.fillText(`${(s.i + 1) % 10}`, s.x, s.y + s.r + (touchSafe ? 8 : 9));
        }
      }

      const blink = Math.floor(now / 380) % 2 === 0;

      // BOTÃO ◀ VOLTAR AO CARRO
      const btnB = L.btnBack;
      if (btnB) {
        const backGrad = ctx.createLinearGradient(btnB.x, btnB.y, btnB.x, btnB.y + btnB.h);
        backGrad.addColorStop(0, '#2C3E50');
        backGrad.addColorStop(1, '#1A252F');
        ctx.fillStyle = backGrad;
        ctx.fillRect(btnB.x, btnB.y, btnB.w, btnB.h);
        ctx.strokeStyle = '#E74C3C';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(btnB.x, btnB.y, btnB.w, btnB.h);
        ctx.fillStyle = '#ECF0F1';
        ctx.font = touchSafe ? 'bold 7.8px monospace' : 'bold 8.8px monospace';
        ctx.fillText('◀ VOLTAR [B]', btnB.x + btnB.w / 2, btnB.y + btnB.h / 2 + 3);
      }

      // BOTÃO CONFIRMAR COR ▶
      const btnC = L.btnConfirm;
      if (btnC) {
        const confirmGrad = ctx.createLinearGradient(btnC.x, btnC.y, btnC.x, btnC.y + btnC.h);
        confirmGrad.addColorStop(0, blink ? '#00E5FF' : '#00B0FF');
        confirmGrad.addColorStop(1, blink ? '#0091EA' : '#005F9E');
        ctx.fillStyle = confirmGrad;
        ctx.fillRect(btnC.x, btnC.y, btnC.w, btnC.h);
        ctx.strokeStyle = blink ? '#FFFFFF' : '#FFD700';
        ctx.lineWidth = 1.3;
        ctx.strokeRect(btnC.x, btnC.y, btnC.w, btnC.h);
        ctx.fillStyle = '#060D1A';
        ctx.font = touchSafe ? 'bold 7.8px monospace' : 'bold 8.8px monospace';
        ctx.fillText('CONFIRMAR [A] ▶', btnC.x + btnC.w / 2, btnC.y + btnC.h / 2 + 3);
      }

      ctx.fillStyle = '#90A4AE';
      ctx.font = touchSafe ? '6.0px monospace' : '7.2px monospace';
      ctx.fillText(
        touchSafe
          ? '◄ ► TROCA COR | TOQUE NA COR | [A] CONFIRMAR | [B] VOLTAR'
          : '◄ ► ESCOLHE A COR | CLIQUE NA COR OU TECLAS [C]/[1-0] | [A] / ENTER CONFIRMAR | [B] VOLTAR',
        INTERNAL_WIDTH / 2,
        touchSafe ? 193 : 209
      );
      ctx.restore();
    }

    renderRaceSetup(ctx) {
      const L = this.getSetupLayout();
      const touchSafe = L.touchSafe;
      const now = performance.now();

      ctx.fillStyle = 'rgba(6, 9, 18, 0.85)';
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#00E5FF';
      ctx.font = touchSafe ? 'bold 9px monospace' : 'bold 12px monospace';
      const def = TRACK_DEFINITIONS[this.trackIndex];
      const totalStages = (this.seasonSchedule && this.seasonSchedule.length) ? this.seasonSchedule.length : TRACK_DEFINITIONS.length;
      const modeBadge = (this.gameMode === 'QUICK_RACE')
        ? '⚡ CORRIDA RÁPIDA'
        : `🏆 CAMPEONATO${this.customChampionship ? ' CUSTOM' : ' F1'} (${(this.seasonStage || 0) + 1}/${totalStages})`;
      ctx.fillText(`PREPARAR — ${modeBadge}`, INTERNAL_WIDTH / 2, L.titleY);

      ctx.fillStyle = '#FFD700';
      ctx.font = touchSafe ? 'bold 6px monospace' : 'bold 7px monospace';
      const mirrorTag = (this.gameMode !== 'CHAMPIONSHIP' && this.mirrorTrack) ? ' [ESPELHO]' : '';
      ctx.fillText(`CIRCUITO: ${def.name.toUpperCase()}${mirrorTag} (3 VOLTAS)`, INTERNAL_WIDTH / 2 - (L.mirrorBtn ? 22 : 0), L.subY);

      if (L.mirrorBtn) {
        const mb = L.mirrorBtn;
        ctx.fillStyle = this.mirrorTrack ? '#7C3AED' : 'rgba(16, 24, 38, 0.92)';
        ctx.fillRect(mb.x, mb.y, mb.w, mb.h);
        ctx.strokeStyle = this.mirrorTrack ? '#DDD6FE' : '#00E5FF';
        ctx.lineWidth = 1;
        ctx.strokeRect(mb.x, mb.y, mb.w, mb.h);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 5.4px monospace';
        ctx.fillText(this.mirrorTrack ? '⇄ ESPELHO' : '⇄ NORMAL', mb.x + mb.w / 2, mb.y + mb.h / 2 + 2);
      }

      // Grupo 1: horario / clima
      ctx.font = touchSafe ? 'bold 7px monospace' : 'bold 8px monospace';
      ctx.fillStyle = this.setupGroup === 0 ? '#FFD700' : '#90A4AE';
      ctx.fillText((this.setupGroup === 0 ? '\u25B6 ' : '') + 'HOR\u00C1RIO / CLIMA', INTERNAL_WIDTH / 2, L.label1Y);
      const chipFont = touchSafe ? 'bold 6px monospace' : 'bold 7px monospace';
      for (let k = 0; k < L.conds.length; k++) {
        const c = L.conds[k];
        const info = ENV_CONDITIONS[c.i];
        const selected = (info.id === this.envCond);
        ctx.fillStyle = selected
          ? (this.setupGroup === 0 ? '#FFD700' : 'rgba(255, 215, 0, 0.42)')
          : 'rgba(16, 24, 38, 0.92)';
        ctx.fillRect(c.x, c.y, c.w, c.h);
        ctx.strokeStyle = selected ? '#FFFFFF' : 'rgba(0, 229, 255, 0.35)';
        ctx.lineWidth = selected ? 1.8 : 1;
        ctx.strokeRect(c.x, c.y, c.w, c.h);
        ctx.fillStyle = selected
          ? (this.setupGroup === 0 ? '#041019' : '#FFFFFF')
          : '#B0BEC5';
        ctx.font = chipFont;
        ctx.fillText(info.icon + ' ' + info.label, c.x + c.w / 2, c.y + c.h / 2 + 2.4);
      }

      // Grupo 2: musica
      ctx.font = touchSafe ? 'bold 7px monospace' : 'bold 8px monospace';
      ctx.fillStyle = this.setupGroup === 1 ? '#FFD700' : '#90A4AE';
      ctx.fillText((this.setupGroup === 1 ? '\u25B6 ' : '') + 'TRILHA SONORA', INTERNAL_WIDTH / 2, L.label2Y);
      const curSongIdx = (typeof this.songIndex === 'number' && this.songIndex >= 0 && this.songIndex < SONGS.length) ? this.songIndex : 0;
      const songChipFont = touchSafe ? 'bold 5.6px monospace' : 'bold 6.4px monospace';
      for (let k = 0; k < L.songs.length; k++) {
        const c = L.songs[k];
        const selected = (c.i === curSongIdx);
        ctx.fillStyle = selected
          ? (this.setupGroup === 1 ? '#FFD700' : 'rgba(255, 215, 0, 0.28)')
          : 'rgba(16, 24, 38, 0.92)';
        ctx.fillRect(c.x, c.y, c.w, c.h);
        ctx.strokeStyle = selected ? '#FFFFFF' : 'rgba(0, 229, 255, 0.35)';
        ctx.lineWidth = selected ? 1.8 : 1;
        ctx.strokeRect(c.x, c.y, c.w, c.h);
        ctx.fillStyle = selected
          ? (this.setupGroup === 1 ? '#041019' : '#FFFFFF')
          : '#B0BEC5';
        ctx.font = songChipFont;
        ctx.fillText('\u266A ' + SONGS[c.i].name, c.x + c.w / 2, c.y + c.h / 2 + 2.2);
      }
      ctx.fillStyle = '#B0BEC5';
      ctx.font = touchSafe ? '5.8px monospace' : '6.8px monospace';
      const curSong = SONGS[curSongIdx] || SONGS[0];
      ctx.fillText(curSong.desc || '', INTERNAL_WIDTH / 2, L.descY);

      // Banner Informativo do Grid de Largada (ou Resultado do Qualy!)
      if (this.qualifiedGridPos > 0) {
        const gW = L.gridW;
        const gH = L.gridH;
        const gX = Math.round(INTERNAL_WIDTH / 2 - gW / 2);
        const gY = L.gridY;
        ctx.fillStyle = 'rgba(0, 230, 118, 0.16)';
        ctx.fillRect(gX, gY, gW, gH);
        ctx.strokeStyle = '#00E676';
        ctx.lineWidth = 0.9;
        ctx.strokeRect(gX, gY, gW, gH);

        ctx.fillStyle = '#69F0AE';
        ctx.font = touchSafe ? 'bold 5.8px monospace' : 'bold 6.6px monospace';
        const qStr = this.qualifiedLapTime > 0 ? ` (${this.formatTime(this.qualifiedLapTime)})` : '';
        ctx.fillText(`⏱ QUALY CONCLUÍDO! VOCÊ LARGA EM P${this.qualifiedGridPos}${qStr}`, INTERNAL_WIDTH / 2, gY + gH / 2 + 2.0);
      } else if (this.gameMode === 'CHAMPIONSHIP' && this.seasonBots && this.seasonBots.length >= 19) {
        const p19Idx = (this.seasonGridOrder && this.seasonGridOrder[18] !== undefined) ? this.seasonGridOrder[18] : 18;
        const p18Idx = (this.seasonGridOrder && this.seasonGridOrder[17] !== undefined) ? this.seasonGridOrder[17] : 17;
        const b19 = this.seasonBots[p19Idx] || this.seasonBots[18];
        const b18 = this.seasonBots[p18Idx] || this.seasonBots[17];
        const m19 = b19.model ? b19.model.name : 'RIVAL';
        const m18 = b18.model ? b18.model.name : 'RIVAL';

        const gW = L.gridW;
        const gH = L.gridH;
        const gX = Math.round(INTERNAL_WIDTH / 2 - gW / 2);
        const gY = L.gridY;
        ctx.fillStyle = 'rgba(255, 215, 0, 0.12)';
        ctx.fillRect(gX, gY, gW, gH);
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.45)';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(gX, gY, gW, gH);

        ctx.fillStyle = '#FFD700';
        ctx.font = touchSafe ? 'bold 5.8px monospace' : 'bold 6.6px monospace';
        ctx.fillText(`🏁 SEU GRID: P20 | AO SEU LADO (P19): ${m19} | À FRENTE (P18): ${m18}`, INTERNAL_WIDTH / 2, gY + gH / 2 + 2.0);
      }

      // Botões ◀ VOLTAR, ⏱ QUALY e ▶ INICIAR CORRIDA
      const blink = Math.floor(now / 350) % 2 === 0;
      const activeAct = (this.setupGroup === 2) ? (this.setupActionIdx !== undefined ? this.setupActionIdx : 2) : -1;
      const btnB = L.btnBack;
      if (btnB) {
        const isFoc = (activeAct === 0);
        const backGrad = ctx.createLinearGradient(btnB.x, btnB.y, btnB.x, btnB.y + btnB.h);
        backGrad.addColorStop(0, isFoc ? '#475569' : '#2C3E50');
        backGrad.addColorStop(1, isFoc ? '#334155' : '#1A252F');
        ctx.fillStyle = backGrad;
        ctx.fillRect(btnB.x, btnB.y, btnB.w, btnB.h);
        ctx.strokeStyle = isFoc ? '#FFFFFF' : '#E74C3C';
        ctx.lineWidth = isFoc ? 2.0 : 1.2;
        ctx.strokeRect(btnB.x, btnB.y, btnB.w, btnB.h);
        ctx.fillStyle = '#ECF0F1';
        ctx.font = touchSafe ? 'bold 7.2px monospace' : 'bold 8px monospace';
        ctx.fillText('◀ VOLTAR', btnB.x + btnB.w / 2, btnB.y + btnB.h / 2 + 2.8);
      }

      const btnQ = L.qualyBtn;
      if (btnQ) {
        const isFoc = (activeAct === 1);
        const qGrad = ctx.createLinearGradient(btnQ.x, btnQ.y, btnQ.x, btnQ.y + btnQ.h);
        qGrad.addColorStop(0, isFoc ? '#FDE047' : '#F59E0B');
        qGrad.addColorStop(1, isFoc ? '#D97706' : '#B45309');
        ctx.fillStyle = qGrad;
        ctx.fillRect(btnQ.x, btnQ.y, btnQ.w, btnQ.h);
        ctx.strokeStyle = isFoc ? '#FFFFFF' : '#FDE047';
        ctx.lineWidth = isFoc ? 2.0 : 1.2;
        ctx.strokeRect(btnQ.x, btnQ.y, btnQ.w, btnQ.h);
        ctx.fillStyle = '#060D1A';
        ctx.font = touchSafe ? 'bold 6.8px monospace' : 'bold 7.6px monospace';
        ctx.fillText(this.qualifiedGridPos > 0 ? '⏱ REFAZER QUALY' : '⏱ QUALY (1 VOLTA)', btnQ.x + btnQ.w / 2, btnQ.y + btnQ.h / 2 + 2.6);
      }

      const btnS = L.startBtn;
      if (btnS) {
        const isFoc = (activeAct === 2);
        const btnGrad = ctx.createLinearGradient(btnS.x, btnS.y, btnS.x, btnS.y + btnS.h);
        btnGrad.addColorStop(0, (isFoc || blink) ? '#00E5FF' : '#00B0FF');
        btnGrad.addColorStop(1, (isFoc || blink) ? '#0091EA' : '#005F9E');
        ctx.fillStyle = btnGrad;
        ctx.fillRect(btnS.x, btnS.y, btnS.w, btnS.h);
        ctx.strokeStyle = isFoc ? '#FFFFFF' : (blink ? '#FFFFFF' : '#FFD700');
        ctx.lineWidth = isFoc ? 2.0 : 1.4;
        ctx.strokeRect(btnS.x, btnS.y, btnS.w, btnS.h);
        ctx.fillStyle = '#060D1A';
        ctx.font = touchSafe ? 'bold 8px monospace' : 'bold 9.5px monospace';
        ctx.fillText('CONFIRMAR [A] ▶', btnS.x + btnS.w / 2, btnS.y + btnS.h / 2 + 3);
      }

      ctx.fillStyle = '#90A4AE';
      ctx.font = touchSafe ? '6.3px monospace' : '7.5px monospace';
      ctx.fillText(touchSafe ? '[A] CONFIRMAR | [B] VOLTAR | D-PAD/TOQUE NAVEGA' : '[ENTER]/[A] CONFIRMAR | [ESC]/[B] VOLTAR | D-PAD SELECIONA', INTERNAL_WIDTH / 2, L.hintY);
      ctx.restore();
    }


    drawStat(ctx, x, y, label, ratio, color, w = 68) {
      ctx.textAlign = 'left';
      ctx.font = (w < 60) ? 'bold 5.4px monospace' : 'bold 6.4px monospace';
      ctx.fillStyle = '#90A4AE';
      ctx.fillText(label, x, y);

      const h = 5.0;
      ctx.fillStyle = '#111827';
      ctx.fillRect(x, y + 2.5, w, h);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(x, y + 2.5, w, h);

      const fillW = Math.max(2, w * Math.max(0.08, Math.min(ratio, 1)));
      ctx.fillStyle = color;
      ctx.fillRect(x + 0.5, y + 3, fillW - 1, h - 1);
      ctx.fillStyle = 'rgba(255,255,255,0.38)';
      ctx.fillRect(x + 0.5, y + 3, fillW - 1, 1.2);
    }

    renderPauseMenu(ctx) {
      const cx = INTERNAL_WIDTH / 2;
      const cy = INTERNAL_HEIGHT / 2;
      const touchSafe = this.input.touchControlsVisible;

      ctx.save();
      ctx.fillStyle = 'rgba(5, 8, 16, 0.85)';
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

      // 1. DIÁLOGO MODAL SE ABERTO
      if (this.pauseDialog) {
        const isExit = (this.pauseDialog === 'CONFIRM_EXIT');
        const isCamp = (this.gameMode === 'CHAMPIONSHIP');
        const dlgW = isExit ? 232 : 220;
        const dlgH = isExit ? (isCamp ? 108 : 88) : 88;
        const dlgX = Math.round(cx - dlgW / 2);
        const dlgY = Math.round(cy - dlgH / 2);

        ctx.fillStyle = 'rgba(12, 18, 28, 0.98)';
        ctx.fillRect(dlgX, dlgY, dlgW, dlgH);
        ctx.strokeStyle = '#FF3B30';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(dlgX, dlgY, dlgW, dlgH);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (this.pauseDialog === 'CONFIRM_RESTART') {
          ctx.fillStyle = '#FFD700';
          ctx.font = 'bold 11px monospace';
          ctx.fillText('🔄 REINICIAR CORRIDA?', cx, dlgY + 16);

          ctx.fillStyle = '#E2E8F0';
          ctx.font = '7px monospace';
          ctx.fillText('A corrida atual será reiniciada do início.', cx, dlgY + 30);

          const btnW = dlgW - 28;
          const btnH = 17;
          const btnX = Math.round(cx - btnW / 2);
          const opts = ['SIM, REINICIAR CORRIDA', 'CANCELAR'];

          for (let i = 0; i < 2; i++) {
            const bY = dlgY + 44 + i * 20;
            const isSel = (this.pauseDialogIndex === i);
            ctx.fillStyle = isSel ? (i === 0 ? '#E11D48' : '#334155') : (i === 0 ? '#881337' : '#1E293B');
            ctx.fillRect(btnX, bY, btnW, btnH);
            ctx.strokeStyle = isSel ? '#F43F5E' : '#475569';
            ctx.lineWidth = 1;
            ctx.strokeRect(btnX, bY, btnW, btnH);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 8px monospace';
            const prefix = isSel ? '► ' : '';
            const suffix = isSel ? ' ◄' : '';
            ctx.fillText(prefix + opts[i] + suffix, cx, bY + btnH / 2);
          }
        } else if (this.pauseDialog === 'CONFIRM_EXIT') {
          ctx.fillStyle = '#FF3B30';
          ctx.font = 'bold 11px monospace';
          ctx.fillText('🚪 SAIR DA CORRIDA', cx, dlgY + 16);

          ctx.fillStyle = '#E2E8F0';
          ctx.font = '7px monospace';
          ctx.fillText(isCamp ? 'Deseja salvar o campeonato antes de sair?' : 'Deseja voltar ao menu principal?', cx, dlgY + 28);

          const btnW = dlgW - 28;
          const btnH = 17;
          const btnX = Math.round(cx - btnW / 2);
          const opts = isCamp ? ['💾 SALVAR E SAIR', '❌ SAIR SEM SALVAR', '↩ CANCELAR'] : ['SIM, SAIR', 'CANCELAR'];

          for (let i = 0; i < opts.length; i++) {
            const bY = dlgY + 40 + i * 20;
            const isSel = (this.pauseDialogIndex === i);
            let bg = '#1E293B';
            let bd = '#475569';
            if (i === 0 && isCamp) {
              bg = isSel ? '#059669' : '#065F46';
              bd = isSel ? '#34D399' : '#10B981';
            } else if ((i === 1 && isCamp) || (i === 0 && !isCamp)) {
              bg = isSel ? '#DC2626' : '#7F1D1D';
              bd = isSel ? '#F87171' : '#EF4444';
            } else {
              bg = isSel ? '#334155' : '#1E293B';
              bd = isSel ? '#94A3B8' : '#475569';
            }

            ctx.fillStyle = bg;
            ctx.fillRect(btnX, bY, btnW, btnH);
            ctx.strokeStyle = bd;
            ctx.lineWidth = 1;
            ctx.strokeRect(btnX, bY, btnW, btnH);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 8px monospace';
            const prefix = isSel ? '► ' : '';
            const suffix = isSel ? ' ◄' : '';
            ctx.fillText(prefix + opts[i] + suffix, cx, bY + btnH / 2);
          }
        }

        ctx.restore();
        return;
      }

      // 2. PAINEL PRINCIPAL DE PAUSA
      const pW = touchSafe ? 226 : 242;
      const pH = 126;
      const pX = Math.round(cx - pW / 2);
      const pY = 34;

      ctx.fillStyle = 'rgba(12, 18, 28, 0.96)';
      ctx.fillRect(pX, pY, pW, pH);
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(pX, pY, pW, pH);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 12.5px monospace';
      ctx.fillText('⏸ CORRIDA PAUSADA', cx, pY + 16);

      const btnW = pW - 28;
      const btnH = 17;
      const btnX = Math.round(cx - btnW / 2);
      const startY = pY + 28;
      const gapY = 21;

      const items = [
        { label: '▶ CONTINUAR', color: '#0284C7', border: '#38BDF8' },
        { label: '🔄 REINICIAR CORRIDA', color: '#B45309', border: '#F59E0B' },
        { label: '⚙ CONFIGURAÇÕES', color: '#475569', border: '#94A3B8' },
        { label: '🚪 SAIR DA CORRIDA', color: '#BE123C', border: '#FB7185' }
      ];

      for (let i = 0; i < 4; i++) {
        const bY = startY + i * gapY;
        const isSel = (this.pauseMenuIndex === i);
        const it = items[i];

        ctx.fillStyle = isSel ? it.color : '#162235';
        ctx.fillRect(btnX, bY, btnW, btnH);
        ctx.strokeStyle = isSel ? '#FFFFFF' : it.border;
        ctx.lineWidth = isSel ? 1.5 : 0.8;
        ctx.strokeRect(btnX, bY, btnW, btnH);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 8.5px monospace';
        const prefix = isSel ? '► ' : '';
        const suffix = isSel ? ' ◄' : '';
        ctx.fillText(prefix + it.label + suffix, cx, bY + btnH / 2);
      }

      ctx.fillStyle = '#94A3B8';
      ctx.font = '6.5px monospace';
      ctx.fillText(touchSafe ? 'TOQUE EM UMA OPÇÃO | [PAUSE] OU [VOLTAR] RETOMA' : '↑↓ NAVEGAR | [ENTER] / [A] SELECIONAR | [ESC] VOLTAR', cx, pY + pH + 12);

      ctx.restore();
    }

    renderResumeCountdown(ctx) {
      const cx = INTERNAL_WIDTH / 2;
      const cy = INTERNAL_HEIGHT / 2 - 12;

      ctx.save();
      ctx.fillStyle = 'rgba(5, 8, 16, 0.50)';
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

      const curVal = Math.ceil(this.resumeCountdown);
      const frac = this.resumeCountdown - Math.floor(this.resumeCountdown);
      const scale = 1.0 + (1.0 - frac) * 0.35;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillStyle = 'rgba(14, 20, 32, 0.90)';
      ctx.fillRect(cx - 100, cy - 42, 200, 16);
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - 100, cy - 42, 200, 16);

      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 7.5px monospace';
      ctx.fillText('⚡ PREPARE-SE PARA RETOMAR A CORRIDA!', cx, cy - 34);

      let label = '3';
      let color = '#FF3B30';
      if (curVal === 3) {
        label = '3';
        color = '#FF3B30';
      } else if (curVal === 2) {
        label = '2';
        color = '#FF9500';
      } else if (curVal === 1) {
        label = '1';
        color = '#34C759';
      } else {
        label = 'VAI!';
        color = '#00E5FF';
      }

      ctx.save();
      ctx.translate(cx, cy + 8);
      ctx.scale(scale, scale);
      ctx.font = 'italic 900 48px "Arial Black", Impact, sans-serif';

      ctx.fillStyle = '#050711';
      ctx.fillText(label, 2, 3);

      ctx.fillStyle = color;
      ctx.fillText(label, 0, 0);

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.strokeText(label, 0, 0);
      ctx.restore();

      ctx.fillStyle = '#94A3B8';
      ctx.font = '6.5px monospace';
      ctx.fillText('PILOTE COM VELOCIDADE E ATENÇÃO', cx, cy + 54);

      ctx.restore();
    }

    renderSlotSelect(ctx) {
      const cx = INTERNAL_WIDTH / 2;
      const cy = INTERNAL_HEIGHT / 2;
      const touchSafe = this.input.touchControlsVisible;

      const vignetteGrad = ctx.createLinearGradient(0, 0, 0, INTERNAL_HEIGHT);
      vignetteGrad.addColorStop(0, 'rgba(15, 10, 30, 0.70)');
      vignetteGrad.addColorStop(1, 'rgba(5, 5, 15, 0.85)');
      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const isNew = (this.slotSelectMode === 'NEW');
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 12.5px monospace';
      ctx.fillText(isNew ? 'ESCOLHA UM SLOT DE SALVAMENTO' : 'CARREGAR CAMPEONATO SALVO', cx, 18);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '6.5px monospace';
      ctx.fillText(isNew ? 'Selecione um slot de 1 a 3 para registrar seu progresso automático' : 'Escolha o savegame para retomar sua temporada', cx, 29);

      const slots = SaveManager.getAllSlots();
      const cardW = 280;
      const cardH = 39;
      const cardX = Math.round(cx - cardW / 2);
      const startY = 38;
      const gapY = 44;

      for (let i = 0; i < 3; i++) {
        const slotNum = i + 1;
        const data = slots[i];
        const cY = startY + i * gapY;
        const isSel = (this.selectedSlotIndex === i);

        ctx.fillStyle = isSel ? 'rgba(20, 32, 54, 0.95)' : 'rgba(10, 16, 28, 0.85)';
        ctx.fillRect(cardX, cY, cardW, cardH);
        ctx.strokeStyle = isSel ? '#FFD700' : (data ? '#00E5FF44' : '#334155');
        ctx.lineWidth = isSel ? 1.5 : 1.0;
        ctx.strokeRect(cardX, cY, cardW, cardH);

        const badgeW = 44;
        ctx.fillStyle = isSel ? '#FFD700' : (data ? '#0284C7' : '#334155');
        ctx.fillRect(cardX + 2, cY + 2, badgeW, cardH - 4);
        ctx.fillStyle = isSel ? '#100500' : '#FFFFFF';
        ctx.font = 'bold 8.5px monospace';
        ctx.fillText(`SLOT ${slotNum}`, cardX + 2 + badgeW / 2, cY + cardH / 2);

        if (data) {
          ctx.textAlign = 'left';
          const infoX = cardX + badgeW + 8;
          const carModel = CAR_MODELS[data.selectedCarIndex] || { name: 'F1 CAR' };
          const modeLabel = data.difficulty === 'ADVANCED' ? 'AVANÇADO' : 'NORMAL';

          ctx.fillStyle = '#FFD700';
          ctx.font = 'bold 8px monospace';
          ctx.fillText(`🏁 ${data.playerName}  [${carModel.name}]  (${modeLabel})`, infoX, cY + 9);

          const nextTDef = TRACK_DEFINITIONS[data.nextTrackIndex] || { name: 'PRÓXIMA' };
          const totalStages = (data.seasonSchedule && data.seasonSchedule.length) ? data.seasonSchedule.length : TRACK_DEFINITIONS.length;
          const customTag = data.isCustomChampionship ? ' [CUSTOM]' : '';
          ctx.fillStyle = '#E2E8F0';
          ctx.font = '7px monospace';
          ctx.fillText(`🏆 P${data.playerRank} (${data.totalPoints} pts) | Etapa ${data.seasonStage + 1}/${totalStages}: ${nextTDef.name}${customTag}`, infoX, cY + 20);

          ctx.fillStyle = '#94A3B8';
          ctx.font = '6.5px monospace';
          ctx.fillText(`💾 Salvo em: ${data.dateStr || 'Recentemente'}`, infoX, cY + 30);

          if (!isNew) {
            const delX = cardX + cardW - 28;
            const delY = cY + 8;
            ctx.fillStyle = '#991B1B';
            ctx.fillRect(delX, delY, 22, 22);
            ctx.strokeStyle = '#EF4444';
            ctx.lineWidth = 1;
            ctx.strokeRect(delX, delY, 22, 22);
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 9px monospace';
            ctx.fillText('✕', delX + 11, delY + 11);
          }
        } else {
          ctx.textAlign = 'left';
          const infoX = cardX + badgeW + 12;
          ctx.fillStyle = '#64748B';
          ctx.font = 'bold 8.5px monospace';
          ctx.fillText('[ SLOT DISPONÍVEL ]', infoX, cY + 14);
          ctx.font = '7px monospace';
          ctx.fillText(isNew ? 'Toque para salvar seu campeonato neste slot' : 'Nenhum jogo salvo gravado aqui', infoX, cY + 26);
        }
      }

      const bW = 80;
      const bH = 17;
      const bX = Math.round(cx - bW / 2);
      const bY = 178;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(bX, bY, bW, bH);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(bX, bY, bW, bH);
      ctx.fillStyle = '#E2E8F0';
      ctx.font = 'bold 7.5px monospace';
      ctx.fillText('↩ VOLTAR', cx, bY + bH / 2);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '6px monospace';
      ctx.fillText(touchSafe ? 'TOQUE NO SLOT DESEJADO' : '↑↓ SELECIONAR | [ENTER] / [A] CONFIRMAR | [ESC] VOLTAR', cx, 207);

      if (this.slotDeleteConfirm !== null) {
        ctx.fillStyle = 'rgba(5, 8, 16, 0.85)';
        ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
        const mW = 210;
        const mH = 75;
        const mX = Math.round(cx - mW / 2);
        const mY = Math.round(cy - mH / 2);
        ctx.fillStyle = 'rgba(15, 20, 32, 0.98)';
        ctx.fillRect(mX, mY, mW, mH);
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(mX, mY, mW, mH);

        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 9.5px monospace';
        ctx.fillText(`EXCLUIR SAVE DO SLOT ${this.slotDeleteConfirm}?`, cx, mY + 18);

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '7px monospace';
        ctx.fillText('Esta ação é permanente e apagará os dados.', cx, mY + 32);

        ctx.fillStyle = '#DC2626';
        ctx.fillRect(cx - 88, mY + 44, 80, 18);
        ctx.strokeStyle = '#F87171';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - 88, mY + 44, 80, 18);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 7.5px monospace';
        ctx.fillText('SIM, EXCLUIR', cx - 48, mY + 53);

        ctx.fillStyle = '#334155';
        ctx.fillRect(cx + 8, mY + 44, 80, 18);
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx + 8, mY + 44, 80, 18);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('CANCELAR', cx + 48, mY + 53);
      }

      if (this.slotOverwriteConfirm !== null) {
        ctx.fillStyle = 'rgba(5, 8, 16, 0.85)';
        ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
        const mW = 210;
        const mH = 75;
        const mX = Math.round(cx - mW / 2);
        const mY = Math.round(cy - mH / 2);
        ctx.fillStyle = 'rgba(15, 20, 32, 0.98)';
        ctx.fillRect(mX, mY, mW, mH);
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(mX, mY, mW, mH);

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 9.5px monospace';
        ctx.fillText(`SOBRESCREVER SLOT ${this.slotOverwriteConfirm}?`, cx, mY + 18);

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '7px monospace';
        ctx.fillText('O campeonato salvo existente será substituído.', cx, mY + 32);

        ctx.fillStyle = '#D97706';
        ctx.fillRect(cx - 92, mY + 44, 86, 18);
        ctx.strokeStyle = '#FCD34D';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - 92, mY + 44, 86, 18);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 7px monospace';
        ctx.fillText('SIM, SUBSTITUIR', cx - 49, mY + 53);

        ctx.fillStyle = '#334155';
        ctx.fillRect(cx + 6, mY + 44, 86, 18);
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx + 6, mY + 44, 86, 18);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('CANCELAR', cx + 49, mY + 53);
      }

      ctx.restore();
    }

    renderSaveProgress(ctx) {
      const cx = INTERNAL_WIDTH / 2;
      const cy = INTERNAL_HEIGHT / 2;
      const touchSafe = this.input.touchControlsVisible;

      ctx.save();
      const vignetteGrad = ctx.createLinearGradient(0, 0, 0, INTERNAL_HEIGHT);
      vignetteGrad.addColorStop(0, 'rgba(10, 16, 32, 0.88)');
      vignetteGrad.addColorStop(1, 'rgba(5, 8, 18, 0.94)');
      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

      const pW = 250;
      const pH = 136;
      const pX = Math.round(cx - pW / 2);
      const pY = Math.round(cy - pH / 2 - 6);

      ctx.fillStyle = 'rgba(12, 20, 36, 0.98)';
      ctx.fillRect(pX, pY, pW, pH);
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(pX, pY, pW, pH);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillStyle = '#69F0AE';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('💾 PROGRESSO SALVO COM SUCESSO!', cx, pY + 16);

      ctx.fillStyle = '#0284C7';
      ctx.fillRect(cx - 40, pY + 28, 80, 14);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - 40, pY + 28, 80, 14);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 7.5px monospace';
      ctx.fillText(`GRAVADO NO SLOT ${this.activeSaveSlot}`, cx, pY + 35);

      ctx.textAlign = 'left';
      const infoX = pX + 16;
      const carModel = CAR_MODELS[this.selectedCarIndex] || { name: 'F1 CAR' };
      const lastTDef = TRACK_DEFINITIONS[this.trackIndex] || { name: 'INTERLAGOS' };
      const nextIdx = (this.seasonSchedule && this.seasonSchedule[this.seasonStage + 1]) !== undefined ? this.seasonSchedule[this.seasonStage + 1] : this.trackIndex;
      const nextTDef = TRACK_DEFINITIONS[nextIdx] || { name: 'PRÓXIMA ETAPA' };

      let pRank = 1;
      let pPoints = 0;
      if (this.championshipPoints && this.cars && this.cars.length > 0) {
        const overall = this.cars.map(c => ({
          car: c,
          points: this.championshipPoints[c.id] || 0
        })).sort((a, b) => b.points - a.points);
        const idx = overall.findIndex(o => o.car.isPlayer);
        pRank = idx >= 0 ? (idx + 1) : 1;
        pPoints = this.championshipPoints[this.player ? this.player.id : 0] || 0;
      }

      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 7.5px monospace';
      ctx.fillText(`PILOTO: ${this.playerName}  |  CARRO: ${carModel.name}`, infoX, pY + 54);

      ctx.fillStyle = '#E2E8F0';
      ctx.font = '7px monospace';
      ctx.fillText(`🏆 CLASSIFICAÇÃO ATUAL: P${pRank} (${pPoints} PONTOS)`, infoX, pY + 68);

      const totalStages = (this.seasonSchedule && this.seasonSchedule.length) ? this.seasonSchedule.length : 12;
      ctx.fillText(`✓ CONCLUÍDO: ETAPA ${this.seasonStage + 1}/${totalStages} - ${lastTDef.name}`, infoX, pY + 80);

      ctx.fillStyle = '#38BDF8';
      ctx.fillText(`➔ PRÓXIMA CORRIDA: ETAPA ${this.seasonStage + 2}/${totalStages} - ${nextTDef.name}`, infoX, pY + 92);

      const btnW = pW - 24;
      const btnH = 18;
      const btnX = Math.round(cx - btnW / 2);
      const btnY = pY + pH - 24;
      const blink = Math.floor(performance.now() / 300) % 2 === 0;

      ctx.fillStyle = blink ? '#059669' : '#047857';
      ctx.fillRect(btnX, btnY, btnW, btnH);
      ctx.strokeStyle = blink ? '#6EE7B7' : '#34D399';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(btnX, btnY, btnW, btnH);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('▶ TOQUE AQUI OU PRESSIONE [ENTER] / [A] PARA CONTINUAR', cx, btnY + btnH / 2);

      ctx.restore();
    }

    renderRaceResult(ctx) {
      const touchSafe = this.input.touchControlsVisible;
      ctx.fillStyle = 'rgba(5, 8, 16, 0.94)';
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

      const def = TRACK_DEFINITIONS[this.trackIndex];

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFD700';
      ctx.font = touchSafe ? 'bold 10.5px monospace' : 'bold 12px monospace';
      const totalStages = (this.seasonSchedule && this.seasonSchedule.length) ? this.seasonSchedule.length : TRACK_DEFINITIONS.length;
      const currentStageNum = (this.seasonStage !== undefined ? this.seasonStage : 0) + 1;
      const resultTitle = (this.gameMode === 'QUICK_RACE')
        ? `🏁 BANDEIRADA — CORRIDA RÁPIDA (${def.name})`
        : `🏁 ETAPA ${currentStageNum}/${totalStages} — ${def.name}`;
      ctx.fillText(resultTitle, INTERNAL_WIDTH / 2, 16);

      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 7.2px monospace';
      const resultSubtitle = (this.gameMode === 'QUICK_RACE')
        ? 'CLASSIFICAÇÃO OFICIAL DA PROVA (1º AO 20º)'
        : 'CLASSIFICAÇÃO OFICIAL & PONTUAÇÃO F1 (1º AO 10º)';
      ctx.fillText(resultSubtitle, INTERNAL_WIDTH / 2, 26);

      const ranked = this.lastRacePositions || this.cars;
      const colW = Math.min(182, Math.floor((INTERNAL_WIDTH - 20) / 2));
      const leftX = Math.floor((INTERNAL_WIDTH / 2) - colW - 3);
      const rightX = Math.floor((INTERNAL_WIDTH / 2) + 3);
      const tableY = 32;
      const rowH = 12.2;
      const headH = 12;

      const drawColumn = (colX, startRank, endRank, isPointsCol) => {
        const colH = headH + (endRank - startRank + 1) * rowH + 2;
        ctx.fillStyle = 'rgba(12, 18, 30, 0.94)';
        ctx.fillRect(colX, tableY, colW, colH);
        ctx.strokeStyle = isPointsCol ? 'rgba(0, 229, 255, 0.5)' : 'rgba(100, 120, 145, 0.35)';
        ctx.lineWidth = 1;
        ctx.strokeRect(colX, tableY, colW, colH);

        // Barra de cabeçalho
        ctx.fillStyle = isPointsCol ? 'rgba(0, 229, 255, 0.15)' : 'rgba(100, 120, 145, 0.12)';
        ctx.fillRect(colX, tableY, colW, headH);

        ctx.font = 'bold 6.8px monospace';
        ctx.fillStyle = isPointsCol ? '#00E5FF' : '#90A4AE';
        ctx.textAlign = 'left';
        ctx.fillText('POS', colX + 4, tableY + 8.5);
        ctx.fillText('PILOTO', colX + 25, tableY + 8.5);
        ctx.fillText('CARRO', colX + 112, tableY + 8.5);
        ctx.textAlign = 'right';
        ctx.fillText('PTS', colX + colW - 4, tableY + 8.5);

        for (let r = startRank; r <= endRank; r++) {
          const car = ranked[r - 1];
          if (!car) continue;
          const y = tableY + headH + (r - startRank) * rowH;
          const isPlayer = car.isPlayer;
          const pts = (r <= F1_POINTS.length) ? F1_POINTS[r - 1] : 0;

          if (isPlayer) {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.24)';
            ctx.fillRect(colX + 1, y, colW - 2, rowH - 0.5);
          } else if (r % 2 === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
            ctx.fillRect(colX + 1, y, colW - 2, rowH - 0.5);
          }

          let posColor = '#90A4AE';
          let nameColor = '#ECEFF1';
          if (isPlayer) {
            posColor = '#FFD700';
            nameColor = '#FFD700';
          } else if (r === 1) {
            posColor = '#FFD700';
            nameColor = '#FFE082';
          } else if (r === 2) {
            posColor = '#ECEFF1';
            nameColor = '#E0F7FA';
          } else if (r === 3) {
            posColor = '#CD7F32';
            nameColor = '#FFE0B2';
          } else if (r > 10) {
            nameColor = '#78909C';
          }

          ctx.font = isPlayer ? 'bold 7.2px monospace' : '7px monospace';
          ctx.textAlign = 'left';
          ctx.fillStyle = posColor;
          ctx.fillText(`${String(r).padStart(2, ' ')}º`, colX + 4, y + 8.5);

          ctx.fillStyle = nameColor;
          const displayName = isPlayer ? `VOCÊ [${car.driverCode}]` : `${car.driverName} [${car.driverCode}]`;
          ctx.fillText(displayName.slice(0, 16), colX + 25, y + 8.5);

          const mName = car.model?.name || '';
          const modelShort = mName.includes('UNO') ? 'UNO' : (mName.includes('FUSCA') ? 'FUSCA' : (mName.includes('206') ? '206' : (mName.includes('HB20') ? 'HB20' : mName.slice(0, 5))));
          ctx.fillStyle = isPlayer ? '#FFD700' : '#80CBC4';
          ctx.fillText(modelShort, colX + 112, y + 8.5);

          ctx.textAlign = 'right';
          ctx.fillStyle = pts > 0 ? (isPlayer ? '#FFD700' : '#69F0AE') : '#546E7A';
          ctx.fillText(pts > 0 ? `+${pts}` : '0', colX + colW - 4, y + 8.5);
        }
      };

      // Coluna 1 (1º ao 10º) e Coluna 2 (11º ao 20º)
      drawColumn(leftX, 1, 10, true);
      drawColumn(rightX, 11, 20, false);

      // Resumo do jogador
      const pRank = ranked.findIndex(c => c.isPlayer) + 1;
      const pPts = (pRank <= F1_POINTS.length) ? F1_POINTS[pRank - 1] : 0;
      const pTotal = this.championshipPoints[0];

      ctx.textAlign = 'center';
      ctx.font = 'bold 7.8px monospace';
      if (this.gameMode === 'QUICK_RACE') {
        ctx.fillStyle = pRank <= 3 ? '#69F0AE' : '#FFD700';
        ctx.fillText(`SEU RESULTADO: ${pRank}º LUGAR  |  CORRIDA RÁPIDA FINALIZADA!`, INTERNAL_WIDTH / 2, 178);
      } else {
        ctx.fillStyle = pPts > 0 ? '#69F0AE' : '#FFB74D';
        ctx.fillText(`SEU RESULTADO: ${pRank}º LUGAR (+${pPts} PTS)  |  TOTAL NO CAMPEONATO: ${pTotal} PTS`, INTERNAL_WIDTH / 2, 178);
      }

      if (this.newlyUnlockedAchievements && this.newlyUnlockedAchievements.length > 0) {
        const achStr = this.newlyUnlockedAchievements.map(a => `${a.icon} ${a.title}`).join('  •  ');
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 6.4px monospace';
        ctx.fillText(`CONQUISTA DESBLOQUEADA: ${achStr}`, INTERNAL_WIDTH / 2, 187);
      }

      const blink = Math.floor(performance.now() / 400) % 2 === 0;
      if (blink) {
        ctx.fillStyle = '#FFD700';
        ctx.font = touchSafe ? 'bold 8px monospace' : 'bold 9.5px monospace';
        let nextPrompt;
        if (this.gameMode === 'QUICK_RACE') {
          nextPrompt = touchSafe ? 'TOQUE / [3] — VOLTAR AO MENU' : 'PRESSIONE [ENTER] PARA VOLTAR AO MENU';
        } else {
          nextPrompt = touchSafe
            ? 'TOQUE / [3] — VER TABELA GERAL'
            : 'PRESSIONE [ENTER] PARA VER A CLASSIFICAÇÃO GERAL';
        }
        ctx.fillText(nextPrompt, INTERNAL_WIDTH / 2, 196);
      }
      ctx.restore();
    }

    renderChampionshipResult(ctx) {
      const touchSafe = this.input.touchControlsVisible;
      ctx.fillStyle = 'rgba(5, 8, 16, 0.95)';
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

      // Confete comemorativo animado
      this.renderConfetti(ctx);

      const overall = this.cars.map(c => ({
        car: c,
        points: this.championshipPoints[c.id]
      })).sort((a, b) => b.points - a.points);

      const first = overall[0];
      const second = overall[1];
      const third = overall[2];
      const pFinalRank = overall.findIndex(o => o.car.isPlayer) + 1;

      ctx.save();
      // Título
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFD700';
      ctx.font = touchSafe ? 'bold 11px monospace' : 'bold 13px monospace';
      ctx.fillText('🏆 LH44 — PÓDIO FINAL DO CAMPEONATO 🏆', INTERNAL_WIDTH / 2, 18);

      const cx1 = INTERNAL_WIDTH / 2;
      const cx2 = cx1 - 92;
      const cx3 = cx1 + 92;

      // Desenha Bloco do Pódio (3D arcade box)
      const drawPodiumBlock = (cx, topY, w, h, rankNum, gradColors, strokeColor) => {
        const x = cx - w / 2;
        ctx.save();
        ctx.fillStyle = gradColors[0];
        ctx.fillRect(x, topY, w, 5);

        const g = ctx.createLinearGradient(0, topY + 5, 0, topY + h);
        g.addColorStop(0, gradColors[1]);
        g.addColorStop(1, gradColors[2]);
        ctx.fillStyle = g;
        ctx.fillRect(x, topY + 5, w, h - 5);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(x, topY, w, h);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.font = `bold ${rankNum === 1 ? 22 : 17}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(rankNum), cx, topY + 5 + (h - 5) / 2);
        ctx.restore();
      };

      const getModelShort = (m) => {
        const n = m?.name || m || '';
        return n.includes('UNO') ? 'UNO' : (n.includes('FUSCA') ? 'FUSCA' : (n.includes('206') ? '206' : (n.includes('HB20') ? 'HB20' : n)));
      };

      // 2º Lugar (Esquerda)
      if (second) {
        drawPodiumBlock(cx2, 118, 76, 36, 2, ['#E2E8F0', '#94A3B8', '#475569'], '#CBD5E1');
        second.car.model.render(
          ctx, cx2, 104, 46, 28, false, 0, second.car.bodyColor,
          { isNitro: false, wheelPhase: 0, isNight: false, speed: 0 }
        );
        ctx.textAlign = 'center';
        ctx.fillStyle = '#CBD5E1';
        ctx.font = 'bold 7.5px monospace';
        ctx.fillText('🥈 2º LUGAR', cx2, 70);
        ctx.fillStyle = second.car.isPlayer ? '#FFD700' : '#FFFFFF';
        ctx.fillText(second.car.isPlayer ? `VOCÊ [${second.car.driverCode}]` : `${second.car.driverName} [${second.car.driverCode}]`, cx2, 80);
        ctx.fillStyle = '#69F0AE';
        ctx.font = 'bold 7px monospace';
        ctx.fillText(`${second.points} PTS (${getModelShort(second.car.model)})`, cx2, 89);
      }

      // 3º Lugar (Direita)
      if (third) {
        drawPodiumBlock(cx3, 128, 76, 26, 3, ['#EDDCD2', '#B08968', '#7F4F24'], '#DDB892');
        third.car.model.render(
          ctx, cx3, 114, 46, 28, false, 0, third.car.bodyColor,
          { isNitro: false, wheelPhase: 0, isNight: false, speed: 0 }
        );
        ctx.textAlign = 'center';
        ctx.fillStyle = '#DDB892';
        ctx.font = 'bold 7.5px monospace';
        ctx.fillText('🥉 3º LUGAR', cx3, 80);
        ctx.fillStyle = third.car.isPlayer ? '#FFD700' : '#FFFFFF';
        ctx.fillText(third.car.isPlayer ? `VOCÊ [${third.car.driverCode}]` : `${third.car.driverName} [${third.car.driverCode}]`, cx3, 90);
        ctx.fillStyle = '#69F0AE';
        ctx.font = 'bold 7px monospace';
        ctx.fillText(`${third.points} PTS (${getModelShort(third.car.model)})`, cx3, 99);
      }

      // 1º Lugar (Centro - O CAMPEÃO)
      if (first) {
        drawPodiumBlock(cx1, 102, 86, 52, 1, ['#FFF3BF', '#F59F00', '#B45309'], '#FFD700');
        first.car.model.render(
          ctx, cx1, 86, 54, 34, false, 0, first.car.bodyColor,
          { isNitro: false, wheelPhase: 0, isNight: false, speed: 0 }
        );
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 8.5px monospace';
        ctx.fillText('👑 O GRANDE CAMPEÃO 👑', cx1, 48);
        ctx.fillStyle = first.car.isPlayer ? '#FFD700' : '#FFFFFF';
        ctx.fillText(first.car.isPlayer ? `VOCÊ [${first.car.driverCode}]` : `${first.car.driverName} [${first.car.driverCode}]`, cx1, 58);
        ctx.fillStyle = '#69F0AE';
        ctx.font = 'bold 7.5px monospace';
        ctx.fillText(`${first.points} PTS (${getModelShort(first.car.model)})`, cx1, 67);
      }

      // Mensagem da Temporada do Jogador
      ctx.textAlign = 'center';
      ctx.font = 'bold 8px monospace';
      const pPts = this.championshipPoints[0];
      if (pFinalRank === 1) {
        ctx.fillStyle = '#00E676';
        ctx.fillText(`🎉 HISTÓRICO! VOCÊ É O CAMPEÃO DA FÓRMULA BRASIL LH44 COM ${pPts} PTS! 🎉`, INTERNAL_WIDTH / 2, 168);
      } else if (pFinalRank <= 3) {
        ctx.fillStyle = '#00E5FF';
        ctx.fillText(`🍾 PARABÉNS! VOCÊ CONQUISTOU O PÓDIO FINAL EM ${pFinalRank}º LUGAR COM ${pPts} PTS! 🍾`, INTERNAL_WIDTH / 2, 168);
      } else {
        ctx.fillStyle = '#FFB74D';
        ctx.fillText(`FIM DE TEMPORADA: VOCÊ TERMINOU EM ${pFinalRank}º LUGAR GERAL COM ${pPts} PONTOS.`, INTERNAL_WIDTH / 2, 168);
      }

      // Resumo dos demais pontuadores (4º ao 10º)
      ctx.font = '6.8px monospace';
      ctx.fillStyle = '#90A4AE';
      const topRow = overall.slice(3, 10).map((o, idx) => `${idx + 4}º ${o.car.driverCode}:${o.points}`).join('  ');
      ctx.fillText(topRow, INTERNAL_WIDTH / 2, 180);

      const blink = Math.floor(performance.now() / 450) % 2 === 0;
      if (blink) {
        ctx.fillStyle = '#FFD700';
        ctx.font = touchSafe ? 'bold 8px monospace' : 'bold 9.5px monospace';
        const restartMsg = touchSafe ? 'TOQUE / [3] — VER ENCERRAMENTO DA TEMPORADA' : 'PRESSIONE [ENTER] PARA VER O ENCERRAMENTO DA TEMPORADA';
        ctx.fillText(restartMsg, INTERNAL_WIDTH / 2, 198);
      }
      ctx.restore();
    }

    fadeTransition(targetState, onMid = null) {
      if (this.menuFadeState !== 'idle') return;
      this.menuFadeState = 'fading_out';
      this.menuFadeAlpha = 0;
      this.menuFadeTargetState = targetState;
      this.menuFadeOnMid = onMid;
      if (this.input) this.input.clearPulses();
    }

    getEffectiveMaxSpeed(car) {
      if (!car) return 220;
      if (this.diffMode === 'ADVANCED') return 280;
      if (car.effectiveMaxSpeed) return car.effectiveMaxSpeed;
      return (car.model && car.model.maxSpeed) ? car.model.maxSpeed : (car.maxSpeed || 220);
    }

    formatTime(sec) {
      if (!sec || isNaN(sec) || sec <= 0) return '00:00.00';
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      const ms = Math.floor((sec % 1) * 100);
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
    }


    getDifficultySelectLayout() {
      const touchSafe = this.input.touchControlsVisible;
      const cardW = touchSafe ? 152 : 166;
      const cardH = touchSafe ? 122 : 138;
      const cardY = touchSafe ? 34 : 36;
      const gap = touchSafe ? 12 : 14;
      const totalW = cardW * 2 + gap;
      const startX = Math.round((INTERNAL_WIDTH - totalW) / 2);
      const card0 = { x: startX, y: cardY, w: cardW, h: cardH };
      const card1 = { x: startX + cardW + gap, y: cardY, w: cardW, h: cardH };
      const btnW = touchSafe ? 86 : 98;
      const btnH = touchSafe ? 18 : 20;
      const btnY = touchSafe ? 168 : 184;
      const btnBack = { x: startX, y: btnY, w: btnW, h: btnH };
      const btnConfirm = { x: startX + totalW - btnW, y: btnY, w: btnW, h: btnH };
      return { touchSafe, cardW, cardH, cardY, card0, card1, btnBack, btnConfirm };
    }

    renderDifficultySelect(ctx) {
      const L = this.getDifficultySelectLayout();
      const touchSafe = L.touchSafe;
      const now = performance.now();

      ctx.fillStyle = 'rgba(6, 9, 18, 0.84)';
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#00E5FF';
      ctx.font = touchSafe ? 'bold 11px monospace' : 'bold 13px monospace';
      ctx.fillText('NÍVEL DE DESAFIO', INTERNAL_WIDTH / 2, touchSafe ? 19 : 23);

      ctx.fillStyle = '#FFD700';
      ctx.font = touchSafe ? 'bold 6.8px monospace' : 'bold 7.8px monospace';
      ctx.fillText('SELECIONE O MODO DE VELOCIDADE DOS CARROS', INTERNAL_WIDTH / 2, touchSafe ? 29 : 33);

      const diffs = [
        {
          id: 0,
          title: 'MODO NORMAL',
          icon: '🏁',
          badge: 'ORIGINAL LH44',
          color: '#00E5FF',
          lines: [
            '• VELOCIDADES DE FÁBRICA',
            '• CARROS DE 190 A 305 KM/H',
            '• PROGRESSÃO CLÁSSICA'
          ],
          box: L.card0
        },
        {
          id: 1,
          title: 'MODO AVANÇADO',
          icon: '⚡',
          badge: 'IGUALDADE 280 KM/H',
          color: '#FFD700',
          lines: [
            '• VELOCIDADE FINAL: 280 KM/H',
            '• FUSCA & UNO A 280 KM/H!',
            '• CURVAS, NITRO & CÂMBIO 100%'
          ],
          box: L.card1
        }
      ];

      for (let m = 0; m < diffs.length; m++) {
        const item = diffs[m];
        const isSelected = (this.selectedDiffIndex === item.id);
        const { x, y, w, h } = item.box;

        const cardGrad = ctx.createLinearGradient(x, y, x, y + h);
        if (isSelected) {
          cardGrad.addColorStop(0, 'rgba(18, 30, 52, 0.96)');
          cardGrad.addColorStop(1, 'rgba(10, 16, 30, 0.98)');
        } else {
          cardGrad.addColorStop(0, 'rgba(12, 16, 26, 0.88)');
          cardGrad.addColorStop(1, 'rgba(6, 9, 16, 0.92)');
        }
        ctx.fillStyle = cardGrad;
        ctx.fillRect(x, y, w, h);

        if (isSelected) {
          const pulse = (Math.sin(now / 140) + 1) * 0.5;
          ctx.strokeStyle = item.color;
          ctx.lineWidth = 2.2;
          ctx.strokeRect(x, y, w, h);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + pulse * 0.4})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
        } else {
          ctx.strokeStyle = 'rgba(70, 90, 120, 0.45)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, w, h);
        }

        const badgeW = touchSafe ? 90 : 100;
        const badgeH = touchSafe ? 11 : 12;
        const badgeX = x + Math.round((w - badgeW) / 2);
        const badgeY = y + 7;
        ctx.fillStyle = isSelected ? item.color : 'rgba(70, 90, 120, 0.5)';
        ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
        ctx.fillStyle = isSelected ? '#0A0F1A' : '#CFD8DC';
        ctx.font = 'bold 6.2px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(item.badge, badgeX + badgeW / 2, badgeY + badgeH - 3);

        ctx.font = touchSafe ? '22px monospace' : '26px monospace';
        ctx.fillText(item.icon, x + w / 2, y + (touchSafe ? 40 : 46));

        ctx.font = touchSafe ? 'bold 8.2px monospace' : 'bold 9.2px monospace';
        ctx.fillStyle = isSelected ? item.color : '#ECEFF1';
        ctx.fillText(item.title, x + w / 2, y + (touchSafe ? 55 : 63));

        ctx.textAlign = 'left';
        ctx.font = touchSafe ? '6.2px monospace' : '7.0px monospace';
        ctx.fillStyle = isSelected ? '#ECEFF1' : '#90A4AE';
        const lineStartY = y + (touchSafe ? 70 : 80);
        const lineSpacing = touchSafe ? 12 : 14;
        for (let li = 0; li < item.lines.length; li++) {
          ctx.fillText(item.lines[li], x + 10, lineStartY + li * lineSpacing);
        }
      }

      // BOTÃO ◀ VOLTAR
      const bB = L.btnBack;
      ctx.fillStyle = 'rgba(20, 28, 44, 0.92)';
      ctx.fillRect(bB.x, bB.y, bB.w, bB.h);
      ctx.strokeStyle = '#546E7A';
      ctx.lineWidth = 1;
      ctx.strokeRect(bB.x, bB.y, bB.w, bB.h);
      ctx.fillStyle = '#CFD8DC';
      ctx.font = 'bold 7.5px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('◀ VOLTAR', bB.x + bB.w / 2, bB.y + bB.h / 2 + 2.5);

      // BOTÃO CONTINUAR ▶
      const bC = L.btnConfirm;
      const confirmGrad = ctx.createLinearGradient(bC.x, bC.y, bC.x, bC.y + bC.h);
      confirmGrad.addColorStop(0, '#FFD700');
      confirmGrad.addColorStop(1, '#FF8F00');
      ctx.fillStyle = confirmGrad;
      ctx.fillRect(bC.x, bC.y, bC.w, bC.h);
      ctx.strokeStyle = '#FFE082';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(bC.x, bC.y, bC.w, bC.h);
      ctx.fillStyle = '#0A0F1A';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CONTINUAR ▶', bC.x + bC.w / 2, bC.y + bC.h / 2 + 2.5);

      ctx.restore();
    }

    renderChampionshipStandings(ctx) {
      const touchSafe = this.input.touchControlsVisible;
      ctx.fillStyle = 'rgba(5, 8, 16, 0.95)';
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFD700';
      ctx.font = touchSafe ? 'bold 10.5px monospace' : 'bold 12px monospace';
      const totalStages = (this.seasonSchedule && this.seasonSchedule.length) ? this.seasonSchedule.length : TRACK_DEFINITIONS.length;
      const currentStageNum = (this.seasonStage !== undefined ? this.seasonStage : 0) + 1;
      ctx.fillText('🏆 CLASSIFICAÇÃO GERAL DO CAMPEONATO 🏆', INTERNAL_WIDTH / 2, 16);

      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 7.2px monospace';
      ctx.fillText(`PONTOS ACUMULADOS APÓS ETAPA ${currentStageNum} DE ${totalStages}`, INTERNAL_WIDTH / 2, 26);

      const rankedOverall = this.cars.map(c => ({
        car: c,
        points: this.championshipPoints[c.id] || 0,
        stagePoints: c.racePoints || 0
      })).sort((a, b) => b.points - a.points);

      const colW = Math.min(182, Math.floor((INTERNAL_WIDTH - 20) / 2));
      const leftX = Math.floor((INTERNAL_WIDTH / 2) - colW - 3);
      const rightX = Math.floor((INTERNAL_WIDTH / 2) + 3);
      const tableY = 32;
      const rowH = 12.2;
      const headH = 12;

      const drawStandingsCol = (colX, startRank, endRank) => {
        const colH = headH + (endRank - startRank + 1) * rowH + 2;
        ctx.fillStyle = 'rgba(12, 18, 30, 0.94)';
        ctx.fillRect(colX, tableY, colW, colH);
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
        ctx.lineWidth = 1;
        ctx.strokeRect(colX, tableY, colW, colH);

        ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
        ctx.fillRect(colX, tableY, colW, headH);

        ctx.font = 'bold 6.8px monospace';
        ctx.fillStyle = '#00E5FF';
        ctx.textAlign = 'left';
        ctx.fillText('POS', colX + 4, tableY + 8.5);
        ctx.fillText('PILOTO', colX + 25, tableY + 8.5);
        ctx.fillText('CARRO', colX + 104, tableY + 8.5);
        ctx.textAlign = 'right';
        ctx.fillText('ETAPA', colX + colW - 32, tableY + 8.5);
        ctx.fillText('TOTAL', colX + colW - 4, tableY + 8.5);

        for (let r = startRank; r <= endRank; r++) {
          const item = rankedOverall[r - 1];
          if (!item) continue;
          const car = item.car;
          const y = tableY + headH + (r - startRank) * rowH;
          const isPlayer = car.isPlayer;

          if (isPlayer) {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.25)';
            ctx.fillRect(colX + 1, y, colW - 2, rowH - 0.5);
          } else if (r % 2 === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
            ctx.fillRect(colX + 1, y, colW - 2, rowH - 0.5);
          }

          let posColor = '#90A4AE';
          let nameColor = '#ECEFF1';
          if (isPlayer) {
            posColor = '#FFD700';
            nameColor = '#FFD700';
          } else if (r === 1) {
            posColor = '#FFD700';
            nameColor = '#FFE082';
          } else if (r === 2) {
            posColor = '#ECEFF1';
            nameColor = '#E0F7FA';
          } else if (r === 3) {
            posColor = '#CD7F32';
            nameColor = '#FFE0B2';
          }

          ctx.font = isPlayer ? 'bold 7.2px monospace' : '7px monospace';
          ctx.textAlign = 'left';
          ctx.fillStyle = posColor;
          ctx.fillText(`${String(r).padStart(2, ' ')}º`, colX + 4, y + 8.5);

          ctx.fillStyle = nameColor;
          const displayName = isPlayer ? `VOCÊ [${car.driverCode}]` : `${car.driverName} [${car.driverCode}]`;
          ctx.fillText(displayName.slice(0, 15), colX + 25, y + 8.5);

          const mName = car.model?.name || '';
          const modelShort = mName.includes('UNO') ? 'UNO' : (mName.includes('FUSCA') ? 'FUSCA' : (mName.includes('206') ? '206' : (mName.includes('HB20') ? 'HB20' : mName.slice(0, 5))));
          ctx.fillStyle = isPlayer ? '#FFD700' : '#80CBC4';
          ctx.fillText(modelShort, colX + 104, y + 8.5);

          ctx.textAlign = 'right';
          ctx.fillStyle = item.stagePoints > 0 ? '#69F0AE' : '#546E7A';
          ctx.fillText(item.stagePoints > 0 ? `+${item.stagePoints}` : '-', colX + colW - 32, y + 8.5);

          ctx.fillStyle = isPlayer ? '#FFD700' : '#00E5FF';
          ctx.font = 'bold 7px monospace';
          ctx.fillText(`${item.points}`, colX + colW - 4, y + 8.5);
        }
      };

      drawStandingsCol(leftX, 1, 10);
      drawStandingsCol(rightX, 11, 20);

      const pOverallRank = rankedOverall.findIndex(item => item.car.isPlayer) + 1;
      const pTotalPoints = this.championshipPoints[0] || 0;
      const leaderPoints = rankedOverall[0]?.points || 0;
      const diffToLeader = leaderPoints - pTotalPoints;

      ctx.textAlign = 'center';
      ctx.font = 'bold 7.8px monospace';
      if (pOverallRank === 1) {
        ctx.fillStyle = '#00E676';
        ctx.fillText(`VOCÊ É O LÍDER DO CAMPEONATO! TOTAL: ${pTotalPoints} PONTOS!`, INTERNAL_WIDTH / 2, 178);
      } else {
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`SUA POSIÇÃO GERAL: ${pOverallRank}º LUGAR (${pTotalPoints} PTS)  |  DIFERENÇA P/ O LÍDER: -${diffToLeader} PTS`, INTERNAL_WIDTH / 2, 178);
      }

      const blink = Math.floor(performance.now() / 400) % 2 === 0;
      if (blink) {
        ctx.fillStyle = '#FFD700';
        ctx.font = touchSafe ? 'bold 8px monospace' : 'bold 9.5px monospace';
        const hasNext = (this.seasonSchedule && this.seasonSchedule.length > 0 && this.seasonStage < this.seasonSchedule.length - 1);
        let promptText = '';
        if (hasNext) {
          if (this.diffMode === 'NORMAL') {
            promptText = touchSafe ? 'TOQUE / [3] — OFICINA DE UPGRADES DO CAMPEONATO' : 'PRESSIONE [ENTER] PARA A OFICINA DE UPGRADES';
          } else {
            const nextTrack = TRACK_DEFINITIONS[this.seasonSchedule[this.seasonStage + 1]];
            promptText = touchSafe ? `TOQUE / [3] — PRÓXIMA ETAPA (${nextTrack.name})` : `PRESSIONE [ENTER] PARA A PRÓXIMA ETAPA (${nextTrack.name})`;
          }
        } else {
          promptText = touchSafe ? 'TOQUE / [3] — VER O GRANDE PÓDIO FINAL' : 'PRESSIONE [ENTER] PARA A CERIMÔNIA DO PÓDIO FINAL';
        }
        ctx.fillText(promptText, INTERNAL_WIDTH / 2, 196);
      }
      ctx.restore();
    }

    getUpgradesLayout() {
      const cx = INTERNAL_WIDTH / 2;
      const cardW = Math.min(326, INTERNAL_WIDTH - 20);
      const cardX = Math.round(cx - cardW / 2);
      const curCar = CAR_MODELS[this.selectedCarIndex] || CAR_MODELS[0];
      const modelBonuses = (typeof MODEL_ENGINE_SPEED_BONUS !== 'undefined' && MODEL_ENGINE_SPEED_BONUS[curCar.id])
        ? MODEL_ENGINE_SPEED_BONUS[curCar.id]
        : [0, 8, 16, 24];
      const curEngineLvl = (this.playerUpgrades && this.playerUpgrades.engine) || 0;
      const nextEngineLvl = Math.min(3, curEngineLvl + 1);
      const curSpeedVal = (curCar.maxSpeed || 220) + (modelBonuses[curEngineLvl] || 0);
      const nextSpeedVal = (curCar.maxSpeed || 220) + (modelBonuses[nextEngineLvl] || 0);
      const engineDesc = (curEngineLvl >= 3)
        ? `Vel. máxima máx: ${curSpeedVal} km/h (+15% aceleração)`
        : `Próx: ${nextSpeedVal} km/h (atual: ${curSpeedVal} km/h, +5% acel.)`;

      return {
        cardX,
        cardW,
        cards: [
          { key: 'engine', name: 'MOTOR & PREPARAÇÃO', desc: engineDesc, icon: '⚡', y: 44, h: 36, costs: [4000, 8000, 14000] },
          { key: 'tires', name: 'PNEUS & ADERÊNCIA', desc: '+6% de aderência e tração em curvas por nível', icon: '🏁', y: 84, h: 36, costs: [3500, 7000, 12000] },
          { key: 'turbo', name: 'TURBO & NITRO', desc: '+0.60s de duração contínua de nitro por nível', icon: '🚀', y: 124, h: 36, costs: [4500, 9000, 15000] }
        ],
        nextBtn: { x: Math.round(cx - 130), y: 168, w: 260, h: 22 }
      };
    }

    buyUpgrade(key) {
      if (!this.playerUpgrades) this.playerUpgrades = { engine: 0, tires: 0, turbo: 0 };
      const curLvl = this.playerUpgrades[key] || 0;
      if (curLvl >= 3) return false;
      const costs = {
        engine: [4000, 8000, 14000],
        tires: [3500, 7000, 12000],
        turbo: [4500, 9000, 15000]
      };
      const price = costs[key][curLvl];
      if ((this.playerCredits || 0) >= price) {
        this.playerCredits -= price;
        this.playerUpgrades[key] = curLvl + 1;
        this.audio.playBeep(659, 0.15);
        this.saveCurrentChampionship();
        return true;
      } else {
        this.audio.playBeep(220, 0.15);
        return false;
      }
    }

    updateUpgrades(dt) {
      if (!this.playerUpgrades) this.playerUpgrades = { engine: 0, tires: 0, turbo: 0 };
      if (this.selectedUpgradeIndex === undefined) this.selectedUpgradeIndex = 0;

      const layout = this.getUpgradesLayout();

      // Mouse / Touch click handling
      if (this.input.lastCanvasClick) {
        const click = this.input.lastCanvasClick;
        this.input.lastCanvasClick = null;

        for (let i = 0; i < layout.cards.length; i++) {
          const c = layout.cards[i];
          if (click.x >= layout.cardX && click.x <= layout.cardX + layout.cardW &&
              click.y >= c.y && click.y <= c.y + c.h) {
            this.selectedUpgradeIndex = i;
            this.buyUpgrade(c.key);
            this.input.clearPulses();
            return;
          }
        }

        const btn = layout.nextBtn;
        if (click.x >= btn.x && click.x <= btn.x + btn.w &&
            click.y >= btn.y && click.y <= btn.y + btn.h) {
          this.audio.playBeep(523, 0.12);
          this.saveCurrentChampionship();
          this.fadeTransition('SAVE_PROGRESS');
          this.input.clearPulses();
          return;
        }
      }

      // Keyboard navigation
      if (this.input.justPressedUp) {
        this.selectedUpgradeIndex = (this.selectedUpgradeIndex - 1 + 4) % 4;
        this.audio.playBeep(440, 0.05);
      } else if (this.input.justPressedDown) {
        this.selectedUpgradeIndex = (this.selectedUpgradeIndex + 1) % 4;
        this.audio.playBeep(440, 0.05);
      }

      if (this.input.justPressedEnter) {
        if (this.selectedUpgradeIndex === 3) {
          this.audio.playBeep(523, 0.12);
          this.saveCurrentChampionship();
          this.fadeTransition('SAVE_PROGRESS');
        } else {
          const item = layout.cards[this.selectedUpgradeIndex];
          if (item) this.buyUpgrade(item.key);
        }
      }

      this.input.clearPulses();
    }

    renderUpgrades(ctx) {
      const cx = INTERNAL_WIDTH / 2;
      const touchSafe = this.input.touchControlsVisible;
      const layout = this.getUpgradesLayout();
      if (!this.playerUpgrades) this.playerUpgrades = { engine: 0, tires: 0, turbo: 0 };

      // Fundo em degradê arcade escuro
      const vignetteGrad = ctx.createLinearGradient(0, 0, 0, INTERNAL_HEIGHT);
      vignetteGrad.addColorStop(0, 'rgba(10, 15, 30, 0.92)');
      vignetteGrad.addColorStop(1, 'rgba(5, 5, 12, 0.98)');
      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Título
      ctx.fillStyle = '#FFD700';
      ctx.font = touchSafe ? 'bold 11px monospace' : 'bold 12.5px monospace';
      ctx.fillText('🛠️ OFICINA DO CAMPEONATO — PREPARAÇÃO 🛠️', cx, 15);

      const nextTrack = (this.seasonSchedule && this.seasonSchedule[this.seasonStage + 1] !== undefined)
        ? TRACK_DEFINITIONS[this.seasonSchedule[this.seasonStage + 1]]
        : null;
      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 6.8px monospace';
      const stageStr = `ETAPA ${((this.seasonStage || 0) + 1)} CONCLUÍDA` + (nextTrack ? `  ➔  PRÓXIMA: ${nextTrack.name}` : '');
      ctx.fillText(stageStr, cx, 26);

      // Saldo de créditos
      ctx.fillStyle = '#FFE082';
      ctx.font = 'bold 7.5px monospace';
      const creditsStr = `SEU SALDO: R$ ${(this.playerCredits || 0).toLocaleString('pt-BR')}` + (this.lastPrizeMoney ? `  (+R$ ${this.lastPrizeMoney.toLocaleString('pt-BR')} PRÊMIO)` : '');
      ctx.fillText(creditsStr, cx, 36);

      // Cartões de Upgrades
      for (let i = 0; i < layout.cards.length; i++) {
        const item = layout.cards[i];
        const isSel = (this.selectedUpgradeIndex === i);
        const curLvl = this.playerUpgrades[item.key] || 0;
        const isMax = curLvl >= 3;
        const price = isMax ? 0 : item.costs[curLvl];
        const canAfford = !isMax && (this.playerCredits || 0) >= price;

        // Caixa do cartão
        ctx.fillStyle = isSel ? 'rgba(25, 42, 70, 0.95)' : 'rgba(12, 18, 30, 0.85)';
        ctx.fillRect(layout.cardX, item.y, layout.cardW, item.h);
        ctx.strokeStyle = isSel ? '#FFD700' : (canAfford ? '#00E5FF88' : '#334155');
        ctx.lineWidth = isSel ? 1.5 : 1.0;
        ctx.strokeRect(layout.cardX, item.y, layout.cardW, item.h);

        // Ícone
        const badgeW = 32;
        ctx.fillStyle = isSel ? '#FFD700' : '#0284C7';
        ctx.fillRect(layout.cardX + 2, item.y + 2, badgeW, item.h - 4);
        ctx.fillStyle = isSel ? '#100500' : '#FFFFFF';
        ctx.font = '14px sans-serif';
        ctx.fillText(item.icon, layout.cardX + 2 + badgeW / 2, item.y + item.h / 2);

        // Textos descritivos (alinhados à esquerda)
        ctx.textAlign = 'left';
        ctx.fillStyle = isSel ? '#FFD700' : '#FFFFFF';
        ctx.font = 'bold 7.5px monospace';
        ctx.fillText(item.name, layout.cardX + badgeW + 8, item.y + 11);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '6px monospace';
        ctx.fillText(item.desc, layout.cardX + badgeW + 8, item.y + 21);

        // Barras de nível (3 segmentos)
        const barX = layout.cardX + badgeW + 8;
        const barY = item.y + 26;
        for (let lvl = 0; lvl < 3; lvl++) {
          const filled = lvl < curLvl;
          ctx.fillStyle = filled ? (isSel ? '#FFD700' : '#00E5FF') : 'rgba(255,255,255,0.15)';
          ctx.fillRect(barX + lvl * 18, barY, 14, 4);
        }
        ctx.fillStyle = isMax ? '#00E676' : '#FFD700';
        ctx.font = 'bold 6.2px monospace';
        ctx.fillText(isMax ? 'MAX (3/3)' : `NV ${curLvl}/3`, barX + 3 * 18 + 4, barY + 3.5);

        // Botão de compra / status
        const btnW = 86;
        const btnH = 22;
        const btnX = layout.cardX + layout.cardW - btnW - 6;
        const btnY = Math.round(item.y + (item.h - btnH) / 2);

        let btnBg = '#1E293B';
        let btnText = 'COMPRAR';
        let btnTextColor = '#64748B';

        if (isMax) {
          btnBg = 'rgba(0, 230, 118, 0.2)';
          btnText = '✓ MÁXIMO';
          btnTextColor = '#00E676';
        } else if (canAfford) {
          btnBg = isSel ? '#FFD700' : '#0284C7';
          btnText = `R$ ${price.toLocaleString('pt-BR')}`;
          btnTextColor = isSel ? '#100500' : '#FFFFFF';
        } else {
          btnBg = 'rgba(51, 65, 85, 0.4)';
          btnText = `R$ ${price.toLocaleString('pt-BR')}`;
          btnTextColor = '#64748B';
        }

        ctx.fillStyle = btnBg;
        ctx.fillRect(btnX, btnY, btnW, btnH);
        ctx.strokeStyle = isSel ? '#FFD700' : (canAfford ? '#38BDF8' : '#475569');
        ctx.lineWidth = 1;
        ctx.strokeRect(btnX, btnY, btnW, btnH);

        ctx.textAlign = 'center';
        ctx.fillStyle = btnTextColor;
        ctx.font = 'bold 7px monospace';
        ctx.fillText(btnText, btnX + btnW / 2, btnY + btnH / 2);
      }

      // Botão de Avançar Etapa
      const isNextSel = (this.selectedUpgradeIndex === 3);
      const nBtn = layout.nextBtn;
      ctx.fillStyle = isNextSel ? '#FFD700' : 'rgba(2, 132, 199, 0.85)';
      ctx.fillRect(nBtn.x, nBtn.y, nBtn.w, nBtn.h);
      ctx.strokeStyle = isNextSel ? '#FFFFFF' : '#38BDF8';
      ctx.lineWidth = isNextSel ? 1.5 : 1.0;
      ctx.strokeRect(nBtn.x, nBtn.y, nBtn.w, nBtn.h);

      ctx.fillStyle = isNextSel ? '#100500' : '#FFFFFF';
      ctx.font = 'bold 8.2px monospace';
      ctx.fillText('➔ AVANÇAR PARA A PRÓXIMA ETAPA', nBtn.x + nBtn.w / 2, nBtn.y + nBtn.h / 2);

      // Rodapé instrucional
      ctx.fillStyle = '#94A3B8';
      ctx.font = '6px monospace';
      ctx.fillText(touchSafe ? 'TOQUE NO ITEM PARA MELHORAR  |  TOQUE EM AVANÇAR PARA CONTINUAR' : 'USE [CIMA/BAIXO] E [ENTER] PARA MELHORAR  |  OU CLIQUE COM O MOUSE', cx, 204);

      ctx.restore();
    }

    updateEndingFireworks(dt) {
      if (this.endingRank !== 1) return;
      if (!this.endingFireworks) this.endingFireworks = [];
      if (Math.random() < 0.08) {
        const colors = ['#FFD700', '#FF5252', '#00E5FF', '#76FF03', '#E040FB', '#FFAB00'];
        const fx = 40 + Math.random() * (INTERNAL_WIDTH - 80);
        const fy = 20 + Math.random() * 70;
        const col = colors[Math.floor(Math.random() * colors.length)];
        for (let i = 0; i < 24; i++) {
          const angle = (i / 24) * Math.PI * 2;
          const spd = 20 + Math.random() * 45;
          this.endingFireworks.push({
            x: fx, y: fy,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            color: col,
            life: 1.0,
            decay: 0.8 + Math.random() * 0.6
          });
        }
      }
      for (let i = this.endingFireworks.length - 1; i >= 0; i--) {
        const p = this.endingFireworks[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 25 * dt;
        p.life -= p.decay * dt;
        if (p.life <= 0) {
          this.endingFireworks.splice(i, 1);
        }
      }
    }

    renderEndingScene(ctx) {
      const touchSafe = this.input.touchControlsVisible;
      const rank = this.endingRank || 1;
      const t = this.endingTimer || 0;

      if (rank === 1) {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, INTERNAL_HEIGHT);
        bgGrad.addColorStop(0, '#040510');
        bgGrad.addColorStop(0.5, '#120A2A');
        bgGrad.addColorStop(1, '#1A0C38');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

        for (let s = 0; s < 35; s++) {
          const sx = (s * 47 + Math.sin(s * 3.1) * 30) % INTERNAL_WIDTH;
          const sy = (s * 29 + Math.cos(s * 2.7) * 20) % 110;
          const alpha = 0.3 + 0.7 * Math.sin(t * 3 + s);
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, alpha)})`;
          ctx.fillRect(sx, sy, 1.5, 1.5);
        }

        if (this.endingFireworks) {
          for (let i = 0; i < this.endingFireworks.length; i++) {
            const p = this.endingFireworks[i];
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillRect(p.x, p.y, 2, 2);
          }
          ctx.globalAlpha = 1.0;
        }

        // Pista comemorativa em PERSPECTIVA 3D FRONTAL (Opção A)
        const roadHorizonY = 136;
        const roadCenter = INTERNAL_WIDTH / 2;

        // Asfalto da pista em trapézio frontal
        ctx.fillStyle = '#151822';
        ctx.beginPath();
        ctx.moveTo(roadCenter - 18, roadHorizonY);
        ctx.lineTo(roadCenter + 18, roadHorizonY);
        ctx.lineTo(roadCenter + 185, INTERNAL_HEIGHT);
        ctx.lineTo(roadCenter - 185, INTERNAL_HEIGHT);
        ctx.closePath();
        ctx.fill();

        // Zebras laterais em perspectiva
        const curbAnim = (t * 70) % 18;
        for (let dy = roadHorizonY + curbAnim; dy < INTERNAL_HEIGHT; dy += 14) {
          const pr = (dy - roadHorizonY) / (INTERNAL_HEIGHT - roadHorizonY);
          const halfW = 18 + pr * 167;
          const curbW = 4 + pr * 14;
          const isRed = Math.floor((dy - curbAnim) / 14) % 2 === 0;
          ctx.fillStyle = isRed ? '#FF1744' : '#FFFFFF';
          ctx.fillRect(roadCenter - halfW - curbW, dy, curbW, 10 * pr + 2);
          ctx.fillRect(roadCenter + halfW, dy, curbW, 10 * pr + 2);
        }

        // Faixas centrais tracejadas correndo suavemente em direção à tela
        const dashAnim = (t * 60) % 20;
        ctx.strokeStyle = '#FFD700';
        for (let dy = roadHorizonY + dashAnim; dy < INTERNAL_HEIGHT; dy += 18) {
          const pr = (dy - roadHorizonY) / (INTERNAL_HEIGHT - roadHorizonY);
          ctx.lineWidth = 1.5 + pr * 2.5;
          ctx.beginPath();
          ctx.moveTo(roadCenter, dy);
          ctx.lineTo(roadCenter, dy + 6 + pr * 8);
          ctx.stroke();
        }

        this.renderConfetti(ctx);

        const trophyX = INTERNAL_WIDTH / 2;
        const trophyY = 58;
        const glow = (Math.sin(t * 4) + 1) * 0.5;
        const radG = ctx.createRadialGradient(trophyX, trophyY, 5, trophyX, trophyY, 48);
        radG.addColorStop(0, `rgba(255, 215, 0, ${0.45 + glow * 0.3})`);
        radG.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = radG;
        ctx.beginPath();
        ctx.arc(trophyX, trophyY, 48, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = '34px monospace';
        ctx.fillText('🏆', trophyX, trophyY + 12);

        // Carro do Campeão centralizado e alinhado perfeitamente com a pista frontal
        const carY = 170 + Math.sin(t * 12) * 0.8;
        if (this.player && this.player.model) {
          this.player.model.render(
            ctx, trophyX, carY, 68, 42, false, 0, this.player.bodyColor,
            { isNitro: true, wheelPhase: t * 15, isNight: true, speed: 120 }
          );
        }

        ctx.fillStyle = '#FFD700';
        ctx.font = touchSafe ? 'bold 11px monospace' : 'bold 13px monospace';
        ctx.fillText('👑 O GRANDE CAMPEÃO DO LH44! 👑', INTERNAL_WIDTH / 2, 20);

        ctx.fillStyle = '#00E5FF';
        ctx.font = 'bold 7.5px monospace';
        const pPts = this.championshipPoints[0] || 0;
        ctx.fillText(`PILOTO: VOCÊ [${this.player?.driverCode || 'LEA'}]  |  TOTAL: ${pPts} PONTOS  |  CAMPEÃO DA TEMPORADA`, INTERNAL_WIDTH / 2, 32);

        ctx.fillStyle = '#FFE082';
        ctx.font = 'bold 7.2px monospace';
        ctx.fillText('HISTÓRICO! VOCÊ CONQUISTOU A TEMPORADA COMPLETA DA FÓRMULA BRASIL!', INTERNAL_WIDTH / 2, 122);
        ctx.fillStyle = '#69F0AE';
        ctx.font = '6.8px monospace';
        ctx.fillText('SEU NOME ESTÁ ETERNIZADO COMO UMA LENDA DO AUTOMOBILISMO ARCADE!', INTERNAL_WIDTH / 2, 134);
        ctx.restore();

      } else if (rank <= 3) {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, INTERNAL_HEIGHT);
        bgGrad.addColorStop(0, '#050D1A');
        bgGrad.addColorStop(0.6, '#0F1E36');
        bgGrad.addColorStop(1, '#1A2942');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

        // Pista em perspectiva 3D frontal (Opção A)
        const roadHorizonY = 136;
        const roadCenter = INTERNAL_WIDTH / 2;
        ctx.fillStyle = '#151822';
        ctx.beginPath();
        ctx.moveTo(roadCenter - 18, roadHorizonY);
        ctx.lineTo(roadCenter + 18, roadHorizonY);
        ctx.lineTo(roadCenter + 185, INTERNAL_HEIGHT);
        ctx.lineTo(roadCenter - 185, INTERNAL_HEIGHT);
        ctx.closePath();
        ctx.fill();

        // Faixas centrais em perspectiva
        const dashAnim = (t * 50) % 20;
        ctx.strokeStyle = '#00E5FF';
        for (let dy = roadHorizonY + dashAnim; dy < INTERNAL_HEIGHT; dy += 18) {
          const pr = (dy - roadHorizonY) / (INTERNAL_HEIGHT - roadHorizonY);
          ctx.lineWidth = 1.5 + pr * 2.2;
          ctx.beginPath();
          ctx.moveTo(roadCenter, dy);
          ctx.lineTo(roadCenter, dy + 6 + pr * 7);
          ctx.stroke();
        }

        this.renderConfetti(ctx);

        const trophyX = INTERNAL_WIDTH / 2;
        const trophyY = 62;
        const medalEmoji = (rank === 2) ? '🥈' : '🥉';
        const medalTitle = (rank === 2) ? '🥈 VICE-CAMPEÃO CONSAGRADO! 🥈' : '🥉 PÓDIO DE HONRA CONQUISTADO! 🥉';
        const medalColor = (rank === 2) ? '#E2E8F0' : '#DDB892';

        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = '34px monospace';
        ctx.fillText(medalEmoji, trophyX, trophyY + 12);

        const carY = 162 + Math.sin(t * 10) * 1.0;
        if (this.player && this.player.model) {
          this.player.model.render(
            ctx, trophyX, carY, 64, 40, false, 0, this.player.bodyColor,
            { isNitro: false, wheelPhase: t * 10, isNight: false, speed: 80 }
          );
        }

        ctx.fillStyle = medalColor;
        ctx.font = touchSafe ? 'bold 11px monospace' : 'bold 13px monospace';
        ctx.fillText(medalTitle, INTERNAL_WIDTH / 2, 20);

        ctx.fillStyle = '#00E5FF';
        ctx.font = 'bold 7.5px monospace';
        const pPts = this.championshipPoints[0] || 0;
        ctx.fillText(`PILOTO: VOCÊ [${this.player?.driverCode || 'LEA'}]  |  TOTAL: ${pPts} PONTOS  |  ${rank}º LUGAR GERAL`, INTERNAL_WIDTH / 2, 32);

        ctx.fillStyle = '#ECEFF1';
        ctx.font = 'bold 7.5px monospace';
        ctx.fillText('UMA TEMPORADA BRILHANTE E INESQUECÍVEL!', INTERNAL_WIDTH / 2, 122);
        ctx.fillStyle = '#69F0AE';
        ctx.font = '6.8px monospace';
        ctx.fillText('VOCÊ SUPEROU ADVERSÁRIOS FEROZES E SUBIU NO PÓDIO FINAL DO BRASIL!', INTERNAL_WIDTH / 2, 134);
        ctx.restore();

      } else {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, 130);
        skyGrad.addColorStop(0, '#1A0E2E');
        skyGrad.addColorStop(0.35, '#5C1D4E');
        skyGrad.addColorStop(0.7, '#D4483B');
        skyGrad.addColorStop(0.95, '#F5A623');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, INTERNAL_WIDTH, 130);

        const sunX = INTERNAL_WIDTH / 2;
        const sunY = 118;
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 6, sunX, sunY, 38);
        sunGrad.addColorStop(0, '#FFF9C4');
        sunGrad.addColorStop(0.4, '#FFE082');
        sunGrad.addColorStop(0.8, '#FF8A65');
        sunGrad.addColorStop(1, 'rgba(255, 138, 101, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 38, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#261226';
        ctx.beginPath();
        ctx.moveTo(0, 130);
        ctx.lineTo(40, 105);
        ctx.lineTo(90, 120);
        ctx.lineTo(150, 98);
        ctx.lineTo(210, 122);
        ctx.lineTo(280, 102);
        ctx.lineTo(340, 118);
        ctx.lineTo(INTERNAL_WIDTH, 108);
        ctx.lineTo(INTERNAL_WIDTH, 130);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#151821';
        ctx.beginPath();
        ctx.moveTo(sunX - 12, 130);
        ctx.lineTo(sunX + 12, 130);
        ctx.lineTo(INTERNAL_WIDTH + 60, INTERNAL_HEIGHT);
        ctx.lineTo(-60, INTERNAL_HEIGHT);
        ctx.closePath();
        ctx.fill();

        const roadAnim = (t * 50) % 25;
        ctx.strokeStyle = '#FFD54F';
        ctx.lineWidth = 2;
        for (let dy = 132 + roadAnim; dy < INTERNAL_HEIGHT; dy += 22) {
          ctx.beginPath();
          ctx.moveTo(sunX, dy);
          ctx.lineTo(sunX, dy + 8);
          ctx.stroke();
        }

        const carY = 176 + Math.sin(t * 8) * 0.8;
        if (this.player && this.player.model) {
          this.player.model.render(
            ctx, sunX, carY, 56, 36, false, 0, this.player.bodyColor,
            { isNitro: false, wheelPhase: t * 8, isNight: false, speed: 60 }
          );
        }

        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFE082';
        ctx.font = touchSafe ? 'bold 10.5px monospace' : 'bold 12px monospace';
        ctx.fillText('🌅 NUNCA DESISTA DOS SEUS SONHOS! 🌅', INTERNAL_WIDTH / 2, 19);

        ctx.fillStyle = '#00E5FF';
        ctx.font = 'bold 7.2px monospace';
        const pPts = this.championshipPoints[0] || 0;
        ctx.fillText(`TEMPORADA CONCLUÍDA EM ${rank}º LUGAR COM ${pPts} PONTOS`, INTERNAL_WIDTH / 2, 31);

        ctx.fillStyle = '#FFF3E0';
        ctx.font = 'bold 7.2px monospace';
        ctx.fillText('"AS GRANDES LENDAS SÃO FORJADAS NA PERSISTÊNCIA."', INTERNAL_WIDTH / 2, 48);
        ctx.fillStyle = '#FFE082';
        ctx.font = '6.8px monospace';
        ctx.fillText('Você completou todas as 31 etapas com garra e bravura!', INTERNAL_WIDTH / 2, 59);
        ctx.fillStyle = '#69F0AE';
        ctx.font = '6.8px monospace';
        ctx.fillText('Ajuste seu carro, treine as curvas e volte para conquistar o campeonato!', INTERNAL_WIDTH / 2, 70);
        ctx.restore();
      }

      const blink = Math.floor(performance.now() / 420) % 2 === 0;
      if (blink) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFD700';
        ctx.font = touchSafe ? 'bold 8px monospace' : 'bold 9.5px monospace';
        const exitMsg = touchSafe ? 'TOQUE / [3] — VOLTAR AO MENU' : 'PRESSIONE [ENTER] PARA VOLTAR AO MENU';
        ctx.fillText(exitMsg, INTERNAL_WIDTH / 2, 206);
        ctx.restore();
      }
    }

  }
  const descs = Object.getOwnPropertyDescriptors(MenuRenderer.prototype);
  delete descs.constructor;
  Object.defineProperties(LH44RacingGame.prototype, descs);
})();
