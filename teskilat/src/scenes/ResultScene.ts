import Phaser from 'phaser';
import { PrimaryButton } from '../components/PrimaryButton';
import { TR } from '../data/dialogues/tr';
import { SaveManager } from '../systems/SaveManager';
import { TransitionManager } from '../systems/TransitionManager';
import type { PuzzleReport, ReportGrade } from '../types/mission';
import { COLORS, FONTS, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../utils/constants';

interface Metrics {
  secrecy: number;
  accuracy: number;
  civilian: number;
}

export class ResultScene extends Phaser.Scene {
  private report: PuzzleReport = {
    missionId: 'mission-001',
    mistakes: 0,
    hintsUsed: 0,
    elapsedSeconds: 0
  };

  constructor() {
    super(SCENE_KEYS.result);
  }

  init(data: Partial<PuzzleReport>): void {
    this.report = {
      missionId: data.missionId ?? 'mission-001',
      mistakes: data.mistakes ?? 0,
      hintsUsed: data.hintsUsed ?? 0,
      elapsedSeconds: data.elapsedSeconds ?? 0
    };
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    this.cameras.main.setBackgroundColor(COLORS.bg);
    TransitionManager.fadeIn(this);

    const grade = this.computeGrade();
    const metrics = this.computeMetrics();
    SaveManager.recordCompletion(this.report.missionId, grade);

    this.add
      .text(cx, 70, TR.result.kicker, {
        fontFamily: FONTS.head,
        fontSize: '13px',
        color: COLORS.textDim,
        letterSpacing: 6
      })
      .setOrigin(0.5);

    // Sonuç damgası
    const stamp = this.add
      .text(cx, 140, TR.result.grades[grade], {
        fontFamily: FONTS.head,
        fontSize: '24px',
        fontStyle: 'bold',
        color: grade === 'riskli' ? COLORS.warnText : COLORS.okText,
        letterSpacing: 3
      })
      .setOrigin(0.5)
      .setAngle(-4)
      .setScale(1.6)
      .setAlpha(0);
    const sb = stamp.getBounds();
    const frame = this.add.graphics().setAlpha(0);
    frame.lineStyle(2, grade === 'riskli' ? 0xe0a83e : COLORS.ok, 1);
    frame.strokeRect(cx - 150, 114, 300, 52);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 450, ease: 'Back.easeOut' });
    this.tweens.add({ targets: frame, alpha: 0.9, delay: 250, duration: 300 });
    void sb;

    this.add
      .text(cx, 196, TR.result.gradeDesc[grade], {
        fontFamily: FONTS.body,
        fontSize: '13px',
        color: COLORS.textDim,
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 70 }
      })
      .setOrigin(0.5);

    this.drawMetric(TR.result.metrics.secrecy, metrics.secrecy, 264);
    this.drawMetric(TR.result.metrics.accuracy, metrics.accuracy, 322);
    this.drawMetric(TR.result.metrics.civilian, metrics.civilian, 380);

    const statsY = 448;
    const stats = [
      `${TR.result.statsMistakes}: ${this.report.mistakes}`,
      `${TR.result.statsHints}: ${this.report.hintsUsed}`,
      `${TR.result.statsTime}: ${this.report.elapsedSeconds} ${TR.result.seconds}`
    ].join(' · ');
    this.add
      .text(cx, statsY, stats, {
        fontFamily: FONTS.body,
        fontSize: '11px',
        color: COLORS.textDim,
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 48 }
      })
      .setOrigin(0.5);

    // Merak döngüsü: sonraki dosyaya geçiş cümlesi (GDD §9.1)
    this.add
      .text(cx, 520, TR.result.nextTeaser, {
        fontFamily: FONTS.body,
        fontSize: '13px',
        color: COLORS.text,
        fontStyle: 'italic',
        align: 'center',
        lineSpacing: 6
      })
      .setOrigin(0.5)
      .setAlpha(0.9);

    const replay = new PrimaryButton(this, {
      x: cx,
      y: GAME_HEIGHT - 170,
      width: 260,
      label: TR.result.replay,
      onTap: () => TransitionManager.fadeTo(this, SCENE_KEYS.briefing)
    });

    new PrimaryButton(this, {
      x: cx,
      y: GAME_HEIGHT - 98,
      width: 260,
      label: TR.result.menu,
      emphasis: false,
      onTap: () => TransitionManager.fadeTo(this, SCENE_KEYS.menu)
    });

    this.input.keyboard?.on('keydown-ENTER', () => replay.trigger());
  }

  /** Hata/ipucu sayısına göre rapor derecesi (GDD §8.2). */
  private computeGrade(): ReportGrade {
    const { mistakes, hintsUsed } = this.report;
    if (mistakes === 0 && hintsUsed === 0) return 'sessiz';
    if (mistakes <= 2) return 'kontrollu';
    return 'riskli';
  }

  private computeMetrics(): Metrics {
    const { mistakes, hintsUsed } = this.report;
    return {
      secrecy: Phaser.Math.Clamp(100 - mistakes * 18 - hintsUsed * 8, 30, 100),
      accuracy: Phaser.Math.Clamp(100 - mistakes * 12, 40, 100),
      civilian: 100 // Bu dilimde sivil risk oluşturan karar yok.
    };
  }

  private drawMetric(label: string, value: number, y: number): void {
    const left = 40;
    const barW = GAME_WIDTH - 80;
    this.add.text(left, y - 20, label, {
      fontFamily: FONTS.head,
      fontSize: '11px',
      color: COLORS.textDim,
      letterSpacing: 3
    });
    this.add
      .text(left + barW, y - 20, `%${value}`, {
        fontFamily: FONTS.head,
        fontSize: '12px',
        fontStyle: 'bold',
        color: COLORS.text
      })
      .setOrigin(1, 0);
    const g = this.add.graphics();
    g.fillStyle(COLORS.panelLight, 1);
    g.fillRoundedRect(left, y, barW, 10, 5);
    const fillColor = value >= 80 ? COLORS.ok : value >= 55 ? 0xe0a83e : COLORS.accent;
    const target = { w: 0 };
    this.tweens.add({
      targets: target,
      w: (barW * value) / 100,
      duration: 700,
      ease: 'Cubic.easeOut',
      onUpdate: () => {
        g.clear();
        g.fillStyle(COLORS.panelLight, 1);
        g.fillRoundedRect(left, y, barW, 10, 5);
        g.fillStyle(fillColor, 1);
        g.fillRoundedRect(left, y, Math.max(target.w, 8), 10, 5);
      }
    });
  }
}
