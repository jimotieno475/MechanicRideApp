// File: src/Mechanic/AvailabilityScreen.js
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Switch, TouchableOpacity, Alert } from 'react-native';

const daysOfWeek = [
  { id: 1, label: 'Sunday', value: false },
  { id: 2, label: 'Monday', value: true },
  { id: 3, label: 'Tuesday', value: true },
  { id: 4, label: 'Wednesday', value: true },
  { id: 5, label: 'Thursday', value: true },
  { id: 6, label: 'Friday', value: true },
  { id: 7, label: 'Saturday', value: false },
];

export default function AvailabilityScreen() {
  const [availability, setAvailability] = useState(daysOfWeek);

  const toggleSwitch = (id) => {
    const newAvailability = availability.map(day =>
      day.id === id ? { ...day, value: !day.value } : day
    );
    setAvailability(newAvailability);
  };

  const handleSave = () => {
    Alert.alert(
      "Save Availability",
      "Are you sure you want to save these changes?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Save", 
          onPress: () => {
            Alert.alert("Availability Saved", "Your availability has been updated.");
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header row with title + save button */}
      <View className="flex-row justify-between items-center px-4 pt-4">
        <Text className="text-2xl font-bold text-black">Set Availability</Text>

        <TouchableOpacity 
          className="bg-blue-600 px-4 py-2 rounded-lg"
          onPress={handleSave}
        >
          <Text className="text-white font-semibold">Save</Text>
        </TouchableOpacity>
      </View>

      {/* Subtitle on its own line */}
      <Text className="text-gray-500 px-4 mt-1 mb-6">
        Update the days you are available for service requests
      </Text>

      {/* Days list */}
      <View className="bg-white rounded-xl p-4 mx-4 shadow-md">
        {availability.map(day => (
          <View 
            key={day.id} 
            className="flex-row justify-between items-center py-3 border-b border-gray-200"
          >
            <Text className="text-lg font-semibold text-gray-700">{day.label}</Text>
            <Switch
              value={day.value}
              onValueChange={() => toggleSwitch(day.id)}
              trackColor={{ false: '#767577', true: '#3b82f6' }}
              thumbColor={day.value ? '#1e3a8a' : '#f4f3f4'}
            />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}
