import Phaser from 'phaser';
import { ChoiceCard } from '../components/ChoiceCard';
import { TR } from '../data/dialogues/tr';
import { MISSION_001 } from '../data/missions/mission-001';
import { Audio } from '../systems/AudioManager';
import { MissionRun } from '../systems/MissionRun';
import { TransitionManager } from '../systems/TransitionManager';
import type { SignalSource } from '../types/mission';
import { COLORS, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../utils/constants';
import { StageScene } from './StageScene';

const CARD_H = 128;
const GAP = 14;
const TOP = 196;

/** Sinyal analizi: hareketli kaynağı bul, yanlış pozitifi ele (GDD §7.3). */
export class SignalScene extends StageScene {
  private cards: ChoiceCard[] = [];
  private solved = false;
  private wavePhase = 0;
  private waves: { g: Phaser.GameObjects.Graphics; src: SignalSource; y: number }[] = [];

  constructor() {
    super(SCENE_KEYS.signal);
  }

  create(): void {
    this.cards = [];
    this.waves = [];
    this.solved = false;
    const stage = MISSION_001.signal;
    TransitionManager.fadeIn(this);
    Audio.setState('suspicion');
    this.buildHeader(TR.signal.kicker, stage.instruction);

    stage.sources.forEach((s, i) => {
      const y = TOP + i * (CARD_H + GAP) + CARD_H / 2;
      const card = new ChoiceCard(this, {
        x: GAME_WIDTH / 2,
        y,
        width: GAME_WIDTH - 44,
        height: CARD_H,
        title: s.label,
        body: s.reading,
        onTap: () => this.pick(i)
      });
      this.cards.push(card);
      // Kartın altına canlı dalga şeridi (şekil ile ayrım — renk körü dostu)
      const g = this.add.graphics();
      this.waves.push({ g, src: s, y: y + CARD_H / 2 - 22 });
    });

    this.buildHintButton(stage.hints, GAME_WIDTH / 2, GAME_HEIGHT - 84);
    this.footerHintText(TR.common.keyboardPick);
    this.input.keyboard?.on('keydown', (ev: KeyboardEvent) => {
      const idx = Number.parseInt(ev.key, 10) - 1;
      if (idx >= 0 && idx < this.cards.length) this.pick(idx);
    });
  }

  override update(_time: number, delta: number): void {
    this.wavePhase += delta / 1000;
    for (const w of this.waves) this.drawWave(w.g, w.src, w.y);
  }

  private drawWave(g: Phaser.GameObjects.Graphics, src: SignalSource, y: number): void {
    const left = GAME_WIDTH / 2 - (GAME_WIDTH - 44) / 2 + 16;
    const width = GAME_WIDTH - 44 - 92;
    g.clear();
    g.lineStyle(1.5, 0x6c86a3, 0.9);
    g.beginPath();
    const ph = this.wavePhase;
    for (let x = 0; x <= width; x += 3) {
      const p = x / width;
      let v = 0;
      if (src.pattern === 'flat') {
        v = Math.sin(p * 20 + ph * 2) * 2;
      } else if (src.pattern === 'moving') {
        // hareketli kaynak: dalga paketi zaman içinde kayar
        const center = (ph * 0.15) % 1;
        const d = Math.abs(p - center);
        v = Math.sin(p * 40 + ph * 6) * 10 * Math.exp(-d * d * 40);
      } else {
        // sabit ama yoğun: merkezde dev sivri tepe
        const d = Math.abs(p - 0.5);
        v = Math.sin(p * 60 + ph * 3) * 16 * Math.exp(-d * d * 120);
      }
      const px = left + x;
      const py = y + v;
      if (x === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.strokePath();
  }

  private pick(index: number): void {
    if (this.solved) return;
    const stage = MISSION_001.signal;
    const source = stage.sources[index];
    const card = this.cards[index];
    if (!source || !card) return;

    if (source.id === stage.correctId) {
      this.solved = true;
      card.setChoiceState('correct');
      this.cards.forEach(c => c.disableInteractive());
      Audio.play('correct');
      this.showFeedback(stage.explanation, COLORS.okText);
      this.time.delayedCall(1900, () =>
        TransitionManager.fadeTo(this, SCENE_KEYS.specialist)
      );
    } else {
      MissionRun.addMistake(true);
      Audio.play('wrong');
      card.setChoiceState('wrong');
      this.showFeedback(source.feedback, COLORS.warnText);
      this.time.delayedCall(900, () => {
        if (!this.solved) card.setChoiceState('idle');
      });
    }
  }
}
