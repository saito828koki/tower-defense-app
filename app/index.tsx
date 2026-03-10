import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WAVES } from '../src/game/constants';

export default function TitleScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.castle}>🏰</Text>
        <Text style={styles.title}>Tower Defense</Text>
        <Text style={styles.subtitle}>タワーディフェンス</Text>

        <View style={styles.info}>
          <Text style={styles.infoText}>全 {WAVES.length} Wave をクリアせよ!</Text>
          <Text style={styles.infoText}>タワーを配置して敵の侵攻を阻止</Text>
        </View>

        <Pressable
          onPress={() => router.push('/game')}
          style={({ pressed }) => [styles.playBtn, pressed && styles.playBtnPressed]}
        >
          <Text style={styles.playBtnText}>ゲーム開始</Text>
        </Pressable>

        <View style={styles.towerList}>
          <Text style={styles.sectionTitle}>タワー一覧</Text>
          {[
            { emoji: '🏹', name: 'アーチャー', desc: 'バランス型' },
            { emoji: '🎯', name: 'スナイパー', desc: '長射程・高火力' },
            { emoji: '💣', name: 'ボマー', desc: '範囲攻撃' },
            { emoji: '❄️', name: 'フリーザー', desc: '敵を減速' },
          ].map((t) => (
            <View key={t.name} style={styles.towerRow}>
              <Text style={styles.towerEmoji}>{t.emoji}</Text>
              <View>
                <Text style={styles.towerName}>{t.name}</Text>
                <Text style={styles.towerDesc}>{t.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  castle: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 24,
  },
  info: {
    alignItems: 'center',
    marginBottom: 24,
  },
  infoText: {
    color: '#aaa',
    fontSize: 14,
    marginVertical: 2,
  },
  playBtn: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    marginBottom: 32,
  },
  playBtnPressed: {
    backgroundColor: '#388E3C',
  },
  playBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  towerList: {
    alignItems: 'flex-start',
    width: '100%',
    maxWidth: 280,
  },
  towerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  towerEmoji: {
    fontSize: 28,
    width: 40,
    textAlign: 'center',
  },
  towerName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  towerDesc: {
    color: '#888',
    fontSize: 12,
  },
});
