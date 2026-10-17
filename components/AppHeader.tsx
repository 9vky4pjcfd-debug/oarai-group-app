import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radii } from '@/constants';

export function AppHeader() {
  return (
    <View style={styles.container}>
      <Image source={require('@/assets/brand/logo.png')} contentFit="contain" style={styles.logo} />
      <Pressable
        accessibilityLabel="Settings"
        accessibilityRole="button"
        hitSlop={12}
        onPress={() => router.push('/account')}
        style={styles.settings}>
        <Ionicons color={colors.brand} name="settings-outline" size={22} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  logo: { height: 38, width: 144 },
  settings: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.pill, height: 44, justifyContent: 'center', width: 44 },
});
