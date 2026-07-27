import Phaser from 'phaser';
import { COLORS, FONTS, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../utils/constants';

/**
 * Sprint 1'de harici asset yok; tüm görseller kodla çizilir.
 * Sahne, ileride ses/görsel eklendiğinde gerçek yükleme çubuğuna dönüşecek iskelettir.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.preload);
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.bg);
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '···', {
        fontFamily: FONTS.head,
        fontSize: '28px',
        color: COLORS.textDim
      })
      .setOrigin(0.5);
    this.time.delayedCall(120, () => this.scene.start(SCENE_KEYS.menu));
  }
}
