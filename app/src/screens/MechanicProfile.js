// File: src/screens/MechanicProfile.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function MechanicProfile({ route, navigation }) {
  const { mechanicId } = route.params || {};

  // placeholder data
  const mech = {
    id: mechanicId,
    name: 'Joe\'s Garage',
    rating: 4.7,
    issues: ['battery','tyre']
  };

  return (
    <View className="flex-1 bg-black px-4 pt-12">
      <Text className="text-white text-2xl font-bold">{mech.name}</Text>
      <Text className="text-gray-300 mt-2">Rating: {mech.rating}</Text>

      <View className="mt-6 bg-white p-4 rounded-xl">
        <Text className="text-black font-semibold">Can handle</Text>
        <Text className="text-gray-700">{mech.issues.join(', ')}</Text>

        <TouchableOpacity className="mt-4 bg-black py-3 rounded-lg items-center" onPress={() => alert('Booking sent (mock)')}>
          <Text className="text-white">Book Mechanic</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
