import Phaser from 'phaser';
import { PrimaryButton } from '../components/PrimaryButton';
import { TR } from '../data/dialogues/tr';
import { MISSION_001 } from '../data/missions/mission-001';
import { Audio } from '../systems/AudioManager';
import { MissionRun } from '../systems/MissionRun';
import { TransitionManager } from '../systems/TransitionManager';
import { COLORS, FONTS, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../utils/constants';

export class BriefingScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.briefing);
  }

  create(): void {
    const m = MISSION_001;
    const cx = GAME_WIDTH / 2;
    this.cameras.main.setBackgroundColor(COLORS.bg);
    TransitionManager.fadeIn(this);
    MissionRun.reset(this.game.getTime());
    Audio.setState('investigation');

    this.add
      .text(cx, 76, TR.briefing.kicker, {
        fontFamily: FONTS.head,
        fontSize: '13px',
        color: COLORS.textDim,
        letterSpacing: 6
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 112, m.codename, {
        fontFamily: FONTS.head,
        fontSize: '21px',
        fontStyle: 'bold',
        color: COLORS.text,
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 60 }
      })
      .setOrigin(0.5);

    // Dosya damgası
    const stamp = this.add
      .text(GAME_WIDTH - 58, 158, TR.briefing.fileStamp, {
        fontFamily: FONTS.head,
        fontSize: '11px',
        color: COLORS.accentText,
        letterSpacing: 2
      })
      .setOrigin(0.5)
      .setAngle(-8);
    const sb = stamp.getBounds();
    const sg = this.add.graphics();
    sg.lineStyle(1.5, COLORS.accent, 0.9);
    sg.strokeRect(sb.x - 6, sb.y - 4, sb.width + 12, sb.height + 8);

    // Brifing paneli
    const panelW = GAME_WIDTH - 44;
    const panelH = 360;
    const panelY = 220;
    const g = this.add.graphics();
    g.fillStyle(COLORS.panel, 1);
    g.fillRoundedRect(cx - panelW / 2, panelY, panelW, panelH, 12);
    g.lineStyle(1.5, COLORS.line, 1);
    g.strokeRoundedRect(cx - panelW / 2, panelY, panelW, panelH, 12);

    const pad = 22;
    const left = cx - panelW / 2 + pad;
    this.add.text(left, panelY + pad, m.briefing.headline, {
      fontFamily: FONTS.body,
      fontSize: '16px',
      fontStyle: 'bold',
      color: COLORS.text,
      wordWrap: { width: panelW - pad * 2 },
      lineSpacing: 6
    });

    this.add.text(left, panelY + 110, m.briefing.description, {
      fontFamily: FONTS.body,
      fontSize: '13.5px',
      color: COLORS.textDim,
      wordWrap: { width: panelW - pad * 2 },
      lineSpacing: 7
    });

    this.add.text(left, panelY + 252, TR.briefing.objectiveLabel, {
      fontFamily: FONTS.head,
      fontSize: '11px',
      color: COLORS.accentText,
      letterSpacing: 3
    });
    this.add.text(left, panelY + 272, m.briefing.objective, {
      fontFamily: FONTS.body,
      fontSize: '14.5px',
      fontStyle: 'bold',
      color: COLORS.text,
      wordWrap: { width: panelW - pad * 2 }
    });

    this.add.text(
      left,
      panelY + panelH - 38,
      `${TR.briefing.durationLabel}: ${m.briefing.estimatedMinutes} ${TR.briefing.minutes}`,
      { fontFamily: FONTS.body, fontSize: '12px', color: COLORS.textDim }
    );

    const proceed = new PrimaryButton(this, {
      x: cx,
      y: GAME_HEIGHT - 150,
      width: 280,
      label: TR.briefing.proceed,
      onTap: () => TransitionManager.fadeTo(this, SCENE_KEYS.cameraPuzzle)
    });

    new PrimaryButton(this, {
      x: cx,
      y: GAME_HEIGHT - 82,
      width: 160,
      label: TR.briefing.back,
      emphasis: false,
      onTap: () => TransitionManager.fadeTo(this, SCENE_KEYS.menu)
    });

    this.input.keyboard?.on('keydown-ENTER', () => proceed.trigger());
  }
}
