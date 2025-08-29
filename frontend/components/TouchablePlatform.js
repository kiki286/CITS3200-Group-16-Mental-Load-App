import React from 'react';
import { Platform, Pressable, View } from 'react-native';

/**
 * TouchablePlatform
 * - On web: maps responder-style handlers to pointer events so code that expects
 *   onResponder props still works when pasted into web components.
 * - On native: forwards all props unchanged to Pressable (or View where needed).
 *
 * Usage:
 * <TouchablePlatform onPress={...} onResponderMove={...} style={{}}>
 *   <Text>Tap me</Text>
 * </TouchablePlatform>
 */
export default function TouchablePlatform(props) {
  const {
    onPress,
    onPressOut,
    onResponderGrant,
    onResponderMove,
    onResponderRelease,
    onResponderTerminate,
    onStartShouldSetResponder,
    children,
    ...rest
  } = props;

  if (Platform.OS === 'web') {
    // Map responder handlers to pointer events on web
    const handlePointerDown = (e) => {
      if (onStartShouldSetResponder) {
        try { onStartShouldSetResponder(e); } catch (err) { /* swallow */ }
      }
      if (onResponderGrant) onResponderGrant(e);
    };
    const handlePointerMove = (e) => {
      if (onResponderMove) onResponderMove(e);
    };
    const handlePointerUp = (e) => {
      if (onResponderRelease) onResponderRelease(e);
    };
    const handlePointerCancel = (e) => {
      if (onResponderTerminate) onResponderTerminate(e);
    };

    return (
      <Pressable
        onPress={onPress}
        onPressOut={onPressOut}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }

  // Native: forward props directly to Pressable (native View will handle responder props)
  return (
    <Pressable onPress={onPress} onPressOut={onPressOut} {...rest}>
      {children}
    </Pressable>
  );
}
