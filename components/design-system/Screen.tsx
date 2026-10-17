import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants';

export function Screen({ children, contentContainerStyle, ...props }: PropsWithChildren<ScrollViewProps>) {
  return <SafeAreaView edges={['top']} style={styles.safe}><ScrollView contentContainerStyle={[styles.content, contentContainerStyle]} showsVerticalScrollIndicator={false} {...props}>{children}</ScrollView></SafeAreaView>;
}

export function ScreenSection({ children }: PropsWithChildren) { return <View style={styles.section}>{children}</View>; }

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, content: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg }, section: { gap: spacing.md } });
