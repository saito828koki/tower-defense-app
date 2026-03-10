import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { GameState, Tower } from '../types';
import { GRID_COLS, GRID_ROWS, TOWER_CONFIGS } from '../constants';
import { getEnemyPosition } from '../useGameEngine';

const screenWidth = Dimensions.get('window').width;
const CELL_SIZE = Math.floor((screenWidth - 16) / GRID_COLS);
const GRID_WIDTH = CELL_SIZE * GRID_COLS;
const GRID_HEIGHT = CELL_SIZE * GRID_ROWS;

interface Props {
  state: GameState;
  onCellPress: (row: number, col: number) => void;
}

const CellView = React.memo(
  ({
    type,
    row,
    col,
    tower,
    isSelected,
    onPress,
  }: {
    type: string;
    row: number;
    col: number;
    tower?: Tower;
    isSelected: boolean;
    onPress: () => void;
  }) => {
    const cellStyle = useMemo(() => {
      let bg = '#1a1a2e';
      if (type === 'path' || type === 'start' || type === 'end') bg = '#2d2d44';
      if (type === 'start') bg = '#4a3';
      if (type === 'end') bg = '#d44';
      if (tower) bg = TOWER_CONFIGS[tower.type].color + '88';
      if (isSelected && type === 'empty') bg = '#ffffff22';
      return [
        styles.cell,
        {
          backgroundColor: bg,
          width: CELL_SIZE,
          height: CELL_SIZE,
        },
      ];
    }, [type, tower, isSelected]);

    return (
      <Pressable onPress={onPress} style={cellStyle}>
        {tower && (
          <View style={styles.towerIcon}>
            <View
              style={[
                styles.towerDot,
                { backgroundColor: TOWER_CONFIGS[tower.type].color },
              ]}
            />
          </View>
        )}
      </Pressable>
    );
  }
);

export default function GameGrid({ state, onCellPress }: Props) {
  const towerMap = useMemo(() => {
    const map: Record<string, Tower> = {};
    for (const t of state.towers) {
      map[`${t.row}-${t.col}`] = t;
    }
    return map;
  }, [state.towers]);

  return (
    <View style={[styles.container, { width: GRID_WIDTH, height: GRID_HEIGHT }]}>
      {/* Grid cells */}
      {state.grid.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((cell, c) => (
            <CellView
              key={`${r}-${c}`}
              type={cell}
              row={r}
              col={c}
              tower={towerMap[`${r}-${c}`]}
              isSelected={state.selectedTower !== null && cell === 'empty'}
              onPress={() => onCellPress(r, c)}
            />
          ))}
        </View>
      ))}

      {/* Enemies */}
      {state.enemies.map((enemy) => {
        const pos = getEnemyPosition(enemy);
        const config = {
          basic: { color: '#8BC34A', size: 0.6 },
          fast: { color: '#9C27B0', size: 0.45 },
          tank: { color: '#795548', size: 0.8 },
          boss: { color: '#F44336', size: 1 },
        }[enemy.type];
        const enemySize = CELL_SIZE * config.size;
        const healthPct = enemy.health / enemy.maxHealth;

        return (
          <View
            key={enemy.id}
            style={[
              styles.enemy,
              {
                left: pos.col * CELL_SIZE + (CELL_SIZE - enemySize) / 2,
                top: pos.row * CELL_SIZE + (CELL_SIZE - enemySize) / 2,
                width: enemySize,
                height: enemySize,
                backgroundColor: config.color,
                borderRadius: enemySize / 2,
              },
            ]}
          >
            {/* Health bar */}
            <View style={[styles.healthBarBg, { width: enemySize }]}>
              <View
                style={[
                  styles.healthBar,
                  {
                    width: enemySize * healthPct,
                    backgroundColor: healthPct > 0.5 ? '#4CAF50' : healthPct > 0.25 ? '#FF9800' : '#F44336',
                  },
                ]}
              />
            </View>
          </View>
        );
      })}

      {/* Projectiles */}
      {state.projectiles.map((proj) => {
        const target = state.enemies.find((e) => e.id === proj.targetId);
        if (!target) return null;
        const targetPos = getEnemyPosition(target);
        const x = proj.fromCol + (targetPos.col - proj.fromCol) * proj.progress;
        const y = proj.fromRow + (targetPos.row - proj.fromRow) * proj.progress;
        const config = TOWER_CONFIGS[proj.towerType];

        return (
          <View
            key={proj.id}
            style={[
              styles.projectile,
              {
                left: x * CELL_SIZE + CELL_SIZE / 2 - 3,
                top: y * CELL_SIZE + CELL_SIZE / 2 - 3,
                backgroundColor: config.color,
              },
            ]}
          />
        );
      })}

      {/* Tower range indicators */}
      {state.selectedTower &&
        state.towers
          .filter((t) => t.type === state.selectedTower)
          .map((t) => {
            const config = TOWER_CONFIGS[t.type];
            const rangeSize = config.range * 2 * CELL_SIZE;
            return (
              <View
                key={`range-${t.id}`}
                pointerEvents="none"
                style={[
                  styles.rangeCircle,
                  {
                    left: t.col * CELL_SIZE + CELL_SIZE / 2 - rangeSize / 2,
                    top: t.row * CELL_SIZE + CELL_SIZE / 2 - rangeSize / 2,
                    width: rangeSize,
                    height: rangeSize,
                    borderRadius: rangeSize / 2,
                    borderColor: config.color + '44',
                  },
                ]}
              />
            );
          })}
    </View>
  );
}

export { CELL_SIZE, GRID_WIDTH, GRID_HEIGHT };

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#0f0f23',
    borderRadius: 4,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 0.5,
    borderColor: '#ffffff08',
    justifyContent: 'center',
    alignItems: 'center',
  },
  towerIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  towerDot: {
    width: CELL_SIZE * 0.5,
    height: CELL_SIZE * 0.5,
    borderRadius: CELL_SIZE * 0.25,
  },
  enemy: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  healthBarBg: {
    position: 'absolute',
    top: -6,
    height: 3,
    backgroundColor: '#333',
    borderRadius: 1,
  },
  healthBar: {
    height: 3,
    borderRadius: 1,
  },
  projectile: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    zIndex: 20,
  },
  rangeCircle: {
    position: 'absolute',
    borderWidth: 1,
    backgroundColor: 'transparent',
    zIndex: 5,
  },
});
