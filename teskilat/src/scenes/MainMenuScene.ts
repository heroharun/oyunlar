import Phaser from 'phaser';
import { PrimaryButton } from '../components/PrimaryButton';
import { TR } from '../data/dialogues/tr';
import { Audio } from '../systems/AudioManager';
import { SaveManager } from '../systems/SaveManager';
import { TransitionManager } from '../systems/TransitionManager';
import { COLORS, FONTS, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../utils/constants';

export class MainMenuScene extends Phaser.Scene {
  private panel?: Phaser.GameObjects.Container;
  private startButton?: PrimaryButton;

  constructor() {
    super(SCENE_KEYS.menu);
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    this.cameras.main.setBackgroundColor(COLORS.bg);
    TransitionManager.fadeIn(this);
    Audio.setState('idle');
    // Mobil autoplay kısıtı: ilk kullanıcı etkileşiminde sesi başlat (GDD §20)
    this.input.once(Phaser.Input.Events.POINTER_DOWN, () => Audio.unlock());
    this.input.keyboard?.once('keydown', () => Audio.unlock());
    this.drawScanlines();

    this.add
      .text(cx, 168, TR.menu.kicker, {
        fontFamily: FONTS.head,
        fontSize: '20px',
        color: COLORS.textDim,
        letterSpacing: 10
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 222, TR.menu.title, {
        fontFamily: FONTS.head,
        fontSize: '38px',
        fontStyle: 'bold',
        color: COLORS.text,
        letterSpacing: 4
      })
      .setOrigin(0.5);

    const rule = this.add.graphics();
    rule.lineStyle(2, COLORS.accent, 1);
    rule.lineBetween(cx - 90, 260, cx + 90, 260);

    this.add
      .text(cx, 300, TR.menu.slogan, {
        fontFamily: FONTS.body,
        fontSize: '14px',
        color: COLORS.textDim,
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 80 }
      })
      .setOrigin(0.5);

    this.startButton = new PrimaryButton(this, {
      x: cx,
      y: 430,
      width: 260,
      label: TR.menu.start,
      onTap: () => {
        Audio.unlock();
        Audio.play('confirm');
        TransitionManager.fadeTo(this, SCENE_KEYS.briefing);
      }
    });

    new PrimaryButton(this, {
      x: cx,
      y: 505,
      width: 260,
      label: TR.menu.sound,
      emphasis: false,
      onTap: () => this.toggleSoundPanel()
    });

    new PrimaryButton(this, {
      x: cx,
      y: 580,
      width: 260,
      label: TR.menu.privacy,
      emphasis: false,
      onTap: () => this.togglePrivacy()
    });

    new PrimaryButton(this, {
      x: cx,
      y: 655,
      width: 260,
      label: TR.menu.resetProgress,
      emphasis: false,
      onTap: () => {
        SaveManager.reset();
        this.toast(TR.menu.resetDone);
      }
    });

    this.add
      .text(cx, GAME_HEIGHT - 44, TR.menu.keyboardHint, {
        fontFamily: FONTS.body,
        fontSize: '11px',
        color: COLORS.textDim
      })
      .setOrigin(0.5)
      .setAlpha(0.7);

    this.input.keyboard?.on('keydown-ENTER', () => this.startButton?.trigger());
  }

  private closePanel(): boolean {
    if (this.panel) {
      this.panel.destroy();
      this.panel = undefined;
      return true;
    }
    return false;
  }

  private buildPanel(h: number, title: string): Phaser.GameObjects.Container {
    const cx = GAME_WIDTH / 2;
    const panel = this.add.container(cx, GAME_HEIGHT / 2).setDepth(10);
    const w = GAME_WIDTH - 48;
    const g = this.add.graphics();
    g.fillStyle(COLORS.panel, 0.98);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    g.lineStyle(1.5, COLORS.line, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    panel.add(g);
    panel.add(
      this.add
        .text(0, -h / 2 + 34, title, {
          fontFamily: FONTS.head,
          fontSize: '16px',
          color: COLORS.text,
          letterSpacing: 4
        })
        .setOrigin(0.5)
    );
    const close = new PrimaryButton(this, {
      x: 0,
      y: h / 2 - 44,
      width: 150,
      label: TR.menu.close,
      emphasis: false,
      onTap: () => this.closePanel()
    });
    panel.add(close);
    return panel;
  }

  /** Ses ayarları: müzik/efekt aç-kapat, cihazda saklanır (GDD §11.6, §13). */
  private toggleSoundPanel(): void {
    if (this.closePanel()) return;
    Audio.unlock();
    const panel = this.buildPanel(280, TR.menu.sound);

    const stateLabel = (on: boolean): string => (on ? TR.menu.on : TR.menu.off);
    const musicBtn = new PrimaryButton(this, {
      x: 0,
      y: -34,
      width: 250,
      label: `${TR.menu.musicLabel}: ${stateLabel(Audio.musicEnabled)}`,
      emphasis: false,
      onTap: () => {
        const on = Audio.toggleMusic();
        musicBtn.destroy();
        this.closePanel();
        this.toggleSoundPanel();
        this.toast(`${TR.menu.musicLabel}: ${stateLabel(on)}`);
      }
    });
    panel.add(musicBtn);

    const sfxBtn = new PrimaryButton(this, {
      x: 0,
      y: 36,
      width: 250,
      label: `${TR.menu.sfxLabel}: ${stateLabel(Audio.sfxEnabled)}`,
      emphasis: false,
      onTap: () => {
        const on = Audio.toggleSfx();
        sfxBtn.destroy();
        this.closePanel();
        this.toggleSoundPanel();
        this.toast(`${TR.menu.sfxLabel}: ${stateLabel(on)}`);
      }
    });
    panel.add(sfxBtn);
    this.panel = panel;
  }

  private togglePrivacy(): void {
    if (this.closePanel()) return;
    const panel = this.buildPanel(300, TR.menu.privacy);
    panel.add(
      this.add
        .text(0, -14, TR.menu.privacyText, {
          fontFamily: FONTS.body,
          fontSize: '13px',
          color: COLORS.textDim,
          align: 'center',
          lineSpacing: 7
        })
        .setOrigin(0.5)
    );
    this.panel = panel;
  }

  private toast(message: string): void {
    const t = this.add
      .text(GAME_WIDTH / 2, 720, message, {
        fontFamily: FONTS.body,
        fontSize: '13px',
        color: COLORS.okText
      })
      .setOrigin(0.5)
      .setDepth(20);
    this.tweens.add({ targets: t, alpha: 0, delay: 1400, duration: 500, onComplete: () => t.destroy() });
  }

  /** Hafif tarama çizgisi dokusu (GDD §10.1). */
  private drawScanlines(): void {
    const g = this.add.graphics().setAlpha(0.05);
    g.lineStyle(1, 0xffffff, 1);
    for (let y = 0; y < GAME_HEIGHT; y += 4) {
      g.lineBetween(0, y, GAME_WIDTH, y);
    }
  }
}
