import Phaser from 'phaser';
import { PrimaryButton } from '../components/PrimaryButton';
import { TR } from '../data/dialogues/tr';
import { MISSION_001 } from '../data/missions/mission-001';
import { Audio } from '../systems/AudioManager';
import { MissionRun } from '../systems/MissionRun';
import { SaveManager } from '../systems/SaveManager';
import { TransitionManager } from '../systems/TransitionManager';
import type { BadgeId, ReportGrade } from '../types/mission';
import { COLORS, FONTS, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../utils/constants';

interface Metrics {
  secrecy: number;
  accuracy: number;
  civilian: number;
}

/** Operasyon raporu: metrikler, derece damgası, alternatif son, rozetler (GDD §8). */
export class ResultScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.result);
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    this.cameras.main.setBackgroundColor(COLORS.bg);
    TransitionManager.fadeIn(this);

    const run = MissionRun.get();
    const metrics = this.computeMetrics();
    const grade = this.computeGrade(metrics);
    const earned = this.computeBadges(grade, metrics);
    const newBadges = SaveManager.recordBadges(earned);
    SaveManager.recordCompletion(MISSION_001.id, grade);
    Audio.setState(grade === 'desifre' ? 'failure' : 'success');
    this.time.delayedCall(400, () => Audio.play('stamp'));
    if (newBadges.length > 0) this.time.delayedCall(1200, () => Audio.play('badge'));

    this.add
      .text(cx, 58, TR.result.kicker, {
        fontFamily: FONTS.head,
        fontSize: '13px',
        color: COLORS.textDim,
        letterSpacing: 6
      })
      .setOrigin(0.5);

    // Sonuç damgası
    const good = grade === 'sessiz' || grade === 'kontrollu';
    const stampColor = good ? COLORS.okText : grade === 'riskli' ? COLORS.warnText : COLORS.accentText;
    const frameColor = good ? COLORS.ok : grade === 'riskli' ? 0xe0a83e : COLORS.accent;
    const stamp = this.add
      .text(cx, 122, TR.result.grades[grade], {
        fontFamily: FONTS.head,
        fontSize: grade === 'desifre' ? '18px' : '23px',
        fontStyle: 'bold',
        color: stampColor,
        letterSpacing: 2
      })
      .setOrigin(0.5)
      .setAngle(-4)
      .setScale(1.6)
      .setAlpha(0);
    const frame = this.add.graphics().setAlpha(0);
    frame.lineStyle(2, frameColor, 1);
    frame.strokeRect(cx - 160, 98, 320, 48);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 450, ease: 'Back.easeOut' });
    this.tweens.add({ targets: frame, alpha: 0.9, delay: 250, duration: 300 });

    // Alternatif son metni: seçilen karara göre (GDD §27.5)
    const decision = MISSION_001.decision.options.find(o => o.id === run.decisionId);
    this.add
      .text(cx, 196, decision?.ending ?? '', {
        fontFamily: FONTS.body,
        fontSize: '13px',
        color: COLORS.text,
        fontStyle: 'italic',
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 64 },
        lineSpacing: 6
      })
      .setOrigin(0.5);

    this.drawMetric(TR.result.metrics.secrecy, metrics.secrecy, 292);
    this.drawMetric(TR.result.metrics.accuracy, metrics.accuracy, 350);
    this.drawMetric(TR.result.metrics.civilian, metrics.civilian, 408);

    const elapsed = Math.max(0, Math.round((this.game.getTime() - run.startedAt) / 1000));
    const stats = [
      `${TR.result.statsMistakes}: ${run.mistakes}`,
      `${TR.result.statsHints}: ${run.hints}`,
      `${TR.result.statsTime}: ${elapsed} ${TR.result.seconds}`
    ].join(' · ');
    this.add
      .text(cx, 462, stats, {
        fontFamily: FONTS.body,
        fontSize: '11px',
        color: COLORS.textDim,
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 48 }
      })
      .setOrigin(0.5);

    // Rozetler
    if (newBadges.length > 0) {
      const startY = 508;
      this.add
        .text(cx, startY, TR.result.badgeLabel, {
          fontFamily: FONTS.head,
          fontSize: '11px',
          color: COLORS.warnText,
          letterSpacing: 4
        })
        .setOrigin(0.5);
      newBadges.forEach((b, i) => {
        const t = this.add
          .text(cx, startY + 28 + i * 26, `★ ${TR.result.badges[b]}`, {
            fontFamily: FONTS.body,
            fontSize: '14px',
            fontStyle: 'bold',
            color: COLORS.text
          })
          .setOrigin(0.5)
          .setAlpha(0);
        this.tweens.add({ targets: t, alpha: 1, delay: 900 + i * 250, duration: 400 });
      });
    }

    const replay = new PrimaryButton(this, {
      x: cx,
      y: GAME_HEIGHT - 158,
      width: 260,
      label: TR.result.replay,
      onTap: () => TransitionManager.fadeTo(this, SCENE_KEYS.briefing)
    });

    new PrimaryButton(this, {
      x: cx,
      y: GAME_HEIGHT - 90,
      width: 260,
      label: TR.episodeResult.files,
      emphasis: false,
      onTap: () => TransitionManager.fadeTo(this, SCENE_KEYS.episodes)
    });

    this.input.keyboard?.on('keydown-ENTER', () => replay.trigger());
  }

  /** Tüm aşamaların birleşik metrikleri (GDD §8.1). */
  private computeMetrics(): Metrics {
    const run = MissionRun.get();
    const route = MISSION_001.route.options.find(o => o.id === run.routeId);
    const decision = MISSION_001.decision.options.find(o => o.id === run.decisionId);
    const hasTeknik = run.specialists.includes('teknik');
    const hasSaha = run.specialists.includes('saha');
    const hasAnalist = run.specialists.includes('analist');

    let secrecy = 100 - run.hints * 4 - (route?.secrecyPenalty ?? 0) - (decision?.secrecyPenalty ?? 0);
    // Sinyal bastırma teknik uzman olmadan gürültülü olur; takip saha olmadan risklidir.
    if (decision?.id === 'karar-bastir' && !hasTeknik) secrecy -= 18;
    if (decision?.id === 'karar-bastir' && !hasSaha) secrecy -= 10;

    let accuracy = 100 - run.mistakes * 8;
    if (hasAnalist) accuracy += 4;

    const civilian = 100 - (route?.civilianPenalty ?? 0) - (decision?.civilianPenalty ?? 0);

    return {
      secrecy: Phaser.Math.Clamp(secrecy, 20, 100),
      accuracy: Phaser.Math.Clamp(accuracy, 30, 100),
      civilian: Phaser.Math.Clamp(civilian, 40, 100)
    };
  }

  /** Derece: karar + toplam performans (GDD §8.2). */
  private computeGrade(m: Metrics): ReportGrade {
    const run = MissionRun.get();
    const avg = (m.secrecy + m.accuracy + m.civilian) / 3;
    if (run.decisionId === 'karar-durdur') {
      // Aracı durdurmak karşı tarafı alarma geçirir (GDD §6.4)
      return avg >= 75 ? 'riskli' : 'desifre';
    }
    if (avg >= 92) return 'sessiz';
    if (avg >= 74) return 'kontrollu';
    if (avg >= 55) return 'riskli';
    return 'desifre';
  }

  /** Rozetler (GDD §8.3). */
  private computeBadges(grade: ReportGrade, m: Metrics): BadgeId[] {
    const run = MissionRun.get();
    const earned: BadgeId[] = [];
    if (grade === 'sessiz') earned.push('sessiz-operator');
    if (run.analysisMistakes === 0) earned.push('keskin-analist');
    if (m.civilian === 100) earned.push('sifir-sivil-risk');
    if (run.mistakes === 0 && run.hints === 0) earned.push('tek-seferde-cozum');
    if (grade === 'sessiz' && run.decisionId === MISSION_001.decision.bestId) {
      earned.push('golge-protokol');
    }
    return earned;
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
