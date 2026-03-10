import React, { useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import { TowerType } from '../types';
import { TOWER_CONFIGS } from '../constants';

interface Props {
  gold: number;
  onDragStart: (type: TowerType, x: number, y: number) => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: (x: number, y: number) => void;
}

function DraggableTowerCard({
  type,
  gold,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  type: TowerType;
  gold: number;
  onDragStart: (type: TowerType, x: number, y: number) => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: (x: number, y: number) => void;
}) {
  const config = TOWER_CONFIGS[type];
  const canAfford = gold >= config.cost;
  const isDragging = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => canAfford,
      onMoveShouldSetPanResponder: () => canAfford,
      onPanResponderGrant: (e: GestureResponderEvent) => {
        if (!canAfford) return;
        isDragging.current = true;
        onDragStart(type, e.nativeEvent.pageX, e.nativeEvent.pageY);
      },
      onPanResponderMove: (e: GestureResponderEvent) => {
        if (!isDragging.current) return;
        onDragMove(e.nativeEvent.pageX, e.nativeEvent.pageY);
      },
      onPanResponderRelease: (e: GestureResponderEvent) => {
        if (!isDragging.current) return;
        isDragging.current = false;
        onDragEnd(e.nativeEvent.pageX, e.nativeEvent.pageY);
      },
      onPanResponderTerminate: (e: GestureResponderEvent) => {
        if (!isDragging.current) return;
        isDragging.current = false;
        onDragEnd(e.nativeEvent.pageX, e.nativeEvent.pageY);
      },
    })
  ).current;

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.card,
        !canAfford && styles.cardDisabled,
        { borderColor: config.color + '66' },
      ]}
    >
      <Text style={styles.emoji}>{config.emoji}</Text>
      <Text style={[styles.name, !canAfford && styles.textDisabled]}>
        {config.name}
      </Text>
      <Text style={[styles.cost, !canAfford && styles.textDisabled]}>
        {config.cost}G
      </Text>
      {canAfford && <Text style={styles.dragHint}>ドラッグ</Text>}
    </View>
  );
}

export default function TowerPanel({ gold, onDragStart, onDragMove, onDragEnd }: Props) {
  const towers = Object.values(TOWER_CONFIGS);

  return (
    <View style={styles.container}>
      {towers.map((config) => (
        <DraggableTowerCard
          key={config.type}
          type={config.type}
          gold={gold}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 8,
  },
  card: {
    width: 78,
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#1a1a2e',
  },
  cardDisabled: {
    opacity: 0.4,
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
  dragHint: {
    color: '#888',
    fontSize: 9,
    marginTop: 3,
  },
});
