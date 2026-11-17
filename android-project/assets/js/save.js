/**
 * LH44 - LOW TO HIGH SPEED
 * Gerenciador de salvamento local (3 slots independentes)
 */

const SaveManager = {
  SLOTS_KEY_PREFIX: 'lh44_save_slot_',
  MAX_SLOTS: 3,

  getSlot(slotNum) {
    try {
      const raw = localStorage.getItem(this.SLOTS_KEY_PREFIX + slotNum);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('Erro ao ler slot ' + slotNum, e);
      return null;
    }
  },

  getAllSlots() {
    const slots = [];
    for (let i = 1; i <= this.MAX_SLOTS; i++) {
      slots.push(this.getSlot(i));
    }
    return slots;
  },

  saveSlot(slotNum, data) {
    try {
      const d = new Date();
      const dateStr = d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const payload = {
        slotNum: slotNum,
        timestamp: Date.now(),
        dateStr: dateStr,
        playerName: data.playerName || 'JOGADOR',
        gameMode: data.gameMode || 'CHAMPIONSHIP',
        difficulty: data.difficulty || 'NORMAL',
        selectedCarIndex: data.selectedCarIndex !== undefined ? data.selectedCarIndex : 0,
        colorIndex: data.colorIndex !== undefined ? data.colorIndex : 1,
        chosenEnvCond: data.chosenEnvCond || 'DIA',
        seasonStage: data.seasonStage !== undefined ? data.seasonStage : 0,
        seasonSchedule: data.seasonSchedule ? [...data.seasonSchedule] : [],
        championshipPoints: data.championshipPoints ? [...data.championshipPoints] : [],
        lastTrackIndex: data.lastTrackIndex !== undefined ? data.lastTrackIndex : 0,
        nextTrackIndex: data.nextTrackIndex !== undefined ? data.nextTrackIndex : 0,
        playerRank: data.playerRank || 1,
        totalPoints: data.totalPoints || 0,
        seasonBots: data.seasonBots ? [...data.seasonBots] : [],
        seasonGridOrder: data.seasonGridOrder ? [...data.seasonGridOrder] : [],
        playerCredits: data.playerCredits !== undefined ? data.playerCredits : 0,
        playerUpgrades: data.playerUpgrades ? { ...data.playerUpgrades } : { engine: 0, tires: 0, turbo: 0 }
      };
      localStorage.setItem(this.SLOTS_KEY_PREFIX + slotNum, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.warn('Erro ao gravar slot ' + slotNum, e);
      return false;
    }
  },

  deleteSlot(slotNum) {
    try {
      localStorage.removeItem(this.SLOTS_KEY_PREFIX + slotNum);
      return true;
    } catch (e) {
      return false;
    }
  }
};

/**
 * Recordes salvos por pista (melhor volta e melhor posição conquistada)
 */
const TrackRecords = {
  STORAGE_KEY: 'lh44_track_records',

  getAll() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  },

  get(trackId) {
    if (!trackId) return null;
    const all = this.getAll();
    return all[trackId] || null;
  },

  update(trackId, bestLap, rank) {
    if (!trackId) return null;
    try {
      const all = this.getAll();
      const prev = all[trackId] || { bestLap: 0, bestRank: 0 };
      let changed = false;

      if (bestLap > 0 && (prev.bestLap === 0 || bestLap < prev.bestLap)) {
        prev.bestLap = bestLap;
        changed = true;
      }
      if (rank > 0 && (prev.bestRank === 0 || rank < prev.bestRank)) {
        prev.bestRank = rank;
        changed = true;
      }
      if (changed) {
        all[trackId] = prev;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
      }
      return prev;
    } catch (_) {
      return null;
    }
  }
};
