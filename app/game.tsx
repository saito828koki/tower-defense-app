import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, LayoutRectangle } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameEngine } from '../src/game/useGameEngine';
import GameGrid, { CELL_SIZE } from '../src/game/components/GameGrid';
import TowerPanel from '../src/game/components/TowerPanel';
import HUD from '../src/game/components/HUD';
import { TowerType } from '../src/game/types';
import { TOWER_CONFIGS } from '../src/game/constants';

interface DragState {
  type: TowerType;
  x: number;
  y: number;
}

export default function GameScreen() {
  const {
    state,
    startWave,
    placeTower,
    setSpeed,
    togglePause,
    resetGame,
  } = useGameEngine();

  const [drag, setDrag] = useState<DragState | null>(null);
  const gridLayout = useRef<LayoutRectangle | null>(null);

  const getGridCell = useCallback((pageX: number, pageY: number) => {
    if (!gridLayout.current) return null;
    const { x, y } = gridLayout.current;
    const col = Math.floor((pageX - x) / CELL_SIZE);
    const row = Math.floor((pageY - y) / CELL_SIZE);
    if (row < 0 || row >= state.grid.length || col < 0 || col >= state.grid[0].length) return null;
    return { row, col };
  }, [state.grid]);

  const hoverCell = drag ? getGridCell(drag.x, drag.y) : null;

  const handleDragStart = useCallback((type: TowerType, x: number, y: number) => {
    setDrag({ type, x, y });
  }, []);

  const handleDragMove = useCallback((x: number, y: number) => {
    setDrag((prev) => prev ? { ...prev, x, y } : null);
  }, []);

  const handleDragEnd = useCallback((x: number, y: number) => {
    setDrag((prev) => {
      if (!prev) return null;
      const cell = getGridCell(x, y);
      if (cell) {
        placeTower(cell.row, cell.col, prev.type);
      }
      return null;
    });
  }, [getGridCell, placeTower]);

  const handleCellPress = (_row: number, _col: number) => {
    // Cell tap is unused — towers are placed via drag & drop
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{'< 戻る'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Tower Defense</Text>
        <Pressable onPress={resetGame} style={styles.resetBtn}>
          <Text style={styles.resetText}>リセット</Text>
        </Pressable>
      </View>

      {/* HUD */}
      <HUD
        gold={state.gold}
        lives={state.lives}
        wave={state.wave}
        score={state.score}
        waveInProgress={state.waveInProgress}
        speed={state.speed}
        isPaused={state.isPaused}
        onStartWave={startWave}
        onSetSpeed={setSpeed}
        onTogglePause={togglePause}
      />

      {/* Game Grid */}
      <View
        style={styles.gridContainer}
        onLayout={(e) => {
          // Get grid container layout, then compute actual grid position (centered)
          const layout = e.nativeEvent.layout;
          e.target.measureInWindow((wx: number, wy: number, w: number, h: number) => {
            const gridW = CELL_SIZE * state.grid[0].length;
            const offsetX = (w - gridW) / 2;
            gridLayout.current = { x: wx + offsetX, y: wy, width: gridW, height: CELL_SIZE * state.grid.length };
          });
        }}
      >
        <GameGrid
          state={state}
          onCellPress={handleCellPress}
          hoverCell={hoverCell}
          hoverTowerType={drag?.type}
        />
      </View>

      {/* Tower Selection - Drag & Drop */}
      <TowerPanel
        gold={state.gold}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      />

      {/* Hint */}
      <Text style={styles.hint}>
        タワーをドラッグしてグリッドに配置
      </Text>

      {/* Floating drag ghost */}
      {drag && (
        <View
          pointerEvents="none"
          style={[
            styles.dragGhost,
            {
              left: drag.x - 28,
              top: drag.y - 60,
              borderColor: TOWER_CONFIGS[drag.type].color,
              backgroundColor: TOWER_CONFIGS[drag.type].color + '33',
            },
          ]}
        >
          <Text style={styles.dragGhostEmoji}>{TOWER_CONFIGS[drag.type].emoji}</Text>
          <Text style={styles.dragGhostName}>{TOWER_CONFIGS[drag.type].name}</Text>
        </View>
      )}

      {/* Game Over Overlay */}
      {(state.gameOver || state.gameWon) && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <Text style={styles.overlayEmoji}>
              {state.gameWon ? '🎉' : '💀'}
            </Text>
            <Text style={styles.overlayTitle}>
              {state.gameWon ? 'クリア!' : 'ゲームオーバー'}
            </Text>
            <Text style={styles.overlayScore}>スコア: {state.score}</Text>
            <Text style={styles.overlayWave}>到達Wave: {state.wave}</Text>

            <Pressable onPress={resetGame} style={styles.retryBtn}>
              <Text style={styles.retryText}>もう一度</Text>
            </Pressable>
            <Pressable onPress={() => router.back()} style={styles.menuBtn}>
              <Text style={styles.menuText}>メニューへ</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  backBtn: {
    padding: 4,
  },
  backText: {
    color: '#6688ff',
    fontSize: 14,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetBtn: {
    padding: 4,
  },
  resetText: {
    color: '#ff6666',
    fontSize: 14,
  },
  gridContainer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  hint: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 4,
  },
  dragGhost: {
    position: 'absolute',
    width: 56,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 2,
    zIndex: 200,
  },
  dragGhostEmoji: {
    fontSize: 28,
  },
  dragGhostName: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  overlayContent: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#333',
    minWidth: 250,
  },
  overlayEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  overlayTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  overlayScore: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  overlayWave: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 24,
  },
  retryBtn: {
    paddingHorizontal: 36,
    paddingVertical: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuBtn: {
    paddingHorizontal: 36,
    paddingVertical: 12,
    backgroundColor: '#333',
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  menuText: {
    color: '#aaa',
    fontSize: 16,
  },
});
