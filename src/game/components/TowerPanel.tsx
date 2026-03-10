import React, { useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, GestureResponderEvent, ScrollView } from 'react-native';
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
  const goldRef = useRef(gold);
  goldRef.current = gold;
  const isDragging = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => goldRef.current >= config.cost,
      onMoveShouldSetPanResponder: () => goldRef.current >= config.cost,
      onPanResponderGrant: (e: GestureResponderEvent) => {
        if (goldRef.current < config.cost) return;
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
      {canAfford && <Text style={styles.dragHint}>ドラッグ</Text>}
    </View>
  );
}

export default function TowerPanel({ gold, onDragStart, onDragMove, onDragEnd }: Props) {
  const towers = Object.values(TOWER_CONFIGS);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
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
