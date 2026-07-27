import Phaser from 'phaser';
import { PrimaryButton } from '../components/PrimaryButton';
import { TR } from '../data/dialogues/tr';
import { Audio } from '../systems/AudioManager';
import { Campaign, type SuspectId } from '../systems/Campaign';
import { SaveManager } from '../systems/SaveManager';
import { TransitionManager } from '../systems/TransitionManager';
import type { ReportGrade } from '../types/mission';
import { COLORS, FONTS, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS, type SceneKey } from '../utils/constants';

export interface EpisodeOutcome {
  episodeId: string;
  title: string;
  grade: ReportGrade;
  /** Sezon metriklerine işlenen değişimler; inverted=true ise artış KÖTÜdür. */
  deltas: { label: string; value: number; inverted?: boolean }[];
  cliffhanger: string;
  nextScene?: SceneKey;
}

/** Tüm yeni bölümlerin ortak sonuç ekranı (Genişletme GDD Core D). */
export class EpisodeResultScene extends Phaser.Scene {
  private outcome: EpisodeOutcome = {
    episodeId: 'ep09',
    title: '',
    grade: 'kontrollu',
    deltas: [],
    cliffhanger: ''
  };

  constructor() {
    super(SCENE_KEYS.episodeResult);
  }

  init(data: Partial<EpisodeOutcome>): void {
    // Önceki koşunun nextScene değeri sızmasın diye her seferinde sıfırdan kur.
    this.outcome = {
      episodeId: 'ep09',
      title: '',
      grade: 'kontrollu',
      deltas: [],
      cliffhanger: '',
      nextScene: undefined,
      ...data
    };
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    const o = this.outcome;
    this.cameras.main.setBackgroundColor(COLORS.bg);
    TransitionManager.fadeIn(this);
    SaveManager.recordCompletion(o.episodeId, o.grade);
    Audio.setState(o.grade === 'desifre' ? 'failure' : 'success');
    this.time.delayedCall(350, () => Audio.play('stamp'));

    this.add
      .text(cx, 52, TR.episodeResult.kicker, {
        fontFamily: FONTS.head,
        fontSize: '13px',
        color: COLORS.textDim,
        letterSpacing: 6
      })
      .setOrigin(0.5);
    this.add
      .text(cx, 82, o.title, {
        fontFamily: FONTS.head,
        fontSize: '13px',
        color: COLORS.text,
        letterSpacing: 2
      })
      .setOrigin(0.5);

    const good = o.grade === 'sessiz' || o.grade === 'kontrollu';
    const stampColor = good ? COLORS.okText : o.grade === 'riskli' ? COLORS.warnText : COLORS.accentText;
    const frameColor = good ? COLORS.ok : o.grade === 'riskli' ? 0xe0a83e : COLORS.accent;
    const stamp = this.add
      .text(cx, 138, TR.result.grades[o.grade], {
        fontFamily: FONTS.head,
        fontSize: o.grade === 'desifre' ? '18px' : '22px',
        fontStyle: 'bold',
        color: stampColor,
        letterSpacing: 2
      })
      .setOrigin(0.5)
      .setAngle(-4)
      .setScale(1.5)
      .setAlpha(0);
    const frame = this.add.graphics().setAlpha(0);
    frame.lineStyle(2, frameColor, 1);
    frame.strokeRect(cx - 160, 116, 320, 44);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 420, ease: 'Back.easeOut' });
    this.tweens.add({ targets: frame, alpha: 0.9, delay: 220, duration: 280 });

    // Sezon etkisi
    this.add
      .text(cx, 190, TR.episodeResult.campaignLabel, {
        fontFamily: FONTS.head,
        fontSize: '11px',
        color: COLORS.textDim,
        letterSpacing: 4
      })
      .setOrigin(0.5);
    o.deltas.forEach((d, i) => {
      const sign = d.value > 0 ? '▲ +' : d.value < 0 ? '▼ ' : '· ';
      const isGood = d.inverted ? d.value < 0 : d.value > 0;
      const col = d.value === 0 ? COLORS.textDim : isGood ? COLORS.okText : COLORS.accentText;
      this.add
        .text(cx, 216 + i * 24, `${sign}${d.value}  ${d.label}`, {
          fontFamily: FONTS.body,
          fontSize: '13px',
          fontStyle: 'bold',
          color: col
        })
        .setOrigin(0.5);
    });

    // Şüphe tablosu
    const tableY = 216 + o.deltas.length * 24 + 26;
    this.add
      .text(cx, tableY, TR.episodeResult.suspicionTitle, {
        fontFamily: FONTS.head,
        fontSize: '11px',
        color: COLORS.warnText,
        letterSpacing: 4
      })
      .setOrigin(0.5);
    const suspicion = Campaign.get().suspicion;
    const ids: SuspectId[] = ['amir', 'teknik', 'saha', 'kaynak'];
    ids.forEach((id, i) => {
      const y = tableY + 30 + i * 34;
      const left = 44;
      const barW = GAME_WIDTH - 150;
      this.add.text(left, y - 8, TR.episodeResult.suspects[id], {
        fontFamily: FONTS.body,
        fontSize: '11px',
        color: COLORS.textDim
      });
      const g = this.add.graphics();
      g.fillStyle(COLORS.panelLight, 1);
      g.fillRoundedRect(left, y + 8, barW, 8, 4);
      const v = suspicion[id];
      const col = v >= 60 ? COLORS.accent : v >= 30 ? 0xe0a83e : COLORS.line;
      g.fillStyle(col, 1);
      g.fillRoundedRect(left, y + 8, Math.max(8, (barW * v) / 100), 8, 4);
      this.add
        .text(left + barW + 14, y + 2, `%${v}`, {
          fontFamily: FONTS.head,
          fontSize: '12px',
          fontStyle: 'bold',
          color: COLORS.text
        })
        .setOrigin(0, 0.5);
    });

    // Cliffhanger (GDD §6: bölüm sonunda merak unsuru)
    this.add
      .text(cx, tableY + 30 + 4 * 34 + 34, o.cliffhanger, {
        fontFamily: FONTS.body,
        fontSize: '13px',
        fontStyle: 'italic',
        color: COLORS.text,
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 60 },
        lineSpacing: 6
      })
      .setOrigin(0.5);

    const nextBtn = new PrimaryButton(this, {
      x: cx,
      y: GAME_HEIGHT - 150,
      width: 260,
      label: o.nextScene ? TR.episodeResult.next : TR.episodeResult.files,
      onTap: () =>
        TransitionManager.fadeTo(this, o.nextScene ?? SCENE_KEYS.episodes)
    });
    new PrimaryButton(this, {
      x: cx,
      y: GAME_HEIGHT - 84,
      width: 260,
      label: o.nextScene ? TR.episodeResult.files : TR.result.menu,
      emphasis: false,
      onTap: () =>
        TransitionManager.fadeTo(this, o.nextScene ? SCENE_KEYS.episodes : SCENE_KEYS.menu)
    });
    this.input.keyboard?.on('keydown-ENTER', () => nextBtn.trigger());
  }
}
