import Phaser from 'phaser';
import { ChoiceCard } from '../components/ChoiceCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { TR } from '../data/dialogues/tr';
import { GENERIC_EPISODES, type EpisodeDef, type EpStep, type StepDelta } from '../data/episodes/defs';
import { Audio } from '../systems/AudioManager';
import { Campaign } from '../systems/Campaign';
import { nextEpisodeId } from '../systems/episodeRouter';
import { TransitionManager } from '../systems/TransitionManager';
import type { ReportGrade } from '../types/mission';
import { COLORS, FONTS, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../utils/constants';
import type { EpisodeOutcome } from './EpisodeResultScene';
import { StageScene } from './StageScene';

/** Veri odaklı bölüm motoru: info / quiz / order / pick adımlarını çalıştırır. */
export class GenericEpisodeScene extends StageScene {
  private def: EpisodeDef = GENERIC_EPISODES['ep10'] as EpisodeDef;
  private stepIndex = 0;
  private mistakes = 0;
  private accumulated: Required<StepDelta> = { trust: 0, stealth: 0, evidence: 0, teamBond: 0 };
  private endingText: string | null = null;
  private stageObjects: Phaser.GameObjects.GameObject[] = [];
  private busy = false;

  constructor() {
    super(SCENE_KEYS.generic);
  }

  init(data: { episodeId?: string }): void {
    const def = data.episodeId ? GENERIC_EPISODES[data.episodeId] : undefined;
    if (def) this.def = def;
  }

  create(): void {
    this.stepIndex = 0;
    this.mistakes = 0;
    this.accumulated = { trust: 0, stealth: 0, evidence: 0, teamBond: 0 };
    this.endingText = null;
    this.stageObjects = [];
    this.busy = false;
    TransitionManager.fadeIn(this);
    Audio.setState(this.def.kicker.includes('PERDE 4') ? 'critical' : 'suspicion');
    this.buildHeader(this.def.title, this.def.briefing);
    this.footerHintText(TR.common.keyboardPick);
    this.runStep();
  }

  private clearStage(): void {
    this.stageObjects.forEach(o => o.destroy());
    this.stageObjects = [];
  }

  private stepLabel(): string {
    return `${this.stepIndex + 1}/${this.def.steps.length}`;
  }

  private runStep(): void {
    this.clearStage();
    this.busy = false;
    const step = this.def.steps[this.stepIndex];
    if (!step) {
      this.finish();
      return;
    }
    switch (step.kind) {
      case 'info':
        this.renderInfo(step.text);
        break;
      case 'quiz':
        this.renderQuiz(step);
        break;
      case 'order':
        this.renderOrder(step);
        break;
      case 'pick':
        this.renderPick(step);
        break;
    }
  }

  private advance(delayMs: number): void {
    this.busy = true;
    this.time.delayedCall(delayMs, () => {
      this.stepIndex += 1;
      this.runStep();
    });
  }

  private renderInfo(text: string): void {
    const cx = GAME_WIDTH / 2;
    this.showFeedback('', COLORS.text);
    const w = GAME_WIDTH - 52;
    const panel = this.add.graphics();
    panel.fillStyle(COLORS.panel, 1);
    panel.fillRoundedRect(cx - w / 2, 216, w, 250, 12);
    panel.lineStyle(1.5, COLORS.line, 1);
    panel.strokeRoundedRect(cx - w / 2, 216, w, 250, 12);
    const body = this.add
      .text(cx, 341, text, {
        fontFamily: FONTS.body,
        fontSize: '14px',
        color: COLORS.text,
        align: 'center',
        wordWrap: { width: w - 44 },
        lineSpacing: 8
      })
      .setOrigin(0.5);
    const btn = new PrimaryButton(this, {
      x: cx,
      y: GAME_HEIGHT - 100,
      width: 220,
      label: TR.common.continue,
      onTap: () => {
        if (this.busy) return;
        Audio.play('tap');
        this.advance(50);
      }
    });
    this.stageObjects.push(panel, body, btn);
    this.bindKeys([], btn);
  }

  private renderQuiz(step: Extract<EpStep, { kind: 'quiz' }>): void {
    this.showFeedback(`${this.stepLabel()} · ${step.prompt}`, COLORS.text);
    const cx = GAME_WIDTH / 2;
    const n = step.options.length;
    const h = n >= 4 ? 82 : 96;
    const gap = 12;
    const cards: ChoiceCard[] = [];
    step.options.forEach((opt, i) => {
      const card = new ChoiceCard(this, {
        x: cx,
        y: 240 + i * (h + gap) + h / 2,
        width: GAME_WIDTH - 44,
        height: h,
        title: `SEÇENEK ${i + 1}`,
        body: opt,
        onTap: () => {
          if (this.busy) return;
          if (i === step.correctIndex) {
            card.setChoiceState('correct');
            cards.forEach(c => c.disableInteractive());
            Audio.play('correct');
            if (step.explanation) this.showFeedback(step.explanation, COLORS.okText);
            this.advance(step.explanation ? 2100 : 900);
          } else {
            this.mistakes += 1;
            Audio.play('wrong');
            card.setChoiceState('wrong');
            this.showFeedback(step.wrongText, COLORS.warnText);
            this.time.delayedCall(700, () => {
              if (card.getChoiceState() === 'wrong') card.setChoiceState('idle');
            });
          }
        }
      });
      cards.push(card);
      this.stageObjects.push(card);
    });
    this.bindKeys(cards);
  }

  private renderOrder(step: Extract<EpStep, { kind: 'order' }>): void {
    this.showFeedback(`${this.stepLabel()} · ${step.prompt}`, COLORS.text);
    const cx = GAME_WIDTH / 2;
    let next = 0;
    const shuffled = Phaser.Utils.Array.Shuffle([...step.items]);
    const cards: ChoiceCard[] = [];
    shuffled.forEach((item, i) => {
      const card = new ChoiceCard(this, {
        x: cx,
        y: 240 + i * 94 + 41,
        width: GAME_WIDTH - 44,
        height: 82,
        title: 'KAYIT',
        tag: item.tag,
        body: item.text,
        onTap: () => {
          if (this.busy || card.getChoiceState() === 'correct') return;
          if (item.order === next) {
            next += 1;
            card.setChoiceState('correct');
            Audio.play('card');
            if (next === step.items.length) {
              Audio.play('correct');
              this.advance(900);
            }
          } else {
            this.mistakes += 1;
            Audio.play('wrong');
            card.setChoiceState('wrong');
            this.showFeedback(step.wrongText, COLORS.warnText);
            this.time.delayedCall(600, () => {
              if (card.getChoiceState() === 'wrong') card.setChoiceState('idle');
            });
          }
        }
      });
      cards.push(card);
      this.stageObjects.push(card);
    });
    this.bindKeys(cards);
  }

  private renderPick(step: Extract<EpStep, { kind: 'pick' }>): void {
    this.showFeedback(`${this.stepLabel()} · ${step.prompt}`, COLORS.text);
    const cx = GAME_WIDTH / 2;
    const n = step.options.length;
    const h = n >= 4 ? 88 : 104;
    const cards: ChoiceCard[] = [];
    step.options.forEach((opt, i) => {
      const card = new ChoiceCard(this, {
        x: cx,
        y: 236 + i * (h + 11) + h / 2,
        width: GAME_WIDTH - 44,
        height: h,
        title: opt.label,
        body: opt.detail ?? '',
        onTap: () => {
          if (this.busy) return;
          card.setChoiceState('selected');
          cards.forEach(c => c.disableInteractive());
          Audio.play('confirm');
          if (opt.delta) {
            this.accumulated.trust += opt.delta.trust ?? 0;
            this.accumulated.stealth += opt.delta.stealth ?? 0;
            this.accumulated.evidence += opt.delta.evidence ?? 0;
            this.accumulated.teamBond += opt.delta.teamBond ?? 0;
          }
          if (opt.ending) this.endingText = opt.ending;
          if (opt.feedback) this.showFeedback(opt.feedback, COLORS.okText);
          this.advance(opt.feedback ? 1800 : 700);
        }
      });
      cards.push(card);
      this.stageObjects.push(card);
    });
    this.bindKeys(cards);
  }

  private bindKeys(cards: ChoiceCard[], enterBtn?: PrimaryButton): void {
    this.input.keyboard?.removeAllListeners('keydown');
    this.input.keyboard?.on('keydown', (ev: KeyboardEvent) => {
      if (ev.key === 'Enter' && enterBtn) {
        enterBtn.trigger();
        return;
      }
      const idx = Number.parseInt(ev.key, 10) - 1;
      const card = cards[idx];
      if (card && card.input?.enabled) card.emit(Phaser.Input.Events.POINTER_UP);
    });
  }

  private finish(): void {
    const d = this.def;
    // Temel ödül + seçim etkileri + hata cezası
    const totals: Required<StepDelta> = {
      trust: (d.reward.trust ?? 0) + this.accumulated.trust,
      stealth:
        (d.reward.stealth ?? 0) +
        this.accumulated.stealth +
        this.mistakes * (d.stealthPerMistake ?? 0),
      evidence: (d.reward.evidence ?? 0) + this.accumulated.evidence,
      teamBond: (d.reward.teamBond ?? 0) + this.accumulated.teamBond
    };
    Campaign.adjust(totals);
    if (d.suspicion) for (const s of d.suspicion) Campaign.suspect(s.suspect, s.delta);
    Campaign.addFlag(`${d.id}-done`);

    const grade: ReportGrade =
      this.mistakes === 0 ? 'sessiz' : this.mistakes <= 2 ? 'kontrollu' : 'riskli';

    const deltas: EpisodeOutcome['deltas'] = [];
    if (totals.trust !== 0) deltas.push({ label: TR.episodes.metrics.trust, value: totals.trust });
    if (totals.evidence !== 0)
      deltas.push({ label: TR.episodes.metrics.evidence, value: totals.evidence });
    if (totals.stealth !== 0)
      deltas.push({ label: TR.episodes.metrics.stealth, value: totals.stealth, inverted: true });
    if (totals.teamBond !== 0) deltas.push({ label: 'EKİP BAĞI', value: totals.teamBond });

    const outcome: EpisodeOutcome = {
      episodeId: d.id,
      title: d.title,
      grade,
      deltas,
      cliffhanger: this.endingText ?? d.cliffhanger,
      nextEpisodeId: nextEpisodeId(d.id)
    };
    TransitionManager.fadeTo(this, SCENE_KEYS.episodeResult, outcome);
  }
}
