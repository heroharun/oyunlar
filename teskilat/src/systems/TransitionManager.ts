import Phaser from 'phaser';
import type { SceneKey } from '../utils/constants';

const FADE_MS = 450;

/**
 * Sahneler arası parazitsiz karartma geçişi (GDD §10.4: sahne geçişi 400-700 ms).
 * Hızlı art arda dokunmada sahnenin iki kez açılmasını engeller.
 */
export class TransitionManager {
  private static busy = false;

  static fadeTo(from: Phaser.Scene, target: SceneKey, data?: object): void {
    if (this.busy) return;
    this.busy = true;
    from.cameras.main.fadeOut(FADE_MS, 11, 15, 20);
    from.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.busy = false;
      from.scene.start(target, data);
    });
  }

  static fadeIn(scene: Phaser.Scene): void {
    scene.cameras.main.fadeIn(FADE_MS, 11, 15, 20);
  }
}
