import Phaser from 'phaser';
import { createGameConfig } from './app/config';

declare global {
  interface Window {
    /** QA/otomasyon erişimi — kişisel veri içermez, yalnızca oyun örneği. */
    __game?: Phaser.Game;
  }
}

window.__game = new Phaser.Game(createGameConfig());

/* PWA: çevrimdışı oynanabilirlik ve ana ekrana ekleme (GDD §23). */
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {
      /* SW kaydolamazsa oyun normal çalışmaya devam eder */
    });
  });
}
