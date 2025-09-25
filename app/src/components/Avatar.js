// src/components/Avatar.js
import React from 'react';
import { View, Text, Image } from 'react-native';

export default function Avatar({ size = 64, name = "User", imageUrl, className = "" }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  
  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        className={`rounded-full ${className}`}
        style={{ width: size, height: size }}
        defaultSource={require('../../assets/default-avatar.png')}
      />
    );
  }
  
  return (
    <View 
      className={`bg-blue-500 rounded-full items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <Text className="text-white font-bold" style={{ fontSize: size * 0.4 }}>
        {initials}
      </Text>
    </View>
  );
}