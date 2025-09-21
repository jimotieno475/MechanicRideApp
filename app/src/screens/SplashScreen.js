import React, { useEffect } from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';

const SPLASH_DURATION = 3000; // After animation, wait before going to Login
const TYPING_SPEED = 300; // Delay per character

export default function SplashScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const fullText = "Mech";

  // One opacity value for each character
  const opacities = fullText.split('').map(() => useSharedValue(0));

  useEffect(() => {
    // Animate each letter with delay
    opacities.forEach((opacity, i) => {
      opacity.value = withDelay(
        i * TYPING_SPEED,
        withTiming(1, { duration: 400 })
      );
    });

    // After all letters appear + splash delay, navigate
    const totalTime = fullText.length * TYPING_SPEED + SPLASH_DURATION;
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, totalTime);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View
      className={`flex-1 flex-row justify-center items-center ${isDark ? 'bg-black' : 'bg-white'}`}
    >
      {fullText.split('').map((char, i) => {
        const animatedStyle = useAnimatedStyle(() => ({
          opacity: opacities[i].value,
          transform: [{ scale: opacities[i].value }],
        }));
        return (
          <Animated.Text
            key={i}
            style={animatedStyle}
            className={`text-6xl font-bold mx-1 ${isDark ? 'text-white' : 'text-black'}`}
          >
            {char}
          </Animated.Text>
        );
      })}
    </View>
  );
}
