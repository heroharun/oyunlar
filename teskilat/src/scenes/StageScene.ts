import Phaser from 'phaser';
import { PrimaryButton } from '../components/PrimaryButton';
import { TR } from '../data/dialogues/tr';
import { Audio } from '../systems/AudioManager';
import { MissionRun } from '../systems/MissionRun';
import { COLORS, FONTS, GAME_HEIGHT, GAME_WIDTH } from '../utils/constants';

const MAX_HINTS = 2;

/** Görev aşaması sahnelerinin ortak iskeleti: başlık, geri bildirim, ipucu. */
export abstract class StageScene extends Phaser.Scene {
  protected feedback?: Phaser.GameObjects.Text;
  private hintsUsedLocal = 0;
  private hintButton?: PrimaryButton;
  private hintPool: string[] = [];

  protected buildHeader(kicker: string, instruction: string): void {
    const cx = GAME_WIDTH / 2;
    this.cameras.main.setBackgroundColor(COLORS.bg);
    this.add
      .text(cx, 54, kicker, {
        fontFamily: FONTS.head,
        fontSize: '13px',
        color: COLORS.textDim,
        letterSpacing: 6
      })
      .setOrigin(0.5);
    this.add
      .text(cx, 94, instruction, {
        fontFamily: FONTS.body,
        fontSize: '14px',
        fontStyle: 'bold',
        color: COLORS.text,
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 56 },
        lineSpacing: 5
      })
      .setOrigin(0.5);
    this.feedback = this.add
      .text(cx, 140, '', {
        fontFamily: FONTS.body,
        fontSize: '13px',
        color: COLORS.warnText,
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 48 },
        lineSpacing: 4
      })
      .setOrigin(0.5);
  }

  protected showFeedback(message: string, color: string): void {
    this.feedback?.setText(message).setColor(color);
  }

  /** Kademeli ipucu düğmesi (GDD §12.4: en fazla iki, ücretsiz). */
  protected buildHintButton(hints: string[], x: number, y: number): void {
    this.hintPool = hints;
    this.hintsUsedLocal = 0;
    this.hintButton = new PrimaryButton(this, {
      x,
      y,
      width: 150,
      label: `${TR.common.hintButton} (${MAX_HINTS})`,
      emphasis: false,
      onTap: () => this.useHint(x, y)
    });
  }

  private useHint(x: number, y: number): void {
    if (this.hintsUsedLocal >= MAX_HINTS) {
      this.showFeedback(TR.common.hintExhausted, COLORS.warnText);
      return;
    }
    const hint =
      this.hintPool[this.hintsUsedLocal] ?? this.hintPool[this.hintPool.length - 1];
    this.hintsUsedLocal += 1;
    MissionRun.addHint();
    Audio.play('tap');
    this.hintButton?.destroy();
    this.hintButton = undefined;
    if (this.hintsUsedLocal < MAX_HINTS) {
      this.hintButton = new PrimaryButton(this, {
        x,
        y,
        width: 150,
        label: `${TR.common.hintButton} (${MAX_HINTS - this.hintsUsedLocal})`,
        emphasis: false,
        onTap: () => this.useHint(x, y)
      });
    }
    if (hint) this.showFeedback(hint, COLORS.text);
  }

  protected footerHintText(text: string): void {
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 32, text, {
        fontFamily: FONTS.body,
        fontSize: '11px',
        color: COLORS.textDim
      })
      .setOrigin(0.5)
      .setAlpha(0.7);
  }
}
