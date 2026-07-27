import Phaser from 'phaser';
import { ChoiceCard } from '../components/ChoiceCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { TR } from '../data/dialogues/tr';
import { EP22 } from '../data/episodes/ep22';
import { Audio } from '../systems/AudioManager';
import { Campaign, type SuspectId } from '../systems/Campaign';
import { TransitionManager } from '../systems/TransitionManager';
import type { ReportGrade } from '../types/mission';
import { COLORS, FONTS, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../utils/constants';
import type { EpisodeOutcome } from './EpisodeResultScene';
import { StageScene } from './StageScene';

/** Bölüm 22 — İkili Oyun: sahte bilgi dağıt, tepkiyi izle, haini yakala (GDD B22). */
export class Ep22Scene extends StageScene {
  private stageObjects: Phaser.GameObjects.GameObject[] = [];
  private assignCards: ChoiceCard[] = [];
  /** suspects sırasına göre atanmış bilgi indeksi. */
  private assignment: number[] = [0, 1, 2];
  private mistakes = 0;
  private busy = false;

  constructor() {
    super(SCENE_KEYS.ep22);
  }

  create(): void {
    this.stageObjects = [];
    this.assignment = [0, 1, 2];
    this.mistakes = 0;
    this.busy = false;
    TransitionManager.fadeIn(this);
    Audio.setState('suspicion');
    this.buildHeader(EP22.title, EP22.briefing);
    this.footerHintText(TR.common.keyboardPick);
    this.phaseAssign();
  }

  private clearStage(): void {
    this.stageObjects.forEach(o => o.destroy());
    this.stageObjects = [];
    this.assignCards.forEach(c => c.destroy());
    this.assignCards = [];
  }

  /* ── Aşama 1: bilgi dağıtımı ── */
  private phaseAssign(): void {
    this.showFeedback(EP22.assignInstruction, COLORS.text);
    const cx = GAME_WIDTH / 2;

    const rebuild = (): void => {
      this.assignCards.forEach(c => c.destroy());
      this.assignCards = [];
      EP22.suspects.forEach((sp, i) => {
        const info = EP22.infos[this.assignment[i] ?? 0];
        const card = new ChoiceCard(this, {
          x: cx,
          y: 240 + i * 122,
          width: GAME_WIDTH - 44,
          height: 108,
          title: `${sp.name} — ${sp.note}`,
          tag: info?.code ?? '',
          body: '📄 ' + (info?.text ?? ''),
          onTap: () => {
            if (this.busy) return;
            // Dokun: bir sonraki bilgiyle TAKAS et (benzersizlik korunur)
            const current = this.assignment[i] ?? 0;
            const nextInfo = (current + 1) % EP22.infos.length;
            const holder = this.assignment.indexOf(nextInfo);
            this.assignment[holder] = current;
            this.assignment[i] = nextInfo;
            Audio.play('tap');
            rebuild();
          }
        });
        this.assignCards.push(card);
      });
    };
    rebuild();

    const confirm = new PrimaryButton(this, {
      x: cx,
      y: GAME_HEIGHT - 84,
      width: 240,
      label: EP22.assignConfirm,
      onTap: () => {
        if (this.busy) return;
        this.busy = true;
        Audio.play('confirm');
        this.clearStage();
        this.phaseWait();
      }
    });
    this.stageObjects.push(confirm);
    this.input.keyboard?.removeAllListeners('keydown');
    this.input.keyboard?.on('keydown-ENTER', () => confirm.trigger());
  }

  /* ── Aşama 2: 72 saat sonra — İHA raporu ── */
  private phaseWait(): void {
    this.busy = false;
    Audio.setState('critical');
    Audio.play('radio');
    const cx = GAME_WIDTH / 2;
    const traitorIdx = EP22.suspects.findIndex(s => s.id === EP22.traitor);
    const leakedInfo = EP22.infos[this.assignment[traitorIdx] ?? 0];
    const report = EP22.reactionReport
      .replace('{plan}', leakedInfo?.text ?? '')
      .replace('{code}', leakedInfo?.code ?? '');

    const title = this.add
      .text(cx, 260, EP22.waitTitle, {
        fontFamily: FONTS.head,
        fontSize: '18px',
        fontStyle: 'bold',
        color: COLORS.accentText,
        letterSpacing: 6
      })
      .setOrigin(0.5)
      .setAlpha(0);
    this.tweens.add({ targets: title, alpha: 1, duration: 600 });
    const body = this.add
      .text(cx, 350, report, {
        fontFamily: FONTS.body,
        fontSize: '14px',
        color: COLORS.text,
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 70 },
        lineSpacing: 7
      })
      .setOrigin(0.5)
      .setAlpha(0);
    this.tweens.add({ targets: body, alpha: 1, delay: 500, duration: 600 });
    this.stageObjects.push(title, body);

    const next = new PrimaryButton(this, {
      x: cx,
      y: GAME_HEIGHT - 100,
      width: 240,
      label: TR.common.continue,
      onTap: () => {
        this.clearStage();
        this.phasePick(leakedInfo?.code ?? '');
      }
    });
    this.stageObjects.push(next);
    this.input.keyboard?.removeAllListeners('keydown');
    this.input.keyboard?.on('keydown-ENTER', () => next.trigger());
  }

  /* ── Aşama 3: sızıntının kaynağını işaretle ── */
  private phasePick(code: string): void {
    this.showFeedback(EP22.pickInstruction.replace('{code}', code), COLORS.text);
    const cx = GAME_WIDTH / 2;
    const cards: ChoiceCard[] = [];
    EP22.suspects.forEach((sp, i) => {
      const card = new ChoiceCard(this, {
        x: cx,
        y: 250 + i * 122,
        width: GAME_WIDTH - 44,
        height: 108,
        title: sp.name,
        body: sp.note,
        onTap: () => {
          if (this.busy) return;
          if (sp.id === EP22.traitor) {
            this.busy = true;
            card.setChoiceState('correct');
            cards.forEach(c => c.disableInteractive());
            Audio.play('correct');
            this.showFeedback(EP22.pickExplanation, COLORS.okText);
            this.time.delayedCall(2200, () => this.finish(sp.id));
          } else {
            this.mistakes += 1;
            Audio.play('wrong');
            card.setChoiceState('wrong');
            this.showFeedback(EP22.pickWrong, COLORS.warnText);
            this.time.delayedCall(700, () => card.setChoiceState('idle'));
          }
        }
      });
      cards.push(card);
      this.stageObjects.push(card);
    });
    this.input.keyboard?.removeAllListeners('keydown');
    this.input.keyboard?.on('keydown', (ev: KeyboardEvent) => {
      const idx = Number.parseInt(ev.key, 10) - 1;
      const card = cards[idx];
      if (card && card.input?.enabled) card.emit(Phaser.Input.Events.POINTER_UP);
    });
  }

  private finish(traitor: SuspectId): void {
    Campaign.suspect(traitor, 100);
    Campaign.setSelectedSuspect(traitor);
    const evidenceDelta = this.mistakes === 0 ? 20 : 10;
    const trustDelta = this.mistakes === 0 ? 12 : 5;
    Campaign.adjust({ evidence: evidenceDelta, trust: trustDelta });
    Campaign.addFlag('ep22-traitor-found');
    const grade: ReportGrade = this.mistakes === 0 ? 'sessiz' : this.mistakes === 1 ? 'kontrollu' : 'riskli';
    const outcome: EpisodeOutcome = {
      episodeId: EP22.id,
      title: EP22.title,
      grade,
      deltas: [
        { label: TR.episodes.metrics.evidence, value: evidenceDelta },
        { label: TR.episodes.metrics.trust, value: trustDelta }
      ],
      cliffhanger: EP22.cliffhanger,
      nextEpisodeId: 'ep23'
    };
    TransitionManager.fadeTo(this, SCENE_KEYS.episodeResult, outcome);
  }
}
