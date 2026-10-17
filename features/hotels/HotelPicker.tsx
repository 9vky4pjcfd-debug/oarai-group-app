import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing, typography } from '@/constants';
import { useLocalized } from '@/features/content';
import type { HotelPublicProfile } from '@/types';

export function HotelPicker({ hotels, selected, onSelect }: { hotels: HotelPublicProfile[]; selected: string; onSelect: (hotelId: string) => void }) {
  const l = useLocalized();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.picker}>
      {hotels.map((hotel) => {
        const active = hotel.hotelId === selected;
        return (
          <Pressable key={hotel.hotelId} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => onSelect(hotel.hotelId)} style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{l(hotel.name)}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  picker: { gap: spacing.xs },
  chip: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.pill, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipLabel: { ...typography.label, color: colors.text },
  chipLabelActive: { color: colors.white },
});
