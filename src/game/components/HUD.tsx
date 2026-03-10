import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { WAVES } from '../constants';

interface Props {
  gold: number;
  lives: number;
  wave: number;
  score: number;
  waveInProgress: boolean;
  speed: number;
  isPaused: boolean;
  onStartWave: () => void;
  onSetSpeed: (speed: number) => void;
  onTogglePause: () => void;
}

export default function HUD({
  gold,
  lives,
  wave,
  score,
  waveInProgress,
  speed,
  isPaused,
  onStartWave,
  onSetSpeed,
  onTogglePause,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>GOLD</Text>
          <Text style={[styles.statValue, { color: '#FFD700' }]}>{gold}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>LIVES</Text>
          <Text style={[styles.statValue, { color: lives <= 5 ? '#F44336' : '#4CAF50' }]}>
            {lives}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>WAVE</Text>
          <Text style={styles.statValue}>
            {wave}/{WAVES.length}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>SCORE</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
      </View>

      <View style={styles.controlRow}>
        <Pressable
          onPress={onTogglePause}
          style={[styles.controlBtn, isPaused && styles.activeBtn]}
        >
          <Text style={styles.controlText}>{isPaused ? '▶' : '⏸'}</Text>
        </Pressable>

        {[1, 2, 3].map((s) => (
          <Pressable
            key={s}
            onPress={() => onSetSpeed(s)}
            style={[styles.controlBtn, speed === s && styles.activeBtn]}
          >
            <Text style={styles.controlText}>{s}x</Text>
          </Pressable>
        ))}

        <Pressable
          onPress={onStartWave}
          disabled={waveInProgress || wave >= WAVES.length}
          style={[
            styles.waveBtn,
            (waveInProgress || wave >= WAVES.length) && styles.waveBtnDisabled,
          ]}
        >
          <Text style={styles.waveBtnText}>
            {waveInProgress ? '進行中...' : wave >= WAVES.length ? 'クリア!' : `Wave ${wave + 1} 開始`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 6,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#888',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  controlBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#333',
  },
  activeBtn: {
    backgroundColor: '#333366',
    borderColor: '#6666ff',
  },
  controlText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  waveBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  waveBtnDisabled: {
    backgroundColor: '#333',
  },
  waveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
