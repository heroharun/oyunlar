import { ChoiceCard } from '../components/ChoiceCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { TR } from '../data/dialogues/tr';
import { MISSION_001 } from '../data/missions/mission-001';
import { Audio } from '../systems/AudioManager';
import { MissionRun } from '../systems/MissionRun';
import { TransitionManager } from '../systems/TransitionManager';
import { COLORS, FONTS, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../utils/constants';
import { StageScene } from './StageScene';

const CARD_H = 108;
const GAP = 14;
const TOP = 236;

/** Kritik final kararı (GDD §7.6). */
export class DecisionScene extends StageScene {
  private cards: ChoiceCard[] = [];
  private selectedIdx: number | null = null;
  private confirmed = false;

  constructor() {
    super(SCENE_KEYS.decision);
  }

  create(): void {
    this.cards = [];
    this.selectedIdx = null;
    this.confirmed = false;
    const stage = MISSION_001.decision;
    TransitionManager.fadeIn(this);
    Audio.setState('critical');
    this.buildHeader(TR.decision.kicker, stage.instruction);

    // Telsiz anonsu (GDD §11.5) — altyazı olarak
    Audio.play('radio');
    this.add
      .text(GAME_WIDTH / 2, 176, stage.radioLine, {
        fontFamily: FONTS.body,
        fontSize: '13px',
        fontStyle: 'italic',
        color: COLORS.accentText,
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 60 }
      })
      .setOrigin(0.5);

    stage.options.forEach((opt, i) => {
      const card = new ChoiceCard(this, {
        x: GAME_WIDTH / 2,
        y: TOP + i * (CARD_H + GAP) + CARD_H / 2,
        width: GAME_WIDTH - 44,
        height: CARD_H,
        title: opt.label,
        body: opt.detail,
        onTap: () => this.select(i)
      });
      this.cards.push(card);
    });

    new PrimaryButton(this, {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT - 84,
      width: 240,
      label: TR.common.confirm,
      onTap: () => this.proceed()
    });

    this.footerHintText(TR.common.keyboardPick);
    this.input.keyboard?.on('keydown', (ev: KeyboardEvent) => {
      if (ev.key === 'Enter') {
        this.proceed();
        return;
      }
      const idx = Number.parseInt(ev.key, 10) - 1;
      if (idx >= 0 && idx < this.cards.length) this.select(idx);
    });
  }

  private select(index: number): void {
    if (this.confirmed) return;
    Audio.play('tap');
    this.selectedIdx = index;
    this.cards.forEach((c, i) => c.setChoiceState(i === index ? 'selected' : 'idle'));
  }

  private proceed(): void {
    if (this.confirmed) return;
    if (this.selectedIdx === null) {
      this.showFeedback(TR.decision.noneSelected, COLORS.warnText);
      return;
    }
    const opt = MISSION_001.decision.options[this.selectedIdx];
    if (!opt) return;
    this.confirmed = true;
    MissionRun.setDecision(opt.id);
    Audio.play('confirm');
    TransitionManager.fadeTo(this, SCENE_KEYS.result);
  }
}
