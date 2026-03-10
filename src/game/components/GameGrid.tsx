import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { GameState, Tower, TowerType } from '../types';
import { GRID_COLS, GRID_ROWS, TOWER_CONFIGS, ENEMY_CONFIGS } from '../constants';
import { getEnemyPosition } from '../useGameEngine';

const screenWidth = Dimensions.get('window').width;
const CELL_SIZE = Math.floor((screenWidth - 16) / GRID_COLS);
const GRID_WIDTH = CELL_SIZE * GRID_COLS;
const GRID_HEIGHT = CELL_SIZE * GRID_ROWS;

interface Props {
  state: GameState;
  onCellPress: (row: number, col: number) => void;
  hoverCell?: { row: number; col: number } | null;
  hoverTowerType?: TowerType | null;
}

const CellView = React.memo(
  ({
    type,
    tower,
    isHovered,
    hoverColor,
    onPress,
  }: {
    type: string;
    tower?: Tower;
    isHovered: boolean;
    hoverColor?: string;
    onPress: () => void;
  }) => {
    const cellStyle = useMemo(() => {
      let bg = '#12121f';
      if (type === 'path' || type === 'start' || type === 'end') bg = '#252538';
      if (type === 'start') bg = '#2d5a27';
      if (type === 'end') bg = '#8b1a1a';
      if (tower) bg = TOWER_CONFIGS[tower.type].color + '55';
      if (isHovered && type === 'empty' && !tower) bg = (hoverColor || '#4CAF50') + '44';
      return [
        styles.cell,
        {
          backgroundColor: bg,
          width: CELL_SIZE,
          height: CELL_SIZE,
        },
        isHovered && type === 'empty' && !tower && styles.cellHovered,
      ];
    }, [type, tower, isHovered, hoverColor]);

    return (
      <Pressable onPress={onPress} style={cellStyle}>
        {tower && (
          <View style={styles.towerIcon}>
            <Text style={styles.towerEmoji}>
              {TOWER_CONFIGS[tower.type].emoji}
            </Text>
            {tower.level > 1 && (
              <View style={[styles.levelBadge, { backgroundColor: TOWER_CONFIGS[tower.type].color }]}>
                <Text style={styles.levelText}>{tower.level}</Text>
              </View>
            )}
          </View>
        )}
      </Pressable>
    );
  }
);

export default function GameGrid({ state, onCellPress, hoverCell, hoverTowerType }: Props) {
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
              tower={towerMap[`${r}-${c}`]}
              isHovered={hoverCell?.row === r && hoverCell?.col === c}
              hoverColor={hoverTowerType ? TOWER_CONFIGS[hoverTowerType]?.color : undefined}
              onPress={() => onCellPress(r, c)}
            />
          ))}
        </View>
      ))}

      {/* Enemies */}
      {state.enemies.map((enemy) => {
        const pos = getEnemyPosition(enemy);
        const enemyConfig = ENEMY_CONFIGS[enemy.type];
        if (!enemyConfig) return null;
        const enemySize = CELL_SIZE * enemyConfig.size;
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
                backgroundColor: enemyConfig.color + '88',
                borderRadius: enemySize / 2,
                borderWidth: enemy.isBoss ? 2 : 0,
                borderColor: '#FFD700',
              },
            ]}
          >
            <Text style={{ fontSize: enemySize * 0.6 }}>{enemyConfig.emoji}</Text>
            {/* Health bar */}
            <View style={[styles.healthBarBg, { width: Math.max(enemySize, 20) }]}>
              <View
                style={[
                  styles.healthBar,
                  {
                    width: Math.max(enemySize, 20) * healthPct,
                    backgroundColor:
                      healthPct > 0.5 ? '#4CAF50' : healthPct > 0.25 ? '#FF9800' : '#F44336',
                  },
                ]}
              />
            </View>
            {/* Slow indicator */}
            {enemy.slowUntil > Date.now() && (
              <View style={styles.slowIndicator} />
            )}
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
                left: x * CELL_SIZE + CELL_SIZE / 2 - 4,
                top: y * CELL_SIZE + CELL_SIZE / 2 - 4,
                backgroundColor: config.color,
                shadowColor: config.color,
                shadowOpacity: 0.8,
                shadowRadius: 4,
              },
            ]}
          />
        );
      })}

      {/* Selected placed tower range */}
      {state.selectedPlacedTower && (() => {
        const t = state.selectedPlacedTower!;
        const config = TOWER_CONFIGS[t.type];
        const levelRange = config.range + 0.5 * (t.level - 1);
        const rangeSize = levelRange * 2 * CELL_SIZE;
        return (
          <View
            pointerEvents="none"
            style={[
              styles.rangeCircle,
              {
                left: t.col * CELL_SIZE + CELL_SIZE / 2 - rangeSize / 2,
                top: t.row * CELL_SIZE + CELL_SIZE / 2 - rangeSize / 2,
                width: rangeSize,
                height: rangeSize,
                borderRadius: rangeSize / 2,
                borderColor: config.color + '66',
                backgroundColor: config.color + '11',
              },
            ]}
          />
        );
      })()}

      {/* Drag hover range preview */}
      {hoverCell && hoverTowerType && state.grid[hoverCell.row]?.[hoverCell.col] === 'empty' && (() => {
        const config = TOWER_CONFIGS[hoverTowerType];
        if (!config) return null;
        const rangeSize = config.range * 2 * CELL_SIZE;
        return (
          <View
            pointerEvents="none"
            style={[
              styles.rangeCircle,
              {
                left: hoverCell.col * CELL_SIZE + CELL_SIZE / 2 - rangeSize / 2,
                top: hoverCell.row * CELL_SIZE + CELL_SIZE / 2 - rangeSize / 2,
                width: rangeSize,
                height: rangeSize,
                borderRadius: rangeSize / 2,
                borderColor: config.color + '66',
                backgroundColor: config.color + '11',
              },
            ]}
          />
        );
      })()}
    </View>
  );
}

export { CELL_SIZE, GRID_WIDTH, GRID_HEIGHT };

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#0a0a18',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 0.5,
    borderColor: '#ffffff06',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellHovered: {
    borderWidth: 1.5,
    borderColor: '#ffffff44',
  },
  towerIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  towerEmoji: {
    fontSize: CELL_SIZE * 0.55,
  },
  levelBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  enemy: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  healthBarBg: {
    position: 'absolute',
    top: -7,
    height: 3,
    backgroundColor: '#00000088',
    borderRadius: 2,
  },
  healthBar: {
    height: 3,
    borderRadius: 2,
  },
  slowIndicator: {
    position: 'absolute',
    bottom: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00CED1',
  },
  projectile: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 20,
  },
  rangeCircle: {
    position: 'absolute',
    borderWidth: 1,
    backgroundColor: 'transparent',
    zIndex: 5,
  },
});
