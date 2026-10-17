import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen, SectionHeader } from '@/components/design-system';
import { PageHeader } from '@/components/PageHeader';
import { colors, radii, spacing, typography } from '@/constants';
import { supportedLanguages, type SupportedLanguage } from '@/i18n';
import { useSupportedLanguage } from '@/hooks/use-supported-language';

const labelKeys: Record<SupportedLanguage, string> = { ja: 'language.ja', 'zh-TW': 'language.zhTW', en: 'language.en' };

export function LanguageScreen() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useSupportedLanguage();
  return <Screen><PageHeader title={t('language.title')} backLabel={t('common.back')} /><SectionHeader eyebrow="LANGUAGE" title={t('language.title')} description={t('language.description')} />{supportedLanguages.map((item) => <Pressable key={item} onPress={() => void changeLanguage(item)} style={[styles.option, language === item && styles.selected]}><Text style={styles.label}>{t(labelKeys[item])}</Text>{language === item ? <Ionicons color={colors.accent} name="checkmark-circle" size={24} /> : <View style={styles.empty} />}</Pressable>)}</Screen>;
}
const styles = StyleSheet.create({ option: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 64, padding: spacing.md }, selected: { borderColor: colors.accent, borderWidth: 2 }, label: { ...typography.body, color: colors.text }, empty: { height: 24, width: 24 } });
