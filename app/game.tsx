import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  LayoutRectangle,
  PanResponder,
  GestureResponderEvent,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameEngine } from '../src/game/useGameEngine';
import GameGrid, { CELL_SIZE } from '../src/game/components/GameGrid';
import TowerPanel from '../src/game/components/TowerPanel';
import TowerInfoPanel from '../src/game/components/TowerInfoPanel';
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
    skipPrep,
    placeTower,
    upgradeTower,
    sellTower,
    selectPlacedTower,
    setSpeed,
    togglePause,
    resetGame,
  } = useGameEngine();

  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const gridContainerRef = useRef<View>(null);
  const gridLayout = useRef<LayoutRectangle | null>(null);
  const gridSize = useRef({ rows: state.grid.length, cols: state.grid[0].length });
  gridSize.current = { rows: state.grid.length, cols: state.grid[0].length };

  const getGridCell = useCallback((pageX: number, pageY: number) => {
    if (!gridLayout.current) return null;
    const { x, y } = gridLayout.current;
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    if (!Number.isFinite(pageX) || !Number.isFinite(pageY)) return null;
    const col = Math.floor((pageX - x) / CELL_SIZE);
    const row = Math.floor((pageY - y) / CELL_SIZE);
    if (row < 0 || row >= gridSize.current.rows || col < 0 || col >= gridSize.current.cols) return null;
    return { row, col };
  }, []);

  const hoverCell = drag ? getGridCell(drag.x, drag.y) : null;

  // --- Full-screen PanResponder for drag overlay ---
  const dragPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e: GestureResponderEvent) => {
        if (!dragRef.current) return;
        const newDrag = { ...dragRef.current, x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
        dragRef.current = newDrag;
        setDrag(newDrag);
      },
      onPanResponderRelease: (e: GestureResponderEvent) => {
        const prev = dragRef.current;
        dragRef.current = null;
        setDrag(null);
        if (prev) {
          const cell = getGridCell(e.nativeEvent.pageX, e.nativeEvent.pageY);
          if (cell) {
            placeTower(cell.row, cell.col, prev.type);
          }
        }
      },
      onPanResponderTerminate: () => {
        dragRef.current = null;
        setDrag(null);
      },
    })
  ).current;

  // Called from TowerPanel long press
  const handleStartDrag = useCallback((type: TowerType) => {
    selectPlacedTower(null);
    // We don't have coordinates from longPress, so we'll set initial position off-screen
    // and it'll be updated immediately on first move
    const initial: DragState = { type, x: -100, y: -100 };
    dragRef.current = initial;
    setDrag(initial);
  }, [selectPlacedTower]);

  const handleCellPress = (row: number, col: number) => {
    const tower = state.towers.find((t) => t.row === row && t.col === col);
    if (tower) {
      selectPlacedTower(
        state.selectedPlacedTower?.id === tower.id ? null : tower
      );
    } else {
      selectPlacedTower(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{'< 戻る'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>ARCANE SIEGE</Text>
        <Pressable onPress={resetGame} style={styles.resetBtn}>
          <Text style={styles.resetText}>リセット</Text>
        </Pressable>
      </View>

      {/* HUD */}
      <HUD
        gold={state.gold}
        baseHp={state.baseHp}
        maxBaseHp={state.maxBaseHp}
        wave={state.wave}
        score={state.score}
        wavePhase={state.wavePhase}
        prepTimer={state.prepTimer}
        speed={state.speed}
        isPaused={state.isPaused}
        onStartWave={startWave}
        onSkipPrep={skipPrep}
        onSetSpeed={setSpeed}
        onTogglePause={togglePause}
      />

      {/* Game Grid */}
      <View
        style={styles.gridContainer}
        ref={gridContainerRef}
        onLayout={() => {
          requestAnimationFrame(() => {
            gridContainerRef.current?.measureInWindow((wx, wy, w, _h) => {
              if (typeof wx !== 'number' || typeof wy !== 'number' || typeof w !== 'number') return;
              const gridW = CELL_SIZE * state.grid[0].length;
              const offsetX = (w - gridW) / 2;
              gridLayout.current = {
                x: wx + offsetX,
                y: wy,
                width: gridW,
                height: CELL_SIZE * state.grid.length,
              };
            });
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

      {/* Tower Info Panel (when a placed tower is selected) */}
      {state.selectedPlacedTower && (
        <TowerInfoPanel
          tower={state.selectedPlacedTower}
          gold={state.gold}
          onUpgrade={(id) => upgradeTower(id)}
          onSell={(id) => sellTower(id)}
          onClose={() => selectPlacedTower(null)}
        />
      )}

      {/* Tower Selection */}
      {!state.selectedPlacedTower && (
        <TowerPanel
          gold={state.gold}
          onStartDrag={handleStartDrag}
        />
      )}

      {/* Hint */}
      <Text style={styles.hint}>
        {state.selectedPlacedTower
          ? 'タワーを強化・売却できます'
          : drag
          ? 'グリッドの空きマスで指を離して配置'
          : 'タワーを長押しして配置 / 配置済みタワーをタップ'}
      </Text>

      {/* Drag overlay - covers entire screen to capture all touch events */}
      {drag && (
        <View style={styles.dragOverlay} {...dragPanResponder.panHandlers}>
          {/* Ghost icon */}
          {drag.x > 0 && (
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
        </View>
      )}

      {/* Game Over / Win Overlay */}
      {(state.gameOver || state.gameWon) && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <Text style={styles.overlayEmoji}>
              {state.gameWon ? '🏰' : '💀'}
            </Text>
            <Text style={styles.overlayTitle}>
              {state.gameWon ? '勝利！城を守り抜いた！' : '城が陥落した...'}
            </Text>
            <Text style={styles.overlayScore}>SCORE: {state.score}</Text>
            <Text style={styles.overlayWave}>到達Wave: {state.wave}/{state.totalWaves}</Text>

            <Pressable onPress={resetGame} style={styles.retryBtn}>
              <Text style={styles.retryText}>もう一度挑戦</Text>
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
    backgroundColor: '#080816',
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
    color: '#6677aa',
    fontSize: 14,
  },
  headerTitle: {
    color: '#c8a86e',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  resetBtn: {
    padding: 4,
  },
  resetText: {
    color: '#884444',
    fontSize: 14,
  },
  gridContainer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  hint: {
    color: '#555',
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 4,
  },
  dragOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 150,
    backgroundColor: 'transparent',
  },
  dragGhost: {
    position: 'absolute',
    width: 56,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 2,
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
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  overlayContent: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#141428',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#3a3a5e',
    minWidth: 260,
  },
  overlayEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  overlayTitle: {
    color: '#ddd',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  overlayScore: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  overlayWave: {
    color: '#888',
    fontSize: 15,
    marginBottom: 24,
  },
  retryBtn: {
    paddingHorizontal: 36,
    paddingVertical: 12,
    backgroundColor: '#2d6b30',
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuBtn: {
    paddingHorizontal: 36,
    paddingVertical: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  menuText: {
    color: '#888',
    fontSize: 16,
  },
});
