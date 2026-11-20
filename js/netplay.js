/**
 * LH44 - LOW TO HIGH SPEED
 * Gerenciador de Multiplayer Online 2P via Supabase Realtime (São Paulo)
 * Usa Broadcast (WebSocket em memória RAM) + Presence (controle de sala e máx. 2 jogadores).
 */

const LH44_SUPABASE_URL = 'https://uurmctdcsronapbrsfoh.supabase.co';
const LH44_SUPABASE_KEY = 'sb_publishable_PH-_b3m2LMECdo3osdR4Eg_1C77-Yc7';

class NetplayManager {
  constructor() {
    this.client = null;
    this.channel = null;
    this.roomCode = '';
    this.role = null; // 'HOST' | 'GUEST'
    this.clientId = 'u_' + Math.random().toString(36).slice(2, 10);
    this.connected = false;
    this.status = 'IDLE'; // 'IDLE' | 'LOBBY' | 'RACING' | 'FINISHED'
    this.errorMsg = '';

    this.meta = null;
    this.remoteState = null;
    this.remoteBots = null;
    this.lastSendTime = 0;
    this.lastBotsSendTime = 0;
    this.raceGoReceived = false;
    this.p2pOpen = true; // Mantido para compatibilidade de baixa latência (~São Paulo)
  }

  isAvailable() {
    return (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function');
  }

  ensureInit() {
    if (!this.isAvailable()) {
      this.errorMsg = 'Supabase indisponível (verifique a internet).';
      return false;
    }
    try {
      if (!this.client) {
        this.client = supabase.createClient(LH44_SUPABASE_URL, LH44_SUPABASE_KEY, {
          realtime: { params: { eventsPerSecond: 40 } }
        });
      }
      this.errorMsg = '';
      return true;
    } catch (e) {
      this.errorMsg = 'Erro ao iniciar Supabase.';
      return false;
    }
  }

  generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  setupChannelEvents(ch) {
    ch.on('broadcast', { event: 'meta' }, ({ payload }) => {
      if (!payload) return;
      this.meta = payload;
      this.status = payload.status || 'LOBBY';
    });

    ch.on('broadcast', { event: 'guest_patch' }, ({ payload }) => {
      if (this.role !== 'HOST' || !this.meta || !payload) return;
      Object.assign(this.meta, payload);
      this.broadcastMeta();
    });

    ch.on('broadcast', { event: 'join_req' }, ({ payload }) => {
      if (this.role !== 'HOST' || !this.meta || !payload) return;
      if (this.meta.guestName && this.meta.guestClientId && this.meta.guestClientId !== payload.clientId) {
        return;
      }
      this.meta.guestClientId = payload.clientId;
      this.meta.guestName = payload.name || 'AMIGO';
      this.meta.guestCarIndex = payload.carIndex || 0;
      this.meta.guestColorIndex = payload.colorIndex || 0;
      this.meta.guestReady = false;
      this.broadcastMeta();
    });

    ch.on('broadcast', { event: 'p' }, ({ payload }) => {
      if (payload) this.remoteState = payload;
    });

    ch.on('broadcast', { event: 'b' }, ({ payload }) => {
      if (this.role === 'GUEST' && payload) this.remoteBots = payload;
    });

    ch.on('broadcast', { event: 'go' }, () => {
      this.raceGoReceived = true;
    });

    ch.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      if (!leftPresences || !this.connected) return;
      for (let i = 0; i < leftPresences.length; i++) {
        const lp = leftPresences[i];
        if (this.role === 'GUEST' && lp.role === 'HOST') {
          this.errorMsg = 'A sala foi encerrada pelo Host.';
          this.leaveRoom();
          return;
        }
        if (this.role === 'HOST' && lp.role === 'GUEST' && this.meta) {
          this.meta.guestName = '';
          this.meta.guestClientId = '';
          this.meta.guestReady = false;
          this.remoteState = null;
          this.broadcastMeta();
        }
      }
    });
  }

  broadcastMeta() {
    if (!this.channel || !this.meta) return;
    this.channel.send({ type: 'broadcast', event: 'meta', payload: this.meta }).catch(() => {});
  }

  async createRoom(playerInfo) {
    if (!this.ensureInit()) return null;
    await this.leaveRoom();

    const code = this.generateCode();
    const ch = this.client.channel('lh44-room-' + code, {
      config: {
        broadcast: { self: false },
        presence: { key: this.clientId }
      }
    });

    const meta = {
      status: 'LOBBY',
      createdAt: Date.now(),
      trackIndex: playerInfo.trackIndex || 0,
      envCond: playerInfo.envCond || 'DIA',
      songIndex: playerInfo.songIndex || 0,
      hostName: playerInfo.name || 'HOST',
      hostCarIndex: playerInfo.carIndex || 0,
      hostColorIndex: playerInfo.colorIndex || 0,
      hostReady: true,
      guestName: '',
      guestClientId: '',
      guestCarIndex: 1,
      guestColorIndex: 0,
      guestReady: false,
      onlineMode: 'QUICK',
      diffMode: 'NORMAL',
      seasonStage: 0,
      seasonSchedule: [],
      championshipPoints: null,
      hostUpgrades: { engine: 0, tires: 0, turbo: 0 },
      guestUpgrades: { engine: 0, tires: 0, turbo: 0 },
      raceSeq: 0
    };

    this.role = 'HOST';
    this.meta = meta;
    this.setupChannelEvents(ch);

    return new Promise((resolve) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          this.errorMsg = 'Tempo esgotado ao conectar no servidor.';
          resolve(null);
        }
      }, 8000);

      ch.subscribe(async (status) => {
        if (settled) return;
        if (status === 'SUBSCRIBED') {
          settled = true;
          clearTimeout(timer);
          await ch.track({ role: 'HOST', name: meta.hostName });
          this.channel = ch;
          this.roomCode = code;
          this.connected = true;
          this.status = 'LOBBY';
          resolve(code);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          settled = true;
          clearTimeout(timer);
          this.errorMsg = 'Falha ao criar sala no Supabase.';
          resolve(null);
        }
      });
    });
  }

  async joinRoom(code, playerInfo) {
    if (!this.ensureInit()) return false;
    const clean = (code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (clean.length < 4) {
      this.errorMsg = 'Digite o código de 4 caracteres.';
      return false;
    }

    await this.leaveRoom();
    const ch = this.client.channel('lh44-room-' + clean, {
      config: {
        broadcast: { self: false },
        presence: { key: this.clientId }
      }
    });

    this.role = 'GUEST';
    this.meta = null;
    this.setupChannelEvents(ch);

    return new Promise((resolve) => {
      let settled = false;
      const finish = (ok, err) => {
        if (settled) return;
        settled = true;
        if (!ok) {
          this.errorMsg = err || 'Não foi possível entrar na sala.';
          try { this.client.removeChannel(ch); } catch (_) {}
          this.role = null;
        }
        resolve(ok);
      };

      const timeout = setTimeout(() => {
        finish(false, 'Sala "' + clean + '" não encontrada.');
      }, 5000);

      ch.on('presence', { event: 'sync' }, async () => {
        if (settled) return;
        const state = ch.presenceState();
        const entries = Object.values(state).flat();
        const hasHost = entries.some((e) => e.role === 'HOST');
        const guestCount = entries.filter((e) => e.role === 'GUEST' && e.presence_ref !== this.clientId).length;
        if (!hasHost) return;
        if (guestCount >= 1) {
          clearTimeout(timeout);
          finish(false, 'Sala lotada (máx. 2 jogadores).');
          return;
        }
        clearTimeout(timeout);
        await ch.track({ role: 'GUEST', name: playerInfo.name || 'AMIGO' });
        this.channel = ch;
        this.roomCode = clean;
        this.connected = true;
        this.status = 'LOBBY';
        await ch.send({
          type: 'broadcast',
          event: 'join_req',
          payload: {
            clientId: this.clientId,
            name: playerInfo.name || 'AMIGO',
            carIndex: playerInfo.carIndex || 0,
            colorIndex: playerInfo.colorIndex || 0
          }
        });
        finish(true);
      });

      ch.subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          clearTimeout(timeout);
          finish(false, 'Erro ao conectar na sala.');
        }
      });
    });
  }

  updateMeta(patch) {
    if (!this.channel || !patch) return;
    if (this.role === 'HOST') {
      if (this.meta) Object.assign(this.meta, patch);
      this.broadcastMeta();
    } else {
      if (this.meta) Object.assign(this.meta, patch);
      this.channel.send({ type: 'broadcast', event: 'guest_patch', payload: patch }).catch(() => {});
    }
  }

  clearRaceState() {
    this.remoteState = null;
    this.remoteBots = null;
    this.raceGoReceived = false;
  }

  sendRaceGo() {
    if (!this.channel || this.role !== 'HOST') return;
    this.channel.send({ type: 'broadcast', event: 'go', payload: { t: Date.now() } }).catch(() => {});
  }

  sendPlayerState(stateObj, force = false) {
    if (!this.channel || !this.role) return;
    const now = performance.now();
    if (!force && now - this.lastSendTime < 30) return; // ~33 Hz WebSocket São Paulo
    this.lastSendTime = now;
    this.channel.send({ type: 'broadcast', event: 'p', payload: stateObj }).catch(() => {});
  }

  sendBotsState(botsCompact) {
    if (!this.channel || this.role !== 'HOST') return;
    const now = performance.now();
    if (now - this.lastBotsSendTime < 50) return; // ~20 Hz WebSocket São Paulo
    this.lastBotsSendTime = now;
    this.channel.send({ type: 'broadcast', event: 'b', payload: botsCompact }).catch(() => {});
  }

  async leaveRoom() {
    if (this.channel && this.client) {
      try { await this.channel.untrack(); } catch (_) {}
      try { await this.client.removeChannel(this.channel); } catch (_) {}
    }
    this.channel = null;
    this.roomCode = '';
    this.role = null;
    this.connected = false;
    this.status = 'IDLE';
    this.meta = null;
    this.remoteState = null;
    this.remoteBots = null;
  }
}

window.NetplayManager = NetplayManager;
