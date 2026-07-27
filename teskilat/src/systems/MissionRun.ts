import type { SpecialistId } from '../types/mission';

/** Bir görev koşusu boyunca sahneler arasında biriken durum. */
export interface RunState {
  mistakes: number;
  hints: number;
  /** Çelişki + sinyal aşamalarındaki hatalar (Keskin Analist rozeti için). */
  analysisMistakes: number;
  specialists: SpecialistId[];
  routeId: string | null;
  decisionId: string | null;
  startedAt: number;
}

let state: RunState = fresh();

function fresh(): RunState {
  return {
    mistakes: 0,
    hints: 0,
    analysisMistakes: 0,
    specialists: [],
    routeId: null,
    decisionId: null,
    startedAt: 0
  };
}

/** Görev koşusu durumu — brifingde sıfırlanır, sonuç ekranında okunur. */
export const MissionRun = {
  reset(now: number): void {
    state = fresh();
    state.startedAt = now;
  },
  get(): RunState {
    return state;
  },
  addMistake(isAnalysis = false): void {
    state.mistakes += 1;
    if (isAnalysis) state.analysisMistakes += 1;
  },
  addHint(): void {
    state.hints += 1;
  },
  setSpecialists(ids: SpecialistId[]): void {
    state.specialists = [...ids];
  },
  setRoute(id: string): void {
    state.routeId = id;
  },
  setDecision(id: string): void {
    state.decisionId = id;
  }
};
