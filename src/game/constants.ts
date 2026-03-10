import { TowerConfig, TowerType, EnemyConfig, WaveConfig, CellType, Tower } from './types';

export const GRID_ROWS = 12;
export const GRID_COLS = 8;

export const STARTING_GOLD = 150;
export const STARTING_BASE_HP = 100;
export const MAX_BASE_HP = 100;
export const PREP_TIME = 15; // seconds
export const TOTAL_WAVES = 20;

// ─── Tower Configs ───────────────────────────────────────────────────────────

export const TOWER_CONFIGS: Record<TowerType, TowerConfig> = {
  archer: {
    type: 'archer',
    name: '木の弓兵',
    cost: 50,
    damage: 30,
    range: 3,
    fireRate: 0.83, // ~1.2s interval
    color: '#8B4513',
    emoji: '🏹',
    description: 'バランスの良い基本タワー',
    attackType: 'single',
    damageType: 'physical',
  },
  fire_mage: {
    type: 'fire_mage',
    name: '炎の魔導士',
    cost: 120,
    damage: 45,
    range: 2,
    fireRate: 0.5, // 2s interval
    color: '#FF4500',
    emoji: '🔥',
    description: '範囲攻撃＋継続ダメージ',
    attackType: 'splash',
    damageType: 'magic',
    splashRadius: 1.2,
    dotDamage: 10,
    dotDuration: 3000,
  },
  ice_spirit: {
    type: 'ice_spirit',
    name: '氷の精霊',
    cost: 100,
    damage: 20,
    range: 3,
    fireRate: 0.67, // ~1.5s interval
    color: '#00CED1',
    emoji: '❄️',
    description: '敵を減速させる',
    attackType: 'single',
    damageType: 'magic',
    slowFactor: 0.3,
    slowDuration: 2000,
  },
  stone_knight: {
    type: 'stone_knight',
    name: '石の騎士',
    cost: 80,
    damage: 50,
    range: 1,
    fireRate: 1.25, // 0.8s interval
    color: '#708090',
    emoji: '⚔️',
    description: '近接・高火力',
    attackType: 'single',
    damageType: 'physical',
  },
  thunder_sage: {
    type: 'thunder_sage',
    name: '雷の賢者',
    cost: 200,
    damage: 60,
    range: 4,
    fireRate: 0.33, // ~3s interval
    color: '#9370DB',
    emoji: '⚡',
    description: '連鎖雷で複数の敵を攻撃',
    attackType: 'chain',
    damageType: 'magic',
    chainCount: 3,
  },
};

// ─── Enemy Configs ───────────────────────────────────────────────────────────

export const ENEMY_CONFIGS: Record<string, EnemyConfig> = {
  slime: {
    type: 'slime',
    name: 'スライム',
    health: 80,
    speed: 0.8,
    reward: 10,
    color: '#7CB342',
    size: 0.5,
    emoji: '🟢',
  },
  goblin_runner: {
    type: 'goblin_runner',
    name: 'ゴブリンランナー',
    health: 100,
    speed: 1.2,
    reward: 15,
    color: '#558B2F',
    size: 0.55,
    emoji: '👺',
  },
  bat: {
    type: 'bat',
    name: 'コウモリ',
    health: 60,
    speed: 1.8,
    reward: 20,
    color: '#7B1FA2',
    size: 0.4,
    emoji: '🦇',
    flying: true,
  },
  orc_warrior: {
    type: 'orc_warrior',
    name: 'オーク戦士',
    health: 300,
    speed: 0.7,
    reward: 30,
    color: '#5D4037',
    size: 0.75,
    emoji: '👹',
  },
  skeleton: {
    type: 'skeleton',
    name: 'スケルトン',
    health: 150,
    speed: 1.0,
    reward: 25,
    color: '#BDBDBD',
    size: 0.6,
    emoji: '💀',
    physicalResist: 0.4,
  },
  goblin_rider: {
    type: 'goblin_rider',
    name: 'ゴブリンライダー',
    health: 120,
    speed: 2.2,
    reward: 25,
    color: '#33691E',
    size: 0.5,
    emoji: '🐗',
  },
  dark_mage: {
    type: 'dark_mage',
    name: 'ダークメイジ',
    health: 180,
    speed: 0.9,
    reward: 35,
    color: '#4A148C',
    size: 0.55,
    emoji: '🧙',
  },
  stone_golem: {
    type: 'stone_golem',
    name: 'ストーンゴーレム',
    health: 800,
    speed: 0.4,
    reward: 50,
    color: '#616161',
    size: 0.9,
    emoji: '🗿',
  },
  banshee: {
    type: 'banshee',
    name: 'バンシー',
    health: 200,
    speed: 1.3,
    reward: 40,
    color: '#E0E0E0',
    size: 0.55,
    emoji: '👻',
  },
  vampire: {
    type: 'vampire',
    name: 'ヴァンパイア',
    health: 250,
    speed: 1.1,
    reward: 45,
    color: '#B71C1C',
    size: 0.6,
    emoji: '🧛',
    healPerSecond: 15,
  },
  orc_general: {
    type: 'orc_general',
    name: 'オーク将軍',
    health: 1500,
    speed: 0.5,
    reward: 150,
    color: '#BF360C',
    size: 1.0,
    emoji: '👑',
    isBoss: true,
    physicalResist: 0.2,
  },
  ice_dragon: {
    type: 'ice_dragon',
    name: 'アイスドラゴン',
    health: 2000,
    speed: 0.35,
    reward: 200,
    color: '#0288D1',
    size: 1.0,
    emoji: '🐉',
    isBoss: true,
    magicResist: 0.3,
  },
  demon_lord: {
    type: 'demon_lord',
    name: '魔王',
    health: 3000,
    speed: 0.3,
    reward: 300,
    color: '#D50000',
    size: 1.0,
    emoji: '😈',
    isBoss: true,
    physicalResist: 0.2,
    magicResist: 0.2,
  },
};

// ─── Waves ───────────────────────────────────────────────────────────────────

export const WAVES: WaveConfig[] = [
  // Wave 1: スライムのみ
  {
    enemies: [{ type: 'slime', count: 6, interval: 1200 }],
  },
  // Wave 2: スライム増量
  {
    enemies: [{ type: 'slime', count: 10, interval: 1000 }],
  },
  // Wave 3: ゴブリンランナー登場
  {
    enemies: [
      { type: 'slime', count: 6, interval: 1000 },
      { type: 'goblin_runner', count: 4, interval: 900 },
    ],
  },
  // Wave 4: ゴブリンランナー主体
  {
    enemies: [
      { type: 'goblin_runner', count: 8, interval: 800 },
      { type: 'slime', count: 4, interval: 1000 },
    ],
  },
  // Wave 5: BOSS - オーク将軍
  {
    enemies: [
      { type: 'orc_warrior', count: 3, interval: 1500 },
      { type: 'orc_general', count: 1, interval: 3000 },
    ],
    isBossWave: true,
  },
  // Wave 6: コウモリ登場
  {
    enemies: [
      { type: 'goblin_runner', count: 5, interval: 900 },
      { type: 'bat', count: 6, interval: 700 },
    ],
  },
  // Wave 7: スケルトン登場
  {
    enemies: [
      { type: 'skeleton', count: 5, interval: 1100 },
      { type: 'bat', count: 4, interval: 800 },
      { type: 'slime', count: 6, interval: 900 },
    ],
  },
  // Wave 8: ゴブリンライダー登場
  {
    enemies: [
      { type: 'goblin_rider', count: 6, interval: 700 },
      { type: 'skeleton', count: 4, interval: 1000 },
    ],
  },
  // Wave 9: 混合ウェーブ
  {
    enemies: [
      { type: 'bat', count: 8, interval: 600 },
      { type: 'orc_warrior', count: 3, interval: 1500 },
      { type: 'goblin_rider', count: 5, interval: 800 },
    ],
  },
  // Wave 10: BOSS - アイスドラゴン
  {
    enemies: [
      { type: 'skeleton', count: 4, interval: 1000 },
      { type: 'bat', count: 5, interval: 700 },
      { type: 'ice_dragon', count: 1, interval: 3000 },
    ],
    isBossWave: true,
  },
  // Wave 11: ダークメイジ登場
  {
    enemies: [
      { type: 'dark_mage', count: 4, interval: 1200 },
      { type: 'goblin_runner', count: 8, interval: 700 },
    ],
  },
  // Wave 12: ストーンゴーレム登場
  {
    enemies: [
      { type: 'stone_golem', count: 2, interval: 2500 },
      { type: 'dark_mage', count: 3, interval: 1100 },
      { type: 'skeleton', count: 5, interval: 900 },
    ],
  },
  // Wave 13: バンシー登場
  {
    enemies: [
      { type: 'banshee', count: 5, interval: 900 },
      { type: 'bat', count: 6, interval: 600 },
      { type: 'stone_golem', count: 1, interval: 3000 },
    ],
  },
  // Wave 14: 中盤総力戦
  {
    enemies: [
      { type: 'orc_warrior', count: 5, interval: 1200 },
      { type: 'dark_mage', count: 4, interval: 1000 },
      { type: 'banshee', count: 4, interval: 900 },
    ],
  },
  // Wave 15: BOSS - オーク将軍 + アイスドラゴン
  {
    enemies: [
      { type: 'orc_warrior', count: 4, interval: 1200 },
      { type: 'orc_general', count: 1, interval: 3000 },
      { type: 'ice_dragon', count: 1, interval: 4000 },
    ],
    isBossWave: true,
  },
  // Wave 16: ヴァンパイア登場
  {
    enemies: [
      { type: 'vampire', count: 4, interval: 1100 },
      { type: 'dark_mage', count: 5, interval: 900 },
      { type: 'goblin_rider', count: 6, interval: 700 },
    ],
  },
  // Wave 17: 飛行ラッシュ
  {
    enemies: [
      { type: 'bat', count: 12, interval: 500 },
      { type: 'banshee', count: 6, interval: 800 },
      { type: 'vampire', count: 3, interval: 1200 },
    ],
  },
  // Wave 18: 重装ウェーブ
  {
    enemies: [
      { type: 'stone_golem', count: 3, interval: 2000 },
      { type: 'orc_warrior', count: 6, interval: 1000 },
      { type: 'skeleton', count: 8, interval: 700 },
    ],
  },
  // Wave 19: 総力戦
  {
    enemies: [
      { type: 'vampire', count: 5, interval: 900 },
      { type: 'dark_mage', count: 5, interval: 800 },
      { type: 'stone_golem', count: 2, interval: 2500 },
    ],
  },
  // Wave 20: FINAL BOSS - 魔王
  {
    enemies: [
      { type: 'orc_warrior', count: 4, interval: 1200 },
      { type: 'vampire', count: 3, interval: 1000 },
      { type: 'stone_golem', count: 2, interval: 2000 },
      { type: 'demon_lord', count: 1, interval: 5000 },
    ],
    isBossWave: true,
  },
];

// ─── Map Layout ──────────────────────────────────────────────────────────────

// 0=empty, 1=path
const MAP_LAYOUT = [
  [0, 1, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 1, 0],
];

export function createGrid(): CellType[][] {
  return MAP_LAYOUT.map((row, r) =>
    row.map((cell, c) => {
      if (cell === 1) {
        if (r === 0 && c === 1) return 'start';
        if (r === 11 && c === 6) return 'end';
        return 'path';
      }
      return 'empty';
    })
  );
}

// Path waypoints in order
export const PATH_POINTS: { row: number; col: number }[] = [
  { row: 0, col: 1 },
  { row: 1, col: 1 },
  { row: 2, col: 1 },
  { row: 2, col: 2 },
  { row: 2, col: 3 },
  { row: 2, col: 4 },
  { row: 2, col: 5 },
  { row: 3, col: 5 },
  { row: 4, col: 5 },
  { row: 5, col: 5 },
  { row: 5, col: 4 },
  { row: 5, col: 3 },
  { row: 5, col: 2 },
  { row: 5, col: 1 },
  { row: 6, col: 1 },
  { row: 7, col: 1 },
  { row: 8, col: 1 },
  { row: 8, col: 2 },
  { row: 8, col: 3 },
  { row: 8, col: 4 },
  { row: 8, col: 5 },
  { row: 8, col: 6 },
  { row: 9, col: 6 },
  { row: 10, col: 6 },
  { row: 11, col: 6 },
];

// ─── Tower Upgrade & Stats Helpers ───────────────────────────────────────────

/**
 * Returns the upgrade cost from currentLevel to currentLevel+1.
 * Lv1 -> Lv2: baseCost * 0.75
 * Lv2 -> Lv3: baseCost * 1.5
 * Returns 0 if already max level (3).
 */
export function getUpgradeCost(towerType: TowerType, currentLevel: number): number {
  if (currentLevel >= 3) return 0;
  const baseCost = TOWER_CONFIGS[towerType].cost;
  if (currentLevel === 1) return Math.round(baseCost * 0.75);
  if (currentLevel === 2) return Math.round(baseCost * 1.5);
  return 0;
}

/**
 * Returns 60% of total gold invested (purchase + upgrades) for selling.
 */
export function getSellValue(towerType: TowerType, currentLevel: number): number {
  const baseCost = TOWER_CONFIGS[towerType].cost;
  let totalInvested = baseCost;
  if (currentLevel >= 2) totalInvested += Math.round(baseCost * 0.75);
  if (currentLevel >= 3) totalInvested += Math.round(baseCost * 1.5);
  return Math.round(totalInvested * 0.6);
}

/**
 * Returns effective tower stats with level multipliers applied.
 * Damage: base * (1 + 0.25 * (level - 1))
 * Range:  base + 0.5 * (level - 1)
 */
export function getTowerStats(tower: Tower): { damage: number; range: number; fireRate: number } {
  const config = TOWER_CONFIGS[tower.type];
  return {
    damage: config.damage * (1 + 0.25 * (tower.level - 1)),
    range: config.range + 0.5 * (tower.level - 1),
    fireRate: config.fireRate,
  };
}
