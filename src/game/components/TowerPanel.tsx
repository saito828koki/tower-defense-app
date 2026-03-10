import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { TowerType } from '../types';
import { TOWER_CONFIGS } from '../constants';

interface Props {
  gold: number;
  selectedTower: TowerType | null;
  onSelect: (type: TowerType | null) => void;
}

export default function TowerPanel({ gold, selectedTower, onSelect }: Props) {
  const towers = Object.values(TOWER_CONFIGS);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {towers.map((config) => {
        const canAfford = gold >= config.cost;
        const isSelected = selectedTower === config.type;

        return (
          <Pressable
            key={config.type}
            onPress={() => onSelect(isSelected ? null : config.type)}
            style={[
              styles.card,
              isSelected && styles.cardSelected,
              !canAfford && styles.cardDisabled,
              { borderColor: isSelected ? config.color : '#333' },
            ]}
          >
            <Text style={styles.emoji}>{config.emoji}</Text>
            <Text style={[styles.name, !canAfford && styles.textDisabled]}>
              {config.name}
            </Text>
            <Text style={[styles.cost, !canAfford && styles.textDisabled]}>
              {config.cost}G
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  card: {
    width: 78,
    alignItems: 'center',
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#1a1a2e',
  },
  cardSelected: {
    backgroundColor: '#2a2a4e',
  },
  cardDisabled: {
    opacity: 0.5,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  name: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  cost: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  textDisabled: {
    color: '#666',
  },
});
