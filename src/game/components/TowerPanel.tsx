import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { TowerType } from '../types';
import { TOWER_CONFIGS } from '../constants';

interface Props {
  gold: number;
  onStartDrag: (type: TowerType) => void;
}

export default function TowerPanel({ gold, onStartDrag }: Props) {
  const towers = Object.values(TOWER_CONFIGS);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {towers.map((config) => {
        const canAfford = gold >= config.cost;
        return (
          <Pressable
            key={config.type}
            onLongPress={() => {
              if (canAfford) onStartDrag(config.type);
            }}
            delayLongPress={150}
            disabled={!canAfford}
            style={[
              styles.card,
              !canAfford && styles.cardDisabled,
              { borderColor: canAfford ? config.color + '66' : '#222' },
            ]}
          >
            <Text style={styles.emoji}>{config.emoji}</Text>
            <Text style={[styles.name, !canAfford && styles.textDisabled]} numberOfLines={1}>
              {config.name}
            </Text>
            <Text style={[styles.cost, !canAfford && styles.textDisabled]}>
              {config.cost}G
            </Text>
            {canAfford && <Text style={styles.dragHint}>長押しで配置</Text>}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 6,
  },
  card: {
    width: 66,
    alignItems: 'center',
    padding: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: '#12121f',
  },
  cardDisabled: {
    opacity: 0.35,
  },
  emoji: {
    fontSize: 22,
    marginBottom: 1,
  },
  name: {
    color: '#ccc',
    fontSize: 10,
    fontWeight: '600',
  },
  cost: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 1,
  },
  textDisabled: {
    color: '#555',
  },
  dragHint: {
    color: '#666',
    fontSize: 8,
    marginTop: 2,
  },
});
