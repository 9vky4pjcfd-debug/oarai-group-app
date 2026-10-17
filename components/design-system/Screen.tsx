import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants';

export function Screen({ children, contentContainerStyle, ...props }: PropsWithChildren<ScrollViewProps>) {
  return <SafeAreaView edges={['top']} style={styles.safe}><ScrollView contentContainerStyle={[styles.content, contentContainerStyle]} showsVerticalScrollIndicator={false} {...props}>{children}</ScrollView></SafeAreaView>;
}

export function ScreenSection({ children }: PropsWithChildren) { return <View style={styles.section}>{children}</View>; }

/** Lays cards out one per row on phones and two per row on wide screens, without measuring the window (so web pre-rendering matches). */
export function CardGrid({ children }: PropsWithChildren) {
  return <View style={styles.grid}>{children}<View style={styles.gridFiller} /></View>;
}

export function CardGridItem({ children }: PropsWithChildren) { return <View style={styles.gridItem}>{children}</View>; }

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, content: { alignSelf: 'center', gap: spacing.lg, maxWidth: 960, padding: spacing.md, paddingBottom: spacing.xxl, width: '100%' }, section: { gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  gridItem: { flexBasis: 340, flexGrow: 1, flexShrink: 1 },
  // Keeps an odd last card at half width on wide screens; on phones it is an empty row.
  gridFiller: { flexBasis: 340, flexGrow: 1, flexShrink: 1, height: 0, marginTop: -spacing.md },
});
