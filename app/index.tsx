import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TOWER_CONFIGS, TOTAL_WAVES } from '../src/game/constants';

export default function TitleScreen() {
  const towers = Object.values(TOWER_CONFIGS);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.castle}>🏰</Text>
        <Text style={styles.title}>ARCANE SIEGE</Text>
        <Text style={styles.subtitle}>ファンタジー タワーディフェンス</Text>

        <View style={styles.info}>
          <Text style={styles.infoText}>全 {TOTAL_WAVES} Wave の攻城戦を生き延びろ</Text>
          <Text style={styles.infoText}>タワーを配置して城を守れ</Text>
        </View>

        <Pressable
          onPress={() => router.push('/game')}
          style={({ pressed }) => [styles.playBtn, pressed && styles.playBtnPressed]}
        >
          <Text style={styles.playBtnText}>出陣する</Text>
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>タワー一覧</Text>
          {towers.map((t) => (
            <View key={t.type} style={[styles.towerRow, { borderLeftColor: t.color }]}>
              <Text style={styles.towerEmoji}>{t.emoji}</Text>
              <View style={styles.towerInfo}>
                <Text style={styles.towerName}>{t.name}</Text>
                <Text style={styles.towerDesc}>{t.description}</Text>
                <View style={styles.towerStats}>
                  <Text style={styles.towerStat}>ATK {t.damage}</Text>
                  <Text style={styles.towerStat}>Range {t.range}</Text>
                  <Text style={styles.towerStat}>{t.cost}G</Text>
                  <Text style={[styles.towerStat, { color: t.damageType === 'physical' ? '#c8a86e' : '#8888ff' }]}>
                    {t.damageType === 'physical' ? '物理' : '魔法'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>操作方法</Text>
          <Text style={styles.guideText}>1. タワーカードをドラッグしてグリッドに配置</Text>
          <Text style={styles.guideText}>2. 配置済みタワーをタップで強化・売却</Text>
          <Text style={styles.guideText}>3. Wave開始ボタンで敵が襲来</Text>
          <Text style={styles.guideText}>4. 5の倍数Waveでボス出現!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080816',
  },
  content: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 48,
  },
  castle: {
    fontSize: 64,
    marginBottom: 8,
    marginTop: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#c8a86e',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    letterSpacing: 2,
  },
  info: {
    alignItems: 'center',
    marginBottom: 24,
  },
  infoText: {
    color: '#999',
    fontSize: 13,
    marginVertical: 2,
  },
  playBtn: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    backgroundColor: '#2d6b30',
    borderRadius: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  playBtnPressed: {
    backgroundColor: '#1a4a1d',
  },
  playBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  section: {
    width: '100%',
    maxWidth: 340,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#666',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  towerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#12121f',
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  towerEmoji: {
    fontSize: 28,
    width: 40,
    textAlign: 'center',
    marginRight: 10,
  },
  towerInfo: {
    flex: 1,
  },
  towerName: {
    color: '#ddd',
    fontSize: 14,
    fontWeight: '700',
  },
  towerDesc: {
    color: '#777',
    fontSize: 11,
    marginBottom: 4,
  },
  towerStats: {
    flexDirection: 'row',
    gap: 8,
  },
  towerStat: {
    color: '#888',
    fontSize: 10,
    fontWeight: '600',
  },
  guideText: {
    color: '#999',
    fontSize: 13,
    marginBottom: 6,
    paddingLeft: 4,
  },
});
