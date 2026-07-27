/** Görev veri modeli (GDD §17). */

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

/** Çelişki tespiti: dört ifadeden tutarsız olanı bul (GDD §7.2). */
export interface Statement {
  id: string;
  source: string;
  text: string;
}

export interface ContradictionStage {
  kind: 'contradiction';
  instruction: string;
  statements: Statement[];
  inconsistentId: string;
  explanation: string;
  hints: string[];
}

/** Sinyal analizi: hareketli kaynağı bul, yanlış pozitifi ele (GDD §7.3). */
export interface SignalSource {
  id: string;
  label: string;
  reading: string;
  /** Yanlış seçimde gösterilecek açıklama. */
  feedback: string;
  /** Dalga çizimi için desen: her araç için farklı şekil (renk körü dostu). */
  pattern: 'flat' | 'moving' | 'spike';
}

export interface SignalStage {
  kind: 'signal';
  instruction: string;
  sources: SignalSource[];
  correctId: string;
  explanation: string;
  hints: string[];
}

/** Uzman görevlendirme (GDD §7.4). */
export type SpecialistId = 'analist' | 'teknik' | 'saha';

export interface Specialist {
  id: SpecialistId;
  name: string;
  role: string;
  strength: string;
}

export interface SpecialistStage {
  kind: 'specialist';
  instruction: string;
  pickCount: number;
  specialists: Specialist[];
}

/** Rota planlama: en kısa değil en düşük riskli yol (GDD §7.5). */
export interface RouteOption {
  id: string;
  label: string;
  detail: string;
  secrecyPenalty: number;
  civilianPenalty: number;
  /** Harita çizimi için ara nokta yüzdeleri (0-1 aralığında x,y çiftleri). */
  waypoints: [number, number][];
}

export interface RouteStage {
  kind: 'route';
  instruction: string;
  options: RouteOption[];
  bestId: string;
}

/** Kritik final kararı (GDD §7.6). */
export interface DecisionOption {
  id: string;
  label: string;
  detail: string;
  secrecyPenalty: number;
  civilianPenalty: number;
  /** Sonuç ekranındaki alternatif son metni. */
  ending: string;
}

export interface DecisionStage {
  kind: 'decision';
  instruction: string;
  radioLine: string;
  options: DecisionOption[];
  bestId: string;
}

export interface Mission {
  id: string;
  title: string;
  codename: string;
  briefing: Briefing;
  cameraPuzzle: CameraPuzzleStage;
  contradiction: ContradictionStage;
  signal: SignalStage;
  specialist: SpecialistStage;
  route: RouteStage;
  decision: DecisionStage;
}

export type ReportGrade = 'sessiz' | 'kontrollu' | 'riskli' | 'desifre';

export type BadgeId =
  | 'sessiz-operator'
  | 'keskin-analist'
  | 'sifir-sivil-risk'
  | 'tek-seferde-cozum'
  | 'golge-protokol';
