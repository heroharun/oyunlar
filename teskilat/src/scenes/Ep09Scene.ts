import Phaser from 'phaser';
import { ChoiceCard } from '../components/ChoiceCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { TR } from '../data/dialogues/tr';
import { EP09 } from '../data/episodes/ep09';
import { Audio } from '../systems/AudioManager';
import { Campaign } from '../systems/Campaign';
import { TransitionManager } from '../systems/TransitionManager';
import type { ReportGrade } from '../types/mission';
import { COLORS, FONTS, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../utils/constants';
import type { EpisodeOutcome } from './EpisodeResultScene';
import { StageScene } from './StageScene';

/** Bölüm 9 — Sahte Kimlik: ezber → sorgu → erişim noktası (Genişletme GDD B9). */
export class Ep09Scene extends StageScene {
  private suspicionLevel = 0;
  private meter?: Phaser.GameObjects.Graphics;
  private meterText?: Phaser.GameObjects.Text;
  private stageObjects: Phaser.GameObjects.GameObject[] = [];
  private questionIndex = 0;
  private wrongAnswers = 0;

  constructor() {
    super(SCENE_KEYS.ep09);
  }

  create(): void {
    this.suspicionLevel = 0;
    this.questionIndex = 0;
    this.wrongAnswers = 0;
    this.stageObjects = [];
    TransitionManager.fadeIn(this);
    Audio.setState('suspicion');
    this.buildHeader(EP09.title, EP09.briefing);
    this.buildMeter();
    this.phaseMemorize();
  }

  /* ── şüphe ölçer (Genişletme GDD Core C) ── */
  private buildMeter(): void {
    this.meterText = this.add
      .text(44, 176, '', {
        fontFamily: FONTS.head,
        fontSize: '10px',
        color: COLORS.textDim,
        letterSpacing: 2
      });
    this.meter = this.add.graphics();
    this.paintMeter();
  }

  private paintMeter(): void {
    const left = 44;
    const barW = GAME_WIDTH - 88;
    const v = this.suspicionLevel;
    this.meterText?.setText(`${TR.suspicionMeter}: %${v}`);
    const g = this.meter;
    if (!g) return;
    g.clear();
    g.fillStyle(COLORS.panelLight, 1);
    g.fillRoundedRect(left, 194, barW, 8, 4);
    const col = v >= 60 ? COLORS.accent : v >= 30 ? 0xe0a83e : COLORS.ok;
    g.fillStyle(col, 1);
    g.fillRoundedRect(left, 194, Math.max(8, (barW * v) / 100), 8, 4);
  }

  private raiseSuspicion(amount: number): void {
    this.suspicionLevel = Math.min(100, this.suspicionLevel + amount);
    this.paintMeter();
    Audio.play('wrong');
  }

  private clearStage(): void {
    this.stageObjects.forEach(o => o.destroy());
    this.stageObjects = [];
  }

  /* ── Aşama 1: kimliği ezberle ── */
  private phaseMemorize(): void {
    const cx = GAME_WIDTH / 2;
    this.showFeedback(EP09.memorizeHint, COLORS.textDim);

    const w = GAME_WIDTH - 60;
    const h = 240;
    const top = 236;
    const g = this.add.graphics();
    g.fillStyle(0x1a2433, 1);
    g.fillRoundedRect(cx - w / 2, top, w, h, 14);
    g.lineStyle(2, 0x3d5068, 1);
    g.strokeRoundedRect(cx - w / 2, top, w, h, 14);
    g.lineStyle(1.5, COLORS.accent, 0.8);
    g.strokeRoundedRect(cx - w / 2 + 12, top + 12, 64, 76, 6);
    this.stageObjects.push(g);

    const foto = this.add
      .text(cx - w / 2 + 44, top + 50, '👤', { fontSize: '34px' })
      .setOrigin(0.5);
    this.stageObjects.push(foto);

    EP09.identity.forEach((f, i) => {
      const y = top + 24 + i * 52;
      const label = this.add.text(cx - w / 2 + 96, y, f.label, {
        fontFamily: FONTS.head,
        fontSize: '10px',
        color: COLORS.textDim,
        letterSpacing: 2
      });
      const value = this.add.text(cx - w / 2 + 96, y + 16, f.value, {
        fontFamily: FONTS.head,
        fontSize: '17px',
        fontStyle: 'bold',
        color: COLORS.text
      });
      this.stageObjects.push(label, value);
    });

    const btn = new PrimaryButton(this, {
      x: cx,
      y: GAME_HEIGHT - 100,
      width: 240,
      label: EP09.memorizeDone,
      onTap: () => {
        Audio.play('confirm');
        this.clearStage();
        this.phaseQuestions();
      }
    });
    this.stageObjects.push(btn);
    this.input.keyboard?.once('keydown-ENTER', () => btn.trigger());
  }

  /* ── Aşama 2: güvenlik sorguları ── */
  private phaseQuestions(): void {
    this.showFeedback(EP09.guardIntro, COLORS.textDim);
    this.askQuestion();
  }

  private askQuestion(): void {
    this.clearStage();
    const q = EP09.questions[this.questionIndex];
    if (!q) {
      this.phaseAccess();
      return;
    }
    const cx = GAME_WIDTH / 2;
    const qText = this.add
      .text(cx, 246, q.question, {
        fontFamily: FONTS.body,
        fontSize: '17px',
        fontStyle: 'bold',
        color: COLORS.text,
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 70 }
      })
      .setOrigin(0.5);
    this.stageObjects.push(qText);

    let answered = false;
    q.options.forEach((opt, i) => {
      const btn = new PrimaryButton(this, {
        x: cx,
        y: 316 + i * 66,
        width: GAME_WIDTH - 80,
        label: opt,
        emphasis: false,
        onTap: () => {
          if (answered) return;
          answered = true;
          if (i === q.correctIndex) {
            Audio.play('correct');
            this.showFeedback(EP09.correctAnswerFeedback, COLORS.okText);
          } else {
            this.wrongAnswers += 1;
            this.raiseSuspicion(25);
            this.showFeedback(EP09.wrongAnswerFeedback, COLORS.warnText);
          }
          this.questionIndex += 1;
          this.time.delayedCall(950, () => this.askQuestion());
        }
      });
      this.stageObjects.push(btn);
    });
    this.input.keyboard?.once('keydown', (ev: KeyboardEvent) => {
      const idx = Number.parseInt(ev.key, 10) - 1;
      const btn = this.stageObjects[idx + 1];
      if (btn instanceof PrimaryButton && !answered) btn.trigger();
    });
  }

  /* ── Aşama 3: erişim noktası ── */
  private phaseAccess(): void {
    this.clearStage();
    this.showFeedback(EP09.accessIntro, COLORS.text);
    const cx = GAME_WIDTH / 2;
    let picked = false;
    EP09.accessPoints.forEach((ap, i) => {
      const card = new ChoiceCard(this, {
        x: cx,
        y: 268 + i * 118,
        width: GAME_WIDTH - 44,
        height: 104,
        title: ap.label,
        body: ap.detail,
        onTap: () => {
          if (picked) return;
          picked = true;
          card.setChoiceState('selected');
          Audio.play('confirm');
          if (ap.suspicionCost > 0) this.raiseSuspicion(ap.suspicionCost);
          this.time.delayedCall(800, () => this.finish());
        }
      });
      this.stageObjects.push(card);
    });
    this.input.keyboard?.on('keydown', (ev: KeyboardEvent) => {
      const idx = Number.parseInt(ev.key, 10) - 1;
      const card = this.stageObjects[idx];
      if (card instanceof ChoiceCard && !picked) card.emit(Phaser.Input.Events.POINTER_UP);
    });
  }

  private finish(): void {
    const s = this.suspicionLevel;
    const grade: ReportGrade = s === 0 ? 'sessiz' : s <= 30 ? 'kontrollu' : s <= 60 ? 'riskli' : 'desifre';
    const trustDelta = s === 0 ? 10 : s <= 30 ? 6 : s <= 60 ? 0 : -8;
    const stealthDelta = Math.round(s * 0.4);
    Campaign.adjust({ trust: trustDelta, stealth: stealthDelta });
    Campaign.addFlag('ep09-infiltrated');
    const outcome: EpisodeOutcome = {
      episodeId: EP09.id,
      title: EP09.title,
      grade,
      deltas: [
        { label: TR.episodes.metrics.trust, value: trustDelta },
        { label: TR.episodes.metrics.stealth, value: stealthDelta, inverted: true }
      ],
      cliffhanger: EP09.cliffhanger,
      nextScene: SCENE_KEYS.ep11
    };
    TransitionManager.fadeTo(this, SCENE_KEYS.episodeResult, outcome);
  }
}
