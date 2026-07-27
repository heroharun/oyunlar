import Phaser from 'phaser';
import { COLORS, FONTS } from '../utils/constants';

export type ChoiceState = 'idle' | 'selected' | 'correct' | 'wrong';

export interface ChoiceCardConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  body: string;
  /** Sağ üstte küçük etiket (saat, güç vb.). */
  tag?: string;
  onTap: () => void;
}

/** Seçilebilir bilgi kartı: çelişki, sinyal, uzman, karar sahnelerinde ortak. */
export class ChoiceCard extends Phaser.GameObjects.Container {
  private readonly frame: Phaser.GameObjects.Graphics;
  private readonly mark: Phaser.GameObjects.Text;
  private readonly cardW: number;
  private readonly cardH: number;
  private stateName: ChoiceState = 'idle';

  constructor(scene: Phaser.Scene, cfg: ChoiceCardConfig) {
    super(scene, cfg.x, cfg.y);
    this.cardW = cfg.width;
    this.cardH = cfg.height;

    this.frame = scene.add.graphics();
    this.add(this.frame);

    const left = -cfg.width / 2 + 16;
    this.add(
      scene.add.text(left, -cfg.height / 2 + 12, cfg.title, {
        fontFamily: FONTS.head,
        fontSize: '12px',
        color: COLORS.textDim,
        letterSpacing: 2
      })
    );
    if (cfg.tag) {
      this.add(
        scene.add
          .text(cfg.width / 2 - 16, -cfg.height / 2 + 12, cfg.tag, {
            fontFamily: FONTS.head,
            fontSize: '13px',
            fontStyle: 'bold',
            color: COLORS.text
          })
          .setOrigin(1, 0)
      );
    }
    this.add(
      scene.add.text(left, -cfg.height / 2 + 38, cfg.body, {
        fontFamily: FONTS.body,
        fontSize: '12.5px',
        color: COLORS.text,
        wordWrap: { width: cfg.width - 76 },
        lineSpacing: 5
      })
    );

    // Durum işareti: renkle birlikte metin/ikon (renk körü dostu, GDD §13.1)
    this.mark = scene.add
      .text(cfg.width / 2 - 26, cfg.height / 2 - 26, '', {
        fontFamily: FONTS.head,
        fontSize: '20px',
        fontStyle: 'bold',
        color: COLORS.okText
      })
      .setOrigin(0.5);
    this.add(this.mark);

    this.setSize(cfg.width, cfg.height);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-cfg.width / 2, -cfg.height / 2, cfg.width, cfg.height),
      Phaser.Geom.Rectangle.Contains
    );
    this.on(Phaser.Input.Events.POINTER_UP, () => cfg.onTap());

    this.paint();
    scene.add.existing(this);
  }

  setChoiceState(next: ChoiceState): void {
    this.stateName = next;
    this.paint();
    if (next === 'wrong') {
      this.scene.tweens.add({
        targets: this,
        x: { from: this.x - 8, to: this.x },
        ease: 'Bounce.easeOut',
        duration: 260
      });
    }
  }

  getChoiceState(): ChoiceState {
    return this.stateName;
  }

  private paint(): void {
    const g = this.frame;
    const w = this.cardW;
    const h = this.cardH;
    g.clear();
    const fill =
      this.stateName === 'correct'
        ? 0x14261c
        : this.stateName === 'wrong'
          ? 0x2b1616
          : this.stateName === 'selected'
            ? COLORS.panelLight
            : COLORS.panel;
    const line =
      this.stateName === 'correct'
        ? COLORS.ok
        : this.stateName === 'wrong'
          ? COLORS.accent
          : this.stateName === 'selected'
            ? 0x6c86a3
            : COLORS.line;
    g.fillStyle(fill, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    g.lineStyle(this.stateName === 'idle' ? 1.5 : 2.5, line, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
    this.mark.setText(
      this.stateName === 'correct'
        ? '✓'
        : this.stateName === 'wrong'
          ? '✗'
          : this.stateName === 'selected'
            ? '●'
            : ''
    );
    this.mark.setColor(
      this.stateName === 'wrong'
        ? COLORS.accentText
        : this.stateName === 'selected'
          ? '#9fb6cd'
          : COLORS.okText
    );
  }
}
