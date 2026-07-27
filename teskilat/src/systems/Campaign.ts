/** Sezon (kampanya) durumu — bölümler arası kalıcı ilerleme (Genişletme GDD §3, Core E). */

export type SuspectId = 'amir' | 'teknik' | 'saha' | 'kaynak';

export interface CampaignState {
  /** Teşkilat Güveni 0-100: doğru kararlar artırır. */
  trust: number;
  /** Gizlilik Seviyesi 0-100: YÜKSEK = kötü (kimlik açığa çıkıyor). */
  stealth: number;
  /** Kanıt Bütünlüğü 0-100. */
  evidence: number;
  /** Ekip Bağı 0-100. */
  teamBond: number;
  /** Hainlik şüphe tablosu (4 kilit karakter). */
  suspicion: Record<SuspectId, number>;
  selectedSuspect: SuspectId | null;
  flags: string[];
}

const KEY = 'teskilat_campaign_v1';

function fresh(): CampaignState {
  return {
    trust: 50,
    stealth: 0,
    evidence: 50,
    teamBond: 50,
    suspicion: { amir: 10, teknik: 10, saha: 10, kaynak: 10 },
    selectedSuspect: null,
    flags: []
  };
}

const clamp = (v: number): number => Math.max(0, Math.min(100, Math.round(v)));

let memory: CampaignState | null = null;

/** localStorage kapalıysa bellek içi çalışır; asla çökmez. */
export const Campaign = {
  get(): CampaignState {
    if (memory) return memory;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p: unknown = JSON.parse(raw);
        if (typeof p === 'object' && p !== null && 'suspicion' in (p as CampaignState)) {
          memory = p as CampaignState;
          return memory;
        }
      }
    } catch {
      /* varsayılana dön */
    }
    memory = fresh();
    return memory;
  },

  adjust(delta: Partial<Record<'trust' | 'stealth' | 'evidence' | 'teamBond', number>>): void {
    const s = this.get();
    if (delta.trust) s.trust = clamp(s.trust + delta.trust);
    if (delta.stealth) s.stealth = clamp(s.stealth + delta.stealth);
    if (delta.evidence) s.evidence = clamp(s.evidence + delta.evidence);
    if (delta.teamBond) s.teamBond = clamp(s.teamBond + delta.teamBond);
    this.persist();
  },

  suspect(id: SuspectId, delta: number): void {
    const s = this.get();
    s.suspicion[id] = clamp(s.suspicion[id] + delta);
    this.persist();
  },

  setSelectedSuspect(id: SuspectId): void {
    this.get().selectedSuspect = id;
    this.persist();
  },

  addFlag(flag: string): void {
    const s = this.get();
    if (!s.flags.includes(flag)) s.flags.push(flag);
    this.persist();
  },

  hasFlag(flag: string): boolean {
    return this.get().flags.includes(flag);
  },

  reset(): void {
    memory = fresh();
    this.persist();
  },

  persist(): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.get()));
    } catch {
      /* bellek içi devam */
    }
  }
};
