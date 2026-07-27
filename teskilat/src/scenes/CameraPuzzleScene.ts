import Phaser from 'phaser';
import { PrimaryButton } from '../components/PrimaryButton';
import { TR } from '../data/dialogues/tr';
import { MISSION_001 } from '../data/missions/mission-001';
import { Audio } from '../systems/AudioManager';
import { MissionRun } from '../systems/MissionRun';
import { TransitionManager } from '../systems/TransitionManager';
import type { CameraCard } from '../types/mission';
import { COLORS, FONTS, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../utils/constants';
import { StageScene } from './StageScene';

interface CardView {
  card: CameraCard;
  container: Phaser.GameObjects.Container;
  frame: Phaser.GameObjects.Graphics;
  badge: Phaser.GameObjects.Text;
  placed: boolean;
}

const CARD_W = GAME_WIDTH - 44;
const CARD_H = 104;
const CARD_GAP = 13;
const CARDS_TOP = 196;

/** Kamera kartlarını kronolojik sıraya dokunarak dizme bulmacası (GDD §7.1). */
export class CameraPuzzleScene extends StageScene {
  private views: CardView[] = [];
  private nextOrder = 0;
  private finished = false;
  private progressText?: Phaser.GameObjects.Text;

  constructor() {
    super(SCENE_KEYS.cameraPuzzle);
  }

  create(): void {
    this.views = [];
    this.nextOrder = 0;
    this.finished = false;

    const stage = MISSION_001.cameraPuzzle;
    TransitionManager.fadeIn(this);
    Audio.setState('investigation');
    this.buildHeader(TR.cameraPuzzle.kicker, stage.instruction);

    this.progressText = this.add
      .text(GAME_WIDTH / 2, 168, '', {
        fontFamily: FONTS.head,
        fontSize: '12px',
        color: COLORS.textDim,
        letterSpacing: 2
      })
      .setOrigin(0.5);

    const shuffled = Phaser.Utils.Array.Shuffle([...stage.cards]);
    shuffled.forEach((card, i) => this.buildCard(card, i));

    this.buildHintButton(stage.hints, GAME_WIDTH / 2 - 78, GAME_HEIGHT - 84);
    new PrimaryButton(this, {
      x: GAME_WIDTH / 2 + 78,
      y: GAME_HEIGHT - 84,
      width: 150,
      label: TR.common.resetButton,
      emphasis: false,
      onTap: () => this.scene.restart()
    });

    this.footerHintText(TR.common.keyboardPick);
    this.input.keyboard?.on('keydown', (ev: KeyboardEvent) => {
      const idx = Number.parseInt(ev.key, 10) - 1;
      const view = this.views[idx];
      if (view) this.pick(view);
    });
    this.updateProgress();
  }

  private buildCard(card: CameraCard, visibleIndex: number): void {
    const cx = GAME_WIDTH / 2;
    const y = CARDS_TOP + visibleIndex * (CARD_H + CARD_GAP) + CARD_H / 2;
    const container = this.add.container(cx, y);

    const frame = this.add.graphics();
    this.paintFrame(frame, false);
    container.add(frame);

    const left = -CARD_W / 2 + 18;
    container.add(
      this.add.text(left, -CARD_H / 2 + 13, card.camera, {
        fontFamily: FONTS.head,
        fontSize: '12px',
        color: COLORS.textDim,
        letterSpacing: 2
      })
    );
    container.add(
      this.add
        .text(CARD_W / 2 - 18, -CARD_H / 2 + 13, card.time, {
          fontFamily: FONTS.head,
          fontSize: '17px',
          fontStyle: 'bold',
          color: COLORS.text
        })
        .setOrigin(1, 0)
    );
    container.add(
      this.add.text(left, -CARD_H / 2 + 42, card.note, {
        fontFamily: FONTS.body,
        fontSize: '12.5px',
        color: COLORS.text,
        wordWrap: { width: CARD_W - 96 },
        lineSpacing: 5
      })
    );

    const badge = this.add
      .text(CARD_W / 2 - 30, 16, '', {
        fontFamily: FONTS.head,
        fontSize: '22px',
        fontStyle: 'bold',
        color: COLORS.okText
      })
      .setOrigin(0.5);
    container.add(badge);

    container.setSize(CARD_W, CARD_H);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H),
      Phaser.Geom.Rectangle.Contains
    );

    const view: CardView = { card, container, frame, badge, placed: false };
    container.on(Phaser.Input.Events.POINTER_UP, () => this.pick(view));
    this.views.push(view);
  }

  private pick(view: CardView): void {
    if (this.finished || view.placed) return;

    if (view.card.order === this.nextOrder) {
      view.placed = true;
      this.nextOrder += 1;
      view.badge.setText(String(this.nextOrder));
      this.paintFrame(view.frame, true);
      view.container.disableInteractive();
      Audio.play('card');
      this.showFeedback('', COLORS.text);
      this.updateProgress();
      if (this.nextOrder === this.views.length) this.complete();
    } else {
      MissionRun.addMistake();
      Audio.play('wrong');
      this.showFeedback(TR.cameraPuzzle.wrongPick, COLORS.warnText);
      this.tweens.add({
        targets: view.container,
        x: { from: GAME_WIDTH / 2 - 8, to: GAME_WIDTH / 2 },
        ease: 'Bounce.easeOut',
        duration: 260
      });
    }
  }

  private complete(): void {
    this.finished = true;
    Audio.play('correct');
    this.showFeedback(TR.cameraPuzzle.doneToast, COLORS.okText);
    this.time.delayedCall(900, () =>
      TransitionManager.fadeTo(this, SCENE_KEYS.contradiction)
    );
  }

  private updateProgress(): void {
    this.progressText?.setText(
      `${TR.cameraPuzzle.progressLabel}: ${this.nextOrder}/${this.views.length || 4}`
    );
  }

  private paintFrame(g: Phaser.GameObjects.Graphics, placed: boolean): void {
    g.clear();
    g.fillStyle(placed ? 0x14261c : COLORS.panel, 1);
    g.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 10);
    g.lineStyle(1.5, placed ? COLORS.ok : COLORS.line, 1);
    g.strokeRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 10);
  }
}
