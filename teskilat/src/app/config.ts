import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { BriefingScene } from '../scenes/BriefingScene';
import { CameraPuzzleScene } from '../scenes/CameraPuzzleScene';
import { ContradictionScene } from '../scenes/ContradictionScene';
import { DecisionScene } from '../scenes/DecisionScene';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { ResultScene } from '../scenes/ResultScene';
import { RouteScene } from '../scenes/RouteScene';
import { SignalScene } from '../scenes/SignalScene';
import { SpecialistScene } from '../scenes/SpecialistScene';
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from '../utils/constants';

/** Mobil dikey, FIT ölçekli responsive canvas (GDD §21). */
export function createGameConfig(): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: 'oyun',
    backgroundColor: COLORS.bg,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT
    },
    render: {
      antialias: true,
      roundPixels: false
    },
    scene: [
      BootScene,
      PreloadScene,
      MainMenuScene,
      BriefingScene,
      CameraPuzzleScene,
      ContradictionScene,
      SignalScene,
      SpecialistScene,
      RouteScene,
      DecisionScene,
      ResultScene
    ]
  };
}
