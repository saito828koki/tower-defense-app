export type TowerType = 'archer' | 'fire_mage' | 'ice_spirit' | 'stone_knight' | 'thunder_sage';

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
  attackType: 'single' | 'splash' | 'chain';
  damageType: 'physical' | 'magic';
  splashRadius?: number;
  chainCount?: number;
  slowFactor?: number;
  slowDuration?: number;
  dotDamage?: number;
  dotDuration?: number;
}

export interface TowerUpgradeInfo {
  cost: number;
  damageMultiplier: number;
  rangeBonus: number;
}

export interface Tower {
  id: string;
  type: TowerType;
  row: number;
  col: number;
  lastFired: number;
  level: number; // 1-3
}

export type EnemyType =
  | 'slime' | 'goblin_runner' | 'bat'
  | 'orc_warrior' | 'skeleton' | 'goblin_rider' | 'dark_mage'
  | 'stone_golem' | 'banshee' | 'vampire'
  | 'orc_general' | 'ice_dragon' | 'demon_lord';

export interface EnemyConfig {
  type: EnemyType;
  name: string;
  health: number;
  speed: number;
  reward: number;
  color: string;
  size: number;
  emoji: string;
  flying?: boolean; // immune to stone_knight
  magicResist?: number; // 0-1 damage reduction from magic
  physicalResist?: number; // 0-1 damage reduction from physical
  healPerSecond?: number; // HP regen
  isBoss?: boolean;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  health: number;
  maxHealth: number;
  pathIndex: number;
  progress: number;
  speed: number;
  reward: number;
  slowUntil: number;
  dotUntil: number;
  dotDamage: number;
  flying: boolean;
  magicResist: number;
  physicalResist: number;
  healPerSecond: number;
  isBoss: boolean;
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
  isBossWave?: boolean;
}

export type CellType = 'empty' | 'path' | 'start' | 'end' | 'tower';

export type WavePhase = 'prep' | 'active' | 'interval' | 'idle';

export interface GameState {
  grid: CellType[][];
  path: { row: number; col: number }[];
  towers: Tower[];
  enemies: Enemy[];
  projectiles: Projectile[];
  gold: number;
  baseHp: number;
  maxBaseHp: number;
  wave: number;
  totalWaves: number;
  wavePhase: WavePhase;
  prepTimer: number; // seconds remaining
  gameOver: boolean;
  gameWon: boolean;
  score: number;
  selectedTower: TowerType | null;
  selectedPlacedTower: Tower | null;
  speed: number;
  isPaused: boolean;
}
