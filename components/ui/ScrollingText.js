import React, { useState, useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import TextTicker from 'react-native-text-ticker';
import useTheme from '../../hooks/useTheme';

/**
 * A component that displays a scrolling text
 * Automatically scrolls only if the text is longer than the available width
 * Responsive to device orientation changes
 * 
 * @param {Object} props
 * @param {string} props.title - The title text to display
 * @param {Object} props.style - Additional styles for the TextTicker
 * @param {number} props.width - Width constraint for the ticker (default: uses screen width)
 * @param {number} props.duration - Duration of the animation in ms (default: 8000)
 * @param {number} props.repeatSpacer - Spacer between the start and end of the animation (default: 50)
 * @param {number} props.scrollSpeed - Speed of the scroll (default: 50)
 * @param {number} props.marqueeDelay - Delay before starting animation (default: 1000)
 * @param {Function} props.onPress - Function to call when text is pressed
 * @param {Object} props.props - Additional props for the TextTicker
 */
function ScrollingText({ 
  title, 
  style, 
  width, 
  duration = 10000,
  repeatSpacer = 50,
  scrollSpeed = 50,
  marqueeDelay = 2000,
  onPress,
  props
}) {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const theme = useTheme();

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription.remove();
  }, []);

  const availableWidth = width || dimensions.width;

  const themedStyles = StyleSheet.create({
    title: {
      fontSize: 18,
      color: theme.textWhite,
    },
  });

  return (
    <TextTicker
      style={[themedStyles.title, style]}
      duration={duration}
      loop
      bounce={false}
      repeatSpacer={repeatSpacer}
      marqueeDelay={marqueeDelay}
      width={availableWidth}
      scrollSpeed={scrollSpeed}
      animationType="auto"
      onPress={onPress}
      {...props}
    >
      {title}
    </TextTicker>
  );
}

export default ScrollingText; 