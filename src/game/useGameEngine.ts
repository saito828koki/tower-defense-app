import { useCallback, useEffect, useRef, useState } from 'react';
import {
  GameState,
  Tower,
  Enemy,
  Projectile,
  TowerType,
  CellType,
} from './types';
import {
  TOWER_CONFIGS,
  ENEMY_CONFIGS,
  WAVES,
  PATH_POINTS,
  STARTING_GOLD,
  STARTING_LIVES,
  createGrid,
} from './constants';

let nextId = 0;
const genId = () => `${++nextId}`;

function distance(r1: number, c1: number, r2: number, c2: number) {
  return Math.sqrt((r1 - r2) ** 2 + (c1 - c2) ** 2);
}

function getEnemyPosition(enemy: Enemy) {
  const curr = PATH_POINTS[enemy.pathIndex];
  const next = PATH_POINTS[enemy.pathIndex + 1];
  if (!next) return { row: curr.row, col: curr.col };
  return {
    row: curr.row + (next.row - curr.row) * enemy.progress,
    col: curr.col + (next.col - curr.col) * enemy.progress,
  };
}

export function useGameEngine() {
  const [state, setState] = useState<GameState>(() => createInitialState());
  const stateRef = useRef(state);
  stateRef.current = state;

  const spawnQueue = useRef<{ type: string; delay: number }[]>([]);
  const spawnTimer = useRef<number>(0);
  const lastUpdate = useRef<number>(0);
  const animRef = useRef<number>(0);

  function createInitialState(): GameState {
    return {
      grid: createGrid(),
      path: PATH_POINTS,
      towers: [],
      enemies: [],
      projectiles: [],
      gold: STARTING_GOLD,
      lives: STARTING_LIVES,
      wave: 0,
      waveInProgress: false,
      gameOver: false,
      gameWon: false,
      score: 0,
      selectedTower: null,
      speed: 1,
      isPaused: false,
    };
  }

  const update = useCallback((dt: number) => {
    setState((prev) => {
      if (prev.gameOver || prev.gameWon || prev.isPaused) return prev;

      const adjustedDt = dt * prev.speed;
      let { enemies, towers, projectiles, gold, lives, score, waveInProgress, wave, grid, gameOver, gameWon } = {
        ...prev,
        enemies: prev.enemies.map((e) => ({ ...e })),
        projectiles: prev.projectiles.map((p) => ({ ...p })),
        grid: prev.grid.map((r) => [...r]),
      };

      const now = Date.now();

      // Spawn enemies from queue
      spawnTimer.current += adjustedDt;
      while (spawnQueue.current.length > 0 && spawnTimer.current >= spawnQueue.current[0].delay) {
        const spawn = spawnQueue.current.shift()!;
        spawnTimer.current -= spawn.delay;
        const config = ENEMY_CONFIGS[spawn.type];
        enemies.push({
          id: genId(),
          type: config.type,
          health: config.health,
          maxHealth: config.health,
          pathIndex: 0,
          progress: 0,
          speed: config.speed,
          reward: config.reward,
          slowUntil: 0,
        });
      }

      // Move enemies
      const arrivedEnemies: string[] = [];
      const deadEnemies: string[] = [];

      for (const enemy of enemies) {
        const isSlow = enemy.slowUntil > now;
        const speedMult = isSlow ? 0.4 : 1;
        const moveAmount = (enemy.speed * speedMult * adjustedDt) / 1000;
        enemy.progress += moveAmount;

        while (enemy.progress >= 1 && enemy.pathIndex < PATH_POINTS.length - 1) {
          enemy.progress -= 1;
          enemy.pathIndex++;
        }

        if (enemy.pathIndex >= PATH_POINTS.length - 1 && enemy.progress >= 1) {
          arrivedEnemies.push(enemy.id);
          lives -= 1;
        }
      }

      enemies = enemies.filter((e) => !arrivedEnemies.includes(e.id));

      // Tower firing
      for (const tower of towers) {
        const config = TOWER_CONFIGS[tower.type];
        const fireInterval = 1000 / config.fireRate;
        if (now - tower.lastFired < fireInterval) continue;

        // Find nearest enemy in range
        let nearest: Enemy | null = null;
        let nearestDist = Infinity;
        for (const enemy of enemies) {
          if (enemy.health <= 0) continue;
          const pos = getEnemyPosition(enemy);
          const dist = distance(tower.row, tower.col, pos.row, pos.col);
          if (dist <= config.range && dist < nearestDist) {
            nearest = enemy;
            nearestDist = dist;
          }
        }

        if (nearest) {
          tower.lastFired = now;
          projectiles.push({
            id: genId(),
            fromRow: tower.row,
            fromCol: tower.col,
            targetId: nearest.id,
            progress: 0,
            damage: config.damage,
            towerType: tower.type,
          });
        }
      }

      // Move projectiles
      const hitProjectiles: string[] = [];
      for (const proj of projectiles) {
        proj.progress += adjustedDt / 200;
        if (proj.progress >= 1) {
          hitProjectiles.push(proj.id);
          const target = enemies.find((e) => e.id === proj.targetId);
          if (target) {
            const towerConfig = TOWER_CONFIGS[proj.towerType];

            if (towerConfig.splashRadius) {
              // Splash damage
              const targetPos = getEnemyPosition(target);
              for (const enemy of enemies) {
                const pos = getEnemyPosition(enemy);
                const dist = distance(targetPos.row, targetPos.col, pos.row, pos.col);
                if (dist <= towerConfig.splashRadius) {
                  enemy.health -= proj.damage;
                }
              }
            } else {
              target.health -= proj.damage;
            }

            if (towerConfig.slowFactor && towerConfig.slowDuration) {
              target.slowUntil = now + towerConfig.slowDuration;
            }
          }
        }
      }

      projectiles = projectiles.filter((p) => !hitProjectiles.includes(p.id));

      // Remove dead enemies and grant gold
      for (const enemy of enemies) {
        if (enemy.health <= 0 && !deadEnemies.includes(enemy.id)) {
          deadEnemies.push(enemy.id);
          gold += enemy.reward;
          score += enemy.reward;
        }
      }
      enemies = enemies.filter((e) => !deadEnemies.includes(e.id));

      // Check wave complete
      if (waveInProgress && enemies.length === 0 && spawnQueue.current.length === 0) {
        waveInProgress = false;
        if (wave >= WAVES.length) {
          gameWon = true;
        }
      }

      if (lives <= 0) {
        gameOver = true;
        lives = 0;
      }

      return {
        ...prev,
        enemies,
        projectiles,
        gold,
        lives,
        score,
        waveInProgress,
        wave,
        grid,
        gameOver,
        gameWon,
        towers,
      };
    });
  }, []);

  useEffect(() => {
    let running = true;
    const tick = () => {
      if (!running) return;
      const now = Date.now();
      if (lastUpdate.current === 0) lastUpdate.current = now;
      const dt = Math.min(now - lastUpdate.current, 100);
      lastUpdate.current = now;
      update(dt);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [update]);

  const startWave = useCallback(() => {
    setState((prev) => {
      if (prev.waveInProgress || prev.gameOver || prev.gameWon) return prev;
      const waveIndex = prev.wave;
      if (waveIndex >= WAVES.length) return prev;
      const waveConfig = WAVES[waveIndex];

      const queue: { type: string; delay: number }[] = [];
      let totalDelay = 500; // initial delay
      for (const group of waveConfig.enemies) {
        for (let i = 0; i < group.count; i++) {
          queue.push({ type: group.type, delay: i === 0 && queue.length === 0 ? totalDelay : group.interval });
        }
        totalDelay = 800; // gap between groups
        queue.push({ type: group.type, delay: 0 }); // placeholder removed below
      }
      // Remove placeholder entries
      spawnQueue.current = queue.filter((q) => q.delay > 0 || queue.indexOf(q) === 0);
      spawnTimer.current = 0;

      return { ...prev, wave: waveIndex + 1, waveInProgress: true };
    });
  }, []);

  const placeTower = useCallback((row: number, col: number) => {
    setState((prev) => {
      if (!prev.selectedTower || prev.gameOver) return prev;
      if (prev.grid[row][col] !== 'empty') return prev;
      if (prev.towers.some((t) => t.row === row && t.col === col)) return prev;

      const config = TOWER_CONFIGS[prev.selectedTower];
      if (prev.gold < config.cost) return prev;

      const newGrid = prev.grid.map((r) => [...r]);
      newGrid[row][col] = 'tower';

      const newTower: Tower = {
        id: genId(),
        type: prev.selectedTower,
        row,
        col,
        lastFired: 0,
        level: 1,
      };

      return {
        ...prev,
        grid: newGrid,
        towers: [...prev.towers, newTower],
        gold: prev.gold - config.cost,
      };
    });
  }, []);

  const selectTower = useCallback((type: TowerType | null) => {
    setState((prev) => ({ ...prev, selectedTower: type }));
  }, []);

  const setSpeed = useCallback((speed: number) => {
    setState((prev) => ({ ...prev, speed }));
  }, []);

  const togglePause = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const resetGame = useCallback(() => {
    nextId = 0;
    spawnQueue.current = [];
    spawnTimer.current = 0;
    lastUpdate.current = 0;
    setState(createInitialState());
  }, []);

  return {
    state,
    startWave,
    placeTower,
    selectTower,
    setSpeed,
    togglePause,
    resetGame,
    getEnemyPosition,
  };
}

export { getEnemyPosition };
