/**
 * LH44 - LOW TO HIGH SPEED
 * Gerenciador de Multiplayer Online 2P:
 * - Usa WebRTC DataChannel (P2P direto, baixa latência, estilo UDP) quando disponível
 * - Usa Firebase Realtime Database para sinalização e como fallback automático
 */

const LH44_FIREBASE_CONFIG = {
  apiKey: "AIzaSyC3qLNVB5W6xNTSQXAtrMNWEs3f8pdOBJg",
  authDomain: "lh44-online.firebaseapp.com",
  databaseURL: "https://lh44-online-default-rtdb.firebaseio.com",
  projectId: "lh44-online",
  storageBucket: "lh44-online.firebasestorage.app",
  messagingSenderId: "883200091941",
  appId: "1:883200091941:web:2d8c4ef123ee173e91dccc"
};

class NetplayManager {
  constructor() {
    this.db = null;
    this.roomRef = null;
    this.roomCode = '';
    this.role = null; // 'HOST' | 'GUEST'
    this.connected = false;
    this.status = 'IDLE'; // 'IDLE' | 'LOBBY' | 'RACING' | 'FINISHED'
    this.errorMsg = '';

    this.meta = null;
    this.remoteState = null;
    this.remoteBots = null;
    this.lastSendTime = 0;
    this.lastBotsSendTime = 0;
    this._listeners = [];

    // WebRTC P2P DataChannel
    this.pc = null;
    this.dc = null;
    this.p2pOpen = false;
    this._iceApplied = new Set();
  }

  isAvailable() {
    return (typeof firebase !== 'undefined' && typeof firebase.database === 'function');
  }

  ensureInit() {
    if (!this.isAvailable()) {
      this.errorMsg = 'Firebase indisponível (verifique a internet).';
      return false;
    }
    try {
      if (!firebase.apps || firebase.apps.length === 0) {
        firebase.initializeApp(LH44_FIREBASE_CONFIG);
      }
      this.db = firebase.database();
      this.errorMsg = '';
      return true;
    } catch (e) {
      this.errorMsg = 'Erro ao iniciar Firebase.';
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

  async createRoom(playerInfo) {
    if (!this.ensureInit()) return null;
    await this.leaveRoom();

    const code = this.generateCode();
    const ref = this.db.ref('rooms/' + code);
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

    try {
      await ref.set({ meta });
      ref.onDisconnect().remove();
      this.roomRef = ref;
      this.roomCode = code;
      this.role = 'HOST';
      this.connected = true;
      this.status = 'LOBBY';
      this.meta = meta;
      this.attachListeners();
      return code;
    } catch (e) {
      this.errorMsg = 'Falha ao criar sala no Firebase.';
      return null;
    }
  }

  async joinRoom(code, playerInfo) {
    if (!this.ensureInit()) return false;
    const clean = (code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (clean.length < 4) {
      this.errorMsg = 'Digite o código de 4 caracteres.';
      return false;
    }

    await this.leaveRoom();
    const ref = this.db.ref('rooms/' + clean);
    try {
      const snap = await ref.child('meta').get();
      if (!snap.exists()) {
        this.errorMsg = 'Sala "' + clean + '" não encontrada.';
        return false;
      }
      const meta = snap.val();
      if (meta.guestName) {
        this.errorMsg = (meta.status === 'RACING') ? 'Sala já está em corrida.' : 'Sala lotada (máx. 2 jogadores).';
        return false;
      }

      await ref.child('meta').update({
        guestName: playerInfo.name || 'AMIGO',
        guestCarIndex: playerInfo.carIndex || 0,
        guestColorIndex: playerInfo.colorIndex || 0,
        guestReady: false
      });
      ref.child('meta/guestName').onDisconnect().set('');
      ref.child('meta/guestReady').onDisconnect().set(false);

      this.roomRef = ref;
      this.roomCode = clean;
      this.role = 'GUEST';
      this.connected = true;
      this.status = meta.status || 'LOBBY';
      this.meta = Object.assign({}, meta, {
        guestName: playerInfo.name || 'AMIGO',
        guestCarIndex: playerInfo.carIndex || 0,
        guestColorIndex: playerInfo.colorIndex || 0,
        guestReady: false
      });
      this.attachListeners();
      this.startWebRTC();
      return true;
    } catch (e) {
      this.errorMsg = 'Erro ao entrar na sala.';
      return false;
    }
  }

  setupDataChannel(dc) {
    this.dc = dc;
    dc.onopen = () => {
      this.p2pOpen = true;
    };
    dc.onclose = () => {
      this.p2pOpen = false;
    };
    dc.onerror = () => {
      this.p2pOpen = false;
    };
    dc.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'p') {
          this.remoteState = msg.d;
        } else if (msg.type === 'b' && this.role === 'GUEST') {
          this.remoteBots = msg.d;
        }
      } catch (_) {}
    };
  }

  startWebRTC() {
    if (typeof RTCPeerConnection === 'undefined' || !this.roomRef) return;
    this.closeWebRTC();
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      this.pc = pc;
      this._iceApplied = new Set();

      const rtcRef = this.roomRef.child('rtc');
      const localIceKey = (this.role === 'HOST') ? 'hostIce' : 'guestIce';
      const remoteIceKey = (this.role === 'HOST') ? 'guestIce' : 'hostIce';

      pc.onicecandidate = (ev) => {
        if (ev.candidate && this.roomRef) {
          rtcRef.child(localIceKey).push(ev.candidate.toJSON()).catch(() => {});
        }
      };

      const iceRef = rtcRef.child(remoteIceKey);
      const onIce = (snap) => {
        const val = snap.val();
        if (!val || !this.pc) return;
        const keys = Object.keys(val);
        for (let i = 0; i < keys.length; i++) {
          const k = keys[i];
          if (this._iceApplied.has(k)) continue;
          this._iceApplied.add(k);
          try {
            this.pc.addIceCandidate(new RTCIceCandidate(val[k])).catch(() => {});
          } catch (_) {}
        }
      };
      iceRef.on('value', onIce);
      this._listeners.push({ ref: iceRef, evt: 'value', fn: onIce });

      if (this.role === 'HOST') {
        const dc = pc.createDataChannel('lh44', { ordered: false, maxRetransmits: 0 });
        this.setupDataChannel(dc);
        pc.createOffer().then((offer) => {
          return pc.setLocalDescription(offer).then(() => {
            return rtcRef.child('offer').set({ type: offer.type, sdp: offer.sdp });
          });
        }).catch(() => {});

        const ansRef = rtcRef.child('answer');
        const onAns = (snap) => {
          const ans = snap.val();
          if (ans && this.pc && !this.pc.currentRemoteDescription) {
            this.pc.setRemoteDescription(new RTCSessionDescription(ans)).catch(() => {});
          }
        };
        ansRef.on('value', onAns);
        this._listeners.push({ ref: ansRef, evt: 'value', fn: onAns });
      } else {
        pc.ondatachannel = (ev) => {
          if (ev.channel) this.setupDataChannel(ev.channel);
        };
        const offRef = rtcRef.child('offer');
        const onOff = (snap) => {
          const off = snap.val();
          if (off && this.pc && !this.pc.currentRemoteDescription) {
            this.pc.setRemoteDescription(new RTCSessionDescription(off))
              .then(() => this.pc.createAnswer())
              .then((ans) => this.pc.setLocalDescription(ans).then(() => rtcRef.child('answer').set({ type: ans.type, sdp: ans.sdp })))
              .catch(() => {});
          }
        };
        offRef.on('value', onOff);
        this._listeners.push({ ref: offRef, evt: 'value', fn: onOff });
      }
    } catch (_) {}
  }

  closeWebRTC() {
    this.p2pOpen = false;
    if (this.dc) {
      try { this.dc.close(); } catch (_) {}
      this.dc = null;
    }
    if (this.pc) {
      try { this.pc.close(); } catch (_) {}
      this.pc = null;
    }
    this._iceApplied = new Set();
  }

  attachListeners() {
    this.detachListeners();
    if (!this.roomRef) return;

    const metaRef = this.roomRef.child('meta');
    const onMeta = (snap) => {
      const val = snap.val();
      if (!val) {
        this.meta = null;
        this.connected = false;
        this.status = 'IDLE';
        this.errorMsg = 'A sala foi encerrada pelo Host.';
        return;
      }
      const hadGuest = !!(this.meta && this.meta.guestName);
      this.meta = val;
      this.status = val.status || 'LOBBY';
      if (this.role === 'HOST' && val.guestName && (!hadGuest || !this.pc)) {
        this.startWebRTC();
      }
    };
    metaRef.on('value', onMeta);
    this._listeners.push({ ref: metaRef, evt: 'value', fn: onMeta });

    const remoteKey = (this.role === 'HOST') ? 'guestState' : 'hostState';
    const remRef = this.roomRef.child(remoteKey);
    const onRem = (snap) => {
      if (!this.p2pOpen) {
        this.remoteState = snap.val() || null;
      }
    };
    remRef.on('value', onRem);
    this._listeners.push({ ref: remRef, evt: 'value', fn: onRem });

    if (this.role === 'GUEST') {
      const botsRef = this.roomRef.child('bots');
      const onBots = (snap) => {
        if (!this.p2pOpen) {
          this.remoteBots = snap.val() || null;
        }
      };
      botsRef.on('value', onBots);
      this._listeners.push({ ref: botsRef, evt: 'value', fn: onBots });
    }
  }

  detachListeners() {
    for (let i = 0; i < this._listeners.length; i++) {
      const l = this._listeners[i];
      try { l.ref.off(l.evt, l.fn); } catch (_) {}
    }
    this._listeners = [];
  }

  updateMeta(patch) {
    if (!this.roomRef) return;
    this.roomRef.child('meta').update(patch).catch(() => {});
  }

  clearRaceState() {
    this.remoteState = null;
    this.remoteBots = null;
    if (!this.roomRef || this.role !== 'HOST') return;
    this.roomRef.child('hostState').remove().catch(() => {});
    this.roomRef.child('guestState').remove().catch(() => {});
    this.roomRef.child('bots').remove().catch(() => {});
  }

  sendPlayerState(stateObj, force = false) {
    if (!this.roomRef || !this.role) return;
    const now = performance.now();
    if (this.p2pOpen && this.dc && this.dc.readyState === 'open') {
      if (!force && now - this.lastSendTime < 22) return; // ~45 Hz direto P2P
      this.lastSendTime = now;
      try {
        this.dc.send(JSON.stringify({ type: 'p', d: stateObj }));
        return;
      } catch (_) {}
    }
    if (!force && now - this.lastSendTime < 55) return; // ~18 Hz fallback Firebase
    this.lastSendTime = now;
    const key = (this.role === 'HOST') ? 'hostState' : 'guestState';
    this.roomRef.child(key).set(stateObj).catch(() => {});
  }

  sendBotsState(botsCompact) {
    if (!this.roomRef || this.role !== 'HOST') return;
    const now = performance.now();
    if (this.p2pOpen && this.dc && this.dc.readyState === 'open') {
      if (now - this.lastBotsSendTime < 35) return; // ~28 Hz direto P2P
      this.lastBotsSendTime = now;
      try {
        this.dc.send(JSON.stringify({ type: 'b', d: botsCompact }));
        return;
      } catch (_) {}
    }
    if (now - this.lastBotsSendTime < 90) return; // ~11 Hz fallback Firebase
    this.lastBotsSendTime = now;
    this.roomRef.child('bots').set(botsCompact).catch(() => {});
  }

  async leaveRoom() {
    this.closeWebRTC();
    this.detachListeners();
    if (this.roomRef) {
      try {
        if (this.role === 'HOST') {
          await this.roomRef.remove();
        } else if (this.role === 'GUEST') {
          await this.roomRef.child('meta').update({ guestName: '', guestReady: false });
          await this.roomRef.child('guestState').remove();
        }
      } catch (_) {}
    }
    this.roomRef = null;
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
