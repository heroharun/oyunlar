import Phaser from 'phaser';
import { PrimaryButton } from '../components/PrimaryButton';
import { TR } from '../data/dialogues/tr';
import { MISSION_001 } from '../data/missions/mission-001';
import { Audio } from '../systems/AudioManager';
import { MissionRun } from '../systems/MissionRun';
import { TransitionManager } from '../systems/TransitionManager';
import type { RouteOption } from '../types/mission';
import { COLORS, FONTS, GAME_HEIGHT, GAME_WIDTH, MIN_TOUCH, SCENE_KEYS } from '../utils/constants';
import { StageScene } from './StageScene';

const MAP_X = 28;
const MAP_Y = 178;
const MAP_W = GAME_WIDTH - 56;
const MAP_H = 250;
const CHIP_H = 78;

/** Rota planlama: harita üstünde üç güzergâhtan en düşük risklisini seç (GDD §7.5). */
export class RouteScene extends StageScene {
  private selectedId: string | null = null;
  private routeLayer?: Phaser.GameObjects.Graphics;
  private chips: { g: Phaser.GameObjects.Graphics; opt: RouteOption }[] = [];

  constructor() {
    super(SCENE_KEYS.route);
  }

  create(): void {
    this.selectedId = null;
    this.chips = [];
    const stage = MISSION_001.route;
    TransitionManager.fadeIn(this);
    Audio.setState('suspicion');
    this.buildHeader(TR.route.kicker, stage.instruction);

    this.drawMapBase();
    this.routeLayer = this.add.graphics();
    this.drawRoutes();

    // Rota fişleri
    stage.options.forEach((opt, i) => {
      const y = MAP_Y + MAP_H + 26 + i * (CHIP_H + 10) + CHIP_H / 2;
      const g = this.add.graphics();
      this.chips.push({ g, opt });
      this.paintChip(i);
      const zone = this.add.zone(GAME_WIDTH / 2, y, GAME_WIDTH - 44, Math.max(CHIP_H, MIN_TOUCH));
      zone.setInteractive();
      zone.on(Phaser.Input.Events.POINTER_UP, () => this.select(opt.id));
      this.add
        .text(46, y - CHIP_H / 2 + 12, opt.label, {
          fontFamily: FONTS.head,
          fontSize: '13px',
          fontStyle: 'bold',
          color: COLORS.text,
          letterSpacing: 1
        });
      this.add.text(46, y - CHIP_H / 2 + 36, opt.detail, {
        fontFamily: FONTS.body,
        fontSize: '12px',
        color: COLORS.textDim,
        wordWrap: { width: GAME_WIDTH - 120 }
      });
    });

    new PrimaryButton(this, {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT - 66,
      width: 220,
      label: TR.common.confirm,
      onTap: () => this.proceed()
    });

    this.input.keyboard?.on('keydown', (ev: KeyboardEvent) => {
      if (ev.key === 'Enter') {
        this.proceed();
        return;
      }
      const idx = Number.parseInt(ev.key, 10) - 1;
      const opt = MISSION_001.route.options[idx];
      if (opt) this.select(opt.id);
    });
  }

  private mapPoint(p: [number, number]): [number, number] {
    return [MAP_X + p[0] * MAP_W, MAP_Y + p[1] * MAP_H];
  }

  private drawMapBase(): void {
    const g = this.add.graphics();
    g.fillStyle(COLORS.panel, 1);
    g.fillRoundedRect(MAP_X, MAP_Y, MAP_W, MAP_H, 12);
    g.lineStyle(1.5, COLORS.line, 1);
    g.strokeRoundedRect(MAP_X, MAP_Y, MAP_W, MAP_H, 12);
    // ızgara
    g.lineStyle(1, COLORS.line, 0.3);
    for (let i = 1; i < 6; i++) {
      g.lineBetween(MAP_X + (MAP_W / 6) * i, MAP_Y + 6, MAP_X + (MAP_W / 6) * i, MAP_Y + MAP_H - 6);
      if (i < 5) g.lineBetween(MAP_X + 6, MAP_Y + (MAP_H / 5) * i, MAP_X + MAP_W - 6, MAP_Y + (MAP_H / 5) * i);
    }
    // başlangıç ve hedef işaretleri (metin etiketli — renk körü dostu)
    const [sx, sy] = this.mapPoint([0.1, 0.85]);
    const [tx, ty] = this.mapPoint([0.9, 0.15]);
    g.fillStyle(0x6c86a3, 1);
    g.fillCircle(sx, sy, 7);
    g.fillStyle(COLORS.accent, 1);
    g.fillCircle(tx, ty, 7);
    this.add
      .text(sx, sy + 16, TR.route.mapStart, {
        fontFamily: FONTS.head,
        fontSize: '10px',
        color: COLORS.textDim,
        letterSpacing: 1
      })
      .setOrigin(0.5, 0);
    this.add
      .text(tx, ty - 26, TR.route.mapTarget, {
        fontFamily: FONTS.head,
        fontSize: '10px',
        color: COLORS.accentText,
        letterSpacing: 1
      })
      .setOrigin(0.5, 0);
  }

  private drawRoutes(): void {
    const g = this.routeLayer;
    if (!g) return;
    g.clear();
    for (const opt of MISSION_001.route.options) {
      const isSel = opt.id === this.selectedId;
      g.lineStyle(isSel ? 4 : 1.5, isSel ? 0xdfe8f2 : 0x6c86a3, isSel ? 1 : 0.45);
      g.beginPath();
      opt.waypoints.forEach((wp, i) => {
        const [x, y] = this.mapPoint(wp);
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      });
      g.strokePath();
      // Rota harfi orta noktaya
      const mid = opt.waypoints[Math.floor(opt.waypoints.length / 2)];
      if (mid) {
        const [mx, my] = this.mapPoint(mid);
        const letter = opt.label.charAt(0);
        this.add
          .text(mx, my - 2, letter, {
            fontFamily: FONTS.head,
            fontSize: isSel ? '14px' : '12px',
            fontStyle: 'bold',
            color: isSel ? COLORS.text : COLORS.textDim
          })
          .setOrigin(0.5)
          .setName('routeLetter');
      }
    }
  }

  private paintChip(index: number): void {
    const chip = this.chips[index];
    if (!chip) return;
    const y = MAP_Y + MAP_H + 26 + index * (CHIP_H + 10);
    const isSel = chip.opt.id === this.selectedId;
    chip.g.clear();
    chip.g.fillStyle(isSel ? COLORS.panelLight : COLORS.panel, 1);
    chip.g.fillRoundedRect(22, y, GAME_WIDTH - 44, CHIP_H, 10);
    chip.g.lineStyle(isSel ? 2.5 : 1.5, isSel ? 0x6c86a3 : COLORS.line, 1);
    chip.g.strokeRoundedRect(22, y, GAME_WIDTH - 44, CHIP_H, 10);
  }

  private select(id: string): void {
    this.selectedId = id;
    Audio.play('tap');
    // eski rota harflerini temizle, yeniden çiz
    this.children.list
      .filter(o => o.name === 'routeLetter')
      .forEach(o => o.destroy());
    this.drawRoutes();
    this.chips.forEach((_, i) => this.paintChip(i));
    const opt = MISSION_001.route.options.find(o => o.id === id);
    if (opt) this.showFeedback(`${TR.route.selectedLabel}: ${opt.label}`, COLORS.text);
  }

  private proceed(): void {
    if (!this.selectedId) {
      this.showFeedback(TR.route.noneSelected, COLORS.warnText);
      return;
    }
    MissionRun.setRoute(this.selectedId);
    Audio.play('confirm');
    TransitionManager.fadeTo(this, SCENE_KEYS.decision);
  }
}
