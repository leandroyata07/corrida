/**
 * LH44 - LOW TO HIGH SPEED
 * Gerenciador de Multiplayer Online 2P via Firebase Realtime Database
 * Isolado do fluxo solo para manter 100% de compatibilidade offline/single-player.
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
      if (meta.guestName && meta.status === 'RACING') {
        this.errorMsg = 'Sala já está em corrida.';
        return false;
      }

      await ref.child('meta').update({
        guestName: playerInfo.name || 'AMIGO',
        guestCarIndex: playerInfo.carIndex || 0,
        guestColorIndex: playerInfo.colorIndex || 0,
        guestReady: false
      });

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
      return true;
    } catch (e) {
      this.errorMsg = 'Erro ao entrar na sala.';
      return false;
    }
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
      this.meta = val;
      this.status = val.status || 'LOBBY';
    };
    metaRef.on('value', onMeta);
    this._listeners.push({ ref: metaRef, evt: 'value', fn: onMeta });

    const remoteKey = (this.role === 'HOST') ? 'guestState' : 'hostState';
    const remRef = this.roomRef.child(remoteKey);
    const onRem = (snap) => {
      this.remoteState = snap.val() || null;
    };
    remRef.on('value', onRem);
    this._listeners.push({ ref: remRef, evt: 'value', fn: onRem });

    if (this.role === 'GUEST') {
      const botsRef = this.roomRef.child('bots');
      const onBots = (snap) => {
        this.remoteBots = snap.val() || null;
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

  sendPlayerState(stateObj, force = false) {
    if (!this.roomRef || !this.role) return;
    const now = performance.now();
    if (!force && now - this.lastSendTime < 50) return; // ~20 Hz
    this.lastSendTime = now;
    const key = (this.role === 'HOST') ? 'hostState' : 'guestState';
    this.roomRef.child(key).set(stateObj).catch(() => {});
  }

  sendBotsState(botsCompact) {
    if (!this.roomRef || this.role !== 'HOST') return;
    const now = performance.now();
    if (now - this.lastBotsSendTime < 85) return; // ~12 Hz
    this.lastBotsSendTime = now;
    this.roomRef.child('bots').set(botsCompact).catch(() => {});
  }

  async leaveRoom() {
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
