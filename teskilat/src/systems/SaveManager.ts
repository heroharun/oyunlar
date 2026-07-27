import type { BadgeId, ReportGrade } from '../types/mission';

interface SaveData {
  completedMissions: string[];
  bestGrade: Partial<Record<string, ReportGrade>>;
  badges: BadgeId[];
}

const STORAGE_KEY = 'teskilat_golge_save_v1';
const EMPTY: SaveData = { completedMissions: [], bestGrade: {}, badges: [] };

const GRADE_RANK: Record<ReportGrade, number> = {
  desifre: 0,
  riskli: 1,
  kontrollu: 2,
  sessiz: 3
};

/**
 * localStorage tabanlı yerel kayıt (GDD §14.3).
 * Depolama kapalı/dolu olsa bile oyun asla çökmez — sessizce bellek içi çalışır.
 */
export class SaveManager {
  private static memoryFallback: SaveData | null = null;

  static load(): SaveData {
    if (this.memoryFallback) return this.memoryFallback;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(EMPTY);
      const parsed: unknown = JSON.parse(raw);
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        Array.isArray((parsed as SaveData).completedMissions)
      ) {
        const data = parsed as SaveData;
        if (!Array.isArray(data.badges)) data.badges = [];
        return data;
      }
      return structuredClone(EMPTY);
    } catch {
      return structuredClone(EMPTY);
    }
  }

  static recordCompletion(missionId: string, grade: ReportGrade): void {
    const data = this.load();
    if (!data.completedMissions.includes(missionId)) {
      data.completedMissions.push(missionId);
    }
    const prev = data.bestGrade[missionId];
    if (prev === undefined || GRADE_RANK[grade] > GRADE_RANK[prev]) {
      data.bestGrade[missionId] = grade;
    }
    this.persist(data);
  }

  /** Yeni kazanılan rozetleri kaydeder; ilk kez kazanılanları döndürür. */
  static recordBadges(earned: BadgeId[]): BadgeId[] {
    const data = this.load();
    const fresh = earned.filter(b => !data.badges.includes(b));
    if (fresh.length > 0) {
      data.badges.push(...fresh);
      this.persist(data);
    }
    return fresh;
  }

  static reset(): void {
    this.memoryFallback = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* depolama yoksa silinecek bir şey de yok */
    }
  }

  private static persist(data: SaveData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.memoryFallback = null;
    } catch {
      this.memoryFallback = data;
    }
  }
}
