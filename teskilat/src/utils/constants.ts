/** Tasarım çözünürlüğü: mobil dikey (GDD §21). */
export const GAME_WIDTH = 390;
export const GAME_HEIGHT = 844;

/** Operasyon masası renk paleti (GDD §10). */
export const COLORS = {
  bg: 0x0b0f14,
  panel: 0x141c26,
  panelLight: 0x1d2836,
  line: 0x2c3b4e,
  text: '#dfe8f2',
  textDim: '#8ba0b6',
  accent: 0xc22f2f,
  accentText: '#e5484d',
  ok: 0x3f9d63,
  okText: '#5fc98a',
  warnText: '#e0a83e'
} as const;

export const FONTS = {
  head: 'Menlo, Consolas, "Courier New", monospace',
  body: 'Menlo, Consolas, "Courier New", monospace'
} as const;

/** Dokunmatik hedef alt sınırı (GDD kural: en az 44px). */
export const MIN_TOUCH = 44;

export const SCENE_KEYS = {
  boot: 'BootScene',
  preload: 'PreloadScene',
  menu: 'MainMenuScene',
  briefing: 'BriefingScene',
  cameraPuzzle: 'CameraPuzzleScene',
  result: 'ResultScene'
} as const;

export type SceneKey = (typeof SCENE_KEYS)[keyof typeof SCENE_KEYS];
