import type { ReportGrade } from '../types/mission';

interface SaveData {
  completedMissions: string[];
  bestGrade: Partial<Record<string, ReportGrade>>;
}

const STORAGE_KEY = 'teskilat_golge_save_v1';
const EMPTY: SaveData = { completedMissions: [], bestGrade: {} };

const GRADE_RANK: Record<ReportGrade, number> = { riskli: 0, kontrollu: 1, sessiz: 2 };

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
        return parsed as SaveData;
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

  static bestGradeFor(missionId: string): ReportGrade | undefined {
    return this.load().bestGrade[missionId];
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
