  // ==========================================
  // MOTOR CENTRAL LH44 (Car em js/car.js | SaveManager em js/save.js)
  // ==========================================
  class LH44RacingGame {
    constructor() {
      window.game = this;
      window.gameInstance = this;
      this.canvas = document.getElementById('gameCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.audio = new AudioManager();
      this.input = new InputManager(
        () => {
          if (this.audio) {
            const isMenuState = (this.state === 'MENU' || this.state === 'ONLINE_LOBBY' || this.state === 'MODE_SELECT' || this.state === 'DIFFICULTY_SELECT' || this.state === 'TRACK_SELECT' || this.state === 'CUSTOM_SCHEDULE_SELECT' || this.state === 'CAR_SELECT' || this.state === 'COLOR_SELECT' || this.state === 'NAME_INPUT' || this.state === 'SEASON_UPGRADES');
            this.audio.unlockAudio(isMenuState);
          }
        },
        () => this.syncCanvasResolution()
      );
      this.input.game = this;
      this.particlePool = new ParticlePool(180);

      this.state = 'MENU';
      this.titleMenuIndex = 0;
      this.trackIndex = 0;
      this.track = null;
      this.selectedCarIndex = 0;
      this.colorIndex = 1;
      this.playerName = 'JOGADOR';
      this.envCond = 'DIA';
      this.chosenEnvCond = null;
      this.dynamicPhases = [];
      this.envTime = 0;
      this.envCur = null;
      this.envFrom = null;
      this.envBlend = 1;
      this.skyScroll = 0;
      this.setupGroup = 0;
      this.setupCooldown = 0;
      this.songIndex = 0;
      this.nameInput = document.getElementById('player-name-input');
      if (this.nameInput) {
        this.nameInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            this.confirmName();
          }
        });
      }
      this.nameWrapper = document.getElementById('player-name-wrapper');
      if (this.nameInput) {
        try {
          const savedName = localStorage.getItem('lh44_player_name');
          if (savedName) this.nameInput.value = savedName;
        } catch (_) {}
      }
      this.menuCameraZ = 0;

      // ==========================================
      // SISTEMA DE SAVE, PAUSA & RESUME COUNTDOWN
      // ==========================================
      this.activeSaveSlot = 1;
      this.slotSelectMode = 'CONTINUE'; // 'NEW' ou 'CONTINUE'
      this.selectedSlotIndex = 0;       // 0, 1, 2 para Slots 1, 2, 3
      this.slotDeleteConfirm = null;    // slot aguardando exclusão
      this.slotOverwriteConfirm = null; // slot aguardando substituição
      this.mainMenuSelection = 0;       // 0: INICIAR, 1: CONTINUAR
      this.pauseMenuIndex = 0;          // 0: CONTINUAR, 1: REINICIAR, 2: CONFIG, 3: SAIR
      this.pauseDialog = null;          // null, 'CONFIRM_RESTART', 'CONFIRM_EXIT'
      this.pauseDialogIndex = 0;        // opção selecionada no diálogo
      this.resumeCountdown = 0;         // Timer regressivo 3.0s
      this.lastResumeInt = 4;

      // Vinculação dos botões de áudio do menu de configurações
      const musicBtn = document.getElementById('music-toggle-btn');
      const sfxBtn = document.getElementById('sfx-toggle-btn');
      const syncAudioUI = () => {
        if (musicBtn && this.audio) {
          const mOn = this.audio.musicEnabled;
          musicBtn.textContent = mOn ? '🎵 MÚSICA: LIGADA' : '🔇 MÚSICA: DESLIGADA';
          musicBtn.classList.toggle('off', !mOn);
        }
        if (sfxBtn && this.audio) {
          const sOn = this.audio.enabled;
          sfxBtn.textContent = sOn ? '🔊 EFEITOS: LIGADOS' : '🔇 EFEITOS: DESLIGADOS';
          sfxBtn.classList.toggle('off', !sOn);
        }
      };
      if (musicBtn) {
        musicBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.audio) {
            this.audio.toggleMusic();
            syncAudioUI();
          }
        });
      }
      if (sfxBtn) {
        sfxBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.audio) {
            this.audio.enabled = !this.audio.enabled;
            if (!this.audio.enabled) this.audio.silenceEffects();
            else this.audio.playBeep(440, 0.08);
            syncAudioUI();
          }
        });
      }
      syncAudioUI();

      this.pauseBtn = document.getElementById('pause-btn');
      this.player = null;
      this.cars = [];

      this.championshipPoints = new Array(TOTAL_RACERS).fill(0);
      this.lastRacePositions = [];
      this.seasonBots = [];
      this.diffMode = 'NORMAL';
      this.selectedDiffIndex = 0;
      this.lastLapAlertTimer = 0;
      this.isLastLapBanner = false;
      this.menuFadeAlpha = 0;
      this.menuFadeState = 'idle';
      this.menuFadeTargetState = null;
      this.menuFadeOnMid = null;
      this.menuFadeDuration = 0.22;
      this.endingTimer = 0;
      this.endingRank = 1;
      this.endingFireworks = [];
      this.confetti = [];
      this.showFPS = false;
      try { this.showFPS = (localStorage.getItem('lh44_show_fps') === 'true'); } catch (_) {}
      this.fps = 60;
      this.fpsFrames = 0;
      this.fpsLastTime = performance.now();
      this.lastRenderTime = performance.now();

      // Limite de FPS: 60 FPS cravados vs Aberto (taxa nativa da tela como 120Hz)
      this.fpsLimit = 60;
      try {
        const savedLimit = localStorage.getItem('lh44_fps_limit');
        if (savedLimit === 'open') {
          this.fpsLimit = 0;
        } else if (savedLimit === '60') {
          this.fpsLimit = 60;
        } else {
          this.fpsLimit = 60;
        }
      } catch (_) {}

      const attachSafeTap = (btn, action) => {
        let startX = 0, startY = 0, moved = false, tapped = false;
        btn.addEventListener('touchstart', (e) => {
          if (!e.touches[0]) return;
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          moved = false;
          tapped = false;
        }, { passive: true });
        btn.addEventListener('touchmove', (e) => {
          if (!e.touches[0]) return;
          if (Math.abs(e.touches[0].clientX - startX) > 8 || Math.abs(e.touches[0].clientY - startY) > 8) {
            moved = true;
          }
        }, { passive: true });
        btn.addEventListener('touchend', (e) => {
          if (!moved) {
            tapped = true;
            action(e);
          }
        }, { passive: false });
        btn.addEventListener('click', (e) => {
          if (tapped) { tapped = false; return; }
          action(e);
        });
      };

      const fpsLimitBtn = document.getElementById('fps-limit-btn');
      if (fpsLimitBtn) {
        const updateFpsLimitBtn = () => {
          fpsLimitBtn.textContent = (this.fpsLimit === 60) ? 'TRAVA: 60 FPS' : 'TRAVA: ABERTO';
          fpsLimitBtn.style.color = (this.fpsLimit === 60) ? '#00E5FF' : '#FFD700';
          fpsLimitBtn.style.borderColor = (this.fpsLimit === 60) ? '#00B4D8' : '#FFA000';
        };
        updateFpsLimitBtn();
        const toggleFpsLimit = (e) => {
          if (e && e.stopPropagation) e.stopPropagation();
          this.fpsLimit = (this.fpsLimit === 60) ? 0 : 60;
          try { localStorage.setItem('lh44_fps_limit', this.fpsLimit === 60 ? '60' : 'open'); } catch (_) {}
          updateFpsLimitBtn();
          fpsLimitBtn.blur();
        };
        attachSafeTap(fpsLimitBtn, toggleFpsLimit);
      }

      // Sincronização Vertical (VSync)
      this.vsyncEnabled = true;
      try {
        const savedVsync = localStorage.getItem('lh44_vsync');
        if (savedVsync === 'false') this.vsyncEnabled = false;
      } catch (_) {}

      const vsyncBtn = document.getElementById('vsync-btn');
      if (vsyncBtn) {
        const updateVsyncBtn = () => {
          vsyncBtn.textContent = this.vsyncEnabled ? 'VSYNC: LIGADO' : 'VSYNC: DESLIGADO';
          vsyncBtn.style.color = this.vsyncEnabled ? '#69F0AE' : '#FF5252';
          vsyncBtn.style.borderColor = this.vsyncEnabled ? '#00E676' : '#D32F2F';
        };
        updateVsyncBtn();
        const toggleVsync = (e) => {
          if (e && e.stopPropagation) e.stopPropagation();
          this.vsyncEnabled = !this.vsyncEnabled;
          try { localStorage.setItem('lh44_vsync', this.vsyncEnabled ? 'true' : 'false'); } catch (_) {}
          updateVsyncBtn();
          vsyncBtn.blur();
        };
        attachSafeTap(vsyncBtn, toggleVsync);
      }

      const fpsBtn = document.getElementById('fps-toggle-btn');
      if (fpsBtn) {
        const updateFpsBtn = () => {
          fpsBtn.textContent = this.showFPS ? 'HUD FPS: ON' : 'HUD FPS: OFF';
          fpsBtn.style.color = this.showFPS ? '#69F0AE' : '#90A4AE';
          fpsBtn.style.borderColor = this.showFPS ? '#00E676' : '#546E7A';
        };
        updateFpsBtn();
        const toggleFps = (e) => {
          if (e && e.stopPropagation) e.stopPropagation();
          this.showFPS = !this.showFPS;
          try { localStorage.setItem('lh44_show_fps', this.showFPS ? 'true' : 'false'); } catch (_) {}
          updateFpsBtn();
          fpsBtn.blur();
        };
        attachSafeTap(fpsBtn, toggleFps);
      }

      // Seletor de Qualidade Gráfica / Resolução Interna (LEVE / PADRÃO / ULTRA)
      this.renderQuality = 'NORMAL';
      try {
        const savedQuality = localStorage.getItem('lh44_render_quality');
        if (savedQuality === 'LOW' || savedQuality === 'NORMAL' || savedQuality === 'HIGH') {
          this.renderQuality = savedQuality;
        }
      } catch (_) {}
      const applyRenderQuality = () => {
        if (this.renderQuality === 'LOW') RENDER_SCALE = 1.3;
        else if (this.renderQuality === 'HIGH') RENDER_SCALE = 3.0;
        else RENDER_SCALE = IS_MOBILE_CLIENT ? 1.8 : 2.5;
        this.syncCanvasResolution();
      };
      applyRenderQuality();

      const qualityBtn = document.getElementById('quality-btn');
      if (qualityBtn) {
        const updateQualityBtn = () => {
          const labels = { LOW: 'QUALIDADE: LEVE (1.3x)', NORMAL: 'QUALIDADE: PADRÃO', HIGH: 'QUALIDADE: ULTRA (3.0x)' };
          const colors = { LOW: '#FFD700', NORMAL: '#00E5FF', HIGH: '#69F0AE' };
          const borders = { LOW: '#F59E0B', NORMAL: '#00B4D8', HIGH: '#00E676' };
          qualityBtn.textContent = labels[this.renderQuality] || labels.NORMAL;
          qualityBtn.style.color = colors[this.renderQuality] || colors.NORMAL;
          qualityBtn.style.borderColor = borders[this.renderQuality] || borders.NORMAL;
        };
        updateQualityBtn();
        const toggleQuality = (e) => {
          if (e && e.stopPropagation) e.stopPropagation();
          const order = ['NORMAL', 'HIGH', 'LOW'];
          const nextIdx = (order.indexOf(this.renderQuality) + 1) % order.length;
          this.renderQuality = order[nextIdx];
          try { localStorage.setItem('lh44_render_quality', this.renderQuality); } catch (_) {}
          applyRenderQuality();
          updateQualityBtn();
          qualityBtn.blur();
        };
        attachSafeTap(qualityBtn, toggleQuality);
      }
      this.fixedStep = 1 / 60;
      this.accumulator = 0;
      this.initSeasonRoster();

      this.gameMode = 'CHAMPIONSHIP'; // 'CHAMPIONSHIP' ou 'QUICK_RACE'
      this.netplay = (typeof NetplayManager !== 'undefined') ? new NetplayManager() : null;
      this.isOnlineRace = false;
      this.remoteCar = null;
      this.onlineSubMode = 'CHOICE';
      this.onlineRaceSeq = 0;
      this.customChampionship = false;
      this.customSchedule = [];
      this.customCursorIndex = 0;
      this.customScheduleWarnTimer = 0;
      this.selectedModeIndex = 0;     // 0: Campeonato F1, 1: Corrida Rápida
      this.selectedQuickTrackIndex = 0; // 0: Brasil GP, 1: Serra, 2: Noite
      this.seasonSchedule = [];
      this.seasonStage = 0;

      this.countdown = 3.6;
      this.startLightsStage = 0;
      this.greenLightsTimer = 0;

      this.raceTimer = 0;
      this.currentLapTime = 0;
      this.bestLapTime = 0;
      this.lastLapTime = 0;

      this.cameraRoll = 0;
      this.shake = 0;
      this.smoothCurveScreenX = 0;
      this.smoothRoadY = INTERNAL_HEIGHT - 12;

      this.finishingRace = false;
      this.finishTimer = 0;
      this.finishDuration = 3.0;
      this.finishCamOriginZ = 0;
      this.finishCameraX = 0;
      this.finishCameraY = 0;
      this.finishFadeAlpha = 0;

      this.lapBannerTimer = 0;
      this.lapBannerText = '';
      this.f1LeaderboardToggled = false;
      this.isQualifying = false;
      this.qualifiedGridPos = 0;
      this.qualifiedLapTime = 0;
      this.mirrorTrack = false;
      this.newlyUnlockedAchievements = [];
      this.currentCameraDepth = CAMERA_DEPTH;

      this.syncCanvasResolution();
      CarArt.warmUp(CAR_MODELS);

      this.lastTime = performance.now();
      this.boundGameLoop = this.gameLoop.bind(this);

      this.loadTrack(this.trackIndex);
      this.updateEnv(0.016);

      // O desbloqueio e autoplay da música tema são gerenciados centralmente em js/main.js
      this.scheduleNextFrame();
    }

    vibrate(pattern) {
      try {
        if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
          navigator.vibrate(pattern);
        }
      } catch (_) {}
    }

    pauseGame() {
      // Se a corrida já acabou ou está na sequência de bandeirada, não pausa
      if (this.finishingRace || (this.player && this.player.finished)) {
        return;
      }
      if (this.state === 'RACING' || this.state === 'RESUME_COUNTDOWN') {
        this.state = 'PAUSED';
        this.pauseMenuIndex = 0;
        this.pauseDialog = null;
        this.pauseDialogIndex = 0;
        if (this.audio) {
          this.audio.silenceEffects();
          this.audio.playBeep(300, 0.1);
        }
      }
    }

    triggerResumeCountdown() {
      if (this.state === 'PAUSED') {
        // Se a corrida já acabou ou está no pós-bandeirada, volta direto sem contagem regressiva
        if (this.finishingRace || (this.player && this.player.finished)) {
          this.state = 'RACING';
          this.pauseDialog = null;
          return;
        }
        this.state = 'RESUME_COUNTDOWN';
        this.resumeCountdown = 3.0;
        this.lastResumeInt = 4;
        this.pauseDialog = null;
        if (this.audio) {
          this.audio.silenceEffects();
          this.audio.playCountdownBeep(false);
        }
      }
    }

    handlePauseStartKey() {
      if (this.state === 'RACING') {
        this.pauseGame();
      } else if (this.state === 'PAUSED') {
        if (this.pauseDialog) {
          this.pauseDialog = null;
        } else {
          this.triggerResumeCountdown();
        }
      } else if (this.state === 'RESUME_COUNTDOWN') {
        this.pauseGame();
      }
    }

    handlePauseBackKey() {
      if (this.state === 'PAUSED') {
        if (this.pauseDialog) {
          this.pauseDialog = null;
          this.audio.playBeep(330, 0.06);
        } else {
          this.triggerResumeCountdown();
        }
      }
    }

    executePauseMenuAction(idx) {
      if (idx === 0) {
        this.triggerResumeCountdown();
      } else if (idx === 1) {
        this.pauseDialog = 'CONFIRM_RESTART';
        this.pauseDialogIndex = 0;
        this.audio.playBeep(440, 0.08);
      } else if (idx === 2) {
        const gearBtn = document.getElementById('gear-btn');
        if (gearBtn) gearBtn.click();
      } else if (idx === 3) {
        this.pauseDialog = 'CONFIRM_EXIT';
        this.pauseDialogIndex = 0;
        this.audio.playBeep(440, 0.08);
      }
    }

    executePauseDialogAction(dialog, actionIdx) {
      if (dialog === 'CONFIRM_RESTART') {
        if (actionIdx === 0) {
          this.pauseDialog = null;
          if (this.audio) this.audio.playBeep(523, 0.12);
          if (this.isOnlineRace && this.netplay && this.netplay.connected) {
            const nextSeq = ((this.netplay.meta && this.netplay.meta.raceSeq) || 0) + 1;
            if (this.netplay.meta) {
              this.netplay.meta.status = 'RACING';
              this.netplay.meta.raceSeq = nextSeq;
            }
            this.netplay.updateMeta({ status: 'RACING', raceSeq: nextSeq });
            this.startOnlineRace();
            return;
          }
          this.loadTrack(this.trackIndex);
          this.startRaceCountdown();
        } else {
          this.pauseDialog = null;
          if (this.audio) this.audio.playBeep(330, 0.06);
        }
      } else if (dialog === 'CONFIRM_EXIT') {
        if (this.gameMode === 'CHAMPIONSHIP') {
          if (actionIdx === 0) {
            // SALVAR E SAIR
            this.saveCurrentChampionship();
            this.pauseDialog = null;
            if (this.audio) {
              this.audio.musicPlaying = false;
              this.audio.silenceEffects();
              this.audio.stopRaceEffects();
              this.audio.playTitleMusic();
            }
            this.loadTrack(0);
            this.menuCameraZ = 0;
            this.state = 'MENU';
            this.menuFadeAlpha = 0;
            this.menuFadeState = 'idle';
            if (this.input) this.input.clearPulses();
          } else if (actionIdx === 1) {
            // SAIR SEM SALVAR
            this.pauseDialog = null;
            if (this.audio) {
              this.audio.musicPlaying = false;
              this.audio.silenceEffects();
              this.audio.stopRaceEffects();
              this.audio.playTitleMusic();
            }
            this.loadTrack(0);
            this.menuCameraZ = 0;
            this.state = 'MENU';
            this.menuFadeAlpha = 0;
            this.menuFadeState = 'idle';
            if (this.input) this.input.clearPulses();
          } else {
            // CANCELAR
            this.pauseDialog = null;
            if (this.audio) this.audio.playBeep(330, 0.06);
          }
        } else {
          if (actionIdx === 0) {
            // SAIR (MODO RÁPIDO)
            this.pauseDialog = null;
            if (this.audio) {
              this.audio.musicPlaying = false;
              this.audio.silenceEffects();
              this.audio.stopRaceEffects();
              this.audio.playTitleMusic();
            }
            this.loadTrack(0);
            this.menuCameraZ = 0;
            this.state = 'MENU';
            this.menuFadeAlpha = 0;
            this.menuFadeState = 'idle';
            if (this.input) this.input.clearPulses();
          } else {
            this.pauseDialog = null;
            if (this.audio) this.audio.playBeep(330, 0.06);
          }
        }
      }
    }

    serializeSeasonBots() {
      if (!this.seasonBots || this.seasonBots.length === 0) return [];
      return this.seasonBots.map(b => {
        let mIdx = CAR_MODELS.findIndex(m => m.id === (b.model ? b.model.id : '') || m.name === (b.model ? b.model.name : ''));
        if (mIdx < 0) mIdx = 0;
        return {
          driverName: b.driverName,
          driverCode: b.driverCode,
          modelIndex: mIdx,
          bodyColor: b.bodyColor,
          baseAiSkill: b.baseAiSkill,
          aiPersonality: b.aiPersonality
        };
      });
    }

    deserializeSeasonBots(savedBots) {
      if (!savedBots || !Array.isArray(savedBots) || savedBots.length < 19) return false;
      this.seasonBots = savedBots.map(sb => {
        const model = CAR_MODELS[sb.modelIndex] || CAR_MODELS[0];
        return {
          driverName: sb.driverName,
          driverCode: sb.driverCode,
          model: model,
          bodyColor: sb.bodyColor,
          baseAiSkill: sb.baseAiSkill,
          aiPersonality: sb.aiPersonality || 'TECHNICAL'
        };
      });
      return true;
    }

    computeNextGridOrder() {
      if (!this.seasonBots || this.seasonBots.length < 19) return;
      // REGRA DE GRID:
      // O Jogador é SEMPRE mantido em P20 (último colocado, lado direito da pista, desafio arcade clássico).
      // A ordenação de P1 a P19 considera ESTRITAMENTE os 19 bots rivais entre si:
      // O bot líder (com mais pontos no campeonato entre os bots) larga na Pole (P1).
      // Os demais seguem em ordem decrescente até o 19º bot em P19 (ao lado do jogador).
      // Mesmo que o jogador lidere o campeonato, o jogador NUNCA larga em P1, mantendo P20 fixo.
      const botIndices = Array.from({ length: 19 }, (_, i) => i);
      botIndices.sort((a, b) => {
        const ptsA = (this.championshipPoints && this.championshipPoints[a + 1] !== undefined) ? this.championshipPoints[a + 1] : 0;
        const ptsB = (this.championshipPoints && this.championshipPoints[b + 1] !== undefined) ? this.championshipPoints[b + 1] : 0;
        if (ptsB !== ptsA) return ptsB - ptsA;
        return a - b;
      });
      this.seasonGridOrder = botIndices;
    }

    saveCurrentChampionship() {
      if (this.gameMode !== 'CHAMPIONSHIP') return false;
      const slotNum = this.activeSaveSlot || 1;
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

      const serializedBots = this.serializeSeasonBots();
      const gridOrder = (this.seasonGridOrder && this.seasonGridOrder.length === 19)
        ? [...this.seasonGridOrder]
        : Array.from({ length: 19 }, (_, i) => i);

      const data = {
        playerName: this.playerName || 'JOGADOR',
        gameMode: this.gameMode,
        isCustomChampionship: !!this.customChampionship,
        difficulty: this.diffMode,
        selectedCarIndex: this.selectedCarIndex,
        colorIndex: this.colorIndex,
        chosenEnvCond: this.chosenEnvCond || this.envCond || 'DIA',
        seasonStage: this.seasonStage,
        seasonSchedule: this.seasonSchedule,
        championshipPoints: this.championshipPoints,
        lastTrackIndex: this.trackIndex,
        nextTrackIndex: (this.seasonSchedule && this.seasonSchedule[this.seasonStage]) !== undefined ? this.seasonSchedule[this.seasonStage] : this.trackIndex,
        playerRank: pRank,
        totalPoints: pPoints,
        seasonBots: serializedBots,
        seasonGridOrder: gridOrder,
        playerCredits: this.playerCredits || 0,
        playerUpgrades: this.playerUpgrades ? { ...this.playerUpgrades } : { engine: 0, tires: 0, turbo: 0 }
      };
      return SaveManager.saveSlot(slotNum, data);
    }

    loadFromSave(slotData) {
      if (!slotData) return;
      this.activeSaveSlot = slotData.slotNum || 1;
      this.playerName = slotData.playerName || 'JOGADOR';
      this.selectedCarIndex = slotData.selectedCarIndex || 0;
      this.colorIndex = slotData.colorIndex !== undefined ? slotData.colorIndex : 1;
      this.gameMode = slotData.gameMode || 'CHAMPIONSHIP';
      this.diffMode = slotData.difficulty || 'NORMAL';
      this.seasonStage = slotData.seasonStage !== undefined ? slotData.seasonStage : 0;
      this.seasonSchedule = (slotData.seasonSchedule && slotData.seasonSchedule.length > 0)
        ? [...slotData.seasonSchedule]
        : this.getChampionshipSchedule();
      this.customChampionship = (slotData.isCustomChampionship !== undefined)
        ? !!slotData.isCustomChampionship
        : (this.seasonSchedule.length < TRACK_DEFINITIONS.length);
      this.championshipPoints = (slotData.championshipPoints && slotData.championshipPoints.length > 0)
        ? [...slotData.championshipPoints]
        : new Array(TOTAL_RACERS).fill(0);

      // Restaurar exatamente os 19 bots da temporada salva
      if (slotData.seasonBots && Array.isArray(slotData.seasonBots) && slotData.seasonBots.length >= 19) {
        this.deserializeSeasonBots(slotData.seasonBots);
      } else if (!this.seasonBots || this.seasonBots.length < 19) {
        this.initSeasonRoster(this.selectedCarIndex);
      }

      // Restaurar a ordem exata do grid salva
      if (slotData.seasonGridOrder && Array.isArray(slotData.seasonGridOrder) && slotData.seasonGridOrder.length === 19) {
        this.seasonGridOrder = [...slotData.seasonGridOrder];
      } else {
        this.seasonGridOrder = Array.from({ length: 19 }, (_, i) => i);
      }

      this.playerCredits = slotData.playerCredits !== undefined ? slotData.playerCredits : 0;
      this.playerUpgrades = slotData.playerUpgrades ? { ...slotData.playerUpgrades } : { engine: 0, tires: 0, turbo: 0 };
      this.chosenEnvCond = slotData.chosenEnvCond || 'DIA';
      this.envCond = this.chosenEnvCond;
      if (this.envCond === 'DINAMICO') {
        this.initDynamicWeather();
      } else {
        this.envCur = null;
        this.envFrom = null;
        this.envBlend = 1;
        this.envKey = '';
      }
      this.updateEnv(0.016);

      this.trackIndex = this.seasonSchedule[this.seasonStage] || 0;
      this.loadTrack(this.trackIndex);
      this.fadeTransition('RACE_SETUP');
    }

    confirmName() {
      if (this.state !== 'NAME_INPUT') return;
      if (this.nameInput) {
        const val = this.nameInput.value.trim().toUpperCase();
        this.playerName = val || 'JOGADOR';
        try { localStorage.setItem('lh44_player_name', this.playerName); } catch (_) {}
        this.nameInput.blur();
      }
      if (this.nameWrapper) this.nameWrapper.classList.remove('show');
      this.audio.playBeep(523, 0.12);
      if (this.gameMode === 'CHAMPIONSHIP' && (this.seasonStage === 0 || !this.seasonBots || this.seasonBots.length < 19)) {
        this.initSeasonRoster(this.selectedCarIndex);
      }
      this.fadeTransition('RACE_SETUP');
      this.setupCooldown = 0.55;
      this.setupGroup = 0;
      this.audio.stopTitleMusic();
      this.audio.musicPlaying = true;
      if (this.audio && typeof this.audio.setSong === 'function') {
        this.audio.setSong(this.songIndex);
      }
      if (this.input) {
        this.input.lastCanvasClick = null;
        this.input.enter = false;
        this.input.justPressedEnter = false;
        this.input.clearPulses();
      }
    }

    get songIndex() {
      return (this.audio && typeof this.audio.songIndex === 'number') ? this.audio.songIndex : 0;
    }
    set songIndex(idx) {
      if (this.audio && typeof this.audio.setSong === 'function') {
        this.audio.setSong(idx);
      }
    }

    // Ajusta dinamicamente a resolução interna em Alta Definição (RENDER_SCALE = 3x -> 1152x648+)
    // mantendo as coordenadas lógicas intactas e leves para Intel HD Graphics e Mobile!
    syncCanvasResolution() {
      if (!this.canvas) return;
      const vp = document.getElementById('viewport');
      let targetW = REF_WIDTH;
      if (vp) {
        const w = vp.clientWidth || window.innerWidth;
        const h = vp.clientHeight || window.innerHeight;
        if (w > 0 && h > 0) {
          const aspect = w / h;
          targetW = Math.max(REF_WIDTH, Math.min(540, Math.round(INTERNAL_HEIGHT * aspect)));
        }
      }
      const backingW = Math.round(targetW * RENDER_SCALE);
      const backingH = Math.round(INTERNAL_HEIGHT * RENDER_SCALE);
      if (INTERNAL_WIDTH !== targetW || this.canvas.width !== backingW || this.canvas.height !== backingH) {
        INTERNAL_WIDTH = targetW;
        this.canvas.width = backingW;
        this.canvas.height = backingH;
      }
    }

    initSeasonRoster(playerModelIndex = -1) {
      this.seasonBots = [];
      const chosenIndex = (playerModelIndex >= 0) ? playerModelIndex : this.selectedCarIndex;
      const availableModels = CAR_MODELS.filter((_, idx) => idx !== chosenIndex);
      for (let i = availableModels.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableModels[i], availableModels[j]] = [availableModels[j], availableModels[i]];
      }
      const DRIVER_TRAITS = {
        SEN: 'AGGRESSIVE',
        VER: 'AGGRESSIVE',
        ALO: 'AGGRESSIVE',
        MON: 'AGGRESSIVE',
        SAT: 'AGGRESSIVE',
        RUS: 'AGGRESSIVE',
        HAM: 'TECHNICAL',
        SCH: 'TECHNICAL',
        RAI: 'TECHNICAL',
        FIT: 'TECHNICAL',
        BUT: 'TECHNICAL',
        VET: 'TECHNICAL',
        SAI: 'TECHNICAL',
        BAR: 'PRESSURE_PRONE',
        BOT: 'PRESSURE_PRONE',
        NOR: 'PRESSURE_PRONE',
        KUB: 'PRESSURE_PRONE',
        ANT: 'PRESSURE_PRONE',
        BOR: 'PRESSURE_PRONE'
      };
      const personalities = ['AGGRESSIVE', 'TECHNICAL', 'PRESSURE_PRONE'];
      for (let i = 0; i < F1_DRIVERS.length && i < 19; i++) {
        const drv = F1_DRIVERS[i];
        const assignedModel = availableModels[i % availableModels.length] || CAR_MODELS[0];
        const randColor = BOT_BODY_COLORS[i % BOT_BODY_COLORS.length];
        const baseSkill = 0.98 - (i * 0.007) + (Math.random() - 0.5) * 0.035;
        const pers = DRIVER_TRAITS[drv.code] || personalities[i % 3];
        this.seasonBots.push({
          driverName: drv.name,
          driverCode: drv.code,
          model: assignedModel,
          bodyColor: randColor,
          baseAiSkill: baseSkill,
          aiPersonality: pers
        });
      }
      // Ordem inicial do grid da temporada (P1 ao P19 ordenados por habilidade do piloto)
      this.seasonGridOrder = Array.from({ length: 19 }, (_, i) => i);
    }

    getChampionshipSchedule() {
      // Retorna todos os índices de pistas do jogo, garantindo que São Paulo (SP) seja a grande final (última etapa)
      const spIndex = TRACK_DEFINITIONS.findIndex(t => t.id === 'sao_paulo' || t.stateCode === 'SP');
      const schedule = [];
      for (let i = 0; i < TRACK_DEFINITIONS.length; i++) {
        if (i !== spIndex) schedule.push(i);
      }
      if (spIndex !== -1) {
        schedule.push(spIndex);
      }
      return schedule;
    }

    getChampionshipPrizeMultiplier() {
      const total = TRACK_DEFINITIONS.length;
      const stages = (this.seasonSchedule && this.seasonSchedule.length > 0) ? this.seasonSchedule.length : total;
      if (stages >= total) return 1;
      return Math.min(3, Math.max(1, +(Math.sqrt(total / stages)).toFixed(2)));
    }

    startNewChampionshipInSlot(slotNum) {
      this.activeSaveSlot = slotNum;
      if (this.customChampionship) {
        if (!Array.isArray(this.customSchedule)) this.customSchedule = [];
        this.customCursorIndex = 0;
        this.customScheduleWarnTimer = 0;
        this.fadeTransition('CUSTOM_SCHEDULE_SELECT');
        return;
      }
      this.seasonSchedule = this.getChampionshipSchedule();
      this.seasonStage = 0;
      this.trackIndex = this.seasonSchedule[0];
      this.loadTrack(this.trackIndex);
      this.colorIndex = MODEL_DEFAULT_COLOR[CAR_MODELS[this.selectedCarIndex].id] || 0;
      this.fadeTransition('CAR_SELECT');
    }

    loadTrack(index) {
      this.trackIndex = index;
      const def = TRACK_DEFINITIONS[index];
      const useMirror = (this.gameMode !== 'CHAMPIONSHIP' && this.mirrorTrack);
      this.track = TrackBuilder.build(def, useMirror);
      // Preserva a escolha do jogador (ex: DINÂMICO ou clima escolhido), usando o tema padrão da pista apenas se nada foi definido
      if (!this.chosenEnvCond) {
        this.chosenEnvCond = (def && def.theme) ? def.theme : 'DIA';
      }
      this.envCond = this.chosenEnvCond;
    }

    setupRaceGrid() {
      const selectedModel = CAR_MODELS[this.selectedCarIndex];
      this.cars = [];
      this.finishOrder = [];

      if (!this.seasonBots || this.seasonBots.length < 19) {
        this.initSeasonRoster();
      }

      let botModels = [];
      if (this.gameMode === 'CHAMPIONSHIP') {
        botModels = this.seasonBots.map(b => b.model);
      } else {
        const remainingModels = CAR_MODELS.filter((_, idx) => idx !== this.selectedCarIndex);
        for (let i = remainingModels.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [remainingModels[i], remainingModels[j]] = [remainingModels[j], remainingModels[i]];
        }
        botModels = remainingModels;
      }

      const playerSlot = (!this.isQualifying && this.gameMode !== 'TIME_TRIAL' && this.qualifiedGridPos >= 1 && this.qualifiedGridPos <= TOTAL_RACERS)
        ? this.qualifiedGridPos
        : TOTAL_RACERS;

      // 19 Adversários da CPU com seus carros persistentes e únicos (ocupam os 19 slots restantes)
      if (this.gameMode !== 'TIME_TRIAL' && !this.isQualifying) {
        let botSlotIdx = 0;
        for (let slot = 1; slot <= TOTAL_RACERS; slot++) {
          if (slot === playerSlot) continue;
          const bOrder = botSlotIdx++;
          const botIdx = (this.gameMode === 'CHAMPIONSHIP' && this.seasonGridOrder && this.seasonGridOrder[bOrder] !== undefined)
            ? this.seasonGridOrder[bOrder]
            : bOrder;
          const profile = this.seasonBots[botIdx] || this.seasonBots[bOrder];
          const botModel = (this.gameMode === 'CHAMPIONSHIP') ? profile.model : (botModels[bOrder] || profile.model);
          const bot = new Car(botIdx + 1, botModel, false);
          bot.driverName = profile.driverName;
          bot.driverCode = profile.driverCode;
          bot.bodyColor = profile.bodyColor;
          bot.effectiveMaxSpeed = (this.diffMode === 'ADVANCED') ? 280 : (botModel.maxSpeed || 220);
          bot.aiPersonality = profile.aiPersonality || (slot % 3 === 0 ? 'AGGRESSIVE' : (slot % 3 === 1 ? 'TECHNICAL' : 'PRESSURE_PRONE'));
          bot.pressureTimer = 0;
          const rowFromBack = Math.floor((TOTAL_RACERS - slot) / 2);
          const isLeft = (slot % 2 === 1);
          bot.z = 1600 + rowFromBack * GRID_ROW_SPACING + (isLeft ? GRID_STAGGER_Z : 0);
          bot.x = isLeft ? -GRID_COL_X : GRID_COL_X;
          bot.targetX = bot.x;
          bot.gridStartX = bot.x;
          bot.speed = 0;
          bot.laps = 0;
          bot.totalDistance = bot.z;
          bot.nextLapTarget = START_LINE_Z + this.track.totalLength;
          bot.finishTime = 0;
          bot.steerAngle = 0;
          bot.nitroCharges = 3;
          bot.nitroTimer = 0;
          bot.nitroDecayTimer = 0;
          bot.isNitro = false;
          bot.nitroCooldown = 3.5 + Math.random() * 5.0;
          bot.inSlipstream = false;
          bot.slipstreamIntensity = 0;
          bot.slipstreamDecayTimer = 0;
          bot.slipstreamStoredIntensity = 0;
          bot.slipstreamPeakSpeed = 0;
          bot.launchDelay = 0.04 + ((slot - 1) * 0.01) + Math.random() * 0.14;
          bot.aiSkill = Math.max(0.78, Math.min(0.99, profile.baseAiSkill + (Math.random() - 0.5) * 0.025));
          this.cars.push(bot);
        }
      }

      // Aplica bônus de upgrades do campeonato ao carro do jogador (exclusivo do Modo Normal)
      const isNormalMode = (this.diffMode === 'NORMAL');
      const up = (isNormalMode && this.playerUpgrades) ? this.playerUpgrades : { engine: 0, tires: 0, turbo: 0 };
      const engLvl = Math.max(0, Math.min(3, up.engine || 0));
      const modelSpeedBonuses = (typeof MODEL_ENGINE_SPEED_BONUS !== 'undefined' && MODEL_ENGINE_SPEED_BONUS[selectedModel.id])
        ? MODEL_ENGINE_SPEED_BONUS[selectedModel.id]
        : [0, 8, 16, 24];
      const engineBonusSpeed = isNormalMode ? (modelSpeedBonuses[engLvl] || 0) : 0;
      const engineBonusAccel = isNormalMode ? (engLvl * 0.05) : 0;
      const tireBonusGrip = isNormalMode ? ((up.tires || 0) * 0.06) : 0;
      const turboBonusDuration = isNormalMode ? ((up.turbo || 0) * 0.60) : 0;

      // O JOGADOR COMEÇA EM ÚLTIMO LUGAR (P20) COM O CARRO E COR ESCOLHIDOS!
      this.player = new Car(0, selectedModel, true);
      this.player.driverName = (this.playerName || 'LEANDRO').slice(0, 12);
      const cleanCode = (this.playerName || 'LEA').replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase();
      this.player.driverCode = cleanCode.length === 3 ? cleanCode : (cleanCode + '___').slice(0, 3);
      this.player.bodyColor = CAR_COLORS[this.colorIndex].hex;
      this.player.effectiveMaxSpeed = (this.diffMode === 'ADVANCED') ? 280 : ((selectedModel.maxSpeed || 220) + engineBonusSpeed);
      this.player.accelMultiplier = 1.0 + engineBonusAccel;
      this.player.gripMultiplier = 1.0 + tireBonusGrip;
      this.player.nitroDurationBonus = turboBonusDuration;
      const pRowFromBack = Math.floor((TOTAL_RACERS - playerSlot) / 2);
      const pIsLeft = (playerSlot % 2 === 1);
      this.player.z = (this.gameMode === 'TIME_TRIAL' || this.isQualifying)
        ? 1600
        : (1600 + pRowFromBack * GRID_ROW_SPACING + (pIsLeft ? GRID_STAGGER_Z : 0));
      this.player.x = (this.gameMode === 'TIME_TRIAL' || this.isQualifying) ? 0 : (pIsLeft ? -GRID_COL_X : GRID_COL_X);
      this.player.targetX = this.player.x;
      this.player.gridStartX = this.player.x;
      this.player.speed = 0;
      this.player.laps = 0;
      this.player.totalDistance = this.player.z;
      this.player.nextLapTarget = START_LINE_Z + this.track.totalLength;
      this.player.finishTime = 0;
      this.player.steerAngle = 0;
      this.player.inSlipstream = false;
      this.player.slipstreamIntensity = 0;
      this.player.slipstreamDecayTimer = 0;
      this.player.slipstreamStoredIntensity = 0;
      this.player.slipstreamPeakSpeed = 0;
      this.player.nitroCharges = 3;
      this.player.nitroTimer = 0;
      this.player.nitroDecayTimer = 0;
      this.cars.push(this.player);

      this.currentGhostTrail = [];
      this.ghostRecordTimer = 0;

      this.playerRenderPos = { x: INTERNAL_WIDTH / 2, y: INTERNAL_HEIGHT - 32 };
      this.smoothCurveScreenX = 0;
      this.foregroundBots = [];
      if (this.track && this.track.segments) {
        for (let i = 0; i < this.track.segments.length; i++) {
          this.track.segments[i].skidUntil = 0;
        }
      }

      this.raceTimer = 0;
      this.currentLapTime = 0;
      this.bestLapTime = 0;
      this.lastLapTime = 0;
      this.lapBannerTimer = 0;
      this.greenLightsTimer = 0;
      this.finishingRace = false;
      this.finishTimer = 0;
      this.finishFadeAlpha = 0;
      this.f1LeaderboardToggled = false;
      this.particlePool.clear();
    }

    setEnvCond(cond) {
      this.envCond = cond;
      this.chosenEnvCond = cond;
      if (this.envCond === 'DINAMICO') {
        this.initDynamicWeather();
      } else {
        this.envCur = null;
        this.envFrom = null;
        this.envBlend = 1;
        this.envKey = '';
      }
      this.updateEnv(0.016);
    }

    initDynamicWeather() {
      const CHRONO = ['DIA', 'TARDE', 'NOITE'];
      const startIdx = Math.floor(Math.random() * 3);
      this.dynamicPhases = [];
      // Ciclo cronológico natural: DIA -> TARDE -> NOITE -> DIA...
      // Condição meteorológica (limpo, chuva, neve) independente e aleatória a cada fase
      for (let i = 0; i < 24; i++) {
        const hour = CHRONO[(startIdx + i) % 3];
        const r = Math.random();
        const precip = r < 0.45 ? 'LIMPO' : (r < 0.75 ? 'CHUVA' : 'NEVE');
        let preset = hour;
        if (precip === 'CHUVA') {
          preset = (hour === 'DIA') ? 'CHUVA' : (hour === 'TARDE' ? 'CHUVA_TARDE' : 'CHUVA_NOITE');
        } else if (precip === 'NEVE') {
          preset = (hour === 'DIA') ? 'NEVE' : (hour === 'TARDE' ? 'NEVE_TARDE' : 'NEVE_NOITE');
        }
        this.dynamicPhases.push(preset);
      }
      this.envTime = 0;
      this.envCur = null;
      this.envFrom = null;
      this.envBlend = 1;
      this.envKey = '';
    }

    startQualySession() {
      this.isQualifying = true;
      this.startRaceCountdown(true);
    }

    startOnlineRace() {
      if (!this.netplay || !this.netplay.meta) return;
      const meta = this.netplay.meta;
      this.onlineRaceSeq = meta.raceSeq || 1;
      this.netplay.remoteState = null;
      this.netplay.remoteBots = null;
      if (this.netplay.role === 'HOST') {
        this.netplay.clearRaceState();
      }
      this.isOnlineRace = true;
      this.gameMode = 'QUICK_RACE';
      this.diffMode = 'NORMAL';
      this.mirrorTrack = false;
      this.isQualifying = false;
      this.qualifiedGridPos = 0;

      this.trackIndex = meta.trackIndex || 0;
      this.chosenEnvCond = meta.envCond || 'DIA';
      this.envCond = this.chosenEnvCond;
      this.songIndex = meta.songIndex || 0;
      this.loadTrack(this.trackIndex);
      this.envCur = null;
      this.envFrom = null;
      this.envBlend = 1;
      this.envKey = '';
      this.updateEnv(0.016);

      this.setupOnlineRaceGrid();
      this.countdown = 3.6;
      this.startLightsStage = 0;
      this.greenLightsTimer = 0;
      this.raceTimer = 0;
      this.currentLapTime = 0;
      this.bestLapTime = 0;
      this.lastLapTime = 0;
      this.finishingRace = false;
      this.finishGraceTimer = 0;
      this.particlePool.clear();
      if (this.audio) {
        this.audio.stopTitleMusic();
        this.audio.setSong(this.songIndex);
        this.audio.startMusic();
      }
      this.state = 'COUNTDOWN';
    }

    setupOnlineRaceGrid() {
      const meta = this.netplay.meta;
      const isHost = (this.netplay.role === 'HOST');
      this.cars = [];
      this.finishOrder = [];
      if (!this.seasonBots || this.seasonBots.length < 19) {
        this.initSeasonRoster();
      }

      // 18 bots nas posições P1..P18
      for (let i = 0; i < 18; i++) {
        const slot = i + 1;
        const profile = this.seasonBots[i];
        const bModel = profile.model;
        const rowFromBack = Math.floor((TOTAL_RACERS - slot) / 2);
        const isLeft = (slot % 2 === 1);
        const z = 1600 + rowFromBack * GRID_ROW_SPACING + (isLeft ? GRID_STAGGER_Z : 0);
        const x = isLeft ? -GRID_COL_X : GRID_COL_X;
        const bot = new Car(i + 1, bModel, false);
        bot.bodyColor = profile.bodyColor || '#64748B';
        bot.driverCode = profile.driverCode || 'BOT';
        bot.driverName = profile.driverName || 'PILOTO';
        bot.effectiveMaxSpeed = bModel.maxSpeed || 220;
        bot.aiPersonality = profile.aiPersonality || 'TECHNICAL';
        bot.pressureTimer = 0;
        bot.aiSkill = Math.max(0.78, Math.min(0.99, (profile.baseAiSkill || 0.90)));
        bot.launchDelay = 0.04 + ((slot - 1) * 0.01) + Math.random() * 0.14;
        bot.z = z;
        bot.x = x;
        bot.gridStartX = x;
        bot.targetX = x;
        bot.speed = 0;
        bot.laps = 0;
        bot.totalDistance = z;
        bot.nextLapTarget = START_LINE_Z + this.track.totalLength;
        bot.nitroCharges = 3;
        bot.nitroCooldown = 3.5 + Math.random() * 5.0;
        this.cars.push(bot);
      }

      // Host em P19 (-GRID_COL_X), Guest em P20 (+GRID_COL_X)
      const hostModel = CAR_MODELS[meta.hostCarIndex || 0] || CAR_MODELS[0];
      const hostColor = CAR_COLORS[meta.hostColorIndex || 0] || CAR_COLORS[0];
      const guestModel = CAR_MODELS[meta.guestCarIndex || 0] || CAR_MODELS[0];
      const guestColor = CAR_COLORS[meta.guestColorIndex || 0] || CAR_COLORS[0];

      const hostZ = 1600 + 120;
      const guestZ = 1600;

      const hostCar = new Car(isHost ? 0 : 19, hostModel, isHost);
      hostCar.bodyColor = hostColor.hex;
      hostCar.effectiveMaxSpeed = hostModel.maxSpeed || 220;
      hostCar.z = hostZ;
      hostCar.x = -GRID_COL_X;
      hostCar.targetX = hostCar.x;
      hostCar.totalDistance = hostZ;
      hostCar.nextLapTarget = START_LINE_Z + this.track.totalLength;
      hostCar.nitroCharges = 3;
      hostCar.driverName = meta.hostName || 'HOST';
      hostCar.driverCode = (meta.hostName || 'HST').slice(0, 3).toUpperCase();
      hostCar.isRemote = !isHost;

      const guestCar = new Car(isHost ? 19 : 0, guestModel, !isHost);
      guestCar.bodyColor = guestColor.hex;
      guestCar.effectiveMaxSpeed = guestModel.maxSpeed || 220;
      guestCar.z = guestZ;
      guestCar.x = GRID_COL_X;
      guestCar.targetX = guestCar.x;
      guestCar.totalDistance = guestZ;
      guestCar.nextLapTarget = START_LINE_Z + this.track.totalLength;
      guestCar.nitroCharges = 3;
      guestCar.driverName = meta.guestName || 'AMIGO';
      guestCar.driverCode = (meta.guestName || 'AMG').slice(0, 3).toUpperCase();
      guestCar.isRemote = isHost;

      this.cars.push(hostCar);
      this.cars.push(guestCar);
      this.player = isHost ? hostCar : guestCar;
      this.remoteCar = isHost ? guestCar : hostCar;
      this.cameraZ = this.wrapZ(this.player.z - PLAYER_Z_OFFSET);
    }

    syncOnlineRace(dt) {
      if (!this.isOnlineRace || !this.netplay || !this.netplay.connected) return;
      const np = this.netplay;
      if (np.meta && np.meta.status === 'RACING' && np.meta.raceSeq && np.meta.raceSeq !== this.onlineRaceSeq) {
        this.startOnlineRace();
        return;
      }

      const p = this.player;
      if (p && this.state === 'RACING') {
        np.sendPlayerState({
          z: Math.round(p.z),
          x: +p.x.toFixed(3),
          speed: Math.round(p.speed),
          steer: +(p.steer || 0).toFixed(2),
          isNitro: !!p.isNitro,
          lap: p.lap || 1,
          td: Math.round(p.totalDistance || 0),
          finished: !!p.finished,
          finishTime: p.finishTime || 0
        }, !!p.finished);
      }

      if (np.role === 'HOST') {
        if (this.state === 'RACING') {
          const botsCompact = [];
          for (let i = 0; i < this.cars.length; i++) {
            const c = this.cars[i];
            if (c.isPlayer || c.isRemote) continue;
            botsCompact.push([Math.round(c.z), +c.x.toFixed(3), Math.round(c.speed), Math.round(c.totalDistance || 0)]);
          }
          np.sendBotsState(botsCompact);
        }
      } else {
        const rb = np.remoteBots;
        let bIdx = 0;
        const posBlend = Math.min(1, dt * 8);
        const latBlend = Math.min(1, dt * 10);
        for (let i = 0; i < this.cars.length; i++) {
          const c = this.cars[i];
          if (c.isPlayer || c.isRemote) continue;
          // Dead-reckoning contínuo a 60 FPS para não piscar nem dar saltos no celular
          if (this.state === 'RACING' && c.speed > 0) {
            const stepZ = c.speed * 20 * dt;
            c.z = this.wrapZ(c.z + stepZ);
            c.totalDistance += stepZ;
          }
          const entry = (rb && Array.isArray(rb)) ? rb[bIdx++] : null;
          if (!entry) continue;
          const dz = this.shortestDeltaZ(c.z, entry[0]);
          if (Math.abs(dz) > 1500) {
            c.z = entry[0];
          } else {
            c.z = this.wrapZ(c.z + dz * posBlend);
          }
          c.x += (entry[1] - c.x) * latBlend;
          c.speed += (entry[2] - c.speed) * latBlend;
          if (entry[3] !== undefined) {
            c.totalDistance += (entry[3] - c.totalDistance) * posBlend;
          }
        }
      }

      const rs = np.remoteState;
      const rc = this.remoteCar;
      if (rc) {
        if (this.state === 'RACING' && rc.speed > 0) {
          const stepZ = rc.speed * 20 * dt;
          rc.z = this.wrapZ(rc.z + stepZ);
          rc.totalDistance += stepZ;
        }
        if (rs) {
          const posBlend = Math.min(1, dt * 10);
          const latBlend = Math.min(1, dt * 12);
          const dz = this.shortestDeltaZ(rc.z, rs.z || 0);
          if (Math.abs(dz) > 1500) {
            rc.z = rs.z || 0;
          } else {
            rc.z = this.wrapZ(rc.z + dz * posBlend);
          }
          rc.x += ((rs.x || 0) - rc.x) * latBlend;
          rc.speed += ((rs.speed || 0) - rc.speed) * latBlend;
          rc.steer = rs.steer || 0;
          rc.isNitro = !!rs.isNitro;
          rc.lap = rs.lap || rc.lap;
          if (rs.td !== undefined) {
            rc.totalDistance += (rs.td - rc.totalDistance) * posBlend;
          }
          if (rs.finished && !rc.finished) {
            rc.finished = true;
            rc.finishTime = rs.finishTime || this.raceTimer;
            if (!this.finishOrder.includes(rc)) this.finishOrder.push(rc);
          }
        }
      }
    }

    finishQualySession(lapTime) {
      const avgPoleSpeed = (this.diffMode === 'ADVANCED') ? 274 : 268;
      const poleTime = this.track.totalLength / (avgPoleSpeed * 20);
      const p20Time = poleTime * 1.15;
      const rank = Math.max(1, Math.min(TOTAL_RACERS, Math.round(1 + ((lapTime - poleTime) / Math.max(0.1, p20Time - poleTime)) * 19)));
      this.qualifiedGridPos = rank;
      this.qualifiedLapTime = lapTime;
      this.isQualifying = false;
      this.finishingRace = false;
      this.finishTimer = 0;
      this.finishFadeAlpha = 0;
      this.audio.silenceEffects();
      this.audio.musicPlaying = false;
      this.audio.playTitleMusic();
      this.audio.playBeep(880, 0.22);
      this.setupCooldown = 0.35;
      this.fadeTransition('RACE_SETUP');
    }

    startRaceCountdown(keepQualy = false) {
      if (!keepQualy) this.isQualifying = false;
      this.setupRaceGrid();
      this.state = 'COUNTDOWN';
      this.countdown = 3.6;
      this.startLightsStage = 0;
      this.greenLightsTimer = 0;
      this.finishingRace = false;
      this.finishTimer = 0;
      this.finishFadeAlpha = 0;
      this.f1LeaderboardToggled = false;
      if (this.envCond === 'DINAMICO') {
        this.initDynamicWeather();
      } else {
        this.envCur = null;
        this.envFrom = null;
        this.envBlend = 1;
        this.envKey = '';
      }
      this.updateEnv(0.016);
      if (this.audio) {
        this.audio.stopTitleMusic();
        this.audio.musicPlaying = true;
        this.audio.restartMusic();
        this.audio.startRaceEffects();
      }
    }

    wrapZ(z) {
      const len = this.track.totalLength;
      return ((z % len) + len) % len;
    }

    shortestDeltaZ(zA, zB) {
      const len = this.track.totalLength;
      let dz = (zA - zB) % len;
      if (dz > len / 2) dz -= len;
      if (dz < -len / 2) dz += len;
      return dz;
    }

    findSegment(z) {
      const segIndex = Math.floor(z / SEGMENT_LENGTH) % this.track.segments.length;
      return this.track.segments[(segIndex + this.track.segments.length) % this.track.segments.length];
    }

    project(p, cameraX, cameraY, cameraZ) {
      const depth = this.currentCameraDepth || CAMERA_DEPTH;
      p.camera.x = (p.world.x || 0) - cameraX;
      p.camera.y = (p.world.y || 0) - cameraY;
      p.camera.z = (p.world.z || 0) - cameraZ;
      p.screen.scale = depth / p.camera.z;
      p.screen.x = (INTERNAL_WIDTH / 2) + (p.screen.scale * p.camera.x * REF_WIDTH / 2);
      p.screen.y = (INTERNAL_HEIGHT / 2) - (p.screen.scale * p.camera.y * INTERNAL_HEIGHT / 2);
      p.screen.w = (p.screen.scale * ROAD_WIDTH * REF_WIDTH / 2);
    }

    projectInterpolated(seg, pct) {
      const depth = this.currentCameraDepth || CAMERA_DEPTH;
      const camX = (1 - pct) * seg.p1.camera.x + pct * seg.p2.camera.x;
      const camY = (1 - pct) * seg.p1.camera.y + pct * seg.p2.camera.y;
      const camZ = Math.max(depth + 1, (1 - pct) * seg.p1.camera.z + pct * seg.p2.camera.z);
      const scale = depth / camZ;
      return {
        x: (INTERNAL_WIDTH / 2) + (scale * camX * REF_WIDTH / 2),
        y: (INTERNAL_HEIGHT / 2) - (scale * camY * INTERNAL_HEIGHT / 2),
        w: scale * ROAD_WIDTH * REF_WIDTH / 2
      };
    }

    // ==========================================
    // FÍSICA E ATUALIZAÇÃO
    // ==========================================
    update(dt) {
      // Atualização do fade suave de transição dos menus
      if (this.menuFadeState === 'fading_out') {
        this.menuFadeAlpha += dt / this.menuFadeDuration;
        if (this.menuFadeAlpha >= 1) {
          this.menuFadeAlpha = 1;
          this.menuFadeState = 'fading_in';
          if (this.menuFadeTargetState) {
            this.state = this.menuFadeTargetState;
          }
          if (this.menuFadeOnMid) {
            try { this.menuFadeOnMid(); } catch (e) { console.error(e); }
          }
        }
        return;
      } else if (this.menuFadeState === 'fading_in') {
        this.menuFadeAlpha -= dt / this.menuFadeDuration;
        if (this.menuFadeAlpha <= 0) {
          this.menuFadeAlpha = 0;
          this.menuFadeState = 'idle';
          this.menuFadeTargetState = null;
          this.menuFadeOnMid = null;
        }
      }

      if (this.input && typeof this.input.pollGamepad === 'function') {
        this.input.pollGamepad(dt);
      }

      // Se as configurações estiverem abertas, isola o jogo no fundo, silencia efeitos e impede que qualquer ação despause
      if (this.input && typeof this.input.isSettingsOpen === 'function' && this.input.isSettingsOpen()) {
        if (this.audio) this.audio.silenceEffects();
        if (this.input.clearPulses) this.input.clearPulses();
        return;
      }
      if (this.input.justPressedM) {
        this.audio.enabled = !this.audio.enabled;
        if (!this.audio.enabled) {
          this.audio.silenceEffects();
        } else {
          this.audio.playBeep(440, 0.08);
        }
      }

      if (this.input.justPressedLeaderboard) {
        this.f1LeaderboardToggled = !this.f1LeaderboardToggled;
      }
      if ((this.state === 'RACING' || this.state === 'COUNTDOWN' || this.state === 'PAUSED') && this.input.lastCanvasClick) {
        if (this.input.lastCanvasClick.x <= 80 && this.input.lastCanvasClick.y <= 50) {
          this.f1LeaderboardToggled = !this.f1LeaderboardToggled;
          this.input.lastCanvasClick = null;
        }
      }

      if (this.pauseBtn) {
        const isRacingState = (this.state === 'RACING' || this.state === 'COUNTDOWN' || this.state === 'PAUSED' || this.state === 'RESUME_COUNTDOWN');
        this.pauseBtn.style.display = isRacingState ? 'flex' : 'none';
        const isPaused = (this.state === 'PAUSED' || this.state === 'RESUME_COUNTDOWN');
        this.pauseBtn.textContent = isPaused ? '▶' : '⏸';
        this.pauseBtn.title = isPaused ? 'Continuar Corrida' : 'Pausar Jogo';
        this.pauseBtn.classList.toggle('active', isPaused);
      }

      const btnB = document.getElementById('btn-b');
      if (btnB) {
        const isRacingState = (this.state === 'RACING' || this.state === 'COUNTDOWN' || this.state === 'PAUSED' || this.state === 'RESUME_COUNTDOWN');
        if (isRacingState) {
          const isF1Active = !!(this.f1LeaderboardToggled || (this.input && this.input.leaderboard));
          btnB.classList.toggle('active', isF1Active);
        } else {
          btnB.classList.remove('active');
        }
      }

      if (this.isOnlineRace && (this.state === 'COUNTDOWN' || this.state === 'PAUSED') && this.netplay && this.netplay.meta && this.netplay.meta.status === 'RACING' && this.netplay.meta.raceSeq && this.netplay.meta.raceSeq !== this.onlineRaceSeq) {
        this.startOnlineRace();
        return;
      }

      if (this.state === 'MENU') {
        if (this.nameWrapper) this.nameWrapper.classList.remove('show');
        this.audio.silenceEffects();
        this.menuCameraZ = this.wrapZ(this.menuCameraZ + 850 * dt);
        this.cameraRoll = 0;
        this.shake = 0;
        this.updateSkyScroll(dt);
        this.updateEnv(dt);

        const cx = INTERNAL_WIDTH / 2;
        const touchSafe = this.input.touchControlsVisible;
        const btnW = touchSafe ? 144 : 156;
        const btnH = touchSafe ? 16 : 17;
        const btnX = Math.round(cx - btnW / 2);
        const slant = 5;
        const btn0_Y = touchSafe ? 100 : 104;
        const btn1_Y = touchSafe ? 120 : 125;
        const btn2_Y = touchSafe ? 140 : 146;

        let shouldAdvance = false;
        if (this.input.lastCanvasClick) {
          const click = this.input.lastCanvasClick;
          this.input.lastCanvasClick = null;

          // Engrenagem no canto superior direito
          if (click.x >= INTERNAL_WIDTH - 38 && click.y <= 38) {
            const gearBtn = document.getElementById('gear-btn');
            if (gearBtn) gearBtn.click();
            this.input.clearPulses();
            return;
          }

          // Botão 0 (INICIAR NOVO JOGO)
          if (click.x >= btnX && click.x <= btnX + btnW + slant && click.y >= btn0_Y && click.y <= btn0_Y + btnH) {
            this.mainMenuSelection = 0;
            shouldAdvance = true;
          }
          // Botão 1 (CONTINUAR)
          else if (click.x >= btnX && click.x <= btnX + btnW + slant && click.y >= btn1_Y && click.y <= btn1_Y + btnH) {
            this.mainMenuSelection = 1;
            shouldAdvance = true;
          }
          // Botão 2 (ONLINE 2P)
          else if (click.x >= btnX && click.x <= btnX + btnW + slant && click.y >= btn2_Y && click.y <= btn2_Y + btnH) {
            this.mainMenuSelection = 2;
            shouldAdvance = true;
          }
        }

        if (this.input.justPressedUp) {
          this.mainMenuSelection = (this.mainMenuSelection - 1 + 3) % 3;
          this.audio.playBeep(440, 0.05);
        }
        if (this.input.justPressedDown) {
          this.mainMenuSelection = (this.mainMenuSelection + 1) % 3;
          this.audio.playBeep(440, 0.05);
        }

        if (this.input.justPressedEnter) {
          shouldAdvance = true;
        }

        if (shouldAdvance) {
          this.audio.playBeep(480, 0.08);
          this.isOnlineRace = false;
          if (this.mainMenuSelection === 0) {
            this.fadeTransition('MODE_SELECT');
          } else if (this.mainMenuSelection === 1) {
            this.slotSelectMode = 'CONTINUE';
            this.selectedSlotIndex = 0;
            this.slotDeleteConfirm = null;
            this.slotOverwriteConfirm = null;
            this.fadeTransition('SLOT_SELECT');
          } else {
            this.onlineSubMode = (this.netplay && this.netplay.connected) ? 'ROOM' : 'CHOICE';
            this.fadeTransition('ONLINE_LOBBY');
          }
          this.input.clearPulses();
          return;
        }
        this.input.clearPulses();
        return;
      }

      if (this.state === 'ONLINE_LOBBY') {
        this.audio.silenceEffects();
        this.menuCameraZ = this.wrapZ(this.menuCameraZ + 850 * dt);
        this.cameraRoll = 0;
        this.shake = 0;
        this.updateSkyScroll(dt);
        this.updateEnv(dt);

        const L = this.getOnlineLobbyLayout();
        const np = this.netplay;
        const sub = this.onlineSubMode || 'CHOICE';
        const showCodeInput = (sub === 'JOIN_CODE');
        if (this.nameWrapper && this.nameInput) {
          if (showCodeInput) {
            if (!this.nameWrapper.classList.contains('show')) {
              this.nameInput.maxLength = 6;
              this.nameInput.placeholder = 'CÓDIGO';
              this.nameInput.value = '';
              this.nameWrapper.classList.add('show');
              this.nameInput.focus();
            }
          } else {
            this.nameWrapper.classList.remove('show');
          }
        }

        // Convidado inicia automaticamente quando Host dispara a corrida
        if (sub === 'ROOM' && np && np.meta && np.meta.status === 'RACING' && np.meta.raceSeq !== this.onlineRaceSeq) {
          this.startOnlineRace();
          this.input.clearPulses();
          return;
        }

        if (sub === 'ROOM' && np && !np.connected) {
          this.onlineSubMode = 'CHOICE';
        }

        const hit = (b, click) => b && click.x >= b.x && click.x <= b.x + b.w && click.y >= b.y && click.y <= b.y + b.h;

        if (this.input.lastCanvasClick) {
          const click = this.input.lastCanvasClick;
          this.input.lastCanvasClick = null;

          if (hit(L.btnBack, click)) {
            this.audio.playBeep(330, 0.06);
            if (sub === 'JOIN_CODE') {
              this.onlineSubMode = 'CHOICE';
            } else if (sub === 'ROOM') {
              if (np) np.leaveRoom();
              this.onlineSubMode = 'CHOICE';
            } else {
              this.fadeTransition('MENU');
            }
            this.input.clearPulses();
            return;
          }

          if (sub === 'CHOICE') {
            if (hit(L.btnCreate, click) && np) {
              this.audio.playBeep(523, 0.1);
              np.createRoom({
                name: this.playerName || 'HOST',
                carIndex: this.selectedCarIndex || 0,
                colorIndex: this.colorIndex || 0,
                trackIndex: this.trackIndex || 0,
                envCond: this.chosenEnvCond || 'DIA',
                songIndex: this.songIndex || 0
              }).then((code) => {
                if (code) this.onlineSubMode = 'ROOM';
              });
            } else if (hit(L.btnJoin, click)) {
              this.audio.playBeep(440, 0.08);
              if (np) np.errorMsg = '';
              this.onlineSubMode = 'JOIN_CODE';
            }
          } else if (sub === 'JOIN_CODE') {
            if (hit(L.btnJoinGo, click)) {
              this.input.justPressedEnter = true;
            }
          } else if (sub === 'ROOM' && np && np.meta) {
            const isHost = (np.role === 'HOST');
            const updateMyCar = () => {
              if (isHost) {
                np.updateMeta({ hostCarIndex: this.selectedCarIndex, hostColorIndex: this.colorIndex });
              } else {
                np.updateMeta({ guestCarIndex: this.selectedCarIndex, guestColorIndex: this.colorIndex });
              }
            };
            if (hit(L.btnCarPrev, click)) {
              this.selectedCarIndex = (this.selectedCarIndex - 1 + CAR_MODELS.length) % CAR_MODELS.length;
              this.colorIndex = MODEL_DEFAULT_COLOR[CAR_MODELS[this.selectedCarIndex].id] || 0;
              this.audio.playBeep(440, 0.05);
              updateMyCar();
            } else if (hit(L.btnCarNext, click)) {
              this.selectedCarIndex = (this.selectedCarIndex + 1) % CAR_MODELS.length;
              this.colorIndex = MODEL_DEFAULT_COLOR[CAR_MODELS[this.selectedCarIndex].id] || 0;
              this.audio.playBeep(440, 0.05);
              updateMyCar();
            } else if (hit(L.btnColNext, click)) {
              this.colorIndex = (this.colorIndex + 1) % CAR_COLORS.length;
              this.audio.playBeep(440, 0.05);
              updateMyCar();
            } else if (isHost && hit(L.btnTrkPrev, click)) {
              const nextT = ((np.meta.trackIndex || 0) - 1 + TRACK_DEFINITIONS.length) % TRACK_DEFINITIONS.length;
              this.audio.playBeep(440, 0.05);
              np.updateMeta({ trackIndex: nextT });
            } else if (isHost && hit(L.btnTrkNext, click)) {
              const nextT = ((np.meta.trackIndex || 0) + 1) % TRACK_DEFINITIONS.length;
              this.audio.playBeep(440, 0.05);
              np.updateMeta({ trackIndex: nextT });
            } else if (isHost && hit(L.btnEnvNext, click)) {
              const envList = ['DIA', 'TARDE', 'NOITE', 'CHUVA_DIA', 'CHUVA_NOITE', 'NEVE_DIA'];
              const idx = envList.indexOf(np.meta.envCond || 'DIA');
              const nextE = envList[(idx + 1) % envList.length];
              this.audio.playBeep(440, 0.05);
              np.updateMeta({ envCond: nextE });
            } else if (hit(L.btnReady, click)) {
              this.audio.playBeep(523, 0.08);
              if (isHost) np.updateMeta({ hostReady: !np.meta.hostReady });
              else np.updateMeta({ guestReady: !np.meta.guestReady });
            } else if (isHost && hit(L.btnStart, click)) {
              if (np.meta.guestName && np.meta.hostReady && np.meta.guestReady) {
                const nextSeq = (np.meta.raceSeq || 0) + 1;
                np.meta.status = 'RACING';
                np.meta.raceSeq = nextSeq;
                np.updateMeta({ status: 'RACING', raceSeq: nextSeq });
                this.startOnlineRace();
                this.input.clearPulses();
                return;
              } else {
                this.audio.playBeep(220, 0.12);
              }
            }
          }
        }

        if (sub === 'ROOM' && this.input.justPressedEnter && np && np.role === 'HOST' && np.meta) {
          if (np.meta.guestName && np.meta.hostReady && np.meta.guestReady) {
            const nextSeq = (np.meta.raceSeq || 0) + 1;
            np.meta.status = 'RACING';
            np.meta.raceSeq = nextSeq;
            np.updateMeta({ status: 'RACING', raceSeq: nextSeq });
            this.startOnlineRace();
            this.input.clearPulses();
            return;
          } else {
            this.audio.playBeep(220, 0.12);
          }
        }

        if (sub === 'JOIN_CODE' && this.input.justPressedEnter && np) {
          const code = this.nameInput ? this.nameInput.value : '';
          np.joinRoom(code, {
            name: this.playerName || 'AMIGO',
            carIndex: this.selectedCarIndex || 0,
            colorIndex: this.colorIndex || 0
          }).then((ok) => {
            if (ok) {
              if (this.nameInput) {
                this.nameInput.maxLength = 12;
                this.nameInput.placeholder = 'JOGADOR';
                this.nameInput.value = this.playerName || 'JOGADOR';
              }
              if (this.nameWrapper) this.nameWrapper.classList.remove('show');
              this.onlineSubMode = 'ROOM';
              this.audio.playBeep(587, 0.12);
            } else {
              this.audio.playBeep(220, 0.14);
            }
          });
        }

        if (this.input.justPressedEsc) {
          this.audio.playBeep(330, 0.06);
          if (sub === 'JOIN_CODE') {
            this.onlineSubMode = 'CHOICE';
          } else if (sub === 'ROOM') {
            if (np) np.leaveRoom();
            this.onlineSubMode = 'CHOICE';
          } else {
            this.fadeTransition('MENU');
          }
        }
        this.input.clearPulses();
        return;
      }

      if (this.state === 'MODE_SELECT') {
        if (this.nameWrapper) this.nameWrapper.classList.remove('show');
        this.audio.silenceEffects();
        this.menuCameraZ = this.wrapZ(this.menuCameraZ + 850 * dt);
        this.cameraRoll = 0;
        this.shake = 0;
        this.updateSkyScroll(dt);
        this.updateEnv(dt);

        const L = this.getModeSelectLayout();
        if (this.input.lastCanvasClick) {
          const click = this.input.lastCanvasClick;
          this.input.lastCanvasClick = null;

          // Clique no botão VOLTAR
          if (click.x >= L.btnBack.x && click.x <= L.btnBack.x + L.btnBack.w &&
              click.y >= L.btnBack.y && click.y <= L.btnBack.y + L.btnBack.h) {
            this.audio.playBeep(330, 0.06);
            this.fadeTransition('MENU');
            this.input.clearPulses();
            return;
          }

          // Clique no toggle Oficial vs Custom dentro do card 0
          if (L.btnChampType &&
              click.x >= L.btnChampType.x && click.x <= L.btnChampType.x + L.btnChampType.w &&
              click.y >= L.btnChampType.y && click.y <= L.btnChampType.y + L.btnChampType.h) {
            this.selectedModeIndex = 0;
            this.customChampionship = !this.customChampionship;
            this.audio.playBeep(523, 0.07);
          } else if (click.x >= L.card0.x && click.x <= L.card0.x + L.card0.w &&
              click.y >= L.card0.y && click.y <= L.card0.y + L.card0.h) {
            // Clique no card 0 (Campeonato) — seleciona sem avançar
            this.selectedModeIndex = 0;
            this.audio.playBeep(440, 0.06);
          }

          // Clique no card 1 (Corrida Rápida) — seleciona sem avançar
          if (click.x >= L.card1.x && click.x <= L.card1.x + L.card1.w &&
              click.y >= L.card1.y && click.y <= L.card1.y + L.card1.h) {
            this.selectedModeIndex = 1;
            this.audio.playBeep(440, 0.06);
          }

          // Clique no card 2 (Contra o Relógio / Time Trial) — seleciona sem avançar
          if (L.card2 && click.x >= L.card2.x && click.x <= L.card2.x + L.card2.w &&
              click.y >= L.card2.y && click.y <= L.card2.y + L.card2.h) {
            this.selectedModeIndex = 2;
            this.audio.playBeep(440, 0.06);
          }

          // Clique no botão CONTINUAR
          if (click.x >= L.btnConfirm.x && click.x <= L.btnConfirm.x + L.btnConfirm.w &&
              click.y >= L.btnConfirm.y && click.y <= L.btnConfirm.y + L.btnConfirm.h) {
            this.input.justPressedEnter = true;
          }
        }

        if (this.input.justPressedLeft) {
          this.selectedModeIndex = (this.selectedModeIndex - 1 + 3) % 3;
          this.audio.playBeep(440, 0.05);
        }
        if (this.input.justPressedRight) {
          this.selectedModeIndex = (this.selectedModeIndex + 1) % 3;
          this.audio.playBeep(440, 0.05);
        }
        if (this.input.justPressedUp || this.input.justPressedDown) {
          if (this.selectedModeIndex === 0) {
            this.customChampionship = !this.customChampionship;
            this.audio.playBeep(523, 0.06);
          } else {
            this.selectedModeIndex = (this.selectedModeIndex + 1) % 3;
            this.audio.playBeep(440, 0.05);
          }
        }

        if (this.input.justPressedEnter) {
          this.audio.playBeep(523, 0.12);
          if (this.selectedModeIndex === 0) {
            this.gameMode = 'CHAMPIONSHIP';
            this.selectedDiffIndex = 0;
            this.fadeTransition('DIFFICULTY_SELECT');
          } else if (this.selectedModeIndex === 1) {
            this.gameMode = 'QUICK_RACE';
            this.selectedDiffIndex = 0;
            this.fadeTransition('DIFFICULTY_SELECT');
          } else {
            this.gameMode = 'TIME_TRIAL';
            this.selectedDiffIndex = 0;
            this.fadeTransition('TRACK_SELECT');
          }
          this.input.clearPulses();
          return;
        }

        if (this.input.justPressedEsc) {
          this.audio.playBeep(330, 0.06);
          this.fadeTransition('MENU');
          this.input.clearPulses();
          return;
        }
        this.input.clearPulses();
        return;
      }

      if (this.state === 'DIFFICULTY_SELECT') {
        if (this.nameWrapper) this.nameWrapper.classList.remove('show');
        this.audio.silenceEffects();
        this.menuCameraZ = this.wrapZ(this.menuCameraZ + 850 * dt);
        this.cameraRoll = 0;
        this.shake = 0;
        this.updateSkyScroll(dt);
        this.updateEnv(dt);

        const L = this.getDifficultySelectLayout();
        if (this.input.lastCanvasClick) {
          const click = this.input.lastCanvasClick;
          this.input.lastCanvasClick = null;

          if (click.x >= L.btnBack.x && click.x <= L.btnBack.x + L.btnBack.w &&
              click.y >= L.btnBack.y && click.y <= L.btnBack.y + L.btnBack.h) {
            this.audio.playBeep(330, 0.06);
            this.fadeTransition('MODE_SELECT');
            this.input.clearPulses();
            return;
          }

          if (click.x >= L.card0.x && click.x <= L.card0.x + L.card0.w &&
              click.y >= L.card0.y && click.y <= L.card0.y + L.card0.h) {
            this.selectedDiffIndex = 0;
            this.audio.playBeep(440, 0.06);
          }

          if (click.x >= L.card1.x && click.x <= L.card1.x + L.card1.w &&
              click.y >= L.card1.y && click.y <= L.card1.y + L.card1.h) {
            this.selectedDiffIndex = 1;
            this.audio.playBeep(440, 0.06);
          }

          if (click.x >= L.btnConfirm.x && click.x <= L.btnConfirm.x + L.btnConfirm.w &&
              click.y >= L.btnConfirm.y && click.y <= L.btnConfirm.y + L.btnConfirm.h) {
            this.input.justPressedEnter = true;
          }
        }

        if (this.input.justPressedLeft || this.input.justPressedRight || this.input.justPressedUp || this.input.justPressedDown) {
          this.selectedDiffIndex = this.selectedDiffIndex === 0 ? 1 : 0;
          this.audio.playBeep(440, 0.05);
        }

        if (this.input.justPressedEnter) {
          this.audio.playBeep(523, 0.12);
          this.diffMode = (this.selectedDiffIndex === 0) ? 'NORMAL' : 'ADVANCED';
          if (this.gameMode === 'CHAMPIONSHIP') {
            this.slotSelectMode = 'NEW';
            this.selectedSlotIndex = 0;
            this.slotDeleteConfirm = null;
            this.slotOverwriteConfirm = null;
            this.fadeTransition('SLOT_SELECT');
          } else {
            this.selectedQuickTrackIndex = 0;
            this.trackIndex = 0;
            this.loadTrack(0);
            this.fadeTransition('TRACK_SELECT');
          }
          this.input.clearPulses();
          return;
        }

        if (this.input.justPressedEsc) {
          this.audio.playBeep(330, 0.06);
          this.fadeTransition('MODE_SELECT');
          this.input.clearPulses();
          return;
        }

        this.input.clearPulses();
        return;
      }

      if (this.state === 'TRACK_SELECT') {
        if (this.nameWrapper) this.nameWrapper.classList.remove('show');
        this.audio.silenceEffects();
        this.menuCameraZ = this.wrapZ(this.menuCameraZ + 850 * dt);
        this.cameraRoll = 0;
        this.shake = 0;
        this.updateSkyScroll(dt);
        this.updateEnv(dt);

        const L = this.getTrackSelectLayout();
        if (this.input.lastCanvasClick) {
          const click = this.input.lastCanvasClick;
          this.input.lastCanvasClick = null;

          // Clique no botão VOLTAR
          if (L.btnBack && click.x >= L.btnBack.x && click.x <= L.btnBack.x + L.btnBack.w &&
              click.y >= L.btnBack.y && click.y <= L.btnBack.y + L.btnBack.h) {
            this.audio.playBeep(330, 0.06);
            this.fadeTransition('DIFFICULTY_SELECT');
            this.input.clearPulses();
            return;
          }

          // Clique no botão CONFIRMAR
          if (L.btnConfirm && click.x >= L.btnConfirm.x && click.x <= L.btnConfirm.x + L.btnConfirm.w &&
              click.y >= L.btnConfirm.y && click.y <= L.btnConfirm.y + L.btnConfirm.h) {
            this.input.justPressedEnter = true;
          }

          // Clique na seta lateral PREV (◀)
          if (L.btnPrev && click.x >= L.btnPrev.x && click.x <= L.btnPrev.x + L.btnPrev.w &&
              click.y >= L.btnPrev.y && click.y <= L.btnPrev.y + L.btnPrev.h) {
            this.input.justPressedLeft = true;
          }

          // Clique na seta lateral NEXT (▶)
          if (L.btnNext && click.x >= L.btnNext.x && click.x <= L.btnNext.x + L.btnNext.w &&
              click.y >= L.btnNext.y && click.y <= L.btnNext.y + L.btnNext.h) {
            this.input.justPressedRight = true;
          }

          // Clique em qualquer um dos 27 chips de estado da grade
          if (L.chips) {
            for (let k = 0; k < L.chips.length; k++) {
              const c = L.chips[k];
              if (click.x >= c.x && click.x <= c.x + c.w && click.y >= c.y && click.y <= c.y + c.h) {
                this.selectedQuickTrackIndex = c.i;
                this.trackIndex = c.i;
                this.loadTrack(c.i);
                this.audio.playBeep(440, 0.06);
                break;
              }
            }
          }
        }

        if (this.input.justPressedLeft) {
          this.selectedQuickTrackIndex = (this.selectedQuickTrackIndex - 1 + TRACK_DEFINITIONS.length) % TRACK_DEFINITIONS.length;
          this.trackIndex = this.selectedQuickTrackIndex;
          this.loadTrack(this.trackIndex);
          this.audio.playBeep(440, 0.05);
        }
        if (this.input.justPressedRight) {
          this.selectedQuickTrackIndex = (this.selectedQuickTrackIndex + 1) % TRACK_DEFINITIONS.length;
          this.trackIndex = this.selectedQuickTrackIndex;
          this.loadTrack(this.trackIndex);
          this.audio.playBeep(440, 0.05);
        }
        if (this.input.justPressedUp) {
          if (this.selectedQuickTrackIndex < 4) {
            // Se está na fileira clássica, sobe para a última fileira de capitais
            this.selectedQuickTrackIndex = Math.min(TRACK_DEFINITIONS.length - 1, 22 + this.selectedQuickTrackIndex);
          } else if (this.selectedQuickTrackIndex < 13) {
            // Se está na 1ª fileira de capitais (4..12), sobe para a fileira clássica (0..3)
            this.selectedQuickTrackIndex = Math.min(3, Math.floor((this.selectedQuickTrackIndex - 4) * (4 / 9)));
          } else {
            // Sobe 1 fileira de capitais (-9 posições)
            this.selectedQuickTrackIndex -= 9;
          }
          this.trackIndex = this.selectedQuickTrackIndex;
          this.loadTrack(this.trackIndex);
          this.audio.playBeep(440, 0.05);
        }
        if (this.input.justPressedDown) {
          if (this.selectedQuickTrackIndex < 4) {
            // Se está na fileira clássica, desce para a 1ª fileira de capitais
            this.selectedQuickTrackIndex = 4 + Math.floor(this.selectedQuickTrackIndex * (9 / 4));
          } else if (this.selectedQuickTrackIndex >= 22) {
            // Se está na última fileira de capitais, desce para a fileira clássica
            this.selectedQuickTrackIndex = Math.min(3, Math.floor((this.selectedQuickTrackIndex - 22) * (4 / 9)));
          } else {
            // Desce 1 fileira de capitais (+9 posições)
            this.selectedQuickTrackIndex = Math.min(TRACK_DEFINITIONS.length - 1, this.selectedQuickTrackIndex + 9);
          }
          this.trackIndex = this.selectedQuickTrackIndex;
          this.loadTrack(this.trackIndex);
          this.audio.playBeep(440, 0.05);
        }

        if (this.input.justPressedEnter) {
          this.audio.playBeep(523, 0.12);
          this.trackIndex = this.selectedQuickTrackIndex;
          this.loadTrack(this.trackIndex);
          this.colorIndex = MODEL_DEFAULT_COLOR[CAR_MODELS[this.selectedCarIndex].id] || 0;
          this.fadeTransition('CAR_SELECT');
          this.input.clearPulses();
          return;
        }

        if (this.input.justPressedEsc) {
          this.audio.playBeep(330, 0.06);
          this.fadeTransition('DIFFICULTY_SELECT');
        }
        this.input.clearPulses();
        return;
      }

      if (this.state === 'CUSTOM_SCHEDULE_SELECT') {
        if (this.nameWrapper) this.nameWrapper.classList.remove('show');
        this.audio.silenceEffects();
        this.menuCameraZ = this.wrapZ(this.menuCameraZ + 850 * dt);
        this.cameraRoll = 0;
        this.shake = 0;
        this.updateSkyScroll(dt);
        this.updateEnv(dt);
        if (this.customScheduleWarnTimer > 0) {
          this.customScheduleWarnTimer = Math.max(0, this.customScheduleWarnTimer - dt);
        }

        const L = this.getCustomScheduleLayout();
        const toggleTrack = (idx) => {
          const pos = this.customSchedule.indexOf(idx);
          if (pos !== -1) {
            this.customSchedule.splice(pos, 1);
            this.audio.playBeep(360, 0.05);
          } else if (this.customSchedule.length < TRACK_DEFINITIONS.length) {
            this.customSchedule.push(idx);
            this.audio.playBeep(523, 0.06);
          }
        };

        if (this.input.lastCanvasClick) {
          const click = this.input.lastCanvasClick;
          this.input.lastCanvasClick = null;

          if (L.btnBack && click.x >= L.btnBack.x && click.x <= L.btnBack.x + L.btnBack.w &&
              click.y >= L.btnBack.y && click.y <= L.btnBack.y + L.btnBack.h) {
            this.audio.playBeep(330, 0.06);
            this.slotSelectMode = 'NEW';
            this.fadeTransition('SLOT_SELECT');
            this.input.clearPulses();
            return;
          }

          if (L.btnConfirm && click.x >= L.btnConfirm.x && click.x <= L.btnConfirm.x + L.btnConfirm.w &&
              click.y >= L.btnConfirm.y && click.y <= L.btnConfirm.y + L.btnConfirm.h) {
            this.input.justPressedEnter = true;
          }

          if (L.btnRandom && click.x >= L.btnRandom.x && click.x <= L.btnRandom.x + L.btnRandom.w &&
              click.y >= L.btnRandom.y && click.y <= L.btnRandom.y + L.btnRandom.h) {
            const pool = Array.from({ length: TRACK_DEFINITIONS.length }, (_, i) => i);
            for (let i = pool.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [pool[i], pool[j]] = [pool[j], pool[i]];
            }
            this.customSchedule = pool.slice(0, 10);
            this.customScheduleWarnTimer = 0;
            this.audio.playBeep(587, 0.08);
            this.input.clearPulses();
            return;
          }

          if (L.btnClear && click.x >= L.btnClear.x && click.x <= L.btnClear.x + L.btnClear.w &&
              click.y >= L.btnClear.y && click.y <= L.btnClear.y + L.btnClear.h) {
            this.customSchedule = [];
            this.audio.playBeep(300, 0.07);
            this.input.clearPulses();
            return;
          }

          if (L.chips) {
            for (let c = 0; c < L.chips.length; c++) {
              const chip = L.chips[c];
              if (click.x >= chip.x && click.x <= chip.x + chip.w &&
                  click.y >= chip.y && click.y <= chip.y + chip.h) {
                this.customCursorIndex = chip.i;
                toggleTrack(chip.i);
                this.customScheduleWarnTimer = 0;
                this.input.clearPulses();
                return;
              }
            }
          }
        }

        if (this.input.justPressedLeft) {
          this.customCursorIndex = (this.customCursorIndex - 1 + TRACK_DEFINITIONS.length) % TRACK_DEFINITIONS.length;
          this.audio.playBeep(330, 0.04);
        }
        if (this.input.justPressedRight) {
          this.customCursorIndex = (this.customCursorIndex + 1) % TRACK_DEFINITIONS.length;
          this.audio.playBeep(330, 0.04);
        }
        if (this.input.justPressedUp) {
          if (this.customCursorIndex < 4) {
            this.customCursorIndex = Math.min(TRACK_DEFINITIONS.length - 1, 22 + this.customCursorIndex);
          } else if (this.customCursorIndex < 13) {
            this.customCursorIndex = Math.min(3, Math.floor((this.customCursorIndex - 4) / 2.3));
          } else {
            this.customCursorIndex -= 9;
          }
          this.audio.playBeep(330, 0.04);
        }
        if (this.input.justPressedDown) {
          if (this.customCursorIndex < 4) {
            this.customCursorIndex = 4 + Math.min(8, this.customCursorIndex * 2);
          } else if (this.customCursorIndex < 22) {
            this.customCursorIndex = Math.min(TRACK_DEFINITIONS.length - 1, this.customCursorIndex + 9);
          } else {
            this.customCursorIndex = Math.min(3, Math.floor((this.customCursorIndex - 22) / 2.3));
          }
          this.audio.playBeep(330, 0.04);
        }
        if (this.input.justPressedSpace) {
          toggleTrack(this.customCursorIndex);
          this.customScheduleWarnTimer = 0;
        }

        if (this.input.justPressedEnter) {
          if (this.customSchedule.length >= 5) {
            this.audio.playBeep(523, 0.12);
            this.seasonSchedule = [...this.customSchedule];
            this.seasonStage = 0;
            this.trackIndex = this.seasonSchedule[0];
            this.loadTrack(this.trackIndex);
            this.colorIndex = MODEL_DEFAULT_COLOR[CAR_MODELS[this.selectedCarIndex].id] || 0;
            this.fadeTransition('CAR_SELECT');
          } else {
            this.audio.playBeep(220, 0.14);
            this.customScheduleWarnTimer = 1.8;
          }
          this.input.clearPulses();
          return;
        }

        if (this.input.justPressedEsc) {
          this.audio.playBeep(330, 0.06);
          this.slotSelectMode = 'NEW';
          this.fadeTransition('SLOT_SELECT');
        }
        this.input.clearPulses();
        return;
      }

      if (this.state === 'CAR_SELECT') {
        if (this.nameWrapper) this.nameWrapper.classList.remove('show');
        this.audio.silenceEffects();
        this.menuCameraZ = this.wrapZ(this.menuCameraZ + 850 * dt);
        this.cameraRoll = 0;
        this.shake = 0;
        this.updateSkyScroll(dt);
        this.updateEnv(dt);

        const L = this.getCarSelectLayout();
        if (this.input.lastCanvasClick) {
          const click = this.input.lastCanvasClick;
          this.input.lastCanvasClick = null;
          const { bX, bY, bW, bH, chips, btnBack, btnConfirm } = L;

          // Clique no botão VOLTAR
          if (btnBack && click.x >= btnBack.x && click.x <= btnBack.x + btnBack.w &&
              click.y >= btnBack.y && click.y <= btnBack.y + btnBack.h) {
            this.audio.playBeep(330, 0.06);
            this.fadeTransition((this.gameMode === 'QUICK_RACE' || this.gameMode === 'TIME_TRIAL') ? 'TRACK_SELECT' : (this.customChampionship ? 'CUSTOM_SCHEDULE_SELECT' : 'DIFFICULTY_SELECT'));
            this.input.clearPulses();
            return;
          }

          // Clique no botão ESCOLHER COR (Avança para a Etapa de Seleção de Cor!)
          if (btnConfirm && click.x >= btnConfirm.x && click.x <= btnConfirm.x + btnConfirm.w &&
              click.y >= btnConfirm.y && click.y <= btnConfirm.y + btnConfirm.h) {
            this.audio.playBeep(523, 0.12);
            this.fadeTransition('COLOR_SELECT');
            this.input.clearPulses();
            return;
          }

          // Clique direto em qualquer um dos 20 chips de carros da grade
          if (chips) {
            for (let c = 0; c < chips.length; c++) {
              const chip = chips[c];
              if (click.x >= chip.x && click.x <= chip.x + chip.w &&
                  click.y >= chip.y && click.y <= chip.y + chip.h) {
                if (this.selectedCarIndex !== chip.i) {
                  this.selectedCarIndex = chip.i;
                  this.colorIndex = MODEL_DEFAULT_COLOR[CAR_MODELS[this.selectedCarIndex].id] || 0;
                  this.audio.playBeep(440, 0.05);
                }
                this.input.clearPulses();
                return;
              }
            }
          }

          // Setas laterais de troca de carro
          if (click.x < bX + 26 && click.y >= bY - 10 && click.y <= bY + bH + 10) {
            this.input.justPressedLeft = true;
            this.input.justPressedEnter = false;
          } else if (click.x > bX + bW - 26 && click.y >= bY - 10 && click.y <= bY + bH + 10) {
            this.input.justPressedRight = true;
            this.input.justPressedEnter = false;
          }
        }

        if (this.input.justPressedLeft) {
          this.audio.playBeep(330, 0.06);
          this.selectedCarIndex = (this.selectedCarIndex - 1 + CAR_MODELS.length) % CAR_MODELS.length;
          this.colorIndex = MODEL_DEFAULT_COLOR[CAR_MODELS[this.selectedCarIndex].id] || 0;
        }
        if (this.input.justPressedRight) {
          this.audio.playBeep(330, 0.06);
          this.selectedCarIndex = (this.selectedCarIndex + 1) % CAR_MODELS.length;
          this.colorIndex = MODEL_DEFAULT_COLOR[CAR_MODELS[this.selectedCarIndex].id] || 0;
        }
        if (this.input.justPressedUp || this.input.justPressedDown) {
          this.audio.playBeep(330, 0.06);
          // Salta 10 posições entre a 1ª e 2ª fileira de carros
          this.selectedCarIndex = (this.selectedCarIndex + 10) % CAR_MODELS.length;
          this.colorIndex = MODEL_DEFAULT_COLOR[CAR_MODELS[this.selectedCarIndex].id] || 0;
        }

        if (this.input.justPressedEnter) {
          this.audio.playBeep(523, 0.12);
          this.state = 'COLOR_SELECT';
          this.input.clearPulses();
          return;
        }
        if (this.input.justPressedEsc) {
          this.audio.playBeep(330, 0.06);
          this.fadeTransition((this.gameMode === 'QUICK_RACE' || this.gameMode === 'TIME_TRIAL') ? 'TRACK_SELECT' : (this.customChampionship ? 'CUSTOM_SCHEDULE_SELECT' : 'DIFFICULTY_SELECT'));
        }
        this.input.clearPulses();
        return;
      }

      // ========================================================
      // ETAPA 2 : SELEÇÃO DE COR DO CARRO (CONTROLE, TECLADO OU TOQUE)
      // ========================================================
      if (this.state === 'COLOR_SELECT') {
        if (this.nameWrapper) this.nameWrapper.classList.remove('show');
        this.audio.silenceEffects();
        this.menuCameraZ = this.wrapZ(this.menuCameraZ + 850 * dt);
        this.cameraRoll = 0;
        this.shake = 0;
        this.updateSkyScroll(dt);
        this.updateEnv(dt);

        const L = this.getColorSelectLayout();
        if (this.input.lastCanvasClick) {
          const click = this.input.lastCanvasClick;
          this.input.lastCanvasClick = null;
          const { bX, bY, bW, bH, sw, btnBack, btnConfirm } = L;

          // Clique no botão VOLTAR AO CARRO
          if (btnBack && click.x >= btnBack.x && click.x <= btnBack.x + btnBack.w &&
              click.y >= btnBack.y && click.y <= btnBack.y + btnBack.h) {
            this.audio.playBeep(330, 0.06);
            this.fadeTransition('CAR_SELECT');
            this.input.clearPulses();
            return;
          }

          // Clique no botão CONFIRMAR COR (Avança para Digitação do Nome do Piloto)
          if (btnConfirm && click.x >= btnConfirm.x && click.x <= btnConfirm.x + btnConfirm.w &&
              click.y >= btnConfirm.y && click.y <= btnConfirm.y + btnConfirm.h) {
            this.audio.playBeep(523, 0.12);
            this.fadeTransition('NAME_INPUT');
            if (this.nameWrapper) this.nameWrapper.classList.add('show');
            if (this.nameInput) {
              this.nameInput.value = this.playerName || 'JOGADOR';
              setTimeout(() => { try { this.nameInput.focus(); this.nameInput.select(); } catch (_) {} }, 40);
            }
            this.input.clearPulses();
            return;
          }

          // Clique direto nas 10 amostras circulares de cores
          let clickedSwatch = false;
          if (sw) {
            for (let k = 0; k < sw.length; k++) {
              const s = sw[k];
              if (Math.hypot(click.x - s.x, click.y - s.y) <= Math.max(s.r + 7, 14)) {
                if (this.colorIndex !== s.i) {
                  this.colorIndex = s.i;
                  this.audio.playBeep(480, 0.05);
                }
                clickedSwatch = true;
                break;
              }
            }

            // Toque em qualquer ponto da faixa horizontal das cores
            if (!clickedSwatch && sw.length > 0) {
              const swY = sw[0].y;
              if (click.y >= swY - 14 && click.y <= swY + 14 && click.x >= sw[0].x - 14 && click.x <= sw[sw.length - 1].x + 14) {
                let bestIdx = 0, bestDist = 999999;
                for (let k = 0; k < sw.length; k++) {
                  const d = Math.abs(click.x - sw[k].x);
                  if (d < bestDist) {
                    bestDist = d;
                    bestIdx = sw[k].i;
                  }
                }
                this.colorIndex = bestIdx;
                this.audio.playBeep(480, 0.05);
                clickedSwatch = true;
              }
            }
          }

          // Toque no lado esquerdo ou direito do painel para navegar nas cores
          if (!clickedSwatch) {
            if (click.x < bX + 32 && click.y >= bY && click.y <= bY + bH) {
              this.input.justPressedLeft = true;
            } else if (click.x > bX + bW - 32 && click.y >= bY && click.y <= bY + bH) {
              this.input.justPressedRight = true;
            }
          }
        }

        // Navegação de Cores via Controle (D-pad / Analógico) ou Teclado (Setas / A / D)
        if (this.input.justPressedLeft) {
          this.audio.playBeep(440, 0.05);
          this.colorIndex = (this.colorIndex - 1 + CAR_COLORS.length) % CAR_COLORS.length;
        }
        if (this.input.justPressedRight) {
          this.audio.playBeep(440, 0.05);
          this.colorIndex = (this.colorIndex + 1) % CAR_COLORS.length;
        }
        if (this.input.justPressedColor) {
          this.audio.playBeep(440, 0.05);
          this.colorIndex = (this.colorIndex + 1) % CAR_COLORS.length;
        }
        if (this.input.lastDigit !== null && this.input.lastDigit !== undefined) {
          const d = this.input.lastDigit;
          const targetColor = (d === 0) ? 9 : (d - 1);
          if (targetColor >= 0 && targetColor < CAR_COLORS.length) {
            this.colorIndex = targetColor;
            this.audio.playBeep(480, 0.05);
          }
        }

        if (this.input.justPressedEnter) {
          this.audio.playBeep(523, 0.12);
          this.state = 'NAME_INPUT';
          if (this.nameWrapper) this.nameWrapper.classList.add('show');
          if (this.nameInput) {
            this.nameInput.value = this.playerName || 'JOGADOR';
            setTimeout(() => { try { this.nameInput.focus(); this.nameInput.select(); } catch (_) {} }, 40);
          }
          this.input.clearPulses();
          return;
        }

        if (this.input.justPressedEsc) {
          this.audio.playBeep(330, 0.06);
          this.fadeTransition('CAR_SELECT');
          this.input.clearPulses();
          return;
        }

        this.input.clearPulses();
        return;
      }

      if (this.state === 'NAME_INPUT') {
        this.audio.silenceEffects();
        this.menuCameraZ = this.wrapZ(this.menuCameraZ + 850 * dt);
        this.cameraRoll = 0;
        this.shake = 0;
        this.updateSkyScroll(dt);
        this.updateEnv(dt);

        if (this.nameWrapper && !this.nameWrapper.classList.contains('show')) {
          this.nameWrapper.classList.add('show');
        }

        if (this.input.lastCanvasClick) {
          const click = this.input.lastCanvasClick;
          this.input.lastCanvasClick = null;
          const touchSafe = this.input.touchControlsVisible;
          const boxW = touchSafe ? 228 : 260;
          const boxH = touchSafe ? 132 : 144;
          const boxX = INTERNAL_WIDTH / 2 - boxW / 2;
          const boxY = touchSafe ? 34 : 38;
          const btnW = touchSafe ? 88 : 100;
          const btnH = touchSafe ? 18 : 20;
          const btnY = boxY + boxH - (touchSafe ? 24 : 26);
          const btnBack = { x: boxX + 12, y: btnY, w: btnW, h: btnH };
          const btnConfirm = { x: boxX + boxW - 12 - btnW, y: btnY, w: btnW, h: btnH };

          if (click.x >= btnBack.x && click.x <= btnBack.x + btnBack.w &&
              click.y >= btnBack.y && click.y <= btnBack.y + btnBack.h) {
            if (this.nameWrapper) this.nameWrapper.classList.remove('show');
            if (this.nameInput) this.nameInput.blur();
            this.audio.playBeep(330, 0.06);
            this.fadeTransition('COLOR_SELECT');
            this.input.clearPulses();
            return;
          }

          if (click.x >= btnConfirm.x && click.x <= btnConfirm.x + btnConfirm.w &&
              click.y >= btnConfirm.y && click.y <= btnConfirm.y + btnConfirm.h) {
            this.confirmName();
            return;
          }
        }

        if (this.input.justPressedEnter) {
          this.input.justPressedEnter = false;
          this.confirmName();
          return;
        }
        if (this.input.justPressedEsc) {
          if (this.nameWrapper) this.nameWrapper.classList.remove('show');
          if (this.nameInput) this.nameInput.blur();
          this.audio.playBeep(330, 0.06);
          this.state = 'COLOR_SELECT';
          this.input.clearPulses();
          return;
        }
        this.input.clearPulses();
        return;
      }

      if (this.state === 'RACE_SETUP') {
        if (this.nameWrapper) this.nameWrapper.classList.remove('show');
        if (this.setupCooldown > 0) {
          this.setupCooldown -= dt;
          this.input.lastCanvasClick = null;
          this.input.justPressedEnter = false;
        }
        this.audio.silenceEffects();
        this.menuCameraZ = this.wrapZ(this.menuCameraZ + 850 * dt);
        this.cameraRoll = 0;
        this.shake = 0;
        this.updateSkyScroll(dt);
        this.updateEnv(dt);

        const L = this.getSetupLayout();
        let clickedInteractive = false;
        if (this.input.lastCanvasClick && this.setupCooldown <= 0) {
          const click = this.input.lastCanvasClick;
          this.input.lastCanvasClick = null;

          // Seleção de Clima (seleciona o clima e avança o foco para Trilha Sonora)
          for (let k = 0; k < L.conds.length; k++) {
            const c = L.conds[k];
            if (click.x >= c.x && click.x <= c.x + c.w && click.y >= c.y && click.y <= c.y + c.h) {
              this.setEnvCond(ENV_CONDITIONS[c.i].id);
              this.setupGroup = 1;
              this.audio.playBeep(440, 0.06);
              clickedInteractive = true;
              break;
            }
          }

          // Seleção de Trilha Sonora (apenas seleciona a música!)
          if (!clickedInteractive) {
            for (let k = 0; k < L.songs.length; k++) {
              const c = L.songs[k];
              if (click.x >= c.x && click.x <= c.x + c.w && click.y >= c.y && click.y <= c.y + c.h) {
                this.songIndex = c.i;
                this.setupGroup = 1;
                this.audio.stopTitleMusic();
                this.audio.musicPlaying = true;
                if (this.audio && typeof this.audio.setSong === 'function') {
                  this.audio.setSong(c.i);
                }
                this.audio.playBeep(523, 0.08);
                clickedInteractive = true;
                break;
              }
            }
          }

          // Botão Voltar
          if (!clickedInteractive && L.btnBack) {
            const b = L.btnBack;
            if (click.x >= b.x && click.x <= b.x + b.w && click.y >= b.y && click.y <= b.y + b.h) {
              this.audio.playBeep(330, 0.06);
              this.state = 'NAME_INPUT';
              if (this.nameWrapper) this.nameWrapper.classList.add('show');
              if (this.nameInput) {
                this.nameInput.value = this.playerName || 'JOGADOR';
                setTimeout(() => { try { this.nameInput.focus(); } catch (_) {} }, 40);
              }
              this.audio.musicPlaying = false;
              this.audio.playTitleMusic();
              this.input.clearPulses();
              return;
            }
          }

          // Botão Modo Espelho (apenas fora do Campeonato)
          if (!clickedInteractive && L.mirrorBtn) {
            const b = L.mirrorBtn;
            if (click.x >= b.x && click.x <= b.x + b.w && click.y >= b.y && click.y <= b.y + b.h) {
              this.mirrorTrack = !this.mirrorTrack;
              this.loadTrack(this.trackIndex);
              this.audio.playBeep(500, 0.07);
              clickedInteractive = true;
            }
          }

          // Botão Qualy (1 Volta Lançada)
          if (!clickedInteractive && L.qualyBtn) {
            const b = L.qualyBtn;
            if (click.x >= b.x && click.x <= b.x + b.w && click.y >= b.y && click.y <= b.y + b.h) {
              this.audio.playBeep(587, 0.14);
              this.startQualySession();
              this.input.clearPulses();
              return;
            }
          }

          // Botão Confirmar / Iniciar Corrida
          if (!clickedInteractive && L.startBtn) {
            const b = L.startBtn;
            if (click.x >= b.x && click.x <= b.x + b.w && click.y >= b.y && click.y <= b.y + b.h) {
              this.audio.playBeep(659, 0.18);
              this.startRaceCountdown();
              this.input.clearPulses();
              return;
            }
          }
          // Qualquer toque/clique fora dos botoes nao deve disparar a largada
          this.input.justPressedEnter = false;
        }

        if (this.input.justPressedUp) {
          if (this.setupGroup === 2) {
            this.setupGroup = 1;
            this.audio.playBeep(380, 0.04);
          } else if (this.setupGroup === 1) {
            if (this.songIndex >= 2) {
              this.songIndex -= 2;
              this.audio.stopTitleMusic();
              this.audio.musicPlaying = true;
              if (this.audio && typeof this.audio.setSong === 'function') {
                this.audio.setSong(this.songIndex);
              }
              this.audio.playBeep(330, 0.05);
            } else {
              this.setupGroup = 0;
              const curIdx = ENV_CONDITIONS.findIndex(e => e.id === this.envCond);
              if (curIdx < 4 && curIdx >= 0) {
                this.setEnvCond(ENV_CONDITIONS[curIdx + 4].id);
              }
              this.audio.playBeep(380, 0.04);
            }
          } else {
            const curIdx = ENV_CONDITIONS.findIndex(e => e.id === this.envCond);
            if (curIdx >= 4) {
              this.setEnvCond(ENV_CONDITIONS[curIdx - 4].id);
              this.audio.playBeep(330, 0.05);
            } else {
              this.audio.playBeep(380, 0.04);
            }
          }
        }
        if (this.input.justPressedDown) {
          if (this.setupGroup === 0) {
            const curIdx = ENV_CONDITIONS.findIndex(e => e.id === this.envCond);
            if (curIdx < 4 && curIdx >= 0) {
              this.setEnvCond(ENV_CONDITIONS[curIdx + 4].id);
              this.audio.playBeep(330, 0.05);
            } else {
              this.setupGroup = 1;
              this.audio.playBeep(380, 0.04);
            }
          } else if (this.setupGroup === 1) {
            if (this.songIndex + 2 < SONGS.length) {
              this.songIndex += 2;
              this.audio.stopTitleMusic();
              this.audio.musicPlaying = true;
              if (this.audio && typeof this.audio.setSong === 'function') {
                this.audio.setSong(this.songIndex);
              }
              this.audio.playBeep(330, 0.05);
            } else {
              this.setupGroup = 2;
              if (this.setupActionIdx === undefined) this.setupActionIdx = 2;
              if (!L.qualyBtn && this.setupActionIdx === 1) this.setupActionIdx = 2;
              this.audio.playBeep(380, 0.04);
            }
          }
        }
        if (this.input.justPressedLeft) {
          if (this.setupGroup === 0) {
            const curIdx = ENV_CONDITIONS.findIndex(e => e.id === this.envCond);
            const nextIdx = (curIdx - 1 + ENV_CONDITIONS.length) % ENV_CONDITIONS.length;
            this.setEnvCond(ENV_CONDITIONS[nextIdx].id);
            this.audio.playBeep(330, 0.05);
          } else if (this.setupGroup === 1) {
            this.songIndex = (this.songIndex - 1 + SONGS.length) % SONGS.length;
            this.audio.stopTitleMusic();
            this.audio.musicPlaying = true;
            if (this.audio && typeof this.audio.setSong === 'function') {
              this.audio.setSong(this.songIndex);
            }
            this.audio.playBeep(330, 0.05);
          } else {
            const opts = L.qualyBtn ? [0, 1, 2] : [0, 2];
            const pos = Math.max(0, opts.indexOf(this.setupActionIdx !== undefined ? this.setupActionIdx : 2));
            this.setupActionIdx = opts[(pos - 1 + opts.length) % opts.length];
            this.audio.playBeep(330, 0.05);
          }
        }
        if (this.input.justPressedRight) {
          if (this.setupGroup === 0) {
            const curIdx = ENV_CONDITIONS.findIndex(e => e.id === this.envCond);
            const nextIdx = (curIdx + 1) % ENV_CONDITIONS.length;
            this.setEnvCond(ENV_CONDITIONS[nextIdx].id);
            this.audio.playBeep(330, 0.05);
          } else if (this.setupGroup === 1) {
            this.songIndex = (this.songIndex + 1) % SONGS.length;
            this.audio.stopTitleMusic();
            this.audio.musicPlaying = true;
            if (this.audio && typeof this.audio.setSong === 'function') {
              this.audio.setSong(this.songIndex);
            }
            this.audio.playBeep(330, 0.05);
          } else {
            const opts = L.qualyBtn ? [0, 1, 2] : [0, 2];
            const pos = Math.max(0, opts.indexOf(this.setupActionIdx !== undefined ? this.setupActionIdx : 2));
            this.setupActionIdx = opts[(pos + 1) % opts.length];
            this.audio.playBeep(330, 0.05);
          }
        }

        if (this.input.justPressedEnter && this.setupCooldown <= 0) {
          if (this.setupGroup === 0) {
            // 1º Enter/Botão A: confirma o clima escolhido e passa o foco para a Trilha Sonora
            this.setupGroup = 1;
            this.audio.playBeep(440, 0.08);
            this.input.clearPulses();
            return;
          }
          if (this.setupGroup === 1) {
            // 2º Enter/Botão A: confirma a música e passa o foco para os botões (VOLTAR / QUALY / CONFIRMAR)
            this.setupGroup = 2;
            if (this.setupActionIdx === undefined) this.setupActionIdx = L.qualyBtn ? 1 : 2;
            if (!L.qualyBtn && this.setupActionIdx === 1) this.setupActionIdx = 2;
            this.audio.playBeep(440, 0.08);
            this.input.clearPulses();
            return;
          }
          // 3º Enter/Botão A (nos botões de ação): executa o botão focado
          const act = (this.setupActionIdx !== undefined) ? this.setupActionIdx : 2;
          if (act === 0) {
            this.audio.playBeep(330, 0.06);
            this.state = 'NAME_INPUT';
            if (this.nameWrapper) this.nameWrapper.classList.add('show');
            if (this.nameInput) {
              this.nameInput.value = this.playerName || 'JOGADOR';
              setTimeout(() => { try { this.nameInput.focus(); } catch (_) {} }, 40);
            }
            this.audio.musicPlaying = false;
            this.audio.playTitleMusic();
            this.input.clearPulses();
            return;
          }
          if (act === 1 && L.qualyBtn) {
            this.audio.playBeep(587, 0.14);
            this.startQualySession();
            this.input.clearPulses();
            return;
          }
          this.audio.playBeep(659, 0.18);
          this.startRaceCountdown();
          this.input.clearPulses();
          return;
        }
        if (this.input.justPressedEsc) {
          this.audio.playBeep(330, 0.06);
          this.state = 'NAME_INPUT';
          if (this.nameWrapper) this.nameWrapper.classList.add('show');
          if (this.nameInput) {
            this.nameInput.value = this.playerName || 'JOGADOR';
            setTimeout(() => { try { this.nameInput.focus(); } catch (_) {} }, 40);
          }
          this.audio.musicPlaying = false;
          this.audio.playTitleMusic();
          this.input.clearPulses();
          return;
        }
        this.input.clearPulses();
        return;
      }
      if (this.input.justPressedEsc) {
        if (this.state === 'RACING') {
          this.pauseGame();
          this.input.clearPulses();
          return;
        } else if (this.state === 'PAUSED') {
          this.handlePauseBackKey();
          this.input.clearPulses();
          return;
        } else if (this.state === 'RESUME_COUNTDOWN') {
          this.pauseGame();
          this.input.clearPulses();
          return;
        }
      }

      if (this.state === 'PAUSED') {
        this.audio.silenceEffects();

        // 1. DIÁLOGO MODAL ATIVO
        if (this.pauseDialog) {
          const isExit = (this.pauseDialog === 'CONFIRM_EXIT');
          const isCamp = (this.gameMode === 'CHAMPIONSHIP');
          const numOptions = isExit ? (isCamp ? 3 : 2) : 2;

          if (this.input.lastCanvasClick) {
            const click = this.input.lastCanvasClick;
            this.input.lastCanvasClick = null;
            const cx = INTERNAL_WIDTH / 2;
            const cy = INTERNAL_HEIGHT / 2;
            const dlgW = isExit ? 232 : 220;
            const dlgH = isExit ? (isCamp ? 108 : 88) : 88;
            const dlgX = Math.round(cx - dlgW / 2);
            const dlgY = Math.round(cy - dlgH / 2);
            const btnW = dlgW - 28;
            const btnH = 17;
            const btnX = Math.round(cx - btnW / 2);
            const startY = dlgY + (isExit ? 40 : 44);
            const gapY = 20;

            for (let i = 0; i < numOptions; i++) {
              const bY = startY + i * gapY;
              if (click.x >= btnX && click.x <= btnX + btnW && click.y >= bY && click.y <= bY + btnH) {
                this.executePauseDialogAction(this.pauseDialog, i);
                this.input.clearPulses();
                return;
              }
            }
          }

          if (this.input.justPressedUp) {
            this.pauseDialogIndex = (this.pauseDialogIndex - 1 + numOptions) % numOptions;
            this.audio.playBeep(440, 0.05);
          }
          if (this.input.justPressedDown) {
            this.pauseDialogIndex = (this.pauseDialogIndex + 1) % numOptions;
            this.audio.playBeep(440, 0.05);
          }
          if (this.input.justPressedEnter) {
            this.executePauseDialogAction(this.pauseDialog, this.pauseDialogIndex);
            this.input.clearPulses();
            return;
          }
          if (this.input.justPressedEsc) {
            this.pauseDialog = null;
            this.audio.playBeep(330, 0.06);
            this.input.clearPulses();
            return;
          }

          this.input.clearPulses();
          return;
        }

        // 2. MENU PRINCIPAL DE PAUSA
        const touchSafe = this.input.touchControlsVisible;
        const pW = touchSafe ? 226 : 242;
        const pH = 126;
        const pX = Math.round(INTERNAL_WIDTH / 2 - pW / 2);
        const pY = 34;
        const btnW = pW - 28;
        const btnH = 17;
        const btnX = Math.round(INTERNAL_WIDTH / 2 - btnW / 2);
        const startY = pY + 28;
        const gapY = 21;

        if (this.input.lastCanvasClick) {
          const click = this.input.lastCanvasClick;
          this.input.lastCanvasClick = null;

          if (click.x >= INTERNAL_WIDTH - 38 && click.y <= 38) {
            this.executePauseMenuAction(2);
            this.input.clearPulses();
            return;
          }

          let clickedIndex = -1;
          for (let i = 0; i < 4; i++) {
            const bY = startY + i * gapY;
            if (click.x >= btnX && click.x <= btnX + btnW && click.y >= bY && click.y <= bY + btnH) {
              clickedIndex = i;
              break;
            }
          }

          if (clickedIndex !== -1) {
            this.pauseMenuIndex = clickedIndex;
            this.executePauseMenuAction(clickedIndex);
            this.input.clearPulses();
            return;
          }
        }

        if (this.input.justPressedUp) {
          this.pauseMenuIndex = (this.pauseMenuIndex - 1 + 4) % 4;
          this.audio.playBeep(440, 0.05);
        }
        if (this.input.justPressedDown) {
          this.pauseMenuIndex = (this.pauseMenuIndex + 1) % 4;
          this.audio.playBeep(440, 0.05);
        }
        if (this.input.justPressedEnter) {
          this.executePauseMenuAction(this.pauseMenuIndex);
          this.input.clearPulses();
          return;
        }
        if (this.input.justPressedEsc) {
          this.triggerResumeCountdown();
          this.input.clearPulses();
          return;
        }

        this.input.clearPulses();
        return;
      }

      if (this.state === 'RESUME_COUNTDOWN') {
        this.audio.silenceEffects();
        this.resumeCountdown -= dt;
        const currentInt = Math.ceil(this.resumeCountdown);
        if (currentInt !== this.lastResumeInt && currentInt >= 1 && currentInt <= 3) {
          this.lastResumeInt = currentInt;
          if (this.audio) this.audio.playCountdownBeep(false);
        }
        if (this.resumeCountdown <= 0) {
          if (this.audio) this.audio.playCountdownBeep(true);
          this.state = 'RACING';
        }
        if (this.input.justPressedEsc) {
          this.pauseGame();
        }
        this.input.clearPulses();
        return;
      }

      if (this.state === 'SLOT_SELECT') {
        if (this.nameWrapper) this.nameWrapper.classList.remove('show');
        this.audio.silenceEffects();
        this.menuCameraZ = this.wrapZ(this.menuCameraZ + 850 * dt);
        this.cameraRoll = 0;
        this.shake = 0;
        this.updateSkyScroll(dt);
        this.updateEnv(dt);

        const slots = SaveManager.getAllSlots();
        const cx = INTERNAL_WIDTH / 2;
        const cy = INTERNAL_HEIGHT / 2;

        // Modal de Exclusão
        if (this.slotDeleteConfirm !== null) {
          const slotNum = this.slotDeleteConfirm;
          if (this.input.lastCanvasClick) {
            const click = this.input.lastCanvasClick;
            this.input.lastCanvasClick = null;
            const mY = Math.round(cy - 75 / 2);
            if (click.x >= cx - 88 && click.x <= cx - 8 && click.y >= mY + 44 && click.y <= mY + 62) {
              SaveManager.deleteSlot(slotNum);
              this.slotDeleteConfirm = null;
              this.audio.playBeep(330, 0.1);
              this.input.clearPulses();
              return;
            }
            if (click.x >= cx + 8 && click.x <= cx + 88 && click.y >= mY + 44 && click.y <= mY + 62) {
              this.slotDeleteConfirm = null;
              this.audio.playBeep(440, 0.06);
              this.input.clearPulses();
              return;
            }
          }
          if (this.input.justPressedEsc) {
            this.slotDeleteConfirm = null;
            this.audio.playBeep(330, 0.06);
          }
          this.input.clearPulses();
          return;
        }

        // Modal de Substituição
        if (this.slotOverwriteConfirm !== null) {
          const slotNum = this.slotOverwriteConfirm;
          if (this.input.lastCanvasClick) {
            const click = this.input.lastCanvasClick;
            this.input.lastCanvasClick = null;
            const mY = Math.round(cy - 75 / 2);
            if (click.x >= cx - 92 && click.x <= cx - 6 && click.y >= mY + 44 && click.y <= mY + 62) {
              SaveManager.deleteSlot(slotNum);
              this.slotOverwriteConfirm = null;
              this.audio.playBeep(523, 0.12);
              this.startNewChampionshipInSlot(slotNum);
              this.input.clearPulses();
              return;
            }
            if (click.x >= cx + 6 && click.x <= cx + 92 && click.y >= mY + 44 && click.y <= mY + 62) {
              this.slotOverwriteConfirm = null;
              this.audio.playBeep(330, 0.06);
              this.input.clearPulses();
              return;
            }
          }
          if (this.input.justPressedEsc) {
            this.slotOverwriteConfirm = null;
            this.audio.playBeep(330, 0.06);
          }
          this.input.clearPulses();
          return;
        }

        // Tela de seleção normal
        const cardW = 280;
        const cardH = 39;
        const cardX = Math.round(cx - cardW / 2);
        const startY = 38;
        const gapY = 44;

        if (this.input.lastCanvasClick) {
          const click = this.input.lastCanvasClick;
          this.input.lastCanvasClick = null;

          // Botão VOLTAR
          if (click.x >= cx - 45 && click.x <= cx + 45 && click.y >= 176 && click.y <= 198) {
            this.audio.playBeep(330, 0.06);
            if (this.slotSelectMode === 'NEW') {
              this.fadeTransition('DIFFICULTY_SELECT');
            } else {
              this.fadeTransition('MENU');
            }
            this.input.clearPulses();
            return;
          }

          // Checar toque nos cards
          for (let i = 0; i < 3; i++) {
            const slotNum = i + 1;
            const slotData = slots[i];
            const cY = startY + i * gapY;

            // Botão Excluir à direita
            if (this.slotSelectMode === 'CONTINUE' && slotData && click.x >= cardX + cardW - 32 && click.x <= cardX + cardW - 4 && click.y >= cY + 4 && click.y <= cY + cardH - 4) {
              this.slotDeleteConfirm = slotNum;
              this.audio.playBeep(300, 0.08);
              this.input.clearPulses();
              return;
            }

            // Clique no corpo do card
            if (click.x >= cardX && click.x <= cardX + cardW && click.y >= cY && click.y <= cY + cardH) {
              this.selectedSlotIndex = i;
              if (this.slotSelectMode === 'CONTINUE') {
                if (slotData) {
                  this.audio.playBeep(523, 0.12);
                  this.loadFromSave(slotData);
                } else {
                  this.audio.playBeep(220, 0.08);
                }
              } else {
                if (slotData) {
                  this.slotOverwriteConfirm = slotNum;
                  this.audio.playBeep(440, 0.08);
                } else {
                  this.audio.playBeep(523, 0.12);
                  this.startNewChampionshipInSlot(slotNum);
                }
              }
              this.input.clearPulses();
              return;
            }
          }
        }

        if (this.input.justPressedUp) {
          this.selectedSlotIndex = (this.selectedSlotIndex - 1 + 3) % 3;
          this.audio.playBeep(440, 0.05);
        }
        if (this.input.justPressedDown) {
          this.selectedSlotIndex = (this.selectedSlotIndex + 1) % 3;
          this.audio.playBeep(440, 0.05);
        }
        if (this.input.justPressedEnter) {
          const slotNum = this.selectedSlotIndex + 1;
          const slotData = slots[this.selectedSlotIndex];
          if (this.slotSelectMode === 'CONTINUE') {
            if (slotData) {
              this.audio.playBeep(523, 0.12);
              this.loadFromSave(slotData);
            } else {
              this.audio.playBeep(220, 0.08);
            }
          } else {
            if (slotData) {
              this.slotOverwriteConfirm = slotNum;
              this.audio.playBeep(440, 0.08);
            } else {
              this.audio.playBeep(523, 0.12);
              this.startNewChampionshipInSlot(slotNum);
            }
          }
          this.input.clearPulses();
          return;
        }

        if (this.input.justPressedEsc) {
          this.audio.playBeep(330, 0.06);
          if (this.slotSelectMode === 'NEW') {
            this.fadeTransition('DIFFICULTY_SELECT');
          } else {
            this.fadeTransition('MENU');
          }
          this.input.clearPulses();
          return;
        }

        this.input.clearPulses();
        return;
      }

      if (this.state === 'RACE_RESULT') {
        this.audio.silenceEffects();
        if (this.input.lastCanvasClick) {
          this.input.lastCanvasClick = null;
          this.input.justPressedEnter = true;
        }
        if (this.input.justPressedEnter) {
          this.audio.playBeep(440, 0.1);
          if (this.isOnlineRace) {
            this.isOnlineRace = false;
            this.remoteCar = null;
            if (this.netplay && this.netplay.role === 'HOST') {
              this.netplay.updateMeta({ status: 'LOBBY', guestReady: false });
            }
            this.onlineSubMode = (this.netplay && this.netplay.connected) ? 'ROOM' : 'CHOICE';
            this.fadeTransition('ONLINE_LOBBY', () => {
              this.audio.musicPlaying = false;
              this.audio.playTitleMusic();
            });
          } else if (this.gameMode === 'QUICK_RACE') {
            this.fadeTransition('MENU', () => {
              this.audio.musicPlaying = false;
              this.audio.playTitleMusic();
            });
          } else {
            this.fadeTransition('CHAMPIONSHIP_STANDINGS');
          }
        }
        this.input.clearPulses();
        return;
      }

      if (this.state === 'CHAMPIONSHIP_STANDINGS') {
        this.audio.silenceEffects();
        if (this.input.lastCanvasClick) {
          this.input.lastCanvasClick = null;
          this.input.justPressedEnter = true;
        }
        if (this.input.justPressedEnter) {
          this.audio.playBeep(440, 0.1);
          const hasNext = (this.seasonSchedule && this.seasonSchedule.length > 0 && this.seasonStage < this.seasonSchedule.length - 1);
          if (hasNext) {
            this.computeNextGridOrder();
            this.saveCurrentChampionship();
            if (this.diffMode === 'NORMAL') {
              this.selectedUpgradeIndex = 0;
              this.fadeTransition('SEASON_UPGRADES');
            } else {
              this.fadeTransition('SAVE_PROGRESS');
            }
          } else {
            this.fadeTransition('CHAMPIONSHIP_RESULT', () => {
              this.initConfetti();
            });
          }
        }
        this.input.clearPulses();
        return;
      }

      if (this.state === 'SEASON_UPGRADES') {
        this.audio.silenceEffects();
        this.updateUpgrades(dt);
        return;
      }

      if (this.state === 'SAVE_PROGRESS') {
        this.audio.silenceEffects();
        if (this.input.lastCanvasClick) {
          this.input.lastCanvasClick = null;
          this.input.justPressedEnter = true;
        }
        if (this.input.justPressedEnter) {
          this.audio.playBeep(523, 0.12);
          this.seasonStage++;
          this.trackIndex = this.seasonSchedule[this.seasonStage];
          this.loadTrack(this.trackIndex);
          const curSong = this.songIndex;
          let nextSong = curSong;
          if (SONGS.length > 1) {
            do {
              nextSong = Math.floor(Math.random() * SONGS.length);
            } while (nextSong === curSong);
          }
          this.songIndex = nextSong;
          this.setupCooldown = 0.25;
          this.setupGroup = 0;
          this.fadeTransition('RACE_SETUP');
          this.input.clearPulses();
          return;
        }
        this.input.clearPulses();
        return;
      }

      if (this.state === 'CHAMPIONSHIP_RESULT') {
        this.audio.silenceEffects();
        this.updateConfetti(dt);
        if (this.input.lastCanvasClick) {
          this.input.lastCanvasClick = null;
          this.input.justPressedEnter = true;
        }
        if (this.input.justPressedEnter) {
          this.audio.playBeep(440, 0.1);
          const overall = this.cars.map(c => ({
            car: c,
            points: this.championshipPoints[c.id] || 0
          })).sort((a, b) => b.points - a.points);
          const pFinalRank = overall.findIndex(o => o.car.isPlayer) + 1;
          const isTop3 = pFinalRank <= 3;
          this.fadeTransition('ENDING_SCENE', () => {
            this.endingTimer = 0;
            this.endingRank = pFinalRank;
            this.endingFireworks = [];
            this.initConfetti();
            if (this.audio) this.audio.playEndingMusic(isTop3);
          });
        }
        this.input.clearPulses();
        return;
      }

      if (this.state === 'ENDING_SCENE') {
        this.audio.silenceEffects();
        this.endingTimer += dt;
        this.updateConfetti(dt);
        this.updateEndingFireworks(dt);
        if (this.input.lastCanvasClick) {
          this.input.lastCanvasClick = null;
          this.input.justPressedEnter = true;
        }
        if (this.input.justPressedEnter) {
          this.audio.playBeep(440, 0.1);
          if (this.audio) {
            this.audio.stopEndingMusic();
            this.audio.playTitleMusic();
          }
          this.championshipPoints.fill(0);
          this.initSeasonRoster();
          this.loadTrack(0);
          this.fadeTransition('MENU');
        }
        this.input.clearPulses();
        return;
      }

      // --- LARGADA ESTILO F1 (TODOS PARADOS NO GRID) ---
      if (this.state === 'COUNTDOWN') {
        for (let i = 0; i < this.cars.length; i++) {
          this.cars[i].speed = 0;
        }

        this.countdown -= dt;
        if (this.countdown > 2.7) {
          if (this.startLightsStage !== 1) {
            this.startLightsStage = 1;
            this.audio.playBeep(440, 0.15);
          }
        } else if (this.countdown > 1.8) {
          if (this.startLightsStage !== 2) {
            this.startLightsStage = 2;
            this.audio.playBeep(440, 0.15);
          }
        } else if (this.countdown > 0.9) {
          if (this.startLightsStage !== 3) {
            this.startLightsStage = 3;
            this.audio.playBeep(440, 0.15);
          }
        } else if (this.countdown > 0) {
          if (this.startLightsStage !== 4) {
            this.startLightsStage = 4;
            this.audio.playBeep(440, 0.15);
          }
        } else {
          this.startLightsStage = 5; // LUZES VERDES: LARGADA IMEDIATA!
          this.greenLightsTimer = 0.85;
          this.audio.playBeep(880, 0.35);
          this.state = 'RACING';
        }

        this.updateEnv(dt);
        this.audio.updateEngineRpm(1200, false, false);
        this.input.clearPulses();
        return;
      }

      // --- CORRIDA EM ANDAMENTO ---
      this.updateSkyScroll(dt);
      this.updateEnv(dt);
      const targetCamDepth = (this.player && this.player.isNitro && this.state === 'RACING') ? (CAMERA_DEPTH * 0.90) : CAMERA_DEPTH;
      this.currentCameraDepth += (targetCamDepth - (this.currentCameraDepth || CAMERA_DEPTH)) * Math.min(1, dt * 6);
      if (this.greenLightsTimer > 0) this.greenLightsTimer -= dt;
      if (this.state === 'RACING') {
        this.raceTimer += dt;
        this.currentLapTime += dt;
      }
      if (this.lapBannerTimer > 0) this.lapBannerTimer -= dt;

      const p = this.player;
      const model = p.model;
      const playerSeg = this.findSegment(p.z);

      if (this.finishingRace) {
        this.finishTimer -= dt;
        const elapsed = this.finishDuration - this.finishTimer;

        // Desaceleração suave e alinhamento reto do carro pós-bandeirada
        p.speed = Math.max(80, p.speed * 0.993);
        p.steerAngle *= 0.88;
        p.x += (0 - p.x) * 0.02;
        p.isBraking = false;
        p.isNitro = false;

        const stepZ = p.speed * 20 * dt;
        p.z = this.wrapZ(p.z + stepZ);
        p.totalDistance += stepZ;

        this.audio.updateEngineRpm(Math.max(1200, p.speed * 20), false, false);
        this.audio.setSkid(false);
        this.audio.setSurfaceFx(false, 0, 0);

        if (this.finishFireworks && this.finishFireworks.length > 0) {
          this.updateFinishFireworks(dt);
        }

        // Efeito fade até a classificação: inicia suave em 1.0s e chega a 1.0 em 3.0s
        const fadeStart = 1.0;
        if (elapsed >= fadeStart) {
          this.finishFadeAlpha = Math.min(1.0, (elapsed - fadeStart) / (this.finishDuration - fadeStart));
        } else {
          this.finishFadeAlpha = 0;
        }

        if (this.finishTimer <= 0) {
          this.finishingRace = false;
          this.finishFadeAlpha = 0;
          this.finishRace();
          this.input.clearPulses();
          return;
        }
      } else {
        if (this.input.justPressedNitro && p.nitroCharges > 0 && p.nitroTimer <= 0 && this.state === 'RACING') {
          p.nitroCharges--;
          p.nitroTimer = 3.0 + (p.nitroDurationBonus || 0);
          p.nitroDecayTimer = 0;
          this.audio.triggerNitroSound();
          this.vibrate([18, 20, 28]);
        }
        if (p.nitroTimer > 0) {
          p.nitroTimer -= dt;
          p.isNitro = true;
          if (p.nitroTimer <= 0) {
            p.nitroTimer = 0;
            p.isNitro = false;
            p.nitroDecayTimer = 3.0; // Inicia a desaceleração gradual suave de 3 segundos pós-nitro
          }
        } else {
          p.isNitro = false;
          if (p.nitroDecayTimer > 0) {
            p.nitroDecayTimer = Math.max(0, p.nitroDecayTimer - dt);
          }
        }

      // Detecção de Vácuo (Slipstream) progressivo e gradual:
      // Atinge o ápice de 100% a uma distância segura (<= 700 unidades, o dobro da anterior)
      // permitindo embalar e preparar o slingshot com perícia e sem colidir na traseira!
      p.inSlipstream = false;
      p.slipstreamIntensity = 0;
      p.slipstreamTarget = null;
      if (this.state === 'RACING' && p.speed > 35) {
        let bestIntensity = 0;
        let bestTarget = null;
        for (let i = 0; i < this.cars.length; i++) {
          const other = this.cars[i];
          if (other.isPlayer) continue;
          const aheadDz = this.shortestDeltaZ(other.z, p.z);
          if (aheadDz >= -30 && aheadDz <= 2600) {
            let distW = 0;
            if (aheadDz <= 700) {
              distW = 1.0;
            } else {
              const progress = (aheadDz - 700) / (2600 - 700);
              distW = Math.pow(1.0 - progress, 0.82);
            }
            const maxLat = 0.65 + 0.35 * (Math.max(0, aheadDz) / 2600);
            const latDiff = Math.abs(other.x - p.x);
            if (latDiff < maxLat) {
              const alignW = Math.max(0, 1.0 - (latDiff / maxLat));
              const intensity = Math.max(0, Math.min(1.0, distW * alignW));
              if (intensity > bestIntensity) {
                bestIntensity = intensity;
                bestTarget = other;
              }
            }
          }
        }
        if (bestIntensity > 0.015) {
          p.inSlipstream = true;
          p.slipstreamIntensity = bestIntensity;
          p.slipstreamTarget = bestTarget;
          p.slipstreamDecayTimer = 1.0; // Slingshot calibrado para 1 segundo com decaimento gradual
          p.slipstreamStoredIntensity = Math.max(p.slipstreamStoredIntensity || 0, bestIntensity);
          p.slipstreamPeakSpeed = Math.max(p.slipstreamPeakSpeed || 0, p.speed);
        }
      }

      if (!p.inSlipstream && p.slipstreamDecayTimer > 0) {
        p.slipstreamDecayTimer = Math.max(0, p.slipstreamDecayTimer - dt);
        if (p.slipstreamDecayTimer <= 0) {
          p.slipstreamStoredIntensity = 0;
          p.slipstreamPeakSpeed = 0;
        }
      }

      // Ganho progressivo de velocidade e aceleração conforme a proximidade (Fórmula 1):
      // Decaimento gradativo e proporcional ao longo de 1 segundo pós-desvio do vácuo
      const slingshotRatio = Math.max(0, Math.min(1.0, p.slipstreamDecayTimer / 1.0));
      const effectiveSlipInt = p.inSlipstream
        ? (p.slipstreamIntensity || 0)
        : (p.slipstreamDecayTimer > 0 ? ((p.slipstreamStoredIntensity || 0.4) * slingshotRatio) : 0);
      const slipInt = effectiveSlipInt;
      // Bônus de velocidade máxima do Nitro com rampa suave de decaimento de 3 segundos pós-término
      const nitroBoostRatio = p.isNitro
        ? 0.30
        : (p.nitroDecayTimer > 0 ? (0.30 * (p.nitroDecayTimer / 3.0)) : 0);
      const baseMax = this.getEffectiveMaxSpeed(p) * (1.0 + nitroBoostRatio);
      const speedGapBonus = (p.slipstreamTarget && p.slipstreamTarget.speed > p.speed)
        ? (p.slipstreamTarget.speed - p.speed) * 0.85 * effectiveSlipInt
        : 0;
      const vacuumSpeedBoost = ((baseMax * 0.22) + 24) * effectiveSlipInt;
      let effectiveMaxSpeed = baseMax + vacuumSpeedBoost + speedGapBonus;
      if (!p.inSlipstream && p.slipstreamDecayTimer > 0 && p.slipstreamPeakSpeed > effectiveMaxSpeed) {
        // Diminui gradativamente da velocidade de pico de volta à velocidade nominal ao longo de 1 segundo
        effectiveMaxSpeed = effectiveMaxSpeed + (p.slipstreamPeakSpeed - effectiveMaxSpeed) * slingshotRatio;
      }
      const accelNitroMul = p.isNitro ? 1.85 : (p.nitroDecayTimer > 0 ? (1.0 + 0.85 * (p.nitroDecayTimer / 3.0)) : 1.0);
      const effectiveAccel = model.acceleration * accelNitroMul * (1.0 + 1.25 * effectiveSlipInt);
      const speedRatio = Math.min(1.2, p.speed / Math.max(1, effectiveMaxSpeed));

      // Resposta analógica de pressão dos gatilhos L2 e R2 (ou 1.0 com teclado/touch)
      const throttleInput = p.isNitro ? 1.0 : (this.input.throttlePressure !== undefined ? this.input.throttlePressure : (this.input.up ? 1.0 : 0.0));
      const brakeInput = this.input.brakePressure !== undefined ? this.input.brakePressure : (this.input.down ? 1.0 : 0.0);

      const isAccelerating = ((throttleInput > 0.05) || p.isNitro) && (this.state === 'RACING');
      p.isBraking = (brakeInput > 0.05) && (this.state === 'RACING');

      // Curva de torque e resistência aerodinâmica para criar cadência real de aceleração através das marchas:
      const slope = (playerSeg.p2.world.y - playerSeg.p1.world.y) / SEGMENT_LENGTH;
      const airDragFactor = Math.pow(Math.min(1.0, speedRatio), 1.6) * 0.58;
      const torqueFactor = Math.max(0.32, 1.28 - airDragFactor);

      // Descida de ladeira (slope < 0): ganha aceleracao gravitacional e ultrapassa o limite de velocidade nominal!
      const downhillBonus = Math.max(0, -slope * 300);
      const dynamicMaxSpeed = effectiveMaxSpeed + downhillBonus;

      const isPowerBraking = isAccelerating && p.isBraking;

      if (isPowerBraking) {
        // Power Braking estilo Top Gear (Acelerador + Freio simultâneos):
        // Retenção ainda mais suave (+25%) de velocidade (~6 a 9 km/h por segundo), mantendo o carro no traçado quase como se não estivesse freando
        const powerBrakeRate = (6 + model.braking * 4.5) * brakeInput * dt;
        p.speed = Math.max(48, p.speed - powerBrakeRate);
      } else if (isAccelerating) {
        // Cadência de arrancada esportiva progressiva (~6 a 8s para velocidade final)
        const basePower = p.isNitro ? (65 + effectiveAccel * 55) : (24 + effectiveAccel * 26);
        const rate = basePower * torqueFactor * throttleInput * dt;
        const suctionPull = (32 + model.acceleration * 38) * slipInt * dt;
        // Velocidade alvo correspondente à pressão no gatilho R2 (permite dosar velocidade de cruzeiro)
        const targetPartialSpeed = p.isNitro ? dynamicMaxSpeed : dynamicMaxSpeed * (0.35 + 0.65 * throttleInput);
        if (p.speed < targetPartialSpeed) {
          p.speed = Math.min(p.speed + rate + suctionPull, targetPartialSpeed);
        } else {
          // Desaceleração cadenciada e gradual pós-slingshot, nitro e ladeiras:
          // Em vez de frenagem brusca, o excesso de velocidade se dissipa de forma suave e progressiva (~4 a 8 km/h por segundo),
          // permitindo que carros mais lentos (ex: Fusca) mantenham a vantagem da ultrapassagem por vários segundos.
          const excessSpeed = p.speed - targetPartialSpeed;
          const isSlingshot = (p.slipstreamDecayTimer > 0);
          const excessDecay = isSlingshot
            ? Math.min(7.5, Math.max(3.2, excessSpeed * 0.15)) * dt
            : Math.min(9.0, Math.max(3.8, excessSpeed * 0.18)) * dt;
          p.speed = Math.max(targetPartialSpeed, p.speed - excessDecay);
        }
      } else if (p.isBraking) {
        // Frenagem progressiva proporcional à intensidade no gatilho L2
        const brakeRate = (255 + model.braking * 175) * brakeInput * dt;
        p.speed = Math.max(p.speed - brakeRate, 0);
      } else {
        const drag = (42 + speedRatio * 30) * dt;
        p.speed = Math.max(p.speed - drag, 0);
      }

      // Gravidade fisica continua:
      // - Descendo (slope < 0): ganho visível e contínuo de aceleração gravitacional que embala o carro ladeira abaixo!
      if (p.speed > 10 && slope < 0) {
        const gravityForce = -slope * 460 * dt;
        // Permite embalar na descida somando perfeitamente a gravidade com a velocidade de vácuo, slingshot e nitro
        const downhillTerminalSpeed = dynamicMaxSpeed + 35;
        p.speed = Math.min(downhillTerminalSpeed, p.speed + gravityForce);
        // Trepidação de chassi proporcional ao excesso de velocidade na descida (reduzida pela metade)
        const pEffMax = this.getEffectiveMaxSpeed(p);
        if (p.speed > pEffMax) {
          const overDiff = (p.speed - pEffMax);
          this.shake = Math.max(this.shake, Math.min(1.4, overDiff * 0.04));
        }
      } else if (p.speed > 10 && slope > 0) {
        // Subindo (slope > 0): o peso da subida segura o carro
        const gravityResistance = slope * 280 * dt;
        p.speed = Math.max(25, p.speed - gravityResistance);
      }

      const prevGear = p.currentGear;
      p.updateTransmission();
      if (this.state === 'RACING' && p.currentGear > prevGear && isAccelerating && p.speed > 55) {
        if (this.audio && typeof this.audio.playBeep === 'function') {
          this.audio.playBeep(95 + p.currentGear * 18, 0.035);
        }
      }
      if (isPowerBraking && p.speed > 35) {
        // Mantém o motor na faixa alta de giro e potência durante a tangência da curva
        p.rpm = Math.max(p.rpm, 5200);
      }

      // Esterçamento Analógico Suave (controla física + troca dos 3 sprites de curva/reta)
      let steerInput = 0;
      if (this.state === 'RACING') {
        if (this.input && Math.abs(this.input.analogSteer) > 0.04) {
          steerInput = this.input.analogSteer;
        } else {
          if (this.input.left) steerInput -= 1;
          if (this.input.right) steerInput += 1;
        }
      }
      p.steer = steerInput;

      if (steerInput !== 0) {
        const rampRate = (steerInput * p.steerAngle < 0) ? 13.5 : 8.8;
        p.steerAngle += (steerInput - p.steerAngle) * Math.min(1, rampRate * dt);
      } else {
        p.steerAngle += (0 - p.steerAngle) * Math.min(1, 10.8 * dt);
        if (Math.abs(p.steerAngle) < 0.01) p.steerAngle = 0;
      }

      // Acumulador progressivo e extra-suave de tempo segurando acelerador + freio na curva (sem solavancos ou puxões instantâneos)
      if (isPowerBraking && Math.abs(playerSeg.curve) > 0.1) {
        p.powerBrakeHoldTime = Math.min(3.0, (p.powerBrakeHoldTime || 0) + dt);
      } else {
        p.powerBrakeHoldTime = Math.max(0, (p.powerBrakeHoldTime || 0) - dt * 2.0);
      }
      const powerBrakeProgress = Math.min(1.0, (p.powerBrakeHoldTime || 0) / 2.4);

      if (Math.abs(p.steerAngle) > 0.01 && p.speed > 2) {
        const lowSpeedAuthority = Math.min(1, p.speed / 45);
        const highSpeedAuthority = 1.0 - Math.min(0.22, speedRatio * 0.18);
        // Resposta de esterçamento 100% natural e previsível, sem puxão abrupto no volante
        const steerPower = (2.15 * model.handling + 0.42) * lowSpeedAuthority * highSpeedAuthority;
        p.x += p.steerAngle * steerPower * dt;

        // Leve perda de velocidade por atrito lateral em curvas fortes (desativada no power braking para não frear duplo)
        if (Math.abs(playerSeg.curve) > 1.4 && speedRatio > 0.72 && !isPowerBraking) {
          const scrub = Math.abs(p.steerAngle) * (1.15 - model.grip * 0.65) * 22 * dt;
          p.speed = Math.max(40, p.speed - scrub);
        }
      }

      // Força Centrífuga progressiva e equilibrada + amortecimento elástico de toque lateral
      if (playerSeg.curve !== 0 && p.speed > 15) {
        // Ao acionar acelerador + freio, segura o carro firme na tangente sem solavanco.
        // Quanto mais tempo mantiver o freio acionado, mais suavemente a centrífuga se estabiliza.
        const centrifugalSuppress = isPowerBraking ? (0.91 - 0.12 * powerBrakeProgress) : 1.0;
        const centrifugal = ((playerSeg.curve * (speedRatio * speedRatio) * 0.40) / model.centrifugalResistance) * centrifugalSuppress;
        p.x -= centrifugal * dt;

        // Puxada suave e progressiva para o traçado interno da curva (calibrada +25% mais suave para máxima fluidez e naturalidade)
        if (isPowerBraking && powerBrakeProgress > 0.05) {
          const curveDir = Math.sign(playerSeg.curve); // +1 curva à direita, -1 curva à esquerda
          const curveIntensity = Math.min(1.0, Math.abs(playerSeg.curve) / 2.5);
          const gentleInwardPull = curveDir * (0.082 * powerBrakeProgress * curveIntensity) * dt;
          p.x += gentleInwardPull;
        }
      }
      if (Math.abs(p.bumpVelX) > 0.003) {
        p.x += p.bumpVelX * dt;
        p.bumpVelX *= Math.exp(-6.5 * dt);
      } else {
        p.bumpVelX = 0;
      }
      p.x = Math.max(Math.min(p.x, 2.25), -2.25);

      // Física diferenciada entre Zebra (Curb) e Grama (Off-road) — sem tremer a tela à toa!
      const absX = Math.abs(p.x);
      const isOffroad = absX > 1.08;

      if (isOffroad && p.speed > 45) {
        const offDepth = Math.min(1.5, (absX - 1.08) * 1.8 + 0.5);
        p.speed = Math.max(p.speed - (155 * offDepth) * dt, 42);
        this.shake = Math.max(this.shake * 0.85, 1.5);
        this.particlePool.spawn(p.x + (Math.random() - 0.5) * 0.18, 0, p.z, (Math.random() - 0.5) * 0.45, -0.26, 0.28, playerSeg.color.grass);
      } else {
        // Pista asfaltada lisa: zero vibração na câmera para eliminar qualquer sensação de náusea/enjoo
        this.shake = Math.max(0, this.shake - 25 * dt);
      }

      // Roll Dinâmico refinado: inclinação suave e natural da câmera proporcional à curva e velocidade
      const targetRoll = (-playerSeg.curve * 0.012) + (p.steerAngle * 0.016) * (p.speed / 200);
      this.cameraRoll += (targetRoll - this.cameraRoll) * 7.5 * dt;

      // Faíscas metálicas ao raspar no guard-rail / muretas laterais ou zebra em alta velocidade
      if (absX >= 1.20 && p.speed > 55) {
        const sparkSide = (p.x > 0 ? 1 : -1);
        const sparkX = p.x + sparkSide * 0.12;
        const sparkCol = (Math.random() < 0.4) ? '#FFFFFF' : ((Math.random() < 0.5) ? '#FFD700' : '#FF6D00');
        this.particlePool.spawn(
          sparkX,
          0.02,
          p.z - 5,
          (Math.random() - 0.5) * 0.6 - sparkSide * 0.35,
          -Math.random() * 0.45 - 0.1,
          0.18 + Math.random() * 0.15,
          sparkCol
        );
      } else if (absX >= 0.98 && absX <= 1.18 && p.speed > 160 && Math.abs(p.steerAngle) > 0.35) {
        if (Math.random() < 0.45) {
          const sparkCol = (Math.random() < 0.5) ? '#FFD700' : '#FF9100';
          this.particlePool.spawn(
            p.x + (Math.random() - 0.5) * 0.20,
            0.04,
            p.z - 5,
            (Math.random() - 0.5) * 0.4,
            -Math.random() * 0.35 - 0.1,
            0.15 + Math.random() * 0.12,
            sparkCol
          );
        }
      }

      if (p.isNitro) {
        if (Math.random() < 0.65) {
          this.particlePool.spawn(p.x - 0.05, 0.01, p.z, (Math.random() - 0.5) * 0.08, -0.10, 0.12, '#00E5FF');
          this.particlePool.spawn(p.x + 0.05, 0.01, p.z, (Math.random() - 0.5) * 0.08, -0.10, 0.12, 'rgba(255, 255, 255, 0.75)');
        }
      } else if (p.inSlipstream && Math.random() < 0.45) {
        this.particlePool.spawn(p.x + (Math.random() - 0.5) * 0.28, -0.12, p.z + 40, 0, -0.05, 0.14, 'rgba(210, 245, 255, 0.45)');
      }

      // Detecção de derrapagem / Power Slide estilo Top Gear e frenagem forte
      const isPowerSliding = isPowerBraking && p.speed > 50 && (Math.abs(p.steerAngle) > 0.16 || Math.abs(playerSeg.curve) > 0.35);
      const isHardBraking = p.isBraking && p.speed > 95;
      const isSkidding = isPowerSliding || isHardBraking || (Math.abs(p.steerAngle) > 0.58 && speedRatio > 0.66 && Math.abs(playerSeg.curve) > 0.95) || (isOffroad && p.speed > 80);

      if (isSkidding && !isOffroad && this.state === 'RACING') {
        playerSeg.skidX = p.x;
        playerSeg.skidUntil = this.raceTimer + 7.0;
        if (Math.random() < 0.75) {
          // Fumaça de borracha nos pneus traseiros (mais intensa durante o power braking)
          const smokeAlpha = isPowerBraking ? '0.72' : '0.55';
          this.particlePool.spawn(p.x - 0.11, 0.04, p.z, (Math.random() - 0.5) * 0.22, -0.20, 0.24, `rgba(226, 232, 240, ${smokeAlpha})`);
          this.particlePool.spawn(p.x + 0.11, 0.04, p.z, (Math.random() - 0.5) * 0.22, -0.20, 0.24, `rgba(226, 232, 240, ${smokeAlpha})`);
        }
      }
      const onRumble = (this.state === 'RACING') && Math.abs(p.x) >= 0.88 && Math.abs(p.x) <= 1.22;
      const rainFactor = this.envCur ? (this.envCur.s.rain || 0) : 0;

      // Spray de água nos pneus traseiros em pista molhada (estilo F1)
      if (this.state === 'RACING' && rainFactor > 0.20 && p.speed > 75 && Math.random() < 0.72) {
        this.particlePool.spawn(p.x - 0.12, 0.02, p.z, (Math.random() - 0.5) * 0.35 - 0.12, -0.35 - Math.random() * 0.25, 0.22, 'rgba(200, 235, 255, 0.55)');
        this.particlePool.spawn(p.x + 0.12, 0.02, p.z, (Math.random() - 0.5) * 0.35 + 0.12, -0.35 - Math.random() * 0.25, 0.22, 'rgba(200, 235, 255, 0.55)');
      }

      // Faíscas de fundo plano em alta velocidade sobre zebras ou compressões de relevo
      const slopeDelta = Math.abs(playerSeg.p2.world.y - playerSeg.p1.world.y);
      if (this.state === 'RACING' && speedRatio > 0.88 && (onRumble || slopeDelta > 16) && Math.random() < 0.45) {
        this.particlePool.spawn(p.x + (Math.random() - 0.5) * 0.16, 0.04, p.z, (Math.random() - 0.5) * 0.65, -0.18 - Math.random() * 0.25, 0.16, '#FDE047');
      }

      this.audio.updateEngineRpm(p.rpm, isAccelerating || isPowerBraking, p.isNitro, p.model ? p.model.id : 'default');
      this.audio.setSkid(isSkidding && !isHardBraking);
      this.audio.setSurfaceFx(onRumble, rainFactor, speedRatio);

      const stepZ = p.speed * 20 * dt;
      p.z = this.wrapZ(p.z + stepZ);
      p.totalDistance += stepZ;

      // Gravação do traçado para o Carro Fantasma (Time Trial)
      if (this.gameMode === 'TIME_TRIAL' && this.state === 'RACING') {
        this.ghostRecordTimer = (this.ghostRecordTimer || 0) + dt;
        if (this.ghostRecordTimer >= 0.033) {
          this.ghostRecordTimer = 0;
          this.currentGhostTrail = this.currentGhostTrail || [];
          this.currentGhostTrail.push({
            t: this.currentLapTime,
            x: p.x,
            z: p.z,
            steer: p.steerAngle,
            speed: p.speed
          });
        }
      }

      // Inicia a cronometragem da Volta 1 exatamente na passagem inicial da linha de largada
      if (!p.passedStartLine && p.totalDistance >= START_LINE_Z) {
        p.passedStartLine = true;
        this.currentLapTime = 0;
        if (this.radio) this.radio.speak("Largada autorizada! Volta 1 em andamento!", false);
      }

      if (this.state === 'RACING' && p.totalDistance >= p.nextLapTarget) {
        const lapTargetDist = p.nextLapTarget;
        p.nextLapTarget += this.track.totalLength;
        p.laps++;
        const thisLap = this.currentLapTime;
        this.lastLapTime = thisLap;
        if (this.bestLapTime === 0 || thisLap < this.bestLapTime) {
          this.bestLapTime = thisLap;
          const curTrack = TRACK_DEFINITIONS[this.trackIndex];
          if (curTrack && typeof TrackRecords !== 'undefined') {
            TrackRecords.update(curTrack.id, this.bestLapTime, 0);
          }
          if (this.radio) this.radio.speak("Volta mais rápida da corrida!", false);
          if (this.gameMode === 'TIME_TRIAL' && this.currentGhostTrail && this.currentGhostTrail.length > 5) {
            this.bestGhostTrail = [...this.currentGhostTrail];
          }
        }
        this.currentGhostTrail = [];
        this.currentLapTime = 0;

        this.audio.playBeep(659, 0.25);
        this.lapBannerTimer = 2.0;

        if (this.isQualifying && p.laps >= 1) {
          this.finishQualySession(thisLap);
          this.input.clearPulses();
          return;
        }

        if (p.laps >= TOTAL_LAPS) {
          this.registerCarFinish(p, dt, stepZ, lapTargetDist);
          this.lapBannerTimer = 0;
          this.isLastLapBanner = false;
          this.lapBannerText = '';
          if (this.radio) this.radio.speak("Bandeira quadriculada! Corrida finalizada!", true);

          // Inicia transição de finalização: aguarda 3 segundos com câmera parada e fade até a classificação
          this.finishingRace = true;
          this.finishDuration = 3.0;
          this.finishTimer = 3.0;
          this.finishFadeAlpha = 0;
          this.initFinishFireworks(p.finishRank || 1);

          // A CÂMERA PARA exatamente no momento em que o nosso carro bandeirou:
          this.finishCamOriginZ = this.wrapZ(p.z - PLAYER_Z_OFFSET);
          this.finishCameraX = p.x * ROAD_WIDTH * 0.65;
          const refSeg = this.findSegment(p.z);
          const refPercent = (p.z % SEGMENT_LENGTH) / SEGMENT_LENGTH;
          const playerWorldY = (1 - refPercent) * refSeg.p1.world.y + refPercent * refSeg.p2.world.y;
          this.finishCameraY = CAMERA_HEIGHT + playerWorldY;

          this.audio.playBeep(523, 0.2);
          setTimeout(() => this.audio.playBeep(659, 0.2), 200);
          setTimeout(() => this.audio.playBeep(880, 0.4), 400);

          this.input.clearPulses();
        } else {
          this.lapBannerText = `VOLTA ${p.laps + 1} / ${TOTAL_LAPS}`;
          if (p.laps + 1 === TOTAL_LAPS) {
            this.isLastLapBanner = true;
            this.lapBannerTimer = 3.2;
            this.audio.playBeep(880, 0.15);
            setTimeout(() => this.audio.playBeep(1100, 0.25), 160);
            if (this.radio) this.radio.speak("Atenção: última volta! Dê tudo de si!", true);
          } else {
            this.isLastLapBanner = false;
            if (this.radio) this.radio.speak(`Volta ${p.laps + 1}! Mantenha a pressão!`, false);
          }
        }
      }
    }

      // --- IA DOS 19 BOTS (LARGADA F1 + TRAÇADO + VÁCUO + 3 NITROS E ULTRAPASSAGEM) ---
      for (let i = 0; i < this.cars.length; i++) {
        const bot = this.cars[i];
        if (bot.isPlayer || bot.isRemote || (this.isOnlineRace && this.netplay && this.netplay.role === 'GUEST')) continue;

        if (this.raceTimer < bot.launchDelay) {
          bot.speed = 0;
          continue;
        }

        // Atualiza contadores de Nitro do Bot com decaimento suave de 3 segundos
        if (bot.nitroTimer > 0) {
          bot.nitroTimer -= dt;
          bot.isNitro = true;
          if (bot.nitroTimer <= 0) {
            bot.nitroTimer = 0;
            bot.isNitro = false;
            bot.nitroDecayTimer = 3.0; // Desaceleração gradual suave de 3s para os bots
          }
        } else {
          bot.isNitro = false;
          if (bot.nitroDecayTimer > 0) {
            bot.nitroDecayTimer = Math.max(0, bot.nitroDecayTimer - dt);
          }
        }
        if (bot.nitroCooldown > 0) {
          bot.nitroCooldown -= dt;
        }

        const botSeg = this.findSegment(bot.z);
        const botSlope = (botSeg.p2.world.y - botSeg.p1.world.y) / SEGMENT_LENGTH;
        // Velocidade alvo original dos bots (sem alteração de velocidade máxima)
        let baseTargetSpeed = this.getEffectiveMaxSpeed(bot) * bot.aiSkill * 0.96;
        if (Math.abs(botSeg.curve) > 2.0) baseTargetSpeed *= 0.86;
        // Gravidade para os rivais também (embalam na descida e pesam na subida)
        baseTargetSpeed += Math.max(-45, -botSlope * 210);

        // Vácuo para os Bots: detecta carros à frente (jogador ou outros bots)
        bot.inSlipstream = false;
        bot.slipstreamIntensity = 0;
        let leadCar = null;
        let leadDist = 9999;
        if (this.state === 'RACING' && bot.speed > 35) {
          let bestIntensity = 0;
          for (let k = 0; k < this.cars.length; k++) {
            if (i === k) continue;
            const other = this.cars[k];
            const aheadDz = this.shortestDeltaZ(other.z, bot.z);
            if (aheadDz >= -30 && aheadDz <= 2600) {
              const distW = (aheadDz <= 700) ? 1.0 : Math.pow(1.0 - ((aheadDz - 700) / (2600 - 700)), 0.82);
              const maxLat = 0.65 + 0.35 * (Math.max(0, aheadDz) / 2600);
              const latDiff = Math.abs(other.x - bot.x);
              if (latDiff < maxLat) {
                const alignW = Math.max(0, 1.0 - (latDiff / maxLat));
                const intensity = Math.max(0, Math.min(1.0, distW * alignW));
                if (intensity > bestIntensity) {
                  bestIntensity = intensity;
                  leadCar = other;
                  leadDist = Math.max(0, aheadDz);
                }
              }
            }
          }
          if (bestIntensity > 0.015) {
            bot.inSlipstream = true;
            bot.slipstreamIntensity = bestIntensity;
            bot.slipstreamDecayTimer = 1.0; // Slingshot dos Bots calibrado para 1 segundo com decaimento gradual
            bot.slipstreamStoredIntensity = Math.max(bot.slipstreamStoredIntensity || 0, bestIntensity);
            bot.slipstreamPeakSpeed = Math.max(bot.slipstreamPeakSpeed || 0, bot.speed);
          }
        }

        if (!bot.inSlipstream && bot.slipstreamDecayTimer > 0) {
          bot.slipstreamDecayTimer = Math.max(0, bot.slipstreamDecayTimer - dt);
          if (bot.slipstreamDecayTimer <= 0) {
            bot.slipstreamStoredIntensity = 0;
            bot.slipstreamPeakSpeed = 0;
          }
        }

        // Aplica bônus progressivo de vácuo ao bot (velocidade máxima e aceleração)
        const botSlingshotRatio = Math.max(0, Math.min(1.0, bot.slipstreamDecayTimer / 1.0));
        const botSlipInt = bot.inSlipstream
          ? (bot.slipstreamIntensity || 0)
          : (bot.slipstreamDecayTimer > 0 ? ((bot.slipstreamStoredIntensity || 0.4) * botSlingshotRatio) : 0);
        const botNitroBoostMul = bot.isNitro
          ? 0.30
          : (bot.nitroDecayTimer > 0 ? (0.30 * (bot.nitroDecayTimer / 3.0)) : 0);
        const botDownhillBonus = Math.max(0, -botSlope * 240);
        const botBaseMax = (bot.isNitro || bot.nitroDecayTimer > 0)
          ? (this.getEffectiveMaxSpeed(bot) * (1.0 + botNitroBoostMul)) + botDownhillBonus
          : baseTargetSpeed;
        const botCatchBonus = (leadCar && leadCar.speed > bot.speed)
          ? (leadCar.speed - bot.speed) * 0.85 * botSlipInt
          : 0;
        const botVacuumTopBoost = ((botBaseMax * 0.22) + 24) * botSlipInt;
        let targetSpeed = botBaseMax + botVacuumTopBoost + botCatchBonus;
        if (!bot.inSlipstream && bot.slipstreamDecayTimer > 0 && bot.slipstreamPeakSpeed > targetSpeed) {
          // Diminui gradativamente de volta ao longo de 1 segundo
          targetSpeed = targetSpeed + (bot.slipstreamPeakSpeed - targetSpeed) * botSlingshotRatio;
        }

        // Bônus do Nitro ativo do Bot (soma com descida de ladeira)
        if (bot.isNitro) {
          targetSpeed = (this.getEffectiveMaxSpeed(bot) * 1.30) + botDownhillBonus;
        }

        // Inteligência de Uso dos 3 Nitros pelos Bots (mais estratégica e agressiva)
        if (this.state === 'RACING' && this.raceTimer > 1.8 && bot.nitroCharges > 0 && bot.nitroTimer <= 0 && bot.nitroCooldown <= 0) {
          const isStraight = Math.abs(botSeg.curve) < 1.1;
          // Caso 1: Vácuo próximo querendo ultrapassar na reta (slingshot + nitro)
          const shouldDraftPass = leadCar && leadDist < 340 && isStraight && (bot.speed > 115);
          // Caso 2: Saída de curva para reta acelerando forte
          const shouldExitLaunch = isStraight && bot.speed < this.getEffectiveMaxSpeed(bot) * 0.88 && Math.random() < 0.12;
          // Caso 3: Disputa acirrada com o jogador (defendendo posição ou atacando para ultrapassar)
          const playerDz = this.shortestDeltaZ(this.player.z, bot.z);
          const shouldFightPlayer = Math.abs(playerDz) < 320 && (isStraight || playerDz < 0) && Math.random() < 0.15;

          if (shouldDraftPass || shouldExitLaunch || shouldFightPlayer) {
            bot.nitroCharges--;
            bot.nitroTimer = 3.0;
            bot.nitroCooldown = 4.2 + Math.random() * 4.5;
            bot.isNitro = true;
          }
        }

        // Traçado, Tangência, Defesa Ativa e Estratégia de Vácuo/Estilingue dos Bots
        if (this.raceTimer < 2.6) {
          // Nos primeiros 2.6s após a largada, os bots mantêm a coluna do grid sem cruzamentos bruscos
          bot.targetX = (bot.gridStartX !== undefined) ? bot.gridStartX : bot.x;
        } else {
          const pers = bot.aiPersonality || 'TECHNICAL';
          const pDistZ = this.shortestDeltaZ(this.player.z, bot.z);
          const isPlayerAttacking = (pDistZ < 0 && pDistZ > -260 && this.player.speed > bot.speed - 12);

          if (isPlayerAttacking && Math.abs(botSeg.curve) < 1.5) {
            // Defesa ativa: fecha a linha de ultrapassagem do jogador com firmeza proporcional à personalidade
            const defRate = (pers === 'AGGRESSIVE') ? 3.5 : ((pers === 'TECHNICAL') ? 2.6 : 1.9);
            bot.targetX += (this.player.x - bot.targetX) * defRate * dt;
            bot.targetX = Math.max(-0.85, Math.min(0.85, bot.targetX));
          } else if (pers === 'TECHNICAL' && botSeg.curve !== 0) {
            // Técnico: tangência perfeita no apex e linha cirúrgica na curva
            const apexX = Math.max(-0.78, Math.min(0.78, -botSeg.curve * 0.34));
            bot.targetX += (apexX - bot.targetX) * 2.8 * dt;
          } else if (pers === 'PRESSURE_PRONE' && Math.abs(pDistZ) < 160 && pDistZ < 0 && Math.abs(this.player.x - bot.x) < 0.42) {
            // Propenso a pressão: oscila levemente sob pressão extrema, mas mantém ritmo forte
            bot.pressureTimer = Math.min(2.5, (bot.pressureTimer || 0) + dt * 1.3);
            if (bot.pressureTimer > 0.9) {
              bot.targetX += Math.sin(this.raceTimer * 10) * 0.14 * dt;
              targetSpeed *= 0.97;
            }
          } else {
            if (botSeg.curve !== 0) {
              const apexX = Math.max(-0.72, Math.min(0.72, -botSeg.curve * 0.26));
              bot.targetX += (apexX - bot.targetX) * 2.1 * dt;
            } else if (bot.inSlipstream && leadCar && leadDist > 110) {
              // Em vácuo: alinha com rapidez atrás do carro da frente para embalar e preparar slingshot
              bot.targetX += (leadCar.x - bot.targetX) * 3.4 * dt;
            } else {
              bot.laneChangeTimer -= dt;
              if (bot.laneChangeTimer <= 0) {
                bot.laneChangeTimer = 2.4 + Math.random() * 3.0;
                bot.targetX = (Math.random() - 0.5) * 1.15;
              }
            }
          }
        }

        let blocked = false;
        if (bot.bumpBoostTimer > 0) {
          bot.bumpBoostTimer -= dt;
        }

        // Manobra inteligente: evitar batidas de lado e traseira + ultrapassagem via estilingue
        for (let j = 0; j < this.cars.length; j++) {
          if (i === j) continue;
          const other = this.cars[j];
          const distZ = this.shortestDeltaZ(other.z, bot.z);
          const latDiff = Math.abs(other.x - bot.x);

          // 1. CARROS EMPARELHADOS LATERALMENTE (|distZ| <= 55):
          // Afasta ativamente durante a corrida para evitar contato lateral ou esfregar porta!
          if (this.raceTimer > 3.0 && Math.abs(distZ) <= 55 && latDiff < 0.44) {
            const avoidDir = (bot.x >= other.x) ? 1 : -1;
            bot.targetX += avoidDir * (0.44 - latDiff) * 3.2 * dt;
            bot.targetX = Math.max(-0.85, Math.min(0.85, bot.targetX));
          }

          // 2. CARRO À FRENTE NO MESMO TRILHO (distZ > 0):
          if (distZ > 0 && distZ < 450 && latDiff < 0.44) {
            blocked = true;
            if (this.raceTimer > 2.8) {
              // Estilingue (Slingshot): quando próximo, puxa com firmeza para a pista livre
              // ultrapassando sem bater na traseira!
              const passDir = (other.x >= 0) ? -0.54 : 0.54;
              bot.targetX = Math.max(-0.80, Math.min(0.80, other.x + passDir));
              // Aciona o benefício do slingshot para impulsionar a ultrapassagem
              bot.slipstreamDecayTimer = 1.2;
            }
            // Se estiver muito próximo na mesma linha sem espaço para passar, alivia o acelerador
            if (distZ < 65 && latDiff < 0.30 && bot.bumpBoostTimer <= 0 && !bot.isNitro) {
              targetSpeed = Math.min(targetSpeed, other.speed * 0.94);
            }
          }
        }

        // Aplicação de aceleração e frenagem do Bot
        if (blocked && bot.speed > targetSpeed + 12 && bot.bumpBoostTimer <= 0 && !bot.isNitro) {
          bot.speed = Math.max(bot.speed - 190 * dt, targetSpeed);
          bot.isBraking = true;
        } else {
          bot.isBraking = false;
          if (bot.speed < targetSpeed) {
            const botSpeedRatio = Math.max(0, bot.speed / this.getEffectiveMaxSpeed(bot));
            const botAirDrag = Math.pow(Math.min(1.0, botSpeedRatio), 1.6) * 0.58;
            const botTorque = Math.max(0.32, 1.28 - botAirDrag);
            const nitroAccel = bot.isNitro ? 1.75 : (bot.nitroDecayTimer > 0 ? (1.0 + 0.75 * (bot.nitroDecayTimer / 3.0)) : 1.0);
            const accelMul = nitroAccel + (1.10 * (bot.slipstreamIntensity || 0));
            // Cadência de arrancada esportiva equilibrada para os bots (~6 a 8s para velocidade máxima)
            const baseBotPower = bot.isNitro ? (65 + bot.model.acceleration * 55) : (24 + bot.model.acceleration * 26);
            const launchRate = baseBotPower * botTorque * accelMul * dt;
            const botSuctionPull = (32 + bot.model.acceleration * 38) * (bot.slipstreamIntensity || 0) * dt;
            bot.speed = Math.min(bot.speed + launchRate + botSuctionPull, targetSpeed);
          } else if (bot.bumpBoostTimer <= 0 && !bot.isNitro) {
            const botExcess = bot.speed - targetSpeed;
            if (botExcess > 0) {
              const isSlingshot = (bot.slipstreamDecayTimer > 0);
              // Desaceleração cadenciada e gradual pós-slingshot para os bots também
              const excessDecay = isSlingshot
                ? Math.min(7.5, Math.max(3.2, botExcess * 0.15)) * dt
                : Math.min(9.0, Math.max(3.8, botExcess * 0.18)) * dt;
              bot.speed = Math.max(targetSpeed, bot.speed - excessDecay);
            }
          }
        }

        if (bot.bumpVelX) {
          if (Math.abs(bot.bumpVelX) > 0.003) {
            bot.x += bot.bumpVelX * dt;
            bot.bumpVelX *= Math.exp(-6.0 * dt);
          } else {
            bot.bumpVelX = 0;
          }
        }
        if (Math.abs(bot.x) > 1.0) {
          // Na grama, desacelera suavemente por atrito e busca retornar a pista
          bot.targetX = (bot.x > 0 ? 0.70 : -0.70);
          bot.speed = Math.max(40, bot.speed - 90 * dt);
        } else {
          bot.targetX = Math.max(-0.80, Math.min(0.80, bot.targetX));
        }
        const prevBotX = bot.x;
        bot.x += (bot.targetX - bot.x) * 2.4 * dt;

        // Angulo visual dos bots para acionar os 3 sprites (curva a esquerda, reto, curva a direita)
        const lateralVel = (bot.x - prevBotX) / Math.max(0.001, dt);
        const desiredBotSteer = Math.max(-1, Math.min(1, lateralVel * 1.15 + botSeg.curve * 0.16));
        bot.steerAngle += (desiredBotSteer - bot.steerAngle) * Math.min(1, 7.5 * dt);

        const botStepZ = bot.speed * 20 * dt;
        bot.z = this.wrapZ(bot.z + botStepZ);
        bot.totalDistance += botStepZ;

        if (bot.totalDistance >= bot.nextLapTarget) {
          const lapTargetDist = bot.nextLapTarget;
          bot.nextLapTarget += this.track.totalLength;
          bot.laps++;
          if (bot.laps >= TOTAL_LAPS) {
            this.registerCarFinish(bot, dt, botStepZ, lapTargetDist);
          }
        }

        if (bot.collisionCooldown > 0) bot.collisionCooldown -= dt;
      }

      if (this.isOnlineRace) {
        this.syncOnlineRace(dt);
      }

      // --- FISICA DE COLISAO REALISTA (ESTILO TOP GEAR + RESPEITO A LARGURA REAL DO CARRO) ---
      if (p.collisionCooldown > 0) p.collisionCooldown -= dt;

      for (let i = 0; i < this.cars.length; i++) {
        const bot = this.cars[i];
        if (bot.isPlayer) continue;
        if (this.finishingRace) continue; // Após bandeirar, o carro do jogador desacelera em segurança sem colisão

        // dz < 0: bot está à frente do jogador | dz > 0: bot está atrás do jogador
        const dz = this.shortestDeltaZ(p.z, bot.z);
        const dx = p.x - bot.x;
        const absDx = Math.abs(dx);

        // Som de vento cortando (Whoosh) ao ultrapassar rival em vácuo ou alta velocidade
        const prevDz = bot.lastOvertakeDz !== undefined ? bot.lastOvertakeDz : dz;
        bot.lastOvertakeDz = dz;
        if (prevDz < 0 && dz >= 0 && dz <= 45 && absDx < 0.85 && p.speed > 130 && (p.speed - bot.speed) > 15) {
          if (!this.lastWhooshTime || (this.raceTimer - this.lastWhooshTime) > 0.45) {
            this.lastWhooshTime = this.raceTimer;
            if (this.audio && typeof this.audio.playWhoosh === 'function') {
              this.audio.playWhoosh(Math.min(1.2, p.speed / 200));
            }
          }
        }

        // Largura física de contato lateral calibrada (permite disputa de espaço justa e natural)
        const COLLISION_WIDTH = 0.365;

        // Ignora carros fora do alcance visual e físico (cobrindo comprimento total + esquinas)
        if (dz <= -105 || dz >= 95 || absDx >= COLLISION_WIDTH) continue;

        let didCollide = false;

        if (dz <= -66 && absDx < 0.27) {
          // ========================================================
          // 1. COLISÃO TRASEIRA (ESTILO TOP GEAR):
          // Jogador bateu na traseira do rival à frente!
          // O jogador perde velocidade (bate no "muro") e o rival ganha impulso para frente!
          // ========================================================
          didCollide = true;
          const speedDiff = Math.max(0, p.speed - bot.speed);

          // Jogador perde velocidade significativa e é contido atrás do rival
          p.speed = Math.max(30, Math.min(p.speed - 36 - speedDiff * 0.45, bot.speed * 0.88));
          p.z = this.wrapZ(bot.z - 68);

          // Rival recebe um impulso direto para frente (estilo Top Gear)
          const forwardImpulse = 26 + Math.min(38, speedDiff * 0.50);
          bot.speed = Math.min(bot.speed + forwardImpulse, this.getEffectiveMaxSpeed(bot) * 1.25);
          bot.bumpBoostTimer = 1.8; // Mantém o impulso sem a IA frear de imediato
          bot.z = this.wrapZ(bot.z + 20);
          bot.totalDistance += 20;

          // Se bateu descentralizado, desvia levemente para o lado
          if (absDx > 0.08) {
            p.bumpVelX = (dx >= 0 ? 0.85 : -0.85);
          }
          this.shake = 2.4;
        } else if (dz >= 66 && absDx < 0.27 && bot.speed > p.speed) {
          // ========================================================
          // 2. RIVAL BATEU NA TRASEIRA DO JOGADOR
          // ========================================================
          didCollide = true;
          bot.speed = Math.max(30, p.speed * 0.84);
          const pMaxVal = this.getEffectiveMaxSpeed(p);
          const playerTopSpeed = (p.isNitro ? (pMaxVal * 1.30) : pMaxVal);
          p.speed = Math.min(p.speed + 20, playerTopSpeed * 1.10);
          bot.z = this.wrapZ(p.z - 68);
          this.shake = 1.8;
        } else {
          // ========================================================
          // 3. CONTATO LATERAL / ESQUINA (PORTA-A-PORTA E FECHADA NA ULTRAPASSAGEM):
          // Emula o comprimento lateral do carro: mesmo meio carro à frente ou atrás,
          // há raspagem lateral leve/firme proporcional ao overlap, sem atravessar.
          // ========================================================
          didCollide = true;
          const isGlancingCorner = (Math.abs(dz) >= 46);
          const overlap = Math.max(0.012, COLLISION_WIDTH - absDx);
          const dirX = (dx >= 0) ? 1 : -1;
          const sepFactor = isGlancingCorner ? 0.38 : 0.52;

          // Separação física imediata (garante que nunca passem um por dentro do outro)
          p.x += dirX * overlap * sepFactor;
          bot.x -= dirX * overlap * sepFactor;

          // Sem problema sair da pista (pode ir até a grama e voltar naturalmente)
          p.x = Math.max(-1.95, Math.min(1.95, p.x));
          bot.x = Math.max(-1.95, Math.min(1.95, bot.x));

          // Impulso lateral: mais leve nas esquinas ao passar na frente/atrás, mais firme porta-a-porta
          const impulseBase = isGlancingCorner ? 0.38 : 0.58;
          const impulseSlope = isGlancingCorner ? 0.45 : 0.70;
          p.bumpVelX = dirX * (impulseBase + overlap * impulseSlope);
          bot.bumpVelX = -dirX * (impulseBase + overlap * impulseSlope);
          bot.targetX = Math.max(-0.85, Math.min(0.85, bot.x - dirX * 0.25));

          const speedLoss = isGlancingCorner ? 1.8 : 3.2;
          p.speed = Math.max(30, p.speed - speedLoss);
          bot.speed = Math.max(30, bot.speed - speedLoss);
          this.shake = isGlancingCorner ? 0.9 : 1.4;
        }

        if (didCollide) {
          if (p.collisionCooldown <= 0) {
            this.audio.playCrash();
            this.vibrate(35);
            p.collisionCooldown = 0.12;
            bot.collisionCooldown = 0.12;
          }

          // Faíscas vibrantes e bem visíveis saindo do ponto exato de contato da lataria
          const contactX = (p.x + bot.x) / 2;
          for (let k = 0; k < 8; k++) {
            this.particlePool.spawn(
              contactX, -0.06, p.z,
              (Math.random() - 0.5) * 1.6 + (dx >= 0 ? 0.3 : -0.3),
              -Math.random() * 0.75,
              0.26, (k % 2 === 0) ? '#FFD700' : ((k % 3 === 0) ? '#FFFFFF' : '#FF9100')
            );
          }
        }
      }

      // Colisão mútua entre bots da CPU para evitar que passem um por dentro do outro
      for (let i = 0; i < this.cars.length; i++) {
        const carA = this.cars[i];
        if (carA.isPlayer) continue;
        for (let j = i + 1; j < this.cars.length; j++) {
          const carB = this.cars[j];
          if (carB.isPlayer) continue;

          const dz = Math.abs(this.shortestDeltaZ(carA.z, carB.z));
          const dx = carA.x - carB.x;
          const absDx = Math.abs(dx);

          if (dz <= 46 && absDx < 0.365) {
            const overlap = (0.365 - absDx);
            const dirX = (dx >= 0) ? 1 : -1;
            carA.x = Math.max(-1.95, Math.min(1.95, carA.x + dirX * overlap * 0.52));
            carB.x = Math.max(-1.95, Math.min(1.95, carB.x - dirX * overlap * 0.52));
            carA.bumpVelX = dirX * 0.48;
            carB.bumpVelX = -dirX * 0.48;
            carA.speed = Math.max(30, carA.speed * 0.985);
            carB.speed = Math.max(30, carB.speed * 0.985);
          }
        }
      }

      // --- FÍSICA DE COLISÃO COM CENÁRIO LATERAL (POSTES, ÁRVORES, PLACAS E OUTDOORS) ---
      if (p.sceneryCollisionCooldown > 0) {
        p.sceneryCollisionCooldown -= dt;
      }

      if (this.track && this.track.segments && !this.finishingRace && (this.state === 'RACING' || this.state === 'COUNTDOWN')) {
        const totalSegs = this.track.segments.length;
        const pSegIdx = Math.floor(p.z / SEGMENT_LENGTH) % totalSegs;
        const checkOffsets = [-1, 0, 1];

        for (let o = 0; o < checkOffsets.length; o++) {
          const sIdx = (pSegIdx + checkOffsets[o] + totalSegs) % totalSegs;
          const seg = this.track.segments[sIdx];
          if (!seg || !seg.scenery) continue;

          const scList = Array.isArray(seg.scenery) ? seg.scenery : [seg.scenery];
          let hitScenery = false;

          for (let sc of scList) {
            if (!sc || typeof sc.offset !== 'number') continue;

            const dz = Math.abs(this.shortestDeltaZ(p.z, seg.p1.world.z));
            if (dz > 52) continue;

            let colRadius = 0.28;
            if (sc.type === 'billboard' || sc.type === 'building') {
              colRadius = 0.46;
            } else if (sc.type === 'streetlamp' || sc.type === 'pole') {
              colRadius = 0.22;
            } else if (sc.type.includes('sign')) {
              colRadius = 0.26;
            } else if (sc.type.includes('tree') || sc.type.includes('pine') || sc.type.includes('palm') || sc.type === 'bush') {
              colRadius = 0.32;
            }

            const dx = p.x - sc.offset;
            const absDx = Math.abs(dx);

            if (absDx < colRadius) {
              // COLISÃO SUAVE COM CENÁRIO: EMPURRA O CARRO SUAVEMENTE PARA A DIREÇÃO OPOSTA
              const overlap = colRadius - absDx;
              const pushDir = (dx >= 0) ? 1 : -1;

              // Impulso lateral suave (não violento, amortecido organicamente via bumpVelX)
              p.bumpVelX = pushDir * (0.38 + overlap * 0.28);
              p.x = Math.max(-2.25, Math.min(2.25, p.x + pushDir * (0.02 + overlap * 0.30)));

              // Perda moderada de velocidade por atrito/raspagem
              p.speed = Math.max(30, p.speed - 5.0);

              if (p.sceneryCollisionCooldown <= 0) {
                this.audio.playCrash();
                this.vibrate(45);
                p.sceneryCollisionCooldown = 0.24;
                this.shake = Math.max(this.shake, 1.4);
              }

              // Efeitos visuais: faíscas metálicas ou lascas/folhagens no ponto de contato
              const contactX = (p.x + sc.offset) * 0.5;
              const isFoliage = (sc.type.includes('tree') || sc.type.includes('pine') || sc.type.includes('palm') || sc.type === 'bush');
              const pCol = isFoliage ? '#15803D' : (this.envCur && this.envCur.night > 0.28 ? '#FFE082' : '#CBD5E1');

              for (let k = 0; k < 6; k++) {
                this.particlePool.spawn(
                  contactX, -0.06, p.z,
                  (Math.random() - 0.5) * 1.3 + pushDir * 0.40,
                  -Math.random() * 0.70,
                  0.22 + Math.random() * 0.16,
                  pCol
                );
              }

              hitScenery = true;
              break;
            }
          }

          if (hitScenery) break;
        }
      }

      this.particlePool.update(dt);
      this.input.clearPulses();
    }

    registerCarFinish(car, dt, stepZ, targetDist = null) {
      if (car.finished || car.finishRank > 0) return;
      car.finished = true;

      const finishTarget = targetDist || (car.nextLapTarget ? (car.nextLapTarget - this.track.totalLength) : (START_LINE_Z + TOTAL_LAPS * this.track.totalLength));
      const prevDist = car.totalDistance - stepZ;
      const distInFrame = Math.max(0.001, car.totalDistance - prevDist);
      const distToTarget = Math.max(0, finishTarget - prevDist);
      const fraction = Math.max(0, Math.min(1, distToTarget / distInFrame));
      car.finishTime = Math.max(0.001, (this.raceTimer - dt) + fraction * dt);

      if (!this.finishOrder) this.finishOrder = [];
      if (!this.finishOrder.includes(car)) {
        this.finishOrder.push(car);
        // Garante ordenação inequívoca por tempo de chegada exato (sub-frame)
        this.finishOrder.sort((a, b) => a.finishTime - b.finishTime);
        for (let i = 0; i < this.finishOrder.length; i++) {
          this.finishOrder[i].finishRank = i + 1;
        }
      }
    }

    getRankedCars() {
      if (!this.cachedRankedCars || this.cachedRankedCars.length !== this.cars.length) {
        this.cachedRankedCars = new Array(this.cars.length);
      }
      for (let i = 0; i < this.cars.length; i++) {
        this.cachedRankedCars[i] = this.cars[i];
      }
      this.cachedRankedCars.sort((a, b) => {
        if (a.finishRank && b.finishRank) return a.finishRank - b.finishRank;
        if (a.finishRank) return -1;
        if (b.finishRank) return 1;
        if (a.finishTime > 0 && b.finishTime > 0) return a.finishTime - b.finishTime;
        if (a.finishTime > 0) return -1;
        if (b.finishTime > 0) return 1;
        if (a.laps !== b.laps) return b.laps - a.laps;
        return b.totalDistance - a.totalDistance;
      });
      return this.cachedRankedCars;
    }

    initFinishFireworks(rank) {
      this.finishFireworks = [];
      if (rank > 3) return;
      const colors = ['#FFD700', '#00E5FF', '#FF3D71', '#00E676', '#FF9100'];
      const bursts = rank === 1 ? 7 : 4;
      for (let b = 0; b < bursts; b++) {
        const cx = 48 + Math.random() * (INTERNAL_WIDTH - 96);
        const cy = 22 + Math.random() * 58;
        const delay = b * 0.32;
        const col = colors[b % colors.length];
        for (let i = 0; i < 16; i++) {
          const ang = (i / 16) * Math.PI * 2 + Math.random() * 0.2;
          const spd = 28 + Math.random() * 44;
          this.finishFireworks.push({
            x: cx, y: cy,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            delay,
            life: 0.95,
            maxLife: 0.95,
            color: col
          });
        }
      }
    }

    updateFinishFireworks(dt) {
      for (let i = 0; i < this.finishFireworks.length; i++) {
        const fw = this.finishFireworks[i];
        if (fw.delay > 0) {
          fw.delay -= dt;
          continue;
        }
        if (fw.life > 0) {
          fw.x += fw.vx * dt;
          fw.y += fw.vy * dt;
          fw.vy += 28 * dt;
          fw.life -= dt;
        }
      }
    }

    finishRace() {
      this.state = 'RACE_RESULT';
      this.isQualifying = false;
      this.qualifiedGridPos = 0;
      this.qualifiedLapTime = 0;
      this.mirrorTrack = false;
      this.newlyUnlockedAchievements = [];
      this.currentCameraDepth = CAMERA_DEPTH;
      this.audio.silenceEffects();
      this.audio.musicPlaying = false;
      this.audio.playBeep(523, 0.2);
      setTimeout(() => this.audio.playBeep(659, 0.2), 200);
      setTimeout(() => this.audio.playBeep(880, 0.4), 400);

      const ranked = this.getRankedCars();
      this.lastRacePositions = ranked;

      let playerFinishPos = -1;
      let playerCarRef = null;
      for (let pos = 0; pos < ranked.length; pos++) {
        const car = ranked[pos];
        const pts = (pos < F1_POINTS.length) ? F1_POINTS[pos] : 0;
        car.racePos = pos + 1;
        car.racePoints = pts;
        if (car.isPlayer) {
          playerFinishPos = pos;
          playerCarRef = car;
          const curTrack = TRACK_DEFINITIONS[this.trackIndex];
          if (curTrack && typeof TrackRecords !== 'undefined') {
            TrackRecords.update(curTrack.id, this.bestLapTime, pos + 1);
          }
        }
        if (this.gameMode === 'CHAMPIONSHIP') {
          this.championshipPoints[car.id] += pts;
          if (car.isPlayer && this.diffMode === 'NORMAL') {
            const pRank = pos + 1;
            let prize = 1000;
            if (pRank === 1) prize = 10000;
            else if (pRank === 2) prize = 8000;
            else if (pRank === 3) prize = 6000;
            else if (pRank <= 6) prize = 4000;
            else if (pRank <= 10) prize = 2500;
            const mult = this.getChampionshipPrizeMultiplier();
            prize = Math.round((prize * mult) / 100) * 100;
            this.lastPrizeMoney = prize;
            this.playerCredits = (this.playerCredits || 0) + prize;
          }
        }
      }
      if (playerCarRef && typeof CareerStats !== 'undefined') {
        const isRain = !!(this.envCur && this.envCur.s && this.envCur.s.rain > 0.25);
        const km = (this.track ? (this.track.totalLength / 1000) * TOTAL_LAPS : 0);
        let isChampWin = false;
        if (this.gameMode === 'CHAMPIONSHIP' && this.seasonSchedule && this.seasonSchedule.length > 0 && this.seasonStage >= (this.seasonSchedule.length - 1)) {
          const overall = this.cars.map(c => ({
            car: c,
            points: this.championshipPoints[c.id] || 0
          })).sort((a, b) => b.points - a.points);
          isChampWin = !!(overall[0] && overall[0].car && overall[0].car.isPlayer);
        }
        const res = CareerStats.recordRace({
          rank: playerFinishPos + 1,
          km,
          isRain,
          startPos: (this.qualifiedGridPos > 0 ? this.qualifiedGridPos : 20),
          carId: playerCarRef.model ? playerCarRef.model.id : '',
          isChampion: isChampWin
        });
        this.newlyUnlockedAchievements = res.newlyUnlocked || [];
      }
    }

    // ==========================================
    // RENDERIZAÇÃO GRÁFICA 2.5D ARCADE HD
    // ==========================================
    render() {
      const ctx = this.ctx;
      const def = TRACK_DEFINITIONS[this.trackIndex];

      ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
      ctx.imageSmoothingEnabled = true;

      ctx.save();

      if (this.cameraRoll !== 0 || this.shake > 0) {
        ctx.translate(INTERNAL_WIDTH / 2, INTERNAL_HEIGHT / 2);
        ctx.rotate(this.cameraRoll);
        if (this.shake > 0) {
          ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
        }
        ctx.translate(-INTERNAL_WIDTH / 2, -INTERNAL_HEIGHT / 2);
      }

      this.renderSky(ctx, def);

      // Fundo base de terreno de acordo com o clima/horário ativo (verde em dia, branco em neve, etc.)
      ctx.fillStyle = (this.segColDark && this.segColDark.grass) ? this.segColDark.grass : def.colors.grassDark;
      ctx.fillRect(-20, INTERNAL_HEIGHT / 2, INTERNAL_WIDTH + 40, INTERNAL_HEIGHT / 2 + 20);

      this.renderRoad(ctx, def);

      const isNight = this.envCur ? ((this.envCur.s.night || 0) > 0.28) : false;
      const isDusk = this.envCur ? ((this.envCur.s.dusk || 0) > 0.25) : false;

      // Neblina atmosférica sutil na linha do horizonte para profundidade (com cache por clima)
      const hazeKey = isNight ? 'N' : (isDusk ? 'D' : 'L');
      if (!this._hazeGradCache || this._hazeGradKey !== hazeKey) {
        const hazeGrad = ctx.createLinearGradient(0, INTERNAL_HEIGHT / 2 - 4, 0, INTERNAL_HEIGHT / 2 + 10);
        hazeGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        hazeGrad.addColorStop(0.45, isNight ? 'rgba(0, 180, 216, 0.12)' : (isDusk ? 'rgba(255, 140, 80, 0.22)' : 'rgba(220, 242, 255, 0.22)'));
        hazeGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this._hazeGradCache = hazeGrad;
        this._hazeGradKey = hazeKey;
      }
      ctx.fillStyle = this._hazeGradCache;
      ctx.fillRect(-20, INTERNAL_HEIGHT / 2 - 4, INTERNAL_WIDTH + 40, 14);

      // Carro do Jogador projetado exatamente no mesmo espaço 3D da pista e dos rivais
      if (this.state === 'RACING' || this.state === 'COUNTDOWN' || this.state === 'PAUSED' || this.state === 'RESUME_COUNTDOWN') {
        const steerLean = this.player.steerAngle || 0;
        const playerSeg = this.findSegment(this.player.z);
        const inTunnel = (playerSeg && !!playerSeg.tunnel);
        const nightIntensity = inTunnel ? 1.0 : (this.envCur ? (this.envCur.s.night || 0) : 0);
        const isNight = (nightIntensity > 0.28);
        const isDusk = this.envCur ? ((this.envCur.s.dusk || 0) > 0.22) : false;
        const isDark = isNight || isDusk || inTunnel || (def && (def.theme === 'NOITE' || def.theme === 'TARDE'));

        // Renderização do Carro Fantasma (Time Trial)
        if (this.gameMode === 'TIME_TRIAL' && this.bestGhostTrail && this.bestGhostTrail.length > 5 && (this.state === 'RACING' || this.state === 'COUNTDOWN')) {
          const ghost = this.getGhostSample(this.currentLapTime);
          if (ghost && this.player) {
            const relCamZ = this.shortestDeltaZ(ghost.z, (this.player.z - PLAYER_Z_OFFSET));
            if (relCamZ > CAMERA_DEPTH && relCamZ < 3200) {
              const gSeg = this.findSegment(ghost.z);
              const gPct = (ghost.z % SEGMENT_LENGTH) / SEGMENT_LENGTH;
              const gRoad = this.projectInterpolated(gSeg, gPct);
              const scale = PLAYER_Z_OFFSET / Math.max(1, relCamZ);
              const gW = PLAYER_CAR_W * scale;
              const gH = PLAYER_CAR_H * scale;
              const gX = gRoad.x + gRoad.w * ghost.x;
              const gY = gRoad.y - gH * (24 / 68);

              if (gW > 6 && gW < 240) {
                ctx.save();
                ctx.globalAlpha = 0.40;
                this.player.model.render(
                  ctx,
                  gX,
                  gY,
                  gW,
                  gH,
                  false,
                  ghost.steer || 0,
                  '#00E5FF',
                  {
                    isNitro: false,
                    wheelPhase: ghost.z * 0.035,
                    isNight: isDark,
                    speed: ghost.speed || 0
                  }
                );
                ctx.restore();
              }
            }
          }
        }

        if (this.finishingRace) {
          // Quando bandeirou e a câmera parou, o carro se afasta pela pista em perspectiva 3D realista
          const playerZ = this.wrapZ(this.player.z);
          const camOriginZ = this.finishCamOriginZ;
          const relCamZ = (playerZ >= camOriginZ) ? (playerZ - camOriginZ) : (this.track.totalLength - camOriginZ + playerZ);

          const pSeg = this.findSegment(playerZ);
          const pPct = (playerZ % SEGMENT_LENGTH) / SEGMENT_LENGTH;
          const cRoad = this.projectInterpolated(pSeg, pPct);

          const distScale = PLAYER_Z_OFFSET / Math.max(1, relCamZ);
          const carW = PLAYER_CAR_W * distScale;
          const carH = PLAYER_CAR_H * distScale;
          const carX = cRoad.x + cRoad.w * this.player.x;
          const carY = cRoad.y - carH * (24 / 68);

          if (isNight && carW > 10) {
            this.renderHeadlightBeams(ctx, carX, carY, steerLean, nightIntensity * distScale);
          }

          if (this.envCur && this.envCur.s.rain > 0.04) {
            this.renderWetReflection(ctx, carX, carY, carW, carH, false, this.envCur.s.rain);
          }

          this.player.model.render(
            ctx,
            carX,
            carY,
            carW,
            carH,
            false,
            steerLean,
            this.player.bodyColor,
            {
              isNitro: false,
              wheelPhase: this.player.z * 0.035,
              isNight: isDark,
              speed: this.player.speed
            }
          );
        } else {
          const pos = this.playerRenderPos || { x: INTERNAL_WIDTH / 2, y: INTERNAL_HEIGHT - 32 };
          const playerScreenX = pos.x;
          const playerScreenY = pos.y;

          if (isNight) {
            this.renderHeadlightBeams(ctx, playerScreenX, playerScreenY, steerLean, nightIntensity);
          }

          if (this.envCur && this.envCur.s.rain > 0.04) {
            this.renderWetReflection(ctx, playerScreenX, playerScreenY, PLAYER_CAR_W, PLAYER_CAR_H, this.player.isBraking, this.envCur.s.rain);
          }

          // Brilho vermelho das luzes de freio no asfalto (Noite/Tarde, mesmo em pista seca)
          if (isDark && this.player.isBraking) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 23, 68, 0.26)';
            ctx.beginPath();
            ctx.ellipse(playerScreenX - PLAYER_CAR_W * 0.24, playerScreenY + PLAYER_CAR_H * 0.34, PLAYER_CAR_W * 0.22, 4.5, 0, 0, Math.PI * 2);
            ctx.ellipse(playerScreenX + PLAYER_CAR_W * 0.24, playerScreenY + PLAYER_CAR_H * 0.34, PLAYER_CAR_W * 0.22, 4.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          this.player.model.render(
            ctx,
            playerScreenX,
            playerScreenY,
            PLAYER_CAR_W,
            PLAYER_CAR_H,
            this.player.isBraking,
            steerLean,
            this.player.bodyColor,
            {
              isNitro: this.player.isNitro,
              wheelPhase: this.player.z * 0.035,
              isNight: isDark,
              speed: this.player.speed
            }
          );
        }

        // Rivais porta-a-porta levemente atrás do para-choque do jogador
        if (this.foregroundBots && this.foregroundBots.length > 0) {
          for (let i = 0; i < this.foregroundBots.length; i++) {
            const fb = this.foregroundBots[i];
            if (this.envCur && this.envCur.s.rain > 0.04) {
              this.renderWetReflection(ctx, fb.x, fb.y, fb.w, fb.h, fb.bot.isBraking, this.envCur.s.rain);
            }
            fb.bot.model.render(
              ctx,
              fb.x,
              fb.y,
              fb.w,
              fb.h,
              fb.bot.isBraking,
              fb.bot.steerAngle || 0,
              fb.bot.bodyColor,
              {
                isNitro: !!fb.bot.isNitro,
                wheelPhase: fb.bot.z * 0.035,
                isNight: isDark,
                speed: fb.bot.speed
              }
            );
            if (fb.w >= 14 && fb.bot.driverCode) {
              this.renderDriverBadge(ctx, fb.bot.driverCode, fb.x, fb.y - fb.h * 0.44, fb.w);
            }
          }
        }
      }

      this.renderParticles(ctx);

      if (this.player && this.state === 'RACING' && (this.player.isNitro || this.player.speed > this.getEffectiveMaxSpeed(this.player) * 0.92)) {
        this.renderSpeedLines(ctx);
      }
      ctx.restore();

      // HUD e Menus
      if (this.state === 'COUNTDOWN' || (this.state === 'RACING' && this.greenLightsTimer > 0)) {
        this.renderStartGantry(ctx);
      }

      if (this.state === 'RACING' || this.state === 'COUNTDOWN' || this.state === 'PAUSED' || this.state === 'RESUME_COUNTDOWN') {
        this.renderHUD(ctx);
      }

      if (this.state === 'RACING' || this.state === 'COUNTDOWN' || this.state === 'PAUSED' || this.state === 'RESUME_COUNTDOWN') {
        this.renderWeatherFx(ctx);
      }

      // Efeito de Bandeirada: Câmera Parada e Fade out até a Classificação
      if (this.finishingRace) {
        ctx.save();
        const bannerBlink = Math.floor(performance.now() / 250) % 2 === 0;
        ctx.fillStyle = bannerBlink ? '#FFD700' : '#00E5FF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.strokeText('🏁 BANDEIRA QUADRICULADA! 🏁', INTERNAL_WIDTH / 2, 44);
        ctx.fillText('🏁 BANDEIRA QUADRICULADA! 🏁', INTERNAL_WIDTH / 2, 44);
        ctx.restore();

        if (this.finishFadeAlpha > 0) {
          ctx.save();
          ctx.fillStyle = `rgba(0, 0, 0, ${this.finishFadeAlpha.toFixed(3)})`;
          ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
          ctx.restore();
        }
      }

      if (this.isOnlineRace && (this.state === 'COUNTDOWN' || this.state === 'PAUSED') && this.netplay && this.netplay.meta && this.netplay.meta.status === 'RACING' && this.netplay.meta.raceSeq && this.netplay.meta.raceSeq !== this.onlineRaceSeq) {
        this.startOnlineRace();
        return;
      }

      if (this.state === 'MENU') {
        this.renderMenu(ctx);
      } else if (this.state === 'ONLINE_LOBBY') {
        this.renderOnlineLobby(ctx);
      } else if (this.state === 'MODE_SELECT') {
        this.renderModeSelect(ctx);
      } else if (this.state === 'TRACK_SELECT') {
        this.renderTrackSelect(ctx);
      } else if (this.state === 'CUSTOM_SCHEDULE_SELECT') {
        this.renderCustomScheduleSelect(ctx);
      } else if (this.state === 'CAR_SELECT') {
        this.renderCarSelect(ctx);
      } else if (this.state === 'COLOR_SELECT') {
        this.renderColorSelect(ctx);
      } else if (this.state === 'NAME_INPUT') {
        this.renderNameInput(ctx);
      } else if (this.state === 'RACE_SETUP') {
        this.renderRaceSetup(ctx);
      } else if (this.state === 'RESUME_COUNTDOWN') {
        this.renderResumeCountdown(ctx);
      } else if (this.state === 'PAUSED') {
        this.renderPauseMenu(ctx);
      } else if (this.state === 'SLOT_SELECT') {
        this.renderSlotSelect(ctx);
      } else if (this.state === 'SAVE_PROGRESS') {
        this.renderSaveProgress(ctx);
      } else if (this.state === 'DIFFICULTY_SELECT') {
        this.renderDifficultySelect(ctx);
      } else if (this.state === 'RACE_RESULT') {
        this.renderRaceResult(ctx);
      } else if (this.state === 'CHAMPIONSHIP_STANDINGS') {
        this.renderChampionshipStandings(ctx);
      } else if (this.state === 'SEASON_UPGRADES') {
        this.renderUpgrades(ctx);
      } else if (this.state === 'CHAMPIONSHIP_RESULT') {
        this.renderChampionshipResult(ctx);
      } else if (this.state === 'ENDING_SCENE') {
        this.renderEndingScene(ctx);
      }

      // Notificação Arcade de Detecção de Gamepad / Joystick Nativo
      if (this.input && this.input.gamepadBannerTimer > 0) {
        ctx.save();
        const alpha = Math.min(1, this.input.gamepadBannerTimer * 1.6);
        ctx.globalAlpha = alpha;
        const bW = 270;
        const bH = 20;
        const bX = Math.round(INTERNAL_WIDTH / 2 - bW / 2);
        const bY = 7;
        ctx.fillStyle = 'rgba(6, 12, 24, 0.94)';
        ctx.fillRect(bX, bY, bW, bH);
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(bX, bY, bW, bH);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 7.5px monospace';
        const cleanName = (this.input.gamepadName || 'GAMESIR / CONTROLE NATIVO').slice(0, 32);
        ctx.fillText(`🎮 CONTROLE DETECTADO: ${cleanName}`, INTERNAL_WIDTH / 2, bY + 13);
        ctx.restore();
      }

      // Overlay de transição suave fade dos menus
      if (this.menuFadeAlpha > 0) {
        ctx.save();
        ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, Math.max(0, this.menuFadeAlpha))})`;
        ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
        ctx.restore();
      }

      // Contador de FPS em tempo real (Discreto e compacto no topo, sem invadir RPM ou velocímetro)
      if (this.showFPS) {
        ctx.save();
        ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
        const fpsVal = Math.round(this.fps);
        const fpsColor = fpsVal >= 55 ? '#69F0AE' : (fpsVal >= 30 ? '#FFD700' : '#FF5252');
        ctx.fillStyle = 'rgba(5, 8, 16, 0.70)';
        ctx.fillRect(4, 1.2, 28, 7.2);
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.30)';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(4, 1.2, 28, 7.2);
        ctx.font = 'bold 5.2px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = fpsColor;
        ctx.fillText(`${fpsVal} FPS`, 18, 4.8);
        ctx.restore();
      }
    }

    renderHeadlightBeams(ctx, px, py, steer, intensity = 1.0) {
      ctx.save();
      const tilt = steer * 14;
      const alpha = Math.min(1, Math.max(0, intensity));

      // Facho de iluminacao circular/oval no asfalto em frente ao carro do jogador
      const poolY = py - 30;
      const poolGrad = ctx.createRadialGradient(px + tilt * 0.5, poolY, 4, px + tilt * 0.5, poolY, 75);
      poolGrad.addColorStop(0, `rgba(255, 255, 235, ${(0.45 * alpha).toFixed(3)})`);
      poolGrad.addColorStop(0.35, `rgba(235, 248, 255, ${(0.26 * alpha).toFixed(3)})`);
      poolGrad.addColorStop(0.70, `rgba(195, 230, 255, ${(0.11 * alpha).toFixed(3)})`);
      poolGrad.addColorStop(1, 'rgba(180, 220, 255, 0)');
      ctx.fillStyle = poolGrad;
      ctx.beginPath();
      ctx.ellipse(px + tilt * 0.5, poolY, 68, 25, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    getGhostSample(time) {
      if (!this.bestGhostTrail || this.bestGhostTrail.length === 0) return null;
      let low = 0, high = this.bestGhostTrail.length - 1;
      while (low <= high) {
        const mid = (low + high) >> 1;
        if (this.bestGhostTrail[mid].t < time) low = mid + 1;
        else high = mid - 1;
      }
      const idx = Math.max(0, Math.min(this.bestGhostTrail.length - 1, low));
      return this.bestGhostTrail[idx];
    }

    renderWetReflection(ctx, x, y, w, h, isBraking, rainFactor) {
      if (rainFactor <= 0.04 || w < 7) return;
      ctx.save();
      const refH = Math.min(h * 0.45, 26);
      const refY = y + h * 0.44;
      const alpha = Math.min(0.32, rainFactor * 0.32);

      // Reflexo da silhueta do carro no chão molhado
      const refGrad = ctx.createLinearGradient(0, refY, 0, refY + refH);
      refGrad.addColorStop(0, `rgba(12, 18, 28, ${(alpha * 0.85).toFixed(3)})`);
      refGrad.addColorStop(0.4, `rgba(20, 28, 40, ${(alpha * 0.45).toFixed(3)})`);
      refGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = refGrad;
      ctx.beginPath();
      ctx.ellipse(x, refY + refH * 0.35, w * 0.42, refH * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Reflexo esticado das lanternas vermelhas no asfalto molhado
      const tailX1 = x - w * 0.28;
      const tailX2 = x + w * 0.28;
      const tailRefH = Math.min(h * 0.65, 36);
      const tailCol = isBraking ? 'rgba(255, 35, 10,' : 'rgba(235, 45, 25,';
      const tailGrad1 = ctx.createLinearGradient(0, refY, 0, refY + tailRefH);
      tailGrad1.addColorStop(0, `${tailCol} ${(alpha * (isBraking ? 1.0 : 0.65)).toFixed(3)})`);
      tailGrad1.addColorStop(1, `${tailCol} 0)`);
      ctx.fillStyle = tailGrad1;
      const barW = Math.max(1.5, w * 0.14);
      ctx.fillRect(tailX1 - barW * 0.5, refY, barW, tailRefH);
      ctx.fillRect(tailX2 - barW * 0.5, refY, barW, tailRefH);
      ctx.restore();
    }

    renderBotHeadlightBeams(ctx, x, y, w, h, steer, intensity = 1.0) {
      if (w <= 8 || h <= 4) return;
      ctx.save();
      const tilt = steer * w * 0.20;
      const alpha = Math.min(1, Math.max(0, intensity));

      // Facho de iluminacao circular/oval no asfalto em frente ao carro adversario
      const poolY = y - h * 0.35;
      const radiusX = Math.max(6, w * 0.65);
      const radiusY = Math.max(2, h * 0.28);
      const innerR = Math.min(2, radiusX * 0.2);
      const poolGrad = ctx.createRadialGradient(x + tilt, poolY, innerR, x + tilt, poolY, radiusX);
      poolGrad.addColorStop(0, `rgba(255, 252, 230, ${(0.38 * alpha).toFixed(3)})`);
      poolGrad.addColorStop(0.40, `rgba(230, 245, 255, ${(0.20 * alpha).toFixed(3)})`);
      poolGrad.addColorStop(1, 'rgba(190, 225, 255, 0)');
      ctx.fillStyle = poolGrad;
      ctx.beginPath();
      ctx.ellipse(x + tilt, poolY, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Métodos de céu/clima em js/sky_renderer.js e pista/cenários em js/road_renderer.js
    // HUD em js/hud_renderer.js | Menus e telas em js/menu_renderer.js
    scheduleNextFrame() {
      if (this._rafHandle) {
        cancelAnimationFrame(this._rafHandle);
        this._rafHandle = null;
      }
      if (this._timeoutHandle) {
        clearTimeout(this._timeoutHandle);
        this._timeoutHandle = null;
      }
      if (this.vsyncEnabled) {
        this._rafHandle = requestAnimationFrame(this.boundGameLoop);
      } else if (this.fpsLimit === 60) {
        const elapsed = performance.now() - this.lastRenderTime;
        const remain = Math.max(0, Math.floor((1000 / 60) - elapsed));
        this._timeoutHandle = setTimeout(this.boundGameLoop, remain);
      } else {
        this._timeoutHandle = setTimeout(this.boundGameLoop, 0);
      }
    }

    gameLoop(now) {
      try {
        if (!now) now = performance.now();

        // Limite de taxa de quadros (Ex: 60 FPS cravados em telas de 90Hz, 120Hz ou monitores rápidos)
        if (this.fpsLimit === 60) {
          const targetInterval = 1000 / 60; // 16.666ms
          const elapsed = now - this.lastRenderTime;
          // Margem de tolerância de 2.5ms para sincronia estável com ciclos de 120Hz/60Hz
          if (elapsed < targetInterval - 2.5) {
            return; // O bloco finally executará e agendará o próximo quadro de forma única e segura
          }
        }

        let frameTime = (now - this.lastTime) / 1000;
        if (frameTime > 0.067) frameTime = 0.067;
        if (frameTime < 0) frameTime = 0;
        this.lastTime = now;
        this.lastRenderTime = now;

        // Amostragem contínua de FPS com média móvel
        this.fpsFrames++;
        if (now - this.fpsLastTime >= 350) {
          this.fps = (this.fpsFrames * 1000) / (now - this.fpsLastTime);
          this.fpsFrames = 0;
          this.fpsLastTime = now;
        }

        this.accumulator = Math.min(this.accumulator + frameTime, this.fixedStep * 1.8);
        let steps = 0;
        while (this.accumulator >= this.fixedStep && steps < 2) {
          this.update(this.fixedStep);
          this.accumulator -= this.fixedStep;
          steps++;
        }
        if (steps >= 2) {
          this.accumulator = 0;
        }

        this.render();
      } catch (err) {
        console.error('LH44 GameLoop error:', err);
      } finally {
        this.scheduleNextFrame();
      }
    }
  }
