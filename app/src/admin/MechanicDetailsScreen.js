import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function MechanicDetailsScreen() {
  const route = useRoute();
  const { mechanicId } = route.params || {};

  return (
    <SafeAreaView className="flex-1 bg-black p-4">
      <Text className="text-white text-xl font-bold mb-4">Mechanic Details</Text>
      <Text className="text-white">Mechanic ID: {mechanicId}</Text>
      <Text className="text-gray-400">Details for this mechanic will be displayed here.</Text>
    </SafeAreaView>
  );
}