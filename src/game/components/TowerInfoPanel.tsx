import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Tower } from '../types';
import { TOWER_CONFIGS, getUpgradeCost, getSellValue, getTowerStats } from '../constants';

interface Props {
  tower: Tower;
  gold: number;
  onUpgrade: (towerId: string) => void;
  onSell: (towerId: string) => void;
  onClose: () => void;
}

export default function TowerInfoPanel({ tower, gold, onUpgrade, onSell, onClose }: Props) {
  const config = TOWER_CONFIGS[tower.type];
  const stats = getTowerStats(tower);
  const upgradeCost = tower.level < 3 ? getUpgradeCost(tower.type, tower.level) : 0;
  const sellValue = getSellValue(tower.type, tower.level);
  const canUpgrade = tower.level < 3 && gold >= upgradeCost;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{config.emoji}</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{config.name} Lv.{tower.level}</Text>
          <Text style={styles.desc}>{config.description}</Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>x</Text>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>ATK</Text>
          <Text style={styles.statVal}>{Math.round(stats.damage)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Range</Text>
          <Text style={styles.statVal}>{stats.range.toFixed(1)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Speed</Text>
          <Text style={styles.statVal}>{(1 / stats.fireRate).toFixed(1)}s</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Type</Text>
          <Text style={styles.statVal}>{config.damageType === 'physical' ? '物理' : '魔法'}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {tower.level < 3 ? (
          <Pressable
            onPress={() => onUpgrade(tower.id)}
            disabled={!canUpgrade}
            style={[styles.upgradeBtn, !canUpgrade && styles.btnDisabled]}
          >
            <Text style={styles.btnText}>
              強化 Lv.{tower.level + 1} ({upgradeCost}G)
            </Text>
          </Pressable>
        ) : (
          <View style={styles.maxLevelBadge}>
            <Text style={styles.maxLevelText}>MAX LEVEL</Text>
          </View>
        )}

        <Pressable onPress={() => onSell(tower.id)} style={styles.sellBtn}>
          <Text style={styles.sellBtnText}>売却 (+{sellValue}G)</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a30',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#3a3a5e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 28,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  desc: {
    color: '#888',
    fontSize: 11,
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#888',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    paddingVertical: 6,
    backgroundColor: '#12121f',
    borderRadius: 6,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#666',
    fontSize: 9,
    fontWeight: '600',
  },
  statVal: {
    color: '#ddd',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  upgradeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#2d5a8a',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4488cc',
  },
  btnDisabled: {
    backgroundColor: '#1a1a2e',
    borderColor: '#333',
    opacity: 0.5,
  },
  btnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  maxLevelBadge: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#3a2a1a',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  maxLevelText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sellBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: '#5a1a1a',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cc4444',
  },
  sellBtnText: {
    color: '#ff8888',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
