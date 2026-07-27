import Phaser from 'phaser';
import { createGameConfig } from './app/config';

declare global {
  interface Window {
    /** QA/otomasyon erişimi — kişisel veri içermez, yalnızca oyun örneği. */
    __game?: Phaser.Game;
  }
}

window.__game = new Phaser.Game(createGameConfig());
