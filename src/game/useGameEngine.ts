import { useCallback, useEffect, useRef, useState } from 'react';
import {
  GameState,
  Tower,
  Enemy,
  Projectile,
  TowerType,
  CellType,
  WavePhase,
} from './types';
import {
  TOWER_CONFIGS,
  ENEMY_CONFIGS,
  WAVES,
  PATH_POINTS,
  STARTING_GOLD,
  STARTING_BASE_HP,
  MAX_BASE_HP,
  PREP_TIME,
  TOTAL_WAVES,
  createGrid,
  getTowerStats,
  getUpgradeCost,
  getSellValue,
} from './constants';

let nextId = 0;
const genId = () => `${++nextId}`;

function distance(r1: number, c1: number, r2: number, c2: number) {
  return Math.sqrt((r1 - r2) ** 2 + (c1 - c2) ** 2);
}

export function getEnemyPosition(enemy: Enemy) {
  const curr = PATH_POINTS[enemy.pathIndex];
  const next = PATH_POINTS[enemy.pathIndex + 1];
  if (!next) return { row: curr.row, col: curr.col };
  return {
    row: curr.row + (next.row - curr.row) * enemy.progress,
    col: curr.col + (next.col - curr.col) * enemy.progress,
  };
}

function createInitialState(): GameState {
  return {
    grid: createGrid(),
    path: PATH_POINTS,
    towers: [],
    enemies: [],
    projectiles: [],
    gold: STARTING_GOLD,
    baseHp: STARTING_BASE_HP,
    maxBaseHp: MAX_BASE_HP,
    wave: 0,
    totalWaves: TOTAL_WAVES,
    wavePhase: 'idle' as WavePhase,
    prepTimer: 0,
    gameOver: false,
    gameWon: false,
    score: 0,
    selectedTower: null,
    selectedPlacedTower: null,
    speed: 1,
    isPaused: false,
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
  const intervalTimer = useRef<number>(0);

  const update = useCallback((dt: number) => {
    setState((prev) => {
      if (prev.gameOver || prev.gameWon || prev.isPaused) return prev;

      const adjustedDt = dt * prev.speed;
      const now = Date.now();

      let {
        enemies,
        towers,
        projectiles,
        gold,
        baseHp,
        score,
        wavePhase,
        wave,
        grid,
        gameOver,
        gameWon,
        prepTimer,
      } = {
        ...prev,
        enemies: prev.enemies.map((e) => ({ ...e })),
        projectiles: prev.projectiles.map((p) => ({ ...p })),
        grid: prev.grid.map((r) => [...r]),
      };

      // --- Prep phase countdown ---
      if (wavePhase === 'prep') {
        prepTimer -= adjustedDt / 1000;
        if (prepTimer <= 0) {
          prepTimer = 0;
          wavePhase = 'active';
          // Start spawning the wave
          const waveIndex = wave - 1;
          if (waveIndex >= 0 && waveIndex < WAVES.length) {
            const waveConfig = WAVES[waveIndex];
            const queue: { type: string; delay: number }[] = [];
            let firstEntry = true;
            for (const group of waveConfig.enemies) {
              for (let i = 0; i < group.count; i++) {
                if (firstEntry) {
                  queue.push({ type: group.type, delay: 500 });
                  firstEntry = false;
                } else {
                  queue.push({ type: group.type, delay: group.interval });
                }
              }
            }
            spawnQueue.current = queue;
            spawnTimer.current = 0;
          }
        }
      }

      // --- Interval phase countdown ---
      if (wavePhase === 'interval') {
        intervalTimer.current -= adjustedDt / 1000;
        if (intervalTimer.current <= 0) {
          intervalTimer.current = 0;
          wavePhase = 'idle';
        }
      }

      // --- Spawn enemies from queue (only during active phase) ---
      if (wavePhase === 'active') {
        spawnTimer.current += adjustedDt;
        while (
          spawnQueue.current.length > 0 &&
          spawnTimer.current >= spawnQueue.current[0].delay
        ) {
          const spawn = spawnQueue.current.shift()!;
          spawnTimer.current -= spawn.delay;
          const config = ENEMY_CONFIGS[spawn.type];
          if (config) {
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
              dotUntil: 0,
              dotDamage: 0,
              flying: config.flying ?? false,
              magicResist: config.magicResist ?? 0,
              physicalResist: config.physicalResist ?? 0,
              healPerSecond: config.healPerSecond ?? 0,
              isBoss: config.isBoss ?? false,
            });
          }
        }
      }

      // --- DoT damage on enemies ---
      for (const enemy of enemies) {
        if (enemy.dotUntil > now && enemy.dotDamage > 0) {
          enemy.health -= enemy.dotDamage * (adjustedDt / 1000);
        }
      }

      // --- Enemy HP regen ---
      for (const enemy of enemies) {
        if (enemy.healPerSecond > 0 && enemy.health > 0) {
          enemy.health = Math.min(
            enemy.maxHealth,
            enemy.health + enemy.healPerSecond * (adjustedDt / 1000)
          );
        }
      }

      // --- Move enemies ---
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
          baseHp -= enemy.isBoss ? 20 : 1;
        }
      }

      enemies = enemies.filter((e) => !arrivedEnemies.includes(e.id));

      // --- Tower firing ---
      for (const tower of towers) {
        const stats = getTowerStats(tower);
        const config = TOWER_CONFIGS[tower.type];
        const fireInterval = 1000 / stats.fireRate;
        if (now - tower.lastFired < fireInterval) continue;

        // Find nearest enemy in range
        let nearest: Enemy | null = null;
        let nearestDist = Infinity;
        for (const enemy of enemies) {
          if (enemy.health <= 0) continue;

          // stone_knight (physical melee) cannot target flying enemies
          if (tower.type === 'stone_knight' && enemy.flying) continue;

          const pos = getEnemyPosition(enemy);
          const dist = distance(tower.row, tower.col, pos.row, pos.col);
          if (dist <= stats.range && dist < nearestDist) {
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
            damage: stats.damage,
            towerType: tower.type,
          });
        }
      }

      // --- Move projectiles and handle hits ---
      const hitProjectiles: string[] = [];
      for (const proj of projectiles) {
        proj.progress += adjustedDt / 200;
        if (proj.progress >= 1) {
          hitProjectiles.push(proj.id);
          const target = enemies.find((e) => e.id === proj.targetId);
          if (target) {
            const towerConfig = TOWER_CONFIGS[proj.towerType];
            const damageType = towerConfig.damageType ?? 'physical';

            // Calculate resistance-adjusted damage
            const resist =
              damageType === 'physical'
                ? target.physicalResist
                : target.magicResist;
            const effectiveDamage = proj.damage * (1 - resist);

            const attackType = towerConfig.attackType ?? 'single';

            if (attackType === 'splash' && towerConfig.splashRadius) {
              // Splash damage: hit all enemies within splashRadius of target
              const targetPos = getEnemyPosition(target);
              for (const enemy of enemies) {
                const pos = getEnemyPosition(enemy);
                const dist = distance(targetPos.row, targetPos.col, pos.row, pos.col);
                if (dist <= towerConfig.splashRadius) {
                  const eResist =
                    damageType === 'physical'
                      ? enemy.physicalResist
                      : enemy.magicResist;
                  enemy.health -= proj.damage * (1 - eResist);
                }
              }

              // fire_mage applies DoT
              if (proj.towerType === 'fire_mage' && towerConfig.dotDamage && towerConfig.dotDuration) {
                const targetPos2 = getEnemyPosition(target);
                for (const enemy of enemies) {
                  const pos = getEnemyPosition(enemy);
                  const dist = distance(targetPos2.row, targetPos2.col, pos.row, pos.col);
                  if (dist <= towerConfig.splashRadius) {
                    enemy.dotUntil = now + towerConfig.dotDuration;
                    enemy.dotDamage = towerConfig.dotDamage;
                  }
                }
              }
            } else if (attackType === 'chain') {
              // Chain lightning: hit target then chain to 2 more nearby enemies
              target.health -= effectiveDamage;

              const chainTargets: Enemy[] = [target];
              let lastHit = target;
              const chainCount = 2;
              const chainRange = towerConfig.range;

              for (let c = 0; c < chainCount; c++) {
                const lastPos = getEnemyPosition(lastHit);
                let closestChain: Enemy | null = null;
                let closestChainDist = Infinity;

                for (const enemy of enemies) {
                  if (enemy.health <= 0) continue;
                  if (chainTargets.includes(enemy)) continue;
                  const pos = getEnemyPosition(enemy);
                  const dist = distance(lastPos.row, lastPos.col, pos.row, pos.col);
                  if (dist <= chainRange && dist < closestChainDist) {
                    closestChain = enemy;
                    closestChainDist = dist;
                  }
                }

                if (closestChain) {
                  const cResist =
                    damageType === 'physical'
                      ? closestChain.physicalResist
                      : closestChain.magicResist;
                  closestChain.health -= proj.damage * (1 - cResist);
                  chainTargets.push(closestChain);
                  lastHit = closestChain;
                } else {
                  break;
                }
              }
            } else {
              // Single target damage
              target.health -= effectiveDamage;
            }

            // ice_spirit applies slow
            if (proj.towerType === 'ice_spirit' && towerConfig.slowDuration) {
              target.slowUntil = now + towerConfig.slowDuration;
            }

            // fire_mage single-target DoT fallback (if attackType is not splash but tower is fire_mage)
            if (
              proj.towerType === 'fire_mage' &&
              attackType !== 'splash' &&
              towerConfig.dotDamage &&
              towerConfig.dotDuration
            ) {
              target.dotUntil = now + towerConfig.dotDuration;
              target.dotDamage = towerConfig.dotDamage;
            }
          }
        }
      }

      projectiles = projectiles.filter((p) => !hitProjectiles.includes(p.id));

      // --- Remove dead enemies and grant gold ---
      for (const enemy of enemies) {
        if (enemy.health <= 0 && !deadEnemies.includes(enemy.id)) {
          deadEnemies.push(enemy.id);
          gold += enemy.reward;
          score += enemy.reward;
        }
      }
      enemies = enemies.filter((e) => !deadEnemies.includes(e.id));

      // --- Check wave complete ---
      if (
        wavePhase === 'active' &&
        enemies.length === 0 &&
        spawnQueue.current.length === 0
      ) {
        if (wave >= TOTAL_WAVES) {
          gameWon = true;
          wavePhase = 'idle';
        } else {
          wavePhase = 'interval';
          intervalTimer.current = 5;
        }
      }

      // --- Check game over ---
      if (baseHp <= 0) {
        gameOver = true;
        baseHp = 0;
      }

      return {
        ...prev,
        enemies,
        projectiles,
        gold,
        baseHp,
        score,
        wavePhase,
        wave,
        grid,
        gameOver,
        gameWon,
        towers,
        prepTimer,
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
      if (prev.wavePhase === 'active' || prev.wavePhase === 'prep' || prev.gameOver || prev.gameWon)
        return prev;
      const waveIndex = prev.wave;
      if (waveIndex >= TOTAL_WAVES) return prev;

      return {
        ...prev,
        wave: waveIndex + 1,
        wavePhase: 'prep' as WavePhase,
        prepTimer: PREP_TIME,
      };
    });
  }, []);

  const skipPrep = useCallback(() => {
    setState((prev) => {
      if (prev.wavePhase !== 'prep') return prev;
      // Force prepTimer to 0 so the update loop transitions to active
      return {
        ...prev,
        prepTimer: 0,
      };
    });
  }, []);

  const placeTower = useCallback(
    (row: number, col: number, towerType?: TowerType) => {
      setState((prev) => {
        const type = towerType || prev.selectedTower;
        if (!type || prev.gameOver) return prev;
        if (prev.grid[row][col] !== 'empty') return prev;
        if (prev.towers.some((t) => t.row === row && t.col === col)) return prev;

        const config = TOWER_CONFIGS[type];
        if (!config) return prev;
        if (prev.gold < config.cost) return prev;

        const newGrid = prev.grid.map((r) => [...r]);
        newGrid[row][col] = 'tower';

        const newTower: Tower = {
          id: genId(),
          type,
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
    },
    []
  );

  const upgradeTower = useCallback((towerId: string) => {
    setState((prev) => {
      const tower = prev.towers.find((t) => t.id === towerId);
      if (!tower) return prev;
      if (tower.level >= 3) return prev;

      const cost = getUpgradeCost(tower.type, tower.level);
      if (prev.gold < cost) return prev;

      const newTowers = prev.towers.map((t) =>
        t.id === towerId ? { ...t, level: t.level + 1 } : t
      );

      // Update selectedPlacedTower if it matches
      const updatedSelected =
        prev.selectedPlacedTower?.id === towerId
          ? { ...prev.selectedPlacedTower, level: prev.selectedPlacedTower.level + 1 }
          : prev.selectedPlacedTower;

      return {
        ...prev,
        towers: newTowers,
        gold: prev.gold - cost,
        selectedPlacedTower: updatedSelected,
      };
    });
  }, []);

  const sellTower = useCallback((towerId: string) => {
    setState((prev) => {
      const tower = prev.towers.find((t) => t.id === towerId);
      if (!tower) return prev;

      const refund = getSellValue(tower.type, tower.level);
      const newTowers = prev.towers.filter((t) => t.id !== towerId);
      const newGrid = prev.grid.map((r) => [...r]);
      newGrid[tower.row][tower.col] = 'empty';

      return {
        ...prev,
        towers: newTowers,
        grid: newGrid,
        gold: prev.gold + refund,
        selectedPlacedTower:
          prev.selectedPlacedTower?.id === towerId
            ? null
            : prev.selectedPlacedTower,
      };
    });
  }, []);

  const selectTower = useCallback((type: TowerType | null) => {
    setState((prev) => ({ ...prev, selectedTower: type, selectedPlacedTower: null }));
  }, []);

  const selectPlacedTower = useCallback((tower: Tower | null) => {
    setState((prev) => ({ ...prev, selectedPlacedTower: tower, selectedTower: null }));
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
    intervalTimer.current = 0;
    lastUpdate.current = 0;
    setState(createInitialState());
  }, []);

  return {
    state,
    startWave,
    skipPrep,
    placeTower,
    upgradeTower,
    sellTower,
    selectTower,
    selectPlacedTower,
    setSpeed,
    togglePause,
    resetGame,
  };
}
