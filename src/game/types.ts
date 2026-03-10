export type TowerType = 'basic' | 'sniper' | 'splash' | 'freeze';

export interface TowerConfig {
  type: TowerType;
  name: string;
  cost: number;
  damage: number;
  range: number;
  fireRate: number; // shots per second
  color: string;
  emoji: string;
  description: string;
  splashRadius?: number;
  slowFactor?: number;
  slowDuration?: number;
}

export interface Tower {
  id: string;
  type: TowerType;
  row: number;
  col: number;
  lastFired: number;
  level: number;
}

export type EnemyType = 'basic' | 'fast' | 'tank' | 'boss';

export interface EnemyConfig {
  type: EnemyType;
  name: string;
  health: number;
  speed: number; // cells per second
  reward: number;
  color: string;
  size: number; // relative size 0-1
}

export interface Enemy {
  id: string;
  type: EnemyType;
  health: number;
  maxHealth: number;
  pathIndex: number;
  progress: number; // 0-1 between current and next path point
  speed: number;
  reward: number;
  slowUntil: number;
}

export interface Projectile {
  id: string;
  fromRow: number;
  fromCol: number;
  targetId: string;
  progress: number;
  damage: number;
  towerType: TowerType;
}

export interface WaveConfig {
  enemies: { type: EnemyType; count: number; interval: number }[];
}

export type CellType = 'empty' | 'path' | 'start' | 'end' | 'tower';

export interface GameState {
  grid: CellType[][];
  path: { row: number; col: number }[];
  towers: Tower[];
  enemies: Enemy[];
  projectiles: Projectile[];
  gold: number;
  lives: number;
  wave: number;
  waveInProgress: boolean;
  gameOver: boolean;
  gameWon: boolean;
  score: number;
  selectedTower: TowerType | null;
  speed: number;
  isPaused: boolean;
}
