// File: src/Mechanic/AvailabilityScreen.js
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Switch, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { API_URL } from '../config';

// Define the days of the week consistently with the backend's calendar.day_name
const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AvailabilityScreen() {
  const { mechanic } = useUser();
  const [availability, setAvailability] = useState([]); // Array of { day: string, is_available: bool }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch current availability from the backend
  const fetchAvailability = async () => {
    if (!mechanic) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/mechanics/${mechanic.id}/availability`);
      if (!res.ok) throw new Error('Failed to fetch availability');
      
      let data = await res.json();
      
      // Map the backend's list of objects to the desired state format
      setAvailability(data.map(item => ({
        id: ALL_DAYS.indexOf(item.day), // Add a sequential ID for key/toggle
        label: item.day,
        value: item.is_available,
        day: item.day // Keep the day name for sending back
      })));
    } catch (error) {
      console.error("Error fetching availability:", error);
      Alert.alert("Error", "Could not load availability schedule.");
      // Fallback to default if fetch fails
      setAvailability(ALL_DAYS.map((day, index) => ({ id: index, label: day, value: true, day: day })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [mechanic]);

  const toggleSwitch = (id) => {
    setAvailability(prev => 
      prev.map(day =>
        day.id === id ? { ...day, value: !day.value } : day
      )
    );
  };

  const handleSave = async () => {
    if (saving) return;

    Alert.alert(
      "Save Availability",
      "Are you sure you want to save these changes?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Save", 
          onPress: async () => {
            setSaving(true);
            try {
              // Prepare data for the backend route
              const payload = availability.map(item => ({
                day: item.day,
                is_available: item.value
              }));

              const res = await fetch(`${API_URL}/mechanics/${mechanic.id}/availability`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });

              if (!res.ok) throw new Error('Failed to save changes');
              
              Alert.alert("Success", "Your availability has been updated.");
            } catch (error) {
              console.error("Save availability error:", error);
              Alert.alert("Error", error.message || "Failed to save availability.");
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-2 text-gray-500">Loading schedule...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header row with title + save button */}
      <View className="flex-row justify-between items-center px-4 pt-4">
        <Text className="text-2xl font-bold text-black">Set Availability</Text>

        <TouchableOpacity 
          className={`px-4 py-2 rounded-lg ${saving ? 'bg-gray-400' : 'bg-blue-600'}`}
          onPress={handleSave}
          disabled={saving}
        >
          <Text className="text-white font-semibold">{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      {/* Subtitle on its own line */}
      <Text className="text-gray-500 px-4 mt-1 mb-6">
        Toggle the days you are available for service requests
      </Text>

      {/* Days list */}
      <View className="bg-white rounded-xl p-4 mx-4 shadow-md">
        {availability.sort((a, b) => a.id - b.id).map(day => ( // Sort to ensure Mon-Sun order
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