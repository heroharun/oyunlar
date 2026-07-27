import Phaser from 'phaser';
import { ChoiceCard } from '../components/ChoiceCard';
import { TR } from '../data/dialogues/tr';
import { EP11 } from '../data/episodes/ep11';
import { Audio } from '../systems/AudioManager';
import { Campaign } from '../systems/Campaign';
import { TransitionManager } from '../systems/TransitionManager';
import type { ReportGrade } from '../types/mission';
import { COLORS, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../utils/constants';
import type { EpisodeOutcome } from './EpisodeResultScene';
import { StageScene } from './StageScene';

/** Bölüm 11 — İçeriden Biri: çelişki → zaman çizelgesi → sızan bilgi (GDD B11). */
export class Ep11Scene extends StageScene {
  private stageObjects: Phaser.GameObjects.GameObject[] = [];
  private mistakes = 0;
  private busy = false;

  constructor() {
    super(SCENE_KEYS.ep11);
  }

  create(): void {
    this.stageObjects = [];
    this.mistakes = 0;
    this.busy = false;
    TransitionManager.fadeIn(this);
    Audio.setState('investigation');
    this.buildHeader(EP11.title, EP11.briefing);
    this.buildHintButton(EP11.hints, GAME_WIDTH / 2, GAME_HEIGHT - 66);
    this.footerHintText(TR.common.keyboardPick);
    this.phaseStatements();
  }

  private clearStage(): void {
    this.stageObjects.forEach(o => o.destroy());
    this.stageObjects = [];
  }

  private setInstruction(text: string): void {
    this.showFeedback(text, COLORS.text);
  }

  /* ── Aşama 1: çelişkili ifade ── */
  private phaseStatements(): void {
    this.setInstruction(EP11.statementInstruction);
    const cx = GAME_WIDTH / 2;
    const cards: ChoiceCard[] = [];
    EP11.statements.forEach((s, i) => {
      const card = new ChoiceCard(this, {
        x: cx,
        y: 234 + i * 104,
        width: GAME_WIDTH - 44,
        height: 92,
        title: s.source,
        body: s.text,
        onTap: () => {
          if (this.busy) return;
          if (s.suspect === 'teknik') {
            this.busy = true;
            card.setChoiceState('correct');
            cards.forEach(c => c.disableInteractive());
            Audio.play('correct');
            this.showFeedback(EP11.statementExplanation, COLORS.okText);
            this.time.delayedCall(2600, () => {
              this.busy = false;
              this.clearStage();
              this.phaseLogs();
            });
          } else {
            this.mistakes += 1;
            Audio.play('wrong');
            card.setChoiceState('wrong');
            this.showFeedback(EP11.statementWrong, COLORS.warnText);
            this.time.delayedCall(700, () => card.setChoiceState('idle'));
          }
        }
      });
      cards.push(card);
      this.stageObjects.push(card);
    });
    this.bindNumberKeys(cards);
  }

  /* ── Aşama 2: log sıralama ── */
  private phaseLogs(): void {
    this.setInstruction(EP11.logInstruction);
    const cx = GAME_WIDTH / 2;
    let next = 0;
    const shuffled = Phaser.Utils.Array.Shuffle([...EP11.logs]);
    const cards: ChoiceCard[] = [];
    shuffled.forEach((log, i) => {
      const card = new ChoiceCard(this, {
        x: cx,
        y: 234 + i * 96,
        width: GAME_WIDTH - 44,
        height: 84,
        title: 'SİSTEM KAYDI',
        tag: log.time,
        body: log.text,
        onTap: () => {
          if (card.getChoiceState() === 'correct') return;
          if (log.order === next) {
            next += 1;
            card.setChoiceState('correct');
            Audio.play('card');
            this.showFeedback('', COLORS.text);
            if (next === EP11.logs.length) {
              Audio.play('correct');
              this.time.delayedCall(900, () => {
                this.clearStage();
                this.phaseLeak();
              });
            }
          } else {
            this.mistakes += 1;
            Audio.play('wrong');
            card.setChoiceState('wrong');
            this.showFeedback(EP11.logWrong, COLORS.warnText);
            this.time.delayedCall(600, () => {
              if (card.getChoiceState() === 'wrong') card.setChoiceState('idle');
            });
          }
        }
      });
      cards.push(card);
      this.stageObjects.push(card);
    });
    this.bindNumberKeys(cards);
  }

  /* ── Aşama 3: sızan bilgi ── */
  private phaseLeak(): void {
    this.setInstruction(EP11.leakInstruction);
    const cx = GAME_WIDTH / 2;
    const cards: ChoiceCard[] = [];
    EP11.leakOptions.forEach((opt, i) => {
      const card = new ChoiceCard(this, {
        x: cx,
        y: 240 + i * 92,
        width: GAME_WIDTH - 44,
        height: 80,
        title: `SEÇENEK ${i + 1}`,
        body: opt,
        onTap: () => {
          if (this.busy) return;
          if (i === EP11.leakCorrectIndex) {
            this.busy = true;
            card.setChoiceState('correct');
            cards.forEach(c => c.disableInteractive());
            Audio.play('correct');
            this.showFeedback(EP11.leakExplanation, COLORS.okText);
            this.time.delayedCall(2200, () => this.finish());
          } else {
            this.mistakes += 1;
            Audio.play('wrong');
            card.setChoiceState('wrong');
            this.showFeedback(EP11.leakWrong, COLORS.warnText);
            this.time.delayedCall(700, () => card.setChoiceState('idle'));
          }
        }
      });
      cards.push(card);
      this.stageObjects.push(card);
    });
    this.bindNumberKeys(cards);
  }

  private bindNumberKeys(cards: ChoiceCard[]): void {
    this.input.keyboard?.removeAllListeners('keydown');
    this.input.keyboard?.on('keydown', (ev: KeyboardEvent) => {
      const idx = Number.parseInt(ev.key, 10) - 1;
      const card = cards[idx];
      if (card && card.input?.enabled) card.emit(Phaser.Input.Events.POINTER_UP);
    });
  }

  private finish(): void {
    // Şüphe tablosu güncellenir; hain KESİNLEŞMEZ (GDD B11).
    for (const u of EP11.suspicionUpdates) Campaign.suspect(u.suspect, u.delta);
    const evidenceDelta = this.mistakes === 0 ? 15 : this.mistakes <= 2 ? 8 : 2;
    const trustDelta = this.mistakes === 0 ? 8 : this.mistakes <= 2 ? 4 : 0;
    Campaign.adjust({ evidence: evidenceDelta, trust: trustDelta });
    Campaign.addFlag('ep11-two-suspects');
    const grade: ReportGrade =
      this.mistakes === 0 ? 'sessiz' : this.mistakes <= 2 ? 'kontrollu' : 'riskli';
    const outcome: EpisodeOutcome = {
      episodeId: EP11.id,
      title: EP11.title,
      grade,
      deltas: [
        { label: TR.episodes.metrics.evidence, value: evidenceDelta },
        { label: TR.episodes.metrics.trust, value: trustDelta }
      ],
      cliffhanger: EP11.cliffhanger,
      nextScene: SCENE_KEYS.ep22
    };
    TransitionManager.fadeTo(this, SCENE_KEYS.episodeResult, outcome);
  }
}
