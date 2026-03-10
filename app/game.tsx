import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameEngine } from '../src/game/useGameEngine';
import GameGrid from '../src/game/components/GameGrid';
import TowerPanel from '../src/game/components/TowerPanel';
import HUD from '../src/game/components/HUD';

export default function GameScreen() {
  const {
    state,
    startWave,
    placeTower,
    selectTower,
    setSpeed,
    togglePause,
    resetGame,
  } = useGameEngine();

  const handleCellPress = (row: number, col: number) => {
    if (state.selectedTower) {
      placeTower(row, col);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
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
      <View style={styles.gridContainer}>
        <GameGrid state={state} onCellPress={handleCellPress} />
      </View>

      {/* Tower Selection */}
      <TowerPanel
        gold={state.gold}
        selectedTower={state.selectedTower}
        onSelect={selectTower}
      />

      {/* Hint */}
      <Text style={styles.hint}>
        {state.selectedTower
          ? 'グリッドの空きマスをタップしてタワーを配置'
          : 'タワーを選択してから配置してください'}
      </Text>

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
            <Pressable onPress={handleBack} style={styles.menuBtn}>
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
