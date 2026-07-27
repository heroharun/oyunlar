import { ChoiceCard } from '../components/ChoiceCard';
import { TR } from '../data/dialogues/tr';
import { MISSION_001 } from '../data/missions/mission-001';
import { Audio } from '../systems/AudioManager';
import { MissionRun } from '../systems/MissionRun';
import { TransitionManager } from '../systems/TransitionManager';
import { COLORS, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../utils/constants';
import { StageScene } from './StageScene';

const CARD_H = 96;
const GAP = 12;
const TOP = 196;

/** Çelişki tespiti: dört ifadeden tutarsız olanı seç (GDD §7.2). */
export class ContradictionScene extends StageScene {
  private cards: ChoiceCard[] = [];
  private solved = false;

  constructor() {
    super(SCENE_KEYS.contradiction);
  }

  create(): void {
    this.cards = [];
    this.solved = false;
    const stage = MISSION_001.contradiction;
    TransitionManager.fadeIn(this);
    Audio.setState('investigation');
    this.buildHeader(TR.contradiction.kicker, stage.instruction);

    stage.statements.forEach((s, i) => {
      const card = new ChoiceCard(this, {
        x: GAME_WIDTH / 2,
        y: TOP + i * (CARD_H + GAP) + CARD_H / 2,
        width: GAME_WIDTH - 44,
        height: CARD_H,
        title: s.source,
        body: s.text,
        onTap: () => this.pick(i)
      });
      this.cards.push(card);
    });

    this.buildHintButton(stage.hints, GAME_WIDTH / 2, GAME_HEIGHT - 84);
    this.footerHintText(TR.common.keyboardPick);
    this.input.keyboard?.on('keydown', (ev: KeyboardEvent) => {
      const idx = Number.parseInt(ev.key, 10) - 1;
      if (idx >= 0 && idx < this.cards.length) this.pick(idx);
    });
  }

  private pick(index: number): void {
    if (this.solved) return;
    const stage = MISSION_001.contradiction;
    const statement = stage.statements[index];
    const card = this.cards[index];
    if (!statement || !card) return;

    if (statement.id === stage.inconsistentId) {
      this.solved = true;
      card.setChoiceState('correct');
      this.cards.forEach(c => c.disableInteractive());
      Audio.play('correct');
      this.showFeedback(stage.explanation, COLORS.okText);
      this.time.delayedCall(1900, () =>
        TransitionManager.fadeTo(this, SCENE_KEYS.signal)
      );
    } else {
      MissionRun.addMistake(true);
      Audio.play('wrong');
      card.setChoiceState('wrong');
      this.showFeedback(TR.contradiction.wrongPick, COLORS.warnText);
      this.time.delayedCall(700, () => {
        if (!this.solved) card.setChoiceState('idle');
      });
    }
  }
}
