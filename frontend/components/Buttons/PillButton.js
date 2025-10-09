import React from 'react';
import { Pressable, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import COLORS from '../../constants/colors';
import FONTS from '../../constants/fonts';

export default function PillButton({
  title,
  onPress,
  leftIcon,
  rightIcon,
  variant = 'neutral',   // 'neutral' (grey) | 'primary' (blue)
  size = 'lg',           // 'md' | 'lg'
  fullWidth = true,
  disabled = false,
  loading = false,
  style,
  textStyle,
  accessibilityLabel,
  testID,
}) {
  const isPrimary = variant === 'primary';
  const height = size === 'md' ? 44 : 48;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      testID={testID}
      onPress={!disabled && !loading ? onPress : undefined}
      style={({ pressed }) => [
        styles.pill,
        { height },
        fullWidth && { alignSelf: 'stretch' },
        isPrimary ? styles.primary : styles.neutral,
        disabled && styles.disabled,
        pressed && !disabled && !loading && styles.pressed,
        style,
      ]}
    >
      {/* left icon sits visually but text remains centered */}
      {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
      {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}

      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text
          style={[
            styles.text,
            isPrimary ? styles.textOnPrimary : styles.textOnNeutral,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'relative',
    borderRadius: 9999,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  primary: {
    backgroundColor: "#79aefd",
    borderColor: COLORS.black,
  },
  neutral: {
    backgroundColor: COLORS.light_grey2,
    borderColor: COLORS.light_grey,
  },
  text: {
    fontFamily: FONTS.main_font_bold,
    fontSize: 16,
  },
  textOnPrimary: { color: COLORS.white },
  textOnNeutral: { color: COLORS.black },

  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.5 },

  iconLeft: { position: 'absolute', left: 16 },
  iconRight: { position: 'absolute', right: 16 },
});
