/**
 * LH44 - LOW TO HIGH SPEED
 * Módulo de Monumentos e Pontos Turísticos das 27 Capitais do Brasil
 * Arte vetorial em perspectiva 2.5D com iluminação para Dia, Crepúsculo e Noite.
 */

const MonumentArt = {
  /**
   * Renderiza um monumento na beira da pista (Roadside 3D Scenery)
   * (0, 0) é a base no chão. Y negativo sobe em direção ao céu.
   */
  renderScenery(ctx, type, size, isNight, isDusk) {
    switch (type) {
      // -------------------------------------------------------------
      // SALVADOR • BA — ELEVADOR LACERDA (ARQUITETURA ART DÉCO DETALHADA)
      // -------------------------------------------------------------
      case 'elevador_lacerda': {
        const tw = size * 1.05;
        const th = size * 3.30;
        const ty = -th;
        const bw = size * 2.10;
        const bh = size * 0.56;

        // Encosta e muralha de sustentação da Cidade Alta (à esquerda)
        ctx.fillStyle = isNight ? '#151B24' : (isDusk ? '#3E2E26' : '#64748B');
        ctx.beginPath();
        ctx.moveTo(-bw * 0.85, 0);
        ctx.lineTo(-bw * 0.85, ty + bh * 0.40);
        ctx.lineTo(-bw * 0.25, ty + bh * 0.40);
        ctx.lineTo(-bw * 0.10, 0);
        ctx.closePath();
        ctx.fill();

        // Casinha colonial no topo da Cidade Alta
        ctx.fillStyle = isNight ? '#283242' : (isDusk ? '#B45309' : '#FDE68A');
        ctx.fillRect(-bw * 0.78, ty - bh * 0.15, bw * 0.36, bh * 0.55);
        ctx.fillStyle = isNight ? '#1E293B' : '#991B1B';
        ctx.beginPath();
        ctx.moveTo(-bw * 0.81, ty - bh * 0.15);
        ctx.lineTo(-bw * 0.60, ty - bh * 0.48);
        ctx.lineTo(-bw * 0.39, ty - bh * 0.15);
        ctx.closePath();
        ctx.fill();

        // Base e contrafortes na Cidade Baixa
        ctx.fillStyle = isNight ? '#1E2530' : (isDusk ? '#524036' : '#94A3B8');
        ctx.fillRect(-tw * 0.62, ty + th * 0.66, tw * 1.24, th * 0.34);

        // Duas Torres Verticais Gêmeas Art Déco com vão central sombreado
        const towerW = tw * 0.36;
        const gapW = tw * 0.16;
        const towerCol = isNight ? '#334155' : (isDusk ? '#786254' : '#E2E8F0');
        const towerShade = isNight ? '#1E293B' : (isDusk ? '#57463C' : '#CBD5E1');
        // Torre esquerda e direita
        ctx.fillStyle = towerCol;
        ctx.fillRect(-gapW * 0.5 - towerW, ty + bh * 0.35, towerW, th - bh * 0.35);
        ctx.fillRect(gapW * 0.5, ty + bh * 0.35, towerW, th - bh * 0.35);
        // Vão central entre as torres
        ctx.fillStyle = isNight ? '#0F172A' : (isDusk ? '#3B2C24' : '#475569');
        ctx.fillRect(-gapW * 0.5, ty + bh * 0.45, gapW, th - bh * 0.45);

        // Frisos verticais Art Déco e janelas dos poços
        ctx.fillStyle = towerShade;
        ctx.fillRect(-gapW * 0.5 - towerW * 0.45, ty + bh * 0.45, towerW * 0.25, th * 0.72);
        ctx.fillRect(gapW * 0.5 + towerW * 0.20, ty + bh * 0.45, towerW * 0.25, th * 0.72);

        // Passarela Suspensa Superior (conectando a Cidade Alta às torres)
        ctx.fillStyle = isNight ? '#273549' : (isDusk ? '#6B5548' : '#F1F5F9');
        ctx.fillRect(-bw * 0.52, ty, bw * 0.94, bh);
        // Beiral / teto da passarela
        ctx.fillStyle = isNight ? '#0F172A' : (isDusk ? '#43342C' : '#64748B');
        ctx.fillRect(-bw * 0.54, ty - bh * 0.10, bw * 0.98, bh * 0.16);

        // Janelas de fita contínua iluminadas na passarela
        ctx.fillStyle = isNight ? '#FDE047' : (isDusk ? '#FED7AA' : '#38BDF8');
        ctx.fillRect(-bw * 0.46, ty + bh * 0.28, bw * 0.80, bh * 0.32);

        // Relógio clássico no topo das torres
        ctx.fillStyle = isNight ? '#FEF08A' : '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, ty + bh * 0.46, size * 0.11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = Math.max(0.8, size * 0.02);
        ctx.stroke();

        // Letreiro luminoso no topo
        if (size > 14) {
          ctx.fillStyle = isNight ? '#38BDF8' : '#0284C7';
          ctx.font = `bold ${Math.max(4, Math.floor(size * 0.11))}px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText('ELEVADOR LACERDA', 0, ty - bh * 0.22);
        }
        break;
      }

      // -------------------------------------------------------------
      // SALVADOR • BA — FAROL DA BARRA
      // -------------------------------------------------------------
      case 'farol_barra': {
        const fw = size * 1.90;
        const fh = size * 0.55;
        const tw = size * 0.55;
        const th = size * 2.30;
        const ty = -th;

        // Base Fortificada de Pedra (Forte de Santo Antônio da Barra)
        ctx.fillStyle = isNight ? '#1E242B' : (isDusk ? '#4B3F35' : '#795548');
        ctx.fillRect(-fw * 0.50, -fh, fw, fh);
        // Ameias do forte
        ctx.fillStyle = isNight ? '#2B333D' : (isDusk ? '#5D4037' : '#8D6E63');
        for (let a = -fw * 0.45; a <= fw * 0.45; a += fw * 0.18) {
          ctx.fillRect(a, -fh - size * 0.08, size * 0.10, size * 0.08);
        }

        // Torre Cilíndrica com faixas horizontais pretas e brancas
        const segH = (th - fh) / 4;
        for (let s = 0; s < 4; s++) {
          const sy = -fh - (s + 1) * segH;
          ctx.fillStyle = (s % 2 === 0)
            ? (isNight ? '#0F172A' : '#1E293B')   // Faixa Preta
            : (isNight ? '#94A3B8' : '#F8FAFC');  // Faixa Branca
          ctx.fillRect(-tw * 0.50 + s * 1.2, sy, tw - s * 2.4, segH);
        }

        // Lanterna do Farol
        ctx.fillStyle = isNight ? '#DC2626' : '#EF4444';
        ctx.fillRect(-tw * 0.35, ty - size * 0.18, tw * 0.70, size * 0.18);

        // Facho de luz horizontal rotativo do Farol (à noite ou crepúsculo)
        if (isNight || isDusk) {
          const nowSec = performance.now() * 0.003;
          MonumentArt.drawLighthouseBeam(ctx, 0, ty - size * 0.09, isNight, isDusk, nowSec, size * 3.5);
        }
        break;
      }

      // -------------------------------------------------------------
      // SÃO PAULO • SP — MASP (MUSEU DE ARTE DE SÃO PAULO)
      // -------------------------------------------------------------
      case 'masp': {
        const mw = size * 2.60;
        const mh = size * 1.35;
        const beamW = size * 0.22;
        const boxH = mh * 0.55;
        const my = -mh;

        // Vão Livre de 70 metros (Piso da Avenida Paulista)
        ctx.fillStyle = isNight ? 'rgba(15, 23, 42, 0.5)' : 'rgba(30, 41, 59, 0.3)';
        ctx.fillRect(-mw * 0.50, -mh * 0.45, mw, mh * 0.45);

        // Dois Pilares Pórticos Vermelhos Icônicos
        ctx.fillStyle = isNight ? '#991B1B' : '#DC2626';
        // Pilar Esquerdo
        ctx.fillRect(-mw * 0.50, my, beamW, mh);
        // Pilar Direito
        ctx.fillRect(mw * 0.50 - beamW, my, beamW, mh);
        // Viga Superior Vermelha
        ctx.fillRect(-mw * 0.50, my, mw, beamW);

        // Caixa de Vidro e Concreto Suspensa
        ctx.fillStyle = isNight ? '#0F172A' : '#1E293B';
        ctx.fillRect(-mw * 0.50 + beamW, my + beamW, mw - beamW * 2, boxH);

        // Painéis de vidro reflexivo
        ctx.fillStyle = isNight ? '#0284C7' : (isDusk ? '#F97316' : '#38BDF8');
        for (let g = 0; g < 7; g++) {
          const gx = -mw * 0.50 + beamW + g * ((mw - beamW * 2) / 7) + 1;
          const gw = ((mw - beamW * 2) / 7) - 2;
          ctx.fillRect(gx, my + beamW + 2, gw, boxH - 4);
        }
        break;
      }

      // -------------------------------------------------------------
      // SÃO PAULO • SP — PONTE ESTAIADA OCTÁVIO FRIAS DE OLIVEIRA
      // -------------------------------------------------------------
      case 'estaiada':
      case 'ponte_estaiada': {
        const th = size * 3.40;
        const tw = size * 1.50;
        const ty = -th;

        // Pylon em formato de "X" gigante
        ctx.strokeStyle = isNight ? '#475569' : '#CBD5E1';
        ctx.lineWidth = Math.max(1.5, size * 0.08);
        ctx.beginPath();
        // Perna esquerda subindo até o topo direito
        ctx.moveTo(-tw * 0.50, 0);
        ctx.lineTo(tw * 0.35, ty);
        // Perna direita subindo até o topo esquerdo
        ctx.moveTo(tw * 0.50, 0);
        ctx.lineTo(-tw * 0.35, ty);
        ctx.stroke();

        // Travessa horizontal central de cruzamento
        ctx.fillStyle = isNight ? '#64748B' : '#E2E8F0';
        ctx.fillRect(-tw * 0.25, ty + th * 0.45, tw * 0.50, size * 0.12);

        // Cabos estaiados luminosos (LED azul / ciano / neon à noite)
        ctx.strokeStyle = isNight ? 'rgba(56, 189, 248, 0.75)' : 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = Math.max(0.6, size * 0.015);
        ctx.beginPath();
        for (let c = 1; c <= 6; c++) {
          const cy = ty + th * 0.15 + c * (th * 0.07);
          const spread = tw * 0.15 + c * (tw * 0.07);
          ctx.moveTo(0, cy);
          ctx.lineTo(-spread, 0);
          ctx.moveTo(0, cy);
          ctx.lineTo(spread, 0);
        }
        ctx.stroke();
        break;
      }

      // -------------------------------------------------------------
      // RIO DE JANEIRO • RJ — CRISTO REDENTOR
      // -------------------------------------------------------------
      case 'cristo_redentor': {
        const pw = size * 0.70;
        const ph = size * 0.90;
        const sw = size * 1.90;
        const sh = size * 2.30;
        const totalH = ph + sh;
        const ty = -totalH;

        // Pedestal de Pedra Sabão / Granito
        ctx.fillStyle = isNight ? '#1E293B' : (isDusk ? '#4B4237' : '#94A3B8');
        ctx.fillRect(-pw * 0.50, -ph, pw, ph);
        // Detalhes do pedestal
        ctx.fillStyle = isNight ? '#334155' : (isDusk ? '#62584A' : '#CBD5E1');
        ctx.fillRect(-pw * 0.40, -ph + size * 0.10, pw * 0.80, ph - size * 0.10);

        // Corpo e Manto da Estátua (Túnica)
        ctx.fillStyle = isNight ? '#94A3B8' : (isDusk ? '#FED7AA' : '#F1F5F9');
        ctx.beginPath();
        ctx.moveTo(-size * 0.28, -ph);
        ctx.lineTo(-size * 0.18, ty + size * 0.35);
        ctx.lineTo(size * 0.18, ty + size * 0.35);
        ctx.lineTo(size * 0.28, -ph);
        ctx.closePath();
        ctx.fill();

        // Braços Abertos em Cruz (1.9x de envergadura)
        ctx.fillStyle = isNight ? '#E2E8F0' : (isDusk ? '#FFEDD5' : '#FFFFFF');
        ctx.fillRect(-sw * 0.50, ty + size * 0.35, sw, size * 0.16);

        // Cabeça com auréola suave
        ctx.beginPath();
        ctx.arc(0, ty + size * 0.20, size * 0.14, 0, Math.PI * 2);
        ctx.fill();

        // Holofotes de iluminação cenográfica à noite (Verde e Amarelo ou Branco)
        if (isNight) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.beginPath();
          ctx.arc(0, ty + sh * 0.5, size * 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      // -------------------------------------------------------------
      // RIO DE JANEIRO • RJ — ARCOS DA LAPA
      // -------------------------------------------------------------
      case 'arcos_lapa': {
        const aw = size * 2.80;
        const ah = size * 1.50;
        const ay = -ah;
        const numArcs = 5;
        const arcW = aw / numArcs;

        // Estrutura Branca Monumental do Aqueduto
        ctx.fillStyle = isNight ? '#334155' : (isDusk ? '#E2D9D0' : '#F8FAFC');
        ctx.fillRect(-aw * 0.50, ay, aw, ah);

        // Recorte dos Arcos Romanos
        ctx.fillStyle = isNight ? 'rgba(8, 12, 22, 0.95)' : 'rgba(20, 30, 45, 0.35)';
        for (let i = 0; i < numArcs; i++) {
          const ax = -aw * 0.50 + i * arcW + arcW * 0.50;
          // Arco inferior
          ctx.beginPath();
          ctx.arc(ax, ay + ah * 0.70, arcW * 0.36, Math.PI, 0, false);
          ctx.rect(ax - arcW * 0.36, ay + ah * 0.70, arcW * 0.72, ah * 0.30);
          ctx.fill();
        }

        // Bonde Amarelo de Santa Teresa passando por cima dos arcos
        ctx.fillStyle = '#EAB308';
        ctx.fillRect(-size * 0.45, ay - size * 0.16, size * 0.90, size * 0.14);
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(-size * 0.40, ay - size * 0.12, size * 0.80, size * 0.06);
        break;
      }

      // -------------------------------------------------------------
      // BRASÍLIA • DF — CONGRESSO NACIONAL
      // -------------------------------------------------------------
      case 'congresso_nacional': {
        const bw = size * 2.90;
        const bh = size * 0.32;
        const tw = size * 0.36;
        const th = size * 2.40;
        const ty = -th;

        // Base Horizontal de Mármore Branco (Planalto Central)
        ctx.fillStyle = isNight ? '#1E293B' : (isDusk ? '#785A48' : '#F1F5F9');
        ctx.fillRect(-bw * 0.50, -bh, bw, bh);

        // Torres Gêmeas dos Gabinetes (H)
        ctx.fillStyle = isNight ? '#334155' : (isDusk ? '#9A7864' : '#E2E8F0');
        // Torre 1
        ctx.fillRect(-tw * 1.10, ty, tw, th - bh);
        // Torre 2
        ctx.fillRect(tw * 0.10, ty, tw, th - bh);
        // Passarela de ligação entre as torres
        ctx.fillStyle = isNight ? '#0284C7' : '#0369A1';
        ctx.fillRect(-tw * 1.10, ty + th * 0.45, tw * 2.20, size * 0.16);

        // Cúpula do Senado (Côncava / Tigela Virada para Baixo)
        ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-bw * 0.30, -bh, size * 0.36, Math.PI, 0, false);
        ctx.fill();

        // Cúpula da Câmara dos Deputados (Convexa / Prato Aberto para o Céu)
        ctx.beginPath();
        ctx.arc(bw * 0.30, -bh - size * 0.05, size * 0.42, 0, Math.PI, false);
        ctx.fill();
        break;
      }

      // -------------------------------------------------------------
      // BRASÍLIA • DF — CATEDRAL METROPOLITANA
      // -------------------------------------------------------------
      case 'catedral_brasilia': {
        const cw = size * 2.10;
        const ch = size * 1.90;
        const cy = -ch;

        // Vitrais em tons de Azul, Turquesa e Verde (Marianne Peretti)
        const vitralGrad = ctx.createLinearGradient(-cw * 0.50, cy, cw * 0.50, 0);
        vitralGrad.addColorStop(0, '#0284C7');
        vitralGrad.addColorStop(0.5, '#10B981');
        vitralGrad.addColorStop(1, '#0284C7');
        ctx.fillStyle = vitralGrad;
        ctx.beginPath();
        ctx.moveTo(0, cy + size * 0.2);
        ctx.lineTo(-cw * 0.45, 0);
        ctx.lineTo(cw * 0.45, 0);
        ctx.closePath();
        ctx.fill();

        // 16 Pilares Curvos de Concreto Branco que se elevam como coroa de espinhos
        ctx.strokeStyle = isNight ? '#94A3B8' : '#FFFFFF';
        ctx.lineWidth = Math.max(1.2, size * 0.06);
        for (let p = -5; p <= 5; p++) {
          const px = p * (cw * 0.09);
          ctx.beginPath();
          ctx.moveTo(px, 0);
          ctx.quadraticCurveTo(px * 0.3, cy + ch * 0.5, px * 0.15, cy);
          ctx.stroke();
        }

        // Cruz do topo
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(-size * 0.03, cy - size * 0.25, size * 0.06, size * 0.25);
        ctx.fillRect(-size * 0.08, cy - size * 0.18, size * 0.16, size * 0.05);
        break;
      }

      // -------------------------------------------------------------
      // MANAUS • AM — TEATRO AMAZONAS
      // -------------------------------------------------------------
      case 'teatro_amazonas': {
        const tw = size * 2.40;
        const th = size * 1.80;
        const ty = -th;

        // Fachada Rosa / Ocre Clássica da Belle Époque
        ctx.fillStyle = isNight ? '#4C1D38' : (isDusk ? '#831843' : '#DB2777');
        ctx.fillRect(-tw * 0.50, -th * 0.55, tw, th * 0.55);

        // Frontão Neoclássico
        ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(-tw * 0.40, -th * 0.55);
        ctx.lineTo(0, -th * 0.75);
        ctx.lineTo(tw * 0.40, -th * 0.55);
        ctx.closePath();
        ctx.fill();

        // Cúpula Icônica com Mosaico nas Cores do Brasil (Verde, Amarelo e Azul)
        const domeR = size * 0.55;
        const domeX = 0;
        const domeY = -th * 0.75;
        ctx.beginPath();
        ctx.arc(domeX, domeY, domeR, Math.PI, 0, false);
        ctx.fillStyle = '#FEDD00'; // Amarelo Ouro
        ctx.fill();

        // Faixas verdes e azuis do mosaico da cúpula
        ctx.strokeStyle = '#009739'; // Verde
        ctx.lineWidth = Math.max(1, size * 0.04);
        ctx.beginPath();
        ctx.arc(domeX, domeY, domeR * 0.75, Math.PI, 0, false);
        ctx.stroke();
        ctx.strokeStyle = '#124DA6'; // Azul
        ctx.beginPath();
        ctx.arc(domeX, domeY, domeR * 0.45, Math.PI, 0, false);
        ctx.stroke();

        // Lanterna do topo da cúpula
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(-size * 0.05, domeY - domeR - size * 0.20, size * 0.10, size * 0.20);
        break;
      }

      // -------------------------------------------------------------
      // CURITIBA • PR — ESTUFA DO JARDIM BOTÂNICO
      // -------------------------------------------------------------
      case 'jardim_botanico':
      case 'estufa_curitiba': {
        const jw = size * 2.50;
        const jh = size * 1.55;
        const jy = -jh;

        // Estrutura Metálica Branca Art Nouveau com Vidro Esmeralda
        ctx.fillStyle = isNight ? 'rgba(16, 185, 129, 0.45)' : 'rgba(52, 211, 153, 0.65)';
        ctx.fillRect(-jw * 0.50, -jh * 0.45, jw, jh * 0.45);

        // 3 Cúpulas de Vidro Arredondadas
        const drawDome = (dx, dw, dh) => {
          ctx.beginPath();
          ctx.ellipse(dx, -jh * 0.45, dw * 0.5, dh, 0, Math.PI, 0, false);
          ctx.fillStyle = isNight ? 'rgba(6, 78, 59, 0.75)' : 'rgba(16, 185, 129, 0.55)';
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = Math.max(0.8, size * 0.025);
          ctx.stroke();
        };

        // Cúpula Central (Maior)
        drawDome(0, jw * 0.40, jh * 0.55);
        // Cúpula Esquerda
        drawDome(-jw * 0.32, jw * 0.28, jh * 0.42);
        // Cúpula Direita
        drawDome(jw * 0.32, jw * 0.28, jh * 0.42);

        // Jardins Geométricos Franceses na frente
        ctx.fillStyle = '#15803D';
        ctx.fillRect(-jw * 0.50, 0, jw, size * 0.06);
        break;
      }

      // -------------------------------------------------------------
      // CURITIBA • PR — MUSEU OSCAR NIEMEYER (O OLHO)
      // -------------------------------------------------------------
      case 'museu_olho': {
        const mw = size * 2.30;
        const mh = size * 1.60;
        const my = -mh;

        // Pilar Torre Central Amarelo Ouro
        ctx.fillStyle = isNight ? '#CA8A04' : '#EAB308';
        ctx.fillRect(-size * 0.28, -mh * 0.55, size * 0.56, mh * 0.55);

        // Volume do "Olho" Superior com Vidros Pretos e Brancos
        ctx.fillStyle = isNight ? '#0F172A' : '#1E293B';
        ctx.beginPath();
        ctx.ellipse(0, my + mh * 0.32, mw * 0.50, mh * 0.32, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = Math.max(1, size * 0.035);
        ctx.stroke();

        // Pupila de Vidro
        ctx.fillStyle = isNight ? '#38BDF8' : '#0284C7';
        ctx.beginPath();
        ctx.arc(0, my + mh * 0.32, size * 0.22, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // -------------------------------------------------------------
      // PORTO ALEGRE • RS — USINA DO GASÔMETRO
      // -------------------------------------------------------------
      case 'usina_gasometro': {
        const uw = size * 1.60;
        const uh = size * 1.10;
        const chW = size * 0.24;
        const chH = size * 2.90;
        const cy = -chH;

        // Prédio Histórico de Tijolos Vermelhos
        ctx.fillStyle = isNight ? '#451A03' : '#78350F';
        ctx.fillRect(-uw * 0.50, -uh, uw, uh);

        // Chaminé Alta de 117 Metros à direita
        const chimX = uw * 0.25;
        ctx.fillStyle = isNight ? '#52525B' : '#71717A';
        ctx.fillRect(chimX - chW * 0.50, cy, chW, chH);

        // Anéis e faixas brancas no topo da chaminé
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(chimX - chW * 0.50, cy, chW, size * 0.12);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(chimX - chW * 0.50, cy + size * 0.12, chW, size * 0.12);

        // Luz de alerta no topo piscando
        ctx.fillStyle = (Math.floor(performance.now() / 300) % 2 === 0) ? '#EF4444' : '#7F1D1D';
        ctx.fillRect(chimX - size * 0.04, cy - size * 0.08, size * 0.08, size * 0.08);
        break;
      }

      // -------------------------------------------------------------
      // PORTO ALEGRE • RS — ESTÁTUA DO LAÇADOR
      // -------------------------------------------------------------
      case 'lacador':
      case 'estatua_lacador': {
        const pw = size * 0.75;
        const ph = size * 0.85;
        const sh = size * 1.90;
        const ty = -(ph + sh);

        // Pedestal de Granito
        ctx.fillStyle = isNight ? '#334155' : '#64748B';
        ctx.fillRect(-pw * 0.50, -ph, pw, ph);

        // Estátua de Bronze do Gaúcho Tradicional
        ctx.fillStyle = isNight ? '#1E293B' : '#475569';
        // Corpo e Bombacha
        ctx.fillRect(-size * 0.22, ty + size * 0.40, size * 0.44, sh - size * 0.40);
        // Poncho sobre os ombros
        ctx.fillRect(-size * 0.32, ty + size * 0.40, size * 0.64, size * 0.55);
        // Chapéu de aba larga
        ctx.beginPath();
        ctx.ellipse(0, ty + size * 0.18, size * 0.30, size * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
        // Cabeça
        ctx.beginPath();
        ctx.arc(0, ty + size * 0.22, size * 0.14, 0, Math.PI * 2);
        ctx.fill();
        // Laço erguido na mão
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = Math.max(0.8, size * 0.025);
        ctx.beginPath();
        ctx.arc(size * 0.32, ty + size * 0.15, size * 0.24, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      // -------------------------------------------------------------
      // FLORIANÓPOLIS • SC — PONTE HERCÍLIO LUZ
      // -------------------------------------------------------------
      case 'ponte_hercilio_luz': {
        const hw = size * 2.80;
        const hh = size * 2.60;
        const hy = -hh;
        const t1 = -hw * 0.32;
        const t2 = hw * 0.32;

        // Duas Torres Treliçadas Metálicas
        const drawHercilioTower = (tx) => {
          ctx.fillStyle = isNight ? '#0F172A' : '#334155';
          ctx.fillRect(tx - size * 0.12, hy, size * 0.24, hh);
          // Treliças diagonais
          ctx.strokeStyle = isNight ? '#38BDF8' : '#CBD5E1';
          ctx.lineWidth = Math.max(0.6, size * 0.015);
          for (let k = 0; k < 5; k++) {
            const ky = hy + k * (hh * 0.18);
            ctx.beginPath();
            ctx.moveTo(tx - size * 0.12, ky);
            ctx.lineTo(tx + size * 0.12, ky + hh * 0.18);
            ctx.stroke();
          }
        };
        drawHercilioTower(t1);
        drawHercilioTower(t2);

        // Cabos de Olhal da Ponte Pênsil
        ctx.strokeStyle = isNight ? '#38BDF8' : '#64748B';
        ctx.lineWidth = Math.max(1, size * 0.03);
        ctx.beginPath();
        ctx.moveTo(-hw * 0.50, -hh * 0.35);
        ctx.lineTo(t1, hy);
        ctx.quadraticCurveTo(0, -hh * 0.40, t2, hy);
        ctx.lineTo(hw * 0.50, -hh * 0.35);
        ctx.stroke();

        // Pista de tráfego iluminada
        ctx.fillStyle = isNight ? '#FDE047' : '#E2E8F0';
        ctx.fillRect(-hw * 0.50, -hh * 0.35, hw, size * 0.08);
        break;
      }

      // -------------------------------------------------------------
      // RECIFE • PE — MARCO ZERO & PARQUE DE ESCULTURAS
      // -------------------------------------------------------------
      case 'marco_zero':
      case 'marco_zero_recife': {
        const mw = size * 1.80;
        const th = size * 2.70;
        const ty = -th;

        // Praça Rosa dos Ventos no solo
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.ellipse(0, 0, mw * 0.50, size * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Coluna de Cristal de Francisco Brennand
        ctx.fillStyle = isNight ? '#0284C7' : (isDusk ? '#F97316' : '#E0F2FE');
        ctx.fillRect(-size * 0.14, ty, size * 0.28, th);
        ctx.strokeStyle = isNight ? '#38BDF8' : '#0284C7';
        ctx.lineWidth = Math.max(0.8, size * 0.02);
        ctx.strokeRect(-size * 0.14, ty, size * 0.28, th);

        // Escultura da Flor de Cristal no Topo
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(0, ty, size * 0.25, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // -------------------------------------------------------------
      // BELO HORIZONTE • MG — IGREJA DA PAMPULHA
      // -------------------------------------------------------------
      case 'igreja_pampulha': {
        const iw = size * 2.30;
        const ih = size * 1.45;
        const iy = -ih;

        // Abóbada Parabólica de Concreto (Niemeyer)
        ctx.fillStyle = isNight ? '#1E293B' : '#E2E8F0';
        ctx.beginPath();
        ctx.ellipse(-iw * 0.15, 0, iw * 0.40, ih, 0, Math.PI, 0, false);
        ctx.fill();

        // Mural de Azulejos Azuis de Candido Portinari
        ctx.fillStyle = '#0284C7';
        ctx.fillRect(-iw * 0.45, -ih * 0.50, iw * 0.60, ih * 0.50);

        // Torre Sineira Separada com sino
        ctx.fillStyle = isNight ? '#334155' : '#FFFFFF';
        ctx.fillRect(iw * 0.30, iy, size * 0.22, ih);
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(iw * 0.41, iy + size * 0.25, size * 0.08, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // -------------------------------------------------------------
      // VITÓRIA • ES — CONVENTO DA PENHA & TERCEIRA PONTE
      // -------------------------------------------------------------
      case 'convento_penha': {
        const cw = size * 2.20;
        const ch = size * 2.40;
        const cy = -ch;

        // Rochedo Maciço de Granito sobre o Mar
        ctx.fillStyle = isNight ? '#1F2937' : (isDusk ? '#4B3F35' : '#64748B');
        ctx.beginPath();
        ctx.moveTo(-cw * 0.50, 0);
        ctx.lineTo(-cw * 0.35, cy + ch * 0.35);
        ctx.lineTo(cw * 0.35, cy + ch * 0.35);
        ctx.lineTo(cw * 0.50, 0);
        ctx.closePath();
        ctx.fill();

        // Convento Colonial Branco no Topo do Penhasco
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-size * 0.45, cy, size * 0.90, ch * 0.35);
        // Telhado Cerâmico Colonial Vermelho
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.moveTo(-size * 0.52, cy);
        ctx.lineTo(0, cy - size * 0.22);
        ctx.lineTo(size * 0.52, cy);
        ctx.closePath();
        ctx.fill();
        // Cruz no topo
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(-size * 0.02, cy - size * 0.35, size * 0.04, size * 0.15);
        ctx.fillRect(-size * 0.06, cy - size * 0.30, size * 0.12, size * 0.04);
        break;
      }

      // -------------------------------------------------------------
      // FORTALEZA • CE — DRAGÃO DO MAR & JANGADAS
      // -------------------------------------------------------------
      case 'dragao_do_mar': {
        const dw = size * 2.40;
        const dh = size * 1.50;
        const dy = -dh;

        // Passarela Suspensa Vermelha Metálica
        ctx.fillStyle = isNight ? '#991B1B' : '#EF4444';
        ctx.fillRect(-dw * 0.50, dy + dh * 0.40, dw, size * 0.18);

        // Esfera Geodésica Branca do Planetário
        ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
        ctx.beginPath();
        ctx.arc(dw * 0.25, dy + dh * 0.35, size * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = Math.max(0.8, size * 0.02);
        ctx.stroke();
        break;
      }

      // -------------------------------------------------------------
      // NATAL • RN — FORTE DOS REIS MAGOS
      // -------------------------------------------------------------
      case 'forte_reis_magos': {
        const fw = size * 2.40;
        const fh = size * 0.85;

        // Muralha Estrelada de Pedra no Recife do Mar
        ctx.fillStyle = isNight ? '#1E293B' : '#78716C';
        ctx.beginPath();
        // Formato em estrela com 5 pontas
        for (let i = 0; i < 5; i++) {
          const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
          const r = fw * 0.50;
          const x = Math.cos(a) * r;
          const y = -fh + Math.sin(a) * (fh * 0.35);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        // Capela interna branca com telhado cerâmico
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-size * 0.25, -fh - size * 0.25, size * 0.50, size * 0.25);
        ctx.fillStyle = '#EA580C';
        ctx.fillRect(-size * 0.28, -fh - size * 0.32, size * 0.56, size * 0.08);
        break;
      }

      // -------------------------------------------------------------
      // BELÉM • PA — MERCADO VER-O-PESO
      // -------------------------------------------------------------
      case 'ver_o_peso': {
        const vw = size * 2.20;
        const vh = size * 1.70;
        const vy = -vh;

        // Estrutura de Ferro Gótico Belga
        ctx.fillStyle = isNight ? '#1E293B' : '#334155';
        ctx.fillRect(-vw * 0.40, vy + vh * 0.35, vw * 0.80, vh * 0.65);

        // 4 Torres Octogonais de Zinco com Agulhas Góticas
        const drawVerTower = (tx) => {
          ctx.fillStyle = isNight ? '#38BDF8' : '#0284C7';
          ctx.fillRect(tx - size * 0.14, vy + vh * 0.20, size * 0.28, vh * 0.80);
          // Agulha cônica do topo
          ctx.beginPath();
          ctx.moveTo(tx - size * 0.16, vy + vh * 0.20);
          ctx.lineTo(tx, vy);
          ctx.lineTo(tx + size * 0.16, vy + vh * 0.20);
          ctx.closePath();
          ctx.fill();
        };
        drawVerTower(-vw * 0.40);
        drawVerTower(vw * 0.40);
        break;
      }

      // -------------------------------------------------------------
      // PORTO VELHO • RO — AS TRÊS CAIXAS D'ÁGUA (TRÊS MARIAS)
      // -------------------------------------------------------------
      case 'tres_caixas_dagua': {
        const bw = size * 2.30;
        const bh = size * 2.10;
        const by = -bh;

        // Três Caixas Cilíndricas sobre tripés de aço
        for (let i = -1; i <= 1; i++) {
          const cx = i * (bw * 0.36);
          // Tripé de aço
          ctx.strokeStyle = isNight ? '#475569' : '#1E293B';
          ctx.lineWidth = Math.max(1, size * 0.035);
          ctx.beginPath();
          ctx.moveTo(cx - size * 0.18, 0);
          ctx.lineTo(cx, by + bh * 0.40);
          ctx.moveTo(cx + size * 0.18, 0);
          ctx.lineTo(cx, by + bh * 0.40);
          ctx.stroke();

          // Tambor Metálico Preto / Ferro
          ctx.fillStyle = isNight ? '#0F172A' : '#334155';
          ctx.fillRect(cx - size * 0.22, by, size * 0.44, bh * 0.42);
          // Telhado Cônico da Caixa
          ctx.beginPath();
          ctx.moveTo(cx - size * 0.24, by);
          ctx.lineTo(cx, by - size * 0.18);
          ctx.lineTo(cx + size * 0.24, by);
          ctx.closePath();
          ctx.fill();
        }
        break;
      }

      // -------------------------------------------------------------
      // MACAPÁ • AP — MARCO ZERO DO EQUADOR & FORTALEZA DE SÃO JOSÉ
      // -------------------------------------------------------------
      case 'marco_zero_equador': {
        const mw = size * 1.60;
        const mh = size * 2.80;
        const my = -mh;

        // Monólito em forma de Relógio de Sol de 30 metros
        ctx.fillStyle = isNight ? '#1E293B' : '#E2E8F0';
        ctx.fillRect(-size * 0.18, my, size * 0.36, mh);

        // Círculo vazado no topo por onde o sol do equinócio passa
        ctx.fillStyle = isNight ? '#FDE047' : '#FED7AA';
        ctx.beginPath();
        ctx.arc(0, my + size * 0.35, size * 0.16, 0, Math.PI * 2);
        ctx.fill();

        // Faixa Amarela no Asfalto marcando a LINHA DO EQUADOR (0° 00' 00")
        ctx.fillStyle = '#FEDD00';
        ctx.fillRect(-mw * 0.70, -size * 0.06, mw * 1.40, size * 0.06);

        if (size > 14) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `bold ${Math.max(4, Math.floor(size * 0.11))}px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText('LINHA DO EQUADOR 0°', 0, -size * 0.10);
        }
        break;
      }

      // -------------------------------------------------------------
      // CAMPO GRANDE • MS — MONUMENTO DAS ARARAS
      // -------------------------------------------------------------
      case 'monumento_araras': {
        const aw = size * 2.20;
        const ah = size * 2.10;
        const ay = -ah;

        // Pedestal de Pedra / Terra Vermelha
        ctx.fillStyle = isNight ? '#451A03' : '#9A3412';
        ctx.fillRect(-size * 0.40, -size * 0.45, size * 0.80, size * 0.45);

        // Arara Azul em Voo (Asas Abertas)
        ctx.fillStyle = '#0284C7';
        ctx.beginPath();
        ctx.moveTo(0, ay + size * 0.40);
        ctx.lineTo(-aw * 0.45, ay);
        ctx.lineTo(-size * 0.10, ay + size * 0.60);
        ctx.closePath();
        ctx.fill();

        // Arara Vermelha / Canindé ao lado
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.moveTo(0, ay + size * 0.40);
        ctx.lineTo(aw * 0.45, ay);
        ctx.lineTo(size * 0.10, ay + size * 0.60);
        ctx.closePath();
        ctx.fill();
        break;
      }

      // -------------------------------------------------------------
      // GOIÂNIA • GO — MONUMENTO ÀS TRÊS RAÇAS
      // -------------------------------------------------------------
      case 'tres_racas': {
        const tw = size * 1.60;
        const th = size * 2.60;
        const ty = -th;

        // Pedestal de Mármore da Praça Cívica
        ctx.fillStyle = isNight ? '#334155' : '#94A3B8';
        ctx.fillRect(-size * 0.45, -size * 0.35, size * 0.90, size * 0.35);

        // Três Figuras de Bronze erguendo o mastro da capital
        ctx.fillStyle = isNight ? '#1E293B' : '#475569';
        ctx.fillRect(-tw * 0.35, ty + th * 0.45, tw * 0.70, th * 0.45);

        // Mastro Monumental subindo ao céu
        ctx.fillStyle = isNight ? '#E2E8F0' : '#F8FAFC';
        ctx.fillRect(-size * 0.05, ty, size * 0.10, th);
        break;
      }

      // -------------------------------------------------------------
      // ARACAJU • SE — ARCOS DA ORLA DE ATALAIA & CARANGUEJO GIGANTE
      // -------------------------------------------------------------
      case 'arcos_atalaia': {
        const aw = size * 2.60;
        const ah = size * 1.60;
        const ay = -ah;

        // Sequência de 4 Arcos Azuis Luminosos da Orla
        ctx.strokeStyle = isNight ? '#38BDF8' : '#0284C7';
        ctx.lineWidth = Math.max(1.2, size * 0.045);
        for (let i = 0; i < 4; i++) {
          const ax = -aw * 0.45 + i * (aw * 0.30);
          ctx.beginPath();
          ctx.ellipse(ax, 0, size * 0.28, ah, 0, Math.PI, 0, false);
          ctx.stroke();
        }

        // Escultura do Caranguejo Gigante na passarela
        ctx.fillStyle = '#EA580C';
        ctx.beginPath();
        ctx.ellipse(size * 0.45, -size * 0.25, size * 0.32, size * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // -------------------------------------------------------------
      // JOÃO PESSOA • PB — FAROL DO CABO BRANCO
      // -------------------------------------------------------------
      case 'farol_cabo_branco': {
        const fw = size * 1.20;
        const fh = size * 2.70;
        const fy = -fh;

        // Torre Triangular Branca inspirada em planta de sisal
        ctx.fillStyle = isNight ? '#94A3B8' : '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(-fw * 0.35, 0);
        ctx.lineTo(-size * 0.08, fy);
        ctx.lineTo(size * 0.08, fy);
        ctx.lineTo(fw * 0.35, 0);
        ctx.closePath();
        ctx.fill();

        // Três Faixas Negras Horizontais
        ctx.fillStyle = isNight ? '#0F172A' : '#1E293B';
        ctx.fillRect(-fw * 0.26, fy + fh * 0.30, fw * 0.52, size * 0.15);
        ctx.fillRect(-fw * 0.20, fy + fh * 0.55, fw * 0.40, size * 0.15);

        // Lanterna no ponto mais oriental das Américas
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(-size * 0.12, fy - size * 0.20, size * 0.24, size * 0.20);
        break;
      }

      // -------------------------------------------------------------
      // PALMAS • TO — PALÁCIO ARAGUAIA & PRAÇA DOS GIRASSÓIS
      // -------------------------------------------------------------
      case 'palacio_araguaia': {
        const pw = size * 2.80;
        const ph = size * 1.60;
        const py = -ph;

        // Palácio Neoclássico com colunata no centro da maior praça da América Latina
        ctx.fillStyle = isNight ? '#1E293B' : '#F8FAFC';
        ctx.fillRect(-pw * 0.50, -ph * 0.65, pw, ph * 0.65);

        // Colunata branca
        ctx.fillStyle = isNight ? '#64748B' : '#E2E8F0';
        for (let c = -5; c <= 5; c++) {
          ctx.fillRect(c * (pw * 0.08) - size * 0.03, -ph * 0.65, size * 0.06, ph * 0.65);
        }

        // Cúpula Dourada Central
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(0, py + ph * 0.35, size * 0.38, Math.PI, 0, false);
        ctx.fill();
        break;
      }

      // -------------------------------------------------------------
      // SÃO LUÍS • MA — PALÁCIO DOS LEÕES & AZULEJOS PORTUGUESES
      // -------------------------------------------------------------
      case 'palacio_leoes': {
        const lw = size * 2.50;
        const lh = size * 1.50;
        const ly = -lh;

        // Fachada Colonial Amarela com Molduras Brancas
        ctx.fillStyle = isNight ? '#78350F' : (isDusk ? '#B45309' : '#FBBF24');
        ctx.fillRect(-lw * 0.50, ly, lw, lh);

        // Muros de Azulejos Portugueses Azuis na Base
        ctx.fillStyle = '#0284C7';
        ctx.fillRect(-lw * 0.50, -lh * 0.25, lw, lh * 0.25);

        // Sacadas de ferro fundido e estátuas dos leões
        ctx.fillStyle = isNight ? '#CBD5E1' : '#FFFFFF';
        for (let w = -3; w <= 3; w++) {
          ctx.fillRect(w * (lw * 0.13) - size * 0.04, ly + lh * 0.25, size * 0.08, lh * 0.35);
        }
        break;
      }

      // -------------------------------------------------------------
      // CUIABÁ • MT — CENTRO GEODÉSICO DA AMÉRICA DO SUL
      // -------------------------------------------------------------
      case 'centro_geodesico': {
        const ow = size * 0.70;
        const oh = size * 2.60;
        const oy = -oh;

        // Obelisco Branco de Mármore marcando o centro do continente
        ctx.fillStyle = isNight ? '#94A3B8' : '#F8FAFC';
        ctx.beginPath();
        ctx.moveTo(-ow * 0.50, 0);
        ctx.lineTo(-ow * 0.20, oy + size * 0.30);
        ctx.lineTo(0, oy);
        ctx.lineTo(ow * 0.20, oy + size * 0.30);
        ctx.lineTo(ow * 0.50, 0);
        ctx.closePath();
        ctx.fill();

        // Rosa dos Ventos dourada
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(0, oy + oh * 0.45, size * 0.16, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // -------------------------------------------------------------
      // RIO BRANCO • AC — PALÁCIO RIO BRANCO
      // -------------------------------------------------------------
      case 'palacio_rio_branco': {
        const rw = size * 2.50;
        const rh = size * 1.65;
        const ry = -rh;

        // Fachada Neoclássica Branca
        ctx.fillStyle = isNight ? '#1E293B' : '#F8FAFC';
        ctx.fillRect(-rw * 0.45, -rh * 0.65, rw * 0.90, rh * 0.65);

        // Frontão com brasão do Estado do Acre
        ctx.fillStyle = isNight ? '#334155' : '#E2E8F0';
        ctx.beginPath();
        ctx.moveTo(-rw * 0.35, -rh * 0.65);
        ctx.lineTo(0, ry);
        ctx.lineTo(rw * 0.35, -rh * 0.65);
        ctx.closePath();
        ctx.fill();

        // Estrela Vermelha da Revolução Acreana
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.arc(0, ry + rh * 0.22, size * 0.12, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // -------------------------------------------------------------
      // BOA VISTA • RR — MONUMENTO AOS PIONEIROS
      // -------------------------------------------------------------
      case 'monumento_pioneiros': {
        const pw = size * 2.20;
        const ph = size * 1.50;
        const py = -ph;

        // Painel Esculpido em Concreto e Bronze na Orla Taumanan
        ctx.fillStyle = isNight ? '#1E293B' : '#78716C';
        ctx.fillRect(-pw * 0.50, py, pw, ph);

        // Relevo das figuras dos povos indígenas e pioneiros
        ctx.fillStyle = isNight ? '#CA8A04' : '#F59E0B';
        ctx.fillRect(-pw * 0.40, py + ph * 0.25, pw * 0.80, ph * 0.60);
        break;
      }

      // -------------------------------------------------------------
      // PELOURINHO • SALVADOR / MARANHÃO (CASARIO COLONIAL COLORIDO)
      // -------------------------------------------------------------
      case 'pelourinho': {
        const bw = size * 2.20;
        const bh = size * 1.80;
        const by = -bh;

        // Três sobrados coloniais geminados em cores pastéis históricas
        const cols = isNight 
          ? ['#7C2D12', '#1E3A8A', '#78350F']
          : (isDusk ? ['#EA580C', '#2563EB', '#D97706'] : ['#F97316', '#3B82F6', '#F59E0B']);
        const roofCol = isNight ? '#451A03' : (isDusk ? '#7C2D12' : '#9A3412');
        const houseW = bw / 3;

        for (let h = 0; h < 3; h++) {
          const hx = -bw * 0.50 + h * houseW;
          ctx.fillStyle = cols[h];
          ctx.fillRect(hx, by + bh * 0.20, houseW, bh * 0.80);

          // Telhado colonial em duas águas
          ctx.fillStyle = roofCol;
          ctx.beginPath();
          ctx.moveTo(hx - 2, by + bh * 0.20);
          ctx.lineTo(hx + houseW * 0.50, by);
          ctx.lineTo(hx + houseW + 2, by + bh * 0.20);
          ctx.closePath();
          ctx.fill();

          // Janelas de guilhotina coloniais com molduras brancas
          ctx.fillStyle = isNight ? '#FDE047' : '#FFFFFF';
          for (let f = 0; f < 2; f++) {
            const jx = hx + houseW * (0.22 + f * 0.44);
            ctx.fillRect(jx - 3, by + bh * 0.35, 6, 8);
            ctx.fillRect(jx - 3, by + bh * 0.60, 6, 8);
          }
        }
        break;
      }

      // -------------------------------------------------------------
      // MERCADO MODELO • SALVADOR • BA (PRÉDIO HISTÓRICO DA ALFÂNDEGA)
      // -------------------------------------------------------------
      case 'mercado_modelo': {
        const mw = size * 2.10;
        const mh = size * 1.30;
        const my = -mh;

        // Corpo neoclássico amarelo ocre
        ctx.fillStyle = isNight ? '#78350F' : (isDusk ? '#D97706' : '#F59E0B');
        ctx.fillRect(-mw * 0.50, my + mh * 0.30, mw, mh * 0.70);

        // Frontão triangular clássico
        ctx.fillStyle = isNight ? '#451A03' : (isDusk ? '#92400E' : '#B45309');
        ctx.beginPath();
        ctx.moveTo(-mw * 0.52, my + mh * 0.30);
        ctx.lineTo(0, my);
        ctx.lineTo(mw * 0.52, my + mh * 0.30);
        ctx.closePath();
        ctx.fill();

        // Cúpula central azul
        ctx.fillStyle = isNight ? '#1E3A8A' : '#0284C7';
        ctx.beginPath();
        ctx.arc(0, my, size * 0.28, Math.PI, 0);
        ctx.fill();

        // Arcadas coloniais da base
        ctx.fillStyle = isNight ? '#1E293B' : '#334155';
        for (let a = -mw * 0.38; a <= mw * 0.38; a += mw * 0.19) {
          ctx.fillRect(a - 4, my + mh * 0.70, 8, mh * 0.30);
        }
        break;
      }

      // -------------------------------------------------------------
      // CALÇADÃO DE COPACABANA • RIO DE JANEIRO (ONDAS & QUIOSQUES)
      // -------------------------------------------------------------
      case 'calcadao_copacabana': {
        const cw = size * 2.40;
        const ch = size * 0.40;
        const cy = -ch;

        // Faixa de calçamento em pedra portuguesa (ondas pretas e brancas)
        ctx.fillStyle = isNight ? '#334155' : '#E2E8F0';
        ctx.fillRect(-cw * 0.50, cy, cw, ch);

        ctx.fillStyle = isNight ? '#0F172A' : '#1E293B';
        ctx.beginPath();
        for (let o = -cw * 0.50; o <= cw * 0.50; o += cw * 0.20) {
          ctx.quadraticCurveTo(o + cw * 0.05, cy - ch * 0.25, o + cw * 0.10, cy);
          ctx.quadraticCurveTo(o + cw * 0.15, cy + ch * 0.25, o + cw * 0.20, cy);
        }
        ctx.lineTo(cw * 0.50, 0);
        ctx.lineTo(-cw * 0.50, 0);
        ctx.closePath();
        ctx.fill();

        // Quiosque de praia com guarda-sol listrado
        const kx = size * 0.45;
        ctx.fillStyle = '#EA580C';
        ctx.fillRect(kx - 6, -size * 0.75, 12, size * 0.45);
        // Guarda-sol
        ctx.fillStyle = '#FACC15';
        ctx.beginPath();
        ctx.arc(kx, -size * 0.75, size * 0.32, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.arc(kx, -size * 0.75, size * 0.32, Math.PI * 1.3, Math.PI * 1.7);
        ctx.lineTo(kx, -size * 0.75);
        ctx.fill();
        break;
      }

      // -------------------------------------------------------------
      // ESTÁDIO DO MARACANÃ • RIO DE JANEIRO
      // -------------------------------------------------------------
      case 'maracana': {
        const mw = size * 2.60;
        const mh = size * 1.10;
        const my = -mh;

        // Estrutura oval monumental
        ctx.fillStyle = isNight ? '#1E293B' : '#64748B';
        ctx.fillRect(-mw * 0.50, my + mh * 0.25, mw, mh * 0.75);

        // Colunas e pilotis
        ctx.fillStyle = isNight ? '#334155' : '#94A3B8';
        for (let col = -mw * 0.45; col <= mw * 0.45; col += mw * 0.12) {
          ctx.fillRect(col - 2, my + mh * 0.25, 4, mh * 0.75);
        }

        // Cobertura translúcida moderna
        ctx.fillStyle = isNight ? '#38BDF8' : '#BAE6FD';
        ctx.beginPath();
        ctx.ellipse(0, my + mh * 0.25, mw * 0.52, mh * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Refletores do estádio
        if (isNight) {
          ctx.fillStyle = '#FEF08A';
          ctx.beginPath();
          ctx.arc(-mw * 0.35, my, 4, 0, Math.PI * 2);
          ctx.arc(mw * 0.35, my, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      // -------------------------------------------------------------
      // PONTE JUSCELINO KUBITSCHEK (PONTE JK) • BRASÍLIA • DF
      // -------------------------------------------------------------
      case 'ponte_jk': {
        const pw = size * 2.80;
        const ph = size * 1.50;
        const py = -ph;

        // Três arcos parabólicos brancos inclinados que cruzam o lago Paranoá
        ctx.strokeStyle = isNight ? '#E2E8F0' : '#FFFFFF';
        ctx.lineWidth = Math.max(2, size * 0.06);

        // Arco 1
        ctx.beginPath();
        ctx.moveTo(-pw * 0.45, 0);
        ctx.quadraticCurveTo(-pw * 0.25, py - ph * 0.20, -pw * 0.05, 0);
        ctx.stroke();

        // Arco 2 (central)
        ctx.beginPath();
        ctx.moveTo(-pw * 0.20, 0);
        ctx.quadraticCurveTo(0, py - ph * 0.25, pw * 0.20, 0);
        ctx.stroke();

        // Arco 3
        ctx.beginPath();
        ctx.moveTo(pw * 0.05, 0);
        ctx.quadraticCurveTo(pw * 0.25, py - ph * 0.20, pw * 0.45, 0);
        ctx.stroke();

        // Pista estaiada da ponte
        ctx.fillStyle = isNight ? '#0F172A' : '#1E293B';
        ctx.fillRect(-pw * 0.50, -size * 0.16, pw, size * 0.16);

        // Iluminação noturna dos arcos
        if (isNight) {
          ctx.fillStyle = '#38BDF8';
          ctx.fillRect(-pw * 0.48, -size * 0.18, pw * 0.96, 2);
        }
        break;
      }

      // -------------------------------------------------------------
      // ESTÁDIO DO MINEIRÃO • BELO HORIZONTE • MG
      // -------------------------------------------------------------
      case 'mineirao': {
        const mw = size * 2.50;
        const mh = size * 1.20;
        const my = -mh;

        // Estrutura de concreto armado aparente de Niemeyer
        ctx.fillStyle = isNight ? '#1E293B' : '#78716C';
        ctx.fillRect(-mw * 0.50, my + mh * 0.35, mw, mh * 0.65);

        // Arcos de concreto ritmados
        ctx.fillStyle = isNight ? '#334155' : '#A8A29E';
        for (let a = -mw * 0.44; a <= mw * 0.44; a += mw * 0.11) {
          ctx.fillRect(a - 3, my + mh * 0.35, 6, mh * 0.65);
        }

        // Anel de cobertura superior
        ctx.fillStyle = isNight ? '#CBD5E1' : '#F5F5F4';
        ctx.fillRect(-mw * 0.52, my + mh * 0.25, mw * 1.04, mh * 0.12);

        // Refletores de campo de futebol
        if (isNight) {
          ctx.fillStyle = '#FEF08A';
          ctx.fillRect(-mw * 0.38, my + mh * 0.10, 8, 4);
          ctx.fillRect(mw * 0.34, my + mh * 0.10, 8, 4);
        }
        break;
      }

      // -------------------------------------------------------------
      // MANDACARU DO SERTÃO • CAATINGA / DESERTO
      // -------------------------------------------------------------
      case 'mandacaru': {
        const mw = size * 0.65;
        const mh = size * 1.80;
        const my = -mh;

        const stemCol = isNight ? '#064E3B' : (isDusk ? '#166534' : '#15803D');
        const ribCol  = isNight ? '#047857' : (isDusk ? '#22C55E' : '#4ADE80');
        ctx.fillStyle = stemCol;

        // Tronco principal do cacto
        ctx.fillRect(-mw * 0.20, my, mw * 0.40, mh);

        // Braço esquerdo arqueado para cima
        ctx.fillRect(-mw * 0.60, my + mh * 0.30, mw * 0.45, mw * 0.22);
        ctx.fillRect(-mw * 0.60, my + mh * 0.05, mw * 0.22, mh * 0.30);

        // Braço direito arqueado para cima
        ctx.fillRect(mw * 0.15, my + mh * 0.40, mw * 0.45, mw * 0.22);
        ctx.fillRect(mw * 0.40, my + mh * 0.15, mw * 0.22, mh * 0.30);

        // Nervuras claras com espinhos
        ctx.fillStyle = ribCol;
        ctx.fillRect(-2, my, 4, mh);
        ctx.fillRect(-mw * 0.55, my + mh * 0.05, 3, mh * 0.30);
        ctx.fillRect(mw * 0.45, my + mh * 0.15, 3, mh * 0.30);

        // Flor branca de mandacaru no topo
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, my, size * 0.08, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // -------------------------------------------------------------
      // ARCO NATURAL DOS CÂNYONS • CHAPADA DIAMANTINA
      // -------------------------------------------------------------
      case 'canyon_arch': {
        const aw = size * 2.80;
        const ah = size * 2.20;
        const ay = -ah;

        // Grande arco monumental de arenito vermelho
        ctx.fillStyle = isNight ? '#451A03' : (isDusk ? '#9A3412' : '#C2410C');
        ctx.beginPath();
        ctx.moveTo(-aw * 0.50, 0);
        ctx.lineTo(-aw * 0.50, ay + ah * 0.20);
        ctx.quadraticCurveTo(0, ay, aw * 0.50, ay + ah * 0.20);
        ctx.lineTo(aw * 0.50, 0);
        ctx.lineTo(aw * 0.25, 0);
        ctx.quadraticCurveTo(0, ay + ah * 0.45, -aw * 0.25, 0);
        ctx.closePath();
        ctx.fill();

        // Estratificações e fendas geológicas da rocha
        ctx.strokeStyle = isNight ? '#2A1102' : (isDusk ? '#7C2D12' : '#78350F');
        ctx.lineWidth = Math.max(1, size * 0.03);
        ctx.beginPath();
        ctx.moveTo(-aw * 0.42, ay + ah * 0.40);
        ctx.quadraticCurveTo(0, ay + ah * 0.25, aw * 0.42, ay + ah * 0.40);
        ctx.stroke();
        break;
      }

      // -------------------------------------------------------------
      // MONUMENTO AO CARANGUEJO GIGANTE • ARACAJU • SE
      // -------------------------------------------------------------
      case 'caranguejo_gigante': {
        const cw = size * 1.50;
        const ch = size * 0.85;
        const cy = -ch;

        // Pedestal de granito
        ctx.fillStyle = isNight ? '#1E293B' : '#475569';
        ctx.fillRect(-cw * 0.45, -size * 0.15, cw * 0.90, size * 0.15);

        // Carapaça azul royal e alaranjada
        ctx.fillStyle = isNight ? '#1E3A8A' : '#0284C7';
        ctx.beginPath();
        ctx.ellipse(0, cy + ch * 0.40, cw * 0.38, ch * 0.32, 0, 0, Math.PI * 2);
        ctx.fill();

        // Quelíceras / Garras dianteiras vermelhas
        ctx.fillStyle = isNight ? '#991B1B' : '#EF4444';
        ctx.beginPath();
        ctx.arc(-cw * 0.38, cy + ch * 0.20, size * 0.18, 0, Math.PI * 2);
        ctx.arc(cw * 0.38, cy + ch * 0.20, size * 0.18, 0, Math.PI * 2);
        ctx.fill();

        // Olhos saltados
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-cw * 0.12, cy + ch * 0.12, 3, 0, Math.PI * 2);
        ctx.arc(cw * 0.12, cy + ch * 0.12, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // -------------------------------------------------------------
      // CADEIRA GIGANTE DE PRAIA • MACEIÓ • AL
      // -------------------------------------------------------------
      case 'cadeira_gigante': {
        const cw = size * 1.30;
        const ch = size * 1.70;
        const cy = -ch;

        // Cadeira de praia gigante cor turquesa
        ctx.fillStyle = isNight ? '#0F766E' : '#14B8A6';

        // Pernas da cadeira
        ctx.fillRect(-cw * 0.40, -size * 0.60, size * 0.08, size * 0.60);
        ctx.fillRect(cw * 0.32, -size * 0.60, size * 0.08, size * 0.60);

        // Assento
        ctx.fillRect(-cw * 0.45, -size * 0.65, cw * 0.90, size * 0.10);

        // Encosto alto ripado
        for (let r = 0; r < 4; r++) {
          ctx.fillRect(-cw * 0.36 + r * (cw * 0.22), cy, size * 0.08, ch * 0.65);
        }
        ctx.fillRect(-cw * 0.40, cy, cw * 0.80, size * 0.09);
        break;
      }

      // -------------------------------------------------------------
      // ESTAÇÃO DAS DOCAS (GUINDASTES HISTÓRICOS) • BELÉM • PA
      // -------------------------------------------------------------
      case 'estacao_docas': {
        const gw = size * 1.80;
        const gh = size * 2.20;
        const gy = -gh;

        // Armazém de tijolos ingleses
        ctx.fillStyle = isNight ? '#78350F' : '#D97706';
        ctx.fillRect(-gw * 0.50, -size * 0.70, gw, size * 0.70);

        // Guindaste portuário de ferro preto
        ctx.fillStyle = isNight ? '#090D16' : '#1E293B';
        ctx.fillRect(gw * 0.10, gy + gh * 0.35, size * 0.22, gh * 0.65);

        // Lança treliçada do guindaste apontada para o rio
        ctx.strokeStyle = isNight ? '#1E293B' : '#334155';
        ctx.lineWidth = Math.max(1.5, size * 0.04);
        ctx.beginPath();
        ctx.moveTo(gw * 0.20, gy + gh * 0.35);
        ctx.lineTo(-gw * 0.30, gy);
        ctx.lineTo(-gw * 0.30, gy + size * 0.50);
        ctx.stroke();
        break;
      }

      // -------------------------------------------------------------
      // ENCONTRO DAS ÁGUAS (RIO NEGRO & SOLIMÕES) • MANAUS • AM
      // -------------------------------------------------------------
      case 'encontro_aguas': {
        const ew = size * 2.80;
        const eh = size * 0.50;
        const ey = -eh;

        // Duas faixas fluviais correndo lado a lado sem se misturar:
        // Lado esquerdo: Águas escuras do Rio Negro
        ctx.fillStyle = isNight ? '#050B14' : '#0B132B';
        ctx.fillRect(-ew * 0.50, ey, ew * 0.50, eh);

        // Lado direito: Águas barrentas cor de café com leite do Rio Solimões
        ctx.fillStyle = isNight ? '#451A03' : '#854D0E';
        ctx.fillRect(0, ey, ew * 0.50, eh);

        // Linha divisória nítida com ondulações
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, ey);
        ctx.lineTo(0, 0);
        ctx.stroke();
        break;
      }

      // -------------------------------------------------------------
      // BOSQUE DOS BURITIS • GOIÂNIA / CENTRO-OESTE
      // -------------------------------------------------------------
      case 'bosque_buritis': {
        const bw = size * 1.80;
        const bh = size * 2.40;
        const by = -bh;

        // Três palmeiras Buriti majestosas do Cerrado
        for (let p = 0; p < 3; p++) {
          const px = -bw * 0.40 + p * (bw * 0.40);
          const py_p = by + (p === 1 ? 0 : size * 0.30);
          
          // Estipe ereto esbelto
          ctx.fillStyle = isNight ? '#1C1917' : '#44403C';
          ctx.fillRect(px - 3, py_p, 6, -py_p);

          // Copa em leque circular exuberante
          ctx.fillStyle = isNight ? '#064E3B' : '#15803D';
          ctx.beginPath();
          ctx.arc(px, py_p, size * 0.38, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      // -------------------------------------------------------------
      // MORRO DO CARECA • NATAL • RN (GRANDE DUNA & MATA ATLÂNTICA)
      // -------------------------------------------------------------
      case 'morro_careca': {
        const dw = size * 2.90;
        const dh = size * 2.20;
        const dy = -dh;

        // Encosta coberta de restinga e mata verde
        ctx.fillStyle = isNight ? '#064E3B' : '#15803D';
        ctx.beginPath();
        ctx.moveTo(-dw * 0.50, 0);
        ctx.quadraticCurveTo(-dw * 0.15, dy, 0, dy);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        // Grande duna central de areia dourada
        ctx.fillStyle = isNight ? '#78350F' : (isDusk ? '#D97706' : '#FCD34D');
        ctx.beginPath();
        ctx.moveTo(0, dy);
        ctx.quadraticCurveTo(dw * 0.20, dy + dh * 0.30, dw * 0.50, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        break;
      }

      // -------------------------------------------------------------
      // BOSQUE DAS ARAUCÁRIAS • SERRA CATARINENSE / PARANÁ / RS
      // -------------------------------------------------------------
      case 'araucaria_grove': {
        const gw = size * 2.40;
        const gh = size * 2.30;
        const gy = -gh;

        // Trio de Pinheiros Araucária centenários com copas em taça
        for (let a = 0; a < 3; a++) {
          const ax = -gw * 0.38 + a * (gw * 0.38);
          const ay_a = gy + (a === 1 ? 0 : size * 0.25);

          // Tronco esbelto cilíndrico
          ctx.fillStyle = isNight ? '#1C1917' : '#44403C';
          ctx.fillRect(ax - 3, ay_a, 6, -ay_a);

          // Andares característicos de galhos em candelabro
          ctx.fillStyle = isNight ? '#0A2518' : '#14532D';
          ctx.beginPath();
          ctx.ellipse(ax, ay_a, size * 0.42, size * 0.14, 0, 0, Math.PI * 2);
          ctx.ellipse(ax, ay_a + size * 0.18, size * 0.32, size * 0.10, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      default:
        // Caso padrão caso não encontre
        break;
    }
  },

// =========================================================================
  // MÉTODOS AUXILIARES DE CENÁRIO (ALTA PERFORMANCE & ZERO OVERHEAD DE FRAME)
  // =========================================================================

  drawSkyline(ctx, bx, horizonY, bldgs, isNight, isDusk, nowSec) {
    for (let i = 0; i < bldgs.length; i++) {
      const b = bldgs[i];
      const x = bx + b.x;
      const y = horizonY - b.h;
      const w = b.w;
      const h = b.h;

      // Cor do corpo do edifício
      ctx.fillStyle = isNight ? (b.colN || '#0F172A') : (isDusk ? (b.colD || '#33202E') : (b.col || '#334155'));
      ctx.fillRect(x, y, w, h);

      // Antena / Mastro no topo com baliza vermelha
      if (b.spire) {
        const sx = x + w * 0.5 - 1;
        ctx.fillStyle = isNight ? '#94A3B8' : '#CBD5E1';
        ctx.fillRect(sx, y - 14, 2, 14);
        if (isNight || isDusk) {
          const blink = (Math.sin(nowSec * 5 + i * 2) > 0);
          ctx.fillStyle = blink ? '#EF4444' : '#7F1D1D';
          ctx.fillRect(sx - 0.5, y - 15, 3, 2);
        }
      }

      // Janelas reativas
      if (isNight) {
        for (let fy = y + 5; fy < horizonY - 4; fy += 7) {
          for (let fx = x + 3; fx < x + w - 3; fx += 5) {
            // ~80% das janelas acesas com variação orgânica realista
            if ((fx * 7 + fy * 13) % 5 !== 0) {
              const tint = ((fx + fy) % 7 === 0) ? '#38BDF8' : (((fx + fy) % 3 === 0) ? '#FEF08A' : '#FDE047');
              ctx.fillStyle = tint;
              ctx.fillRect(fx, fy, 2, 2.5);
            }
          }
        }
      } else if (isDusk) {
        // Tarde: janelas começando a se acender em tom âmbar e dourado suave
        for (let fy = y + 5; fy < horizonY - 4; fy += 7) {
          for (let fx = x + 3; fx < x + w - 3; fx += 5) {
            if ((fx * 7 + fy * 13) % 4 === 0) {
              ctx.fillStyle = '#FED7AA';
              ctx.fillRect(fx, fy, 2, 2.5);
            }
          }
        }
      } else {
        // Dia: vidros espelhados refletindo o céu
        ctx.fillStyle = 'rgba(224, 242, 254, 0.35)';
        for (let fy = y + 5; fy < horizonY - 4; fy += 8) {
          for (let fx = x + 3; fx < x + w - 3; fx += 6) {
            ctx.fillRect(fx, fy, 2.5, 2.5);
          }
        }
      }
    }
  },

  drawWater(ctx, bx, horizonY, waterH, isNight, isDusk, nowSec, hasBeach, beachW) {
    const wy = horizonY - waterH;
    const wGrad = ctx.createLinearGradient(0, wy, 0, horizonY);
    if (isNight) {
      wGrad.addColorStop(0, '#040C18');
      wGrad.addColorStop(0.55, '#091B30');
      wGrad.addColorStop(1, '#12304D');
    } else if (isDusk) {
      wGrad.addColorStop(0, '#3B1528');
      wGrad.addColorStop(0.45, '#7C2D36');
      wGrad.addColorStop(0.82, '#C2593F');
      wGrad.addColorStop(1, '#E07A48');
    } else {
      wGrad.addColorStop(0, '#0369A1');
      wGrad.addColorStop(0.45, '#0284C7');
      wGrad.addColorStop(0.80, '#0EA5E9');
      wGrad.addColorStop(1, '#38BDF8');
    }
    ctx.fillStyle = wGrad;
    ctx.fillRect(bx, wy, 640, waterH);

    // Linha luminosa distante no horizonte marítimo
    ctx.fillStyle = isNight
      ? 'rgba(56, 189, 248, 0.16)'
      : (isDusk ? 'rgba(253, 186, 116, 0.35)' : 'rgba(186, 230, 253, 0.45)');
    ctx.fillRect(bx, wy, 640, 1);

    // Brilhos animados de ondas na superfície (Dia, Tarde e Noite)
    const glintColor = isNight
      ? 'rgba(253, 224, 71, 0.28)'
      : (isDusk ? 'rgba(254, 215, 170, 0.38)' : 'rgba(224, 242, 254, 0.48)');
    ctx.fillStyle = glintColor;
    const rows = Math.max(3, Math.floor(waterH / 4));
    for (let r = 0; r < rows; r++) {
      const ry = wy + 2 + r * (waterH / (rows + 0.5));
      const speedDir = (r % 2 === 0) ? 1 : -1;
      const shift = Math.sin(nowSec * 2.2 + r * 1.4) * 8 * speedDir;
      const wLen = 14 + (r * 5);
      for (let x = 20; x < 620; x += 68) {
        const pulse = 0.55 + 0.45 * Math.sin(nowSec * 3.1 + x * 0.05 + r);
        ctx.globalAlpha = pulse;
        ctx.fillRect(bx + x + shift, ry, wLen, 1);
      }
    }
    ctx.globalAlpha = 1;

    // Coluna de reflexo solar/lunar cintilante na água
    const refCenter = bx + 420;
    ctx.fillStyle = isNight
      ? 'rgba(248, 250, 252, 0.22)'
      : (isDusk ? 'rgba(254, 240, 138, 0.34)' : 'rgba(255, 255, 255, 0.24)');
    for (let r = 0; r < rows; r++) {
      const ry = wy + 2 + r * (waterH / (rows + 0.5));
      const rw = 10 + r * 4 + Math.sin(nowSec * 3 + r) * 3;
      ctx.fillRect(refCenter - rw * 0.5 + Math.sin(nowSec * 2 + r) * 2, ry, rw, 1.2);
    }

    // Faixa de praia / areia litorânea com espuma animada das ondas
    if (hasBeach) {
      const bH = beachW || 3;
      ctx.fillStyle = isNight ? '#1E293B' : (isDusk ? '#B45309' : '#FDE68A');
      ctx.fillRect(bx, horizonY - bH, 640, bH);

      // Espuma branca quebrando na beira da areia
      const surfOffset = Math.sin(nowSec * 2.4) * 0.9;
      ctx.fillStyle = isNight ? 'rgba(148, 163, 184, 0.35)' : 'rgba(255, 255, 255, 0.72)';
      for (let x = 0; x < 640; x += 28) {
        const waveY = horizonY - bH - 0.8 + surfOffset + Math.sin(x * 0.12 + nowSec * 2) * 0.4;
        ctx.fillRect(bx + x, waveY, 18, 1.2);
      }
    }
  },

  drawSailboat(ctx, x, y, scale, isNight, isDusk) {
    const s = scale || 1;
    // Casco
    ctx.fillStyle = isNight ? '#1E293B' : (isDusk ? '#451A03' : '#78350F');
    ctx.beginPath();
    ctx.moveTo(x - 6 * s, y);
    ctx.lineTo(x + 6 * s, y);
    ctx.lineTo(x + 4 * s, y + 2.2 * s);
    ctx.lineTo(x - 4 * s, y + 2.2 * s);
    ctx.closePath();
    ctx.fill();
    // Vela principal
    ctx.fillStyle = isNight ? '#94A3B8' : (isDusk ? '#FED7AA' : '#FFFFFF');
    ctx.beginPath();
    ctx.moveTo(x - 0.5 * s, y - 0.5 * s);
    ctx.lineTo(x - 0.5 * s, y - 10 * s);
    ctx.lineTo(x + 5 * s, y - 1 * s);
    ctx.closePath();
    ctx.fill();
    // Vela menor
    ctx.fillStyle = isNight ? '#64748B' : (isDusk ? '#FDBA74' : '#E0F2FE');
    ctx.beginPath();
    ctx.moveTo(x - 1.2 * s, y - 0.5 * s);
    ctx.lineTo(x - 1.2 * s, y - 7.5 * s);
    ctx.lineTo(x - 5 * s, y - 1 * s);
    ctx.closePath();
    ctx.fill();
  },

  drawRiverBoat(ctx, x, y, isNight, isDusk) {
    // Barco gaiola amazônico iluminado
    ctx.fillStyle = isNight ? '#1E293B' : '#FFFFFF';
    ctx.fillRect(x - 12, y - 5, 24, 5);
    ctx.fillStyle = isNight ? '#0F172A' : '#B91C1C';
    ctx.fillRect(x - 13, y, 26, 2.5);
    // Cabines e luzes quentes
    ctx.fillStyle = isNight ? '#FDE047' : (isDusk ? '#FED7AA' : '#38BDF8');
    ctx.fillRect(x - 9, y - 4, 4, 2);
    ctx.fillRect(x - 2, y - 4, 4, 2);
    ctx.fillRect(x + 5, y - 4, 4, 2);
  },

  drawRegionalFill(ctx, bx, horizonY, trackId, isNight, isDusk, nowSec) {
    const coastalTracks = new Set([
      'salvador', 'rio_de_janeiro', 'florianopolis', 'recife', 'fortaleza',
      'vitoria', 'natal', 'maceio', 'joao_pessoa', 'sao_luis', 'aracaju', 'brasil'
    ]);
    const riverTracks = new Set([
      'manaus', 'belem', 'porto_velho', 'rio_branco', 'macapa', 'teresina', 'palmas'
    ]);

    if (coastalTracks.has(trackId)) {
      const bob1 = Math.sin(nowSec * 1.8) * 0.7;
      const bob2 = Math.cos(nowSec * 1.5) * 0.7;
      this.drawSailboat(ctx, bx + 55, horizonY - 8 + bob1, 0.85, isNight, isDusk);
      this.drawSailboat(ctx, bx + 595, horizonY - 10 + bob2, 0.75, isNight, isDusk);
      if (isNight || isDusk) {
        // Pontos de luz na orla
        ctx.fillStyle = isNight ? 'rgba(253, 224, 71, 0.65)' : 'rgba(254, 215, 170, 0.45)';
        for (let px = 30; px < 620; px += 48) {
          ctx.fillRect(bx + px, horizonY - 15, 1.5, 1.5);
        }
      }
    } else if (riverTracks.has(trackId)) {
      const bob = Math.sin(nowSec * 1.6) * 0.6;
      this.drawRiverBoat(ctx, bx + 95, horizonY - 6 + bob, isNight, isDusk);
      this.drawPalm(ctx, bx + 28, horizonY - 14, 15, isNight, isDusk);
      this.drawPalm(ctx, bx + 610, horizonY - 14, 16, isNight, isDusk);
    } else if (trackId === 'curitiba' || trackId === 'porto_alegre' || trackId === 'serra') {
      this.drawAraucaria(ctx, bx + 32, horizonY, 20, isNight, isDusk);
      this.drawAraucaria(ctx, bx + 604, horizonY, 18, isNight, isDusk);
    } else if (trackId === 'sao_paulo' || trackId === 'belo_horizonte' || trackId === 'goiania' || trackId === 'noite') {
      // Balizas vermelhas piscantes nos topos de antenas distantes
      if (isNight || isDusk) {
        const blink = Math.sin(nowSec * 3.5) > 0;
        if (blink) {
          ctx.fillStyle = '#EF4444';
          ctx.fillRect(bx + 120, horizonY - 68, 2, 2);
          ctx.fillRect(bx + 490, horizonY - 64, 2, 2);
        }
      }
    }
  },

  drawPalm(ctx, x, y, size, isNight, isDusk) {
    ctx.fillStyle = isNight ? '#0A131F' : (isDusk ? '#2A201C' : '#3E2723');
    // Tronco curvo
    ctx.beginPath();
    ctx.moveTo(x - 1, y);
    ctx.quadraticCurveTo(x + size * 0.2, y - size * 0.5, x + size * 0.35, y - size);
    ctx.lineTo(x + size * 0.35 + 1.8, y - size);
    ctx.quadraticCurveTo(x + size * 0.2 + 1.8, y - size * 0.5, x + 2, y);
    ctx.closePath();
    ctx.fill();

    // Folhagem em leque
    ctx.strokeStyle = isNight ? '#062817' : (isDusk ? '#2D3A1B' : '#15803D');
    ctx.lineWidth = 1.3;
    const hx = x + size * 0.35;
    const hy = y - size;
    const angles = [-0.9, -0.4, 0.1, 0.6, 1.1];
    for (let a of angles) {
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.quadraticCurveTo(hx + Math.cos(a) * size * 0.35, hy + Math.sin(a) * size * 0.25 - 2, hx + Math.cos(a) * size * 0.5, hy + Math.sin(a) * size * 0.45 + 3);
      ctx.stroke();
    }
  },

  drawAraucaria(ctx, x, y, size, isNight, isDusk) {
    ctx.fillStyle = isNight ? '#0A1520' : (isDusk ? '#321D16' : '#451A03');
    ctx.fillRect(x - 1, y - size, 2, size);
    ctx.fillStyle = isNight ? '#062617' : (isDusk ? '#263319' : '#166534');
    ctx.beginPath();
    ctx.ellipse(x, y - size, size * 0.42, size * 0.14, 0, 0, Math.PI * 2);
    ctx.ellipse(x, y - size + size * 0.18, size * 0.32, size * 0.10, 0, 0, Math.PI * 2);
    ctx.fill();
  },

  drawForest(ctx, bx, horizonY, startX, endX, isNight, isDusk) {
    ctx.fillStyle = isNight ? '#062417' : (isDusk ? '#2A3819' : '#14532D');
    ctx.beginPath();
    ctx.moveTo(bx + startX, horizonY);
    for (let x = startX; x <= endX; x += 16) {
      const h = 14 + Math.sin(x * 0.13) * 5 + Math.cos(x * 0.07) * 4;
      ctx.lineTo(bx + x, horizonY - h);
    }
    ctx.lineTo(bx + endX, horizonY);
    ctx.closePath();
    ctx.fill();
  },

  drawHills(ctx, bx, horizonY, points, isNight, isDusk) {
    ctx.fillStyle = isNight ? '#0B1320' : (isDusk ? '#3D1B28' : '#2A3B4C');
    ctx.beginPath();
    ctx.moveTo(bx + points[0].x, horizonY);
    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      if (p.cx !== undefined) {
        ctx.quadraticCurveTo(bx + p.cx, horizonY - p.cy, bx + p.x, horizonY - p.y);
      } else {
        ctx.lineTo(bx + p.x, horizonY - p.y);
      }
    }
    ctx.lineTo(bx + points[points.length - 1].x, horizonY);
    ctx.closePath();
    ctx.fill();
  },

  drawCableBridge(ctx, bx, horizonY, stX, stTop, isNight, isDusk) {
    const x = bx + stX;
    const top = horizonY - stTop;
    ctx.strokeStyle = isNight ? '#38BDF8' : (isDusk ? '#FFEDD5' : '#CBD5E1');
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x - 14, horizonY);
    ctx.lineTo(x + 8, top);
    ctx.moveTo(x + 14, horizonY);
    ctx.lineTo(x - 8, top);
    ctx.stroke();

    ctx.strokeStyle = isNight ? 'rgba(56, 189, 248, 0.70)' : (isDusk ? 'rgba(255, 237, 213, 0.60)' : 'rgba(255, 255, 255, 0.45)');
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (let c = 1; c <= 4; c++) {
      const cy = top + c * 7;
      ctx.moveTo(x, cy);
      ctx.lineTo(x - c * 7, horizonY);
      ctx.moveTo(x, cy);
      ctx.lineTo(x + c * 7, horizonY);
    }
    ctx.stroke();
  },

  drawSuspensionBridge(ctx, bx, horizonY, pStart, pEnd, t1, t2, topH, deckH, isNight, isDusk) {
    const sX = bx + pStart;
    const eX = bx + pEnd;
    const tw1 = bx + t1;
    const tw2 = bx + t2;
    const topY = horizonY - topH;
    const deckY = horizonY - deckH;

    ctx.fillStyle = isNight ? '#0F172A' : (isDusk ? '#5C2D2B' : '#1E293B');
    ctx.fillRect(tw1 - 3, topY, 6, deckY - topY + 4);
    ctx.fillRect(tw2 - 3, topY, 6, deckY - topY + 4);

    ctx.strokeStyle = isNight ? '#FDE047' : (isDusk ? '#FFA260' : '#94A3B8');
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(sX, deckY);
    ctx.lineTo(tw1, topY);
    ctx.quadraticCurveTo((tw1 + tw2) * 0.5, deckY - 4, tw2, topY);
    ctx.lineTo(eX, deckY);
    ctx.stroke();

    ctx.fillStyle = isNight ? '#FBBF24' : '#E2E8F0';
    ctx.fillRect(sX, deckY, eX - sX, 2);
  },

  drawColonialHouses(ctx, bx, horizonY, startX, count, isNight, isDusk) {
    for (let h = 0; h < count; h++) {
      const hx = bx + startX + h * 18;
      const hw = 15;
      const hh = 12 + (h % 3) * 3;
      const hy = horizonY - hh;
      // Parede da casa
      ctx.fillStyle = isNight ? '#1E293B' : (isDusk ? '#834F3D' : (((h % 2 === 0) ? '#E2E8F0' : '#FEF08A')));
      ctx.fillRect(hx, hy, hw, hh);
      // Telhado cerâmica colonial
      ctx.fillStyle = isNight ? '#0F172A' : (isDusk ? '#5C2419' : '#C2410C');
      ctx.beginPath();
      ctx.moveTo(hx - 2, hy);
      ctx.lineTo(hx + hw * 0.5, hy - 5);
      ctx.lineTo(hx + hw + 2, hy);
      ctx.closePath();
      ctx.fill();
      // Janelas que acendem à noite / entardecer
      if (isNight) {
        ctx.fillStyle = '#FDE047';
        ctx.fillRect(hx + 3, hy + 3, 3, 4);
        ctx.fillRect(hx + 9, hy + 3, 3, 4);
      } else if (isDusk) {
        ctx.fillStyle = '#FED7AA';
        ctx.fillRect(hx + 3, hy + 3, 3, 4);
        ctx.fillRect(hx + 9, hy + 3, 3, 4);
      } else {
        ctx.fillStyle = '#64748B';
        ctx.fillRect(hx + 3, hy + 3, 3, 4);
        ctx.fillRect(hx + 9, hy + 3, 3, 4);
      }
    }
  },

  drawLighthouseBeam(ctx, lx, ly, isNight, isDusk, nowSec, beamReach) {
    if (!isNight && !isDusk) return;

    const reach = beamReach || 95;
    // Rotação horizontal realista de 360° em torno do eixo do farol
    const angle = nowSec * 1.5;
    const dx = Math.cos(angle); // -1 (extrema esquerda) a +1 (extrema direita)
    const dz = Math.sin(angle); // +1 (frente/câmera), -1 (costas/fundo)

    // Desenha o cone de luz quando a varredura estiver no semicírculo voltado para frente/lados
    if (dz > -0.35 && Math.abs(dx) > 0.04) {
      const len = reach * Math.abs(dx);
      const signX = dx >= 0 ? 1 : -1;
      const endX = lx + signX * len;
      // Abertura horizontal com leve queda em direção ao mar/horizonte
      const spread = 7 * Math.abs(dx) + 2;
      const endYTop = ly - spread * 0.45;
      const endYBot = ly + spread * 0.85;

      const grad = ctx.createLinearGradient(lx, ly, endX, ly);
      const alphaBase = isNight ? 0.36 : 0.22;
      const facing = Math.max(0.25, (dz + 0.35) / 1.35);
      const alpha = (alphaBase * facing).toFixed(3);

      grad.addColorStop(0, `rgba(255, 250, 200, ${alpha})`);
      grad.addColorStop(0.4, `rgba(254, 240, 138, ${(alpha * 0.7).toFixed(3)})`);
      grad.addColorStop(1, 'rgba(254, 240, 138, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(lx, ly - 1.5);
      ctx.lineTo(endX, endYTop);
      ctx.lineTo(endX, endYBot);
      ctx.lineTo(lx, ly + 1.5);
      ctx.closePath();
      ctx.fill();
    }

    // Quando a lente aponta de frente para a câmera (dz > 0.65), emite um pulso brilhante (lens flare)
    if (dz > 0.65) {
      const flash = (dz - 0.65) / 0.35;
      const flashR = 3 + 13 * flash;
      const flare = ctx.createRadialGradient(lx, ly, 1, lx, ly, flashR);
      flare.addColorStop(0, `rgba(255, 255, 255, ${(0.95 * flash).toFixed(2)})`);
      flare.addColorStop(0.4, `rgba(254, 240, 138, ${(0.65 * flash).toFixed(2)})`);
      flare.addColorStop(1, 'rgba(254, 240, 138, 0)');

      ctx.fillStyle = flare;
      ctx.beginPath();
      ctx.arc(lx, ly, flashR, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  drawArcadeCloud(ctx, x, y, w, h, topCol, botCol) {
    // Nuvem estilo arcade 16-bit com base plana atmosférica e volumes iluminados no topo
    ctx.fillStyle = botCol;
    ctx.fillRect(x - w * 0.48, y - h * 0.28, w * 0.96, h * 0.28);
    ctx.beginPath();
    ctx.arc(x - w * 0.30, y - h * 0.22, h * 0.32, Math.PI, 0, false);
    ctx.arc(x - w * 0.06, y - h * 0.34, h * 0.46, Math.PI, 0, false);
    ctx.arc(x + w * 0.20, y - h * 0.26, h * 0.36, Math.PI, 0, false);
    ctx.arc(x + w * 0.38, y - h * 0.16, h * 0.22, Math.PI, 0, false);
    ctx.fill();

    ctx.fillStyle = topCol;
    ctx.beginPath();
    ctx.arc(x - w * 0.28, y - h * 0.28, h * 0.26, Math.PI, 0, false);
    ctx.arc(x - w * 0.06, y - h * 0.40, h * 0.40, Math.PI, 0, false);
    ctx.arc(x + w * 0.18, y - h * 0.31, h * 0.30, Math.PI, 0, false);
    ctx.fill();
  },

  /**
   * Renderiza a linha do horizonte e monumento distante na camada de céu/parallax (Sky Skyline)
   */
  renderSkyLandmark(ctx, def, scroll, curveShift, horizonY, E, S) {
    const isNight = S.night > 0.28;
    const isDusk = S.dusk > 0.25;
    const nowSec = performance.now() * 0.003;
    const PW = 640;
    const farShift = ((scroll * 0.16 + curveShift * 0.3) % PW + PW) % PW;
    const trackId = def ? def.id : 'brasil';

    ctx.save();

    // =========================================================================
    // CAMADAS GLOBAIS DE PARALAXE DO ÚLTIMO FUNDO (OPACAS PARA OCLUSÃO DO SOL/LUA)
    // =========================================================================
    // Camada 0 (0.04x): Nuvens cúmulus estilizadas em camadas
    const cloudShift = ((scroll * 0.04 + curveShift * 0.12) % PW + PW) % PW;
    const cloudTop = isNight
      ? 'rgba(38, 58, 96, 0.55)'
      : (isDusk ? 'rgba(255, 190, 120, 0.70)' : 'rgba(255, 255, 255, 0.78)');
    const cloudBot = isNight
      ? 'rgba(18, 28, 52, 0.50)'
      : (isDusk ? 'rgba(148, 56, 78, 0.62)' : 'rgba(186, 214, 245, 0.70)');
    for (let tile = -1; tile <= 1; tile++) {
      const cx0 = tile * PW - cloudShift;
      if (cx0 + PW < -40 || cx0 > INTERNAL_WIDTH + 40) continue;
      this.drawArcadeCloud(ctx, cx0 + 90, 28, 68, 18, cloudTop, cloudBot);
      this.drawArcadeCloud(ctx, cx0 + 270, 38, 84, 22, cloudTop, cloudBot);
      this.drawArcadeCloud(ctx, cx0 + 455, 24, 62, 16, cloudTop, cloudBot);
      this.drawArcadeCloud(ctx, cx0 + 575, 42, 54, 14, cloudTop, cloudBot);
    }

    // Camada 1 (0.07x): Cordilheira distante SÓLIDA (esconde o Sol e a Lua quando passam atrás!)
    const mtnShift = ((scroll * 0.07 + curveShift * 0.18) % PW + PW) % PW;
    ctx.fillStyle = (E && E.css && E.css.mountainColor)
      ? E.css.mountainColor
      : (isNight ? '#0B1328' : (isDusk ? '#582436' : '#35627A'));
    for (let tile = -1; tile <= 1; tile++) {
      const mx = tile * PW - mtnShift;
      if (mx + PW < -40 || mx > INTERNAL_WIDTH + 40) continue;
      ctx.beginPath();
      ctx.moveTo(mx, horizonY);
      ctx.lineTo(mx + 65, horizonY - 38);
      ctx.lineTo(mx + 140, horizonY - 58);
      ctx.lineTo(mx + 225, horizonY - 32);
      ctx.lineTo(mx + 310, horizonY - 64);
      ctx.lineTo(mx + 410, horizonY - 40);
      ctx.lineTo(mx + 505, horizonY - 54);
      ctx.lineTo(mx + 580, horizonY - 30);
      ctx.lineTo(mx + 640, horizonY);
      ctx.closePath();
      ctx.fill();
    }

    // Camada 2 (0.11x): Pré-silhueta média SÓLIDA para profundidade entre a serra e os monumentos
    const midShift = ((scroll * 0.11 + curveShift * 0.24) % PW + PW) % PW;
    ctx.fillStyle = (E && E.css && E.css.mountainFront)
      ? E.css.mountainFront
      : (isNight ? '#121C34' : (isDusk ? '#421C26' : '#2A4E48'));
    for (let tile = -1; tile <= 1; tile++) {
      const ux = tile * PW - midShift;
      if (ux + PW < -40 || ux > INTERNAL_WIDTH + 40) continue;
      ctx.beginPath();
      ctx.moveTo(ux, horizonY);
      for (let x = 0; x <= PW; x += 32) {
        const h = 16 + Math.abs(Math.sin((x + 17) * 0.032)) * 20;
        ctx.lineTo(ux + x, horizonY - h);
      }
      ctx.lineTo(ux + PW, horizonY);
      ctx.closePath();
      ctx.fill();
    }

    for (let tile = -1; tile <= 1; tile++) {
      const bx = tile * PW - farShift;
      if (bx + PW < -40 || bx > INTERNAL_WIDTH + 40) continue;

      switch (trackId) {
        // ==============================================================
        // 1. SALVADOR: ELEVADOR LACERDA (CIDADE ALTA/BAIXA), PELOURINHO & FAROL
        // ==============================================================
        case 'salvador': {
          this.drawWater(ctx, bx, horizonY, 15, isNight, isDusk, nowSec, true, 3);

          // Escarpa arborizada da Cidade Alta conectada à passarela do Elevador Lacerda
          ctx.fillStyle = isNight ? '#141B24' : (isDusk ? '#4A3228' : '#475569');
          ctx.beginPath();
          ctx.moveTo(bx + 20, horizonY - 15);
          ctx.lineTo(bx + 70, horizonY - 46);
          ctx.lineTo(bx + 215, horizonY - 46);
          ctx.lineTo(bx + 255, horizonY - 15);
          ctx.closePath();
          ctx.fill();

          // Vegetação tropical na encosta da falha geológica
          ctx.fillStyle = isNight ? '#0B2418' : (isDusk ? '#2D3A20' : '#15803D');
          ctx.beginPath();
          ctx.arc(bx + 195, horizonY - 28, 12, 0, Math.PI * 2);
          ctx.arc(bx + 215, horizonY - 22, 10, 0, Math.PI * 2);
          ctx.arc(bx + 85, horizonY - 26, 11, 0, Math.PI * 2);
          ctx.fill();

          // Casario histórico colorido + Igreja do Pelourinho no topo da Cidade Alta
          this.drawColonialHouses(ctx, bx, horizonY - 46, 82, 5, isNight, isDusk);
          // Torre e cúpula da igreja na Cidade Alta
          ctx.fillStyle = isNight ? '#334155' : (isDusk ? '#FED7AA' : '#FFFBEB');
          ctx.fillRect(bx + 162, horizonY - 62, 10, 16);
          ctx.fillStyle = isNight ? '#1E293B' : '#B91C1C';
          ctx.beginPath();
          ctx.moveTo(bx + 161, horizonY - 62);
          ctx.lineTo(bx + 167, horizonY - 70);
          ctx.lineTo(bx + 173, horizonY - 62);
          ctx.closePath();
          ctx.fill();

          // Elevador Lacerda (duas torres gêmeas Art Déco + base + passarela ligada à Cidade Alta)
          const elX = bx + 228;
          const elTop = horizonY - 62;
          // Base da Cidade Baixa
          ctx.fillStyle = isNight ? '#1E293B' : (isDusk ? '#57463C' : '#94A3B8');
          ctx.fillRect(elX - 10, horizonY - 28, 20, 13);
          // Torres gêmeas com fenda central
          ctx.fillStyle = isNight ? '#475569' : (isDusk ? '#FDBA74' : '#E2E8F0');
          ctx.fillRect(elX - 8, elTop + 6, 6, 32);
          ctx.fillRect(elX + 2, elTop + 6, 6, 32);
          ctx.fillStyle = isNight ? '#0F172A' : '#334155';
          ctx.fillRect(elX - 2, elTop + 7, 4, 30);
          // Passarela conectando da Cidade Alta (elX - 26) até a frente das torres (elX + 12)
          ctx.fillStyle = isNight ? '#334155' : (isDusk ? '#FFEDD5' : '#F8FAFC');
          ctx.fillRect(elX - 28, elTop, 40, 7);
          ctx.fillStyle = isNight ? '#FDE047' : (isDusk ? '#FDBA74' : '#38BDF8');
          ctx.fillRect(elX - 25, elTop + 2, 34, 3);

          // Cidade Baixa / Comércio à direita do Elevador
          this.drawSkyline(ctx, bx + 275, horizonY - 15, [
            { x: 0, w: 14, h: 24 }, { x: 16, w: 18, h: 32 }, { x: 36, w: 15, h: 22 }
          ], isNight, isDusk, nowSec);

          // Forte de São Marcelo (forte circular icônico na Baía de Todos-os-Santos)
          const fortX = bx + 368;
          ctx.fillStyle = isNight ? '#1E293B' : (isDusk ? '#785A40' : '#D6D3D1');
          ctx.fillRect(fortX - 14, horizonY - 21, 28, 8);
          ctx.fillStyle = isNight ? '#0F172A' : '#A8A29E';
          ctx.fillRect(fortX - 8, horizonY - 25, 16, 4);

          // Saveiros / Barcos com velas na baía
          ctx.fillStyle = isNight ? '#475569' : '#FFFFFF';
          ctx.beginPath();
          ctx.moveTo(bx + 415, horizonY - 10);
          ctx.lineTo(bx + 421, horizonY - 22);
          ctx.lineTo(bx + 425, horizonY - 10);
          ctx.closePath();
          ctx.fill();

          // Farol da Barra na ponta litorânea (bx + 505)
          const fX = bx + 505;
          ctx.fillStyle = isNight ? '#0F172A' : '#1E293B';
          ctx.fillRect(fX - 4, horizonY - 38, 8, 24);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(fX - 4, horizonY - 32, 8, 6);
          ctx.fillStyle = '#EF4444';
          ctx.fillRect(fX - 3, horizonY - 42, 6, 5);

          // Facho de luz horizontal rotativo do farol
          this.drawLighthouseBeam(ctx, fX, horizonY - 39, isNight, isDusk, nowSec, 95);

          // Coqueiros na ponta litorânea
          this.drawPalm(ctx, bx + 465, horizonY - 15, 18, isNight, isDusk);
          this.drawPalm(ctx, bx + 545, horizonY - 15, 16, isNight, isDusk);
          this.drawPalm(ctx, bx + 585, horizonY - 15, 14, isNight, isDusk);
          break;
        }

        // ==============================================================
        // 2. RIO DE JANEIRO: CRISTO NO CORCOVADO, PÃO DE AÇÚCAR & ORLA
        // ==============================================================
        case 'rio_de_janeiro': {
          this.drawWater(ctx, bx, horizonY, 16, isNight, isDusk, nowSec, true, 4);

          // Pão de Açúcar (Morro Cônico à esquerda)
          const pX = bx + 120;
          ctx.fillStyle = isNight ? '#0E1726' : (isDusk ? '#3D1C2A' : '#334155');
          ctx.beginPath();
          ctx.moveTo(pX - 55, horizonY);
          ctx.quadraticCurveTo(pX - 25, horizonY - 48, pX, horizonY - 50);
          ctx.quadraticCurveTo(pX + 25, horizonY - 48, pX + 55, horizonY);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = isNight ? '#38BDF8' : '#94A3B8';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(pX, horizonY - 50);
          ctx.lineTo(pX + 75, horizonY - 26);
          ctx.stroke();

          // Prédios da Orla de Copacabana
          const bldgsRio = [
            { x: 195, w: 22, h: 36, col: '#1E293B' },
            { x: 220, w: 26, h: 42, col: '#334155' },
            { x: 248, w: 20, h: 32, col: '#1E293B' }
          ];
          this.drawSkyline(ctx, bx, horizonY - 16, bldgsRio, isNight, isDusk, nowSec);

          // Corcovado com Cristo Redentor iluminado no topo
          const cX = bx + 360;
          ctx.fillStyle = isNight ? '#0B1320' : (isDusk ? '#321624' : '#1E293B');
          ctx.beginPath();
          ctx.moveTo(cX - 70, horizonY);
          ctx.lineTo(cX, horizonY - 60);
          ctx.lineTo(cX + 70, horizonY);
          ctx.closePath();
          ctx.fill();

          // Estátua do Cristo (Branco iluminado)
          const crTop = horizonY - 74;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(cX - 1.5, crTop, 3, 14);
          ctx.fillRect(cX - 8, crTop + 3, 16, 2.5);
          ctx.beginPath();
          ctx.arc(cX, crTop - 1, 2, 0, Math.PI * 2);
          ctx.fill();
          if (isNight) {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
            ctx.beginPath();
            ctx.arc(cX, crTop + 4, 12, 0, Math.PI * 2);
            ctx.fill();
          }

          // Palmeiras na orla
          this.drawPalm(ctx, bx + 280, horizonY - 16, 17, isNight, isDusk);
          this.drawPalm(ctx, bx + 450, horizonY - 16, 19, isNight, isDusk);
          this.drawPalm(ctx, bx + 480, horizonY - 16, 16, isNight, isDusk);
          break;
        }

        // ==============================================================
        // 3. SÃO PAULO: ARRANHA-CÉUS, MASP & PONTE ESTAIADA
        // ==============================================================
        case 'sao_paulo': {
          const bldgsSP = [
            { x: 25, w: 22, h: 48, col: '#1E293B' },
            { x: 50, w: 34, h: 62, col: '#0F172A' },
            { x: 88, w: 26, h: 54, col: '#334155' },
            { x: 118, w: 40, h: 74, col: '#0F172A', spire: true }, // Banespa / Altino Arantes
            { x: 162, w: 28, h: 46, col: '#1E293B' },
            { x: 194, w: 36, h: 58, col: '#334155' },
            { x: 275, w: 32, h: 50, col: '#1E293B' },
            { x: 310, w: 45, h: 68, col: '#0F172A', spire: true },
            { x: 360, w: 28, h: 52, col: '#334155' },
            { x: 392, w: 34, h: 64, col: '#0F172A' },
            { x: 535, w: 30, h: 48, col: '#1E293B' },
            { x: 570, w: 40, h: 60, col: '#334155', spire: true }
          ];
          this.drawSkyline(ctx, bx, horizonY, bldgsSP, isNight, isDusk, nowSec);

          // MASP (bx + 240)
          const maspX = bx + 245;
          const maspY = horizonY - 18;
          ctx.fillStyle = '#EF4444'; // Pilares vermelhos suspensos
          ctx.fillRect(maspX - 18, maspY - 22, 4, 22);
          ctx.fillRect(maspX + 18, maspY - 22, 4, 22);
          ctx.fillRect(maspX - 18, maspY - 22, 40, 4);
          ctx.fillStyle = isNight ? '#0F172A' : '#1E293B';
          ctx.fillRect(maspX - 14, maspY - 18, 32, 12);
          ctx.fillStyle = isNight ? '#38BDF8' : '#BAE6FD';
          ctx.fillRect(maspX - 12, maspY - 15, 28, 6);

          // Ponte Estaiada (bx + 480)
          this.drawCableBridge(ctx, bx, horizonY, 480, 64, isNight, isDusk);
          break;
        }

        // ==============================================================
        // 4. BRASÍLIA: CONGRESSO NACIONAL, CATEDRAL & LAGO PARANOÁ
        // ==============================================================
        case 'brasilia': {
          // Lago Paranoá à direita
          const wGrad = ctx.createLinearGradient(0, horizonY - 12, 0, horizonY);
          wGrad.addColorStop(0, isNight ? '#050D18' : (isDusk ? '#4A1D2B' : '#0284C7'));
          wGrad.addColorStop(1, isNight ? '#0C1B2A' : (isDusk ? '#7C2D32' : '#38BDF8'));
          ctx.fillStyle = wGrad;
          ctx.fillRect(bx + 380, horizonY - 12, 260, 12);

          // Ponte JK sobre o lago (arcos assimétricos)
          const jkX = bx + 470;
          ctx.strokeStyle = isNight ? '#38BDF8' : '#CBD5E1';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.arc(jkX - 25, horizonY - 4, 18, Math.PI, 0, false);
          ctx.arc(jkX + 25, horizonY - 4, 18, Math.PI, 0, false);
          ctx.stroke();

          // Chapada ao fundo do planalto central
          ctx.fillStyle = isNight ? '#0F172A' : (isDusk ? '#5C271F' : '#334155');
          ctx.beginPath();
          ctx.moveTo(bx, horizonY);
          ctx.lineTo(bx + 180, horizonY - 14);
          ctx.lineTo(bx + 380, horizonY - 14);
          ctx.lineTo(bx + 380, horizonY);
          ctx.closePath();
          ctx.fill();

          // Congresso Nacional silhuetado (bx + 190)
          const cgX = bx + 190;
          ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
          ctx.fillRect(cgX - 45, horizonY - 8, 90, 8);
          ctx.fillRect(cgX - 7, horizonY - 48, 6, 40);
          ctx.fillRect(cgX + 1, horizonY - 48, 6, 40);
          ctx.beginPath();
          ctx.arc(cgX - 25, horizonY - 8, 10, Math.PI, 0, false);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cgX + 25, horizonY - 10, 11, 0, Math.PI, false);
          ctx.fill();

          // Janelas iluminadas nas torres gêmeas H
          if (isNight || isDusk) {
            ctx.fillStyle = isNight ? '#FDE047' : '#FED7AA';
            for (let wy = horizonY - 44; wy < horizonY - 10; wy += 5) {
              ctx.fillRect(cgX - 5, wy, 2, 2);
              ctx.fillRect(cgX + 3, wy, 2, 2);
            }
          }

          // Catedral Metropolitana (bx + 320)
          const catX = bx + 320;
          ctx.fillStyle = isNight ? '#38BDF8' : '#0284C7';
          ctx.beginPath();
          ctx.moveTo(catX - 18, horizonY);
          ctx.lineTo(catX, horizonY - 32);
          ctx.lineTo(catX + 18, horizonY);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1;
          for (let p = -3; p <= 3; p++) {
            ctx.beginPath();
            ctx.moveTo(catX + p * 5.5, horizonY);
            ctx.lineTo(catX + p * 1.5, horizonY - 32);
            ctx.stroke();
          }
          break;
        }

        // ==============================================================
        // 5. MANAUS: RIO NEGRO, FLORESTA & TEATRO AMAZONAS
        // ==============================================================
        case 'manaus': {
          this.drawWater(ctx, bx, horizonY, 14, isNight, isDusk, nowSec, false);
          this.drawForest(ctx, bx, horizonY - 14, 0, 640, isNight, isDusk);

          // Cúpula Colorida do Teatro Amazonas (bx + 250)
          const tmX = bx + 260;
          ctx.fillStyle = '#1E293B';
          ctx.fillRect(tmX - 28, horizonY - 26, 56, 12);
          ctx.fillStyle = '#FEDD00'; // Cúpula amarela
          ctx.beginPath();
          ctx.arc(tmX, horizonY - 26, 14, Math.PI, 0, false);
          ctx.fill();
          ctx.strokeStyle = '#009739'; // Verde
          ctx.lineWidth = 1.3;
          ctx.stroke();
          if (isNight) {
            ctx.fillStyle = '#FDE047';
            ctx.fillRect(tmX - 22, horizonY - 22, 44, 4);
          }

          // Ponte Rio Negro Estaiada (bx + 480)
          this.drawCableBridge(ctx, bx, horizonY - 14, 480, 52, isNight, isDusk);
          break;
        }

        // ==============================================================
        // 6. CURITIBA: JARDIM BOTÂNICO, SERRA DO MAR & SKYLINE
        // ==============================================================
        case 'curitiba': {
          // Montanhas da Serra do Mar
          this.drawHills(ctx, bx, horizonY, [
            { x: 0, y: 0 },
            { cx: 80, cy: 38, x: 160, y: 32 },
            { cx: 280, cy: 48, x: 420, y: 28 },
            { cx: 540, cy: 42, x: 640, y: 0 }
          ], isNight, isDusk);

          // Skyline moderno de Curitiba
          const bldgsCWB = [
            { x: 310, w: 26, h: 44, col: '#1E293B' },
            { x: 340, w: 32, h: 56, col: '#0F172A', spire: true },
            { x: 376, w: 28, h: 48, col: '#334155' },
            { x: 408, w: 36, h: 62, col: '#0F172A', spire: true }
          ];
          this.drawSkyline(ctx, bx, horizonY, bldgsCWB, isNight, isDusk, nowSec);

          // Araucárias no horizonte
          this.drawAraucaria(ctx, bx + 50, horizonY, 28, isNight, isDusk);
          this.drawAraucaria(ctx, bx + 75, horizonY, 34, isNight, isDusk);
          this.drawAraucaria(ctx, bx + 110, horizonY, 26, isNight, isDusk);
          this.drawAraucaria(ctx, bx + 480, horizonY, 32, isNight, isDusk);
          this.drawAraucaria(ctx, bx + 515, horizonY, 28, isNight, isDusk);

          // Estufa do Jardim Botânico (bx + 200)
          const jbX = bx + 210;
          ctx.fillStyle = isNight ? 'rgba(52, 211, 153, 0.70)' : (isDusk ? 'rgba(251, 191, 36, 0.65)' : 'rgba(16, 185, 129, 0.55)');
          ctx.fillRect(jbX - 25, horizonY - 14, 50, 14);
          ctx.beginPath();
          ctx.arc(jbX, horizonY - 14, 12, Math.PI, 0, false);
          ctx.arc(jbX - 16, horizonY - 14, 8, Math.PI, 0, false);
          ctx.arc(jbX + 16, horizonY - 14, 8, Math.PI, 0, false);
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Museu Oscar Niemeyer / Museu do Olho (bx + 560)
          const monX = bx + 570;
          ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
          ctx.fillRect(monX - 3, horizonY - 24, 6, 24);
          ctx.fillStyle = isNight ? '#FBBF24' : '#F59E0B';
          ctx.beginPath();
          ctx.ellipse(monX, horizonY - 24, 18, 9, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#0F172A';
          ctx.lineWidth = 1;
          ctx.stroke();
          break;
        }

        // ==============================================================
        // 7. FLORIANÓPOLIS: PONTE HERCÍLIO LUZ, BAÍA & ORLA
        // ==============================================================
        case 'florianopolis': {
          this.drawWater(ctx, bx, horizonY, 16, isNight, isDusk, nowSec, true, 3);

          // Morros verdes da Ilha de Santa Catarina
          this.drawHills(ctx, bx, horizonY - 16, [
            { x: 0, y: 0 },
            { cx: 80, cy: 30, x: 160, y: 0 },
            { cx: 480, cy: 35, x: 640, y: 0 }
          ], isNight, isDusk);

          // Skyline da Beira-Mar Norte
          const bldgsFloripa = [
            { x: 420, w: 24, h: 38, col: '#1E293B' },
            { x: 448, w: 30, h: 50, col: '#0F172A' },
            { x: 482, w: 22, h: 42, col: '#334155' },
            { x: 508, w: 28, h: 46, col: '#1E293B' }
          ];
          this.drawSkyline(ctx, bx, horizonY - 16, bldgsFloripa, isNight, isDusk, nowSec);

          // Ponte Hercílio Luz em grande destaque (bx + 140 a 390)
          this.drawSuspensionBridge(ctx, bx, horizonY, 140, 390, 215, 315, 58, 20, isNight, isDusk);
          this.drawPalm(ctx, bx + 80, horizonY - 16, 18, isNight, isDusk);
          this.drawPalm(ctx, bx + 110, horizonY - 16, 15, isNight, isDusk);
          break;
        }

        // ==============================================================
        // 8. PORTO ALEGRE: USINA DO GASÔMETRO, GUAÍBA & SKYLINE
        // ==============================================================
        case 'porto_alegre': {
          this.drawWater(ctx, bx, horizonY, 16, isNight, isDusk, nowSec, false);

          // Skyline de Porto Alegre ao redor da orla
          const bldgsPOA = [
            { x: 80, w: 26, h: 44, col: '#1E293B' },
            { x: 110, w: 34, h: 56, col: '#0F172A', spire: true },
            { x: 148, w: 24, h: 40, col: '#334155' },
            { x: 380, w: 30, h: 48, col: '#1E293B' },
            { x: 414, w: 36, h: 60, col: '#0F172A', spire: true },
            { x: 454, w: 28, h: 45, col: '#334155' }
          ];
          this.drawSkyline(ctx, bx, horizonY - 16, bldgsPOA, isNight, isDusk, nowSec);

          // Usina do Gasômetro com Chaminé Alta (bx + 260)
          const ugX = bx + 270;
          ctx.fillStyle = isNight ? '#451A03' : '#78350F';
          ctx.fillRect(ugX - 22, horizonY - 26, 44, 26);
          ctx.fillStyle = isNight ? '#FDE047' : '#FED7AA';
          ctx.fillRect(ugX - 16, horizonY - 20, 10, 6);
          ctx.fillRect(ugX + 6, horizonY - 20, 10, 6);

          // Chaminé com sinalizador vermelho
          ctx.fillStyle = isNight ? '#3F3F46' : '#52525B';
          ctx.fillRect(ugX + 8, horizonY - 65, 5, 65);
          ctx.fillStyle = (Math.sin(nowSec * 5) > 0) ? '#EF4444' : '#7F1D1D';
          ctx.fillRect(ugX + 8, horizonY - 67, 5, 2);

          // Estátua do Laçador silhuetada (bx + 540)
          const lcX = bx + 540;
          ctx.fillStyle = isNight ? '#0F172A' : '#1E293B';
          ctx.fillRect(lcX - 2, horizonY - 32, 4, 16);
          ctx.fillRect(lcX - 6, horizonY - 26, 12, 3);
          break;
        }

        // ==============================================================
        // 9. BELO HORIZONTE: SERRA DO CURRAL, LAGOA & IGREJA DA PAMPULHA
        // ==============================================================
        case 'belo_horizonte': {
          // Serra do Curral (escarpas imponentes)
          this.drawHills(ctx, bx, horizonY, [
            { x: 0, y: 0 },
            { cx: 120, cy: 52, x: 260, y: 44 },
            { cx: 380, cy: 58, x: 500, y: 38 },
            { cx: 580, cy: 45, x: 640, y: 0 }
          ], isNight, isDusk);

          // Lagoa da Pampulha com água e reflexos
          this.drawWater(ctx, bx, horizonY, 14, isNight, isDusk, nowSec, false);

          // Skyline de BH surgindo atrás da orla
          const bldgsBH = [
            { x: 380, w: 28, h: 48, col: '#1E293B' },
            { x: 412, w: 35, h: 62, col: '#0F172A', spire: true },
            { x: 452, w: 26, h: 42, col: '#334155' }
          ];
          this.drawSkyline(ctx, bx, horizonY - 14, bldgsBH, isNight, isDusk, nowSec);

          // Igreja de São Francisco de Assis da Pampulha (bx + 210)
          const igX = bx + 215;
          ctx.fillStyle = isNight ? '#38BDF8' : '#0284C7';
          ctx.beginPath();
          ctx.arc(igX, horizonY - 14, 16, Math.PI, 0, false);
          ctx.fill();
          ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
          ctx.fillRect(igX + 16, horizonY - 34, 4, 20); // Torre sineira
          break;
        }

        // ==============================================================
        // 10. RECIFE: MARCO ZERO, PONTES HISTÓRICAS & BOA VIAGEM
        // ==============================================================
        case 'recife': {
          this.drawWater(ctx, bx, horizonY, 16, isNight, isDusk, nowSec, true, 3);

          // Skyline icônico e denso de Boa Viagem
          const bldgsRecife = [
            { x: 60, w: 26, h: 54, col: '#1E293B' },
            { x: 90, w: 32, h: 68, col: '#0F172A', spire: true },
            { x: 126, w: 28, h: 58, col: '#334155' },
            { x: 158, w: 35, h: 72, col: '#0F172A', spire: true },
            { x: 196, w: 24, h: 48, col: '#1E293B' },
            { x: 440, w: 30, h: 55, col: '#0F172A' },
            { x: 474, w: 26, h: 46, col: '#334155' }
          ];
          this.drawSkyline(ctx, bx, horizonY - 16, bldgsRecife, isNight, isDusk, nowSec);

          // Torre de Cristal de Brennand & Parque das Esculturas (bx + 310)
          const brX = bx + 310;
          ctx.fillStyle = isNight ? '#FED7AA' : '#F59E0B';
          ctx.beginPath();
          ctx.moveTo(brX - 3, horizonY - 16);
          ctx.lineTo(brX, horizonY - 46);
          ctx.lineTo(brX + 3, horizonY - 16);
          ctx.closePath();
          ctx.fill();

          // Ponte histórica iluminada (bx + 350)
          ctx.strokeStyle = isNight ? '#FBBF24' : '#E2E8F0';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(bx + 340, horizonY - 16);
          ctx.lineTo(bx + 410, horizonY - 16);
          ctx.stroke();

          this.drawPalm(ctx, bx + 240, horizonY - 16, 17, isNight, isDusk);
          this.drawPalm(ctx, bx + 270, horizonY - 16, 15, isNight, isDusk);
          break;
        }

        // ==============================================================
        // 11. FORTALEZA: DRAGÃO DO MAR, ESPIGÃO & ORLA BEIRA-MAR
        // ==============================================================
        case 'fortaleza': {
          this.drawWater(ctx, bx, horizonY, 16, isNight, isDusk, nowSec, true, 4);

          // Skyline com grandes hotéis da Beira-Mar
          const bldgsFor = [
            { x: 50, w: 28, h: 52, col: '#1E293B' },
            { x: 82, w: 36, h: 66, col: '#0F172A', spire: true },
            { x: 122, w: 26, h: 46, col: '#334155' },
            { x: 152, w: 34, h: 60, col: '#0F172A' },
            { x: 440, w: 32, h: 56, col: '#1E293B' },
            { x: 476, w: 38, h: 68, col: '#0F172A', spire: true }
          ];
          this.drawSkyline(ctx, bx, horizonY - 16, bldgsFor, isNight, isDusk, nowSec);

          // Centro Dragão do Mar com passarela vermelha suspensa (bx + 260)
          const dmX = bx + 265;
          ctx.fillStyle = '#EF4444';
          ctx.fillRect(dmX - 25, horizonY - 26, 50, 4);
          ctx.fillRect(dmX - 20, horizonY - 26, 4, 10);
          ctx.fillRect(dmX + 16, horizonY - 26, 4, 10);
          // Cúpula do Planetário
          ctx.fillStyle = isNight ? '#38BDF8' : '#CBD5E1';
          ctx.beginPath();
          ctx.arc(dmX + 35, horizonY - 26, 12, Math.PI, 0, false);
          ctx.fill();

          // Espigão costeiro entrando no mar
          ctx.fillStyle = isNight ? '#0F172A' : '#475569';
          ctx.fillRect(bx + 340, horizonY - 18, 45, 4);
          this.drawPalm(ctx, bx + 200, horizonY - 16, 18, isNight, isDusk);
          this.drawPalm(ctx, bx + 410, horizonY - 16, 16, isNight, isDusk);
          break;
        }

        // ==============================================================
        // 12. VITÓRIA: CONVENTO DA PENHA & TERCEIRA PONTE
        // ==============================================================
        case 'vitoria': {
          this.drawWater(ctx, bx, horizonY, 15, isNight, isDusk, nowSec, false);

          // Morro rochoso do Convento da Penha (bx + 140)
          const cvX = bx + 140;
          ctx.fillStyle = isNight ? '#0B1320' : (isDusk ? '#3D1C2A' : '#334155');
          ctx.beginPath();
          ctx.moveTo(cvX - 60, horizonY - 15);
          ctx.lineTo(cvX, horizonY - 56);
          ctx.lineTo(cvX + 60, horizonY - 15);
          ctx.closePath();
          ctx.fill();

          // Convento no topo com cruz iluminada
          ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
          ctx.fillRect(cvX - 8, horizonY - 64, 16, 8);
          ctx.fillStyle = isNight ? '#FBBF24' : '#94A3B8';
          ctx.fillRect(cvX - 1, horizonY - 72, 2, 8);
          ctx.fillRect(cvX - 4, horizonY - 70, 8, 2);

          // Skyline de Vitória
          const bldgsVix = [
            { x: 420, w: 26, h: 46, col: '#1E293B' },
            { x: 450, w: 34, h: 58, col: '#0F172A' },
            { x: 488, w: 24, h: 42, col: '#334155' }
          ];
          this.drawSkyline(ctx, bx, horizonY - 15, bldgsVix, isNight, isDusk, nowSec);

          // Terceira Ponte com grande vão central (bx + 230 a 390)
          this.drawCableBridge(ctx, bx, horizonY - 15, 310, 56, isNight, isDusk);
          break;
        }

        // ==============================================================
        // 13. NATAL: FORTE DOS REIS MAGOS, MORRO DO CARECA & PONTE
        // ==============================================================
        case 'natal': {
          this.drawWater(ctx, bx, horizonY, 15, isNight, isDusk, nowSec, true, 4);

          // Morro do Careca com grande duna branca (bx + 100)
          const mcX = bx + 100;
          ctx.fillStyle = isNight ? '#1E293B' : (isDusk ? '#B45309' : '#FEF3C7');
          ctx.beginPath();
          ctx.moveTo(mcX - 45, horizonY - 15);
          ctx.lineTo(mcX, horizonY - 48);
          ctx.lineTo(mcX + 45, horizonY - 15);
          ctx.closePath();
          ctx.fill();

          // Forte dos Reis Magos em forma estrelada (bx + 280)
          const ftX = bx + 280;
          ctx.fillStyle = isNight ? '#0F172A' : '#475569';
          ctx.fillRect(ftX - 20, horizonY - 22, 40, 7);
          ctx.fillStyle = '#EF4444';
          ctx.fillRect(ftX - 1, horizonY - 28, 2, 6);

          // Ponte Newton Navarro estaiada (bx + 460)
          this.drawCableBridge(ctx, bx, horizonY - 15, 470, 54, isNight, isDusk);
          this.drawPalm(ctx, bx + 180, horizonY - 15, 17, isNight, isDusk);
          this.drawPalm(ctx, bx + 360, horizonY - 15, 15, isNight, isDusk);
          break;
        }

        // ==============================================================
        // 14. MACEIÓ: ORLA DE PAJUÇARA, JANGADAS & MAR ESMERALDA
        // ==============================================================
        case 'maceio': {
          this.drawWater(ctx, bx, horizonY, 16, isNight, isDusk, nowSec, true, 4);

          // Prédios da Orla Marítima
          const bldgsMCZ = [
            { x: 300, w: 26, h: 38, col: '#1E293B' },
            { x: 330, w: 32, h: 48, col: '#0F172A' },
            { x: 366, w: 28, h: 42, col: '#334155' },
            { x: 398, w: 34, h: 50, col: '#0F172A' },
            { x: 436, w: 26, h: 36, col: '#1E293B' }
          ];
          this.drawSkyline(ctx, bx, horizonY - 16, bldgsMCZ, isNight, isDusk, nowSec);

          // Jangadas tradicionais de velas brancas/coloridas fundeadas
          const drawJangada = (jx, jy) => {
            ctx.fillStyle = isNight ? '#0A131F' : '#3E2723';
            ctx.fillRect(jx - 7, jy - 2, 14, 2);
            ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
            ctx.beginPath();
            ctx.moveTo(jx, jy - 14);
            ctx.lineTo(jx + 7, jy - 2);
            ctx.lineTo(jx, jy - 2);
            ctx.closePath();
            ctx.fill();
          };
          drawJangada(bx + 110, horizonY - 8);
          drawJangada(bx + 140, horizonY - 11);
          drawJangada(bx + 180, horizonY - 6);

          this.drawPalm(ctx, bx + 60, horizonY - 16, 18, isNight, isDusk);
          this.drawPalm(ctx, bx + 240, horizonY - 16, 16, isNight, isDusk);
          this.drawPalm(ctx, bx + 510, horizonY - 16, 17, isNight, isDusk);
          break;
        }

        // ==============================================================
        // 15. JOÃO PESSOA: FAROL DO CABO BRANCO & PONTA DO SEIXAS
        // ==============================================================
        case 'joao_pessoa': {
          this.drawWater(ctx, bx, horizonY, 15, isNight, isDusk, nowSec, true, 3);

          // Falésias avermelhadas da Ponta do Seixas
          ctx.fillStyle = isNight ? '#1E293B' : (isDusk ? '#7C2D12' : '#C2410C');
          ctx.fillRect(bx + 60, horizonY - 26, 180, 11);

          // Farol triangular do Cabo Branco (bx + 150)
          const jpaF = bx + 150;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.moveTo(jpaF - 6, horizonY - 26);
          ctx.lineTo(jpaF, horizonY - 50);
          ctx.lineTo(jpaF + 6, horizonY - 26);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#EF4444';
          ctx.fillRect(jpaF - 2, horizonY - 54, 4, 4);

          // Facho de luz horizontal rotativo do farol
          this.drawLighthouseBeam(ctx, jpaF, horizonY - 52, isNight, isDusk, nowSec, 85);

          // Skyline baixo e moderno
          const bldgsJPA = [
            { x: 340, w: 26, h: 36, col: '#1E293B' },
            { x: 370, w: 30, h: 44, col: '#0F172A' },
            { x: 404, w: 24, h: 34, col: '#334155' }
          ];
          this.drawSkyline(ctx, bx, horizonY - 15, bldgsJPA, isNight, isDusk, nowSec);
          this.drawPalm(ctx, bx + 280, horizonY - 15, 18, isNight, isDusk);
          this.drawPalm(ctx, bx + 470, horizonY - 15, 16, isNight, isDusk);
          break;
        }

        // ==============================================================
        // 16. SÃO LUÍS: PALÁCIO DOS LEÕES & CASARIO COLONIAL
        // ==============================================================
        case 'sao_luis': {
          this.drawWater(ctx, bx, horizonY, 15, isNight, isDusk, nowSec, false);

          // Casario de azulejos históricos
          this.drawColonialHouses(ctx, bx, horizonY - 15, 60, 6, isNight, isDusk);

          // Palácio dos Leões iluminado (bx + 260)
          const plX = bx + 270;
          ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
          ctx.fillRect(plX - 28, horizonY - 32, 56, 17);
          ctx.fillStyle = isNight ? '#0F172A' : '#78350F';
          ctx.beginPath();
          ctx.moveTo(plX - 32, horizonY - 32);
          ctx.lineTo(plX, horizonY - 42);
          ctx.lineTo(plX + 32, horizonY - 32);
          ctx.closePath();
          ctx.fill();
          // Colunas neoclássicas
          ctx.fillStyle = '#CBD5E1';
          for (let c = -3; c <= 3; c++) {
            ctx.fillRect(plX + c * 7 - 1, horizonY - 32, 2, 17);
          }

          // Ponte sobre a baía (bx + 430)
          ctx.strokeStyle = isNight ? '#FBBF24' : '#94A3B8';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(bx + 380, horizonY - 15);
          ctx.lineTo(bx + 560, horizonY - 15);
          ctx.stroke();
          break;
        }

        // ==============================================================
        // 17. BELÉM: MERCADO VER-O-PESO, DOCAS & BAÍA DO GUAJARÁ
        // ==============================================================
        case 'belem': {
          this.drawWater(ctx, bx, horizonY, 15, isNight, isDusk, nowSec, false);

          // Mangueiras históricas frondosas
          const drawMangoTree = (mx, my, size) => {
            ctx.fillStyle = isNight ? '#0B1320' : '#3E2723';
            ctx.fillRect(mx - 1.5, my - size, 3, size);
            ctx.fillStyle = isNight ? '#062617' : (isDusk ? '#263319' : '#15803D');
            ctx.beginPath();
            ctx.arc(mx, my - size, size * 0.75, 0, Math.PI * 2);
            ctx.fill();
          };
          drawMangoTree(bx + 70, horizonY - 15, 26);
          drawMangoTree(bx + 110, horizonY - 15, 30);
          drawMangoTree(bx + 480, horizonY - 15, 28);

          // Mercado Ver-o-Peso com 4 torres góticas de ferro inglês (bx + 260)
          const vpX = bx + 270;
          ctx.fillStyle = isNight ? '#38BDF8' : '#0284C7';
          ctx.fillRect(vpX - 24, horizonY - 26, 48, 11);
          // 4 Torres pontiagudas
          ctx.fillStyle = isNight ? '#0F172A' : '#1E293B';
          for (let t = -1; t <= 1; t += 2) {
            ctx.fillRect(vpX + t * 20 - 3, horizonY - 38, 6, 23);
            ctx.beginPath();
            ctx.moveTo(vpX + t * 20 - 3, horizonY - 38);
            ctx.lineTo(vpX + t * 20, horizonY - 48);
            ctx.lineTo(vpX + t * 20 + 3, horizonY - 38);
            ctx.closePath();
            ctx.fill();
          }

          // Estação das Docas com guindastes iluminados (bx + 370)
          const dcX = bx + 380;
          ctx.fillStyle = isNight ? '#FBBF24' : '#EAB308';
          ctx.fillRect(dcX, horizonY - 28, 3, 13);
          ctx.beginPath();
          ctx.moveTo(dcX, horizonY - 28);
          ctx.lineTo(dcX + 16, horizonY - 36);
          ctx.stroke();

          // Skyline de Belém ao fundo
          const bldgsBel = [
            { x: 520, w: 26, h: 48, col: '#1E293B' },
            { x: 550, w: 32, h: 62, col: '#0F172A', spire: true }
          ];
          this.drawSkyline(ctx, bx, horizonY - 15, bldgsBel, isNight, isDusk, nowSec);
          break;
        }

        // ==============================================================
        // 18. TERESINA: PONTE ESTAIADA & ENCONTRO DOS RIOS
        // ==============================================================
        case 'teresina': {
          this.drawWater(ctx, bx, horizonY, 14, isNight, isDusk, nowSec, false);

          // Carnaúbas e palmeiras da mata dos cocais
          this.drawPalm(ctx, bx + 70, horizonY - 14, 24, isNight, isDusk);
          this.drawPalm(ctx, bx + 100, horizonY - 14, 28, isNight, isDusk);
          this.drawPalm(ctx, bx + 140, horizonY - 14, 22, isNight, isDusk);

          // Ponte Estaiada João Luís Ferreira com mirante no topo (bx + 290)
          const peX = bx + 300;
          this.drawCableBridge(ctx, bx, horizonY - 14, 300, 56, isNight, isDusk);
          // Mirante panorâmico no topo da torre
          ctx.fillStyle = isNight ? '#FDE047' : '#FFFFFF';
          ctx.beginPath();
          ctx.arc(peX, horizonY - 14 - 56, 5, 0, Math.PI * 2);
          ctx.fill();

          // Skyline da Cidade Verde
          const bldgsTHE = [
            { x: 420, w: 26, h: 42, col: '#1E293B' },
            { x: 450, w: 32, h: 54, col: '#0F172A' },
            { x: 486, w: 28, h: 46, col: '#334155' }
          ];
          this.drawSkyline(ctx, bx, horizonY - 14, bldgsTHE, isNight, isDusk, nowSec);
          break;
        }

        // ==============================================================
        // 19. ARACAJU: ARCOS DA ORLA DE ATALAIA & PRAIA
        // ==============================================================
        case 'aracaju': {
          this.drawWater(ctx, bx, horizonY, 14, isNight, isDusk, nowSec, true, 3);

          // Arcos de Atalaia com iluminação colorida (bx + 260)
          const arcX = bx + 270;
          ctx.strokeStyle = isNight ? '#38BDF8' : '#0284C7';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(arcX - 18, horizonY - 14, 16, Math.PI, 0, false);
          ctx.arc(arcX, horizonY - 14, 20, Math.PI, 0, false);
          ctx.arc(arcX + 18, horizonY - 14, 16, Math.PI, 0, false);
          ctx.stroke();

          // Passarela do Caranguejo (bx + 430)
          const cgkX = bx + 440;
          ctx.fillStyle = '#C2410C';
          ctx.fillRect(cgkX - 8, horizonY - 26, 16, 8);
          ctx.fillStyle = isNight ? '#FDE047' : '#FEF08A';
          ctx.fillRect(cgkX - 6, horizonY - 24, 12, 3);

          // Skyline suave da orla de Atalaia
          const bldgsAJU = [
            { x: 80, w: 24, h: 36, col: '#1E293B' },
            { x: 108, w: 28, h: 44, col: '#0F172A' },
            { x: 510, w: 26, h: 40, col: '#334155' }
          ];
          this.drawSkyline(ctx, bx, horizonY - 14, bldgsAJU, isNight, isDusk, nowSec);
          this.drawPalm(ctx, bx + 180, horizonY - 14, 18, isNight, isDusk);
          this.drawPalm(ctx, bx + 350, horizonY - 14, 16, isNight, isDusk);
          break;
        }

        // ==============================================================
        // 20. GOIÂNIA: ART DÉCO, MONUMENTO ÀS TRÊS RAÇAS & CERRADO
        // ==============================================================
        case 'goiania': {
          // Relevo suave do planalto
          this.drawHills(ctx, bx, horizonY, [
            { x: 0, y: 0 },
            { cx: 160, cy: 22, x: 320, y: 18 },
            { cx: 480, cy: 26, x: 640, y: 0 }
          ], isNight, isDusk);

          // Skyline amplo e planejado de Goiânia
          const bldgsGYN = [
            { x: 60, w: 26, h: 46, col: '#1E293B' },
            { x: 90, w: 32, h: 58, col: '#0F172A', spire: true },
            { x: 126, w: 28, h: 48, col: '#334155' },
            { x: 380, w: 32, h: 62, col: '#0F172A', spire: true },
            { x: 416, w: 36, h: 68, col: '#1E293B' },
            { x: 456, w: 28, h: 50, col: '#334155' }
          ];
          this.drawSkyline(ctx, bx, horizonY, bldgsGYN, isNight, isDusk, nowSec);

          // Monumento às Três Raças em bronze e granito (bx + 260)
          const trX = bx + 265;
          ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
          ctx.fillRect(trX - 2, horizonY - 34, 4, 34);
          ctx.fillStyle = isNight ? '#FBBF24' : '#D97706';
          ctx.beginPath();
          ctx.arc(trX, horizonY - 26, 8, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        // ==============================================================
        // 21. PALMAS: PALÁCIO ARAGUAIA, SERRA DO LAJEADO & LAGO
        // ==============================================================
        case 'palmas': {
          // Serra do Lajeado com paredões rochosos
          this.drawHills(ctx, bx, horizonY, [
            { x: 0, y: 0 },
            { cx: 140, cy: 46, x: 280, y: 40 },
            { cx: 420, cy: 50, x: 640, y: 0 }
          ], isNight, isDusk);

          this.drawWater(ctx, bx, horizonY, 14, isNight, isDusk, nowSec, false);

          // Palácio Araguaia majestoso na Praça dos Girassóis (bx + 260)
          const paX = bx + 270;
          ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
          ctx.fillRect(paX - 32, horizonY - 28, 64, 14);
          // Cúpula central
          ctx.fillStyle = isNight ? '#FBBF24' : '#F59E0B';
          ctx.beginPath();
          ctx.arc(paX, horizonY - 28, 14, Math.PI, 0, false);
          ctx.fill();
          ctx.fillStyle = '#EF4444';
          ctx.fillRect(paX - 0.5, horizonY - 46, 1, 4);

          // Ponte da Integração sobre o lago (bx + 420)
          ctx.strokeStyle = isNight ? '#FBBF24' : '#CBD5E1';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(bx + 360, horizonY - 14);
          ctx.lineTo(bx + 540, horizonY - 14);
          ctx.stroke();
          break;
        }

        // ==============================================================
        // 22. CUIABÁ: PANTANAL, CHAPADA DOS GUIMARÃES & CENTRO GEODÉSICO
        // ==============================================================
        case 'cuiaba': {
          // Paredões vermelhos da Chapada dos Guimarães ao fundo
          this.drawHills(ctx, bx, horizonY, [
            { x: 0, y: 0 },
            { cx: 120, cy: 36, x: 260, y: 32 },
            { cx: 380, cy: 40, x: 640, y: 0 }
          ], isNight, isDusk);

          this.drawWater(ctx, bx, horizonY, 12, isNight, isDusk, nowSec, false);

          // Obelisco do Centro Geodésico da América do Sul (bx + 280)
          const cgx = bx + 290;
          ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
          ctx.beginPath();
          ctx.moveTo(cgx - 3, horizonY - 12);
          ctx.lineTo(cgx, horizonY - 42);
          ctx.lineTo(cgx + 3, horizonY - 12);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.arc(cgx, horizonY - 42, 2, 0, Math.PI * 2);
          ctx.fill();

          // Skyline de Cuiabá
          const bldgsCGB = [
            { x: 420, w: 26, h: 44, col: '#1E293B' },
            { x: 450, w: 32, h: 56, col: '#0F172A', spire: true },
            { x: 486, w: 28, h: 46, col: '#334155' }
          ];
          this.drawSkyline(ctx, bx, horizonY - 12, bldgsCGB, isNight, isDusk, nowSec);
          break;
        }

        // ==============================================================
        // 23. CAMPO GRANDE: PARQUE DAS NAÇÕES, ARARAS & CERRADO
        // ==============================================================
        case 'campo_grande': {
          this.drawHills(ctx, bx, horizonY, [
            { x: 0, y: 0 },
            { cx: 140, cy: 24, x: 300, y: 18 },
            { cx: 460, cy: 28, x: 640, y: 0 }
          ], isNight, isDusk);
          this.drawWater(ctx, bx, horizonY, 12, isNight, isDusk, nowSec, false);

          // Monumento das Araras estilizado (arcos/asas e bicos característicos)
          const arX = bx + 265;
          const drawMacaw = (mx, my, h, col, wingCol) => {
            ctx.fillStyle = col;
            ctx.beginPath();
            ctx.moveTo(mx - 3, my);
            ctx.lineTo(mx - 1, my - h);
            ctx.quadraticCurveTo(mx + 4, my - h - 3, mx + 6, my - h + 3);
            ctx.lineTo(mx + 2, my);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = wingCol;
            ctx.fillRect(mx - 2, my - h * 0.65, 3, h * 0.45);
          };
          drawMacaw(arX - 20, horizonY - 12, 24, '#2563EB', '#FACC15');
          drawMacaw(arX, horizonY - 12, 29, '#EAB308', '#2563EB');
          drawMacaw(arX + 20, horizonY - 12, 22, '#DC2626', '#38BDF8');

          // Vegetação do cerrado e skyline de Campo Grande
          this.drawForest(ctx, bx, horizonY - 12, 30, 180, isNight, isDusk);
          const bldgsCGR = [
            { x: 370, w: 28, h: 46, col: '#1E293B' },
            { x: 402, w: 34, h: 60, col: '#0F172A', spire: true },
            { x: 440, w: 26, h: 44, col: '#334155' },
            { x: 470, w: 30, h: 52, col: '#1E293B' }
          ];
          this.drawSkyline(ctx, bx, horizonY - 12, bldgsCGR, isNight, isDusk, nowSec);
          break;
        }

        // ==============================================================
        // 24. PORTO VELHO: AS TRÊS CAIXAS D'ÁGUA & RIO MADEIRA
        // ==============================================================
        case 'porto_velho': {
          this.drawWater(ctx, bx, horizonY, 15, isNight, isDusk, nowSec, false);
          this.drawForest(ctx, bx, horizonY - 15, 0, 640, isNight, isDusk);

          // As Três Caixas d'Água históricas cilíndricas de ferro (bx + 260)
          const pvhX = bx + 270;
          for (let k = -1; k <= 1; k++) {
            const cx = pvhX + k * 22;
            ctx.fillStyle = isNight ? '#0F172A' : '#1E293B';
            ctx.fillRect(cx - 4, horizonY - 28, 2, 13);
            ctx.fillRect(cx + 2, horizonY - 28, 2, 13);
            ctx.fillStyle = isNight ? '#38BDF8' : '#64748B';
            ctx.fillRect(cx - 7, horizonY - 40, 14, 12);
            ctx.beginPath();
            ctx.arc(cx, horizonY - 40, 7, Math.PI, 0, false);
            ctx.fill();
          }

          // Skyline fluvial de Porto Velho
          const bldgsPVH = [
            { x: 430, w: 26, h: 42, col: '#1E293B' },
            { x: 460, w: 32, h: 54, col: '#0F172A', spire: true },
            { x: 496, w: 24, h: 38, col: '#334155' }
          ];
          this.drawSkyline(ctx, bx, horizonY - 15, bldgsPVH, isNight, isDusk, nowSec);
          break;
        }

        // ==============================================================
        // 25. RIO BRANCO: PALÁCIO RIO BRANCO & PASSARELA ESTAIADA
        // ==============================================================
        case 'rio_branco': {
          this.drawWater(ctx, bx, horizonY, 14, isNight, isDusk, nowSec, false);
          this.drawForest(ctx, bx, horizonY - 14, 0, 230, isNight, isDusk);
          this.drawForest(ctx, bx, horizonY - 14, 480, 640, isNight, isDusk);

          // Passarela Joaquim Macedo estaiada sobre o rio (bx + 200)
          this.drawCableBridge(ctx, bx, horizonY - 14, 200, 48, isNight, isDusk);

          // Palácio Rio Branco neoclássico com frontão e colunas (bx + 350)
          const prbX = bx + 350;
          ctx.fillStyle = isNight ? '#CBD5E1' : '#FFFFFF';
          ctx.fillRect(prbX - 28, horizonY - 29, 56, 15);
          // Frontão triangular neoclássico
          ctx.fillStyle = isNight ? '#94A3B8' : '#E2E8F0';
          ctx.beginPath();
          ctx.moveTo(prbX - 18, horizonY - 29);
          ctx.lineTo(prbX, horizonY - 38);
          ctx.lineTo(prbX + 18, horizonY - 29);
          ctx.closePath();
          ctx.fill();
          // Colunas frontais
          ctx.fillStyle = isNight ? '#475569' : '#94A3B8';
          for (let c = -12; c <= 12; c += 6) {
            ctx.fillRect(prbX + c - 1, horizonY - 27, 2, 13);
          }
          // Cúpula central
          ctx.fillStyle = isNight ? '#FBBF24' : '#D97706';
          ctx.beginPath();
          ctx.arc(prbX, horizonY - 38, 6, Math.PI, 0, false);
          ctx.fill();

          this.drawSkyline(ctx, bx, horizonY - 14, [
            { x: 425, w: 24, h: 38, col: '#1E293B' },
            { x: 453, w: 28, h: 46, col: '#0F172A' }
          ], isNight, isDusk, nowSec);
          break;
        }

        // ==============================================================
        // 26. MACAPÁ: MARCO ZERO DO EQUADOR & RIO AMAZONAS
        // ==============================================================
        case 'macapa': {
          this.drawWater(ctx, bx, horizonY, 16, isNight, isDusk, nowSec, false);
          this.drawForest(ctx, bx, horizonY - 16, 20, 180, isNight, isDusk);

          // Obelisco do Marco Zero do Equador com fenda solar (bx + 250)
          const mzX = bx + 250;
          ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
          ctx.beginPath();
          ctx.moveTo(mzX - 7, horizonY - 16);
          ctx.lineTo(mzX - 4, horizonY - 52);
          ctx.lineTo(mzX + 4, horizonY - 52);
          ctx.lineTo(mzX + 7, horizonY - 16);
          ctx.closePath();
          ctx.fill();
          // Abertura circular do equinócio
          ctx.fillStyle = isNight ? '#FDE047' : '#FFEE58';
          ctx.beginPath();
          ctx.arc(mzX, horizonY - 40, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Fortaleza de São José de Macapá com baluartes (bx + 390)
          const fszX = bx + 390;
          ctx.fillStyle = isNight ? '#1E293B' : '#64748B';
          ctx.fillRect(fszX - 38, horizonY - 26, 76, 10);
          ctx.fillStyle = isNight ? '#0F172A' : '#475569';
          ctx.fillRect(fszX - 35, horizonY - 31, 10, 5);
          ctx.fillRect(fszX - 5, horizonY - 30, 10, 4);
          ctx.fillRect(fszX + 25, horizonY - 31, 10, 5);

          this.drawSkyline(ctx, bx, horizonY - 16, [
            { x: 475, w: 24, h: 36, col: '#1E293B' },
            { x: 503, w: 30, h: 46, col: '#0F172A' }
          ], isNight, isDusk, nowSec);
          break;
        }

        // ==============================================================
        // 27. BOA VISTA: MONTE RORAIMA & MONUMENTO AOS PIONEIROS
        // ==============================================================
        case 'boa_vista': {
          // Silhueta monumental do Monte Roraima (tepui com platô reto)
          const rX = bx + 160;
          ctx.fillStyle = isNight ? '#0B1320' : (isDusk ? '#3D1C2A' : '#334155');
          ctx.beginPath();
          ctx.moveTo(rX - 90, horizonY);
          ctx.lineTo(rX - 55, horizonY - 56);
          ctx.lineTo(rX + 55, horizonY - 56);
          ctx.lineTo(rX + 90, horizonY);
          ctx.closePath();
          ctx.fill();
          // Faixa de rocha iluminada no topo tabular do tepui
          ctx.fillStyle = isNight ? '#1E293B' : (isDusk ? '#7C2D12' : '#64748B');
          ctx.fillRect(rX - 54, horizonY - 56, 108, 6);

          this.drawWater(ctx, bx, horizonY, 14, isNight, isDusk, nowSec, false);

          // Monumento aos Pioneiros com fontes d'água (bx + 350)
          const bvbX = bx + 350;
          ctx.fillStyle = isNight ? '#38BDF8' : '#0284C7';
          ctx.fillRect(bvbX - 20, horizonY - 24, 40, 10);
          ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
          ctx.beginPath();
          ctx.moveTo(bvbX - 4, horizonY - 24);
          ctx.lineTo(bvbX, horizonY - 40);
          ctx.lineTo(bvbX + 4, horizonY - 24);
          ctx.closePath();
          ctx.fill();

          this.drawSkyline(ctx, bx, horizonY - 14, [
            { x: 430, w: 26, h: 40, col: '#1E293B' },
            { x: 460, w: 32, h: 52, col: '#0F172A', spire: true },
            { x: 496, w: 24, h: 36, col: '#334155' }
          ], isNight, isDusk, nowSec);
          break;
        }

        // ==============================================================
        // 28. BRASIL GP (INTERLAGOS): REPRESA GUARAPIRANGA, PONTE & SKYLINE
        // ==============================================================
        case 'brasil': {
          this.drawWater(ctx, bx, horizonY, 15, isNight, isDusk, nowSec, true, 3);

          // Ponte pênsil / estaiada iluminada (bx + 80 a 220)
          this.drawSuspensionBridge(ctx, bx, horizonY, 80, 220, 125, 175, 52, 18, isNight, isDusk);

          // Skyline de Interlagos / Marginal Pinheiros com janelas reativas
          const bldgsInterlagos = [
            { x: 260, w: 24, h: 44, col: '#1E293B' },
            { x: 288, w: 32, h: 56, col: '#0F172A', spire: true },
            { x: 324, w: 26, h: 48, col: '#334155' },
            { x: 354, w: 38, h: 64, col: '#0F172A', spire: true },
            { x: 396, w: 28, h: 50, col: '#1E293B' },
            { x: 428, w: 34, h: 60, col: '#334155' }
          ];
          this.drawSkyline(ctx, bx, horizonY - 15, bldgsInterlagos, isNight, isDusk, nowSec);

          // Monumento do MASP estilizado à beira da represa
          const maspB = bx + 520;
          ctx.fillStyle = '#EF4444';
          ctx.fillRect(maspB - 14, horizonY - 26, 3, 11);
          ctx.fillRect(maspB + 14, horizonY - 26, 3, 11);
          ctx.fillRect(maspB - 14, horizonY - 26, 31, 3);
          ctx.fillStyle = isNight ? '#0F172A' : '#1E293B';
          ctx.fillRect(maspB - 11, horizonY - 23, 25, 7);
          break;
        }

        // ==============================================================
        // 29. SERRA BRASILEIRA: PICOS ALPINOS, ARAUCÁRIAS & MIRANTE
        // ==============================================================
        case 'serra': {
          // Picos pontiagudos em múltiplas camadas
          this.drawHills(ctx, bx, horizonY, [
            { x: 0, y: 0 },
            { x: 70, y: 55 },
            { x: 140, y: 35 },
            { x: 230, y: 65 },
            { x: 320, y: 38 },
            { x: 420, y: 72 },
            { x: 520, y: 44 },
            { x: 640, y: 0 }
          ], isNight, isDusk);

          // Floresta densa de araucárias
          this.drawAraucaria(ctx, bx + 50, horizonY, 32, isNight, isDusk);
          this.drawAraucaria(ctx, bx + 80, horizonY, 36, isNight, isDusk);
          this.drawAraucaria(ctx, bx + 120, horizonY, 28, isNight, isDusk);
          this.drawAraucaria(ctx, bx + 350, horizonY, 34, isNight, isDusk);
          this.drawAraucaria(ctx, bx + 380, horizonY, 38, isNight, isDusk);
          this.drawAraucaria(ctx, bx + 420, horizonY, 30, isNight, isDusk);

          // Casario serrano ao pé das montanhas
          this.drawColonialHouses(ctx, bx, horizonY, 170, 5, isNight, isDusk);
          break;
        }

        // ==============================================================
        // 30. CIDADE METRÓPOLE: MEGA SKYLINE CYBER COM JANELAS E VIADUTOS
        // ==============================================================
        case 'noite': {
          const cyberBldgs = [
            { x: 15, w: 26, h: 54, col: '#0F172A', spire: true },
            { x: 44, w: 34, h: 72, col: '#1E293B', spire: true },
            { x: 82, w: 28, h: 60, col: '#0F172A' },
            { x: 114, w: 42, h: 78, col: '#1E293B', spire: true },
            { x: 160, w: 32, h: 56, col: '#0F172A' },
            { x: 196, w: 38, h: 68, col: '#1E293B', spire: true },
            { x: 280, w: 30, h: 58, col: '#0F172A' },
            { x: 314, w: 44, h: 76, col: '#1E293B', spire: true },
            { x: 362, w: 34, h: 64, col: '#0F172A' },
            { x: 400, w: 40, h: 74, col: '#1E293B', spire: true },
            { x: 530, w: 32, h: 58, col: '#0F172A' },
            { x: 566, w: 42, h: 70, col: '#1E293B', spire: true }
          ];
          this.drawSkyline(ctx, bx, horizonY, cyberBldgs, isNight, isDusk, nowSec);

          // Ponte Estaiada Cyber no centro
          this.drawCableBridge(ctx, bx, horizonY, 245, 68, isNight, isDusk);

          // Viaduto suspenso iluminado cortando os prédios
          ctx.strokeStyle = isNight ? '#FBBF24' : '#94A3B8';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(bx, horizonY - 14);
          ctx.lineTo(bx + 640, horizonY - 14);
          ctx.stroke();
          break;
        }

        // ==============================================================
        // 31. SERTÃO: CÂNYONS DO SÃO FRANCISCO & CHAPADA DIAMANTINA
        // ==============================================================
        case 'sertao': {
          // Paredões rochosos avermelhados de cânion
          ctx.fillStyle = isNight ? '#0B1320' : (isDusk ? '#5C2419' : '#9A3412');
          ctx.beginPath();
          ctx.moveTo(bx, horizonY);
          ctx.lineTo(bx + 90, horizonY - 58);
          ctx.lineTo(bx + 180, horizonY - 52);
          ctx.lineTo(bx + 240, horizonY - 28);
          ctx.lineTo(bx + 380, horizonY - 28);
          ctx.lineTo(bx + 440, horizonY - 62);
          ctx.lineTo(bx + 540, horizonY - 58);
          ctx.lineTo(bx + 640, horizonY);
          ctx.closePath();
          ctx.fill();

          // Leito do Rio São Francisco no cânion
          this.drawWater(ctx, bx, horizonY, 14, isNight, isDusk, nowSec, false);

          // Arco de pedra monumental da Chapada Diamantina (bx + 310)
          const arcP = bx + 310;
          ctx.fillStyle = isNight ? '#0F172A' : (isDusk ? '#7C2D12' : '#C2410C');
          ctx.beginPath();
          ctx.arc(arcP, horizonY - 14, 26, Math.PI, 0, false);
          ctx.lineTo(arcP + 26, horizonY - 14);
          ctx.arc(arcP, horizonY - 14, 14, 0, Math.PI, true);
          ctx.closePath();
          ctx.fill();
          break;
        }

        // ==============================================================
        // DEFAULT: RELEVO REGIONAL COM MONUMENTO NATIVO
        // ==============================================================
        default: {
          this.drawHills(ctx, bx, horizonY, [
            { x: 0, y: 0 },
            { cx: 160, cy: 30, x: 320, y: 22 },
            { cx: 480, cy: 36, x: 640, y: 0 }
          ], isNight, isDusk);

          if (def && def.landmarkScenery) {
            ctx.save();
            ctx.translate(bx + 320, horizonY);
            MonumentArt.renderScenery(ctx, def.landmarkScenery, 18, isNight, isDusk);
            ctx.restore();
          }
          break;
        }
      }

      // Preenchimento regional complementar (barcos na água, vegetação típica, luzes de orla)
      this.drawRegionalFill(ctx, bx, horizonY, trackId, isNight, isDusk, nowSec);
    }
    ctx.restore();
  }
};
