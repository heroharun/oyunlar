import Phaser from 'phaser';
import { PrimaryButton } from '../components/PrimaryButton';
import { TR } from '../data/dialogues/tr';
import { EP09 } from '../data/episodes/ep09';
import { EP11 } from '../data/episodes/ep11';
import { EP22 } from '../data/episodes/ep22';
import { Audio } from '../systems/AudioManager';
import { Campaign } from '../systems/Campaign';
import { SaveManager } from '../systems/SaveManager';
import { TransitionManager } from '../systems/TransitionManager';
import { COLORS, FONTS, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS, type SceneKey } from '../utils/constants';

interface FileEntry {
  id: string;
  title: string;
  detail: string;
  scene: SceneKey;
  /** Açılması için tamamlanmış olması gereken önceki dosya. */
  requires: string | null;
}

const ROW_H = 92;
const GAP = 12;
const TOP = 232;

/** Operasyon Dosyaları: bölüm seçimi ve sezon durumu (Genişletme GDD §1). */
export class EpisodeSelectScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.episodes);
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    this.cameras.main.setBackgroundColor(COLORS.bg);
    TransitionManager.fadeIn(this);
    Audio.setState('idle');

    this.add
      .text(cx, 52, TR.episodes.kicker, {
        fontFamily: FONTS.head,
        fontSize: '14px',
        color: COLORS.text,
        letterSpacing: 6
      })
      .setOrigin(0.5);
    this.add
      .text(cx, 80, TR.episodes.subtitle, {
        fontFamily: FONTS.body,
        fontSize: '12px',
        color: COLORS.textDim,
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 60 }
      })
      .setOrigin(0.5);

    // Sezon metrikleri
    const c = Campaign.get();
    this.drawMetric(TR.episodes.metrics.trust, c.trust, 120, false);
    this.drawMetric(TR.episodes.metrics.stealth, c.stealth, 156, true);
    this.drawMetric(TR.episodes.metrics.evidence, c.evidence, 192, false);

    const save = SaveManager.load();
    const entries: FileEntry[] = [
      {
        id: 'mission-001',
        title: TR.episodes.file1Title,
        detail: TR.episodes.file1Detail,
        scene: SCENE_KEYS.briefing,
        requires: null
      },
      {
        id: EP09.id,
        title: EP09.title,
        detail: EP09.kicker,
        scene: SCENE_KEYS.ep09,
        requires: 'mission-001'
      },
      {
        id: EP11.id,
        title: EP11.title,
        detail: EP11.kicker,
        scene: SCENE_KEYS.ep11,
        requires: EP09.id
      },
      {
        id: EP22.id,
        title: EP22.title,
        detail: EP22.kicker,
        scene: SCENE_KEYS.ep22,
        requires: EP11.id
      }
    ];

    entries.forEach((e, i) => {
      const y = TOP + i * (ROW_H + GAP) + ROW_H / 2;
      const unlocked = e.requires === null || save.completedMissions.includes(e.requires);
      const done = save.completedMissions.includes(e.id);
      const grade = save.bestGrade[e.id];

      const g = this.add.graphics();
      g.fillStyle(unlocked ? COLORS.panel : 0x10151d, 1);
      g.fillRoundedRect(22, y - ROW_H / 2, GAME_WIDTH - 44, ROW_H, 10);
      g.lineStyle(1.5, unlocked ? COLORS.line : 0x1a222d, 1);
      g.strokeRoundedRect(22, y - ROW_H / 2, GAME_WIDTH - 44, ROW_H, 10);

      this.add.text(40, y - ROW_H / 2 + 14, e.title, {
        fontFamily: FONTS.head,
        fontSize: '13px',
        fontStyle: 'bold',
        color: unlocked ? COLORS.text : '#54657a',
        letterSpacing: 1
      });
      this.add.text(40, y - ROW_H / 2 + 40, e.detail, {
        fontFamily: FONTS.body,
        fontSize: '11.5px',
        color: unlocked ? COLORS.textDim : '#3c4a5b',
        wordWrap: { width: GAME_WIDTH - 170 }
      });

      const statusText = !unlocked
        ? '🔒 ' + TR.episodes.locked
        : done
          ? '✔ ' + (grade ? TR.result.grades[grade] : TR.episodes.done)
          : '▶ ' + TR.episodes.play;
      this.add
        .text(GAME_WIDTH - 40, y - ROW_H / 2 + 16, statusText, {
          fontFamily: FONTS.head,
          fontSize: '10px',
          color: !unlocked ? '#54657a' : done ? COLORS.okText : COLORS.accentText,
          letterSpacing: 1,
          align: 'right'
        })
        .setOrigin(1, 0);

      const zone = this.add.zone(cx, y, GAME_WIDTH - 44, ROW_H).setInteractive();
      zone.on(Phaser.Input.Events.POINTER_UP, () => {
        if (!unlocked) {
          Audio.play('wrong');
          this.toast(TR.episodes.lockedToast);
          return;
        }
        Audio.play('confirm');
        TransitionManager.fadeTo(this, e.scene);
      });
    });

    new PrimaryButton(this, {
      x: cx - 78,
      y: GAME_HEIGHT - 66,
      width: 150,
      label: TR.episodes.back,
      emphasis: false,
      onTap: () => TransitionManager.fadeTo(this, SCENE_KEYS.menu)
    });
    new PrimaryButton(this, {
      x: cx + 78,
      y: GAME_HEIGHT - 66,
      width: 150,
      label: TR.episodes.campaignReset,
      emphasis: false,
      onTap: () => {
        Campaign.reset();
        this.toast(TR.episodes.campaignResetDone);
      }
    });

    // Klavye: 1-4 dosya seç
    this.input.keyboard?.on('keydown', (ev: KeyboardEvent) => {
      const idx = Number.parseInt(ev.key, 10) - 1;
      const e = entries[idx];
      if (!e) return;
      const unlocked = e.requires === null || save.completedMissions.includes(e.requires);
      if (unlocked) TransitionManager.fadeTo(this, e.scene);
    });
  }

  private drawMetric(label: string, value: number, y: number, inverted: boolean): void {
    const left = 44;
    const barW = GAME_WIDTH - 160;
    this.add.text(left, y - 8, label, {
      fontFamily: FONTS.head,
      fontSize: '10px',
      color: COLORS.textDim,
      letterSpacing: 2
    });
    const g = this.add.graphics();
    g.fillStyle(COLORS.panelLight, 1);
    g.fillRoundedRect(left, y + 8, barW, 8, 4);
    const bad = inverted ? value >= 60 : value < 40;
    const mid = inverted ? value >= 30 : value < 70;
    const col = bad ? COLORS.accent : mid ? 0xe0a83e : COLORS.ok;
    g.fillStyle(col, 1);
    g.fillRoundedRect(left, y + 8, Math.max(8, (barW * value) / 100), 8, 4);
    this.add
      .text(left + barW + 14, y + 4, `%${value}`, {
        fontFamily: FONTS.head,
        fontSize: '12px',
        fontStyle: 'bold',
        color: COLORS.text
      })
      .setOrigin(0, 0.5);
  }

  private toast(message: string): void {
    const t = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 118, message, {
        fontFamily: FONTS.body,
        fontSize: '13px',
        color: COLORS.warnText
      })
      .setOrigin(0.5)
      .setDepth(20);
    this.tweens.add({ targets: t, alpha: 0, delay: 1300, duration: 500, onComplete: () => t.destroy() });
  }
}
