import Phaser from 'phaser';
import { PrimaryButton } from '../components/PrimaryButton';
import { TR } from '../data/dialogues/tr';
import { MISSION_001 } from '../data/missions/mission-001';
import { TransitionManager } from '../systems/TransitionManager';
import type { CameraCard, PuzzleReport } from '../types/mission';
import { COLORS, FONTS, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../utils/constants';

interface CardView {
  card: CameraCard;
  container: Phaser.GameObjects.Container;
  frame: Phaser.GameObjects.Graphics;
  badge: Phaser.GameObjects.Text;
  placed: boolean;
}

const CARD_W = GAME_WIDTH - 44;
const CARD_H = 108;
const CARD_GAP = 14;
const CARDS_TOP = 210;
const MAX_HINTS = 2;

/** Kamera kartlarını kronolojik sıraya dokunarak dizme bulmacası (GDD §7.1). */
export class CameraPuzzleScene extends Phaser.Scene {
  private views: CardView[] = [];
  private nextOrder = 0;
  private mistakes = 0;
  private hintsUsed = 0;
  private startedAt = 0;
  private finished = false;
  private feedback?: Phaser.GameObjects.Text;
  private progressText?: Phaser.GameObjects.Text;
  private hintButton?: PrimaryButton;

  constructor() {
    super(SCENE_KEYS.cameraPuzzle);
  }

  create(): void {
    // Sahne yeniden başlatılabilir: tüm durumu sıfırla.
    this.views = [];
    this.nextOrder = 0;
    this.mistakes = 0;
    this.hintsUsed = 0;
    this.finished = false;
    this.startedAt = this.time.now;

    const stage = MISSION_001.cameraPuzzle;
    const cx = GAME_WIDTH / 2;
    this.cameras.main.setBackgroundColor(COLORS.bg);
    TransitionManager.fadeIn(this);

    this.add
      .text(cx, 58, TR.cameraPuzzle.kicker, {
        fontFamily: FONTS.head,
        fontSize: '13px',
        color: COLORS.textDim,
        letterSpacing: 6
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 98, stage.instruction, {
        fontFamily: FONTS.body,
        fontSize: '14px',
        fontStyle: 'bold',
        color: COLORS.text,
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 56 },
        lineSpacing: 5
      })
      .setOrigin(0.5);

    this.progressText = this.add
      .text(cx, 146, '', {
        fontFamily: FONTS.head,
        fontSize: '12px',
        color: COLORS.textDim,
        letterSpacing: 2
      })
      .setOrigin(0.5);

    this.feedback = this.add
      .text(cx, 176, '', {
        fontFamily: FONTS.body,
        fontSize: '13px',
        color: COLORS.warnText,
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 48 }
      })
      .setOrigin(0.5);

    // Kartlar karışık dizilir; veri sırası değil görünen sıra karıştırılır.
    const shuffled = Phaser.Utils.Array.Shuffle([...stage.cards]);
    shuffled.forEach((card, i) => this.buildCard(card, i));

    this.hintButton = new PrimaryButton(this, {
      x: cx - 78,
      y: GAME_HEIGHT - 84,
      width: 150,
      label: `${TR.cameraPuzzle.hintButton} (${MAX_HINTS})`,
      emphasis: false,
      onTap: () => this.useHint()
    });

    new PrimaryButton(this, {
      x: cx + 78,
      y: GAME_HEIGHT - 84,
      width: 150,
      label: TR.cameraPuzzle.resetButton,
      emphasis: false,
      onTap: () => this.scene.restart()
    });

    this.add
      .text(cx, GAME_HEIGHT - 36, TR.cameraPuzzle.keyboardHint, {
        fontFamily: FONTS.body,
        fontSize: '11px',
        color: COLORS.textDim
      })
      .setOrigin(0.5)
      .setAlpha(0.7);

    // Klavye: 1-4 görünen sıradaki kartı seçer.
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
      this.add.text(left, -CARD_H / 2 + 14, card.camera, {
        fontFamily: FONTS.head,
        fontSize: '12px',
        color: COLORS.textDim,
        letterSpacing: 2
      })
    );
    container.add(
      this.add
        .text(CARD_W / 2 - 18, -CARD_H / 2 + 14, card.time, {
          fontFamily: FONTS.head,
          fontSize: '17px',
          fontStyle: 'bold',
          color: COLORS.text
        })
        .setOrigin(1, 0)
    );
    container.add(
      this.add.text(left, -CARD_H / 2 + 44, card.note, {
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
      this.feedback?.setText('');
      this.updateProgress();
      if (this.nextOrder === this.views.length) this.complete();
    } else {
      this.mistakes += 1;
      this.feedback?.setText(TR.cameraPuzzle.wrongPick).setColor(COLORS.warnText);
      this.tweens.add({
        targets: view.container,
        x: { from: GAME_WIDTH / 2 - 8, to: GAME_WIDTH / 2 },
        ease: 'Bounce.easeOut',
        duration: 260
      });
    }
  }

  private useHint(): void {
    if (this.finished) return;
    const stage = MISSION_001.cameraPuzzle;
    if (this.hintsUsed >= MAX_HINTS) {
      this.feedback?.setText(TR.cameraPuzzle.hintExhausted).setColor(COLORS.warnText);
      return;
    }
    const hint = stage.hints[this.hintsUsed] ?? stage.hints[stage.hints.length - 1];
    this.hintsUsed += 1;
    this.hintButton?.destroy();
    if (this.hintsUsed < MAX_HINTS) {
      this.hintButton = new PrimaryButton(this, {
        x: GAME_WIDTH / 2 - 78,
        y: GAME_HEIGHT - 84,
        width: 150,
        label: `${TR.cameraPuzzle.hintButton} (${MAX_HINTS - this.hintsUsed})`,
        emphasis: false,
        onTap: () => this.useHint()
      });
    }
    if (hint) this.feedback?.setText(hint).setColor(COLORS.text);
  }

  private complete(): void {
    this.finished = true;
    this.feedback?.setText(TR.cameraPuzzle.doneToast).setColor(COLORS.okText);
    const report: PuzzleReport = {
      missionId: MISSION_001.id,
      mistakes: this.mistakes,
      hintsUsed: this.hintsUsed,
      elapsedSeconds: Math.round((this.time.now - this.startedAt) / 1000)
    };
    this.time.delayedCall(900, () =>
      TransitionManager.fadeTo(this, SCENE_KEYS.result, report)
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
