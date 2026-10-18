import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '@/constants';
import { useLocalized } from '@/features/content';
import type { HotelPublicProfile } from '@/types';

/** Every hotel stays visible at once (two per row on phones) so guests never have to discover a sideways scroll. */
export function HotelPicker({ hotels, selected, onSelect }: { hotels: HotelPublicProfile[]; selected: string; onSelect: (hotelId: string) => void }) {
  const l = useLocalized();
  return (
    <View accessibilityRole="radiogroup" style={styles.picker}>
      {hotels.map((hotel) => {
        const active = hotel.hotelId === selected;
        return (
          <Pressable key={hotel.hotelId} accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={() => onSelect(hotel.hotelId)} style={({ pressed }) => [styles.tile, active && styles.tileActive, pressed && styles.pressed]}>
            {active ? <Ionicons color={colors.white} name="checkmark-circle" size={18} /> : null}
            <Text numberOfLines={2} style={[styles.label, active && styles.labelActive]}>{l(hotel.name)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  picker: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tile: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, borderWidth: 1, flexBasis: 150, flexDirection: 'row', flexGrow: 1, gap: spacing.xxs, justifyContent: 'center', minHeight: 52, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  tileActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  pressed: { opacity: 0.8 },
  label: { ...typography.label, color: colors.text, flexShrink: 1, textAlign: 'center' },
  labelActive: { color: colors.white },
});
