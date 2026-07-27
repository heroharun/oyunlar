import { EP09 } from '../data/episodes/ep09';
import { EP11 } from '../data/episodes/ep11';
import { EP22 } from '../data/episodes/ep22';
import { GENERIC_EPISODES } from '../data/episodes/defs';
import { SCENE_KEYS, type SceneKey } from '../utils/constants';

/** Sezonun bölüm sırası (Genişletme GDD §1). */
export const EPISODE_ORDER: string[] = [
  'mission-001',
  'ep09',
  'ep10',
  'ep11',
  'ep12',
  'ep13',
  'ep14',
  'ep15',
  'ep16',
  'ep17',
  'ep18',
  'ep19',
  'ep20',
  'ep21',
  'ep22',
  'ep23',
  'ep24',
  'ep25',
  'ep26',
  'ep27',
  'ep28'
];

const CUSTOM_SCENES: Record<string, SceneKey> = {
  'mission-001': SCENE_KEYS.briefing,
  ep09: SCENE_KEYS.ep09,
  ep11: SCENE_KEYS.ep11,
  ep22: SCENE_KEYS.ep22
};

export interface EpisodeTarget {
  key: SceneKey;
  data?: object;
}

export function sceneForEpisode(id: string): EpisodeTarget {
  const custom = CUSTOM_SCENES[id];
  if (custom) return { key: custom };
  return { key: SCENE_KEYS.generic, data: { episodeId: id } };
}

export function nextEpisodeId(id: string): string | undefined {
  const i = EPISODE_ORDER.indexOf(id);
  return i >= 0 ? EPISODE_ORDER[i + 1] : undefined;
}

/** Dosya listesi başlıkları (seçim ekranı için). */
export function episodeTitle(id: string): string {
  if (id === 'ep09') return EP09.title;
  if (id === 'ep11') return EP11.title;
  if (id === 'ep22') return EP22.title;
  return GENERIC_EPISODES[id]?.title ?? id;
}

export function episodeKicker(id: string): string {
  if (id === 'ep09') return EP09.kicker;
  if (id === 'ep11') return EP11.kicker;
  if (id === 'ep22') return EP22.kicker;
  return GENERIC_EPISODES[id]?.kicker ?? '';
}
