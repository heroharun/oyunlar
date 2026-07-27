import Phaser from 'phaser';
import { COLORS, SCENE_KEYS } from '../utils/constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.boot);
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.bg);
    this.scene.start(SCENE_KEYS.preload);
  }
}
