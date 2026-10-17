import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography } from '@/constants';

const icons = { home: 'home-outline', stay: 'bed-outline', facilities: 'map-outline', member: 'person-circle-outline', support: 'help-circle-outline' } as const;

export default function TabLayout() {
  const { t } = useTranslation();
  return (
    <Tabs screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.brand,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarLabelStyle: typography.caption,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 74, paddingBottom: 8, paddingTop: 8 },
      tabBarIcon: ({ color, size }) => <Ionicons color={color} name={icons[route.name as keyof typeof icons] ?? 'ellipse-outline'} size={size} />,
    })}>
      <Tabs.Screen name="home" options={{ title: t('tabs.home') }} />
      <Tabs.Screen name="stay" options={{ title: t('tabs.stay') }} />
      <Tabs.Screen name="facilities" options={{ title: t('tabs.facilities') }} />
      <Tabs.Screen name="member" options={{ title: t('tabs.member') }} />
      <Tabs.Screen name="support" options={{ title: t('tabs.support') }} />
    </Tabs>
  );
}
