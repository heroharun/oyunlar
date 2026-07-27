import Phaser from 'phaser';
import { COLORS, FONTS, MIN_TOUCH } from '../utils/constants';

export interface PrimaryButtonConfig {
  x: number;
  y: number;
  width: number;
  label: string;
  onTap: () => void;
  /** true: kırmızı vurgulu ana aksiyon; false: çerçeveli ikincil buton. */
  emphasis?: boolean;
}

const HEIGHT = 52; // MIN_TOUCH üstünde dokunmatik hedef

/** Dokunma + fare + klavye (scene tarafında Enter) ile tetiklenebilen buton. */
export class PrimaryButton extends Phaser.GameObjects.Container {
  private readonly bg: Phaser.GameObjects.Graphics;
  private readonly cfg: PrimaryButtonConfig;

  constructor(scene: Phaser.Scene, cfg: PrimaryButtonConfig) {
    super(scene, cfg.x, cfg.y);
    this.cfg = cfg;

    this.bg = scene.add.graphics();
    this.paint(false);
    this.add(this.bg);

    const label = scene.add
      .text(0, 0, cfg.label, {
        fontFamily: FONTS.head,
        fontSize: '17px',
        color: cfg.emphasis === false ? COLORS.textDim : COLORS.text,
        letterSpacing: 2
      })
      .setOrigin(0.5);
    this.add(label);

    const hitH = Math.max(HEIGHT, MIN_TOUCH);
    this.setSize(cfg.width, hitH);
    // Container hit testinde Phaser yerel noktaya displayOrigin ekler;
    // bu yüzden dikdörtgen (0,0) başlangıçlı tanımlanmalıdır.
    this.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, cfg.width, hitH),
      Phaser.Geom.Rectangle.Contains
    );
    this.on(Phaser.Input.Events.POINTER_DOWN, () => this.paint(true));
    this.on(Phaser.Input.Events.POINTER_OUT, () => this.paint(false));
    this.on(Phaser.Input.Events.POINTER_UP, () => {
      this.paint(false);
      cfg.onTap();
    });

    scene.add.existing(this);
  }

  trigger(): void {
    this.cfg.onTap();
  }

  private paint(pressed: boolean): void {
    const w = this.cfg.width;
    const emphasized = this.cfg.emphasis !== false;
    this.bg.clear();
    if (emphasized) {
      this.bg.fillStyle(pressed ? 0x9c2626 : COLORS.accent, 1);
      this.bg.fillRoundedRect(-w / 2, -HEIGHT / 2, w, HEIGHT, 8);
    } else {
      this.bg.fillStyle(pressed ? COLORS.panelLight : COLORS.panel, 1);
      this.bg.fillRoundedRect(-w / 2, -HEIGHT / 2, w, HEIGHT, 8);
      this.bg.lineStyle(1.5, COLORS.line, 1);
      this.bg.strokeRoundedRect(-w / 2, -HEIGHT / 2, w, HEIGHT, 8);
    }
  }
}
