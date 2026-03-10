import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { WavePhase } from '../types';
import { TOTAL_WAVES } from '../constants';

interface Props {
  gold: number;
  baseHp: number;
  maxBaseHp: number;
  wave: number;
  score: number;
  wavePhase: WavePhase;
  prepTimer: number;
  speed: number;
  isPaused: boolean;
  onStartWave: () => void;
  onSkipPrep: () => void;
  onSetSpeed: (speed: number) => void;
  onTogglePause: () => void;
}

export default function HUD({
  gold,
  baseHp,
  maxBaseHp,
  wave,
  score,
  wavePhase,
  prepTimer,
  speed,
  isPaused,
  onStartWave,
  onSkipPrep,
  onSetSpeed,
  onTogglePause,
}: Props) {
  const hpPct = baseHp / maxBaseHp;

  return (
    <View style={styles.container}>
      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>GOLD</Text>
          <Text style={[styles.statValue, { color: '#FFD700' }]}>{gold}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>CASTLE HP</Text>
          <View style={styles.hpBarContainer}>
            <View style={styles.hpBarBg}>
              <View
                style={[
                  styles.hpBar,
                  {
                    width: `${hpPct * 100}%`,
                    backgroundColor: hpPct > 0.5 ? '#4CAF50' : hpPct > 0.25 ? '#FF9800' : '#F44336',
                  },
                ]}
              />
            </View>
            <Text style={styles.hpText}>{baseHp}/{maxBaseHp}</Text>
          </View>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>WAVE</Text>
          <Text style={styles.statValue}>{wave}/{TOTAL_WAVES}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>SCORE</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
      </View>

      {/* Controls row */}
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

        {wavePhase === 'prep' ? (
          <Pressable onPress={onSkipPrep} style={styles.prepBtn}>
            <Text style={styles.waveBtnText}>
              準備中 {Math.ceil(prepTimer)}s - スキップ
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={onStartWave}
            disabled={wavePhase === 'active' || wavePhase === 'interval' || wave >= TOTAL_WAVES}
            style={[
              styles.waveBtn,
              (wavePhase === 'active' || wavePhase === 'interval' || wave >= TOTAL_WAVES) && styles.waveBtnDisabled,
            ]}
          >
            <Text style={styles.waveBtnText}>
              {wavePhase === 'active'
                ? '戦闘中...'
                : wavePhase === 'interval'
                ? 'インターバル...'
                : wave >= TOTAL_WAVES
                ? 'クリア!'
                : `Wave ${wave + 1} 開始`}
            </Text>
          </Pressable>
        )}
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
    alignItems: 'center',
    marginBottom: 6,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#666',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statValue: {
    color: '#ddd',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hpBarContainer: {
    alignItems: 'center',
  },
  hpBarBg: {
    width: 60,
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 2,
  },
  hpBar: {
    height: 6,
    borderRadius: 3,
  },
  hpText: {
    color: '#ccc',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 1,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  controlBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#151528',
    borderWidth: 1,
    borderColor: '#2a2a44',
  },
  activeBtn: {
    backgroundColor: '#2a2a55',
    borderColor: '#5555cc',
  },
  controlText: {
    color: '#ddd',
    fontSize: 13,
    fontWeight: 'bold',
  },
  waveBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#2d6b30',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  prepBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#5a4a1a',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  waveBtnDisabled: {
    backgroundColor: '#1a1a2e',
    borderColor: '#333',
  },
  waveBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
