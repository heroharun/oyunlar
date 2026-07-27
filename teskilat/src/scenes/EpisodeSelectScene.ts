import Phaser from 'phaser';
import { PrimaryButton } from '../components/PrimaryButton';
import { TR } from '../data/dialogues/tr';
import { Audio } from '../systems/AudioManager';
import { Campaign } from '../systems/Campaign';
import { EPISODE_ORDER, episodeTitle, sceneForEpisode } from '../systems/episodeRouter';
import { SaveManager } from '../systems/SaveManager';
import { TransitionManager } from '../systems/TransitionManager';
import { COLORS, FONTS, GAME_HEIGHT, GAME_WIDTH, MIN_TOUCH, SCENE_KEYS } from '../utils/constants';

interface Act {
  label: string;
  ids: string[];
}

const ACTS: Act[] = [
  { label: 'P1', ids: ['mission-001'] },
  { label: 'P2', ids: ['ep09', 'ep10', 'ep11', 'ep12', 'ep13', 'ep14'] },
  { label: 'P3', ids: ['ep15', 'ep16', 'ep17', 'ep18', 'ep19', 'ep20', 'ep21', 'ep22'] },
  { label: 'P4', ids: ['ep23', 'ep24', 'ep25', 'ep26', 'ep27', 'ep28'] }
];

const ROW_H = 62;
const ROW_GAP = 8;
const ROWS_TOP = 196;

/** Operasyon Dosyaları: perde sekmeleri + zincir kilitli 21 bölüm. */
export class EpisodeSelectScene extends Phaser.Scene {
  private actIndex = 0;
  private rowObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super(SCENE_KEYS.episodes);
  }

  init(data: { act?: number }): void {
    if (typeof data.act === 'number') this.actIndex = data.act;
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    this.cameras.main.setBackgroundColor(COLORS.bg);
    TransitionManager.fadeIn(this);
    Audio.setState('idle');

    // Açılışta ilerlemenin olduğu perdeye git
    const save = SaveManager.load();
    if (this.registry.get('actChosen') !== true) {
      const lastDone = EPISODE_ORDER.filter(id => save.completedMissions.includes(id)).pop();
      const nextId = lastDone
        ? EPISODE_ORDER[EPISODE_ORDER.indexOf(lastDone) + 1] ?? lastDone
        : EPISODE_ORDER[0];
      this.actIndex = Math.max(0, ACTS.findIndex(a => a.ids.includes(nextId ?? '')));
    }

    this.add
      .text(cx, 46, TR.episodes.kicker, {
        fontFamily: FONTS.head,
        fontSize: '14px',
        color: COLORS.text,
        letterSpacing: 6
      })
      .setOrigin(0.5);

    // Sezon metrikleri — tek satır
    const c = Campaign.get();
    this.add
      .text(
        cx,
        76,
        `${TR.episodes.metrics.trust} %${c.trust}  ·  ${TR.episodes.metrics.stealth} %${c.stealth}  ·  ${TR.episodes.metrics.evidence} %${c.evidence}`,
        {
          fontFamily: FONTS.head,
          fontSize: '11px',
          color: COLORS.textDim,
          letterSpacing: 1
        }
      )
      .setOrigin(0.5);

    // Perde sekmeleri
    const tabW = 78;
    const tabY = 128;
    ACTS.forEach((_act, i) => {
      const x = cx + (i - 1.5) * (tabW + 10);
      const selected = i === this.actIndex;
      const g = this.add.graphics();
      g.fillStyle(selected ? COLORS.accent : COLORS.panel, 1);
      g.fillRoundedRect(x - tabW / 2, tabY - 22, tabW, 44, 8);
      if (!selected) {
        g.lineStyle(1.5, COLORS.line, 1);
        g.strokeRoundedRect(x - tabW / 2, tabY - 22, tabW, 44, 8);
      }
      this.add
        .text(x, tabY, `${TR.episodes.actLabel} ${i + 1}`, {
          fontFamily: FONTS.head,
          fontSize: '12px',
          fontStyle: 'bold',
          color: selected ? '#ffffff' : COLORS.textDim,
          letterSpacing: 1
        })
        .setOrigin(0.5);
      const zone = this.add.zone(x, tabY, tabW, Math.max(44, MIN_TOUCH)).setInteractive();
      zone.on(Phaser.Input.Events.POINTER_UP, () => {
        if (i === this.actIndex) return;
        Audio.play('tap');
        this.registry.set('actChosen', true);
        this.scene.restart({ act: i });
      });
    });

    this.add
      .text(cx, 166, TR.episodes.subtitle, {
        fontFamily: FONTS.body,
        fontSize: '11px',
        color: COLORS.textDim
      })
      .setOrigin(0.5);

    this.buildRows(save);

    new PrimaryButton(this, {
      x: cx - 78,
      y: GAME_HEIGHT - 52,
      width: 150,
      label: TR.episodes.back,
      emphasis: false,
      onTap: () => {
        this.registry.set('actChosen', false);
        TransitionManager.fadeTo(this, SCENE_KEYS.menu);
      }
    });
    new PrimaryButton(this, {
      x: cx + 78,
      y: GAME_HEIGHT - 52,
      width: 150,
      label: TR.episodes.campaignReset,
      emphasis: false,
      onTap: () => {
        Campaign.reset();
        this.toast(TR.episodes.campaignResetDone);
      }
    });
  }

  private isUnlocked(id: string, completed: string[]): boolean {
    const idx = EPISODE_ORDER.indexOf(id);
    if (idx <= 0) return true;
    const prev = EPISODE_ORDER[idx - 1];
    return prev !== undefined && completed.includes(prev);
  }

  private buildRows(save: ReturnType<typeof SaveManager.load>): void {
    const cx = GAME_WIDTH / 2;
    const act = ACTS[this.actIndex];
    if (!act) return;
    this.rowObjects.forEach(o => o.destroy());
    this.rowObjects = [];

    act.ids.forEach((id, i) => {
      const y = ROWS_TOP + i * (ROW_H + ROW_GAP) + ROW_H / 2;
      const unlocked = this.isUnlocked(id, save.completedMissions);
      const done = save.completedMissions.includes(id);
      const grade = save.bestGrade[id];
      const title = id === 'mission-001' ? TR.episodes.file1Title : episodeTitle(id);

      const g = this.add.graphics();
      g.fillStyle(unlocked ? COLORS.panel : 0x10151d, 1);
      g.fillRoundedRect(22, y - ROW_H / 2, GAME_WIDTH - 44, ROW_H, 10);
      g.lineStyle(1.5, unlocked ? COLORS.line : 0x1a222d, 1);
      g.strokeRoundedRect(22, y - ROW_H / 2, GAME_WIDTH - 44, ROW_H, 10);
      this.rowObjects.push(g);

      this.rowObjects.push(
        this.add
          .text(40, y - ROW_H / 2 + 12, title, {
            fontFamily: FONTS.head,
            fontSize: '12.5px',
            fontStyle: 'bold',
            color: unlocked ? COLORS.text : '#5a6c82',
            letterSpacing: 1
          })
          .setOrigin(0, 0)
      );

      const statusText = !unlocked
        ? '🔒 ' + TR.episodes.locked
        : done
          ? '✔ ' + (grade ? TR.result.grades[grade] : TR.episodes.done)
          : '▶ ' + TR.episodes.play;
      this.rowObjects.push(
        this.add
          .text(40, y + ROW_H / 2 - 12, statusText, {
            fontFamily: FONTS.head,
            fontSize: '9.5px',
            color: !unlocked ? '#5a6c82' : done ? COLORS.okText : COLORS.accentText,
            letterSpacing: 1
          })
          .setOrigin(0, 1)
      );

      const zone = this.add.zone(cx, y, GAME_WIDTH - 44, ROW_H).setInteractive();
      zone.on(Phaser.Input.Events.POINTER_UP, () => {
        if (!unlocked) {
          Audio.play('wrong');
          this.toast(TR.episodes.lockedToast);
          return;
        }
        Audio.play('confirm');
        const target = sceneForEpisode(id);
        TransitionManager.fadeTo(this, target.key, target.data);
      });
      this.rowObjects.push(zone);
    });

    // Klavye: 1-8 satır seç
    this.input.keyboard?.removeAllListeners('keydown');
    this.input.keyboard?.on('keydown', (ev: KeyboardEvent) => {
      const idx = Number.parseInt(ev.key, 10) - 1;
      const id = act.ids[idx];
      if (!id) return;
      if (this.isUnlocked(id, SaveManager.load().completedMissions)) {
        const target = sceneForEpisode(id);
        TransitionManager.fadeTo(this, target.key, target.data);
      }
    });
  }

  private toast(message: string): void {
    const t = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 96, message, {
        fontFamily: FONTS.body,
        fontSize: '12px',
        color: COLORS.warnText
      })
      .setOrigin(0.5)
      .setDepth(20);
    this.tweens.add({ targets: t, alpha: 0, delay: 1300, duration: 500, onComplete: () => t.destroy() });
  }
}
