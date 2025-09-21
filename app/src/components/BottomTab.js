// File: src/components/BottomTab.js
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

export default function BottomTab({ tabs = [], onPress }) {
  return (
    <View className="flex-row justify-around items-center py-3 bg-white">
      {tabs.map(t => (
        <TouchableOpacity key={t} onPress={() => onPress(t)} className="items-center">
          <Text className="text-black">{t}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}