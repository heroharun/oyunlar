/** Görev veri modeli (GDD §17'nin Sprint 1 alt kümesi). */

export interface Briefing {
  headline: string;
  description: string;
  objective: string;
  estimatedMinutes: number;
}

/** Tek bir kamera görüntüsü kartı. */
export interface CameraCard {
  id: string;
  camera: string;
  time: string;
  note: string;
  /** Doğru kronolojik sıra (0 tabanlı). */
  order: number;
}

export interface CameraPuzzleStage {
  kind: 'camera-puzzle';
  instruction: string;
  cards: CameraCard[];
  hints: string[];
}

export interface Mission {
  id: string;
  title: string;
  codename: string;
  briefing: Briefing;
  cameraPuzzle: CameraPuzzleStage;
}

/** Bulmaca sonunda Result sahnesine taşınan performans özeti. */
export interface PuzzleReport {
  missionId: string;
  mistakes: number;
  hintsUsed: number;
  elapsedSeconds: number;
}

export type ReportGrade = 'sessiz' | 'kontrollu' | 'riskli';
