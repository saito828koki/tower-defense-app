import { TowerConfig, EnemyConfig, WaveConfig, CellType } from './types';

export const GRID_ROWS = 12;
export const GRID_COLS = 8;

export const TOWER_CONFIGS: Record<string, TowerConfig> = {
  basic: {
    type: 'basic',
    name: 'アーチャー',
    cost: 50,
    damage: 25,
    range: 2.5,
    fireRate: 1.5,
    color: '#4CAF50',
    emoji: '🏹',
    description: 'バランスの良い基本タワー',
  },
  sniper: {
    type: 'sniper',
    name: 'スナイパー',
    cost: 100,
    damage: 80,
    range: 4.5,
    fireRate: 0.5,
    color: '#2196F3',
    emoji: '🎯',
    description: '長射程・高火力・低速',
  },
  splash: {
    type: 'splash',
    name: 'ボマー',
    cost: 120,
    damage: 40,
    range: 2,
    fireRate: 0.8,
    color: '#FF5722',
    emoji: '💣',
    description: '範囲攻撃',
    splashRadius: 1.5,
  },
  freeze: {
    type: 'freeze',
    name: 'フリーザー',
    cost: 80,
    damage: 10,
    range: 2.5,
    fireRate: 1,
    color: '#00BCD4',
    emoji: '❄️',
    description: '敵を減速させる',
    slowFactor: 0.4,
    slowDuration: 2000,
  },
};

export const ENEMY_CONFIGS: Record<string, EnemyConfig> = {
  basic: {
    type: 'basic',
    name: 'スライム',
    health: 100,
    speed: 1.2,
    reward: 15,
    color: '#8BC34A',
    size: 0.6,
  },
  fast: {
    type: 'fast',
    name: 'コウモリ',
    health: 60,
    speed: 2.5,
    reward: 20,
    color: '#9C27B0',
    size: 0.45,
  },
  tank: {
    type: 'tank',
    name: 'ゴーレム',
    health: 400,
    speed: 0.6,
    reward: 40,
    color: '#795548',
    size: 0.8,
  },
  boss: {
    type: 'boss',
    name: 'ドラゴン',
    health: 1500,
    speed: 0.4,
    reward: 200,
    color: '#F44336',
    size: 1,
  },
};

export const WAVES: WaveConfig[] = [
  // Wave 1: Introduction
  { enemies: [{ type: 'basic', count: 5, interval: 1200 }] },
  // Wave 2
  { enemies: [{ type: 'basic', count: 8, interval: 1000 }] },
  // Wave 3: Fast enemies
  {
    enemies: [
      { type: 'basic', count: 5, interval: 1000 },
      { type: 'fast', count: 3, interval: 800 },
    ],
  },
  // Wave 4
  {
    enemies: [
      { type: 'fast', count: 6, interval: 700 },
    ],
  },
  // Wave 5: Tank
  {
    enemies: [
      { type: 'basic', count: 5, interval: 900 },
      { type: 'tank', count: 2, interval: 2000 },
    ],
  },
  // Wave 6
  {
    enemies: [
      { type: 'fast', count: 8, interval: 600 },
      { type: 'tank', count: 3, interval: 1800 },
    ],
  },
  // Wave 7
  {
    enemies: [
      { type: 'basic', count: 10, interval: 700 },
      { type: 'fast', count: 5, interval: 500 },
      { type: 'tank', count: 2, interval: 2000 },
    ],
  },
  // Wave 8
  {
    enemies: [
      { type: 'tank', count: 5, interval: 1500 },
      { type: 'fast', count: 10, interval: 400 },
    ],
  },
  // Wave 9
  {
    enemies: [
      { type: 'basic', count: 15, interval: 500 },
      { type: 'fast', count: 10, interval: 400 },
      { type: 'tank', count: 5, interval: 1200 },
    ],
  },
  // Wave 10: Boss
  {
    enemies: [
      { type: 'tank', count: 3, interval: 1500 },
      { type: 'fast', count: 8, interval: 500 },
      { type: 'boss', count: 1, interval: 3000 },
    ],
  },
];

// Map layout: 0=empty, 1=path
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

export const STARTING_GOLD = 150;
export const STARTING_LIVES = 20;
