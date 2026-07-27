import Phaser from 'phaser';
import { ChoiceCard } from '../components/ChoiceCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { TR } from '../data/dialogues/tr';
import { MISSION_001 } from '../data/missions/mission-001';
import { Audio } from '../systems/AudioManager';
import { MissionRun } from '../systems/MissionRun';
import { TransitionManager } from '../systems/TransitionManager';
import type { SpecialistId } from '../types/mission';
import { COLORS, FONTS, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../utils/constants';
import { StageScene } from './StageScene';

const CARD_H = 118;
const GAP = 14;
const TOP = 186;

/** Uzman görevlendirme: üç uzmandan ikisini seç (GDD §7.4). */
export class SpecialistScene extends StageScene {
  private cards: ChoiceCard[] = [];
  private selected: SpecialistId[] = [];
  private countText?: Phaser.GameObjects.Text;
  private continueBtn?: PrimaryButton;

  constructor() {
    super(SCENE_KEYS.specialist);
  }

  create(): void {
    this.cards = [];
    this.selected = [];
    const stage = MISSION_001.specialist;
    TransitionManager.fadeIn(this);
    Audio.setState('suspicion');
    this.buildHeader(TR.specialist.kicker, stage.instruction);

    stage.specialists.forEach((sp, i) => {
      const card = new ChoiceCard(this, {
        x: GAME_WIDTH / 2,
        y: TOP + i * (CARD_H + GAP) + CARD_H / 2,
        width: GAME_WIDTH - 44,
        height: CARD_H,
        title: `${sp.name} · ${sp.role}`,
        body: sp.strength,
        onTap: () => this.toggle(i)
      });
      this.cards.push(card);
    });

    this.countText = this.add
      .text(GAME_WIDTH / 2, TOP + 3 * (CARD_H + GAP) + 16, '', {
        fontFamily: FONTS.head,
        fontSize: '12px',
        color: COLORS.textDim,
        letterSpacing: 2
      })
      .setOrigin(0.5);

    this.continueBtn = new PrimaryButton(this, {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT - 84,
      width: 220,
      label: TR.common.continue,
      onTap: () => this.proceed()
    });

    this.footerHintText(TR.common.keyboardPick);
    this.input.keyboard?.on('keydown', (ev: KeyboardEvent) => {
      if (ev.key === 'Enter') {
        this.proceed();
        return;
      }
      const idx = Number.parseInt(ev.key, 10) - 1;
      if (idx >= 0 && idx < this.cards.length) this.toggle(idx);
    });
    this.refresh();
  }

  private toggle(index: number): void {
    const stage = MISSION_001.specialist;
    const sp = stage.specialists[index];
    const card = this.cards[index];
    if (!sp || !card) return;
    Audio.play('tap');
    const at = this.selected.indexOf(sp.id);
    if (at >= 0) {
      this.selected.splice(at, 1);
      card.setChoiceState('idle');
    } else {
      if (this.selected.length >= stage.pickCount) {
        // En eski seçimi bırak: tek parmakla hızlı düzeltme
        const dropped = this.selected.shift();
        const di = stage.specialists.findIndex(s => s.id === dropped);
        this.cards[di]?.setChoiceState('idle');
      }
      this.selected.push(sp.id);
      card.setChoiceState('selected');
    }
    this.refresh();
  }

  private refresh(): void {
    const stage = MISSION_001.specialist;
    this.countText?.setText(
      `${TR.specialist.countLabel}: ${this.selected.length}/${stage.pickCount}`
    );
  }

  private proceed(): void {
    const stage = MISSION_001.specialist;
    if (this.selected.length !== stage.pickCount) {
      this.showFeedback(TR.specialist.needTwo, COLORS.warnText);
      return;
    }
    MissionRun.setSpecialists(this.selected);
    Audio.play('confirm');
    this.continueBtn?.destroy();
    TransitionManager.fadeTo(this, SCENE_KEYS.route);
  }
}
